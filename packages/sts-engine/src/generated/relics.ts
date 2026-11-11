import type { RelicCtx } from "../relicEffects.js";
import type { RelicInst, RunState } from "../types.js";
import { applyHookSwitch } from "../relicEffects.js";

export class Abacus {
  constructor() {}
  onShuffle(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onShuffle", ctx); }
}
export class Akabeko {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class Anchor {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class AncientTeaSet {
  constructor() {}
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
  atPreBattle(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atPreBattle", ctx); }
}
export class ArtOfWar {
  constructor() {}
  atPreBattle(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atPreBattle", ctx); }
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class Astrolabe {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class BagOfMarbles {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class BagOfPreparation {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class BirdFacedUrn {
  constructor() {}
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
}
export class BlackBlood {
  constructor() {}
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class BloodVial {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class BloodyIdol {
  constructor() {}
  onGainGold(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onGainGold", ctx); }
}
export class BlueCandle {
  constructor() {}
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
}
export class Boot {
  constructor() {}
  onAttackToChangeDamage(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onAttackToChangeDamage", ctx); }
}
export class BottledTornado {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class Brimstone {
  constructor() {}
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
}
export class BronzeScales {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class BurningBlood {
  constructor() {}
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class CallingBell {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class CaptainsWheel {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class Cauldron {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class CentennialPuzzle {
  constructor() {}
  atPreBattle(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atPreBattle", ctx); }
  wasHPLost(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "wasHPLost", ctx); }
}
export class CeramicFish {
  constructor() {}
  onObtainCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onObtainCard", ctx); }
}
export class CharonsAshes {
  constructor() {}
  onExhaust(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onExhaust", ctx); }
}
export class CloakClasp {
  constructor() {}
  onPlayerEndTurn(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onPlayerEndTurn", ctx); }
}
export class ClockworkSouvenir {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class CrackedCore {
  constructor() {}
  atPreBattle(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atPreBattle", ctx); }
}
export class CultistMask {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class Damaru {
  constructor() {}
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
}
export class DarkstonePeriapt {
  constructor() {}
  onObtainCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onObtainCard", ctx); }
}
export class DataDisk {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class DeadBranch {
  constructor() {}
  onExhaust(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onExhaust", ctx); }
}
export class DollysMirror {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class Duality {
  constructor() {}
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
}
export class DuVuDoll {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class EmotionChip {
  constructor() {}
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
  wasHPLost(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "wasHPLost", ctx); }
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class EmptyCage {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class Enchiridion {
  constructor() {}
  atPreBattle(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atPreBattle", ctx); }
}
export class EternalFeather {
  constructor() {}
  onEnterRoom(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEnterRoom", ctx); }
}
export class FaceOfCleric {
  constructor() {}
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class FossilizedHelix {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class FrozenCore {
  constructor() {}
  onPlayerEndTurn(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onPlayerEndTurn", ctx); }
}
export class FrozenEgg2 {
  constructor() {}
  onObtainCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onObtainCard", ctx); }
}
export class GamblingChip {
  constructor() {}
  atTurnStartPostDraw(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStartPostDraw", ctx); }
}
export class Girya {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class GremlinHorn {
  constructor() {}
  onMonsterDeath(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onMonsterDeath", ctx); }
}
export class GremlinMask {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class HappyFlower {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
}
export class HolyWater {
  constructor() {}
  atBattleStartPreDraw(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStartPreDraw", ctx); }
}
export class HornCleat {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class HoveringKite {
  constructor() {}
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
  onManualDiscard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onManualDiscard", ctx); }
}
export class IncenseBurner {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
}
export class InkBottle {
  constructor() {}
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
}
export class Inserter {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
}
export class Kunai {
  constructor() {}
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class Lantern {
  constructor() {}
  atPreBattle(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atPreBattle", ctx); }
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
}
export class LetterOpener {
  constructor() {}
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class MagicFlower {
  constructor() {}
  onPlayerHeal(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onPlayerHeal", ctx); }
}
export class Mango {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class MarkOfPain {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class MarkOfTheBloom {
  constructor() {}
  onPlayerHeal(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onPlayerHeal", ctx); }
}
export class MawBank {
  constructor() {}
  onEnterRoom(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEnterRoom", ctx); }
  onSpendGold(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onSpendGold", ctx); }
}
export class MedicalKit {
  constructor() {}
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
}
export class Melange {
  constructor() {}
  onShuffle(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onShuffle", ctx); }
}
export class MercuryHourglass {
  constructor() {}
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
}
export class MoltenEgg2 {
  constructor() {}
  onObtainCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onObtainCard", ctx); }
}
export class MummifiedHand {
  constructor() {}
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
}
export class MutagenicStrength {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class Necronomicon {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
}
export class NeowsLament {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class NinjaScroll {
  constructor() {}
  atBattleStartPreDraw(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStartPreDraw", ctx); }
}
export class NuclearBattery {
  constructor() {}
  atPreBattle(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atPreBattle", ctx); }
}
export class Nunchaku {
  constructor() {}
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
}
export class OddlySmoothStone {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class OldCoin {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class OrangePellets {
  constructor() {}
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
}
export class Orichalcum {
  constructor() {}
  onPlayerEndTurn(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onPlayerEndTurn", ctx); }
}
export class OrnamentalFan {
  constructor() {}
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class Orrery {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class PandorasBox {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class Pantograph {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class Pear {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class PenNib {
  constructor() {}
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class PhilosopherStone {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class Pocketwatch {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
  atTurnStartPostDraw(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStartPostDraw", ctx); }
  onPlayCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onPlayCard", ctx); }
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class PotionBelt {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class PreservedInsect {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class PrismaticShard {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class PureWater {
  constructor() {}
  atBattleStartPreDraw(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStartPreDraw", ctx); }
}
export class RedMask {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class RedSkull {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
  onBloodied(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onBloodied", ctx); }
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class RingOfTheSerpent {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class RunicCapacitor {
  constructor() {}
  atPreBattle(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atPreBattle", ctx); }
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
}
export class RunicCube {
  constructor() {}
  wasHPLost(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "wasHPLost", ctx); }
}
export class SelfFormingClay {
  constructor() {}
  wasHPLost(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "wasHPLost", ctx); }
}
export class Shuriken {
  constructor() {}
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
  onUseCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUseCard", ctx); }
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class SlaversCollar {
  constructor() {}
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class Sling {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class SnakeRing {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class SneckoEye {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
  atPreBattle(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atPreBattle", ctx); }
}
export class Sozu {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class SsserpentHead {
  constructor() {}
  onEnterRoom(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEnterRoom", ctx); }
}
export class StoneCalendar {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
  onPlayerEndTurn(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onPlayerEndTurn", ctx); }
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class Strawberry {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class StrikeDummy {
  constructor() {}
  atDamageModify(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atDamageModify", ctx); }
}
export class Sundial {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
  onShuffle(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onShuffle", ctx); }
}
export class SymbioticVirus {
  constructor() {}
  atPreBattle(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atPreBattle", ctx); }
}
export class TeardropLocket {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class TheSpecimen {
  constructor() {}
  onMonsterDeath(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onMonsterDeath", ctx); }
}
export class ThreadAndNeedle {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class Tingsha {
  constructor() {}
  onManualDiscard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onManualDiscard", ctx); }
}
export class TinyChest {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class TinyHouse {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class Toolbox {
  constructor() {}
  atBattleStartPreDraw(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStartPreDraw", ctx); }
}
export class Torii {
  constructor() {}
  onAttacked(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onAttacked", ctx); }
}
export class ToughBandages {
  constructor() {}
  onManualDiscard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onManualDiscard", ctx); }
}
export class ToxicEgg2 {
  constructor() {}
  onObtainCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onObtainCard", ctx); }
}
export class ToyOrnithopter {
  constructor() {}
  onUsePotion(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onUsePotion", ctx); }
}
export class TungstenRod {
  constructor() {}
  onLoseHpLast(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onLoseHpLast", ctx); }
}
export class TwistedFunnel {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class UnceasingTop {
  constructor() {}
  atPreBattle(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atPreBattle", ctx); }
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
}
export class Vajra {
  constructor() {}
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
}
export class VelvetChoker {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
  atBattleStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atBattleStart", ctx); }
  atTurnStart(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStart", ctx); }
  onPlayCard(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onPlayCard", ctx); }
  canPlay(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "canPlay", ctx); }
  onVictory(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onVictory", ctx); }
}
export class VioletLotus {
  constructor() {}
  onChangeStance(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onChangeStance", ctx); }
}
export class Waffle {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class WarPaint {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class WarpedTongs {
  constructor() {}
  atTurnStartPostDraw(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atTurnStartPostDraw", ctx); }
}
export class Whetstone {
  constructor() {}
  onEquip(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "onEquip", ctx); }
}
export class WristBlade {
  constructor() {}
  atDamageModify(run: RunState, ctx: RelicCtx, relic: RelicInst): number { return applyHookSwitch(run, relic, "atDamageModify", ctx); }
}
export const RELIC_CLASSES = {
  "TheAbacus": Abacus,
  "Akabeko": Akabeko,
  "Anchor": Anchor,
  "Ancient Tea Set": AncientTeaSet,
  "Art of War": ArtOfWar,
  "Astrolabe": Astrolabe,
  "Bag of Marbles": BagOfMarbles,
  "Bag of Preparation": BagOfPreparation,
  "Bird Faced Urn": BirdFacedUrn,
  "Black Blood": BlackBlood,
  "Blood Vial": BloodVial,
  "Bloody Idol": BloodyIdol,
  "Blue Candle": BlueCandle,
  "Boot": Boot,
  "Bottled Tornado": BottledTornado,
  "Brimstone": Brimstone,
  "Bronze Scales": BronzeScales,
  "Burning Blood": BurningBlood,
  "Calling Bell": CallingBell,
  "CaptainsWheel": CaptainsWheel,
  "Cauldron": Cauldron,
  "Centennial Puzzle": CentennialPuzzle,
  "CeramicFish": CeramicFish,
  "Charon's Ashes": CharonsAshes,
  "CloakClasp": CloakClasp,
  "ClockworkSouvenir": ClockworkSouvenir,
  "Cracked Core": CrackedCore,
  "CultistMask": CultistMask,
  "Damaru": Damaru,
  "Darkstone Periapt": DarkstonePeriapt,
  "DataDisk": DataDisk,
  "Dead Branch": DeadBranch,
  "DollysMirror": DollysMirror,
  "Yang": Duality,
  "Du-Vu Doll": DuVuDoll,
  "Emotion Chip": EmotionChip,
  "Empty Cage": EmptyCage,
  "Enchiridion": Enchiridion,
  "Eternal Feather": EternalFeather,
  "FaceOfCleric": FaceOfCleric,
  "FossilizedHelix": FossilizedHelix,
  "FrozenCore": FrozenCore,
  "Frozen Egg 2": FrozenEgg2,
  "Gambling Chip": GamblingChip,
  "Girya": Girya,
  "Gremlin Horn": GremlinHorn,
  "GremlinMask": GremlinMask,
  "Happy Flower": HappyFlower,
  "HolyWater": HolyWater,
  "HornCleat": HornCleat,
  "HoveringKite": HoveringKite,
  "Incense Burner": IncenseBurner,
  "InkBottle": InkBottle,
  "Inserter": Inserter,
  "Kunai": Kunai,
  "Lantern": Lantern,
  "Letter Opener": LetterOpener,
  "Magic Flower": MagicFlower,
  "Mango": Mango,
  "Mark of Pain": MarkOfPain,
  "Mark of the Bloom": MarkOfTheBloom,
  "MawBank": MawBank,
  "Medical Kit": MedicalKit,
  "Melange": Melange,
  "Mercury Hourglass": MercuryHourglass,
  "Molten Egg 2": MoltenEgg2,
  "Mummified Hand": MummifiedHand,
  "MutagenicStrength": MutagenicStrength,
  "Necronomicon": Necronomicon,
  "NeowsBlessing": NeowsLament,
  "Ninja Scroll": NinjaScroll,
  "Nuclear Battery": NuclearBattery,
  "Nunchaku": Nunchaku,
  "Oddly Smooth Stone": OddlySmoothStone,
  "Old Coin": OldCoin,
  "OrangePellets": OrangePellets,
  "Orichalcum": Orichalcum,
  "Ornamental Fan": OrnamentalFan,
  "Orrery": Orrery,
  "Pandora's Box": PandorasBox,
  "Pantograph": Pantograph,
  "Pear": Pear,
  "Pen Nib": PenNib,
  "Philosopher's Stone": PhilosopherStone,
  "Pocketwatch": Pocketwatch,
  "Potion Belt": PotionBelt,
  "PreservedInsect": PreservedInsect,
  "PrismaticShard": PrismaticShard,
  "PureWater": PureWater,
  "Red Mask": RedMask,
  "Red Skull": RedSkull,
  "Ring of the Serpent": RingOfTheSerpent,
  "Runic Capacitor": RunicCapacitor,
  "Runic Cube": RunicCube,
  "Self Forming Clay": SelfFormingClay,
  "Shuriken": Shuriken,
  "SlaversCollar": SlaversCollar,
  "Sling": Sling,
  "Ring of the Snake": SnakeRing,
  "Snecko Eye": SneckoEye,
  "Sozu": Sozu,
  "SsserpentHead": SsserpentHead,
  "StoneCalendar": StoneCalendar,
  "Strawberry": Strawberry,
  "StrikeDummy": StrikeDummy,
  "Sundial": Sundial,
  "Symbiotic Virus": SymbioticVirus,
  "TeardropLocket": TeardropLocket,
  "The Specimen": TheSpecimen,
  "Thread and Needle": ThreadAndNeedle,
  "Tingsha": Tingsha,
  "Tiny Chest": TinyChest,
  "Tiny House": TinyHouse,
  "Toolbox": Toolbox,
  "Torii": Torii,
  "Tough Bandages": ToughBandages,
  "Toxic Egg 2": ToxicEgg2,
  "Toy Ornithopter": ToyOrnithopter,
  "TungstenRod": TungstenRod,
  "TwistedFunnel": TwistedFunnel,
  "Unceasing Top": UnceasingTop,
  "Vajra": Vajra,
  "Velvet Choker": VelvetChoker,
  "VioletLotus": VioletLotus,
  "Lee's Waffle": Waffle,
  "War Paint": WarPaint,
  "WarpedTongs": WarpedTongs,
  "Whetstone": Whetstone,
  "WristBlade": WristBlade,
} as unknown as Record<string, new () => Record<string, (run: RunState, ctx: RelicCtx, relic: RelicInst) => number>>;