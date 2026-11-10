export { StsRandom, makeSeed } from "./rng.js";
export type { RngState } from "./rng.js";
export * from "./types.js";
export { CARD_BY_ID, CARDS, IRONCLAD_STARTER, POWER_NAMES, RELIC_BY_ID, POTION_BY_ID, cardDef, monsterDef } from "./catalog.js";
export { CHARACTERS } from "./characters.js";
export {
  applyBlockPowers,
  applyDamagePowers,
  baseNumbers,
  canPlay,
  currentCost,
  drawCards,
  endTurn,
  formatCardText,
  hasPower,
  makeCard,
  needsTarget,
  playCard,
  resolvePending,
  selectCombatTarget,
  startCombat,
  upgradeCard,
} from "./combat.js";
export { generateMap, reachableFrom, startingNodes } from "./map.js";
export {
  buyShop,
  chooseEvent,
  chooseNeow,
  enterBoss,
  enterNode,
  finishCombat,
  leaveRewards,
  leaveShop,
  newRun,
  restHeal,
  restRecall,
  restSmith,
  shopPurge,
  skipRewardCards,
  takeRewardCard,
  takeRewardGold,
  takeRewardPotion,
  takeRewardRelic,
  takeSapphireKey,
  usePotion,
} from "./run.js";


export function atBossGate(run: { current: { x: number; y: number } | null; map?: { room?: string }[][]; act?: number }): boolean {
  if (!run.current) return false;
  if (run.current.y === 15) return true;
  const node = run.map?.[run.current.y]?.[run.current.x];
  if ((run.act ?? 1) === 4) return node?.room === "elite";
  return node?.room === "boss" || run.current.y === 14;
}
export const SAVE_KEY = "sts1-web-run";

export function saveRun(run: unknown): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SAVE_KEY, JSON.stringify(run));
}

export function loadRun<T>(): T | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(SAVE_KEY);
}
