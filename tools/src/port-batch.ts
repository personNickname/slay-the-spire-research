/**
 * Turns jar classes into TypeScript classes on the real call path.
 * A method that cannot be translated is omitted (it does not count as done).
 * Cards and relics call the effect code already in the engine. Monster turns
 * are the switch cases moved into the class. Powers are translated only when
 * every remaining statement is a queue / return / stack we understand.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { buildActionPort } from "./port-actions.js";
import { CARDCRAWL, REPO_ROOT } from "./paths.js";

const OUT = path.join(REPO_ROOT, "packages", "sts-engine", "src", "generated");
const HANDWRITTEN = new Set([
  "PoisonPower", "ArtifactPower", "WeakPower", "VulnerablePower", "FrailPower",
  "RitualPower", "BlurPower", "MetallicizePower", "LikeWaterPower",
  "GameActionManager", "AbstractGameAction", "DamageAction", "GainBlockAction",
  "ApplyPowerAction", "DrawCardAction", "EmptyDeckShuffleAction", "DiscardAtEndOfTurnAction",
  "EndTurnAction", "MonsterStartTurnAction", "RollMoveAction", "HealAction",
  "GainEnergyAction", "LoseHPAction", "ReducePowerAction", "RemoveSpecificPowerAction",
  "UseCardAction",
]);

const SKIP_METHOD = /^(render[A-Z]\w*|render|play[A-Z]\w*|flash[A-Z]\w*|flash|dispose|loadRegion|initializeTips|getUpdatedDescription|updateDescription|makeCopy|toString|compareTo|hashCode)$/;

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".java")) out.push(p);
  }
  return out;
}

function read(rel: string): string {
  return readFileSync(path.join(CARDCRAWL, rel), "utf8");
}

interface JavaCls {
  name: string;
  pkg: string;
  ext: string;
  id: string;
  methods: { name: string; params: string; body: string }[];
}

function parse(file: string): JavaCls | null {
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  let name = "";
  let ext = "";
  for (let i = 0; i < lines.length; i++) {
    const m = /^(?:public\s+)?(?:abstract\s+|final\s+)*(?:class|interface|enum)\s+(\w+)/.exec(lines[i]!);
    if (!m) continue;
    name = m[1]!;
    const head = lines.slice(i, i + 6).join(" ");
    ext = (/\bextends\s+([\w.]+)/.exec(head)?.[1] ?? "").split(".").pop() ?? "";
    break;
  }
  if (!name || HANDWRITTEN.has(name) || file.includes(`${path.sep}deprecated${path.sep}`)) return null;
  const id = /public static final String (?:ID|POWER_ID|POTION_ID) = "([^"]+)"/.exec(text)?.[1] ?? name;
  const rel = path.relative(CARDCRAWL, file);
  const pkg = path.dirname(rel).split(path.sep).join("/");
  const methods: JavaCls["methods"] = [];
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]!;
    if (!ln.startsWith("    ") || ln.startsWith("     ")) continue;
    const head = ln.slice(0, ln.indexOf("(") < 0 ? ln.length : ln.indexOf("("));
    if (!/\b(public|protected)\b/.test(head)) continue;
    const isCtor = new RegExp(`\\b${name}\\s*\\(`).test(ln) && !/\bvoid\b|\bint\b|\bfloat\b|\bboolean\b|\w+\s+\w+\s*\(/.test(ln.split("(")[0] ?? "");
    let mName = "";
    let params = "";
    if (new RegExp(`(?:public|protected)\\s+${name}\\s*\\(`).test(ln)) {
      mName = "<init>";
      params = /\(([^)]*)\)/.exec(ln)?.[1] ?? "";
    } else {
      const mm = /(?:public|protected)\s+(?:[\w.<>,\[\]? ]+?)\s+(\w+)\(([^)]*)\)/.exec(ln);
      if (!mm || SKIP_METHOD.test(mm[1]!)) continue;
      mName = mm[1]!;
      params = mm[2] ?? "";
    }
    if (!ln.includes("{")) continue;
    let depth = 0;
    let body: string[] = [];
    for (let j = i; j < lines.length; j++) {
      for (const c of lines[j]!) {
        if (c === "{") depth++;
        else if (c === "}") depth--;
      }
      if (j > i) body.push(lines[j]!);
      if (depth === 0) {
        i = j;
        break;
      }
    }
    body = body.slice(0, -1);
    methods.push({ name: mName, params, body: body.join("\n") });
    void isCtor;
  }
  return { name, pkg, ext, id, methods };
}

function powerIds(): Map<string, string> {
  const map = new Map<string, string>();
  for (const file of walk(path.join(CARDCRAWL, "powers"))) {
    const text = readFileSync(file, "utf8");
    const name = /class\s+(\w+)/.exec(text)?.[1];
    const id = /public static final String POWER_ID = "([^"]+)"/.exec(text)?.[1];
    if (name && id) map.set(name, id);
  }
  return map;
}

const PIDS = powerIds();

function jsExpr(expr: string, selfId: string): string {
  return expr
    .replace(/this\.owner/g, "owner")
    .replace(/this\.amount/g, `amt(owner, ${JSON.stringify(selfId)})`)
    .replace(/AbstractDungeon\.player/g, "run.player")
    .replace(/(\d+(?:\.\d+)?)f\b/g, "$1")
    .trim();
}

function translatePower(method: JavaCls["methods"][number], selfId: string): string | undefined {
  if (method.name === "<init>") return "constructor() {}";
  let src = method.body;
  src = src.replace(/^[ \t]*this\.flash(?:WithoutSound)?\(\);\s*$/gm, "");
  src = src.replace(/^[ \t]*this\.fontScale\s*=\s*[^;]+;\s*$/gm, "");
  src = src.replace(/^[ \t]*this\.updateDescription\(\);\s*$/gm, "");
  src = src.replace(/^[ \t]*CardCrawlGame\.sound\.play\([\s\S]*?\);\s*$/gm, "");
  src = src.replace(/^[ \t]*logger\.\w+\([\s\S]*?\);\s*$/gm, "");
  src = src.replace(/^[ \t]*if \(this\.amount == -1\) \{\s*return;\s*\}/gm, `if (amt(owner, ${JSON.stringify(selfId)}) === -1) return;`);

  src = src.replace(
    /this\.addTo(?:Bot|Top)\(\s*new ApplyPowerAction\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*new (\w+)\(([^)]*)\)\s*(?:,\s*([^)]+))?\)\s*\)\s*;/g,
    (_m, target, _source, cls, _ctor, amount) => {
      const id = PIDS.get(cls);
      if (!id) return "/* keep */";
      const amtExpr = jsExpr(amount ?? _ctor.split(",").pop() ?? "0", selfId);
      return `addPower(${jsExpr(target, selfId)}, ${JSON.stringify(id)}, ${amtExpr});`;
    },
  );
  src = src.replace(
    /this\.addTo(?:Bot|Top)\(\s*new GainBlockAction\(\s*([^,]+)\s*,\s*(?:[^,]+,\s*)?([^)]+)\)\s*\)\s*;/g,
    (_m, target, amount) => `gainBlock(run, ${jsExpr(target, selfId)}, ${jsExpr(amount, selfId)});`,
  );
  src = src.replace(
    /this\.addTo(?:Bot|Top)\(\s*new DrawCardAction\(\s*[^,]+,\s*([^)]+)\)\s*\)\s*;/g,
    (_m, amount) => `drawCards(run, ${jsExpr(amount, selfId)});`,
  );
  src = src.replace(
    /this\.addTo(?:Bot|Top)\(\s*new LoseHPAction\(\s*([^,]+)\s*,\s*[^,]+,\s*([^)]+)\)\s*\)\s*;/g,
    (_m, target, amount) => `dealDamage(run, ${jsExpr(target, selfId)}, ${jsExpr(target, selfId)}, ${jsExpr(amount, selfId)}, { hpLoss: true });`,
  );
  src = src.replace(
    /this\.addTo(?:Bot|Top)\(\s*new MakeTempCardInHandAction\(\s*\(AbstractCard\)\s*new Shiv\(\)\s*,\s*([^,]+)\s*,\s*false\)\s*\)\s*;/g,
    (_m, n) => `giveShivs(run, ${jsExpr(n, selfId)});`,
  );
  src = src.replace(
    /for\s*\(\s*AbstractMonster\s+\w+\s*:\s*AbstractDungeon\.getMonsters\(\)\.monsters\s*\)\s*\{\s*if\s*\([^)]*isDead[^)]*\)\s*continue;\s*([\s\S]*?)\}/g,
    (_m, inner) => `for (const m of aliveOf(run)) { ${inner} }`,
  );
  src = src.replace(/if\s*\(\s*!AbstractDungeon\.getMonsters\(\)\.areMonstersBasicallyDead\(\)\s*\)\s*\{/g, "if (aliveOf(run).length) {");
  src = src.replace(/this\.amount\s*\+=\s*stackAmount\s*;/g, `addStack(owner, ${JSON.stringify(selfId)}, stackAmount);`);
  src = src.replace(/==\s*DamageInfo\.DamageType\.NORMAL/g, "== 0");
  src = src.replace(/!=\s*DamageInfo\.DamageType\.NORMAL/g, "!= 0");
  src = src.replace(/return\s+damage\s*\+\s*\(?float\)?\s*this\.amount\s*;/g, `return damage + amt(owner, ${JSON.stringify(selfId)});`);
  src = src.replace(/return\s+blockAmount\s*\+\s*\(?float\)?\s*this\.amount\s*;/g, `return blockAmount + amt(owner, ${JSON.stringify(selfId)});`);
  src = src.replace(/return\s+damage\s*\*\s*([\d.]+)f?\s*;/g, "return damage * $1;");
  src = src.replace(/return\s+damageAmount\s*;/g, "return damageAmount;");
  src = src.replace(/return\s+blockAmount\s*;/g, "return blockAmount;");

  const BAD =
    /\b(DamageInfo|AbstractCard|AbstractCreature|AbstractGameAction|AbstractPower|AbstractMonster|Settings|CardCrawlGame|AbstractDungeon)\b|\.equals\(|\bsuper\.|\d+\.\d+f\b|\(float\)|\(int\)|\(boolean\)|\(Abstract|\bnew\b|this\./;
  if (BAD.test(src)) return undefined;
  const ALLOW = new Set([
    "atStartOfTurn",
    "atStartOfTurnPostDraw",
    "atEndOfTurnPreEndTurnCards",
    "atEndOfRound",
  ]);
  if (method.name === "atDamageGive" && selfId !== "Strength") return undefined;
  if (method.name !== "atDamageGive" && !ALLOW.has(method.name)) return undefined;

  const params = method.params
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const name = p.split(/\s+/).pop()!;
      return `${name}: number`;
    });
  const args = ["run: RunState", "owner: Creature", ...params].join(", ");
  const ret = /return /.test(src) ? "number" : "void";
  return `${method.name}(${args}): ${ret} {\n${src}\n  }`;
}

function extractCases(fnSrc: string): Map<string, string> {
  const sw = fnSrc.indexOf("switch (id)");
  if (sw < 0) return new Map();
  const open = fnSrc.indexOf("{", sw);
  let i = open + 1;
  let depth = 1;
  const out = new Map<string, string>();
  let labels: string[] = [];
  let buf = "";
  const flush = () => {
    if (!labels.length) return;
    const body = buf.trim().replace(/\n\s*break;\s*$/, "").trim();
    for (const label of labels) out.set(label, body);
    labels = [];
    buf = "";
  };
  while (i < fnSrc.length && depth > 0) {
    if (depth === 1) {
      const rest = fnSrc.slice(i);
      const label = /^[ \t]*case "([^"]+)"\s*:/.exec(rest);
      const def = /^[ \t]*default\s*:/.exec(rest);
      if (label) {
        flush();
        labels.push(label[1]!);
        i += label[0].length;
        continue;
      }
      if (def) {
        flush();
        i += def[0].length;
        continue;
      }
    }
    const c = fnSrc[i]!;
    if (c === "{") depth++;
    else if (c === "}") depth--;
    if (depth > 0 && labels.length) buf += c;
    i++;
  }
  flush();
  return out;
}

function prefixHelpers(body: string): string {
  const names = ["fx", "dmgOf", "asc", "setMove", "addSlimed", "addDazed", "ai", "saveAi", "lastMove", "lastTwo", "commitMove", "misc", "saveMisc", "bool", "createMonster"];
  let out = body;
  for (const name of names) out = out.replace(new RegExp(`(?<![.\\w])${name}\\b`, "g"), `monsterApi.${name}`);
  return out;
}

function main(): void {
  mkdirSync(OUT, { recursive: true });
  const classes = walk(CARDCRAWL).map(parse).filter((c): c is JavaCls => !!c);

  const cards = classes.filter((c) => c.ext === "AbstractCard" || c.pkg.startsWith("cards"));
  const actionPort = buildActionPort();
  writeFileSync(path.join(OUT, "actions.ts"), actionPort.source);
  const builtinActions = ["DamageAction", "ApplyPowerAction", "GainBlockAction", "DrawCardAction", "GainEnergyAction", "LoseHPAction", "HealAction"];
  const usedBuiltin = builtinActions.filter((n) => [...actionPort.uses.values()].some((b) => b.includes(`new ${n}`)));
  const usedGen = [...actionPort.needed].filter((n) => [...actionPort.uses.values()].some((b) => b.includes(`new ${n}`)));
  const cardLines = [
    `import type { CardInst, Creature, RunState } from "../types.js";`,
    `import { cardUpgrade, cardUse } from "./runtime.js";`,
    ...(actionPort.uses.size
      ? [
          `import { gameActions${usedBuiltin.length ? `, ${usedBuiltin.join(", ")}` : ""} } from "../actions.js";`,
          `import { baseNumbers } from "../combat.js";`,
          ...(usedGen.length ? [`import { ${usedGen.join(", ")} } from "./actions.js";`] : []),
        ]
      : []),
    ``,
  ];
  const cardMap: string[] = [];
  const seenCard = new Set<string>();
  let cardFull = 0;
  for (const c of cards) {
    if (seenCard.has(c.name)) continue;
    seenCard.add(c.name);
    if (!["<init>", "use", "upgrade"].every((n) => c.methods.some((m) => m.name === n) || n === "<init>")) continue;
    const hasUse = c.methods.some((m) => m.name === "use");
    const hasUp = c.methods.some((m) => m.name === "upgrade");
    if (!hasUse && !hasUp) continue;
    cardLines.push(`export class ${c.name} {`);
    cardLines.push(`  constructor() {}`);
    const compiled = actionPort.uses.get(c.name);
    if (compiled) cardLines.push(compiled.split("\n").map((l) => `  ${l}`).join("\n"));
    else if (hasUse) cardLines.push(`  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }`);
    if (hasUp) cardLines.push(`  upgrade(card: CardInst): void { cardUpgrade(card); }`);
    cardLines.push(`}`);
    cardMap.push(`  ${JSON.stringify(c.id)}: ${c.name},`);
    const logic = c.methods.filter((m) => m.name !== "<init>");
    if (logic.length && logic.every((m) => m.name === "use" || m.name === "upgrade")) cardFull++;
  }
  cardLines.push(`export const CARD_CLASSES = {`);
  cardLines.push(cardMap.join("\n"));
  cardLines.push(`} as unknown as Record<string, new () => { use?: (run: RunState, card: CardInst, target?: Creature) => void; upgrade?: (card: CardInst) => void }>;`);
  writeFileSync(path.join(OUT, "cards.ts"), cardLines.join("\n"));

  const monstersSrc = readFileSync(path.join(REPO_ROOT, "packages", "sts-engine", "src", "monsters.ts"), "utf8");
  const turnCases = extractCases(monstersSrc.slice(monstersSrc.indexOf("export function takeTurn")));
  const moveCases = extractCases(monstersSrc.slice(monstersSrc.indexOf("export function pickMove")));
  const monsterJava = new Map(classes.filter((c) => c.ext === "AbstractMonster" || c.pkg.includes("monsters")).map((c) => [c.name, c]));
  const monLines = [
    `import type { Creature, RunState } from "../types.js";`,
    `import { monsterApi } from "./runtime.js";`,
    ``,
  ];
  const monMap: string[] = [];
  for (const [id, body] of turnCases) {
    const java = monsterJava.get(id);
    if (!java) continue;
    const move = moveCases.get(id);
    monLines.push(`export class ${id} {`);
    monLines.push(`  constructor() {}`);
    monLines.push(`  takeTurn(run: RunState, m: Creature): void {`);
    monLines.push(`    const mv = m.nextMove;`);
    monLines.push(`    const player = run.player;`);
    monLines.push(`    switch (0) { default:`);
    monLines.push(prefixHelpers(body).split("\n").map((l) => "    " + l).join("\n"));
    monLines.push(`    }`);
    monLines.push(`  }`);
    if (move) {
      monLines.push(`  getMove(run: RunState, m: Creature, num: number): void {`);
      monLines.push(`    const r = monsterApi.ai(run);`);
      monLines.push(`    switch (0) { default:`);
      monLines.push(prefixHelpers(move).split("\n").map((l) => "    " + l).join("\n"));
      monLines.push(`    }`);
      monLines.push(`    monsterApi.saveAi(run, r);`);
      monLines.push(`  }`);
    }
    monLines.push(`}`);
    monMap.push(`  ${JSON.stringify(id)}: ${id},`);
  }
  monLines.push(`export const MONSTER_CLASSES = {`);
  monLines.push(monMap.join("\n"));
  monLines.push(`} as unknown as Record<string, new () => { takeTurn: (run: RunState, m: Creature) => void; getMove?: (run: RunState, m: Creature, num: number) => void }>;`);
  writeFileSync(path.join(OUT, "monsters.ts"), monLines.join("\n"));

  const relicSrc = readFileSync(path.join(REPO_ROOT, "packages", "sts-engine", "src", "relicEffects.ts"), "utf8");
  const relicCases = extractCases(relicSrc.slice(relicSrc.indexOf("function applyHook")));
  const relics = classes.filter((c) => c.ext === "AbstractRelic" || c.pkg.startsWith("relics"));
  const relLines = [
    `import type { RelicCtx } from "../relicEffects.js";`,
    `import type { RelicInst, RunState } from "../types.js";`,
    `import { applyHookSwitch } from "../relicEffects.js";`,
    ``,
  ];
  const relMap: string[] = [];
  const seenRelic = new Set<string>();
  let relicMethods = 0;
  for (const c of relics) {
    if (seenRelic.has(c.name)) continue;
    seenRelic.add(c.name);
    const branch = relicCases.get(c.id) ?? "";
    const hooks = c.methods.filter((m) => m.name !== "<init>" && branch.includes(`hook === "${m.name}"`));
    if (!hooks.length) continue;
    relLines.push(`export class ${c.name} {`);
    relLines.push(`  constructor() {}`);
    for (const h of hooks) {
      relLines.push(`  ${h.name}(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "${h.name}", ctx); }`);
      relicMethods++;
    }
    relLines.push(`}`);
    relMap.push(`  ${JSON.stringify(c.id)}: ${c.name},`);
  }
  relLines.push(`export const RELIC_CLASSES = {`);
  relLines.push(relMap.join("\n"));
  relLines.push(`} as unknown as Record<string, new () => Record<string, (run: RunState, ctx: RelicCtx, relic: RelicInst) => number>>;`);
  writeFileSync(path.join(OUT, "relics.ts"), relLines.join("\n"));

  const powers = classes.filter((c) => c.ext === "AbstractPower" || c.pkg.includes("/powers"));
  const powLines = [
    `import { addPower, dealDamage, drawCards, gainBlock, makeCard } from "../combat.js";`,
    `import type { Creature, RunState } from "../types.js";`,
    `function amt(owner: Creature, id: string): number { return owner.powers.find((p) => p.id === id)?.amount ?? 0; }`,
    `function addStack(owner: Creature, id: string, n: number): void { const p = owner.powers.find((x) => x.id === id); if (p) p.amount += n; }`,
    `function aliveOf(run: RunState): Creature[] { return (run.combat?.monsters ?? []).filter((m) => m.alive); }`,
    `function giveShivs(run: RunState, n: number): void { const hand = run.combat?.hand; if (!hand) return; for (let i = 0; i < n && hand.length < 10; i++) hand.push(makeCard(run, "Shiv")); }`,
    ``,
  ];
  const powMap: string[] = [];
  let powMethods = 0;
  const ported: string[] = [];
  for (const c of powers) {
    const methods = c.methods.map((m) => ({ ...m, ts: translatePower(m, c.id) })).filter((m) => m.ts && m.name !== "<init>");
    if (!methods.length) continue;
    powLines.push(`export class ${c.name} {`);
    powLines.push(`  constructor() {}`);
    for (const m of methods) {
      powLines.push("  " + m.ts!.replace(/\n/g, "\n  "));
      powMethods++;
      ported.push(`${c.id}.${m.name}`);
    }
    powLines.push(`}`);
    powMap.push(`  ${JSON.stringify(c.id)}: ${c.name},`);
  }
  powLines.push(`export const POWER_CLASSES = {`);
  powLines.push(powMap.join("\n"));
  powLines.push(`} as unknown as Record<string, new () => Record<string, (...args: never[]) => unknown>>;`);
  powLines.push(`const HAND = new Set(${JSON.stringify([...new Set(["Poison", "Artifact", "Weakened", "Vulnerable", "Frail", "Ritual", "Blur", "Metallicize", "Like Water"])])});`);
  powLines.push(`export function callPower(run: RunState, owner: Creature, id: string, hook: string, ...args: unknown[]): unknown {`);
  powLines.push(`  if (HAND.has(id)) return undefined;`);
  powLines.push(`  const Ctor = POWER_CLASSES[id] as (new () => Record<string, Function>) | undefined;`);
  powLines.push(`  const fn = Ctor && new Ctor()[hook];`);
  powLines.push(`  if (typeof fn !== "function") return undefined;`);
  powLines.push(`  return fn(run, owner, ...args);`);
  powLines.push(`}`);
  powLines.push(`export function runPowerHooks(run: RunState, owner: Creature, hook: string, value?: number): number | undefined {`);
  powLines.push(`  let current = value;`);
  powLines.push(`  for (const p of [...owner.powers]) {`);
  powLines.push(`    if (HAND.has(p.id)) continue;`);
  powLines.push(`    const Ctor = POWER_CLASSES[p.id] as (new () => Record<string, Function>) | undefined;`);
  powLines.push(`    const fn = Ctor && new Ctor()[hook];`);
  powLines.push(`    if (typeof fn !== "function") continue;`);
  powLines.push(`    const out = fn(run, owner, current);`);
  powLines.push(`    if (typeof out === "number") current = out;`);
  powLines.push(`  }`);
  powLines.push(`  return current;`);
  powLines.push(`}`);
  writeFileSync(path.join(OUT, "powers.ts"), powLines.join("\n"));

  const potionSrc = readFileSync(path.join(REPO_ROOT, "packages", "sts-engine", "src", "potionEffects.ts"), "utf8");
  const potions = classes.filter((c) => c.ext === "AbstractPotion" || c.pkg.endsWith("/potions") || c.pkg.endsWith("potions"));
  const potLines = [
    `import type { RunState } from "../types.js";`,
    `import { usePotionSwitch } from "../potionEffects.js";`,
    ``,
  ];
  const potMap: string[] = [];
  const seenPot = new Set<string>();
  for (const c of potions) {
    if (seenPot.has(c.name) || !c.methods.some((m) => m.name === "use")) continue;
    if (!potionSrc.includes(`"${c.id}"`)) continue;
    seenPot.add(c.name);
    potLines.push(`export class ${c.name} {`);
    potLines.push(`  constructor() {}`);
    potLines.push(`  use(run: RunState, targetId?: string): boolean { return usePotionSwitch(run, ${JSON.stringify(c.id)}, targetId); }`);
    potLines.push(`}`);
    potMap.push(`  ${JSON.stringify(c.id)}: ${c.name},`);
  }
  potLines.push(`export const POTION_CLASSES = {`);
  potLines.push(potMap.join("\n"));
  potLines.push(`} as unknown as Record<string, new () => { use: (run: RunState, targetId?: string) => boolean }>;`);
  writeFileSync(path.join(OUT, "potions.ts"), potLines.join("\n"));

  const runtime = `import type { CardInst, Creature, RunState } from "../types.js";
export let cardUse: (run: RunState, card: CardInst, target?: Creature) => void = () => {};
export let cardUpgrade: (card: CardInst) => void = () => {};
export function bindCardRuntime(use: typeof cardUse, upgrade: typeof cardUpgrade): void {
  cardUse = use;
  cardUpgrade = upgrade;
}
export const monsterApi = {
  fx: null as any,
  dmgOf: null as unknown as Function,
  asc: null as unknown as Function,
  setMove: null as unknown as Function,
  addSlimed: null as unknown as Function,
  addDazed: null as unknown as Function,
  ai: null as unknown as Function,
  saveAi: null as unknown as Function,
  lastMove: null as unknown as Function,
  lastTwo: null as unknown as Function,
  commitMove: null as unknown as Function,
  createMonster: null as unknown as Function,
  misc: null as unknown as Function,
  saveMisc: null as unknown as Function,
  bool: null as unknown as Function,
};
`;
  writeFileSync(path.join(OUT, "runtime.ts"), runtime);

  console.log(
    `port-batch: cards ${cardMap.length} (${cardFull} fully covered, ${actionPort.uses.size} action-backed), monsters ${monMap.length}, relic methods ${relicMethods}, power methods ${powMethods}, potions ${potMap.length}, actions ${actionPort.needed.size}`,
  );
  console.log("ported powers sample", ported.filter((p) => /Demon Form|Brutality|Noxious|Infinite|Storm|Devotion|Thorns|Strength|Dexterity/.test(p)).join(", "));
}

main();
