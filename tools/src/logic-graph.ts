/**
 * Class-level call graph of the decompiled StS1 sources, plus a completion
 * mark against packages/sts-engine.
 *
 * A node is one Java class (one file in this tree). An edge is a call:
 * `new OtherClass` or `OtherClass.method(`. Completion of a class is 100 only
 * when the engine has a TypeScript class of the same name whose body mentions
 * every public/protected logic method. UI, audio and localization classes are
 * in the graph but do not count toward the headline percent.
 *
 * Emits review/graph-data.js (window.GRAPH). Identifiers only.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CARDCRAWL, REVIEW_DIR, REPO_ROOT } from "./paths.js";

const NON_LOGIC = new Set([
  "vfx", "audio", "localization", "integrations", "desktop", "credits",
  "cutscenes", "scenes", "metrics", "unlock", "ui", "screens",
  "exceptions", "saveAndContinue", "daily", "trials",
]);

const SKIP_METHOD = /^(render[A-Z]\w*|render|play[A-Z]\w*|flash[A-Z]\w*|flash|dispose|loadRegion|initializeTips|getUpdatedDescription|updateDescription|makeCopy|toString|compareTo|hashCode)$/;

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

const METHOD_RE =
  /^ {4}(?:(?:public|protected|private|static|abstract|final|synchronized|native)\s+)*(?:<[^>]+>\s+)?([\w.<>\[\]?, ]+?)\s+(\w+)\(([^)]*)\)\s*(?:throws [\w., ]+)?\s*(\{|;)\s*$/;
const CTOR_RE = /^ {4}(?:(?:public|protected|private)\s+)?(\w+)\(([^)]*)\)\s*(?:throws [\w., ]+)?\s*\{\s*$/;
const CLASS_RE = /^(?:public\s+)?(?:abstract\s+|final\s+)*(?:class|interface|enum)\s+(\w+)/;

interface Node {
  name: string;
  pkg: string;
  ext: string;
  kind: string;
  lines: number;
  methods: string[];
  file: string;
}

function walk(dir: string, ext: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, ext, out);
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
}

function parseJava(file: string): Node | null {
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  let name = "";
  let ext = "";
  for (let i = 0; i < lines.length; i++) {
    const m = CLASS_RE.exec(lines[i]!);
    if (!m) continue;
    name = m[1]!;
    const head = lines.slice(i, i + 4).join(" ");
    ext = (/\bextends\s+([\w.]+)/.exec(head)?.[1] ?? "").split(".").pop() ?? "";
    break;
  }
  if (!name) return null;
  const methods: string[] = [];
  for (const ln of lines) {
    if (!ln.startsWith("    ") || ln.startsWith("     ")) continue;
    const head = ln.slice(0, ln.indexOf("(") < 0 ? ln.length : ln.indexOf("("));
    const visible = /\b(public|protected)\b/.test(head);
    const mm = METHOD_RE.exec(ln);
    if (mm && mm[2] === name && /\bpublic\b|\bprotected\b/.test(head)) {
      methods.push("<init>");
      continue;
    }
    if (mm && visible && !SKIP_METHOD.test(mm[2]!) && !/^(return|new|else|public|protected|private|static|final|abstract)$/.test(mm[1]!.trim())) {
      methods.push(mm[2]!);
      continue;
    }
    const cm = CTOR_RE.exec(ln);
    if (cm && cm[1] === name) methods.push("<init>");
  }
  const rel = path.relative(CARDCRAWL, file).split(path.sep).join("/");
  const pkg = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
  return { name, pkg, ext, kind: "", lines: lines.length, methods: [...new Set(methods)], file: text };
}

function tsBodies(): Map<string, string> {
  const out = new Map<string, string>();
  const root = path.join(REPO_ROOT, "packages", "sts-engine", "src");
  for (const file of walk(root, ".ts")) {
    const src = readFileSync(file, "utf8");
    const re = /\bclass\s+([A-Z][A-Za-z0-9_]*)[^{]*\{/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      let depth = 1;
      let i = m.index + m[0].length;
      while (i < src.length && depth) {
        const c = src[i++];
        if (c === "{") depth++;
        else if (c === "}") depth--;
      }
      out.set(m[1]!, src.slice(m.index + m[0].length, i - 1));
      re.lastIndex = i;
    }
  }
  return out;
}

function methodInner(body: string, name: string): string | undefined {
  const re = name === "<init>" ? /\bconstructor\s*\(/g : new RegExp(`\\b${name}\\s*\\(`, "g");
  const at = re.exec(body);
  if (!at) return undefined;
  const brace = body.indexOf("{", at.index);
  if (brace < 0) return undefined;
  let depth = 1;
  let i = brace + 1;
  while (i < body.length && depth) {
    const c = body[i++];
    if (c === "{") depth++;
    else if (c === "}") depth--;
  }
  return body.slice(brace, i);
}

function coverage(body: string | undefined, methods: string[]): { has: 0 | 1; pct: number } {
  if (body === undefined) return { has: 0, pct: 0 };
  if (methods.length === 0) return { has: 1, pct: 100 };
  let hit = 0;
  for (const name of methods) {
    const inner = methodInner(body, name);
    if (!inner || inner.includes("unported(")) continue;
    hit++;
  }
  return { has: 1, pct: Math.round((100 * hit) / methods.length) };
}

const parsed: Node[] = [];
for (const file of walk(CARDCRAWL, ".java")) {
  const n = parseJava(file);
  if (n) parsed.push(n);
}
parsed.sort((a, b) => a.name.localeCompare(b.name) || a.pkg.localeCompare(b.pkg));

const byName = new Map<string, number>();
parsed.forEach((n, i) => {
  const prev = byName.get(n.name);
  if (prev === undefined) byName.set(n.name, i);
  else if (parsed[prev]!.pkg.includes("deprecated") && !n.pkg.includes("deprecated")) byName.set(n.name, i);
});

function ancestors(i: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  let ext = parsed[i]!.ext;
  while (ext && !seen.has(ext)) {
    out.push(ext);
    seen.add(ext);
    const j = byName.get(ext);
    ext = j === undefined ? "" : parsed[j]!.ext;
  }
  return out;
}
for (let i = 0; i < parsed.length; i++) {
  const chain = [parsed[i]!.name, ...ancestors(i)];
  let kind = "";
  for (const [base, k] of KIND_BASES) if (chain.includes(base)) { kind = k; break; }
  parsed[i]!.kind = kind || parsed[i]!.pkg.split("/")[0] || "root";
}

const bodies = tsBodies();
const nodes = parsed.map((n) => {
  const c = coverage(bodies.get(n.name), n.methods);
  return [n.name, n.pkg, n.kind, n.lines, n.ext, c.pct, c.has, n.methods.length];
});

const edgeMap = new Map<string, number>();
const NEW_RE = /\bnew\s+([A-Z][A-Za-z0-9_]*)/g;
const STATIC_RE = /\b([A-Z][A-Za-z0-9_]*)\s*\.\s*[A-Za-z_]\w*\s*\(/g;
parsed.forEach((n, from) => {
  const bump = (target: string) => {
    const to = byName.get(target);
    if (to === undefined || to === from) return;
    const key = from + ">" + to;
    edgeMap.set(key, (edgeMap.get(key) ?? 0) + 1);
  };
  for (const m of n.file.matchAll(NEW_RE)) bump(m[1]!);
  for (const m of n.file.matchAll(STATIC_RE)) bump(m[1]!);
  n.file = "";
});

const edges: [number, number, number][] = [];
for (const [key, n] of edgeMap) {
  const [a, b] = key.split(">");
  edges.push([Number(a), Number(b), n]);
}

let logicLines = 0;
let doneLines = 0;
for (const n of nodes) {
  if (NON_LOGIC.has(n[2] as string)) continue;
  logicLines += n[3] as number;
  doneLines += ((n[3] as number) * (n[5] as number)) / 100;
}

const data = {
  generated: new Date().toISOString(),
  nonLogic: [...NON_LOGIC],
  rule: "一个类完成 = packages/sts-engine 里有同名 class，且该类 public/protected 逻辑方法（不含 render/音效/文案）都在这个 class 体里出现。总进度按代码行加权，画面/音效/本地化/UI 屏/每日挑战不计入。",
  nodes,
  edges,
  stats: {
    classes: nodes.length,
    edges: edges.length,
    logicLines,
    pct: logicLines ? Math.round((1000 * doneLines) / logicLines) / 10 : 0,
  },
};

const dest = path.join(REVIEW_DIR, "graph-data.js");
writeFileSync(dest, "window.GRAPH = " + JSON.stringify(data) + ";\n");
console.log(
  `logic-graph: ${nodes.length} classes, ${edges.length} call edges, ` +
  `logic ${logicLines} lines, completion ${data.stats.pct}% -> ${dest}`,
);
