/**
 * Entity enumeration for the review page: characters, the card / relic / potion
 * pools each hero actually owns, and the trigger fingerprint of every power.
 *
 * Emitted as review/entity-data.js (window.ENTITY_DATA). Identifiers, line
 * numbers and localization names only — no decompiled method bodies.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CARDCRAWL, REVIEW_DIR } from "./paths.js";
import { text } from "./localization.js";

const SKIP_METHOD = new Set([
  "makeCopy", "getUpdatedDescription", "updateDescription", "playApplyPowerSfx",
  "renderIcons", "renderAmount", "update", "updateParticles", "flash", "flashWithoutSound",
  "compareTo", "toString", "loadRegion", "initializeData", "initializeTips", "playLandingSFX",
  "render", "renderTip", "spawn", "getPrice",
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walk(p, out);
    else if (name.name.endsWith(".java")) out.push(p);
  }
  return out;
}

function read(rel: string): string {
  return readFileSync(path.join(CARDCRAWL, rel), "utf8");
}

interface Meth { name: string; line: number; body: string }

/** Methods whose `{` sits directly after a public/protected signature. */
function methods(src: string): Meth[] {
  const out: Meth[] = [];
  let i = 0;
  while (i < src.length) {
    const brace = src.indexOf("{", i);
    if (brace < 0) break;
    const head = src.slice(Math.max(0, brace - 500), brace);
    const sig = /([A-Za-z_]\w*)\s*\([^;{}]*\)\s*$/.exec(head);
    const vis = Math.max(head.lastIndexOf("public"), head.lastIndexOf("protected"));
    const keyword = sig && ["if", "for", "while", "switch", "catch", "synchronized"].includes(sig[1]);
    if (!sig || keyword || vis < 0 || vis < head.length - 420 || head.indexOf(sig[1], vis) < 0) {
      i = brace + 1;
      continue;
    }
    let depth = 1;
    let j = brace + 1;
    while (j < src.length && depth) {
      const c = src[j];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      j++;
    }
    out.push({ name: sig[1], line: src.slice(0, brace).split("\n").length, body: src.slice(brace + 1, j - 1) });
    i = j;
  }
  return out;
}

function bodyOf(src: string, signature: string): string {
  const at = src.indexOf(signature);
  if (at < 0) return "";
  const brace = src.indexOf("{", at);
  let depth = 1;
  let j = brace + 1;
  while (j < src.length && depth) {
    const c = src[j];
    if (c === "{") depth++;
    else if (c === "}") depth--;
    j++;
  }
  return src.slice(brace + 1, j - 1);
}

function fingerprint(body: string): string {
  const bits: string[] = [];
  const seen = new Set<string>();
  const q = /addTo(Bot|Top)\s*\(\s*new\s+([A-Za-z0-9_]+)/g;
  let m: RegExpExecArray | null;
  while ((m = q.exec(body))) {
    const s = (m[1] === "Bot" ? "B:" : "T:") + m[2];
    if (!seen.has(s)) { seen.add(s); bits.push(s); }
  }
  const powers: string[] = [];
  const pw = /new\s+([A-Za-z0-9_]*Power)\s*\(/g;
  while ((m = pw.exec(body))) if (!powers.includes(m[1])) powers.push(m[1]);
  if (powers.length) bits.push("[" + powers.join(",") + "]");
  for (const c of ["heal", "damage", "gainGold", "loseGold", "gainEnergy", "addBlock", "increaseMaxHp", "decreaseMaxHp", "obtainPotion"]) {
    if (new RegExp("\\." + c + "\\s*\\(").test(body)) bits.push(c);
  }
  const mults = [...new Set([...body.matchAll(/return\s+([\w.]+)\s*\*\s*([\d.]+)f?/g)].map((m) => `${m[1]}*${m[2]}`))];
  if (mults.length) bits.push("return " + mults.join(" | "));
  else if (/return\s+[\w.]+\s*\+/.test(body)) bits.push("return x+…");
  else if (/return\s+false\b/.test(body)) bits.push("return false");
  else if (/return\s+true\b/.test(body)) bits.push("return true");
  if (/\.channelOrb\s*\(/.test(body)) bits.push("channelOrb");
  if (/potionSlots\s*[+\-]=|[+\-]{2}[^\n]{0,60}potionSlots/.test(body)) bits.push("potionSlots±");
  if (/energyMaster\s*[+\-]=|[+\-]{2}[^\n]{0,80}energyMaster/.test(body)) bits.push("energyMaster±");
  if (!bits.length && /this\.amount\s*[+\-]=/.test(body)) bits.push("amount±");
  return bits.join(" ");
}

function clean(parts: string[] | undefined): string {
  if (!parts) return "";
  return parts
    .join(" / ")
    .replace(/#./g, "")
    .replace(/\s*NL\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function zhs(file: string, id: string): string {
  return text("zhs", file, id) ?? text("eng", file, id) ?? "";
}

function indexByClass(dir: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const file of walk(path.join(CARDCRAWL, dir))) map.set(path.basename(file, ".java"), file);
  return map;
}

/* ------------------------------------------------------------------ characters */
const HEROES: Array<[string, string, string]> = [
  ["IRONCLAD", "Ironclad", "铁甲战士"],
  ["THE_SILENT", "TheSilent", "静默猎手"],
  ["DEFECT", "Defect", "故障机器人"],
  ["WATCHER", "Watcher", "观者"],
];

const characters = HEROES.map(([id, cls, name]) => {
  const src = read(`characters/${cls}.java`);
  const load = /new CharSelectInfo\([^,]+,[^,]+,\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)/.exec(src);
  const energy = /new EnergyManager\((\d+)\)/.exec(src);
  const color = /CardColor\.(\w+)/.exec(src);
  const deckBody = bodyOf(src, "getStartingDeck()");
  const relicBody = bodyOf(src, "getStartingRelics()");
  const deck = [...deckBody.matchAll(/retVal\.add\("([^"]+)"\)/g)].map((m) => m[1]);
  const relics = [...relicBody.matchAll(/retVal\.add\("([^"]+)"\)/g)].map((m) => m[1]);
  const deckLine = src.slice(0, src.indexOf("getStartingDeck()")).split("\n").length;
  return {
    id, cls, name,
    color: color?.[1] ?? "",
    hp: load ? Number(load[2]) : 0,
    orbs: load ? Number(load[3]) : 0,
    gold: load ? Number(load[4]) : 0,
    draw: load ? Number(load[5]) : 0,
    energy: energy ? Number(energy[1]) : 0,
    potionSlots: 3,
    relics: relics.map((rid) => [rid, zhs("relics", rid)]),
    deck: deck.map((cid) => [cid, zhs("cards", cid)]),
    deckLine,
  };
});

/* ------------------------------------------------------------------ cards */
const library = read("helpers/CardLibrary.java");
const cardFiles = indexByClass("cards");
const cardPools: Array<[string, string]> = [
  ["red", "void addRedCards()"],
  ["green", "void addGreenCards()"],
  ["blue", "void addBlueCards()"],
  ["purple", "void addPurpleCards()"],
  ["colorless", "void addColorlessCards()"],
  ["curse", "void addCurseCards()"],
];
const cards: Array<[string, string, string, string, string, string, string]> = [];
let cardsMissing = 0;
for (const [pool, sig] of cardPools) {
  for (const m of bodyOf(library, sig).matchAll(/new\s+([A-Za-z0-9_]+)\s*\(/g)) {
    const file = cardFiles.get(m[1]);
    if (!file) { cardsMissing++; cards.push([m[1], "", "", "", "", pool, ""]); continue; }
    const src = readFileSync(file, "utf8");
    const id = /public static final String ID = "([^"]+)"/.exec(src)?.[1] ?? "";
    const color = /CardColor\.(\w+)/.exec(src)?.[1] ?? "";
    const rarity = /CardRarity\.(\w+)/.exec(src)?.[1] ?? "";
    const type = /CardType\.(\w+)/.exec(src)?.[1] ?? "";
    const deprecated = file.includes(`${path.sep}deprecated${path.sep}`) ? "1" : "";
    cards.push([id || m[1], id ? zhs("cards", id) : "", color, rarity, type, pool, deprecated]);
  }
}

/* ------------------------------------------------------------------ relics */
const relicFiles = indexByClass("relics");
const relicSrc = read("helpers/RelicLibrary.java");
const init = bodyOf(relicSrc, "public static void initialize()");
const POOL_OF: Record<string, string> = { add: "shared", addRed: "red", addGreen: "green", addBlue: "blue", addPurple: "purple" };
const relics: Array<[string, string, string, string, string, string]> = [];
let relicsMissing = 0;
for (const m of init.matchAll(/RelicLibrary\.(add|addRed|addGreen|addBlue|addPurple)\(\s*new\s+([A-Za-z0-9_]+)\s*\(/g)) {
  const file = relicFiles.get(m[2]);
  if (!file) { relicsMissing++; continue; }
  const src = readFileSync(file, "utf8");
  const id = /public static final String ID = "([^"]+)"/.exec(src)?.[1] ?? "";
  const tier = /RelicTier\.(\w+)/.exec(src)?.[1] ?? "";
  const triggers = methods(src)
    .filter((mm) => !SKIP_METHOD.has(mm.name) && mm.name !== m[2])
    .map((mm) => {
      const fp = fingerprint(mm.body);
      return fp ? `${mm.name}@${mm.line} ${fp}` : "";
    })
    .filter(Boolean)
    .join(" | ");
  relics.push([id || m[2], id ? zhs("relics", id) : "", m[2], tier, POOL_OF[m[1]] ?? m[1], triggers]);
}

/* ------------------------------------------------------------------ potions */
const potionFiles = indexByClass("potions");
const helper = read("helpers/PotionHelper.java");
const listBody = bodyOf(helper, "getPotions(AbstractPlayer.PlayerClass c, boolean getAll)");
const exclusive = new Map<string, string>();
const branches: Array<[string, string]> = [["IRONCLAD", "red"], ["THE_SILENT", "green"], ["DEFECT", "blue"], ["WATCHER", "purple"]];
for (const [hero, pool] of branches) {
  const chunk = listBody.slice(listBody.indexOf(`case ${hero}`), listBody.indexOf("break;", listBody.indexOf(`case ${hero}`)));
  for (const m of chunk.matchAll(/retVal\.add\("([^"]+)"\)/g)) exclusive.set(m[1], pool);
}
const factory = bodyOf(helper, "getPotion(String name)");
const potions: Array<[string, string, string, string, string, string, string, string, string]> = [];
let potionsMissing = 0;
for (const m of factory.matchAll(/case "([^"]+)":[\s\S]*?return new ([A-Za-z0-9_]+)\(\)/g)) {
  const [id, cls] = [m[1], m[2]];
  if (id === "Potion Slot") continue;
  const file = potionFiles.get(cls);
  if (!file) { potionsMissing++; continue; }
  const src = readFileSync(file, "utf8");
  const rarity = /PotionRarity\.(\w+)/.exec(src)?.[1] ?? "";
  const thrown = /this\.isThrown\s*=\s*true/.test(src) ? "1" : "";
  const target = /this\.targetRequired\s*=\s*true/.test(src) ? "1" : "";
  const ms = methods(src);
  const potBody = ms.filter((mm) => mm.name === "getPotency").sort((a, b) => b.body.length - a.body.length)[0];
  const potency = potBody
    ? [...potBody.body.matchAll(/return\s+([^;]+);/g)].map((r) => r[1].replace(/\s+/g, " ").trim()).join(" | ")
    : "";
  const use = ms.find((mm) => mm.name === "use");
  const can = ms.find((mm) => mm.name === "canUse");
  const effect = [use ? fingerprint(use.body) : "", can ? "canUse " + fingerprint(can.body) : ""].filter(Boolean).join(" | ");
  potions.push([
    id, zhs("potions", id), cls, rarity, exclusive.get(id) ?? "shared",
    potency, thrown, target, effect,
  ]);
}

/* ------------------------------------------------------------------ powers */
const powerFiles = walk(path.join(CARDCRAWL, "powers"));
const powers: Array<[string, string, string, string, string, string, string, string]> = [];
for (const file of powerFiles) {
  const src = readFileSync(file, "utf8");
  if (!/extends\s+AbstractPower\b/.test(src)) continue;
  const cls = path.basename(file, ".java");
  const id = /(?:POWER_ID|public static final String ID)\s*=\s*"([^"]+)"/.exec(src)?.[1] ?? "";
  const types = [...src.matchAll(/this\.type\s*=\s*AbstractPower\.PowerType\.(\w+)/g)].map((m) => m[1]);
  const uniq = [...new Set(types)];
  let type = uniq.length === 0 ? "BUFF*" : uniq.join("/");
  if (uniq.length > 1) type += "±";
  const turn = /this\.isTurnBased\s*=\s*true/.test(src) ? "1" : "";
  const priority = /this\.priority\s*=\s*(-?\d+)/.exec(src)?.[1] ?? "5";
  const triggers = methods(src)
    .filter((mm) => !SKIP_METHOD.has(mm.name) && mm.name !== cls)
    .map((mm) => {
      const fp = fingerprint(mm.body);
      return fp ? `${mm.name}@${mm.line} ${fp}` : "";
    })
    .filter(Boolean)
    .join(" | ");
  const deprecated = file.includes(`${path.sep}deprecated${path.sep}`) || cls.startsWith("DEPRECATED") ? "1" : "";
  powers.push([id || cls, id ? zhs("powers", id) : "", cls, type, turn, priority, triggers, deprecated]);
}

/** Where some other class branches on this id. The behavior often lives there, not in the entity class. */
const cites = new Map<string, string[]>();
const citeRe = /hasPower\(\s*"([^"]+)"\s*\)|getPower\(\s*"([^"]+)"\s*\)|hasRelic\(\s*"([^"]+)"\s*\)|getRelic\(\s*"([^"]+)"\s*\)/g;
for (const file of walk(CARDCRAWL)) {
  const src = readFileSync(file, "utf8");
  const cls = path.basename(file, ".java");
  let m: RegExpExecArray | null;
  citeRe.lastIndex = 0;
  while ((m = citeRe.exec(src))) {
    const id = m[1] || m[2] || m[3] || m[4];
    const list = cites.get(id) ?? [];
    const tag = `${cls}:${src.slice(0, m.index).split("\n").length}`;
    const same = list.filter((t) => t.startsWith(cls + ":")).length;
    if (same < 3 && list.length < 10) list.push(tag);
    cites.set(id, list);
  }
}
const attach = (row: string[], id: string, cls: string, slot: number) => {
  const ext = (cites.get(id) ?? []).filter((t) => !t.startsWith(cls + ":"));
  if (ext.length) row[slot] = (row[slot] ? row[slot] + " | " : "") + "外部 " + ext.join(" ");
};
for (const row of powers) attach(row, row[0], row[2], 6);
for (const row of relics) attach(row, row[0], row[2], 5);

powers.sort((a, b) => a[0].localeCompare(b[0]));
relics.sort((a, b) => a[4].localeCompare(b[4]) || a[0].localeCompare(b[0]));
potions.sort((a, b) => a[4].localeCompare(b[4]) || a[0].localeCompare(b[0]));

const data = {
  generated: new Date().toISOString(),
  note: "BUFF* = 没有给 type 赋值，沿用 AbstractPower 的默认值 BUFF，人工制品不拦截。± = updateDescription 里按层数正负改 type。",
  characters, cards, relics, potions, powers,
};
const dest = path.join(REVIEW_DIR, "entity-data.js");
writeFileSync(dest, "window.ENTITY_DATA = " + JSON.stringify(data) + ";\n");
console.log(
  `entity-index: ${characters.length} heroes, ${cards.length} cards (${cardsMissing} unresolved), ` +
  `${relics.length} relics (${relicsMissing} unresolved), ${potions.length} potions (${potionsMissing} unresolved), ` +
  `${powers.length} powers -> ${dest}`,
);