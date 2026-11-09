import { CARDCRAWL } from "../paths.js";
import { readPackage, constString, hpBrackets } from "../java-parse.js";
import { bilingual, strings } from "../localization.js";
import { EXCLUDED_MONSTER_CLASSES, MONSTER_PACKAGES } from "../class-filter.js";

export interface MonsterRecord {
  id: string;
  class: string;
  act: 1 | 2 | 3 | 4;
  name: { eng: string; zhs: string };
  kind: "normal" | "elite" | "boss";
  /** HP brackets by minimum ascension level; pick the highest `asc` ≤ current ascension */
  hp: Array<{ asc: number; min: number; max: number }>;
  moves: { eng: string[]; zhs: string[] };
}

const ACT: Record<string, MonsterRecord["act"]> = { exordium: 1, city: 2, beyond: 3, ending: 4 };

export function extractMonsters(): { monsters: MonsterRecord[]; unresolved: string[] } {
  const monsters: MonsterRecord[] = [];
  const unresolved: string[] = [];
  for (const pkg of MONSTER_PACKAGES) {
    for (const cls of readPackage(CARDCRAWL, `monsters/${pkg}`)) {
      if (EXCLUDED_MONSTER_CLASSES.has(cls.ref) || /abstract class/.test(cls.src)) continue;
      if (!/extends AbstractMonster/.test(cls.src)) continue;
      const id = constString(cls.src, ["ID"]);
      if (!id) {
        unresolved.push(`monsters/${cls.ref}`);
        continue;
      }
      const name = bilingual("monsters", id);
      if (!name) {
        unresolved.push(`monsters/${cls.ref}`);
        continue;
      }
      const hp = hpBrackets(cls.src);
      if (hp.length === 0) {
        // Some monsters set HP via a constructor argument (e.g. slime splits); record the super() value
        const m = cls.src.match(/super\(NAME, ID, (\d+)/);
        const r = cls.src.match(/super\(NAME, ID, AbstractDungeon\.monsterHpRng\.random\((\d+), (\d+)\)/);
        if (m) hp.push({ asc: 0, min: Number(m[1]), max: Number(m[1]) });
        else if (r) hp.push({ asc: 0, min: Number(r[1]), max: Number(r[2]) });
      }
      const kind: MonsterRecord["kind"] = /EnemyType\.BOSS/.test(cls.src) ? "boss" : /EnemyType\.ELITE/.test(cls.src) ? "elite" : "normal";
      monsters.push({
        id,
        class: cls.ref,
        act: ACT[pkg],
        name,
        kind,
        hp,
        moves: {
          eng: strings("eng", "monsters", id, "MOVES") ?? [],
          zhs: strings("zhs", "monsters", id, "MOVES") ?? strings("eng", "monsters", id, "MOVES") ?? [],
        },
      });
    }
  }
  return { monsters: monsters.sort((a, b) => a.act - b.act || a.id.localeCompare(b.id)), unresolved };
}
