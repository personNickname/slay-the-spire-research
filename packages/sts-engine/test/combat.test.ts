import { describe, expect, it } from "vitest";
import {
  applyDamagePowers,
  currentCost,
  drawCards,
  makeCard,
  playCard,
  startCombat,
} from "../src/combat.js";
import { newRun } from "../src/run.js";
import { CHARACTERS } from "../src/characters.js";
import { startingNodes } from "../src/map.js";
import type { Creature } from "../src/types.js";

function dummy(hp = 40): Creature {
  return {
    id: "e",
    name: { eng: "x", zhs: "x" },
    isPlayer: false,
    hp,
    maxHp: hp,
    block: 0,
    powers: [],
    lastMoves: [],
    alive: true,
    misc: {},
  };
}

describe("damage pipeline (DamageInfo.applyPowers)", () => {
  it("Strength then Vulnerable: (6+2)*1.5 = 12", () => {
    const atk: Creature = { ...dummy(), isPlayer: true, powers: [{ id: "Strength", amount: 2 }] };
    const def = dummy();
    def.powers = [{ id: "Vulnerable", amount: 1 }];
    expect(applyDamagePowers(6, atk, def)).toBe(12);
  });

  it("Weak then Vulnerable: floor(6*0.75*1.5) = 6", () => {
    const atk: Creature = { ...dummy(), isPlayer: true, powers: [{ id: "Weakened", amount: 1 }] };
    const def = dummy();
    def.powers = [{ id: "Vulnerable", amount: 1 }];
    expect(applyDamagePowers(6, atk, def)).toBe(6);
  });

  it("Wrath doubles outgoing", () => {
    const atk: Creature = { ...dummy(), isPlayer: true };
    expect(applyDamagePowers(6, atk, dummy(), "wrath")).toBe(12);
  });
});

describe("new run + jaw worm", () => {
  it("Ironclad starts with 10 cards, 80 HP, 99 gold, Burning Blood", () => {
    const run = newRun(1);
    expect(run.deck).toHaveLength(10);
    expect(run.player.hp).toBe(80);
    expect(run.gold).toBe(99);
    expect(run.relics[0]?.id).toBe("Burning Blood");
    expect(run.map.length).toBeGreaterThanOrEqual(15);
    expect(run.character).toBe("ironclad");
  });

  it("Bash applies Vulnerable and Jaw Worm's first intent is Chomp", () => {
    const run = newRun(42);
    startCombat(run, "Jaw Worm", "monster");
    const jaw = run.combat!.monsters[0]!;
    expect(jaw.monsterId).toBe("JawWorm");
    expect(jaw.nextMove).toBe(1);
    expect(jaw.intent).toBe("attack");
    if (run.combat!.hand.findIndex((c) => c.defId === "Bash") < 0) run.combat!.hand.push(makeCard(run, "Bash"));
    const idx = run.combat!.hand.findIndex((c) => c.defId === "Bash");
    run.combat!.energy = 3;
    playCard(run, idx, jaw.id);
    expect(jaw.powers.some((p) => p.id === "Vulnerable")).toBe(true);
  });
});

describe("characters", () => {
  it("Silent / Defect / Watcher starter decks match the jar", () => {
    expect(CHARACTERS.silent.deck).toHaveLength(12);
    expect(CHARACTERS.defect.orbSlots).toBe(3);
    expect(CHARACTERS.watcher.deck.includes("Eruption")).toBe(true);
    const s = newRun(7, { character: "silent" });
    expect(s.player.maxHp).toBe(70);
    expect(s.relics[0]?.id).toBe("Ring of the Snake");
    const d = newRun(7, { character: "defect" });
    expect(d.player.maxHp).toBe(75);
    const w = newRun(7, { character: "watcher" });
    expect(w.player.maxHp).toBe(72);
  });

  it("A6 starts at 90% HP and A10 adds Ascender's Bane", () => {
    const run = newRun(3, { ascension: 10 });
    expect(run.player.hp).toBe(Math.round(80 * 0.9));
    expect(run.deck.some((c) => c.defId === "AscendersBane")).toBe(true);
  });
});

describe("combat rules", () => {
  it("hand size caps at 10", () => {
    const run = newRun(9);
    startCombat(run, "Jaw Worm", "monster");
    const before = run.combat!.hand.length;
    for (let i = 0; i < 20; i++) run.combat!.discard.push(makeCard(run, "Strike_R"));
    drawCards(run, 20);
    expect(run.combat!.hand.length).toBeLessThanOrEqual(10);
    expect(run.combat!.hand.length).toBeGreaterThanOrEqual(before);
  });

  it("innate cards sit on top of the draw pile after shuffle", () => {
    const run = newRun(11);
    run.deck.push(makeCard(run, "Writhe"));
    startCombat(run, "Jaw Worm", "monster");
    const drawn = [...run.combat!.hand];
    // Writhe is Innate — after shuffle it is placed on top and drawn into the opening hand.
    expect(drawn.some((c) => c.defId === "Writhe")).toBe(true);
  });

  it("Whirlwind at 0 energy deals 0 hits", () => {
    const run = newRun(13);
    startCombat(run, "Jaw Worm", "monster");
    const jaw = run.combat!.monsters[0]!;
    const hp = jaw.hp;
    const ww = makeCard(run, "Whirlwind");
    run.combat!.hand.push(ww);
    run.combat!.energy = 0;
    expect(currentCost(run, ww)).toBe(-1);
    playCard(run, run.combat!.hand.length - 1, jaw.id);
    expect(jaw.hp).toBe(hp);
    expect(run.combat!.energy).toBe(0);
  });

  it("Slime Boss splits into Acid_L + Spike_L", () => {
    const run = newRun(15);
    startCombat(run, "Slime Boss", "boss");
    const boss = run.combat!.monsters[0]!;
    expect(boss.monsterId).toBe("SlimeBoss");
    boss.hp = 1;
    const bash = makeCard(run, "Strike_R");
    run.combat!.hand.push(bash);
    run.combat!.energy = 3;
    playCard(run, run.combat!.hand.length - 1, boss.id);
    const ids = run.combat!.monsters.filter((m) => m.alive).map((m) => m.monsterId);
    expect(ids).toEqual(expect.arrayContaining(["AcidSlime_L", "SpikeSlime_L"]));
  });
});

describe("map + neow", () => {
  it("row 0 only shows connected nodes; last row has edges to the boss", () => {
    const run = newRun(21);
    const starts = startingNodes(run.map);
    expect(starts.length).toBeGreaterThan(0);
    expect(starts.every((n) => n.edges.length > 0)).toBe(true);
    const rest = run.map[14]!.filter((n) => n.room);
    expect(rest.some((n) => n.edges.some((e) => e.y === 15))).toBe(true);
  });

  it("Neow offers one option per category", () => {
    const run = newRun(99);
    expect(run.event?.options).toHaveLength(4);
    expect(run.event?.options[3]?.id).toContain("BOSS_RELIC");
  });
});
