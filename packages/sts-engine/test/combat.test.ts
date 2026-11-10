import { describe, expect, it } from "vitest";
import {
  applyDamagePowers,
  currentCost,
  dealDamage,
  drawCards,
  makeCard,
  playCard,
  startCombat,
} from "../src/combat.js";
import { finishCombat, newRun, restRecall, takeSapphireKey } from "../src/run.js";
import { pickMove, takeTurn } from "../src/monsters.js";
import { generateMap, startingNodes } from "../src/map.js";
import { CHARACTERS } from "../src/characters.js";

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

describe("The Ending (act 4)", () => {
  it("act-4 map is the fixed rest → shop → elite chain", () => {
    const run = newRun(4004);
    run.act = 4;
    run.rng.map = { ...run.rng.map }!;
    const map = generateMap(run);
    expect(map).toHaveLength(3);
    expect(map[0]!.find((n) => n.room)?.room).toBe("rest");
    expect(map[1]!.find((n) => n.room)?.room).toBe("shop");
    expect(map[2]!.find((n) => n.room)?.room).toBe("elite");
    expect(startingNodes(map).map((n) => n.room)).toEqual(["rest"]);
  });

  it("act-3 boss without keys ends the run; with all three keys opens act 4", () => {
    const noKeys = newRun(4005);
    noKeys.act = 3;
    noKeys.roomKind = "boss";
    noKeys.combat = { victory: true } as never;
    finishCombat(noKeys);
    expect(noKeys.over).toBe("victory");
    expect(noKeys.act).toBe(3);

    const keyed = newRun(4006);
    keyed.act = 3;
    keyed.roomKind = "boss";
    keyed.keys = { ruby: true, sapphire: true, emerald: true };
    keyed.combat = { victory: true } as never;
    finishCombat(keyed);
    expect(keyed.act).toBe(4);
    expect(keyed.boss).toBe("Corrupt Heart");
    expect(keyed.map).toHaveLength(3);
    expect(keyed.screen).toBe("map");
  });

  it("ruby/sapphire keys flip via rest site and chest", () => {
    const run = newRun(4007);
    run.screen = "rest";
    restRecall(run);
    expect(run.keys?.ruby).toBe(true);
    run.rewards = { gold: 0, cards: [] };
    run.screen = "treasure";
    takeSapphireKey(run);
    expect(run.keys?.sapphire).toBe(true);
    expect(run.screen).toBe("map");
  });

  it("emerald key drops from the first elite victory after holding another key", () => {
    const run = newRun(4008);
    run.roomKind = "elite";
    run.keys = { ruby: true, sapphire: false, emerald: false };
    run.combat = { victory: true } as never;
    finishCombat(run);
    expect(run.keys.emerald).toBe(true);
    expect(run.rewards?.relic).toBeDefined();
  });

  it("Corrupt Heart starts with Beat of Death + Invincible; cards cost 1 HP", () => {
    const run = newRun(4009);
    startCombat(run, "Corrupt Heart", "boss");
    const heart = run.combat!.monsters[0]!;
    expect(heart.monsterId).toBe("CorruptHeart");
    expect(heart.powers.find((p) => p.id === "BeatOfDeath")?.amount).toBe(1);
    expect(heart.powers.find((p) => p.id === "Invincible")?.amount).toBe(300);
    const before = run.player.hp;
    const strike = makeCard(run, "Strike_R");
    run.combat!.hand.push(strike);
    run.combat!.energy = 3;
    playCard(run, run.combat!.hand.length - 1, heart.id);
    expect(run.player.hp).toBe(before - 1);
  });

  it("Invincible caps HP loss at 300 per turn and resets next turn", () => {
    const run = newRun(4010);
    startCombat(run, "Corrupt Heart", "boss");
    const heart = run.combat!.monsters[0]!;
    const lost = dealDamage(run, run.player, heart, 400);
    expect(lost).toBe(300);
    expect(heart.hp).toBe(heart.maxHp - 300);
    expect(dealDamage(run, run.player, heart, 400)).toBe(0);
    expect(heart.hp).toBe(heart.maxHp - 300);
  });

  it("Heart turn 1: Debilitate — triple debuff + five status cards into draw pile", () => {
    const run = newRun(4011);
    startCombat(run, "Corrupt Heart", "boss");
    const heart = run.combat!.monsters[0]!;
    expect(heart.intent).toBe("strong_debuff");
    const drawBefore = run.combat!.draw.length;
    takeTurn(run, heart);
    const player = run.player;
    expect(player.powers.find((p) => p.id === "Vulnerable")?.amount).toBe(2);
    expect(player.powers.find((p) => p.id === "Weakened")?.amount).toBe(2);
    expect(player.powers.find((p) => p.id === "Frail")?.amount).toBe(2);
    const added = run.combat!.draw.length - drawBefore;
    expect(added).toBe(5);
  });

  it("Heart buff cadence: turns 4/7/10 escalate Artifact → BeatOfDeath → Painful Stabs", () => {
    const run = newRun(4012);
    startCombat(run, "Corrupt Heart", "boss");
    const heart = run.combat!.monsters[0]!;
    heart.misc.turn = 3;
    pickMove(run, heart, 50);
    expect(heart.nextMove).toBe(4);
    takeTurn(run, heart);
    expect(heart.powers.find((p) => p.id === "Artifact")?.amount).toBe(2);
    expect(heart.powers.find((p) => p.id === "Strength")?.amount).toBe(2);
    heart.misc.turn = 6;
    pickMove(run, heart, 50);
    takeTurn(run, heart);
    expect(heart.powers.find((p) => p.id === "BeatOfDeath")?.amount).toBe(2);
    heart.misc.turn = 9;
    pickMove(run, heart, 50);
    takeTurn(run, heart);
    expect(heart.powers.find((p) => p.id === "Painful Stabs")?.amount).toBe(1);
  });

  it("Painful Stabs: attacking the Heart shuffles a Wound into discard", () => {
    const run = newRun(4013);
    startCombat(run, "Corrupt Heart", "boss");
    const heart = run.combat!.monsters[0]!;
    heart.powers.push({ id: "Painful Stabs", amount: 1 });
    const before = run.combat!.discard.length;
    const strike = makeCard(run, "Strike_R");
    run.combat!.hand.push(strike);
    run.combat!.energy = 3;
    playCard(run, run.combat!.hand.length - 1, heart.id);
    expect(run.combat!.discard.length).toBeGreaterThan(before);
    expect(run.combat!.discard.some((c) => c.defId === "Wound")).toBe(true);
  });

  it("Spire Shield and Spear: Surrounded on player, opener + fixed cadence", () => {
    const run = newRun(4014);
    startCombat(run, "Spire Shield and Spear", "elite");
    const [shield, spear] = run.combat!.monsters;
    expect(shield!.monsterId).toBe("SpireShield");
    expect(spear!.monsterId).toBe("SpireSpear");
    expect(run.player.powers.find((p) => p.id === "Surrounded")?.amount).toBe(1);
    expect(shield!.powers.find((p) => p.id === "Artifact")?.amount).toBe(1);
    // Surrounded: monster attack against player is ×1.5
    const base = applyDamagePowers(10, shield!, run.player);
    expect(base).toBe(15);
    // Spear opens with Burn Strike (5×2), Shield alternates Bash/Fortify
    expect(spear!.intent).toBe("attack_debuff");
    expect(spear!.intentHits).toBe(2);
    // Smash cadence: shield turn 3 → 34 dmg attack_defend; skewer: spear turn 2 → 10×3
    shield!.misc.turn = 2;
    pickMove(run, shield!, 50);
    expect(shield!.nextMove).toBe(3);
    expect(shield!.intentDamage).toBe(34);
    spear!.misc.turn = 1;
    pickMove(run, spear!, 50);
    expect(spear!.nextMove).toBe(2);
    expect(spear!.intentDamage).toBe(10);
    expect(spear!.intentHits).toBe(3);
  });

  it("act-4 boss defeat is the true ending", () => {
    const run = newRun(4015);
    run.act = 4;
    run.boss = "Corrupt Heart";
    run.roomKind = "boss";
    run.combat = { victory: true } as never;
    finishCombat(run);
    expect(run.over).toBe("victory");
    expect(run.act).toBe(4);
  });
});
