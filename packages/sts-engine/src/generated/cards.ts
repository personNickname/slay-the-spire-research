import type { CardInst, Creature, RunState } from "../types.js";
import { cardUpgrade, cardUse } from "./runtime.js";
import { gameActions, DamageAction, ApplyPowerAction, GainBlockAction, DrawCardAction, GainEnergyAction, LoseHPAction, HealAction } from "../actions.js";
import { baseNumbers } from "../combat.js";
import { ChannelAction, DamageAllEnemiesAction, MakeTempCardInDiscardAction, ChangeStanceAction, MakeTempCardInHandAction, HeelHookAction, InnerPeaceAction, DropkickAction, MakeTempCardInDrawPileAction, WhirlwindAction } from "./actions.js";

export class Aggregate {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class AllForOne {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Amplify {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Amplify", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class AutoShields {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BallLightning {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Barrage {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BeamCell {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ApplyPowerAction(target!, run.player, "Vulnerable", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BiasedCognition {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Focus", n.magic));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Bias", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Blizzard {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BootSequence {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Buffer {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Buffer", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Capacitor {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Chaos {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Chill {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Claw {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ColdSnap {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class CompileDriver {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ConserveBattery {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "EnergizedBlue", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Consume {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Coolheaded {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ChannelAction(run, "frost"));
      gameActions.addToBottom(new DrawCardAction(run, n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class CoreSurge {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Artifact", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class CreativeAI {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Creative AI", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Darkness {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Defend_Blue {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Defragment {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Focus", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DoomAndGloom {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAllEnemiesAction(run, run.player, n.damage, card));
      gameActions.addToBottom(new ChannelAction(run, "dark"));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DoubleEnergy {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Dualcast {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class EchoForm {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Echo Form", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Electrodynamics {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Equilibrium {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Equilibrium", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Fission {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ForceField {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class FTL {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Fusion {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class GeneticAlgorithm {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Glacier {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class GoForTheEyes {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Heatsinks {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Heatsink", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class HelloWorld {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Hello", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Hologram {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Hyperbeam {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Impulse {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Leap {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class LockOn {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ApplyPowerAction(target!, run.player, "Lockon", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Loop {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Loop", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class MachineLearning {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Draw", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Melter {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class MeteorStrike {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class MultiCast {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Overclock {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DrawCardAction(run, n.magic));
      gameActions.addToBottom(new MakeTempCardInDiscardAction(run, "Burn", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Rainbow {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ChannelAction(run, "lightning"));
      gameActions.addToBottom(new ChannelAction(run, "frost"));
      gameActions.addToBottom(new ChannelAction(run, "dark"));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Reboot {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Rebound {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Rebound", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Recursion {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Recycle {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ReinforcedBody {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Reprogram {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class RipAndTear {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Scrape {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Seek {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SelfRepair {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Repair", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Skim {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DrawCardAction(run, n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Stack {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class StaticDischarge {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "StaticDischarge", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SteamBarrier {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Storm {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Storm", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Streamline {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Strike_Blue {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Sunder {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SweepingBeam {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAllEnemiesAction(run, run.player, n.damage, card));
      gameActions.addToBottom(new DrawCardAction(run, n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Tempest {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ThunderStrike {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Turbo {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainEnergyAction(run, n.magic));
      gameActions.addToBottom(new MakeTempCardInDiscardAction(run, "Void", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class WhiteNoise {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Zap {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Apotheosis {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Apparition {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "IntangiblePlayer", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BandageUp {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new HealAction(run, run.player, n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Bite {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Blind {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Chrysalis {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DarkShackles {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DeepBreath {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Discovery {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DramaticEntrance {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAllEnemiesAction(run, run.player, n.damage, card));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Enlightenment {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Finesse {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
      gameActions.addToBottom(new DrawCardAction(run, 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class FlashOfSteel {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new DrawCardAction(run, 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Forethought {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class GoodInstincts {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class HandOfGreed {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Impatience {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class JackOfAllTrades {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class JAX {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new LoseHPAction(run, run.player, run.player, 3));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Strength", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Madness {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Magnetism {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Magnetism", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class MasterOfStrategy {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DrawCardAction(run, n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Mayhem {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Mayhem", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Metamorphosis {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class MindBlast {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Panacea {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Artifact", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Panache {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Panache", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class PanicButton {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "NoBlockPower", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Purity {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class RitualDagger {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SadisticNature {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Sadistic", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SecretTechnique {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SecretWeapon {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SwiftStrike {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class TheBomb {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "TheBomb", 3));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ThinkingAhead {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Transmutation {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Trip {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Violence {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class AscendersBane {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Clumsy {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class CurseOfTheBell {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Decay {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Doubt {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Injury {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Necronomicurse {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Normality {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Pain {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Parasite {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Pride {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Regret {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Shame {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Writhe {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Accuracy {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Accuracy", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Acrobatics {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Adrenaline {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class AfterImage {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "After Image", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Alchemize {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class AllOutAttack {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class AThousandCuts {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Thousand Cuts", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Backflip {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
      gameActions.addToBottom(new DrawCardAction(run, 2));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Backstab {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Bane {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BladeDance {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new MakeTempCardInHandAction(run, "Shiv", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Blur {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Blur", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BouncingFlask {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BulletTime {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Burst {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Burst", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class CalculatedGamble {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Caltrops {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Thorns", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Catalyst {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Choke {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ApplyPowerAction(target!, run.player, "Choked", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class CloakAndDagger {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
      gameActions.addToBottom(new MakeTempCardInHandAction(run, "Shiv", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Concentrate {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class CorpseExplosion {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class CripplingPoison {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DaggerSpray {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAllEnemiesAction(run, run.player, n.damage, card));
      gameActions.addToBottom(new DamageAllEnemiesAction(run, run.player, n.damage, card));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DaggerThrow {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Dash {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DeadlyPoison {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Defend_Green {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Deflect {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DieDieDie {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAllEnemiesAction(run, run.player, n.damage, card));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Distraction {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DodgeAndRoll {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Next Turn Block", n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Doppelganger {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class EndlessAgony {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Envenom {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Envenom", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class EscapePlan {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DrawCardAction(run, 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Eviscerate {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Expertise {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Finisher {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Flechettes {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class FlyingKnee {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Energized", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Footwork {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Dexterity", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class GlassKnife {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class GrandFinale {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class HeelHook {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new HeelHookAction(run, card, target ?? null, n.damage));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class InfiniteBlades {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Infinite Blades", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class LegSweep {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(target!, run.player, "Weakened", n.magic));
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Malaise {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class MasterfulStab {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Neutralize {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ApplyPowerAction(target!, run.player, "Weakened", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Nightmare {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class NoxiousFumes {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Noxious Fumes", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Outmaneuver {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class PhantasmalKiller {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Phantasmal", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class PiercingWail {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class PoisonedStab {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ApplyPowerAction(target!, run.player, "Poison", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Predator {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Draw Card", 2));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Prepared {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class QuickSlash {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new DrawCardAction(run, 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Reflex {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DrawCardAction(run, n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class RiddleWithHoles {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Setup {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Skewer {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Slice {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SneakyStrike {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class StormOfSteel {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Strike_Green {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SuckerPunch {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ApplyPowerAction(target!, run.player, "Weakened", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Survivor {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Tactician {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Terror {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(target!, run.player, "Vulnerable", 99));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ToolsOfTheTrade {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Tools Of The Trade", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Unload {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class WellLaidPlans {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Retain Cards", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class WraithForm {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "IntangiblePlayer", n.magic));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Wraith Form v2", -1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BecomeAlmighty {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ChooseCalm {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ChooseWrath {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class FameAndFortune {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class LiveForever {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Alpha {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BattleHymn {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "BattleHymn", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Blasphemy {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BowlingBash {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Brilliance {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class CarveReality {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Collect {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Conclude {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ConjureBlade {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Consecrate {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAllEnemiesAction(run, run.player, n.damage, card));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Crescendo {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ChangeStanceAction(run, "wrath"));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class CrushJoints {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class CutThroughFate {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DeceiveReality {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Defend_Watcher {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DeusExMachina {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DevaForm {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "DevaForm", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Devotion {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Discipline {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class EmptyBody {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class EmptyFist {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class EmptyMind {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Eruption {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ChangeStanceAction(run, "wrath"));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Establishment {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "EstablishmentPower", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Evaluate {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Fasting {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class FearNoEvil {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class FlurryOfBlows {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class FlyingSleeves {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class FollowUp {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ForeignInfluence {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Foresight {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Halt {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Indignation {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class InnerPeace {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new InnerPeaceAction(run, card, target ?? null, n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Judgement {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class JustLucky {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class LessonLearned {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class LikeWater {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "LikeWaterPower", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class MasterReality {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Meditate {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class MentalFortress {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Controlled", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Nirvana {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Nirvana", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Omniscience {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Perseverance {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Pray {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class PressurePoints {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Prostrate {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Mantra", n.magic));
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Protect {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Ragnarok {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ReachHeaven {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Rushdown {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Adaptation", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Sanctity {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SandsOfTime {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SashWhip {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Scrawl {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SignatureMove {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SimmeringFury {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SpiritShield {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Strike_Purple {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Study {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Study", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Swivel {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "FreeAttackPower", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class TalkToTheHand {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ApplyPowerAction(target!, run.player, "BlockReturnPower", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Tantrum {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ThirdEye {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Tranquility {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ChangeStanceAction(run, "calm"));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Unraveling {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Vault {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Vigilance {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
      gameActions.addToBottom(new ChangeStanceAction(run, "calm"));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Wallop {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class WaveOfTheHand {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "WaveOfTheHandPower", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Weave {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class WheelKick {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new DrawCardAction(run, n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class WindmillStrike {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Wish {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Worship {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Mantra", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class WreathOfFlame {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Anger {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Armaments {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Barricade {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Bash {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ApplyPowerAction(target!, run.player, "Vulnerable", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BattleTrance {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Berserk {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Vulnerable", n.magic));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Berserk", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BloodForBlood {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Bloodletting {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new LoseHPAction(run, run.player, run.player, 3));
      gameActions.addToBottom(new GainEnergyAction(run, n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Bludgeon {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BodySlam {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Brutality {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Brutality", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class BurningPact {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Carnage {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Clash {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Cleave {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAllEnemiesAction(run, run.player, n.damage, card));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Clothesline {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ApplyPowerAction(target!, run.player, "Weakened", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Combust {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Combust", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Corruption {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DarkEmbrace {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Dark Embrace", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Defend_Red {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DemonForm {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Demon Form", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Disarm {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DoubleTap {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Double Tap", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Dropkick {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DropkickAction(run, card, target ?? null, n.damage));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class DualWield {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Entrench {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Evolve {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Evolve", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Exhume {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Feed {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class FeelNoPain {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Feel No Pain", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class FiendFire {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class FireBreathing {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Fire Breathing", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class FlameBarrier {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Flex {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Strength", n.magic));
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Flex", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class GhostlyArmor {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Havoc {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Headbutt {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class HeavyBlade {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Hemokinesis {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Immolate {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAllEnemiesAction(run, run.player, n.damage, card));
      gameActions.addToBottom(new MakeTempCardInDiscardAction(run, "Burn", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Impervious {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class InfernalBlade {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Inflame {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Strength", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Intimidate {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class IronWave {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Juggernaut {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Juggernaut", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class LimitBreak {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Metallicize {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Metallicize", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Offering {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class PerfectedStrike {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class PommelStrike {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new DrawCardAction(run, n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class PowerThrough {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new MakeTempCardInHandAction(run, "Wound", 2));
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Pummel {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Rage {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Rage", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Rampage {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Reaper {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class RecklessCharge {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new MakeTempCardInDrawPileAction(run, "Dazed", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Rupture {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "Rupture", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SearingBlow {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SecondWind {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SeeingRed {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainEnergyAction(run, 2));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Sentinel {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SeverSoul {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Shockwave {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ShrugItOff {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
      gameActions.addToBottom(new DrawCardAction(run, 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SpotWeakness {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Strike_Red {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class SwordBoomerang {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ThunderClap {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class TrueGrit {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class TwinStrike {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Uppercut {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new ApplyPowerAction(target!, run.player, "Weakened", n.magic));
      gameActions.addToBottom(new ApplyPowerAction(target!, run.player, "Vulnerable", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Warcry {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Whirlwind {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new WhirlwindAction(run, n.damage, card));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class WildStrike {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
      gameActions.addToBottom(new MakeTempCardInDrawPileAction(run, "Wound", 1));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Burn {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Dazed {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Slimed {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class VoidCard {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Wound {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Beta {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Expunger {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Insight {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Miracle {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Omega {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new ApplyPowerAction(run.player, run.player, "OmegaPower", n.magic));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Safety {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new GainBlockAction(run, run.player, n.block));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Shiv {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class Smite {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void {
      const n = baseNumbers(card);
      gameActions.addToBottom(new DamageAction(run, run.player, target!, n.damage, { card: card }));
    }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export class ThroughViolence {
  constructor() {}
  use(run: RunState, card: CardInst, target?: Creature): void { cardUse(run, card, target); }
  upgrade(card: CardInst): void { cardUpgrade(card); }
}
export const CARD_CLASSES = {
  "Aggregate": Aggregate,
  "All For One": AllForOne,
  "Amplify": Amplify,
  "Auto Shields": AutoShields,
  "Ball Lightning": BallLightning,
  "Barrage": Barrage,
  "Beam Cell": BeamCell,
  "Biased Cognition": BiasedCognition,
  "Blizzard": Blizzard,
  "BootSequence": BootSequence,
  "Buffer": Buffer,
  "Capacitor": Capacitor,
  "Chaos": Chaos,
  "Chill": Chill,
  "Gash": Claw,
  "Cold Snap": ColdSnap,
  "Compile Driver": CompileDriver,
  "Conserve Battery": ConserveBattery,
  "Consume": Consume,
  "Coolheaded": Coolheaded,
  "Core Surge": CoreSurge,
  "Creative AI": CreativeAI,
  "Darkness": Darkness,
  "Defend_B": Defend_Blue,
  "Defragment": Defragment,
  "Doom and Gloom": DoomAndGloom,
  "Double Energy": DoubleEnergy,
  "Dualcast": Dualcast,
  "Echo Form": EchoForm,
  "Electrodynamics": Electrodynamics,
  "Undo": Equilibrium,
  "Fission": Fission,
  "Force Field": ForceField,
  "FTL": FTL,
  "Fusion": Fusion,
  "Genetic Algorithm": GeneticAlgorithm,
  "Glacier": Glacier,
  "Go for the Eyes": GoForTheEyes,
  "Heatsinks": Heatsinks,
  "Hello World": HelloWorld,
  "Hologram": Hologram,
  "Hyperbeam": Hyperbeam,
  "Impulse": Impulse,
  "Leap": Leap,
  "Lockon": LockOn,
  "Loop": Loop,
  "Machine Learning": MachineLearning,
  "Melter": Melter,
  "Meteor Strike": MeteorStrike,
  "Multi-Cast": MultiCast,
  "Steam Power": Overclock,
  "Rainbow": Rainbow,
  "Reboot": Reboot,
  "Rebound": Rebound,
  "Redo": Recursion,
  "Recycle": Recycle,
  "Reinforced Body": ReinforcedBody,
  "Reprogram": Reprogram,
  "Rip and Tear": RipAndTear,
  "Scrape": Scrape,
  "Seek": Seek,
  "Self Repair": SelfRepair,
  "Skim": Skim,
  "Stack": Stack,
  "Static Discharge": StaticDischarge,
  "Steam": SteamBarrier,
  "Storm": Storm,
  "Streamline": Streamline,
  "Strike_B": Strike_Blue,
  "Sunder": Sunder,
  "Sweeping Beam": SweepingBeam,
  "Tempest": Tempest,
  "Thunder Strike": ThunderStrike,
  "Turbo": Turbo,
  "White Noise": WhiteNoise,
  "Zap": Zap,
  "Apotheosis": Apotheosis,
  "Ghostly": Apparition,
  "Bandage Up": BandageUp,
  "Bite": Bite,
  "Blind": Blind,
  "Chrysalis": Chrysalis,
  "Dark Shackles": DarkShackles,
  "Deep Breath": DeepBreath,
  "Discovery": Discovery,
  "Dramatic Entrance": DramaticEntrance,
  "Enlightenment": Enlightenment,
  "Finesse": Finesse,
  "Flash of Steel": FlashOfSteel,
  "Forethought": Forethought,
  "Good Instincts": GoodInstincts,
  "HandOfGreed": HandOfGreed,
  "Impatience": Impatience,
  "Jack Of All Trades": JackOfAllTrades,
  "J.A.X.": JAX,
  "Madness": Madness,
  "Magnetism": Magnetism,
  "Master of Strategy": MasterOfStrategy,
  "Mayhem": Mayhem,
  "Metamorphosis": Metamorphosis,
  "Mind Blast": MindBlast,
  "Panacea": Panacea,
  "Panache": Panache,
  "PanicButton": PanicButton,
  "Purity": Purity,
  "RitualDagger": RitualDagger,
  "Sadistic Nature": SadisticNature,
  "Secret Technique": SecretTechnique,
  "Secret Weapon": SecretWeapon,
  "Swift Strike": SwiftStrike,
  "The Bomb": TheBomb,
  "Thinking Ahead": ThinkingAhead,
  "Transmutation": Transmutation,
  "Trip": Trip,
  "Violence": Violence,
  "AscendersBane": AscendersBane,
  "Clumsy": Clumsy,
  "CurseOfTheBell": CurseOfTheBell,
  "Decay": Decay,
  "Doubt": Doubt,
  "Injury": Injury,
  "Necronomicurse": Necronomicurse,
  "Normality": Normality,
  "Pain": Pain,
  "Parasite": Parasite,
  "Pride": Pride,
  "Regret": Regret,
  "Shame": Shame,
  "Writhe": Writhe,
  "Accuracy": Accuracy,
  "Acrobatics": Acrobatics,
  "Adrenaline": Adrenaline,
  "After Image": AfterImage,
  "Venomology": Alchemize,
  "All Out Attack": AllOutAttack,
  "A Thousand Cuts": AThousandCuts,
  "Backflip": Backflip,
  "Backstab": Backstab,
  "Bane": Bane,
  "Blade Dance": BladeDance,
  "Blur": Blur,
  "Bouncing Flask": BouncingFlask,
  "Bullet Time": BulletTime,
  "Burst": Burst,
  "Calculated Gamble": CalculatedGamble,
  "Caltrops": Caltrops,
  "Catalyst": Catalyst,
  "Choke": Choke,
  "Cloak And Dagger": CloakAndDagger,
  "Concentrate": Concentrate,
  "Corpse Explosion": CorpseExplosion,
  "Crippling Poison": CripplingPoison,
  "Dagger Spray": DaggerSpray,
  "Dagger Throw": DaggerThrow,
  "Dash": Dash,
  "Deadly Poison": DeadlyPoison,
  "Defend_G": Defend_Green,
  "Deflect": Deflect,
  "Die Die Die": DieDieDie,
  "Distraction": Distraction,
  "Dodge and Roll": DodgeAndRoll,
  "Doppelganger": Doppelganger,
  "Endless Agony": EndlessAgony,
  "Envenom": Envenom,
  "Escape Plan": EscapePlan,
  "Eviscerate": Eviscerate,
  "Expertise": Expertise,
  "Finisher": Finisher,
  "Flechettes": Flechettes,
  "Flying Knee": FlyingKnee,
  "Footwork": Footwork,
  "Glass Knife": GlassKnife,
  "Grand Finale": GrandFinale,
  "Heel Hook": HeelHook,
  "Infinite Blades": InfiniteBlades,
  "Leg Sweep": LegSweep,
  "Malaise": Malaise,
  "Masterful Stab": MasterfulStab,
  "Neutralize": Neutralize,
  "Night Terror": Nightmare,
  "Noxious Fumes": NoxiousFumes,
  "Outmaneuver": Outmaneuver,
  "Phantasmal Killer": PhantasmalKiller,
  "PiercingWail": PiercingWail,
  "Poisoned Stab": PoisonedStab,
  "Predator": Predator,
  "Prepared": Prepared,
  "Quick Slash": QuickSlash,
  "Reflex": Reflex,
  "Riddle With Holes": RiddleWithHoles,
  "Setup": Setup,
  "Skewer": Skewer,
  "Slice": Slice,
  "Underhanded Strike": SneakyStrike,
  "Storm of Steel": StormOfSteel,
  "Strike_G": Strike_Green,
  "Sucker Punch": SuckerPunch,
  "Survivor": Survivor,
  "Tactician": Tactician,
  "Terror": Terror,
  "Tools of the Trade": ToolsOfTheTrade,
  "Unload": Unload,
  "Well Laid Plans": WellLaidPlans,
  "Wraith Form v2": WraithForm,
  "BecomeAlmighty": BecomeAlmighty,
  "Calm": ChooseCalm,
  "Wrath": ChooseWrath,
  "FameAndFortune": FameAndFortune,
  "LiveForever": LiveForever,
  "Alpha": Alpha,
  "BattleHymn": BattleHymn,
  "Blasphemy": Blasphemy,
  "BowlingBash": BowlingBash,
  "Brilliance": Brilliance,
  "CarveReality": CarveReality,
  "Collect": Collect,
  "Conclude": Conclude,
  "ConjureBlade": ConjureBlade,
  "Consecrate": Consecrate,
  "Crescendo": Crescendo,
  "CrushJoints": CrushJoints,
  "CutThroughFate": CutThroughFate,
  "DeceiveReality": DeceiveReality,
  "Defend_P": Defend_Watcher,
  "DeusExMachina": DeusExMachina,
  "DevaForm": DevaForm,
  "Devotion": Devotion,
  "Discipline": Discipline,
  "EmptyBody": EmptyBody,
  "EmptyFist": EmptyFist,
  "EmptyMind": EmptyMind,
  "Eruption": Eruption,
  "Establishment": Establishment,
  "Evaluate": Evaluate,
  "Fasting2": Fasting,
  "FearNoEvil": FearNoEvil,
  "FlurryOfBlows": FlurryOfBlows,
  "FlyingSleeves": FlyingSleeves,
  "FollowUp": FollowUp,
  "ForeignInfluence": ForeignInfluence,
  "Wireheading": Foresight,
  "Halt": Halt,
  "Indignation": Indignation,
  "InnerPeace": InnerPeace,
  "Judgement": Judgement,
  "JustLucky": JustLucky,
  "LessonLearned": LessonLearned,
  "LikeWater": LikeWater,
  "MasterReality": MasterReality,
  "Meditate": Meditate,
  "MentalFortress": MentalFortress,
  "Nirvana": Nirvana,
  "Omniscience": Omniscience,
  "Perseverance": Perseverance,
  "Pray": Pray,
  "PathToVictory": PressurePoints,
  "Prostrate": Prostrate,
  "Protect": Protect,
  "Ragnarok": Ragnarok,
  "ReachHeaven": ReachHeaven,
  "Adaptation": Rushdown,
  "Sanctity": Sanctity,
  "SandsOfTime": SandsOfTime,
  "SashWhip": SashWhip,
  "Scrawl": Scrawl,
  "SignatureMove": SignatureMove,
  "Vengeance": SimmeringFury,
  "SpiritShield": SpiritShield,
  "Strike_P": Strike_Purple,
  "Study": Study,
  "Swivel": Swivel,
  "TalkToTheHand": TalkToTheHand,
  "Tantrum": Tantrum,
  "ThirdEye": ThirdEye,
  "ClearTheMind": Tranquility,
  "Unraveling": Unraveling,
  "Vault": Vault,
  "Vigilance": Vigilance,
  "Wallop": Wallop,
  "WaveOfTheHand": WaveOfTheHand,
  "Weave": Weave,
  "WheelKick": WheelKick,
  "WindmillStrike": WindmillStrike,
  "Wish": Wish,
  "Worship": Worship,
  "WreathOfFlame": WreathOfFlame,
  "Anger": Anger,
  "Armaments": Armaments,
  "Barricade": Barricade,
  "Bash": Bash,
  "Battle Trance": BattleTrance,
  "Berserk": Berserk,
  "Blood for Blood": BloodForBlood,
  "Bloodletting": Bloodletting,
  "Bludgeon": Bludgeon,
  "Body Slam": BodySlam,
  "Brutality": Brutality,
  "Burning Pact": BurningPact,
  "Carnage": Carnage,
  "Clash": Clash,
  "Cleave": Cleave,
  "Clothesline": Clothesline,
  "Combust": Combust,
  "Corruption": Corruption,
  "Dark Embrace": DarkEmbrace,
  "Defend_R": Defend_Red,
  "Demon Form": DemonForm,
  "Disarm": Disarm,
  "Double Tap": DoubleTap,
  "Dropkick": Dropkick,
  "Dual Wield": DualWield,
  "Entrench": Entrench,
  "Evolve": Evolve,
  "Exhume": Exhume,
  "Feed": Feed,
  "Feel No Pain": FeelNoPain,
  "Fiend Fire": FiendFire,
  "Fire Breathing": FireBreathing,
  "Flame Barrier": FlameBarrier,
  "Flex": Flex,
  "Ghostly Armor": GhostlyArmor,
  "Havoc": Havoc,
  "Headbutt": Headbutt,
  "Heavy Blade": HeavyBlade,
  "Hemokinesis": Hemokinesis,
  "Immolate": Immolate,
  "Impervious": Impervious,
  "Infernal Blade": InfernalBlade,
  "Inflame": Inflame,
  "Intimidate": Intimidate,
  "Iron Wave": IronWave,
  "Juggernaut": Juggernaut,
  "Limit Break": LimitBreak,
  "Metallicize": Metallicize,
  "Offering": Offering,
  "Perfected Strike": PerfectedStrike,
  "Pommel Strike": PommelStrike,
  "Power Through": PowerThrough,
  "Pummel": Pummel,
  "Rage": Rage,
  "Rampage": Rampage,
  "Reaper": Reaper,
  "Reckless Charge": RecklessCharge,
  "Rupture": Rupture,
  "Searing Blow": SearingBlow,
  "Second Wind": SecondWind,
  "Seeing Red": SeeingRed,
  "Sentinel": Sentinel,
  "Sever Soul": SeverSoul,
  "Shockwave": Shockwave,
  "Shrug It Off": ShrugItOff,
  "Spot Weakness": SpotWeakness,
  "Strike_R": Strike_Red,
  "Sword Boomerang": SwordBoomerang,
  "Thunderclap": ThunderClap,
  "True Grit": TrueGrit,
  "Twin Strike": TwinStrike,
  "Uppercut": Uppercut,
  "Warcry": Warcry,
  "Whirlwind": Whirlwind,
  "Wild Strike": WildStrike,
  "Burn": Burn,
  "Dazed": Dazed,
  "Slimed": Slimed,
  "Void": VoidCard,
  "Wound": Wound,
  "Beta": Beta,
  "Expunger": Expunger,
  "Insight": Insight,
  "Miracle": Miracle,
  "Omega": Omega,
  "Safety": Safety,
  "Shiv": Shiv,
  "Smite": Smite,
  "ThroughViolence": ThroughViolence,
} as unknown as Record<string, new () => { use?: (run: RunState, card: CardInst, target?: Creature) => void; upgrade?: (card: CardInst) => void }>;