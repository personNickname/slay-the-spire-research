import { cardDef, CARD_BY_ID } from "./catalog.js";
import { effectOf, type Amt, type Op } from "./cardEffects.js";
import type {
  CardInst,
  Creature,
  OrbInst,
  OrbType,
  PendingChoice,
  PowerInst,
  RunState,
  Stance,
} from "./types.js";
import { StsRandom } from "./rng.js";
import { pickMove, takeTurn as monsterTakeTurn, spawnEncounter, createMonster, bindCombat } from "./monsters.js";
import {
  ArtifactPower,
  BlurPower,
  FrailPower,
  LikeWaterPower,
  MetallicizePower,
  RitualPower,
  VulnerablePower,
  WeakPower,
  endOfRound,
  ownerTurnStart,
  tryStack,
} from "./powers.js";
import {
  ApplyPowerAction,
  CallbackAction,
  DamageAction,
  DiscardAtEndOfTurnAction,
  DrawCardAction,
  EmptyDeckShuffleAction,
  EndTurnAction,
  GameActionManager,
  GainBlockAction,
  GainEnergyAction,
  LoseHPAction,
  MonsterStartTurnAction,
  StartNextTurnAction,
  UseCardAction,
  bindActionHooks,
  gameActions,
  runAction,
} from "./actions.js";
import {
  bindRelics,
  checkBloodied,
  fireRelics,
  hasRelic,
  healNow,
  healPlayer,
  maybeUnceasingTop,
  relicCanPlay,
  tryLizardTail,
} from "./relicEffects.js";
import { bindPotions } from "./potionEffects.js";
import { CARD_CLASSES } from "./generated/cards.js";
import { bindCardRuntime } from "./generated/runtime.js";
import { callPower, runPowerHooks } from "./generated/powers.js";

export function froundFloor(n: number): number {
  return Math.floor(Math.fround(n));
}

export function nextUid(run: RunState): string {
  run.uidSeq += 1;
  return `c${run.uidSeq}`;
}

export function makeCard(run: RunState, defId: string, upgraded = false): CardInst {
  const def = cardDef(defId);
  const c: CardInst = {
    uid: nextUid(run),
    defId,
    upgraded,
    timesUpgraded: upgraded ? 1 : 0,
    combatDamage: 0,
  };
  if (defId === "Blood for Blood") c.costOverride = upgraded ? 3 : 4;
  return c;
}

function upgradeCardNow(c: CardInst): void {
  const def = cardDef(c.defId);
  if (defIdIsSearing(c.defId)) {
    // upgradeDamage(4 + timesUpgraded); then ++timesUpgraded  — SearingBlow.java
    c.combatDamage += 4 + c.timesUpgraded;
    c.timesUpgraded += 1;
    c.upgraded = true;
    return;
  }
  if (def.type === "curse" || def.type === "status") return;
  if (c.upgraded && !def.upgrade.custom) return;
  c.upgraded = true;
  c.timesUpgraded += 1;
  if (c.defId === "Blood for Blood") c.costOverride = 3;
}

export function upgradeCard(c: CardInst): void {
  const Ctor = CARD_CLASSES[c.defId];
  const upgrade = Ctor && new Ctor().upgrade;
  if (upgrade) {
    upgrade(c);
    return;
  }
  upgradeCardNow(c);
}

function defIdIsSearing(id: string): boolean {
  return id === "Searing Blow";
}

export function baseNumbers(c: CardInst): { damage: number; block: number; magic: number; cost: number } {
  const def = cardDef(c.defId);
  let damage = def.base.damage ?? 0;
  let block = def.base.block ?? 0;
  let magic = def.base.magic ?? 0;
  let cost = def.cost;
  if (c.upgraded) {
    damage += def.upgrade.damage ?? 0;
    block += def.upgrade.block ?? 0;
    magic += def.upgrade.magic ?? 0;
    if (def.upgrade.cost !== undefined) cost = def.upgrade.cost;
  }
  damage += c.combatDamage;
  if (c.costOverride !== undefined) cost = c.costOverride;
  return { damage, block, magic, cost };
}

export function isUnplayable(c: CardInst): boolean {
  return baseNumbers(c).cost === -2;
}

export function currentCost(run: RunState, c: CardInst): number {
  if (c.freeOnce) return 0;
  const def = cardDef(c.defId);
  let { cost } = baseNumbers(c);
  if (cost < 0) return cost;
  if (hasPower(run.player, "Corruption") && def.type === "skill") return 0;
  return Math.max(0, cost);
}

export function hasPower(who: Creature, id: string): boolean {
  return who.powers.some((p) => p.id === id && p.amount !== 0);
}

export function getPower(who: Creature, id: string): PowerInst | undefined {
  return who.powers.find((p) => p.id === id);
}

/** ApplyPowerAction: Artifact consumes itself vs PowerType.DEBUFF (Poison, Weak, … and negative Str/Dex/Focus). */
const DEBUFF_IDS = new Set([
  "Poison",
  "Weakened",
  "Vulnerable",
  "Frail",
  "Entangled",
  "Constricted",
  "Lose Strength",
  "Lose Dexterity",
  "Draw Reduction",
  "Hex",
  "Lockon",
  "Mark",
  "Choked",
  "Corpse Explosion",
  "Nails",
  "Slow",
  "Confusion",
  "No Draw",
  "No Block",
  "Bias",
  "Wraith Form",
  "Energy Down",
  "Cannot Change Stance",
  "Block Return",
  "Skill Burn",
  "Attack Burn",
  "Gain Strength",
  "Shackled",
]);

function isDebuffPower(id: string, amount: number): boolean {
  if (amount < 0 && (id === "Strength" || id === "Dexterity" || id === "Focus")) return true;
  return amount > 0 && DEBUFF_IDS.has(id);
}

function consumeArtifact(who: Creature): boolean {
  if (!getPower(who, "Artifact")) return false;
  new ArtifactPower(who).onSpecificTrigger();
  return true;
}

function addPowerNow(who: Creature, id: string, amount: number, fromMonster = false): void {
  if (amount === 0) return;
  // ApplyPowerAction ctor: Snake Skull adds 1 when the player poisons someone else.
  if (id === "Poison" && !fromMonster && !who.isPlayer && amount > 0 && combatRun && hasRelic(combatRun, "Snake Skull")) {
    amount += 1;
  }
  if (who.isPlayer && id === "Weakened" && combatRun && hasRelic(combatRun, "Ginger")) return;
  if (who.isPlayer && id === "Frail" && combatRun && hasRelic(combatRun, "Turnip")) return;
  if (id === "Artifact" && amount < 0) {
    consumeArtifact(who);
    return;
  }
  if (isDebuffPower(id, amount) && consumeArtifact(who)) {
    if (combatRun) log(combatRun, `${who.name.zhs} 的人工制品抵消了效果`, `Artifact negated ${id}`);
    return;
  }
  const championBelt = () => {
    if (id === "Vulnerable" && !fromMonster && !who.isPlayer && combatRun && hasRelic(combatRun, "Champion Belt")) {
      addPowerNow(who, "Weakened", 1, false);
    }
  };
  const existing = getPower(who, id);
  if (existing) {
    if (!tryStack(who, id, amount)) {
      existing.amount += amount;
      if (existing.amount === 0) who.powers = who.powers.filter((p) => p.id !== id);
    }
    championBelt();
    return;
  }
  if (amount < 0 && (id === "Strength" || id === "Dexterity" || id === "Focus")) {
    who.powers.push({ id, amount, justApplied: fromMonster });
    return;
  }
  if (amount < 0) return;
  const turnBased = ["Vulnerable", "Weakened", "Frail", "Lose Strength", "Lose Dexterity"].includes(id);
  const extra = id === "Ritual" && !who.isPlayer ? { skipFirst: 1 } : undefined;
  // VulnerablePower sets justApplied only when the source is a monster and the player turn has already ended.
  const justApplied = id === "Vulnerable" ? fromMonster && turnHasEnded : fromMonster && turnBased;
  who.powers.push({ id, amount, justApplied, extra });
  championBelt();
}

export function addPower(who: Creature, id: string, amount: number, fromMonster = false): void {
  const source = fromMonster ? (combatRun?.combat?.monsters.find((m) => m.alive) ?? null) : (combatRun?.player ?? null);
  runAction(new ApplyPowerAction(who, source, id, amount, fromMonster));
}

/** Set while a combat is resolving so relic immunities can see the run. */
let combatRun: RunState | undefined;

function rng(run: RunState, name: string): StsRandom {
  return StsRandom.fromState(run.rng[name]!);
}

function saveRng(run: RunState, name: string, r: StsRandom): void {
  run.rng[name] = r.toState();
}

export function log(run: RunState, zhs: string, eng: string): void {
  run.log.push(zhs);
  if (run.log.length > 80) run.log.splice(0, run.log.length - 80);
  void eng;
}

function aliveEnemies(run: RunState): Creature[] {
  return (run.combat?.monsters ?? []).filter((m) => m.alive);
}

/** Closures still used by a few callers; they join the same GameActionManager queue. */
export function addToBot(fn: () => void): void {
  gameActions.addToBottom(new CallbackAction(fn));
}
export function addToTop(fn: () => void): void {
  gameActions.addToTop(new CallbackAction(fn));
}
export function flushActions(): void {
  gameActions.runUntilIdle();
}

function focusOf(run: RunState): number {
  return getPower(run.player, "Focus")?.amount ?? 0;
}

export function channelOrb(run: RunState, type: OrbType, n = 1): void {
  const cbt = run.combat!;
  for (let i = 0; i < n; i++) {
    if (cbt.orbs.length >= cbt.orbSlots && cbt.orbSlots > 0 && cbt.orbs.length) evokeOrb(run, 1);
    if (cbt.orbSlots <= 0) return;
    if (cbt.orbs.length < cbt.orbSlots) cbt.orbs.push({ type, focus: type === "dark" ? 6 : 0 });
  }
}

export function evokeOrb(run: RunState, times = 1): void {
  const cbt = run.combat!;
  if (!cbt.orbs.length) return;
  for (let t = 0; t < times; t++) {
    const orb = cbt.orbs[0];
    if (!orb) return;
    triggerOrb(run, orb, true);
  }
  const ev = cbt.orbs.shift();
  if (ev) {
    /* evoked and removed once */
    void ev;
  }
}

function triggerOrb(run: RunState, orb: OrbInst, evoke: boolean): void {
  const f = focusOf(run);
  const foes = aliveEnemies(run);
  if (orb.type === "lightning") {
    const amt = Math.max(0, (evoke ? 8 : 3) + f);
    const live = foes;
    if (!live.length) return;
    const t = live[0]!;
    if (evoke) {
      for (const m of hasPower(run.player, "Electrodynamics") ? live : [t]) dealDamage(run, run.player, m, amt, { hpLoss: true });
    } else {
      const r = rng(run, "cardRandom");
      const m = live[r.nextInt(live.length)]!;
      saveRng(run, "cardRandom", r);
      dealDamage(run, run.player, m, amt, { hpLoss: true });
    }
  } else if (orb.type === "frost") {
    gainBlock(run, run.player, Math.max(0, (evoke ? 5 : 2) + f));
  } else if (orb.type === "dark") {
    if (evoke) {
      const t = foes[0];
      if (t) dealDamage(run, run.player, t, Math.max(1, orb.focus), { hpLoss: true });
    } else orb.focus += 6 + f;
  } else if (orb.type === "plasma") {
    run.combat!.energy += evoke ? 2 : 1;
  }
}

function passiveOrbs(run: RunState): void {
  const cbt = run.combat!;
  const extra = getPower(run.player, "Loop")?.amount ?? 0;
  for (const orb of cbt.orbs) {
    triggerOrb(run, orb, false);
    for (let i = 0; i < extra; i++) triggerOrb(run, orb, false);
  }
}

export function changeStance(run: RunState, next: Stance): void {
  const cbt = run.combat!;
  const prev = cbt.stance;
  if (prev === next) return;
  if (prev === "calm") cbt.energy += 2;
  cbt.stance = next;
  if (hasPower(run.player, "Mental Fortress")) gainBlock(run, run.player, getPower(run.player, "Mental Fortress")!.amount);
  if (hasPower(run.player, "Nirvana") && next !== "none") gainBlock(run, run.player, getPower(run.player, "Nirvana")!.amount);
  if (hasPower(run.player, "Rushdown") && next === "wrath") drawCards(run, getPower(run.player, "Rushdown")!.amount);
  fireRelics(run, "onChangeStance", { prevStance: prev, nextStance: next });
}

/** DamageInfo.applyPowers for a player or monster NORMAL attack. */
export function applyDamagePowers(
  base: number,
  attacker: Creature,
  target: Creature,
  stance: Stance = "none",
  run?: RunState,
): number {
  let tmp = Math.fround(base);
  for (const p of attacker.powers) {
    if (p.id === "Strength") {
      const out = callPower(run as RunState, attacker, "Strength", "atDamageGive", tmp, 0);
      tmp = Math.fround(typeof out === "number" ? out : tmp + p.amount);
    }
    if (p.id === "Weakened") {
      const crane = !!(run && !attacker.isPlayer && hasRelic(run, "Paper Crane"));
      tmp = new WeakPower(attacker).atDamageGive(tmp, true, crane);
    }
    if (p.id === "Vigor" && attacker.isPlayer) tmp = Math.fround(tmp + p.amount);
    if (p.id === "Angry" && attacker.isPlayer === false) {
      /* Angry is on-hit, not a multiplier */
    }
  }
  if (attacker.isPlayer && stance === "wrath") tmp = Math.fround(tmp * 2);
  if (attacker.isPlayer && stance === "divinity") tmp = Math.fround(tmp * 3);
  if (!attacker.isPlayer && target.isPlayer && stance === "wrath") tmp = Math.fround(tmp * 2);
  for (const p of target.powers) {
    if (p.id === "Vulnerable") tmp = new VulnerablePower(target).atDamageReceive(tmp, true, run);
  }
  if (!attacker.isPlayer && target.isPlayer && hasPower(target, "Surrounded")) tmp = Math.fround(tmp * 1.5);
  return Math.max(0, froundFloor(tmp));
}

export function applyBlockPowers(base: number, who: Creature): number {
  let tmp = Math.fround(base);
  const dex = getPower(who, "Dexterity");
  if (dex) tmp = Math.fround(tmp + dex.amount);
  if (hasPower(who, "Frail")) tmp = new FrailPower(who).modifyBlock(tmp);
  return Math.max(0, froundFloor(tmp));
}

function dealDamageNow(
  run: RunState,
  attacker: Creature,
  target: Creature,
  base: number,
  opts: { hpLoss?: boolean; vampire?: boolean; card?: CardInst } = {},
): number {
  if (!target.alive) return 0;
  combatRun = run;
  const stance = run.combat?.stance ?? "none";
  let dmg = opts.hpLoss ? base : applyDamagePowers(base, attacker, target, stance, run);
  if (attacker.isPlayer && !opts.hpLoss && opts.card) {
    dmg = fireRelics(run, "atDamageModify", { card: opts.card, amount: dmg });
  }
  if (attacker.isPlayer && !opts.hpLoss && hasPower(attacker, "PenNib")) {
    dmg *= 2;
    attacker.powers = attacker.powers.filter((x) => x.id !== "PenNib");
  }
  if (attacker.isPlayer && !opts.hpLoss) {
    dmg = fireRelics(run, "onAttackToChangeDamage", { amount: dmg, card: opts.card, hpLoss: false });
  }
  if (hasPower(target, "Intangible")) dmg = Math.min(dmg, 1);
  if (target.isPlayer && !opts.hpLoss) {
    dmg = fireRelics(run, "onAttacked", { amount: dmg, hpLoss: false, thorns: false });
  }

  const thorns = getPower(target, "Thorns") ?? getPower(target, "Flame Barrier") ?? getPower(target, "Sharp Hide");
  const flame = getPower(target, "Flame Barrier");
  const sharp = getPower(target, "Sharp Hide");

  let hpDmg = dmg;
  if (!opts.hpLoss && target.block > 0) {
    const blocked = Math.min(target.block, hpDmg);
    target.block -= blocked;
    hpDmg -= blocked;
    if (blocked > 0 && target.isPlayer) {
      log(run, `格挡抵消 ${blocked} 点伤害（剩余 ${target.block}）`, `Blocked ${blocked}`);
    }
  }
  const invincible = !target.isPlayer ? getPower(target, "Invincible") : undefined;
  if (invincible) {
    const lost = Number(target.misc.hpLostThisTurn ?? 0);
    if (lost >= invincible.amount) hpDmg = 0;
    else hpDmg = Math.min(hpDmg, invincible.amount - lost);
  }
  if (target.isPlayer && hpDmg > 0) {
    hpDmg = fireRelics(run, "onLoseHpLast", { amount: hpDmg });
  }
  if (hpDmg > 0 && hasPower(target, "Buffer")) {
    const buf = getPower(target, "Buffer")!;
    buf.amount -= 1;
    if (buf.amount <= 0) target.powers = target.powers.filter((x) => x.id !== "Buffer");
    hpDmg = 0;
  }
  if (hpDmg > 0) {
    target.hp = Math.max(0, target.hp - hpDmg);
    if (!target.isPlayer) target.misc.hpLostThisTurn = Number(target.misc.hpLostThisTurn ?? 0) + hpDmg;
    if (target.isPlayer) {
      const bfb = [...(run.combat?.draw ?? []), ...(run.combat?.hand ?? []), ...(run.combat?.discard ?? [])].filter(
        (c) => c.defId === "Blood for Blood",
      );
      for (const c of bfb) c.costOverride = Math.max(0, (c.costOverride ?? 4) - 1);
      if (hasPower(target, "Rupture")) addPower(target, "Strength", getPower(target, "Rupture")!.amount);
      fireRelics(run, "wasHPLost", { amount: hpDmg });
      checkBloodied(run);
    } else {
      // CurlUp / Angry / Envenom / Mode Shift are onAttacked NORMAL, not HP_LOSS (PoisonLoseHpAction).
      if (!opts.hpLoss) {
        if (hasPower(run.player, "Envenom") && attacker.isPlayer && hpDmg > 0) {
          addPower(target, "Poison", getPower(run.player, "Envenom")!.amount);
        }
        const curl = getPower(target, "Curl Up");
        if (curl && !target.misc.curled) {
          target.block += curl.amount;
          target.misc.curled = true;
          target.powers = target.powers.filter((p) => p.id !== "Curl Up");
        }
        const angry = getPower(target, "Angry");
        if (angry) addPower(target, "Strength", angry.amount);
        const mode = getPower(target, "Mode Shift");
        if (mode) {
          mode.amount -= hpDmg;
          if (mode.amount <= 0) {
            target.block += 20;
            target.misc.guardianOpen = 0;
            target.powers = target.powers.filter((p) => p.id !== "Mode Shift");
            addPower(target, "Mode Shift", target.misc.guardianThreshold as number);
            target.nextMove = 1;
            target.intent = "buff";
            target.misc.skipRoll = 1;
          }
        }
      }
      // Lagavulin.damage(): any HP loss (including poison) wakes it.
      if (target.misc.asleep && hpDmg > 0) {
        target.misc.asleep = 0;
        target.misc.idleCount = 0;
        target.powers = target.powers.filter((p) => p.id !== "Metallicize");
        target.nextMove = 6;
        target.intent = "stun";
        target.intentDamage = undefined;
        target.intentHits = undefined;
      }
    }
    if (target.hp <= 0) {
      die(run, target, attacker);
    }
  }
  if (!opts.hpLoss && attacker.isPlayer && attacker !== target && dmg > 0 && getPower(target, "Painful Stabs")) {
    run.combat?.discard.push(makeCard(run, "Wound"));
  }
  if (!opts.hpLoss && attacker.alive && attacker !== target) {
    const reflect = (flame?.amount ?? 0) + (sharp?.amount ?? 0) + (getPower(target, "Thorns")?.amount ?? 0);
    if (reflect > 0 && hpDmg >= 0 && dmg > 0) {
      // thorns on unblocked hit — StS thorns trigger when HP is damaged
      if (hpDmg > 0 || (thorns && dmg > 0 && target.block === 0)) {
        /* handled below if hp damaged */
      }
      if (hpDmg > 0) {
        dealDamage(run, target, attacker, reflect, { hpLoss: true });
      }
    }
  }
  if (opts.vampire && hpDmg > 0 && attacker.alive) {
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + hpDmg);
  }
  void thorns;
  return hpDmg;
}

export function dealDamage(
  run: RunState,
  attacker: Creature,
  target: Creature,
  base: number,
  opts: { hpLoss?: boolean; vampire?: boolean; card?: CardInst } = {},
): number {
  return runAction(new DamageAction(run, attacker, target, base, opts)).dealt;
}

function die(run: RunState, who: Creature, killer?: Creature): void {
  if (!who.alive) return;
  if (who.monsterId === "AwakenedOne" && !who.misc.form2) {
    who.hp = 0;
    who.block = 0;
    who.nextMove = 3;
    who.intent = "buff";
    who.misc.skipRoll = 1;
    log(run, "觉醒者进入第二形态", "The Awakened One is reborn");
    return;
  }
  who.alive = false;
  who.hp = 0;
  who.block = 0;
  const spore = getPower(who, "Spore Cloud");
  if (spore && killer?.isPlayer) addPower(run.player, "Vulnerable", spore.amount);
  if (who.misc.split || who.monsterId === "SlimeBoss" || who.monsterId === "AcidSlime_L" || who.monsterId === "SpikeSlime_L") {
    addToBot(() => splitSlime(run, who));
  }
  log(run, `${who.name.zhs} 倒下了`, `${who.name.eng} dies`);
  if (!who.isPlayer) fireRelics(run, "onMonsterDeath", { target: who, attacker: killer });
  if (who.isPlayer) {
    const fairy = run.potions.findIndex((p) => p?.id === "FairyPotion" || p?.id === "Fairy Potion");
    if (fairy >= 0) {
      who.alive = true;
      who.hp = Math.max(1, Math.floor(who.maxHp * (hasRelic(run, "SacredBark") ? 0.6 : 0.3)));
      run.potions[fairy] = null;
      log(run, "瓶中精灵复活了你", "Fairy in a Bottle revives you");
      return;
    }
    if (tryLizardTail(run)) {
      log(run, "蜥蜴尾巴救了你", "Lizard Tail saves you");
      return;
    }
    run.combat!.defeat = true;
    run.over = "death";
    run.screen = "gameover";
  } else if (aliveEnemies(run).length === 0) {
    run.combat!.victory = true;
  }
}

function splitSlime(run: RunState, who: Creature): void {
  if (!run.combat) return;
  let ids: string[] = [];
  if (who.monsterId === "SlimeBoss") ids = ["AcidSlime_L", "SpikeSlime_L"];
  else if (who.monsterId === "AcidSlime_L") ids = ["AcidSlime_M", "AcidSlime_M"];
  else if (who.monsterId === "SpikeSlime_L") ids = ["SpikeSlime_M", "SpikeSlime_M"];
  else return;
  const kids = ids.map((id) => spawnMonster(run, id));
  if (who.monsterId === "SlimeBoss") {
    for (const k of kids) {
      k.hp = Math.max(1, Math.floor(who.maxHp / 2));
      k.maxHp = k.hp;
    }
  } else {
    const hp = Math.max(1, Math.floor(who.maxHp / 2));
    for (const k of kids) {
      k.hp = hp;
      k.maxHp = hp;
    }
  }
  const idx = run.combat.monsters.indexOf(who);
  if (idx < 0) run.combat.monsters.push(...kids);
  else run.combat.monsters.splice(idx, 1, ...kids);
  for (const k of kids) rollMove(run, k);
  run.combat.victory = false;
}

export function spawnMonster(run: RunState, id: string): Creature {
  return createMonster(run, id);
}

function gainBlockNow(run: RunState, who: Creature, base: number): void {
  const amt = applyBlockPowers(base, who);
  who.block += amt;
  const jug = getPower(who, "Juggernaut");
  if (jug && amt > 0) {
    const foes = aliveEnemies(run);
    if (foes.length) {
      const r = rng(run, "cardRandom");
      const t = foes[r.nextInt(foes.length)]!;
      saveRng(run, "cardRandom", r);
      dealDamage(run, who, t, jug.amount, { hpLoss: true });
    }
  }
}

export function gainBlock(run: RunState, who: Creature, base: number): void {
  runAction(new GainBlockAction(run, who, base));
}

function drawCardsNow(run: RunState, n: number): CardInst[] {
  if (hasPower(run.player, "No Draw")) return [];
  const cbt = run.combat!;
  const drawn: CardInst[] = [];
  for (let i = 0; i < n; i++) {
    if (cbt.hand.length >= 10) break;
    if (cbt.draw.length === 0) {
      if (cbt.discard.length === 0) break;
      runAction(new EmptyDeckShuffleAction(run));
    }
    const card = cbt.draw.pop()!;
    cbt.hand.push(card);
    drawn.push(card);
    if (hasPower(run.player, "Confusion")) {
      const d = cardDef(card.defId);
      if (d.cost >= 0) {
        const cr = rng(run, "cardRandom");
        card.costOverride = cr.nextInt(4);
        saveRng(run, "cardRandom", cr);
      }
    }
    const eff = effectOf(card.defId);
    if (eff.onDraw) runOps(run, card, eff.onDraw, undefined);
    if (hasPower(run.player, "Evolve") && cardDef(card.defId).type === "status") {
      drawCards(run, getPower(run.player, "Evolve")!.amount);
    }
    if (hasPower(run.player, "Fire Breathing") && (cardDef(card.defId).type === "status" || cardDef(card.defId).type === "curse")) {
      for (const m of aliveEnemies(run)) {
        dealDamage(run, run.player, m, getPower(run.player, "Fire Breathing")!.amount, { hpLoss: true });
      }
    }
  }
  maybeUnceasingTop(run);
  return drawn;
}

export function drawCards(run: RunState, n: number): CardInst[] {
  return runAction(new DrawCardAction(run, n)).drawn;
}

function shuffleDiscardIntoDraw(run: RunState): void {
  const cbt = run.combat;
  if (!cbt || cbt.discard.length === 0) return;
  const r = rng(run, "shuffle");
  r.shuffle(cbt.discard);
  cbt.draw.push(...cbt.discard);
  cbt.discard = [];
  saveRng(run, "shuffle", r);
  fireRelics(run, "onShuffle", {});
}

function resolveAmt(amt: Amt | undefined, nums: { damage: number; block: number; magic: number; cost: number }, run: RunState, fallback = 0): number {
  if (amt === undefined) return fallback;
  if (typeof amt === "number") return amt;
  if (amt === "damage") return nums.damage;
  if (amt === "block") return nums.block;
  if (amt === "magic") return nums.magic;
  if (amt === "x") return run.combat!.energy;
  if (amt === "energy") return run.combat!.energy;
  if (amt === "handSize") return run.combat!.hand.length;
  return fallback;
}

function runOps(run: RunState, card: CardInst, ops: Op[], target: Creature | undefined): void {
  const nums = baseNumbers(card);
  for (const op of ops) executeOp(run, card, op, target, nums);
}

function executeOp(run: RunState, card: CardInst, op: Op, target: Creature | undefined, nums: ReturnType<typeof baseNumbers>): void {
  const cbt = run.combat!;
  switch (op.op) {
    case "damage": {
      const base = resolveAmt(op.amount, nums, run, nums.damage);
      const times = resolveAmt(op.times, nums, run, 1);
      const foes =
        op.target === "all_enemies"
          ? aliveEnemies(run)
          : op.target === "random_enemy"
            ? []
            : target
              ? [target]
              : [];
      for (let t = 0; t < times; t++) {
        if (op.target === "random_enemy") {
          const live = aliveEnemies(run);
          if (!live.length) break;
          const r = rng(run, "cardRandom");
          const m = live[r.nextInt(live.length)]!;
          saveRng(run, "cardRandom", r);
          dealDamage(run, run.player, m, base, { vampire: op.vampire, card });
        } else {
          for (const m of foes) {
            if (m.alive) dealDamage(run, run.player, m, base, { vampire: op.vampire, card });
          }
        }
      }
      break;
    }
    case "block":
      gainBlock(run, run.player, resolveAmt(op.amount, nums, run, nums.block));
      break;
    case "power": {
      let amt = resolveAmt(op.amount, nums, run, 1);
      if (card.defId === "Disarm") amt = -Math.abs(amt);
      const dests =
        op.target === "all_enemies" ? aliveEnemies(run) : op.target === "target" ? (target ? [target] : []) : [run.player];
      for (const d of dests) {
        addPower(d, op.id, amt, false);
      }
      break;
    }
    case "draw":
      drawCards(run, resolveAmt(op.amount, nums, run, 1));
      break;
    case "energy":
      cbt.energy += resolveAmt(op.amount, nums, run, 1);
      break;
    case "loseHp":
      dealDamage(run, run.player, run.player, resolveAmt(op.amount, nums, run, 1), { hpLoss: true });
      break;
    case "heal":
      healPlayer(run, resolveAmt(op.amount, nums, run, 1));
      break;
    case "addCard": {
      const n = op.count ?? 1;
      for (let i = 0; i < n; i++) {
        const made = makeCard(run, op.card);
        if (op.to === "hand" && cbt.hand.length < 10) cbt.hand.push(made);
        else if (op.to === "draw") cbt.draw.push(made);
        else cbt.discard.push(made);
      }
      break;
    }
    case "copySelf": {
      const copy = { ...card, uid: nextUid(run) };
      if (op.to === "discard") cbt.discard.push(copy);
      else cbt.draw.push(copy);
      break;
    }
    case "doubleBlock":
      run.player.block *= 2;
      break;
    case "channel":
      channelOrb(run, op.orb, resolveAmt(op.count, nums, run, 1));
      break;
    case "evoke":
      evokeOrb(run, resolveAmt(op.times, nums, run, 1));
      break;
    case "stance":
      changeStance(run, op.stance);
      break;
    case "if": {
      let ok = false;
      if (op.cond === "targetVulnerable") ok = !!target && hasPower(target, "Vulnerable");
      if (op.cond === "targetAttacking") ok = !!target && (target.intent ?? "").startsWith("attack");
      if (op.cond === "targetPoisoned") ok = !!target && hasPower(target, "Poison");
      if (op.cond === "upgraded") ok = card.upgraded;
      runOps(run, card, ok ? op.then : (op.else ?? []), target);
      break;
    }
    case "custom":
      runCustom(run, card, op.id, target, nums);
      break;
  }
}

function setPending(run: RunState, p: PendingChoice): void {
  run.combat!.pending = p;
}

function runCustom(run: RunState, card: CardInst, id: string, target: Creature | undefined, nums: ReturnType<typeof baseNumbers>): void {
  const cbt = run.combat!;
  switch (id) {
    case "armaments":
      setPending(run, {
        kind: card.upgraded ? "upgradeAllHand" : "armaments",
        filter: "upgradable",
        count: 1,
        prompt: { eng: "Upgrade a card", zhs: "选择一张牌升级" },
      });
      break;
    case "bodySlam": {
      const base = run.player.block;
      if (target) dealDamage(run, run.player, target, base);
      break;
    }
    case "burningPact":
      setPending(run, {
        kind: "exhaustChoose",
        filter: "any",
        count: 1,
        prompt: { eng: "Exhaust a card", zhs: "消耗一张牌" },
      });
      cbt.miscDraw = nums.magic;
      break;
    case "dropkick":
      if (target && hasPower(target, "Vulnerable")) {
        cbt.energy += 1;
        drawCards(run, 1);
      }
      break;
    case "dualWield":
      setPending(run, {
        kind: "dualWield",
        filter: "attackOrPower",
        count: 1,
        prompt: { eng: "Copy an Attack or Power", zhs: "复制一张攻击或能力" },
      });
      cbt.miscCopies = nums.magic;
      break;
    case "exhume":
      setPending(run, {
        kind: "exhume",
        filter: "any",
        count: 1,
        prompt: { eng: "Choose a card from Exhaust", zhs: "从消耗堆选一张牌" },
      });
      break;
    case "feed":
      if (target && !target.alive) {
        run.player.maxHp += nums.magic;
        run.player.hp += nums.magic;
      }
      break;
    case "fiendFire": {
      const n = cbt.hand.length;
      const burned = cbt.hand.splice(0);
      for (const h of burned) {
        cbt.exhaust.push(h);
        onExhaust(run, h);
      }
      if (target) {
        for (let i = 0; i < n; i++) dealDamage(run, run.player, target, nums.damage);
      }
      break;
    }
    case "havoc": {
      if (cbt.draw.length === 0) {
        const r = rng(run, "shuffle");
        r.shuffle(cbt.discard);
        cbt.draw.push(...cbt.discard);
        cbt.discard = [];
        saveRng(run, "shuffle", r);
        fireRelics(run, "onShuffle", {});
      }
      const top = cbt.draw.pop();
      if (top) {
        const t = needsTarget(top) ? target ?? aliveEnemies(run)[0] : undefined;
        playCardEffects(run, top, t, true);
        cbt.exhaust.push(top);
        onExhaust(run, top);
      }
      break;
    }
    case "headbutt":
      if (cbt.discard.length)
        setPending(run, {
          kind: "headbutt",
          filter: "any",
          count: 1,
          prompt: { eng: "Put a discard on top of draw", zhs: "将弃牌堆一张牌放到抽牌堆顶" },
        });
      break;
    case "heavyBlade": {
      const str = getPower(run.player, "Strength")?.amount ?? 0;
      const fake = { ...run.player, powers: run.player.powers.map((p) => (p.id === "Strength" ? { ...p, amount: str * nums.magic } : p)) };
      if (target) {
        const dmg = applyDamagePowers(nums.damage, fake, target);
        // deal with precomputed: hpLoss path skips apply — so pass as hpLoss after computing
        // Recompute via temporarily swapping strength
        const orig = getPower(run.player, "Strength");
        if (orig) orig.amount = str * nums.magic;
        dealDamage(run, run.player, target, nums.damage);
        if (orig) orig.amount = str;
        void dmg;
      }
      break;
    }
    case "infernalBlade": {
      const attacks = [...CARD_BY_ID.values()].filter((d) => d.color === "red" && d.type === "attack" && d.rarity !== "basic");
      const r = rng(run, "cardRandom");
      const pick = attacks[r.nextInt(attacks.length)]!;
      saveRng(run, "cardRandom", r);
      const made = makeCard(run, pick.id);
      made.freeOnce = true;
      cbt.hand.push(made);
      break;
    }
    case "limitBreak": {
      const s = getPower(run.player, "Strength");
      if (s) addPower(run.player, "Strength", s.amount);
      break;
    }
    case "perfectedStrike": {
      const all = [...run.deck, ...cbt.draw, ...cbt.hand, ...cbt.discard, ...cbt.exhaust, card];
      const seen = new Set<string>();
      let strikes = 0;
      for (const pile of [run.deck, cbt.draw, cbt.hand, cbt.discard, cbt.exhaust]) {
        for (const c of pile) {
          if (cardDef(c.defId).tags.includes("strike") || c.defId.toLowerCase().includes("strike") || c.defId === "Strike_R")
            strikes++;
        }
      }
      void all;
      void seen;
      const base = nums.damage + strikes * nums.magic;
      if (target) dealDamage(run, run.player, target, base);
      break;
    }
    case "rampage":
      card.combatDamage += nums.magic;
      break;
    case "secondWind": {
      const rest = cbt.hand.filter((c) => cardDef(c.defId).type !== "attack");
      cbt.hand = cbt.hand.filter((c) => cardDef(c.defId).type === "attack");
      for (const h of rest) {
        cbt.exhaust.push(h);
        onExhaust(run, h);
        gainBlock(run, run.player, nums.block);
      }
      break;
    }
    case "sentinelEnergy":
      cbt.energy += card.upgraded ? 3 : 2;
      break;
    case "severSoul": {
      const rest = cbt.hand.filter((c) => cardDef(c.defId).type !== "attack");
      cbt.hand = cbt.hand.filter((c) => cardDef(c.defId).type === "attack");
      for (const h of rest) {
        cbt.exhaust.push(h);
        onExhaust(run, h);
      }
      if (target) dealDamage(run, run.player, target, nums.damage);
      break;
    }
    case "spotWeakness":
      if (aliveEnemies(run).some((m) => (m.intent ?? "").startsWith("attack"))) {
        addPower(run.player, "Strength", nums.magic);
      }
      break;
    case "trueGrit":
      if (card.upgraded) {
        if (cbt.hand.length)
          setPending(run, {
            kind: "trueGrit",
            filter: "any",
            count: 1,
            prompt: { eng: "Exhaust a card", zhs: "消耗一张牌" },
          });
      } else if (cbt.hand.length) {
        const r = rng(run, "cardRandom");
        const i = r.nextInt(cbt.hand.length);
        saveRng(run, "cardRandom", r);
        const [ex] = cbt.hand.splice(i, 1);
        if (ex) {
          cbt.exhaust.push(ex);
          onExhaust(run, ex);
        }
      }
      break;
    case "warcry":
      if (cbt.hand.length)
        setPending(run, {
          kind: "warcry",
          filter: "any",
          count: 1,
          prompt: { eng: "Put a card on top of your draw pile", zhs: "将一张手牌放到抽牌堆顶" },
        });
      break;
    case "whirlwind":
    case "skewer": {
      let x = cbt.energy;
      if (run.relics.some((r) => r.id === "Chemical X")) x += 2;
      cbt.energy = 0;
      for (let i = 0; i < x; i++) {
        if (id === "skewer") {
          if (target) dealDamage(run, run.player, target, nums.damage);
        } else {
          for (const m of aliveEnemies(run)) dealDamage(run, run.player, m, nums.damage);
        }
      }
      break;
    }
    case "regret":
      dealDamage(run, run.player, run.player, cbt.hand.length, { hpLoss: true });
      break;
    case "discardChoose1":
      if (cbt.hand.length)
        setPending(run, { kind: "discardChoose", filter: "any", count: 1, prompt: { eng: "Discard a card", zhs: "弃一张牌" } });
      break;
    case "catalyst":
      if (target && hasPower(target, "Poison")) {
        const p = getPower(target, "Poison")!;
        p.amount *= card.upgraded ? 3 : 2;
      }
      break;
    case "outmaneuver":
      cbt.energyMax += 0;
      cbt.miscDraw = (cbt.miscDraw ?? 0) + 2;
      addPower(run.player, "Next Turn Energy", 2);
      break;
    case "tempest":
      channelOrb(run, "lightning", cbt.energy + (run.relics.some((r) => r.id === "Chemical X") ? 2 : 0));
      cbt.energy = 0;
      break;
    case "multiCast":
      evokeOrb(run, Math.max(1, cbt.energy + (run.relics.some((r) => r.id === "Chemical X") ? 2 : 0)));
      cbt.energy = 0;
      break;
    case "finisher":
      for (let i = 0; i < cbt.attacksPlayedThisTurn; i++) if (target) dealDamage(run, run.player, target, nums.damage);
      break;
    case "bowlingBash":
      if (target) {
        const n = aliveEnemies(run).length;
        for (let i = 0; i < n; i++) dealDamage(run, run.player, target, nums.damage);
      }
      break;
    case "halt": {
      gainBlock(run, run.player, nums.block);
      if (cbt.stance === "wrath") gainBlock(run, run.player, nums.magic || nums.block * 2);
      break;
    }
    case "innerPeace":
      if (cbt.stance === "calm") drawCards(run, 3);
      else changeStance(run, "calm");
      break;
    case "fearNoEvil":
      if (target && (target.intent ?? "").startsWith("attack")) changeStance(run, "calm");
      break;
    case "indignation":
      if (cbt.stance === "wrath") {
        for (const m of aliveEnemies(run)) addPower(m, "Vulnerable", nums.magic);
      } else changeStance(run, "wrath");
      break;
    case "pray":
      cbt.mantra += nums.magic;
      if (cbt.mantra >= 10) {
        cbt.mantra -= 10;
        changeStance(run, "divinity");
      }
      break;
    case "prostrate":
      cbt.mantra += nums.magic || 2;
      if (cbt.mantra >= 10) {
        cbt.mantra -= 10;
        changeStance(run, "divinity");
      }
      break;
    case "spiritShield":
      gainBlock(run, run.player, cbt.hand.length * (nums.magic || 3));
      break;
    case "stack":
      gainBlock(run, run.player, cbt.discard.length);
      break;
    case "autoShields":
      if (run.player.block === 0) gainBlock(run, run.player, nums.block || 11);
      break;
    case "compileDriver":
      drawCards(run, cbt.orbs.length);
      break;
    case "recursion": {
      const o = cbt.orbs[0];
      if (o) {
        triggerOrb(run, o, true);
        triggerOrb(run, o, false);
      }
      break;
    }
    case "capacitor":
      cbt.orbSlots += nums.magic || 2;
      break;
    case "consume":
      cbt.orbSlots = Math.max(1, cbt.orbSlots - 1);
      break;
    case "alchemize": {
      /* potion reward handled as a potion slot fill */
      const i = run.potions.findIndex((p) => p === null);
      if (i >= 0) run.potions[i] = { id: "Fire Potion" };
      break;
    }
    case "expertise": {
      const want = nums.magic || 6;
      drawCards(run, Math.max(0, want - cbt.hand.length));
      break;
    }
    case "calculatedGamble": {
      const n = cbt.hand.length;
      cbt.discard.push(...cbt.hand.splice(0));
      drawCards(run, n);
      break;
    }
    case "stormOfSteel": {
      const n = cbt.hand.length;
      cbt.discard.push(...cbt.hand.splice(0));
      for (let i = 0; i < n; i++) {
        const shiv = makeCard(run, "Shiv", card.upgraded);
        if (cbt.hand.length < 10) cbt.hand.push(shiv);
      }
      break;
    }
    case "unload":
      cbt.discard.push(...cbt.hand.splice(0));
      break;
    case "flechettes": {
      const skills = cbt.hand.filter((h) => cardDef(h.defId).type === "skill").length;
      for (let i = 0; i < skills; i++) if (target) dealDamage(run, run.player, target, nums.damage);
      break;
    }
    case "malaise": {
      const x = cbt.energy + (run.relics.some((r) => r.id === "Chemical X") ? 2 : 0);
      cbt.energy = 0;
      if (target) {
        addPower(target, "Weakened", x);
        addPower(target, "Strength", -x);
      }
      break;
    }
    default:
      break;
  }
}

function onExhaust(run: RunState, card: CardInst): void {
  const eff = effectOf(card.defId);
  if (eff.onExhaust) runOps(run, card, eff.onExhaust, undefined);
  if (hasPower(run.player, "Dark Embrace")) drawCards(run, 1);
  if (hasPower(run.player, "Feel No Pain")) gainBlock(run, run.player, getPower(run.player, "Feel No Pain")!.amount);
  fireRelics(run, "onExhaust", { card });
}

export function needsTarget(c: CardInst): boolean {
  const t = cardDef(c.defId).target;
  return t === "enemy" || t === "self_and_enemy";
}

export function canPlay(run: RunState, c: CardInst): string | true {
  const def = cardDef(c.defId);
  const cost = currentCost(run, c);
  if (cost === -2) return "不能被打出";
  if (cost > 0 && cost > (run.combat?.energy ?? 0)) return "能量不足";
  if (cost === -1 && (run.combat?.energy ?? 0) < 0) return "能量不足";
  if (hasPower(run.player, "Entangled") && def.type === "attack") return "缠身";
  if (run.combat!.hand.some((h) => h.defId === "Normality") && run.combat!.cardsPlayedThisTurn >= 3) return "正常：本回合最多 3 张";
  if (!relicCanPlay(run, c)) return "天鹅绒颈圈：本回合最多 6 张";
  const eff = effectOf(c.defId);
  if (eff.canUse === "allAttacksInHand") {
    if (run.combat!.hand.some((h) => h.uid !== c.uid && cardDef(h.defId).type !== "attack")) return "Clash：手牌必须全是攻击";
  }
  return true;
}

function playCardEffects(run: RunState, card: CardInst, target: Creature | undefined, skipHooks = false): void {
  const def = cardDef(card.defId);
  const eff = effectOf(card.defId);
  if (!skipHooks) {
    for (const h of [...run.combat!.hand]) {
      const e = effectOf(h.defId);
      if (e.onOtherCardPlayed) runOps(run, h, e.onOtherCardPlayed, undefined);
    }
    const anger = run.combat!.monsters.find((m) => hasPower(m, "Anger"));
    if (anger && def.type === "skill") addPower(anger, "Strength", getPower(anger, "Anger")!.amount);
    if (hasPower(run.player, "Rage") && def.type === "attack") {
      gainBlock(run, run.player, getPower(run.player, "Rage")!.amount);
    }
  }
  runOps(run, card, eff.ops, target);
}

export function playCard(run: RunState, handIndex: number, targetId?: string): void {
  const cbt = run.combat!;
  if (!cbt.playerTurn || cbt.pending || cbt.victory || cbt.defeat) return;
  const card = cbt.hand[handIndex];
  if (!card) return;
  const ok = canPlay(run, card);
  if (ok !== true) {
    log(run, String(ok), String(ok));
    return;
  }
  if (needsTarget(card) && !targetId) return;
  const target = targetId ? cbt.monsters.find((m) => m.id === targetId && m.alive) : undefined;
  if (needsTarget(card) && !target) return;
  combatRun = run;
  gameActions.addCardQueueItem({ card, monster: target ?? null, energyOnUse: currentCost(run, card) });
  if (!gameActions.isRunning) gameActions.runUntilIdle();
}

function invokeCardUse(run: RunState, card: CardInst, target: Creature | undefined, replay = false): void {
  if (!replay) {
    const use = CARD_CLASSES[card.defId] && new CARD_CLASSES[card.defId]!().use;
    if (use) {
      use(run, card, target);
      return;
    }
  }
  playCardEffects(run, card, target, replay);
}

function playFromQueue(item: { card: CardInst | null; monster?: Creature | null; energyOnUse?: number }): void {
  const run = combatRun;
  const card = item.card;
  if (!run?.combat || !card) return;
  const cbt = run.combat;
  const target = item.monster ?? undefined;
  const def = cardDef(card.defId);
  const cost = item.energyOnUse ?? currentCost(run, card);
  if (cost > 0) cbt.energy -= cost;
  if (target) cbt.selectedTargetId = target.id;
  card.freeOnce = false;
  const index = cbt.hand.findIndex((h) => h.uid === card.uid);
  if (index >= 0) cbt.hand.splice(index, 1);
  cbt.cardsPlayedThisTurn += 1;
  if (def.type === "attack") cbt.attacksPlayedThisTurn += 1;
  if (def.type === "skill") cbt.skillsPlayedThisTurn += 1;

  // Build [onPlayCard actions, card actions, onUseCard actions, UseCardAction] and let the queue run them.
  gameActions.deferToQueue = true;
  try {
    fireRelics(run, "onPlayCard", { card, target });
    invokeCardUse(run, card, target);
    const necro = run.relics.find((r) => r.id === "Necronomicon");
    if (necro?.flags?.replay) {
      necro.flags.replay = 0;
      invokeCardUse(run, card, target, true);
    }
    const dt = getPower(run.player, "Double Tap");
    if (dt && def.type === "attack" && (cbt.extraAttackPlays ?? 0) < dt.amount) {
      cbt.extraAttackPlays = (cbt.extraAttackPlays ?? 0) + 1;
      invokeCardUse(run, card, target, true);
    }
    if (cbt.pending) {
      cbt.limbo = card;
      return;
    }
    gameActions.addToBottom(new UseCardAction(run, card, target ?? null));
  } finally {
    gameActions.deferToQueue = false;
  }
}

function cardShouldExhaust(run: RunState, card: CardInst): boolean {
  const def = cardDef(card.defId);
  if (card.defId === "Limit Break" && card.upgraded) return false;
  return !!(
    def.exhaust ||
    card.exhaustOnce ||
    (card.upgraded && def.upgrade.exhaust === true) ||
    (hasPower(run.player, "Corruption") && def.type === "skill")
  );
}

function finishPlayedCard(run: RunState, card: CardInst): void {
  const cbt = run.combat!;
  const def = cardDef(card.defId);
  const reallyExhaust = cardShouldExhaust(run, card);
  if (reallyExhaust) {
    cbt.exhaust.push(card);
    onExhaust(run, card);
  } else if (def.type === "power") {
    cbt.exhaust.push(card); // powers leave play
  } else {
    cbt.discard.push(card);
  }
}

export function resolvePending(run: RunState, pickedUids: string[]): void {
  const cbt = run.combat!;
  const p = cbt.pending;
  if (!p) return;
  const card = cbt.limbo as CardInst | undefined;
  const take = (from: CardInst[], uid: string): CardInst | undefined => {
    const i = from.findIndex((c) => c.uid === uid);
    if (i < 0) return undefined;
    return from.splice(i, 1)[0];
  };
  if (p.kind === "upgradeAllHand") {
    for (const h of cbt.hand) upgradeCard(h);
  } else if (p.kind === "discardChoose") {
    const h = take(cbt.hand, pickedUids[0]!);
    if (h) {
      cbt.discard.push(h);
      fireRelics(run, "onManualDiscard", { card: h });
    }
  } else if (p.kind === "armaments") {
    const h = cbt.hand.find((c) => c.uid === pickedUids[0]);
    if (h) upgradeCard(h);
  } else if (p.kind === "exhaustChoose" || p.kind === "trueGrit" || p.kind === "burningPact") {
    const h = take(cbt.hand, pickedUids[0]!);
    if (h) {
      cbt.exhaust.push(h);
      onExhaust(run, h);
    }
    if (p.kind === "exhaustChoose" && cbt.miscDraw) drawCards(run, cbt.miscDraw);
  } else if (p.kind === "dualWield") {
    const h = cbt.hand.find((c) => c.uid === pickedUids[0]);
    const n = cbt.miscCopies ?? 1;
    if (h) for (let i = 0; i < n; i++) cbt.hand.push({ ...h, uid: nextUid(run) });
  } else if (p.kind === "exhume") {
    const h = take(cbt.exhaust, pickedUids[0]!);
    if (h) cbt.hand.push(h);
  } else if (p.kind === "headbutt") {
    const h = take(cbt.discard, pickedUids[0]!);
    if (h) cbt.draw.push(h);
  } else if (p.kind === "warcry") {
    const h = take(cbt.hand, pickedUids[0]!);
    if (h) cbt.draw.push(h);
  }
  cbt.pending = undefined;
  cbt.miscDraw = 0;
  cbt.miscCopies = 0;
  if (card) finishPlayedCard(run, card);
  cbt.limbo = undefined;
  flushActions();
  checkCombatEnd(run);
}

function loseHpToPoison(run: RunState, who: Creature, amount: number): void {
  runAction(new LoseHPAction(run, who, who, amount));
}

/** atEndOfTurn (Flex) or atEndOfRound (Weak / Vulnerable / Frail). justApplied skips one beat. */
function tickPowers(who: Creature, ids: string[]): void {
  for (const p of [...who.powers]) {
    if (!ids.includes(p.id)) continue;
    if (p.justApplied) {
      p.justApplied = false;
      continue;
    }
    if (p.id === "Lose Strength") {
      addPower(who, "Strength", -p.amount);
      who.powers = who.powers.filter((x) => x.id !== "Lose Strength");
      continue;
    }
    if (p.id === "Lose Dexterity") {
      addPower(who, "Dexterity", -p.amount);
      who.powers = who.powers.filter((x) => x.id !== "Lose Dexterity");
      continue;
    }
    p.amount -= 1;
    if (p.amount <= 0) who.powers = who.powers.filter((x) => x !== p);
  }
}

const FLEX_IDS = ["Lose Strength", "Lose Dexterity"];

/** True while monster turns are resolving, so Vulnerable.justApplied matches the jar (only if turnHasEnded). */
let turnHasEnded = false;

function playerEndBeforeDiscard(run: RunState): void {
  const cbt = run.combat!;
  fireRelics(run, "onPlayerEndTurn", {});
  if (hasPower(run.player, "Metallicize")) {
    new MetallicizePower(run.player).atEndOfTurnPreEndTurnCards(true, (n) => gainBlock(run, run.player, n));
  }
  if (hasPower(run.player, "Like Water")) {
    new LikeWaterPower(run.player).atEndOfTurnPreEndTurnCards(true, cbt.stance, (n) => gainBlock(run, run.player, n));
  }
  runPowerHooks(run, run.player, "atEndOfTurnPreEndTurnCards");
  for (const h of [...cbt.hand]) {
    const e = effectOf(h.defId);
    if (e.onEndOfTurnInHand) runOps(run, h, e.onEndOfTurnInHand, undefined);
  }
  tickPowers(run.player, FLEX_IDS);
  if (hasPower(run.player, "Ritual")) {
    new RitualPower(run.player).atEndOfTurn(true, (n) => addPower(run.player, "Strength", n));
  }
  const combust = getPower(run.player, "Combust");
  if (combust) {
    dealDamage(run, run.player, run.player, 1, { hpLoss: true });
    for (const m of aliveEnemies(run)) dealDamage(run, run.player, m, combust.amount, { hpLoss: true });
  }
}

function discardAtEndOfTurn(run: RunState): void {
  const cbt = run.combat!;
  const keep: CardInst[] = [];
  for (const h of cbt.hand) {
    const def = cardDef(h.defId);
    const ethereal = def.ethereal || (h.upgraded && def.upgrade.ethereal);
    const retain = def.retain || (h.upgraded && def.upgrade.retain);
    if (ethereal) {
      cbt.exhaust.push(h);
      onExhaust(run, h);
    } else if (retain) keep.push(h);
    else if (hasRelic(run, "Runic Pyramid")) keep.push(h);
    else {
      cbt.discard.push(h);
      GameActionManager.incrementDiscard(true);
    }
  }
  cbt.hand = keep;
  cbt.playerTurn = false;
}

function preMonsterTurn(run: RunState): void {
  const monsters = [...(run.combat?.monsters ?? [])];
  for (const m of monsters) {
    if (!m.alive || hasPower(m, "Barricade")) continue;
    m.block = 0;
  }
  for (const m of monsters) {
    if (!m.alive) continue;
    ownerTurnStart(run, m, (who, amt) => loseHpToPoison(run, who, amt));
  }
}

function afterMonsters(run: RunState): void {
  const cbt = run.combat!;
  const monsters = [...cbt.monsters];
  for (const m of monsters) {
    if (!m.alive) continue;
    if (hasPower(m, "Metallicize")) {
      new MetallicizePower(m).atEndOfTurnPreEndTurnCards(false, (n) => gainBlock(run, m, n));
    }
    runPowerHooks(run, m, "atEndOfTurnPreEndTurnCards");
    tickPowers(m, FLEX_IDS);
  }
  endOfRound(run.player);
  for (const m of monsters) if (m.alive) endOfRound(m);
  runPowerHooks(run, run.player, "atEndOfRound");
  for (const m of monsters) if (m.alive) runPowerHooks(run, m, "atEndOfRound");
  flushActions();
  if (cbt.stance === "divinity") changeStance(run, "none");
  startPlayerTurn(run);
}

export function endTurn(run: RunState): void {
  const cbt = run.combat!;
  if (!cbt.playerTurn || cbt.pending) return;
  combatRun = run;
  playerEndBeforeDiscard(run);
  gameActions.addToBottom(new DiscardAtEndOfTurnAction(run));
  gameActions.addToBottom(new EndTurnAction());
  gameActions.addToBottom(new MonsterStartTurnAction(run));
  gameActions.addToBottom(new StartNextTurnAction(run));
  gameActions.runUntilIdle();
}

function ensureCombatFields(cbt: NonNullable<RunState["combat"]>, run: RunState): void {
  if (!cbt.orbs) cbt.orbs = [];
  if (cbt.orbSlots == null) cbt.orbSlots = run.character === "defect" ? 3 : 0;
  if (!cbt.stance) cbt.stance = "none";
  if (cbt.mantra == null) cbt.mantra = 0;
}

function startPlayerTurn(run: RunState): void {
  const cbt = run.combat!;
  ensureCombatFields(cbt, run);
  if (cbt.victory || cbt.defeat) return;
  cbt.turn += 1;
  cbt.playerTurn = true;
  cbt.cardsPlayedThisTurn = 0;
  cbt.attacksPlayedThisTurn = 0;
  cbt.skillsPlayedThisTurn = 0;
  cbt.extraAttackPlays = 0;
  turnHasEnded = false;
  // Player poison is atStartOfTurn, before block is cleared (HP_LOSS, so block would not stop it anyway).
  ownerTurnStart(run, run.player, (who, amt) => loseHpToPoison(run, who, amt));
  if (!hasPower(run.player, "Barricade") && !hasPower(run.player, "Blur")) {
    if (hasRelic(run, "Calipers")) run.player.block = Math.max(0, run.player.block - 15);
    else run.player.block = 0;
  }
  // BlurPower.atEndOfRound is queued and therefore resolves after the block check above.
  if (hasPower(run.player, "Blur")) new BlurPower(run.player).atEndOfRound();
  for (const m of cbt.monsters) m.misc.hpLostThisTurn = 0;

  const ntb = getPower(run.player, "Next Turn Block");
  if (ntb) {
    gainBlock(run, run.player, ntb.amount);
    run.player.powers = run.player.powers.filter((p) => p.id !== "Next Turn Block");
  }

  if (hasRelic(run, "Ice Cream")) {
    if (cbt.turn === 1) cbt.energy = cbt.energyMax;
    else cbt.energy += cbt.energyMax;
  } else cbt.energy = cbt.energyMax;
  const nte = getPower(run.player, "Next Turn Energy");
  if (nte) {
    runAction(new GainEnergyAction(run, nte.amount));
    run.player.powers = run.player.powers.filter((p) => p.id !== "Next Turn Energy");
  }
  if (hasPower(run.player, "Berserk")) runAction(new GainEnergyAction(run, getPower(run.player, "Berserk")!.amount));

  fireRelics(run, "atTurnStart", { kind: run.roomKind as "monster" | "elite" | "boss" | undefined });
  const damaru = run.relics.find((x) => x.id === "Damaru");
  if (damaru?.flags?.enterDivinity) {
    damaru.flags.enterDivinity = 0;
    changeStance(run, "divinity");
  }
  runPowerHooks(run, run.player, "atStartOfTurn");
  if (hasPower(run.player, "Storm")) channelOrb(run, "lightning");
  if (hasPower(run.player, "Devotion")) {
    cbt.mantra += getPower(run.player, "Devotion")!.amount;
    if (cbt.mantra >= 10) {
      cbt.mantra -= 10;
      changeStance(run, "divinity");
    }
  }
  passiveOrbs(run);
  const handSize = run.handSizeMaster ?? 5;
  drawCards(run, handSize);
  runPowerHooks(run, run.player, "atStartOfTurnPostDraw");
  if (cbt.turn === 1) fireRelics(run, "atBattleStart", { kind: run.roomKind as "monster" | "elite" | "boss" | undefined });
  fireRelics(run, "atTurnStartPostDraw", { kind: run.roomKind as "monster" | "elite" | "boss" | undefined });
}

/** AbstractMonster.calculateDamage: intent number after Strength / Weak / Vulnerable. */
export function intentDamageOf(run: RunState, m: Creature): number | undefined {
  if (m.intentDamage == null || !(m.intent ?? "").startsWith("attack")) return undefined;
  return applyDamagePowers(m.intentDamage, m, run.player, run.combat?.stance ?? "none", run);
}

export function rollMove(run: RunState, m: Creature): void {
  const r = rng(run, "ai");
  const n = r.random(99);
  saveRng(run, "ai", r);
  pickMove(run, m, n);
}

function checkCombatEnd(run: RunState): void {
  if (!run.combat) return;
  if (run.player.hp <= 0) {
    run.combat.defeat = true;
    run.over = "death";
    run.screen = "gameover";
  } else if (aliveEnemies(run).length === 0) {
    run.combat.victory = true;
  }
}

export function startCombat(run: RunState, encounter: string, kind: "monster" | "elite" | "boss"): void {
  run.floor += kind === "boss" ? 0 : 0;
  const floor = run.floor;
  run.rng.ai = new StsRandom(run.seed + floor).toState();
  run.rng.shuffle = new StsRandom(run.seed + floor).toState();
  run.rng.cardRandom = new StsRandom(run.seed + floor).toState();
  run.rng.misc = new StsRandom(run.seed + floor).toState();
  run.rng.monsterHp = new StsRandom(run.seed + floor).toState();

  const monsters = spawnEncounter(run, encounter);
  const draw = run.deck.map((c) => ({ ...c, uid: nextUid(run), combatDamage: 0 }));
  const r = rng(run, "shuffle");
  r.shuffle(draw);
  saveRng(run, "shuffle", r);
  const placeOnTop: CardInst[] = [];
  const pile: CardInst[] = [];
  for (const c of draw) {
    if (c.bottled || cardDef(c.defId).innate || (c.upgraded && cardDef(c.defId).upgrade.innate)) placeOnTop.push(c);
    else pile.push(c);
  }
  pile.push(...placeOnTop);

  if (run.energyMaster == null) run.energyMaster = 3;
  if (run.handSizeMaster == null) run.handSizeMaster = 5;
  if (run.masterMaxOrbs == null) run.masterMaxOrbs = run.character === "defect" ? 3 : 0;

  run.player.block = 0;
  run.player.powers = [];
  run.combat = {
    draw: pile,
    hand: [],
    discard: [],
    exhaust: [],
    monsters,
    energy: 0,
    energyMax: run.energyMaster,
    turn: 0,
    playerTurn: true,
    cardsPlayedThisTurn: 0,
    attacksPlayedThisTurn: 0,
    skillsPlayedThisTurn: 0,
    extraAttackPlays: 0,
    orbs: [],
    orbSlots: run.masterMaxOrbs,
    stance: "none",
    mantra: 0,
  };
  run.screen = "combat";
  run.encounter = encounter;
  run.roomKind = kind;
  run.log = [];
  log(run, `遭遇：${encounter}`, `Encounter: ${encounter}`);
  for (const m of monsters) {
    // pre-battle: cultist nothing, nob bellow is first move, lagavulin metallicize
    if (m.monsterId === "Lagavulin") {
      addPower(m, "Metallicize", 8);
      m.block += 8;
      m.misc.asleep = 1;
    }
    if (m.monsterId === "TheGuardian") {
      m.misc.guardianThreshold = run.ascension >= 19 ? 40 : run.ascension >= 9 ? 35 : 30;
      addPower(m, "Mode Shift", m.misc.guardianThreshold as number);
      m.misc.guardianOpen = 1;
    }
    if (m.monsterId === "GremlinNob") {
      /* bellow is first move */
    }
    if (m.monsterId === "SpireShield" || m.monsterId === "SpireSpear") {
      addPower(m, "Artifact", run.ascension >= 18 ? 2 : 1);
    }
    if (m.monsterId === "CorruptHeart") {
      addPower(m, "BeatOfDeath", run.ascension >= 19 ? 2 : 1);
      addPower(m, "Invincible", run.ascension >= 19 ? 200 : 300);
      m.misc.buffCount = 0;
    }
    if (m.monsterId === "BronzeAutomaton") addPower(m, "Artifact", 3);
    if (m.monsterId === "TimeEater") addPower(m, "Time Warp", 1);
    if (m.monsterId === "AwakenedOne") {
      addPower(m, "Unawakened", 1);
      if (run.ascension >= 4) addPower(m, "Strength", 2);
    }
    if (m.monsterId === "Donu" || m.monsterId === "Deca") {
      addPower(m, "Artifact", run.ascension >= 19 ? 3 : 2);
      if (m.monsterId === "Deca") m.misc.isAttacking = 1;
    }
    if (m.monsterId === "FungiBeast") addPower(m, "Spore Cloud", 2);
    if (m.monsterId === "FuzzyLouseNormal" || m.monsterId === "FuzzyLouseDefensive") {
      const hpR = rng(run, "monsterHp");
      addPower(m, "Curl Up", hpR.randomRange(3, 7));
      saveRng(run, "monsterHp", hpR);
    }
    rollMove(run, m);
  }
  if (monsters.some((m) => m.monsterId === "SpireShield" || m.monsterId === "SpireSpear")) {
    addPower(run.player, "Surrounded", 1, true);
  }
  combatRun = run;
  fireRelics(run, "atPreBattle", { kind });
  fireRelics(run, "atBattleStartPreDraw", { kind });
  const tear = run.relics.find((x) => x.id === "TeardropLocket");
  startPlayerTurn(run);
  if (tear?.flags?.enterCalm) {
    tear.flags.enterCalm = 0;
    changeStance(run, "calm");
  }
}

export function playTopCard(run: RunState): void {
  const cbt = run.combat;
  if (!cbt) return;
  if (cbt.draw.length === 0) {
    if (!cbt.discard.length) return;
    const r = rng(run, "shuffle");
    r.shuffle(cbt.discard);
    cbt.draw.push(...cbt.discard);
    cbt.discard = [];
    saveRng(run, "shuffle", r);
    fireRelics(run, "onShuffle", {});
  }
  const top = cbt.draw.pop();
  if (!top) return;
  const t = needsTarget(top) ? aliveEnemies(run)[0] : undefined;
  playCardEffects(run, top, t, true);
  finishPlayedCard(run, top);
}

export function formatCardText(run: RunState, c: CardInst): { name: string; type: string; cost: string; text: string } {
  const def = cardDef(c.defId);
  const nums = baseNumbers(c);
  let dmg = nums.damage;
  if (c.defId === "Shiv" && run.combat && hasPower(run.player, "Accuracy")) dmg += getPower(run.player, "Accuracy")!.amount;
  if (run.combat) {
    const t =
      run.combat.monsters.find((m) => m.id === run.combat!.selectedTargetId && m.alive) ??
      run.combat.monsters.find((m) => m.alive);
    if (t && def.type === "attack") dmg = applyDamagePowers(dmg, run.player, t, run.combat.stance, run);
  }
  const blk = run.combat ? applyBlockPowers(nums.block, run.player) : nums.block;
  const lang = run.lang ?? "zhs";
  const raw =
    c.upgraded && def.upgradedDescription ? def.upgradedDescription[lang] ?? def.upgradedDescription.zhs : def.description[lang] ?? def.description.zhs;
  const text = raw
    .replace(/ NL /g, "\n")
    .replace(/!D!/g, String(dmg))
    .replace(/!B!/g, String(blk))
    .replace(/!M!/g, String(nums.magic))
    .replace(/#[yrgbp]/gi, "")
    // StS 能量图标标记：[R]红 [G]绿 [B]蓝 [E]通用 [W]白 → 彩色圆点（MiniCard 以 HTML 渲染 .ctext）
    .replace(/\[R\]/g, '<span class="e-ico r"></span>')
    .replace(/\[G\]/g, '<span class="e-ico g"></span>')
    .replace(/\[B\]/g, '<span class="e-ico b"></span>')
    .replace(/\[E\]/g, '<span class="e-ico e"></span>')
    .replace(/\[W\]/g, '<span class="e-ico w"></span>');
  const cost = currentCost(run, c);
  const costStr = cost === -1 ? "X" : cost === -2 ? "—" : String(cost);
  const nm = def.name[lang] ?? def.name.zhs;
  const name = (c.upgraded ? nm + "+" : nm) + (c.timesUpgraded > 1 ? `${c.timesUpgraded}` : "");
  return { name, type: def.type, cost: costStr, text };
}

export function selectCombatTarget(run: RunState, id: string | undefined): void {
  if (run.combat) run.combat.selectedTargetId = id;
}

bindCardRuntime((run, card, target) => playCardEffects(run, card, target), upgradeCardNow);
bindCombat({ addPower, dealDamage, gainBlock, makeCard, log });
bindRelics({
  addPower,
  dealDamage,
  gainBlock,
  makeCard,
  drawCards,
  channelOrb,
  upgradeCard,
  log,
});
bindPotions({
  addPower,
  dealDamage,
  gainBlock,
  makeCard,
  drawCards,
  channelOrb,
  upgradeCard,
  changeStance,
  playTopCard,
  pickPotion: () => "Block Potion",
});
bindActionHooks({
  damage: dealDamageNow,
  block: gainBlockNow,
  applyPower: addPowerNow,
  draw: drawCardsNow,
  shuffleDiscard: shuffleDiscardIntoDraw,
  discardAtEndOfTurn,
  preMonsterTurn,
  actMonster: monsterTakeTurn,
  rollMove,
  afterMonsters,
  heal: (run, who, amount) => (who.isPlayer ? healNow(run, amount) : 0),
  reducePower: (who, id, amount) => {
    const p = getPower(who, id);
    if (!p) return;
    p.amount -= amount;
    if (p.amount <= 0) who.powers = who.powers.filter((x) => x.id !== id);
  },
  removePower: (who, id) => {
    who.powers = who.powers.filter((x) => x.id !== id);
  },
  markTurnEnded: (ended) => {
    turnHasEnded = ended;
  },
  playQueued: playFromQueue,
  cardShouldExhaust: (run, card) => cardShouldExhaust(run, card),
  onUseCard: (run, card, action) => {
    fireRelics(run, "onUseCard", { card, target: action.target ?? undefined });
    if (hasPower(run.player, "Corruption") && cardDef(card.defId).type === "skill") action.exhaustCard = true;
  },
  onAfterUseCard: (run, card) => {
    const cbt = run.combat;
    if (!cbt) return;
    for (const em of aliveEnemies(run)) {
      const bod = getPower(em, "BeatOfDeath");
      if (bod) dealDamage(run, em, run.player, bod.amount, { hpLoss: true });
      const warp = getPower(em, "Time Warp");
      if (warp) {
        warp.extra = warp.extra ?? {};
        warp.extra.cards = Number(warp.extra.cards ?? 0) + 1;
        if (warp.extra.cards >= 12) {
          warp.extra.cards = 0;
          addPower(em, "Strength", 2);
          cbt.playerTurn = false;
        }
      }
    }
    void card;
  },
  finishCard: (run, card) => {
    finishPlayedCard(run, card);
    checkCombatEnd(run);
  },
});

