# 《杀戮尖塔2》(Slay the Spire 2) 核心机制与代际差异

> 面向「网页复刻开发」的研究文档。版本基线：**主线(Main) v0.107.1 / 公测(Beta) v0.111.0**，查证截止 **2026-11-09**。游戏处于抢先体验(EA)，平衡几乎每两周变动，所有数值均标注来源版本/日期；未能在来源中核验的条目在 §6 明确列出。

## 1. 保留自一代的核心系统

以下系统整体沿用一代框架，构成复刻实现时的「不变层」：

| 系统 | 二代现状 | 与一代数值有无变化 |
| --- | --- | --- |
| 能量(Energy) | 每回合 3 点基础能量，回合结束清空 | 数值未变（社区指南默认假设；官方文档未单独列出，见 §6） |
| 格挡(Block) | 回合开始清空；格挡牌典型 5–8 点 | 机制未变；个别卡数值随版本调整（如 Colossus 5(8)→4(7)，v0.108） |
| 意图(Intent) | 敌人头顶显示下回合行动图标 | 未变 |
| 每回合抽牌 | 每回合抽 5 张（弃牌重抽循环：抽牌堆→手牌→弃牌堆→洗回） | 数值未变（推断，见 §6） |
| 手牌上限 | 沿用一代结构 | 未核验（§6） |
| 卡牌稀有度 | 普通(Common)/罕见(Uncommon)/稀有(Rare) 三档 + 无色卡(Colorless) + 状态/诅咒牌 | 未变；但 EA 期间频繁做稀有度调整（如 v0.109：Bloodletting Common→Uncommon、Cruelty Rare→Uncommon） |
| 卡牌类型 | 攻击(Attack)/技能(Skill)/能力(Power) + 状态(Status)/诅咒(Curse) | 未变；新增「任务卡(Quest)」卡牌类型（§2.3） |
| 升级 | 休息处(rest site)锻造升级单卡，`名称+` 表示 | 未变 |
| 抽/弃/消耗三堆 | 抽牌堆/弃牌堆/消耗堆(Exhaust pile) | 未变 |
| 药水(Potion) | 3 个药水槽（推断自升阶4 "Tight Belt 少 1 槽"），战斗中饮用 | 槽数未变；药水全部重绘为独立图标（2025-08 Neowsletter） |
| 地图节点 | 战斗房/精英(Elite)/宝箱/商店(Merchant)/休息处/?未知房 分层地图 | 结构未变；交替区域为新增层（§2.5） |
| Boss 后奖励 | 一代为 Boss 遗物三选一 → **二代改为古代存在(Ancient)祝福**（§2.1） | **已变化** |
| 状态效果 | 易伤(Vulnerable)/虚弱(Weak)/脆弱(Frail)/力量(Strength)/敏捷(Dexterity)/专注(Focus) 等沿用 | 未变；新增末日(Doom)、活力(Vigor) 等新关键词（§3） |

### 1.1 EA 期间确立的数值边界（复刻时注意）

- HP 上限锁定 **999,999,999**（v0.99，2026-03，封堵无限流漏洞）。
- v0.101 起**精英不再出现在第 6 层**（Neow 算第 1 层，此前精英会比预期早一层出现）——第 1 幕路线规划的关键规则。
- 敌人数值普遍带 `(基础/A9+值)` 双档：如水瀑巨人(Waterfall Giant) HP 250(260)→240(250)（v0.101）；斯卡尔金群落(Skulking Colony) HP 70→75（v0.107.1）；每层难度随升阶提升。
- 商店经济（v0.100，2026-03-19）：全部商店**遗物价格 -25 金**，且**产金遗物不再出现在商店**。
- 一代删牌 75 金起、每张 +25；二代常规删牌价格未在引用来源中明确（仅知升阶6 Inflation 下为 100 起步、每张 +50，v0.102），见 §6。

## 2. 新增全局机制

### 2.1 古代存在(Ancients)与祝福（取代 Boss 遗物）

- **定位**：一代每幕 Boss 后的「Boss 遗物三选一」在二代整体替换为 Ancient 的祝福。Ancients 在**各幕入口**出现，提供数个祝福选项，常带显著代价（2025-11 Neowsletter / PCGamesN）。
- **Neow**「复活之母(Mother of Resurrection)」：一局开始时的祝福提供者（沿用一代位置），随 EA 更新不断加入新祝福遗物（Neow relics）：Hefty Tablet、Neow's Talisman、Neow's Bones、Phial Holster、Winged Boots（v0.103.2，2026-04-16）；Dowsing Rod（为卡组加入一张寻水任务卡，再进 5 个 ? 房后变形为 Abundance）、Neow's Sacrifice（给专属药水琥珀酱 Ambergris + 往卡组塞诅咒 Guilty）（v0.109，2026-07-17）。
- **Tezcatara**「饲火者(It Which Feeds The Fire)」：第 2 幕 Ancient 池成员。已展示的三类祝福（2025-11）：
  1. 将本幕地图变**单条"黄金路径"**；
  2. 获得 **4 个蜡制遗物(Wax Relics)**，每打赢 3 场战斗融化消失一个；
  3. 为卡组所有 Strike 附魔**特兹卡塔拉的余烬(Tezcatara's Ember)**——降费但**不可移除**。
- Ancient 专属遗物（"Ancient relic"分类，区别于普通遗物池）：Neow's Fury（可手动选卡）、Neow's Booming Conch（精英战回能）、Tezcatara's Nutritious Soup（Strike +3 伤害）、Tezcatara's Pumpkin Candle（5 场战斗后熄灭，v0.105 调整）、Signet Ring/Fiddle（金 999→888、抽 2，v0.110 削）、Abundance、Toasty Mittens、Nonupeipe's Fur Coat / Beautiful Bracelet（附魔 4 张**随机**卡，v0.111 削）等——来源：v0.104/v0.105/v0.108~v0.111 补丁记录。
- 升阶2 与 Ancient 联动：「Ancients 在休息处仅回复缺失 HP 的 80%」（Weary Traveler，见 §5）。
- 第 3 幕是否另有 Ancient 池：官方 2025-11 称第 2、3 幕各有独立池，具体名单未公布（§6）。

### 2.2 附魔(Enchantment)

- **规则**：附魔是持续**整局(本局 run)** 的卡牌修饰词，效果比普通升级更泛用，可套在你选择的任意一张卡上；多数提供小额增益，稀有事件/未公布内容中可获得"改变整局走向"的附魔（官方 2025-02 博客）。
- **禁止叠加**：同类附魔不可叠在同一张卡上。官方理由：单卡滚雪球概率上升，"我们要玩家构筑卡组(deckbuilding)而非养成单卡(cardbuilding)"（2026-08 Q&A）。
- 已知附魔实例（数值+版本）：
  | 附魔 | 效果 | 来源 |
  | --- | --- | --- |
  | Corrupted（堕落） | 只能附攻击牌：伤害 +50%，每次打出失去 3 HP | 2025-02 官方博客（共生体 Symbiote 事件：-9 上限 HP 换附魔） |
  | Inky（墨染） | Shiv +2 伤害并施加 1 虚弱（v0.107.1 削为 +1，v0.111 移除伤害加成） | Blade of Ink 重做链（v0.102→v0.111） |
  | Glam（绮丽） | 由遗物 Silken Tress 给首个卡牌奖励全员附魔（细节未公开） | v0.105/v0.107.1 |
  | Nimble（灵巧） | 与格挡相关（Entrench 的额外格挡可由其触发） | v0.107.1 补丁 |
  | Gnarled Hammer 事件 | +3 伤害附魔（Self Help Book 事件 +2，二者不可叠） | 2026-08 Q&A 官方举例 |
  | Tezcatara's Ember | Strike 降费但不可移除 | Tezcatara 祝福（2025-11） |
- **复刻提示**：附魔在战斗中也可生成（Blade of Ink 生成 Inky Shiv 即"战斗中附魔生成"的官方实验，v0.102）。

### 2.3 任务卡(Quest)与新卡牌类型

- **任务卡**：稀有(Rare)卡牌新类型，不可打出，各带特定条件，完成后给大奖励。官方：「每个任务彼此差异很大」。
- 实例：**Byrdonis Egg**（伯多尼斯之蛋）——不可打出，需**在休息处孵化**，孵化后 Ironclad 获得一只并肩作战的大绿鸟伴侣（战斗同伴/companion，有独立行动）。来源：2025-03 官方博客 + PCGamesN。
- Dowsing Rod（Neow 遗物）附带的 Dowsing 任务卡：进入 5 个 ? 房后变形为 Abundance（v0.109）——任务卡可**变形**为其他卡。
- 一代无任何对应系统（最接近的是部分事件的延迟奖励）。

### 2.4 折磨(Affliction)

- 敌方施加的**卡牌污染**机制：敌人（或事件）夺取你的部分卡牌并附加负面效果。官方例：敌人可给你的 Defend 附上"打出时失去 HP"的效果（2025-04 Neowsletter）。
- 已知交互：Nightmare 复制出的卡在次回合移除其 Affliction（v0.107.1）；Haunted Ship 施加 Dazed 状态牌（v0.101）。
- 一代对应物仅为诅咒(Curse)卡与状态(Status)卡；Affliction 是**附加在普通卡上的动态减益**，复刻时需为卡牌对象建模「附加修饰器栈」。

### 2.5 交替区域(Alternate Acts)与地图结构

- 3 幕结构不变；**每个幕拥有两个互斥的交替区域**，进入时随机决定。区域间环境、敌人、事件、boss 全不同。官方称此设计使内容量**翻倍**（2025-09 Neowsletter）。
- EA 上线时**仅第 1 幕实装双区域**：
  - **Overgrowth（茂生）**：荒废密林， mystical 林居生物与食人植物群；
  - **Underdocks（下埠）**：连接尖塔下水道的泥泞水道，变异海洋生物与流浪者（如 Terror Eel）。
- 第 1 幕两分支各有独立 boss 池：Overgrowth 端核验到 Kin Priest、Vantom、Waterfall Giant；Underdocks 端核验到 Lagavulin Matriarch、Soul Fysh（第三位未核验）——Fullclear.gg 记录（2026-08）。
- **交替第 2 幕制作中**（2026-08 官方路线图）；交替第 3 幕在原始规划内（2025-09）。
- 地图 UI：图标带颜色区分节点类型；v0.101 优化地图生成（减少前期全战斗房溢出）；升阶1 使精英更频繁。
- 趣味层：地图自带**涂鸦绘画工具**（社区大量用于画角色），v0.110 加入整图截图分享按钮。

### 2.6 合作模式(Co-op，4 人)

- 每名玩家独立操控自己的角色与卡组；共享同一次攀登的地图、遭遇与后果。仅限 Steam 好友邀请，**无匹配系统**；模组进度与正常进度分离。
- **合作专属卡牌**：上线时已有 Huddle Up、Beacon of Hope、Believe in You 等；v0.108（2026-07-03）一次性加入 **15 张**：
  | 角色 | 新卡示例 |
  | --- | --- |
  | Ironclad | Midnight（稀有攻击，99/120 伤害）、Blaze（给队友 5/7 力量）、Outrage（9/13 伤害） |
  | Silent | Blade Symphony（全体玩家各获 2/3 张 Shiv）、Concoct（队友攻击附加 3/4 毒）、Fade（全体 6/9 敏捷） |
  | Regent | Plot（全员抽 2/3）、Constellation（抽 1+回能+9/12 格挡）、Tutor（让队友从其抽牌堆取卡入手机，v0.109） |
  | Necrobinder | Underworld（攻击伤害等量转 Doom）、Soulbound（向队友抽牌堆塞 Souls）、Cacophony（全员每抽 33 张牌造成 66/99 伤害） |
  | Defect | Hibernate（2/3 霜球为全队给格挡）、One for All（0 费攻击全体 +3/4 伤害）、Imitation Learning（复制队友能力牌） |
  | 无色 | The Ball（10 伤害，每场战斗费用 -1，传给随机队友） |
- Ironclad 有**把自身格挡分享给队友**的合作专属卡；Defect 可为队友供能（PCGamesN 角色页）。
- 平衡注意：多人为同一套升阶存档；A10 双 boss 下队内每人的存续状态独立结算（细节见 §5）。
- 明确不做：金币交易（防资源集中滚雪球，2026-10-29 Q&A）。

### 2.7 其他新增系统（对复刻有用的杂项）

- **徽章(Badges)**：单局结束时的"高光时刻"记录（无伤杀 boss、速通、攒钱不用等），未来接入计分与统计（v0.102/v0.104）。
- **图鉴(Bestiary)**：Compendium 内查看已遭遇敌人及招式动画（v0.107.1 全量），属性与背景故事待加。
- **排行榜**：仅显示好友、按胜场排序（v0.103.2 改版）。
- **种子码**：12 字符（v0.109 起），支持固定种子复现与每日游。
- **随机数系统**：v0.107.1 将伪随机发生器替换为 **xoshiro256\*\***（玩家证实在旧实现中无关系统的随机结果互相关联，如 Neow's Bones 过度偏向 Debt）；复刻网页版时**必须**避免共享同一 PRNG 状态流导致的可预测性。
- **Deprecated Card**：卡被移出游戏时的占位状态卡，防止进行中的对局崩溃（v0.100）。
- **Phobia Mode**：设置项，替换感染覆盖层/蜂巢背景/The Insatiable/Phrog Parasite/Wrigglers/Terror Eel/Entomancer 等不安画面（v0.100）。
- **纯键盘操作模式**（v0.110）与按键重映射提示；**低血量待机动画**（v0.111）。
- **每日游/自定义游**可获升阶进度（与一代不同；官方注明"未来补丁可能改"）；每日/自定义不再解锁 Epoch（v0.100，Epoch 为游戏内进度/收集概念，与主菜单 Timeline 相关，细节未公开，见 §6）。
- **Form VFX**：角色形态变化特效（v0.110）。
- 药水示例（重绘+新设计）：Heart of Iron（格挡向）、Ship in a Bottle（疑似保命逃脱类）、Foul Potion（用途不明）、Liquid Memories（"Free to Play"术语化重做，v0.101）、Ambergris（Neow's Sacrifice 专属）。
- 术语变化：v0.101 起"Costs 0 Energy"这类文本改为 **"Free to Play"（免费打出）**——复刻文案时注意。

## 3. 角色专属新机制概览（细节留待角色专项文档）

### 3.1 铁甲战士(Ironclad)（回归·重做）

力量/易伤/自伤/消耗(Exhaust)大框架不变，但围绕消耗流派重做了核心卡：Conflagration（对全体敌人 2 伤害 ×4 次，v0.107.1）、Drum of Battle（1 费技能：抽 2 张，被消耗时回能）、Stoke（改为每消耗 1 张往手里塞 1 张随机卡，v0.100）、新卡 Not Yet（战中回血，v0.103.2）、Grapple 已移除。反无限设计：Expect a Fight 历经三次重做——2 费「每张手中攻击牌回 1 能但本回合锁能」（v0.100）→ v0.109 移除锁能 → **v0.111 彻底重做为 3 费格挡牌**「15(16) 格挡，每点力量 +5(8)」。Demon Form 3(4) 力量/回合（v0.109 加强）。

### 3.2 静默者(The Silent)（回归·重做）

新关键词**狡黠(Sly)**：弃置带 Sly 的卡时自动打出其效果——弃牌从过滤动作变成收益引擎。Prepared 事件链是 EA 平衡风向标：v0.100 重做削弱引发差评 → v0.101 完整回滚（官方承认 Prepared 是 Silent 身份认同的核心）。Blade Dance 获得消耗(Exhaust)（2025-05 官方）；毒流：Outbreak 从能力牌改为稀有技能「立即对全体施加 9(12) 毒」（v0.110）；Well-Laid Plans 涨到 2(1) 费（v0.110）。社区公认 EA 最强（PCGamesN S 级，2026-04）。

### 3.3 故障机器人(The Defect)（回归·重做）

充能球(Orb)体系保留但重做：被动/激发(Evoke)节奏调整，**回合结束的 Orb 被动现在先于 Doom 结算**（v0.108，官方称便于双条件斩杀）。Hyperbeam 数值反复横跳：26→28（v0.107.1）→30/38（v0.109）→**24/30 且 Focus 失效仅限当回合**（v0.111）。新卡 Imitation Learning（复制队友能力，v0.108）、Infused Core（闪电球 +1 伤害）。EA 全程大改动最少（PCGamesN）。

### 3.4 亡灵术士(The Necrobinder)（全新）

- **Osty**：巨大亡灵之手，独立实体、独立 HP 池、可独立索敌、不受主人 debuff 影响；只要 Osty 有血就会**替她挡下攻击伤害**（一代无任何召唤物挡伤机制——复刻需实现"护卫目标重定向"）。可堆高 HP 当永久肉盾，或反复牺牲-重召唤循环。Bone Shards：Osty 对全体 9 伤害并给你 9 格挡然后死亡；Bodyguard 复活并造成伤害；Sacrifice 格挡量从 Osty 最大 HP 2 倍升到 **3 倍**（v0.110）。
- **末日(Doom)**：类毒的堆叠计数，但**不造成伤害、不衰减**；当目标身上的 Doom ≥ 其当前 HP 时**立即处决**（无视治疗，绕过回复机制）。可对自己施加（Neurosurge：+3 能量抽 2 张，每回合自叠 3 Doom）。v0.108 起战斗内也可为攻击附加 Doom（Underworld）。
- **灵魂(Souls)**：由其他动作生成的**一次性技能卡**，0 费抽 2 张后消耗（如 Capture Spirit：敌人失 3(4) HP，往抽牌堆塞 3(4) 张 Souls）。社区认为 Souls 流是 EA 最强流派之一（PCGamesN）。

### 3.5 摄政王(The Regent)（全新）

- **星辰(Stars)**：能量之外的第二资源，**跨回合保留、无上限**。部分卡产星（Hidden Cache：本回合 1 星、下回合 3 星）、部分卡消耗星（Alignment 3 星→2 星，v0.111）。初始遗物 Divine Right 每战开场给 3 星。
- **锻造(Forge)与君王之刃(Sovereign Blade)**：带 Forge 关键词的卡——手里没刀则把刀放进手牌、有刀则按 Forge 值强化。刀本身 2 费 10 伤害、**保留(Retain)** 在手，可攒成一刀爆发（社区称可单刀数百伤害）。
- **仆从(Minion)**：可把手牌变形为一次性仆从卡（Guards：2 费，手中任意张数变 0 费 Minion Sacrifice——11 格挡后消耗，v0.107.1 平衡为 8 格挡）；部分仆从可攻击。
- 无色卡协同：Arsenal 重做为「每当创造(created)一张卡获得 1 力量」（v0.101，触发条件从无色改为创造）、Spectrum Shift（手牌加 1 张随机无色）、Supermassive（5 伤害+本场每创造 1 卡 +3）。Vigor（活力）为其卡牌关键词之一（Terraforming：Vigor 6(8)→7(10)）。
- 社区评价：技能上限最高、最不稳定；v0.107.1 后获大量加强（PCGamesN）。

## 4. 与一代差异对照表

| 系统 | 一代《杀戮尖塔》 | 二代《杀戮尖塔2》（EA，2026-11） |
| --- | --- | --- |
| 人数模式 | 纯单人 | 单人 + 最多 4 人在线合作（好友房制、无匹配） |
| 引擎 | Java/libGDX 自研 | Godot；DX12/Vulkan/Metal 渲染 |
| 角色 | 4 名（Ironclad/Silent/Defect/Watcher） | 5 名（Ironclad/Silent/Defect + 全新 Necrobinder、Regent）；Watcher 未公布；第 6 名角色制作中 |
| 角色解锁 | 完成一局按顺序解锁下一角色（成就式） | 经由主菜单 **Timeline** 进度解锁（链：Ironclad→Silent→Regent→Necrobinder→Defect） |
| 幕结构 | 3 幕 + 第 4 幕（心脏结局） | 3 幕，每幕规划双交替区域；EA 仅第 1 幕双区域（Overgrowth/Underdocks）；真结局留待 v1.0 |
| 每幕 Boss 后奖励 | Boss 遗物三选一（带诅咒代价可选） | **Ancient 祝福**（各幕入口，代价更重：黄金单路、蜡遗物倒计时、不可移除的降费 Strike 等） |
| 卡牌修饰 | 仅升级（+版） | 升级 + **附魔(Enchantment)**（整局持续、可跨卡选择、禁叠加）+ **Affliction**（敌方污染你的卡） |
| 新卡牌类型 | — | **任务卡(Quest)**（不可打出、条件奖励、可变形）、一次性 Souls 卡、仆从卡 |
| 事件设计 | 部分事件可无后果离开 | **无"直接离开"选项**，常被迫抉择；全屏插画+动画；50+ 事件 |
| 事件示例 | — | Slippery Bridge（必须删牌过桥）、Symbiote（-9 上限 HP 换 Corrupted 附魔）、Waterlogged Scriptorium（Prickly Sponge 155→99 金，v0.102） |
| 地图 | 固定节点类型 | 同构；v0.101 精英不出第 6 层；A1 精英更频繁；带涂鸦工具 |
| 商店 | 删牌 75 金起 +25/张 | 商店遗物价格 -25 金、产金遗物不进商店（v0.100）；A6 下删牌 100 金起 +50/张（v0.102）；常规价格未核验 |
| 升阶(Ascension) | 20 级（A10 诅咒 Ascender's Bane；A20 双 boss） | **10 级**（A5 即 Ascender's Bane；A10 双 boss）；官方称 10 级≈本作最高难度，不打算堆到 20 |
| 联机相关卡牌 | — | 合作专属卡（v0.108 一次 15 张 + 后续） |
| 模组 | 社区 BaseMod/ModAPI 为主，官方工坊后期才加 | **EA 第一年即官方创意工坊**（v0.107.1），Godot 构建、模组存档分离 |
| 排行榜 | 全局每日榜 | 好友榜（按胜场）+ 12 字符种子码 |
| RNG | libGDX 随机 | xoshiro256\*\*（v0.107.1 重构，修复跨系统相关性） |
| 反无限设计 | 依赖手牌上限/疲敝等既有机制 | 主动补丁式打击：HP 上限 999,999,999 锁、Expect a Fight/Prepared/Sly 连锁、Orb 被动先于 Doom 结算等 |
| 数据/收集 | 统计屏 | 图鉴(Bestiary)（动画+招式）、徽章(Badges)、Timeline 历史碎片 |
| 无障碍 | 基础 | Phobia Mode、纯键盘模式、手柄全面支持、Steam Deck 认证 |
| 文案术语 | "Costs 0" | "Free to Play"（免费打出）等规范化表述（v0.101 起） |

## 5. 升阶(Ascension)在二代的现状

- **上限 10 级**，逐级叠加生效（A8 = 1~8 全部生效）。官方立场：**A10 即接近本作最高难度**，不准备像一代那样堆到 20——「角色更多，磨 20 级会变成苦差」（2026-08-14 Q&A）；同时承认当前 A10 难度低于一代 A20，后续内容齐备后会重新审视（2026-08 社区提问答复）。
- 解锁规则：**按角色独立**——用任意角色击败第 3 幕 boss 解锁该角色 A1；此后每在其当前最高级获胜解锁下一级，失败不掉级。**自定义模式(Custom Mode)也计入**（与一代不同，官方注明未来可能改动）。多人升阶使用**独立存档**：单人等级不带入合作，队伍难度上限取成员最低值；合作胜利一次即为**全角色**解锁下一级。
- 10 级惩罚全表（主线 v0.107.1 口径；来源 SlayTheTierList 升阶指南 + PCGamesN）：

| 级 | 名称 | 效果 |
| --- | --- | --- |
| A1 | Swarming Elites（精英群涌） | 地图上精英出现频率显著提高 |
| A2 | Weary Traveler（疲惫旅人） | Ancients 在休息处仅回复缺失 HP 的 **80%** |
| A3 | Poverty（贫困） | 敌人与宝箱掉金 **-25%** |
| A4 | Tight Belt（紧缩腰带） | 每局少 **1 个药水槽** |
| A5 | Ascender's Bane（攀登者之灾） | 开局卡组带 1 张诅咒 |
| A6 | **Inflation（通胀）** | 商店删牌 **100 金起、每张 +50**。注：v0.102（2026-04-02）前为 **Gloom（阴郁：休息处更少）**，官方因"地图生成类修改器难以被玩家察觉"而替换；v0.103.2 起对主线生效 |
| A7 | Scarcity（稀缺） | 稀有卡与升级卡出现率降低 |
| A8 | Tough Enemies（顽敌） | 全部敌人最大 HP 提升 |
| A9 | Deadly Enemies（致命之敌） | 全部敌人攻击伤害提升 |
| A10 | Double Boss（双 boss） | 第 3 幕结尾**连续两个不同 boss、无休息**；打完第一个后的 HP 即第二个的起始 HP |

- 社区攻略口径（SlayTheTierList，v0.107.1）：A6 后删牌/事件删牌价值上升（推荐 True Grit、Cleanse、Dredge 等删牌/消耗卡）；A9+ 必须每回合格挡；A10 需满血进第 3 幕并留好药水、偏好续航型引擎。
- 复刻注意：**升阶惩罚表在 EA 中已改过一次（A6）**，实现时惩罚应做成可配置数据表而非硬编码。

## 6. 信息不确定项汇总（复刻前需游戏内核验或跟踪后续补丁）

1. **基础能量 3/回合、每回合抽 5、手牌上限、药水槽 3**：官方来源未以文档形式列出，本文为社区指南默认假设（Spire Builds 指南以 3 能量、5 抽为前提演算）+ 升阶4 文本反推。**建议实机核验**。
2. 各角色初始 HP、起始卡组构成（10 张的具体分布）：未在本次引用来源中获得，需查游戏内或数据库站。
3. 二代常规删牌基础价（一代 75 金 +25）：未核验；仅知 A6 Inflation 参数（100/+50）。
4. 第 2/3 幕 boss 全名单、第 3 幕 Ancient 池：无可靠核验来源。
5. **2026-11-12 大型 Beta 补丁**（实验模式/新内容）尚未发布；含机制层面的潜在变更（官方称新模式单人/多人通用）。
6. **Epoch** 一词仅见于补丁说明（"Daily/custom 不能解锁 Epoch"、v0.109.1 "更多 Epoch 美术"），推测与主菜单 Timeline/进度系统相关，官方无公开文档定义。
7. 附魔完整清单（当前版本实装的全部附魔及其数值）：仅收集到文中实例，需游戏内/数据库补全（Silken Tress/Glam、Nimble 的具体数值未公开）。
8. 合作模式的详细结算规则（队友倒地处理、boss 仇恨、A10 双 boss 的队伍规则）：来源未覆盖，需实机核验。
9. Doom 对自身的结算细节（是否可在自身 HP 低于 Doom 时被"处决"）未在来源中明确。

## 参考来源

- Mega Crit 官方 EA 公告（2026-03-05）：https://megacrit.com/news/2026-03-05-early-access-launch/
- Neowsletter 2026-08（Issue 25，附魔禁叠加/升阶立场 Q&A）：https://www.megacrit.com/news/2026-8-14-neowsletter-issue-25/
- Neowsletter 2026-10（Issue 27，11/12 补丁/自定义游/合作规划 Q&A）：https://www.megacrit.com/news/2026-10-29-neowsletter-issue-27/
- Steam 商店页（EA FAQ/联机/引擎系统需求）：https://store.steampowered.com/app/2868840/Slay_the_Spire_2/
- SlayTheTierList 补丁全史（v0.98–v0.111 全部平衡数值）：https://slaythetierlist.com/patch-notes
- SlayTheTierList 升阶指南（10 级全表，v0.107.1 核验）：https://slaythetierlist.com/ascension-guide
- STS2DB 版本追踪：https://sts2db.com/patches/
- Fullclear.gg StS2 综合页（角色/合作/Ancients/Workshop/boss 记录）：https://fullclear.gg/sts2/
- PCGamesN 发售综述（EA 事实/售价/平台）：https://www.pcgamesn.com/slay-the-spire-2/guide
- PCGamesN 角色页（解锁链/初始遗物/强度分级）：https://www.pcgamesn.com/slay-the-spire-2/characters
- PCGamesN 升阶页（2026-03-10，A6 仍为 Gloom 的历史快照）：https://www.pcgamesn.com/slay-the-spire-2/ascension-levels
- PCGamesN Necrobinder 揭晓（2025-10-17，Osty/Doom/Souls 数值）：https://www.pcgamesn.com/slay-the-spire-2/necrobinder-reveal
- PCGamesN Regent 揭晓（2025-12-13，Stars/Forge/Minions 数值）：https://www.pcgamesn.com/slay-the-spire-2/regent-class-mechanics
- PCGamesN 附魔机制（2025-02-14，Corrupted/Symbiote）：https://www.pcgamesn.com/slay-the-spire-2/enchantments
- PCGamesN Ancients 机制（2025-11-14，Tezcatara 三祝福）：https://www.pcgamesn.com/slay-the-spire-2/ancients
- PCGamesN 任务卡/鸟伴侣（2025-03-13，Byrdonis Egg）：https://www.pcgamesn.com/slay-the-spire-2/quests-bird-companion
- PCGamesN 事件重设计（2025-06-13，无离开选项）：https://www.pcgamesn.com/slay-the-spire-2/events-redesign
- PCGamesN 遗物/药水（2025-08-16，回合数按钮/药水重绘）：https://www.pcgamesn.com/slay-the-spire-2/slay-the-spire-2-makes-keeping-track-of-its-new-relics-and-potions-much-easier
- PCGamesN 交替幕（2025-09-12，Overgrowth/Underdocks/延期）：https://www.pcgamesn.com/slay-the-spire-2/delayed-alternate-acts
- Spire Builds 抽牌与能量指南（3 能量/5 抽默认假设佐证）：https://www.spirebuilds.com/guides/draw-and-energy-guide
- Spire Builds 下一补丁与路线图核验（2026-10-14）：https://www.spirebuilds.com/guides/slay-the-spire-2-next-update-roadmap
- Player Guidebook 路线图对照（2026-08-27）：https://playerguidebook.com/slay-the-spire-2/early-access-roadmap
