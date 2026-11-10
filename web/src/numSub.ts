import wikiDesc from "../../data/sts1/wiki_descriptions.json";

// json 推断类型无字符串索引签名；此文件是我们自己的数据管线产物（非外部输入），
// 以命名 Record 边界放开按 id 查询。
type WikiEntry = { zh: string | null; en: string } | undefined;
const relics: Record<string, WikiEntry> = wikiDesc.relics;
const potions: Record<string, WikiEntry> = wikiDesc.potions;

/**
 * 把游戏本地化文本里的 DynamicVar 占位（#）替换为 wiki 描述中的具体数值。
 * wiki 英文描述的数字按出现顺序对应占位出现顺序（绝大多数遗物成立）。
 */
export function NUM_SUB(zh: string, en: string | undefined): string {
  if (!en || !zh.includes("#")) return zh;
  const nums = en.match(/\d+/g) ?? [];
  let i = 0;
  return zh.replace(/#/g, () => (nums[i] !== undefined ? nums[i++]! : "?"));
}

/** wiki 药水英文数值描述，供占位替换。 */
export function potionWikiEn(id: string): string | undefined {
  return potions[id]?.en;
}

/** wiki 遗物英文数值描述（带具体数字），供占位替换。 */
export function relicWikiEn(id: string): string | undefined {
  return relics[id]?.en;
}
