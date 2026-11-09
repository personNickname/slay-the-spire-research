# StS1 data fidelity audit — repo data vs. decompiled game code

> Date: 2026-11-09 · Ground truth: `desktop-1.0.jar` decompiled with CFR 0.152 (2,008 Java files, `com.megacrit.cardcrawl.*`).
> Method: automated matching of every record in `data/sts1/*.json` to its game class via the class `ID` constant and the official `localization/eng/*.json` names, then field-by-field comparison. Audit script lives outside the repo (`F:\Project\_tools\audit\fidelity_audit.py`); it will be superseded by `tools/diff-baseline.ts` in the data-layer plan.

## Headline

The wiki-derived data is **complete at the entity level and highly accurate at the number level**. No HP range, cost, type or relic tier was wrong. The real gaps are classification labels, three missing event-only monsters, naming conventions, and monster move-selection logic that the wiki can only approximate.

| Entity | Repo | Matched to code | Numeric/enum disagreements | Verdict |
|---|---|---|---|---|
| Cards | 371 | 371/371 (2 matched by hand: "Strike/Defend (Silent)") | cost 0 · type 0 · rarity 15 (label convention, see below) · numbers 628/647 present (97.1 %; the 19 misses are all non-literal numbers) | Complete, accurate |
| Relics | 193 (180 + 13 blights) | 180/180 + 13/13 blights | tier 0 | Complete, accurate |
| Potions | 42 | 42/42 (2 matched by hand) | rarity 0 · potency present for every potion that has a literal potency | Complete, accurate |
| Monsters | 62 | 62/62 (5 matched by hand: Louse ×2, Slaver ×2, Bronze Orb) | HP ranges 0 | Accurate, but **3 real enemies missing** |
| Events | 52 (+ Neow) | 52/52 (3 matched by hand) | — | Complete |

## Findings

### F1. Curse / Status rarity label (15 cards)
Repo uses `rarity: "special"` for all 10 curses and 5 statuses. Code: curses are `CardRarity.CURSE`; the five status cards (Burn, Dazed, Slimed, Void, Wound) are `CardRarity.COMMON`. The new schema uses the code enum.

### F2. "event" relic tier (18 relics)
Repo tier `event` does not exist in code. All 18 are `RelicTier.SPECIAL`, the same tier as Circlet and Red Circlet (code total SPECIAL = 20 = 18 + 2). The new schema keeps `tier: special` and records the acquisition route separately where the code defines one.

### F3. Three combat enemies absent from `enemies.json`
`BanditBear` ("Bear"), `BanditLeader` ("Romeo"), `BanditChild` ("Pointy") in `monsters/city/` are the Masked Bandits event fight. They have HP, moves and AI like any monster and must be in `monsters.json`. Other code-only classes are correctly excluded: `ApologySlime` (debug), `HexaghostBody`/`HexaghostOrb` (boss parts).

### F4. Class name ≠ game ID (29 cards, several monsters)
Localization and save files key on the `ID` constant, not the class. Examples: `Alchemize`→`Venomology`, `Nightmare`→`Night Terror`, `SneakyStrike`→`Underhanded Strike`, `WraithForm`→`Wraith Form v2`, `Claw`→`Gash`, `Equilibrium`→`Undo`, `Overclock`→`Steam Power`, `Recursion`→`Redo`, `SteamBarrier`→`Steam`, `Foresight`→`Wireheading`, `PressurePoints`→`PathToVictory`, `Rushdown`→`Adaptation`, `SimmeringFury`→`Vengeance`, `Tranquility`→`ClearTheMind`, `Apparition`→`Ghostly`, `VoidCard`→`Void`, `LouseNormal`→`FuzzyLouseNormal`, `SlaverBlue`→`SlaverBlue`, `BronzeOrb`→`BronzeOrb`. Rule adopted in the spec: identity = `ID`.

### F5. Monster move selection is approximated in prose
`enemies.json.pattern` describes AI as summary percentages (e.g. Jaw Worm "after Chomp 59 % Bellow / 41 % Thrash"). The code (`JawWorm.getMove`) is a roll-threshold tree with `lastMove`/`lastTwoMoves` checks: `roll<25` → if last was Chomp then 56.25 % Bellow else Thrash, else Chomp; `roll<55` → if last two were Thrash then 35.7 % Chomp else Bellow, else Thrash; `else` → if last was Bellow then 41.6 % Chomp else Thrash, else Bellow. The prose stays as a human summary; the engine ports `getMove` per monster.

### F6. Unused / test content in the jar (exclude)
Cards `Impulse` (blue, no localization), `Discipline` (localized "DEPRECATED"), `Unraveling` (purple, unobtainable); relics `Test 1/3/4/5/6`, `Discerning Monocle` (unused); potion `PotionSlot` (PLACEHOLDER rarity); event `SpireHeart` (Act 4 narrative, not a `?`-room event). The extractor's `class-filter.ts` must exclude these explicitly.

### F7. Numbers the wiki text cannot carry
Card `magicNumber`s that mean "next 1 card" (Double Tap, Burst, Amplify, Dual Wield, Buffer, Creative AI, Magnetism, Mayhem) or are dynamic (Body Slam, Stack, Blizzard, Mind Blast `0`), and a legacy unused `Corruption.magicNumber = 3`. Potions without literal potency (Ambrosia, Elixir, Gambler's Brew, Smoke Bomb, Stance Potion, Blessing of the Forge, Duplication). These are exactly the fields the structured `base`/`potency` columns add.

## Mechanic claims in `docs/sts1/*.md` checked against code

| Claim (doc) | Code | Result |
|---|---|---|
| Room weights monster 53 / elite 8 / rest 12 / shop 5 / event 22 % | `Exordium/TheCity/TheBeyond`: `shop 0.05, rest 0.12, treasure 0.0, event 0.22, elite 0.08` → monster = 0.53 | Confirmed |
| Ascension 1: "~60 % more elites" vs RE "8 %→16 %" (doc's open question #1) | `AbstractDungeon`: `eliteCount = round(rooms × eliteRoomChance × 1.6f)` at A1+; `× 2.5f` with "Deadly Events" | **Resolved: 1.6×, wiki correct, RE wrong** |
| Card rarity offset: start −5, +1 per non-rare, cap −40 | `cardBlizzStartOffset = 5; cardBlizzGrowth = 1; cardBlizzMaxOffset = -40` (sign: roll += offset, so start is +5 to the roll i.e. −5 % rare) | Confirmed |
| Normal 3 % rare / 37 % uncommon; elite forces RARE below its threshold | `getCardRarityFallback`: `<3 RARE, <40 UNCOMMON`; `MonsterRoomElite.getCardRarity` | Confirmed |
| Gold: normal 10–20, elite 25–35 | `AbstractRoom.addGoldToRewards(treasureRng.random(10,20))` / `(25,35)` | Confirmed |
| Chest odds small 75/25/0 (gold 50 %), medium 35/50/15 (35 %), large 0/75/25 (50 %) | `SmallChest/MediumChest/LargeChest` constants | Confirmed |
| Potion drop ±10 % swing | `AbstractRoom`: `blizzardPotionMod -= 10` on drop, `+= 10` otherwise | Confirmed |
| Rest heals 30 % max HP | `RestOption`: `maxHealth * 0.3f` (Night Terrors 1.0f) | Confirmed |
| A5: heal 75 % of missing HP between acts | `player.heal(round((max − cur) × 0.75f))` | Confirmed |
| Shop removal 75 gold, +25 per use | `ShopScreen.purgeCost = 75; PURGE_COST_RAMP = 25` | Confirmed |
| Card base price common 50 / uncommon 75 / rare 150 (doc lists ranges 45–55 etc.) | `AbstractCard.getPrice`: 50/75/150, then shop randomises ±10 % | Confirmed (doc ranges are the post-jitter values) |
| Base energy 3 for all four characters | `new EnergyManager(3)` in each character class | Confirmed |
| Act 1 weak pool: Cultist, Jaw Worm, 2 Louse, Small Slimes (uniform) | `Exordium.generateWeakEnemies`: weights all 2.0 | Confirmed |
| Act 1 strong pool and weights | `Blue Slaver 2, Gremlin Gang 1, Looter 2, Large Slime 2, Lots of Slimes 1, Exordium Thugs 1.5, Exordium Wildlife 1.5, Red Slaver 1, 3 Louse 2, 2 Fungi Beasts 2` | Doc has names only; weights now known |

## Consequences for the data-layer plan

1. `class-filter.ts` gets an explicit exclusion list (F6) and an inclusion of the three bandits (F3).
2. Schemas use the code enums: `CardRarity` incl. `curse`, `RelicTier` incl. `special` (no `event`).
3. Identity = `ID` constant everywhere (F4); `source.class` records the class separately.
4. `diff-baseline.ts` reproduces this audit on every extraction run and must report **zero** regressions against the numbers confirmed here.
5. Encounter weights (last two rows) go into `encounters.json`.
