/**
 * Act 1 monster constructors + getMove/takeTurn, ported from
 * com.megacrit.cardcrawl.monsters.exordium.* and MonsterHelper.getEncounter.
 */
import { ENCOUNTERS, hpBand, monsterDef } from "./catalog.js";
import { StsRandom } from "./rng.js";
import type { CardInst, Creature, Intent, RunState } from "./types.js";

/** Filled by combat.ts after load to avoid a circular import. */
export let fx: {
  addPower: (who: Creature, id: string, amount: number, fromMonster?: boolean) => void;
  dealDamage: (
    run: RunState,
    attacker: Creature,
    target: Creature,
    base: number,
    opts?: { hpLoss?: boolean; vampire?: boolean },
  ) => number;
  gainBlock: (run: RunState, who: Creature, base: number) => void;
  makeCard: (run: RunState, defId: string, upgraded?: boolean) => CardInst;
  log: (run: RunState, zhs: string, eng: string) => void;
};

export function bindCombat(b: typeof fx): void {
  fx = b;
}

function ai(run: RunState): StsRandom {
  return StsRandom.fromState(run.rng.ai!);
}
function saveAi(run: RunState, r: StsRandom): void {
  run.rng.ai = r.toState();
}
function misc(run: RunState): StsRandom {
  return StsRandom.fromState(run.rng.misc!);
}
function saveMisc(run: RunState, r: StsRandom): void {
  run.rng.misc = r.toState();
}
function hpRng(run: RunState): StsRandom {
  return StsRandom.fromState(run.rng.monsterHp!);
}
function saveHp(run: RunState, r: StsRandom): void {
  run.rng.monsterHp = r.toState();
}

function lastMove(m: Creature, mv: number): boolean {
  return m.lastMoves[0] === mv;
}
function lastTwo(m: Creature, mv: number): boolean {
  return m.lastMoves[0] === mv && m.lastMoves[1] === mv;
}
function setMove(m: Creature, mv: number, intent: Intent, dmg?: number, hits = 1): void {
  m.nextMove = mv;
  m.intent = intent;
  m.intentDamage = dmg;
  m.intentHits = hits;
}
function commitMove(m: Creature): void {
  if (m.nextMove !== undefined) m.lastMoves = [m.nextMove, ...(m.lastMoves ?? [])].slice(0, 4);
}

function asc(run: RunState, n: number): boolean {
  return run.ascension >= n;
}

let mid = 0;
export function createMonster(run: RunState, id: string): Creature {
  const def = monsterDef(id);
  const band = hpBand(def, run.ascension);
  const r = hpRng(run);
  const hp = band.min === band.max ? band.min : r.randomRange(band.min, band.max);
  saveHp(run, r);
  mid += 1;
  const c: Creature = {
    id: `m${mid}`,
    name: def.name,
    isPlayer: false,
    hp,
    maxHp: hp,
    block: 0,
    powers: [],
    monsterId: id,
    lastMoves: [],
    alive: true,
    misc: {},
  };
  // per-monster damage rolls
  if (id === "FuzzyLouseNormal" || id === "FuzzyLouseDefensive") {
    c.misc.bite = asc(run, 2) ? r.randomRange(6, 8) : r.randomRange(5, 7);
    saveHp(run, r);
  }
  if (id === "AcidSlime_L" || id === "SpikeSlime_L" || id === "SlimeBoss") c.misc.split = 1;
  return c;
}

function dmgOf(run: RunState, m: Creature, key: string, a0: number, a2?: number, a17?: number): number {
  if (asc(run, 17) && a17 !== undefined) return a17;
  if (asc(run, 2) && a2 !== undefined) return a2;
  void key;
  void m;
  return a0;
}

export function pickMove(run: RunState, m: Creature, num: number): void {
  const id = m.monsterId!;
  const r = ai(run);
  switch (id) {
    case "JawWorm": {
      const chomp = dmgOf(run, m, "chomp", 11, 12, 12);
      const thrash = 7;
      if (!m.misc.didFirst) {
        m.misc.didFirst = 1;
        setMove(m, 1, "attack", chomp);
        break;
      }
      if (num < 25) {
        if (lastMove(m, 1)) {
          if (r.randomChance(0.5625)) setMove(m, 2, "defend_buff");
          else setMove(m, 3, "attack_defend", thrash);
        } else setMove(m, 1, "attack", chomp);
      } else if (num < 55) {
        if (lastTwo(m, 3)) {
          if (r.randomChance(0.357)) setMove(m, 1, "attack", chomp);
          else setMove(m, 2, "defend_buff");
        } else setMove(m, 3, "attack_defend", thrash);
      } else if (lastMove(m, 2)) {
        if (r.randomChance(0.416)) setMove(m, 1, "attack", chomp);
        else setMove(m, 3, "attack_defend", thrash);
      } else setMove(m, 2, "defend_buff");
      break;
    }
    case "Cultist":
      if (!m.misc.didFirst) {
        m.misc.didFirst = 1;
        setMove(m, 3, "buff");
      } else setMove(m, 1, "attack", 6);
      break;
    case "FuzzyLouseNormal":
    case "FuzzyLouseDefensive": {
      const bite = Number(m.misc.bite ?? 6);
      if (num < 25) setMove(m, 4, id === "FuzzyLouseDefensive" ? "defend" : "buff"); // grow / curl already a power
      else setMove(m, 3, "attack", bite);
      break;
    }
    case "AcidSlime_S":
      setMove(m, 1, "attack", asc(run, 2) ? 4 : 3);
      break;
    case "SpikeSlime_S":
      setMove(m, 1, "attack", asc(run, 2) ? 6 : 5);
      break;
    case "AcidSlime_M": {
      if (m.hp * 2 <= m.maxHp) {
        setMove(m, 3, "unknown"); // split unused for M in some patches; M does not split
      }
      const spit = asc(run, 2) ? 8 : 7;
      if (num < 40) {
        if (lastTwo(m, 1)) setMove(m, 4, "debuff");
        else setMove(m, 1, "attack_debuff", spit);
      } else if (lastMove(m, 4)) setMove(m, 1, "attack_debuff", spit);
      else setMove(m, 4, "debuff");
      break;
    }
    case "SpikeSlime_M": {
      const d = asc(run, 2) ? 10 : 8;
      if (num < 30 && !lastTwo(m, 1)) setMove(m, 1, "attack_debuff", d);
      else if (lastMove(m, 4)) setMove(m, 1, "attack_debuff", d);
      else setMove(m, 4, "debuff");
      break;
    }
    case "AcidSlime_L": {
      if (m.hp * 2 <= m.maxHp) {
        setMove(m, 3, "unknown");
        break;
      }
      const spit = asc(run, 2) ? 12 : 11;
      const tackle = asc(run, 2) ? 18 : 16;
      if (num < 30) {
        if (lastTwo(m, 1)) {
          if (r.randomBoolean()) setMove(m, 2, "attack", tackle);
          else setMove(m, 4, "debuff");
        } else setMove(m, 1, "attack_debuff", spit);
      } else if (num < 70) {
        if (lastMove(m, 2)) {
          if (r.randomChance(0.4)) setMove(m, 1, "attack_debuff", spit);
          else setMove(m, 4, "debuff");
        } else setMove(m, 2, "attack", tackle);
      } else if (lastTwo(m, 4)) {
        if (r.randomChance(0.4)) setMove(m, 1, "attack_debuff", spit);
        else setMove(m, 2, "attack", tackle);
      } else setMove(m, 4, "debuff");
      break;
    }
    case "SpikeSlime_L": {
      if (m.hp * 2 <= m.maxHp) {
        setMove(m, 3, "unknown");
        break;
      }
      const d = asc(run, 2) ? 18 : 16;
      if (num < 30) {
        if (lastTwo(m, 1)) setMove(m, 4, "debuff");
        else setMove(m, 1, "attack_debuff", d);
      } else if (lastTwo(m, 4)) setMove(m, 1, "attack_debuff", d);
      else setMove(m, 4, "debuff");
      break;
    }
    case "FungiBeast": {
      const bite = 6;
      if (!m.misc.didFirst) {
        m.misc.didFirst = 1;
        setMove(m, 2, "buff"); // grow
      } else if (num < 60) setMove(m, 1, "attack", bite);
      else setMove(m, 2, "buff");
      break;
    }
    case "SlaverBlue": {
      const stab = asc(run, 2) ? 13 : 12;
      const rake = asc(run, 2) ? 8 : 7;
      if (num >= 40 && !lastTwo(m, 3)) setMove(m, 3, "attack_debuff", rake);
      else setMove(m, 1, "attack", stab);
      break;
    }
    case "SlaverRed": {
      const stab = asc(run, 2) ? 14 : 13;
      const scrape = asc(run, 2) ? 9 : 8;
      if (!m.misc.entangled && num >= 75) {
        m.misc.entangled = 1;
        setMove(m, 2, "strong_debuff");
      } else if (num >= 55 && !lastTwo(m, 3)) setMove(m, 3, "attack_debuff", scrape);
      else setMove(m, 1, "attack", stab);
      break;
    }
    case "Looter": {
      const swipe = asc(run, 2) ? 11 : 10;
      const lunge = asc(run, 2) ? 14 : 12;
      const t = Number(m.misc.looterTurn ?? 0);
      if (t === 0) setMove(m, 1, "attack", swipe);
      else if (t === 1) {
        if (r.randomBoolean()) setMove(m, 4, "attack", lunge);
        else setMove(m, 1, "attack", swipe);
      } else if (t === 2) setMove(m, 2, "defend"); // smoke
      else setMove(m, 3, "escape");
      break;
    }
    case "GremlinNob": {
      const rush = asc(run, 3) ? 16 : 14;
      const bash = asc(run, 3) ? 8 : 6;
      if (!m.misc.didFirst) {
        m.misc.didFirst = 1;
        setMove(m, 3, "buff");
      } else if (num < 33 && !lastMove(m, 2)) setMove(m, 2, "attack_debuff", bash);
      else if (lastTwo(m, 1)) setMove(m, 2, "attack_debuff", bash);
      else setMove(m, 1, "attack", rush);
      break;
    }
    case "Lagavulin": {
      const atk = asc(run, 3) ? 20 : 18;
      if (m.misc.asleep) {
        setMove(m, 5, "sleep");
      } else if (lastTwo(m, 3)) {
        setMove(m, 1, "strong_debuff");
      } else {
        setMove(m, 3, "attack", atk);
      }
      break;
    }
    case "Sentry": {
      const beam = asc(run, 3) ? 10 : 9;
      if (!m.misc.didFirst) {
        m.misc.didFirst = 1;
        // middle sentry starts with beam
        setMove(m, m.misc.boltFirst ? 4 : 3, m.misc.boltFirst ? "attack" : "debuff", m.misc.boltFirst ? beam : undefined);
      } else if (lastMove(m, 3)) setMove(m, 4, "attack", beam);
      else setMove(m, 3, "debuff");
      break;
    }
    case "GremlinWarrior":
      setMove(m, 1, "attack", asc(run, 2) ? 5 : 4);
      break;
    case "GremlinThief":
      setMove(m, 1, "attack", asc(run, 2) ? 10 : 9);
      break;
    case "GremlinFat":
      if (num < 33) setMove(m, 2, "attack_debuff", asc(run, 2) ? 5 : 4);
      else setMove(m, 1, "attack", asc(run, 2) ? 5 : 4);
      break;
    case "GremlinTsundere":
      if (num < 33 && !lastTwo(m, 2)) setMove(m, 2, "attack", asc(run, 2) ? 8 : 6);
      else setMove(m, 1, "defend");
      break;
    case "GremlinWizard": {
      const charge = Number(m.misc.charge ?? 0);
      if (charge < 2) {
        m.misc.charge = charge + 1;
        setMove(m, 2, "unknown");
      } else {
        m.misc.charge = 0;
        setMove(m, 1, "attack", asc(run, 2) ? 30 : 25);
      }
      break;
    }
    case "TheGuardian": {
      const roll = asc(run, 4) ? 10 : 9;
      if (m.misc.guardianOpen) setMove(m, 6, "defend");
      else setMove(m, 3, "attack", roll);
      break;
    }
    case "Hexaghost": {
      const step = Number(m.misc.hexa ?? 0);
      const sear = 6;
      const tackle = asc(run, 4) ? 6 : 5;
      const inferno = asc(run, 4) ? 3 : 2;
      if (step === 0) {
        const per = Math.floor(run.player.hp / 12) + 1;
        setMove(m, 1, "attack", per, 6);
      } else if (step === 1 || step === 3 || step === 5) setMove(m, 4, "attack_debuff", sear);
      else if (step === 2 || step === 4) setMove(m, 2, "attack", tackle, 2);
      else if (step === 6) setMove(m, 3, "attack", inferno, 6);
      else setMove(m, 5, "buff");
      break;
    }
    case "SlimeBoss": {
      const tackle = asc(run, 4) ? 10 : 9;
      const slam = asc(run, 4) ? 38 : 35;
      if (m.hp * 2 <= m.maxHp) {
        setMove(m, 3, "unknown");
        break;
      }
      const t = Number(m.misc.slimeTurn ?? 0) % 3;
      if (t === 0) setMove(m, 4, "debuff"); // goo spray
      else if (t === 1) setMove(m, 2, "attack", slam);
      else setMove(m, 1, "attack", tackle);
      break;
    }
    case "SpireShield": {
      const turn = Number(m.misc.turn ?? 0) + 1;
      const smash = asc(run, 3) ? 38 : 34;
      if (turn >= 3 && turn % 3 === 0) {
        setMove(m, 3, "attack_defend", smash);
        break;
      }
      const bash = asc(run, 3) ? 14 : 12;
      if (lastMove(m, 1)) setMove(m, 2, "defend");
      else if (lastMove(m, 2)) setMove(m, 1, "attack_debuff", bash);
      else if (r.randomBoolean()) setMove(m, 1, "attack_debuff", bash);
      else setMove(m, 2, "defend");
      break;
    }
    case "SpireSpear": {
      const turn = Number(m.misc.turn ?? 0) + 1;
      const burn = asc(run, 3) ? 6 : 5;
      if (turn === 1) {
        setMove(m, 1, "attack_debuff", burn, 2);
        break;
      }
      if (turn >= 2 && turn % 3 === 2) {
        setMove(m, 2, "attack", 10, asc(run, 3) ? 4 : 3);
        break;
      }
      if (lastMove(m, 1)) setMove(m, 3, "buff");
      else if (lastMove(m, 3)) setMove(m, 1, "attack_debuff", burn, 2);
      else if (r.randomBoolean()) setMove(m, 1, "attack_debuff", burn, 2);
      else setMove(m, 3, "buff");
      break;
    }
    case "CorruptHeart": {
      const turn = Number(m.misc.turn ?? 0) + 1;
      if (turn === 1) {
        setMove(m, 1, "strong_debuff");
        break;
      }
      if (turn >= 4 && turn % 3 === 1) {
        setMove(m, 4, "buff");
        break;
      }
      const shots = asc(run, 4) ? 15 : 12;
      const echo = asc(run, 4) ? 45 : 40;
      if (lastMove(m, 2)) setMove(m, 3, "attack", echo);
      else if (lastMove(m, 3)) setMove(m, 2, "attack", shots, 2);
      else if (r.randomBoolean()) setMove(m, 2, "attack", shots, 2);
      else setMove(m, 3, "attack", echo);
      break;
    }
    default: {
      const hp = m.maxHp;
      const hit = Math.max(6, Math.floor(hp / 12));
      if (num < 30) setMove(m, 2, "defend");
      else if (num < 45) setMove(m, 3, "buff");
      else setMove(m, 1, "attack", hit);
      break;
    }
  }
  saveAi(run, r);
}

function addSlimed(run: RunState, n: number): void {
  for (let i = 0; i < n; i++) run.combat!.discard.push(fx.makeCard(run, "Slimed"));
}
function addDazed(run: RunState, n: number): void {
  for (let i = 0; i < n; i++) run.combat!.discard.push(fx.makeCard(run, "Dazed"));
}

export function takeTurn(run: RunState, m: Creature): void {
  if (!m.alive || m.nextMove === undefined) return;
  const mv = m.nextMove;
  const player = run.player;
  const id = m.monsterId!;
  switch (id) {
    case "JawWorm":
      if (mv === 1) fx.dealDamage(run, m, player, dmgOf(run, m, "c", 11, 12, 12));
      else if (mv === 2) {
        fx.addPower(m, "Strength", dmgOf(run, m, "s", 3, 4, 5));
        fx.gainBlock(run, m, asc(run, 17) ? 9 : 6);
      } else if (mv === 3) {
        fx.dealDamage(run, m, player, 7);
        fx.gainBlock(run, m, 5);
      }
      break;
    case "Cultist":
      if (mv === 3) fx.addPower(m, "Ritual", asc(run, 2) ? 4 : 3);
      else fx.dealDamage(run, m, player, 6);
      break;
    case "FuzzyLouseNormal":
    case "FuzzyLouseDefensive":
      if (mv === 3) fx.dealDamage(run, m, player, Number(m.misc.bite ?? 6));
      else fx.addPower(m, "Strength", 3); // grow; defensive louse also uses this for simplicity
      break;
    case "AcidSlime_S":
      fx.dealDamage(run, m, player, asc(run, 2) ? 4 : 3);
      break;
    case "SpikeSlime_S":
      fx.dealDamage(run, m, player, asc(run, 2) ? 6 : 5);
      break;
    case "AcidSlime_M":
      if (mv === 1) {
        fx.dealDamage(run, m, player, asc(run, 2) ? 8 : 7);
        addSlimed(run, 1);
      } else fx.addPower(player, "Weakened", 1, true);
      break;
    case "SpikeSlime_M":
      if (mv === 1) {
        fx.dealDamage(run, m, player, asc(run, 2) ? 10 : 8);
        addSlimed(run, 1);
      } else fx.addPower(player, "Frail", 1, true);
      break;
    case "AcidSlime_L":
      if (mv === 3) m.misc.splitInto = "AcidSlime_M";
      else if (mv === 1) {
        fx.dealDamage(run, m, player, asc(run, 2) ? 12 : 11);
        addSlimed(run, 2);
      } else if (mv === 2) fx.dealDamage(run, m, player, asc(run, 2) ? 18 : 16);
      else fx.addPower(player, "Weakened", 2, true);
      break;
    case "SpikeSlime_L":
      if (mv === 3) m.misc.splitInto = "SpikeSlime_M";
      else if (mv === 1) {
        fx.dealDamage(run, m, player, asc(run, 2) ? 18 : 16);
        addSlimed(run, 2);
      } else fx.addPower(player, "Frail", 2, true);
      break;
    case "FungiBeast":
      if (mv === 1) fx.dealDamage(run, m, player, 6);
      else fx.addPower(m, "Strength", 3);
      break;
    case "SlaverBlue":
      if (mv === 1) fx.dealDamage(run, m, player, asc(run, 2) ? 13 : 12);
      else {
        fx.dealDamage(run, m, player, asc(run, 2) ? 8 : 7);
        fx.addPower(player, "Weakened", 1, true);
      }
      break;
    case "SlaverRed":
      if (mv === 1) fx.dealDamage(run, m, player, asc(run, 2) ? 14 : 13);
      else if (mv === 2) fx.addPower(player, "Entangled", 1, true);
      else {
        fx.dealDamage(run, m, player, asc(run, 2) ? 9 : 8);
        addSlimed(run, 1);
      }
      break;
    case "Looter": {
      m.misc.looterTurn = Number(m.misc.looterTurn ?? 0) + 1;
      if (mv === 1 || mv === 4) {
        const stolen = fx.dealDamage(run, m, player, mv === 4 ? (asc(run, 2) ? 14 : 12) : asc(run, 2) ? 11 : 10);
        m.misc.gold = Number(m.misc.gold ?? 0) + Math.min(15, stolen > 0 ? 15 : 0);
        if (stolen > 0) {
          const g = Math.min(run.gold, 15);
          run.gold -= g;
          m.misc.gold = Number(m.misc.gold ?? 0) + g;
        }
      } else if (mv === 2) fx.gainBlock(run, m, 6);
      else {
        m.escaped = true;
        m.alive = false;
        fx.log(run, "掠夺者逃走了", "Looter escaped");
      }
      break;
    }
    case "Lagavulin":
      if (mv === 5) {
        m.misc.idleCount = Number(m.misc.idleCount ?? 0) + 1;
        if (Number(m.misc.idleCount) >= 3) {
          // 3 回合未受伤害自行苏醒（wiki/Lagavulin）
          m.misc.asleep = 0;
          m.powers = m.powers.filter((p) => p.id !== "Metallicize");
          setMove(m, 3, "attack", asc(run, 3) ? 20 : 18);
          m.misc.skipRoll = 1;
        }
      } else if (mv === 6) {
        /* 受击唤醒后的眩晕回合：不行动 */
      } else if (mv === 3) {
        fx.dealDamage(run, m, player, asc(run, 3) ? 20 : 18);
      } else if (mv === 1) {
        fx.addPower(player, "Dexterity", -1, true);
        fx.addPower(player, "Strength", -1, true);
      }
      break;
    case "Sentry":
      if (mv === 4) fx.dealDamage(run, m, player, asc(run, 3) ? 10 : 9);
      else addDazed(run, 2);
      break;
    case "GremlinWarrior":
      fx.dealDamage(run, m, player, asc(run, 2) ? 5 : 4);
      fx.addPower(m, "Angry", 1);
      break;
    case "GremlinThief":
      fx.dealDamage(run, m, player, asc(run, 2) ? 10 : 9);
      break;
    case "GremlinFat":
      fx.dealDamage(run, m, player, asc(run, 2) ? 5 : 4);
      if (mv === 2) fx.addPower(player, "Weakened", 1, true);
      break;
    case "GremlinTsundere":
      if (mv === 2) fx.dealDamage(run, m, player, asc(run, 2) ? 8 : 6);
      else fx.gainBlock(run, m, 7);
      break;
    case "GremlinWizard":
      if (mv === 1) fx.dealDamage(run, m, player, asc(run, 2) ? 30 : 25);
      break;
    case "TheGuardian": {
      const bash = asc(run, 4) ? 36 : 32;
      const roll = asc(run, 4) ? 10 : 9;
      if (mv === 1) {
        fx.addPower(m, "Sharp Hide", asc(run, 19) ? 4 : 3);
        setMove(m, 3, "attack", roll);
      } else if (mv === 3) {
        fx.dealDamage(run, m, player, roll);
        setMove(m, 4, "attack_buff", 8, 2);
      } else if (mv === 4) {
        fx.dealDamage(run, m, player, 8);
        fx.dealDamage(run, m, player, 8);
        m.misc.guardianOpen = 1;
        m.powers = m.powers.filter((p) => p.id !== "Sharp Hide");
        fx.addPower(m, "Mode Shift", Number(m.misc.guardianThreshold ?? 30));
        setMove(m, 5, "attack", 5, 4);
      } else if (mv === 6) {
        fx.gainBlock(run, m, 9);
        setMove(m, 2, "attack", bash);
      } else if (mv === 2) {
        fx.dealDamage(run, m, player, bash);
        setMove(m, 7, "strong_debuff");
      } else if (mv === 7) {
        fx.addPower(player, "Weakened", 2, true);
        fx.addPower(player, "Vulnerable", 2, true);
        setMove(m, 5, "attack", 5, 4);
      } else if (mv === 5) {
        for (let i = 0; i < 4; i++) fx.dealDamage(run, m, player, 5);
        setMove(m, 6, "defend");
      }
      m.misc.skipRoll = 1;
      break;
    }
    case "Hexaghost": {
      const step = Number(m.misc.hexa ?? 0);
      if (mv === 1) {
        const per = Math.floor(run.player.hp / 12) + 1;
        for (let i = 0; i < 6; i++) fx.dealDamage(run, m, player, per);
      } else if (mv === 4) {
        fx.dealDamage(run, m, player, 6);
        run.combat!.discard.push(fx.makeCard(run, "Burn"));
      } else if (mv === 2) {
        fx.dealDamage(run, m, player, asc(run, 4) ? 6 : 5);
        fx.dealDamage(run, m, player, asc(run, 4) ? 6 : 5);
      } else if (mv === 3) {
        for (let i = 0; i < 6; i++) fx.dealDamage(run, m, player, asc(run, 4) ? 3 : 2);
        run.combat!.discard.push(fx.makeCard(run, "Burn"));
        run.combat!.discard.push(fx.makeCard(run, "Burn"));
        run.combat!.discard.push(fx.makeCard(run, "Burn"));
      }
      m.misc.hexa = step >= 6 ? 1 : step + 1;
      break;
    }
    case "SlimeBoss":
      if (mv === 3) fx.dealDamage(run, m, m, m.hp, { hpLoss: true });
      else if (mv === 4) addSlimed(run, 3);
      else if (mv === 2) fx.dealDamage(run, m, player, asc(run, 4) ? 38 : 35);
      else fx.dealDamage(run, m, player, asc(run, 4) ? 10 : 9);
      m.misc.slimeTurn = Number(m.misc.slimeTurn ?? 0) + 1;
      break;
    case "SpireShield": {
      m.misc.turn = Number(m.misc.turn ?? 0) + 1;
      const dmg = m.intentDamage ?? 12;
      if (mv === 1) {
        fx.dealDamage(run, m, player, dmg);
        if ((run.combat?.orbSlots ?? 0) > 0 && bool(run)) fx.addPower(player, "Focus", -1, true);
        else fx.addPower(player, "Strength", -1, true);
      } else if (mv === 2) {
        for (const e of run.combat!.monsters) if (e.alive) fx.gainBlock(run, e, 30);
      } else if (mv === 3) {
        fx.dealDamage(run, m, player, dmg);
        fx.gainBlock(run, m, asc(run, 18) ? 99 : dmg);
      }
      break;
    }
    case "SpireSpear": {
      m.misc.turn = Number(m.misc.turn ?? 0) + 1;
      const dmg = m.intentDamage ?? 5;
      if (mv === 1) {
        for (let i = 0; i < (m.intentHits ?? 2); i++) fx.dealDamage(run, m, player, dmg);
        for (let i = 0; i < 2; i++) {
          if (asc(run, 18)) run.combat!.draw.unshift(fx.makeCard(run, "Burn"));
          else run.combat!.discard.push(fx.makeCard(run, "Burn"));
        }
      } else if (mv === 2) {
        for (let i = 0; i < (m.intentHits ?? 3); i++) fx.dealDamage(run, m, player, dmg);
      } else {
        for (const e of run.combat!.monsters) if (e.alive) fx.addPower(e, "Strength", 2);
      }
      break;
    }
    case "CorruptHeart": {
      m.misc.turn = Number(m.misc.turn ?? 0) + 1;
      const dmg = m.intentDamage ?? 12;
      if (mv === 1) {
        fx.addPower(player, "Vulnerable", 2, true);
        fx.addPower(player, "Weakened", 2, true);
        fx.addPower(player, "Frail", 2, true);
        for (const sid of ["Burn", "Dazed", "Slimed", "Void", "Wound"]) {
          run.combat!.draw.push(fx.makeCard(run, sid));
        }
      } else if (mv === 2) {
        for (let i = 0; i < (m.intentHits ?? 2); i++) fx.dealDamage(run, m, player, dmg);
      } else if (mv === 3) {
        fx.dealDamage(run, m, player, dmg);
      } else if (mv === 4) {
        const str = m.powers.find((p) => p.id === "Strength");
        if (str && str.amount < 0) m.powers = m.powers.filter((p) => p.id !== "Strength");
        fx.addPower(m, "Strength", 2);
        m.misc.buffCount = Number(m.misc.buffCount ?? 0) + 1;
        const step = m.misc.buffCount;
        if (step === 1) fx.addPower(m, "Artifact", 2);
        else if (step === 2) fx.addPower(m, "BeatOfDeath", 1);
        else if (step === 3) fx.addPower(m, "Painful Stabs", 1);
        else if (step === 4) fx.addPower(m, "Strength", 10);
        else fx.addPower(m, "Strength", 50);
      }
      break;
    }
    default:
      if (mv === 2) fx.gainBlock(run, m, Math.max(5, Math.floor(m.maxHp / 8)));
      else if (mv === 3) fx.addPower(m, "Strength", 2);
      else fx.dealDamage(run, m, player, m.intentDamage ?? 6);
  }
  commitMove(m);
}

function pick(run: RunState, ids: string[]): string {
  const r = misc(run);
  const id = ids[r.nextInt(ids.length)]!;
  saveMisc(run, r);
  return id;
}

function bool(run: RunState): boolean {
  const r = misc(run);
  const b = r.randomBoolean();
  saveMisc(run, r);
  return b;
}

function takeFromPool(run: RunState, pool: string[]): string {
  const r = misc(run);
  const i = r.nextInt(pool.length);
  const v = pool.splice(i, 1)[0]!;
  saveMisc(run, r);
  return v;
}

export function spawnEncounter(run: RunState, key: string): Creature[] {
  const one = (id: string) => createMonster(run, id);
  switch (key) {
    case "Cultist":
      return [one("Cultist")];
    case "Jaw Worm":
      return [one("JawWorm")];
    case "Spire Shield and Spear":
      return [one("SpireShield"), one("SpireSpear")];
    case "Corrupt Heart":
      return [one("CorruptHeart")];
    case "2 Louse":
      return [one(bool(run) ? "FuzzyLouseNormal" : "FuzzyLouseDefensive"), one(bool(run) ? "FuzzyLouseNormal" : "FuzzyLouseDefensive")];
    case "Small Slimes":
      return bool(run)
        ? [one("SpikeSlime_S"), one("AcidSlime_M")]
        : [one("AcidSlime_S"), one("SpikeSlime_M")];
    case "Blue Slaver":
      return [one("SlaverBlue")];
    case "Red Slaver":
      return [one("SlaverRed")];
    case "Looter":
      return [one("Looter")];
    case "Large Slime":
      return [one(bool(run) ? "AcidSlime_L" : "SpikeSlime_L")];
    case "Lots of Slimes": {
      const pool = ["SpikeSlime_S", "SpikeSlime_S", "SpikeSlime_S", "AcidSlime_S", "AcidSlime_S"];
      return Array.from({ length: 5 }, () => one(takeFromPool(run, pool)));
    }
    case "3 Louse":
      return [
        one(bool(run) ? "FuzzyLouseNormal" : "FuzzyLouseDefensive"),
        one(bool(run) ? "FuzzyLouseNormal" : "FuzzyLouseDefensive"),
        one(bool(run) ? "FuzzyLouseNormal" : "FuzzyLouseDefensive"),
      ];
    case "2 Fungi Beasts":
      return [one("FungiBeast"), one("FungiBeast")];
    case "Gremlin Gang": {
      const pool = [
        "GremlinWarrior",
        "GremlinWarrior",
        "GremlinThief",
        "GremlinThief",
        "GremlinFat",
        "GremlinFat",
        "GremlinTsundere",
        "GremlinWizard",
      ];
      return Array.from({ length: 4 }, () => one(takeFromPool(run, pool)));
    }
    case "Exordium Thugs": {
      const weak = pick(run, ["FuzzyLouseNormal", "FuzzyLouseDefensive", "SpikeSlime_M", "AcidSlime_M"]);
      const strong = pick(run, ["Cultist", "SlaverBlue", "SlaverRed", "Looter"]);
      return [one(weak), one(strong)];
    }
    case "Exordium Wildlife":
      return [one(pick(run, ["FungiBeast", "JawWorm"])), one(pick(run, ["FuzzyLouseNormal", "FuzzyLouseDefensive", "SpikeSlime_M", "AcidSlime_M"]))];
    case "Gremlin Nob":
      return [one("GremlinNob")];
    case "Lagavulin":
      return [one("Lagavulin")];
    case "3 Sentries": {
      const a = one("Sentry");
      const b = one("Sentry");
      const c = one("Sentry");
      a.misc.boltFirst = 1;
      c.misc.boltFirst = 1;
      return [a, b, c];
    }
    case "The Guardian":
      return [one("TheGuardian")];
    case "Hexaghost":
      return [one("Hexaghost")];
    case "Slime Boss":
      return [one("SlimeBoss")];
    default: {
      const spec = ENCOUNTERS.encounters[key];
      const groups = spec?.monsters ?? [["JawWorm"]];
      const r = misc(run);
      const group = groups[r.nextInt(groups.length)] ?? groups[0]!;
      saveMisc(run, r);
      return group.map((id) => one(id));
    }
  }
}

export const WEAK_POOL = ENCOUNTERS.acts["1"]!.weak;
export const STRONG_POOL = ENCOUNTERS.acts["1"]!.strong;
export const ELITE_POOL = ENCOUNTERS.acts["1"]!.elite;
export const BOSSES = ENCOUNTERS.acts["1"]!.boss;

export function poolsForAct(act: number): {
  weak: { id: string; w: number }[];
  strong: { id: string; w: number }[];
  elite: { id: string; w: number }[];
  boss: string[];
} {
  return ENCOUNTERS.acts[String(Math.max(1, Math.min(4, act)))] ?? ENCOUNTERS.acts["1"]!;
}

export function weightedPick(run: RunState, pool: { id: string; w: number }[], stream: "monster" | "misc"): string {
  const r = StsRandom.fromState(run.rng[stream]!);
  const total = pool.reduce((s, p) => s + p.w, 0);
  let roll = r.nextFloat() * total;
  run.rng[stream] = r.toState();
  for (const p of pool) {
    roll -= p.w;
    if (roll <= 0) return p.id;
  }
  return pool[0]!.id;
}
