---
id: curated-session-entry
pursuit: build-cadence-v1
status: done
created: 2026-04-20
---

# Curated Session Entry & Session Awareness

## Actions
- [x] Define session context line format for each level
- [x] Design curated entry screen layout (information hierarchy, what shows vs. hides)
- [x] Update session entry: no-argument path generates curated entry with pursuit context
- [x] Update session entry: project-argument path shows pursuit context header before marker recap
- [x] Add leveraged priority extraction from most recent reflection file
- [x] Add 2-minute quick win detection (single-step trivial actions across active projects)
- [x] Add unprocessed thought count with triage prompt
- [x] Integrate reconciler flag summary (degrade gracefully if no flags)
- [x] Update recap.md to include session context line at top of output
- [x] Update mark.md to show pursuit-level context after saving marker
- [x] Update reflect workflow to show context line
- [x] Test all touchpoints against real build-cadence-v1 data

## Notes
This project combines two concerns that reinforce each other:

**1. Curated entry** — The moment of choosing what to work on is when
curation matters most. /select should show a prioritized view, not a
flat project list.

**2. Session awareness** — Sessions are internal (no explicit "session"
concept exposed to the user). The context line at key touchpoints makes
the current pursuit and project focus obvious without interrupting flow.

### Session context line format
```
build-cadence-v1 — 5/11 projects done | LP: "Fully functional Cadence..."
build-cadence-v1 / package-as-plugin — 0/7 DoD
Week 17 Reflect — Phase 1: Get Clear
```

### When context appears
- After `/do` (entering a project)
- At top of `/recap` output
- After `/mark` saves (pursuit-level context)
- After project completion (pursuit checkpoint)
- During `/cadence:reflect`
- After `/status` (already has its own format)
- NOT on every message — only at transitions and information commands

Soft dependency on implement-reconciler (done) for flag summary.

> **v3 note:** This project was completed during v2 using /select and
> Steward/Guide/Narrator/Orchestrator mode labels. In v3, /select became
> /do, sessions became internal, and mode labels were replaced by verb-based
> routing (/do, /brainstorm, /develop, /promote, /capture, /reflect).
