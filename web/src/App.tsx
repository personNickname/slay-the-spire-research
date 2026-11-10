import { useEffect, useMemo, useState } from "react";
import {
  CHARACTERS,
  POTION_BY_ID,
  POWER_NAMES,
  RELIC_BY_ID,
  atBossGate,
  buyShop,
  canPlay,
  cardDef,
  chooseEvent,
  chooseNeow,
  clearSave,
  currentCost,
  endTurn,
  enterBoss,
  enterNode,
  finishCombat,
  formatCardText,
  leaveRewards,
  leaveShop,
  loadRun,
  needsTarget,
  newRun,
  playCard,
  reachableFrom,
  resolvePending,
  restHeal,
  restRecall,
  restSmith,
  saveRun,
  selectCombatTarget,
  shopPurge,
  skipRewardCards,
  takeRewardCard,
  takeRewardGold,
  takeRewardPotion,
  takeRewardRelic,
  takeSapphireKey,
  type CardInst,
  type CharacterId,
  type Creature,
  type RunState,
  upgradeCard,
  usePotion,
} from "@sts/engine";
import "./ui.css";

const ROOM_GLYPH: Record<string, string> = {
  monster: "M",
  elite: "E",
  rest: "R",
  shop: "$",
  treasure: "T",
  event: "?",
  boss: "B",
};

const INTENT: Record<string, string> = {
  attack: "攻击",
  attack_buff: "攻击/强化",
  attack_debuff: "攻击/削弱",
  attack_defend: "攻击/防御",
  buff: "强化",
  debuff: "削弱",
  strong_debuff: "强力削弱",
  defend: "防御",
  defend_buff: "防御/强化",
  sleep: "沉睡",
  escape: "逃跑",
  unknown: "……",
  magic: "魔法",
  stun: "晕眩",
};

function persist(run: RunState) {
  saveRun(run);
}

const CHARS: CharacterId[] = ["ironclad", "silent", "defect", "watcher"];

function snake(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

function portraitUrl(def: ReturnType<typeof cardDef>): string {
  let leaf = (def.class.split("/")[1] ?? def.id)
    .replace(/_(Green|Red|Blue|Purple|[GRBP])$/i, "")
    .replace(/(Green|Red|Blue|Purple)$/i, "");
  leaf = snake(leaf);
  const folder = def.type === "attack" ? "attack" : def.type === "skill" ? "skill" : def.type === "power" ? "power" : def.type;
  const color = def.color === "curse" ? "curse" : def.color;
  return `${import.meta.env.BASE_URL}assets/sts1/portraits/${color}/${folder}/${leaf}.png`;
}

const INTENT_FILE: Record<string, string> = {
  attack: "attack/attack_intent_1.png",
  attack_buff: "attackBuff.png",
  attack_debuff: "attackDebuff.png",
  attack_defend: "attackDefend.png",
  buff: "buff1.png",
  debuff: "debuff1.png",
  strong_debuff: "debuff2.png",
  defend: "defend.png",
  defend_buff: "defendBuff.png",
  defend_debuff: "defend.png",
  sleep: "sleep.png",
  escape: "escape.png",
  stun: "stun.png",
  unknown: "unknown.png",
  magic: "magic.png",
};

const RELIC_FILE: Record<string, string> = {
  "Ring of the Snake": "snake_ring.png",
  "Burning Blood": "burningBlood.png",
  "Cracked Core": "crackedOrb.png",
  PureWater: "clean_water.png",
};

function relicUrl(id: string): string {
  if (RELIC_FILE[id]) return `${import.meta.env.BASE_URL}assets/sts1/relics/${RELIC_FILE[id]}`;
  const camel = id.replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase());
  const lowerCamel = camel.charAt(0).toLowerCase() + camel.slice(1);
  return `${import.meta.env.BASE_URL}assets/sts1/relics/${lowerCamel}.png`;
}

export default function App() {
  const [run, setRun] = useState<RunState | null>(() => {
    if (typeof location !== "undefined" && /[?&]reset=1\b/.test(location.search)) {
      clearSave();
      return null;
    }
    const loaded = loadRun<RunState>();
    if (!loaded) return null;
    if (!loaded.character) loaded.character = "ironclad";
    if (!loaded.lang) loaded.lang = "zhs";
    if (loaded.combat && !loaded.combat.orbs) loaded.combat.orbs = [];
    return loaded;
  });
  const [seed, setSeed] = useState("");
  const [character, setCharacter] = useState<CharacterId>("ironclad");
  const [ascension, setAscension] = useState(0);
  const [lang, setLang] = useState<"zhs" | "eng">("zhs");
  const [selected, setSelected] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [pickUids, setPickUids] = useState<string[]>([]);
  const [deckView, setDeckView] = useState(false);

  const bump = (next: RunState) => {
    persist(next);
    setRun({ ...next });
  };

  useEffect(() => {
    if (run?.combat?.victory) {
      /* wait for player to click 领取奖励 */
    }
  }, [run]);

  if (!run) {
    return (
      <div className="title-screen">
        <h1>{lang === "zhs" ? "杀戮尖塔" : "Slay the Spire"}</h1>
        <p>{lang === "zhs" ? "四角色 · 三幕 · 数据来自 desktop-1.0.jar" : "Four characters · three acts · data from desktop-1.0.jar"}</p>
        <div className="char-row">
          {CHARS.map((id) => (
            <button key={id} className={`char-pick ${character === id ? "on" : ""}`} onClick={() => setCharacter(id)}>
              {CHARACTERS[id].name[lang]}
            </button>
          ))}
        </div>
        <label>
          {lang === "zhs" ? "种子" : "Seed"}{" "}
          <input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder={lang === "zhs" ? "随机" : "random"} />
        </label>
        <label>
          {lang === "zhs" ? "进阶" : "Ascension"}{" "}
          <input
            type="number"
            min={0}
            max={20}
            value={ascension}
            onChange={(e) => setAscension(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
            style={{ width: 64 }}
          />
        </label>
        <button className="btn small" onClick={() => setLang(lang === "zhs" ? "eng" : "zhs")}>
          {lang === "zhs" ? "English" : "中文"}
        </button>
        <button
          className="btn"
          onClick={() => {
            const n = seed.trim() ? Number(seed) : undefined;
            bump(newRun(Number.isFinite(n) ? n : undefined, { character, ascension, lang }));
          }}
        >
          {lang === "zhs" ? "开始新的冒险" : "Embark"}
        </button>
        <a className="btn small" href={`${import.meta.env.BASE_URL}review/`}>
          {lang === "zhs" ? "资料库" : "Database"}
        </a>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <strong>{CHARACTERS[run.character]?.name[run.lang ?? "zhs"] ?? "Ironclad"}</strong>
        <span>A{run.ascension} · Act {run.act}</span>
        <div className="hpbar">
          <div className="track">
            <div className="fill" style={{ width: `${(run.player.hp / run.player.maxHp) * 100}%` }} />
            {run.player.block > 0 && (
              <div className="blk" style={{ width: `${Math.min(100, (run.player.block / run.player.maxHp) * 100)}%` }} />
            )}
          </div>
          <span>
            {run.player.hp}/{run.player.maxHp}
            {run.player.block > 0 ? `  格挡 ${run.player.block}` : ""}
          </span>
        </div>
        <span className="gold">金币 {run.gold}</span>
        <span>楼层 {run.floor}</span>
        <span>种子 {run.seed}</span>
        <span>Boss {run.boss}</span>
        <span className="potion-row">
          {run.potions.map((p, i) => {
            const def = p ? POTION_BY_ID.get(p.id) : undefined;
            const desc = def && "description" in def && def.description ? def.description.zhs : undefined;
            return (
              <button
                key={i}
                className={`potion-slot ${p ? "" : "empty"}`}
                disabled={!p || !run.combat}
                onClick={() => {
                  if (!p || !run.combat) return;
                  usePotion(run, i, run.combat.selectedTargetId);
                  bump(run);
                }}
              >
                {p ? (def?.name.zhs ?? p.id).slice(0, 2) : ""}
                {p && (
                  <span className="hover-tip">
                    <b>{def?.name.zhs ?? p.id}</b>
                    {desc && <em>{desc}</em>}
                    <em className="tip-hint">{run.combat ? "点击使用（作用于选中敌人）" : "仅战斗中可用"}</em>
                  </span>
                )}
              </button>
            );
          })}
        </span>
        {run.keys && (run.keys.ruby || run.keys.sapphire || run.keys.emerald) && (
          <span className="keys-row" title="尾声钥匙">
            {(["ruby", "emerald", "sapphire"] as const).map((k) => (
              <i key={k} className={`key-${k} ${run.keys![k] ? "on" : "off"}`}>
                {k === "ruby" ? "红" : k === "emerald" ? "绿" : "蓝"}
              </i>
            ))}
          </span>
        )}
        <span style={{ marginLeft: "auto" }}>
          <button className="btn small" onClick={() => setDeckView(true)}>
            牌组 {run.deck.length}
          </button>
          <button className="btn small" onClick={() => { run.lang = run.lang === "zhs" ? "eng" : "zhs"; bump(run); }}>
            {run.lang === "zhs" ? "EN" : "中"}
          </button>
          <button
            className="btn small danger"
            onClick={() => {
              clearSave();
              setRun(null);
            }}
          >
            放弃
          </button>
        </span>
      </header>
      <div className="relics-bar">
        <span className="relics-label">遗物</span>
        {run.relics.map((r) => {
          const def = RELIC_BY_ID.get(r.id);
          const name = def?.name.zhs ?? r.id;
          const desc = def?.description?.zhs;
          return (
            <span key={r.id} className="relic-slot">
              <img
                className="relic-icon"
                src={relicUrl(r.id)}
                alt={r.id}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.visibility = "hidden";
                }}
              />
              <i>{name.slice(0, 2)}</i>
              <b className="relic-name">{name}</b>
              <span className="hover-tip">
                <b>{name}</b>
                {desc && <em>{desc}</em>}
              </span>
            </span>
          );
        })}
      </div>
      {deckView && <DeckViewModal run={run} onClose={() => setDeckView(false)} />}
      {run.screen === "neow" && <Neow run={run} bump={bump} />}
      {run.screen === "map" && <MapScreen run={run} bump={bump} />}
      {run.screen === "combat" && run.combat && (
        <CombatScreen
          run={run}
          bump={bump}
          selected={selected}
          setSelected={setSelected}
          target={target}
          setTarget={setTarget}
          pickUids={pickUids}
          setPickUids={setPickUids}
        />
      )}
      {run.screen === "rewards" && <Rewards run={run} bump={bump} />}
      {run.screen === "rest" && <Rest run={run} bump={bump} />}
      {run.screen === "shop" && <Shop run={run} bump={bump} />}
      {run.screen === "treasure" && <Treasure run={run} bump={bump} />}
      {run.screen === "event" && <EventScreen run={run} bump={bump} />}
      {run.screen === "gameover" && <Over run={run} onAgain={() => { clearSave(); setRun(null); }} />}
    </div>
  );
}

function Neow({ run, bump }: { run: RunState; bump: (r: RunState) => void }) {
  const [opt, setOpt] = useState<string | null>(null);
  const [first, setFirst] = useState<string | null>(null);
  const lang = run.lang ?? "zhs";
  const needsPick = (id: string) =>
    /UPGRADE_CARD|REMOVE_CARD|REMOVE_TWO|TRANSFORM_CARD|TRANSFORM_TWO|upgrade|remove/.test(id);
  return (
    <div className="screen">
      <div className="event-body">
        <h2>{run.event?.title[lang]}</h2>
        <p>{run.event?.body[lang]}</p>
        <div className="opts">
          {run.event?.options.map((o) => (
            <button
              key={o.id}
              onClick={() => {
                if (needsPick(o.id)) {
                  setOpt(o.id);
                  setFirst(null);
                } else {
                  chooseNeow(run, o.id);
                  bump(run);
                }
              }}
            >
              {o.label[lang]}
            </button>
          ))}
        </div>
        {opt && (
          <div>
            <p className="dim">
              {/REMOVE_TWO|TRANSFORM_TWO/.test(opt.split(":")[1] ?? opt)
                ? `选择${first ? "第二" : "第一"}张牌`
                : "选择一张牌"}
            </p>
            <DeckPick
              cards={run.deck.filter((c) => c.uid !== first)}
              onPick={(uid) => {
                if (/REMOVE_TWO|TRANSFORM_TWO/.test(opt.split(":")[1] ?? opt) && !first) {
                  setFirst(uid);
                  return;
                }
                chooseNeow(run, opt, first ?? uid, first ? uid : undefined);
                setOpt(null);
                setFirst(null);
                bump(run);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MapScreen({ run, bump }: { run: RunState; bump: (r: RunState) => void }) {
  const reach = useMemo(() => reachableFrom(run.map, run.current), [run]);
  const reachSet = new Set(reach.map((n) => `${n.x},${n.y}`));
  const here = run.current ? `${run.current.x},${run.current.y}` : "";
  const done = new Set(run.visited.map((v) => `${v.x},${v.y}`));
  const PITCH_X = 64;
  const PITCH_Y = 42;
  const rows = run.map.length;
  // column-reverse layout: DOM row 0 is the visual top = map row rows-1
  const centerOf = (x: number, y: number) => ({
    cx: x * PITCH_X + 18,
    cy: (rows - 1 - y) * PITCH_Y + 18,
  });
  const hereNode = run.current ? run.map[run.current.y]?.[run.current.x] : undefined;
  const edgeLines: { x1: number; y1: number; x2: number; y2: number; hot: boolean }[] = [];
  for (const row of run.map) {
    for (const n of row) {
      if (!n.room) continue;
      for (const e of n.edges) {
        const a = centerOf(n.x, n.y);
        const b = centerOf(e.x, e.y);
        edgeLines.push({ x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy, hot: n === hereNode });
      }
    }
  }
  const mapW = 7 * PITCH_X - 28;
  const mapH = rows * PITCH_Y - 6;
  return (
    <div className="screen">
      <p className="map-legend">M 怪物 · E 精英 · R 休息 · $ 商店 · T 宝箱 · ? 事件 · 金色连线可走 · 金框可进入</p>
      <div className="map-wrap">
        <svg
          className="map-edges"
          width={mapW}
          height={mapH}
          style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}
        >
          {edgeLines.map((l, i) => (
            <line
              key={i}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke={l.hot ? "#d4b46a" : "#6a563e"}
              strokeWidth={l.hot ? 2.5 : 1.5}
              opacity={l.hot ? 0.95 : 0.55}
            />
          ))}
        </svg>
        {run.map.map((row, y) => (
          <div className="map-row" key={y}>
            {row.map((n) => {
              if (!n.room) return <div key={n.x} style={{ width: 36 }} />;
              const k = `${n.x},${n.y}`;
              const cls = ["map-node", reachSet.has(k) ? "reachable" : "", k === here ? "here" : "", done.has(k) ? "done" : ""]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={k}
                  className={cls}
                  title={`${n.room} (${n.x},${n.y})`}
                  onClick={() => {
                    enterNode(run, n.x, n.y);
                    bump(run);
                  }}
                >
                  {ROOM_GLYPH[n.room] ?? "?"}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {atBossGate(run) && (
        <div style={{ textAlign: "center" }}>
          <button
            className="btn"
            onClick={() => {
              enterBoss(run);
              bump(run);
            }}
          >
            挑战 {run.boss}
          </button>
        </div>
      )}
    </div>
  );
}

function CombatScreen({
  run,
  bump,
  selected,
  setSelected,
  target,
  setTarget,
  pickUids,
  setPickUids,
}: {
  run: RunState;
  bump: (r: RunState) => void;
  selected: string | null;
  setSelected: (s: string | null) => void;
  target: string | null;
  setTarget: (s: string | null) => void;
  pickUids: string[];
  setPickUids: (s: string[]) => void;
}) {
  const [pile, setPile] = useState<"draw" | "discard" | "exhaust" | null>(null);
  const cbt = run.combat!;
  const tryPlay = (card: CardInst, tgt?: string) => {
    const idx = cbt.hand.findIndex((h) => h.uid === card.uid);
    playCard(run, idx, tgt);
    setSelected(null);
    setTarget(null);
    bump(run);
  };

  return (
    <div className="combat">
      <div className="enemies">
        {cbt.monsters.map((m) => (
          <Enemy
            key={m.id}
            lang={run.lang}
            m={m}
            selected={target === m.id}
            onClick={() => {
              if (!m.alive) return;
              selectCombatTarget(run, m.id);
              if (selected) {
                const card = cbt.hand.find((h) => h.uid === selected);
                if (card && needsTarget(card)) tryPlay(card, m.id);
                else setTarget(m.id);
              } else setTarget(m.id);
              bump(run);
            }}
          />
        ))}
      </div>
      <div className="piles">
        <button className="pile-btn" onClick={() => setPile("draw")}>
          抽牌堆 {cbt.draw.length}
        </button>
        <span className="energy-pip">
          {run.lang === "eng" ? "Energy" : "能量"} {cbt.energy}/{cbt.energyMax}
        </span>
        <span>
          {run.character === "defect" && (
            <span className="orbs">
              {(cbt.orbs ?? []).map((o, i) => (
                <span key={i} className={`orb ${o.type}`}>
                  {o.type[0]!.toUpperCase()}
                  {o.type === "dark" ? o.focus : ""}
                </span>
              ))}
              {Array.from({ length: Math.max(0, cbt.orbSlots - cbt.orbs.length) }).map((_, i) => (
                <span key={`e${i}`} className="orb empty">
                  ·
                </span>
              ))}
            </span>
          )}
          {run.character === "watcher" && (
            <span className="stance">
              {cbt.stance === "none" ? "" : cbt.stance} {cbt.mantra ? `M${cbt.mantra}` : ""}
            </span>
          )}
        </span>
        <span>
          <button className="pile-btn" onClick={() => setPile("discard")}>
            弃牌堆 {cbt.discard.length}
          </button>
          {" · "}
          <button className="pile-btn" onClick={() => setPile("exhaust")}>
            消耗 {cbt.exhaust.length}
          </button>
        </span>
      </div>
      <PlayerPowers who={run.player} />
      {cbt.pending && (
        <div className="choice">
          <div>{cbt.pending.prompt.zhs}</div>
          <div className="hand">
            {(cbt.pending.kind === "exhume"
              ? cbt.exhaust
              : cbt.pending.kind === "headbutt"
                ? cbt.discard
                : cbt.hand
            ).map((c) => (
              <MiniCard
                key={c.uid}
                run={run}
                c={c}
                selected={pickUids.includes(c.uid)}
                onClick={() => {
                  resolvePending(run, [c.uid]);
                  setPickUids([]);
                  bump(run);
                }}
              />
            ))}
          </div>
          {cbt.pending.kind === "upgradeAllHand" && (
            <button
              className="btn"
              onClick={() => {
                resolvePending(run, []);
                bump(run);
              }}
            >
              升级全部
            </button>
          )}
        </div>
      )}
      <div className="hand">
        {cbt.hand.map((c) => {
          const playable = canPlay(run, c) === true;
          return (
            <MiniCard
              key={c.uid}
              run={run}
              c={c}
              selected={selected === c.uid}
              unplayable={!playable}
              onClick={() => {
                if (!playable || cbt.pending) return;
                if (needsTarget(c)) {
                  if (target) tryPlay(c, target);
                  else setSelected(c.uid);
                } else tryPlay(c);
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, paddingBottom: 12 }}>
        {run.potions.map((p, i) => (
          <button
            key={i}
            className="btn small"
            disabled={!p}
            onClick={() => {
              if (!p) return;
              usePotion(run, i, target ?? undefined);
              bump(run);
            }}
          >
            {p ? (POTION_BY_ID.get(p.id)?.name[run.lang ?? "zhs"] ?? p.id) : run.lang === "eng" ? "empty" : "空药水"}
          </button>
        ))}
        <button
          className="btn"
          onClick={() => {
            if (cbt.victory) {
              finishCombat(run);
              bump(run);
              return;
            }
            endTurn(run);
            bump(run);
          }}
        >
          {cbt.victory ? "领取奖励" : "结束回合"}
        </button>
      </div>
      <div className="log">
        {run.log.slice(-8).map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      {pile && (
        <div className="modal-overlay" onClick={() => setPile(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {pile === "draw" ? "抽牌堆" : pile === "discard" ? "弃牌堆" : "消耗堆"}（
              {(pile === "draw" ? cbt.draw : pile === "discard" ? cbt.discard : cbt.exhaust).length} 张）
            </h2>
            <div className="reward-grid">
              {(pile === "draw"
                ? [...cbt.draw].sort((a, b) => a.defId.localeCompare(b.defId))
                : pile === "discard"
                  ? cbt.discard
                  : cbt.exhaust
              ).map((c) => (
                <MiniCard key={c.uid} run={run} c={c} onClick={() => undefined} />
              ))}
            </div>
            <p style={{ textAlign: "center" }}>
              <button className="btn" onClick={() => setPile(null)}>
                关闭
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Enemy({ m, selected, onClick, lang = "zhs" }: { m: Creature; selected: boolean; onClick: () => void; lang?: "zhs" | "eng" }) {
  const intent = m.intent ? (lang === "eng" ? m.intent : INTENT[m.intent] ?? m.intent) : "";
  const dmg =
    m.intentDamage && (m.intent ?? "").startsWith("attack")
      ? ` ${m.intentDamage}${m.intentHits && m.intentHits > 1 ? `×${m.intentHits}` : ""}`
      : "";
  return (
    <button className={`enemy ${m.alive ? "" : "dead"} ${selected ? "selected" : ""}`} onClick={onClick}>
      {m.intent && (
        <img
          className="intent-icon"
          src={`${import.meta.env.BASE_URL}assets/sts1/intents/${INTENT_FILE[m.intent] ?? "unknown.png"}`}
          alt={m.intent}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div>{m.name[lang]}</div>
      <div className="eng">{lang === "zhs" ? m.name.eng : m.name.zhs}</div>
      <div className="hpbar" style={{ marginTop: 6 }}>
        <div className="track" style={{ width: "100%" }}>
          <div className="fill" style={{ width: `${m.alive ? (m.hp / m.maxHp) * 100 : 0}%` }} />
        </div>
      </div>
      <div>
        {m.hp}/{m.maxHp}
        {m.block ? `  格挡 ${m.block}` : ""}
      </div>
      {m.alive && (
        <div className="intent">
          意图：{intent}
          {dmg}
        </div>
      )}
      <PlayerPowers who={m} />
    </button>
  );
}

function PlayerPowers({ who }: { who: Creature }) {
  if (!who.powers.length) return null;
  return (
    <div className="powers">
      {who.powers.map((p) => (
        <span key={p.id}>
          {(who.isPlayer ? POWER_NAMES[p.id]?.zhs : POWER_NAMES[p.id]?.zhs) ?? p.id} {p.amount}
        </span>
      ))}
    </div>
  );
}

function MiniCard({
  run,
  c,
  selected,
  unplayable,
  onClick,
}: {
  run: RunState;
  c: CardInst;
  selected?: boolean;
  unplayable?: boolean;
  onClick: () => void;
}) {
  const t = formatCardText(run, c);
  const def = cardDef(c.defId);
  const portrait = portraitUrl(def);
  return (
    <button className={`card ${def.type} ${selected ? "selected" : ""} ${unplayable ? "unplayable" : ""}`} onClick={onClick}>
      <img
        className="portrait"
        src={portrait}
        alt=""
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="cost">{t.cost}</div>
      <div className="cname">{t.name}</div>
      <div className="eng">{run.lang === "zhs" ? def.name.eng : def.name.zhs}</div>
      <div className="ctype">{t.type}</div>
      <div className="ctext" dangerouslySetInnerHTML={{ __html: t.text }} />
    </button>
  );
}


function RelicTag({ id }: { id: string }) {
  const def = RELIC_BY_ID.get(id);
  const name = def?.name.zhs ?? id;
  const desc = def?.description?.zhs;
  return (
    <span className="entity-tag">
      {name}
      <span className="hover-tip">
        <b>{name}</b>
        {desc && <em>{desc}</em>}
      </span>
    </span>
  );
}

function PotionTag({ id }: { id: string }) {
  const def = POTION_BY_ID.get(id);
  const name = def?.name.zhs ?? id;
  const desc = def && "description" in def && def.description ? def.description.zhs : undefined;
  return (
    <span className="entity-tag">
      {name}
      <span className="hover-tip">
        <b>{name}</b>
        {desc && <em>{desc}</em>}
      </span>
    </span>
  );
}
function Rewards({ run, bump }: { run: RunState; bump: (r: RunState) => void }) {
  const rw = run.rewards!;
  return (
    <div className="screen">
      <div className="rewards-center">
      <h2>战斗奖励</h2>
      {rw.gold > 0 && (
        <button
          className="btn"
          onClick={() => {
            takeRewardGold(run);
            bump(run);
          }}
        >
          领取 {rw.gold} 金币
        </button>
      )}
      {rw.relic && (
        <p>
          <button
            className="btn"
            onClick={() => {
              takeRewardRelic(run);
              bump(run);
            }}
          >
            遗物：<RelicTag id={rw.relic.id} />
          </button>
        </p>
      )}
      {rw.potion && (
        <p>
          <button
            className="btn"
            onClick={() => {
              takeRewardPotion(run);
              bump(run);
            }}
          >
            药水：<PotionTag id={rw.potion.id} />
          </button>
        </p>
      )}
      <div className="reward-grid">
        {rw.cards.map((c) => (
          <MiniCard
            key={c.card.uid}
            run={run}
            c={c.card}
            onClick={() => {
              takeRewardCard(run, c.card.uid);
              bump(run);
            }}
          />
        ))}
      </div>
      {rw.cards.length > 0 && (
        <p>
          <button
            className="btn small"
            onClick={() => {
              skipRewardCards(run);
              bump(run);
            }}
          >
            跳过卡牌
          </button>
        </p>
      )}
      <p>
        <button
          className="btn"
          onClick={() => {
            leaveRewards(run);
            bump(run);
          }}
        >
          继续
        </button>
      </p>
      </div>
    </div>
  );
}

function Rest({ run, bump }: { run: RunState; bump: (r: RunState) => void }) {
  const [smith, setSmith] = useState(false);
  return (
    <div className="screen event-body">
      <h2>休息处</h2>
      <p>火焰安静地燃烧着。</p>
      <div className="opts">
        <button
          onClick={() => {
            restHeal(run);
            bump(run);
          }}
        >
          休息（回复 30% 最大生命）
        </button>
        <button onClick={() => setSmith(true)}>锻造（升级一张牌）</button>
        {!run.keys?.ruby && (
          <button
            onClick={() => {
              restRecall(run);
              bump(run);
            }}
          >
            回忆（获得红宝石钥匙）
          </button>
        )}
      </div>
      {smith && (
        <DeckPick
          cards={run.deck.filter((c) => {
            const d = cardDef(c.defId);
            return d.type !== "curse" && d.type !== "status" && (!c.upgraded || d.id === "Searing Blow");
          })}
          onPick={(uid) => {
            restSmith(run, uid);
            bump(run);
          }}
        />
      )}
    </div>
  );
}

function Shop({ run, bump }: { run: RunState; bump: (r: RunState) => void }) {
  const [purge, setPurge] = useState(false);
  return (
    <div className="screen">
      <h2>商人</h2>
      <div className="shop-grid">
        {run.shop?.offers.map((o, i) => (
          <div key={i} className={`offer ${o.sold ? "sold" : ""}`}>
            <div>
              {o.kind === "card" ? (
                o.card && cardDef(o.card.defId).name.zhs
              ) : o.kind === "relic" ? (
                <RelicTag id={o.id} />
              ) : (
                <PotionTag id={o.id} />
              )}
            </div>
            <div className="gold">{o.price} 金币</div>
            <button
              className="btn small"
              disabled={o.sold || run.gold < o.price}
              onClick={() => {
                buyShop(run, i);
                bump(run);
              }}
            >
              购买
            </button>
          </div>
        ))}
      </div>
      <p>
        <button className="btn small" disabled={run.shop?.purgeUsed || (run.gold ?? 0) < (run.shop?.purgePrice ?? 0)} onClick={() => setPurge(true)}>
          移除卡牌（{run.shop?.purgePrice} 金币）
        </button>
      </p>
      {purge && (
        <DeckPick
          cards={run.deck}
          onPick={(uid) => {
            shopPurge(run, uid);
            bump(run);
            setPurge(false);
          }}
        />
      )}
      <button
        className="btn"
        onClick={() => {
          leaveShop(run);
          bump(run);
        }}
      >
        离开
      </button>
    </div>
  );
}

function Treasure({ run, bump }: { run: RunState; bump: (r: RunState) => void }) {
  return (
    <div className="screen event-body">
      <h2>宝箱</h2>
      {run.rewards?.relic && <p><RelicTag id={run.rewards.relic.id} /></p>}
      <button
        className="btn"
        onClick={() => {
          takeRewardRelic(run);
          leaveRewards(run);
          bump(run);
        }}
      >
        拿走
      </button>
      {!run.keys?.sapphire && (
        <button
          className="btn small"
          onClick={() => {
            takeSapphireKey(run);
            bump(run);
          }}
        >
          换成蓝宝石钥匙（放弃遗物）
        </button>
      )}
    </div>
  );
}

function EventScreen({ run, bump }: { run: RunState; bump: (r: RunState) => void }) {
  const [needCard, setNeedCard] = useState<string | null>(null);
  return (
    <div className="screen">
      <div className="event-body">
        <h2>{run.event?.title[run.lang ?? "zhs"]}</h2>
        <p>{run.event?.body[run.lang ?? "zhs"]}</p>
        <div className="opts">
          {run.event?.options.map((o) => (
            <button
              key={o.id}
              onClick={() => {
                if (run.event?.id === "upgrade_shrine" && o.id === "pray") setNeedCard("pray");
                else {
                  chooseEvent(run, o.id);
                  bump(run);
                }
              }}
            >
              {o.label[run.lang ?? "zhs"]}
            </button>
          ))}
        </div>
        {needCard && (
          <DeckPick
            cards={run.deck.filter((c) => !c.upgraded)}
            onPick={(uid) => {
              chooseEvent(run, needCard, uid);
              bump(run);
            }}
          />
        )}
      </div>
    </div>
  );
}

function DeckViewModal({ run, onClose }: { run: RunState; onClose: () => void }) {
  const counts = new Map<string, { name: string; cost: string; type: string; count: number; upgraded: boolean }>();
  for (const c of run.deck) {
    const t = formatCardText(run, c);
    const key = `${c.defId}|${c.upgraded ? 1 : 0}`;
    const entry = counts.get(key) ?? { name: t.name, cost: t.cost, type: t.type, count: 0, upgraded: !!c.upgraded };
    entry.count += 1;
    counts.set(key, entry);
  }
  const list = [...counts.values()].sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name, "zh"));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal deck-view" onClick={(e) => e.stopPropagation()}>
        <h2>牌组（{run.deck.length} 张）</h2>
        <div className="deck-view-grid">
          {list.map((e, i) => (
            <div key={i} className={`deck-entry ${e.upgraded ? "up" : ""}`}>
              <span className="cost">{e.cost}</span>
              <span className="name">
                {e.name}
                {e.upgraded ? "+" : ""}
              </span>
              <span className="cnt">×{e.count}</span>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center" }}>
          <button className="btn" onClick={onClose}>
            关闭
          </button>
        </p>
      </div>
    </div>
  );
}

function Over({ run, onAgain }: { run: RunState; onAgain: () => void }) {
  return (
    <div className="title-screen">
      <h1>{run.over === "victory" ? (run.act >= 4 ? "真结局" : "胜利") : "阵亡"}</h1>
      <p>
        种子 {run.seed} · 楼层 {run.floor} · {run.over === "victory" ? `击败了 ${run.act >= 4 ? "腐化之心" : run.boss}` : `${CHARACTERS[run.character]?.name.zhs ?? ""}倒下了`}
      </p>
      <button className="btn" onClick={onAgain}>
        再来一局
      </button>
    </div>
  );
}

function DeckPick({ cards, onPick }: { cards: CardInst[]; onPick: (uid: string) => void }) {
  return (
    <div className="deck-pick">
      {cards.map((c) => (
        <button key={c.uid} className="btn small" onClick={() => onPick(c.uid)}>
          {cardDef(c.defId).name.zhs}
          {c.upgraded ? "+" : ""}
        </button>
      ))}
    </div>
  );
}

void currentCost;
void upgradeCard;
