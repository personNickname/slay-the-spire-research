import { CARDCRAWL } from "../paths.js";
import { readPackage, constString, type JavaClass } from "../java-parse.js";
import { bilingual, strings } from "../localization.js";
import { EXCLUDED_POTION_CLASSES } from "../class-filter.js";

export interface PotionRecord {
  id: string;
  class: string;
  name: { eng: string; zhs: string };
  description: { eng: string; zhs: string };
  rarity: "common" | "uncommon" | "rare";
  /** constant returned by getPotency(); absent when it depends on ascension or is dynamic */
  potency?: number;
  targetRequired: boolean;
  /** can only be used in combat (isThrown / canUse checks) */
  combatOnly: boolean;
  /** PotionHelper.getPotions(class, false) — class potions only roll for that hero */
  pool?: "red" | "green" | "blue" | "purple" | "shared";
}

/** PotionHelper.getPotions — class-locked ids prepended before the shared list. */
const CLASS_POTION_POOL: Record<string, "red" | "green" | "blue" | "purple"> = {
  BloodPotion: "red",
  ElixirPotion: "red",
  HeartOfIron: "red",
  "Poison Potion": "green",
  CunningPotion: "green",
  GhostInAJar: "green",
  FocusPotion: "blue",
  PotionOfCapacity: "blue",
  EssenceOfDarkness: "blue",
  BottledMiracle: "purple",
  StancePotion: "purple",
  Ambrosia: "purple",
};

const SUPER = /super\(\s*[^,]+,\s*POTION_ID\s*,\s*AbstractPotion\.PotionRarity\.(\w+)\s*,/;

export function parsePotion(cls: JavaClass): PotionRecord | undefined {
  const { src } = cls;
  const id = constString(src, ["POTION_ID", "ID"]);
  const s = src.match(SUPER);
  if (!id || !s) return undefined;
  const name = bilingual("potions", id);
  if (!name) return undefined;
  const rarity = s[1].toLowerCase();
  if (rarity === "placeholder") return undefined;
  const pot = src.match(/public int getPotency\(int ascensionLevel\) \{\s*return (\d+);/);
  const descs = strings("eng", "potions", id, "DESCRIPTIONS") ?? [];
  const descsZ = strings("zhs", "potions", id, "DESCRIPTIONS") ?? descs;
  const rec: PotionRecord = {
    id,
    class: cls.name,
    name,
    description: { eng: descs.join("").replace(/ NL /g, "\n"), zhs: descsZ.join("").replace(/ NL /g, "\n") },
    rarity: rarity as PotionRecord["rarity"],
    targetRequired: /this\.targetRequired\s*=\s*true/.test(src) || /PotionTarget|targetRequired = true/.test(src),
    combatOnly: /this\.isThrown\s*=\s*true/.test(src) || /AbstractDungeon\.getCurrRoom\(\)\.phase != AbstractRoom\.RoomPhase\.COMBAT|canUse\(\)/.test(src) && /return false/.test(src),
    pool: CLASS_POTION_POOL[id] ?? "shared",
  };
  if (pot) rec.potency = Number(pot[1]);
  return rec;
}

export function extractPotions(): { potions: PotionRecord[]; unresolved: string[] } {
  const potions: PotionRecord[] = [];
  const unresolved: string[] = [];
  for (const cls of readPackage(CARDCRAWL, "potions")) {
    if (cls.name === "AbstractPotion" || EXCLUDED_POTION_CLASSES.has(cls.name)) continue;
    const rec = parsePotion(cls);
    if (!rec) {
      unresolved.push(`potions/${cls.name}`);
      continue;
    }
    potions.push(rec);
  }
  return { potions: potions.sort((a, b) => a.id.localeCompare(b.id)), unresolved };
}
