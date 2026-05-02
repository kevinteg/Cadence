# Cadence — Reference

Loaded on-demand by skills that need format details, CLI specifics,
lifecycle mechanics, or operational recipes. The lean runtime at
`cadence-runtime.md` carries the attention-shaping content; this file
carries the rest.

## Verb Catalogue

Cadence's surface is 17 verbs grouped by cognitive mode. Use the group
to find the right verb for what you're doing right now; consult each
verb's `SKILL.md` or `/cadence:help <verb>` for its full contract.

### Diverge — find what to build

| Verb | Purpose |
|---|---|
| `brainstorm` | Divergent ideation. Generate quantity. Find what the Pursuit is. |
| `develop` | Convergent evaluation on Ideas: PPCo, criteria, pre-mortems. Decide what to commit to. |
| `promote` | Advance an Idea through the pipeline. Enforces the graduation gate (Why for Pursuit, Intent for Project, Concreteness for Action). |

### Execute — do the work

| Verb | Purpose |
|---|---|
| `start` | Open a project's view (Intent + actions + first unchecked). View-only — no session ceremony. |
| `complete` | Mark an action done. First check promotes on_hold → active. Triggers upward completion prompts. |
| `cancel` | Drop a project with a reason. Not completion — it didn't succeed or is no longer relevant. |
| `capture` | Flow-safe parking lot. Get a thought out of your head, zero friction, no agent response. |
| `waiting` | Record an external blocker so it's tracked, not forgotten. |

### Reflect — see meaning, check state

| Verb | Purpose |
|---|---|
| `reflect` | Weekly ritual: Get Clear, then Get Focused. See the whole picture. Set one Leveraged Priority. |
| `narrate` | Generate the story (today, week, or pursuit-arc) from activity data. Make meaning visible. |
| `close` | Run the closure ritual for a project or pursuit. Resolves unresolved Ideas. |
| `reconcile` | Quiet on-demand report of system health (stale state, aging Ideas, dormant projects). |

### Setup — one-off

| Verb | Purpose |
|---|---|
| `init` | Bootstrap a new repo for Cadence. One-time per repo. |

### Browse — navigation

| Verb | Purpose |
|---|---|
| `status` | System dashboard with contextual next-step hints, or drill into pursuits / projects / actions. Each drill ends with an action menu showing the verbs applicable to the viewed entity. |
| `find` | Search across projects, ideas, captures, and pursuits by case-insensitive substring. Results grouped by kind with per-group verb hints so any result is directly actionable. |

### Discovery flow

If you're new to Cadence and unsure where to start:

1. `/cadence:status` — read the dashboard's contextual hints
2. Follow a hint into a pursuit (`/cadence:status <id>` or numbered) to see its projects + the pursuit-level action menu
3. Pick a project (`/cadence:status <project-id>`) to see its Intent, Actions, and the project-level action menu
4. Use the verb the action menu suggests (`/cadence:start`, `/cadence:complete`, etc.)

`/cadence:help` renders this catalogue inline; `/cadence:help <verb>`
shows a single verb's contract.

## File Operations

- All paths are relative to this repo root.
- Frontmatter is YAML between `---` fences.
- Dates use ISO 8601. Timestamps in filenames use `YYYY-MM-DDTHH-MM`.
- IDs are slug-case: lowercase, hyphens, no special characters.
- Generated files (`_manifest.md`, `.cadence.db`) are gitignored.

## File Formats

All file formats use YAML frontmatter between `---` fences followed by
markdown content. The key formats are:

- **Pursuit** (`pursuit.md`): frontmatter with id, type, status, created,
  optional why
- **Project** (`<id>.md`): frontmatter with id, pursuit, status, created,
  optional waiting_for; sections for Intent, Actions, Notes. Older
  project files still carry a `Definition of Done` section instead of
  Intent — that's a historical shape, parsed but not emitted for new
  projects.
- **Idea** (`<id>.md`): frontmatter with id, parent, state, created,
  optional developed_at, promoted_to, closed_reason
- **Capture** (`<timestamp>.md`): frontmatter with captured, verb_context;
  raw input. Lives in `thoughts/unprocessed/`.
- **Reflection** (`<YYYY-MM-DD>.md`): frontmatter with date, status, phase,
  leveraged_priority; sections for Get Clear and Get Focused
- **Narrative** (`<cadence>-<period>.md` in `narratives/drafts/`):
  frontmatter with cadence, generated_at, consumed_from_commit,
  consumed_through_commit, projects_consulted; body is McAdams prose.
  The frontmatter doubles as a watermark — the next /narrate run for
  the same cadence reads the latest narrative and resumes from its
  consumed_through_commit. Historical session markers (legacy
  `pursuits/*/sessions/*.md`) may exist in older repos; they are
  preserved on disk but no longer read or written by any verb.

## CLI Subcommand Catalog

Skills invoke `cadence <subcommand> [--json]` directly — see the
runtime's "Bundled CLI" section for framing. This catalog is the full
list.

### Read subcommands

`scan`, `report`, `status`, `flags`, `pursuits`, `pursuit <id>`,
`project <id>`, `ideas`, `captures`, `find <query>`,
`project-activity`. All accept `--json` for structured output. Skills
consume `--json` and reason over the typed result; the human-readable
default is for the user invoking the CLI directly during an AI outage.

`project-activity` is the stream `/narrate` consumes — git log of
`pursuits/**/projects/*.md` rendered as a per-project event list.
Supports `--scope` (daily/weekly/monthly/annual/pursuit) and
`--since-commit <hash>` for watermark-based resume.

### Write subcommands

`create-pursuit <id>`, `create-project <id>`, `create-idea <id>`,
`write-capture`, `write-reflection`,
`set-status <project-id>`, `set-idea-state <idea-id>`,
`check <project-id>`, `add-item <project-id>`,
`add-waiting-for <project-id>`, `flag-waiting-for <project-id>`,
`move-pursuit <id>`. Each performs one well-formed mutation and emits
JSON describing what was written. Use these in preference to direct
Edit/Write — they enforce schema, generate timestamps, and keep
frontmatter formatting consistent.

If the bin is missing, skills fall back to manual file scanning and
direct Write per their internal fallback notes.

## Intent and Actions

A project carries an **Intent** narrative and an **Actions** list. They
play different roles and shouldn't be merged or confused:

- **Intent = motivation + felt-sense of done.** Free-form prose at the
  top of the project body. Describes what the user wants, why it
  matters, and what success would feel like. Initially a brain dump;
  the agent co-edits it down as actions land and the work focuses.
  Read against the question "does this feel achieved yet?" — not "is
  every line checked?"
- **Actions = atomic tasks.** Concrete imperative moves the user or
  agent can visualize doing. Examples: "Edit src/foo.ts to add the
  bar handler", "Run npm test", "Update README example".

The older model carried a Definition-of-Done checklist alongside
Actions. In practice it functioned as a second action list with extra
bookkeeping — the "are we done?" question didn't get cleaner from
checkbox sweeping. The new model removes it: Intent absorbs both the
"why" and the "what done feels like"; Actions remain the only
checklist. Done-ness is judged through dialogue against Intent.

Existing project files keep their `## Definition of Done` sections as
historical record. New projects emit `## Intent` instead. The CLI's
scan/report path tolerates both shapes.

## Idea Lifecycle

Ideas are a first-class collection adjacent to the work hierarchy. Every
Idea has a parent — either a pursuit or a project. Ideas without a clear
parent are placed on Wandering with an auto-generated name. The parent
field uses the same ID convention as projects (e.g., `parent:
build-cadence-v1` for a pursuit, `parent:
build-cadence-v1/implement-reconciler` for a project).

**States:**
- **seed** — raw, captured during brainstorm, unevaluated
- **developed** — has been through `/develop` (PPCo, criteria, pre-mortem)
- **promoted** — advanced to Pursuit, Project, or Action (origin link persists)
- **moved** — reattached to a different parent (resolved — the idea found its home)
- **closed** — killed with a reason (what did this idea teach us?)

**Closure rules:** A pursuit or project can be closed when it has no
ideas in `seed` or `developed` state. Ideas in `promoted`, `moved`, or
`closed` state are resolved. Moving an idea counts as resolution only if
the target is an active pursuit or project.

## Pursuit Lifecycle

- **Active** pursuits live in `pursuits/<id>/`
- **Someday** pursuits live in `pursuits/_someday/<id>/`
- **Archived** pursuits live in `pursuits/_archived/<id>/`
- **Wandering** lives in `pursuits/wandering/` — never closes
- Moving between states is a file move (git mv)
- Someday pursuits can have cue metadata in frontmatter for reconciler
  surfacing

## Creating a Project

When the user describes new work, ask:
1. Which pursuit does this belong to? (suggest if obvious)
2. What's the Intent? (motivation, scope, what "done" would feel like —
   take a brain dump, expand it slightly if the picture is unclear,
   tighten it later as actions land; see "Intent and Actions" above)
3. What's the first action? If the user doesn't have one ready, default
   to `Brainstorm and add concrete actions for this project`. The
   project earns its action list as the work clarifies.

**WIP check before creating:** Read `snapshot.projects` and
`snapshot.config` from `cadence scan --json`. Count in-progress projects
(`status: active` AND `hasMarker: true`). If at or above
`config.max_active_projects`, warn: "You have [N] in-progress projects
(limit: [max]). Consider finishing or pausing one before adding more."
The user can override — this is a guardrail, not a gate.

Create the project file via the CLI:
```bash
cadence create-project <slug> --pursuit <pursuit-id> \
  --intent "<the Intent narrative>" \
  --action "<first action>" --action "<second action>"
```

`--action` is repeatable — pass several at once when the user names
multiple first moves. To add more actions after creation, prefer the
bulk variant:
```bash
cadence add-items <slug> --pursuit <pursuit-id> --section action \
  --text "<...>" --text "<...>"
```

Do not pass `--dod` / `--dod-checked` for new projects — they are
legacy flags retained only for parsing existing files.

The CLI rejects creation with zero actions and defaults the new project
to `status: on_hold`. The project promotes to `active` when the first
action is checked off via `cadence check` (or `/complete`). This keeps
backlog projects out of the WIP count until they're actually being
worked on.

## Completing a Project

Triggered by `/complete` when the last action is checked. The mutating
command (`cadence check` or `cadence check-items`) returns the
post-mutation `actionProgress` directly — read it from the response
to decide whether to prompt; do not re-fetch the project.

1. System prompts: "All actions checked. Does the intent feel achieved?
   Complete this project, add more actions, or split?"
2. **Complete:** update `status: done` via
   `cadence set-status <id> --status done --include-pursuit`. The
   `--include-pursuit` flag returns the pursuit summary in the same
   response — read `result.pursuit.allResolved` for the upward check
   without a separate `cadence pursuit` call. Note the milestone — this
   is worth acknowledging.
3. **Add more actions:** use `cadence add-items --section action`
   (bulk) for each new action; project stays active.
4. **Split:** existing project goes to `done` or `dropped` with a
   reason; new project(s) created via `cadence create-project` for the
   remaining work, each carrying its own Intent.
5. **Pursuit checkpoint** — after the project resolves, present:
   - Pursuit progress: [N done] / [M total] projects
   - Remaining active projects (with action progress)
   - On-hold projects that might be ready to activate
   - Suggest what to work on next based on leveraged priority and
     dependencies
   - Ask: "Want to open [suggested project], or stop here for now?"

## Waiting For

Track external blockers in project frontmatter as structured data:
```yaml
waiting_for:
  - person: name
    what: description
    expected: YYYY-MM-DD
    flagged: false
```
Add items via `/waiting`. The reconciler sets `flagged: true` when an
item passes its expected date by `waiting_for_grace_days`.

## Captures

When the user dumps a raw thought mid-flow via `/capture`, save it to
`thoughts/unprocessed/` with no response. Captures are triaged into
Ideas or Actions at the next breakpoint or during Reflect. Flag
uncertain routing for human review.

## Tip Library

The tip library at `cadence-plugin/tips/library.yaml` holds curated
content the agent surfaces at appropriate breakpoints — quotes,
skill-teaching tooltips, and contextual verb hints. The library design
honors the "smart-colleague-marginalia, not motivational-poster" tone
target documented in `docs/teaching-tips-research.md`, and frequency
caps prevent over-rotation from turning the surface into wallpaper.

### Schema

```yaml
# cadence-plugin/tips/library.yaml
version: 1
tips:
  - id: <kebab-case-id>             # required, unique
    type: quote | skill-teaching | verb-hint   # required
    content: |                       # required, the body of the tip
      <one or two short lines>
    attribution: <author, source>    # required for type: quote
    triggers: [<tag1>, <tag2>, ...]  # required, fires when ANY active context matches
    tone: framing | directive | diagnostic | structural   # default: structural
    frequency:
      cool_down_minutes: <int>       # min minutes between consecutive shows; default 60
      cool_down_days: <int>          # min days between shows; default 0
      lifetime_max: <int>            # rare; total times shown ever; default unbounded
    weight: low | normal | high      # tie-breaker when multiple tips match; default normal
    tags: [<topic1>, <topic2>]       # informational; useful for filtering
```

### Content types

| Type | Purpose | Example |
|---|---|---|
| `quote` | Brain-tickler quotes from the curated library — non-sappy, smart-colleague tone. Surfaces during long agent runs and at breakpoints. Requires `attribution`. | "Your mind is for having ideas, not holding them." — David Allen |
| `skill-teaching` | Tooltip-style verb explanations. Surfaces when natural language maps to a verb, or after teaching-eligible actions. | "Running `/cadence:resolve` — this marks projects done. Next time, type `/resolve <project>` directly." |
| `verb-hint` | Contextual next-step suggestions. Surfaces at the natural exit of a verb. | "Next: `/cadence:start <project>` to open the view, or `/cadence:brainstorm` to seed actions." |

### Trigger tag taxonomy

Triggers are open-vocabulary string tags. Skills register which tags
are active at a given moment; the tip-selection layer queries the
library for entries whose `triggers` include any active tag.
Conventional namespacing:

| Prefix | Meaning | Examples |
|---|---|---|
| `verb-` | Fires during or after a specific verb | `verb-promote-pursuit`, `verb-resolve`, `verb-narrate` |
| `ritual-` | Fires during a ritual phase | `ritual-reflect-get-clear`, `ritual-reflect-get-focused`, `ritual-pursuit-close` |
| `state-` | Fires when a system state holds | `state-pursuit-near-completion`, `state-wip-over-limit`, `state-aging-seed` |
| `moment-` | Fires at temporal breakpoints | `moment-long-agent-run`, `moment-end-of-day`, `moment-week-closing` |
| `discovery` | Fires when natural language maps to a verb (teaching footer pattern) | `discovery` |
| `idle` | Generic loading-screen pull when no specific context applies | `idle` |

New tags can be added by skill code without library schema changes.
The library schema is open by design — keep the registered-tags list
in this section informal so additions are friction-free.

### Tone

The `tone` field guides selection by context, not by content. Long
agent runs prefer `framing` (a quote to chew on while waiting); post-verb
moments prefer `directive` (a clear next move); reconciler flags prefer
`diagnostic` ("consider whether X"); operational prompts default to
`structural` ("Open editor at file Y"). The agent picks tips matching
the desired tone for the active context.

### Frequency model

The frequency model uses cool-down windows rather than session boundaries
(Sessions are not a Cadence primitive — the project file IS the durable
state). A tip can fire when ALL of:

- `now - last_shown >= cool_down_minutes`
- `now - last_shown >= cool_down_days * 86400`
- `show_count < lifetime_max` (if set)

The "per_session" feel is achieved with `cool_down_minutes: 60` (won't
fire twice in the same hour) or longer. Long-running-agent interjections
that should feel like a surprise gift use `cool_down_days: 7`.

### State tracking

Show history lives at `.cadence/tip-state.json` (gitignored, per-repo):

```json
{
  "version": 1,
  "tips": {
    "<tip-id>": {
      "show_count": <int>,
      "last_shown": "<ISO-8601 timestamp>"
    }
  }
}
```

The CLI exposes `cadence tip status` (show recent activity + which tips
are eligible right now) and `cadence tip reset --match <id-substring>`
(clear state for testing or repeating a tip).

### Editor's guidelines

When adding tips to the library:

- Follow the **smart-colleague-marginalia** tone target — never
  motivational-poster, never sappy, never streak-flavored.
- For `quote` entries, attribute precisely (author, source); paraphrase
  is OK but mark it as such.
- Pick `triggers` thoughtfully — a tip that fires on too many tags
  becomes wallpaper.
- Default `cool_down_days` to at least 7 for `quote` entries; longer
  for verbose ones.
- When in doubt, set lower `weight` so the tip doesn't dominate
  selection in its trigger contexts.
