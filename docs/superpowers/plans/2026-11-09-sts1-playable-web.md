# StS1 Data Layer + Playable Web Remake — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the research repo into (1) a code-derived, schema-validated StS1 data layer and (2) a playable text-based Slay the Spire 1 web game (Ironclad, Act 1 end-to-end, data-driven so further characters/acts are additive).

**Architecture:** `tools/` (Node/tsx) extracts entity records from the CFR-decompiled jar into `data/sts1/**` and validates them against `schemas/`; `data/sts1/**/*.effects.json` holds the hand-curated effect DSL; `packages/sts-engine` is a pure, deterministic TypeScript rules engine (seeded xorshift128+ RNG, action queue, ported monster AI, map generator, rooms, rewards) with Vitest tests; `web/` is a Vite + React text UI over the engine. Ground truth for every number and rule is the decompiled code (`docs/audits/2026-11-09-sts1-fidelity-audit.md`, spec §0).

**Tech Stack:** Node 26, TypeScript 5, tsx, Vitest, Vite 6, React 19, Ajv (JSON Schema 2020-12), adm-zip (read localization from the jar).

---

## File structure (locked in)

```
package.json                    npm workspaces: tools, packages/*, web
tsconfig.base.json
tools/
  src/paths.ts                  env STS1_JAR, STS1_DECOMPILED (default F:\Project\_tools\decompiled)
  src/java-parse.ts             regex helpers over decompiled Java
  src/localization.ts           eng/zhs JSON out of the jar (adm-zip)
  src/class-filter.ts           exclusion list (audit F6), inclusion overrides (F3)
  src/extract/{cards,relics,potions,powers,monsters}.ts
  src/extract.ts                CLI: writes data/sts1/{cards/*.json,relics.json,potions.json,powers.json,monsters.json,_unresolved.json}
  src/validate.ts               Ajv over schemas/ + cross-refs; writes review/validation.json
  src/diff-baseline.ts          compares extraction vs wiki-era data/sts1/*.json → data/sts1/_baseline-diff.json
schemas/                        card, relic, potion, power, monster, effects(dsl)
data/sts1/cards/{red,green,blue,purple,colorless,curse,status}.json   extracted
data/sts1/cards/red.effects.json  status.effects.json  curse.effects.json   curated
data/sts1/{relics,potions,powers,monsters}.json                        extracted
data/sts1/{relics,potions}.effects.json                                 curated (subset)
data/sts1/encounters.json                                               hand-ported from Exordium/MonsterHelper
packages/sts-engine/src/
  rng.ts            RandomXS128 port + counter (Random.java)
  types.ts          GameState, Creature, CardInstance, Power, Intent, Room …
  data.ts           loads data/sts1 json (imported as modules)
  cards.ts          CardInstance factory, upgrade, cost, descriptions
  dsl.ts            effect interpreter (ops) + custom registry
  powers.ts         power hook implementations (Strength, Vulnerable, …, Ironclad + Act-1 monster powers)
  combat.ts         turn loop, play card, damage pipeline (DamageInfo.applyPowers order), block, draw/discard/exhaust, death, victory
  monsters/*.ts     Act 1 getMove/takeTurn ports (one file per class)
  encounters.ts     MonsterHelper.getEncounter + Exordium weak/strong/elite tables + populateMonsterList
  map.ts            MapGenerator + RoomTypeAssigner + generateRoomTypes
  rewards.ts        card reward (rollRarity + blizz offset), gold, potion chance, relic tiers, chests
  rooms.ts          monster/elite/boss/rest/shop/treasure/event flow; EventHelper.roll
  events/*.ts       Act 1 events subset
  relics.ts         relic hooks (subset)
  potions.ts        potion effects (subset)
  run.ts            Run orchestration: new run (Neow simplified), floor progression, game over
  index.ts
packages/sts-engine/test/*.test.ts
web/                Vite+React, screens: Title, Map, Combat, Rewards, Rest, Shop, Treasure, Event, GameOver
TODO.md             resumable checklist incl. deferred items
```

## Tasks

### Phase 0 — scaffold
- [ ] Root `package.json` (workspaces), `tsconfig.base.json`, `.gitignore` additions (node_modules, dist, decompiled/)
- [ ] `npm install` tsx, typescript, vitest, ajv, adm-zip, vite, react
- [ ] Commit

### Phase A — data layer
- [ ] A1 `tools/src/localization.ts` + `java-parse.ts` + `paths.ts`; test: reads `cards.json` eng has `Strike_R`
- [ ] A2 `extract/cards.ts` → `data/sts1/cards/*.json` (id, class, name{eng,zhs}, type, color, rarity, cost, target, base{damage,block,magic}, upgrade deltas, flags, tags, description{eng,zhs}); test: 75 red, Whirlwind cost −1, Searing Blow upgrade formula flagged
- [ ] A3 `extract/relics.ts`, `potions.ts`, `powers.ts`, `monsters.ts` (HP ranges per ascension bracket)
- [ ] A4 `schemas/*.schema.json` + `validate.ts`; CI command `npm run validate`
- [ ] A5 `diff-baseline.ts` → `_baseline-diff.json`; must reproduce audit: 0 cost/type/tier/HP regressions
- [ ] A6 `class-filter.ts` exclusion list from audit F6
- [ ] A7 Curate `red.effects.json`, `status.effects.json`, `curse.effects.json` (DSL + custom ids); test: every red card id has an effects entry
- [ ] A8 `encounters.json` (weights + compositions) hand-ported
- [ ] Commit per sub-task

### Phase B — engine
- [ ] B1 `rng.ts` xorshift128+ port; test against known RandomXS128 outputs (seed 1 → nextInt sequence computed from Java algorithm)
- [ ] B2 `types.ts`, `cards.ts`, `data.ts`
- [ ] B3 `powers.ts` core (Strength, Dexterity, Vulnerable, Weak, Frail, Artifact, Metallicize, Thorns-like, Ritual, CurlUp, Angry, SporeCloud, Split, ModeShift, SharpHide, Thievery, Entangle, NoDraw, LoseStrength, Barricade, Berserk, Brutality, Combust, Corruption, DarkEmbrace, DemonForm, DoubleTap, Evolve, FeelNoPain, FireBreathing, FlameBarrier, Juggernaut, Rage, Rupture)
- [ ] B4 `combat.ts` damage pipeline; tests: Strength+Vulnerable+Weak math (Math.fround), block, Bash on Jaw Worm
- [ ] B5 `dsl.ts` interpreter + customs; test: every red card plays without throwing in a dummy fight
- [ ] B6 `monsters/*.ts` Act 1 ports (27 classes); tests: Jaw Worm first move Chomp; Gremlin Nob Bellow first; Guardian mode shift at 30 dmg; Slime Boss split at ≤50 %
- [ ] B7 `encounters.ts`, `map.ts` (tests: 15×7, row 8 treasure, row 14 rest, elite not in rows ≤4, boss edge), `rewards.ts` (tests: rarity offsets, gold ranges, chest tables)
- [ ] B8 `rooms.ts`, `rest`, `shop` (prices 50/75/150 ±10 %, removal 75+25), `treasure`, `events/*` (Big Fish, Cleric, Golden Idol, Golden Wing, World of Goop, Living Wall, Scrap Ooze, Shining Light, Mushrooms, Golden Shrine, Purifier, Transmogrifier, Upgrade Shrine, Wheel of Change, Bonfire Spirits optional)
- [ ] B9 `relics.ts` subset (Burning Blood + ~30 common/uncommon/rare/boss), `potions.ts` subset (~12)
- [ ] B10 `run.ts` + Neow (3 fixed options) + Act 1 boss → victory screen
- [ ] Commit per sub-task

### Phase C — web UI
- [ ] C1 Vite + React scaffold, engine import, `npm run dev`
- [ ] C2 Screens: Title (seed input), Map (ASCII-grid with clickable nodes), Combat (hand/energy/piles/monsters/intents/powers/relics/potions, target picking, card choice modal), Rewards, Rest, Shop, Treasure, Event, GameOver/Victory
- [ ] C3 Save to localStorage (serialize GameState incl. RNG state)
- [ ] C4 Playtest a full Act 1 run in the browser; fix
- [ ] Commit

### Phase D — hand-off
- [ ] `TODO.md` at root: status + remaining (Silent/Defect/Watcher effects, Acts 2–3 monsters, remaining relics/potions/events, assets, StS2)
- [ ] `README.md` update; `review/build.py` still works; final commit
