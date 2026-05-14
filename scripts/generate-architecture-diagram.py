#!/usr/bin/env python3
"""Generate architecture diagram for Memory Vault"""
from PIL import Image, ImageDraw, ImageFont
import json, os

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, "screenshots")
os.makedirs(OUT, exist_ok=True)

def mfont(size=14):
    for n in ["/System/Library/Fonts/Menlo.ttc", "/System/Library/Fonts/SFMono-Regular.otf"]:
        try:
            return ImageFont.truetype(n, size)
        except Exception:
            pass
    return ImageFont.load_default()

def mbold(size=14):
    for n in ["/System/Library/Fonts/Menlo.ttc", "/System/Library/Fonts/SFMono-Bold.otf"]:
        try:
            return ImageFont.truetype(n, size)
        except Exception:
            pass
    return mfont(size)

BG = (13, 17, 23)
WHITE = (230, 237, 243)
DIM = (139, 148, 158)
GREEN = (63, 185, 80)
BLUE = (88, 166, 255)
PURPLE = (188, 140, 255)
YELLOW = (210, 153, 34)
ORANGE = (255, 123, 58)
CYAN = (57, 211, 215)
PINK = (255, 107, 129)
RED = (248, 81, 73)
HEADER_BG = (22, 27, 34)
BOX_BG = (30, 37, 46)
BORDER = (48, 54, 61)

W, H = 1100, 1380
img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)
f11 = mfont(11)
f12 = mfont(12)
f14 = mfont(14)
f16 = mfont(16)
b16 = mbold(16)
b18 = mbold(18)
b20 = mbold(20)

# Title
d.rectangle([0, 0, W, 50], fill=HEADER_BG)
d.text((20, 12), "How the Memory Vault & Link Graph Works", fill=WHITE, font=b20)

# SECTION 1: Three Approaches
y = 70
d.text((20, y), "Three Approaches to Agent Memory", fill=YELLOW, font=b18)
y += 30

cols = [
    (30, "Obsidian (Desktop App)", DIM, [
        ("Wikilinks:", PURPLE, "  [[note]] syntax"),
        ("Graph:", PURPLE, "      Visual node graph"),
        ("Dataview:", PURPLE, "    Query plugin"),
        ("Backlinks:", PURPLE, "   Built-in pane"),
        ("", None, ""),
        ("Problem:", RED, "    Closed source"),
        ("", RED, "           Agents can't use it"),
        ("", RED, "           Requires desktop app"),
    ]),
    (390, "PostgreSQL / Vector DB", DIM, [
        ("Storage:", BLUE, "    Structured tables"),
        ("Query:", BLUE, "      SQL / vector search"),
        ("Links:", BLUE, "      Foreign keys / joins"),
        ("Embeddings:", BLUE, " Semantic similarity"),
        ("", None, ""),
        ("Problem:", RED, "    Needs running DB"),
        ("", RED, "           Schema management"),
        ("", RED, "           Overkill for ~50 files"),
    ]),
    (750, "Dojo Memory Vault", GREEN, [
        ("Storage:", GREEN, "   Plain .md + YAML"),
        ("Query:", GREEN, "     memory-query.sh"),
        ("Links:", GREEN, "     Relative .md links"),
        ("Graph:", GREEN, "     .link-graph.json"),
        ("", None, ""),
        ("Win:", CYAN, "        Zero dependencies"),
        ("", CYAN, "           Any agent can read"),
        ("", CYAN, "           Git-versioned"),
    ]),
]

bw, bh = 320, 200
for cx, title, color, items in cols:
    d.rectangle([cx, y, cx + bw, y + bh], fill=BOX_BG, outline=color, width=2)
    d.text((cx + 10, y + 8), title, fill=color, font=b16)
    ly = y + 32
    for label, lc, val in items:
        if label:
            d.text((cx + 12, ly), label, fill=lc or DIM, font=f14)
            d.text((cx + 12 + f14.getlength(label), ly), val, fill=WHITE, font=f12)
        ly += 18

y += bh + 30

# SECTION 2: Data Flow
d.text((20, y), "Data Flow: How Memory Builds Over Time", fill=YELLOW, font=b18)
y += 35

flow = [
    ("1  SESSION START", CYAN, [
        "Agent reads memory/INDEX.md",
        "Queries: memory-query.sh --type pattern",
        "Reviews tasks/lessons.md",
        "Loads relevant decisions + preferences",
    ]),
    ("2  DURING WORK", BLUE, [
        "User corrects agent   ->  Log to lessons.md",
        "Arch decision made    ->  Write decisions/*.md",
        "Style preference      ->  Write preferences/*.md",
    ]),
    ("3  PROMOTION (auto)", PURPLE, [
        "Lesson hits 3+ occurrences?",
        "  YES -> obsidian-sync.sh promotes to patterns/",
        "  Pattern becomes permanent rule",
        "  Lesson marked: status: amended-to-skill",
    ]),
    ("4  SESSION END", GREEN, [
        "Write sessions/YYYY-MM-DD-summary.md",
        "Link to decisions, patterns referenced",
        "Run: link-index.sh  (rebuilds graph)",
        "Backlinks auto-injected into all files",
    ]),
]

for idx, (title, color, lines) in enumerate(flow):
    bx_h = 22 + len(lines) * 20 + 10
    d.rectangle([30, y, W - 30, y + bx_h], fill=BOX_BG, outline=color, width=2)
    d.text((45, y + 6), title, fill=color, font=b16)
    ly = y + 28
    for line in lines:
        d.text((55, ly), line, fill=WHITE, font=f14)
        ly += 20
    y += bx_h + 8
    if idx < len(flow) - 1:
        mid = W // 2
        d.line([(mid, y - 8), (mid, y + 2)], fill=DIM, width=2)
        d.polygon([(mid - 5, y - 2), (mid + 5, y - 2), (mid, y + 4)], fill=DIM)
        y += 8

y += 25

# SECTION 3: Link Graph Visual
d.text((20, y), "How the Link Graph Works", fill=YELLOW, font=b18)
y += 35

nodes_data = [
    ("s14", 180, y + 50, "sessions/2026-04-14", BLUE),
    ("s08", 180, y + 130, "sessions/2026-04-08", BLUE),
    ("dpg", 500, y + 130, "decisions/postgres", ORANGE),
    ("ddk", 500, y + 50, "decisions/docker-test", ORANGE),
    ("pap", 820, y + 90, "patterns/validate-api (5x)", PURPLE),
    ("pab", 820, y + 20, "patterns/no-abstraction (3x)", PURPLE),
]

node_map = {}
for key, nx, ny, label, color in nodes_data:
    nw, nh = 210, 35
    node_map[key] = (nx, ny, nw, nh)
    d.rounded_rectangle([nx - nw // 2, ny, nx + nw // 2, ny + nh], radius=6, fill=BOX_BG, outline=color, width=2)
    tw = f12.getlength(label)
    d.text((nx - tw / 2, ny + 9), label, fill=color, font=f12)

edges_data = [
    ("s14", "ddk", "decided", GREEN),
    ("s14", "pap", "applied", GREEN),
    ("s14", "pab", "promoted", CYAN),
    ("s08", "dpg", "decided", GREEN),
    ("s08", "pap", "discovered", GREEN),
]

for src, dst, label, color in edges_data:
    snx, sny, snw, snh = node_map[src]
    dnx, dny, dnw, dnh = node_map[dst]
    sx = snx + snw // 2
    sy = sny + snh // 2
    dx = dnx - dnw // 2
    dy = dny + dnh // 2
    d.line([(sx, sy), (dx, dy)], fill=color, width=2)
    d.polygon([(dx - 7, dy - 4), (dx - 7, dy + 4), (dx, dy)], fill=color)
    mx = (sx + dx) // 2
    my = (sy + dy) // 2 - 10
    d.text((mx - 20, my), label, fill=color, font=f11)

y += 190

# Legend
d.rectangle([30, y, W - 30, y + 50], fill=BOX_BG, outline=BORDER, width=1)
d.text((50, y + 5), "Forward links:", fill=GREEN, font=f14)
d.text((190, y + 5), "session -> decision/pattern", fill=WHITE, font=f12)
d.text((50, y + 25), "Backlinks:", fill=PINK, font=f14)
d.text((190, y + 25), "auto-generated reverse refs", fill=WHITE, font=f12)
d.text((550, y + 5), ".link-graph.json:", fill=CYAN, font=f14)
d.text((550, y + 25), "stores both directions, machine-queryable", fill=WHITE, font=f12)

y += 65

# SECTION 4: Summary
d.text((20, y), "Why Plain Markdown Beats a Database", fill=YELLOW, font=b18)
y += 30

rows = [
    ("[x]", "Obsidian", "Closed source, wikilinks invisible to agents", RED),
    ("[x]", "PostgreSQL", "Running DB, migrations, connection strings for ~50 notes?", RED),
    ("[x]", "Vector DB", "Great for search, overkill for structured decisions", RED),
    ("[+]", "Dojo Vault", "git commit = backup, any agent reads .md, link-index.sh = graph", GREEN),
]

for marker, name, desc, color in rows:
    d.text((40, y), marker, fill=color, font=b16)
    d.text((80, y + 1), name, fill=color, font=b16)
    d.text((220, y + 2), desc, fill=WHITE if color == GREEN else DIM, font=f12)
    y += 24

# Border
d.rectangle([0, 0, W - 1, H - 1], outline=BORDER, width=2)

out_path = os.path.join(OUT, "memory-vault-architecture.png")
img.save(out_path, "PNG")
print(f"Saved: {out_path} ({W}x{H})")
