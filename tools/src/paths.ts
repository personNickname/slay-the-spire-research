import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(here, "..", "..");
export const DATA_DIR = path.join(REPO_ROOT, "data", "sts1");
export const SCHEMA_DIR = path.join(REPO_ROOT, "schemas");
export const REVIEW_DIR = path.join(REPO_ROOT, "review");

/** desktop-1.0.jar of the local StS1 install (ground truth for localization). */
export const STS1_JAR =
  process.env.STS1_JAR ?? "C:\\Games\\steamapps\\common\\SlayTheSpire\\desktop-1.0.jar";

/** Root of the CFR output, i.e. the folder containing `com/megacrit/cardcrawl`. */
export const STS1_DECOMPILED =
  process.env.STS1_DECOMPILED ??
  (existsSync(path.join(REPO_ROOT, "decompiled")) ? path.join(REPO_ROOT, "decompiled") : "F:\\Project\\_tools\\decompiled");

export const CARDCRAWL = path.join(STS1_DECOMPILED, "com", "megacrit", "cardcrawl");

export function requireSources(): void {
  if (!existsSync(STS1_JAR)) throw new Error(`STS1 jar not found: ${STS1_JAR} (set STS1_JAR)`);
  if (!existsSync(CARDCRAWL)) throw new Error(`Decompiled sources not found: ${CARDCRAWL} (set STS1_DECOMPILED)`);
}
