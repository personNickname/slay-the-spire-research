#!/usr/bin/env python3
"""构建脚本：把 data/ 下全部 JSON 打包成 review/data.js（单一数据源）。
数据代理每落地一批文件，重跑本脚本即可让 review 页面展示最新数据。
用法：python3 review/build.py
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "review", "data.js")


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


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

    # ---- 卡牌：cards_<character>.json（列表）合并 + cards_neutral.json（分组对象）----
    cards = []
    for name in sorted(os.listdir(game_dir)):
        if not (name.startswith("cards_") and name.endswith(".json")):
            continue
        data = load(os.path.join(game_dir, name))
        if name == "cards_neutral.json":
            counts = {}
            for group in ("colorless", "curses", "statuses"):
                items = data.get(group, [])
                cards.extend(items)
                counts[group] = len(items)
            out["cards_neutral_groups"] = counts
        elif isinstance(data, list):
            cards.extend(data)
    if cards:
        out["cards"] = cards

    # ---- 各实体直读 ----
    for name in sorted(os.listdir(game_dir)):
        if not name.endswith(".json") or name.startswith("cards_"):
            continue
        key = name[:-5]
        path = os.path.join(game_dir, name)
        data = load(path)

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
            # 信封结构（{version, source, ..., <实体名>: [...]}）→ 抽出列表 + 保留 meta
            # 信封结构（{version, source, ..., <同名实体键>: [...]}）→ 仅当存在与文件同名的列表键时抽出
            if isinstance(data, dict):
                if key in data and isinstance(data[key], list):
                    out[key] = data[key]
                    out[key + "_meta"] = {k: v for k, v in data.items() if k != key}
                else:
                    out[key] = data  # map_config 等本身就是配置对象
            else:
                out[key] = data  # relics / potions / enemies / events ...
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
        f.write("// 数据源：data/sts1/*.json, data/sts2/*.json（提取的游戏数据库）\n")
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
