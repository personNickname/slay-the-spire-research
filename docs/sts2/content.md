# 《杀戮尖塔2》(Slay the Spire 2) 敌人 / 事件 / 遗物 / 内容规模

> 面向网页复刻开发的内容参考。
>
> **版本基准**：Steam EA 版，2026-03-05 上线；截至 **2026-11-09** 主分支为 **v0.111.0**。敌人血量/行动数值取自社区对 **v0.107.1**（2026-06-18 构建）客户端的反编译数据（sts2-rl-agent 仓库），并以 v0.105–v0.111 官方补丁日志标注后续改动；v0.108–v0.111 期间无新怪物种类加入（仅数值调整），故敌人名单与 v0.111 一致。
>
> **血量格式**：`基础 / 进阶8+`（进阶 8"敌人更硬"提升血量，进阶 9"攻击更狠"提升伤害，见进阶等级）。范围值表示随机区间。

## 1. 敌人清单概览

第三幕之后有一场**不可战胜的剧情战斗**：建筑师 (The Architect)——第三幕 BOSS 战后触发，玩家无论造成多少伤害都会被剧情击杀（结算界面显示你对建筑师造成的伤害及全服累计伤害）。

**已删除敌人**：造门者 (The Doormaker，489/512 HP) 与其门 (Door，155/165 HP，战斗中门血量成长 +20/25) 曾为第三幕 BOSS，v0.105 补丁（2026-04-24）因社区争议被整体移除，其 BOSS 槽位由**新 BOSS 万世镜 (Aeonglass)** 填补。

### 1.1 第一幕 A —— 繁茂之地 (Overgrowth)

**弱敌遭遇（每局前几场固定出现的低强度池，3 组弱遭遇配置）**

| 敌人 | 血量 | 行为简述 |
|---|---|---|
| 缩壳甲虫 (Shrinker Beetle) | 38-40 | 缩壳防御型甲虫 |
| 绒毛蠕虫爬行者 (Fuzzy Wurm Crawler) | 55-57 | 一代蠕虫(Wurm)变体，冲撞/防御 |
| 灵兔草 (Nibbit) | 42-46 | 小型啃咬怪（成组出现"Nibbits"） |
| 叶史莱姆-小 (Leaf Slime S) | 11-15 | 分裂型小史莱姆 |
| 枝史莱姆-小 (Twig Slime S) | 7-11 | 低血量杂兵 |
| 叶史莱姆-中 (Leaf Slime M) | 32-35 | 可分裂成小史莱姆 |
| 枝史莱姆-中 (Twig Slime M) | 26-28 | 同上 |

**普通遭遇池**

| 敌人 | 血量 | 行为简述 |
|---|---|---|
| 立方构装体 (Cubex Construct) | 65 / 70 | 循环：蓄力(初始格挡 13)→连击→**爆排**(7/8 伤×2)→下潜(格挡 15)；神器(Artifact) 1 层，力量+2 |
| 飞翼蝠 (Flyconid) | 47-49 / 51-53 | 蝙蝠类飞行怪 |
| 雾眼 (Fogmog) | 74 / 78 | 召唤"带牙之眼 (Eye with Teeth)"的雾状怪 |
| 墨滴小怪 (Inklet) | 11-17 / 12-18 | 低血量群体怪，与墨系 BOSS 同族 |
| 撕咬者 (Mawler) | 72 / 76 | 撕咬型大嘴怪 |
| 藤蔓游荡者 (Vine Shambler) | 61 / 64 | 植物系重型怪 |
| 蜿蜒绞杀藤 (Slithering Strangler) | 53-55 / 54-56 | 挥击 (Thwack) 型藤蔓 |
| 咬人贾克斯果 (Snapping Jaxfruit) | 31-33 / 34-36 | 果实类小型怪（不会连续两场出现） |
| 红宝石掠盗团 (Ruby Raiders) | 刺客/斧手/蛮兵/弩手/追踪者 5 变体 | 人类匪帮遭遇（成员组合随机） |

**精英池**

| 精英 | 血量 | 行为简述 |
|---|---|---|
| 远古雕像 (Bygone Effigy) | 127 / 132 | 遗迹雕像精英 |
| 伯多尼斯鸟 (Byrdonis) | 91-94 / 99 | 一代"信天翁鸟(Byrd)"系升级版大鸟；专属事件"伯多尼斯巢"关联 |
| 蛙噬寄生体 (Phrog Parasite) | 61-64 / 66-68 | 死亡时分裂/生成新怪的寄生怪（蛙+Phrog 梗） |

**BOSS（三选一随机）**

| BOSS | 血量 | 行动模式详述 |
|---|---|---|
| **范托姆 (Vantom)** | 173 / 183 | 行动循环：墨渍 (7/8 伤) → 墨枪 (6/7 伤) → 蓄力 → **肢解 (26/30 伤重击)**；战斗中召唤副体**恐光体 (Parafright)**（21 HP，挥击 16/17 伤，持续在场） |
| **仪式巨兽 (Ceremonial Beast)** | 252 / 262 | 撕犁 (18/20 伤) 与践踏 (15/17 伤) 交替的重型站桩 BOSS |
| **亲族 (The Kin)** | 主教 190 / 199；随从×2 各 58-59 / 62-63 | 群体 BOSS：**亲族主教**使用灵魂光束 (3 伤) 与衰弱/虚弱法球 (各 8 伤)；**亲族随从**使用"舞蹈"为全队叠加力量 (+2)，主教死亡后随从各自行动 |

### 1.2 第一幕 B —— 地下船坞 (Underdocks)【2代新·交替第一幕】

每局第一幕从繁茂之地 / 地下船坞 中随机二选一（区域、敌人、事件、BOSS 全不同）。内有大量一代致敬敌人（哥布林众——佣兵/胖/鬼祟哥布林，及一代精英拉加威林(Lagavulin)的致敬 BOSS"拉加威林之母"等）。

> 注：繁茂之地的事件池已从反编译数据中完整取回；**地下船坞的幕专属事件池**未在该数据源中单独建模（官方为交替幕各配独立事件），其专属事件名单待后续补充。共享事件池两个区域通用。

**弱敌池**：尸鼻涕虫 (Corpse Slug, 25-27 / 27-29)、海灵 (Seapunk, 44-46 / 47-49)、淤泥纺轮 (Sludge Spinner, 37-39 / 41-42)、蝌蚪 (Toadpole, 21-25 / 22-26)。

**普通池**

| 敌人 | 血量 | 行为简述 |
|---|---|---|
| 钙化信徒 (Calcified Cultist) | 38-41 / 39-42 | 邪教徒（群体出现） |
| 潮湿信徒 (Damp Cultist) | 51-53 / 52-54 | 邪教徒强化型 |
| 化石潜伏者 (Fossil Stalker) | 51-53 / 54-56 | 骨架潜伏怪 |
| 佣兵哥布林 (Gremlin Merc) | 47-49 / 51-53 | 偷金币；被打死前未偷到钱则**胖哥布林 (Fat Gremlin)** 出场不持钱袋；另伴**鬼祟哥布林 (Sneaky Gremlin)** |
| 幽灵船 (Haunted Ship) | 63 / 67 | 船体幽灵 |
| 活雾 (Living Fog) | 80 / 82 | 雾怪，携带**毒气弹 (Gas Bomb)** |
| 冲拳构装体 (Punch Construct) | 55 / 60 | 出拳型构装体 |
| 下水道蛤 (Sewer Clam) | 56 / 58 | 蛤蜊怪 |
| 双尾鼠 (Two-Tailed Rat) | 17-21 / 18-22 | 低血量鼠群 |

**精英池**：幻影园丁 (Phantasmal Gardener, 28-32 / 29-33)、潜行菌落 (Skulking Colony, 75 / 80)、恐怖鳗 (Terror Eel, 140 / 150)。

**BOSS（三选一随机）**

| BOSS | 血量 | 行动模式详述 |
|---|---|---|
| **瀑布巨人 (Waterfall Giant)** | 240 / 250 | 水压 (15/20) → 践踏 (15/16 伤+1 虚弱) → 冲撞 (10/11) → 升压 (13) 循环的重型 BOSS |
| **魂鱼 (Soul Fysh)** | 211 / 221 | 魂系鱼怪（名字为一代社区热梗"fysh"的官方玩梗）；核心招式**脱气 (De-Gas)** 16/17(18) 伤+毒气机制 |
| **拉加威林之母 (Lagavulin Matriarch)** | 222 / 233 | 一代精英拉加威林(Lagavulin)的致敬 BOSS：**沉睡 → 挥砍 (19 伤) → 剖腹 → 再挥砍 → 吸魂**循环 |

### 1.3 第二幕 —— 蜂巢 (The Hive)

**弱敌池**（2 组弱遭遇配置）：盗跳者 (Thieving Hopper, 79 / 84)、钻掘者 (Tunneler, 87 / 92，钻地状态免疫机制)、碗虫四种 (Bowlbug Egg/Nectar/Rock/Silk，按携带物分型)、外骨骼虫 (Exoskeleton, 24-28 / 26-30，v0.111 A8 血量微增)。

**普通池**：噬咬者 (Chomper, 60-64 / 63-67，可先手尖叫)、猎杀者 (Hunter Killer, 121 / 126)、蠕虫仔 (Wriggler, 17-21 / 18-22，死亡增殖)、虱母 (Louse Progenitor, 134-136 / 138-141，力量成长 5→7，v0.111 A9 增幅)、螨虫 (Myte, 61-67 / 64-69)、孵卵机 (Ovicopter, 67-72 / 70-75 + **硬蛋 Tough Egg**，孵化机制，血量可+1)、沉睡甲虫 (Slumbering Beetle, 86 / 89)、棘背蟾 (Spiny Toad, 116-119 / 121-124)、**幽暗者 (The Obscura, 123 / 129)**（2025-12 官方"猜怪物"栏目揭晓的波纹辐射体，干扰现实结构）。

**精英池**：十毫千足虫 (Decimillipede，三节体各 42-48 / 48-56)、昆虫术士 (Entomancer, 145 / 155，v0.111 A8 提至 165)、**孕育棱镜 (Infested Prism, 200 / 215)**。

**BOSS（三选一随机）**

| BOSS | 血量 | 行动模式详述 |
|---|---|---|
| **凯撒蟹 (Kaiser Crab)** | 碎壳者 209 / 219 + 火箭体 199 / 209 | 双部位 BOSS：**碎壳者 (Crusher)** 重击 + **火箭体 (Rocket)** 远程，玩家转向时 BOSS 形态切换（有专属变形 VFX） |
| **知识恶魔 (Knowledge Demon)** | 379 / 399 | 拍击 (17 伤) → 压倒 (8 伤) → 沉思 (11 伤+2 力量) 循环；专属诅咒招式**知识诅咒 (Curse of Knowledge)**（Bestiary 中有独立动画） |
| **饕餮者 (The Insatiable)** | 321 / 341 | 名字直指"永不满足"；具体招式数值未在已获取的反编译摘要中展开 |

### 1.4 第三幕 —— 荣耀 (Glory)

**弱敌池**（2 组弱遭遇配置）：虔敬雕塑师 (Devoted Sculptor, 162 / 172)、噬文卷轴 (Scroll of Biting, 24-26 / 26-28)、炮塔操作员 (Turret Operator, 28-30 / 30-32)。

**普通池**

| 敌人 | 血量 | 行为简述 |
|---|---|---|
| 斧头机器人 (Axebot) | 70-78 / 76-86 | v0.111 大幅增强：锤勾拳 14(18) 伤、连击 10(11)×2；**死亡重生时最大生命+10** |
| 制造者 (Fabricator) | 150 / 155 | 召唤四种子机：电击/刺杀/护卫/噪音机器人 (Zapbot/Stabbot/Guardbot/Noisebot) |
| 蛙骑士 (Frog Knight) | 191 / 199 | 重型骑士 |
| 球头 (Globe Head) | 148 / 158 | 电流强化 (Galvanic 6→8，v0.111 A9 增幅) |
| 猫头鹰判官 (Owl Magistrate) | 82 / 86 | 法官型施法怪 |
| 史莱姆狂战士 (Slimed Berserker) | 60-65 / 64-69 | 狂暴史莱姆 |
| 迷失者+遗忘者 (The Lost & The Forgotten) | 成对出现 | 双子幽灵组合怪 |
| 构装动物园 (Construct Menagerie) | 组合遭遇 | 多构装体混合遭遇 |

**精英池**：骑士三人组（链锤骑士 Flail Knight 101 / 108、法师骑士 Magi Knight 82 / 89、幽灵骑士 Spectral Knight 93 / 97）、机甲骑士 (Mecha Knight, 155 / 165，v0.111 火焰喷射回合追加 8(12) 伤)、**灵魂锚 (Soul Nexus, 234 / 254 + 敌方奥斯提 Osty 1 HP)**——召唤亡灵缚师的奥斯提镜像，与玩家 Osty 体系呼应。

**BOSS（三选一随机；进阶 10 时三幕末双 BOSS 战）**

| BOSS | 血量 | 行动模式详述 |
|---|---|---|
| **万世镜 (Aeonglass)** | 512 / 535 | 造门者被移除后加入第三幕 BOSS 池（不晚于 v0.107.1；v0.108 补齐专属动画）。开场自带**神器 (Artifact) 3 层**与对每位玩家的**凋零领域 (Withering Presence, 6)**：每回合向玩家牌组塞入凋零 (Wither) 状态卡。行动循环：**退潮 (26/32 伤+自获 33 格挡)** → **眼激光 (11/12 伤×2)** → **愈演愈烈 (+3/4 力量，并把所有在场 Wither 卡"伪升级" +3 伤)**，循环往复形成雪球压力 |
| **女王 (Queen)** | 400 / 419 | 带**皇家卫兵 (Royal Guard)**。招式：**提线傀儡**（束缚锁链 3 层）、**你是我的了**（99 层特殊负面）、**斩首 (3/4 伤×5 连击)**、**处决 (15/18 伤)**、**激怒 (+2 力量)**、**为我燃烧 (+1 力量+20 格挡)** |
| **实验体 (Test Subject)** | 三形态：100/111 → 200/212 → 300/313 | 打掉一阶段进入下一形态（血量重置）。招式：撕咬 (20/22 伤)、颅击 (14/16 伤+1 易伤)、多重爪击 (10 伤多段)、激怒 (+2/3 力量)；带燃烧动画 |

**事件战斗专属敌人**（不出现在地图遭遇池）：神秘骑士 (Mysterious Knight, 101 HP，"提灯钥匙"事件中持有双连枷的骑士，持续攻击)、活体护盾 (Living Shield, 55 HP)、教学假人 (Battleworn Dummy 事件) 等。

---

## 2. 事件系统

### 2.1 结构
- 地图 `?` 节点触发。每幕事件池 = 幕专属事件 + **18 个全塔共享事件 (Shared pool)**。
- 共享事件池（v0.107.1 C# `ModelDb.AllSharedEvents`，18 个）：BrainLeech（脑蛭）、CrystalSphere（水晶球）、DollRoom（玩偶房）、FakeMerchant（假商人/商人??）、PotionCourier（药水快递）、RanwidTheElder（兰维德长老）、RelicTrader（遗物商人）、RoomFullOfCheese（满屋奶酪）、SelfHelpBook（自助之书）、SlipperyBridge（湿滑之桥）、StoneOfAllTime（万世之石）、Symbiote（共生体）、TeaMaster（茶道大师）、TheFutureOfPotions（药水的未来）、TheLegendsWereTrue（传说是真）、ThisOrThat（非此即彼）、WarHistorianRepy（战争史家雷皮）、WelcomeToWongos（欢迎来到翁戈斯）。
- 幕专属事件：**繁茂之地 15 个**（AromaOfChaos、ByrdonisNest、DenseVegetation、JungleMazeAdventure、LuminousChoir、MorphicGrove、SapphireSeed、SunkenStatue、TabletOfTruth、UnrestSite、Wellspring、WhisperingHollow、WoodCarvings 等）；**蜂巢 10 个**（Amalgamator、Bugslayer、ColorfulPhilosophers、ColossalFlower、FieldOfManSizedHoles、InfestedAutomaton、LostWisp、SpiritGrafter、TheLanternKey、ZenWeaver）；**荣耀 7 个**（BattlewornDummy、GraveOfTheForgotten、HungryForMushrooms、Reflections、RoundTeaParty、TinkerTime、Trial）。
- **古代 (Ancients) 不在随机事件池内**：它们以每幕一个的**古代节点 (Ancient)** 专属地图节点出现（见 2.3）。

### 2.2 代表事件与选项（精确数值）

**巨花 (Colossal Flower)【蜂巢】—— 三阶段贪心事件**
1. 阶段一：掏取花蜜离开（**+35 金币**）或 向深处伸手（**-5 HP**，继续）；
2. 阶段二：提取 75 金币离开 或 继续深入（**-6 HP**）；
3. 阶段三：拿 135 金币离开 或 伸手到花心（**-7 HP**，获得遗物**多粉核心 (Pollinous Core)**：每 4 回合额外抽 2 张牌）。
- 全程坚持到底的代价 = 18 HP。

**伯多尼斯巢 (Byrdonis Nest)【繁茂之地】—— 任务卡事件**
- 选项 A：**吃掉鸟蛋 → +7 最大生命**；
- 选项 B：带走鸟蛋 → 卡组加入**伯多尼斯蛋 (Byrdonis Egg)**（不可打出，占卡位）→ 在任意篝火选择"孵蛋"→ 移除该卡并替换为**俯冲鸟击 (Byrd Swoop)**：0 费无色攻击，14 伤。

**提灯钥匙 (The Lantern Key)【蜂巢 → 荣耀】—— 跨幕任务链**
1. 拾取发光钥匙后遭遇骑士索要：交还钥匙（**+100 金币**）或 **与神秘骑士战斗**（事件战斗，101 HP 持续进攻型）；
2. 战胜后获得**提灯钥匙 (Lantern Key)**（不可打出的诅咒型任务卡，带入下一幕战斗占卡位）；
3. 下一幕遇到**困在笼中的战争史家雷皮 (War Historian Repy)**，二选一：
   - 用钥匙开**宝箱** → 获得 **2 瓶随机药水 + 2 件随机遗物**；
   - 用钥匙开**牢笼**释放雷皮 → 获得遗物**历史课 (History Course)**：每回合开始时自动重放你上回合打出的最后一张攻击或技能。

**篝火孵蛋（伯多尼斯蛋）**证明了 2 代篝火选项可为动态任务卡让位（类似一代"锻锤/史莱姆宝宝"机制）。

### 2.3 古代 (Ancients) 系统【取代一代 Neow 单神体系】
- **开局事件（内乌 Neow）**：每局开始三选一——**2 个正面遗物选项 + 1 个诅咒遗物选项**。
  - 正面池（v0.107.1，14+项）：ArcaneScroll、BoomingConch、FishingRod、GoldenPearl、Kaleidoscope、LeadPaperweight、LostCoffer、MassiveScroll（多人限定）、NeowsTorment、NewLeaf、PhialHolster、PreciseScissors、ScrollBoxes、WingedBoots（单人限定）+ 三组互斥二选一（LavaRock↔SmallCapsule、NutritiousOyster↔StoneHumidifier、NeowsTalisman↔Pomander）。
  - 诅咒池：CursedPearl、HeftyTablet、LargeCapsule、LeafyPoultice、NeowsBones、PrecariousShears、SilkenTress、SilverCrucible（单人限定）。
- **幕内古代节点**（每幕一个）按幕分布：
  - 第一幕（繁茂/船坞）：内乌 (Neow)；
  - 第二幕（蜂巢）：奥罗巴斯 (Orobas，纪元解锁门槛) / 佩尔 (Pael) / 特兹卡特 (Tezcatara)；
  - 第三幕（荣耀)：诺努佩 (Nonupeipe) / 坦克斯 (Tanx) / 瓦库 (Vakuu)；
  - 共享古代：达尔弗 (Darv)。
- 古代给予**遗物 + 专属卡牌**奖励，示例（补丁日志实锤）：
  - Neow 的卡"丰裕 (Abundance)"（v0.110：必定创造已升级能力卡）；
  - Tezcatara：遗物玩具盒 (Toy Box)、暖手套 (Toasty Mittens，每回合消耗手牌 1 张+1 力量)、黄金之印 (Seal of Gold，每回合 -3 金)、卡"至亮之焰 (Brightest Flame)"（v0.111 削：最大生命损耗 1→2）；
  - Nonupeipe：遗物美丽手镯 (Beautiful Bracelet，随机附魔 4 张卡并给予 Swift 2 层——v0.111 削)、毛皮大衣 (Fur Coat，标记 8 场战斗)、印章戒指 (Signet Ring，+888 金)；；
  - Pael：**11 件"佩尔的身体部件"系列遗物**（PaelsBlood/Claw/Eye/Flesh/Growth/Horn/Legion/Tears/Tooth/Wing）+ 卡"放松 (Relax)"（格挡 16(18)，v0.110 增）；
  - Tanx：坦克斯之哨 (Tanx's Whistle，v0.110 降为 2 费)、卡"重锤 (Maul)"（伤害成长 2(3)，v0.110 增）；
  - Vakuu：镶宝面具 (Vakuu's Jeweled Mask，选一个非天生(Innate)能力卡——v0.111 UX 修正)、提琴 (Fiddle，抽 2 张)。
  - 铁甲战士的**腐化 (Corruption)** 在 2 代为古代奖励限定卡（技能 0 费全部消耗）。
- 进阶 2"疲惫旅人"：古代回复缺失生命的 80%。

---

## 3. 遗物 / 药水清单概览

### 3.1 遗物 (Relics) 规模（v0.107.1 反编译统计）
| 类别 | 数量 | 说明 |
|---|---|---|
| 起始遗物 | 10 | 5 件基础（燃烧之血/蛇环/破损核心/神授王权/缚魂圣物匣）+ 5 件升级变体（黑血/Drake之环/Infused Core/天定命运/Unbound Phylactery） |
| 普通 (Common) | 30 | 例：Anchor（首回合获得格挡）、BagOfPreparation、BloodVial、OddlySmoothStone（开局+1 敏捷）、RedSkull 等 |
| 罕见 (Uncommon) | 40 | 例：BoneFlute、BronzeScales（+3 荆棘）、CentennialPuzzle、Gorget、HornCleat、NinjaScroll、SneckoSkull 等 |
| 稀有 (Rare) | 50 | 例：GalacticDust、GremlinHorn、JossPaper、RunicPyramid、PandorasBox、PhilosophersStone、Sozu、SneckoEye 等（一代 BOSS 级遗物回归） |
| 商店/事件/古代/特殊 | 167 | 含 PollinousCore、HistoryCourse、FuneraryMask（开战+3 灵魂）、FencingManual（开战激活主权之刃）、Lantern/Candelabra 系列、Neow 全家桶、Pael 系列、CharonsAshes 等 |
| **合计（已注册）** | **297** | 另有约 10 个枚举位为特殊/占位（如 Circlet 防重复机制），总枚举 307 |

一代约 150 件遗物，2 代 EA 中期已达 297 件（尚未含 1.0 计划的新增）。

### 3.2 药水 (Potions) 规模（v0.107.1）
- 总计 **64 种**：普通 20 / 罕见 20 / 稀有 20 / 事件与代币 4（含 DeprecatedPotion 占位；FoulPotion 事件药水，卖出 100 金）。
- **每角色专属药水**：血瓶 (Blood Potion，铁甲战士：回复 20% 最大生命)、专注药水 (Focus Potion，故障机器人)、毒药 (Poison Potion，寂静猎手)、末日药水 (Potion of Doom，亡灵缚师)、星辰药水 (Star Potion，摄政王)。
- 药水带使用类型（战斗中/任意时机/自动）与目标类型（自身/单体敌人/全体敌人/**任意玩家**——联机可给队友用）。
- 一代知名药水回归：能量药水(+2 能量)、迅捷药水(抽 3)、疯狂炼金 (Entropic Brew)、仙子瓶 (Fairy in a Bottle，自动复活)、果汁 (Fruit Juice，+5 最大生命)、壁虎油 (Snecko Oil) 等；新增如 FyshOil（致敬魂鱼）、PowderedDemise、RadiantTincture 等。

### 3.3 v0.105–v0.111 期间遗物/药水新增与调整要点
- v0.105：删除造门者 BOSS（连带其专属遗物调整）；
- v0.106：低威胁敌人增强（含精英/Boss 掉落调整）；
- v0.108：再生药水改为在末日结算前生效（防自杀死）；新增 15 张联机卡；Neow 系遗物修复；
- v0.110：Regalite 重做（每回合首次创造卡牌+6 格挡）、Toasty Mittens/Seal of Gold/Beautiful Bracelet/Fur Coat/Signet Ring 等古代遗物调整；
- v0.111：Regalite 削至 4 格挡、Beautiful Bracelet 改随机附魔 4 张、敏捷药水改回绿色等。

---

## 4. 内容规模统计（截至 2026-11-09，v0.111）

| 内容 | 数量 | 备注/来源 |
|---|---|---|
| 可玩角色 | **5**（+2 已官宣开发中） | Steam 页面/Wikipedia/官方 Neowsletter |
| 幕 (Acts) | **3**（+1 已官宣：Act 4/真结局建筑师，1.0 内容） | PCGamesN acts 专文；v0.111 未实装 |
| 交替幕 | 1（第一幕：繁茂之地/地下船坞） | 交替第二幕开发中（2026-08 Neowsletter） |
| BOSS | 12 只实装（每幕 3 只×3 幕+剧情战建筑师）+ 已删 1（造门者） | 反编译 BOSS 池 |
| 精英 | 12 组（每区域 3 组） | 反编译精英池 |
| 普通敌人种类（独立实体定义） | **约 107 种**（含子单位/事件战斗怪/已删单位） | v0.107.1 反编译 create_* 函数统计 |
| 卡牌总数 | 卡牌枚举 **583 项**；其中：铁甲战士 87 / 寂静猎手 88 / 故障机器人 88 / 摄政王 88 / 亡灵缚师 88（各含联机专属卡）/ 无色 64 / 诅咒 18 / 状态 12 / 代币 14 / 事件卡 27 / 任务卡 3 | v0.107.1 反编译 CardId 枚举与卡池 |
| 联机专属卡 | ≥20 张（v0.108 一次性新增 15 张 + 先前已有） | v0.108 补丁日志 |
| 遗物 | **297 件已注册**（枚举 307） | v0.107.1 反编译 |
| 药水 | **64 种** | v0.107.1 反编译 |
| 事件（非古代） | **50 个**（繁茂 15 + 蜂巢 10 + 荣耀 7 + 共享 18）+ 开局 Neow 事件 + 每幕古代事件 | v0.107.1 反编译 C# AllEvents 池 |
| 进阶等级 | 每角色 10 级（全局共享同一套效果） | PCGamesN ascension 专文 |
| 语言 | 官方本地化含中文（简/繁）、日、韩、俄、泰、法、意、土等，v0.111 新增印尼语 | v0.111 补丁日志 |
| Steam 创意工坊 (Mod 支持) | v0.107.1（Major Update #2，2026-06-18）起实装 | 补丁日志 |
| 成就系统 | 尚未实装（1.0 时上线） | 2026-08 Neowsletter Q&A |

> 注：卡牌/遗物/药水/事件为 v0.107.1 快照统计；v0.108–v0.111 仅调整数值与重做，无清单级增删（v0.108 增加的 15 张联机卡已计入）。v0.111 后的下一大补丁（计划 2026-11-12 上 beta）将带来"大块内容"（实验性模式、交替第二幕、新角色在开发管线中）。

---

## 5. 地图结构（与一代差异）

### 5.1 总体结构
- **幕数量**：EA 版 3 幕（一代正式版 3 幕+第 4 幕心脏；2 代第 4 幕已在结尾剧情中铺垫，真结局对建筑师的完整战斗为 1.0 内容）。
- **幕行数**：繁茂之地/船坞 15 行、蜂巢 14 行（C# `Hive.BaseNumberOfRooms = 14`）、荣耀 13 行（`Glory.BaseNumberOfRooms = 13`）。
- **弱遭遇数**：第一幕 3 组、第二/三幕 2 组（C# `NumberOfWeakEncounters`：Acts 0/3 为 3，Acts 1/2 为 2）——每局开局前几层的低强度战斗由专属"弱敌池"供给。
- **交替区域**：第一幕二选一（繁茂之地 ↔ 地下船坞），敌人/事件/BOSS 全套更换；第二幕交替区域（蜂巢 ↔ 新区域，9 月/10 月 Neowsletter 已预热其中生物）与第三幕交替在路线图上。
- **地图重设计**：v0.101（2026-03-25 beta）"redesigns the map"——EA 后地图结构经过一次整体重做（节点分布/路径规则调整）。

### 5.2 节点类型 (MapPointType，v0.107.1 枚举)
| 节点 | 说明 |
|---|---|
| 怪物 (Monster) | 普通战斗 |
| 精英 (Elite) | 精英战斗（掉落遗物） |
| BOSS (Boss) | 幕末 BOSS（进阶 10 时第三幕**双 BOSS 战**） |
| 商店 (Shop) | 购买/删卡/药水/遗物 |
| 篝火 (RestSite) | 休息（回复 30% 最大生命，遗物可修正）或 升级卡牌；**动态第三选项**（如孵伯多尼斯蛋等任务卡） |
| 宝箱 (Treasure) | 宝物房（非 BOSS 宝箱） |
| **古代 (Ancient)**【2代新增】 | 每幕一个的古代神节点，提供古代遗物/卡牌奖励（一代无此节点类型，Neow 只在开局） |

与一代的节点类型差异：一代为 怪物/精英/BOSS/商店/篝火/宝箱/事件(`?`)/工匠(The Artist 仅Mod)——2 代新增**古代节点**，`?` 事件节点类型保留（未列入 MapPointType 枚举的事件节点在地图中以怪物节点特殊标记或问号形式出现，反编译枚举含 UNKNOWN/UNASSIGNED 占位）。

### 5.3 其他结构差异
- **多地图扩展**：v0.108 起 Custom Run 增加"随机化"按钮（随机 2 个增益修饰词+1 个减益+随机角色）；修饰词如 Big Game Hunter（精英掉稀有卡）。
- **每日挑战 (Daily Run)**：EA 即有，带全球排行榜（v0.108 修复部分日期无法加载）。
- **图鉴 (Bestiary)**：v0.107.1 加入（路线图项），可查看怪物行动/事件战斗遭遇与统计。
- **纪元/时间线 (Epoch/Timeline)**：一局结束点亮条目，消耗得分解锁新内容。
- **四人联机**：地图/事件/奖励各自独立选择；敌人生成缩放（每幕 1.1/1.2/1.2，三幕 BOSS 额外 1.3）；倒地队友战后 1 HP 复活。

## 参考来源

1. 社区反编译数据仓库 sts2-rl-agent（v0.107.1 客户端、2026-06-18 构建反编译；敌人血量/行动、卡牌池、遗物 297 件、药水 64 种、事件 50 个、地图幕配置、Neow 事件池等全部精确数值来源）：https://github.com/zhiyue/sts2-rl-agent （版本标注见其 GAME_VERSIONS.md）
2. Steam 官方新闻/补丁日志 v0.99–v0.111（v0.105 删 BOSS、v0.101 地图重设计、v0.107 模组支持、v0.108 联机卡、v0.110/v0.111 平衡与古代遗物调整）：https://steamcommunity.com/games/2868840/allnews/
3. Steam 商店页（StS2, appid 2868840，EA 2026-03-05）：https://store.steampowered.com/app/2868840/
4. Wikipedia — Slay the Spire II（幕结构、交替幕、建筑师剧情）：https://en.wikipedia.org/wiki/Slay_the_Spire_2
5. PCGamesN 事件/BOSS 专文：
   - 巨花与多粉核心：https://www.pcgamesn.com/slay-the-spire-2/colossal-flower
   - 伯多尼斯蛋/俯冲鸟击：https://www.pcgamesn.com/slay-the-spire-2/byrdonis-egg
   - 提灯钥匙任务链/历史课：https://www.pcgamesn.com/slay-the-spire-2/lantern-key
   - 建筑师（不可战胜结局）：https://www.pcgamesn.com/slay-the-spire-2/architect
   - 幕数量与交替幕：https://www.pcgamesn.com/slay-the-spire-2/acts
6. PCGamesN 进阶等级（A1–A10 效果、A8/A9/A10 说明）：https://www.pcgamesn.com/slay-the-spire-2/ascension-levels
7. PCGamesN 官方路线图汇总（Act 4/新角色/交替幕/新模式计划，2026-04 更新）：https://www.pcgamesn.com/slay-the-spire-2/roadmap
8. PCGamesN 最新动态（交替二幕/新角色开发确认 2026-08-15；11-12 补丁预告 2026-10-30）：https://www.pcgamesn.com/slay-the-spire-2/updates-slowing-down-new-character-act-two 、https://www.pcgamesn.com/slay-the-spire-2/neowsletter-october-2026-next-update
