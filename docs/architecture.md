# Cadence Architecture

*Decisions made during the product definition and architecture sessions, April 2026.*

---

## Core Concepts

**Cadence** is a cognitive operating system that manages attention, protects flow
state, and generates narrative across all pursuits. It lives inside the terminal,
powered by an AI agent operating in three modes.

### Hierarchy

```
Pursuit  →  Project  →  Action
```

- **Pursuit**: An intentional commitment tied to values or a role/responsibility.
  Lifecycle: active → someday → archived.
- **Project**: A scoped effort with a Definition of Done (checklist).
  Status: active | on_hold | done | dropped.
- **Action**: An atomic task. A checkbox inside a project file.

### Agent Modes

One agent, three behavioral modes — not separate agents:

| Mode | When | Behavior |
|------|------|----------|
| **Steward** | System-level: /recap, /status, /reflect | Read full state, route to work, surface what matters |
| **Guide** | Session-level: working on a project | Stay in context, protect flow, prompt for markers |
| **Narrator** | Writing mode: narratives, reflections, blogs | Draw from markers and history, write in user's voice |

### Session Lifecycle

```
Enter → Recap ("previously on...") → Flow state (silent, protected)
    → Breakpoint (nudges, quick wins) → Mark (save point)
    → Exit or switch → Next session picks up from marker
```

### Session Levels

Sessions exist at three levels of the hierarchy:

| Level | Session character | Marker captures |
|-------|------------------|----------------|
| **Project** | Deep work, single focus, flow state | Technical context — where in the code, what I was thinking, what's next |
| **Pursuit** | Coordination, multiple projects touched | Strategic context — which projects moved, what's blocked, trajectory |
| **Orchestrator** | Reflect, triage, cross-pursuit review | Meta context — the reflection artifact IS the marker |

---

## Persistence Model

### Hybrid: Markdown + SQLite Cache

- **Markdown is the source of truth** for all human-authored content
- **SQLite is a derived index** rebuilt from markdown on change
- Direction is always markdown → SQLite, never bidirectional
- `cadence rebuild-index` regenerates SQLite from markdown in sub-second
- SQLite is gitignored — the repo is complete without it

### Why Hybrid

| Need | Markdown | SQLite |
|------|----------|--------|
| Human readability | ✓ | ✗ |
| Git-friendly diffs | ✓ | ✗ |
| Cross-cutting queries | ✗ (expensive) | ✓ |
| Reconciler scanning | ✗ (expensive) | ✓ |
| Narrative source | ✓ | ✗ |
| Manual fallback | ✓ | ✗ |

### Agent-Readable Manifests

Generated `_manifest.md` files at repo root and pursuit level provide
one-shot system state for agents. Agents read manifests for orientation,
hit SQLite (via CLI or MCP) only for cross-cutting queries.

Manifests are gitignored and regenerated alongside the index.

---

## File Formats

### Pursuit (`pursuit.md`)

```yaml
---
id: slug-name
type: finite | ongoing | someday
status: active | someday | archived
created: YYYY-MM-DD
target: YYYY-MM-DD          # optional, for finite pursuits
win_cycle: YYYY-HN          # optional
cue:                         # optional, for someday pursuits
  trigger: seasonal | date | review
  when: spring | YYYY-MM    # optional
  review: monthly | yearly  # default: monthly
---

# Pursuit Name

Description of the pursuit — why it matters, what it represents.
```

### Project (`<project-id>.md`)

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

**Key design decisions:**
- Definition of Done is a first-class checklist section, managed through conversation
- Project completion is derived: all DoD items checked → agent confirms → status: done
- Actions are simple checkboxes — no IDs, no metadata
- `waiting_for` is structured in frontmatter for indexer/reconciler queries
- Projects live as files; promoted to directories only when session markers accumulate

### Marker (session save point)

```yaml
---
pursuit: pursuit-id
project: project-id          # optional — omit for pursuit-level sessions
session_start: ISO-8601
session_end: ISO-8601
actions_completed: []        # optional
actions_in_progress: []      # optional
---

# Marker: Project or Pursuit Name

## Where I Was
[2-5 sentences of context]

## What I Was Thinking
[Decisions being considered, open questions, gut feelings]

## What's Next
1. [Concrete next step]
2. [Follow-up step]

## Loose Threads
- [Things noticed but not acted on]
```

### Thought (captured idea)

```yaml
---
captured: ISO-8601
source: voice | text | agent
---

Raw input text.

# Triage (pending)

**AI suggestion:**
1. "action description" → routing suggestion (confidence: high|medium|low)
```

### Reflection (weekly ritual artifact)

```yaml
---
week: YYYY-WNN
status: draft | in_progress | complete
phase: get_clear | get_focused    # where you stopped if in_progress
leveraged_priority: "text"        # null until Get Focused completes
leveraged_priority_achieved: null  # set in next week's reflection
---

# Week NN Reflection

## Get Clear
<!-- status: complete | in_progress | not_started -->
[sections as defined in reflect workflow]

## Get Focused
<!-- status: complete | in_progress | not_started -->
[sections as defined in reflect workflow]
```

**Key insight:** The reflection file IS the orchestrator's marker. Partial
completion is visible in the file itself — no separate checkpoint needed.

---

## Repo Structure

```
cadence/
├── CLAUDE.md                      # Agent entry point
├── .claude/commands/              # Slash commands for workflows
├── cadence.yaml                   # Global config
├── .cadence.db                    # SQLite index (gitignored)
├── _manifest.md                   # System snapshot (gitignored)
├── docs/                          # Reference documentation
├── pursuits/
│   ├── <pursuit-id>/
│   │   ├── pursuit.md
│   │   ├── _manifest.md           # Pursuit snapshot (gitignored)
│   │   ├── projects/
│   │   │   └── <project-id>.md
│   │   └── sessions/
│   │       └── <timestamp>.md     # Markers
│   ├── _someday/
│   │   └── <pursuit-id>/pursuit.md
│   └── _archived/
│       └── <pursuit-id>/pursuit.md
├── thoughts/
│   ├── unprocessed/
│   └── processed/
├── reflections/
├── narratives/drafts/
├── workflows/                     # Workflow definitions (extensible)
└── src/                           # Engine code (future)
```

### Path Conventions

- All paths relative to repo root
- Timestamps in filenames: `YYYY-MM-DDTHH-MM`
- IDs are slug-case: lowercase, hyphens, no special characters
- Directories prefixed with `_` are lifecycle states: `_someday/`, `_archived/`
- Files prefixed with `_` are generated/gitignored: `_manifest.md`

---

## Tooling Architecture

### Evolution Path: Skills → CLI → MCP

**Phase 1 (now):** Pure skills. Agent reads/writes markdown directly, guided
by CLAUDE.md and slash commands. Zero dependencies.

**Phase 2 (weeks 2-3):** Extract CLI. Operations that are too slow or
error-prone as agent skills become `cadence` CLI commands. Skills updated
to call CLI instead of doing file parsing.

**Phase 3 (if needed):** MCP server wrapping the CLI for structured data
exchange and real-time index updates.

### Agent Integration

- **Claude Code**: CLAUDE.md + `.claude/commands/` slash commands
- **Codex CLI**: AGENTS.md (generated from CLAUDE.md) + bash CLI commands
- **Other agents**: Read CLAUDE.md conventions, use CLI tooling

### SQLite Schema (derived index)

| Table | Source | Key queries |
|-------|--------|-------------|
| pursuits | pursuit.md frontmatter | Active list, WIP count |
| projects | project.md frontmatter + DoD | Per-pursuit status, completion %, stale |
| actions | project.md Actions section | Next actions, velocity |
| waiting_for | project.md frontmatter | Cross-system waiting, overdue |
| markers | session file frontmatter | Most recent per project/pursuit, stale |
| thoughts | thought file frontmatter | Unprocessed count |
| reflections | reflection frontmatter | Last reflect, leveraged priority |

---

## Design Principles

1. **Local-first** — SQLite + markdown on your machines, no cloud dependencies
2. **Markdown is the source of truth** — if the index breaks, rebuild it
3. **The artifact IS the state** — reflection files, markers, project files carry their own status
4. **Completion is derived** — DoD all checked → project done, confirmed by agent
5. **Git operations are lifecycle operations** — `git mv` to someday, `git rm` to delete
6. **Workflows are soft** — defined in markdown, editable, swappable
7. **Agent-agnostic** — skills + CLI work with any tool that reads files and runs commands
8. **Flow protection** — nudges batch at breakpoints, never interrupt deep work
