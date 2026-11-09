import type { CardDef, MonsterDef } from "./types.js";
import red from "../../../data/sts1/cards/red.json";
import green from "../../../data/sts1/cards/green.json";
import blue from "../../../data/sts1/cards/blue.json";
import purple from "../../../data/sts1/cards/purple.json";
import colorless from "../../../data/sts1/cards/colorless.json";
import curse from "../../../data/sts1/cards/curse.json";
import status from "../../../data/sts1/cards/status.json";
import monsters from "../../../data/sts1/monsters.json";
import relics from "../../../data/sts1/relics.json";
import potions from "../../../data/sts1/potions.json";
import encounters from "../../../data/sts1/encounters.json";

export const CARDS: CardDef[] = [
  ...(red as CardDef[]),
  ...(green as CardDef[]),
  ...(blue as CardDef[]),
  ...(purple as CardDef[]),
  ...(colorless as CardDef[]),
  ...(curse as CardDef[]),
  ...(status as CardDef[]),
];

export const CARD_BY_ID = new Map(CARDS.map((c) => [c.id, c]));

export const MONSTERS: MonsterDef[] = monsters as MonsterDef[];
export const MONSTER_BY_ID = new Map(MONSTERS.map((m) => [m.id, m]));

export interface RelicRecord {
  id: string;
  name: { eng: string; zhs: string };
  description?: { eng: string; zhs: string };
  flavor?: { eng: string; zhs: string };
  tier: string;
  pool?: string;
}

export const RELICS = relics as RelicRecord[];
export const RELIC_BY_ID = new Map(
  RELICS.map((r) => [r.id, r] as const),
);

export interface PotionRecord {
  id: string;
  name: { eng: string; zhs: string };
  description?: { eng: string; zhs: string };
  rarity?: string;
}
export const POTIONS = potions as PotionRecord[];
export const POTION_BY_ID = new Map(POTIONS.map((p) => [p.id, p] as const));

export const ENCOUNTERS = encounters as {
  acts: Record<string, { weak: { id: string; w: number }[]; strong: { id: string; w: number }[]; elite: { id: string; w: number }[]; boss: string[] }>;
  encounters: Record<string, { monsters?: string[][] }>;
};

export function cardDef(id: string): CardDef {
  const c = CARD_BY_ID.get(id);
  if (!c) throw new Error(`Unknown card ${id}`);
  return c;
}

export function monsterDef(id: string): MonsterDef {
  const m = MONSTER_BY_ID.get(id);
  if (!m) throw new Error(`Unknown monster ${id}`);
  return m;
}

export function hpBand(def: MonsterDef, asc: number): { min: number; max: number } {
  let band = def.hp[0]!;
  for (const b of def.hp) {
    if (asc >= b.asc) band = b;
  }
  return { min: band.min, max: band.max };
}

export const IRONCLAD_STARTER = [
  "Strike_R",
  "Strike_R",
  "Strike_R",
  "Strike_R",
  "Strike_R",
  "Defend_R",
  "Defend_R",
  "Defend_R",
  "Defend_R",
  "Bash",
];

export const POWER_NAMES: Record<string, { eng: string; zhs: string }> = {
  Strength: { eng: "Strength", zhs: "力量" },
  Dexterity: { eng: "Dexterity", zhs: "敏捷" },
  Vulnerable: { eng: "Vulnerable", zhs: "易伤" },
  Weakened: { eng: "Weak", zhs: "虚弱" },
  Frail: { eng: "Frail", zhs: "脆弱" },
  Artifact: { eng: "Artifact", zhs: "人工制品" },
  Barricade: { eng: "Barricade", zhs: "壁垒" },
  Metallicize: { eng: "Metallicize", zhs: "金属化" },
  Thorns: { eng: "Thorns", zhs: "荆棘" },
  "Flame Barrier": { eng: "Flame Barrier", zhs: "火焰屏障" },
  Rage: { eng: "Rage", zhs: "怒火" },
  Ritual: { eng: "Ritual", zhs: "仪式" },
  "Curl Up": { eng: "Curl Up", zhs: "蜷身" },
  Angry: { eng: "Angry", zhs: "愤怒" },
  "Spore Cloud": { eng: "Spore Cloud", zhs: "孢子云" },
  "Sharp Hide": { eng: "Sharp Hide", zhs: "锋利外壳" },
  "Mode Shift": { eng: "Mode Shift", zhs: "模式切换" },
  Anger: { eng: "Enrage", zhs: "激怒" },
  MetallicizeSleep: { eng: "Metallicize", zhs: "金属化" },
  Split: { eng: "Split", zhs: "分裂" },
  Flex: { eng: "Flex", zhs: "弹性" },
  "No Draw": { eng: "No Draw", zhs: "不能抽牌" },
  "Double Tap": { eng: "Double Tap", zhs: "双发" },
  "Demon Form": { eng: "Demon Form", zhs: "恶魔形态" },
  "Dark Embrace": { eng: "Dark Embrace", zhs: "黑暗之拥" },
  "Feel No Pain": { eng: "Feel No Pain", zhs: "无痛" },
  "Fire Breathing": { eng: "Fire Breathing", zhs: "火焰吐息" },
  Evolve: { eng: "Evolve", zhs: "进化" },
  Brutality: { eng: "Brutality", zhs: "残暴" },
  Combust: { eng: "Combust", zhs: "燃烧" },
  Corruption: { eng: "Corruption", zhs: "腐化" },
  Berserk: { eng: "Berserk", zhs: "狂暴" },
  Juggernaut: { eng: "Juggernaut", zhs: "势不可挡" },
  Rupture: { eng: "Rupture", zhs: "撕裂" },
  Inflame: { eng: "Inflame", zhs: "燃烧" },
  "Lose Strength": { eng: "Strength Down", zhs: "失去力量" },
  Entangled: { eng: "Entangled", zhs: "缠身" },
  Constricted: { eng: "Constricted", zhs: "缠绕" },
  Intangible: { eng: "Intangible", zhs: "无实体" },
  Buffer: { eng: "Buffer", zhs: "缓冲" },
  Poison: { eng: "Poison", zhs: "中毒" },
  Focus: { eng: "Focus", zhs: "集中" },
  Vigor: { eng: "Vigor", zhs: "活力" },
  Accuracy: { eng: "Accuracy", zhs: "精准" },
  "Noxious Fumes": { eng: "Noxious Fumes", zhs: "毒雾" },
  "After Image": { eng: "After Image", zhs: "余像" },
  Blur: { eng: "Blur", zhs: "残影" },
  "Wraith Form": { eng: "Wraith Form", zhs: "幽魂形态" },
  Envenom: { eng: "Envenom", zhs: "涂毒" },
  "A Thousand Cuts": { eng: "A Thousand Cuts", zhs: "千割" },
  "Well-Laid Plans": { eng: "Well-Laid Plans", zhs: "计划妥当" },
  "Tools of the Trade": { eng: "Tools of the Trade", zhs: "必备工具" },
  "Infinite Blades": { eng: "Infinite Blades", zhs: "无限刀刃" },
  Storm: { eng: "Storm", zhs: "风暴" },
  Echo: { eng: "Echo Form", zhs: "回响形态" },
  "Creative AI": { eng: "Creative AI", zhs: "创意AI" },
  "Heatsink": { eng: "Heatsinks", zhs: "散热片" },
  "Loop": { eng: "Loop", zhs: "循环" },
  "Electrodynamics": { eng: "Electrodynamics", zhs: "电动力学" },
  "Static Discharge": { eng: "Static Discharge", zhs: "静电释放" },
  "Devotion": { eng: "Devotion", zhs: "虔诚" },
  "Establishment": { eng: "Establishment", zhs: "建立" },
  "Mental Fortress": { eng: "Mental Fortress", zhs: "精神堡垒" },
  "Nirvana": { eng: "Nirvana", zhs: "涅槃" },
  "Rushdown": { eng: "Rushdown", zhs: "猛突" },
  "Wireheading": { eng: "Foresight", zhs: "预见" },
};
