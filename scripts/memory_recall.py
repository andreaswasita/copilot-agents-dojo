#!/usr/bin/env python3
"""Copilot Agents Dojo — Memory Recall (planning brief).

Surfaces prior decisions, patterns, and recent sessions relevant to a planning
topic, ranked and de-duped into a compact brief. This is the CLI/vault-path twin
of the `memory_recall` MCP tool: agents call it BEFORE writing a plan so past
knowledge compounds instead of being re-derived.

Single-pass scan of the memory vault. Pure stdlib (no PyYAML dependency) so it
runs in any CI. DOJO_ROOT-aware via the thin .sh/.ps1 wrappers.

Usage:
  python3 scripts/memory_recall.py [--topic TEXT] [--language LANG]
                                   [--file-type TYPE] [--limit N]

A blank topic still returns active decisions + recent context, but never dumps
the whole vault (an empty substring would otherwise match everything).
"""
from __future__ import annotations

import argparse
import os
import re
from dataclasses import dataclass, field
from pathlib import Path

MEMORY_FOLDERS = {
    "decisions": "decision",
    "patterns": "pattern",
    "preferences": "preference",
    "sessions": "session",
}
STALE_STATUSES = {"superseded", "retired", "deprecated"}


@dataclass
class Entry:
    slug: str
    type: str
    title: str
    date: str
    status: str
    tags: list[str]
    markdown: str


@dataclass
class Candidate:
    entry: Entry
    score: int = 0
    reasons: list[str] = field(default_factory=list)


def dojo_root() -> Path:
    env = os.environ.get("DOJO_ROOT")
    if env:
        return Path(env)
    return Path(__file__).resolve().parents[1]


def _parse_frontmatter(raw: str) -> tuple[dict[str, str], str]:
    """Minimal front-matter splitter. Returns (fields, body)."""
    if not raw.startswith("---"):
        return {}, raw
    parts = raw.split("\n")
    if parts[0].strip() != "---":
        return {}, raw
    fm_lines: list[str] = []
    body_start = None
    for i in range(1, len(parts)):
        if parts[i].strip() == "---":
            body_start = i + 1
            break
        fm_lines.append(parts[i])
    if body_start is None:
        return {}, raw
    fields: dict[str, str] = {}
    for line in fm_lines:
        m = re.match(r"^([A-Za-z0-9_-]+):\s*(.*)$", line)
        if m:
            fields[m.group(1)] = m.group(2).strip()
    body = "\n".join(parts[body_start:]).strip()
    return fields, body


def _parse_tags(value: str) -> list[str]:
    value = value.strip()
    # Strip a trailing inline comment.
    value = re.sub(r"\s+#.*$", "", value).strip()
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        if not inner:
            return []
        return [t.strip().strip('"').strip("'") for t in inner.split(",") if t.strip()]
    return [value.strip('"').strip("'")] if value else []


def _title(fields: dict[str, str], body: str, slug: str) -> str:
    if fields.get("title"):
        return fields["title"].strip('"').strip("'")
    m = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
    if m:
        return m.group(1).strip()
    return slug.split("/")[-1].replace("-", " ")


def _status(fields: dict[str, str]) -> str:
    raw = fields.get("status", "")
    # Strip inline comment (e.g. "accepted  # proposed | accepted").
    return re.sub(r"\s+#.*$", "", raw).strip().lower()


def load_entries(root: Path) -> list[Entry]:
    memory = root / "memory"
    entries: list[Entry] = []
    if not memory.is_dir():
        return entries
    for folder, type_name in MEMORY_FOLDERS.items():
        sub = memory / folder
        if not sub.is_dir():
            continue
        for path in sorted(sub.glob("*.md")):
            if path.name == "_template.md":
                continue
            try:
                raw = path.read_text(encoding="utf-8")
            except OSError:
                continue
            fields, body = _parse_frontmatter(raw)
            slug = f"{folder}/{path.stem}"
            entries.append(
                Entry(
                    slug=slug,
                    type=type_name,
                    title=_title(fields, body, slug),
                    date=fields.get("date", "").strip(),
                    status=_status(fields),
                    tags=_parse_tags(fields.get("tags", "")),
                    markdown=body,
                )
            )
    return entries


def _is_stale(e: Entry) -> bool:
    return e.status in STALE_STATUSES


def _first_meaningful_line(markdown: str) -> str:
    lines = [ln.strip() for ln in markdown.split("\n")]
    body = next((ln for ln in lines if ln and not ln.startswith("#")), None)
    if body is None:
        body = next((ln for ln in lines if ln), "")
    pick = re.sub(r"^#+\s*", "", body)
    return pick if len(pick) <= 140 else pick[:137] + "..."


def recall(
    entries: list[Entry],
    topic: str = "",
    language: str | None = None,
    file_type: str | None = None,
    limit: int = 10,
) -> list[Candidate]:
    q = topic.strip().lower()
    acc: dict[str, Candidate] = {}

    def bump(e: Entry, reason: str, pts: int) -> None:
        cur = acc.get(e.slug)
        if cur is None:
            cur = Candidate(entry=e)
            acc[e.slug] = cur
        if reason not in cur.reasons:
            cur.reasons.append(reason)
        cur.score += pts

    def by_date(e: Entry) -> str:
        return e.date or ""

    # Active decisions (status accepted, or missing => accepted).
    decisions = sorted(
        (e for e in entries if e.type == "decision" and (e.status or "accepted") == "accepted"),
        key=by_date,
        reverse=True,
    )
    for d in decisions[:3]:
        bump(d, "active decision", 3)

    # Context patterns.
    lang = language.lower() if language else None
    ftype = file_type.lower() if file_type else None
    if lang or ftype:
        for p in (e for e in entries if e.type == "pattern" and not _is_stale(e)):
            haystack = " ".join(
                [p.markdown.lower(), *[t.lower() for t in p.tags], p.title.lower()]
            )
            if lang and lang in haystack:
                bump(p, f"pattern: {lang}", 3)
            if ftype and ftype in haystack:
                bump(p, f"pattern: {ftype}", 3)

    # Recent sessions.
    sessions = sorted((e for e in entries if e.type == "session"), key=by_date, reverse=True)
    for s in sessions[:3]:
        bump(s, "recent session", 1)

    # Topic text match. Skip when blank (empty substring matches everything).
    if q:
        for e in entries:
            if _is_stale(e):
                continue
            if q in e.title.lower():
                bump(e, "matched title", 4)
            elif any(q in t.lower() for t in e.tags):
                bump(e, "matched tag", 3)
            elif q in e.markdown.lower():
                bump(e, "matched body", 2)

    ranked = sorted(
        acc.values(),
        key=lambda c: (-c.score, _neg_date(c.entry.date), c.entry.slug),
    )
    return ranked[: max(1, limit)]


def _neg_date(date: str) -> str:
    """Sort key making later dates come first under ascending sort."""
    # Invert each char so a lexicographically-later date sorts earlier.
    return "".join(chr(0x10FFFF - ord(ch)) for ch in (date or ""))


def render(topic: str, candidates: list[Candidate]) -> str:
    topic = topic.strip()
    if not candidates:
        return f'No prior memory found for "{topic}".' if topic else "No memory entries yet."
    header = (
        f'Recall for "{topic}" — {len(candidates)} item(s):'
        if topic
        else f"Recall — {len(candidates)} item(s):"
    )
    lines = [header]
    for c in candidates:
        e = c.entry
        lines.append(f"- [{e.type}] {e.slug} — {e.title}")
        lines.append(f"    why: {', '.join(c.reasons)}")
        excerpt = _first_meaningful_line(e.markdown)
        if excerpt:
            lines.append(f"    {excerpt}")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Recall prior memory for planning.")
    parser.add_argument("--topic", default="", help="Free-text topic of the work being planned")
    parser.add_argument("--language", default=None, help="e.g. typescript, python, go")
    parser.add_argument("--file-type", default=None, help="e.g. test, route, schema")
    parser.add_argument("--limit", type=int, default=10, help="Max items (default 10)")
    args = parser.parse_args(argv)

    entries = load_entries(dojo_root())
    candidates = recall(
        entries,
        topic=args.topic,
        language=args.language,
        file_type=args.file_type,
        limit=args.limit,
    )
    print(render(args.topic, candidates))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
