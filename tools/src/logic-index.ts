/**
 * Mechanical reverse-engineering index of the decompiled StS1 jar.
 *
 * Walks every .java file under com/megacrit/cardcrawl and emits
 * review/logic-data.js (window.LOGIC_DATA) with:
 *   - classes:  name / package / superclass / kind / line count / method index
 *   - hosts:    hook matrix (hook -> declaring line, dispatch call sites, overriding subclasses)
 *   - behavior: per class+method fingerprint (actions queued, powers created, RNG streams, core mutators)
 *   - rng:      RNG stream -> usage sites
 *
 * Only identifiers and line numbers are emitted; no source text is copied.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CARDCRAWL, REVIEW_DIR } from "./paths.js";

interface Method {
  name: string;
  line: number;
  end: number;
  isStatic: boolean;
  isPrivate: boolean;
  ret: string;
  params: string;
}
interface Cls {
  idx: number;
  name: string;
  pkg: string;
  file: string;
  ext: string | null;
  lines: string[];
  methods: Method[];
  fields: Map<string, string>;
  kind: string;
}

const METHOD_RE =
  /^ {4}(?:(?:public|protected|private|static|abstract|final|synchronized|native)\s+)*(?:<[^>]+>\s+)?([\w.<>\[\]?, ]+?)\s+(\w+)\(([^)]*)\)\s*(?:throws [\w., ]+)?\s*(\{|;)\s*$/;
const CTOR_RE = /^ {4}(?:(?:public|protected|private)\s+)?(\w+)\(([^)]*)\)\s*(?:throws [\w., ]+)?\s*\{\s*$/;
const FIELD_RE =
  /^ {4}(?:(?:public|protected|private|static|final|transient|volatile)\s+)*([\w.]+(?:<[^=;]*>)?(?:\[\])*)\s+(\w+)\s*(?:=|;)/;
const CLASS_RE = /^(?:public\s+)?(?:abstract\s+|final\s+)*(?:class|interface|enum)\s+(\w+)/;

function walk(dir: string, out: string[]): void {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".java")) out.push(p);
  }
}

function parseClass(file: string, idx: number): Cls | null {
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  let name: string | null = null;
  let ext: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const m = CLASS_RE.exec(lines[i]!);
    if (!m) continue;
    name = m[1]!;
    const head = lines.slice(i, i + 4).join(" ");
    const em = /\bextends\s+([\w.]+)/.exec(head);
    ext = em ? em[1]!.split(".").pop()! : null;
    break;
  }
  if (!name) return null;
  const rel = path.relative(CARDCRAWL, file).split(path.sep).join("/");
  const pkg = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
  const methods: Method[] = [];
  const fields = new Map<string, string>();
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]!;
    if (!ln.startsWith("    ") || ln.startsWith("     ")) continue;
    let mm = METHOD_RE.exec(ln);
    let isCtor = false;
    let mName = "";
    let ret = "";
    let params = "";
    if (mm && mm[2] === name) {
      // CFR prints constructors as "public Name(...)": the modifier is not a return type
      isCtor = true;
      mName = "<init>";
      params = mm[3]!;
    } else if (mm && !/^(return|new|else|public|protected|private|static|final|abstract)$/.test(mm[1]!.trim())) {
      ret = mm[1]!.trim();
      mName = mm[2]!;
      params = mm[3]!;
    } else {
      const cm = CTOR_RE.exec(ln);
      if (cm && cm[1] === name) {
        isCtor = true;
        mName = "<init>";
        params = cm[2]!;
        mm = cm;
      } else {
        const fm = FIELD_RE.exec(ln);
        if (fm && !fields.has(fm[2]!)) fields.set(fm[2]!, fm[1]!);
        continue;
      }
    }
    let end = i;
    if (isCtor || ln.trimEnd().endsWith("{")) {
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j] === "    }") {
          end = j;
          break;
        }
      }
    }
    methods.push({
      name: mName,
      line: i + 1,
      end: end + 1,
      isStatic: /\bstatic\b/.test(ln.slice(0, ln.indexOf("("))),
      isPrivate: /\bprivate\b/.test(ln.slice(0, ln.indexOf("("))),
      ret,
      params,
    });
  }
  return { idx, name, pkg, file: rel, ext, lines, methods, fields, kind: "other" };
}

// ---------- load ----------
const files: string[] = [];
walk(CARDCRAWL, files);
files.sort();
const classes: Cls[] = [];
for (const f of files) {
  const c = parseClass(f, classes.length);
  if (c) classes.push(c);
}
const byName = new Map<string, Cls>();
let collisions = 0;
for (const c of classes) {
  if (byName.has(c.name)) {
    collisions++;
    // prefer the non-deprecated / shallower class for name lookups
    const prev = byName.get(c.name)!;
    if (prev.pkg.includes("deprecated") && !c.pkg.includes("deprecated")) byName.set(c.name, c);
  } else byName.set(c.name, c);
}

function ancestors(c: Cls): string[] {
  const out: string[] = [];
  let cur: Cls | undefined = c;
  const seen = new Set<string>();
  while (cur?.ext && !seen.has(cur.ext)) {
    out.push(cur.ext);
    seen.add(cur.ext);
    cur = byName.get(cur.ext);
  }
  return out;
}
const ancCache = new Map<Cls, string[]>();
for (const c of classes) ancCache.set(c, ancestors(c));
const isA = (c: Cls, base: string): boolean => c.name === base || ancCache.get(c)!.includes(base);

const KIND_BASES: [string, string][] = [
  ["AbstractPower", "power"],
  ["AbstractRelic", "relic"],
  ["AbstractCard", "card"],
  ["AbstractMonster", "monster"],
  ["AbstractPotion", "potion"],
  ["AbstractOrb", "orb"],
  ["AbstractStance", "stance"],
  ["AbstractGameAction", "action"],
  ["AbstractEvent", "event"],
  ["AbstractBlight", "blight"],
  ["AbstractRoom", "room"],
  ["AbstractDungeon", "dungeon"],
  ["AbstractPlayer", "character"],
  ["AbstractChest", "chest"],
  ["AbstractGameEffect", "vfx"],
];
for (const c of classes) {
  for (const [base, kind] of KIND_BASES) {
    if (isA(c, base)) {
      c.kind = kind;
      break;
    }
  }
  if (c.kind === "other") c.kind = c.pkg.split("/")[0] || "root";
}

// ---------- global lookup tables for receiver type resolution ----------
const globalFieldTypes = new Map<string, Map<string, number>>();
const globalReturnTypes = new Map<string, Map<string, number>>();
for (const c of classes) {
  for (const [n, t] of c.fields) {
    const m = globalFieldTypes.get(n) ?? new Map<string, number>();
    m.set(t, (m.get(t) ?? 0) + 1);
    globalFieldTypes.set(n, m);
  }
  for (const m of c.methods) {
    if (!m.ret || m.ret === "void") continue;
    const mm = globalReturnTypes.get(m.name) ?? new Map<string, number>();
    mm.set(m.ret, (mm.get(m.ret) ?? 0) + 1);
    globalReturnTypes.set(m.name, mm);
  }
}
function majority(m: Map<string, number> | undefined): string | null {
  if (!m) return null;
  let best: string | null = null;
  let n = 0;
  let total = 0;
  for (const [k, v] of m) {
    total += v;
    if (v > n) {
      best = k;
      n = v;
    }
  }
  return best && n * 2 > total ? best : null;
}

/** "ArrayList<AbstractOrb>" -> { base: "ArrayList", elem: "AbstractOrb" } */
function splitType(t: string): { base: string; elem: string | null } {
  const g = /^([\w.]+)<(.*)>/.exec(t);
  if (g) {
    const args = g[2]!.split(",").map((s) => s.trim());
    const last = args[args.length - 1]!.replace(/^\? extends /, "");
    return { base: g[1]!.split(".").pop()!, elem: last.replace(/<.*$/, "").split(".").pop()! };
  }
  if (t.endsWith("[]")) return { base: "Array", elem: t.slice(0, -2).split(".").pop()! };
  return { base: t.split(".").pop()!, elem: null };
}

function fieldType(c: Cls, name: string): string | null {
  let cur: Cls | undefined = c;
  const seen = new Set<Cls>();
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const t = cur.fields.get(name);
    if (t) return t;
    cur = cur.ext ? byName.get(cur.ext) : undefined;
  }
  return null;
}

function localType(c: Cls, m: Method | null, lineIdx: number, ident: string): string | null {
  if (!m) return null;
  const re = new RegExp(`(?:^|[\\s(,])([A-Z][\\w.]*(?:<[^>;=]*>)?(?:\\[\\])*)\\s+${ident}\\b(?!\\s*\\()`);
  for (let i = lineIdx; i >= m.line - 1; i--) {
    const r = re.exec(c.lines[i]!);
    if (r) return r[1]!;
  }
  return null;
}

interface Resolved {
  type: string | null;
  conf: "x" | "g" | "u"; // exact / guessed / unresolved
}

/** Resolve the static type of the receiver expression that ends right before `.name(`. */
function resolveReceiver(c: Cls, m: Method | null, lineIdx: number, pre: string): Resolved {
  const segs = chainOf(pre);
  if (!segs || segs.length === 0) return { type: null, conf: "u" };
  let conf: "x" | "g" = "x";
  let type: string | null = null; // full type string, generics included
  let staticCls: Cls | null = null;

  const s0 = segs[0]!;
  if (s0.startsWith("#cast:")) type = s0.slice(6);
  else if (s0 === "#unknown") type = null;
  else if (s0 === "this") type = c.name;
  else if (s0 === "super") return { type: "<super>", conf: "x" };
  else if (s0.endsWith("()")) {
    type = methodRet(c, s0.slice(0, -2));
  } else {
    type = localType(c, m, lineIdx, s0);
    if (!type) {
      if (byName.has(s0)) {
        staticCls = byName.get(s0)!;
        if (segs.length === 1) return { type: `<static:${s0}>`, conf: "x" };
      } else {
        // an implicit-this field (CFR normally writes this.x, but anonymous classes do not)
        type = fieldType(c, s0);
        if (!type) {
          type = majority(globalFieldTypes.get(s0));
          if (type) conf = "g";
        }
      }
    }
  }

  for (let i = 1; i < segs.length; i++) {
    const seg = segs[i]!;
    const isCall = seg.endsWith("()");
    const name = isCall ? seg.slice(0, -2) : seg;
    let owner: Cls | undefined;
    let elem: string | null = null;
    if (staticCls) {
      owner = staticCls;
      staticCls = null;
    } else if (type) {
      const st = splitType(type);
      owner = byName.get(st.base);
      elem = st.elem;
    }
    let next: string | null = null;
    if (isCall) {
      if (!owner && elem && COLLECTION_GETTERS.has(name)) next = elem;
      else if (owner) next = methodRet(owner, name);
      if (!next && !COLLECTION_GETTERS.has(name)) {
        next = majority(globalReturnTypes.get(name));
        if (next) conf = "g";
      }
    } else {
      if (owner) next = fieldType(owner, name);
      if (!next) {
        next = majority(globalFieldTypes.get(name));
        if (next) conf = "g";
      }
    }
    type = next;
    if (!type) return { type: null, conf: "u" };
  }
  if (!type) return { type: null, conf: "u" };
  return { type: splitType(type).base, conf };
}

const COLLECTION_GETTERS = new Set(["get", "next", "remove", "peek", "getFirst", "getLast", "poll"]);

function methodRet(c: Cls, name: string): string | null {
  let cur: Cls | undefined = c;
  const seen = new Set<Cls>();
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const mm = cur.methods.find((x) => x.name === name && x.ret && x.ret !== "void");
    if (mm) return mm.ret;
    cur = cur.ext ? byName.get(cur.ext) : undefined;
  }
  return null;
}

/** Split the receiver expression ending at the end of `pre` into dotted segments ("x", "f()", "#cast:T"). */
function chainOf(pre: string): string[] | null {
  const segs: string[] = [];
  let i = pre.length;
  for (;;) {
    const end = i;
    let j = i;
    let args = false;
    if (pre[j - 1] === ")") {
      let depth = 0;
      let k = j - 1;
      for (; k >= 0; k--) {
        if (pre[k] === ")") depth++;
        else if (pre[k] === "(") {
          depth--;
          if (depth === 0) break;
        }
      }
      if (k < 0) return null;
      j = k;
      args = true;
    }
    let k = j;
    while (k > 0 && /\w/.test(pre[k - 1]!)) k--;
    const ident = pre.slice(k, j);
    if (!ident) {
      if (!args) return null;
      const cast = /^\(\(([\w.]+)\)/.exec(pre.slice(j, end));
      segs.unshift(cast ? `#cast:${cast[1]!.split(".").pop()}` : "#unknown");
      return segs;
    }
    segs.unshift(ident + (args ? "()" : ""));
    if (pre[k - 1] === ".") {
      i = k - 1;
      continue;
    }
    return segs;
  }
}

// ---------- hook hosts ----------
const HOSTS: { id: string; cls: string; label: string }[] = [
  { id: "power", cls: "AbstractPower", label: "能力 Power" },
  { id: "relic", cls: "AbstractRelic", label: "遗物 Relic" },
  { id: "card", cls: "AbstractCard", label: "卡牌 Card" },
  { id: "monster", cls: "AbstractMonster", label: "怪物 Monster" },
  { id: "orb", cls: "AbstractOrb", label: "充能球 Orb" },
  { id: "stance", cls: "AbstractStance", label: "姿态 Stance" },
  { id: "potion", cls: "AbstractPotion", label: "药水 Potion" },
  { id: "blight", cls: "AbstractBlight", label: "荒疫 Blight" },
  { id: "room", cls: "AbstractRoom", label: "房间 Room" },
  { id: "event", cls: "AbstractEvent", label: "事件 Event" },
  { id: "action", cls: "AbstractGameAction", label: "动作 Action" },
];
const UI_RE =
  /^(render|play[A-Z]|load|dispose|flash|hover|unhover|toString|compareTo|show|hide|shrink|stopGlowing|beginGlowing|stopPulse|beginPulse|beginLongPulse|initialize(?!Deck)|make[A-Z]|getUpdatedDescription|updateDescription|setDescription|getLocStrings|updateAnimations?|updateHitbox|updateDeathAnimation|updateEscapeAnimation|updateFlash|updateColor|updateHover|updateTransparency|updateGlow|updateInput|createCardImage|unfade|fadingOut|darken|lighten|teleportToDiscardPile|untip|superFlash|stopIdleSfx|updateDialog|enterImageFromDialog|setSlot|triggerEvokeAnimation|showEvokeValue|hideEvokeValues|generateSparkles|adjustPosition|move$|scale|grayscale|bossObtainLogic|obtain|instantObtain|reorganizeObtain|relicTip|loadLargeImg|setCounter$|getAssetURL|addToBot|addToTop|tickDuration|isDeadOrEscaped)/;
const UI_SUB_RE = /(Img|Texture|Anim|Sfx|SFX|Sound|Tip|Portrait|Atlas|Color|Glow|Pulse|Hitbox|Hb$|Banner|Font|Shadow|Outline|Particle|Vfx|VFX|Dialog|Controller|Hover|Position|Locale|Title|Keyword)/;
const HOOKY_RE = /^(on|at|was|can|trigger|modify|change|during|apply|calculate|use$|takeTurn|getMove|die$|damage$|update$)/;

interface HookOut {
  n: string;
  l: number;
  s: string;
  o: number[];
  c: [number, string, number, string][];
}
interface HostOut {
  id: string;
  cls: number;
  label: string;
  count: number;
  hooks: HookOut[];
}

const hostDesc = new Map<string, Cls[]>();
for (const h of HOSTS) hostDesc.set(h.id, classes.filter((c) => isA(c, h.cls) && c.name !== h.cls));

// hookName -> host ids declaring it
const hookHosts = new Map<string, string[]>();
const hostHooks = new Map<string, Map<string, HookOut>>();
for (const h of HOSTS) {
  const hc = byName.get(h.cls);
  if (!hc) continue;
  const desc = hostDesc.get(h.id)!;
  const map = new Map<string, HookOut>();
  for (const m of hc.methods) {
    if (m.name === "<init>" || m.isStatic || m.isPrivate) continue;
    if (UI_RE.test(m.name) || UI_SUB_RE.test(m.name)) continue;
    if (m.name === "update" && h.id !== "action") continue; // per-frame UI tick everywhere except actions
    if (map.has(m.name)) {
      // overload: keep the first line, extend signature list
      map.get(m.name)!.s += ` | (${m.params})`;
      continue;
    }
    const over = desc.filter((d) => d.methods.some((dm) => dm.name === m.name)).map((d) => d.idx);
    if (over.length === 0 && !HOOKY_RE.test(m.name)) continue;
    map.set(m.name, { n: m.name, l: m.line, s: `(${m.params})`, o: over, c: [] });
    const arr = hookHosts.get(m.name) ?? [];
    arr.push(h.id);
    hookHosts.set(m.name, arr);
  }
  hostHooks.set(h.id, map);
}

// ---------- scan call sites + behavior fingerprints ----------
const CALL_RE = /\.(\w+)\(/g;
const NEW_ACTION_RE = /new (\w+Action)\(/g;
const NEW_POWER_RE = /new (\w+Power)\(/g;
const RNG_RE = /\b(monsterRng|eventRng|merchantRng|cardRng|treasureRng|relicRng|monsterHpRng|potionRng|aiRng|shuffleRng|cardRandomRng|miscRng|mapRng)\b/g;
const NEOW_RNG_RE = /\bNeowEvent\.rng\b|\bMathUtils\.random(?:Boolean)?\(/g;
const MUTATORS = new Set([
  "damage", "heal", "addBlock", "loseBlock", "draw", "gainEnergy", "loseEnergy", "gainGold", "loseGold",
  "increaseMaxHp", "decreaseMaxHealth", "moveToDiscardPile", "moveToExhaustPile", "moveToHand", "moveToDeck",
  "moveToBottomOfDeck", "channelOrb", "evokeOrb", "evokeNewestOrb", "evokeWithoutLosingOrb", "useCard", "rollMove",
  "setMove", "die", "escape", "obtainPotion", "shuffle", "addToRandomSpot", "increaseMaxOrbSlots", "decreaseMaxOrbSlots",
  "queueExtraCard", "addCardQueueItem", "endTurn", "endBattle", "addPower", "stackPower", "reducePower", "upgrade",
  "modifyCostForCombat", "setCostForTurn", "updateCost", "applyPowers", "calculateCardDamage", "createIntent",
]);
/** Kinds that carry no gameplay logic; everything else gets a behavior fingerprint. */
const NON_LOGIC_KINDS = new Set([
  "vfx", "audio", "localization", "integrations", "desktop", "credits", "cutscenes", "scenes", "metrics", "unlock",
  "exceptions", "saveAndContinue",
]);
const CONTENT_KINDS = { has: (k: string): boolean => !NON_LOGIC_KINDS.has(k) };

type Fp = { m: string; l: number; a: string[]; p: string[]; r: string[]; k: string[] };
const behavior = new Map<number, Fp[]>();
const rngSites = new Map<string, [number, string, number][]>();
let callTotal = 0;
let callUnresolved = 0;

for (const c of classes) {
  if (c.kind === "vfx") continue;
  const fps = new Map<string, Fp>();
  const methodAt = (lineNo: number): Method | null => {
    for (const m of c.methods) if (lineNo >= m.line && lineNo <= m.end) return m;
    return null;
  };
  for (let i = 0; i < c.lines.length; i++) {
    const ln = c.lines[i]!;
    if (ln.length < 12 || ln.startsWith("import ") || ln.trimStart().startsWith("logger.")) continue;
    const m = methodAt(i + 1);
    const mKey = m ? `${m.name}@${m.line}` : "(class)@0";
    const fp = (): Fp => {
      let f = fps.get(mKey);
      if (!f) {
        f = { m: m ? m.name : "(class)", l: m ? m.line : 0, a: [], p: [], r: [], k: [] };
        fps.set(mKey, f);
      }
      return f;
    };
    const push = (arr: string[], v: string): void => {
      if (!arr.includes(v)) arr.push(v);
    };

    if (CONTENT_KINDS.has(c.kind)) {
      let r: RegExpExecArray | null;
      NEW_ACTION_RE.lastIndex = 0;
      while ((r = NEW_ACTION_RE.exec(ln))) {
        const pre = ln.slice(0, r.index);
        const q = /addToTop\([^()]*$/.test(pre) ? "T" : /addTo(?:Bot|Bottom)\([^()]*$/.test(pre) ? "B" : /addToTurnStart\([^()]*$/.test(pre) ? "S" : /addToTop\(/.test(pre) ? "T" : /addTo(?:Bot|Bottom)\(/.test(pre) ? "B" : "?";
        push(fp().a, `${q}:${r[1]}`);
      }
      NEW_POWER_RE.lastIndex = 0;
      while ((r = NEW_POWER_RE.exec(ln))) push(fp().p, r[1]!);
      RNG_RE.lastIndex = 0;
      while ((r = RNG_RE.exec(ln))) {
        if (/= new Random\(/.test(ln) || /^\s*public static Random /.test(ln)) continue;
        push(fp().r, r[1]!);
        const arr = rngSites.get(r[1]!) ?? [];
        if (!arr.some((s) => s[0] === c.idx && s[2] === i + 1)) arr.push([c.idx, m ? m.name : "(class)", i + 1]);
        rngSites.set(r[1]!, arr);
      }
      NEOW_RNG_RE.lastIndex = 0;
      while ((r = NEOW_RNG_RE.exec(ln))) {
        const key = r[0].startsWith("Neow") ? "NeowEvent.rng" : "MathUtils.random(非种子)";
        push(fp().r, key);
        const arr = rngSites.get(key) ?? [];
        if (!arr.some((s) => s[0] === c.idx && s[2] === i + 1)) arr.push([c.idx, m ? m.name : "(class)", i + 1]);
        rngSites.set(key, arr);
      }
    }

    let r: RegExpExecArray | null;
    CALL_RE.lastIndex = 0;
    while ((r = CALL_RE.exec(ln))) {
      const name = r[1]!;
      const isHook = hookHosts.has(name);
      const isMut = MUTATORS.has(name) && CONTENT_KINDS.has(c.kind);
      if (!isHook && !isMut) continue;
      const pre = ln.slice(0, r.index);
      const res = resolveReceiver(c, m, i, pre);
      if (isMut && res.type !== "<super>") {
        const t = res.type && !res.type.startsWith("<") ? res.type : "?";
        push(fp().k, `${t}.${name}`);
      }
      if (!isHook) continue;
      if (res.type === "<super>") continue;
      callTotal++;
      const hostIds = hookHosts.get(name)!;
      if (res.type && res.type.startsWith("<static:")) continue;
      if (!res.type) {
        callUnresolved++;
        for (const hid of hostIds) hostHooks.get(hid)!.get(name)!.c.push([c.idx, m ? m.name : "(class)", i + 1, "u"]);
        continue;
      }
      const tc = byName.get(res.type);
      if (!tc) {
        callUnresolved++;
        continue;
      }
      for (const hid of hostIds) {
        const host = HOSTS.find((h) => h.id === hid)!;
        const hostCls = byName.get(host.cls)!;
        let flag: string | null = null;
        if (isA(tc, host.cls)) flag = res.conf === "x" ? "" : "g";
        else if (isA(hostCls, tc.name)) flag = "a"; // receiver typed as a supertype (e.g. AbstractCreature)
        if (flag === null) continue;
        hostHooks.get(hid)!.get(name)!.c.push([c.idx, m ? m.name : "(class)", i + 1, flag]);
      }
    }
  }
  const list = [...fps.values()].filter((f) => f.a.length || f.p.length || f.r.length || f.k.length);
  if (list.length) behavior.set(c.idx, list);
}

// ---------- emit ----------
const hostsOut: HostOut[] = HOSTS.filter((h) => byName.has(h.cls)).map((h) => ({
  id: h.id,
  cls: byName.get(h.cls)!.idx,
  label: h.label,
  count: hostDesc.get(h.id)!.length,
  hooks: [...hostHooks.get(h.id)!.values()].sort((a, b) => a.l - b.l),
}));

const kindCount: Record<string, number> = {};
for (const c of classes) kindCount[c.kind] = (kindCount[c.kind] ?? 0) + 1;

const out = {
  generated: new Date().toISOString().slice(0, 10),
  stats: {
    files: files.length,
    classes: classes.length,
    lines: classes.reduce((s, c) => s + c.lines.length, 0),
    methods: classes.reduce((s, c) => s + c.methods.length, 0),
    hookCalls: callTotal,
    hookCallsUnresolved: callUnresolved,
    nameCollisions: collisions,
    kinds: kindCount,
  },
  // [name, pkg, superclass, kind, lineCount, "method:line,method:line"]
  classes: classes.map((c) => [
    c.name,
    c.pkg,
    c.ext ?? "",
    c.kind,
    c.lines.length,
    c.kind === "vfx" ? "" : c.methods.map((m) => `${m.name}:${m.line}`).join(","),
  ]),
  hosts: hostsOut,
  // classIdx -> [[method, line, actions, powers, rng, mutators]]
  behavior: Object.fromEntries(
    [...behavior.entries()].map(([k, v]) => [k, v.map((f) => [f.m, f.l, f.a.join(","), f.p.join(","), f.r.join(","), f.k.join(",")])]),
  ),
  rng: Object.fromEntries([...rngSites.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
};

const dest = path.join(REVIEW_DIR, "logic-data.js");
writeFileSync(dest, `window.LOGIC_DATA = ${JSON.stringify(out)};\n`);
const kb = Math.round(Buffer.byteLength(JSON.stringify(out)) / 1024);
console.log(`logic-data.js written: ${dest} (${kb} KB)`);
console.log(out.stats);
for (const h of hostsOut) console.log(`  ${h.id.padEnd(8)} subclasses=${String(h.count).padStart(4)} hooks=${h.hooks.length}`);
