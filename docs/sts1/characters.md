# 《杀戮尖塔 1》可玩角色研究：铁甲战士 / 寂静猎手 / 故障机器人 / 观者

> 用途：网页复刻开发参考。所有数值基于 Slay the Spire 1 正式版（Steam，Mega Crit），以 slaythespire.wiki.gg 为准，查证日期 2026-11-09。卡牌数值格式统一为「基础值（升级后）」。进阶(Ascension)为难度系统，其中进阶 14(A14) 会下调角色初始最大 HP，表中单独标注。

## 0. 四角色总览

| 项目 | 铁甲战士 Ironclad（红） | 寂静猎手 Silent（绿） | 故障机器人 Defect（蓝） | 观者 Watcher（紫） |
|---|---|---|---|---|
| 初始最大 HP | 80（A14：75） | 70（A14：66） | 75（A14：71） | 72（A14：68） |
| 每回合起始能量(Energy) | 3 | 3 | 3 | 3 |
| 起始卡组张数 | 10 | 12 | 10 | 10 |
| 起始遗物 | 燃烧之血(Burning Blood) | 蛇戒(Ring of the Snake) | 破裂核心(Cracked Core) | 圣水(Pure Water) |
| 卡池规模（普通卡合计） | 72（20普/36罕/16稀） | 71（19普/33罕/19稀） | 71（18普/36罕/17稀） | 71（19普/35罕/17稀） |
| 核心专属机制 | 力量(Strength)、消耗(Exhaust)、自损换资源 | 中毒(Poison)、弃牌(Discard)、无实体刀(Shiv) | 充能球(Orb)、聚焦(Focus) | 姿态(Stance)、保留(Retain)、占卜(Scry) |
| 解锁条件 | 初始可用 | 用铁甲战士完成任意一局（死亡也算完成，无需通关） | 用寂静猎手完成任意一局（死亡也算完成） | 用任意基础角色在非种子(non-seeded)局中击败第三幕首领 |

补充：四角色均有 11 个（铁甲/寂静）或 9 个（机器人/观者）角色专属遗物（含起始遗物）；每个角色另有 3 个专属药水。起始遗物可在击败首领后从首领遗物三选一中被「升级版」替换（详见各角色章节）。

---

## 1. 铁甲战士（Ironclad，红色）

剩余的铁血战士，出卖灵魂以驾驭恶魔之力。定位：正面硬刚、以 HP 换资源、越战越强的力量型角色。

### 1.1 基础数据

| 项目 | 数值 | 说明 |
|---|---|---|
| 初始最大 HP | 80（A14：75） | 全角色最高 |
| 每回合能量 | 3 | |
| 起始遗物 | 燃烧之血(Burning Blood) | 每场战斗结束时回复 6 HP |
| 起始遗物替换 | 黑血(Black Blood)（首领遗物） | 替换燃烧之血，每场战斗结束回复 12 HP |
| 卡池 | 72 张 | 普通 20 / 罕见 36 / 稀有 16 |

### 1.2 起始卡组（10 张）

| 卡牌 | 费用 | 类型 | 数量 | 效果 |
|---|---|---|---|---|
| 打击(Strike) | 1 | 攻击 | ×5 | 造成 6（9）伤害 |
| 防御(Defend) | 1 | 技能 | ×4 | 获得 5（8）格挡(Block) |
| 猛击(Bash) | 2 | 攻击 | ×1 | 造成 8（10）伤害，施加 2（3）易伤(Vulnerable) |

### 1.3 专属机制详解

**关于「怒气(Rage)」的查证结论**：StS1 的铁甲战士**没有**类似「怒气槽」的持续资源系统。怒气(Rage) 只是一张专属技能卡：0 费，本回合每打出 1 张攻击牌，获得 3（5）格挡。铁甲战士真正的标志性机制是以下四条：

1. **力量(Strength)堆叠**：每 1 点力量使攻击牌伤害 +1（多段攻击每段都吃加成）。铁甲战士拥有全游戏最强的力量获取与倍增手段（Inflame、Demon Form、Limit Break 等，见流派一）。力量上不封顶。
2. **消耗(Exhaust)体系**：被消耗的牌本场战斗移出（进入消耗堆）。铁甲战士有大量「消耗 ×收益」卡（Feel No Pain、Dark Embrace、Sentinel、Corruption），也有 Exhume 可从消耗堆回收 1 张牌——是全游戏唯一取回消耗牌的手段。
3. **以 HP 换资源**：Rupture（失去 HP 获力量）、Offering（失 6 HP 换 2 能量+抽 3）、Bloodletting（失 3 HP 换 2 能量）等；配合起始遗物的战后回 6 HP 与吸血卡 Reaper、Feed 形成续航。
4. **格挡(Block)永驻**：Barricade 使格挡不再在回合开始时清空，由此衍生「格挡即是生命/伤害」的独特防御体系（见流派二）。

关键基础规则（复刻必用）：易伤(Vulnerable)=受到攻击伤害 +50%；虚弱(Weak)=敌人攻击伤害 -25%；格挡(Block)在回合开始清空（Barricade/例外）。

### 1.4 成熟流派（Archetype）

#### 流派 A：力量流（Strength）
- **核心卡**：燃烧(Inflame)（1 费能力：立即获得 2/3 力量）；弱点洞察(Spot Weakness)（1 费：敌人有攻击意图时获得 3/4 力量）；恶魔形态(Demon Form)（3 费能力：每回合开始获得 2/3 力量，持续增长引擎）；极限突破(Limit Break)（1 费技能：力量翻倍，基础版消耗，升级后不消耗）；巨刃(Heavy Blade)（2 费：14 伤害，力量按 3/5 倍计入）；旋风斩(Whirlwind)（X 费：对全体造成 5/8 伤害 ×X 次）。
- **关键遗物**：红颅骨(Red Skull)（HP≤50% 时 +3 力量）、硫磺石(Brimstone)（每回合开始 +2 力量，但全体敌人也 +1 力量）、纸蛙(Paper Phrog)（易伤增伤 50%→75%，与猛击/震波联动）。
- **思路**：前期用 Inflame/Spot Weakness 攒力量，中期 Demon Form/Limit Break 指数成长，用 Heavy Blade/Whirlwind 这类「力量多段计入」的卡收割。力量是铁甲战士的万能乘区，任何流派都兼容。

#### 流派 B：壁垒格挡流（Barricade / Body Slam）
- **核心卡**：壁垒(Barricade)（3/2 费能力：格挡不再清空）；身体猛击(Body Slam)（1/0 费攻击：造成等同当前格挡值的伤害）；掘壕(Entrench)（2/1 费：格挡值翻倍）；坚不可摧(Impervious)（2 费：30/40 格挡，消耗）；强行通过(Power Through)（1 费：往手里加 2 张伤口(Wound)，获得 15/20 格挡）；金属化(Metallicize)（1 费能力：每回合结束获得 3/4 格挡）；粉碎者(Juggernaut)（2 费能力：每当获得格挡，对随机敌人造成 5/7 伤害）。
- **关键遗物**：自塑黏土(Self-Forming Clay)（失去 HP 时下回合获得 3 格挡）。
- **思路**：壁垒起手后格挡永久累积，Entrench 翻倍、Power Through 把伤口变资源，最后 Body Slam 用格挡值一键输出。Juggernaut 提供第二条输出轴。对精英/首领的长战斗极强。

#### 流派 C：消耗流（Exhaust / Corruption）
- **核心卡**：腐化(Corruption)（3/2 费能力：技能牌全部变 0 费但打出即消耗）；暗黑拥抱(Dark Embrace)（2/1 费能力：每当 1 张牌被消耗，抽 1/2 张）；无痛(Feel No Pain)（1 费能力：每当消耗 1 张牌获得 3/4 格挡）；哨卫(Sentinel)（1 费：5/8 格挡；若被消耗改为获得 2/3 能量）；第二气息(Second Wind)（1 费：消耗手中所有非攻击牌，每张获得 5/7 格挡）；燃烧契约(Burning Pact)（1 费：消耗 1 张手牌，抽 2/3 张）；浩劫(Havoc)（1/0 费：打出抽牌堆顶牌并消耗）；掘墓(Exhume)（1/0 费：将 1 张消耗堆的牌放回手牌，消耗自身）。
- **关键遗物**：卡戎之灰(Charon's Ashes)（每当消耗 1 张牌，对全体敌人造成 3 伤害）；死枝(Dead Branch)（公共稀有遗物，铁甲解锁 5 之一：每当消耗 1 张牌，随机将 1 张牌加入手牌，配合 Corruption 近乎无限资源）。
- **思路**：Corruption 打开后 0 费技能流 + Dark Embrace 抽牌 + Feel No Pain 格挡，形成「消耗即资源」永动机；卡组越薄越强。Immolate/Wild Strike 产出的状态牌(Burn/Wound) 反而是 Power Through/Evolve 的燃料。

#### 流派 D：自损流（HP 资源化 / Rupture）
- **核心卡**：破裂(Rupture)（1 费能力：每当因卡牌失去 HP，获得 1/2 力量）；献祭(Offering)（0 费：失去 6 HP，获得 2 能量，抽 3/5 张，消耗）；放血(Bloodletting)（0 费：失去 3 HP，获得 2/3 能量）；收割者(Reaper)（2 费：对全体 4/5 伤害并回复等同未格挡伤害的 HP，消耗）；吞噬(Feed)（1 费：10/12 伤害，若击杀则最大 HP +3/4，消耗）；怒气(Rage)（0 费：本回合每打出 1 张攻击牌获得 3/5 格挡）。
- **关键遗物**：符文立方体(Runic Cube)（每当失去 HP，抽 1 张牌）；自塑黏土(Self-Forming Clay)。
- **思路**：主动用 HP 换能量/抽牌/力量（Rupture 把每次自损变成永久成长），靠起始遗物 Burning Blood 战后回复 + Reaper/Feed 战内回复回血。血线管理是核心技巧。

#### 流派 E：易伤爆发流（Vulnerable）
- **核心卡**：猛击(Bash)（起始牌）；震波(Shockwave)（2 费：对全体施加 3/5 易伤+虚弱，消耗）；缴械(Disarm)（1 费：敌人 -2/3 力量，消耗）。
- **关键遗物**：纸蛙(Paper Phrog)（易伤受伤从 +50% 提到 +75%）；冠军腰带(Champion Belt)（施加易伤的同时施加 1 虚弱，即易伤敌人打不死你）。
- **思路**：前期围绕 Bash 的 2 层易伤打 3 回合爆发窗口，配合 Phrog 每次易伤期间攻击收益 ×1.75。常作为力量流的子轴而非独立成型。

### 1.5 铁甲战士专属遗物（11 件）

| 遗物 | 稀有度/来源 | 效果 |
|---|---|---|
| 燃烧之血(Burning Blood) | 起始 | 每场战斗结束回复 6 HP |
| 红颅骨(Red Skull) | 普通 | HP≤50% 期间获得 3 力量 |
| 纸蛙(Paper Phrog) | 罕见 | 易伤敌人的受伤增幅从 50% 提升至 75% |
| 自塑黏土(Self-Forming Clay) | 罕见 | 每当失去 HP，下回合获得 3 格挡 |
| 冠军腰带(Champion Belt) | 稀有 | 每当施加易伤，同时施加 1 虚弱 |
| 卡戎之灰(Charon's Ashes) | 稀有 | 每当消耗 1 张牌，对全体敌人造成 3 伤害 |
| 魔法之花(Magic Flower) | 稀有 | 战斗中治疗效果 +50% |
| 黑血(Black Blood) | 首领 | 替换燃烧之血；每场战斗结束回复 12 HP |
| 痛苦烙印(Mark of Pain) | 首领 | 每回合开始获得 1 能量；每场战斗开始将 2 张伤口(Wound)洗入抽牌堆 |
| 符文立方体(Runic Cube) | 首领 | 每当失去 HP，抽 1 张牌 |
| 硫磺石(Brimstone) | 商店 | 每回合开始获得 2 力量，全体敌人获得 1 力量 |

专属药水：血瓶(Blood Potion)（普通：回复 20% 最大 HP）、灵药(Elixir)（罕见：消耗手牌中任意数量的牌）、铁之心(Heart of Iron)（稀有：获得 6 力量）。药水效果为次要参考项，药水不可升级。

### 1.6 解锁

初始可用。角色专属解锁共 5 级（完成该角色的游戏局即推进，输赢均可）：

| 级别 | 解锁内容 |
|---|---|
| 1 | 卡牌：巨刃(Heavy Blade)、弱点洞察(Spot Weakness)、极限突破(Limit Break) |
| 2 | 遗物（公共）：御守(Omamori)、祈祷轮(Prayer Wheel)、铲子(Shovel) |
| 3 | 卡牌：狂野打击(Wild Strike)、进化(Evolve)、焚毁(Immolate) |
| 4 | 卡牌：浩劫(Havoc)、哨卫(Sentinel)、掘墓(Exhume) |
| 5 | 遗物（公共）：蓝蜡烛(Blue Candle)、死枝(Dead Branch)、歌之碗(Singing Bowl) |

---

## 2. 寂静猎手（Silent，绿色）

来自雾之国的致命女猎手，以匕首与毒药诛敌。定位：多机制卡组操控、DoT（持续伤害）、弃牌引擎。

### 2.1 基础数据

| 项目 | 数值 | 说明 |
|---|---|---|
| 初始最大 HP | 70（A14：66） | 全角色最低 |
| 每回合能量 | 3 | |
| 起始遗物 | 蛇戒(Ring of the Snake) | 每场战斗的第 1 回合额外抽 2 张牌 |
| 起始遗物替换 | 蛇之戒(Ring of the Serpent)（首领遗物） | 替换蛇戒；每回合开始额外抽 1 张牌 |
| 卡池 | 71 张 | 普通 19 / 罕见 33 / 稀有 19 |

### 2.2 起始卡组（12 张，注意比其他角色多 2 张）

| 卡牌 | 费用 | 类型 | 数量 | 效果 |
|---|---|---|---|---|
| 打击(Strike) | 1 | 攻击 | ×5 | 造成 6（9）伤害 |
| 防御(Defend) | 1 | 技能 | ×5 | 获得 5（8）格挡 |
| 幸存者(Survivor) | 1 | 技能 | ×1 | 获得 8（11）格挡，弃 1 张手牌 |
| 致命一击(Neutralize) | 0 | 攻击 | ×1 | 造成 3（4）伤害，施加 1（2）虚弱 |

> 注意：任务书中的「10 张起始卡组」假设对寂静猎手不成立——她起始为 5 打击+5 防御+幸存者+致命一击共 12 张（蛇戒第 1 回合多抽 2 张用于开局爆发）。其余三角色为 10 张。

### 2.3 专属机制详解

1. **中毒(Poison)**：敌方身上的中毒为层数叠加 Debuff。结算规则：敌人回合开始时，损失等同当前中毒层数的 HP（**无视格挡**），然后中毒 -1 层。因此 N 层中毒总伤害为 N+(N-1)+…+1 = N(N+1)/2。神器(Artifact)可抵挡施加。
2. **弃牌(Discard)**：从手牌主动弃至弃牌堆换取收益。重要规则：**回合结束的手牌弃置不触发任何弃牌效果**；被弃的 Reflex/Tactician 立即触发效果。观者的占卜(Scry)弃牌同样不触发弃牌效果。
3. **无实体刀(Shiv)**：0 费攻击牌，造成 4（6）伤害，消耗(Exhaust)。只能由卡牌/遗物生成，不进卡组。数量爆炸后靠 Accuracy、Wrist Blade 等放大单刀收益。

### 2.4 成熟流派

#### 流派 A：中毒流（Poison）
- **核心卡**：致命毒药(Deadly Poison)（1 费：施加 5/7 中毒）；毒雾(Noxious Fumes)（1 费能力：每回合开始对全体施加 2/3 中毒）；弹跳药瓶(Bouncing Flask)（2 费：对随机敌人施加 3 中毒 ×3/4 次）；催化剂(Catalyst)（1 费：使目标中毒层数翻倍/三倍，消耗）；尸爆(Corpse Explosion)（2 费：施加 6/9 中毒；该敌人死亡时对全体敌人造成等同其最大 HP 的伤害）。
- **关键遗物**：蛇颅骨(Snecko Skull)（每次施加中毒额外 +1 层）；扭曲漏斗(Twisted Funnel)（每场战斗开始对全体敌人施加 4 中毒）；样本(The Specimen)（敌人死亡时其中毒转移给随机敌人）。
- **思路**：毒雾每回合自动叠毒做底，关键时刻 Catalyst 翻倍/三倍引爆；尸爆将单体毒转化为全体真伤斩杀。中毒无视格挡，是打高防敌人的答案。

#### 流派 B：无实体刀流（Shiv）
- **核心卡**：剑刃之舞(Blade Dance)（1 费：将 3/4 张 Shiv 加入手牌）；暗斗篷与匕首(Cloak and Dagger)（1 费：6 格挡 + 加入 1/2 张 Shiv）；钢铁风暴(Storm of Steel)（1/0 费：弃掉整手牌，每弃 1 张加入 1 张 Shiv，升级后生成的是 Shiv+）；精准(Accuracy)（1 费能力：Shiv 伤害 +4/+6）；终结技(Finisher)（1 费：本回合每打出过 1 张攻击牌造成 6/8 伤害）；千刀万剐(A Thousand Cuts)（2 费能力：每打出 1 张牌对全体造成 1/2 伤害）；残像(After Image)（1 费能力：每打出 1 张牌获得 1 格挡）。
- **关键遗物**：忍者卷轴(Ninja Scroll)（每场战斗开始将 3 张 Shiv 加入手牌）；袖里剑(Wrist Blade)（0 费攻击牌伤害 +4）。
- **思路**：0 费 Shiv 连发 ×Accuracy 加成 + Finisher 收尾；A Thousand Cuts/After Image 把「多打出牌」本身变成输出/防御。手速流，对单回合爆发极强。

#### 流派 C：弃牌流（Discard Engine）
- **核心卡**：预谋(Prepared)（0 费：抽 1/2 张，弃 1/2 张）；精算豪赌(Calculated Gamble)（0 费：弃掉整手牌再抽等量，升级后不消耗）；专注(Concentrate)（0 费：弃 3/2 张牌，获得 2 能量）；走私者的工具(Tools of the Trade)（1/0 费能力：每回合开始抽 1 张弃 1 张）；反射(Reflex)（不可打出；从手牌被弃时抽 2/3 张）；战术家(Tactician)（不可打出；从手牌被弃时获得 1/2 能量）；挖心(Eviscerate)（基础 3 费：本回合每弃 1 张牌费用 -1；造成 7/9 伤害 ×3 次）；鬼祟打击(Sneaky Strike)（2 费：12/16 伤害；若本回合弃过牌则返还 2 能量）。
- **关键遗物**：顽强绷带(Tough Bandages)（回合内每弃 1 张牌获得 3 格挡）；铜铃(Tingsha)（回合内每弃 1 张牌对随机敌人造成 3 伤害）；悬浮风筝(Hovering Kite)（每回合第 1 次弃牌时获得 1 能量）。
- **思路**：弃牌既是过牌、回能（Tactician/Kite/Concentrate）也是伤害（Tingsha/Eviscerate）。Reflex/Tactician 是「不可打出但被弃即赚」的双面卡，需要卡组里保留触发器。运转顺畅后每回合打出 10+ 张牌。

#### 流派 D：敏捷格挡流（Dexterity / Tank）
- **核心卡**：步法(Footwork)（1 费能力：+2/3 敏捷(Dexterity)，敏捷使每张格挡牌 +1 格挡/层）；残像(After Image)（每打 1 张牌 +1 格挡）；模糊(Blur)（1 费：格挡在下 1/2 个回合不清除）；扫堂腿(Leg Sweep)（2 费：施加 2/3 虚弱 + 11/14 格挡）；刺耳哀嚎(Piercing Wail)（1 费：全体敌人本回合 -6/8 力量，消耗）；幽灵形态(Wraith Form)（3 费：获得 2/3 层无形(Intangible)——每次受伤降为 1 点；代价是每回合开始 -1 敏捷）。
- **关键遗物**：纸鹤(Paper Krane)（虚弱敌人的伤害降低从 25% 提高到 40%）。
- **思路**：多层 Footwork + 虚弱/减力量叠乘防御，Wraith Form 无形化对抗超高伤害首领。成型后几乎不掉血，靠毒/千刀慢慢磨死对手。

#### 流派 E：空抽牌堆终结流（Deck Control / Grand Finale）
- **核心卡**：大终曲(Grand Finale)（0 费：**仅当抽牌堆为空时可打出**，对全体造成 50/60 伤害）；深谋远虑(Well-Laid Plans)（1 费能力：回合结束可保留 1/2 张手牌）；布局(Setup)（1/0 费：将 1 张手牌放到抽牌堆顶且其费用降为 0 直到打出）；专长(Expertise)（1 费：抽牌直到手牌 6/7 张）。
- **关键遗物**：蛇之戒(Ring of the Serpent)（每回合多抽 1，加速排空抽牌堆）。
- **思路**：控制抽牌堆张数与节奏，在抽牌堆恰好排空的回合打出 0 费 50 点全体伤害；Well-Laid Plans 留住大终曲不被弃掉。

### 2.5 寂静猎手专属遗物（11 件）

| 遗物 | 稀有度/来源 | 效果 |
|---|---|---|
| 蛇戒(Ring of the Snake) | 起始 | 每场战斗第 1 回合额外抽 2 张牌 |
| 蛇颅骨(Snecko Skull) | 普通 | 每当施加中毒，额外施加 1 层 |
| 纸鹤(Paper Krane) | 罕见 | 虚弱敌人的伤害降低从 25% 提升到 40% |
| 忍者卷轴(Ninja Scroll) | 罕见 | 每场战斗开始，将 3 张 Shiv 加入手牌 |
| 顽强绷带(Tough Bandages) | 稀有 | 回合内每弃 1 张牌获得 3 格挡 |
| 铜铃(Tingsha) | 稀有 | 回合内每弃 1 张牌对随机敌人造成 3 伤害 |
| 样本(The Specimen) | 稀有 | 敌人死亡时，其身上的中毒转移给随机敌人 |
| 悬浮风筝(Hovering Kite) | 首领 | 每回合第 1 次弃牌时获得 1 能量 |
| 袖里剑(Wrist Blade) | 首领 | 0 费攻击牌伤害 +4 |
| 蛇之戒(Ring of the Serpent) | 首领 | 替换蛇戒；每回合开始额外抽 1 张牌 |
| 扭曲漏斗(Twisted Funnel) | 商店 | 每场战斗开始，对全体敌人施加 4 中毒 |

专属药水：毒药(Poison Potion)（施加 6 中毒）、诡计药水(Cunning Potion)（加入 3 张 Shiv）、罐中幽灵(Ghost in a Jar)（获得 1 无形）。

### 2.6 解锁

**解锁角色**：用铁甲战士完成一局游戏（死亡也算完成，无需通关）。角色专属内容解锁 5 级：

| 级别 | 解锁内容 |
|---|---|
| 1 | 卡牌：灾祸(Bane)、催化剂(Catalyst)、尸爆(Corpse Explosion) |
| 2 | 遗物（公共）：巫毒娃娃(Du-Vu Doll)、微笑面具(Smiling Mask)、小宝箱(Tiny Chest) |
| 3 | 卡牌：暗斗篷与匕首(Cloak and Dagger)、精准(Accuracy)、钢铁风暴(Storm of Steel) |
| 4 | 遗物（公共）：战争艺术(Art of War)、信使(The Courier)、潘多拉魔盒(Pandora's Box) |
| 5 | 卡牌：专注(Concentrate)、布局(Setup)、大终曲(Grand Finale) |

---

## 3. 故障机器人（Defect，蓝色）

获得自我意识的战斗机关，用古代科技操纵充能球。定位：机制最复杂的成长/体系角色，充能球是全游戏最独特的引擎。

### 3.1 基础数据

| 项目 | 数值 | 说明 |
|---|---|---|
| 初始最大 HP | 75（A14：71） | |
| 每回合能量 | 3 | |
| 起始遗物 | 破裂核心(Cracked Core) | 每场战斗开始时引导(Channel) 1 颗闪电(Lightning)球 |
| 起始遗物替换 | 冰霜核心(Frozen Core)（首领遗物） | 替换破裂核心；回合结束时若有空球槽，引导 1 颗冰霜(Frost)球 |
| 卡池 | 71 张 | 普通 18 / 罕见 36 / 稀有 17 |

### 3.2 起始卡组（10 张）

| 卡牌 | 费用 | 类型 | 数量 | 效果 |
|---|---|---|---|---|
| 打击(Strike) | 1 | 攻击 | ×4 | 造成 6（9）伤害 |
| 防御(Defend) | 1 | 技能 | ×4 | 获得 5（8）格挡 |
| 电击(Zap) | 1（0） | 技能 | ×1 | 引导 1 颗闪电球 |
| 双重施法(Dualcast) | 1（0） | 技能 | ×1 | 激发(Evoke)你的下一颗球，两次 |

### 3.3 充能球(Orb)系统详解

**充能球类型（共 4 种）**：

| 球类型 | 被动(Passive)效果（每回合结束时触发） | 激发(Evoke)效果 | 受聚焦影响 |
|---|---|---|---|
| 闪电(Lightning) | 对随机敌人造成 3 伤害 | 对随机敌人造成 8 伤害 | 是（每层聚焦 +1） |
| 冰霜(Frost) | 获得 2 格挡 | 获得 5 格挡 | 是（每层聚焦 +1） |
| 黑暗(Dark) | 存储伤害 +6（每回合累积） | 对当前 HP 最低的敌人造成全部存储伤害 | 是（每层聚焦使被动增量 +1；激发基础存储值不受聚焦削减） |
| 等离子体(Plasma) | 回合开始时获得 1 能量 | 获得 2 能量 | **否**（完全不受聚焦影响） |

**引导(Channel)/激发(Evoke)/球槽(Orb Slot)规则**：
- 初始球槽 3 个。引导新球放入第一个空槽，球按引导先后**从左到右**排列（最左为最旧）。
- 球槽已满时再引导，最左（最旧）的球会被**自动激发**腾出位置。
- 「激发你的下一颗球」类卡牌（Dualcast/Multi-Cast/Recursion）作用于最左（最旧）的球。
- 被动效果在回合结束时从左到右依次触发。
- 球槽可增减：电容器(Capacitor) +2/3 槽、符文电容器(Runic Capacitor) 开局 +3 槽、插入器(Inserter) 每 2 回合 +1 槽、损耗(Consume) -1 槽。

**聚焦(Focus)机制**：聚焦是增益 Buff，每层使闪电/冰霜/黑暗球的**被动与激发数值 +1**（等离子体除外）。是机器人的全局乘区，等同铁甲战士的力量。来源：碎片化(Defragment)（1 费能力 +1/2）、损耗(Consume)（2 费 +2/3 聚焦但 -1 球槽）、偏置认知(Biased Cognition)（1 费 +4/5 聚焦，但每回合开始 -1 聚焦）、数据磁盘(Data Disk)（遗物，开局 +1）。

**锁定(Lock-On)**：Debuff 卡施加于敌人，使其受到的闪电/黑暗球伤害 +50%。

### 3.4 成熟流派

#### 流派 A：冰霜防御流（Frost Turtle）
- **核心卡**：冰川(Glacier)（2 费：7/10 格挡 + 引导 2 冰霜）；冷静头脑(Coolheaded)（1 费：引导 1 冰霜 + 抽 1/2 张）；专注防御类聚焦卡（Defragment/Biased Cognition）；回路(Loop)（1 费能力：每回合开始让下一颗球的被动额外触发 1/2 次）；电容器(Capacitor)（+2/3 球槽）。
- **关键遗物**：冰霜核心(Frozen Core)（回合结束有空槽就补 1 冰霜）；符文电容器(Runic Capacitor)（开局 +3 球槽）；插入器(Inserter)（每 2 回合 +1 球槽）；数据磁盘(Data Disk)（开局 +1 聚焦）。
- **思路**：冰霜球被动每颗每回合 +2 格挡（×聚焦），球槽越多、聚焦越高，每回合自动格挡 20+；核心是「攒球槽 + 攒聚焦」，输出交给黑暗球或 0 费循环。

#### 流派 B：闪电流（Lightning Spam）
- **核心卡**：球状闪电(Ball Lightning)（1 费：7/10 伤害 + 引导 1 闪电）；风暴(Tempest)（X 费：引导 X/X+1 颗闪电，消耗）；电动力学(Electrodynamics)（2 费能力：闪电伤害改为命中全体敌人）；雷霆一击(Thunder Strike)（3 费：本场每引导过 1 颗闪电，对随机敌人造成 7/9 伤害）；静电释放(Static Discharge)（1 费能力：每当受到攻击伤害，引导 1 闪电）；风暴之眼(Storm)（1 费能力：每打出 1 张能力牌引导 1 闪电）；混乱(Chaos)（1 费：引导 1/2 颗随机球）。
- **关键遗物**：破裂核心(Cracked Core)（开局 1 闪电）。
- **思路**：量产闪电球靠被动磨血 + Electrodynamics 变全体；Thunder Strike 是「本场累计引导数」×伤害的终结技。注意闪电被动单颗仅 3 伤，需要聚焦/数量放大。

#### 流派 C：黑暗球流（Dark Charge）
- **核心卡**：毁灭与阴霾(Doom and Gloom)（2 费：全体 10/14 伤害 + 引导 1 黑暗）；黑暗(Darkness)（1 费：引导 1 黑暗；升级后额外触发所有黑暗球被动）；递归(Recursion)（1/0 费：激发下一颗球并重新引导同类型球）；多重施法(Multi-Cast)（X 费：激发下一颗球 X/X+1 次）；回路(Loop)。
- **关键遗物**：共生病毒(Symbiotic Virus)（每场战斗开始引导 1 黑暗）；镀金线缆(Gold-Plated Cables)（最右侧的球被动额外触发一次——配合黑暗球双倍存储）。
- **思路**：黑暗球靠被动回合积累存储伤害（+6/回合，受聚焦加成），养大后 Multi-Cast/Recursion 连续激发，对最低 HP 敌人打出数百点单发。需要防御撑到蓄满。

#### 流派 D：聚焦流（Focus / 体系核心）
- **核心卡**：碎片化(Defragment)（1 费 +1/2 聚焦）；损耗(Consume)（2 费 +2/3 聚焦但 -1 球槽）；偏置认知(Biased Cognition)（1 费 +4/5 聚焦，每回合 -1 聚焦）；重编程(Reprogram)（1 费：-1/2 聚焦，+1/2 力量与敏捷）。
- **关键遗物**：数据磁盘(Data Disk)（开局 +1 聚焦）；情感芯片(Emotion Chip)（若上一回合失去过 HP，本回合开始触发所有球的被动）。
- **思路**：聚焦本身不是流派而是乘区，双聚焦卡+遗物后每颗冰霜=4+格挡、每颗闪电被动=5 伤。Reprogram 反向流派则放弃球系，聚焦换力量/敏捷走普攻路线。

#### 流派 E：0 费循环流（Claw / All for One）
- **核心卡**：利爪(Claw)（0 费：3/5 伤害；每打出一张利爪，本场所有利爪伤害 +2）；一体适用(All for One)（2 费：10/14 伤害；将弃牌堆中所有 0 费牌收回手牌）；全息影像(Hologram)（1 费：3/5 格挡；从弃牌堆取 1 张牌到手牌）；回弹(Rebound)（1 费：3/5 格挡；本回合下一张打出的牌置于抽牌堆顶）；裂变(Fission)（0 费：激发所有球，每颗获得 1 能量并抽 1 张牌，消耗）。
- **思路**：利爪滚雪球（全场利爪共享 +2 伤害）+ All for One 无限回收 0 费牌，一回合打出 10+ 张 0 费卡。配合 TURBO（解锁卡，获得 2 能量）等供能。

#### 流派 F：等离子体能量流（Plasma / 大费卡）
- **核心卡**：流星雨(Meteor Strike)（5 费：24/30 伤害 + 引导 3 颗等离子体）；彩虹(Rainbow)（2 费：引导闪电/冰霜/黑暗各 1，升级后不消耗）；寻找(Seek)（0 费：从抽牌堆取 1/2 张牌到手牌，消耗）；回声形态(Echo Form)（3 费能力：每回合打出的第一张牌被播放两次）；创造型 AI(Creative AI)（3/2 费能力：每回合开始随机将 1 张能力牌加入手牌）；机器学习(Machine Learning)（1 费能力：每回合开始多抽 1/2 张）。
- **关键遗物**：核能电池(Nuclear Battery)（每场战斗开始引导 1 等离子体）。
- **思路**：等离子体球每回合供 1 能量、激发 2 能量（不受聚焦），专供 Meteor Strike/Seek 这类高费大件；Echo Form 让每回合首牌双发。中期成型后能量溢出。

### 3.5 故障机器人专属遗物（9 件）

| 遗物 | 稀有度/来源 | 效果 |
|---|---|---|
| 破裂核心(Cracked Core) | 起始 | 每场战斗开始引导 1 颗闪电球 |
| 数据磁盘(Data Disk) | 普通 | 每场战斗开始获得 1 聚焦 |
| 镀金线缆(Gold-Plated Cables) | 罕见 | 最右侧充能球的被动效果额外触发一次 |
| 共生病毒(Symbiotic Virus) | 罕见 | 每场战斗开始引导 1 颗黑暗球 |
| 情感芯片(Emotion Chip) | 稀有 | 若上一回合失去过 HP，本回合开始时触发所有球的被动效果 |
| 冰霜核心(Frozen Core) | 首领 | 替换破裂核心；回合结束时若有空球槽，引导 1 颗冰霜球 |
| 插入器(Inserter) | 首领 | 每 2 回合获得 1 个球槽 |
| 核能电池(Nuclear Battery) | 首领 | 每场战斗开始引导 1 颗等离子体球 |
| 符文电容器(Runic Capacitor) | 商店 | 每场战斗开始时额外获得 3 个球槽 |

专属药水：聚焦药水(Focus Potion)（普通：获得 2 聚焦）、容量药水(Potion of Capacity)（罕见：获得 2 球槽）、黑暗精华(Essence of Darkness)（稀有：每个球槽引导 1 颗黑暗球）。

### 3.6 解锁

**解锁角色**：用寂静猎手完成一局游戏（死亡也算完成）。角色专属内容解锁 5 级：

| 级别 | 解锁内容 |
|---|---|
| 1 | 卡牌：回弹(Rebound)、平衡(Equilibrium)、回声形态(Echo Form) |
| 2 | 卡牌：TURBO、裂杀(Sunder)、流星雨(Meteor Strike) |
| 3 | 卡牌：超光束(Hyperbeam)（26/34 全体伤害，-3 聚焦）、回收(Recycle)、核心涌动(Core Surge) |
| 4 | 遗物：镀金线缆(Gold-Plated Cables)、萝卜(Turnip)（公共）、符文电容器(Runic Capacitor) |
| 5 | 遗物：数据磁盘(Data Disk)、共生病毒(Symbiotic Virus)、情感芯片(Emotion Chip) |

---

## 4. 观者（Watcher，紫色）

前来评估尖塔的盲眼苦行者，姿态大师。定位：高风险高回报的伤害倍率角色，公认全游戏强度最高。

### 4.1 基础数据

| 项目 | 数值 | 说明 |
|---|---|---|
| 初始最大 HP | 72（A14：68） | |
| 每回合能量 | 3 | |
| 起始遗物 | 圣水(Pure Water) | 每场战斗开始时，将 1 张奇迹(Miracle)加入手牌 |
| 起始遗物替换 | 圣神之水(Holy Water)（首领遗物） | 替换圣水；每场战斗开始时将 3 张奇迹加入手牌 |
| 卡池 | 71 张 | 普通 19 / 罕见 35 / 稀有 17 |

### 4.2 起始卡组（10 张）

| 卡牌 | 费用 | 类型 | 数量 | 效果 |
|---|---|---|---|---|
| 打击(Strike) | 1 | 攻击 | ×4 | 造成 6（9）伤害 |
| 防御(Defend) | 1 | 技能 | ×4 | 获得 5（8）格挡 |
| 喷发(Eruption) | 2（1） | 攻击 | ×1 | 造成 9 伤害，进入愤怒(Wrath)姿态 |
| 警戒(Vigilance) | 2 | 技能 | ×1 | 获得 8（12）格挡，进入平静(Calm)姿态 |

每场战斗开始时处于无姿态(Neutral)；奇迹(Miracle)为 0 费无色技能：保留(Retain)，获得 1（2）能量，消耗(Exhaust)——只在战斗中由遗物/卡牌生成。

### 4.3 姿态(Stance)系统详解

**同一时刻只能处于一种姿态；无姿态也算一种（无任何加成）。**

| 姿态 | 效果 | 进入/退出 |
|---|---|---|
| 无姿态(Neutral) | 无加成无惩罚 | 初始状态 |
| 平静(Calm) | 自身无直接加成；**离开平静切换到其他姿态时，获得 2 能量（持有紫莲(Violet Lotus) 时为 3）** | Vigilance、Inner Peace、Fear No Evil、Meditate 等 |
| 愤怒(Wrath) | **你造成的攻击(Attack)伤害 ×2；受到的敌人攻击伤害也 ×2**（只影响攻击牌伤害，不影响中毒/荆棘等非攻击伤害） | Eruption、Tantrum 等 |
| 神性(Divinity) | **造成的攻击伤害 ×3；进入时立即获得 3 能量**；下一回合开始时自动退出神性 | 集满 10 层颂歌(Mantra)或 Blasphemy |

**颂歌(Mantra)**：观者专属计数 Buff。每当累计获得 10 层颂歌立即进入神性；单次获得超过 10 层时溢出部分作废（最多 9 层可结转保留）。

**保留(Retain)**：带保留的牌在回合结束时**不弃置**，持续留到打出。是观者（及部分无色卡）蓄爆的基础。

**占卜(Scry)**：检视抽牌堆顶 X 张牌，可任意弃置其中任意张。占卜的弃置**不触发弃牌(Discard)效果**，本质是卡组过滤。

**退出姿态卡（循环必备）**：空之躯(Empty Body)（1 费：7/10 格挡，退出当前姿态）、空心(Empty Mind)（1 费：退出姿态并抽 2/3 张）、空拳(Empty Fist)（1 费：9/14 伤害，退出姿态）。

### 4.4 成熟流派

#### 流派 A：姿态切换流（Stance Dance / 愤怒循环）
- **核心卡**：喷发(Eruption)（起始牌）；发怒(Tantrum)（1 费：3 伤害 ×3/4 次，进入愤怒，**将自己洗回抽牌堆**）；愤怒冲刺(Rushdown)（1/0 费能力：每当进入愤怒，抽 2 张）；心灵堡垒(Mental Fortress)（1 费能力：每当切换姿态获得 4/6 格挡）；连击拳(Flurry of Blows)（0 费：4/6 伤害；**每当切换姿态，从弃牌堆回到手牌**）；内在平静(Inner Peace)（1 费：若在平静中则抽 3/4 张，否则进入平静）；冥想(Meditate)（1 费：将 1/2 张弃牌堆的牌收回手牌并保留，进入平静，结束回合）。
- **关键遗物**：紫莲(Violet Lotus)（每当退出平静，额外获得 1 能量——平静退出由 2 能量变 3）；泪滴吊坠(Teardrop Locket)（每场战斗以平静姿态开始）；二重性(Duality)（每打出 1 张攻击牌获得 1 层临时敏捷）。
- **思路**：核心循环「平静 → 喷发/发怒（愤怒×2 输出+回能量）→ 退姿态 → 再入平静」。Rushdown 让每次进愤怒白赚 2 张牌，Flurry of Blows 每次切姿态免费回手，一回合切 3-4 次姿态形成伪无限。这是观者胜率最高的流派。

#### 流派 B：神性流（Divinity / Mantra）
- **核心卡**：祈祷(Pray)（1 费：获得 3/4 颂歌，洗 1 张洞察(Insight)入抽牌堆）；俯卧(Prostrate)（0 费：获得 2/3 颂歌 + 4 格挡）；奉献(Devotion)（1 费能力：每回合开始获得 2/3 颂歌）；亵渎(Blasphemy)（1 费：立即进入神性；**下一回合开始时你直接死亡**；升级后带保留，消耗）；神威(Omniscience)（4/3 费：选择抽牌堆中 1 张牌播放两次并消耗）；卓越(Brilliance)（1 费：12/16 伤害 + 本场累计获得的颂歌层数的额外伤害）；奇迹引擎：收集(Collect)（X 费：之后 X 回合每回合将 1 张奇迹+放入手牌）、机械神(Deus Ex Machina)（不可打出；抽到时将 2/3 张奇迹加入手牌并消耗）。
- **关键遗物**：达玛茹(Damaru)（每回合开始获得 1 颂歌）；圣水/圣神之水（开局奇迹）；紫莲。
- **思路**：靠颂歌引擎每 2-3 回合进一次神性（×3 伤害 + 3 能量的一回合），用 Omniscience/大费攻击牌在神性回合倾泻。Blasphemy 是「一回合内秒杀否则死」的赌博键。Brilliance 与颂歌总量联动可做成长轴。

#### 流派 C：平静格挡流（Calm / 减伤）
- **核心卡**：警戒(Vigilance)（起始牌）；内在平静(Inner Peace)；敬畏之惧(Fear No Evil)（1 费：8/11 伤害；若敌人意图为攻击则进入平静）；如水(Like Water)（1 费能力：回合结束时若在平静中，获得 5/7 格挡）；心灵堡垒(Mental Fortress)；挥手(Wave of the Hand)（1 费：本回合每当获得格挡，对全体施加 1/2 虚弱）；握手(Talk to the Hand)（1 费：5/7 伤害；之后每攻击该敌人获得 2/3 格挡，消耗）；停(Halt)（0 费：3/4 格挡；若在愤怒中获得额外 9/14 格挡）。
- **关键遗物**：泪滴吊坠(Teardrop Locket)；紫莲(Violet Lotus)。
- **思路**：常驻平静，靠退出回能 + Like Water/Mental Fortress 被动格挡，挥手/虚弱双减速敌人。节奏慢但极稳，适合没有关键姿态循环组件的局。

#### 流派 D：保留蓄爆流（Retain）
- **核心卡**：风车打击(Windmill Strike)（2 费：7/10 伤害；**每被保留一回合伤害 +4/5**，保留）；飞袖(Flying Sleeves)（1 费：4/6 伤害 ×2 次，保留）；防护(Protect)（2 费：12/16 格挡，保留）；建制的笃定(Establishment)（1 费能力：每当有牌被保留，该牌费用 -1）；冥想(Meditate)。
- **关键遗物**：斗篷扣(Cloak Clasp)（回合结束时每持有 1 张手牌获得 1 格挡）。
- **思路**：多回合把 Windmill Strike 养到 30+ 伤害后 0 费打出；Establishment 把保留的大件降费；Cloak Clasp 让囤牌本身产生格挡。克制多回合长战。

#### 流派 E：占卜过滤流（Scry）
- **核心卡**：先见之明(Foresight)（1 费能力：每回合开始占卜 3/4）；评估(Evaluate)（1 费：6/10 格挡 + 洗 1 张洞察(Insight)入抽牌堆，洞察=0 费保留抽 2/3）；学习(Study)（2/1 费能力：回合结束洗 1 张洞察入抽牌堆）；圣言(Consecrate)（0 费：对全体 5/8 伤害）；卷轴(Scrawl)（1/0 费：抽牌直到手牌满，消耗）。
- **关键遗物**：金瞳(Golden Eye)（每当占卜，额外占卜 2 张）；梅兰日(Melange)（每当洗牌抽牌堆时，占卜 3）。
- **思路**：Scry 不是输出而是质量控制——每回合把垃圾牌从抽牌堆顶筛掉，保证关键牌上手率；洞察持续补充手牌。作为其他流派的润滑剂，纯占卜不成型。

### 4.5 观者专属遗物（9 件）

| 遗物 | 稀有度/来源 | 效果 |
|---|---|---|
| 圣水(Pure Water) | 起始 | 每场战斗开始，将 1 张奇迹(Miracle)加入手牌 |
| 达玛茹(Damaru) | 普通 | 每回合开始获得 1 层颂歌(Mantra) |
| 二重性(Duality) | 罕见 | 每当打出攻击牌，获得 1 层临时敏捷（回合结束消失） |
| 泪滴吊坠(Teardrop Locket) | 罕见 | 每场战斗以平静(Calm)姿态开始 |
| 斗篷扣(Cloak Clasp) | 稀有 | 回合结束时，每持有 1 张手牌获得 1 格挡 |
| 金瞳(Golden Eye) | 稀有 | 每当占卜(Scry)，额外占卜 2 张 |
| 圣神之水(Holy Water) | 首领 | 替换圣水；每场战斗开始，将 3 张奇迹加入手牌 |
| 紫莲(Violet Lotus) | 首领 | 每当退出平静(Calm)，额外获得 1 能量（即 3 能量） |
| 梅兰日(Melange) | 商店 | 每当洗牌抽牌堆，占卜 3 |

专属药水：瓶装奇迹(Bottled Miracle)（将 2 张奇迹加入手牌）、姿态药水(Stance Potion)（选择进入愤怒或平静）、仙馔(Ambrosia)（进入神性）。

### 4.6 解锁

**解锁角色**：用任意基础角色在**非种子**局中击败第三幕首领（即通关一次三幕，自定义模式不算）。角色专属内容解锁 5 级：

| 级别 | 解锁内容 |
|---|---|
| 1 | 卡牌：俯卧(Prostrate)、亵渎(Blasphemy)、奉献(Devotion) |
| 2 | 卡牌：外来影响(Foreign Influence)、阿尔法(Alpha)、心灵堡垒(Mental Fortress) |
| 3 | 卡牌：精神护盾(Spirit Shield)、愿望(Wish)、先见之明(Foresight) |
| 4 | 遗物：阿卡贝科(Akabeko)（公共：每场战斗打出的第一张攻击牌 +8 伤害）、二重性(Duality)、陶瓷鱼(Ceramic Fish)（公共） |
| 5 | 遗物：打击木偶(Strike Dummy)（公共）、泪滴吊坠(Teardrop Locket)、斗篷扣(Cloak Clasp) |

---

## 5. 角色解锁顺序与解锁机制总结

**解锁顺序（对新账号）**：

| 顺序 | 角色 | 条件 |
|---|---|---|
| 1 | 铁甲战士(Ironclad) | 游戏开始即可用 |
| 2 | 寂静猎手(Silent) | 用铁甲战士完成任意一局（死亡也算） |
| 3 | 故障机器人(Defect) | 用寂静猎手完成任意一局（死亡也算） |
| 4 | 观者(Watcher) | 用任意基础角色在非种子局击败第三幕首领 |

**逐级解锁机制**：每个角色有 5 级专属解锁（内容见各章节表格，混合卡牌与遗物）。游戏内机制为：**每用该角色完成一局游戏（无论胜利还是死亡）即推进一级**，解锁的卡牌/遗物进入该角色的卡池/遗物池。此为游戏内实际行为与社区共识；wiki 的 Score 页面另有「局末得分用于解锁」的笼统表述（见「不确定项」）。

**首领遗物替换起始遗物**：击败任意首领会给出 3 选 1 首领遗物，其中可能出现本角色的「起始遗物升级版」（黑血/蛇之戒/冰霜核心/圣神之水），选它即替换起始遗物，其余为通用首领遗物。

---

## 6. 参考来源

数据查证日期：2026-11-09。主来源为社区权威 wiki（slaythespire.wiki.gg，对应 StS1 正式版最新内容）。

### 官方
- Steam 商店页（Mega Crit 官方）: https://store.steampowered.com/app/646570/Slay_the_Spire/
- Mega Crit 官网新闻（角色设定补充）: https://www.megacrit.com/news/2025-10-16-neowsletter-issue-15/

### 角色主页（基础数据/起始卡组/专属遗物/解锁表）
- https://slaythespire.wiki.gg/wiki/Ironclad
- https://slaythespire.wiki.gg/wiki/Silent
- https://slaythespire.wiki.gg/wiki/Defect
- https://slaythespire.wiki.gg/wiki/Watcher

### 系统/机制页
- 遗物总览与稀有度/获取规则: https://slaythespire.wiki.gg/wiki/Relics
- 充能球系统（球类型/被动/激发/聚焦/锁定）: https://slaythespire.wiki.gg/wiki/Orbs
- 姿态定义（四姿态/颂歌规则）: https://slaythespire.wiki.gg/wiki/Stance
- 关键词（能量 3/回合、消耗、弃牌、保留、占卜）: https://slaythespire.wiki.gg/wiki/Keywords
- Buff/Debuff 数值（颂歌/易伤 50%/虚弱 25%/中毒等）: https://slaythespire.wiki.gg/wiki/Buffs
- 四种充能球: https://slaythespire.wiki.gg/wiki/Lightning 、 /wiki/Frost 、 /wiki/Dark 、 /wiki/Plasma
- 解锁与得分: https://slaythespire.wiki.gg/wiki/Score

### 起始/关键卡牌页（数值逐张核对）
- 打击/防御（四色同数值）: https://slaythespire.wiki.gg/wiki/Strike_(Ironclad) 、 /wiki/Defend_(Ironclad) 、 /wiki/Strike_(Silent) 、 /wiki/Defend_(Silent) 、 /wiki/Strike_(Defect) 、 /wiki/Defend_(Defect) 、 /wiki/Strike_(Watcher) 、 /wiki/Defend_(Watcher)
- 起始专属牌: /wiki/Bash 、 /wiki/Survivor 、 /wiki/Neutralize 、 /wiki/Zap 、 /wiki/Dualcast 、 /wiki/Eruption 、 /wiki/Vigilance 、 /wiki/Miracle
- 铁甲战士流派卡: /wiki/Rage 、 /wiki/Inflame 、 /wiki/Demon_Form 、 /wiki/Limit_Break 、 /wiki/Heavy_Blade 、 /wiki/Spot_Weakness 、 /wiki/Whirlwind 、 /wiki/Barricade 、 /wiki/Body_Slam 、 /wiki/Entrench 、 /wiki/Impervious 、 /wiki/Power_Through 、 /wiki/Metallicize 、 /wiki/Juggernaut 、 /wiki/Corruption 、 /wiki/Dark_Embrace 、 /wiki/Feel_No_Pain 、 /wiki/Sentinel 、 /wiki/Second_Wind 、 /wiki/Burning_Pact 、 /wiki/Havoc 、 /wiki/Exhume 、 /wiki/Rupture 、 /wiki/Offering 、 /wiki/Bloodletting 、 /wiki/Reaper 、 /wiki/Feed 、 /wiki/Wild_Strike 、 /wiki/Immolate 、 /wiki/Shockwave 、 /wiki/Disarm 、 /wiki/Perfected_Strike 、 /wiki/Flex 、 /wiki/Armaments 、 /wiki/Flame_Barrier 、 /wiki/Evolve
- 寂静猎手流派卡: /wiki/Deadly_Poison 、 /wiki/Noxious_Fumes 、 /wiki/Bouncing_Flask 、 /wiki/Catalyst 、 /wiki/Corpse_Explosion 、 /wiki/Shiv 、 /wiki/Blade_Dance 、 /wiki/Cloak_and_Dagger 、 /wiki/Accuracy 、 /wiki/Storm_of_Steel 、 /wiki/Finisher 、 /wiki/A_Thousand_Cuts 、 /wiki/After_Image 、 /wiki/Prepared 、 /wiki/Reflex 、 /wiki/Tactician 、 /wiki/Concentrate 、 /wiki/Calculated_Gamble 、 /wiki/Tools_of_the_Trade 、 /wiki/Eviscerate 、 /wiki/Sneaky_Strike 、 /wiki/Grand_Finale 、 /wiki/Well-Laid_Plans 、 /wiki/Setup 、 /wiki/Expertise 、 /wiki/Footwork 、 /wiki/Blur 、 /wiki/Leg_Sweep 、 /wiki/Piercing_Wail 、 /wiki/Wraith_Form 、 /wiki/Nightmare 、 /wiki/Adrenaline 、 /wiki/Terror
- 故障机器人流派卡: /wiki/Ball_Lightning 、 /wiki/Glacier 、 /wiki/Coolheaded 、 /wiki/Doom_and_Gloom 、 /wiki/Darkness 、 /wiki/Chaos 、 /wiki/Rainbow 、 /wiki/Electrodynamics 、 /wiki/Tempest 、 /wiki/Multi-Cast 、 /wiki/Recursion 、 /wiki/Capacitor 、 /wiki/Consume 、 /wiki/Defragment 、 /wiki/Biased_Cognition 、 /wiki/Fission 、 /wiki/Storm 、 /wiki/Loop 、 /wiki/Static_Discharge 、 /wiki/Claw 、 /wiki/All_for_One 、 /wiki/Rebound 、 /wiki/Equilibrium 、 /wiki/Hyperbeam 、 /wiki/Meteor_Strike 、 /wiki/Echo_Form 、 /wiki/Creative_AI 、 /wiki/Machine_Learning 、 /wiki/Thunder_Strike 、 /wiki/Seek 、 /wiki/Hologram 、 /wiki/Overclock 、 /wiki/Buffer 、 /wiki/Reprogram
- 观者流派卡: /wiki/Tantrum 、 /wiki/Rushdown 、 /wiki/Mental_Fortress 、 /wiki/Flurry_of_Blows 、 /wiki/Inner_Peace 、 /wiki/Meditate 、 /wiki/Empty_Body 、 /wiki/Empty_Mind 、 /wiki/Empty_Fist 、 /wiki/Pray 、 /wiki/Prostrate 、 /wiki/Devotion 、 /wiki/Blasphemy 、 /wiki/Collect 、 /wiki/Deus_Ex_Machina 、 /wiki/Omniscience 、 /wiki/Brilliance 、 /wiki/Fear_No_Evil 、 /wiki/Like_Water 、 /wiki/Wave_of_the_Hand 、 /wiki/Talk_to_the_Hand 、 /wiki/Halt 、 /wiki/Windmill_Strike 、 /wiki/Flying_Sleeves 、 /wiki/Protect 、 /wiki/Establishment 、 /wiki/Foresight 、 /wiki/Evaluate 、 /wiki/Study 、 /wiki/Scrawl 、 /wiki/Consecrate 、 /wiki/Alpha 、 /wiki/Ragnarok 、 /wiki/Conjure_Blade 、 /wiki/Wish 、 /wiki/Reach_Heaven 、 /wiki/Conclude 、 /wiki/Bowling_Bash 、 /wiki/Insight
- 专属遗物页: /wiki/Burning_Blood 、 /wiki/Black_Blood 、 /wiki/Red_Skull 、 /wiki/Paper_Phrog 、 /wiki/Self-Forming_Clay 、 /wiki/Champion_Belt 、 /wiki/Charon%27s_Ashes 、 /wiki/Magic_Flower 、 /wiki/Mark_of_Pain 、 /wiki/Runic_Cube 、 /wiki/Brimstone 、 /wiki/Ring_of_the_Snake 、 /wiki/Ring_of_the_Serpent 、 /wiki/Snecko_Skull 、 /wiki/Paper_Krane 、 /wiki/Ninja_Scroll 、 /wiki/Tough_Bandages 、 /wiki/Tingsha 、 /wiki/The_Specimen 、 /wiki/Hovering_Kite 、 /wiki/Wrist_Blade 、 /wiki/Twisted_Funnel 、 /wiki/Cracked_Core 、 /wiki/Frozen_Core 、 /wiki/Data_Disk 、 /wiki/Gold-Plated_Cables 、 /wiki/Symbiotic_Virus 、 /wiki/Emotion_Chip 、 /wiki/Inserter 、 /wiki/Nuclear_Battery 、 /wiki/Runic_Capacitor 、 /wiki/Pure_Water 、 /wiki/Holy_Water 、 /wiki/Damaru 、 /wiki/Duality 、 /wiki/Teardrop_Locket 、 /wiki/Cloak_Clasp 、 /wiki/Golden_Eye 、 /wiki/Violet_Lotus 、 /wiki/Melange 、 /wiki/Dead_Branch

## 7. 不确定项与备注

1. **逐级解锁触发条件**：wiki 的 Score 页写「局末得分用于解锁卡牌与遗物」，未给出精确阈值；「每完成一局（胜/负）推进一级」为游戏内表现与社区共识，未见官方文档逐字确认。复刻时建议按「完成一局推进一级」实现。
2. **药水数值双值问题**：wiki 药水页面的数值采用「(x;y)」双值记法（如 Blood Potion 20%/40%、Heart of Iron 6/12），本文均取第一个值（StS1 正式版）；第二值疑似对应 StS2 或旧版数据，若复刻药水系统请实测确认。
3. **Heart of Iron**：wiki infobox 显示「获得 (6;12) 力量」，本文按 StS1 取 6 力量，建议实测复核。
4. **充能球槽上限**：默认 3 槽、可增减已确认；wiki 未明确写出游戏内绝对上限（社区记忆为 10），复刻时需以游戏客户端实测为准。
5. **Storm of Steel 升级效果**：wiki 记法为「Add 1 Shiv(+) per card discarded」，即升级后每弃 1 张生成 1 张 Shiv+（6 伤害），此解读需实测确认。
6. 本文所有「基础值（升级值）」均以 wiki 正式版页面为准；若 Mega Crit 后续发布平衡性补丁（StS1 偶有更新，如 2024 年 V4 版本），需重新核对。
