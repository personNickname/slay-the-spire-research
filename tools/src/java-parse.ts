import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

export interface JavaClass {
  /** e.g. "red/Whirlwind" */
  ref: string;
  pkg: string;
  name: string;
  src: string;
}

export function readPackage(root: string, pkg: string): JavaClass[] {
  const dir = path.join(root, ...pkg.split("/"));
  return readdirSync(dir)
    .filter((f) => f.endsWith(".java"))
    .sort()
    .map((f) => ({
      ref: `${pkg.split("/").pop()}/${f.slice(0, -5)}`,
      pkg,
      name: f.slice(0, -5),
      src: readFileSync(path.join(dir, f), "utf-8"),
    }));
}

export function readClass(root: string, pkg: string, name: string): JavaClass {
  const file = path.join(root, ...pkg.split("/"), `${name}.java`);
  return { ref: `${pkg.split("/").pop()}/${name}`, pkg, name, src: readFileSync(file, "utf-8") };
}

export function constString(src: string, names: string[]): string | undefined {
  for (const n of names) {
    const m = src.match(new RegExp(`public static final String ${n}\\s*=\\s*"([^"]*)"`));
    if (m) return m[1];
  }
  return undefined;
}

export function intAfter(src: string, pattern: RegExp): number | undefined {
  const m = src.match(pattern);
  return m ? Number.parseInt(m[1], 10) : undefined;
}

export function has(src: string, literal: string): boolean {
  return src.includes(literal);
}

/** All `setHp(a[, b])` calls with the nearest preceding `ascensionLevel >= N` guard (or 0). */
export function hpBrackets(src: string): Array<{ asc: number; min: number; max: number }> {
  const out: Array<{ asc: number; min: number; max: number }> = [];
  const re = /(?:if \(AbstractDungeon\.ascensionLevel >= (\d+)\) \{\s*)?this\.setHp\((\d+)(?:,\s*(\d+))?\)/g;
  let m: RegExpExecArray | null;
  // Walk statements in order; an `else` branch has no guard → asc 0.
  while ((m = re.exec(src))) {
    const asc = m[1] ? Number(m[1]) : 0;
    const min = Number(m[2]);
    const max = m[3] ? Number(m[3]) : min;
    out.push({ asc, min, max });
  }
  // dedupe identical
  const seen = new Set<string>();
  return out.filter((b) => {
    const k = `${b.asc}:${b.min}:${b.max}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).sort((a, b) => a.asc - b.asc);
}
