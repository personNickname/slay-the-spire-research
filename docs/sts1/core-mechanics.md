# 《杀戮尖塔 1》(Slay the Spire) 战斗核心机制研究

> 面向「网页复刻开发」的数值级参考文档。所有数值与规则均标注来源（见文末「参考来源」）。
> 游戏版本：Steam 正式版（V2.x，2020 年 1 月《观者》版本后规则基本稳定）；本文以社区权威 wiki（slaythespire.wiki.gg，检索于 2026-11）为准。
> 术语约定：中文译名首次出现时标注英文原文，如：格挡(Block)、遗物(Relic)、消耗(Exhaust)。

---

## 1. 回合流程（Turn Structure）

战斗为回合制：**玩家先行动 → 敌方全体行动 → 循环**，直到一方死亡。多敌人战斗中敌人**从左到右依次**结算行动。来源：Mechanics 页。

### 1.1 玩家回合开始（Start of Turn）

按顺序发生三件事（来源：Mechanics 页「Player Turn」）：

1. 能量(Energy) **重置为基础值（默认 3）**；
2. 抽牌（默认 **5 张**）；
3. 回合开始效果触发。

修改默认值的典型途径：
- 遗物「聚变锤(Fusion Hammer)」：基础能量 +1（来自 Relics_List，效果原文 "Gain 1 Energy at the start of your turn"）；
- 遗物「异蛇之眼(Snecko Eye)」：每回合多抽 2 张牌，代价为开局获得困惑(Confused)（卡费随机化 0–3）；
- 药水槽/事件/诅咒（如 Fasting「斋戒」：每回合少得 X 能量）。

### 1.2 玩家回合结束（End of Turn）

按下「结束回合」后（来源：Mechanics 页）：

1. 回合结束效果触发，结算顺序总体为 **遗物 → 增益(Buff) → 卡牌**（例：遗物「山铜(Orichalcum)」先于镀层装甲(Plated Armor)，镀层装甲先于灼烧(Burn) 结算）；
2. 手牌洗入弃牌堆(discard pile)——除非持有「符文金字塔(Runic Pyramid)」或卡牌具有保留(Retain)；
3. 具有回合结束效果的卡（如灼烧(Burn)、懊悔(Regret)）**不适用**保留，仍会结算并弃置。

随后进入敌方回合。

### 1.3 手牌上限

- 手牌上限 **10 张**，**没有任何方式可突破**。抽牌导致的超额部分**留在抽牌堆**；生成卡导致的超额部分**送入弃牌堆**。来源：Mechanics 页「Hand Size Limit」。

### 1.4 先手顺序

- 玩家永远先手（无先攻判定）。战斗开始时**不发生**任何行动，第一回合直接从玩家回合开始。
- 敌人行动由意图(Intent) 提前展示；玩家回合结束后敌方按站位从左到右依次行动。来源：Mechanics 页「Turns / Enemy Turn」。

### 1.5 回合关键数值速查表

| 项目 | 默认值 | 备注 |
| --- | --- | --- |
| 每回合基础能量 | 3 | 回合开始时重置，不累积（除非「冰淇淋(Ice Cream)」遗物） |
| 每回合抽牌数 | 5 | 可被遗物/卡牌增减 |
| 手牌上限 | 10 | 硬上限，无法突破 |
| 回合结束 | 手牌弃置 | Runic Pyramid / Retain 例外 |
| 行动顺序 | 玩家 → 敌方全体（左→右） | — |

---

## 2. 卡牌系统

### 2.1 卡牌类型（Card Types）

五大类型（来源：Cards 页）：

| 类型 | 英文 | 说明 |
| --- | --- | --- |
| 攻击 | Attack | 直接造成伤害，可能有附加效果；受力量(Strength)、虚弱(Weak)、易伤(Vulnerable) 影响 |
| 技能 | Skill | 不直接造成伤害（可间接，如中毒(Poison)）；提供格挡、过牌、增益/减益 |
| 能力 | Power | 整场战斗持续的增益；**同一张能力牌每场战斗只能打出一次**；打出后**完全消失**（不进弃牌堆） |
| 状态 | Status | 战斗中被塞入卡组膨胀卡组，战斗结束时移除；绝大多数不可打出 |
| 诅咒 | Curse | 由事件等途径加入卡组并**持续存在于局外卡组**，效果通常更恶劣 |

补充规则：
- **状态卡** 战斗结束后从卡组移除；**诅咒** 除非被移除否则跨战斗保留。来源：Cards 页。
- 无色卡(Colorless) 是跨角色卡池（商店/事件/棱镜碎片），不属于第五种「类型」而是颜色(Color)维度。

**五个状态卡全表**（复刻开发必备，来源：各卡牌 wiki 页）：

| 状态卡 | 效果 |
| --- | --- |
| 灼烧(Burn) | 不可打出(Unplayable)。你的回合结束时受到 2 点伤害（升级后 Burn+ 为 4）。唯一有升级版的状态卡（Hexaghost 的 Inferno 可将其升级） |
| 眩晕(Dazed) | 不可打出。虚无(Ethereal)（回合结束时在手牌中则消耗） |
| 虚无(Void) | 不可打出。虚无(Ethereal)。**当此卡被抽到时失去 1 点能量**（通过 Seek/水滴记忆等非抽取途径加入手牌可规避） |
| 伤口(Wound) | 不可打出。无其他效果 |
| 被黏(Slimed) | 费用 1。消耗(Exhaust)。（唯一可以主动打出的状态卡，本身无效果） |

**常见诅咒表**（来源：Normality / Pain 卡牌页及 Debuffs/Cards 页）：

| 诅咒 | 效果 |
| --- | --- |
| 常态(Normality) | 不可打出。**在手牌中时，该回合最多打 3 张卡**（非减益，神器(Artifact)无法抵御；弃掉后即解除） |
| 痛苦(Pain) | 不可打出。**在手牌中时，每次打出其他卡失去 1 HP**（先于反伤/死亡节拍等结算；可被钨棒(Tungsten Rod)减为 0） |
| 疑虑(Doubt) | 不可打出。回合结束时获得 1 虚弱(Weak)（来源：Debuffs 页 Weak 条目「Source to Self」） |
| 羞耻(Shame) | 不可打出。回合结束时获得 1 脆弱(Frail)（来源：Debuffs 页 Frail 条目） |
| 懊悔(Regret) | 不可打出。回合结束时每持有 1 张手牌失去 1 HP（回合结束效果类卡，不适用保留；来源：Mechanics 页） |
| 笨拙(Clumsy) | 不可打出。虚无(Ethereal)（来源：Dazed 页更新记录确认其为 Ethereal 卡） |
| 登塔者之祸(Ascender's Bane) | 不可打出。**无法从卡组中移除** |
| 傲慢(Pride) | 唯一可主动打出的诅咒（来源：Cards 页） |

### 2.2 稀有度与卡牌奖励概率

卡牌稀有度三档 + 特殊档（来源：Cards 页）：

- 普通(Common)：灰色横幅；
- 非普通(Uncommon)：蓝色横幅；
- 稀有(Rare)：金色横幅；
- 基础(Basic)：初始卡组（横幅同普通，但某些事件按更低层级处理）；
- 特殊(Special)：仅从特定来源获得（Shiv、Smite、Miracle 等）。

**卡牌奖励（3 选 1）稀有度概率**（来源：Cards 页「Card Distribution」）：

| 来源 | 稀有 | 非普通 | 普通 |
| --- | --- | --- | --- |
| 普通战斗奖励 | 3% | 37% | 60% |
| 精英战斗奖励 | 10% | 40% | 50% |
| 商店 | 9% | 37% | 54% |

**关键隐藏机制——稀有概率偏移(Offset)**（来源：Cards 页）：
- 稀有概率的实际起点为上表数值 **减 5%**（普通战斗首屏即 −2% 稀有起算前的初始修正——因此第一层奖励**不可能**出稀有卡，除非 Calling Bell/Tiny House/Neow 祝福等特殊情况）；
- 每次按顺序 roll 出 1 张**普通**卡，稀有概率 **+1%**（补偿从普通卡概率中扣除，不够则扣非普通）；
- 一旦 roll 出稀有卡，概率**重置**为（基准 − 5%）；
- 该偏移只被「卡牌奖励」途径影响（商店、图书馆事件只受概率影响、不影响偏移；Orrery 等同于连续 5 次奖励）。

### 2.3 升级(Upgrade, 卡名后缀 “+”)

- 卡牌**只能升级一次**（来源：Mechanics 页「Upgrading」）。
- 升级途径：篝火打磨(Smith)、事件、遗物（磨刀石(Whetstone) 升级 2 张随机攻击卡、战争颜料(War Paint) 升级 2 张随机技能卡、蛋类遗物在获得新卡时直接升级）等。
- 升级效果因卡而异：伤害/格挡数值提高、费用降低、附加效果增强、目标数增加等。具体每张卡需查卡表（复刻时应逐卡配置）。

### 2.4 关键词(Keywords)全表

| 关键词 | 英文 | 效果 | 开发注意 |
| --- | --- | --- | --- |
| 消耗 | Exhaust | 打出后本场战斗移除（进入消耗堆） | 唯一回收手段：铁甲战士的「挖掘(Exhume)」 |
| 虚无 | Ethereal | 回合结束时若在手牌中，则被消耗(Exhaust) | 诅咒/状态的结算**先于**虚无触发；Ethereal 卡即使被保留效果持有也会消耗（Weekly Patch 5 确认） |
| 固有 | Innate | 每场战斗开局手牌中必含此卡 | 占用开局抽牌名额（非额外）；固有卡数超过开局抽牌数时全部照常入手 |
| 保留 | Retain | 回合结束时**不弃置**，留在手牌 | 观者紫色卡专属关键词；部分诅咒即使保留仍会被弃置 |
| 预见 | Scry | 查看抽牌堆顶 X 张牌，可选择弃置其中任意张 | 中文译名「预见」（StS2 官方中文沿用，18183 词条描述为「查看牌组顶部若干张牌并选择弃掉」）；**不触发弃牌(Discard) 联动**，仅作卡组循环；观者专属 |
| 不可打出 | Unplayable | 无法从手牌打出 | 医疗包(Medical Kit)/蓝蜡烛(Blue Candle) 遗物可使其可被打出 |
| X 费 | X-cost | 打出时消耗**当前全部能量**，效果按 X 结算 | 能量为 0 也可打出（效果按 0 计算，除非另有增加 X 的手段）；Chemical X 遗物使 X 费卡效果 +2 |
| 渠道/唤起 | Channel/Evoke | 故障机器专属：填充/引爆充能球(Orb) | 基础充能球槽 3 个 |
| 姿态 | Stance | 观者专属：同时只能持有一种姿态（平静/愤怒/神格） | — |

弃牌(Discard) 关键词注意（来源：Keywords 页）：回合结束的整手弃置**不触发**弃牌联动；预见(Scry) 弃置**不触发**弃牌联动。

---

## 3. 牌堆状态机（Pile State Machine）

复刻开发核心。三堆一手（来源：Mechanics 页「Card Piles」）：

| 牌堆 | 英文 | 作用 |
| --- | --- | --- |
| 抽牌堆 | Draw Pile | 战斗开始时装入玩家整套卡组；抽牌来源 |
| 弃牌堆 | Discard Pile | 打出后的卡去向；洗牌时全体洗回抽牌堆 |
| 消耗堆 | Exhaust Pile | 被消耗的卡的归宿；除 Exhume 外无法回收 |

### 3.1 状态转换规则（完整清单）

1. **战斗开始**：玩家卡组全部洗入抽牌堆（顺序随机化）。
2. **打出攻击/技能卡** → 弃牌堆。例外：
   - 带「消耗(Exhaust)」的卡 → 消耗堆；
   - **能力(Power) 卡 → 完全消失**（不在任何牌堆中显示）；
   - 「虚无(Ethereal)」卡在回合结束仍留手牌 → 消耗堆。
3. **回合结束弃牌**：手牌 → 弃牌堆（保留卡、Runic Pyramid 例外）。
4. **抽牌时抽牌堆为空** → 触发**洗牌**：弃牌堆全部洗入抽牌堆（消耗堆**不**参与洗牌）。注意：洗牌只在「尝试抽牌且抽牌堆空」时触发；若抽牌堆和弃牌堆同时为空（极端情况），抽不出牌。
5. **卡牌生成**：加入手牌；受手牌上限 10 约束，超额进弃牌堆。
6. **敌人塞牌**：状态卡可被塞入弃牌堆**或**抽牌堆（甚至抽牌堆顶部）；玩家卡（Overclock 等）也能定向塞牌。
7. **战斗结束**：所有状态卡/临时生成的卡移除，卡组恢复原样。

### 3.2 状态机图示

```
        战斗开始: 卡组 → (洗牌) → 抽牌堆
                     抽牌堆 ←──洗牌(弃牌堆全体)── 弃牌堆
                       │ 抽牌
                       ▼
        ┌─────── 手牌(上限10) ───────┐
        │ 打出(攻击/技能)             │ 回合结束
        ▼                            ▼
      弃牌堆 ←──────────────────── 弃牌堆
        │ 打出带消耗的卡 / 回合结束的虚无卡
        ▼
      消耗堆 ──(Exhume 唯一回收)──→ 手牌
        能力(Power)卡: 打出后彻底消失(不进任何堆)
```

---

## 4. 格挡(Block)机制

### 4.1 获取与消耗规则

- 格挡(Block) 是吸收伤害的资源：受到伤害时先扣格挡，**剩余部分才扣 HP**。例：8 格挡受到 20 伤害 → 实扣 12 HP。来源：Keywords 页 Block 条目。
- **格挡在拥有者回合开始时清除**：
  - 玩家格挡在**玩家回合开始**时清零（除非壁垒(Barricade)、模糊(Blur)；遗物「卡钳(Calipers)」改为每回合只失去 15 点格挡）；
  - 敌人格挡在其**自己回合开始**时清零（Spheric Guardian 持壁垒(Barricade) 例外，见 Block 页敌人条目）。
- 格挡**跨同一次攻击的多段独立结算**，也跨同回合多次攻击累积扣减（格挡在被消耗前持续存在）。
- **敏捷(Dexterity)/脆弱(Frail) 只影响「打出非能力卡直接获得」的格挡**，不影响 Rage 生成的格挡、Frost 球等衍生来源（来源：Block 页）。
- 格挡公式：`最终格挡 = floor((基础格挡 + 敏捷) × (脆弱 ? 0.75 : 1))`（脆弱先于取整生效，来源：Debuffs 页 Frail 条目）。

### 4.2 穿透格挡的伤害（网页复刻需重点区分的两类伤害）

《杀戮尖塔 1》中**没有**玩家攻击可无视敌方格挡；所有攻击(Attack)伤害一律先扣格挡。绕过格挡的是**HP 损失(HP loss)**类效果：

| 类型 | 例子 | 是否走格挡 |
| --- | --- | --- |
| 攻击伤害 | 打出的攻击卡、敌人攻击 | ✅ 先扣格挡 |
| HP 损失 | 中毒(Poison) 每层、灼烧(Burn)、遗物「死亡节拍(Beat of Death)」类、痛苦(Pain) 诅咒、亵渎(Blasphemy) 的 99999 HP 损失 | ❌ 完全无视格挡 |

（注：任务书提到的「Chomp/ignore block」为《杀戮尖塔 2》BOSS 机制；StS1 中相应机制为上表 HP 损失类。来源：Buffs/Debuffs 页及 Pain/Burn 卡页。）

其他格挡交互（来源：Block 页 / Relics_List）：
- 「熔毁者(Melter)」：直接**移除**敌人全部格挡；
- 「卡钳(Calipers)」(稀有遗物)：回合开始只失去 15 格挡而非全部；
- 敌方手段：Sentry 塞眩晕、Spheric Guardian 开局 40 格挡+壁垒等。

---

## 5. 伤害计算公式

### 5.1 攻击伤害公式

```
单段伤害 = floor( ( 基础伤害 + 力量(Strength) + 活力(Vigor) )
                  × (易伤 ? 1.5 : 1)
                  × (虚弱 ? 0.75 : 1) )
```

结算顺序（来源：Debuffs 页 Vulnerable/Weak 条目 Notes）：
1. 先加算力量(Strength)、活力(Vigor)（下一张攻击 +X 伤害的 buff）；
2. 再乘易伤/虚弱系数；
3. **最后向下取整(floor)**。

系数可被遗物修改：
- 「纸青蛙(Paper Phrog)」：易伤增伤 50% → **75%**（×1.75）；
- 「纸鹤(Paper Krane)」：虚弱减伤 25% → **40%**（×0.60）；
- 「怪蘑菇(Odd Mushroom)」（战斗事件）：易伤只增伤 25%（×1.25）。

翻倍类（乘区独立）：
- 「笔尖(Pen Nib)」遗物：第 10 张攻击伤害 ×2（若笔尖先于红骷髅获得，×2 先算再加力量，来源：Buffs 页 Pen Nib Notes）；
- 幻影杀手(Phantasmal Killer) 给予双倍伤害(Double Damage) buff：攻击伤害 ×2，持续 X 回合。

### 5.2 多段攻击

多段攻击（如 Whirlwind、Sword Boomerang）**每一段独立计算**力量、易伤/虚弱系数和取整，并**每段独立扣减格挡**。这是复刻时伤害循环必须按段实现的原因。

### 5.3 其他伤害/数值规则

- 中毒(Poison)：在其回合开始时按层数失去 HP（绕过格挡），然后层数 −1。来源：Debuffs 页。
- 灼烧(Burn)：回合结束 2 HP 损失/张（升级 4）。
- 力量对攻击卡**每段**加成；力量为负时同样每段减伤（下限整体伤害为 0，不为负）。
- 「靴子(The Boot)」遗物：单段未格挡攻击伤害 ≤4 时提高为 5（先于取整的修正，实现时置于格挡结算后）。
- 「鸟居(Torii)」遗物：单次未格挡攻击伤害 ≤5 时降为 1。

---

## 6. Buff / Debuff 完整清单

分层模型（wiki 分类，复刻实现建议采用，来源：Buffs/Debuffs 页「Stack Types」）：
- **强度(Intensity)型**：按层数生效，通常整场持续或下回合消耗；
- **持续(Duration)型**：层数=剩余回合数，回合结束 −1；
- **计数(Counter)型**：事件触发消耗层数（中毒是唯一同时具有强度+持续双属性的 debuff；再生(Regen) 是唯一双属性 buff）。

### 6.1 玩家/敌人通用增益(Buffs)

| Buff | 效果 | 触发时机 | 数值规则 |
| --- | --- | --- | --- |
| 力量(Strength) | 攻击伤害 ±X | 每段攻击结算时 | 强度型；上限 ±999；Limit Break 可翻倍 |
| 敏捷(Dexterity) | 卡牌格挡 +X | 获得格挡时 | 强度型；±999；只影响非能力卡直接格挡 |
| 神器(Artifact) | 抵消下一次减益 | 减益施加时 | 计数型；每次施加消耗 1 层；对已有减益无效 |
| 缓冲(Buffer) | 阻止下 X 次 HP 损失 | HP 损失发生时 | 计数型 |
| 无形(Intangible) | 受到的所有伤害与 HP 损失降为 1 | 伤害结算时 | 持续型 |
| 镀层装甲(Plated Armor) | 回合结束获得 X 格挡 | 回合结束 | 强度型；受未格挡攻击伤害时 −1 层；上限 999 |
| 反伤(Thorns) | 被攻击时反弹 X 伤害 | 每次被攻击命中 | 强度型 |
| 活力(Vigor) | 下一次攻击 +X 伤害 | 下一次攻击 | 强度型一次性 |
| 复制(Duplication/Double Tap/Burst/Amplify) | 后续 X 张（攻击/技能/能力）卡打两次 | 打出对应卡时 | 计数型 |
| 再生(Regen) | 回合结束治疗 X HP 并 −1 层 | 回合结束 | 唯一强度+持续双属性 |
| 仪式(Ritual) | 回合结束获得 X 力量 | 回合结束 | 强度型（Cultist 的成长） |
| 抽牌(Draw Card) | 下回合多抽 X 张 | 下回合抽牌 | 强度型一次性 |
| 充能(Energized) | 下回合 +X 能量 | 下回合 | 强度型一次性 |
| 金属化(Metallicize) | 回合结束获得 X 格挡 | 回合结束 | 强度型（与镀层装甲区别：不受攻击减层） |
| 愤怒(Rage) | 本回合每打出 1 张攻击获得 X 格挡 | 打出攻击 | 强度型、仅当回合；不受敏捷影响 |
| 壁垒(Barricade) | 格挡不再在回合开始清除 | — | 不叠加（能力卡给予，整场） |
| 地狱形态(Demon Form) | 回合开始获得 X 力量 | 回合开始 | 强度型 |
| 预见(Foresight) | 回合开始预见 X | 回合开始 | 强度型 |
| 愤怒姿态相关(Wrath/Divinity, Stance) | 观者姿态：愤怒中造成/受到伤害 ×2；神格造成伤害 ×3 | 姿态期间 | 姿态互斥 |
| 笔尖(Pen Nib) | 下一张攻击伤害 ×2 | 计数第 10 张攻击 | 不叠加 |

### 6.2 减益(Debuffs)与负面状态

| Debuff | 效果 | 触发时机 | 数值规则 |
| --- | --- | --- | --- |
| 易伤(Vulnerable) | 受到攻击伤害 ×1.5（纸青蛙 1.75 / 怪蘑菇 1.25） | 受到攻击时 | 持续型；先加减后乘后取整 |
| 虚弱(Weak) | 造成攻击伤害 ×0.75（纸鹤 0.60） | 造成攻击时 | 持续型；被遗物「姜(Ginger)」免疫 |
| 脆弱(Frail) | 卡牌获得的格挡 ×0.75 | 获得格挡时 | 持续型；被遗物「芜菁(Turnip)」免疫；不影响非卡牌格挡来源 |
| 中毒(Poison) | 回合开始失去 X HP，层数 −1 | 拥有者回合开始 | 强度+持续双属性；绕格挡；Catalyst 可翻倍 |
| 力量下降(Strength Down / Flex) | 回合结束失去 X 力量 | 回合结束 | 强度型一次性（临时力量的回收机制） |
| 敏捷下降(Dexterity Down) | 回合结束失去 X 敏捷 | 回合结束 | 强度型一次性 |
| 束缚(Shackled) | 敌人版本：回合结束**获得** X 力量（伪装成减益） | 回合结束 | 强度型（实现陷阱：Debuff 壳 + Buff 逻辑） |
| 困惑(Confusion) | 每次抽到卡随机化其费用 0–3 | 抽牌时 | 不叠加；Snecko Eye 开局施加且神器不可抵御 |
| 窒息(Choked) | 本回合每打出一张卡，目标敌人失去 X HP | 打出卡 | 强度型、仅当回合 |
| 尸爆(Corpse Explosion) | 敌人死亡时对全体敌人造成其最大 HP ×X 伤害 | 死亡 | 强度型 |
| 无法抽牌(No Draw) | 本回合无法抽牌 | — | 不叠加 |
| 亡灵形态(Wraith Form) | 回合开始失去 X 敏捷 | 回合开始 | 强度型 |
| 偏见(Bias) | 回合开始失去 X 专注(Focus) | 回合开始 | 强度型 |
| 锁定(Lock-On) | 闪电/黑暗球对此敌人伤害 ×1.5 | 球伤害 | 持续型 |
| 挡回(Block Return) | 每次攻击此敌人获得 X 格挡 | 攻击命中 | 强度型 |
| 禁格挡(No Block) | X 回合内无法从卡牌获得格挡 | — | 持续型；仅卡牌来源（球/遗物格挡不受影响） |
| 缠绕(Constricted) | 回合结束受到 X 伤害（绕格挡） | 回合结束 | 强度型 |
| 抽牌减少(Draw Reduction) | 下 X 回合每回合少抽 1 张 | — | 持续型（Time Eater 施加） |
| 纠缠(Entangled) | 本回合无法打出攻击卡 | — | 不叠加、单回合 |
| 咒术(Hex) | 每打出一张非攻击卡，塞 X 张眩晕(Dazed) 进抽牌堆 | 打出卡 | 强度型（Chosen 施加） |
| 迟缓(Slow) | 每打出一张卡，敌人本回合多受 10% 攻击伤害 | 打出卡 | 强度型、仅当回合（Giant Head 施加） |
| 斋戒(Fasting) | 每回合少得 X 能量 | 回合开始 | 强度型 |
| 印记(Mark) | 每打出一张「点穴」，所有带印记敌人失去 X HP | — | 强度型 |

净化手段：神器(Artifact) 抵消下 1 次减益施加；「橙片(Orange Pellets)」遗物在同一回合打出能力+攻击+技能各 1 张后**清除所有玩家减益**（含负力量/负敏捷/负专注）。

### 6.3 敌人专属 Buff（复刻敌人 AI 需要的部分）

| Buff | 持有者 | 效果 |
| --- | --- | --- |
| 愤怒(Angry) | 疯狂小恶魔 | 受到攻击伤害获得 X 力量 |
| 背袭(Back Attack) | 尖塔盾/矛 | 开局从背后攻击，伤害 ×1.5 |
| 死亡节拍(Beat of Death) | 腐朽之心 | 你每打出一张卡受到 X 伤害（绕格挡） |
| 好奇(Curiosity) | 觉醒者 | 你每打出一张能力卡获得 X 力量 |
| 蜷缩(Curl Up) | 红/绿虱 | 首次受到攻击伤害获得 X 格挡 |
| 激怒(Enrage) | 格林诺布 | 你每打出一张技能卡获得 X 力量 |
| 爆炸(Explosive) | 探索者 | 3 回合后自爆造成 X 伤害 |
| 飞行(Flying) | 伯德 | 接下来 X 次攻击伤害减 50%，受击后消耗，回合重置 |
| 不倒(Invincible) | 腐朽之心 | 本回合最多再失去 X HP |
| 生命链接(Life Link) | 暗黑小怪 | 同伴存活时 2 回合后复活 |
| 可塑(Malleable) | 蛇草/蠕动团 | 受到攻击伤害获得 X 格挡（递增），回合开始重置 |
| 奴仆(Minion) | 各类召唤物 | 首领死亡时逃走 |
| 模式转换(Mode Shift) | 守护者 | 累计受击 X 伤害后转入防御模式并获 20 格挡 |
| 痛苦戳刺(Painful Stabs) | 戳刺之书/腐朽之心 | 每次被攻击命中塞 X 张伤口(Wound) 进弃牌堆 |
| 再生(Regenerate) | 觉醒者/超级精英 | 回合结束治疗 X HP（不衰减） |
| 锐皮(Sharp Hide) | 守护者 | 你每打出一张攻击卡受到 X 伤害 |
| 裂变(Split) | 大史莱姆 | HP ≤50% 时分裂为 2 个半血史莱姆 |
| 孢子云(Spore Clouds) | 真菌兽 | 死亡时施加 X 易伤 |
| 静滞(Stasis) | 青铜球 | 死亡时归还被偷的卡 |
| 偷窃(Thievery) | 窃贼 | 攻击时偷取 X 金币 |
| 时滞(Time Warp) | 时间吞噬者 | 你每打出 12 张卡：强制结束你的回合并获得 2 力量 |
| 疲亡(Fading) | 瞬息 | X 回合后死亡 |
| 蜕变(Shifting) | 瞬息 | HP 损失转化为等量力量损失（至回合结束） |

---

## 7. 战斗胜利奖励

来源：Gold 页 / Cards 页 / Potions 页 / Relics 页。

### 7.1 金币

| 战斗类型 | 金币范围 |
| --- | --- |
| 普通敌人 | 10–20 |
| 精英 | 25–35 |
| BOSS | 95–105（A13 难度 71–79） |
| 宝箱（小型/中型/大型） | 23–28（50% 概率）/ 45–55（35%）/ 68–83（50%） |

- 金色偶像(Golden Idol)（事件遗物）：敌人掉落金币 +25%。

### 7.2 卡牌奖励（3 选 1）

- 每场战斗胜利获得 **3 张卡** 供 1 张选择；稀有度概率见 2.2 节（普通 3%/37%/60%，精英 10%/40%/50%，含 −5% 初始偏移与 +1% 递补机制）。
- **可以跳过(Skip)** 卡牌奖励，跳过同样推进稀有偏移（只要 roll 过卡）。
- 「问题卡(Question Card)」遗物：奖励多 1 张可选；「破损王冠(Busted Crown)」：奖励少 2 张可选；「祈祷轮(Prayer Wheel)」：普通敌人额外掉一份卡牌奖励。
- 带治疗标签的卡（Reaper/Feed/Alchemize/Self Repair/Lesson Learned/Wish/Bandage Up）**不会**被战斗中随机生成（来源：Cards 页 Card Generation）。

### 7.3 药水掉率

- 战斗后药水掉落**基础概率 40%**，**每幕开始时重置**；
- 掉落了药水：下一次概率 **−10%**；没掉落：**+10%**；
- 「白兽雕像(White Beast Statue)」遗物：战斗奖励必掉药水；「漏斗(Sozu)」遗物：无法再获得药水。
- 药水稀有度（掉落/炼金(Alchemize) 等通用途径）：普通 65% / 非普通 25% / 稀有 10%（V2.0 后数值；来源：Potions 页）。

### 7.4 其他掉落

- 精英：战斗后**必掉 1 个遗物**（稀有度权重：普通 50%/非普通 33%/稀有 17%）；
- BOSS：BOSS 箱子 3 选 1 BOSS 遗物（可跳过）。

---

## 8. 遗物(Relic)系统

### 8.1 稀有度与获取途径

稀有度分层（来源：Relics 页）：

| 稀有度 | 获取途径 |
| --- | --- |
| 初始(Starter) | 开局自带，4 角色各 1 个；可被对应 BOSS 遗物替换 |
| 普通(Common) | 精英掉落、宝箱、商店、事件等多途径 |
| 非普通(Uncommon) | 同上（权重更低） |
| 稀有(Rare) | 同上（权重最低） |
| BOSS(Boss) | **仅**击杀 BOSS 后 3 选 1（可跳过） |
| 商店(Shop) | **仅**商店出售；商店第 3 个遗物槽必为商店遗物 |
| 事件(Event) | 仅事件获得（部分如 Necronomicon/Enchiridion） |
| 特殊(Special) | Circlet（集齐所有遗物后出现）等 |

**掉落稀有度权重**（多数来源通用，来源：Relics 页 Rarity）：

| 稀有度 | 概率 |
| --- | --- |
| 普通 | 50% |
| 非普通 | 33% |
| 稀有 | 17% |

宝箱权重（小型/中型/大型）：

| 宝箱 | 普通 | 非普通 | 稀有 |
| --- | --- | --- | --- |
| 小型 | 75% | 25% | 0% |
| 中型 | 35% | 50% | 15% |
| 大型 | 0% | 75% | 25% |

**效果叠加规则**：
- 同类遗物效果**叠加**（如 Vajra +1 力量 与 Girya 的 1 力量可同时生效）；
- 同名遗物**不可重复获得**（遗物每局最多遇到一次；Circlet 为集齐占位）；
- 相似但不同来源的效果按各自触发条件独立结算（如 Kunai 与 Shuriken 同为「每回合 3 攻击」触发，分别加敏捷/力量）；
- 少数互斥：如 Black Blood 替换 Burning Blood。

**掉落限制规则**（复刻需实现，来源：Relics 页 Restrictions）：
- 瓶装火焰/闪电/龙卷只在卡组中存在对应类型卡时出现；
- Calling Bell 与非战斗事件不掉瓶装/磨刀石类；
- 篝火遗物（铲子/石磨/和平烟斗）最多 2 个；
- 部分遗物有楼层上限（如 Ectoplasm 仅 18 层前）。

### 8.2 代表性遗物详表

**初始遗物**：

| 遗物 | 稀有度 | 效果 |
| --- | --- | --- |
| 燃烧之血(Burning Blood) | 初始-铁甲战士 | 战斗结束治疗 6 HP |
| 蛇之戒(Ring of the Snake) | 初始-寂静猎手 | 每场战斗开局多抽 2 张牌 |
| 破损核心(Cracked Core) | 初始-故障机器 | 每场战斗开局引导 1 个闪电球 |
| 纯水(Pure Water) | 初始-观者 | 每场战斗开局手牌加入 1 张奇迹(Miracle) |

**普通遗物（节选）**：

| 遗物 | 效果 |
| --- | --- |
| 赤熊(Akabeko) | 每场战斗第一次攻击 +8 伤害 |
| 锚(Anchor) | 开局获得 10 格挡 |
| 战争艺术(Art of War) | 回合内未打攻击卡 → 下回合 +1 能量 |
| 一袋弹珠(Bag of Marbles) | 开局对全体敌人施加 1 易伤 |
| 备置包(Bag of Preparation) | 开局多抽 2 张牌 |
| 血瓶(Blood Vial) | 开局治疗 2 HP |
| 青铜鳞片(Bronze Scales) | 开局获得 3 反伤 |
| 百年谜题(Centennial Puzzle) | 每场战斗第一次失去 HP 时抽 3 张牌 |
| 陶瓷鱼(Ceramic Fish) | 每次卡组加入卡牌获得 9 金币 |
| 捕梦网(Dream Catcher) | 睡觉时可选加 1 张卡 |
| 幸福花(Happy Flower) | 每 3 回合 +1 能量 |
| 提灯(Lantern) | 每场战斗第一回合 +1 能量 |
| 双节棍(Nunchaku) | 每打出 10 张攻击卡 +1 能量 |
| 滑石(Oddly Smooth Stone) | 开局 +1 敏捷 |
| 护身符(Omamori) | 抵消接下来获得的 2 个诅咒 |
| 山铜(Orichalcum) | 回合结束无格挡则获得 6 格挡 |
| 笔尖(Pen Nib) | 每打出第 10 张攻击卡，该卡伤害 ×2 |
| 药水腰带(Potion Belt) | 获得 2 个额外药水槽 |
| 保存昆虫(Preserved Insect) | 精英 HP −25% |
| 香甜草莓(Strawberry) | 拾取时最大 HP +7 |
| 靴子(The Boot) | 未格挡攻击伤害 ≤4 时提为 5 |
| 风筝玩具(Toy Ornithopter) | 每次使用药水治疗 5 HP |
| 金刚杵(Vajra) | 开局 +1 力量 |
| 磨刀石(Whetstone) | 拾取时升级 2 张随机攻击卡 |

**非普通遗物（节选）**：

| 遗物 | 效果 |
| --- | --- |
| 蓝蜡烛(Blue Candle) | 诅咒卡可打出：打出时失去 1 HP 并消耗 |
| 瓶装火焰/闪电/龙卷(Bottled X) | 开局手牌固定含所选攻击/技能/能力卡 |
| 暗石垂饰(Darkstone Periapt) | 每获得诅咒最大 HP +6 |
| 永恒之羽(Eternal Feather) | 每进篝火按卡组每 5 张治疗 3 HP |
| 格林之角(Gremlin Horn) | 敌人死亡时 +1 能量并抽 1 张 |
| 巨号角(Horn Cleat) | 第 2 回合开始获得 14 格挡 |
| 墨水瓶(Ink Bottle) | 每打出 10 张卡抽 1 张 |
| 苦无(Kunai) | 每回合第 3 张攻击 +1 敏捷 |
| 开信刀(Letter Opener) | 每回合第 3 张技能对全体敌人造成 5 伤害 |
| 套娃(Matryoshka) | 接下来 2 个非 BOSS 宝箱各含 2 个遗物 |
| 水银沙漏(Mercury Hourglass) | 回合开始对全体敌人造成 3 伤害 |
| 装饰扇(Ornamental Fan) | 每回合第 3 张攻击获得 4 格挡 |
| 铁梨(Pear) | 拾取时最大 HP +10 |
| 手里剑(Shuriken) | 每回合第 3 张攻击 +1 力量 |
| 自我成型黏土(Self-Forming Clay) | 每次失去 HP 下回合 +3 格挡 |
| 唱碗(Singing Bowl) | 选卡奖励可改为 +2 最大 HP |
| 攻击假人(Strike Dummy) | 名含「打击(Strike)」的卡 +3 伤害 |
| 日晷(Sundial) | 每洗牌 3 次获得 2 能量 |
| 信使(The Courier) | 商店补货且全场 8 折 |
| 白兽雕像(White Beast Statue) | 战斗奖励必掉药水 |
| 纸青蛙(Paper Phrog) | 易伤敌人受伤 +75%（原 50%） |
| 纸鹤(Paper Krane) | 虚弱敌人伤害 −40%（原 25%） |
| 忍者卷轴(Ninja Scroll) | 开局手牌加 3 张手里剑(Shiv) |
| 电镀线(Gold-Plated Cables) | 最右侧球被动多触发 1 次 |

**稀有遗物（节选）**：

| 遗物 | 效果 |
| --- | --- |
| 鸟面瓮(Bird-Faced Urn) | 每打出能力卡治疗 2 HP |
| 卡钳(Calipers) | 回合开始失去 15 格挡而非全部 |
| 船长之轮(Captain's Wheel) | 第 3 回合开始获得 18 格挡 |
| 枯枝(Dead Branch) | 每次消耗卡牌时手牌随机加入 1 张卡 |
| 巫毒娃娃(Du-Vu Doll) | 卡组中每个诅咒 = 开局 +1 力量 |
| 化石螺旋(Fossilized Helix) | 阻止战斗中第一次 HP 损失 |
| 赌筹码(Gambling Chip) | 开局可弃任意张再抽等量 |
| 姜(Ginger) | 免疫虚弱 |
| 石磨(Girya) | 篝火可锻炼 +1 力量（最多 3 次） |
| 冰淇淋(Ice Cream) | 能量跨回合保留 |
| 熏香炉(Incense Burner) | 每 6 回合获得 1 无形(Intangible) |
| 蜥蜴尾巴(Lizard Tail) | 首次死亡改为复活至 50% 最大 HP |
| 芒果(Mango) | 拾取时最大 HP +14 |
| 老硬币(Old Coin) | 拾取时获得 300 金币 |
| 和平烟斗(Peace Pipe) | 篝火可移除卡牌 |
| 怀表(Pocketwatch) | 回合内打 ≤3 张卡 → 下回合抽 3 张 |
| 祈祷轮(Prayer Wheel) | 普通敌人额外掉一份卡牌奖励 |
| 铲子(Shovel) | 篝火可挖遗物 |
| 石历(Stone Calendar) | 第 7 回合结束对全体敌人造成 52 伤害 |
| 线与针(Thread and Needle) | 开局获得 4 镀层装甲 |
| 鸟居(Torii) | 未格挡攻击伤害 ≤5 时降为 1 |
| 钨棒(Tungsten Rod) | 每次失去 HP 时 −1 |
| 芜菁(Turnip) | 免疫脆弱 |
| 无尽陀螺(Unceasing Top) | 回合内手牌为空时抽 1 张 |
| 翼靴(Wing Boots) | 3 次无视路径移动 |
| 冠军腰带(Champion Belt) | 施加易伤时同时施加 1 虚弱 |
| 冥王之灰(Charon's Ashes) | 每次消耗卡对全体敌人造成 3 伤害 |
| 标本(The Specimen) | 敌人死亡时其中毒转移给随机敌人 |
| 铃铛(Tingsha) | 每弃 1 张卡对随机敌人造成 3 伤害 |
| 强韧绷带(Tough Bandages) | 每弃 1 张卡获得 3 格挡 |
| 扣针(Cloak Clasp) | 回合结束每张手牌获得 1 格挡 |
| 金瞳(Golden Eye) | 每次预见(Scry) 额外预见 2 张 |

**BOSS 遗物（能量类 +1 能量的代价设计，节选）**：

| 遗物 | 效果 |
| --- | --- |
| 破损王冠(Busted Crown) | +1 能量；卡牌奖励 −2 张可选 |
| 召唤铃(Calling Bell) | 获得诅咒 + 3 个遗物 |
| 咖啡滴漏(Coffee Dripper) | +1 能量；篝火不能睡觉 |
| 诅咒钥匙(Cursed Key) | +1 能量；开非 BOSS 宝箱获得诅咒 |
| 灵质(Ectoplasm) | +1 能量；无法获得金币 |
| 空笼(Empty Cage) | 移除卡组中 2 张卡 |
| 聚变锤(Fusion Hammer) | +1 能量；篝火不能打磨 |
| 潘多拉魔盒(Pandora's Box) | 所有打击/防御转化为随机卡 |
| 贤者之石(Philosopher's Stone) | +1 能量；全体敌人开局 +1 力量 |
| 符文穹顶(Runic Dome) | +1 能量；无法看到敌人意图 |
| 符文金字塔(Runic Pyramid) | 回合结束不再弃手牌 |
| 神圣树皮(Sacred Bark) | 药水效果 ×2 |
| 奴隶枷锁(Slaver's Collar) | BOSS/精英战斗中 +1 能量 |
| 异蛇之眼(Snecko Eye) | 每回合多抽 2 张；开局获得困惑（卡费 0–3 随机） |
| 漏斗(Sozu) | +1 能量；无法获得药水 |
| 小屋(Tiny House) | +1 药水、50 金、+5 最大 HP、1 张卡、升级 1 张随机卡 |
| 天鹅绒颈环(Velvet Choker) | +1 能量；每回合最多打 6 张卡 |
| 黑血(Black Blood)（铁甲） | 替换初始遗物；战斗结束治疗 12 HP |
| 痛苦印记(Mark of Pain)（铁甲） | +1 能量；开局洗 2 张伤口进抽牌堆 |
| 符文立方(Runic Cube)（铁甲） | 每次失去 HP 抽 1 张牌 |
| 悬浮风筝(Hovering Kite)（猎手） | 每回合第一次弃牌获得 1 能量 |
| 蛇之戒升级(Ring of the Serpent)（猎手） | 替换初始；每回合多抽 1 张 |
| 腕刃(Wrist Blade)（猎手） | 0 费攻击 +4 伤害 |
| 冰霜核心(Frozen Core)（故障） | 回合结束有空球槽时引导 1 个冰霜球 |
| 嵌入器(Inserter)（故障） | 每 2 回合 +1 球槽 |
| 核能电池(Nuclear Battery)（故障） | 开局引导 1 个等离子球 |
| 圣水(Holy Water)（观者） | 替换初始；开局手牌加 3 张奇迹 |
| 紫莲(Violet Lotus)（观者） | 退出平静姿态时额外 +1 能量 |

**商店遗物（节选）**：

| 遗物 | 效果 |
| --- | --- |
| 大锅(Cauldron) | 拾取时酿造 5 瓶随机药水 |
| 化学试剂X(Chemical X) | X 费卡效果 +2 |
| 发条纪念品(Clockwork Souvenir) | 开局获得 1 神器(Artifact) |
| 多莉之镜(Dolly's Mirror) | 复制卡组中 1 张卡 |
| 冻结之眼(Frozen Eye) | 查看抽牌堆时按顺序显示 |
| 手钻(Hand Drill) | 破坏敌人格挡时施加 2 易伤 |
| 李华夫饼(Lee's Waffle) | +7 最大 HP 并完全治疗 |
| 医疗包(Medical Kit) | 状态卡可打出：消耗之 |
| 会员卡(Membership Card) | 商店全场 5 折 |
| 橙片(Orange Pellets) | 同回合打出能力+攻击+技能各 1 张 → 清除全部减益 |
| 星盘(Orrery) | 拾取时选 5 张卡加入卡组 |
| 棱镜碎片(Prismatic Shard) | 卡牌奖励含无色卡与其他角色卡 |
| 勇气投索(Sling of Courage) | 精英战斗开局 +2 力量 |
| 奇怪勺子(Strange Spoon) | 消耗卡 50% 概率改为弃置 |
| 算盘(The Abacus) | 每次洗牌获得 6 格挡 |
| 工具箱(Toolbox) | 开局从 3 张随机无色卡中选 1 入手 |
| 硫磺(Brimstone)（铁甲） | 回合开始 +2 力量，全体敌人 +1 力量 |
| 扭曲漏斗(Twisted Funnel)（猎手） | 开局对全体敌人施加 4 中毒 |
| 符文电容(Runic Capacitor)（故障） | 开局 +3 球槽 |
| 香料(Melange)（观者） | 每次洗牌预见(Scry) 3 |

**事件遗物（节选）**：

| 遗物 | 效果 |
| --- | --- |
| 诱变力量(Mutagenic Strength) | 开局 +3 力量；第一回合结束失去 3 力量 |
| 魔典(Enchiridion) | 开局手牌随机加 1 张能力卡，本回合 0 费 |
| 死灵之书(Necronomicon) | 每回合首张 ≥2 费攻击打两次；拾取获得诅咒 |
| 尼里法典(Nilry's Codex) | 回合结束可将 3 选 1 随机卡洗入抽牌堆 |
| 血腥偶像(Bloody Idol) | 每次获得金币治疗 5 HP |
| 金色偶像(Golden Idol) | 敌人掉落金币 +25% |

（遗物全集 193 个，本表收录约 90 个代表性条目；数值均转写自 Relics_List 页，来源见文末。）

---

## 9. 药水(Potion)系统

### 9.1 基础规则

来源：Potions 页。

- **药水槽默认 3 个**（进阶 11 难度下为 2）；扩展手段仅「药水腰带(Potion Belt)」（+2 槽）。
- 使用药水**不消耗能量**、**不算打出卡牌**。
- 大多数药水只能在战斗中使用；**果汁(Fruit Juice)、熵变酿(Entropic Brew)、血药(Blood Potion)** 可在战斗外使用。
- 槽满时拾取新药水必须弃掉一瓶（战斗中也可主动丢弃药水）。
- 药水在商店的售价按稀有度：普通 50 / 非普通 75 / 稀有 100 金币。
- 稀有度掉落权重：普通 65% / 非普通 25% / 稀有 10%。
- 每个角色有 3 款专属药水（各稀有度 1 款）。
- 「神圣树皮(Sacred Bark)」使药水效果 ×2（括号内数值），例外清单见 Potions 页。

### 9.2 全 42 款药水详表

**通用普通（Common - Any）**：

| 药水 | 效果（Sacred Bark 加倍值） |
| --- | --- |
| 攻击药水(Attack Potion) | 3 选 1 随机攻击卡加入手牌，本回合 0 费 |
| 锻炉祝福(Blessing of the Forge) | 升级本场战斗手牌中所有卡 |
| 格挡药水(Block Potion) | 获得 12（24）格挡 |
| 无色药水(Colorless Potion) | 3 选 1 随机无色卡加入手牌，本回合 0 费 |
| 敏捷药水(Dexterity Potion) | +2（4）敏捷 |
| 能量药水(Energy Potion) | +2（4）能量 |
| 爆炸药水(Explosive Potion) | 对全体敌人造成 10（20）伤害 |
| 恐惧药水(Fear Potion) | 对目标施加 3（6）易伤 |
| 火焰药水(Fire Potion) | 对目标造成 20（40）伤害 |
| 类固醇药水(Flex Potion) | +5（10）力量，回合结束 −5（10）力量 |
| 能力药水(Power Potion) | 3 选 1 随机能力卡加入手牌，本回合 0 费 |
| 技能药水(Skill Potion) | 3 选 1 随机技能卡加入手牌，本回合 0 费 |
| 迅捷药水(Speed Potion) | +5（10）敏捷，回合结束 −5（10）敏捷 |
| 力量药水(Strength Potion) | +2（4）力量 |
| 迅捷抽卡药(Swift Potion) | 抽 3（6）张牌 |
| 虚弱药水(Weak Potion) | 对目标施加 3（6）虚弱 |

**角色专属普通**：

| 药水 | 效果 |
| --- | --- |
| 血药(Blood Potion)（铁甲） | 治疗最大 HP 的 20%（40%） |
| 剧毒药水(Poison Potion)（猎手） | 对目标施加 6（12）中毒 |
| 专注药水(Focus Potion)（故障） | +2（4）专注 |
| 瓶装奇迹(Bottled Miracle)（观者） | 手牌加入 2（4）张奇迹(Miracle) |

**通用非普通（Uncommon - Any）**：

| 药水 | 效果 |
| --- | --- |
| 远古药水(Ancient Potion) | 获得 1（2）神器(Artifact) |
| 蒸馏混沌(Distilled Chaos) | 打出抽牌堆顶 3（6）张卡 |
| 复制药水(Duplication Potion) | 本回合下一张卡（下两张卡）打两次 |
| 钢之精华(Essence of Steel) | 获得 4（8）镀层装甲 |
| 赌徒之酿(Gambler's Brew) | 弃任意张牌再抽等量 |
| 液态青铜(Liquid Bronze) | 获得 3（6）反伤(Thorns) |
| 液态记忆(Liquid Memories) | 从弃牌堆选 1（2）张回手，本回合 0 费 |
| 再生药水(Regen Potion) | 获得 5（10）再生(Regen) |

**角色专属非普通**：

| 药水 | 效果 |
| --- | --- |
| 炼金药剂(Elixir)（铁甲） | 消耗手牌中任意张卡 |
| 狡诈药水(Cunning Potion)（猎手） | 手牌加入 3（6）张升级手里剑(Shiv+) |
| 容量药水(Potion of Capacity)（故障） | +2（4）球槽 |
| 姿态药水(Stance Potion)（观者） | 进入平静或愤怒姿态 |

**稀有（Rare）**：

| 药水 | 效果 |
| --- | --- |
| 邪教徒药水(Cultist Potion) | 获得 1（2）仪式(Ritual) |
| 熵变酿(Entropic Brew) | 用随机药水装满所有空槽（含自身槽位） |
| 瓶中仙女(Fairy in a Bottle) | 首次死亡改为复活至 30%（60%）最大 HP 并弃掉本药水 |
| 果汁(Fruit Juice) | +5（10）最大 HP |
| 烟雾弹(Smoke Bomb) | 逃离非 BOSS 战斗（无奖励） |
| 异蛇油(Snecko Oil) | 抽 5（10）张牌，随机化手牌费用 |
| 钢铁之心(Heart of Iron)（铁甲） | 获得 6（12）金属化(Metallicize) |
| 瓶中幽灵(Ghost in a Jar)（猎手） | 获得 1（2）无形(Intangible) |
| 黑暗精华(Essence of Darkness)（故障） | 每个球槽引导 1（2）个黑暗球 |
| 神之食(Ambrosia)（观者） | 进入神格(Divinity) 姿态 |

---

## 10. 复刻实现要点汇总（开发者速查）

1. **回合循环**：`玩家回合(能量=3, 抽5, 手牌≤10) → 结束回合(结算: 遗物→Buff→卡) → 弃手牌 → 敌方全体行动(左→右) → 循环`。
2. **牌堆**：抽牌堆/弃牌堆/消耗堆三堆 + 手牌；能力卡打出后从系统中移除；抽空触发洗牌（仅弃牌堆回抽牌堆）。
3. **伤害**：`(基础+力量+活力) × 易伤1.5 × 虚弱0.75 → floor`；多段每段独立；攻击先扣格挡，HP 损失（中毒/灼烧类）绕过格挡。
4. **格挡**：回合开始清零（Barricade/Blur/Calipers 例外）；`(基础+敏捷) × 脆弱0.75 → floor`。
5. **奖励**：金币 10–20/25–35/95–105；卡 3 选 1（稀有 3%/37%/60 基准 −5% 起点 + 每普通卡 +1% 递补）；药水 40% 起步 ±10% 浮动；遗物 50/33/17。
6. **Buff/Debuff 引擎**建议按「强度/持续/计数」三层抽象实现（中毒为双属性特例；Shackled 为 debuff 壳 buff 逻辑的反例）。

---

## 参考来源（检索日期：2026-11-09）

1. Slay the Spire Wiki — Mechanics（回合/牌堆/手牌上限/宝箱）: https://slaythespire.wiki.gg/wiki/Mechanics
2. Slay the Spire Wiki — Keywords（格挡/能量/消耗/虚无/固有/保留/预见/弃牌）: https://slaythespire.wiki.gg/wiki/Keywords
3. Slay the Spire Wiki — Cards（卡牌类型/稀有度/奖励概率偏移/生成规则）: https://slaythespire.wiki.gg/wiki/Cards
4. Slay the Spire Wiki — Buffs（增益全表）: https://slaythespire.wiki.gg/wiki/Buffs
5. Slay the Spire Wiki — Debuffs（减益全表）: https://slaythespire.wiki.gg/wiki/Debuffs
6. Slay the Spire Wiki — Block（格挡来源与交互）: https://slaythespire.wiki.gg/wiki/Block
7. Slay the Spire Wiki — Gold（金币来源）: https://slaythespire.wiki.gg/wiki/Gold
8. Slay the Spire Wiki — Relics（遗物稀有度/获取/限制）: https://slaythespire.wiki.gg/wiki/Relics
9. Slay the Spire Wiki — Relics List（193 个遗物效果）: https://slaythespire.wiki.gg/wiki/Relics_List
10. Slay the Spire Wiki — Potions（药水槽/掉率/稀有度）: https://slaythespire.wiki.gg/wiki/Potions
11. Slay the Spire Wiki — Potions List（42 款药水）: https://slaythespire.wiki.gg/wiki/Potions_List
12. Slay the Spire Wiki — Burn: https://slaythespire.wiki.gg/wiki/Burn
13. Slay the Spire Wiki — Dazed: https://slaythespire.wiki.gg/wiki/Dazed
14. Slay the Spire Wiki — Void: https://slaythespire.wiki.gg/wiki/Void
15. Slay the Spire Wiki — Normality: https://slaythespire.wiki.gg/wiki/Normality
16. Slay the Spire Wiki — Pain: https://slaythespire.wiki.gg/wiki/Pain
17. Steam 商店页（Slay the Spire 官方）: https://store.steampowered.com/app/646570/Slay_the_Spire/
18. Mega Crit 官网: https://www.megacrit.com/
19. 18183 杀戮尖塔 2 词条（Scry 中文译名「预见」佐证）: http://www.18183.com （杀戮尖塔 2 先见之明/预见词条）
