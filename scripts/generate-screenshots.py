#!/usr/bin/env python3
"""Generate LinkedIn-ready screenshots for the memory vault."""
from PIL import Image, ImageDraw, ImageFont
import json
import os

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(REPO, "screenshots")
os.makedirs(OUT_DIR, exist_ok=True)

# ─── Colors ───
BG = (13, 17, 23)          # GitHub dark bg
TEXT = (230, 237, 243)      # Light text
DIM = (139, 148, 158)       # Dim text
GREEN = (63, 185, 80)       # Folder green
BLUE = (88, 166, 255)       # File blue
PURPLE = (188, 140, 255)    # Links purple
YELLOW = (210, 153, 34)     # JSON keys
ORANGE = (255, 123, 58)     # Values
CYAN = (57, 211, 215)       # Brackets
PINK = (255, 107, 129)      # Accent
BORDER = (48, 54, 61)       # Borders
HEADER_BG = (22, 27, 34)    # Header bg

def get_font(size=16):
    for name in ["/System/Library/Fonts/Menlo.ttc",
                 "/System/Library/Fonts/SFMono-Regular.otf",
                 "/Library/Fonts/SF-Mono-Regular.otf"]:
        try:
            return ImageFont.truetype(name, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()

def get_bold_font(size=16):
    for name in ["/System/Library/Fonts/Menlo.ttc",
                 "/System/Library/Fonts/SFMono-Bold.otf"]:
        try:
            return ImageFont.truetype(name, size)
        except (OSError, IOError):
            continue
    return get_font(size)

# ═══════════════════════════════════════════════════════════
# IMAGE 1: Memory Vault Folder Structure
# ═══════════════════════════════════════════════════════════
def render_tree():
    font = get_font(15)
    bold = get_bold_font(15)
    title_font = get_bold_font(18)
    small = get_font(12)

    lines = [
        ("  memory/", GREEN, "                          # 🧠 Persistent Knowledge Graph", DIM),
        ("  ├── INDEX.md", BLUE, "              # Map of Content — agents read first", DIM),
        ("  ├── .link-graph.json", CYAN, "      # Machine-readable link graph (auto)", DIM),
        ("  ├── decisions/", GREEN, "           # Architectural decisions with context", DIM),
        ("  │   ├── postgres-over-dynamodb.md", BLUE, "", None),
        ("  │   ├── test-isolation-docker.md", BLUE, "", None),
        ("  │   └── _template.md", DIM, "", None),
        ("  ├── patterns/", GREEN, "            # Proven rules (auto-promoted from lessons)", DIM),
        ("  │   ├── validate-api-responses.md", PURPLE, "   ⚡ 5 occurrences", ORANGE),
        ("  │   ├── test-edge-cases-first.md", PURPLE, "    ⚡ 4 occurrences", ORANGE),
        ("  │   ├── no-premature-abstraction.md", PURPLE, " ⚡ 3 occurrences", ORANGE),
        ("  │   └── _template.md", DIM, "", None),
        ("  ├── preferences/", GREEN, "         # Learned from your corrections", DIM),
        ("  │   ├── descriptive-names.md", PINK, "        confidence: high", GREEN),
        ("  │   ├── structured-logging.md", PINK, "       confidence: medium", YELLOW),
        ("  │   └── _template.md", DIM, "", None),
        ("  └── sessions/", GREEN, "            # Session summaries with links", DIM),
        ("      ├── 2026-04-08-api-refactor.md", BLUE, "", None),
        ("      ├── 2026-04-10-auth-module.md", BLUE, "", None),
        ("      ├── 2026-04-14-notification-service.md", BLUE, "", None),
        ("      └── _template.md", DIM, "", None),
    ]

    W, line_h = 820, 26
    header_h = 50
    stats_h = 45
    H = header_h + len(lines) * line_h + stats_h + 40

    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Header bar
    draw.rectangle([0, 0, W, header_h], fill=HEADER_BG)
    draw.text((20, 14), "📂 Memory Vault — Folder Structure", fill=TEXT, font=title_font)

    # Tree lines
    y = header_h + 12
    for main_text, main_color, comment, comment_color in lines:
        draw.text((16, y), main_text, fill=main_color, font=font)
        if comment:
            draw.text((16 + font.getlength(main_text), y), comment, fill=comment_color or DIM, font=small)
        y += line_h

    # Stats bar
    y += 8
    draw.rectangle([0, y - 4, W, H], fill=HEADER_BG)
    stats = "📊  11 files  •  11 links  •  2 decisions  •  3 patterns  •  2 preferences  •  3 sessions"
    draw.text((20, y + 6), stats, fill=GREEN, font=small)

    # Border
    draw.rectangle([0, 0, W-1, H-1], outline=BORDER, width=2)

    img.save(os.path.join(OUT_DIR, "memory-vault-tree.png"), "PNG")
    print(f"✅ Saved: screenshots/memory-vault-tree.png ({W}x{H})")

# ═══════════════════════════════════════════════════════════
# IMAGE 2: Link Graph JSON
# ═══════════════════════════════════════════════════════════
def render_graph():
    font = get_font(14)
    bold = get_bold_font(14)
    title_font = get_bold_font(18)
    small = get_font(11)

    with open(os.path.join(REPO, "memory", ".link-graph.json")) as f:
        graph = json.load(f)

    # Build colored JSON lines
    json_lines = []

    def add(text, color):
        json_lines.append((text, color))

    add("{", CYAN)
    add(f'  "generated": "{graph["generated"]}",', DIM)
    add(f'  "total_files": {graph["total_files"]},', TEXT)
    add(f'  "total_links": {graph["total_links"]},', TEXT)
    add('  "forward_links": {', YELLOW)

    fl = graph["forward_links"]
    fl_keys = list(fl.keys())
    for i, key in enumerate(fl_keys):
        targets = fl[key]
        comma = "," if i < len(fl_keys) - 1 else ""
        if len(targets) == 1:
            add(f'    "{key}": ["{targets[0]}"]{comma}', BLUE)
        else:
            add(f'    "{key}": [', BLUE)
            for j, t in enumerate(targets):
                tc = "," if j < len(targets) - 1 else ""
                add(f'      "{t}"{tc}', PURPLE)
            add(f'    ]{comma}', BLUE)

    add("  },", YELLOW)
    add('  "back_links": {', YELLOW)

    bl = graph["back_links"]
    bl_keys = list(bl.keys())
    for i, key in enumerate(bl_keys):
        sources = bl[key]
        comma = "," if i < len(bl_keys) - 1 else ""
        if len(sources) == 1:
            add(f'    "{key}": ["{sources[0]}"]{comma}', ORANGE)
        else:
            add(f'    "{key}": [', ORANGE)
            for j, s in enumerate(sources):
                sc = "," if j < len(sources) - 1 else ""
                add(f'      "{s}"{sc}', PINK)
            add(f'    ]{comma}', ORANGE)

    add("  }", YELLOW)
    add("}", CYAN)

    W = 780
    line_h = 20
    header_h = 50
    H = header_h + len(json_lines) * line_h + 30

    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([0, 0, W, header_h], fill=HEADER_BG)
    draw.text((20, 14), "🔗 memory/.link-graph.json", fill=TEXT, font=title_font)

    # JSON lines
    y = header_h + 10
    for text, color in json_lines:
        draw.text((16, y), text, fill=color, font=font)
        y += line_h

    # Border
    draw.rectangle([0, 0, W-1, H-1], outline=BORDER, width=2)

    img.save(os.path.join(OUT_DIR, "link-graph-json.png"), "PNG")
    print(f"✅ Saved: screenshots/link-graph-json.png ({W}x{H})")

if __name__ == "__main__":
    render_tree()
    render_graph()
    print("\n🎯 Both screenshots saved to screenshots/ — ready for LinkedIn!")
