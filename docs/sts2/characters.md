# 《杀戮尖塔2》(Slay the Spire 2) 已实装角色详表

> 面向网页复刻开发的角色数值与机制参考。
>
> **版本基准**：Steam 抢先体验(Early Access)版。EA 于 2026-03-05 上线（v0.98.x）；
> 截至 **2026-11-09**，正式主分支(main branch)为 **v0.111.0**（beta 分支 2026-08-14 发布，随后主分支同步）；
> 下一个大版本补丁(实验性内容)计划 **2026-11-12** 上线 beta 分支。
>
> **数据来源说明**：角色基础数值、起始卡组逐卡效果、卡牌池数量均取自社区对 **v0.107.1**（2026-06-18 构建）客户端的反编译数据（sts2-rl-agent 仓库，来源见文末），并以 v0.108–v0.111 官方补丁日志校正最新改动；机制描述与流派参考 PCGamesN 角色攻略（2026-03/04 更新）。所有易随平衡补丁变动的数值均已标注。

## 0. 当前实装角色总览

截至 2026-11-09，共 **5 名可玩角色**：3 名一代回归角色 + 2 名全新角色。

| # | 角色（英文） | 类型 | 初始血量(HP) | 初始金币 | 基础能量 | 解锁条件 |
|---|---|---|---|---|---|---|
| 1 | 铁甲战士 (The Ironclad) | 回归 | **80** | 99 | 3 | 默认可用 |
| 2 | 寂静猎手 (The Silent) | 回归 | **70** | 99 | 3 | 用铁甲战士完成任意一局 |
| 3 | 摄政王 (The Regent) | 全新 | **75** | 99 | 3 | 用寂静猎手完成任意一局 |
| 4 | 亡灵缚师 (The Necrobinder) | 全新 | **66** | 99 | 3 | 用摄政王完成任意一局 |
| 5 | 故障机器人 (The Defect) | 回归 | **75** | 99 | 3 | 用亡灵缚师完成任意一局 |

通用规则（v0.107.1 反编译常量，与一代一致）：
- 每回合基础抽牌数 **5** 张，手牌上限 **10** 张，基础能量 **3** 点，初始药水槽 **3** 个。
- 易伤(Vulnerable)受击伤害 ×1.5；虚弱(Weak)/脆弱(Frail) 造成伤害/获得格挡 ×0.75；格挡上限 999,999,999。

角色解锁链：铁甲战士 → 寂静猎手 → 摄政王 → 亡灵缚师 → 故障机器人（注意：新角色插入了解锁链中间，故障机器人排最后）。

**未来角色**：官方已确认至少再出 2 名新角色（EA 阵容扩至 7 人以上）。2026-08 Neowsletter 证实"下一个新角色"在开发中，被描述为比初代角色机制上更"怪"(weird)；下一个大补丁(2026-11-12 计划)包含新内容。一代的观者(The Watcher)暂无回归迹象。

---

## 1. 铁甲战士 (The Ironclad)

### 1.1 基础数据（v0.107.1）
- **初始血量**：80；**初始金币**：99；**能量**：3/回合
- **起始遗物**：燃烧之血 (Burning Blood) —— 战斗结束时回复 6 点生命值
  - 进阶版（高进阶/特定途径可获得的升级变体）：黑血 (Black Blood)

### 1.2 起始卡组（10 张，逐张）
| 张数 | 卡牌 | 费用 | 类型 | 效果（基础 → 升级后） |
|---|---|---|---|---|
| ×5 | 打击 (Strike) | 1 | 攻击(基础) | 造成 6 → 9 点伤害 |
| ×4 | 防御 (Defend) | 1 | 技能(基础) | 获得 5 → 8 点格挡 |
| ×1 | 痛击 (Bash) | 2 | 攻击(基础) | 造成 8 → 10 点伤害，施加 2 → 3 层易伤(Vulnerable) |

与一代起始卡组完全相同。官方联合创始人 Anthony Giovannetti 在 2026-10 Neowsletter 中称"Bash 是完美的卡"。

### 1.3 卡牌池与流派
卡牌池共 **87** 张（v0.107.1，含联机专属卡）。三大流派（PCGamesN 攻略，2026-04 更新）：

**① 易伤流 (Vulnerable Build)【2代新流派】**
- 取代了一代的力量(Strength)核心构筑。核心卡：Molten Fist（易伤倍增）、Tremble、Taunt、Dismantle（升级后 1 费 20 伤）、Uppercut；后期 Dominate（易伤+力量另类斩杀）、Cruelty、Colossus。
- 关键遗物：Paper Phrog（易伤伤害加成 50% → 75%）、Red Skull（血量≤50% 时+3 力量）、Self-Forming Clay、Ruined Helmet。

**② 撞击流 (Body Slam Build)**
- 堆格挡后用 Body Slam（伤害=格挡）终结。核心卡：Shrug It Off、Blood Wall、Flame Barrier、Unmovable、Crimson Mantle（7→10 格挡，v0.108 削）、Impervious。
- 关键遗物：Bronze Scales（开场 3 荆棘）、Gorget、Anchor、Horn Cleat、Captain's Wheel（前三回合给格挡）、Parrying Shield。

**③ 消耗流 (Exhaust Build)**
- 核心卡：True Grit、Burning Pact、Evil Eye（+16 格挡）、Forgotten Ritual（无需消耗卡即可回能，v0.111 增强）、Ashen Strike、Pact's End、Feel No Pain、Dark Embrace、Corruption（**古代(Ancient)奖励限定卡**：技能 0 费但全部消耗）、Fiend Fire、Second Wind。
- 关键遗物：Joss Paper（每消耗 5 张卡抽 1 张）、Charon's Ashes（每消耗 1 张卡对所有敌人 3 伤）。

一代 S 级卡回归情况：Demon Form、Barricade、Offering、Battle Trance、Headbutt 均回归且强度靠前；Whirlwind、Feed、Impervious 在列。**新增卡**：Not Yet（战斗内回血，v0.106 加入）。**v0.111 重做**：Expect a Fight → 3 费"获得 15(16) 格挡，每点力量额外+5(8) 格挡"。

### 1.4 与一代的机制差异
| 维度 | 一代 | 二代 |
|---|---|---|
| 起始数值 | HP80/5打击/4防御/痛击 | 完全一致 |
| 核心新构筑 | 无易伤专属构筑 | 新增易伤流（易伤可叠加更高，配合 Molten Fist 等"易伤倍增"卡） |
| 消耗体系 | 仅遗物少量联动 | Joss Paper/Charon's Ashes 等专属遗物+卡牌深联动 |
| 卡牌池规模 | 75 张 | 87 张（含联机卡） |
| 联机 | 无 | 有专属共享格挡/力量类卡（如 Midnight：12 费 99 伤，全场任何人消耗的卡每张-1 费） |

---

## 2. 寂静猎手 (The Silent)

### 2.1 基础数据（v0.107.1）
- **初始血量**：70；**初始金币**：99；**能量**：3/回合
- **起始遗物**：蛇环 (Ring of the Snake) —— 每场战斗开始时额外抽 2 张牌
  - 升级变体：Drake 之环 (Ring of the Drake)

### 2.2 起始卡组（12 张，逐张）
| 张数 | 卡牌 | 费用 | 类型 | 效果（基础 → 升级后） |
|---|---|---|---|---|
| ×5 | 打击 (Strike) | 1 | 攻击(基础) | 造成 6 → 9 点伤害 |
| ×5 | 防御 (Defend) | 1 | 技能(基础) | 获得 5 → 8 点格挡 |
| ×1 | 中和 (Neutralize) | 0 | 攻击(基础) | 造成 3 → 4 点伤害，施加 1 → 2 层虚弱 |
| ×1 | 幸存者 (Survivor) | 1 | 技能(基础) | 获得 8 → 11 点格挡，弃 1 张牌（**灵巧(Sly)关键词卡**：弃牌时触发效果） |

起始卡组与一代构成相同，但 Survivor 获得全新关键词 **灵巧 (Sly)**。

### 2.3 卡牌池与流派
卡牌池共 **88** 张（v0.107.1，含联机卡）。三大流派：
**① 灵巧流 (Sly Build)【2代新机制，当前版本最强流派】**
- **灵巧 (Sly)**：带有该关键词的卡在**被弃掉时自动触发效果**（相当于"弃牌即白嫖"）。起始组中 Survivor 是初始触发器。
- 核心卡：Ricochet、Flick-Flack（7→9 伤，v0.108 增强）、Untouchable；引擎卡 Acrobatics（1 费抽 3 弃 1）、Dagger Throw、Prepared；进阶 Abrasive、Hand Trick（将一张技能牌本回合变为灵巧）、Reflex、Tactician。
- 关键遗物：Bag of Preparation（开局+2 抽牌）、Centennial Puzzle（首次掉血抽 3 张）、Letter Opener（每打 3 技能全场 5 伤）、Tingsha（每弃 1 张随机敌人 3 伤）、Tough Bandages（每弃 1 张+3 格挡）。
- 一代弃牌体系（Reflex/Tactician/工具类）由"弃牌副玩法"升级为完整核心机制。

**② 毒流 (Poison Build)**
- 核心卡：Poisoned Stab、Bouncing Flask、Noxious Fumes、Envenom、Corrosive Wave、Bubble Bubble、Haze（v0.110 重做：2 费全体 4(6) 毒+1(2) 虚弱）、Accelerant、Mirage（获得格挡=全体敌人毒量；v0.110 回调并去掉消耗，v0.111 再削：重新自带消耗、升级改为移除消耗）。
- 关键遗物：Snecko Skull（施加毒时+1）、Twisted Funnel（开战全体 4 毒）。
- v0.110 Outbreak 重做为稀有力场：1 费"每次施加毒，对所有敌人 4(5) 伤"→ 现 3 费"全体 9(12) 毒，毒立即结算"。

**③ 疾影流 (Shiv Build)**
- 核心卡：Blade Dance（1 费 3 疾影，共 12 伤，自带消耗）、Cloak and Dagger、Hidden Daggers（灵巧触发器）、Finisher、Accuracy、Fan of Knives、Knife Trap。
- 关键遗物：Ninja Scroll（开战+3 疾影）、Helical Dart（每打 1 张疾影+1 敏捷）。
- 注意：相比一代，疾影主要卡被削弱（v0.102 补丁"buffs shivs"后又有回调），强度低于灵巧流。

### 2.4 与一代的机制差异
| 维度 | 一代 | 二代 |
|---|---|---|
| 起始数值 | HP70/同款卡组 | 一致，但 Survivor 带灵巧 |
| 弃牌 | 无奖励机制 | **灵巧(Sly)**：弃牌触发卡效，弃牌即引擎 |
| 无限流 | 少数组合可行 | 官方多次补丁限制（v0.100"让无限更难"、v0.102 削卡牌移除），灵巧流仍是最易达成无限的流派 |
| 卡牌池 | 75 张 | 88 张（含联机卡） |
| 平衡地位 | 中上 | 2026-04 官方主分支强度榜 S 级（PCGamesN） |

---

## 3. 摄政王 (The Regent)【全新角色】

### 3.1 基础数据（v0.107.1）
- **初始血量**：75；**初始金币**：99；**能量**：3/回合
- **起始遗物**：神授王权 (Divine Right) —— 每场战斗开始时获得 **3 颗星 (Stars)**
  - 升级变体：天定命运 (Divine Destiny) —— 开局星数更高（v0.108：6 → 7 颗）
- **角色定位**：来自遥远星域的 Starrian 族"太阳继承人"，傲慢的宇宙存在，携带可锻造的"主权之刃 (Sovereign Blade)"。

### 3.2 起始卡组（10 张，逐张）
| 张数 | 卡牌 | 费用 | 类型 | 效果（基础 → 升级后） |
|---|---|---|---|---|
| ×4 | 打击 (Strike) | 1 | 攻击(基础) | 造成 6 → 9 点伤害 |
| ×4 | 防御 (Defend) | 1 | 技能(基础) | 获得 5 → 8 点格挡 |
| ×1 | 陨星 (Falling Star) | **0** | 攻击(基础) | 造成 8 → 12 点伤害，施加 1 层虚弱+1 层易伤；**星消耗 2** |
| ×1 | 虔敬 (Venerate) | 1 | 技能(基础) | 获得 **2 → 3 颗星** |

### 3.3 专属机制详解（2代全新资源系统）
**① 星辰 (Stars) —— 持久型第二资源**
- 独立于能量的第二资源，部分卡牌以星为额外消耗（如 Falling Star 需 2 星）；很多卡效果随持有星数增长。
- **跨回合保留、无持有上限**（能量每回合清空，星不会）。
- 开局仅有起始遗物给的 3 颗，需用卡牌（Gather Light、Glow、Hidden Cache、Solar Strike、Knockout Blow 等）积累。
- 相关遗物：Galactic Dust（每消耗 10 星获得 10 格挡）、Lunar Pastry（回合结束+1 星）、Mini Regent（每场首次消耗星时+1 力量）、Regalite（v0.111 改为"每回合首次创造卡牌获得 6→4 格挡"）。

**② 锻造 (Forge) 与主权之刃 (Sovereign Blade)**
- Sovereign Blade：自带 **保留 (Retain)** 的特殊武器卡，初始 2 费 10 伤；不在手中时，打出任意带"锻造 (Forge)"关键词的卡会将其**置入手牌**，已在手中则**+锻造值**伤害。
- 典型锻造卡：Spoils of Battle（Forge 6(9)，v0.111 增）、Refine Blade（Forge 8(12)，v0.111 削）、Wrought in War、Furnace、Summon Forth、Seeking Edge、Bulwark、Devastate（35(45) 伤，v0.108 增）。
- Fencing Manual 遗物：开战直接激活主权之刃。

**③ 随从 (Minions) 与造卡**
- Guards (2 费)：将手中任意数量卡变形为 0 费**随从牺牲 (Minion Sacrifice)**——单次使用卡：获得 11（升级 8(11)→7(10)，v0.108 削）点格挡后消耗(Exhaust)。
- GUARDS!!! 等卡生成"可爱但一次性"的随从；随从分防御/攻击型。
- 与**无色卡 (Colorless)** 协同：Spectrum Shift（随机无色卡入手）、Supermassive（5 伤+本场每创造 1 张卡+3 伤）等。

### 3.4 卡牌池与流派
卡牌池共 **88** 张（v0.107.1，含联机卡）。两大流派 + 辅助体系：

**① 星辰流 (Stars Build)**
- 前期：Gather Light、Glow、Hidden Cache（本回合+1 星，下回合+3 星）、Solar Strike、Knockout Blow。
- 中期 AoE：Astral Pulse、Comet、Genesis、Particle Wall、Crescent Spear、Reflect、Gamma Blast。
- 终结：Decisions, Decisions（可自链的高星技能增幅）、Royal Gamble、Seven Stars、The Smith、Stardust、Reflect（S 级）、Bombardment、Big Bang、Void Form、Meteor Shower（S 级，可与一代对比的终局大招）。

**② 锻造流 (Forge Build)**
- 以主权之刃多次挥砍为核心；v0.102 补丁"rescues the Regent"后剑系卡（Sword Sage、Parry 等）大幅增强，从"几乎不选"变为可玩。

**辅助体系**：威光(Vigor)资源、无色卡创造、随从。
**解锁进度相关**：全卡解锁前 Forge 流较难成型；全解锁后强度升至 B 级以上（2026-04 榜）。

### 3.5 联机专属卡（v0.108 新增）
Plot（1 费：下回合全体玩家抽 2(3) 张）、Constellation（0 费：一名队友抽 1 张+1 能量+9(12) 格挡）。

---

## 4. 亡灵缚师 (The Necrobinder)【全新角色】

### 4.1 基础数据（v0.107.1）
- **初始血量**：**66**（全角色最低）；**初始金币**：99；**能量**：3/回合
- **起始遗物**：缚魂圣物匣 (Bound Phylactery) —— **每回合开始时召唤 (Summon) 奥斯蒂 (Osty) 1 点生命**（Osty 被打死后每回合重新召唤）
  - 升级变体：Unbound Phylactery
- **角色设定**：12 名探索者在尖塔中诞生的孩子，因禁忌魔典而成为巫妖(Lich)；身边漂浮的巨型骸骨手伙伴"奥斯提 (Osty)"是独立作战单位。

### 4.2 起始卡组（10 张，逐张）
| 张数 | 卡牌 | 费用 | 类型 | 效果（基础 → 升级后） |
|---|---|---|---|---|
| ×4 | 打击 (Strike) | 1 | 攻击(基础) | 造成 6 → 9 点伤害 |
| ×4 | 防御 (Defend) | 1 | 技能(基础) | 获得 5 → 8 点格挡 |
| ×1 | 保镖 (Bodyguard) | 1 | 技能(基础) | **重新召唤奥斯提**，其生命值为 5 → 7 点 |
| ×1 | 释放 (Unleash) | 1 | 攻击(基础) | 奥斯蒂发起攻击：造成 **6 + 1×奥斯提当前生命值 → 9 + 1×奥斯提当前生命值** 点伤害 |

### 4.3 专属机制详解（2代全新资源/单位系统）
**① 奥斯蒂 (Osty) —— 常驻召唤单位**
- 独立实体、独立血池（初始 1 点，可被大幅提升至 BOSS 级）；可独立攻击目标。
- **不承受**主人获得的负面状态（Debuff），也不享受其增益（Buff）——可用 Friendship、Shared Fate 卡把负面转嫁。
- **替主人挡刀**：主人格挡耗尽后，伤害优先扣奥斯提血量，直到其死亡。
- 死后可反复重新召唤（起始遗物每回合召 1 HP、Bodyguard 召 5 HP、Afterlife 召 6 HP 等）。
- 相关卡：Bone Shards（奥斯提对全体敌人 9 伤+自获 9 格挡，随后死亡）；Fetch/Flatten/Right Hand Hand/Rattle 组合连招（1 费 29 伤）；Squeeze（≥25 伤的终结技）；Unleash 升级后变为最强 Osty 卡 **Protector**。
- 相关遗物：Bone Flute（奥斯提每次攻击+2 格挡）、Bookmark、Funerary Mask（开战抽牌堆+3 灵魂）。
- 精灵魂锚 (Soul Nexus)：第三幕精英敌人，会召唤**敌方奥斯提**（1 HP）。

**② 末日 (Doom) —— 处决型替代伤害**
- 类似一代毒 (Poison) 的可叠加状态，但**不造成持续伤害、不衰减**。
- **回合结束时**：若目标身上末日层数 ≥ 其当前生命值，目标立即死亡（绕过治疗与高血量）。
- 会"晚一拍"：本回合叠够也要等回合结束结算，敌人仍有一次出手机会（v0.108 起结算顺序：回合结束宝珠被动 → 末日）。
- 可作用于自身：Neurosurge（+3 能量、抽 2 张，每回合给自己上 3 层末日——"寿命倒计时"引擎）。
- v0.111 补丁实例：Book Repair Knife（末日击杀回 3 血）、Undying Sigil（对"末日≥HP"的敌人伤害减半）、Lantern/Candelabra/Chandelier 系列遗物。

**③ 灵魂 (Souls) —— 循环引擎**
- 由其他卡牌生成的**0 费技能单次卡**：抽 2 张牌后消耗(Exhaust)。全游戏最强过牌引擎之一。
- 生产卡：Capture Spirit、Dirge、Grave Warden、Reave（10(13) 伤，v0.108 增）、Haunt（力量，自身损血 7(9)）等；终结卡 Soul Storm（+2(3)→4(6) 伤/灵魂，v0.108 大幅增强）、Death March、Spirit of Ash、Devour Life。
- 多人模式：Soulbound（队友同步产灵魂）、Cacophony（全体每抽 33 张牌对随机敌人 66(99) 伤，v0.108 新增）。

**④ 虚体化 (Ethereal) 与转化 (Transform) 副机制**
- 虚体(Ethereal)协同卡；Sculpting Strike（1 费 8 伤+使手中 1 张卡虚体化）、Transfigure（赋予"重放(Replay)"但增加费用）。

### 4.4 卡牌池与流派
卡牌池共 **88** 张（v0.107.1，含联机卡）。三大流派 + 虚体混合：
- **灵魂流 (Souls)**：当前版本超出其他流派的强度（PCGamesN：A 级）。
- **奥斯提流 (Osty)**：把 1 HP 手养成 BOSS 级随从，最易上手。
- **末日流 (Doom)**：需要全卡池解锁后才成型，官方承认仍需打磨（对比寂静猎手毒流偏弱）。

### 4.5 与一代的机制差异对比（针对"巫妖/召唤"概念）
一代没有可操作召唤单位、没有处决型替代伤害、没有可再生 0 费循环卡——三件套全部为 2 代新机制。最接近的一代概念：毒（末日对标但结算完全不同）、暗鸟遗物生成卡（灵魂对标但更强）。

---

## 5. 故障机器人 (The Defect)

### 5.1 基础数据（v0.107.1）
- **初始血量**：75；**初始金币**：99；**能量**：3/回合；**宝珠槽位**：3
- **起始遗物**：破损核心 (Cracked Core) —— 每场战斗开始时引导 (Channel) 1 颗闪电 (Lightning) 宝珠
  - 升级变体：Infused Core（第 1 回合引导 3 颗闪电；闪电宝珠伤害+1）
- **角色设定**：一代决战心脏(The Heart)后重伤退回废料场，结识机器人同伴 Flaw；为求"造物主"建筑师 (The Architect) 修复自己而重返尖塔。

### 5.2 起始卡组（10 张，逐张）
| 张数 | 卡牌 | 费用 | 类型 | 效果（基础 → 升级后） |
|---|---|---|---|---|
| ×4 | 打击 (Strike) | 1 | 攻击(基础) | 造成 6 → 9 点伤害 |
| ×4 | 防御 (Defend) | 1 | 技能(基础) | 获得 5 → 8 点格挡 |
| ×1 | 电击 (Zap) | 1 → **0** | 技能(基础) | 引导 1 颗闪电宝珠 |
| ×1 | 双重施法 (Dualcast) | 1 → **0** | 技能(基础) | **引发 (Evoke)** 最前方的宝珠两次 |

与一代起始卡组构成相同。

### 5.3 专属机制详解：宝珠 (Orbs) 系统升级
宝珠槽位、引导/引发、集中 (Focus) 框架与一代一致，但 2 代新增**玻璃 (Glass) 宝珠**：

| 宝珠 | 回合结束被动 | 引发效果 |
|---|---|---|
| 闪电 (Lightning) | 对随机敌人 3 伤 | 对随机敌人 8 伤 |
| 冰霜 (Frost) | 获得 2 格挡 | 获得 5 格挡 |
| 黑暗 (Dark) | 该宝珠引发伤害+6 | 对生命值最低的敌人造成 X 伤（蓄能型） |
| 等离子 (Plasma) | +1 能量 | +2 能量 |
| **玻璃 (Glass)【2代新增】** | 对所有敌人 4 伤，该宝珠数值-1 | 对所有敌人 8 伤 |

集中 (Focus) 效果不变（强化宝珠被动/引发数值）；槽位可增减（Capacitor）。v0.108 补丁明确了"回合结束宝珠被动先于末日结算"的统一时序。

### 5.4 卡牌池与流派
卡牌池共 **88** 张（v0.107.1，含联机卡）。三流派：

**① 宝珠流 (Orbs)**（主力）
- 前期：Ball Lightning、Cold Snap、Lightning Rod（加强版防御）、Focused Strike。
- 中期：Glacier、Chill、Hailstorm、Hotfix（单回合集中）、Synchronize（v0.110 增强：升级改为+3 临时集中且不再消耗；v0.111 回调削弱：集中 2(3)→1(2)）。
- 后期：Capacitor（槽位）、Defragment（集中）、**Voltaic**（引发大量闪电的终结技）、Echo Form（S 级）、Genetic Algorithm、Supercritical、Coolant、Double Energy。
- 自一代回归的 S 级：Hologram（从弃牌堆回放）、Chill、Glacier。

**② 状态流 (Status)【2代新流派】**
- 用给自身卡组塞状态卡 (Status) 的高威力卡换取收益，再利用状态卡获益；高进阶下衰减明显。代表：Trash to Treasure、Smokestack、Glasswork、Shatter（v0.110 起自带消耗）、Rocket Punch（v0.110 削：创造状态卡时费用-1→降 1 费）。

**③ 利爪流 (Claw)**
- Claw：0 费 3 伤，每打出一次本场所有利爪+2 伤。配合 Hologram、Scrape、Skim 无限循环。官方视为"梗卡但可成立"。

**v0.111 重做**：Hyperbeam——"30 伤全场、失去 3 集中"→"**24(30) 伤全场，本回合失去 3 集中**"（副作用大幅减轻）；Thunder 8(11) 伤增强；Null、Compact 系列重做。

### 5.5 联机专属卡（v0.108 新增/调整）
Hibernate（2 费：引导 2(3) 冰霜，本回合冰霜为**全体队友**提供格挡）、One For All（全体玩家 0 费攻击+3(4) 伤）、Imitation Learning（复制队友的能力卡）、Ignition（稀有度降为罕见）、The Ball（无色联机卡：10 伤传递）。

### 5.6 与一代的机制差异
| 维度 | 一代 | 二代 |
|---|---|---|
| 宝珠种类 | 4 种（闪电/冰霜/黑暗/等离子） | 5 种（新增**玻璃**：全体伤害递减型） |
| 起始数值 | HP75/4打击/4防御/Zap/Dualcast/槽3/破损核心 | 完全一致 |
| 新流派 | 无状态卡获益流派、Claw 无成长支撑 | 状态流、Claw 流成型（Scrape/Skim/Hologram 均回归强化） |
| 卡牌池 | 74 张 | 88 张（含联机卡） |
| 平衡 | — | 自 EA 以来改动最少（强度稳定 A 级，2026-04 榜） |

---

## 6. 跨角色新系统速览（复刻开发须知）

1. **附魔 (Enchantment) 系统（2代核心新增）**：卡牌可获得持久附魔（同一张卡不可叠加多种附魔——官方"要卡组构筑而非单卡构筑"）。v0.107.1 实装附魔关键词及效果：
   - 攻击向：**Sharp**（攻击+N 伤）、**Vigorous**（本场首次打出+N 伤）、**Momentum**（每打出一次+N 伤，累加）、**Favored**（攻击伤害×2）、**Corrupted**（伤害×1.5，每次打出自损 2 HP 不可格挡）、**Inky**（+施加虚弱，Vantom 系）、**Instinct**（仅限攻击）。
   - 格挡向：**Nimble**（+N 格挡）、**Goopy**（每次打出后格挡+1，滚雪球）。
   - 循环向：**Spiral / Glam**（额外打出次数）、**Swift**（首次打出抽 N 张）、**Sown**（首次打出+N 能量）、**Adroit**（打出获得 N 格挡）、**Slither**（抽到时费用随机 0–2）、**Imbued**（战斗开始自动打出）、**PerfectFit**（洗牌置顶）、**SlumberingEssence**（在手每回合费用-1）、**Replay**（重复打出）。
2. **古代 (Ancients) 系统**：取代一代"内乌(Neow)开局祝福"的完整神明体系（详见 content.md）。开局 Neow 事件改为**三选一：2 个正面遗物 + 1 个诅咒遗物**（v0.107.1：正面池 ArcaneScroll/BoomingConch/FishingRod/GoldenPearl/Kaleidoscope/LeadPaperweight/LostCoffer/MassiveScroll/NeowsTorment/NewLeaf/PhialHolster/PreciseScissors/ScrollBoxes/WingedBoots + 三组互斥二选一；诅咒池 CursedPearl/HeftyTablet/LargeCapsule/LeafyPoultice/NeowsBones/PrecariousShears/SilkenTress/SilverCrucible）。
3. **时间线/纪元 (Timeline/Epoch)**：局内外元进度系统——完成/失败的一局都会点亮时间线条目，讲述尖塔与各角色相遇的历史，并用于**解锁新角色与新功能**（消耗得分点数）。
4. **进阶 (Ascension) 1–10**（一代为 20 级）：每角色独立，A8 敌人更硬、A9 攻击更狠、A10 第三幕 BOSS 双战(Double Boss)。官方表态"A10 已接近最高难度"，暂不加等级。
5. **四人联机 (Co-op)**：全角色可用，含 15+ 张联机专属卡；敌人血量提升（幕缩放 1.1/1.2/1.2，第三幕 BOSS 1.3）；阵亡队友战斗后以 1 HP 复活；不允许共享金币。
6. **药水**：全角色共 64 种，每角色有专属药水（铁甲战士-血瓶 Blood Potion：回复 20% 最大生命；寂静猎手-毒药；故障机器人-专注；亡灵缚师-末日药水；摄政王-星辰药水）。

## 参考来源

1. Wikipedia — Slay the Spire II（2026 年末版本条目，EA 2026-03-05 上线、五角色阵容、开发沿革）：https://en.wikipedia.org/wiki/Slay_the_Spire_2
2. Steam 商店页（StS2，appid 2868840）：https://store.steampowered.com/app/2868840/
3. Mega Crit 官方 Steam 新闻/Neowsletter（2026-03 至 2026-10 全部公告与补丁日志，含 v0.99–v0.111 各版补丁说明）：https://steamcommunity.com/games/2868840/allnews/
4. PCGamesN 角色攻略系列（2026-03 发布、2026-04 更新）：
   - 角色总览/解锁/强度榜：https://www.pcgamesn.com/slay-the-spire-2/characters
   - 铁甲战士：https://www.pcgamesn.com/slay-the-spire-2/ironclad
   - 寂静猎手：https://www.pcgamesn.com/slay-the-spire-2/silent
   - 故障机器人：https://www.pcgamesn.com/slay-the-spire-2/defect
   - 摄政王：https://www.pcgamesn.com/slay-the-spire-2/regent
   - 亡灵缚师：https://www.pcgamesn.com/slay-the-spire-2/necrobinder
5. PCGamesN 新角色机制前瞻（官方 Dev Diary 转述）：
   - 亡灵缚师/Osty/末日/灵魂（2025-10-17）：https://www.pcgamesn.com/slay-the-spire-2/necrobinder-reveal
   - 摄政王/星辰/锻造/随从（2025-12-13）：https://www.pcgamesn.com/slay-the-spire-2/regent-class-mechanics
6. 社区对 v0.107.1 客户端（2026-06-18 构建）的反编译数据仓库 sts2-rl-agent（起始卡组/血量/附魔/宝珠/药水等精确数值的来源，game version 标注见其 GAME_VERSIONS.md）：https://github.com/zhiyue/sts2-rl-agent
7. PCGamesN 最新动态（新角色/交替二幕开发中，2026-08-15）：https://www.pcgamesn.com/slay-the-spire-2/updates-slowing-down-new-character-act-two
8. PCGamesN 2026-10-30（下一补丁 11-12、v0.111 主分支状态）：https://www.pcgamesn.com/slay-the-spire-2/neowsletter-october-2026-next-update
9. PCGamesN 进阶等级说明：https://www.pcgamesn.com/slay-the-spire-2/ascension-levels
