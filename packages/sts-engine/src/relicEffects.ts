/**
 * RelicLibrary combat/run hooks, ported from
 * com.megacrit.cardcrawl.relics.* (CFR of desktop-1.0.jar).
 */
import { HealAction, gameActions } from "./actions.js";
import { RELIC_CLASSES } from "./generated/relics.js";
import { CARDS, RELICS, cardDef, relicCanDrop } from "./catalog.js";
import { StsRandom } from "./rng.js";
import type {
  CardInst,
  Creature,
  OrbType,
  RelicInst,
  RunState,
  Stance,
} from "./types.js";

export type RelicHook =
  | "onEquip"
  | "atPreBattle"
  | "atBattleStartPreDraw"
  | "atBattleStart"
  | "atTurnStart"
  | "atTurnStartPostDraw"
  | "onPlayerEndTurn"
  | "onVictory"
  | "onUseCard"
  | "onPlayCard"
  | "onExhaust"
  | "onShuffle"
  | "wasHPLost"
  | "onMonsterDeath"
  | "onManualDiscard"
  | "onChangeStance"
  | "onObtainCard"
  | "onEnterRoom"
  | "onChestOpen"
  | "onUsePotion"
  | "onGainGold"
  | "onSpendGold"
  | "canPlay"
  | "atDamageModify"
  | "onAttackToChangeDamage"
  | "onAttacked"
  | "onLoseHpLast"
  | "onPlayerHeal"
  | "onBloodied";

export interface RelicCtx {
  card?: CardInst;
  amount?: number;
  target?: Creature;
  attacker?: Creature;
  hpLoss?: boolean;
  thorns?: boolean;
  room?: string;
  kind?: "monster" | "elite" | "boss";
  prevStance?: Stance;
  nextStance?: Stance;
  gold?: number;
  bossChest?: boolean;
}

export let rfx: {
  addPower: (who: Creature, id: string, amount: number, fromMonster?: boolean) => void;
  dealDamage: (
    run: RunState,
    attacker: Creature,
    target: Creature,
    base: number,
    opts?: { hpLoss?: boolean; vampire?: boolean },
  ) => number;
  gainBlock: (run: RunState, who: Creature, base: number) => void;
  makeCard: (run: RunState, defId: string, upgraded?: boolean) => CardInst;
  drawCards: (run: RunState, n: number) => CardInst[];
  channelOrb: (run: RunState, type: OrbType, n?: number) => void;
  upgradeCard: (c: CardInst) => void;
  log: (run: RunState, zhs: string, eng: string) => void;
};

export function bindRelics(b: typeof rfx): void {
  rfx = b;
}

export function hasRelic(run: RunState, id: string): boolean {
  return run.relics.some((x) => x.id === id);
}

export function relicOf(run: RunState, id: string): RelicInst | undefined {
  return run.relics.find((x) => x.id === id);
}

function flag(relic: RelicInst, key: string, value?: number): number {
  if (!relic.flags) relic.flags = {};
  if (value !== undefined) relic.flags[key] = value;
  return relic.flags[key] ?? 0;
}

function foes(run: RunState): Creature[] {
  return (run.combat?.monsters ?? []).filter((m) => m.alive);
}

function energy(run: RunState, n: number): void {
  if (run.combat) run.combat.energy += n;
}

function addToHand(run: RunState, card: CardInst): void {
  if (run.combat && run.combat.hand.length < 10) run.combat.hand.push(card);
}

function dmgAll(run: RunState, n: number): void {
  for (const m of foes(run)) rfx.dealDamage(run, run.player, m, n, { hpLoss: true });
}

function rng(run: RunState, name: string): StsRandom {
  return StsRandom.fromState(run.rng[name] ?? run.rng.misc!);
}

function saveRng(run: RunState, name: string, r: StsRandom): void {
  run.rng[name] = r.toState();
}

function heroColor(run: RunState): "red" | "green" | "blue" | "purple" {
  return { ironclad: "red", silent: "green", defect: "blue", watcher: "purple" }[run.character];
}

function isStrike(card: CardInst): boolean {
  const def = cardDef(card.defId);
  return def.tags.includes("strike") || /strike/i.test(def.name.eng) || /Strike/.test(card.defId);
}

function isStarterStrikeDefend(card: CardInst): boolean {
  return /^(Strike|Defend)_[RGBP]$/.test(card.defId);
}

function randomCombatCard(run: RunState, pred: (id: string) => boolean): string {
  const pool = CARDS.filter(
    (c) =>
      pred(c.id) &&
      c.rarity !== "basic" &&
      c.rarity !== "special" &&
      c.type !== "status" &&
      c.type !== "curse" &&
      c.color !== "curse",
  );
  const r = rng(run, "cardRandom");
  const pick = pool.length ? pool[r.nextInt(pool.length)]!.id : "Strike_R";
  saveRng(run, "cardRandom", r);
  return pick;
}

function randomCurse(run: RunState): string {
  const pool = CARDS.filter((c) => c.type === "curse" && c.id !== "AscendersBane" && c.id !== "CurseOfTheBell" && c.id !== "Necronomicurse");
  const r = rng(run, "cardRandom");
  const pick = pool.length ? pool[r.nextInt(pool.length)]!.id : "Injury";
  saveRng(run, "cardRandom", r);
  return pick;
}

function pickRelicId(run: RunState, tier: string): string {
  const owned = new Set(run.relics.map((x) => x.id));
  const color = heroColor(run);
  const use = RELICS.filter((x) => relicCanDrop(x, color, owned, tier));
  if (!use.length) return "Circlet";
  const r = rng(run, "relic");
  const id = use[r.nextInt(use.length)]!.id;
  saveRng(run, "relic", r);
  return id;
}

function shufflePick<T>(run: RunState, arr: T[], n: number): T[] {
  const copy = [...arr];
  const r = rng(run, "misc");
  r.shuffle(copy);
  saveRng(run, "misc", r);
  return copy.slice(0, n);
}

export function healNow(run: RunState, amount: number): number {
  amount = fireRelics(run, "onPlayerHeal", { amount });
  if (amount <= 0) return 0;
  const before = run.player.hp;
  run.player.hp = Math.min(run.player.maxHp, run.player.hp + amount);
  const gained = run.player.hp - before;
  checkBloodied(run);
  return gained;
}

export function healPlayer(run: RunState, amount: number): number {
  const action = new HealAction(run, run.player, amount);
  if (gameActions.isRunning) {
    action.update();
    return action.healed;
  }
  gameActions.addToBottom(action);
  gameActions.runUntilIdle();
  return action.healed;
}

export function increaseMaxHp(run: RunState, n: number, alsoHeal = true): void {
  run.player.maxHp += n;
  if (alsoHeal) healPlayer(run, n);
}

export function gainGold(run: RunState, n: number): void {
  if (n <= 0) return;
  if (hasRelic(run, "Ectoplasm")) return;
  run.gold += n;
  fireRelics(run, "onGainGold", { gold: n, amount: n });
}

export function spendGold(run: RunState, n: number): boolean {
  if (n <= 0) return true;
  if (run.gold < n) return false;
  run.gold -= n;
  fireRelics(run, "onSpendGold", { gold: n, amount: n });
  return true;
}

export function checkBloodied(run: RunState): void {
  const bloodied = run.player.hp <= run.player.maxHp / 2;
  fireRelics(run, "onBloodied", { amount: bloodied ? 1 : 0 });
}

function ensureMasters(run: RunState): void {
  if (run.energyMaster == null) run.energyMaster = 3;
  if (run.handSizeMaster == null) run.handSizeMaster = 5;
  if (run.masterMaxOrbs == null) run.masterMaxOrbs = run.character === "defect" ? 3 : 0;
}

export function fireRelics(run: RunState, hook: RelicHook, ctx: RelicCtx = {}): number {
  ensureMasters(run);
  let amount = ctx.amount ?? 0;
  for (const relic of run.relics) {
    amount = applyHook(run, relic, hook, { ...ctx, amount });
  }
  return amount;
}

export function onEquipRelic(run: RunState, relic: RelicInst): void {
  ensureMasters(run);
  applyHook(run, relic, "onEquip", {});
}

function applyHook(run: RunState, relic: RelicInst, hook: RelicHook, ctx: RelicCtx): number {
  const Ctor = RELIC_CLASSES[relic.id];
  if (Ctor) {
    const inst = new Ctor() as Record<string, (run: RunState, ctx: RelicCtx, relic: RelicInst) => number>;
    const fn = inst[hook];
    if (typeof fn === "function") return fn(run, ctx, relic);
  }
  return applyHookSwitch(run, relic, hook, ctx);
}

export function applyHookSwitch(run: RunState, relic: RelicInst, hook: RelicHook, ctx: RelicCtx): number {
  const id = relic.id;
  const cbt = run.combat;
  const p = run.player;
  let amount = ctx.amount ?? 0;
  const card = ctx.card;
  const def = card ? cardDef(card.defId) : undefined;

  switch (id) {
    case "TheAbacus":
      if (hook === "onShuffle") rfx.gainBlock(run, p, 6);
      break;

    case "Akabeko":
      if (hook === "atBattleStart") rfx.addPower(p, "Vigor", 8);
      break;

    case "Anchor":
      if (hook === "atBattleStart") rfx.gainBlock(run, p, 10);
      break;

    case "Ancient Tea Set":
      if (hook === "atPreBattle") flag(relic, "firstTurn", 1);
      if (hook === "atTurnStart" && flag(relic, "firstTurn")) {
        flag(relic, "firstTurn", 0);
        if (relic.counter === -2) {
          relic.counter = -1;
          energy(run, 2);
        }
      }
      break;

    case "Art of War":
      if (hook === "atPreBattle") {
        flag(relic, "firstTurn", 1);
        flag(relic, "gainEnergyNext", 1);
      }
      if (hook === "atTurnStart") {
        if (flag(relic, "gainEnergyNext") && !flag(relic, "firstTurn")) energy(run, 1);
        flag(relic, "firstTurn", 0);
        flag(relic, "gainEnergyNext", 1);
      }
      if (hook === "onUseCard" && def?.type === "attack") flag(relic, "gainEnergyNext", 0);
      if (hook === "onVictory") flag(relic, "gainEnergyNext", 0);
      break;

    case "Astrolabe":
      if (hook === "onEquip") {
        const picks = shufflePick(run, run.deck.filter((c) => cardDef(c.defId).rarity !== "curse"), 3);
        for (const c of picks) {
          const i = run.deck.indexOf(c);
          if (i < 0) continue;
          const next = randomCombatCard(run, () => true);
          run.deck[i] = rfx.makeCard(run, next);
          rfx.upgradeCard(run.deck[i]!);
        }
      }
      break;

    case "Bag of Marbles":
      if (hook === "atBattleStart") for (const m of foes(run)) rfx.addPower(m, "Vulnerable", 1);
      break;

    case "Bag of Preparation":
      if (hook === "atBattleStart") rfx.drawCards(run, 2);
      break;

    case "Bird Faced Urn":
      if (hook === "onUseCard" && def?.type === "power") healPlayer(run, 2);
      break;

    case "Black Blood":
      if (hook === "onVictory" && p.hp > 0) healPlayer(run, 12);
      break;

    case "Blood Vial":
      if (hook === "atBattleStart") healPlayer(run, 2);
      break;

    case "Bloody Idol":
      if (hook === "onGainGold") healPlayer(run, 5);
      break;

    case "Blue Candle":
      if (hook === "onUseCard" && def?.type === "curse" && card) {
        rfx.dealDamage(run, p, p, 1, { hpLoss: true });
        card.exhaustOnce = true;
      }
      break;

    case "Boot":
      if (hook === "onAttackToChangeDamage" && !ctx.hpLoss && !ctx.thorns && amount > 0 && amount < 5) return 5;
      break;

    case "Bottled Flame":
    case "Bottled Lightning":
    case "Bottled Tornado":
      if (hook === "onEquip") {
        const want = id === "Bottled Flame" ? "attack" : id === "Bottled Lightning" ? "skill" : "power";
        const c = run.deck.find((x) => cardDef(x.defId).type === want);
        if (c) c.bottled = id === "Bottled Flame" ? "flame" : id === "Bottled Lightning" ? "lightning" : "tornado";
      }
      break;

    case "Brimstone":
      if (hook === "atTurnStart") {
        rfx.addPower(p, "Strength", 2);
        for (const m of foes(run)) rfx.addPower(m, "Strength", 1);
      }
      break;

    case "Bronze Scales":
      if (hook === "atBattleStart") rfx.addPower(p, "Thorns", 3);
      break;

    case "Burning Blood":
      if (hook === "onVictory" && p.hp > 0) healPlayer(run, 6);
      break;

    case "Busted Crown":
    case "Coffee Dripper":
    case "Cursed Key":
    case "Ectoplasm":
    case "Fusion Hammer":
    case "Runic Dome":
    case "Sozu":
      if (hook === "onEquip") run.energyMaster = (run.energyMaster ?? 3) + 1;
      break;

    case "Calling Bell":
      if (hook === "onEquip") {
        run.deck.push(rfx.makeCard(run, "CurseOfTheBell"));
        for (const tier of ["common", "uncommon", "rare"] as const) {
          const rid = pickRelicId(run, tier);
          if (rid && rid !== id) {
            const inst: RelicInst = { id: rid, counter: 0 };
            run.relics.push(inst);
            onEquipRelic(run, inst);
          }
        }
      }
      break;

    case "CaptainsWheel":
      if (hook === "atBattleStart") {
        relic.counter = 0;
        relic.grayscale = false;
      }
      if (hook === "atTurnStart" && !relic.grayscale) {
        relic.counter += 1;
        if (relic.counter === 3) {
          rfx.gainBlock(run, p, 18);
          relic.counter = -1;
          relic.grayscale = true;
        }
      }
      if (hook === "onVictory") {
        relic.counter = -1;
        relic.grayscale = false;
      }
      break;

    case "Cauldron":
      if (hook === "onEquip") {
        /* five random potions as rewards — fill empty slots then leftover ignored */
        for (let i = 0; i < 5; i++) {
          const slot = run.potions.findIndex((x) => x === null);
          if (slot < 0) break;
          const pool = RELICS; // unused
          void pool;
          const pots = ["Fire Potion", "Block Potion", "Energy Potion", "Strength Potion", "Swift Potion"];
          run.potions[slot] = { id: pots[i % pots.length]! };
        }
      }
      break;

    case "Centennial Puzzle":
      if (hook === "atPreBattle") relic.usedThisCombat = false;
      if (hook === "wasHPLost" && amount > 0 && cbt && !relic.usedThisCombat) {
        relic.usedThisCombat = true;
        rfx.drawCards(run, 3);
      }
      break;

    case "CeramicFish":
      if (hook === "onObtainCard") gainGold(run, 9);
      break;

    case "Champion Belt":
      break;

    case "Charon's Ashes":
      if (hook === "onExhaust") dmgAll(run, 3);
      break;

    case "CloakClasp":
      if (hook === "onPlayerEndTurn" && cbt && cbt.hand.length) rfx.gainBlock(run, p, cbt.hand.length);
      break;

    case "ClockworkSouvenir":
      if (hook === "atBattleStart") rfx.addPower(p, "Artifact", 1);
      break;

    case "Cracked Core":
      if (hook === "atPreBattle") rfx.channelOrb(run, "lightning");
      break;

    case "CultistMask":
      if (hook === "atBattleStart") rfx.addPower(p, "Ritual", 1);
      break;

    case "Damaru":
      if (hook === "atTurnStart" && cbt) {
        cbt.mantra += 1;
        if (cbt.mantra >= 10) {
          cbt.mantra -= 10;
          /* stance change is handled by combat.changeStance via mantra elsewhere */
          flag(relic, "enterDivinity", 1);
        }
      }
      break;

    case "Darkstone Periapt":
      if (hook === "onObtainCard" && def?.type === "curse") increaseMaxHp(run, 6, true);
      break;

    case "DataDisk":
      if (hook === "atBattleStart") rfx.addPower(p, "Focus", 1);
      break;

    case "Dead Branch":
      if (hook === "onExhaust" && cbt && foes(run).length) {
        addToHand(run, rfx.makeCard(run, randomCombatCard(run, () => true)));
      }
      break;

    case "DollysMirror":
      if (hook === "onEquip" && run.deck[0]) {
        const src = run.deck[0]!;
        run.deck.push({ ...src, uid: `c${++run.uidSeq}` });
      }
      break;

    case "Yang":
      if (hook === "onUseCard" && def?.type === "attack") {
        rfx.addPower(p, "Dexterity", 1);
        rfx.addPower(p, "Lose Dexterity", 1);
      }
      break;

    case "Du-Vu Doll":
      if (hook === "onEquip") {
        relic.counter = run.deck.filter((c) => cardDef(c.defId).type === "curse").length;
      }
      if (hook === "atBattleStart" && relic.counter > 0) rfx.addPower(p, "Strength", relic.counter);
      break;

    case "Emotion Chip":
      if (hook === "wasHPLost" && amount > 0 && cbt) flag(relic, "pulse", 1);
      if (hook === "atTurnStart" && flag(relic, "pulse")) {
        flag(relic, "pulse", 0);
        for (const o of cbt?.orbs ?? []) {
          void o;
        }
        /* ImpulseAction: trigger all orbs passively — approximate as +1 energy per orb */
        if (cbt) energy(run, cbt.orbs.length);
      }
      if (hook === "onVictory") flag(relic, "pulse", 0);
      break;

    case "Empty Cage":
      if (hook === "onEquip") {
        const picks = shufflePick(
          run,
          run.deck.filter((c) => cardDef(c.defId).type !== "curse"),
          2,
        );
        run.deck = run.deck.filter((c) => !picks.includes(c));
      }
      break;

    case "Enchiridion":
      if (hook === "atPreBattle") {
        const idc = randomCombatCard(run, (cid) => cardDef(cid).type === "power");
        const made = rfx.makeCard(run, idc);
        made.freeOnce = true;
        addToHand(run, made);
      }
      break;

    case "Eternal Feather":
      if (hook === "onEnterRoom" && ctx.room === "rest") healPlayer(run, Math.floor(run.deck.length / 5) * 3);
      break;

    case "FaceOfCleric":
      if (hook === "onVictory") increaseMaxHp(run, 1, true);
      break;

    case "FossilizedHelix":
      if (hook === "atBattleStart") rfx.addPower(p, "Buffer", 1);
      break;

    case "FrozenCore":
      if (hook === "onPlayerEndTurn" && cbt && cbt.orbs.length < cbt.orbSlots) rfx.channelOrb(run, "frost");
      break;

    case "Frozen Egg 2":
      if (hook === "onObtainCard" && card && def?.type === "power" && !card.upgraded) rfx.upgradeCard(card);
      break;

    case "Gambling Chip":
      if (hook === "atTurnStartPostDraw" && cbt && cbt.turn === 1 && cbt.hand.length) {
        const n = cbt.hand.length;
        cbt.discard.push(...cbt.hand.splice(0));
        rfx.drawCards(run, n);
      }
      break;

    case "Girya":
      if (hook === "atBattleStart" && relic.counter > 0) rfx.addPower(p, "Strength", relic.counter);
      break;

    case "Gremlin Horn":
      if (hook === "onMonsterDeath" && foes(run).length) {
        energy(run, 1);
        rfx.drawCards(run, 1);
      }
      break;

    case "GremlinMask":
      if (hook === "atBattleStart") rfx.addPower(p, "Weakened", 1);
      break;

    case "Happy Flower":
      if (hook === "onEquip") relic.counter = 0;
      if (hook === "atTurnStart") {
        relic.counter = relic.counter === -1 ? 1 : relic.counter + 1;
        if (relic.counter === 3) {
          relic.counter = 0;
          energy(run, 1);
        }
      }
      break;

    case "HolyWater":
      if (hook === "atBattleStartPreDraw") {
        for (let i = 0; i < 3; i++) addToHand(run, rfx.makeCard(run, "Miracle"));
      }
      break;

    case "HornCleat":
      if (hook === "atBattleStart") {
        relic.counter = 0;
        relic.grayscale = false;
      }
      if (hook === "atTurnStart" && !relic.grayscale) {
        relic.counter += 1;
        if (relic.counter === 2) {
          rfx.gainBlock(run, p, 14);
          relic.counter = -1;
          relic.grayscale = true;
        }
      }
      if (hook === "onVictory") {
        relic.counter = -1;
        relic.grayscale = false;
      }
      break;

    case "HoveringKite":
      if (hook === "atTurnStart") flag(relic, "triggered", 0);
      if (hook === "onManualDiscard" && !flag(relic, "triggered")) {
        flag(relic, "triggered", 1);
        energy(run, 1);
      }
      break;

    case "Incense Burner":
      if (hook === "onEquip") relic.counter = 0;
      if (hook === "atTurnStart") {
        relic.counter = relic.counter === -1 ? 1 : relic.counter + 1;
        if (relic.counter === 6) {
          relic.counter = 0;
          rfx.addPower(p, "Intangible", 1);
        }
      }
      break;

    case "InkBottle":
      if (hook === "onUseCard") {
        relic.counter += 1;
        if (relic.counter === 10) {
          relic.counter = 0;
          rfx.drawCards(run, 1);
        }
      }
      break;

    case "Inserter":
      if (hook === "onEquip") relic.counter = 0;
      if (hook === "atTurnStart" && cbt) {
        relic.counter = relic.counter === -1 ? 1 : relic.counter + 1;
        if (relic.counter === 2) {
          relic.counter = 0;
          cbt.orbSlots += 1;
        }
      }
      break;

    case "Kunai":
      if (hook === "atTurnStart") relic.counter = 0;
      if (hook === "onVictory") relic.counter = -1;
      if (hook === "onUseCard" && def?.type === "attack") {
        relic.counter += 1;
        if (relic.counter % 3 === 0) {
          relic.counter = 0;
          rfx.addPower(p, "Dexterity", 1);
        }
      }
      break;

    case "Lantern":
      if (hook === "atPreBattle") flag(relic, "firstTurn", 1);
      if (hook === "atTurnStart" && flag(relic, "firstTurn")) {
        energy(run, 1);
        flag(relic, "firstTurn", 0);
      }
      break;

    case "Letter Opener":
      if (hook === "atTurnStart") relic.counter = 0;
      if (hook === "onVictory") relic.counter = -1;
      if (hook === "onUseCard" && def?.type === "skill") {
        relic.counter += 1;
        if (relic.counter % 3 === 0) {
          relic.counter = 0;
          dmgAll(run, 5);
        }
      }
      break;

    case "Lizard Tail":
      break;

    case "Magic Flower":
      if (hook === "onPlayerHeal" && cbt) return Math.round(amount * 1.5);
      break;

    case "Mango":
      if (hook === "onEquip") increaseMaxHp(run, 14, true);
      break;

    case "Mark of Pain":
      if (hook === "onEquip") run.energyMaster = (run.energyMaster ?? 3) + 1;
      if (hook === "atBattleStart" && cbt) {
        for (let i = 0; i < 2; i++) cbt.draw.push(rfx.makeCard(run, "Wound"));
      }
      break;

    case "Mark of the Bloom":
      if (hook === "onPlayerHeal") return 0;
      break;

    case "Matryoshka":
      if (hook === "onEquip" && relic.counter === 0) relic.counter = 2;
      break;

    case "MawBank":
      if (hook === "onEnterRoom" && relic.counter !== -2) gainGold(run, 12);
      if (hook === "onSpendGold" && relic.counter !== -2) relic.counter = -2;
      break;

    case "MealTicket":
      if (hook === "onEnterRoom" && ctx.room === "shop") healPlayer(run, 15);
      break;

    case "Meat on the Bone":
      if (hook === "onVictory" && p.hp > 0 && p.hp <= p.maxHp / 2) healPlayer(run, 12);
      break;

    case "Medical Kit":
      if (hook === "onUseCard" && def?.type === "status" && card) card.exhaustOnce = true;
      break;

    case "Melange":
      if (hook === "onShuffle") {
        /* Scry 3: peek and optionally discard — drop the bottom 0 as a no-op scry */
      }
      break;

    case "Mercury Hourglass":
      if (hook === "atTurnStart") dmgAll(run, 3);
      break;

    case "Molten Egg 2":
      if (hook === "onObtainCard" && card && def?.type === "attack" && !card.upgraded) rfx.upgradeCard(card);
      break;

    case "Mummified Hand":
      if (hook === "onUseCard" && def?.type === "power" && cbt) {
        const group = cbt.hand.filter((c) => {
          const cost = cardDef(c.defId).cost;
          return cost > 0 && !c.freeOnce;
        });
        if (group.length) {
          const r = rng(run, "cardRandom");
          const pick = group[r.nextInt(group.length)]!;
          saveRng(run, "cardRandom", r);
          pick.freeOnce = true;
        }
      }
      break;

    case "MutagenicStrength":
      if (hook === "atBattleStart") {
        rfx.addPower(p, "Strength", 3);
        rfx.addPower(p, "Lose Strength", 3);
      }
      break;

    case "Necronomicon":
      if (hook === "onEquip") run.deck.push(rfx.makeCard(run, "Necronomicurse"));
      if (hook === "atTurnStart") flag(relic, "activated", 1);
      if (hook === "onUseCard" && def?.type === "attack" && flag(relic, "activated") && card && cbt) {
        const cost = card.costOverride ?? cardDef(card.defId).cost;
        if (cost >= 2 || cost === -1) {
          flag(relic, "activated", 0);
          flag(relic, "replay", 1);
        }
      }
      break;

    case "NeowsBlessing":
      if (hook === "atBattleStart" && relic.counter > 0) {
        relic.counter -= 1;
        for (const m of foes(run)) {
          m.hp = 1;
        }
        if (relic.counter === 0) relic.counter = -2;
      }
      break;

    case "Ninja Scroll":
      if (hook === "atBattleStartPreDraw") {
        for (let i = 0; i < 3; i++) addToHand(run, rfx.makeCard(run, "Shiv"));
      }
      break;

    case "Nuclear Battery":
      if (hook === "atPreBattle") rfx.channelOrb(run, "plasma");
      break;

    case "Nunchaku":
      if (hook === "onUseCard" && def?.type === "attack") {
        relic.counter += 1;
        if (relic.counter % 10 === 0) {
          relic.counter = 0;
          energy(run, 1);
        }
      }
      break;

    case "Oddly Smooth Stone":
      if (hook === "atBattleStart") rfx.addPower(p, "Dexterity", 1);
      break;

    case "Old Coin":
      if (hook === "onEquip") gainGold(run, 300);
      break;

    case "OrangePellets":
      if (hook === "atTurnStart") {
        flag(relic, "atk", 0);
        flag(relic, "skl", 0);
        flag(relic, "pwr", 0);
      }
      if (hook === "onUseCard" && def) {
        if (def.type === "attack") flag(relic, "atk", 1);
        if (def.type === "skill") flag(relic, "skl", 1);
        if (def.type === "power") flag(relic, "pwr", 1);
        if (flag(relic, "atk") && flag(relic, "skl") && flag(relic, "pwr")) {
          p.powers = p.powers.filter((x) => !["Vulnerable", "Weakened", "Frail"].includes(x.id));
          flag(relic, "atk", 0);
          flag(relic, "skl", 0);
          flag(relic, "pwr", 0);
        }
      }
      break;

    case "Orichalcum":
      if (hook === "onPlayerEndTurn" && p.block === 0) rfx.gainBlock(run, p, 6);
      break;

    case "Ornamental Fan":
      if (hook === "atTurnStart") relic.counter = 0;
      if (hook === "onVictory") relic.counter = -1;
      if (hook === "onUseCard" && def?.type === "attack") {
        relic.counter += 1;
        if (relic.counter % 3 === 0) {
          relic.counter = 0;
          rfx.gainBlock(run, p, 4);
        }
      }
      break;

    case "Orrery":
      if (hook === "onEquip") {
        /* four extra card rewards — grant four random cards into the deck as a playable stand-in */
        for (let i = 0; i < 4; i++) run.deck.push(rfx.makeCard(run, randomCombatCard(run, () => true)));
      }
      break;

    case "Pandora's Box":
      if (hook === "onEquip") {
        const hits = run.deck.filter(isStarterStrikeDefend);
        for (const c of hits) {
          const i = run.deck.indexOf(c);
          if (i >= 0) run.deck[i] = rfx.makeCard(run, randomCombatCard(run, () => true));
        }
      }
      break;

    case "Pantograph":
      if (hook === "atBattleStart" && (ctx.kind === "boss" || foes(run).some((m) => (m.monsterId ?? "").includes("Boss") || m.maxHp >= 200))) {
        healPlayer(run, 25);
      }
      break;

    case "Pear":
      if (hook === "onEquip") increaseMaxHp(run, 10, true);
      break;

    case "Pen Nib":
      if (hook === "atBattleStart" && relic.counter === 9) rfx.addPower(p, "PenNib", 1);
      if (hook === "onUseCard" && def?.type === "attack") {
        relic.counter += 1;
        if (relic.counter === 10) relic.counter = 0;
        else if (relic.counter === 9) rfx.addPower(p, "PenNib", 1);
      }
      break;

    case "Philosopher's Stone":
      if (hook === "onEquip") run.energyMaster = (run.energyMaster ?? 3) + 1;
      if (hook === "atBattleStart") for (const m of foes(run)) rfx.addPower(m, "Strength", 1);
      break;

    case "Pocketwatch":
      if (hook === "atBattleStart") {
        relic.counter = 0;
        flag(relic, "firstTurn", 1);
      }
      if (hook === "atTurnStartPostDraw") {
        if (relic.counter <= 3 && !flag(relic, "firstTurn")) rfx.drawCards(run, 3);
        else flag(relic, "firstTurn", 0);
        relic.counter = 0;
      }
      if (hook === "onPlayCard") relic.counter += 1;
      if (hook === "onVictory") relic.counter = -1;
      break;

    case "Potion Belt":
      if (hook === "onEquip") {
        run.potionSlots += 2;
        run.potions.push(null, null);
      }
      break;

    case "PreservedInsect":
      if (hook === "atBattleStart" && ctx.kind === "elite") {
        for (const m of foes(run)) {
          m.hp = Math.max(1, Math.floor(m.maxHp * 0.75));
          m.maxHp = m.hp;
        }
      }
      break;

    case "PrismaticShard":
      if (hook === "onEquip" && run.character !== "defect" && (run.masterMaxOrbs ?? 0) === 0) run.masterMaxOrbs = 1;
      break;

    case "PureWater":
      if (hook === "atBattleStartPreDraw") addToHand(run, rfx.makeCard(run, "Miracle"));
      break;

    case "Red Mask":
      if (hook === "atBattleStart") for (const m of foes(run)) rfx.addPower(m, "Weakened", 1);
      break;

    case "Red Skull":
      if (hook === "atBattleStart") {
        flag(relic, "active", 0);
        if (p.hp <= p.maxHp / 2) {
          rfx.addPower(p, "Strength", 3);
          flag(relic, "active", 1);
        }
      }
      if (hook === "onBloodied") {
        if (amount && !flag(relic, "active") && cbt) {
          rfx.addPower(p, "Strength", 3);
          flag(relic, "active", 1);
        }
        if (!amount && flag(relic, "active") && cbt) {
          rfx.addPower(p, "Strength", -3);
          flag(relic, "active", 0);
        }
      }
      if (hook === "onVictory") flag(relic, "active", 0);
      break;

    case "Ring of the Serpent":
      if (hook === "onEquip") run.handSizeMaster = (run.handSizeMaster ?? 5) + 1;
      break;

    case "Ring of the Snake":
      if (hook === "atBattleStart") rfx.drawCards(run, 2);
      break;

    case "Runic Capacitor":
      if (hook === "atPreBattle") flag(relic, "firstTurn", 1);
      if (hook === "atTurnStart" && flag(relic, "firstTurn") && cbt) {
        cbt.orbSlots += 3;
        flag(relic, "firstTurn", 0);
      }
      break;

    case "Runic Cube":
      if (hook === "wasHPLost" && amount > 0 && cbt) rfx.drawCards(run, 1);
      break;

    case "Self Forming Clay":
      if (hook === "wasHPLost" && amount > 0 && cbt) rfx.addPower(p, "Next Turn Block", 3);
      break;

    case "Shuriken":
      if (hook === "atTurnStart") relic.counter = 0;
      if (hook === "onVictory") relic.counter = -1;
      if (hook === "onUseCard" && def?.type === "attack") {
        relic.counter += 1;
        if (relic.counter % 3 === 0) {
          relic.counter = 0;
          rfx.addPower(p, "Strength", 1);
        }
      }
      break;

    case "SlaversCollar":
      if (hook === "atPreBattle" && (ctx.kind === "elite" || ctx.kind === "boss")) {
        flag(relic, "pulse", 1);
        run.energyMaster = (run.energyMaster ?? 3) + 1;
        if (cbt) cbt.energyMax += 1;
      }
      if (hook === "onVictory" && flag(relic, "pulse")) {
        flag(relic, "pulse", 0);
        run.energyMaster = Math.max(3, (run.energyMaster ?? 3) - 1);
      }
      break;

    case "Sling":
      if (hook === "atBattleStart" && ctx.kind === "elite") rfx.addPower(p, "Strength", 2);
      break;

    case "Snecko Eye":
      if (hook === "onEquip") run.handSizeMaster = (run.handSizeMaster ?? 5) + 2;
      if (hook === "atPreBattle") rfx.addPower(p, "Confusion", 1);
      break;

    case "SsserpentHead":
      if (hook === "onEnterRoom" && ctx.room === "event") gainGold(run, 50);
      break;

    case "StoneCalendar":
      if (hook === "atBattleStart") relic.counter = 0;
      if (hook === "atTurnStart") {
        relic.counter += 1;
      }
      if (hook === "onPlayerEndTurn" && relic.counter === 7) {
        dmgAll(run, 52);
        relic.grayscale = true;
      }
      if (hook === "onVictory") {
        relic.counter = -1;
        relic.grayscale = false;
      }
      break;

    case "Strawberry":
      if (hook === "onEquip") increaseMaxHp(run, 7, true);
      break;

    case "StrikeDummy":
      if (hook === "atDamageModify" && card && isStrike(card)) return amount + 3;
      break;

    case "Sundial":
      if (hook === "onEquip") relic.counter = 0;
      if (hook === "onShuffle") {
        relic.counter += 1;
        if (relic.counter === 3) {
          relic.counter = 0;
          energy(run, 2);
        }
      }
      break;

    case "Symbiotic Virus":
      if (hook === "atPreBattle") rfx.channelOrb(run, "dark");
      break;

    case "TeardropLocket":
      if (hook === "atBattleStart") flag(relic, "enterCalm", 1);
      break;

    case "The Specimen":
      if (hook === "onMonsterDeath" && ctx.target) {
        const poison = ctx.target.powers.find((x) => x.id === "Poison");
        const live = foes(run);
        if (poison && live.length) rfx.addPower(live[0]!, "Poison", poison.amount);
      }
      break;

    case "Thread and Needle":
      if (hook === "atBattleStart") rfx.addPower(p, "Plated Armor", 4);
      break;

    case "Tingsha":
      if (hook === "onManualDiscard") {
        const live = foes(run);
        if (live.length) rfx.dealDamage(run, p, live[0]!, 3, { hpLoss: true });
      }
      break;

    case "Tiny Chest":
      if (hook === "onEquip") relic.counter = 0;
      break;

    case "Tiny House":
      if (hook === "onEquip") {
        gainGold(run, 50);
        increaseMaxHp(run, 5, true);
        const up = run.deck.find((c) => !c.upgraded && cardDef(c.defId).type !== "curse" && cardDef(c.defId).type !== "status");
        if (up) rfx.upgradeCard(up);
        const slot = run.potions.findIndex((x) => x === null);
        if (slot >= 0) run.potions[slot] = { id: "Block Potion" };
        const rid = pickRelicId(run, "common");
        if (rid) {
          const inst: RelicInst = { id: rid, counter: 0 };
          run.relics.push(inst);
          onEquipRelic(run, inst);
        }
      }
      break;

    case "Toolbox":
      if (hook === "atBattleStartPreDraw") {
        const idc = randomCombatCard(run, (cid) => cardDef(cid).color === "colorless");
        addToHand(run, rfx.makeCard(run, idc));
      }
      break;

    case "Torii":
      if (hook === "onAttacked" && !ctx.hpLoss && !ctx.thorns && amount > 1 && amount <= 5) return 1;
      break;

    case "Tough Bandages":
      if (hook === "onManualDiscard") rfx.gainBlock(run, p, 3);
      break;

    case "Toxic Egg 2":
      if (hook === "onObtainCard" && card && def?.type === "skill" && !card.upgraded) rfx.upgradeCard(card);
      break;

    case "Toy Ornithopter":
      if (hook === "onUsePotion") healPlayer(run, 5);
      break;

    case "TungstenRod":
      if (hook === "onLoseHpLast" && amount > 0) return amount - 1;
      break;

    case "TwistedFunnel":
      if (hook === "atBattleStart") for (const m of foes(run)) rfx.addPower(m, "Poison", 4);
      break;

    case "Unceasing Top":
      if (hook === "atPreBattle") flag(relic, "canDraw", 0);
      if (hook === "atTurnStart") flag(relic, "canDraw", 1);
      break;

    case "Vajra":
      if (hook === "atBattleStart") rfx.addPower(p, "Strength", 1);
      break;

    case "Velvet Choker":
      if (hook === "onEquip") run.energyMaster = (run.energyMaster ?? 3) + 1;
      if (hook === "atBattleStart" || hook === "atTurnStart") relic.counter = 0;
      if (hook === "onVictory") relic.counter = -1;
      if (hook === "onPlayCard" && relic.counter < 6) relic.counter += 1;
      if (hook === "canPlay" && relic.counter >= 6) return 0;
      break;

    case "VioletLotus":
      if (hook === "onChangeStance" && ctx.prevStance === "calm" && ctx.nextStance !== "calm") energy(run, 1);
      break;

    case "Lee's Waffle":
      if (hook === "onEquip") {
        increaseMaxHp(run, 7, false);
        p.hp = p.maxHp;
      }
      break;

    case "War Paint":
      if (hook === "onEquip") {
        const skills = run.deck.filter((c) => cardDef(c.defId).type === "skill" && !c.upgraded);
        for (const c of shufflePick(run, skills, 2)) rfx.upgradeCard(c);
      }
      break;

    case "WarpedTongs":
      if (hook === "atTurnStartPostDraw" && cbt) {
        const up = cbt.hand.find((c) => !c.upgraded && cardDef(c.defId).type !== "status" && cardDef(c.defId).type !== "curse");
        if (up) rfx.upgradeCard(up);
      }
      break;

    case "Whetstone":
      if (hook === "onEquip") {
        const atks = run.deck.filter((c) => cardDef(c.defId).type === "attack" && !c.upgraded);
        for (const c of shufflePick(run, atks, 2)) rfx.upgradeCard(c);
      }
      break;

    case "WristBlade":
      if (hook === "atDamageModify" && card) {
        const cost = card.freeOnce ? 0 : (card.costOverride ?? cardDef(card.defId).cost);
        if (cost === 0) return amount + 4;
      }
      break;

    default:
      break;
  }
  return amount;
}

export function relicCanPlay(run: RunState, card: CardInst): boolean {
  const choker = relicOf(run, "Velvet Choker");
  if (choker && choker.counter >= 6) return false;
  void card;
  return true;
}

export function maybeUnceasingTop(run: RunState): void {
  const top = relicOf(run, "Unceasing Top");
  const cbt = run.combat;
  if (!top || !cbt || !cbt.playerTurn) return;
  if (cbt.hand.length) return;
  if (!cbt.draw.length && !cbt.discard.length) return;
  if (!flag(top, "canDraw")) return;
  rfx.drawCards(run, 1);
}

export function tryLizardTail(run: RunState): boolean {
  const tail = relicOf(run, "Lizard Tail");
  if (!tail || tail.counter === -2) return false;
  tail.counter = -2;
  tail.grayscale = true;
  run.player.alive = true;
  run.player.hp = Math.max(1, Math.floor(run.player.maxHp / 2));
  if (run.combat) {
    run.combat.defeat = false;
    run.over = undefined;
    run.screen = "combat";
  }
  return true;
}
