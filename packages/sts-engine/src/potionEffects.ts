/**
 * AbstractPotion.use / getPotency, ported from
 * com.megacrit.cardcrawl.potions.* (CFR of desktop-1.0.jar).
 * SacredBark doubles potency via AbstractPotion.getPotency().
 */
import { CARDS, POTIONS, cardDef } from "./catalog.js";
import { POTION_CLASSES } from "./generated/potions.js";
import { hasRelic, healPlayer, increaseMaxHp } from "./relicEffects.js";
import { StsRandom } from "./rng.js";
import type { CardInst, Creature, OrbType, RunState } from "./types.js";

export let pfx: {
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
  changeStance: (run: RunState, next: "none" | "calm" | "wrath" | "divinity") => void;
  playTopCard: (run: RunState) => void;
  pickPotion: (run: RunState) => string;
};

export function bindPotions(b: typeof pfx): void {
  pfx = b;
}

export function bindPickPotion(fn: (run: RunState) => string): void {
  if (pfx) pfx.pickPotion = fn;
}

const BASE_POTENCY: Record<string, number> = {
  Ambrosia: 2,
  "Ancient Potion": 1,
  AttackPotion: 1,
  BlessingOfTheForge: 0,
  "Block Potion": 12,
  BloodPotion: 20,
  BottledMiracle: 2,
  ColorlessPotion: 1,
  CultistPotion: 1,
  CunningPotion: 3,
  "Dexterity Potion": 2,
  DistilledChaos: 3,
  DuplicationPotion: 1,
  ElixirPotion: 0,
  "Energy Potion": 2,
  EntropicBrew: 0,
  EssenceOfDarkness: 1,
  EssenceOfSteel: 4,
  "Explosive Potion": 10,
  FairyPotion: 30,
  FearPotion: 3,
  "Fire Potion": 20,
  FocusPotion: 2,
  "Fruit Juice": 5,
  GamblersBrew: 0,
  GhostInAJar: 1,
  HeartOfIron: 6,
  LiquidBronze: 3,
  LiquidMemories: 1,
  "Poison Potion": 6,
  PotionOfCapacity: 2,
  PowerPotion: 1,
  "Regen Potion": 5,
  SkillPotion: 1,
  SmokeBomb: 0,
  SneckoOil: 5,
  SpeedPotion: 5,
  StancePotion: 0,
  SteroidPotion: 5,
  "Strength Potion": 2,
  "Swift Potion": 3,
  "Weak Potion": 3,
};

const TARGET_REQUIRED = new Set([
  "Fire Potion",
  "Explosive Potion",
  "FearPotion",
  "Poison Potion",
  "Weak Potion",
]);

export function potionTargetRequired(id: string): boolean {
  const rec = POTIONS.find((p) => p.id === id);
  if (rec && "targetRequired" in rec && Boolean((rec as { targetRequired?: boolean }).targetRequired)) return true;
  return TARGET_REQUIRED.has(id);
}

export function potionPotency(run: RunState, id: string): number {
  let n = BASE_POTENCY[id] ?? 0;
  if (id === "EntropicBrew") n = run.potionSlots;
  if (hasRelic(run, "SacredBark") && n > 0) n *= 2;
  return n;
}

/**
 * Jar FontHelper codes: `#y` yellow keyword, `#b` blue number.
 * CunningPotion.initializeData builds DESCRIPTIONS[0] + potency + DESCRIPTIONS[1],
 * so localization is "增加 #b" + 3 + " 张 #y小刀+". The extractor joined the halves
 * without the number, which is why the UI showed a raw `#`.
 */
export function formatPotionText(id: string, lang: "zhs" | "eng" = "zhs", run?: RunState): string {
  const def = POTIONS.find((p) => p.id === id);
  const raw = def?.description?.[lang] ?? def?.description?.zhs ?? "";
  const pot = run ? potionPotency(run, id) : (BASE_POTENCY[id] ?? 0);
  return formatStsLoc(raw, pot);
}

export function formatStsLoc(raw: string, insertNumber = 0): string {
  let s = raw.replace(/ NL /g, "\n");
  s = s.replace(/#b(?!\d)/g, String(insertNumber));
  s = s.replace(/#b(\d+)/g, "$1");
  s = s.replace(/#[yrgp]/g, "");
  return s.replace(/[ \t]{2,}/g, " ").trim();
}

function addToHand(run: RunState, card: CardInst): void {
  if (run.combat && run.combat.hand.length < 10) run.combat.hand.push(card);
}

function randomOfType(run: RunState, type: string, colorless = false): string {
  const pool = CARDS.filter(
    (c) =>
      (colorless ? c.color === "colorless" : c.type === type) &&
      c.rarity !== "basic" &&
      c.rarity !== "special" &&
      c.type !== "status" &&
      c.type !== "curse",
  );
  const r = StsRandom.fromState(run.rng.cardRandom ?? run.rng.misc!);
  const id = pool.length ? pool[r.nextInt(pool.length)]!.id : "Strike_R";
  run.rng.cardRandom = r.toState();
  return id;
}

function discovery(run: RunState, type: string, n: number, colorless = false): void {
  for (let i = 0; i < n; i++) {
    const made = pfx.makeCard(run, randomOfType(run, type, colorless));
    made.freeOnce = true;
    addToHand(run, made);
  }
}

/** Returns false if the potion should not be consumed (FairyPotion while alive). */
export function usePotionEffect(run: RunState, id: string, targetId?: string): boolean {
  const Ctor = POTION_CLASSES[id];
  if (Ctor) return new Ctor().use(run, targetId);
  return usePotionSwitch(run, id, targetId);
}

export function usePotionSwitch(run: RunState, id: string, targetId?: string): boolean {
  const pot = potionPotency(run, id);
  const cbt = run.combat;
  const target = targetId
    ? cbt?.monsters.find((m) => m.id === targetId && m.alive)
    : cbt?.monsters.find((m) => m.alive);

  if (!cbt) {
    if (potionTargetRequired(id)) return false;
    if (id === "BloodPotion" || id === "Blood Potion") {
      healPlayer(run, Math.floor(run.player.maxHp * (pot / 100)));
      return true;
    }
    if (id === "Fruit Juice") {
      increaseMaxHp(run, pot, true);
      return true;
    }
    if (id === "EntropicBrew") {
      for (let i = 0; i < run.potionSlots; i++) {
        if (!run.potions[i]) run.potions[i] = { id: pfx.pickPotion(run) };
      }
      return true;
    }
    return true;
  }

  switch (id) {
    case "Fire Potion":
      if (target) pfx.dealDamage(run, run.player, target, pot, { hpLoss: true });
      break;
    case "Explosive Potion":
      for (const m of cbt.monsters.filter((x) => x.alive)) pfx.dealDamage(run, run.player, m, pot, { hpLoss: true });
      break;
    case "Block Potion":
      pfx.gainBlock(run, run.player, pot);
      break;
    case "Strength Potion":
      pfx.addPower(run.player, "Strength", pot);
      break;
    case "SteroidPotion":
      pfx.addPower(run.player, "Strength", pot);
      break;
    case "Dexterity Potion":
      pfx.addPower(run.player, "Dexterity", pot);
      break;
    case "SpeedPotion":
      pfx.addPower(run.player, "Dexterity", pot);
      break;
    case "Energy Potion":
      cbt.energy += pot;
      break;
    case "BloodPotion":
    case "Blood Potion":
      healPlayer(run, Math.floor(run.player.maxHp * (pot / 100)));
      break;
    case "Fruit Juice":
      increaseMaxHp(run, pot, true);
      break;
    case "Swift Potion":
      pfx.drawCards(run, pot);
      break;
    case "Weak Potion":
      if (target) pfx.addPower(target, "Weakened", pot);
      break;
    case "FearPotion":
    case "Fear Potion":
      if (target) pfx.addPower(target, "Vulnerable", pot);
      break;
    case "Poison Potion":
      if (target) pfx.addPower(target, "Poison", pot);
      break;
    case "Ancient Potion":
      pfx.addPower(run.player, "Artifact", pot);
      break;
    case "EssenceOfSteel":
      pfx.addPower(run.player, "Plated Armor", pot);
      break;
    case "LiquidBronze":
      pfx.addPower(run.player, "Thorns", pot);
      break;
    case "FocusPotion":
      pfx.addPower(run.player, "Focus", pot);
      break;
    case "PotionOfCapacity":
      cbt.orbSlots += pot;
      break;
    case "EssenceOfDarkness":
      for (let i = 0; i < cbt.orbSlots; i++) pfx.channelOrb(run, "dark", pot);
      break;
    case "Ambrosia":
      pfx.changeStance(run, "divinity");
      break;
    case "StancePotion":
      pfx.changeStance(run, cbt.stance === "calm" ? "wrath" : "calm");
      break;
    case "BottledMiracle":
      for (let i = 0; i < pot; i++) addToHand(run, pfx.makeCard(run, "Miracle"));
      break;
    case "BlessingOfTheForge":
      for (const h of cbt.hand) pfx.upgradeCard(h);
      break;
    case "AttackPotion":
      discovery(run, "attack", pot);
      break;
    case "SkillPotion":
      discovery(run, "skill", pot);
      break;
    case "PowerPotion":
      discovery(run, "power", pot);
      break;
    case "ColorlessPotion":
      discovery(run, "skill", pot, true);
      break;
    case "GamblersBrew": {
      const n = cbt.hand.length;
      cbt.discard.push(...cbt.hand.splice(0));
      pfx.drawCards(run, n);
      break;
    }
    case "LiquidMemories":
      for (let i = 0; i < pot; i++) {
        const c = cbt.discard.pop();
        if (c && cbt.hand.length < 10) {
          c.freeOnce = true;
          cbt.hand.push(c);
        }
      }
      break;
    case "SneckoOil": {
      pfx.drawCards(run, pot);
      const r = StsRandom.fromState(run.rng.cardRandom ?? run.rng.misc!);
      for (const h of cbt.hand) {
        if (cardDef(h.defId).cost >= 0) h.costOverride = r.nextInt(4);
      }
      run.rng.cardRandom = r.toState();
      break;
    }
    case "SmokeBomb":
      if (run.roomKind !== "boss") cbt.victory = true;
      break;
    case "FairyPotion":
      return false;
    case "GhostInAJar":
      pfx.addPower(run.player, "Intangible", pot);
      break;
    case "HeartOfIron":
      pfx.addPower(run.player, "Metallicize", pot);
      break;
    case "CultistPotion":
      pfx.addPower(run.player, "Ritual", pot);
      break;
    case "CunningPotion":
      for (let i = 0; i < pot; i++) addToHand(run, pfx.makeCard(run, "Shiv", true));
      break;
    case "DuplicationPotion":
      pfx.addPower(run.player, "Double Tap", pot);
      break;
    case "DistilledChaos":
      for (let i = 0; i < pot; i++) pfx.playTopCard(run);
      break;
    case "ElixirPotion": {
      const drop = cbt.hand.filter((c) => {
        const d = cardDef(c.defId);
        return d.type === "curse" || d.type === "status";
      });
      cbt.hand = cbt.hand.filter((c) => !drop.includes(c));
      cbt.exhaust.push(...drop);
      break;
    }
    case "EntropicBrew":
      for (let i = 0; i < run.potionSlots; i++) {
        if (!run.potions[i]) run.potions[i] = { id: pfx.pickPotion(run) };
      }
      break;
    case "Regen Potion":
      pfx.addPower(run.player, "Regeneration", pot);
      break;
    default:
      pfx.gainBlock(run, run.player, 8);
      break;
  }
  return true;
}
