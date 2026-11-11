import { addPower, dealDamage, drawCards, gainBlock, makeCard } from "../combat.js";
import type { Creature, RunState } from "../types.js";
function amt(owner: Creature, id: string): number { return owner.powers.find((p) => p.id === id)?.amount ?? 0; }
function addStack(owner: Creature, id: string, n: number): void { const p = owner.powers.find((x) => x.id === id); if (p) p.amount += n; }
function aliveOf(run: RunState): Creature[] { return (run.combat?.monsters ?? []).filter((m) => m.alive); }
function giveShivs(run: RunState, n: number): void { const hand = run.combat?.hand; if (!hand) return; for (let i = 0; i < n && hand.length < 10; i++) hand.push(makeCard(run, "Shiv")); }

export class BiasPower {
  constructor() {}
  atStartOfTurn(run: RunState, owner: Creature): void {
  
          addPower(owner, "Focus", -amt(owner, "Bias"));
    }
}
export class BrutalityPower {
  constructor() {}
  atStartOfTurnPostDraw(run: RunState, owner: Creature): void {
  
          drawCards(run, amt(owner, "Brutality"));
          dealDamage(run, owner, owner, amt(owner, "Brutality"), { hpLoss: true });
    }
}
export class DemonFormPower {
  constructor() {}
  atStartOfTurnPostDraw(run: RunState, owner: Creature): void {
  
          addPower(owner, "Strength", amt(owner, "Demon Form"));
    }
}
export class GenericStrengthUpPower {
  constructor() {}
  atEndOfRound(run: RunState, owner: Creature): void {
  
          addPower(owner, "Strength", amt(owner, "Generic Strength Up Power"));
    }
}
export class InfiniteBladesPower {
  constructor() {}
  atStartOfTurn(run: RunState, owner: Creature): void {
          if (aliveOf(run).length) {
  
              giveShivs(run, amt(owner, "Infinite Blades"));
          }
    }
}
export class NoxiousFumesPower {
  constructor() {}
  atStartOfTurnPostDraw(run: RunState, owner: Creature): void {
          if (aliveOf(run).length) {
  
              for (const m of aliveOf(run)) { addPower(m, "Poison", amt(owner, "Noxious Fumes"));
               }
          }
    }
}
export class PlatedArmorPower {
  constructor() {}
  atEndOfTurnPreEndTurnCards(run: RunState, owner: Creature, isPlayer: number): void {
  
          gainBlock(run, owner, amt(owner, "Plated Armor"));
    }
}
export class StrengthPower {
  constructor() {}
  atDamageGive(run: RunState, owner: Creature, damage: number, type: number): number {
          if (type == 0) {
              return damage + amt(owner, "Strength");
          }
          return damage;
    }
}
export const POWER_CLASSES = {
  "Bias": BiasPower,
  "Brutality": BrutalityPower,
  "Demon Form": DemonFormPower,
  "Generic Strength Up Power": GenericStrengthUpPower,
  "Infinite Blades": InfiniteBladesPower,
  "Noxious Fumes": NoxiousFumesPower,
  "Plated Armor": PlatedArmorPower,
  "Strength": StrengthPower,
} as unknown as Record<string, new () => Record<string, (...args: never[]) => unknown>>;
const HAND = new Set(["Poison","Artifact","Weakened","Vulnerable","Frail","Ritual","Blur","Metallicize","Like Water"]);
export function callPower(run: RunState, owner: Creature, id: string, hook: string, ...args: unknown[]): unknown {
  if (HAND.has(id)) return undefined;
  const Ctor = POWER_CLASSES[id] as (new () => Record<string, Function>) | undefined;
  const fn = Ctor && new Ctor()[hook];
  if (typeof fn !== "function") return undefined;
  return fn(run, owner, ...args);
}
export function runPowerHooks(run: RunState, owner: Creature, hook: string, value?: number): number | undefined {
  let current = value;
  for (const p of [...owner.powers]) {
    if (HAND.has(p.id)) continue;
    const Ctor = POWER_CLASSES[p.id] as (new () => Record<string, Function>) | undefined;
    const fn = Ctor && new Ctor()[hook];
    if (typeof fn !== "function") continue;
    const out = fn(run, owner, current);
    if (typeof out === "number") current = out;
  }
  return current;
}