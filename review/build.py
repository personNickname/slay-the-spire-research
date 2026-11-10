#!/usr/bin/env python3
"""构建脚本：把 data/ 下全部 JSON 打包成 review/data.js（单一数据源）。
数据代理每落地一批文件，重跑本脚本即可让 review 页面展示最新数据。
用法：python3 review/build.py
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "review", "data.js")


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


# ---- jar 版 schema → 展示平铺（不动 data/ 真值，展示层负责适配） ----

RICH_COLOR = re.compile(r"#([ybrogpeu])\s?")


def clean_rich(s):
    """清掉游戏富文本标记：#y黄#b蓝等颜色高亮直接去除；剩余孤立 # 为 DynamicVar 占位 → ？。"""
    if not isinstance(s, str):
        return s
    s = RICH_COLOR.sub("", s)
    s = re.sub(r"\[(R|G|B|E|W)\]", "◆", s)
    return s.replace("#", "？")



def normalize_entity(x):
    if not isinstance(x, dict):
        return x
    n = dict(x)
    name = x.get("name")
    if isinstance(name, dict):
        n["zh"] = name.get("zhs") or name.get("zh")
        n["en"] = name.get("eng") or name.get("en")
        del n["name"]
    desc = x.get("description")
    if isinstance(desc, dict):
        n["effect"] = clean_rich(desc.get("zhs") or desc.get("zh") or desc.get("eng") or "")
    if "kind" in n and "tier" not in n:
        n["tier"] = n["kind"]
    descs = x.get("descriptions")
    if isinstance(descs, dict):
        n["effect"] = clean_rich("".join(descs.get("zhs") or descs.get("zh") or descs.get("eng") or []))
        del n["descriptions"]
    names = x.get("names")
    if isinstance(names, dict):
        n["zh"] = "、".join(names.get("zhs") or [])
        n["en"] = ", ".join(names.get("eng") or [])
        del n["names"]
    if "tier" in n and "rarity" not in n:
        n["rarity"] = n["tier"]
    hp = x.get("hp")
    if isinstance(hp, list) and hp and isinstance(hp[0], dict):
        n["hp"] = " / ".join(
            (f"{b['min']}-{b['max']}" if b["min"] != b["max"] else str(b["min"])) + (f"（A{b['asc']}+）" if b.get("asc") else "")
            for b in hp
        )
    moves = x.get("moves")
    if isinstance(moves, dict):
        eng, zhs = moves.get("eng", []), moves.get("zhs", [])
        n["moves"] = [
            {"name": zhs[i] if i < len(zhs) else "", "en": e, "effect": ""}
            for i, e in enumerate(eng)
        ]
    for k in ("effect", "effect_up", "pattern", "cost"):
        if isinstance(n.get(k), str):
            n[k] = clean_rich(n[k])
    return n


def normalize_list(items):
    return [normalize_entity(x) for x in items] if isinstance(items, list) else items


def flatten_neow(neow):
    """neow.json 是分组对象（含嵌套 options/advantages/disadvantages），拍平成带标签的列表。"""
    flat = []
    for group, block in neow.items():
        if group == "meta" or not isinstance(block, (list, dict)):
            continue
        if isinstance(block, list):
            theme, items = "", block
        else:
            theme = block.get("theme", "")
            items = []
            for sub in ("options", "advantages", "disadvantages"):
                v = block.get(sub, [])
                items.extend(v if isinstance(v, list) else [])
        for it in items:
            entry = dict(it) if isinstance(it, dict) else {"effect": str(it)}
            entry["group"] = group
            if theme:
                entry["theme"] = theme
            flat.append(entry)
    return flat


def build_game(game_dir):
    """读取一个游戏的全部数据文件，返回 {实体: 列表/对象}。"""
    out = {}
    if not os.path.isdir(game_dir):
        return out

    # ---- 卡牌：优先 cards/*.json（jar 抽出），否则 cards_<character>.json baseline ----
    cards = []
    cards_dir = os.path.join(game_dir, "cards")
    if os.path.isdir(cards_dir):
        for name in sorted(os.listdir(cards_dir)):
            if not name.endswith(".json") or name.endswith(".effects.json"):
                continue
            data = load(os.path.join(cards_dir, name))
            if isinstance(data, list):
                cards.extend(normalize_list(data))
    for name in sorted(os.listdir(game_dir)):
        if not (name.startswith("cards_") and name.endswith(".json")):
            continue
        data = load(os.path.join(game_dir, name))
        if name == "cards_neutral.json":
            counts = {}
            for group in ("colorless", "curses", "statuses"):
                items = data.get(group, [])
                if not cards:
                    cards.extend(normalize_list(items))
                counts[group] = len(items)
            out["cards_neutral_groups"] = counts
        elif isinstance(data, list) and not cards:
            cards.extend(normalize_list(data))
    if cards:
        out["cards"] = cards

    # ---- 各实体直读 ----
    for name in sorted(os.listdir(game_dir)):
        if not name.endswith(".json") or name.startswith(("cards_", "_")):
            continue
        path = os.path.join(game_dir, name)
        data = load(path)
        key = name[:-5]


        if key == "neow":
            out["neow"] = flatten_neow(data)
            out["neow_meta"] = data.get("meta", {})
        elif key == "achievements":
            out["achievements"] = data.get("achievements", [])
            out["achievements_meta"] = {k: v for k, v in data.items() if k != "achievements"}
        elif key == "score":
            out["score"] = data.get("bonuses", [])
            out["score_meta"] = {k: v for k, v in data.items() if k != "bonuses"}
        else:
            # 信封结构（{version, source, ..., <同名实体键>: [...]}）→ 抽出列表 + 保留 meta
            if isinstance(data, dict):
                if key in data and isinstance(data[key], list):
                    out[key] = normalize_list(data[key])
                    out[key + "_meta"] = {k: v for k, v in data.items() if k != key}
                else:
                    out[key] = data  # map_config 等本身就是配置对象
            else:
                out[key] = normalize_list(data)

    # ---- wiki 描述合并：wiki_descriptions.json 有具体数值文本时替换 ？ 占位 ----
    wiki_path = os.path.join(game_dir, "wiki_descriptions.json")
    if os.path.exists(wiki_path):
        wiki = load(wiki_path)
        for entity, mapping in wiki.items():
            items = out.get(entity)
            if not isinstance(items, list) or not isinstance(mapping, dict):
                continue
            for it in items:
                info = mapping.get(it.get("id", "")) or mapping.get(it.get("en", ""))
                if isinstance(info, dict):
                    zh = info.get("zh")
                    en = info.get("en")
                    if zh and ("？" in it.get("effect", "") or not it.get("effect")):
                        it["effect"] = zh
                    if en:
                        it["effect_en"] = en
    return out


def main():
    games = {}
    for g in ("sts1", "sts2"):
        built = build_game(os.path.join(ROOT, "data", g))
        if built:
            games[g] = built

    payload = json.dumps(games, ensure_ascii=False, separators=(",", ":"))
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("// 自动生成：python3 review/build.py —— 请勿手改\n")
        f.write("// 数据源：data/sts1/*.json, data/sts2/*.json（提取的游戏数据库；展示层已做 schema 规范化）\n")
        f.write("window.GAME_DATA = ")
        f.write(payload)
        f.write(";\n")

    counts = {g: {k: (len(v) if isinstance(v, (list, dict)) else "obj") for k, v in ents.items()}
              for g, ents in games.items()}
    print("生成", os.path.relpath(OUT, ROOT))
    print(json.dumps(counts, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
