import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DATA_DIR } from "./paths.js";
import { EFFECTS, effectOf } from "../../packages/sts-engine/src/cardEffects.ts";
import type { CardDef } from "../../packages/sts-engine/src/types.ts";

const dir = path.join(DATA_DIR, "cards");
mkdirSync(dir, { recursive: true });

for (const color of ["red", "green", "blue", "purple", "colorless", "curse", "status"]) {
  const cards = JSON.parse(readFileSync(path.join(dir, `${color}.json`), "utf8")) as CardDef[];
  const out: Record<string, unknown> = {};
  for (const c of cards) out[c.id] = EFFECTS[c.id] ?? effectOf(c.id);
  writeFileSync(path.join(dir, `${color}.effects.json`), JSON.stringify(out, null, 2) + "\n");
  console.log(color, Object.keys(out).length);
}
