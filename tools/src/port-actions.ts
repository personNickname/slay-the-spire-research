/**
 * Card use() that only queues actions is compiled onto those action classes.
 * An action class is emitted only when a compiled use() constructs it.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { CARDCRAWL } from "./paths.js";

const VFX = new Set([
  "VFXAction", "SFXAction", "WaitAction", "TalkAction", "ShakeScreenAction",
  "TextAboveCreatureAction",
]);

const HAND = new Set([
  "DamageAction", "GainBlockAction", "ApplyPowerAction", "DrawCardAction",
  "GainEnergyAction", "LoseHPAction", "HealAction", "EmptyDeckShuffleAction",
]);

interface Call {
  top: boolean;
  name: string;
  args: string[];
}

interface Ctx {
  run: string;
  card: string;
  target: string;
  nums: string;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".java")) out.push(p);
  }
  return out;
}

function splitArgs(s: string): string[] {
  const out: string[] = [];
  let cur = "";
  let depth = 0;
  for (const c of s) {
    if (c === "(" || c === "{") depth++;
    else if (c === ")" || c === "}") depth--;
    else if (c === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function matchParen(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function matchBrace(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function methodBody(text: string, className: string, method: string): string | undefined {
  const lines = text.split(/\r?\n/);
  const sig = method === "<init>" ? new RegExp(`\\b${className}\\s*\\(`) : new RegExp(`\\b${method}\\s*\\(`);
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]!;
    if (!ln.startsWith("    ") || ln.startsWith("     ") || !ln.includes("{") || !sig.test(ln)) continue;
    if (method !== "<init>" && !/\b(public|protected)\b/.test(ln)) continue;
    let depth = 0;
    const buf: string[] = [];
    for (let j = i; j < lines.length; j++) {
      for (const c of lines[j]!) {
        if (c === "{") depth++;
        else if (c === "}") depth--;
      }
      if (j > i) buf.push(lines[j]!);
      if (depth === 0) return buf.slice(0, -1).join("\n");
    }
  }
  return undefined;
}

function unwrapDebug(body: string): string {
  const idx = body.search(/if\s*\(\s*Settings\.isDebug\s*\)/);
  if (idx < 0) return body;
  const brace = body.indexOf("{", idx);
  const end = matchBrace(body, brace);
  if (end < 0) return body;
  const after = body.slice(end + 1);
  const elseM = /^\s*else\s*\{/.exec(after);
  if (!elseM) return (body.slice(0, idx) + after).trim();
  const elseOpen = end + 1 + elseM[0].lastIndexOf("{");
  const elseEnd = matchBrace(body, elseOpen);
  if (elseEnd < 0) return body;
  return (body.slice(0, idx) + body.slice(elseOpen + 1, elseEnd) + body.slice(elseEnd + 1)).trim();
}

function stripVfx(body: string): string {
  let out = "";
  let i = 0;
  while (i < body.length) {
    const bot = body.indexOf("this.addToBot(", i);
    const top = body.indexOf("this.addToTop(", i);
    let at = -1;
    let key = 0;
    if (bot < 0 && top < 0) {
      out += body.slice(i);
      break;
    }
    if (top >= 0 && (bot < 0 || top < bot)) {
      at = top;
      key = "this.addToTop(".length;
    } else {
      at = bot;
      key = "this.addToBot(".length;
    }
    const close = matchParen(body, at + key - 1);
    if (close < 0) {
      out += body.slice(i);
      break;
    }
    const inner = body.slice(at + key, close);
    const name = /^\s*new\s+(\w+)\s*\(/.exec(inner)?.[1];
    let end = close + 1;
    if (body[end] === ";") end++;
    if (name && VFX.has(name)) out += body.slice(i, at);
    else out += body.slice(i, end);
    i = end;
  }
  return out;
}

function listCalls(body: string): Call[] | undefined {
  const calls: Call[] = [];
  const spans: [number, number][] = [];
  let i = 0;
  while (i < body.length) {
    const bot = body.indexOf("this.addToBot(", i);
    const top = body.indexOf("this.addToTop(", i);
    if (bot < 0 && top < 0) break;
    const isTop = top >= 0 && (bot < 0 || top < bot);
    const at = isTop ? top : bot;
    const key = isTop ? "this.addToTop(".length : "this.addToBot(".length;
    const close = matchParen(body, at + key - 1);
    if (close < 0) return undefined;
    const inner = body.slice(at + key, close).trim();
    const nm = /^new\s+(\w+)\s*\(([\s\S]*)\)$/.exec(inner);
    if (!nm) return undefined;
    calls.push({ top: isTop, name: nm[1]!, args: splitArgs(nm[2]!) });
    let end = close + 1;
    if (body[end] === ";") end++;
    spans.push([at, end]);
    i = end;
  }
  let rest = body;
  for (const [a, b] of [...spans].reverse()) rest = rest.slice(0, a) + rest.slice(b);
  rest = rest.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  if (/[A-Za-z_]/.test(rest)) return undefined;
  return calls;
}

function powerIds(): Map<string, string> {
  const map = new Map<string, string>();
  const dir = path.join(CARDCRAWL, "powers");
  if (!readdirSync(CARDCRAWL).includes("powers")) return map;
  for (const file of walk(dir)) {
    const text = readFileSync(file, "utf8");
    const name = /class\s+(\w+)/.exec(text)?.[1];
    const id = /public static final String POWER_ID = "([^"]+)"/.exec(text)?.[1];
    if (name && id) map.set(name, id);
  }
  return map;
}

function cardIds(): Map<string, string> {
  const map = new Map<string, string>();
  for (const file of walk(path.join(CARDCRAWL, "cards"))) {
    const text = readFileSync(file, "utf8");
    const name = /class\s+(\w+)/.exec(text)?.[1];
    const id = /public static final String ID = "([^"]+)"/.exec(text)?.[1];
    if (name && id) map.set(name, id);
  }
  return map;
}

const PIDS = powerIds();
const CIDS = cardIds();

function mapWho(expr: string, ctx: Ctx): string | undefined {
  const e = expr.trim().replace(/^\(AbstractCreature\)\s*/, "").replace(/^\(AbstractPlayer\)\s*/, "").trim();
  if (e === "p" || e === "this.p" || e === "AbstractDungeon.player") return `${ctx.run}.player`;
  if (e === "m" || e === "this.target" || e === "this.targetMonster") return `${ctx.target}!`;
  if (e === "null") return "null";
  return undefined;
}

function mapValue(expr: string, ctx: Ctx): string | undefined {
  const e = expr.trim().replace(/^\(int\)\s*/, "").replace(/^\(float\)\s*/, "").trim();
  if (e === "this.damage" || e === "this.baseDamage" || e === "this.multiDamage") return `${ctx.nums}.damage`;
  if (e === "this.block" || e === "this.baseBlock") return `${ctx.nums}.block`;
  if (e === "this.magicNumber" || e === "this.baseMagicNumber") return `${ctx.nums}.magic`;
  if (e === "this.amount" || e === "this.info" || e === "this.damageIncrease") return "this.amount";
  if (e === "this.freeToPlayOnce") return `!!${ctx.card}.freeOnce`;
  if (e === "this.upgraded") return `${ctx.card}.upgraded`;
  if (/^-?\d+$/.test(e)) return e;
  if (e === "true" || e === "false") return e;
  const str = /^"([^"]*)"$/.exec(e);
  if (str) return JSON.stringify(str[1]!);
  const info = /^new\s+DamageInfo\s*\(([\s\S]*)\)$/.exec(e);
  if (info) {
    const args = splitArgs(info[1]!);
    if (!args[1]) return undefined;
    return mapValue(args[1], ctx);
  }
  return undefined;
}

function numericArg(args: string[], ctx: Ctx): string | undefined {
  for (let i = args.length - 1; i >= 0; i--) {
    const v = mapValue(args[i]!, ctx);
    if (!v || v === "true" || v === "false") continue;
    if (v.includes(".player") || v.endsWith("!")) continue;
    return v;
  }
  return undefined;
}

function compileCall(name: string, args: string[], ctx: Ctx, translated: Set<string>): string | undefined {
  if (name === "DamageAction") {
    const who = mapWho(args[0] ?? "", ctx);
    const amt = mapValue(args[1] ?? "", ctx);
    if (!who || !amt) return undefined;
    return `new DamageAction(${ctx.run}, ${ctx.run}.player, ${who}, ${amt}, { card: ${ctx.card} })`;
  }
  if (name === "DamageAllEnemiesAction") {
    const amt = numericArg(args, ctx) ?? `${ctx.nums}.damage`;
    return `new DamageAllEnemiesAction(${ctx.run}, ${ctx.run}.player, ${amt}, ${ctx.card})`;
  }
  if (name === "GainBlockAction") {
    const amt = numericArg(args, ctx);
    const who = mapWho(args[0] ?? "", ctx) ?? `${ctx.run}.player`;
    if (!amt) return undefined;
    return `new GainBlockAction(${ctx.run}, ${who}, ${amt})`;
  }
  if (name === "ApplyPowerAction") {
    const who = mapWho(args[0] ?? "", ctx);
    const pow = /^new\s+(\w+)\s*\(([\s\S]*)\)$/.exec((args[2] ?? "").trim());
    if (!who || !pow) return undefined;
    const id = PIDS.get(pow[1]!);
    if (!id) return undefined;
    const amt = (args[3] ? mapValue(args[3], ctx) : undefined) ?? numericArg(splitArgs(pow[2]!), ctx);
    if (!amt) return undefined;
    const source = mapWho(args[1] ?? "", ctx) ?? `${ctx.run}.player`;
    const fromMonster = source.endsWith("!");
    return `new ApplyPowerAction(${who}, ${fromMonster ? source : `${ctx.run}.player`}, ${JSON.stringify(id)}, ${amt}${fromMonster ? ", true" : ""})`;
  }
  if (name === "DrawCardAction") {
    const amt = numericArg(args, ctx);
    if (!amt) return undefined;
    return `new DrawCardAction(${ctx.run}, ${amt})`;
  }
  if (name === "GainEnergyAction") {
    const amt = mapValue(args[0] ?? "", ctx);
    if (!amt) return undefined;
    return `new GainEnergyAction(${ctx.run}, ${amt})`;
  }
  if (name === "LoseHPAction") {
    const who = mapWho(args[0] ?? "", ctx);
    const source = mapWho(args[1] ?? "", ctx) ?? `${ctx.run}.player`;
    const amt = numericArg(args, ctx);
    if (!who || !amt) return undefined;
    return `new LoseHPAction(${ctx.run}, ${who}, ${source}, ${amt})`;
  }
  if (name === "HealAction") {
    const who = mapWho(args[0] ?? "", ctx) ?? `${ctx.run}.player`;
    const amt = numericArg(args, ctx);
    if (!amt) return undefined;
    return `new HealAction(${ctx.run}, ${who}, ${amt})`;
  }
  if (name === "ChangeStanceAction") {
    const raw = (args[0] ?? "").trim();
    const quoted = /^"(\w+)"$/.exec(raw)?.[1];
    const made = /^new\s+(\w+)\s*\(/.exec(raw)?.[1]?.replace(/Stance$/, "");
    const id = quoted ?? made;
    if (!id) return undefined;
    const stance = id === "Neutral" ? "none" : id.toLowerCase();
    if (!["none", "calm", "wrath", "divinity"].includes(stance)) return undefined;
    return `new ChangeStanceAction(${ctx.run}, ${JSON.stringify(stance)})`;
  }
  if (name === "ChannelAction") {
    const orb = /^new\s+(\w+)\s*\(/.exec(args[0] ?? "")?.[1]?.toLowerCase();
    if (!orb || !["lightning", "frost", "dark", "plasma"].includes(orb)) return undefined;
    return `new ChannelAction(${ctx.run}, ${JSON.stringify(orb)})`;
  }
  if (name === "MakeTempCardInHandAction" || name === "MakeTempCardInDiscardAction" || name === "MakeTempCardInDrawPileAction") {
    const made = /new\s+(\w+)\s*\(\s*\)/.exec(args.join(","));
    if (!made) return undefined;
    const id = CIDS.get(made[1]!) ?? made[1]!;
    const second = args.length > 1 ? mapValue(args[1]!, ctx) : undefined;
    const count = second && second !== "true" && second !== "false" ? second : "1";
    return `new ${name}(${ctx.run}, ${JSON.stringify(id)}, ${count})`;
  }
  if (name === "WhirlwindAction") {
    return `new WhirlwindAction(${ctx.run}, ${ctx.nums}.damage, ${ctx.card})`;
  }
  if (translated.has(name)) {
    const amt = numericArg(args, ctx) ?? "0";
    const tgt = ctx.target === "target" ? "target ?? null" : ctx.target;
    return `new ${name}(${ctx.run}, ${ctx.card}, ${tgt}, ${amt})`;
  }
  return undefined;
}

function translateUpdate(body: string, translated: Set<string>): string | undefined {
  let src = body;
  src = src.replace(/if\s*\(\s*this\.duration\s*==\s*Settings\.\w+\s*&&\s*/g, "if (");
  src = src.replace(/if\s*\(\s*this\.duration\s*==\s*Settings\.\w+\s*\)\s*\{/g, "{");
  src = stripVfx(src);
  src = src.replace(/^[ \t]*AbstractDungeon\.effectList\.add\([\s\S]*?\)\s*;\s*$/gm, "");
  src = src.replace(/^[ \t]*CardCrawlGame\.sound\.play\([\s\S]*?\)\s*;\s*$/gm, "");
  src = src.replace(/\bthis\.tickDuration\(\)\s*;/g, "this.isDone = true;");
  src = src.replace(/AbstractDungeon\.player\.getPower\(\s*"([^"]+)"\s*\)\.amount/g, '(this.run.player.powers.find((p) => p.id === "$1")?.amount ?? 0)');
  src = src.replace(/this\.p\.getPower\(\s*"([^"]+)"\s*\)\.amount/g, '(this.run.player.powers.find((p) => p.id === "$1")?.amount ?? 0)');
  src = src.replace(/AbstractDungeon\.player\.hasPower\(\s*"([^"]+)"\s*\)/g, 'this.run.player.powers.some((p) => p.id === "$1")');
  src = src.replace(/this\.p\.hasPower\(\s*"([^"]+)"\s*\)/g, 'this.run.player.powers.some((p) => p.id === "$1")');
  src = src.replace(/this\.target\.hasPower\(\s*"([^"]+)"\s*\)/g, '!!this.target?.powers.some((p) => p.id === "$1")');
  src = src.replace(/this\.targetMonster\.getIntentBaseDmg\(\)\s*>=\s*0/g, '(this.target?.intent ?? "").startsWith("attack")');
  src = src.replace(/\bthis\.targetMonster\b/g, "this.target");
  src = src.replace(/\bthis\.p\b/g, "this.run.player");
  src = src.replace(/\bAbstractDungeon\.player\b/g, "this.run.player");
  src = src.replace(/\bint\s+(\w+)\s*=/g, "let $1 =");
  src = src.replace(/this\.run\.player\.stance\.ID\.equals\(\s*"(\w+)"\s*\)/g, (_m, id: string) => `this.run.combat?.stance === ${JSON.stringify(id === "Neutral" ? "none" : id.toLowerCase())}`);
  const ctx: Ctx = { run: "this.run", card: "this.card", target: "this.target", nums: "baseNumbers(this.card)" };
  let i = 0;
  let out = "";
  while (i < src.length) {
    const bot = src.indexOf("this.addToBot(", i);
    const top = src.indexOf("this.addToTop(", i);
    if (bot < 0 && top < 0) {
      out += src.slice(i);
      break;
    }
    const isTop = top >= 0 && (bot < 0 || top < bot);
    const at = isTop ? top : bot;
    const key = isTop ? "this.addToTop(".length : "this.addToBot(".length;
    const close = matchParen(src, at + key - 1);
    if (close < 0) return undefined;
    const inner = src.slice(at + key, close).trim();
    const nm = /^new\s+(\w+)\s*\(([\s\S]*)\)$/.exec(inner);
    if (!nm) return undefined;
    const compiled = compileCall(nm[1]!, splitArgs(nm[2]!), ctx, translated);
    if (!compiled) return undefined;
    const stmt = isTop ? "this.addToTop" : "this.addToBot";
    out += src.slice(i, at) + `${stmt}(${compiled})`;
    i = close + 1;
  }
  if (/\b(AbstractDungeon|Settings|CardCrawlGame|DamageInfo|Gdx|logger|AbstractCard|AbstractMonster|AbstractOrb|EnergyPanel|EmptyOrbSlot|boolean|hadVigor)\b/.test(out)) return undefined;
  if (/\.(size|get|equals|isEmpty|decreaseMaxOrbSlots|increaseMaxOrbSlots|gainEnergy)\s*\(/.test(out)) return undefined;
  if (/\borbs\b/.test(out)) return undefined;
  if (/\bnew (?!DamageAction\b|ApplyPowerAction\b|GainBlockAction\b|DrawCardAction\b|GainEnergyAction\b|LoseHPAction\b|HealAction\b|DamageAllEnemiesAction\b|ChangeStanceAction\b|ChannelAction\b|MakeTempCardInHandAction\b|MakeTempCardInDiscardAction\b|MakeTempCardInDrawPileAction\b)/.test(out)) return undefined;
  if (/\bthis\.(?!run\b|card\b|target\b|amount\b|source\b|addToBot\b|addToTop\b|isDone\b)/.test(out)) return undefined;
  return out;
}

const SPECIAL_NAMES = [
  "DamageAllEnemiesAction", "ChangeStanceAction", "ChannelAction",
  "MakeTempCardInHandAction", "MakeTempCardInDiscardAction", "MakeTempCardInDrawPileAction",
  "WhirlwindAction",
] as const;

const SPECIALS: Record<string, string> = {
  DamageAllEnemiesAction: `export class DamageAllEnemiesAction extends AbstractGameAction {
  constructor(private run: RunState, source: Creature, amount: number, private card?: CardInst) {
    super();
    this.setValues(null, source, amount);
  }
  update(): void {
    for (const m of this.run.combat?.monsters ?? []) {
      if (!m.alive) continue;
      this.addToBot(new DamageAction(this.run, this.source ?? this.run.player, m, this.amount, { card: this.card }));
    }
    this.isDone = true;
  }
}
`,
  ChangeStanceAction: `export class ChangeStanceAction extends AbstractGameAction {
  constructor(private run: RunState, private stance: "none" | "calm" | "wrath" | "divinity") { super(); }
  update(): void {
    if (this.run.player.powers.some((p) => p.id === "CannotChangeStancePower" || p.id === "Cannot Change Stance")) {
      this.isDone = true;
      return;
    }
    changeStance(this.run, this.stance);
    this.isDone = true;
  }
}
`,
  ChannelAction: `export class ChannelAction extends AbstractGameAction {
  constructor(private run: RunState, private orb: "lightning" | "frost" | "dark" | "plasma") { super(); }
  update(): void {
    channelOrb(this.run, this.orb);
    this.isDone = true;
  }
}
`,
  MakeTempCardInHandAction: `export class MakeTempCardInHandAction extends AbstractGameAction {
  constructor(private run: RunState, private cardId: string, amount = 1) { super(); this.amount = amount; }
  update(): void {
    const cbt = this.run.combat;
    if (!cbt) { this.isDone = true; return; }
    for (let i = 0; i < this.amount; i++) {
      const made = makeCard(this.run, this.cardId);
      if (this.run.player.powers.some((p) => p.id === "MasterReality" || p.id === "MasterRealityPower")) upgradeCard(made);
      if (cbt.hand.length < 10) cbt.hand.push(made);
      else cbt.discard.push(made);
    }
    this.isDone = true;
  }
}
`,
  MakeTempCardInDiscardAction: `export class MakeTempCardInDiscardAction extends AbstractGameAction {
  constructor(private run: RunState, private cardId: string, amount = 1) { super(); this.amount = amount; }
  update(): void {
    const cbt = this.run.combat;
    if (!cbt) { this.isDone = true; return; }
    for (let i = 0; i < this.amount; i++) cbt.discard.push(makeCard(this.run, this.cardId));
    this.isDone = true;
  }
}
`,
  MakeTempCardInDrawPileAction: `export class MakeTempCardInDrawPileAction extends AbstractGameAction {
  constructor(private run: RunState, private cardId: string, amount = 1) { super(); this.amount = amount; }
  update(): void {
    const cbt = this.run.combat;
    if (!cbt) { this.isDone = true; return; }
    for (let i = 0; i < this.amount; i++) cbt.draw.push(makeCard(this.run, this.cardId));
    this.isDone = true;
  }
}
`,
  WhirlwindAction: `export class WhirlwindAction extends AbstractGameAction {
  constructor(private run: RunState, amount: number, private card: CardInst) {
    super();
    this.amount = amount;
    this.source = run.player;
  }
  update(): void {
    const cbt = this.run.combat;
    let effect = cbt?.energy ?? 0;
    if (hasRelic(this.run, "Chemical X")) effect += 2;
    if (effect > 0) {
      for (let i = 0; i < effect; i++) this.addToBot(new DamageAllEnemiesAction(this.run, this.run.player, this.amount, this.card));
      if (!this.card.freeOnce && cbt) cbt.energy = 0;
    }
    this.isDone = true;
  }
}
`,
};

export interface ActionPort {
  source: string;
  uses: Map<string, string>;
  needed: Set<string>;
}

export function buildActionPort(): ActionPort {
  const translated = new Set<string>();
  const updates = new Map<string, string>();
  for (const file of walk(path.join(CARDCRAWL, "actions"))) {
    const name = path.basename(file, ".java");
    if (HAND.has(name) || name.startsWith("DEPRECATED") || file.includes(`${path.sep}deprecated${path.sep}`)) continue;
    if (["DamageAllEnemiesAction", "ChangeStanceAction", "ChannelAction", "MakeTempCardInHandAction", "MakeTempCardInDiscardAction", "MakeTempCardInDrawPileAction", "WhirlwindAction"].includes(name)) continue;
    const text = readFileSync(file, "utf8");
    const update = methodBody(text, name, "update");
    if (!update) continue;
    const js = translateUpdate(update, translated);
    if (!js) continue;
    translated.add(name);
    updates.set(name, js);
  }

  const cardCtx: Ctx = { run: "run", card: "card", target: "target", nums: "n" };
  const uses = new Map<string, string>();
  const needed = new Set<string>();
  for (const file of walk(path.join(CARDCRAWL, "cards"))) {
    const name = path.basename(file, ".java");
    const text = readFileSync(file, "utf8");
    const raw = methodBody(text, name, "use");
    if (!raw) continue;
    const body = stripVfx(unwrapDebug(raw));
    const calls = listCalls(body);
    if (!calls?.length) continue;
    const lines: string[] = ["use(run: RunState, card: CardInst, target?: Creature): void {", "    const n = baseNumbers(card);"];
    let ok = true;
    for (const call of calls) {
      const expr = compileCall(call.name, call.args, cardCtx, translated);
      if (!expr) {
        ok = false;
        break;
      }
      const q = call.top ? "gameActions.addToTop" : "gameActions.addToBottom";
      lines.push(`    ${q}(${expr});`);
      if (!HAND.has(call.name)) needed.add(call.name);
    }
    if (!ok) continue;
    lines.push("  }");
    uses.set(name, lines.join("\n"));
  }
  const pull = (text: string) => {
    for (const n of SPECIAL_NAMES) if (text.includes(`new ${n}`) || text.includes(`new ${n}(`)) needed.add(n);
  };
  for (const body of uses.values()) pull(body);
  for (const [name, js] of updates) if (needed.has(name)) pull(js);
  if (needed.has("WhirlwindAction")) needed.add("DamageAllEnemiesAction");

  const parts: string[] = [];
  for (const n of SPECIAL_NAMES) if (needed.has(n)) parts.push(SPECIALS[n]!);
  for (const [name, js] of updates) {
    if (!needed.has(name)) continue;
    parts.push(`export class ${name} extends AbstractGameAction {
  constructor(private run: RunState, private card: CardInst, target: Creature | null, amount: number) {
    super();
    this.target = target;
    this.source = run.player;
    this.amount = amount;
  }
  update(): void {${js}
  }
}`);
  }
  const source = `import { AbstractGameAction, ApplyPowerAction, DamageAction, DrawCardAction, GainBlockAction, GainEnergyAction, HealAction, LoseHPAction } from "../actions.js";
import { changeStance, channelOrb, makeCard, upgradeCard } from "../combat.js";
import { hasRelic } from "../relicEffects.js";
import type { CardInst, Creature, RunState } from "../types.js";
import { baseNumbers } from "../combat.js";

${parts.join("\n")}
`;
  return { source, uses, needed };
}
