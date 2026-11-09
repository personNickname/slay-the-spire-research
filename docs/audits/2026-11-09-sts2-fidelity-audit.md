# StS2 data fidelity audit — repo data vs. local `sts2.dll`

> Date: 2026-11-09 · Ground truth: local install `C:\Games\steamapps\common\Slay the Spire 2\data_sts2_windows_x86_64\sts2.dll` (9,364,480 bytes) + `release_info.json`.
> Method: count every record in `data/sts2/*.json`, read the PE `ProductVersion` / `FileVersion` strings out of `sts2.dll`, and compare against the documented v0.107.1 baseline (sts2-rl-agent C# dump). This is the same *level* of inventory as the StS1 audit (entity completeness + version pin). Per-card `use()` DSL is **not** ported yet — that waits until the StS1 engine is the stable reference.

## Version pin

| Source | Value |
|---|---|
| `release_info.json` | `version: v0.107.1`, `commit: 59260271`, `date: 2026-06-18` |
| `sts2.dll` PE `ProductVersion` | `0.1.0+59260271157f76a2896f0eab5b…` (matches the release_info commit) |
| `sts2.dll` PE `FileVersion` | `0.1.0.0` |
| `sts2.dll` LastWriteTime (this machine) | 2026-11-09 21:28 — same binary, not a newer patch |
| JSON `version` fields | all `v0.107.1` |

**2026-11-12 large patch:** not shipped as of this audit. Re-extract `data/sts2/` the day that patch lands; do not assume today's dll is that patch.

## Headline

Wiki/C# baseline JSON is **complete at the entity level for v0.107.1**. Counts match the README table. The dll on disk is still v0.107.1, so no numeric drift vs. the install. Gaps vs. a StS1-style remake: no code-derived effect DSL, no identity-from-`ID` constant pass against the dll (the JSON ids are snake_case English slugs from the C# dump, not the live localization keys), and no playable StS2 engine yet.

| Entity | Repo | vs. documented v0.107.1 | vs. local dll | Verdict |
|---|---|---|---|---|
| Cards | 577 | 577 (Ironclad 87 / Silent·Defect·Necrobinder·Regent 88×4 / colorless 64 / curse 18 / status 12 / event 27 / token 14 / quest 3) | version string matches | Complete for this build |
| Relics | 295 | 295 (incl. 100 Ancient blessings) | same | Complete |
| Potions | 63 | 63/64 documented (1 missing vs. some dumps — token/event split) | same JSON | One short of the “64” ceiling in older notes |
| Enemies | 120 entities / 357 moves | 120 (normal 70 / elite 17 / boss 18 / event 15); move list sums to 357 | same | Complete |
| Events | 57 unique | meta.count 57 (shared 18 + overgrowth 13 + underdocks 10 + hive 10 + glory 7, SunkenStatue dual-pooled) | same | Complete |
| Ancients | 8 / 100 blessings | 8 ancients, 100 blessing rows | same | Complete |
| Enchantments | 22 | 22 (deprecated/mock excluded by source note) | same | Complete |
| Map config | 13 config blocks | present in `map_config.json` | n/a (data, not code) | Present |

## Findings

### S2-F1. Install == JSON version
`sts2.dll` ProductVersion embeds commit `59260271`, identical to `release_info.json`. There is no silent hotfix on this machine. A StS1-style “jar class ID vs. JSON id” pass is not possible from PE strings alone without a C# decompile of this exact dll (ilspycmd 9.1.0.7988 is pinned in the toolchain).

### S2-F2. Potion 63 vs. 64
`potions.json` has 63 rows. README historically said 63/64. The missing slot is the same class of placeholder the StS1 audit excluded (`PotionSlot`-style). Treat 63 as the obtainable set.

### S2-F3. Identity convention
StS2 JSON keys are English slugs (`abrasive`, `accelerant`). StS1 identity is the jar `ID` constant (`Strike_R`, `Venomology`). A future StS2 remake must pin identity to the C# `Id` / localization key from *this* dll, not the slug, once decompiled.

### S2-F4. No effect DSL yet
`data/sts2/cards.json` stores free-text `effect` / `effect_up`. There is no `cards/*.effects.json` equivalent. Do not start a second engine until StS1 `packages/sts-engine` is the reference.

### S2-F5. Dated follow-up
**2026-11-12:** after the announced EA patch, re-run extract against the new dll, bump every `version` field, and re-count this table. Until that date this audit is the freeze.

## What this audit did *not* do

- Full ilspy of `sts2.dll` (9.3 MB) into C# (hours, separate from finishing StS1).
- Move-by-move AI port for StS2 enemies.
- Audio / portrait extract for StS2.
