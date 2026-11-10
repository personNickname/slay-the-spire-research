# 杀戮尖塔网页复刻 — 可续作清单

> 打开本文件即可接着干。真值一律以本机 `desktop-1.0.jar` 反编译代码为准（见 `docs/audits/2026-11-09-sts1-fidelity-audit.md`）。

## 当前状态（2026-11-09）

- [x] StS1 数据层：从反编译代码抽出卡/遗物/药水/能力/怪物 JSON（`data/sts1/cards/*.json` 等）
- [x] 保真度审计 F1–F6：wiki 诅咒/状态稀有度、遗物 SPECIAL、Masked Bandits 已对齐代码；4 张 SPECIAL 诅咒保持 `special`
- [x] 可玩网页：四角色 · 三幕（`npm run dev` → http://localhost:5173）
  - 地图 15×7 + 最后一行 rest 边通向 Boss；战斗、奖励、休息、商店（含 2 张无色）、宝箱、事件（25% 神龛）、Neow 四段随机祝福、进阶 1–20
  - 铁甲 `use()` 已移植；静默毒 / 缺陷充能球 / 观者姿态可打；都市与超越遭遇表在 `encounters.json`
- [x] 卡图 / 遗物图 / 意图图标已从 jar 抽到 `web/public/assets/sts1/`（891 张）。音效/BGM 仍延后

---

## 立刻可玩

```
cd F:\Project\slay-the-spire-research
npm run dev
```

浏览器打开 Vite 提示的地址（默认 `http://localhost:5173`）。进度存在 `localStorage` 键 `sts1-web-run`。中英切换在标题页和顶栏。

---

## 引擎 / 战斗

- [x] 铁甲牌 `use()` 对过反编译（Armaments / Dual Wield / Exhume / Havoc / Fiend Fire / Searing Blow 公式在 `cardEffects.ts`）
- [x] 伤害预览与打出使用同一 `applyPowers` 目标（点选的敌人，`selectedTargetId`）
- [x] `GameActionManager` 风格队列：`addToBot` / `addToTop` / `flushActions`（死亡分裂走队列）
- [x] 分裂：史莱姆 Boss → AcidSlime_L + SpikeSlime_L；大酸/刺史莱姆 → 两只中型
- [x] Guardian / Hexaghost / Lagavulin / Nob 的 `getMove` 按 `TheGuardian.java` 等复核（Guardian 从进攻 Charge Up 起手；Lagavulin 睡 3 回合；Nob A3 伤害 / A18 Enrage 3）
- [x] 药水 42 种可使用（瓶中精灵战斗内免死）
- [x] 遗物钩子：燃烧之血、蛇戒、裂纹核、纯净水、锚、灯笼、金刚杵、光滑石、赤牛、铜制鳞片、预备背包、化学 X、会员卡、信使、黑血、骨头上的肉……其余仍进列表
- [x] 手牌 10 上限、抽牌堆洗牌、固有牌置顶 — 有测试
- [x] X 费牌（旋风斩）0 费可打出、0 段伤害；Chemical X +2
- [x] 保存/读档覆盖 RNG 全部流（进战斗按 `seed+floor` 重置 ai/shuffle）

## 地图 / 房间

- [x] `RoomTypeAssigner` 用 RandomXS128 的 `shuffle`
- [x] 第一行只显示真正有边的节点；Boss 从最后一行 rest 的边走到 y=15
- [x] 商店：3 张角色牌 + 2 张无色、价格 ±10%，会员卡 50% / 信使 20% / A16 +10%
- [x] 事件：`generateEvent` 的 25% shrine；10% 战斗事件
- [x] Neow：`new NeowReward(0..3)` 每段随机一项，第 3 段带 drawback

## 角色与后续幕

- [x] 静默猎手 / 故障机器人 / 观者：起始卡组、毒、充能球、姿态
- [x] 都市 / 超越遭遇表（`encounters.json` + 通用 AI）；尾声心脏未做（打完第 3 幕 Boss 即通关）
- [x] 进阶：A1 精英密度、A5 幕间 75% 回复、A6 90% 开局 HP、A10 进阶之灾、A11 −1 药水栏、A14 −最大生命、A15 休息 20%、A16 商店加价、A2–4/7–9/17–19 走怪物 HP/伤害档

## 数据层收尾

- [x] `data/sts1/cards/*.effects.json` 由 `npm run export-effects` 从 `cardEffects.ts` 导出
- [x] `encounters.json` 从 Exordium / TheCity / TheBeyond + MonsterHelper 手抄权重
- [x] `npm run validate` / `diff-baseline` 接入 `.github/workflows/ci.yml`
- [x] wiki 时代 JSON（`cards_ironclad.json` 等）保留作 baseline，运行时读 `cards/{color}.json`
- [x] `review/build.py` 把新 `data/sts1/cards/*.json` 打进数据库 Tab
- [x] README 写明需要本机 `desktop-1.0.jar` 才能重新 extract

## 素材

- [x] 从 jar 抽卡图 `images/1024Portraits/`、遗物 `images/relics/`、意图图标 → `web/public/assets/sts1/`
- [ ] 音效/BGM — 明确不做，直到有版权方案
- [x] 中英 UI 切换开关（标题页 + 顶栏）

## StS2

- [x] 对 `sts2.dll`（v0.107.1，ProductVersion `0.1.0+59260271`）做与 1 代同级别的实体盘点：见 `docs/audits/2026-11-09-sts2-fidelity-audit.md`
- [ ] **2026-11-12 大补丁后重抽 `data/sts2/`**（今天 2026-11-09，补丁未到；本机 dll 仍是 v0.107.1）
- [ ] 2 代效果 DSL 与网页复刻：1 代引擎稳定后再开

## 杂项 / 已知缺口

- [ ] 无色牌 JSON 48/51：Wish 生成的 Become Almighty / Live Forever / Fame and Fortune 未进 `colorless.json`（与 baseline diff 一致）
- [x] 尾声（第 4 幕）已进地图循环（2026-11-10，macOS 侧）：
  - 三钥匙：篝火「回忆」红宝石 / 宝箱「换取」蓝宝石 / 精英首胜（已持其他钥匙）掉绿宝石；顶栏显示
  - 固定链 篝火→商店→精英→心脏（`map.ts endingMap()`），Boss 门在精英后开启
  - 尖塔之盾/矛：Surrounded 背刺 +50%、器械、盾 3/6/9 碾压、矛 2/5/8 穿刺、灼烧打击塞灼烧（A18 置顶）
  - 腐化之心：死亡节拍（每出牌掉 HP）+ 无敌（每回合最多失去 300 HP，回合重置）+ 第 4/7/10…递进增益（器械2→节拍+1→痛苦之刺→+10→+50 力量）+ 削弱塞五状态牌
  - 第 3/4 幕 Boss 无奖励（wiki/Map_Locations 修正）；真结局画面
  - 数值：wiki 基线（docs/sts1/enemies.md §5），**待 Windows 侧对 TheEnding 源码复核**（怪物 HP 已是 jar 级）
- [ ] 都市/超越 Boss 的 `getMove` 目前是通用攻击/格挡/力量循环，不是逐文件移植
- [ ] 部分静默/缺陷/观者非核心牌走描述自动 DSL，未逐张对 `use()`
