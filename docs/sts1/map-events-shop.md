# 《杀戮尖塔1》局内结构与局外系统研究：地图、事件、商店、金币、升阶、解锁、模式

> 面向网页复刻开发的数值级参考文档。术语首次出现时标注英文原文。所有关键数值均标注来源；社区逆向工程结论单独标记。
> 数据基于正式版（Steam 1.0 后版本，2026-11 查证于 slaythespire.wiki.gg）。

---

## 目录

1. [幕(Act)结构](#1-幕act结构)
2. [地图生成规则](#2-地图生成规则)
3. [篝火选项](#3-篝火rest-site选项)
4. [商店系统](#4-商店系统merchant)
5. [事件系统](#5-事件系统events)
6. [金币经济](#6-金币经济gold)
7. [升阶系统 1-20 级](#7-升阶系统ascension-1-20-级)
8. [解锁进度](#8-解锁进度)
9. [游戏模式](#9-游戏模式)
10. [参考来源](#10-参考来源)

---

## 1. 幕(Act)结构

《杀戮尖塔1》共 3 个常规幕 + 1 个隐藏幕。每局开始于喵呜(Neow)事件（提供最多 4 个祝福选项），结束于第 3 幕或第 4 幕 Boss。[来源: wiki/Acts、wiki/Map_Generation]

### 1.1 各幕总览

| 幕 | 英文名 | 中文常用译名 | 层数（编号） | 结构 | Boss |
| --- | --- | --- | --- | --- | --- |
| 第 1 幕 | The Exordium | 誓约之地/外缘 | 第 1~17 层 | 15 行节点 + Boss 层(16) + Boss宝箱层(17) | 3 选 1：守卫者(The Guardian)、六火亡魂(Hexaghost)、史莱姆老大(The Slime Boss) |
| 第 2 幕 | The City | 城市 | 第 18~35 层 | 同第 1 幕格式 | 每局随机 3/4：收藏家(The Collector)、拳王(The Champ)、自动机(The Automaton)、觉醒者(The Awakened One) |
| 第 3 幕 | The Beyond | 彼岸 | 第 36~51 层（升阶20为 52 层） | 同上，但无 Boss 宝箱层；51(52) 层为通往第 4 幕的封印之门或胜利出口 | 每局随机 3/4：时间吞噬者(Time Eater)、多努与德卡(Donu and Deca)、涅墨西斯(Nemesis)、巨人首(Giant Head) |
| 第 4 幕（隐藏） | The Ending | 终局 | 固定 4 个房间 | 篝火 → 商店 → 精英 → Boss，**无事件、无普通怪、无?房间** | 固定：堕落之心(Corrupt Heart，即"心脏") |

> 注：第 2、3 幕的候选 Boss 池均为 4 个，每局地图生成时随机决定出现其中 3 个（Act 1 池为 3 个、全部出现）。Boss 具体数值请查阅专文（本文重点是结构与数值）。[来源: wiki/Map_Locations（"Every Act has 3 different bosses"）、wiki/Map_Generation]

### 1.2 节点类型（7 种）

| 节点 | 英文 | 图标说明 | 奖励 |
| --- | --- | --- | --- |
| 普通战斗 | Monster Encounter | 剑与怪物图标 | 10~20 金币、3 张卡牌奖励（可跳过）、概率掉落药水(Potion) |
| 精英 | Elite Encounter | 火焰怪物图标 | 必掉 1 件遗物(Relic)、25~35 金币、3 张卡牌（稀有/非凡卡概率提升）、分数加成 |
| 未知 | Unknown / Event (?) | 问号 | 进入时才决定内容：事件 / 战斗 / 商店 / 宝箱（见 §2.3） |
| 商店 | Merchant / Shop | 小屋+金币 | 购买卡牌/遗物/药水、删卡服务（见 §4） |
| 篝火 | Rest Site / Campfire | 篝火 | 休息/锻造等（见 §3） |
| 宝箱 | Treasure Room | 宝箱 | 开箱获得遗物（可能含金币，见 §6.3） |
| Boss | Boss | Boss 头像 | 见 §1.3 |

[来源: wiki/Map_Locations]

普通战斗细节：每幕有"简单池"和"困难池"两套怪组合。第 1 幕前 3 场、第 2/3 幕前 2 场从简单池抽取，其余从困难池抽取。[来源: wiki/Map_Locations]

精英细节：同一精英在一幕内可重复出现，但不会连续两次遇到（死亡冒险者事件例外）。[来源: wiki/Map_Locations]

### 1.3 Boss 层与幕间流程

- 第 16/33/50 层为 Boss 层（升阶 20 时第 3 幕 Boss 层为 51 层且为双 Boss）。[来源: wiki/Map_Generation]
- 击败第 1/2 幕 Boss：获得 95~105 金币 + 3 张稀有(Rare)卡牌三选一 + 概率药水；**下一层（17/34）为 Boss 宝箱**，从 3 件 Boss 遗物(Boss Relic)中三选一（可跳过）。[来源: wiki/Map_Locations]
- 第 3/4 幕 Boss **无任何奖励**。击败第 3 幕 Boss（未集齐钥匙）或击败心脏即胜利。[来源: wiki/Map_Locations]
- 幕间治疗：基础规则下进入下一幕时完全恢复生命；升阶 5 起改为只回复**已损失生命的 75%**。[来源: wiki/Ascension]
- 倒数第二层（15/32/49）必为篝火；**第 4 幕例外**——其第一个房间即篝火，Boss 前是精英（尖塔之盾与尖塔之矛 Spire Shield and Spire Spear）。[来源: wiki/Map_Locations、wiki/The_Ending]

### 1.4 隐藏第 4 幕（终局）与钥匙(Keys)

第 4 幕解锁条件：在同一个存档上分别用铁甲战士(Ironclad)、寂静猎手(Silent)、缺陷机器人(Defect) 各取胜一次后，玩家名旁出现 3 个钥匙图标；**单局内集齐 3 把钥匙**才能进入第 4 幕。钥匙获取方式：

| 钥匙 | 获取方式 |
| --- | --- |
| 红宝石钥匙(Ruby Key) | 在任意篝火选择"追忆(Recall)"（占用该次篝火行动） |
| 翡翠钥匙(Emerald Key) | 击败"超级精英"（地图上带燃烧动画的精英） |
| 蓝宝石钥匙(Sapphire Key) | 在任意宝箱处以放弃箱内遗物为代价换取 |

[来源: wiki/Mechanics#Keys、wiki/Rest_Sites]

第 4 幕固定 4 房间：篝火 → 商店 → 精英（尖塔之盾与尖塔之矛）→ Boss（堕落之心 Corrupt Heart）。无事件、无普通战斗、无未知房间。[来源: wiki/The_Ending]

---

## 2. 地图生成规则

### 2.1 基本布局

- 每幕地图为 **7 列 × 15 行** 的不规则等距网格（社区逆向工程结论，标记 [RE]），地图上每层最多 6 个节点（wiki 记载"up to six map locations on each floor"）。[来源: wiki/Map_Generation、Steam 指南[RE]]
- 点击"出发(Embark)"时生成新地图；一次运行内种子固定。[来源: wiki/Map_Generation]
- 除首尾层外，每个房间有 **1~3 条进入路径** 和 **1~3 条离开路径**。[来源: wiki/Map_Generation]

### 2.2 路径生成算法（社区逆向工程，标记 [RE]）

生成过程 [来源: Steam 指南/逆向工程帖，非官方]：

1. 从第 1 层随机选一个房间，向上连接到第 2 层**最近的 3 个房间之一**；逐层重复此模式向上爬升。
2. 此过程重复 6 次（6 条"路径链"），遵守规则：
   - 第 1 层最先随机选中的两个房间不能相同 → 保证至少有 2 个不同起点（实际起点通常为 3~5 个）；
   - **路径不能交叉**。
3. 没有被任何路径连到的房间被删除。
4. 最后将第 15 层（全篝火）所有房间连到随机选出的该幕 Boss 房。

### 2.3 固定楼层与概率

**固定楼层规则**（官方 wiki 记载）[来源: wiki/Map_Generation]：

| 层（第 1 幕） | 内容 | 第 2/3 幕对应 |
| --- | --- | --- |
| 第 1 层 | 全部为简单池普通战斗 | 18 / 36 层同 |
| 第 9 层 | 全部宝箱房 | 26 / 44 层 |
| 第 15 层 | 全部篝火 | 32 / 49 层 |
| 第 16 层 | Boss | 33 / 50 层 |
| 第 17 层 | Boss 宝箱（地图上不可见，但计入层数） | 34 / —— |

其余节点按权重随机分配（wiki 数值）[来源: wiki/Map_Generation]：

| 节点类型 | 基础权重 |
| --- | --- |
| 普通战斗 | 53% |
| 精英 | 8% |
| 篝火 | 12% |
| 商店 | 5% |
| 未知(?) | 22% |

升阶(Ascension) 1 起精英数量乘以 **1.6**（源码 `AbstractDungeon`：`eliteCount = round(availableRoomCount × eliteRoomChance × 1.6f)`；"Deadly Events" 每日修正为 ×2.5）。wiki 的"~60% more Elites"正确；社区逆向的"8%→16%"错误。[CODE]

**未知(?)房间的实时概率**：地图生成时不决定 ? 房内容；进入时按概率决定是事件、战斗、商店还是宝箱。某类型未出现时其下次概率上升，出现后重置为基线；幕切换时全部重置。[来源: wiki/Map_Generation、wiki/Map_Locations]

**类型分配覆盖规则**（社区逆向工程，标记 [RE]）[来源: Steam 指南，引 reddit 逆向帖]：

1. 精英与篝火不能分配在第 6 层以下（即前 5 层不出精英/篝火/商店？——原帖仅指精英与篝火）；
2. 精英、商店、篝火**同类不相邻**（同类型不能被一条路径直接相连，例如两个篝火不能上下直连）；
3. 一个房间若有 2 条以上出边，其各目标节点类型必须互不相同；
4. 篝火不能出现在第 14 层（15 层已是全篝火行）。
5. 若违反上述规则则重新掷骰分配直至合规。

### 2.4 种子(Seed)机制

- 所有随机性源于开局固定的字母数字种子；种子决定各幕地图布局、路径与 Boss 选择；**角色与升阶等级不影响种子结果**（跨平台不同）。
- 使用"设定种子(Set Seed)"可复现地图，但禁用排行榜与成就。

[来源: wiki/Map_Generation]

---

## 3. 篝火(Rest Site)选项

每个篝火只能选择**一个**行动。默认选项 2 个 + 隐藏第 4 幕后追加 1 个。[来源: wiki/Rest_Sites、wiki/Map_Locations]

### 3.1 标准选项

| 选项 | 英文 | 效果 | 备注 |
| --- | --- | --- | --- |
| 休息 | Rest | 回复最大生命的 **30%**（向下取整） | 被咖啡滴漏(Coffee Dripper)、绽放烙印(Mark of the Bloom)禁用；满血时仍可选 |
| 锻造 | Smith | 升级(Upgrade) 1 张卡牌 | 被熔合锤(Fusion Hammer)或全部卡牌已升级时禁用 |
| 追忆 | Recall | 获得红宝石钥匙(Ruby Key) | 仅当该存档已解锁第 4 幕且本局未取过时出现 |

### 3.2 遗物追加选项（每个篝火最多追加，见备注）

| 选项 | 所需遗物 | 效果 |
| --- | --- | --- |
| 举重 Lift | 吉亚·大力神像(Girya) | +1 力量(Strength)（整局最多使用 3 次） |
| 吸烟 Toke | 和平烟斗(Peace Pipe) | 从卡组移除 1 张卡 |
| 挖掘 Dig | 铲子(Shovel) | 获得随机遗物 |

> wiki 注：上述"特殊遗物"每次运行最多同时持有其中 2 个。[来源: wiki/Rest_Sites]

### 3.3 相关遗物交互

- 捕梦网(Dream Catcher)：休息后额外获得一次卡牌奖励选择。
- 皇家枕头(Regal Pillow)：休息回复量 +15 HP。
- 永恒之羽(Eternal Feather)：进入篝火时自动回复 3 × ⌊卡组卡数/5⌋ HP（每 5 张卡回 3 血），不占用行动。
- 远古茶具(Ancient Tea Set)：离开篝火后下一场战斗第一回合 +2 能量。

[来源: wiki/Rest_Sites]

---

## 4. 商店系统(Merchant)

商店节点（或 ? 房间刷出的商店）出售：5 张角色卡、2 张无色卡、3 件遗物、3 瓶药水、1 次删卡服务。升阶 16 起全部价格 +10%。[来源: wiki/The_Merchant]

### 4.1 卡牌价格（按稀有度）

| 类别 | 稀有度 | 基础价格 | 升阶 16 后 |
| --- | --- | --- | --- |
| 角色卡 | 普通(Common) | 45~55 | 50~61 |
| 角色卡 | 非凡(Uncommon) | 68~83 | 75~91 |
| 角色卡 | 稀有(Rare) | 135~165 | 149~182 |
| 无色卡(Colorless) | 非凡 | 81~99 | 89~109 |
| 无色卡 | 稀有 | 162~198 | 178~218 |

- 5 张角色卡固定构成为 **2 攻击 + 2 技能 + 1 能力(Power)**；其中随机 1 张有 50% 折扣。
- 2 张无色卡固定为 1 张非凡无色 + 1 张稀有无色；无色卡比常规卡贵 20%。

[来源: wiki/The_Merchant]

### 4.2 药水价格（3 瓶，抽取权重：普通 65% / 非凡 25% / 稀有 10%）

| 稀有度 | 基础价格 | 升阶 16 后 |
| --- | --- | --- |
| 普通 | 48~53 | 52~58 |
| 非凡 | 71~79 | 79~87 |
| 稀有 | 95~105 | 105~116 |

[来源: wiki/The_Merchant]

### 4.3 遗物价格（3 件，抽取权重：普通 50% / 非凡 33% / 稀有 17%；最右侧槽位必为商店专属遗物）

| 稀有度 | 基础价格 | 升阶 16 后 |
| --- | --- | --- |
| 商店专属(Shop) | 143~158 | 157~173 |
| 普通 | 143~158 | 157~173 |
| 非凡 | 238~263 | 261~289 |
| 稀有 | 285~315 | 314~347 |

[来源: wiki/The_Merchant]

### 4.4 删卡服务(Card Removal Service)

- 每个商店限用 1 次；**初始 75 金，每使用一次后价格 +25**（全局累计，跨商店、跨幕）。
- 微笑面具(Smiling Mask)：删卡价格恒定 50 金且不再上涨（覆盖会员卡折扣）。
- 会员卡(Membership Card)：商店所有商品 **5 折**。
- 信使(The Courier)：购买后补货（商店遗物不补），且全场价格 -20%；与会员卡叠加时合计 6 折（0.5×0.8=0.4）；升阶 16 的涨价对补货商品不生效。
- 颚之储蓄罐(Maw Bank)：每上一层楼 +12 金，一旦在商店消费过金币即失效。
- 餐票(Meal Ticket)：每次进入商店回复 15 HP。

[来源: wiki/The_Merchant、wiki/Gold]

---

## 5. 事件系统(Events)

### 5.1 触发规则

- 事件只出现在**未知(?)房间**（? 房间还可能是战斗/商店/宝箱，见 §2.3）。
- 内部事件分 3 类：
  - **幕事件(Act Events)**：常规事件，限定某一幕，每幕每种只出现 1 次（错过即本局不再出现）；
  - **神龛(Shrines)**：稀有，可在任意幕出现，每幕每种最多 1 次（换幕重置）；
  - **一次性事件(One-Time Events)**：稀有，整局只出现 1 次。
- 当 ? 房间判定为"事件"时，大概率是幕事件，小概率从"神龛 + 一次性事件"合并池中抽取。
- 事件有出现前提（如：克莱里克需至少 35 金；知识头骨(Knowing Skull)需 HP>12；摩艾石像(The Moai Head)需持有黄金偶像或 HP≤50%；有的限定楼层，如 hypnotizing 彩色蘑菇限第 7 层以上）。
- 升阶 15 起，多数事件正面收益减少/负面加重。

[来源: wiki/Events、wiki/Events_List]

### 5.2 代表性事件详表（14 个，含全部选项后果）

> 格式：事件名中英 / 出现范围 / 选项与后果。`[A15]` 表示升阶 15 的数值变化。

#### 第 1 幕

**① 黄金偶像(Golden Idol)** — 第 1 幕限定

| 选项 | 后果 |
| --- | --- |
| [拿取 Take] | 获得黄金偶像遗物（敌人金币掉落 +25%），随后触发巨石陷阱，强制进入下述二选一 |
| ├ [跑赢 Outrun] | 逃出，但获得诅咒 Injury（无法打出，占手牌） |
| ├ [砸碎 Smash] | 受到最大生命 25% 的伤害（[A15] 35%） |
| └ [躲藏 Hide] | 失去最大生命 8% 的最大生命上限（[A15] 10%） |
| [离开 Leave] | 无事发生 |

[来源: wiki/Golden_Idol_(Event)]

**② 克莱里克/教士(The Cleric)** — 第 1 幕限定，需至少 35 金

| 选项 | 后果 |
| --- | --- |
| [治疗 Heal] | 花 35 金，回复最大生命 25%（向下取整） |
| [净化 Purify] | 花 50 金（[A15] 75 金）删 1 张卡 |
| [离开 Leave] | 无事发生 |

[来源: wiki/The_Cleric]

**③ 大鱼(Big Fish)** — 第 1 幕限定

| 选项 | 后果 |
| --- | --- |
| [香蕉 Banana] | 回复最大生命的 1/3（向下取整） |
| [甜甜圈 Donut] | 最大生命 +5（同时回复 5 点） |
| [盒子 Box] | 获得随机普通/非凡/稀有遗物，但获得诅咒 Regret（回合结束失去等同于手牌数的 HP） |

[来源: wiki/Big_Fish]

**④ 闪光之光(Shining Light)** — 第 1 幕限定

| 选项 | 后果 |
| --- | --- |
| [进入 Enter] | 失去最大生命 20%（[A15] 30%）的 HP，升级 2 张**随机**卡牌 |
| [离开 Leave] | 无事发生 |

[来源: wiki/Shining_Light]

**⑤ 翼像(Wing Statue，内部名 Golden Wing)** — 第 1 幕限定

| 选项 | 后果 |
| --- | --- |
| [祈祷 Pray] | 失去 7 HP，删除 1 张卡 |
| [摧毁 Destroy] | 获得 50~80 金（前提：卡组中有单次伤害 ≥10 的攻击卡，否则显示 [锁定 Locked]） |
| [离开 Leave] | 无事发生 |

[来源: wiki/Wing_Statue]

#### 全幕通用（神龛/一次性）

**⑥ 营火之灵(Bonfire Spirits)** — 一次性事件，任意幕

| 选项 | 后果 |
| --- | --- |
| [献祭 Offer] | 删除 1 张卡，按其稀有度获得回报：基础(Basic)卡→无效果；普通→回复 5 HP；非凡→回满 HP；稀有→最大生命 +10 并回满；诅咒→获得"便便(Spirit Poop)"遗物（纯负面，分数 -1） |

[来源: wiki/Bonfire_Spirits]

**⑦ 黄金神龛(Golden Shrine)** — 神龛，任意幕

| 选项 | 后果 |
| --- | --- |
| [祈祷 Pray] | +100 金（[A15] 50 金） |
| [亵渎 Desecrate] | +275 金，获得诅咒 Regret |
| [离开 Leave] | 无事发生 |

[来源: wiki/Golden_Shrine]

**⑧ 蓝衣女人(The Woman in Blue)** — 一次性事件，任意幕

| 选项 | 后果 |
| --- | --- |
| [买 1 瓶] | 20 金买 1 瓶随机药水 |
| [买 2 瓶] | 30 金买 1 瓶（可重复购买，价格递增 20→30→40） |
| [买 3 瓶] | 40 金买 1 瓶 |
| [离开 Leave] | 无事发生 |

[来源: wiki/The_Woman_in_Blue]

#### 第 2 幕

**⑨ 吸血鬼(Vampires)** — 第 2 幕限定

| 选项 | 后果 |
| --- | --- |
| [献上血瓶 Offer: Blood Vial] | 失去血瓶遗物；移除所有打击(Strike)，获得 5 张撕咬(Bite)（1 费 7 伤 2 吸血，升级后 8 伤 3 吸血）（仅持有血瓶时出现） |
| [接受 Accept] | 移除所有打击，获得 5 张撕咬，失去最大生命 30% 的上限 |
| [拒绝 Refuse] | 无事发生 |

[来源: wiki/Vampires]

**⑩ 图书馆(The Library)** — 第 2 幕限定

| 选项 | 后果 |
| --- | --- |
| [阅读 Read] | 从 20 张卡中选 1 张加入卡组 |
| [睡觉 Sleep] | 回复最大生命 33%（[A15] 20%） |

[来源: wiki/The_Library]

**⑪ 幽灵议会(Council of Ghosts)** — 第 2 幕限定

| 选项 | 后果 |
| --- | --- |
| [接受 Accept] | 获得 5 张幻影(Apparition)（1 费：获得 1 层无形(Intangible)、消耗，虚体(Ethereal)），失去最大生命 50%（向上取整）的上限（[A15] 只给 3 张） |
| [拒绝 Refuse] | 无事发生 |

[来源: wiki/Council_of_Ghosts]

**⑫ 竞技场(The Colosseum)** — 第 2 幕限定（只出现在第 6 层保证宝箱房之后）

| 选项 | 后果 |
| --- | --- |
| [战斗 Fight] | 与蓝奴役者+红奴役者(Blue/Red Slaver)战斗（无奖励） |
| ├ [怯懦 COWARDICE] | 逃离竞技场 |
| └ [胜利 VICTORY] | 与监工(Taskmaster)+小鬼首领(Gremlin Nob)精英级战斗；奖励 100 金 + 1 稀有遗物 + 1 非凡遗物 + 卡牌奖励 + 概率药水 |

[来源: wiki/The_Colosseum]

#### 第 3 幕

**⑬ 心灵绽放(Mind Bloom)** — 第 3 幕限定

| 选项 | 后果 |
| --- | --- |
| [我是战争 I am War] | 与随机第 1 幕 Boss 战斗；掉落 1 件稀有遗物 + 50 金（[A15] 25 金）+ 常规战斗奖励 |
| [我已觉醒 I am Awake] | 升级卡组全部卡牌，获得绽放烙印(Mark of the Bloom)（无法再回复生命） |
| [我是富豪 I am Rich] | +999 金，获得 2 张诅咒 Normality（仅第 35~40 层出现此选项） |
| [我很健康 I am Healthy] | 回满 HP，获得诅咒 Doubt（回合结束获得 1 虚弱 Weak）（第 41 层起替代"我是富豪"） |

[来源: wiki/Mind_Bloom]

**⑭ 摩艾石像(The Moai Head)** — 第 3 幕限定（需 HP≤50% 或持有黄金偶像）

| 选项 | 后果 |
| --- | --- |
| [跳进去 Jump Inside] | 回满 HP，失去最大生命 12.5%（[A15] 18%）的上限 |
| [献上黄金偶像 Offer] | 失去黄金偶像，+333 金（无偶像时显示 [锁定]） |
| [离开 Leave] | 无事发生 |

[来源: wiki/The_Moai_Head]

### 5.3 其他值得记录的事件数值（简表）

| 事件 | 幕 | 关键数值 |
| --- | --- | --- |
| 死亡冒险者(Dead Adventurer) | 1 | 搜身可能获 30 金，可能触发精英战（掉精英奖励） |
| 彩色蘑菇(Hypnotizing Colored Mushrooms) | 1 | 第 7 层起出现；吃蘑菇回血但得诅咒，或打真菌兽获特殊遗物 |
| 废料粘泥(Scrap Ooze) | 1 | 消耗 HP 换遗物 |
| 世界粘液(World of Goop) | 1 | 花 11 HP 捡 75 金，或直接损失 20~50 金（[A15] 35~75，不超过持有量） |
| 蛇人(The Ssssserpent) | 1 | +175 金（[A15] 150）+ 诅咒 Doubt |
| 远古文字(Ancient Writing) | 2 | 删 1 张卡 或 升级全部打击/防御 |
| 增幅者(Augmenter) | 2 | J.A.X.（+1 力量并加 1 张痼疾？）/ 变形 2 张卡 / 突变力量(Mutagenic Strength) |
| 遗忘祭坛(Forgotten Altar) | 2 | 黄金偶像换血腥偶像(Bloody Idol)，或以 HP/诅咒交换 |
| 知识头骨(Knowing Skull) | 2 | HP>12 才出现；每次点击花 HP（从 6 起每点一次 +1）换奖励，其中一项为 90 金 |
| 马戏团赌注(The Joust) | 2 | 押 50 金，70% 赢 100 金 / 30% 赢 250 金 |
| 巢穴(The Nest) | 2 | 捐赠箱可拿 99 金（[A15] 50），或参与仪式偷仪式匕首 |
| 老乞丐(Old Beggar) | 2 | 给金币 |
| 恳求流浪者(Pleading Vagrant) | 2 | 金币换遗物，或抢劫（获诅咒） |
| 红面具之墓(Tomb of Lord Red Mask) | 3 | 全部金币换红面具(Red Mask)；已有红面具则戴上 +222 金 |
| 坠落(Falling) | 3 | 牺牲 1 张卡安全落地 |
| 神秘球体(Mysterious Sphere) | 3 | 打守卫换奖励 |
| 秘密传送门(Secret Portal) | 3 | 直达 Boss |
| 感官之石(Sensory Stone) | 3 | 受伤换无色卡 |
| 迷途大厅(Winding Halls) | 3 | 迷宫中抉择（含获得诅咒的选项） |
| 洁净之泉(The Divine Fountain) | 任意 | 需已有诅咒；移除全部诅咒 |
| 变形者(Transmogrifier) / 升级神龛(Upgrade Shrine) / 净化者(Purifier) / 复制器(Duplicator) / 命运之轮(Wheel of Change) / 实验室(Lab) / 配对保留(Match and Keep) / 阴森熔炉(Ominous Forge) / 我们又见面了(We Meet Again!) / 给自己的便条(A Note For Yourself) / 脸颊商人(Face Trader) | 任意 | 神龛/一次性类：变形卡 / 升级卡 / 删卡 / 复制卡 / 转盘随机奖（含 100/200/300 金按幕递增）/ 3 瓶药水 / 翻牌配对 / 升级或遗物+诅咒 / 以金/药水/卡换遗物 / 卡片交换 / 面具遗物或 75 金（[A15] 50） |

[来源: wiki/Events_List、wiki/Gold]

### 5.4 诅咒(Curse)卡获取途径

| 途径 | 例子 |
| --- | --- |
| 事件选项 | 黄金偶像→Injury；大鱼/黄金神龛→Regret；蛇人→Doubt；心灵绽放→Normality×2 或 Doubt；陵墓(The Mausoleum)→Writhe（[A15] 必得）；遗忘祭坛等 |
| 喵呜(Neow)开局祝福 | 部分负面祝福附带随机诅咒 |
| 升阶 10 | 开局自带登顶者之祸(Ascender's Bane)（无法移除、虚体、不可打出） |
| 自定义模式 | 诅咒奔跑(Cursed Run)、瘟疫宝箱等（每杀 Boss 得 2 随机诅咒等） |
| 移除途径 | 商店删卡、篝火(和平烟斗)、净化者/克莱里克/洁净之泉等事件、蓝蜡烛可主动打出部分诅咒 |

[来源: wiki/Ascension、wiki/Events_List、wiki/Custom_Mode、wiki/Gold]

---

## 6. 金币经济(Gold)

开局携带 **99 金**。[来源: wiki/Gold]

### 6.1 战斗掉落

| 来源 | 金币 |
| --- | --- |
| 普通战斗 | 10~20 |
| 精英 | 25~35 |
| Boss | 95~105（升阶 13 起 71~79） |

[来源: wiki/Gold、wiki/Map_Locations]

### 6.2 事件与遗物

- 喵呜：选项 2 类可白给 100 金；选项 3 类 250 金（带代价）。
- 关键遗物：古旧硬币(Old Coin) +300；颚之储蓄罐(Maw Bank) 每层 +12（商店消费后失效）；小房子(Tiny House) +50；陶瓷鱼(Ceramic Fish) 每加 1 卡 +9；蛇头(Ssserpent Head) 每进 ? 房 +50；黄金偶像 敌人掉金 +25%。
- 事件金币见 §5.3（黄金神龛 100/275、摩艾 333、心灵绽放 999、红面具墓 222、竞技场 100、命运之轮按幕 100/200/300 等）。
- 负面：异界质体(Ectoplasm) 无法再获得金币（含事件）。

[来源: wiki/Gold]

### 6.3 宝箱金币

宝箱只有在同时开出最低稀有度遗物时才可能带金币 [来源: wiki/Gold]：

| 箱型 | 出现率 | 概率 | 金币 |
| --- | --- | --- | --- |
| 小箱 | 50% | 50% | 23~27 |
| 中箱 | 33% | 35% | 45~55 |
| 大箱 | 17% | 50% | 68~82 |

（wiki/Mechanics 同页记载金额 23-27 / 45-55 / 68-82，与 Gold 页 23-28 / 68-83 微差，以 Gold 页为准并在此标注。）

### 6.4 粗算（来自社区指南 [RE]）

按权重估算约 75% 房间涉及战斗（? 房约一半是战斗）；每幕普通战斗约贡献 120 金 + 精英约 90 金 + Boss 约 100 金。

---

## 7. 升阶系统(Ascension) 1-20 级

- 解锁：用某角色击败任意第 3 幕 Boss 后解锁升阶开关；在该等级击败第 3 幕 Boss 解锁下一级。**不需要**进第 4 幕或打心脏。满级 20。
- 各角色的升阶进度独立；已解锁的任意等级均可选择。
- **所有升阶效果叠加**（高等级包含低等级全部修改）。
- 升阶 N 使结算分数 +5%/级。

[来源: wiki/Ascension]

| 等级 | 效果（英文原文意译） |
| --- | --- |
| 1 | 精英出现更频繁（约 +60%） |
| 2 | 普通敌人伤害提升 |
| 3 | 精英伤害提升 |
| 4 | Boss 伤害提升 |
| 5 | Boss 战后只回复已损失生命的 75%（原为 100%） |
| 6 | 开局失去 10% 生命上限 |
| 7 | 普通敌人生命提升，有时附带格挡(Block) |
| 8 | 精英生命提升，有时附带格挡 |
| 9 | Boss 生命提升，有时附带格挡 |
| 10 | 开局获得登顶者之祸(Ascender's Bane)诅咒（不可移除） |
| 11 | 药水槽 -1 |
| 12 | 第 2/3 幕中已升级卡牌出现概率减半 |
| 13 | Boss 金币掉落 -25% |
| 14 | 最大生命 -5（铁甲战士）/-4（其余角色） |
| 15 | 事件结果更不利（回血更少、价格更高、更容易被诅咒等） |
| 16 | 商店全部价格 +10% |
| 17 | 普通敌人招式/能力更凶 |
| 18 | 精英招式/能力更凶 |
| 19 | Boss 招式/能力更凶 |
| 20 | 第 3 幕末**双 Boss**（同层连续两个第 3 幕 Boss；对应层号 51/52） |

[来源: wiki/Ascension 全表]

> 注：升阶 2/3/4（伤害提升）与 7/8/9（生命提升）的具体倍率 wiki 未公开列出数值，社区测得精英血量为 1.5×、Boss 约 2.5× 等，未官方证实，故不列出，复刻时可自行定参。升阶 17-19 的"招式更凶"为隐藏 AI/招式表变化，同样无数值。

---

## 8. 解锁进度

### 8.1 角色解锁顺序

| 顺序 | 角色 | 解锁条件 |
| --- | --- | --- |
| 1 | 铁甲战士(Ironclad) | 初始可用 |
| 2 | 寂静猎手(The Silent) | 用铁甲战士完成一次运行（不需胜利） |
| 3 | 缺陷机器人(The Defect) | 用寂静猎手完成一次运行（不需胜利） |
| 4 | 观察者(The Watcher) | 用任意基础角色在**非设定种子**运行中击败第 3 幕 Boss |

[来源: wiki/Ironclad、wiki/Silent、wiki/Defect、wiki/Watcher]

### 8.2 每角色 5 级解锁（通过运行分数 Score 累计逐级解锁）

分数用于解锁卡牌/遗物；各角色解锁树独立。每个角色 5 级，每级一次性解锁多项内容（卡牌优先）：

| 角色 | 1 级 | 2 级 | 3 级 | 4 级 | 5 级 |
| --- | --- | --- | --- | --- | --- |
| 铁甲战士 | 重刃(Heavy Blade)、发现弱点(Spot Weakness)、极限突破(Limit Break) | 御守(Omamori)、转经轮(Prayer Wheel)、铲子(Shovel) | 蛮力打击(Wild Strike)、进化(Evolve)、炼狱(Immolate) | 浩劫(Havoc)、哨卫(Sentinel)、掘墓(Exhume) | 蓝蜡烛(Blue Candle)、枯枝(Dead Branch)、歌碗(Singing Bowl) |
| 寂静猎手 | 毒刃(Bane)、催化剂(Catalyst)、尸爆(Corpse Explosion) | 巫毒娃娃(Du-Vu Doll)、微笑面具(Smiling Mask)、小宝箱(Tiny Chest) | 匕首投掷/暗斗篷(Cloak and Dagger)、精准(Accuracy)、钢铁风暴(Storm of Steel) | 战争艺术(Art of War)、信使(The Courier)、潘多拉魔盒(Pandora's Box) | 集中(Concentrate)、布设(Setup)、压轴戏(Grand Finale) |
| 缺陷机器人 | 回旋(Rebound)、平衡(Equilibrium)、回声形态(Echo Form) | 涡轮(TURBO)、裂解(Sunder)、流星撞击(Meteor Strike) | 超光束(Hyperbeam)、回收(Recycle)、核心浪涌(Core Surge) | 镀金线缆(Gold-Plated Cables)、芜菁(Turnip)、符文电容器(Runic Capacitor) | 数据盘(Data Disk)、共生病毒(Symbiotic Virus)、情感芯片(Emotion Chip) |
| 观察者 | 伏拜(Prostrate)、亵渎(Blasphemy)、献身(Devotion) | 外部影响(Foreign Influence)、阿尔法(Alpha)、精神堡垒(Mental Fortress) | 灵盾(Spirit Shield)、祈愿(Wish)、预见(Foresight) | 赤牛(Akabeko)、二元(Duality)、陶瓷鱼(Ceramic Fish) | 打击木偶(Strike Dummy)、泪滴挂坠盒(Teardrop Locket)、斗篷扣(Cloak Clasp) |

[来源: wiki/Ironclad#Unlocks、Silent#Unlocks、Defect#Unlocks、Watcher#Unlocks]

### 8.3 分数(Score)构成（解锁进度的驱动数值）

要点（完整表见 wiki/Score）：每层楼 +5、每敌 +2、每精英按幕 +10/20/30、第 N 个 Boss +50N；无伤精英 +25/个、无伤 Boss +50/个、三 Boss 无伤 +200；心脏击杀 +250；单次攻击 99 伤 +25；一回合 20 卡 +25；60 分钟内获胜 +25 / 45 分钟 +50；持有金 1000/2000/3000 → +25/50/75；无重复卡组 +100；25 遗物 +50；4 张同名卡每套 +25；无稀有卡 +50；卡组 ≥35/50 张 +25/50；最大生命 +15/+30 → +25/50；≥5 诅咒 +100；15 个? 房 +25；便便 -1；升阶每级 +5% 分数。

### 8.4 成就与解锁的关联

- 自定义模式(Custom Mode) 与设定种子运行**禁用成就与排行榜**（也禁用喵呜开局祝福，自定义模式）。
- 成就不直接驱动卡牌/遗物解锁（解锁由分数驱动）；成就是 Steam 平台目标，如"我的幸运日(My Lucky Day)：赢得一次每日攀登"（外部成就站核实）。
- 第 4 幕入口、钥匙图标、观察者角色等由胜负进度解锁（见 §8.1、"自定义模式"中"The Ending"修改器需用四个角色在标准模式击败心脏后才显示）。

[来源: wiki/Custom_Mode、wiki/Map_Generation、wiki/Mind_Bloom（成就举例 Who Needs Relics?）、TrueAchievements]

---

## 9. 游戏模式

### 9.1 标准模式(Standard)

即默认模式：3 幕（集齐钥匙可进第 4 幕）、可调升阶、计入分数/成就/排行榜。

### 9.2 每日攀登(Daily Climb)

- 每天一个全球统一的固定挑战：**当日固定种子、固定角色、固定 3 个每日修改器**（从下表池中随机选 3 个）。
- 完成后计入每日排行榜；成就"我的幸运日"要求赢得一次。
- 解锁条件：见 §10 不确定项（社区普遍记忆为"首次击败第 3 幕 Boss（首次获胜）后开放"，未在现行 wiki 页找到原文，复刻时建议按此实现）。

[来源: wiki/Custom_Mode（Daily Modifiers 节）、TrueAchievements；固定角色/种子部分为游戏内常识，标注为待确证]

### 9.3 自定义模式(Custom Mode)

- 玩一次每日攀登后解锁。
- 可任意叠加修改器（含全部每日修改器）、自选种子/角色/升阶等级；**禁用成就、排行榜与喵呜开局祝福**；互斥修改器后选的生效。

**每日修改器池**（每日攀登随机取 3；自定义模式可全选）：

| 修改器 | 英文 | 效果 |
| --- | --- | --- |
| 选秀 | Draft | 轮抽开局卡组（15 次 3 选 1） |
| 密封卡组 | Sealed Deck | 从 30 张随机卡中挑 10 张组成卡组 |
| 囤积者 | Hoarder | 每加 1 张卡额外 +2 张同款；商店不可删卡 |
| 疯狂 | Insanity | 随机 50 张卡开局 |
| 嵌合体 | Chimera | 开局卡组为 4 角色融合 |
| 闪亮 | Shiny | 开局拥有每张本角色稀有卡各 1 |
| 专精 | Specialized | 开局 5 张同一张卡 |
| 古董 | Vintage | 普通敌人掉遗物不掉卡 |
| 受控混沌 | Controlled Chaos | 开局冻结之眼 + 每回合抽牌堆底加 10 张随机卡 |
| 全明星 | All Star | 开局 5 张无色卡 |
| 多元 | Diverse | 卡牌不受角色限制 |
| 红/绿/蓝/紫/无色卡 | Red/Green/Blue/Purple/Colorless Cards | 对应颜色卡进入奖励与商店 |
| 传家宝 | Heirloom | 开局 1 件随机稀有遗物 |
| 时间膨胀 | Time Dilation | 全体敌人带减速(Slow) |
| 飞行 | Flight | 选房间无视路径 |
| 致命事件 | Deadly Events | ? 房可能出精英、宝箱概率提高 |
| 二元 | Binary | 卡牌奖励只有 2 张 |
| 诅咒奔跑 | Cursed Run | 每杀 1 个 Boss 得随机诅咒；开局遗物换为诅咒钥匙/暗石垂饰/巫毒娃娃 |
| 大猎手 | Big Game Hunter | 精英变多且必掉稀有卡 |
| 致命性 | Lethality | 开战敌我各 +3 力量 |
| 迈达斯 | Midas | 敌人掉金 +200%，篝火不可升级卡 |
| 夜惊 | Night Terrors | 篝火回满血但 -5 最大生命 |
| 终末 | Terminal | 每进 1 房 -1 最大生命，开战 5 层板甲(Plated Armor) |
| 注定未来 | Certain Future | 地图只有一条路径 |

**仅自定义可选**：每日修改器(随机 3 个日修)、终局(The Ending，启用第 4 幕/钥匙)、无尽(Endless，通关后带卡组回到第 1 幕，喵呜改发瘟疫 Blights)、瘟疫宝箱、赞美蛇虫(Snecko 眼开局)、胎记/起点(Inception，永动陀螺开局)、我的真身(My True Form)、一击奇迹(One Hit Wonder，1 最大生命)、初始卡组等。

[来源: wiki/Custom_Mode 全表]

---

## 10. 参考来源

- 官方 wiki（slaythespire.wiki.gg，Slay the Spire 1 主站）：
  - 幕与节点：https://slaythespire.wiki.gg/wiki/Acts 、/wiki/Map_Locations 、/wiki/The_Ending
  - 地图生成：https://slaythespire.wiki.gg/wiki/Map_Generation
  - 篝火：https://slaythespire.wiki.gg/wiki/Rest_Sites
  - 商店：https://slaythespire.wiki.gg/wiki/The_Merchant
  - 事件总述：https://slaythespire.wiki.gg/wiki/Events 、/wiki/Events_List
  - 事件分页：/wiki/Golden_Idol_(Event) 、/wiki/The_Cleric 、/wiki/Big_Fish 、/wiki/Shining_Light 、/wiki/Wing_Statue 、/wiki/Bonfire_Spirits 、/wiki/Golden_Shrine 、/wiki/The_Woman_in_Blue 、/wiki/Vampires 、/wiki/The_Library 、/wiki/Council_of_Ghosts 、/wiki/The_Colosseum 、/wiki/Mind_Bloom 、/wiki/The_Moai_Head
  - 金币：https://slaythespire.wiki.gg/wiki/Gold
  - 机制（含钥匙、宝箱）：https://slaythespire.wiki.gg/wiki/Mechanics
  - 升阶：https://slaythespire.wiki.gg/wiki/Ascension
  - 分数与解锁：https://slaythespire.wiki.gg/wiki/Score
  - 角色解锁：/wiki/Ironclad 、/wiki/Silent 、/wiki/Defect 、/wiki/Watcher
  - 自定义模式：https://slaythespire.wiki.gg/wiki/Custom_Mode
- 社区逆向工程（标记 [RE]，非官方）：
  - Steam 指南《Map Generation in Slay the Spire》：https://steamcommunity.com/sharedfiles/filedetails/?id=2830078257
  - 其引用的 reddit 逆向帖：https://www.reddit.com/r/slaythespire/comments/ndqweh/i_have_reverseengineered_map_generation_algorithm/
- 成就参考：TrueAchievements（My Lucky Day）：https://www.trueachievements.com/a280184/my-lucky-day-achievement
- 官方渠道：Steam 商店页 https://store.steampowered.com/app/646570/ ；开发商 Mega Crit 官网 https://www.megacrit.com/

### 不确定项与待确证

1. ~~升阶 1 精英概率的具体数值~~ **已由源码解决**：精英数量 ×1.6（见 §3 [CODE]）。
2. **升阶 2/3/4（伤害）与 7/8/9（血量）倍率、17-19 招式变化**：官方未公开数值，需实测或自定参数。
3. **每日攀登(Daily Climb) 的解锁条件**：未能在现行 wiki 找到原文；社区普遍记忆为"首次击败第 3 幕 Boss 后解锁"。固定种子/固定角色的说法为游戏常识，未在本文来源中逐字验证。
4. **地图生成覆盖规则（§2.2/§2.3 的 [RE] 部分）**来自社区逆向工程，与官方 wiki 的宏观描述（17 层、1-3 出入口、固定楼层、权重表）一致，但细节规则未获官方文档背书；wiki.gg 的 Map Generation 页面自身也标注"under construction"。
5. 宝箱金币区间存在 23-27/45-55/68-82（Mechanics 页）与 23-28/45-55/68-83（Gold 页）的微小差异，本文以 Gold 页为主。
6. 第 2/3 幕 Boss 候选名单的完整名单（每局随机 3/4）未在本文逐一核名，复刻时请以 wiki/Bosses 为准。
