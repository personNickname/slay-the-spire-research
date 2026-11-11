import type { Creature, RunState } from "../types.js";
import { monsterApi } from "./runtime.js";

export class JawWorm {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 1) monsterApi.fx.dealDamage(run, m, player, monsterApi.dmgOf(run, m, "c", 11, 12, 12));
          else if (mv === 2) {
            monsterApi.fx.addPower(m, "Strength", monsterApi.dmgOf(run, m, "s", 3, 4, 5));
            monsterApi.fx.gainBlock(run, m, monsterApi.asc(run, 17) ? 9 : 6);
          } else if (mv === 3) {
            monsterApi.fx.dealDamage(run, m, player, 7);
            monsterApi.fx.gainBlock(run, m, 5);
          }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const chomp = monsterApi.dmgOf(run, m, "chomp", 11, 12, 12);
          const thrash = 7;
          if (!m.misc.didFirst) {
            m.misc.didFirst = 1;
            monsterApi.setMove(m, 1, "attack", chomp);
            break;
          }
          if (num < 25) {
            if (monsterApi.lastMove(m, 1)) {
              if (r.randomChance(0.5625)) monsterApi.setMove(m, 2, "defend_buff");
              else monsterApi.setMove(m, 3, "attack_defend", thrash);
            } else monsterApi.setMove(m, 1, "attack", chomp);
          } else if (num < 55) {
            if (monsterApi.lastTwo(m, 3)) {
              if (r.randomChance(0.357)) monsterApi.setMove(m, 1, "attack", chomp);
              else monsterApi.setMove(m, 2, "defend_buff");
            } else monsterApi.setMove(m, 3, "attack_defend", thrash);
          } else if (monsterApi.lastMove(m, 2)) {
            if (r.randomChance(0.416)) monsterApi.setMove(m, 1, "attack", chomp);
            else monsterApi.setMove(m, 3, "attack_defend", thrash);
          } else monsterApi.setMove(m, 2, "defend_buff");
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class Cultist {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 3) {
            let ritual = monsterApi.asc(run, 2) ? 4 : 3;
            if (monsterApi.asc(run, 17)) ritual += 1;
            monsterApi.fx.addPower(m, "Ritual", ritual);
          } else monsterApi.fx.dealDamage(run, m, player, 6);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    if (!m.misc.didFirst) {
            m.misc.didFirst = 1;
            monsterApi.setMove(m, 3, "buff");
          } else monsterApi.setMove(m, 1, "attack", 6);
    }
    monsterApi.saveAi(run, r);
  }
}
export class AcidSlime_S {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 4 : 3);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    monsterApi.setMove(m, 1, "attack", monsterApi.asc(run, 2) ? 4 : 3);
    }
    monsterApi.saveAi(run, r);
  }
}
export class SpikeSlime_S {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 6 : 5);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    monsterApi.setMove(m, 1, "attack", monsterApi.asc(run, 2) ? 6 : 5);
    }
    monsterApi.saveAi(run, r);
  }
}
export class AcidSlime_M {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 1) {
            monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 8 : 7);
            monsterApi.addSlimed(run, 1);
          } else monsterApi.fx.addPower(player, "Weakened", 1, true);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          if (m.hp * 2 <= m.maxHp) {
            monsterApi.setMove(m, 3, "unknown"); // split unused for M in some patches; M does not split
          }
          const spit = monsterApi.asc(run, 2) ? 8 : 7;
          if (num < 40) {
            if (monsterApi.lastTwo(m, 1)) monsterApi.setMove(m, 4, "debuff");
            else monsterApi.setMove(m, 1, "attack_debuff", spit);
          } else if (monsterApi.lastMove(m, 4)) monsterApi.setMove(m, 1, "attack_debuff", spit);
          else monsterApi.setMove(m, 4, "debuff");
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class SpikeSlime_M {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 1) {
            monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 10 : 8);
            monsterApi.addSlimed(run, 1);
          } else monsterApi.fx.addPower(player, "Frail", 1, true);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const d = monsterApi.asc(run, 2) ? 10 : 8;
          if (num < 30 && !monsterApi.lastTwo(m, 1)) monsterApi.setMove(m, 1, "attack_debuff", d);
          else if (monsterApi.lastMove(m, 4)) monsterApi.setMove(m, 1, "attack_debuff", d);
          else monsterApi.setMove(m, 4, "debuff");
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class AcidSlime_L {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 3) m.misc.splitInto = "AcidSlime_M";
          else if (mv === 1) {
            monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 12 : 11);
            monsterApi.addSlimed(run, 2);
          } else if (mv === 2) monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 18 : 16);
          else monsterApi.fx.addPower(player, "Weakened", 2, true);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          if (m.hp * 2 <= m.maxHp) {
            monsterApi.setMove(m, 3, "unknown");
            break;
          }
          const spit = monsterApi.asc(run, 2) ? 12 : 11;
          const tackle = monsterApi.asc(run, 2) ? 18 : 16;
          if (num < 30) {
            if (monsterApi.lastTwo(m, 1)) {
              if (r.randomBoolean()) monsterApi.setMove(m, 2, "attack", tackle);
              else monsterApi.setMove(m, 4, "debuff");
            } else monsterApi.setMove(m, 1, "attack_debuff", spit);
          } else if (num < 70) {
            if (monsterApi.lastMove(m, 2)) {
              if (r.randomChance(0.4)) monsterApi.setMove(m, 1, "attack_debuff", spit);
              else monsterApi.setMove(m, 4, "debuff");
            } else monsterApi.setMove(m, 2, "attack", tackle);
          } else if (monsterApi.lastTwo(m, 4)) {
            if (r.randomChance(0.4)) monsterApi.setMove(m, 1, "attack_debuff", spit);
            else monsterApi.setMove(m, 2, "attack", tackle);
          } else monsterApi.setMove(m, 4, "debuff");
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class SpikeSlime_L {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 3) m.misc.splitInto = "SpikeSlime_M";
          else if (mv === 1) {
            monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 18 : 16);
            monsterApi.addSlimed(run, 2);
          } else monsterApi.fx.addPower(player, "Frail", 2, true);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          if (m.hp * 2 <= m.maxHp) {
            monsterApi.setMove(m, 3, "unknown");
            break;
          }
          const d = monsterApi.asc(run, 2) ? 18 : 16;
          if (num < 30) {
            if (monsterApi.lastTwo(m, 1)) monsterApi.setMove(m, 4, "debuff");
            else monsterApi.setMove(m, 1, "attack_debuff", d);
          } else if (monsterApi.lastTwo(m, 4)) monsterApi.setMove(m, 1, "attack_debuff", d);
          else monsterApi.setMove(m, 4, "debuff");
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class FungiBeast {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 1) monsterApi.fx.dealDamage(run, m, player, 6);
          else monsterApi.fx.addPower(m, "Strength", 3);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const bite = 6;
          if (!m.misc.didFirst) {
            m.misc.didFirst = 1;
            monsterApi.setMove(m, 2, "buff"); // grow
          } else if (num < 60) monsterApi.setMove(m, 1, "attack", bite);
          else monsterApi.setMove(m, 2, "buff");
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class SlaverBlue {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 1) monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 13 : 12);
          else {
            monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 8 : 7);
            monsterApi.fx.addPower(player, "Weakened", 1, true);
          }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const stab = monsterApi.asc(run, 2) ? 13 : 12;
          const rake = monsterApi.asc(run, 2) ? 8 : 7;
          if (num >= 40 && !monsterApi.lastTwo(m, 3)) monsterApi.setMove(m, 3, "attack_debuff", rake);
          else monsterApi.setMove(m, 1, "attack", stab);
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class SlaverRed {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 1) monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 14 : 13);
          else if (mv === 2) monsterApi.fx.addPower(player, "Entangled", 1, true);
          else {
            monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 9 : 8);
            monsterApi.addSlimed(run, 1);
          }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const stab = monsterApi.asc(run, 2) ? 14 : 13;
          const scrape = monsterApi.asc(run, 2) ? 9 : 8;
          if (!m.misc.entangled && num >= 75) {
            m.misc.entangled = 1;
            monsterApi.setMove(m, 2, "strong_debuff");
          } else if (num >= 55 && !monsterApi.lastTwo(m, 3)) monsterApi.setMove(m, 3, "attack_debuff", scrape);
          else monsterApi.setMove(m, 1, "attack", stab);
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class Looter {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    {
          m.misc.looterTurn = Number(m.misc.looterTurn ?? 0) + 1;
          if (mv === 1 || mv === 4) {
            const stolen = monsterApi.fx.dealDamage(run, m, player, mv === 4 ? (monsterApi.asc(run, 2) ? 14 : 12) : monsterApi.asc(run, 2) ? 11 : 10);
            m.misc.gold = Number(m.misc.gold ?? 0) + Math.min(15, stolen > 0 ? 15 : 0);
            if (stolen > 0) {
              const g = Math.min(run.gold, 15);
              run.gold -= g;
              m.misc.gold = Number(m.misc.gold ?? 0) + g;
            }
          } else if (mv === 2) monsterApi.fx.gainBlock(run, m, 6);
          else {
            m.escaped = true;
            m.alive = false;
            monsterApi.fx.log(run, "掠夺者逃走了", "Looter escaped");
          }
          break;
        }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const swipe = monsterApi.asc(run, 2) ? 11 : 10;
          const lunge = monsterApi.asc(run, 2) ? 14 : 12;
          const t = Number(m.misc.looterTurn ?? 0);
          if (t === 0) monsterApi.setMove(m, 1, "attack", swipe);
          else if (t === 1) {
            if (r.randomBoolean()) monsterApi.setMove(m, 4, "attack", lunge);
            else monsterApi.setMove(m, 1, "attack", swipe);
          } else if (t === 2) monsterApi.setMove(m, 2, "defend"); // smoke
          else monsterApi.setMove(m, 3, "escape");
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class Lagavulin {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 5) {
            m.misc.idleCount = Number(m.misc.idleCount ?? 0) + 1;
            if (Number(m.misc.idleCount) >= 3) {
              // 3 回合未受伤害自行苏醒（wiki/Lagavulin）
              m.misc.asleep = 0;
              m.powers = m.powers.filter((p) => p.id !== "Metallicize");
              monsterApi.setMove(m, 3, "attack", monsterApi.asc(run, 3) ? 20 : 18);
              m.misc.skipRoll = 1;
            }
          } else if (mv === 6) {
            /* 受击唤醒后的眩晕回合：不行动 */
          } else if (mv === 3) {
            monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 3) ? 20 : 18);
          } else if (mv === 1) {
            monsterApi.fx.addPower(player, "Dexterity", -1, true);
            monsterApi.fx.addPower(player, "Strength", -1, true);
          }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const atk = monsterApi.asc(run, 3) ? 20 : 18;
          if (m.misc.asleep) {
            monsterApi.setMove(m, 5, "sleep");
          } else if (monsterApi.lastTwo(m, 3)) {
            monsterApi.setMove(m, 1, "strong_debuff");
          } else {
            monsterApi.setMove(m, 3, "attack", atk);
          }
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class Sentry {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 4) monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 3) ? 10 : 9);
          else monsterApi.addDazed(run, 2);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const beam = monsterApi.asc(run, 3) ? 10 : 9;
          if (!m.misc.didFirst) {
            m.misc.didFirst = 1;
            // middle sentry starts with beam
            monsterApi.setMove(m, m.misc.boltFirst ? 4 : 3, m.misc.boltFirst ? "attack" : "debuff", m.misc.boltFirst ? beam : undefined);
          } else if (monsterApi.lastMove(m, 3)) monsterApi.setMove(m, 4, "attack", beam);
          else monsterApi.setMove(m, 3, "debuff");
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class GremlinWarrior {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 5 : 4);
          monsterApi.fx.addPower(m, "Angry", 1);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    monsterApi.setMove(m, 1, "attack", monsterApi.asc(run, 2) ? 5 : 4);
    }
    monsterApi.saveAi(run, r);
  }
}
export class GremlinThief {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 10 : 9);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    monsterApi.setMove(m, 1, "attack", monsterApi.asc(run, 2) ? 10 : 9);
    }
    monsterApi.saveAi(run, r);
  }
}
export class GremlinFat {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 5 : 4);
          if (mv === 2) monsterApi.fx.addPower(player, "Weakened", 1, true);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    if (num < 33) monsterApi.setMove(m, 2, "attack_debuff", monsterApi.asc(run, 2) ? 5 : 4);
          else monsterApi.setMove(m, 1, "attack", monsterApi.asc(run, 2) ? 5 : 4);
    }
    monsterApi.saveAi(run, r);
  }
}
export class GremlinTsundere {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 2) monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 8 : 6);
          else monsterApi.fx.gainBlock(run, m, 7);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    if (num < 33 && !monsterApi.lastTwo(m, 2)) monsterApi.setMove(m, 2, "attack", monsterApi.asc(run, 2) ? 8 : 6);
          else monsterApi.setMove(m, 1, "defend");
    }
    monsterApi.saveAi(run, r);
  }
}
export class GremlinWizard {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 1) monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 2) ? 30 : 25);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const charge = Number(m.misc.charge ?? 0);
          if (charge < 2) {
            m.misc.charge = charge + 1;
            monsterApi.setMove(m, 2, "unknown");
          } else {
            m.misc.charge = 0;
            monsterApi.setMove(m, 1, "attack", monsterApi.asc(run, 2) ? 30 : 25);
          }
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class TheGuardian {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    {
          const bash = monsterApi.asc(run, 4) ? 36 : 32;
          const roll = monsterApi.asc(run, 4) ? 10 : 9;
          if (mv === 1) {
            monsterApi.fx.addPower(m, "Sharp Hide", monsterApi.asc(run, 19) ? 4 : 3);
            monsterApi.setMove(m, 3, "attack", roll);
          } else if (mv === 3) {
            monsterApi.fx.dealDamage(run, m, player, roll);
            monsterApi.setMove(m, 4, "attack_buff", 8, 2);
          } else if (mv === 4) {
            monsterApi.fx.dealDamage(run, m, player, 8);
            monsterApi.fx.dealDamage(run, m, player, 8);
            m.misc.guardianOpen = 1;
            m.powers = m.powers.filter((p) => p.id !== "Sharp Hide");
            monsterApi.fx.addPower(m, "Mode Shift", Number(m.misc.guardianThreshold ?? 30));
            monsterApi.setMove(m, 5, "attack", 5, 4);
          } else if (mv === 6) {
            monsterApi.fx.gainBlock(run, m, 9);
            monsterApi.setMove(m, 2, "attack", bash);
          } else if (mv === 2) {
            monsterApi.fx.dealDamage(run, m, player, bash);
            monsterApi.setMove(m, 7, "strong_debuff");
          } else if (mv === 7) {
            monsterApi.fx.addPower(player, "Weakened", 2, true);
            monsterApi.fx.addPower(player, "Vulnerable", 2, true);
            monsterApi.setMove(m, 5, "attack", 5, 4);
          } else if (mv === 5) {
            for (let i = 0; i < 4; i++) monsterApi.fx.dealDamage(run, m, player, 5);
            monsterApi.setMove(m, 6, "defend");
          }
          m.misc.skipRoll = 1;
          break;
        }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const roll = monsterApi.asc(run, 4) ? 10 : 9;
          if (m.misc.guardianOpen) monsterApi.setMove(m, 6, "defend");
          else monsterApi.setMove(m, 3, "attack", roll);
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class Hexaghost {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    {
          const step = Number(m.misc.hexa ?? 0);
          if (mv === 1) {
            const per = Math.floor(run.player.hp / 12) + 1;
            for (let i = 0; i < 6; i++) monsterApi.fx.dealDamage(run, m, player, per);
          } else if (mv === 4) {
            monsterApi.fx.dealDamage(run, m, player, 6);
            run.combat!.discard.push(monsterApi.fx.makeCard(run, "Burn"));
          } else if (mv === 2) {
            monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 4) ? 6 : 5);
            monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 4) ? 6 : 5);
          } else if (mv === 3) {
            for (let i = 0; i < 6; i++) monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 4) ? 3 : 2);
            run.combat!.discard.push(monsterApi.fx.makeCard(run, "Burn"));
            run.combat!.discard.push(monsterApi.fx.makeCard(run, "Burn"));
            run.combat!.discard.push(monsterApi.fx.makeCard(run, "Burn"));
          }
          m.misc.hexa = step >= 6 ? 1 : step + 1;
          break;
        }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const step = Number(m.misc.hexa ?? 0);
          const sear = 6;
          const tackle = monsterApi.asc(run, 4) ? 6 : 5;
          const inferno = monsterApi.asc(run, 4) ? 3 : 2;
          if (step === 0) {
            const per = Math.floor(run.player.hp / 12) + 1;
            monsterApi.setMove(m, 1, "attack", per, 6);
          } else if (step === 1 || step === 3 || step === 5) monsterApi.setMove(m, 4, "attack_debuff", sear);
          else if (step === 2 || step === 4) monsterApi.setMove(m, 2, "attack", tackle, 2);
          else if (step === 6) monsterApi.setMove(m, 3, "attack", inferno, 6);
          else monsterApi.setMove(m, 5, "buff");
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class SlimeBoss {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 3) monsterApi.fx.dealDamage(run, m, m, m.hp, { hpLoss: true });
          else if (mv === 4) monsterApi.addSlimed(run, 3);
          else if (mv === 2) monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 4) ? 38 : 35);
          else monsterApi.fx.dealDamage(run, m, player, monsterApi.asc(run, 4) ? 10 : 9);
          m.misc.slimeTurn = Number(m.misc.slimeTurn ?? 0) + 1;
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const tackle = monsterApi.asc(run, 4) ? 10 : 9;
          const slam = monsterApi.asc(run, 4) ? 38 : 35;
          if (m.hp * 2 <= m.maxHp) {
            monsterApi.setMove(m, 3, "unknown");
            break;
          }
          const t = Number(m.misc.slimeTurn ?? 0) % 3;
          if (t === 0) monsterApi.setMove(m, 4, "debuff"); // goo spray
          else if (t === 1) monsterApi.setMove(m, 2, "attack", slam);
          else monsterApi.setMove(m, 1, "attack", tackle);
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class SpireShield {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    {
          m.misc.turn = Number(m.misc.turn ?? 0) + 1;
          const dmg = m.intentDamage ?? 12;
          if (mv === 1) {
            monsterApi.fx.dealDamage(run, m, player, dmg);
            if ((run.combat?.orbSlots ?? 0) > 0 && monsterApi.bool(run)) monsterApi.fx.addPower(player, "Focus", -1, true);
            else monsterApi.fx.addPower(player, "Strength", -1, true);
          } else if (mv === 2) {
            for (const e of run.combat!.monsters) if (e.alive) monsterApi.fx.gainBlock(run, e, 30);
          } else if (mv === 3) {
            monsterApi.fx.dealDamage(run, m, player, dmg);
            monsterApi.fx.gainBlock(run, m, monsterApi.asc(run, 18) ? 99 : dmg);
          }
          break;
        }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const turn = Number(m.misc.turn ?? 0) + 1;
          const smash = monsterApi.asc(run, 3) ? 38 : 34;
          if (turn >= 3 && turn % 3 === 0) {
            monsterApi.setMove(m, 3, "attack_defend", smash);
            break;
          }
          const bash = monsterApi.asc(run, 3) ? 14 : 12;
          if (monsterApi.lastMove(m, 1)) monsterApi.setMove(m, 2, "defend");
          else if (monsterApi.lastMove(m, 2)) monsterApi.setMove(m, 1, "attack_debuff", bash);
          else if (r.randomBoolean()) monsterApi.setMove(m, 1, "attack_debuff", bash);
          else monsterApi.setMove(m, 2, "defend");
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class SpireSpear {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    {
          m.misc.turn = Number(m.misc.turn ?? 0) + 1;
          const dmg = m.intentDamage ?? 5;
          if (mv === 1) {
            for (let i = 0; i < (m.intentHits ?? 2); i++) monsterApi.fx.dealDamage(run, m, player, dmg);
            for (let i = 0; i < 2; i++) {
              if (monsterApi.asc(run, 18)) run.combat!.draw.unshift(monsterApi.fx.makeCard(run, "Burn"));
              else run.combat!.discard.push(monsterApi.fx.makeCard(run, "Burn"));
            }
          } else if (mv === 2) {
            for (let i = 0; i < (m.intentHits ?? 3); i++) monsterApi.fx.dealDamage(run, m, player, dmg);
          } else {
            for (const e of run.combat!.monsters) if (e.alive) monsterApi.fx.addPower(e, "Strength", 2);
          }
          break;
        }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const turn = Number(m.misc.turn ?? 0) + 1;
          const burn = monsterApi.asc(run, 3) ? 6 : 5;
          if (turn === 1) {
            monsterApi.setMove(m, 1, "attack_debuff", burn, 2);
            break;
          }
          if (turn >= 2 && turn % 3 === 2) {
            monsterApi.setMove(m, 2, "attack", 10, monsterApi.asc(run, 3) ? 4 : 3);
            break;
          }
          if (monsterApi.lastMove(m, 1)) monsterApi.setMove(m, 3, "buff");
          else if (monsterApi.lastMove(m, 3)) monsterApi.setMove(m, 1, "attack_debuff", burn, 2);
          else if (r.randomBoolean()) monsterApi.setMove(m, 1, "attack_debuff", burn, 2);
          else monsterApi.setMove(m, 3, "buff");
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class CorruptHeart {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    {
          m.misc.turn = Number(m.misc.turn ?? 0) + 1;
          const dmg = m.intentDamage ?? 12;
          if (mv === 1) {
            monsterApi.fx.addPower(player, "Vulnerable", 2, true);
            monsterApi.fx.addPower(player, "Weakened", 2, true);
            monsterApi.fx.addPower(player, "Frail", 2, true);
            for (const sid of ["Burn", "Dazed", "Slimed", "Void", "Wound"]) {
              run.combat!.draw.push(monsterApi.fx.makeCard(run, sid));
            }
          } else if (mv === 2) {
            for (let i = 0; i < (m.intentHits ?? 2); i++) monsterApi.fx.dealDamage(run, m, player, dmg);
          } else if (mv === 3) {
            monsterApi.fx.dealDamage(run, m, player, dmg);
          } else if (mv === 4) {
            const str = m.powers.find((p) => p.id === "Strength");
            if (str && str.amount < 0) m.powers = m.powers.filter((p) => p.id !== "Strength");
            monsterApi.fx.addPower(m, "Strength", 2);
            m.misc.buffCount = Number(m.misc.buffCount ?? 0) + 1;
            const step = m.misc.buffCount;
            if (step === 1) monsterApi.fx.addPower(m, "Artifact", 2);
            else if (step === 2) monsterApi.fx.addPower(m, "BeatOfDeath", 1);
            else if (step === 3) monsterApi.fx.addPower(m, "Painful Stabs", 1);
            else if (step === 4) monsterApi.fx.addPower(m, "Strength", 10);
            else monsterApi.fx.addPower(m, "Strength", 50);
          }
          break;
        }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const turn = Number(m.misc.turn ?? 0) + 1;
          if (turn === 1) {
            monsterApi.setMove(m, 1, "strong_debuff");
            break;
          }
          if (turn >= 4 && turn % 3 === 1) {
            monsterApi.setMove(m, 4, "buff");
            break;
          }
          const shots = monsterApi.asc(run, 4) ? 15 : 12;
          const echo = monsterApi.asc(run, 4) ? 45 : 40;
          if (monsterApi.lastMove(m, 2)) monsterApi.setMove(m, 3, "attack", echo);
          else if (monsterApi.lastMove(m, 3)) monsterApi.setMove(m, 2, "attack", shots, 2);
          else if (r.randomBoolean()) monsterApi.setMove(m, 2, "attack", shots, 2);
          else monsterApi.setMove(m, 3, "attack", echo);
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class Champ {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    {
          const slash = monsterApi.dmgOf(run, m, "slash", 16, 18, 18);
          const slap = monsterApi.dmgOf(run, m, "slap", 12, 14, 14);
          const str = monsterApi.asc(run, 19) ? 4 : monsterApi.asc(run, 4) ? 3 : 2;
          const forge = monsterApi.asc(run, 19) ? 7 : monsterApi.asc(run, 9) ? 6 : 5;
          const blk = monsterApi.asc(run, 19) ? 20 : monsterApi.asc(run, 9) ? 18 : 15;
          if (mv === 7) {
            m.powers = m.powers.filter((p) => !["Vulnerable", "Weakened", "Frail"].includes(p.id));
            monsterApi.fx.addPower(m, "Strength", str * 3);
          } else if (mv === 1) monsterApi.fx.dealDamage(run, m, player, slash);
          else if (mv === 2) {
            monsterApi.fx.gainBlock(run, m, blk);
            monsterApi.fx.addPower(m, "Metallicize", forge);
          } else if (mv === 3) {
            monsterApi.fx.dealDamage(run, m, player, 10);
            monsterApi.fx.dealDamage(run, m, player, 10);
          } else if (mv === 4) {
            monsterApi.fx.dealDamage(run, m, player, slap);
            monsterApi.fx.addPower(player, "Frail", 2, true);
            monsterApi.fx.addPower(player, "Vulnerable", 2, true);
          } else if (mv === 5) monsterApi.fx.addPower(m, "Strength", str);
          else if (mv === 6) {
            monsterApi.fx.addPower(player, "Weakened", 2, true);
            monsterApi.fx.addPower(player, "Vulnerable", 2, true);
          }
          break;
        }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          m.misc.numTurns = Number(m.misc.numTurns ?? 0) + 1;
          const slash = monsterApi.dmgOf(run, m, "slash", 16, 18, 18);
          const slap = monsterApi.dmgOf(run, m, "slap", 12, 14, 14);
          const exec = 10;
          if (m.hp < m.maxHp / 2 && !m.misc.threshold) {
            m.misc.threshold = 1;
            monsterApi.setMove(m, 7, "buff");
            break;
          }
          if (m.misc.threshold && !monsterApi.lastMove(m, 3) && m.lastMoves[1] !== 3) {
            monsterApi.setMove(m, 3, "attack", exec, 2);
            break;
          }
          if (m.misc.numTurns === 4 && !m.misc.threshold) {
            monsterApi.setMove(m, 6, "debuff");
            m.misc.numTurns = 0;
            break;
          }
          const forgeChance = monsterApi.asc(run, 19) ? 30 : 15;
          if (!monsterApi.lastMove(m, 2) && Number(m.misc.forgeTimes ?? 0) < 2 && num <= forgeChance) {
            m.misc.forgeTimes = Number(m.misc.forgeTimes ?? 0) + 1;
            monsterApi.setMove(m, 2, "defend_buff");
            break;
          }
          if (!monsterApi.lastMove(m, 5) && !monsterApi.lastMove(m, 2) && num <= 30) {
            monsterApi.setMove(m, 5, "buff");
            break;
          }
          if (!monsterApi.lastMove(m, 4) && num <= 55) monsterApi.setMove(m, 4, "attack_debuff", slap);
          else if (!monsterApi.lastMove(m, 1)) monsterApi.setMove(m, 1, "attack", slash);
          else monsterApi.setMove(m, 4, "attack_debuff", slap);
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class BronzeAutomaton {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    {
          const flail = monsterApi.dmgOf(run, m, "flail", 7, 8, 8);
          const beam = monsterApi.dmgOf(run, m, "beam", 45, 50, 55);
          if (mv === 4) {
            if (run.combat) {
              run.combat.monsters.push(monsterApi.createMonster(run, "BronzeOrb"));
              run.combat.monsters.push(monsterApi.createMonster(run, "BronzeOrb"));
            }
          } else if (mv === 1) {
            monsterApi.fx.dealDamage(run, m, player, flail);
            monsterApi.fx.dealDamage(run, m, player, flail);
          } else if (mv === 5) {
            monsterApi.fx.gainBlock(run, m, monsterApi.asc(run, 9) ? 12 : 9);
            monsterApi.fx.addPower(m, "Strength", monsterApi.asc(run, 4) ? 4 : 3);
          } else if (mv === 2) monsterApi.fx.dealDamage(run, m, player, beam);
          break;
        }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const flail = monsterApi.dmgOf(run, m, "flail", 7, 8, 8);
          const beam = monsterApi.dmgOf(run, m, "beam", 45, 50, 55);
          if (!m.misc.didFirst) {
            m.misc.didFirst = 1;
            monsterApi.setMove(m, 4, "unknown");
            break;
          }
          m.misc.numTurns = Number(m.misc.numTurns ?? 0);
          if (m.misc.numTurns === 4) {
            monsterApi.setMove(m, 2, "attack", beam);
            m.misc.numTurns = 0;
            break;
          }
          if (monsterApi.lastMove(m, 2)) {
            monsterApi.setMove(m, monsterApi.asc(run, 19) ? 5 : 3, monsterApi.asc(run, 19) ? "defend_buff" : "stun");
            break;
          }
          if (monsterApi.lastMove(m, 3) || monsterApi.lastMove(m, 5) || monsterApi.lastMove(m, 4)) monsterApi.setMove(m, 1, "attack", flail, 2);
          else monsterApi.setMove(m, 5, "defend_buff");
          m.misc.numTurns = Number(m.misc.numTurns) + 1;
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class Donu {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 0) {
            const d = monsterApi.dmgOf(run, m, "d", 10, 12, 12);
            monsterApi.fx.dealDamage(run, m, player, d);
            monsterApi.fx.dealDamage(run, m, player, d);
            m.misc.isAttacking = 0;
          } else {
            for (const ally of run.combat?.monsters.filter((x) => x.alive) ?? []) monsterApi.fx.addPower(ally, "Strength", 3);
            m.misc.isAttacking = 1;
          }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    if (m.misc.isAttacking) monsterApi.setMove(m, 0, "attack", monsterApi.dmgOf(run, m, "d", 10, 12, 12), 2);
          else monsterApi.setMove(m, 2, "buff");
    }
    monsterApi.saveAi(run, r);
  }
}
export class Deca {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 0) {
            const d = monsterApi.dmgOf(run, m, "d", 10, 12, 12);
            monsterApi.fx.dealDamage(run, m, player, d);
            monsterApi.fx.dealDamage(run, m, player, d);
            monsterApi.addDazed(run, 2);
            m.misc.isAttacking = 0;
          } else {
            for (const ally of run.combat?.monsters.filter((x) => x.alive) ?? []) {
              monsterApi.fx.gainBlock(run, ally, 16);
              if (monsterApi.asc(run, 19)) monsterApi.fx.addPower(ally, "Plated Armor", 3);
            }
            m.misc.isAttacking = 1;
          }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    if (m.misc.isAttacking) monsterApi.setMove(m, 0, "attack_debuff", monsterApi.dmgOf(run, m, "d", 10, 12, 12), 2);
          else monsterApi.setMove(m, 2, monsterApi.asc(run, 19) ? "defend_buff" : "defend");
    }
    monsterApi.saveAi(run, r);
  }
}
export class AwakenedOne {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    if (mv === 1) monsterApi.fx.dealDamage(run, m, player, 20);
          else if (mv === 2) for (let i = 0; i < 4; i++) monsterApi.fx.dealDamage(run, m, player, 6);
          else if (mv === 3) {
            m.misc.form2 = 1;
            m.misc.didFirst = 0;
            m.alive = true;
            m.maxHp = monsterApi.asc(run, 9) ? 320 : 300;
            m.hp = m.maxHp;
            m.powers = m.powers.filter((p) => p.id !== "Unawakened");
          } else if (mv === 5) monsterApi.fx.dealDamage(run, m, player, 40);
          else if (mv === 6) {
            monsterApi.fx.dealDamage(run, m, player, 18);
            run.combat?.draw.unshift(monsterApi.fx.makeCard(run, "Void"));
          } else if (mv === 8) for (let i = 0; i < 3; i++) monsterApi.fx.dealDamage(run, m, player, 10);
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          if (!m.misc.form2) {
            if (!m.misc.didFirst) {
              m.misc.didFirst = 1;
              monsterApi.setMove(m, 1, "attack", 20);
              break;
            }
            if (num < 25) {
              if (!monsterApi.lastMove(m, 2)) monsterApi.setMove(m, 2, "attack", 6, 4);
              else monsterApi.setMove(m, 1, "attack", 20);
            } else if (!monsterApi.lastTwo(m, 1)) monsterApi.setMove(m, 1, "attack", 20);
            else monsterApi.setMove(m, 2, "attack", 6, 4);
          } else {
            if (!m.misc.echo) {
              m.misc.echo = 1;
              monsterApi.setMove(m, 5, "attack", 40);
              break;
            }
            if (num < 50) {
              if (!monsterApi.lastTwo(m, 6)) monsterApi.setMove(m, 6, "attack_debuff", 18);
              else monsterApi.setMove(m, 8, "attack", 10, 3);
            } else if (!monsterApi.lastTwo(m, 8)) monsterApi.setMove(m, 8, "attack", 10, 3);
            else monsterApi.setMove(m, 6, "attack_debuff", 18);
          }
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export class TimeEater {
  constructor() {}
  takeTurn(run: RunState, m: Creature): void {
    const mv = m.nextMove;
    const player = run.player;
    switch (0) { default:
    {
          const reverb = monsterApi.dmgOf(run, m, "rev", 7, 8, 8);
          const slam = monsterApi.dmgOf(run, m, "slam", 26, 32, 32);
          if (mv === 2) for (let i = 0; i < 3; i++) monsterApi.fx.dealDamage(run, m, player, reverb);
          else if (mv === 3) {
            monsterApi.fx.gainBlock(run, m, 20);
            monsterApi.fx.addPower(player, "Vulnerable", 1, true);
            monsterApi.fx.addPower(player, "Weakened", 1, true);
            if (monsterApi.asc(run, 19)) monsterApi.fx.addPower(player, "Frail", 1, true);
          } else if (mv === 4) {
            monsterApi.fx.dealDamage(run, m, player, slam);
            if (monsterApi.asc(run, 19)) monsterApi.addSlimed(run, 2);
          } else if (mv === 5) {
            m.powers = m.powers.filter((p) => !["Vulnerable", "Weakened", "Frail"].includes(p.id));
            m.hp = Math.floor(m.maxHp / 2);
            if (monsterApi.asc(run, 19)) monsterApi.fx.gainBlock(run, m, slam);
          }
          break;
        }
    }
  }
  getMove(run: RunState, m: Creature, num: number): void {
    const r = monsterApi.ai(run);
    switch (0) { default:
    {
          const reverb = monsterApi.dmgOf(run, m, "rev", 7, 8, 8);
          const slam = monsterApi.dmgOf(run, m, "slam", 26, 32, 32);
          if (m.hp < m.maxHp / 2 && !m.misc.haste) {
            m.misc.haste = 1;
            monsterApi.setMove(m, 5, "buff");
            break;
          }
          let n = num;
          for (let guard = 0; guard < 6; guard++) {
            if (n < 45) {
              if (!monsterApi.lastTwo(m, 2)) {
                monsterApi.setMove(m, 2, "attack", reverb, 3);
                break;
              }
              n = r.randomRange(50, 99);
              continue;
            }
            if (n < 80) {
              if (!monsterApi.lastMove(m, 4)) monsterApi.setMove(m, 4, "attack_debuff", slam);
              else if (r.randomChance(0.66)) monsterApi.setMove(m, 2, "attack", reverb, 3);
              else monsterApi.setMove(m, 3, "defend_debuff");
              break;
            }
            if (!monsterApi.lastMove(m, 3)) {
              monsterApi.setMove(m, 3, "defend_debuff");
              break;
            }
            n = r.random(74);
          }
          break;
        }
    }
    monsterApi.saveAi(run, r);
  }
}
export const MONSTER_CLASSES = {
  "JawWorm": JawWorm,
  "Cultist": Cultist,
  "AcidSlime_S": AcidSlime_S,
  "SpikeSlime_S": SpikeSlime_S,
  "AcidSlime_M": AcidSlime_M,
  "SpikeSlime_M": SpikeSlime_M,
  "AcidSlime_L": AcidSlime_L,
  "SpikeSlime_L": SpikeSlime_L,
  "FungiBeast": FungiBeast,
  "SlaverBlue": SlaverBlue,
  "SlaverRed": SlaverRed,
  "Looter": Looter,
  "Lagavulin": Lagavulin,
  "Sentry": Sentry,
  "GremlinWarrior": GremlinWarrior,
  "GremlinThief": GremlinThief,
  "GremlinFat": GremlinFat,
  "GremlinTsundere": GremlinTsundere,
  "GremlinWizard": GremlinWizard,
  "TheGuardian": TheGuardian,
  "Hexaghost": Hexaghost,
  "SlimeBoss": SlimeBoss,
  "SpireShield": SpireShield,
  "SpireSpear": SpireSpear,
  "CorruptHeart": CorruptHeart,
  "Champ": Champ,
  "BronzeAutomaton": BronzeAutomaton,
  "Donu": Donu,
  "Deca": Deca,
  "AwakenedOne": AwakenedOne,
  "TimeEater": TimeEater,
} as unknown as Record<string, new () => { takeTurn: (run: RunState, m: Creature) => void; getMove?: (run: RunState, m: Creature, num: number) => void }>;