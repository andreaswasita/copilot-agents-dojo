# Copilot Agents Dojo 🥋

<p align="center">
  <img src="images/dojo-banner.png" alt="Copilot Agents Dojo" width="100%">
</p>

**Your AI agents are untrained. Time to put them through the dojo.**

Most teams using GitHub Copilot agents let them run wild — no discipline, no form, no kata. Drop a prompt, hope for the best, clean up the wreckage. That's not engineering. That's sparring with a blindfold on.

This dojo contains two training scrolls that turn reckless agents into disciplined black belts:

## The Training Scrolls

### [`skills.md`](skills.md) — The Six Disciplines
The core kata. Copilot agents auto-discover this scroll and train on these disciplines:

- **🥋 Plan before striking** — No wild swings. Agents plan multi-step work before touching code. Discipline over impulse.
- **🥋 Deploy your students** — A master delegates. Subagents handle research and parallel analysis. Keep the main dojo clean.
- **🥋 Learn from every fall** — After every correction, agents capture the lesson. A true practitioner never repeats the same mistake.
- **🥋 Prove your technique** — No kata is complete without demonstration. Tests, logs, diffs — show your work or it didn't happen.
- **🥋 Pursue elegant form** — Brute force is for beginners. Challenge hacky solutions. Seek the clean strike.
- **🥋 Fix what's broken, solo** — Reproduce, diagnose, fix, verify. A black belt doesn't ask the sensei to tie their belt.

### [`.github/copilot-instructions.md`](/.github/copilot-instructions.md) — The Dojo Rules
The house rules that every agent follows when they enter your repo:

- Code standards — your stack, your style, your way (TypeScript strict, Tailwind, Vitest as example)
- Behavioral governance summary linking back to the disciplines
- Task management workflow: plan → track → verify → capture lessons

## Why Train Your Agents?

Untrained agents:
- Rush in without a plan — all offense, no strategy
- Never learn from their losses
- Throw sloppy patches instead of finding the root cause
- Declare victory without proof
- Flood the context window like an undisciplined sparring partner

Trained agents operate like **seasoned black belts** — plan the approach, execute with precision, verify the outcome, learn from every round.

## Enter the Dojo

1. **Place `skills.md` at your repo root** — Copilot agents auto-discover this scroll and begin training immediately
2. **Place `.github/copilot-instructions.md`** in your `.github/` folder — customize the Code Standards for your fighting style
3. **Create `tasks/todo.md`** and `tasks/lessons.md` — the training journal where agents plan and record lessons
4. **Watch the transformation** — your agents will plan before coding, verify before bowing out, and grow stronger after every session

## The Dojo Layout

```
your-repo/
├── skills.md                          # The Six Disciplines (auto-discovered)
├── .github/
│   └── copilot-instructions.md        # The Dojo Rules
└── tasks/
    ├── todo.md                        # Battle plan
    └── lessons.md                     # Defeat log & prevention techniques
```

## Choose Your Fighting Style

The Code Standards section is just one style. Adapt the dojo to your discipline:

- **Python** 🐍: pytest, Black, type hints, FastAPI/Django conventions
- **Java** ☕: JUnit, Spring Boot patterns, Maven/Gradle standards
- **Go** 🐹: standard library conventions, table-driven tests
- **.NET** 🛡️: xUnit, clean architecture, nullable reference types

The Six Disciplines in `skills.md` are **style-agnostic** — they work for any language, any framework, any team.

## Origin Story

Forged in real-world AI delivery. These disciplines emerged from running agents across production projects and learning what separates chaotic AI-assisted development from disciplined, battle-tested delivery.

---

**⭐ Star this dojo** if you're done babysitting your AI agents. Fork it, train your agents, earn your belt.
