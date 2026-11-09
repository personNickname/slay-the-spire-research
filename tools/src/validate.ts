import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { DATA_DIR, SCHEMA_DIR, REVIEW_DIR } from "./paths.js";

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
for (const f of readdirSync(SCHEMA_DIR)) ajv.addSchema(JSON.parse(readFileSync(path.join(SCHEMA_DIR, f), "utf-8")));

const read = (rel: string) => JSON.parse(readFileSync(path.join(DATA_DIR, rel), "utf-8"));
const report: { file: string; count: number; errors: string[] }[] = [];
let failed = false;

function check(rel: string, schemaId: string): unknown {
  const data = read(rel);
  const ok = ajv.validate(`https://sts-research/schemas/${schemaId}.schema.json`, data);
  const errors = ok ? [] : (ajv.errors ?? []).slice(0, 20).map((e) => `${e.instancePath} ${e.message}`);
  if (!ok) failed = true;
  report.push({ file: rel, count: Array.isArray(data) ? data.length : Object.keys(data as object).length, errors });
  return data;
}

const cards: Record<string, unknown[]> = {};
for (const f of readdirSync(path.join(DATA_DIR, "cards"))) {
  if (!f.endsWith(".json")) continue;
  if (f.endsWith(".effects.json")) check(`cards/${f}`, "effects");
  else cards[f.replace(".json", "")] = check(`cards/${f}`, "card") as unknown[];
}
check("relics.json", "relic");
check("potions.json", "potion");
check("powers.json", "power");
const monsters = check("monsters.json", "monster") as Array<{ id: string }>;

// Cross-references & literal sanity (counts confirmed against the jar; see docs/audits)
const expect = (label: string, actual: number, wanted: number) => {
  if (actual !== wanted) {
    failed = true;
    report.push({ file: label, count: actual, errors: [`expected ${wanted}`] });
  }
};
expect("cards/red", cards.red?.length ?? 0, 75);
expect("cards/green", cards.green?.length ?? 0, 75);
expect("cards/blue", cards.blue?.length ?? 0, 75);
expect("cards/purple", cards.purple?.length ?? 0, 75);
expect("cards/curse", cards.curse?.length ?? 0, 14);
expect("cards/status", cards.status?.length ?? 0, 5);
expect("relics", (read("relics.json") as unknown[]).length, 180);
expect("potions", (read("potions.json") as unknown[]).length, 42);

// Every curated effect must point at an existing card id; every red card must have effects
const allIds = new Set(Object.values(cards).flat().map((c) => (c as { id: string }).id));
for (const f of readdirSync(path.join(DATA_DIR, "cards"))) {
  if (!f.endsWith(".effects.json")) continue;
  const eff = read(`cards/${f}`) as Record<string, unknown>;
  const missing = Object.keys(eff).filter((id) => !allIds.has(id));
  if (missing.length) {
    failed = true;
    report.push({ file: `cards/${f}`, count: Object.keys(eff).length, errors: missing.map((m) => `unknown card id ${m}`) });
  }
}
for (const color of ["red", "status", "curse"]) {
  const file = path.join(DATA_DIR, "cards", `${color}.effects.json`);
  if (!existsSync(file)) continue;
  const eff = JSON.parse(readFileSync(file, "utf-8")) as Record<string, unknown>;
  const lacking = (cards[color] as Array<{ id: string }>).filter((c) => !(c.id in eff)).map((c) => c.id);
  if (lacking.length) {
    failed = true;
    report.push({ file: `cards/${color}.effects.json`, count: Object.keys(eff).length, errors: lacking.map((m) => `no effects for ${m}`) });
  }
}

// encounters reference monster ids that exist
if (existsSync(path.join(DATA_DIR, "encounters.json"))) {
  const enc = read("encounters.json") as { encounters: Record<string, { monsters?: string[][] }> };
  const ids = new Set(monsters.map((m) => m.id));
  const bad: string[] = [];
  for (const [k, v] of Object.entries(enc.encounters)) for (const group of v.monsters ?? []) for (const id of group) if (!ids.has(id)) bad.push(`${k}: ${id}`);
  if (bad.length) {
    failed = true;
    report.push({ file: "encounters.json", count: Object.keys(enc.encounters).length, errors: bad });
  }
}

writeFileSync(path.join(REVIEW_DIR, "validation.json"), JSON.stringify({ generatedAt: new Date().toISOString(), ok: !failed, report }, null, 2) + "\n");
for (const r of report) console.log(`${r.errors.length ? "FAIL" : " ok "} ${r.file} (${r.count})${r.errors.length ? "\n      " + r.errors.join("\n      ") : ""}`);
if (failed) process.exit(1);
console.log("validation passed");
