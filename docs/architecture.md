# Cadence Architecture

*Definitive technical reference for the Cadence cognitive operating system.*

---

## Core Concepts

**Cadence** is a cognitive operating system that manages attention, protects
flow state, and generates narrative across pursuits. It lives inside the
terminal as a Claude Code plugin. One agent, one voice, verb-defined behavior.

### Work Hierarchy

```
Pursuit  →  Project  →  Action
```

- **Pursuit**: An intentional commitment tied to values or a role/responsibility.
  Lifecycle: active, someday, archived.
- **Project**: A scoped effort with a Definition of Done checklist.
  Status: active, on_hold, done, dropped.
- **Action**: An atomic task. A checkbox inside a project's Actions section.

### Ideas (Adjacent Collection)

Ideas are a first-class collection that lives alongside the work hierarchy,
not inside it. Every Idea has a parent (pursuit or project) and flows
through its own lifecycle: seed, developed, promoted, moved, closed.

Ideas enter the hierarchy through graduation gates enforced by `/promote`:

| Gate | Requirement | Enters Hierarchy As |
|------|-------------|---------------------|
| **Why** | Articulate why this matters | Pursuit |
| **DoD** | Define what "done" looks like | Project |
| **Concreteness** | Specific enough to start | Action |

### Wandering

**Wandering** is a standing pursuit that never closes. It holds unattached
Ideas — things worth capturing that do not yet belong anywhere. During
Reflect, Wandering Ideas are reviewed and either graduated, moved to a
pursuit, or closed.

---

## Voice Model

One voice, not three modes. The agent's behavior is defined by the active
**verb**, not a declared mode. Each verb has a contract specifying tone,
behavior, and guardrails. Contracts live in `workflows/verb-contracts.md`.

### Verbs

| Verb | Purpose |
|------|---------|
| **brainstorm** | Provoke thinking using the card deck. The LLM does NOT generate ideas — it deals cards and asks questions. |
| **develop** | Help the user articulate why an Idea matters. Deepen, challenge, connect. |
| **promote** | Graduate a developed Idea to a Project with DoD and first actions. |
| **start** | Session-level focus on a specific project. Protect flow. Keep work moving. |
| **pause** | Save a marker and suspend the session. |
| **complete** | Mark an action done. Trigger upward completion when all DoD items are checked. |
| **cancel** | Drop a project with a reason. Walk the cleaning ritual for Ideas. |
| **narrate** | Generate writing from activity data. Draw from markers and history. |
| **reflect** | Run the weekly ritual. Surface what matters across the whole system. |
| **capture** | Save a raw thought. Flow-safe — no agent response beyond confirmation. |
| **close** | Walk the closure ritual for a project or pursuit. |
| **reconcile** | Background scan for stale markers, overdue items, dormant projects, structural issues. |
| **status** | Show system dashboard or drill into pursuits, projects, and actions. |

Each verb has a **no-argument curated entry path** — invoking the verb
with no arguments presents a contextual starting point rather than demanding
the user specify what to work on.

---

## Two Processes

Work flows through two distinct processes: divergent thinking feeds into
convergent execution.

### Diverge (Ideas → Hierarchy)

```
capture → brainstorm → develop → promote
  seed       seed      developed   ──┐
                                     ├─► Pursuit (with Why)
                                     ├─► Project (with DoD)
                                     └─► Action  (concrete)
```

Ideas can be **moved** to a different parent or **closed** with a reason
at any point. Ideas can also enter at any stage if they arrive with
enough shape.

### Converge (Execution)

```
start → work → complete / pause
  │                │        │
  │                │        └─► marker saved, session suspended
  │                └─► action done, upward completion check
  └─► session opened, marker loaded, flow protected
```

When all DoD items are checked, the system triggers upward completion:
project closes, then pursuit closure is prompted if all projects are
done or dropped. `/cancel` drops a project with a reason and walks the
cleaning ritual for remaining Ideas.

---

## Entity Formats

### Pursuit (`pursuits/<pursuit-id>/pursuit.md`)

```yaml
---
id: slug-name
type: finite | ongoing | someday
status: active | someday | archived
created: YYYY-MM-DD
why: optional free text
---

# Pursuit Name

Description of the pursuit — why it matters, what it represents.
```

### Project (`pursuits/<pursuit-id>/projects/<project-id>.md`)

```yaml
---
id: slug-name
pursuit: parent-pursuit-id
status: active | on_hold | done | dropped
created: YYYY-MM-DD
waiting_for:                 # optional
  - person: name
    what: description
    expected: YYYY-MM-DD
    flagged: false
---

# Project Name

## Definition of Done
- [ ] Concrete criterion 1
- [ ] Concrete criterion 2

## Actions
- [x] Completed action
- [ ] Next action

## Notes
Free-form notes, context, decisions.
```

Project completion is derived: all DoD items checked, confirmed by agent,
status set to done. Actions are simple checkboxes — no IDs, no metadata.

### Idea (`pursuits/<pursuit-id>/ideas/<idea-id>.md`)

```yaml
---
id: slug-name
parent: pursuit-id            # or pursuit-id/project-id
state: seed | developed | promoted | moved | closed
created: YYYY-MM-DD
developed_at: YYYY-MM-DD     # optional, set when developed
promoted_to: project-id      # optional, set when promoted
closed_reason: text           # optional, set when closed
---

# Idea Title

Raw content, development notes, connections.
```

### Marker (`pursuits/<pursuit-id>/sessions/<timestamp>.md`)

```yaml
---
pursuit: pursuit-id
project: project-id
session_start: ISO-8601
session_end: ISO-8601
---

# Marker: Project Name

## Where
State of the work. What exists, what changed, what's true right now.

## Next
The first thing to do on return. A ready-to-resume plan, not a wish list.

## Open
What's still running in your head. Unresolved questions, hunches, tensions.
```

One marker per session. Written by `/pause`. If paused mid-session and
then paused again, the same file is updated rather than creating a new one.

### Capture (`thoughts/unprocessed/<timestamp>.md`)

```yaml
---
captured: ISO-8601
verb_context: seed | concern | note
---

Raw input text exactly as provided.
```

Flow-safe: no agent response beyond minimal confirmation. Typed by verb
context. Triaged at breakpoints or during Reflect.

### Reflection (`reflections/<YYYY-MM-DD>.md`)

```yaml
---
date: YYYY-MM-DD
status: draft | in_progress | complete
phase: get_clear | get_focused
leveraged_priority: "text"
---

# Reflection — YYYY-MM-DD

## Get Clear
[sections as defined in reflect workflow]

## Get Focused
[sections as defined in reflect workflow]
```

---

## Session Lifecycle

Sessions are **internal mechanics** — the user invokes verbs, sessions
happen underneath. The user never types "session" or "select."

### Flow

```
User invokes /start (or /start <project>)
    │
    ▼
Agent resolves context (no-arg entry path or specified target)
    │
    ▼
Agent loads latest marker for the project (if applicable)
    │
    ▼
Work happens — agent follows the verb contract
    │
    ▼
User invokes /pause, /complete, or /cancel
    │
    ▼
Next /start picks up from the marker
```

### Rules

- `/start` opens a session. `/pause` suspends it. `/complete` marks actions
  done and triggers upward completion. `/cancel` drops a project.
- The marker's **Next** field is the contract with your future self: what
  to do first when you come back.
- Mentioning other projects does not change session context.
- If context is ambiguous, the agent asks rather than guessing.

---

## WIP Limits

| Entity | Limit |
|--------|-------|
| Pursuits | No limit |
| Projects | `max_active_projects` (in-progress with markers, default 5) |
| Ideas | No limit |

The `max_active_projects` threshold is set in `cadence.yaml`. The reconciler
flags violations but does not block work.

---

## Closure

### Project Closure

When all Definition of Done items are checked, the agent walks the closure
ritual. If the user wants to close a project with incomplete DoD items,
an **override with reason** is required — the reason is recorded.

### Pursuit Closure

Pursuit closure is an **absolute block** if unresolved Ideas exist (Ideas
in seed or developed state under that pursuit). All Ideas must be promoted,
moved to another parent, or closed with a reason before the pursuit can
close. This ensures nothing is silently dropped.

Both project and pursuit closure walk a cleaning ritual: review remaining
items, acknowledge what was done, handle loose ends.

---

## Provocation Deck

A curated YAML file at `cadence-plugin/deck/` containing prompt cards in
these categories:

- **oblique** — lateral thinking prompts
- **scamper** — substitute, combine, adapt, modify, put to other use, eliminate, reverse
- **how-might-we** — reframe problems as opportunities
- **forced-analogy** — connect unrelated domains
- **challenge** — question assumptions

Used by `/brainstorm`. The LLM deals cards and provokes — it does **not**
generate Ideas. Ideas come from the user. The deck is a fixed resource,
not dynamically generated.

---

## Narratives

Generated from activity data (markers, project completions, reflections).
Follow McAdams narrative identity structure:

1. **What happened** — events and actions
2. **What it meant** — interpretation and significance
3. **What shifted** — changes in understanding or direction
4. **What's next** — forward trajectory

Narratives are **informational, not evaluative**. No praise, no judgment,
no performance framing. They help the user see their own story.

---

## Directory Structure

```
cadence/
├── CLAUDE.md                      # Agent instructions
├── cadence.yaml                   # Global config (max_active_projects, etc.)
├── .cadence.db                    # SQLite index (gitignored)
├── docs/                          # Reference documentation
├── pursuits/
│   ├── <pursuit-id>/
│   │   ├── pursuit.md
│   │   ├── projects/
│   │   │   └── <project-id>.md
│   │   ├── ideas/
│   │   │   └── <idea-id>.md
│   │   └── sessions/
│   │       └── <timestamp>.md     # Markers
│   ├── wandering/                 # Standing pursuit for unattached Ideas
│   │   ├── pursuit.md
│   │   └── ideas/
│   ├── _someday/
│   │   └── <pursuit-id>/pursuit.md
│   └── _archived/
│       └── <pursuit-id>/pursuit.md
├── thoughts/
│   └── unprocessed/               # Raw captures awaiting triage
├── reflections/
├── narratives/
│   └── drafts/
├── workflows/                     # Verb contracts, reflect ritual, reconciler
└── cadence-plugin/                # Claude Code plugin package
    ├── .claude-plugin/
    ├── cadence-runtime.md         # Plugin runtime instructions
    ├── cadence.yaml               # Plugin config
    ├── skills/                    # Verb implementations as skills
    ├── deck/                      # Provocation card deck (YAML)
    └── workflows/                 # Plugin-specific workflow definitions
```

### Path Conventions

- All paths relative to repo root.
- Timestamps in filenames: `YYYY-MM-DDTHH-MM`.
- IDs are slug-case: lowercase, hyphens, no special characters.
- Directories prefixed with `_` are lifecycle states: `_someday/`, `_archived/`.
- Dates use ISO 8601.

---

## Persistence Model

### Hybrid: Markdown + SQLite

- **Markdown is the source of truth** for all content.
- **SQLite is a derived index** rebuilt from markdown on change.
- Direction is always markdown to SQLite, never bidirectional.
- SQLite is gitignored — the repo is complete without it.

### Why Hybrid

| Need | Markdown | SQLite |
|------|----------|--------|
| Human readability | Yes | No |
| Git-friendly diffs | Yes | No |
| Cross-cutting queries | No (expensive) | Yes |
| Reconciler scanning | No (expensive) | Yes |
| Narrative source | Yes | No |
| Manual fallback | Yes | No |

### Plugin Model

Cadence ships as a **Claude Code plugin**. Skills live in
`cadence-plugin/skills/`. Runtime instructions in
`cadence-plugin/cadence-runtime.md`. Install via `--plugin-dir`.

The plugin provides verb-based skills that the agent invokes. Each skill
reads the verb contract, operates on markdown files, and follows the
guardrails defined in the contract.

---

## Design Principles

1. **Local-first** — Markdown + SQLite on your machine. No cloud dependencies.
2. **Markdown is the source of truth** — If the index breaks, rebuild it.
3. **The artifact IS the state** — Markers, reflections, and project files carry their own status.
4. **Completion is derived** — DoD all checked, confirmed by agent, status set to done.
5. **Git operations are lifecycle operations** — `git mv` to someday, archival is a file move.
6. **Verbs define behavior** — No mode announcements. The verb contract governs tone and guardrails.
7. **Flow protection** — No mid-flow interruptions. Batch observations for breakpoints.
8. **No gamification** — No streaks, scores, badges, leaderboards, or evaluative praise.
9. **No "why did you fail?" prompts** — Reflection is forward-looking, not interrogative.
10. **Ideas come from the user** — The LLM provokes and develops. It does not generate Ideas in brainstorm.
11. **Sessions are invisible** — The user invokes verbs. Sessions are internal mechanics.
12. **Workflows are soft** — Defined in markdown, editable, swappable.
