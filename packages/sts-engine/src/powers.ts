/**
 * Power classes named to match the jar (com.megacrit.cardcrawl.powers.*).
 * The combat loop calls these hooks at the beats documented in review/logic.html §8.
 * Timing-only pieces (flash, sound, queued GainBlockAction) run inline.
 */
import { hasRelic } from "./relicEffects.js";
import type { Creature, PowerInst, RunState, Stance } from "./types.js";

function inst(who: Creature, id: string): PowerInst | undefined {
  return who.powers.find((p) => p.id === id);
}

function drop(who: Creature, id: string): void {
  who.powers = who.powers.filter((p) => p.id !== id);
}

/** Shared atEndOfRound / atEndOfTurn stack loss, including the justApplied skip. */
function loseStack(who: Creature, id: string): void {
  const p = inst(who, id);
  if (!p) return;
  if (p.justApplied) {
    p.justApplied = false;
    return;
  }
  p.amount -= 1;
  if (p.amount <= 0) drop(who, id);
}

export class PoisonPower {
  static readonly POWER_ID = "Poison";
  constructor(private owner: Creature) {}

  /** Caps at 9999, matching PoisonPower.stackPower / constructor. */
  stackPower(stackAmount: number): void {
    const p = inst(this.owner, PoisonPower.POWER_ID);
    if (!p) return;
    p.amount += stackAmount;
    if (p.amount > 9999) p.amount = 9999;
    if (p.amount <= 0) drop(this.owner, PoisonPower.POWER_ID);
  }

  /** Owner's turn start: HP_LOSS for the current stacks, then stacks - 1. */
  atStartOfTurn(run: RunState, loseHp: (who: Creature, amount: number) => void): void {
    const poison = inst(this.owner, PoisonPower.POWER_ID);
    if (!poison || poison.amount <= 0 || !this.owner.alive) return;
    const amt = poison.amount;
    run.log.push(`${this.owner.name.zhs} 中毒，失去 ${amt} 点生命`);
    if (run.log.length > 80) run.log.splice(0, run.log.length - 80);
    loseHp(this.owner, amt);
    const still = inst(this.owner, PoisonPower.POWER_ID);
    if (!still) return;
    still.amount -= 1;
    if (still.amount <= 0) drop(this.owner, PoisonPower.POWER_ID);
  }
}

export class ArtifactPower {
  static readonly POWER_ID = "Artifact";
  constructor(private owner: Creature) {}

  /** ApplyPowerAction calls this after negating one debuff. */
  onSpecificTrigger(): void {
    const p = inst(this.owner, ArtifactPower.POWER_ID);
    if (!p || p.amount <= 0) {
      drop(this.owner, ArtifactPower.POWER_ID);
      return;
    }
    p.amount -= 1;
    if (p.amount <= 0) drop(this.owner, ArtifactPower.POWER_ID);
  }
}

export class WeakPower {
  static readonly POWER_ID = "Weakened";
  constructor(private owner: Creature) {}

  atEndOfRound(): void {
    loseStack(this.owner, WeakPower.POWER_ID);
  }

  /** NORMAL damage only. Paper Crane is 0.6 when the weakened creature is a monster. */
  atDamageGive(damage: number, normal: boolean, crane: boolean): number {
    if (!normal || !inst(this.owner, WeakPower.POWER_ID)) return damage;
    return Math.fround(damage * (crane ? 0.6 : 0.75));
  }
}

export class VulnerablePower {
  static readonly POWER_ID = "Vulnerable";
  constructor(private owner: Creature) {}

  atEndOfRound(): void {
    loseStack(this.owner, VulnerablePower.POWER_ID);
  }

  atDamageReceive(damage: number, normal: boolean, run?: RunState): number {
    if (!normal || !inst(this.owner, VulnerablePower.POWER_ID)) return damage;
    let mul = 1.5;
    if (run && !this.owner.isPlayer && hasRelic(run, "Paper Frog")) mul = 1.75;
    if (run && this.owner.isPlayer && hasRelic(run, "Odd Mushroom")) mul = 1.25;
    return Math.fround(damage * mul);
  }
}

export class FrailPower {
  static readonly POWER_ID = "Frail";
  constructor(private owner: Creature) {}

  atEndOfRound(): void {
    loseStack(this.owner, FrailPower.POWER_ID);
  }

  modifyBlock(blockAmount: number): number {
    if (!inst(this.owner, FrailPower.POWER_ID)) return blockAmount;
    return Math.fround(blockAmount * 0.75);
  }
}

export class RitualPower {
  static readonly POWER_ID = "Ritual";
  constructor(private owner: Creature) {}

  /** Player ritual: atEndOfTurn grants Strength immediately (the action queue is flushed inline). */
  atEndOfTurn(isPlayer: boolean, grant: (amount: number) => void): void {
    if (!isPlayer || this.owner.isPlayer !== isPlayer) return;
    const p = inst(this.owner, RitualPower.POWER_ID);
    if (p) grant(p.amount);
  }

  /** Monster ritual: atEndOfRound, skipping the round it was applied. */
  atEndOfRound(grant: (amount: number) => void): void {
    if (this.owner.isPlayer) return;
    const p = inst(this.owner, RitualPower.POWER_ID);
    if (!p) return;
    if (p.extra?.skipFirst) {
      p.extra.skipFirst = 0;
      return;
    }
    grant(p.amount);
  }
}

export class BlurPower {
  static readonly POWER_ID = "Blur";
  constructor(private owner: Creature) {}

  atEndOfRound(): void {
    loseStack(this.owner, BlurPower.POWER_ID);
  }
}

export class MetallicizePower {
  static readonly POWER_ID = "Metallicize";
  constructor(private owner: Creature) {}

  atEndOfTurnPreEndTurnCards(_isPlayer: boolean, gain: (amount: number) => void): void {
    const p = inst(this.owner, MetallicizePower.POWER_ID);
    if (p) gain(p.amount);
  }
}

export class LikeWaterPower {
  static readonly POWER_ID = "Like Water";
  constructor(private owner: Creature) {}

  stackPower(stackAmount: number): void {
    const p = inst(this.owner, LikeWaterPower.POWER_ID);
    if (!p) return;
    p.amount += stackAmount;
    if (p.amount > 999) p.amount = 999;
    if (p.amount <= 0) drop(this.owner, LikeWaterPower.POWER_ID);
  }

  atEndOfTurnPreEndTurnCards(isPlayer: boolean, stance: Stance, gain: (amount: number) => void): void {
    if (!isPlayer) return;
    const p = inst(this.owner, LikeWaterPower.POWER_ID);
    if (p && stance === "calm") gain(p.amount);
  }
}

export function tryStack(who: Creature, id: string, amount: number): boolean {
  if (id === PoisonPower.POWER_ID) {
    new PoisonPower(who).stackPower(amount);
    return true;
  }
  if (id === LikeWaterPower.POWER_ID) {
    new LikeWaterPower(who).stackPower(amount);
    return true;
  }
  return false;
}

export function ownerTurnStart(run: RunState, who: Creature, loseHp: (who: Creature, amount: number) => void): void {
  if (inst(who, PoisonPower.POWER_ID)) new PoisonPower(who).atStartOfTurn(run, loseHp);
}

export function endOfRound(who: Creature): void {
  if (inst(who, WeakPower.POWER_ID)) new WeakPower(who).atEndOfRound();
  if (inst(who, VulnerablePower.POWER_ID)) new VulnerablePower(who).atEndOfRound();
  if (inst(who, FrailPower.POWER_ID)) new FrailPower(who).atEndOfRound();
  if (!who.isPlayer && inst(who, RitualPower.POWER_ID)) {
    new RitualPower(who).atEndOfRound((amount) => {
      const existing = inst(who, "Strength");
      if (existing) existing.amount += amount;
      else who.powers.push({ id: "Strength", amount });
    });
  }
}
