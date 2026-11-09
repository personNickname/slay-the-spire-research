import { CARDCRAWL } from "../paths.js";
import { readPackage, constString } from "../java-parse.js";
import { bilingual, strings } from "../localization.js";
import { EXCLUDED_POWER_CLASSES } from "../class-filter.js";

export interface PowerRecord {
  id: string;
  class: string;
  name: { eng: string; zhs: string };
  descriptions: { eng: string[]; zhs: string[] };
  kind: "buff" | "debuff";
  turnBased: boolean;
}

export function extractPowers(): { powers: PowerRecord[]; unresolved: string[] } {
  const powers: PowerRecord[] = [];
  const unresolved: string[] = [];
  for (const cls of [...readPackage(CARDCRAWL, "powers"), ...readPackage(CARDCRAWL, "powers/watcher")]) {
    if (cls.name === "AbstractPower" || /abstract class/.test(cls.src) || EXCLUDED_POWER_CLASSES.has(cls.name)) continue;
    const id = constString(cls.src, ["POWER_ID", "ID"]);
    if (!id) {
      unresolved.push(`powers/${cls.name}`);
      continue;
    }
    const name = bilingual("powers", id);
    if (!name) {
      unresolved.push(`powers/${cls.name}`);
      continue;
    }
    const kind = /PowerType\.DEBUFF/.test(cls.src) ? "debuff" : "buff";
    powers.push({
      id,
      class: cls.name,
      name,
      descriptions: {
        eng: strings("eng", "powers", id, "DESCRIPTIONS") ?? [],
        zhs: strings("zhs", "powers", id, "DESCRIPTIONS") ?? strings("eng", "powers", id, "DESCRIPTIONS") ?? [],
      },
      kind,
      turnBased: /this\.isTurnBased\s*=\s*true/.test(cls.src),
    });
  }
  return { powers: powers.sort((a, b) => a.id.localeCompare(b.id)), unresolved };
}
