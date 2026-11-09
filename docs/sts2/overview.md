# 《杀戮尖塔2》(Slay the Spire 2) 游戏概况与版本状态

> 面向「网页复刻开发」的研究文档。所有信息以 **2026-11-09** 为查证截止日；游戏处于抢先体验(Early Access, EA)阶段，数值与内容随版本变动，每条关键信息尽量标注**版本号或日期**。

## 1. 基本信息

| 项目 | 内容 | 来源/备注 |
| --- | --- | --- |
| 开发商/发行商 | Mega Crit（远程独立工作室，创始人 Casey Yano、Anthony Giovannetti） | [Mega Crit 官网](https://megacrit.com)，Steam 页面 |
| 公布时间 | 2024-04（Triple-I Initiative 展会动画预告）；首个实机预告 2024-12-12 | PCGamesN 发售指南（2026-04-28 更新） |
| EA 发布日期 | **2026-03-05**（Steam 抢先体验） | Mega Crit 官方公告《Slay the Spire 2 is out NOW in Early Access!!》(2026-03-05) |
| 延期历史 | 原目标 **2025 年底**，2025-09-11 官宣延期至 2026-03（官方称原定"秘密星期四"，即 3 月 5/12/19/26 之一，最终落在 3 月 5 日） | 2025-09 Neowsletter（Issue 14）+ PCGamesN 延期报道（2025-09-12）。**注意：任务书假设"2025 年底进入 EA 已约一年"与事实不符，实际 EA 约 8 个月** |
| 平台 | Windows / macOS / Linux（Steam）；Steam Deck 认证兼容；主机与移动端将在 EA 结束后推出 | Steam 商店页、Mega Crit FAQ |
| 引擎/技术 | **Godot 引擎**（一代为自研 Java/libGDX）；渲染要求 DirectX 12 / Vulkan / Metal 兼容 GPU | SlayTheTierList 补丁页（EA 发布记录）、Steam 系统需求、Fullclear.gg |
| 美术升级 | 全职艺术总监 Marlowe Dobbe（曾参与 Dicey Dungeons）+ 全职动画师；更多全屏立绘、更多动画与 VFX、更"明快"但保留阴森趣味的基调 | PCGamesN 美术方向报道（2024-10-03） |
| 售价 | **$24.99（USD，EA 期间）**；EA 结束后将涨价（官方 FAQ 明确）。新加坡区实测 S$23.99；国区定价未查证 | Steam 商店页、PCGamesN |
| 语言 | EA 上线时 **14 种**界面语言；EA 期间追加繁体中文（v0.109，2026-07-17）与印尼语（v0.111，2026-08-14），现共 16 种 | Steam 页面、SlayTheTierList 补丁记录 |
| 评价现状 | Steam 英文全评 **Very Positive（91%，72,161 篇，2026-11 读取）**；近 30 天 **Mostly Positive（74%，3,278 篇）**——v0.100 平衡改动曾引发差评潮后部分回滚（见 §2） | Steam 商店页（2026-11-09 读取） |
| 联机 | 单人 + **最多 4 人在线合作(co-op)**；无匹配系统，仅限 Steam 好友邀请 | Steam 页面、Fullclear.gg、Mega Crit FAQ |

### 1.1 EA 定位与开发理念（官方口径）

- Mega Crit 官方称 EA 版内容量**已超过一代完整版**，EA 期间将继续加入卡牌、事件、环境、敌人等并持续平衡（官方 EA 发布公告，2026-03-05）。
- 官方预估 EA 周期「1–2 年」（一代原计划 1 年实际 1.5 年）；Steam FAQ 原文：「Until the game feels great!」（游戏感觉完成才算完）。
- 玩家反馈渠道：游戏内置反馈表单（v0.101 将字数上限从 500 提到 8,000）、匿名数据统计、Discord 社区。
- 抢先体验期间允许 save-scumming（退出重进读档），官方表态"按你想玩的方式玩"（2025-10 Neowsletter Q&A）。

## 2. 版本状态：更新历史（截至 2026-11-09）

### 2.1 分支结构

Mega Crit 采用双分支更新：

| 分支 | 当前版本（2026-11-09） | 说明 |
| --- | --- | --- |
| 主线(Main) 默认分支 | **v0.107.1**（2026-06-18 发布，"Major Update #2"） | 普通玩家默认构建；稳定基线 |
| 公测(Beta) 分支 | **v0.111.0**（2026-08-14 发布） | Steam 内自愿切换；最新平衡与新内容 |

来源：STS2DB 版本追踪页（2026-09-23 核验）、SlayTheTierList、Spire Builds（2026-10-14 核验）。

### 2.2 大版本时间线（EA 起）

| 版本 | 日期 | 分支 | 主要内容 |
| --- | --- | --- | --- |
| v0.98（+hotfix .2/.3） | 2026-03-05 | 主线 | **EA 上线**。5 名可玩角色（各 70–80 张卡）、4 人合作（含合作专属卡）、升阶系统、每日/自定义游、全手柄支持、Steam Deck 认证、14 语言 |
| v0.99 / v0.99.1 | 2026-03-12~14 | 主线 | 修复上线后软锁；补齐一批卡面立绘；封堵 HP>999,999,999 无限流漏洞 |
| v0.100.0 | 2026-03-19 | Beta | 首次大型平衡：目标是**抑制无限连击**（Expect a Fight、Prepared→Prepare 重做等）；Phobia Mode（恐惧症模式，替换不适画面）；合作卡削弱。**引发差评潮** |
| v0.101.0 | 2026-03-26 | Beta | 大规模回滚：**Prepared 回归**、Borrowed Time/Capture Spirit 恢复旧数值；开发者首次附设计理由；精英不再出现在第 6 层；Doormaker 再设计 |
| v0.102.0 | 2026-04-02 | Beta | **Badges（徽章）系统**；**升阶6 从 Gloom 改为 Inflation**（删牌价 100 起步、每张 +50）；Blade of Ink 改为生成附魔 Shiv（Inky） |
| v0.103.2 | 2026-04-16 | **主线（Major Update #1）** | Beta v0.100–v0.103 合入主线；Ascension 6 变更全量生效；新卡 Not Yet；**Grapple 卡移除**；5 个新 Neow 遗物；好友排行榜改版；Phobia Mode 全量 |
| v0.104.0 | 2026-04-23 | Beta | Ironclad 两卡重做（Conflagration、Drum of Battle 围绕消耗(Exhaust)体系）；Parry 修复 |
| v0.105.0 | 2026-05-08 | Beta | **Doormaker（三层 boss）被移除，Aeonglass 接任第 3 幕 boss**；图鉴(Bestiary)首搭；**更新节奏从每周改为双周**；3 个新 Neow 祝福 |
| v0.106.0 | 2026-05-21 | Beta | 敌人再平衡（Skulking Colony、Haunted Ship 等）；Follow Through 首次重做 |
| v0.107.1 | 2026-06-18 | **主线（Major Update #2）** | 四个 Beta 版合入；**Doormaker 正式从游戏删除**、Aeonglass 上主线；**RNG 重构为 xoshiro256\*\*（修复独立随机事件相关的可预测漏洞）**；**Steam 创意工坊(Workshop)上线**；**Bestiary 上线**；3 个新"古代遗物" |
| v0.108.0 | 2026-07-03 | Beta | **合作模式最大内容更新：15 张合作专属新卡**（见 core-mechanics.md §2.6）；Outbreak/Tracking 重做 |
| v0.109.0 | 2026-07-17 | Beta | 2 个新 Neow 遗物（Dowsing Rod、Neow's Sacrifice）；Regent 新卡 Tutor；繁体中文；种子码扩至 12 字符 |
| v0.110.0 | 2026-07-30 | Beta | Silent 再平衡（Well-Laid Plans 涨费等）；**纯键盘操作模式**；整图分享按钮 |
| v0.111.0 | 2026-08-14 | Beta（当前最新） | Expect a Fight 彻底重做为格挡牌；Hyperbeam 再削；印尼语；低血量待机动画。此后进入**内容开发静默期** |

### 2.3 当前与下一步（2026-11）

- **2026-08 中旬起暂停双周补丁**（官方 8 月团队休假 + 转向大内容开发）；官方在 v0.111 说明与 2026-08-14 Neowsletter（Issue 25）中确认。
- **下一个大型 Beta 补丁定档 2026-11-12**（2026-10-29 Neowsletter Issue 27 官方宣布）：内容先在 Beta 独占测试，同时**主线将同步至 v0.111.0 的全部内容/平衡/修复**。新内容官方刻意保密（公告中以 *REDACTED* 代称），包含**实验性游戏模式**（单人与多人通用）。
- 官方确认 11 月 21-22 日参加上海 WePlay 2026 展会（与中国合作方 CiGA 合办展台、开发者 Q&A）。
- 2026-09-25 Neowsletter（Issue 26）：确认大内容在内部测试中，含一只未公布生物的剪影预热；无新补丁。

## 3. 当前内容规模（以主线 v0.107.1 为准）

| 维度 | 规模 | 备注 |
| --- | --- | --- |
| 可玩角色 | 5 名 | Ironclad / Silent / Regent / Necrobinder / Defect，EA 上线即全部实装 |
| 卡牌 | 每角色 70–80 张 + 无色(Colorless)卡池 + 合作专属卡（15+ 张） | EA 上线数据；此后每版继续增删改 |
| 事件(Event) | 50+ 个 | 2025-06 官方口径"已超 50"，EA 后继续增加 |
| 幕(Act)结构 | 3 幕；**第 1 幕有两条交替区域路线**（Overgrowth 茂生废墟 / Underdocks 下水港埠），第 2/3 幕交替区域制作中 | 官方称整体内容量约为一代两倍（3 幕 × 双区域设计） |
| Boss | 每幕从 3 个 boss 池中抽取（第 1 幕两分支各有独立 boss 池）；第 3 幕 boss 曾为 Doormaker，2026-06 起改为 Aeonglass | Fullclear.gg boss 记录（第 1 幕名单见其核验注） |
| 系统 | 升阶(Ascension) 10 级、每日游、自定义游、徽章、图鉴、好友排行榜、创意工坊、12 字符种子码、地图涂鸦与分享 | 见 core-mechanics.md |
| 真结局(True Ending) | **未实装**，规划于正式版(v1.0) | 官方 FAQ「full version will add a true ending」 |

## 4. 可玩角色名单

### 4.1 已实装（5 名，EA 上线即有）

| 角色 | 阵营 | 解锁条件 | 初始遗物(Relic) | 一句话定位 |
| --- | --- | --- | --- | --- |
| 铁甲战士(Ironclad) | 回归（重做） | 默认可用 | Burning Blood：战斗结束回复 6 HP | 力量(Strength)/易伤(Vulnerable)/自伤/消耗(Exhaust)体系 |
| 静默者(The Silent) | 回归（重做） | 用 Ironclad 完成一局 | Ring of the Snake：每场战斗开局多抽 2 张 | 毒(Poison)/幻影刃(Shiv)/弃牌，新关键词**狡黠(Sly)** |
| 摄政王(The Regent) | **全新** | 用 Silent 完成一局 | Divine Right：每场战斗开局获得 3 颗星辰(Stars) | 星辰资源 + 锻造(Forge)君王之刃 + 仆从(Minion) |
| 亡灵术士(The Necrobinder) | **全新** | 用 Regent 完成一局 | Bound Phylactery：回合开始召唤 1（Osty） | 召唤物 Osty + 末日(Doom)处决 + 灵魂(Souls) |
| 故障机器人(The Defect) | 回归（重做） | 用 Necrobinder 完成一局 | Cracked Core：每场战斗开局引导 1 道闪电 | 充能球(Orb)体系重做（被动/激发/Evoke） |

> 解锁链条（PCGamesN 角色页，2026-04-28）：Ironclad → Silent → Regent → Necrobinder → Defect，即完整解锁需按顺序各跑一局。

### 4.2 已公布/未实装

- **第六名新角色**：官方路线图列入"正在制作"（2026-08-14 Neowsletter），并配一张紫色带爪裹绷带之脚的剪影作为预告；具体身份、机制、实装时间全部未公布。
- 2025-12 EA 预告片尾曾出现一名眺望城镇的神秘角色（推测为未来角色，官方未确认；PCGamesN 分析其肤色非一代观星者/Watcher）。
- 一代的观星者(Watcher)与观星者之后的新角色均未公布是否回归。
- 官方 Q&A（2026-10-29）：被问及与其他游戏联动出新角色时，开发者 Anthony 明确回答「no」。

### 4.3 角色平衡现状（社区口径，2026-04~08）

PCGamesN 角色强度分级（2026-04，主线分支）：S：Silent；A：Defect、Necrobinder；B：Regent；C：Ironclad。注明该分级随平衡版本大幅波动（如 v0.107 起 Regent、Ironclad 连续获加强）。仅作参考，非官方数据。

## 5. 官方路线图

### 5.1 已完成（2026-04 路线图 → 2026-08 核验）

- Steam 创意工坊(Workshop)支持（v0.107.1，2026-06-18；模组进度与原版进度分离存档）
- 图鉴(Bestiary)首版框架（同上；后续计划加入属性与背景故事）
- 徽章(Badges)与计分系统（v0.102/v0.104）
- 繁体中文、印尼语本地化
- 大量新卡牌/遗物/药水

### 5.2 正在进行（2026-08-14 官方路线图复查）

1. **实验性游戏模式**（单人与合作通用；细节保密，与 2026-11-12 补丁相关）
2. **交替第 2 幕**（第 3 幕交替区域亦在原始规划内）
3. **新角色**（第六名）

### 5.3 后续计划（无日期承诺）

- 更多卡牌、事件、遗物、药水、敌人、环境；持续平衡与修复；更多语言
- **Steam 成就与集换卡**：明确排在 **v1.0 正式版**（2026-08-14 Q&A）
- **真结局(True Ending)** 与多种游戏模式：正式版内容
- **主机与移动端移植**：EA 之后；触屏/输入方式改进将随移动版推进（2026-08 Q&A）；2026-02 官方称目标是"某种形式的跨平台存档"
- 自定义游将在 v1.0 前后做一轮功能补全（官方 Q&A，2026-10-29；受手柄与最小字号约束，桌面端+模组自由度最高）
- 合作模式长期内容：官方"想在尖塔内加入更多区域/交替幕"（2026-10-29 Q&A：additional acts "certainly in the pipes (within the Spire)"）；多人升阶系统在考虑中；不会开放金币交易（防单核滚雪球）

### 5.4 版本节奏与 1.0 时间

- 官方明确**不给单项功能定日期**；EA 总长预估 1–2 年（自 2026-03 起算）。
- 外媒推断正式版约 **2027 年**（PCGamesN 编辑预测，非官方承诺）。
- 补丁节奏：上线初期每周 → 2026-05-08 起双周 → 2026-08 起进入大内容开发静默期（下一波 2026-11-12）。

## 6. 与一代的定位差异：叙事与世界观的推进

### 6.1 世界观时间线

- 官方设定：一代结局中四位攀登者**关闭了尖塔**；此后**沉寂 1,000 年**，如今尖塔重开，「比以往更饥饿、更危险」（官方 EA 公告、Steam 页面）。
- 巨鲸 **尼奧(Neow)** 回归，头衔「复活之母(Mother of Resurrection)」，仍在一局开始时提供"新旧祝福"（new and old blessings，2025-03 Q&A）。
- 除 Neow 外引入**古代存在(Ancients)**：自尖塔初建存活至今的古老生灵，在各幕入口提供带代价的祝福（如第 2 幕的特兹卡塔拉 Tezcatara「饲火者」），取代一代的 Boss 遗物选择。官方暗示其动机成谜，「随着时间推移你能了解更多」。

### 6.2 叙事新方向（对复刻重要的结构变化）

| 一代 | 二代 | 来源 |
| --- | --- | --- |
| 角色无背景故事，仅开场一句设定 | 每个角色拥有**专属动机(motives)与秘密(secret backstory)**，随游玩逐步揭示 | Steam 官方页面「A NEW AND RETURNING CAST」 |
| 碎片化、克制的叙事 | 主菜单新增 **Timeline（时间线）**：通过反复攀登解锁尖塔历史的「神秘时间线碎片」；角色解锁也与 Timeline 进度绑定 | Steam 页面「UNCOVER THE SPIRE'S LORE」、PCGamesN 角色页 |
| 事件可无后果离开 | 事件全面重做：**取消"什么都不做直接走人"选项**，常需在坏选项间抉择；50+ 事件全部改为全屏插画+动画呈现 | 2025-06 Neowsletter / PCGamesN 事件重做报道 |
| 人形角色稀少（美术产能限制） | 美术团队扩编后**刻意增加人形角色与叙事机制** | 2024-10 美术方向访谈 |
| 无图鉴 | **图鉴(Bestiary)** 记录遭遇过的每个敌人（招式、动画），后续加属性与背景故事 | v0.105/v0.107 补丁 |
| 结局=打败心脏(Act 4) | EA 版暂无真结局；**True Ending 为 v1.0 卖点** | 官方 FAQ |
| NPC 仅商人等少数 | 事件中引入具名 NPC（如被困学者 Repy、建筑家 Architect 事件等）；"Wongo's"疑似新商店 | PCGamesN 事件/遗物报道 |

### 6.3 产品定位差异

- **多人化**：一代纯单机；二代核心卖点之一为 4 人合作，含合作专属卡牌与团队协同（无匹配，好友房制）。
- **反馈内建化**：游戏内反馈工具 + 匿名指标，官方每月 Neowsletter 长期运营社区预期。
- **模组先行**：一代长期依赖社区 Mod API；二代在 EA 第一年即官方支持创意工坊，且以 Godot 构建、官方称"以更强可模组化为前提开发"。
- **反"单卡养成"**：官方明确禁止附魔(Enchantment)叠加，理由是"我们要玩家体验**构筑卡组**，而不是养成单张卡"（2026-08 Q&A）——可作为复刻时的数值设计原则参考。

## 7. 信息不确定项汇总

1. EA 实际开始日期为 **2026-03-05**（非任务书假设的 2025 年底）——本报告已按官方来源修正。
2. 2026-11-12 补丁内容在本文写作时尚未公布（Beta 独占内容官方保密）；如需最新版本请查 Steam 公告页。
3. Steam 近 30 天评价为 2026-11-09 读取的快照，随时变动。
4. 第 1 幕交替分支 boss 池中第三名 boss 未被 Fullclear 核验；第 2/3 幕 boss 全名单未获得可靠核验。
5. 第六名角色、实验性模式、交替第 2 幕的任何细节均未公布。
6. 国区/其他货币区定价未查证（仅核验 USD $24.99 与 SGD S$23.99）。

## 参考来源

- Mega Crit 官方 EA 发布公告（2026-03-05）：https://megacrit.com/news/2026-03-05-early-access-launch/
- Mega Crit 官方新闻索引（全部 Neowsletter）：https://www.megacrit.com/news/
- Neowsletter 2026-08（Issue 25，路线图复查）：https://www.megacrit.com/news/2026-8-14-neowsletter-issue-25/
- Neowsletter 2026-10（Issue 27，11/12 补丁定档）：https://www.megacrit.com/news/2026-10-29-neowsletter-issue-27/
- Steam 商店页（EA FAQ、售价、系统需求、语言、评价）：https://store.steampowered.com/app/2868840/Slay_the_Spire_2/
- SlayTheTierList 补丁全史（至 v0.111.0）：https://slaythetierlist.com/patch-notes
- STS2DB 版本追踪（Main v0.107.1 / Beta v0.111.0）：https://sts2db.com/patches/
- Spire Builds 路线图与下一补丁核验（2026-10-14）：https://www.spirebuilds.com/guides/slay-the-spire-2-next-update-roadmap
- Fullclear.gg StS2 综合页（内容规模/角色/合作/升阶上限）：https://fullclear.gg/sts2/
- PCGamesN 发售与 EA 综述（2026-04-28 更新）：https://www.pcgamesn.com/slay-the-spire-2/guide
- PCGamesN 延期与交替幕报道（2025-09-12）：https://www.pcgamesn.com/slay-the-spire-2/delayed-alternate-acts
- PCGamesN 角色强度/解锁（2026-04-28）：https://www.pcgamesn.com/slay-the-spire-2/characters
- PCGamesN 美术方向访谈（2024-10-03）：https://www.pcgamesn.com/slay-the-spire-2/art-direction
- Player Guidebook 路线图对照（2026-08-27 核验）：https://playerguidebook.com/slay-the-spire-2/early-access-roadmap
