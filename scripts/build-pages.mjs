import { cpSync, mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "web", "dist");

const env = { ...process.env, VITE_BASE: "/slay-the-spire-research/" };
const r = spawnSync("npm", ["run", "-w", "web", "build"], { cwd: root, env, stdio: "inherit", shell: true });
if (r.status !== 0) process.exit(r.status ?? 1);

mkdirSync(path.join(dist, "review"), { recursive: true });
copyFileSync(path.join(root, "review", "index.html"), path.join(dist, "review", "index.html"));
copyFileSync(path.join(root, "review", "data.js"), path.join(dist, "review", "data.js"));
for (const f of ["architecture.html", "logic.html", "logic-data.js", "entity-data.js", "graph.html", "graph-data.js"]) {
  if (existsSync(path.join(root, "review", f))) copyFileSync(path.join(root, "review", f), path.join(dist, "review", f));
}
writeFileSync(path.join(dist, ".nojekyll"), "");
copyFileSync(path.join(dist, "index.html"), path.join(dist, "404.html"));
rmSync(path.join(dist, "assets", "sts1"), { recursive: true, force: true });
console.log("pages bundle ready:", dist);
void cpSync;
