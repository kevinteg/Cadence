# Cadence — Product Vision (v2)

*The rhythm you return to.*

---

## What Cadence Is

A cognitive operating system that lives inside your terminal. One AI agent with
three modes — Steward, Guide, Narrator — that manages your attention, protects
your flow state, and generates the narrative of what you're building across work,
family, and personal growth.

Cadence replaces OmniFocus, scattered task lists, and the mental overhead of
remembering where you left off. Not by being a better task app, but by being an
active partner that holds your context across sessions and pursuits.

---

## The Core Loop

```
Enter session → Recap ("previously on...") → Flow state (silent, protected)
     → Breakpoint (nudges, quick wins, wellbeing) → Mark (save point)
     → Exit or switch → Next session picks up from marker
```

---

## Hierarchy

| Level | What it is | Example |
|-------|-----------|---------|
| **Pursuit** | An intentional commitment tied to your values | "Establish AI Test Framework at Nexthop" |
| **Project** | A scoped effort with a Definition of Done | "Stand Up CI Pipeline" |
| **Action** | The atomic thing you do | "Configure GitHub Actions workflow" |

Pursuits can be finite (has an end), ongoing (recurring maintenance), or someday
(aspirational). Projects range from substantial to trivial — anything needing
more than one action. When a project's Definition of Done is met, that's a
**milestone** — a moment of progress worth noting.

---

## Agent Modes

One agent, three behavioral modes:

### Steward (Background)
System-level awareness. Manages the entry experience, runs the reconciler,
handles triage. Never interrupts flow state. Surfaces information at natural
breakpoints.

### Guide (Session)
Session-level focus. Stays in context with the current project. Helps make
progress. Prompts for markers on exit. Protects flow by batching observations.

### Narrator (Writing)
Generates narratives from activity data. Standups, weekly reflections, blog
posts, 90-day reviews. Writes in the user's voice. Draws from markers,
reflections, and project history.

---

## The Weekly Ritual — Reflect (~30 min)

### Phase 1 — Get Clear
Process triage decisions, clear 2-minute items, review reconciler flags
(stalled waiting-for items, dormant projects, stale markers), confirm all
active projects are relevant.

### Phase 2 — Get Focused
Recap (system-generated) → Learn what worked → Triage your WIP → Commit to
ONE leveraged priority that defines next week's win.

Anchored to 6-month win cycles with a mid-cycle check-in.

---

## Key Behaviors

- **Curated session entry** — prioritized suggestions: most recent session,
  leveraged priority, active pursuits, 2-minute quick wins, pending thoughts
- **Thought capture with transparent triage** — voice-to-AI routing with full
  visibility into where things were filed and flagged uncertain decisions for review
- **The 2-minute rule** — trivial actions surfaced immediately rather than filed;
  cleared first during Reflect
- **WIP management** — visible pursuit count with active pushback when overextended
- **Markers** — save points that capture context for fast re-entry
- **Waiting-for with reconciler** — track delegated actions by person and expected
  date; reconciler flags stalled items, dormant projects, stale markers, and
  proposes structural improvements
- **Nudges** — batched at breakpoints, never during flow: wellbeing, team activity,
  quick wins, WIP warnings, reconciler flags
- **Narratives** — standup summaries, weekly reflections, blog posts, 90-day
  reviews — all generated from real activity data
- **Derived contexts** — inferred from signals (phone capture → @errands,
  Claude Code → @computer), no manual tagging required
- **Project automation** — delegate coding projects to autonomous execution;
  life projects stay human-driven
- **Structural coaching** — AI suggests pursuit/project names (verb + outcome),
  flags vague scoping, proposes reorganization based on behavior
- **Definition of Done as first-class checklist** — managed through conversation,
  completion is derived from checklist state

---

## People as a First-Class Concept

Actions tagged with people for delegation, waiting-for, and relationship context.
"Show me everything involving Sarah" is a natural query.

---

## Pursuit Lifecycle

```
active → someday → archived
   ↑        ↑
   └────────┘  (reactivate)
```

**Active**: Intend to make progress this cycle.
**Someday**: Aspirational, no commitment. Can have cue metadata (seasonal,
date-based, or default review cadence) so the reconciler surfaces them at
the right time.
**Archived**: Done or abandoned. Kept for narrative history.

---

## Technical Stack

- **Local-first** — SQLite + markdown on your machines
- **CLI-native** — lives inside Claude Code or similar agentic tools
- **TypeScript** for integrations and MCP servers
- **Python** for RAG and AI pipelines
- **Three-tier isolation** — sandbox / production / work environments per-repo
- **Transparent AI** — every triage, narrative, and suggestion is reviewable
  and correctable

---

## Works on Bad Days Too

When you're overwhelmed, the Get Clear phase, reconciler, and 2-minute rule
ensure nothing falls through the cracks. The system is your safety net, not
just your inspiration.

---

## Who It's For

Technical leaders juggling high-stakes work, a growing team, family, personal
projects, and a career transition — people who are productive but disoriented,
who finish weeks unable to articulate what moved forward.

---

*Cadence — one voice, one rhythm, one system that holds the whole story.*
