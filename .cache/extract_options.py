#!/usr/bin/env python3
"""Extract Options sections (plus A15 info) from cached event wikitext into readable text."""
import os, re, glob

CACHE = "/Users/xu/Desktop/Agent/slay-the-spire-research/.cache/sts1_events"
OUT = "/Users/xu/Desktop/Agent/slay-the-spire-research/.cache/options_dump.txt"

ORDER = [
    "A_Note_For_Yourself", "Bonfire_Spirits", "Duplicator", "Golden_Shrine", "Lab",
    "Match_and_Keep", "Ominous_Forge", "Purifier", "The_Divine_Fountain", "The_Woman_in_Blue",
    "Transmogrifier", "Upgrade_Shrine", "We_Meet_Again_", "Wheel_of_Change",
    "Big_Fish", "Dead_Adventurer", "Face_Trader", "Golden_Idol__Event_", "Hypnotizing_Colored_Mushrooms",
    "Living_Wall", "Scrap_Ooze", "Shining_Light", "The_Cleric", "The_Ssssserpent",
    "Wing_Statue", "World_of_Goop",
    "Ancient_Writing", "Augmenter", "Council_of_Ghosts", "Cursed_Tome", "Designer_In-Spire",
    "Forgotten_Altar", "Knowing_Skull", "Masked_Bandits", "N_loth", "Old_Beggar",
    "Pleading_Vagrant", "The_Colosseum", "The_Joust", "The_Library", "The_Mausoleum",
    "The_Nest", "Vampires",
    "Falling", "Mind_Bloom", "Mysterious_Sphere", "Secret_Portal", "Sensory_Stone",
    "The_Moai_Head", "Tomb_of_Lord_Red_Mask", "Winding_Halls",
    "Neow",
]

def section(wt, name):
    """Extract from '== Name ==' (or '==Options==') to next == heading or end (keep subsections, stop at == Dialogue ==)."""
    m = re.search(r"^==\s*" + name + r"\s*==\s*$", wt, re.M | re.I)
    if not m:
        return None
    start = m.end()
    nxt = re.search(r"^==\s*[^=].*==\s*$", wt[start:], re.M)
    end = start + nxt.start() if nxt else len(wt)
    return wt[start:end]

lines = []
for fn in ORDER:
    path = os.path.join(CACHE, fn + ".txt")
    if not os.path.exists(path):
        # try fuzzy match
        cands = [p for p in glob.glob(os.path.join(CACHE, "*.txt")) if os.path.basename(p)[:-4].lower().startswith(fn[:6].lower())]
        if not cands:
            lines.append(f"\n##### MISSING FILE {fn}\n")
            continue
        path = cands[0]
    wt = open(path, encoding="utf-8").read()
    lines.append("\n" + "#" * 70 + f"\n##### {os.path.basename(path)[:-4]}\n" + "#" * 70 + "\n")
    opts = section(wt, "Options")
    if opts is None:
        lines.append("[NO OPTIONS SECTION]\n")
        lines.append(wt[:2500])
        continue
    lines.append(opts.strip() + "\n")

open(OUT, "w", encoding="utf-8").write("\n".join(lines))
print("wrote", OUT, os.path.getsize(OUT), "bytes")
