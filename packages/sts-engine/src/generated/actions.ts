import { AbstractGameAction, ApplyPowerAction, DamageAction, DrawCardAction, GainBlockAction, GainEnergyAction, HealAction, LoseHPAction } from "../actions.js";
import { changeStance, channelOrb, makeCard, upgradeCard } from "../combat.js";
import { hasRelic } from "../relicEffects.js";
import type { CardInst, Creature, RunState } from "../types.js";
import { baseNumbers } from "../combat.js";

export class DamageAllEnemiesAction extends AbstractGameAction {
  constructor(private run: RunState, source: Creature, amount: number, private card?: CardInst) {
    super();
    this.setValues(null, source, amount);
  }
  update(): void {
    for (const m of this.run.combat?.monsters ?? []) {
      if (!m.alive) continue;
      this.addToBot(new DamageAction(this.run, this.source ?? this.run.player, m, this.amount, { card: this.card }));
    }
    this.isDone = true;
  }
}

export class ChangeStanceAction extends AbstractGameAction {
  constructor(private run: RunState, private stance: "none" | "calm" | "wrath" | "divinity") { super(); }
  update(): void {
    if (this.run.player.powers.some((p) => p.id === "CannotChangeStancePower" || p.id === "Cannot Change Stance")) {
      this.isDone = true;
      return;
    }
    changeStance(this.run, this.stance);
    this.isDone = true;
  }
}

export class ChannelAction extends AbstractGameAction {
  constructor(private run: RunState, private orb: "lightning" | "frost" | "dark" | "plasma") { super(); }
  update(): void {
    channelOrb(this.run, this.orb);
    this.isDone = true;
  }
}

export class MakeTempCardInHandAction extends AbstractGameAction {
  constructor(private run: RunState, private cardId: string, amount = 1) { super(); this.amount = amount; }
  update(): void {
    const cbt = this.run.combat;
    if (!cbt) { this.isDone = true; return; }
    for (let i = 0; i < this.amount; i++) {
      const made = makeCard(this.run, this.cardId);
      if (this.run.player.powers.some((p) => p.id === "MasterReality" || p.id === "MasterRealityPower")) upgradeCard(made);
      if (cbt.hand.length < 10) cbt.hand.push(made);
      else cbt.discard.push(made);
    }
    this.isDone = true;
  }
}

export class MakeTempCardInDiscardAction extends AbstractGameAction {
  constructor(private run: RunState, private cardId: string, amount = 1) { super(); this.amount = amount; }
  update(): void {
    const cbt = this.run.combat;
    if (!cbt) { this.isDone = true; return; }
    for (let i = 0; i < this.amount; i++) cbt.discard.push(makeCard(this.run, this.cardId));
    this.isDone = true;
  }
}

export class MakeTempCardInDrawPileAction extends AbstractGameAction {
  constructor(private run: RunState, private cardId: string, amount = 1) { super(); this.amount = amount; }
  update(): void {
    const cbt = this.run.combat;
    if (!cbt) { this.isDone = true; return; }
    for (let i = 0; i < this.amount; i++) cbt.draw.push(makeCard(this.run, this.cardId));
    this.isDone = true;
  }
}

export class WhirlwindAction extends AbstractGameAction {
  constructor(private run: RunState, amount: number, private card: CardInst) {
    super();
    this.amount = amount;
    this.source = run.player;
  }
  update(): void {
    const cbt = this.run.combat;
    let effect = cbt?.energy ?? 0;
    if (hasRelic(this.run, "Chemical X")) effect += 2;
    if (effect > 0) {
      for (let i = 0; i < effect; i++) this.addToBot(new DamageAllEnemiesAction(this.run, this.run.player, this.amount, this.card));
      if (!this.card.freeOnce && cbt) cbt.energy = 0;
    }
    this.isDone = true;
  }
}

export class DropkickAction extends AbstractGameAction {
  constructor(private run: RunState, private card: CardInst, target: Creature | null, amount: number) {
    super();
    this.target = target;
    this.source = run.player;
    this.amount = amount;
  }
  update(): void {        if (this.target != null && !!this.target?.powers.some((p) => p.id === "Vulnerable")) {
            this.addToTop(new DrawCardAction(this.run, 1));
            this.addToTop(new GainEnergyAction(this.run, 1));
        }
        this.addToTop(new DamageAction(this.run, this.run.player, this.target!, this.amount, { card: this.card }));
        this.isDone = true;
  }
}
export class HeelHookAction extends AbstractGameAction {
  constructor(private run: RunState, private card: CardInst, target: Creature | null, amount: number) {
    super();
    this.target = target;
    this.source = run.player;
    this.amount = amount;
  }
  update(): void {        if (this.target != null && !!this.target?.powers.some((p) => p.id === "Weakened")) {
            this.addToTop(new DrawCardAction(this.run, 1));
            this.addToTop(new GainEnergyAction(this.run, 1));
        }
        this.addToTop(new DamageAction(this.run, this.run.player, this.target!, this.amount, { card: this.card }));
        this.isDone = true;
  }
}
export class InnerPeaceAction extends AbstractGameAction {
  constructor(private run: RunState, private card: CardInst, target: Creature | null, amount: number) {
    super();
    this.target = target;
    this.source = run.player;
    this.amount = amount;
  }
  update(): void {        if (this.run.combat?.stance === "calm") {
            this.addToTop(new DrawCardAction(this.run, this.amount));
        } else {
            this.addToTop(new ChangeStanceAction(this.run, "calm"));
        }
        this.isDone = true;
  }
}
