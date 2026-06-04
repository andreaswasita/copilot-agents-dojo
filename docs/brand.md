# Copilot Agents Dojo — Brand & Style Guide

> *A discipline framework for your GitHub Copilot agents.*
> This guide keeps the repo's look, voice, and docs consistent over time. One file. Tasteful, accessible, low-maintenance.

---

## 1. Wordmark

**Copilot Agents Dojo 🏯**

- Always title-case the three words. The 🏯 (Japanese castle) is the signature mark — use it in the H1 hero and the social preview, sparingly elsewhere.
- Short form in body copy: **the Dojo**. Never "CAD" or "the dojo framework."
- One-line value prop (canonical): *A discipline framework for your GitHub Copilot agents.*

## 2. Palette

Reused directly from the existing README badge row — no new colors introduced.

| Token | Hex | Use |
|-------|-----|-----|
| dojo-blue | `#1f6feb` | Primary. Links, primary badges, heading accents |
| dojo-green | `#3fb950` | Success, "done", version/passing badges |
| dojo-amber | `#f59e0b` | Attention, curator/self-improving, callouts |
| dojo-violet | `#8b5cf6` | Tiers, taxonomy, structural labels |
| dojo-teal | `#14b8a6` | Personas/agents, secondary accents |
| ink | `#0d1117` | Text on light / bg on dark (GitHub-native) |

Accessibility: all palette colors meet WCAG AA (4.5:1) on GitHub's light and dark backgrounds. Never encode meaning in color alone — pair with a label or icon.

## 3. Voice & tone

- **Disciplined, not preachy.** The dojo metaphor is the throughline: train, drill, discipline, gate, belt — used with a light hand, never cheesy.
- **Direct and active.** "Run `verify.sh` as the single gate." Not "verify.sh can be run as a gate."
- **Confident, concrete, measurable.** Prefer numbers and named artifacts ("26 skills", "single gate") over adjectives.
- **Respect the reader's time.** Scannable first, prose second.

Avoid: hype words (revolutionary, game-changing), apologetic hedging, emoji clutter.

## 4. Emoji usage

- Allowed as section signposts and the 🏯 signature — at most one per heading, never mid-sentence in body copy.
- Keep a consistent set; don't invent new ones per doc. Reuse what the README already establishes.

## 5. Markdown conventions

- One H1 per doc (the title/hero). Sentence-case section headings.
- Tables for any 3+ parallel items. Fenced code blocks with a language hint.
- Every image needs descriptive alt text. Every internal link relative, verified non-broken.
- Badges: `flat-square` style, palette hexes above, lowercase labels.
- Line length: wrap prose naturally; don't hard-wrap at a column.

## 6. Do / Don't quick reference

| Do | Don't |
|----|-------|
| Reuse the 6 palette tokens | Introduce ad-hoc colors |
| One signpost emoji per heading | Sprinkle emoji in sentences |
| "the Dojo" in body copy | Acronyms or invented short forms |
| Numbers + named artifacts | Vague superlatives |
| Alt text on every image | Decorative images with no alt |

---

*Maintained by CMO. Changes to this guide ship via PR after CEO sign-off, like everything else.*
