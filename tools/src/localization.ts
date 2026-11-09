import AdmZip from "adm-zip";
import { STS1_JAR } from "./paths.js";

export type Lang = "eng" | "zhs";
export type LocTable = Record<string, Record<string, unknown>>;

let zip: AdmZip | null = null;
const cache = new Map<string, LocTable>();

export function loc(lang: Lang, file: string): LocTable {
  const key = `${lang}/${file}`;
  const hit = cache.get(key);
  if (hit) return hit;
  zip ??= new AdmZip(STS1_JAR);
  const entry = zip.getEntry(`localization/${lang}/${file}.json`);
  if (!entry) throw new Error(`localization/${lang}/${file}.json missing from jar`);
  const table = JSON.parse(entry.getData().toString("utf-8")) as LocTable;
  cache.set(key, table);
  return table;
}

export function text(lang: Lang, file: string, id: string, field = "NAME"): string | undefined {
  const rec = loc(lang, file)[id];
  const v = rec?.[field];
  return typeof v === "string" ? v : undefined;
}

export function strings(lang: Lang, file: string, id: string, field: string): string[] | undefined {
  const rec = loc(lang, file)[id];
  const v = rec?.[field];
  return Array.isArray(v) ? (v as string[]) : undefined;
}

/** eng + zhs pair; zhs falls back to eng so the game is always renderable. */
export function bilingual(file: string, id: string, field = "NAME"): { eng: string; zhs: string } | undefined {
  const eng = text("eng", file, id, field);
  if (eng === undefined) return undefined;
  return { eng, zhs: text("zhs", file, id, field) ?? eng };
}
