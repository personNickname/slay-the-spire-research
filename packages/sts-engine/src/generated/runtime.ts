import type { CardInst, Creature, RunState } from "../types.js";
export let cardUse: (run: RunState, card: CardInst, target?: Creature) => void = () => {};
export let cardUpgrade: (card: CardInst) => void = () => {};
export function bindCardRuntime(use: typeof cardUse, upgrade: typeof cardUpgrade): void {
  cardUse = use;
  cardUpgrade = upgrade;
}
export const monsterApi = {
  fx: null as any,
  dmgOf: null as unknown as Function,
  asc: null as unknown as Function,
  setMove: null as unknown as Function,
  addSlimed: null as unknown as Function,
  addDazed: null as unknown as Function,
  ai: null as unknown as Function,
  saveAi: null as unknown as Function,
  lastMove: null as unknown as Function,
  lastTwo: null as unknown as Function,
  commitMove: null as unknown as Function,
  createMonster: null as unknown as Function,
  misc: null as unknown as Function,
  saveMisc: null as unknown as Function,
  bool: null as unknown as Function,
};
