/**
 * Compare the code-derived extraction against the wiki-era baseline files that pre-date it
 * (data/sts1/cards_*.json, relics.json(old shape), enemies.json, potions.json(old shape)).
 * The baseline lives in git history; we read it from `git show main:…` so the working tree can move on.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DATA_DIR, REPO_ROOT } from "./paths.js";

const BASE_REF = process.env.BASELINE_REF ?? "55d9fa7"; // last commit of the wiki-era data (post audit fixes)
const git = (file: string) => JSON.parse(execFileSync("git", ["show", `${BASE_REF}:data/sts1/${file}`], { cwd: REPO_ROOT, encoding: "utf-8" }));
const read = (rel: string) => JSON.parse(readFileSync(path.join(DATA_DIR, rel), "utf-8"));

type Diff = { entity: string; id: string; field: string; baseline: unknown; code: unknown };
const diffs: Diff[] = [];
const carried: Record<string, Record<string, unknown>> = {};

// ---- cards
const colorOf: Record<string, string> = { ironclad: "red", silent: "green", defect: "blue", watcher: "purple" };
const codeCards = ["red", "green", "blue", "purple", "colorless", "curse", "status"].flatMap((c) => read(`cards/${c}.json`) as Array<Record<string, any>>);
const byName = new Map<string, Array<Record<string, any>>>();
for (const c of codeCards) byName.set(c.name.eng, [...(byName.get(c.name.eng) ?? []), c]);
const normCost = (v: unknown): number | undefined => (typeof v === "number" ? v : typeof v === "string" ? (v.toUpperCase() === "X" ? -1 : /^-?\d+$/.test(v) ? Number(v) : v.trim() === "" || v === "-" ? -2 : undefined) : undefined);
let matched = 0;
const baseCards: Array<Record<string, any>> = [];
for (const ch of ["ironclad", "silent", "defect", "watcher"]) for (const c of git(`cards_${ch}.json`)) baseCards.push({ ...c, _color: colorOf[ch] });
const neutral = git("cards_neutral.json");
for (const g of ["colorless", "curses", "statuses"]) for (const c of neutral[g]) baseCards.push({ ...c, _color: g === "colorless" ? "colorless" : g === "curses" ? "curse" : "colorless" });
for (const b of baseCards) {
  let cand = (byName.get(b.en) ?? []).filter((c) => c.color === b._color || (b._color === "colorless" && c.type === "status"));
  if (!cand.length) cand = byName.get(b.en) ?? [];
  if (!cand.length && /^(Strike|Defend) \(/.test(b.en)) cand = codeCards.filter((c) => c.id === `${b.en.split(" ")[0]}_${{ ironclad: "R", silent: "G", defect: "B", watcher: "P" }[b.en.includes("Silent") ? "silent" : b.en.includes("Defect") ? "defect" : b.en.includes("Watcher") ? "watcher" : "ironclad"]}`);
  if (!cand.length) {
    diffs.push({ entity: "card", id: b.id, field: "match", baseline: b.en, code: null });
    continue;
  }
  const c = cand[0];
  matched++;
  carried[c.id] = { wikiEffectZh: b.effect, wikiEffectUpZh: b.effect_up, keywords: b.keywords };
  const bc = normCost(b.cost);
  if (bc !== undefined && bc !== c.cost) diffs.push({ entity: "card", id: c.id, field: "cost", baseline: b.cost, code: c.cost });
  if (b.type && String(b.type).toLowerCase() !== c.type) diffs.push({ entity: "card", id: c.id, field: "type", baseline: b.type, code: c.type });
  if (b.rarity && String(b.rarity).toLowerCase() !== c.rarity) diffs.push({ entity: "card", id: c.id, field: "rarity", baseline: b.rarity, code: c.rarity });
}

// ---- relics
const codeRelics = read("relics.json") as Array<Record<string, any>>;
const relByName = new Map(codeRelics.map((r) => [r.name.eng.toLowerCase(), r]));
let relMatched = 0;
for (const b of git("relics.json")) {
  if (b.rarity === "blight") continue;
  const r = relByName.get(String(b.en).toLowerCase()) ?? relByName.get(String(b.en).toLowerCase().replace(/ of /, " of ")) ?? codeRelics.find((x) => x.id.toLowerCase().replace(/[^a-z]/g, "") === String(b.en).toLowerCase().replace(/[^a-z]/g, ""));
  if (!r) {
    diffs.push({ entity: "relic", id: b.id, field: "match", baseline: b.en, code: null });
    continue;
  }
  relMatched++;
  if (b.rarity !== r.tier) diffs.push({ entity: "relic", id: r.id, field: "tier", baseline: b.rarity, code: r.tier });
}

// ---- potions
const codePotions = read("potions.json") as Array<Record<string, any>>;
let potMatched = 0;
for (const b of git("potions.json")) {
  const p = codePotions.find((x) => x.name.eng.toLowerCase() === String(b.en).toLowerCase()) ?? codePotions.find((x) => x.id.toLowerCase().replace(/[^a-z]/g, "") === String(b.en).toLowerCase().replace(/[^a-z]/g, ""));
  if (!p) {
    diffs.push({ entity: "potion", id: b.id, field: "match", baseline: b.en, code: null });
    continue;
  }
  potMatched++;
  if (b.rarity && b.rarity !== p.rarity) diffs.push({ entity: "potion", id: p.id, field: "rarity", baseline: b.rarity, code: p.rarity });
}

// ---- monsters (HP at ascension 0)
const codeMonsters = read("monsters.json") as Array<Record<string, any>>;
const monAlias: Record<string, string> = { "red louse": "FuzzyLouseNormal", "green louse": "FuzzyLouseDefensive", "blue slaver": "SlaverBlue", "red slaver": "SlaverRed", "bronze orb": "BronzeOrb", bear: "BanditBear", romeo: "BanditLeader", pointy: "BanditChild" };
let monMatched = 0;
for (const b of git("enemies.json")) {
  const key = String(b.en).toLowerCase();
  const m = codeMonsters.find((x) => x.id === monAlias[key]) ?? codeMonsters.find((x) => x.name.eng.toLowerCase() === key);
  if (!m) {
    diffs.push({ entity: "monster", id: b.id, field: "match", baseline: b.en, code: null });
    continue;
  }
  monMatched++;
  const hp0 = m.hp.find((h: { asc: number }) => h.asc === 0) ?? m.hp[0];
  if (Array.isArray(b.hp) && (b.hp[0] !== hp0.min || (b.hp[1] ?? b.hp[0]) !== hp0.max)) diffs.push({ entity: "monster", id: m.id, field: "hp", baseline: b.hp, code: [hp0.min, hp0.max] });
}

const out = {
  baselineRef: BASE_REF,
  generatedAt: new Date().toISOString(),
  summary: { cards: { baseline: baseCards.length, matched, code: codeCards.length }, relics: { matched: relMatched, code: codeRelics.length }, potions: { matched: potMatched, code: codePotions.length }, monsters: { matched: monMatched, code: codeMonsters.length }, diffs: diffs.length },
  diffs,
};
writeFileSync(path.join(DATA_DIR, "_baseline-diff.json"), JSON.stringify(out, null, 2) + "\n");
writeFileSync(path.join(DATA_DIR, "_baseline-carryover.json"), JSON.stringify(carried, null, 2) + "\n");
console.log(JSON.stringify(out.summary, null, 2));
for (const d of diffs) console.log(`${d.entity} ${d.id} ${d.field}: baseline=${JSON.stringify(d.baseline)} code=${JSON.stringify(d.code)}`);
