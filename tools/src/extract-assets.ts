/**
 * Copy card portraits, relic icons, and intent icons out of desktop-1.0.jar
 * into web/public/assets/sts1/ so the remake can show them. Audio is skipped.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import AdmZip from "adm-zip";
import { REPO_ROOT, STS1_JAR } from "./paths.js";

const outRoot = path.join(REPO_ROOT, "web", "public", "assets", "sts1");

const PREFIXES: { zip: string; dest: string }[] = [
  { zip: "images/1024Portraits/", dest: "portraits" },
  { zip: "images/relics/", dest: "relics" },
  { zip: "images/ui/intent/", dest: "intents" },
];

if (!existsSync(STS1_JAR)) {
  console.error("jar not found:", STS1_JAR);
  process.exit(1);
}

const zip = new AdmZip(STS1_JAR);
let n = 0;
for (const entry of zip.getEntries()) {
  if (entry.isDirectory) continue;
  const name = entry.entryName.replace(/\\/g, "/");
  const hit = PREFIXES.find((p) => name.startsWith(p.zip) && /\.(png|jpg)$/i.test(name));
  if (!hit) continue;
  const rel = name.slice(hit.zip.length);
  const dest = path.join(outRoot, hit.dest, rel);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, entry.getData());
  n += 1;
}
console.log("extracted", n, "images →", path.relative(REPO_ROOT, outRoot));
