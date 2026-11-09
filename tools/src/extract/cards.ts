import { CARDCRAWL } from "../paths.js";
import { readPackage, constString, intAfter, type JavaClass } from "../java-parse.js";
import { bilingual, text } from "../localization.js";
import { CARD_PACKAGES, EXCLUDED_CARD_CLASSES } from "../class-filter.js";

export interface CardRecord {
  id: string;
  class: string;
  name: { eng: string; zhs: string };
  description: { eng: string; zhs: string };
  upgradedDescription?: { eng: string; zhs: string };
  type: "attack" | "skill" | "power" | "status" | "curse";
  color: "red" | "green" | "blue" | "purple" | "colorless" | "curse";
  rarity: "basic" | "common" | "uncommon" | "rare" | "special" | "curse";
  /** -1 = X cost, -2 = unplayable */
  cost: number;
  target: "enemy" | "all_enemy" | "self" | "none" | "self_and_enemy" | "all";
  base: { damage?: number; block?: number; magic?: number };
  upgrade: {
    damage?: number;
    block?: number;
    magic?: number;
    /** new cost after upgrade */
    cost?: number;
    exhaust?: boolean;
    innate?: boolean;
    ethereal?: boolean;
    retain?: boolean;
    /** upgrade() does something the regexes cannot express (e.g. Searing Blow) */
    custom?: boolean;
  };
  exhaust: boolean;
  ethereal: boolean;
  innate: boolean;
  retain: boolean;
  multiDamage: boolean;
  tags: string[];
}

const SUPER =
  /super\(\s*ID\s*,\s*[^,]+,\s*(?:"[^"]*"|[A-Za-z_.]+)\s*,\s*(-?\d+)\s*,\s*[^,]+,\s*AbstractCard\.CardType\.(\w+)\s*,\s*AbstractCard\.CardColor\.(\w+)\s*,\s*AbstractCard\.CardRarity\.(\w+)\s*,\s*AbstractCard\.CardTarget\.(\w+)/;

function methodBody(src: string, signature: string): string | undefined {
  const i = src.indexOf(signature);
  if (i < 0) return undefined;
  const open = src.indexOf("{", i);
  let depth = 0;
  for (let j = open; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}") {
      depth--;
      if (depth === 0) return src.slice(open + 1, j);
    }
  }
  return undefined;
}

export function parseCard(cls: JavaClass): CardRecord | undefined {
  const { src } = cls;
  const id = constString(src, ["ID"]);
  const s = src.match(SUPER);
  if (!id || !s) return undefined;
  const name = bilingual("cards", id);
  if (!name) return undefined;
  const base: CardRecord["base"] = {};
  const dmg = intAfter(src, /this\.baseDamage\s*=\s*(-?\d+)/);
  const blk = intAfter(src, /this\.baseBlock\s*=\s*(-?\d+)/);
  const mag =
    intAfter(src, /this\.magicNumber\s*=\s*this\.baseMagicNumber\s*=\s*(-?\d+)/) ??
    intAfter(src, /this\.baseMagicNumber\s*=\s*(-?\d+)/);
  if (dmg !== undefined) base.damage = dmg;
  if (blk !== undefined) base.block = blk;
  if (mag !== undefined) base.magic = mag;

  const up: CardRecord["upgrade"] = {};
  const ub = methodBody(src, "public void upgrade()") ?? "";
  const ud = intAfter(ub, /upgradeDamage\((-?\d+)\)/);
  const ublk = intAfter(ub, /upgradeBlock\((-?\d+)\)/);
  const um = intAfter(ub, /upgradeMagicNumber\((-?\d+)\)/);
  const uc = intAfter(ub, /upgradeBaseCost\((-?\d+)\)/);
  if (ud !== undefined) up.damage = ud;
  if (ublk !== undefined) up.block = ublk;
  if (um !== undefined) up.magic = um;
  if (uc !== undefined) up.cost = uc;
  if (/this\.exhaust\s*=\s*false/.test(ub)) up.exhaust = false;
  if (/this\.exhaust\s*=\s*true/.test(ub)) up.exhaust = true;
  if (/this\.isInnate\s*=\s*true/.test(ub)) up.innate = true;
  if (/this\.isEthereal\s*=\s*false/.test(ub)) up.ethereal = false;
  if (/this\.selfRetain\s*=\s*true/.test(ub)) up.retain = true;
  const residual = ub.replace(
    /this\.upgradeName\(\);|this\.upgradeDamage\(-?\d+\);|this\.upgradeBlock\(-?\d+\);|this\.upgradeMagicNumber\(-?\d+\);|this\.upgradeBaseCost\(-?\d+\);|this\.(exhaust|isInnate|isEthereal|selfRetain)\s*=\s*(true|false);|this\.rawDescription\s*=\s*[^;]+;|this\.initializeDescription\(\);|if \(!this\.upgraded\) \{|\}|\s|this\.upgradedDamage\s*=\s*true;|this\.upgraded\s*=\s*true;|this\.target\s*=\s*[^;]+;/g,
    "",
  );
  if (residual.length > 0) up.custom = true;

  const ctor = methodBody(src, `public ${cls.name}(`) ?? src;
  const tags = [...ctor.matchAll(/this\.tags\.add\(AbstractCard\.CardTags\.(\w+)\)/g)].map((m) => m[1]);
  const lower = <T extends string>(v: string) => v.toLowerCase() as T;
  const rec: CardRecord = {
    id,
    class: cls.ref,
    name,
    description: bilingual("cards", id, "DESCRIPTION") ?? { eng: "", zhs: "" },
    type: lower(s[2]),
    color: lower(s[3]),
    rarity: lower(s[4]),
    cost: Number(s[1]),
    target: lower(s[5]),
    base,
    upgrade: up,
    exhaust: /this\.exhaust\s*=\s*true/.test(ctor),
    ethereal: /this\.isEthereal\s*=\s*true/.test(ctor),
    innate: /this\.isInnate\s*=\s*true/.test(ctor),
    retain: /this\.selfRetain\s*=\s*true/.test(ctor),
    multiDamage: /this\.isMultiDamage\s*=\s*true/.test(ctor),
    tags,
  };
  const upDesc = text("eng", "cards", id, "UPGRADE_DESCRIPTION");
  if (upDesc) rec.upgradedDescription = bilingual("cards", id, "UPGRADE_DESCRIPTION");
  return rec;
}

export function extractCards(): { byColor: Record<string, CardRecord[]>; unresolved: string[] } {
  const byColor: Record<string, CardRecord[]> = {};
  const unresolved: string[] = [];
  for (const pkg of CARD_PACKAGES) {
    for (const cls of readPackage(CARDCRAWL, `cards/${pkg}`)) {
      if (EXCLUDED_CARD_CLASSES.has(cls.ref)) continue;
      const rec = parseCard(cls);
      if (!rec) {
        unresolved.push(`cards/${cls.ref}`);
        continue;
      }
      // status cards are CardColor.COLORLESS in code; file them by type so pools stay clean
      const file = rec.type === "status" ? "status" : rec.color;
      (byColor[file] ??= []).push(rec);
    }
  }
  for (const list of Object.values(byColor)) list.sort((a, b) => a.id.localeCompare(b.id));
  return { byColor, unresolved };
}
