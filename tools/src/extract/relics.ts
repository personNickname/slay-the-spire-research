import { CARDCRAWL } from "../paths.js";
import { readPackage, readClass, constString, type JavaClass } from "../java-parse.js";
import { bilingual, strings } from "../localization.js";
import { EXCLUDED_RELIC_CLASSES } from "../class-filter.js";

export interface RelicRecord {
  id: string;
  class: string;
  name: { eng: string; zhs: string };
  description: { eng: string; zhs: string };
  flavor?: { eng: string; zhs: string };
  tier: "starter" | "common" | "uncommon" | "rare" | "special" | "boss" | "shop" | "deprecated";
  /** which character pool RelicLibrary.initialize() puts it in */
  pool: "red" | "green" | "blue" | "purple" | "shared" | "none";
  /** counter-based relic (uses this.counter) */
  usesCounter: boolean;
}

const SUPER = /super\(\s*ID\s*,\s*"[^"]*"\s*,\s*AbstractRelic\.RelicTier\.(\w+)/;

function poolMap(): Map<string, RelicRecord["pool"]> {
  const lib = readClass(CARDCRAWL, "helpers", "RelicLibrary").src;
  const map = new Map<string, RelicRecord["pool"]>();
  const re = /RelicLibrary\.(addRed|addGreen|addBlue|addPurple|addShared|add)\(\s*new\s+(\w+)\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(lib))) {
    const pool = ({ addRed: "red", addGreen: "green", addBlue: "blue", addPurple: "purple", addShared: "shared", add: "shared" } as const)[m[1]]!;
    map.set(m[2], pool);
  }
  return map;
}

/** DESCRIPTIONS segments are joined by the game with a runtime number; we mark that slot with `#`. */
function join(desc: string[] | undefined): string {
  return (desc ?? []).join("#").replace(/#[bygrp]/g, "").replace(/ NL /g, "\n");
}

export function parseRelic(cls: JavaClass, pools: Map<string, RelicRecord["pool"]>): RelicRecord | undefined {
  const { src } = cls;
  const id = constString(src, ["ID"]);
  const s = src.match(SUPER);
  if (!id || !s) return undefined;
  const name = bilingual("relics", id);
  if (!name) return undefined;
  const dEng = join(strings("eng", "relics", id, "DESCRIPTIONS"));
  const dZhs = join(strings("zhs", "relics", id, "DESCRIPTIONS")) || dEng;
  const fEng = strings("eng", "relics", id, "FLAVOR") ?? undefined;
  const rec: RelicRecord = {
    id,
    class: cls.name,
    name,
    description: { eng: dEng, zhs: dZhs },
    tier: s[1].toLowerCase() as RelicRecord["tier"],
    pool: pools.get(cls.name) ?? "none",
    usesCounter: /this\.counter\s*=|\+\+this\.counter|this\.counter\+\+/.test(src),
  };
  if (fEng) rec.flavor = { eng: fEng.join(""), zhs: (strings("zhs", "relics", id, "FLAVOR") ?? fEng).join("") };
  return rec;
}

export function extractRelics(): { relics: RelicRecord[]; unresolved: string[] } {
  const pools = poolMap();
  const relics: RelicRecord[] = [];
  const unresolved: string[] = [];
  for (const cls of readPackage(CARDCRAWL, "relics")) {
    if (cls.name === "AbstractRelic" || EXCLUDED_RELIC_CLASSES.has(cls.name)) continue;
    const rec = parseRelic(cls, pools);
    if (!rec) {
      if (!/abstract class/.test(cls.src)) unresolved.push(`relics/${cls.name}`);
      continue;
    }
    if (rec.tier === "deprecated") continue;
    relics.push(rec);
  }
  return { relics: relics.sort((a, b) => a.id.localeCompare(b.id)), unresolved };
}
