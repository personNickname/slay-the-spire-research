import type { RngState } from "./rng.js";

export type CardType = "attack" | "skill" | "power" | "status" | "curse";
export type CardColor = "red" | "green" | "blue" | "purple" | "colorless" | "curse";
export type CardRarity = "basic" | "common" | "uncommon" | "rare" | "special" | "curse";
export type CardTarget = "enemy" | "all_enemy" | "self" | "none" | "self_and_enemy" | "all";
export type RoomKind = "monster" | "elite" | "rest" | "shop" | "treasure" | "event" | "boss";
export type Intent =
  | "attack"
  | "attack_buff"
  | "attack_debuff"
  | "attack_defend"
  | "buff"
  | "debuff"
  | "strong_debuff"
  | "defend"
  | "defend_buff"
  | "defend_debuff"
  | "escape"
  | "sleep"
  | "stun"
  | "unknown"
  | "magic";

export interface CardDef {
  id: string;
  class: string;
  name: { eng: string; zhs: string };
  description: { eng: string; zhs: string };
  upgradedDescription?: { eng: string; zhs: string };
  type: CardType;
  color: CardColor;
  rarity: CardRarity;
  cost: number;
  target: CardTarget;
  base: { damage?: number; block?: number; magic?: number };
  upgrade: {
    damage?: number;
    block?: number;
    magic?: number;
    cost?: number;
    exhaust?: boolean;
    innate?: boolean;
    ethereal?: boolean;
    retain?: boolean;
    custom?: boolean;
  };
  exhaust: boolean;
  ethereal: boolean;
  innate: boolean;
  retain: boolean;
  multiDamage: boolean;
  tags: string[];
}

export interface MonsterHpBand {
  asc: number;
  min: number;
  max: number;
}

export interface MonsterDef {
  id: string;
  class: string;
  act: number;
  name: { eng: string; zhs: string };
  kind: "normal" | "elite" | "boss" | "event";
  hp: MonsterHpBand[];
}

export interface PowerInst {
  id: string;
  amount: number;
  justApplied?: boolean;
  extra?: Record<string, number>;
}

export interface CardInst {
  uid: string;
  defId: string;
  upgraded: boolean;
  timesUpgraded: number;
  /** Permanent-this-combat damage add (Rampage / Searing Blow). */
  combatDamage: number;
  /** Blood for Blood current cost (before energy relics). */
  costOverride?: number;
  freeOnce?: boolean;
  /** Blue Candle / Medical Kit: exhaust after this play. */
  exhaustOnce?: boolean;
  bottled?: "flame" | "lightning" | "tornado";
}

export interface Creature {
  id: string;
  name: { eng: string; zhs: string };
  isPlayer: boolean;
  hp: number;
  maxHp: number;
  block: number;
  powers: PowerInst[];
  monsterId?: string;
  intent?: Intent;
  intentDamage?: number;
  intentHits?: number;
  nextMove?: number;
  lastMoves: number[];
  alive: boolean;
  escaped?: boolean;
  misc: Record<string, number | boolean | string>;
}

export interface CombatState {
  draw: CardInst[];
  hand: CardInst[];
  discard: CardInst[];
  exhaust: CardInst[];
  monsters: Creature[];
  energy: number;
  energyMax: number;
  turn: number;
  playerTurn: boolean;
  cardsPlayedThisTurn: number;
  attacksPlayedThisTurn: number;
  skillsPlayedThisTurn: number;
  pending?: PendingChoice;
  /** Double Tap remaining extra attack plays. */
  extraAttackPlays: number;
  victory?: boolean;
  defeat?: boolean;
  limbo?: CardInst;
  miscDraw?: number;
  miscCopies?: number;
  selectedTargetId?: string;
  orbs: OrbInst[];
  orbSlots: number;
  stance: Stance;
  mantra: number;
}

export type PendingKind =
  | "upgradeHand"
  | "upgradeAllHand"
  | "exhaustChoose"
  | "discardChoose"
  | "copyHand"
  | "putOnDrawFromHand"
  | "putOnDrawFromDiscard"
  | "exhume"
  | "armaments"
  | "warcry"
  | "headbutt"
  | "trueGrit"
  | "dualWield";

export interface PendingChoice {
  kind: PendingKind;
  filter?: "attack" | "attackOrPower" | "nonAttack" | "any" | "upgradable";
  count: number;
  anyNumber?: boolean;
  prompt: { eng: string; zhs: string };
}

export interface MapNode {
  x: number;
  y: number;
  edges: { x: number; y: number }[];
  parents: { x: number; y: number }[];
  room?: RoomKind;
}

export interface RelicInst {
  id: string;
  counter: number;
  usedThisCombat?: boolean;
  grayscale?: boolean;
  flags?: Record<string, number>;
}

export type Screen =
  | "title"
  | "neow"
  | "map"
  | "combat"
  | "rewards"
  | "rest"
  | "shop"
  | "treasure"
  | "event"
  | "gameover";

export type CharacterId = "ironclad" | "silent" | "defect" | "watcher";
export type Stance = "none" | "calm" | "wrath" | "divinity";
export type OrbType = "lightning" | "frost" | "dark" | "plasma";
export interface OrbInst {
  type: OrbType;
  /** Dark orb stored damage. */
  focus: number;
}

export interface RewardCard {
  card: CardInst;
}

export interface RewardState {
  gold: number;
  cards: RewardCard[];
  potion?: { id: string } | null;
  relic?: RelicInst | null;
  stolenGold?: number;
}

export interface ShopOffer {
  kind: "card" | "relic" | "potion";
  id: string;
  card?: CardInst;
  price: number;
  sold: boolean;
}

export interface ShopState {
  offers: ShopOffer[];
  purgePrice: number;
  purgeUsed: boolean;
}

export interface EventState {
  id: string;
  title: { eng: string; zhs: string };
  body: { eng: string; zhs: string };
  options: { id: string; label: { eng: string; zhs: string }; disabled?: boolean }[];
}

export interface RunState {
  seed: number;
  character: CharacterId;
  lang: "zhs" | "eng";
  ascension: number;
  act: number;
  floor: number;
  gold: number;
  player: Creature;
  deck: CardInst[];
  relics: RelicInst[];
  potions: ({ id: string } | null)[];
  potionSlots: number;
  rng: Record<string, RngState>;
  map: MapNode[][];
  current: { x: number; y: number } | null;
  visited: { x: number; y: number }[];
  screen: Screen;
  combat?: CombatState;
  rewards?: RewardState;
  shop?: ShopState;
  event?: EventState;
  boss: string;
  encounter?: string;
  roomKind?: RoomKind;
  log: string[];
  over?: "victory" | "death";
  purgeCount: number;
  cardBlizzRandomizer: number;
  potionChance: number;
  uidSeq: number;
  restHealUsed?: boolean;
  neowLament: number;
  /** AbstractPlayer.energy.energyMaster (default 3). */
  energyMaster: number;
  /** AbstractPlayer.masterHandSize (default 5). */
  handSizeMaster: number;
  /** AbstractPlayer.masterMaxOrbs (Defect 3, else 0). */
  masterMaxOrbs: number;
  actBosses: string[];
  /** 尾声(The Ending)三钥匙：红=篝火回忆、蓝=宝箱换取、绿=精英战利品（需已持有其他钥匙） */
  keys?: { ruby: boolean; sapphire: boolean; emerald: boolean };
}
