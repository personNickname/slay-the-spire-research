import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DATA_DIR, requireSources } from "./paths.js";
import { extractCards } from "./extract/cards.js";
import { extractRelics } from "./extract/relics.js";
import { extractPotions } from "./extract/potions.js";
import { extractPowers } from "./extract/powers.js";
import { extractMonsters } from "./extract/monsters.js";
import { loc } from "./localization.js";

function write(rel: string, data: unknown): void {
  const file = path.join(DATA_DIR, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

requireSources();
const unresolved: string[] = [];

const cards = extractCards();
unresolved.push(...cards.unresolved);
for (const [color, list] of Object.entries(cards.byColor)) write(`cards/${color}.json`, list);
console.log("cards:", Object.fromEntries(Object.entries(cards.byColor).map(([k, v]) => [k, v.length])));

const relics = extractRelics();
unresolved.push(...relics.unresolved);
write("relics.json", relics.relics);
console.log("relics:", relics.relics.length);

const potions = extractPotions();
unresolved.push(...potions.unresolved);
write("potions.json", potions.potions);
console.log("potions:", potions.potions.length);

const powers = extractPowers();
unresolved.push(...powers.unresolved);
write("powers.json", powers.powers);
console.log("powers:", powers.powers.length);

const monsters = extractMonsters();
unresolved.push(...monsters.unresolved);
write("monsters.json", monsters.monsters);
console.log("monsters:", monsters.monsters.length);

// keywords straight from localization
const kwEng = loc("eng", "keywords")["Game Dictionary"] as Record<string, Record<string, unknown>>;
const kwZhs = (loc("zhs", "keywords")["Game Dictionary"] ?? {}) as Record<string, Record<string, unknown>>;
const keywords = Object.entries(kwEng).map(([id, v]) => ({
  id,
  names: { eng: (v.NAMES as string[]) ?? [], zhs: ((kwZhs[id]?.NAMES as string[]) ?? (v.NAMES as string[])) ?? [] },
  description: { eng: String(v.DESCRIPTION ?? ""), zhs: String(kwZhs[id]?.DESCRIPTION ?? v.DESCRIPTION ?? "") },
}));
write("keywords.json", keywords);
console.log("keywords:", keywords.length);

write("_unresolved.json", unresolved);
console.log("unresolved:", unresolved.length, unresolved);
