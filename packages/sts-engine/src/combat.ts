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

export function upgradeCard(c: CardInst): void {
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

export function addPower(who: Creature, id: string, amount: number, fromMonster = false): void {
  if (amount === 0) return;
  if (amount < 0 && hasPower(who, "Artifact")) {
    addPower(who, "Artifact", -1);
    return;
  }
  const existing = getPower(who, id);
  if (existing) {
    existing.amount += amount;
    if (existing.amount === 0) who.powers = who.powers.filter((p) => p.id !== id);
    return;
  }
  if (amount < 0 && (id === "Strength" || id === "Dexterity")) {
    who.powers.push({ id, amount, justApplied: fromMonster });
    return;
  }
  if (amount < 0) return;
  const turnBased = ["Vulnerable", "Weakened", "Frail", "Lose Strength"].includes(id);
  who.powers.push({ id, amount, justApplied: fromMonster && turnBased });
}

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

/** GameActionManager-style queue: addToBot appends, addToTop prepends. */
const actionQ: Array<() => void> = [];
export function addToBot(fn: () => void): void {
  actionQ.push(fn);
}
export function addToTop(fn: () => void): void {
  actionQ.unshift(fn);
}
export function flushActions(): void {
  let guard = 0;
  while (actionQ.length && guard++ < 400) {
    const fn = actionQ.shift();
    fn?.();
  }
  actionQ.length = 0;
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
}

/** DamageInfo.applyPowers for a player or monster NORMAL attack. */
export function applyDamagePowers(base: number, attacker: Creature, target: Creature, stance: Stance = "none"): number {
  let tmp = Math.fround(base);
  for (const p of attacker.powers) {
    if (p.id === "Strength") tmp = Math.fround(tmp + p.amount);
    if (p.id === "Weakened") tmp = Math.fround(tmp * 0.75);
    if (p.id === "Vigor" && attacker.isPlayer) tmp = Math.fround(tmp + p.amount);
    if (p.id === "Angry" && attacker.isPlayer === false) {
      /* Angry is on-hit, not a multiplier */
    }
  }
  if (attacker.isPlayer && stance === "wrath") tmp = Math.fround(tmp * 2);
  if (attacker.isPlayer && stance === "divinity") tmp = Math.fround(tmp * 3);
  if (!attacker.isPlayer && target.isPlayer && stance === "wrath") tmp = Math.fround(tmp * 2);
  for (const p of target.powers) {
    if (p.id === "Vulnerable") tmp = Math.fround(tmp * 1.5);
  }
  if (!attacker.isPlayer && target.isPlayer && hasPower(target, "Surrounded")) tmp = Math.fround(tmp * 1.5);
  return Math.max(0, froundFloor(tmp));
}

export function applyBlockPowers(base: number, who: Creature): number {
  let tmp = Math.fround(base);
  const dex = getPower(who, "Dexterity");
  if (dex) tmp = Math.fround(tmp + dex.amount);
  if (hasPower(who, "Frail")) tmp = Math.fround(tmp * 0.75);
  return Math.max(0, froundFloor(tmp));
}

export function dealDamage(
  run: RunState,
  attacker: Creature,
  target: Creature,
  base: number,
  opts: { hpLoss?: boolean; vampire?: boolean } = {},
): number {
  if (!target.alive) return 0;
  const stance = run.combat?.stance ?? "none";
  let dmg = opts.hpLoss ? base : applyDamagePowers(base, attacker, target, stance);
  if (hasPower(target, "Intangible")) dmg = Math.min(dmg, 1);

  const thorns = getPower(target, "Thorns") ?? getPower(target, "Flame Barrier") ?? getPower(target, "Sharp Hide");
  const flame = getPower(target, "Flame Barrier");
  const sharp = getPower(target, "Sharp Hide");

  let hpDmg = dmg;
  if (!opts.hpLoss && target.block > 0) {
    const blocked = Math.min(target.block, hpDmg);
    target.block -= blocked;
    hpDmg -= blocked;
  }
  const invincible = !target.isPlayer ? getPower(target, "Invincible") : undefined;
  if (invincible) {
    const lost = Number(target.misc.hpLostThisTurn ?? 0);
    if (lost >= invincible.amount) hpDmg = 0;
    else hpDmg = Math.min(hpDmg, invincible.amount - lost);
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
    } else {
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
          // shift to defensive: gain 20 block, set misc
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

function die(run: RunState, who: Creature, killer?: Creature): void {
  if (!who.alive) return;
  who.alive = false;
  who.hp = 0;
  who.block = 0;
  const spore = getPower(who, "Spore Cloud");
  if (spore && killer?.isPlayer) addPower(run.player, "Vulnerable", spore.amount);
  if (who.misc.split || who.monsterId === "SlimeBoss" || who.monsterId === "AcidSlime_L" || who.monsterId === "SpikeSlime_L") {
    addToBot(() => splitSlime(run, who));
  }
  log(run, `${who.name.zhs} 倒下了`, `${who.name.eng} dies`);
  if (who.isPlayer) {
    const fairy = run.potions.findIndex((p) => p?.id === "FairyPotion" || p?.id === "Fairy Potion");
    if (fairy >= 0) {
      who.alive = true;
      who.hp = Math.max(1, Math.floor(who.maxHp * 0.3));
      run.potions[fairy] = null;
      log(run, "瓶中精灵复活了你", "Fairy in a Bottle revives you");
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

export function gainBlock(run: RunState, who: Creature, base: number): void {
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

export function drawCards(run: RunState, n: number): CardInst[] {
  if (hasPower(run.player, "No Draw")) return [];
  const cbt = run.combat!;
  const drawn: CardInst[] = [];
  for (let i = 0; i < n; i++) {
    if (cbt.hand.length >= 10) break;
    if (cbt.draw.length === 0) {
      if (cbt.discard.length === 0) break;
      const r = rng(run, "shuffle");
      r.shuffle(cbt.discard);
      cbt.draw.push(...cbt.discard);
      cbt.discard = [];
      saveRng(run, "shuffle", r);
    }
    const card = cbt.draw.pop()!;
    cbt.hand.push(card);
    drawn.push(card);
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
  return drawn;
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
          dealDamage(run, run.player, m, base, { vampire: op.vampire });
        } else {
          for (const m of foes) {
            if (m.alive) dealDamage(run, run.player, m, base, { vampire: op.vampire });
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
      for (const d of dests) addPower(d, op.id, amt, false);
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
      run.player.hp = Math.min(run.player.maxHp, run.player.hp + resolveAmt(op.amount, nums, run, 1));
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
  const def = cardDef(card.defId);
  if (needsTarget(card) && !targetId) return;
  const target = targetId ? cbt.monsters.find((m) => m.id === targetId && m.alive) : undefined;
  if (needsTarget(card) && !target) return;

  const cost = currentCost(run, card);
  if (cost > 0) cbt.energy -= cost;
  if (cost === -1) {
    /* X-cost spends inside custom (0 energy is a legal play: 0 hits) */
  }
  if (target) cbt.selectedTargetId = target.id;
  card.freeOnce = false;
  cbt.hand.splice(handIndex, 1);
  cbt.cardsPlayedThisTurn += 1;
  if (def.type === "attack") cbt.attacksPlayedThisTurn += 1;
  if (def.type === "skill") cbt.skillsPlayedThisTurn += 1;

  playCardEffects(run, card, target);

  const dt = getPower(run.player, "Double Tap");
  if (dt && def.type === "attack" && (cbt.extraAttackPlays ?? 0) < dt.amount) {
    cbt.extraAttackPlays = (cbt.extraAttackPlays ?? 0) + 1;
    playCardEffects(run, card, target, true);
  }

  // Beat of Death: every card played costs the player HP (Corrupt Heart)
  for (const em of aliveEnemies(run)) {
    const bod = getPower(em, "BeatOfDeath");
    if (bod) dealDamage(run, em, run.player, bod.amount, { hpLoss: true });
  }

  if (cbt.pending) {
    cbt.limbo = card;
    return;
  }
  finishPlayedCard(run, card);
  flushActions();
  checkCombatEnd(run);
}

function finishPlayedCard(run: RunState, card: CardInst): void {
  const cbt = run.combat!;
  const def = cardDef(card.defId);
  const exhaust = def.exhaust || (card.upgraded && def.upgrade.exhaust === true) || (hasPower(run.player, "Corruption") && def.type === "skill");
  // Limit Break upgraded: exhaust false
  const reallyExhaust = card.defId === "Limit Break" && card.upgraded ? false : exhaust;
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
    if (h) cbt.discard.push(h);
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

function tickDebuffs(who: Creature): void {
  for (const p of [...who.powers]) {
    if (!["Vulnerable", "Weakened", "Frail", "Lose Strength"].includes(p.id)) continue;
    if (p.justApplied) {
      p.justApplied = false;
      continue;
    }
    if (p.id === "Lose Strength") {
      addPower(who, "Strength", -p.amount);
      who.powers = who.powers.filter((x) => x.id !== "Lose Strength");
      continue;
    }
    p.amount -= 1;
    if (p.amount <= 0) who.powers = who.powers.filter((x) => x !== p);
  }
}

export function endTurn(run: RunState): void {
  const cbt = run.combat!;
  if (!cbt.playerTurn || cbt.pending) return;
  for (const h of [...cbt.hand]) {
    const e = effectOf(h.defId);
    if (e.onEndOfTurnInHand) runOps(run, h, e.onEndOfTurnInHand, undefined);
  }
  const keep: CardInst[] = [];
  for (const h of cbt.hand) {
    const def = cardDef(h.defId);
    const ethereal = def.ethereal || (h.upgraded && def.upgrade.ethereal);
    const retain = def.retain || (h.upgraded && def.upgrade.retain);
    if (ethereal) {
      cbt.exhaust.push(h);
      onExhaust(run, h);
    } else if (retain) keep.push(h);
    else cbt.discard.push(h);
  }
  cbt.hand = keep;

  const combust = getPower(run.player, "Combust");
  if (combust) {
    dealDamage(run, run.player, run.player, 1, { hpLoss: true });
    for (const m of aliveEnemies(run)) dealDamage(run, run.player, m, combust.amount, { hpLoss: true });
  }
  const brutality = hasPower(run.player, "Brutality");
  void brutality;

  cbt.playerTurn = false;
  for (const m of [...cbt.monsters]) {
    if (!m.alive) continue;
    const poison = getPower(m, "Poison");
    if (poison && poison.amount > 0) {
      dealDamage(run, m, m, poison.amount, { hpLoss: true });
      poison.amount -= 1;
      if (poison.amount <= 0) m.powers = m.powers.filter((p) => p.id !== "Poison");
    }
    if (!m.alive) continue;
    monsterTakeTurn(run, m);
    if (m.alive && !m.misc.skipRoll) rollMove(run, m);
    m.misc.skipRoll = 0;
    if (cbt.defeat) return;
  }
  flushActions();
  if (cbt.stance === "divinity") changeStance(run, "none");
  startPlayerTurn(run);
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
  if (!hasPower(run.player, "Barricade") && !hasPower(run.player, "Blur")) run.player.block = 0;
  if (hasPower(run.player, "Blur")) run.player.powers = run.player.powers.filter((p) => p.id !== "Blur");
  tickDebuffs(run.player);
  for (const m of cbt.monsters) if (m.alive) tickDebuffs(m);
  for (const m of cbt.monsters) m.misc.hpLostThisTurn = 0;

  cbt.energy = cbt.energyMax;
  const nte = getPower(run.player, "Next Turn Energy");
  if (nte) {
    cbt.energy += nte.amount;
    run.player.powers = run.player.powers.filter((p) => p.id !== "Next Turn Energy");
  }
  if (hasPower(run.player, "Berserk")) cbt.energy += getPower(run.player, "Berserk")!.amount;
  if (hasPower(run.player, "Demon Form")) addPower(run.player, "Strength", getPower(run.player, "Demon Form")!.amount);
  if (hasPower(run.player, "Metallicize")) gainBlock(run, run.player, getPower(run.player, "Metallicize")!.amount);
  if (hasPower(run.player, "Brutality")) {
    dealDamage(run, run.player, run.player, 1, { hpLoss: true });
    drawCards(run, 1);
  }
  const ritual = getPower(run.player, "Ritual");
  if (ritual) addPower(run.player, "Strength", ritual.amount);
  for (const m of cbt.monsters) {
    if (!m.alive) continue;
    const r = getPower(m, "Ritual");
    if (r && cbt.turn > 1) addPower(m, "Strength", r.amount);
    if (hasPower(m, "Metallicize")) gainBlock(run, m, getPower(m, "Metallicize")!.amount);
    if (!hasPower(m, "Barricade") && !m.misc.keepBlock) m.block = 0;
  }

  // relics: lantern first turn
  if (cbt.turn === 1 && run.relics.some((r) => r.id === "Lantern")) cbt.energy += 1;
  if (cbt.turn === 1 && run.relics.some((r) => r.id === "Anchor")) gainBlock(run, run.player, 10);
  if (cbt.turn === 1 && run.relics.some((r) => r.id === "Vajra")) addPower(run.player, "Strength", 1);
  if (cbt.turn === 1 && run.relics.some((r) => r.id === "Oddly Smooth Stone")) addPower(run.player, "Dexterity", 1);
  if (cbt.turn === 1 && run.relics.some((r) => r.id === "Akabeko")) addPower(run.player, "Vigor", 8);
  if (cbt.turn === 1 && run.relics.some((r) => r.id === "Bronze Scales")) addPower(run.player, "Thorns", 3);
  if (cbt.turn === 1 && run.relics.some((r) => r.id === "Cracked Core")) channelOrb(run, "lightning");
  if (hasPower(run.player, "Like Water") && cbt.stance === "calm") {
    gainBlock(run, run.player, getPower(run.player, "Like Water")!.amount);
  }
  if (hasPower(run.player, "Noxious Fumes")) {
    for (const m of aliveEnemies(run)) addPower(m, "Poison", getPower(run.player, "Noxious Fumes")!.amount);
  }
  if (hasPower(run.player, "Infinite Blades")) {
    const shiv = makeCard(run, "Shiv");
    if (cbt.hand.length < 10) cbt.hand.push(shiv);
  }
  if (hasPower(run.player, "Storm")) channelOrb(run, "lightning");
  if (hasPower(run.player, "Devotion")) {
    cbt.mantra += getPower(run.player, "Devotion")!.amount;
    if (cbt.mantra >= 10) {
      cbt.mantra -= 10;
      changeStance(run, "divinity");
    }
  }
  if (hasPower(run.player, "Blur")) {
    /* keep block this turn — skip the earlier clear? already cleared. Blur keeps next turn. */
  }
  if (!hasPower(run.player, "Barricade") && !hasPower(run.player, "Blur")) {
    /* block already cleared */
  } else if (hasPower(run.player, "Blur")) {
    /* Blur: block was already wiped — apply at end of previous turn instead. */
  }
  passiveOrbs(run);
  drawCards(run, 5);
  if (cbt.turn === 1 && run.relics.some((r) => r.id === "Bag of Preparation")) drawCards(run, 2);
  if (cbt.turn === 1 && run.relics.some((r) => r.id === "Ring of the Snake")) drawCards(run, 2);
  if (cbt.turn === 1 && run.relics.some((r) => r.id === "PureWater")) {
    const m = makeCard(run, "Miracle");
    if (cbt.hand.length < 10) cbt.hand.push(m);
  }
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
    if (cardDef(c.defId).innate || (c.upgraded && cardDef(c.defId).upgrade.innate)) placeOnTop.push(c);
    else pile.push(c);
  }
  pile.push(...placeOnTop);

  run.player.block = 0;
  run.player.powers = [];
  run.combat = {
    draw: pile,
    hand: [],
    discard: [],
    exhaust: [],
    monsters,
    energy: 3,
    energyMax: 3,
    turn: 0,
    playerTurn: true,
    cardsPlayedThisTurn: 0,
    attacksPlayedThisTurn: 0,
    skillsPlayedThisTurn: 0,
    extraAttackPlays: 0,
    orbs: [],
    orbSlots: run.character === "defect" ? 3 : 0,
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
  startPlayerTurn(run);
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
    if (t && def.type === "attack") dmg = applyDamagePowers(dmg, run.player, t, run.combat.stance);
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

bindCombat({ addPower, dealDamage, gainBlock, makeCard, log });

