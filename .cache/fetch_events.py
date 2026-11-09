#!/usr/bin/env python3
"""Fetch wikitext of all StS1 event pages from slaythespire.wiki.gg, cache locally."""
import urllib.request, urllib.parse, json, os, time, sys

REPO = "/Users/xu/Desktop/Agent/slay-the-spire-research"
CACHE = os.path.join(REPO, ".cache", "sts1_events")
os.makedirs(CACHE, exist_ok=True)

EVENT_PAGES = [
    "A Note For Yourself", "Bonfire Spirits", "Duplicator", "Golden Shrine", "Lab",
    "Match and Keep", "Ominous Forge", "Purifier", "The Divine Fountain", "The Woman in Blue",
    "Transmogrifier", "Upgrade Shrine", "We Meet Again!", "Wheel of Change",
    "Big Fish", "Dead Adventurer", "Face Trader", "Golden Idol (Event)", "Hypnotizing Colored Mushrooms",
    "Living Wall", "Scrap Ooze", "Shining Light", "The Cleric", "The Ssssserpent",
    "Wing Statue", "World of Goop",
    "Ancient Writing", "Augmenter", "Council of Ghosts", "Cursed Tome", "Designer In-Spire",
    "Forgotten Altar", "Knowing Skull", "Masked Bandits", "N'loth", "Old Beggar",
    "Pleading Vagrant", "The Colosseum", "The Joust", "The Library", "The Mausoleum",
    "The Nest", "Vampires",
    "Falling", "Mind Bloom", "Mysterious Sphere", "Secret Portal", "Sensory Stone",
    "The Moai Head", "Tomb of Lord Red Mask", "Winding Halls",
    "Neow",
]

API = "https://slaythespire.wiki.gg/api.php"

def safe_name(t):
    return "".join(c if c.isalnum() or c in "_-" else "_" for c in t)

def fetch_batch(titles):
    params = {
        "action": "query", "prop": "revisions", "rvprop": "content",
        "rvslots": "main", "format": "json", "redirects": 1,
        "titles": "|".join(titles),
    }
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "sts-research/0.1"})
    data = json.loads(urllib.request.urlopen(req, timeout=30).read())
    out = {}
    for pid, page in data["query"]["pages"].items():
        title = page["title"]
        wt = page["revisions"][0]["slots"]["main"]["*"] if "revisions" in page else None
        out[title] = wt
    return out

def main():
    todo = [t for t in EVENT_PAGES
            if not os.path.exists(os.path.join(CACHE, safe_name(t) + ".txt"))]
    print("to fetch:", len(todo))
    norm = {t.lower(): t for t in EVENT_PAGES}
    # also map redirects
    for i in range(0, len(todo), 20):
        batch = todo[i:i+20]
        got = fetch_batch(batch)
        for title, wt in got.items():
            key = title
            if key not in EVENT_PAGES:
                key = norm.get(title.lower(), title)
            fn = os.path.join(CACHE, safe_name(key) + ".txt")
            open(fn, "w", encoding="utf-8").write(wt or "")
            if wt is None:
                print("MISSING wikitext for:", title)
        time.sleep(0.4)
    # verify all
    ok = True
    for t in EVENT_PAGES:
        fn = os.path.join(CACHE, safe_name(t) + ".txt")
        if not os.path.exists(fn) or os.path.getsize(fn) < 50:
            print("PROBLEM:", t)
            ok = False
    print("DONE, all cached" if ok else "DONE with problems")

if __name__ == "__main__":
    main()
