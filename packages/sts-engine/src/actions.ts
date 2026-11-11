/**
 * Action queue named to match com.megacrit.cardcrawl.actions.
 * Durations are skipped: update() does the logical work of the first and last
 * frame. review/logic.html §3 is the order this queue is meant to follow.
 */
import type { CardInst, Creature, RunState } from "./types.js";

export type ActionType = "DAMAGE" | "BLOCK" | "POWER" | "DRAW" | "HEAL" | "SPECIAL" | "SHUFFLE" | "DISCARD" | "REDUCE_POWER";

export interface ActionHooks {
  damage: (run: RunState, attacker: Creature, target: Creature, base: number, opts: { hpLoss?: boolean; vampire?: boolean; card?: CardInst }) => number;
  block: (run: RunState, who: Creature, base: number) => void;
  applyPower: (who: Creature, id: string, amount: number, fromMonster?: boolean) => void;
  draw: (run: RunState, n: number) => CardInst[];
  shuffleDiscard: (run: RunState) => void;
  discardAtEndOfTurn: (run: RunState) => void;
  preMonsterTurn: (run: RunState) => void;
  actMonster: (run: RunState, monster: Creature) => void;
  rollMove: (run: RunState, monster: Creature) => void;
  afterMonsters: (run: RunState) => void;
  heal: (run: RunState, who: Creature, amount: number) => number;
  reducePower: (who: Creature, id: string, amount: number) => void;
  removePower: (who: Creature, id: string) => void;
  markTurnEnded: (ended: boolean) => void;
  playQueued: (item: CardQueueItem) => void;
  onUseCard: (run: RunState, card: CardInst, action: UseCardAction) => void;
  onAfterUseCard: (run: RunState, card: CardInst, action: UseCardAction) => void;
  finishCard: (run: RunState, card: CardInst) => void;
  cardShouldExhaust: (run: RunState, card: CardInst) => boolean;
}

export interface CardQueueItem {
  card: CardInst | null;
  monster?: Creature | null;
  energyOnUse?: number;
  autoplay?: boolean;
}

const hooks: ActionHooks = {
  damage: () => 0,
  block: () => {},
  applyPower: () => {},
  draw: () => [],
  shuffleDiscard: () => {},
  discardAtEndOfTurn: () => {},
  preMonsterTurn: () => {},
  actMonster: () => {},
  rollMove: () => {},
  afterMonsters: () => {},
  heal: () => 0,
  reducePower: () => {},
  removePower: () => {},
  markTurnEnded: () => {},
  playQueued: () => {},
  onUseCard: () => {},
  onAfterUseCard: () => {},
  finishCard: () => {},
  cardShouldExhaust: () => false,
};

export function bindActionHooks(next: ActionHooks): void {
  Object.assign(hooks, next);
}

export abstract class AbstractGameAction {
  isDone = false;
  amount = 0;
  actionType: ActionType = "SPECIAL";
  target: Creature | null = null;
  source: Creature | null = null;

  protected setValues(target: Creature | null, source: Creature | null, amount = 0): void {
    this.target = target;
    this.source = source;
    this.amount = amount;
  }

  protected addToBot(action: AbstractGameAction): void {
    gameActions.addToBottom(action);
  }

  protected addToTop(action: AbstractGameAction): void {
    gameActions.addToTop(action);
  }

  abstract update(): void;

  /** No real frame delay: one update finishes the action. */
  protected tickDuration(): void {
    this.isDone = true;
  }

  protected isDeadOrEscaped(target: Creature | null): boolean {
    return !!target && !target.alive;
  }

  protected shouldCancelAction(): boolean {
    return this.isDeadOrEscaped(this.target) || this.isDeadOrEscaped(this.source);
  }
}

export class GameActionManager {
  actions: AbstractGameAction[] = [];
  preTurnActions: AbstractGameAction[] = [];
  cardQueue: CardQueueItem[] = [];
  nextCombatActions: AbstractGameAction[] = [];
  currentAction: AbstractGameAction | null = null;
  previousAction: AbstractGameAction | null = null;
  turnStartCurrentAction: AbstractGameAction | null = null;
  hasControl = true;
  turnHasEnded = false;
  usingCard = false;
  monsterAttacksQueued = true;
  mantraGained = 0;
  private running = false;
  private energyGain = 0;
  /** While a card is being queued, nested actions append instead of running immediately. */
  deferToQueue = false;
  /** Class names of actions that actually ran, for order checks. */
  trace: string[] = [];

  get isRunning(): boolean {
    return this.running;
  }

  addToNextCombat(action: AbstractGameAction): void {
    this.nextCombatActions.push(action);
  }

  useNextCombatActions(): void {
    for (const action of this.nextCombatActions) this.addToBottom(action);
    this.nextCombatActions = [];
  }

  addToBottom(action: AbstractGameAction): void {
    this.actions.push(action);
  }

  addToTop(action: AbstractGameAction): void {
    this.actions.unshift(action);
  }

  addToTurnStart(action: AbstractGameAction): void {
    this.preTurnActions.unshift(action);
  }

  addCardQueueItem(c: CardQueueItem, inFrontOfQueue = false): void {
    if (!inFrontOfQueue || this.cardQueue.length === 0) this.cardQueue.push(c);
    else this.cardQueue.splice(1, 0, c);
  }

  removeFromQueue(card: CardInst): void {
    const index = this.cardQueue.findIndex((item) => item.card === card);
    if (index >= 0) this.cardQueue.splice(index, 1);
  }

  clearPostCombatActions(): void {
    this.actions = this.actions.filter(
      (action) =>
        action instanceof HealAction ||
        action instanceof GainBlockAction ||
        action instanceof UseCardAction ||
        action.actionType === "DAMAGE",
    );
  }

  callEndTurnEarlySequence(): void {
    this.turnHasEnded = true;
    hooks.markTurnEnded(true);
  }

  cleanCardQueue(): void {
    this.cardQueue = this.cardQueue.filter((item) => item.card == null);
  }

  isEmpty(): boolean {
    return this.actions.length === 0 && this.preTurnActions.length === 0 && this.cardQueue.length === 0;
  }

  clearNextRoomCombatActions(): void {
    this.nextCombatActions = [];
  }

  clear(): void {
    this.actions = [];
    this.preTurnActions = [];
    this.cardQueue = [];
    this.currentAction = null;
  }

  updateEnergyGain(energyGain: number): void {
    this.energyGain += energyGain;
  }

  static discardedThisTurn = 0;

  static incrementDiscard(_endOfTurn: boolean): void {
    GameActionManager.discardedThisTurn += 1;
  }

  static queueExtraCard(card: CardInst | null): void {
    gameActions.addCardQueueItem({ card }, false);
  }

  endTurn(): void {
    this.turnHasEnded = true;
    hooks.markTurnEnded(true);
  }

  /** One step of EXECUTING_ACTIONS: the head action runs to completion. */
  update(): void {
    this.getNextAction();
  }

  private getNextAction(): void {
    const next = this.actions.shift() ?? this.preTurnActions.shift();
    if (next) {
      this.currentAction = next;
      this.hasControl = true;
      next.update();
      this.previousAction = next;
      this.currentAction = null;
      return;
    }
    const queued = this.cardQueue.shift();
    if (queued) {
      this.usingCard = true;
      this.hasControl = true;
      hooks.playQueued(queued);
      this.usingCard = false;
      return;
    }
    this.hasControl = false;
  }

  runUntilIdle(): void {
    if (this.running) return;
    this.running = true;
    let guard = 0;
    try {
      while (!this.isEmpty() && guard++ < 400) this.update();
    } finally {
      this.running = false;
    }
  }
}

export const gameActions = new GameActionManager();

export class DamageAction extends AbstractGameAction {
  dealt = 0;
  constructor(
    private run: RunState,
    attacker: Creature,
    target: Creature,
    base: number,
    private opts: { hpLoss?: boolean; vampire?: boolean; card?: CardInst } = {},
  ) {
    super();
    this.setValues(target, attacker, base);
    this.actionType = "DAMAGE";
  }

  update(): void {
    gameActions.trace.push("DamageAction");
    if (this.shouldCancelAction() && !this.opts.hpLoss) {
      this.isDone = true;
      return;
    }
    this.dealt = hooks.damage(this.run, this.source!, this.target!, this.amount, this.opts);
    if (this.run.combat && !this.run.combat.monsters.some((m) => m.alive)) this.addToBot(new ClearPostCombatAction());
    this.tickDuration();
  }
}

class ClearPostCombatAction extends AbstractGameAction {
  update(): void {
    gameActions.clearPostCombatActions();
    this.isDone = true;
  }
}

export class GainBlockAction extends AbstractGameAction {
  constructor(run: RunState, target: Creature, amount: number, source: Creature = target) {
    super();
    this.setValues(target, source, amount);
    this.actionType = "BLOCK";
    this.run = run;
  }
  private run: RunState;

  update(): void {
    gameActions.trace.push("GainBlockAction");
    if (this.target?.alive) hooks.block(this.run, this.target, this.amount);
    this.tickDuration();
  }
}

export class ApplyPowerAction extends AbstractGameAction {
  constructor(
    target: Creature,
    source: Creature | null,
    private id: string,
    amount: number,
    private fromMonster = false,
  ) {
    super();
    this.setValues(target, source, amount);
    this.actionType = "POWER";
  }

  update(): void {
    gameActions.trace.push("ApplyPowerAction");
    if (!this.target?.alive) {
      this.isDone = true;
      return;
    }
    hooks.applyPower(this.target, this.id, this.amount, this.fromMonster);
    this.tickDuration();
  }
}

export class DrawCardAction extends AbstractGameAction {
  drawn: CardInst[] = [];
  constructor(
    private run: RunState,
    amount: number,
    private endTurnDraw = false,
  ) {
    super();
    this.setValues(null, null, amount);
    this.actionType = "DRAW";
    if (endTurnDraw) gameActions.updateEnergyGain(0);
  }

  update(): void {
    this.drawn = hooks.draw(this.run, this.amount);
    void this.endTurnDraw;
    this.tickDuration();
  }
}

export class EmptyDeckShuffleAction extends AbstractGameAction {
  constructor(private run: RunState) {
    super();
    this.actionType = "SHUFFLE";
  }

  update(): void {
    hooks.shuffleDiscard(this.run);
    this.tickDuration();
  }
}

export class DiscardAtEndOfTurnAction extends AbstractGameAction {
  constructor(private run: RunState) {
    super();
    this.actionType = "DISCARD";
  }

  update(): void {
    hooks.discardAtEndOfTurn(this.run);
    this.tickDuration();
  }
}

export class EndTurnAction extends AbstractGameAction {
  update(): void {
    gameActions.endTurn();
    this.tickDuration();
  }
}

export class MonsterStartTurnAction extends AbstractGameAction {
  constructor(private run: RunState) {
    super();
  }

  update(): void {
    hooks.preMonsterTurn(this.run);
    const monsters = [...(this.run.combat?.monsters ?? [])];
    for (let i = monsters.length - 1; i >= 0; i--) {
      const monster = monsters[i]!;
      this.addToTop(new RollMoveAction(this.run, monster));
      this.addToTop(new MonsterAct(this.run, monster));
    }
    this.tickDuration();
  }
}

class MonsterAct extends AbstractGameAction {
  constructor(
    private run: RunState,
    private monster: Creature,
  ) {
    super();
  }

  update(): void {
    if (this.run.combat?.defeat) {
      gameActions.clear();
      this.isDone = true;
      return;
    }
    if (this.monster.alive) hooks.actMonster(this.run, this.monster);
    this.tickDuration();
  }
}

export class RollMoveAction extends AbstractGameAction {
  constructor(
    private run: RunState,
    private monster: Creature,
  ) {
    super();
  }

  update(): void {
    if (this.run.combat?.defeat) {
      gameActions.clear();
      this.isDone = true;
      return;
    }
    if (this.monster.alive && !this.monster.misc.skipRoll) hooks.rollMove(this.run, this.monster);
    this.monster.misc.skipRoll = 0;
    this.tickDuration();
  }
}

export class HealAction extends AbstractGameAction {
  healed = 0;
  constructor(private run: RunState, target: Creature, amount: number, source: Creature = target) {
    super();
    this.setValues(target, source, amount);
    this.actionType = "HEAL";
  }

  update(): void {
    if (this.target) this.healed = hooks.heal(this.run, this.target, this.amount);
    this.tickDuration();
  }
}

export class GainEnergyAction extends AbstractGameAction {
  constructor(
    private run: RunState,
    amount: number,
  ) {
    super();
    this.amount = amount;
  }

  update(): void {
    const combat = this.run.combat;
    if (combat) combat.energy += this.amount;
    gameActions.updateEnergyGain(this.amount);
    this.tickDuration();
  }
}

export class LoseHPAction extends AbstractGameAction {
  dealt = 0;
  constructor(private run: RunState, target: Creature, source: Creature, amount: number) {
    super();
    this.setValues(target, source, amount);
    this.actionType = "DAMAGE";
  }

  update(): void {
    if (this.target && this.source) {
      this.dealt = hooks.damage(this.run, this.source, this.target, this.amount, { hpLoss: true });
    }
    this.tickDuration();
  }
}

export class ReducePowerAction extends AbstractGameAction {
  constructor(target: Creature, source: Creature, private id: string, amount: number) {
    super();
    this.setValues(target, source, amount);
    this.actionType = "REDUCE_POWER";
  }

  update(): void {
    if (this.target) hooks.reducePower(this.target, this.id, this.amount);
    this.tickDuration();
  }
}

export class RemoveSpecificPowerAction extends AbstractGameAction {
  constructor(target: Creature, source: Creature, private id: string) {
    super();
    this.setValues(target, source, 0);
  }

  update(): void {
    if (this.target) hooks.removePower(this.target, this.id);
    this.tickDuration();
  }
}

/** Runs the post-monster half of getNextAction's new-turn branch. */
export class StartNextTurnAction extends AbstractGameAction {
  constructor(private run: RunState) {
    super();
  }

  update(): void {
    if (this.run.combat?.defeat) {
      this.isDone = true;
      return;
    }
    hooks.afterMonsters(this.run);
    this.tickDuration();
  }
}

export class CallbackAction extends AbstractGameAction {
  constructor(private fn: () => void) {
    super();
    this.actionType = "SPECIAL";
  }

  update(): void {
    this.fn();
    this.isDone = true;
  }
}

export class UseCardAction extends AbstractGameAction {
  exhaustCard = false;
  returnToHand = false;
  reboundCard = false;

  constructor(
    private run: RunState,
    private card: CardInst,
    target: Creature | null = null,
  ) {
    super();
    this.target = target;
    this.exhaustCard = hooks.cardShouldExhaust(run, card);
    hooks.onUseCard(run, card, this);
    this.actionType = this.exhaustCard ? "SPECIAL" : "SPECIAL";
  }

  update(): void {
    gameActions.trace.push("UseCardAction");
    hooks.onAfterUseCard(this.run, this.card, this);
    this.card.freeOnce = false;
    if (this.exhaustCard) this.card.exhaustOnce = true;
    hooks.finishCard(this.run, this.card);
    this.tickDuration();
  }
}

export function runAction<T extends AbstractGameAction>(action: T): T {
  if (gameActions.deferToQueue) {
    gameActions.addToBottom(action);
    return action;
  }
  if (gameActions.isRunning) {
    action.update();
    return action;
  }
  gameActions.addToBottom(action);
  gameActions.runUntilIdle();
  return action;
}
