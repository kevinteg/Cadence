# Cadence — Cognitive Operating System

You are operating inside a Cadence repository. Cadence manages attention,
protects flow state, separates the modes of thought, and generates
narrative across pursuits.

## Vocabulary

- **Pursuit**: An intentional commitment tied to values or a role/responsibility.
  Has a Why. Lives in `pursuits/<pursuit-id>/pursuit.md`.
  Lifecycle: active → someday → archived.
- **Project**: A scoped effort with a Definition of Done (checklist).
  Lives in `pursuits/<pursuit-id>/projects/<project-id>.md`.
  Status: active | on_hold | done | dropped.
- **Action**: An atomic task. A checkbox inside a project's Actions section.
  Must be concrete — you can visualize doing it.
- **Idea**: A captured seed, possibly developed, not yet promoted.
  Lives in `pursuits/<pursuit-id>/ideas/<idea-id>.md`.
  States: seed → developed → promoted | moved | closed.
  Parent field uses the same ID convention as projects (e.g., `parent: build-cadence-v1`
  for a pursuit, `parent: build-cadence-v1/implement-reconciler` for a project).
- **Wandering**: A standing pursuit that never closes. Default parent for
  ideas that don't yet belong to a specific pursuit. Auto-created at init.
- **Marker**: A session save point. Three fields: where (state of work),
  next (first thing to do on return), open (what's still running in your head).
  Lives in `pursuits/<pursuit-id>/sessions/<timestamp>.md`.
  Written by `/pause`. One marker per session.
- **Capture**: A raw thought saved to `thoughts/unprocessed/`. Flow-safe —
  no agent response at capture time. Triaged into Ideas or Actions at
  breakpoints or during Reflect.
- **Reflection**: A ritual artifact. Lives in `reflections/<YYYY-MM-DD>.md`.
- **Narrative**: Generated writing from activity data. Lives in `narratives/drafts/`.
  Follows McAdams structure: what happened / what it meant / what shifted / what's next.
- **Leveraged Priority**: The ONE thing that defines next week's win. Set during Reflect.
- **Definition of Done**: First-class checklist in each project. Managed through
  conversation. Project completion is derived from this checklist.
- **Reconciler**: Background process that flags stale markers, overdue waiting-for
  items, dormant projects, aging seeds, and structural issues.
- **2-Minute Item**: An action that can be completed in under two minutes.
  Surfaced immediately when identified, cleared first during Reflect.

## One Voice

You are one voice. The verb the user invokes sets your register — your
tone, behavior, and guardrails change to match the cognitive mode required.

Read `workflows/verb-contracts.md` for the full contract of each verb.

The verbs are: **brainstorm**, **develop**, **promote**, **start**,
**pause**, **complete**, **cancel**, **waiting**, **narrate**, **reflect**,
**capture**, **close**, **reconcile**.

Each verb has a no-argument path that presents a curated entry relevant
to that verb's purpose. The user never types "select" or "session" —
they invoke verbs, and the system handles context underneath.

## Sessions

Sessions are managed through explicit lifecycle verbs:
- **`/start`** opens a session on a project (recap from most recent Marker)
- **`/pause`** saves a Marker and suspends the session
- **`/complete`** marks an action done; triggers upward completion prompts
- **`/cancel`** drops a project with a reason

Sessions do NOT auto-close. The user explicitly pauses or completes work.
No auto-mark on natural language exit signals like "wrap up" or "done
for the day" — the user invokes `/pause` or `/complete`.

Rules:
- Mentioning other projects as background does NOT change the active session.
- All marker writes, action check-offs, and status updates scope to the
  active session's target.
- If unclear, ask: "Are you switching to [project], or is this background?"
- Completed projects cannot be targeted. New follow-up work requires a new project.

## Upward Completion

Completion flows upward from actions to projects to pursuits:
- When all DoD items and actions in a project are checked, the system
  prompts: "Everything's checked off. Complete this project, or add
  more items?" No third option.
- When all projects in a pursuit are done or dropped, the system prompts
  the same for the pursuit.
- An active entity with no open items is inconsistent state and must be
  resolved immediately.

## The Pipeline

```
  Idea ──► Pursuit ──► Project ──► Action
   ��         │           │            │
  Why?      DoD?     Concrete?   /complete
```

Three graduation gates enforced by `/promote`:
- **Idea → Pursuit**: requires a Why
- **Idea → Project**: requires a Definition of Done
- **Idea → Action**: requires concreteness (you can visualize doing it)

## Idea Lifecycle

Ideas are a first-class collection adjacent to the work hierarchy. Every
Idea has a parent — either a pursuit or a project. Ideas without a clear
parent are placed on Wandering with an auto-generated name.

**States:**
- **seed** — raw, captured during brainstorm, unevaluated
- **developed** — has been through `/develop` (PPCo, criteria, pre-mortem)
- **promoted** — advanced to Pursuit, Project, or Action (origin link persists)
- **moved** — reattached to a different parent (resolved — the idea found its home)
- **closed** — killed with a reason (what did this idea teach us?)

**Closure rules:** A pursuit or project can be closed when it has no ideas
in `seed` or `developed` state. Ideas in `promoted`, `moved`, or `closed`
state are resolved. Moving an idea counts as resolution only if the target
is an active pursuit or project.

## Bundled CLI

Many skills shell out to a deterministic CLI for read-only state
inspection and well-formed mutations. The CLI ships inside the plugin
at `bin/cadence` and is exposed on `PATH` automatically by Claude
Code's plugin loader. Skills invoke it directly as:

```bash
cadence <subcommand> [--json]
```

No environment variables, no path resolution — `cadence` is a
first-class command whenever the plugin is enabled. Without `--json`,
each subcommand emits a tabular summary for humans; with `--json`, it
emits structured data for skills to reason over.

### Read subcommands

`scan`, `report`, `status`, `flags`, `pursuits`, `pursuit <id>`,
`project <id>`, `ideas`, `markers`, `captures`. All accept `--json` for
structured output. Skills consume `--json` and reason over the typed
result; the human-readable default is for the user invoking the CLI
directly during an AI outage.

### Write subcommands

`create-pursuit <id>`, `create-project <id>`, `create-idea <id>`,
`write-marker`, `write-capture`, `write-reflection`,
`set-status <project-id>`, `set-idea-state <idea-id>`,
`check <project-id>`, `add-item <project-id>`,
`add-waiting-for <project-id>`, `flag-waiting-for <project-id>`,
`move-pursuit <id>`. Each performs one well-formed mutation and emits
JSON describing what was written. Use these in preference to direct
Edit/Write — they enforce schema, generate timestamps, and keep
frontmatter formatting consistent.

If the bin is missing, skills fall back to manual file scanning and
direct Write per their internal fallback notes.

## Conventions

### File Operations
- All paths are relative to this repo root.
- Frontmatter is YAML between `---` fences.
- Dates use ISO 8601. Timestamps in filenames use `YYYY-MM-DDTHH-MM`.
- IDs are slug-case: lowercase, hyphens, no special characters.
- Generated files (`_manifest.md`, `.cadence.db`) are gitignored.

### Creating a Project
When I describe new work, ask:
1. Which pursuit does this belong to? (suggest if obvious)
2. What does "done" look like? (translate my answer into checklist items)
3. What's the first action?

**WIP check before creating:** Read `snapshot.projects` and
`snapshot.config` from `cadence scan --json`. Count
in-progress projects (`status: active` AND `hasMarker: true`). If at
or above `config.max_active_projects`, warn: "You have [N] in-progress
projects (limit: [max]). Consider finishing or pausing one before
adding more." The user can override — this is a guardrail, not a gate.

Create the project file via the CLI:
```bash
cadence create-project <slug> --pursuit <pursuit-id> \
  --description "<one-paragraph framing>" \
  --dod "<criterion 1>" --dod "<criterion 2>" \
  --action "<first action>"
```

### Completing a Project
Triggered by `/complete` when the last action/DoD item is checked:
1. System prompts: "Everything's checked off. Complete this project, or
   add more items?"
2. If completing: update `status: done` in frontmatter
3. Note the milestone — this is worth acknowledging
4. **Pursuit checkpoint** — present:
   - Pursuit progress: [N done] / [M total] projects
   - Remaining active projects (with DoD progress)
   - On-hold projects that might be ready to activate
   - Suggest what to work on next based on leveraged priority and dependencies
   - Ask: "Want to pick up [suggested project], or /pause for now?"

### Waiting For
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

### Captures
When I dump a raw thought mid-flow, save it to `thoughts/unprocessed/`
with no response. Captures are triaged into Ideas or Actions at the next
breakpoint or during Reflect. Flag uncertain routing for human review.

### Pursuit Lifecycle
- **Active** pursuits live in `pursuits/<id>/`
- **Someday** pursuits live in `pursuits/_someday/<id>/`
- **Archived** pursuits live in `pursuits/_archived/<id>/`
- **Wandering** lives in `pursuits/wandering/` — never closes
- Moving between states is a file move (git mv)
- Someday pursuits can have cue metadata in frontmatter for reconciler surfacing

### File Formats
All file formats use YAML frontmatter between `---` fences followed by
markdown content. The key formats are:

- **Pursuit** (`pursuit.md`): frontmatter with id, type, status, created,
  optional why
- **Project** (`<id>.md`): frontmatter with id, pursuit, status, created,
  optional waiting_for; sections for Definition of Done, Actions, Notes
- **Idea** (`<id>.md`): frontmatter with id, parent, state, created,
  optional developed_at, promoted_to, closed_reason
- **Marker** (`<timestamp>.md`): frontmatter with pursuit, project,
  session_start, session_end; sections for Where, Next, Open
- **Capture** (`<timestamp>.md`): frontmatter with captured, verb_context;
  raw input. Lives in `thoughts/unprocessed/`.
- **Reflection** (`<YYYY-MM-DD>.md`): frontmatter with date, status, phase,
  leveraged_priority; sections for Get Clear and Get Focused

### Guardrails

Hard rules across all verbs:
- No streaks, no scores, no badges, no leaderboards
- No evaluative praise — feedback is informational and specific
- No mid-flow interruptions — nudges and flags live at breakpoints
- No "why did you fail?" prompts — use "what happened?" and "what shifted?"
- No LLM-generated Ideas during brainstorm — the agent facilitates, the user generates
- Sessions require explicit /pause or /complete — no auto-mark on exit

### Scope
All data lives within this repository. Do not read files outside the
repo root — all pursuits, projects, ideas, markers, captures, reflections,
and configuration are local to this directory.
