import { CARD_BY_ID, POTIONS, RELICS, cardDef } from "./catalog.js";
import { CHARACTERS } from "./characters.js";
import {
  addPower,
  channelOrb,
  changeStance,
  dealDamage,
  drawCards,
  gainBlock,
  log,
  makeCard,
  startCombat,
  upgradeCard,
} from "./combat.js";
import { generateMap, reachableFrom } from "./map.js";
import { poolsForAct, weightedPick } from "./monsters.js";
import { StsRandom, makeSeed } from "./rng.js";
import type {
  CardInst,
  CharacterId,
  EventState,
  RewardState,
  RoomKind,
  RunState,
  ShopOffer,
} from "./types.js";

const STREAMS = [
  "monster",
  "event",
  "merchant",
  "card",
  "treasure",
  "relic",
  "monsterHp",
  "potion",
  "ai",
  "shuffle",
  "cardRandom",
  "misc",
  "map",
] as const;

function R(run: RunState, name: string): StsRandom {
  return StsRandom.fromState(run.rng[name]!);
}
function save(run: RunState, name: string, r: StsRandom): void {
  run.rng[name] = r.toState();
}

export function newRun(
  seed?: number,
  opts: { character?: CharacterId; ascension?: number; lang?: "zhs" | "eng" } = {},
): RunState {
  const s = seed ?? makeSeed();
  const character = opts.character ?? "ironclad";
  const ch = CHARACTERS[character];
  const ascension = opts.ascension ?? 0;
  const rng: RunState["rng"] = {};
  for (const name of STREAMS) rng[name] = new StsRandom(s).toState();
  rng.map = new StsRandom(s + 1).toState();

  let maxHp = ch.hp;
  if (ascension >= 14) maxHp -= character === "ironclad" ? 5 : 4;
  let hp = maxHp;
  if (ascension >= 6) hp = Math.round(maxHp * 0.9);
  const potionSlots = ascension >= 11 ? 2 : 3;
  const gold = 99;

  const run: RunState = {
    seed: s,
    character,
    lang: opts.lang ?? "zhs",
    ascension,
    act: 1,
    floor: 0,
    gold,
    player: {
      id: "player",
      name: ch.name,
      isPlayer: true,
      hp,
      maxHp,
      block: 0,
      powers: [],
      lastMoves: [],
      alive: true,
      misc: {},
    },
    deck: [],
    relics: [{ id: ch.relic, counter: 0 }],
    potions: Array.from({ length: potionSlots }, () => null),
    potionSlots,
    rng,
    map: [],
    current: null,
    visited: [],
    screen: "neow",
    boss: "",
    log: [],
    purgeCount: 0,
    cardBlizzRandomizer: 5,
    potionChance: 40,
    uidSeq: 0,
    neowLament: 0,
    actBosses: [],
    keys: { ruby: false, sapphire: false, emerald: false },
  };
  run.deck = ch.deck.map((id) => makeCard(run, id));
  if (ascension >= 10) run.deck.push(makeCard(run, "AscendersBane"));
  pickActBoss(run);
  run.map = generateMap(run);
  run.event = neowEvent(run);
  log(run, `种子 ${s} · ${ch.name.zhs} · Boss：${run.boss}`, `Seed ${s}`);
  return run;
}

function pickActBoss(run: RunState): void {
  const bosses = [...poolsForAct(run.act).boss].filter((b) => !run.actBosses.includes(b));
  const pool = bosses.length ? bosses : [...poolsForAct(run.act).boss];
  const br = R(run, "monster");
  br.shuffle(pool);
  run.boss = pool[0]!;
  run.actBosses.push(run.boss);
  save(run, "monster", br);
}

const NEOW0 = ["THREE_CARDS", "ONE_RANDOM_RARE_CARD", "REMOVE_CARD", "UPGRADE_CARD", "TRANSFORM_CARD", "RANDOM_COLORLESS"] as const;
const NEOW1 = ["THREE_SMALL_POTIONS", "RANDOM_COMMON_RELIC", "TEN_PERCENT_HP_BONUS", "THREE_ENEMY_KILL", "HUNDRED_GOLD"] as const;
const NEOW2 = ["RANDOM_COLORLESS_2", "REMOVE_TWO", "ONE_RARE_RELIC", "THREE_RARE_CARDS", "TWO_FIFTY_GOLD", "TRANSFORM_TWO_CARDS", "TWENTY_PERCENT_HP_BONUS"] as const;
const DRAWBACKS = ["TEN_PERCENT_HP_LOSS", "NO_GOLD", "CURSE", "PERCENT_DAMAGE"] as const;

function neowLabel(id: string, drawback?: string): { eng: string; zhs: string } {
  const map: Record<string, { eng: string; zhs: string }> = {
    THREE_CARDS: { eng: "Choose a card to obtain", zhs: "从 3 张牌中选择获得 1 张" },
    ONE_RANDOM_RARE_CARD: { eng: "Obtain a random rare card", zhs: "获得一张随机稀有牌" },
    REMOVE_CARD: { eng: "Remove a card", zhs: "移除一张牌" },
    UPGRADE_CARD: { eng: "Upgrade a card", zhs: "升级一张牌" },
    TRANSFORM_CARD: { eng: "Transform a card", zhs: "变化一张牌" },
    RANDOM_COLORLESS: { eng: "Obtain a random colorless card", zhs: "获得一张随机无色牌" },
    THREE_SMALL_POTIONS: { eng: "Obtain 3 random potions", zhs: "获得 3 瓶随机药水" },
    RANDOM_COMMON_RELIC: { eng: "Obtain a random common relic", zhs: "获得一件随机普通遗物" },
    TEN_PERCENT_HP_BONUS: { eng: "Max HP +10%", zhs: "最大生命 +10%" },
    THREE_ENEMY_KILL: { eng: "Enemies in the next three combats have 1 HP", zhs: "接下来 3 场战斗的敌人只有 1 点生命（悲叹）" },
    HUNDRED_GOLD: { eng: "Gain 100 gold", zhs: "获得 100 金币" },
    RANDOM_COLORLESS_2: { eng: "Obtain 2 random colorless cards", zhs: "获得 2 张随机无色牌" },
    REMOVE_TWO: { eng: "Remove 2 cards", zhs: "移除 2 张牌" },
    ONE_RARE_RELIC: { eng: "Obtain a random rare relic", zhs: "获得一件随机稀有遗物" },
    THREE_RARE_CARDS: { eng: "Choose a rare card to obtain", zhs: "从 3 张稀有牌中选择获得 1 张" },
    TWO_FIFTY_GOLD: { eng: "Gain 250 gold", zhs: "获得 250 金币" },
    TRANSFORM_TWO_CARDS: { eng: "Transform 2 cards", zhs: "变化 2 张牌" },
    TWENTY_PERCENT_HP_BONUS: { eng: "Max HP +20%", zhs: "最大生命 +20%" },
    BOSS_RELIC: { eng: "Obtain a random boss relic", zhs: "获得一件随机 Boss 遗物" },
    TEN_PERCENT_HP_LOSS: { eng: " (lose 10% Max HP)", zhs: "（失去 10% 最大生命）" },
    NO_GOLD: { eng: " (lose all gold)", zhs: "（失去全部金币）" },
    CURSE: { eng: " (obtain a curse)", zhs: "（获得一张诅咒）" },
    PERCENT_DAMAGE: { eng: " (take 30% current HP damage)", zhs: "（失去 30% 当前生命）" },
  };
  const base = map[id] ?? { eng: id, zhs: id };
  const db = drawback && drawback !== "NONE" ? map[drawback] : undefined;
  return db ? { eng: base.eng + db.eng, zhs: base.zhs + db.zhs } : base;
}

function neowEvent(run: RunState): EventState {
  const r = R(run, "event");
  const pick = <T>(arr: readonly T[]): T => arr[r.nextInt(arr.length)]!;
  const d = pick(DRAWBACKS);
  let cat2 = [...NEOW2];
  if (d === "CURSE") cat2 = cat2.filter((x) => x !== "REMOVE_TWO");
  if (d === "NO_GOLD") cat2 = cat2.filter((x) => x !== "TWO_FIFTY_GOLD");
  if (d === "TEN_PERCENT_HP_LOSS") cat2 = cat2.filter((x) => x !== "TWENTY_PERCENT_HP_BONUS");
  const o0 = pick(NEOW0);
  const o1 = pick(NEOW1);
  const o2 = pick(cat2);
  save(run, "event", r);
  return {
    id: "neow",
    title: { eng: "Neow", zhs: "涅奥" },
    body: {
      eng: "Hello... More... More time has passed...",
      zhs: "你好……又过去了不少时间……选一项祝福。",
    },
    options: [
      { id: `0:${o0}`, label: neowLabel(o0) },
      { id: `1:${o1}`, label: neowLabel(o1) },
      { id: `2:${o2}:${d}`, label: neowLabel(o2, d) },
      { id: "3:BOSS_RELIC", label: neowLabel("BOSS_RELIC") },
    ],
  };
}

function colorOf(run: RunState): "red" | "green" | "blue" | "purple" {
  return CHARACTERS[run.character].color;
}

function randomColorCard(run: RunState, rarity: "common" | "uncommon" | "rare", colorless = false): CardInst {
  const color = colorless ? "colorless" : colorOf(run);
  const pool = [...CARD_BY_ID.values()].filter(
    (c) => c.color === color && c.rarity === rarity && c.type !== "status" && c.type !== "curse",
  );
  const r = R(run, "card");
  const def = pool[r.nextInt(Math.max(1, pool.length))] ?? [...CARD_BY_ID.values()].find((c) => c.id === "Strike_R")!;
  save(run, "card", r);
  return makeCard(run, def.id);
}

function transformCard(run: RunState, uid: string): void {
  const i = run.deck.findIndex((c) => c.uid === uid);
  if (i < 0) return;
  const old = run.deck[i]!;
  const def = cardDef(old.defId);
  const pool = [...CARD_BY_ID.values()].filter(
    (c) => c.color === def.color && c.rarity !== "basic" && c.type !== "status" && c.id !== old.defId,
  );
  const r = R(run, "card");
  const nxt = pool[r.nextInt(pool.length)] ?? def;
  save(run, "card", r);
  run.deck[i] = makeCard(run, nxt.id);
}

export function chooseNeow(run: RunState, option: string, cardUid?: string, cardUid2?: string): void {
  const parts = option.split(":");
  const type = parts[1] ?? option;
  const drawback = parts[2];
  if (drawback === "TEN_PERCENT_HP_LOSS") {
    const loss = Math.max(1, Math.floor(run.player.maxHp * 0.1));
    run.player.maxHp -= loss;
    run.player.hp = Math.min(run.player.hp, run.player.maxHp);
  } else if (drawback === "NO_GOLD") run.gold = 0;
  else if (drawback === "CURSE") run.deck.push(makeCard(run, "Injury"));
  else if (drawback === "PERCENT_DAMAGE") {
    run.player.hp = Math.max(1, run.player.hp - Math.floor((run.player.hp / 10) * 3));
  }

  if (type === "maxhp" || type === "TEN_PERCENT_HP_BONUS") {
    const b = Math.max(1, Math.floor(run.player.maxHp * 0.1));
    run.player.maxHp += b;
    run.player.hp += b;
  } else if (type === "TWENTY_PERCENT_HP_BONUS") {
    const b = Math.max(1, Math.floor(run.player.maxHp * 0.2));
    run.player.maxHp += b;
    run.player.hp += b;
  } else if (type === "gold" || type === "HUNDRED_GOLD") run.gold += 100;
  else if (type === "TWO_FIFTY_GOLD") run.gold += 250;
  else if ((type === "upgrade" || type === "UPGRADE_CARD") && cardUid) {
    const c = run.deck.find((x) => x.uid === cardUid);
    if (c) upgradeCard(c);
  } else if ((type === "remove" || type === "REMOVE_CARD" || type === "REMOVE_TWO") && cardUid) {
    run.deck = run.deck.filter((x) => x.uid !== cardUid);
    if (type === "REMOVE_TWO" && cardUid2) run.deck = run.deck.filter((x) => x.uid !== cardUid2);
  } else if (type === "TRANSFORM_CARD" && cardUid) transformCard(run, cardUid);
  else if ((type === "TRANSFORM_TWO" || type === "TRANSFORM_TWO_CARDS") && cardUid) {
    transformCard(run, cardUid);
    if (cardUid2) transformCard(run, cardUid2);
  }
  else if (type === "THREE_SMALL_POTIONS") {
    for (let i = 0; i < 3; i++) {
      const slot = run.potions.findIndex((p) => p === null);
      if (slot >= 0) run.potions[slot] = { id: pickPotion(run) };
    }
  } else if (type === "RANDOM_COMMON_RELIC") run.relics.push({ id: randomRelic(run, "common"), counter: 0 });
  else if (type === "ONE_RARE_RELIC") run.relics.push({ id: randomRelic(run, "rare"), counter: 0 });
  else if (type === "BOSS_RELIC") run.relics.push({ id: randomRelic(run, "boss"), counter: 0 });
  else if (type === "ONE_RANDOM_RARE_CARD") run.deck.push(randomColorCard(run, "rare"));
  else if (type === "RANDOM_COLORLESS") run.deck.push(randomColorCard(run, "uncommon", true));
  else if (type === "RANDOM_COLORLESS_2") {
    run.deck.push(randomColorCard(run, "uncommon", true));
    run.deck.push(randomColorCard(run, "rare", true));
  } else if (type === "THREE_CARDS" || type === "THREE_RARE_CARDS") {
    run.rewards = {
      gold: 0,
      cards: [0, 1, 2].map(() => ({ card: randomColorCard(run, type === "THREE_RARE_CARDS" ? "rare" : "common") })),
    };
    run.event = undefined;
    run.screen = "rewards";
    return;
  } else if (type === "THREE_ENEMY_KILL") run.neowLament = 3;
  run.event = undefined;
  run.screen = "map";
}

export function enterNode(run: RunState, x: number, y: number): void {
  const allowed = reachableFrom(run.map, run.current);
  if (!allowed.some((n) => n.x === x && n.y === y)) return;
  const node = run.map[y]![x]!;
  run.current = { x, y };
  run.visited.push({ x, y });
  const kind = (node.room ?? "monster") as RoomKind;
  if (kind === "boss") {
    enterBoss(run);
    return;
  }
  run.floor += 1;
  run.roomKind = kind;
  if (kind === "monster") beginFight(run, false);
  else if (kind === "elite") beginFight(run, true);
  else if (kind === "rest") run.screen = "rest";
  else if (kind === "shop") openShop(run);
  else if (kind === "treasure") openTreasure(run);
  else if (kind === "event") openEvent(run);
}

export function enterBoss(run: RunState): void {
  run.floor += 1;
  run.roomKind = "boss";
  startCombat(run, run.boss, "boss");
}

function beginFight(run: RunState, elite: boolean): void {
  const pools = poolsForAct(run.act);
  const floorInAct = ((run.floor - 1) % 17) + 1;
  const enc = elite
    ? weightedPick(run, pools.elite, "monster")
    : floorInAct <= 3
      ? weightedPick(run, pools.weak, "monster")
      : weightedPick(run, pools.strong, "monster");
  startCombat(run, enc, elite ? "elite" : "monster");
  if (run.neowLament > 0 && run.combat) {
    for (const m of run.combat.monsters) {
      m.hp = 1;
      m.maxHp = Math.max(1, m.maxHp);
    }
    run.neowLament -= 1;
  }
}

function rollCardRarity(run: RunState, elite: boolean): "common" | "uncommon" | "rare" {
  if (elite) {
    // MonsterRoomElite: rare if roll < rareRate else super
    const r = R(run, "card");
    const roll = r.random(99) + run.cardBlizzRandomizer;
    save(run, "card", r);
    if (roll < 3) return "rare";
    return "uncommon"; // elites still can roll non-rare via super.getCardRarity; simplified: often uncommon/rare
  }
  const r = R(run, "card");
  let roll = r.random(99);
  roll += run.cardBlizzRandomizer;
  save(run, "card", r);
  if (roll < 3) {
    run.cardBlizzRandomizer = 5;
    return "rare";
  }
  run.cardBlizzRandomizer = Math.max(-40, run.cardBlizzRandomizer - 1);
  if (roll < 40) return "uncommon";
  return "common";
}

function randomRedCard(run: RunState, rarity: "common" | "uncommon" | "rare"): CardInst {
  return randomColorCard(run, rarity);
}

export function finishCombat(run: RunState): void {
  if (!run.combat?.victory) return;
  if (run.relics.some((r) => r.id === "Burning Blood") && run.player.hp > 0) {
    run.player.hp = Math.min(run.player.maxHp, run.player.hp + 6);
  }
  if (run.relics.some((r) => r.id === "Black Blood") && run.player.hp > 0) {
    run.player.hp = Math.min(run.player.maxHp, run.player.hp + 12);
  }
  if (run.relics.some((r) => r.id === "Meat on the Bone") && run.player.hp > 0 && run.player.hp <= run.player.maxHp / 2) {
    run.player.hp = Math.min(run.player.maxHp, run.player.hp + 12);
  }
  const elite = run.roomKind === "elite";
  const boss = run.roomKind === "boss";
  // Emerald Key: first elite victory after holding any other key
  if (elite && run.keys && !run.keys.emerald && (run.keys.ruby || run.keys.sapphire)) {
    run.keys.emerald = true;
    log(run, "获得绿宝石钥匙", "Obtained the Emerald Key");
  }
  // Act 3/4 bosses give no rewards (wiki/Map_Locations); keys gate the Ending
  if (boss && run.act >= 3) {
    run.combat = undefined;
    if (run.act === 3 && run.keys?.ruby && run.keys.sapphire && run.keys.emerald) {
      advanceAct(run);
      return;
    }
    run.over = "victory";
    run.screen = "gameover";
    return;
  }
  const tr = R(run, "treasure");
  const gold = boss ? tr.randomRange(95, 105) : elite ? tr.randomRange(25, 35) : tr.randomRange(10, 20);
  save(run, "treasure", tr);
  const cards = [randomRedCard(run, rollCardRarity(run, elite)), randomRedCard(run, rollCardRarity(run, elite)), randomRedCard(run, rollCardRarity(run, elite))];
  const rewards: RewardState = { gold, cards: cards.map((card) => ({ card })) };
  const pr = R(run, "potion");
  if (pr.random(99) < run.potionChance) {
    run.potionChance -= 10;
    rewards.potion = { id: pickPotion(run) };
  } else run.potionChance += 10;
  save(run, "potion", pr);
  if (elite) rewards.relic = { id: randomRelic(run, rollRelicTier(run)), counter: 0 };
  if (boss) rewards.relic = { id: randomRelic(run, "boss"), counter: 0 };
  run.rewards = rewards;
  run.combat = undefined;
  if (boss) {
    run.gold += gold;
    advanceAct(run);
    return;
  }
  run.screen = "rewards";
}

function rollRelicTier(run: RunState): "common" | "uncommon" | "rare" {
  const r = R(run, "relic");
  const roll = r.random(99);
  save(run, "relic", r);
  if (roll < 50) return "common";
  if (roll < 83) return "uncommon";
  return "rare";
}

function pickPotion(run: RunState): string {
  const r = R(run, "potion");
  const id = POTIONS[r.nextInt(POTIONS.length)]!.id;
  save(run, "potion", r);
  return id;
}

function advanceAct(run: RunState): void {
  run.act += 1;
  run.current = null;
  run.visited = [];
  run.rng.map = new StsRandom(run.seed + run.act).toState();
  pickActBoss(run);
  run.map = generateMap(run);
  if (run.ascension >= 5) {
    const missing = run.player.maxHp - run.player.hp;
    run.player.hp = Math.min(run.player.maxHp, run.player.hp + Math.round(missing * 0.75));
  } else run.player.hp = run.player.maxHp;
  run.screen = "map";
  run.rewards = undefined;
  run.combat = undefined;
  log(run, `进入第 ${run.act} 幕 · Boss：${run.boss}`, `Act ${run.act}`);
}

function randomRelic(run: RunState, tier: string): string {
  const owned = new Set(run.relics.map((r) => r.id));
  const pool = RELICS.filter((r) => r.tier === tier && r.pool !== "red" || r.tier === tier).filter((r) => !owned.has(r.id));
  const fallback = RELICS.filter((r) => r.tier === tier && !owned.has(r.id));
  const use = fallback.length ? fallback : RELICS.filter((r) => r.tier === "common");
  const r = R(run, "relic");
  const pick = use[r.nextInt(use.length)]!;
  save(run, "relic", r);
  return pick.id;
}

export function takeRewardCard(run: RunState, uid: string): void {
  const card = run.rewards?.cards.find((c) => c.card.uid === uid)?.card;
  if (!card || !run.rewards) return;
  run.deck.push(card);
  run.rewards.cards = [];
}

export function skipRewardCards(run: RunState): void {
  if (run.rewards) run.rewards.cards = [];
}

export function takeRewardGold(run: RunState): void {
  if (!run.rewards) return;
  run.gold += run.rewards.gold;
  run.rewards.gold = 0;
}

export function takeRewardPotion(run: RunState): void {
  if (!run.rewards?.potion) return;
  const i = run.potions.findIndex((p) => p === null);
  if (i >= 0) run.potions[i] = run.rewards.potion;
  run.rewards.potion = null;
}

export function takeRewardRelic(run: RunState): void {
  if (!run.rewards?.relic) return;
  run.relics.push(run.rewards.relic);
  run.rewards.relic = null;
}

export function leaveRewards(run: RunState): void {
  if (run.rewards) {
    if (run.rewards.gold) takeRewardGold(run);
  }
  run.rewards = undefined;
  run.screen = "map";
}

export function restHeal(run: RunState): void {
  const pct = run.ascension >= 15 ? 0.2 : 0.3;
  const amt = Math.floor(run.player.maxHp * pct);
  run.player.hp = Math.min(run.player.maxHp, run.player.hp + amt);
  run.screen = "map";
}

export function restSmith(run: RunState, uid: string): void {
  const c = run.deck.find((x) => x.uid === uid);
  if (c) upgradeCard(c);
  run.screen = "map";
}

/** Ruby Key: the "Recall" option at rest sites (wiki/The_Ending). */
export function restRecall(run: RunState): void {
  if (!run.keys) run.keys = { ruby: false, sapphire: false, emerald: false };
  if (!run.keys.ruby) {
    run.keys.ruby = true;
    log(run, "回忆起了红宝石钥匙", "Recalled the Ruby Key");
  }
  run.screen = "map";
}

/** Sapphire Key: swap a chest's relic for the key (wiki/The_Ending). */
export function takeSapphireKey(run: RunState): void {
  if (!run.keys) run.keys = { ruby: false, sapphire: false, emerald: false };
  if (!run.keys.sapphire) {
    run.keys.sapphire = true;
    log(run, "用宝箱换取了蓝宝石钥匙", "Traded the chest for the Sapphire Key");
  }
  run.rewards = undefined;
  run.screen = "map";
}

function jitter(run: RunState, price: number): number {
  const r = R(run, "merchant");
  const j = r.randomRange(-10, 10);
  save(run, "merchant", r);
  let p = Math.max(1, Math.round(price * (1 + j / 100)));
  if (run.relics.some((x) => x.id === "Membership Card" || x.id === "Member Card")) p = Math.max(1, Math.round(p * 0.5));
  else if (run.relics.some((x) => x.id === "The Courier" || x.id === "Courier")) p = Math.max(1, Math.round(p * 0.8));
  if (run.ascension >= 16) p = Math.round(p * 1.1);
  return p;
}

function openShop(run: RunState): void {
  const offers: ShopOffer[] = [];
  for (let i = 0; i < 3; i++) {
    const rarity = i === 2 ? "rare" : i === 1 ? "uncommon" : "common";
    const card = randomColorCard(run, rarity);
    const base = rarity === "rare" ? 150 : rarity === "uncommon" ? 75 : 50;
    offers.push({ kind: "card", id: card.defId, card, price: jitter(run, base), sold: false });
  }
  for (const rarity of ["uncommon", "rare"] as const) {
    const card = randomColorCard(run, rarity, true);
    const base = rarity === "rare" ? 180 : 90;
    offers.push({ kind: "card", id: card.defId, card, price: jitter(run, base), sold: false });
  }
  for (const tier of ["common", "uncommon", "rare"] as const) {
    const id = randomRelic(run, tier);
    const base = tier === "rare" ? 300 : tier === "uncommon" ? 250 : 150;
    offers.push({ kind: "relic", id, price: jitter(run, base), sold: false });
  }
  for (let i = 0; i < 3; i++) {
    const id = pickPotion(run);
    offers.push({ kind: "potion", id, price: jitter(run, 50), sold: false });
  }
  run.shop = { offers, purgePrice: jitter(run, 75 + run.purgeCount * 25), purgeUsed: false };
  run.screen = "shop";
}

export function buyShop(run: RunState, index: number): void {
  const o = run.shop?.offers[index];
  if (!o || o.sold || run.gold < o.price) return;
  run.gold -= o.price;
  o.sold = true;
  if (o.kind === "card" && o.card) run.deck.push(o.card);
  if (o.kind === "relic") run.relics.push({ id: o.id, counter: 0 });
  if (o.kind === "potion") {
    const i = run.potions.findIndex((p) => p === null);
    if (i >= 0) run.potions[i] = { id: o.id };
  }
}

export function shopPurge(run: RunState, uid: string): void {
  if (!run.shop || run.shop.purgeUsed || run.gold < run.shop.purgePrice) return;
  run.gold -= run.shop.purgePrice;
  run.deck = run.deck.filter((c) => c.uid !== uid);
  run.purgeCount += 1;
  run.shop.purgeUsed = true;
}

export function leaveShop(run: RunState): void {
  run.shop = undefined;
  run.screen = "map";
}

function openTreasure(run: RunState): void {
  const r = R(run, "treasure");
  const roll = r.random(99);
  save(run, "treasure", r);
  // small chest 75/25/0 — Act 1 chests are small/medium mixed; use small odds
  const tier = roll < 75 ? "common" : "uncommon";
  run.rewards = { gold: 0, cards: [], relic: { id: randomRelic(run, tier), counter: 0 } };
  run.screen = "treasure";
}

const EVENTS: EventState[] = [
  {
    id: "big_fish",
    title: { eng: "Big Fish", zhs: "大鱼" },
    body: { eng: "You find a delicious meal.", zhs: "你发现一顿美餐。" },
    options: [
      { id: "banana", label: { eng: "Heal 1/3 HP", zhs: "回复 1/3 生命" } },
      { id: "donut", label: { eng: "Max HP +5", zhs: "最大生命 +5" } },
      { id: "box", label: { eng: "Relic, gain Regret", zhs: "获得遗物，将懊悔加入卡组" } },
    ],
  },
  {
    id: "shining_light",
    title: { eng: "Shining Light", zhs: "闪耀之光" },
    body: { eng: "A column of warm light.", zhs: "一道温暖的光柱。" },
    options: [
      { id: "enter", label: { eng: "Upgrade 2 cards, take 20% HP damage", zhs: "升级 2 张牌，失去 20% 生命" } },
      { id: "leave", label: { eng: "Leave", zhs: "离开" } },
    ],
  },
  {
    id: "scrap_ooze",
    title: { eng: "Scrap Ooze", zhs: "废料淤泥" },
    body: { eng: "A pile of goo and metal.", zhs: "一摊带着金属的淤泥。" },
    options: [
      { id: "reach", label: { eng: "Lose 3 HP, 25% relic", zhs: "失去 3 生命，25% 获得遗物" } },
      { id: "leave", label: { eng: "Leave", zhs: "离开" } },
    ],
  },
  {
    id: "world_of_goop",
    title: { eng: "World of Goop", zhs: "淤泥之地" },
    body: { eng: "Gold, or goop?", zhs: "金币，还是淤泥？" },
    options: [
      { id: "gold", label: { eng: "75 gold, lose 11 HP", zhs: "75 金币，失去 11 生命" } },
      { id: "leave", label: { eng: "Leave the gold", zhs: "放弃金币离开" } },
    ],
  },
  {
    id: "upgrade_shrine",
    title: { eng: "Upgrade Shrine", zhs: "升级神龛" },
    body: { eng: "A shrine of smithing.", zhs: "锻造神龛。" },
    options: [
      { id: "pray", label: { eng: "Upgrade a card", zhs: "升级一张牌" } },
      { id: "leave", label: { eng: "Leave", zhs: "离开" } },
    ],
  },
  {
    id: "golden_shrine",
    title: { eng: "Golden Shrine", zhs: "黄金神龛" },
    body: { eng: "Offerings of gold.", zhs: "黄金的供奉。" },
    options: [
      { id: "pray", label: { eng: "Gain 100 gold", zhs: "获得 100 金币" } },
      { id: "desecrate", label: { eng: "Gain 275 gold, become Cursed", zhs: "获得 275 金币，被诅咒" } },
      { id: "leave", label: { eng: "Leave", zhs: "离开" } },
    ],
  },
];

const SHRINES: EventState[] = EVENTS.filter((e) => e.id.endsWith("shrine") || e.id === "golden_shrine" || e.id === "upgrade_shrine");
const COMBAT_EVENTS = ["mushrooms", "dead_adventurer", "living_wall", "masked_bandits"];

function openEvent(run: RunState): void {
  const r = R(run, "event");
  // EventHelper.roll can convert the room; shrineChance = 0.25f
  const shrine = r.nextFloat() < 0.25;
  const combatish = r.nextFloat() < 0.1;
  save(run, "event", r);
  if (combatish && run.ascension < 15) {
    beginFight(run, false);
    return;
  }
  const pool = shrine ? SHRINES : EVENTS.filter((e) => !SHRINES.includes(e));
  const use = pool.length ? pool : EVENTS;
  const er = R(run, "event");
  const ev = use[er.nextInt(use.length)]!;
  save(run, "event", er);
  run.event = JSON.parse(JSON.stringify(ev)) as EventState;
  run.screen = "event";
  void COMBAT_EVENTS;
}

export function chooseEvent(run: RunState, option: string, cardUid?: string): void {
  const id = run.event?.id;
  if (!id) return;
  if (id === "big_fish") {
    if (option === "banana") run.player.hp = Math.min(run.player.maxHp, run.player.hp + Math.floor(run.player.maxHp / 3));
    if (option === "donut") {
      run.player.maxHp += 5;
      run.player.hp += 5;
    }
    if (option === "box") {
      run.relics.push({ id: randomRelic(run, "special"), counter: 0 });
      run.deck.push(makeCard(run, "Regret"));
    }
  } else if (id === "shining_light") {
    if (option === "enter") {
      run.player.hp = Math.max(1, run.player.hp - Math.floor(run.player.maxHp * 0.2));
      const up = run.deck.filter((c) => !c.upgraded && cardDef(c.defId).type !== "curse" && cardDef(c.defId).type !== "status");
      upgradeCard(up[0] ?? run.deck[0]!);
      if (up[1]) upgradeCard(up[1]);
    }
  } else if (id === "scrap_ooze") {
    if (option === "reach") {
      run.player.hp = Math.max(1, run.player.hp - 3);
      const r = R(run, "misc");
      const ok = r.randomChance(0.25);
      save(run, "misc", r);
      if (ok) run.relics.push({ id: randomRelic(run, "common"), counter: 0 });
    }
  } else if (id === "world_of_goop") {
    if (option === "gold") {
      run.gold += 75;
      run.player.hp = Math.max(1, run.player.hp - 11);
    }
  } else if (id === "upgrade_shrine") {
    if (option === "pray" && cardUid) {
      const c = run.deck.find((x) => x.uid === cardUid);
      if (c) upgradeCard(c);
    }
  } else if (id === "golden_shrine") {
    if (option === "pray") run.gold += 100;
    if (option === "desecrate") {
      run.gold += 275;
      run.deck.push(makeCard(run, "Regret"));
    }
  }
  run.event = undefined;
  run.screen = "map";
}

export function usePotion(run: RunState, slot: number, targetId?: string): void {
  const p = run.potions[slot];
  if (!p || !run.combat) return;
  const target = targetId ? run.combat.monsters.find((m) => m.id === targetId) : run.combat.monsters.find((m) => m.alive);
  const id = p.id;
  if ((id === "Fire Potion" || id === "Explosive Potion") && target) {
    if (id === "Explosive Potion") for (const m of run.combat.monsters.filter((x) => x.alive)) dealDamage(run, run.player, m, 10);
    else dealDamage(run, run.player, target, 20);
  } else if (id === "Block Potion") gainBlock(run, run.player, 12);
  else if (id === "Strength Potion" || id === "SteroidPotion") addPower(run.player, "Strength", id === "SteroidPotion" ? 5 : 2);
  else if (id === "Dexterity Potion" || id === "SpeedPotion") addPower(run.player, "Dexterity", 2);
  else if (id === "Energy Potion") run.combat.energy += 2;
  else if (id === "BloodPotion" || id === "Blood Potion") run.player.hp = Math.min(run.player.maxHp, run.player.hp + Math.floor(run.player.maxHp * 0.2));
  else if (id === "Fruit Juice") {
    run.player.maxHp += 5;
    run.player.hp += 5;
  } else if (id === "Swift Potion") drawCards(run, 3);
  else if ((id === "Weak Potion") && target) addPower(target, "Weakened", 3, false);
  else if ((id === "FearPotion" || id === "Fear Potion") && target) addPower(target, "Vulnerable", 3, false);
  else if ((id === "Poison Potion") && target) addPower(target, "Poison", 6);
  else if (id === "Ancient Potion") addPower(run.player, "Artifact", 1);
  else if (id === "EssenceOfSteel") addPower(run.player, "Metallicize", 4);
  else if (id === "LiquidBronze") addPower(run.player, "Thorns", 3);
  else if (id === "FocusPotion") addPower(run.player, "Focus", 2);
  else if (id === "PotionOfCapacity") run.combat.orbSlots += 2;
  else if (id === "EssenceOfDarkness") {
    for (let i = 0; i < run.combat.orbSlots; i++) channelOrb(run, "dark");
  } else if (id === "Ambrosia") changeStance(run, "divinity");
  else if (id === "StancePotion") changeStance(run, run.combat.stance === "calm" ? "wrath" : "calm");
  else if (id === "BottledMiracle") {
    const m = makeCard(run, "Miracle");
    if (run.combat.hand.length < 10) run.combat.hand.push(m);
  } else if (id === "BlessingOfTheForge") {
    for (const h of run.combat.hand) upgradeCard(h);
  } else if (id === "AttackPotion" || id === "SkillPotion" || id === "PowerPotion" || id === "ColorlessPotion") {
    run.combat.energy += 1;
    drawCards(run, 1);
  } else if (id === "GamblersBrew") {
    const n = run.combat.hand.length;
    run.combat.discard.push(...run.combat.hand.splice(0));
    drawCards(run, n);
  } else if (id === "LiquidMemories") {
    const c = run.combat.discard.pop();
    if (c && run.combat.hand.length < 10) {
      c.freeOnce = true;
      run.combat.hand.push(c);
    }
  } else if (id === "SneckoOil") {
    drawCards(run, 5);
  } else if (id === "SmokeBomb") {
    run.combat.victory = true;
  } else if (id === "FairyPotion") {
    /* consumed on death instead */
    return;
  } else if (id === "GhostInAJar") addPower(run.player, "Intangible", 1);
  else if (id === "HeartOfIron") addPower(run.player, "Metallicize", 6);
  else if (id === "CultistPotion") addPower(run.player, "Ritual", 1);
  else if (id === "CunningPotion") {
    for (let i = 0; i < 3; i++) {
      const shiv = makeCard(run, "Shiv", true);
      if (run.combat.hand.length < 10) run.combat.hand.push(shiv);
    }
  } else if (id === "DuplicationPotion") addPower(run.player, "Double Tap", 1);
  else if (id === "DistilledChaos") {
    const c = run.combat.draw.pop();
    if (c) {
      run.combat.hand.push(c);
      const idx = run.combat.hand.length - 1;
      const tgt = target?.id;
      const { playCard } = { playCard: (r: RunState, i: number, t?: string) => {
        void r; void i; void t;
      } };
      void playCard;
      void idx;
      void tgt;
      run.combat.energy += currentCostSafe(c);
    }
  } else if (id === "ElixirPotion") {
    const curses = run.combat.hand.filter((c) => {
      const d = cardDef(c.defId);
      return d.type === "curse" || d.type === "status";
    });
    run.combat.hand = run.combat.hand.filter((c) => !curses.includes(c));
    run.combat.exhaust.push(...curses);
  } else if (id === "EntropicBrew") {
    for (let i = 0; i < run.potionSlots; i++) if (!run.potions[i]) run.potions[i] = { id: pickPotion(run) };
  } else if (id === "Regen Potion") addPower(run.player, "Regeneration", 5);
  else gainBlock(run, run.player, 8);
  run.potions[slot] = null;
}

function currentCostSafe(c: CardInst): number {
  try {
    const def = cardDef(c.defId);
    return Math.max(0, def.cost);
  } catch {
    return 0;
  }
}
