# Cadence — Reference

Loaded on-demand by skills that need format details, CLI specifics,
lifecycle mechanics, or operational recipes. The lean runtime at
`cadence-runtime.md` carries the attention-shaping content; this file
carries the rest.

## Verb Catalogue

Cadence's user-facing surface is 12 verbs grouped by cognitive mode.
Use the group to find the right verb for what you're doing right now;
consult each verb's `SKILL.md` or `/cadence:help <verb>` for its full
contract.

### Diverge — find what to build

| Verb | Purpose |
|---|---|
| `brainstorm` | Divergent ideation in a first-class workspace at `brainstorms/<slug>/`. Phase machine: `diverging → converging → crystallized | archived`. `--crystallize` materializes a Pursuit or Project from the chosen solution. |

### Execute — do the work

| Verb | Purpose |
|---|---|
| `start` | Universal work-entry verb. Argument shape selects what opens: no arg → curated menu across pursuits, open projects, brainstorms, Inbox; `<pursuit>` → pursuit workspace view (Why, LP alignment, attached projects + brainstorms + Inbox slice); `<project>` → project view; `<brainstorm-slug>` → resume the workspace at its phase; `inbox` (reserved keyword) → walk untriaged items oldest-first with the outcome menu; `brainstorm` (reserved keyword) → forward to `/cadence:brainstorm`. View-only — no session ceremony. |
| `complete` | Mark an action done. First check promotes on_hold → active. Triggers upward completion prompts. |
| `resolve` | Wrap up a project or pursuit. `resolve <project> --state complete` (default) walks the intent-feel-achieved dialogue; `--state dropped` requires a reason. `resolve <pursuit>` walks the closure ritual (absolute block on unresolved work — open projects + active brainstorms), then routes to `pursuits/_archived/` (completed) or `pursuits/_dropped/` (with reason). |
| `capture` | Flow-safe parking lot. Get a thought out of your head, zero friction, no agent response. |
| `waiting` | Record an external blocker so it's tracked, not forgotten. |

### Reflect — see meaning, check state

| Verb | Purpose |
|---|---|
| `reflect` | Weekly ritual: Get Clear, then Get Focused. See the whole picture. Set one Leveraged Priority. |
| `narrate` | Generate the story (today, week, or pursuit-arc) from activity data. Make meaning visible. |

### Setup — one-off

| Verb | Purpose |
|---|---|
| `init` | Bootstrap a new repo for Cadence. One-time per repo. |

### Browse — navigation

| Verb | Purpose |
|---|---|
| `status` | System dashboard, navigation-led: a one-line "This week" framing, per-active-pursuit tables of open projects (with status / actions / first-sentence Intent), Active Brainstorms and On Hold Pursuits tables when applicable, a "Heads up" prose block (Inbox + validations + flag summary), and "Likely next moves" — up to 3 priority-ranked verb suggestions with rationale. Drill-down (`status <pursuit>` / `status <project>`) opens the entity view; each drill ends with an action menu. |
| `find` | Search across projects, captures, and pursuits by case-insensitive substring. Results grouped by kind with per-group verb hints so any result is directly actionable. |
| `help` | Render this catalogue inline, or a single verb's contract. |

### System behavior (not a verb)

| Behavior | When it runs |
|---|---|
| `reconciler` | Automatically at SessionStart hook (every fresh session); during `/reflect` Get Clear; on demand via the `cadence flags` CLI subcommand for power users. Surfaces stale state, dormant projects, structural issues — no longer a user-facing verb. |

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
  optional waiting_for, optional `domain` (`physical` | `digital` |
  `hybrid` — overrides the keyword heuristic in `src/scan/domain.ts`,
  used by `/brainstorm` (crystallize) and `/complete` to adapt their prompts; leave
  unset to use detection), optional `origin` (see below); sections for
  Intent, Actions, Notes. Older project files still carry a
  `Definition of Done` section instead of Intent — that's a historical
  shape, parsed but not emitted for new projects. The CLI exposes
  `detected_domain` (heuristic) and `effective_domain`
  (override-or-detected) on the project JSON output.

  The `origin` field captures where a project came from, as a
  discriminated union by `kind`. Today only `github_issue` is wired
  end-to-end (written by `/cadence:incoming`'s promote path; consumed
  by `cadence set-status` and `cadence check` to close or label the
  linked issue on lifecycle transitions). Shape:

  ```yaml
  origin:
    kind: github_issue
    repo: owner/name
    number: 42
    url: https://github.com/owner/name/issues/42
  ```

  The union is designed to extend to additional kinds (`url`,
  `capture`, `brainstorm`, etc.) without re-engineering the
  frontmatter. See `src/types.ts` `OriginSchema`. The CLI shorthand
  `cadence create-project --origin-issue owner/repo#42` constructs
  the github_issue shape from `repo#number`; the URL is derived.
- **Capture** (`<timestamp>.md`): raw or distilled input under
  `thoughts/unprocessed/`. Two frontmatter shapes coexist; the
  scanner reads either:

  **v1 (legacy, default for inline `/cadence:capture "..."`):**

  ```yaml
  ---
  captured: 2026-05-22T14:30:00
  verb_context: note               # optional
  mcp:                             # optional — set by mcp-pull
    server: glean
    uri: glean://doc/abc
    mime_type: text/markdown
    content_hash: sha256:abc123...
  ---

  <body>
  ```

  **v2 (emitted when any v2 flag is set on `cadence write-capture`,
  including `--from`, `--source-*`, `--prompt`, `--status`,
  `--two-minute-eligible`, `--triaged-to`, `--suggested-outcomes`,
  or `--schema-version 2`):**

  ```yaml
  ---
  captured: 2026-05-22T14:30:00
  verb_context: mcp-pull:glean      # optional
  schema_version: 2
  status: untriaged                  # untriaged | triaged | discarded
  two_minute_eligible: false         # optional, defaults to absent
  triaged_to: null                   # optional; e.g., "action:nexthop-onboarding/proj/0" or "project:foo" or "brainstorm:bar"
  source:
    kind: mcp                        # inline | stdin | file | url | mcp | dump
    name: onboarding                 # optional — ingest_sources entry name, file basename, etc.
    server: glean                    # optional — MCP server alias (kind: mcp)
    uri: glean://doc/abc             # optional — enables dedup
    query: "onboarding docs from last 30 days"   # optional
    mime_type: text/markdown         # optional
    raw_path: thoughts/_raw/2026-05-22-1430-glean-onboarding.raw.md   # optional — set when body is a distillation
    content_hash: sha256:abc123...   # auto-computed if absent
  prompt: "Pull action items I should own in my first 30 days"   # optional
  suggested_outcomes:                # optional — capture-ingest subagent's per-item recommendations
    - kind: action                   # two_minute_action | action | project | brainstorm_seed | note
      suggested_pursuit: nexthop-onboarding
      confidence: 0.85
    - kind: note
      confidence: 0.30
  ---

  <body>
  ```

  **Suggested-outcomes shape.** Each item carries a `kind` (the
  outcome shape the subagent thinks fits) plus optional
  `suggested_pursuit` / `suggested_project` (the target it inferred)
  and `confidence` (0.0–1.0). The capture-exit menu in
  `/cadence:capture` renders these for the user to confirm or
  override; `/start inbox` re-uses them during later triage without
  re-running the subagent. Persisting them in frontmatter is the
  audit trail of what the subagent thought, not a contract the user
  has accepted.

  **Auto-dedup.** When `source.uri` is set (or v1 `mcp.uri`), the
  CLI checks existing captures by uri first, then by `content_hash`,
  and short-circuits with `{kind: "skipped_existing", reason, path}`
  instead of writing a duplicate. Dedup spans both schema versions.

  **Storage convention for `--from` / `--source` distillations:**
  the raw payload (uncondensed PDF text, full Glean response, etc.)
  lands at `thoughts/_raw/<id>.raw.md`; the distilled body lands at
  `thoughts/<id>.md` with `source.raw_path` pointing back. The
  `_raw/` directory is created lazily on first distilled write.
- **Reflection** (`<YYYY-MM-DD>.md`): frontmatter with date, status, phase,
  leveraged_priority; sections for Get Clear and Get Focused
- **Narrative** (in `narratives/drafts/`): per-cadence filename + body
  shape. **Commit-watermark cadences** (`daily-YYYY-MM-DD.md`,
  `weekly-YYYY-WNN.md`, `monthly-YYYY-MM.md`, `annual-YYYY.md`,
  `pursuit-<id>-YYYY-MM-DD.md`) carry frontmatter with `cadence`,
  `generated_at`, `consumed_from_commit`, `consumed_through_commit`,
  `projects_consulted`. The watermark is git-history-based — the next
  `/narrate` run for the same cadence reads the latest narrative and
  resumes from its `consumed_through_commit`.
- **Resolution narratives** (per-pursuit closure or drop): saved as
  `<pursuit-id>-closure.md` (archived/completed) or
  `<pursuit-id>-drop.md` (dropped). Same `narratives/drafts/` directory.
  The filename suffix lets `/cadence:narrate lessons` distinguish "what
  shipped" from "what got learned without shipping" when synthesizing
  patterns across pursuits.
- **Lessons narrative** (`lessons-YYYY-MM-DD.md`): set-watermark
  cadence, not commit-watermark. Frontmatter carries
  `pursuits_consulted: [<list>]`, `included_dropped: <bool>`, and
  `from_filter: completed | dropped | both`. Re-runs read the current
  set of resolved pursuits in `_archived/` + `_dropped/` and synthesize
  only from pursuits NOT in the prior `pursuits_consulted` list. If no
  new pursuits have resolved since the prior run, `/narrate lessons`
  returns null and skips generation rather than re-running over the
  same corpus.
- Historical session markers (legacy `pursuits/*/sessions/*.md`) may
  exist in older repos; they are preserved on disk but no longer read
  or written by any verb.

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
`move-pursuit <id>`, `sync-origin <project-id>`.
Each performs one well-formed mutation and emits JSON describing what
was written. Use these in preference to direct Edit/Write — they
enforce schema, generate timestamps, and keep frontmatter formatting
consistent.

**Origin-sync side effects** (`set-status`, `check`): when a project
has an `origin` field and a lifecycle transition occurs, the CLI
reconciles the origin alongside the state change. For `github_issue`
origins:
- transition into `done` or `dropped` → close the linked issue with a
  Cadence-authored comment
- transition into `active` (from `on_hold`, including auto-promotion
  via `check`) → swap `triaged-routed` → `in-progress` label and post
  a "work started" comment
All sync calls are gh-gated (silent skip on missing/unauthed gh) and
idempotent (already-closed/already-started short-circuit without
duplicate comments). The result object includes an `origin_sync`
field describing what happened — callers surface this to the user
when non-null. `cadence sync-origin <project-id>` re-runs the sync
without changing state, for the backfill case where origin was added
after a transition.

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

## Idea Lifecycle (removed in v1.1)

The Idea entity (with its seed → developed → promoted | moved | closed
state machine, walked by the chained internal `/develop` and `/promote`
verbs) was removed in v1.1. New ideation flows write brainstorm
workspaces with `solutions/<name>.md` candidates instead — see
"Brainstorm Workspaces" below. `cadence ideas`, `cadence create-idea`,
and `cadence set-idea-state` are gone; no `pursuits/<id>/ideas/`
directories on disk; no `aging_seed`, `unpromoted_idea`,
`growing_backlog`, `stale_inbox_seed`, or `inbox_overcap` flags.

## Brainstorm Workspaces

A **brainstorm** is a top-level working directory at
`brainstorms/<slug>/` that holds the artifacts of a single ideation →
convergence → crystallization arc. It is the replacement for the v1
Idea entity. Workspaces are first-class WIP — they appear in
`/cadence:status`, are blockers for pursuit closure when in
diverging/converging phase, and can crystallize into a real pursuit
or archive into the narrative record.

The top-level `brainstorms/` directory is created **lazily** on the
first `/cadence:brainstorm <topic>` invocation (matching the existing
pattern for `thoughts/processed/` and `validations/` — present only
when needed).

### Directory layout

```
brainstorms/
  <slug>/
    workspace.md              # main scratch / divergent notes (free-form prose)
    meta.yaml                 # state machine + provenance — see schema below
    refs/                     # optional — pulled-in thought references
      <thought-id>.md         #   (copy or symlink of thoughts/<id>.md)
    solutions/                # populated during the converging phase
      <name>.md               # one candidate solution per file
    decision.md               # populated on /brainstorm --crystallize
```

`<slug>` is kebab-case derived from the topic the user named at
`/cadence:brainstorm <topic>`. Same id convention as projects: lowercase,
hyphens, no special characters.

### `meta.yaml` schema

```yaml
slug: <kebab-case-slug>                   # required; matches the directory name
created_at: <ISO-8601 timestamp>          # required; set at create-brainstorm time
last_touched: <ISO-8601 timestamp>        # required; bumped by any state mutation
phase: diverging | converging | crystallized | archived   # required
source_thoughts: [<thought-id>, ...]      # optional; thoughts/<id>.md captures this brainstorm grew out of
candidate_solutions: [<name>, ...]        # populated when phase moves to converging; matches solutions/<name>.md files
selected_solution: <name> | null          # populated on --crystallize; one of candidate_solutions
target_pursuit: <pursuit-id> | null       # populated on --crystallize; the pursuit that materialized
```

**Phase semantics:**

- **`diverging`** — initial state. The agent facilitates open ideation;
  raw notes accumulate in `workspace.md`. No `solutions/` files yet.
- **`converging`** — the user signals readiness ("I have three candidate
  solutions" / "let me pick between these"). The agent writes
  `solutions/<name>.md` files and updates `candidate_solutions` in
  `meta.yaml`. `workspace.md` stays as history; `solutions/<name>.md`
  files become the artifacts to iterate on.
- **`crystallized`** — `/cadence:brainstorm --crystallize` has fired.
  `selected_solution` and `target_pursuit` are set; `decision.md` is
  written; a new pursuit exists at `pursuits/<target_pursuit>/`. The
  brainstorm directory persists as a narrative artifact pointing at the
  pursuit it produced.
- **`archived`** — `/cadence:brainstorm --archive` has fired. The
  workspace was either moved to `narratives/brainstorms/<slug>/` (kept
  for the record) or deleted (per user choice at archive time).

### `solutions/<name>.md` convention

Each candidate solution file follows a fixed shape so that
`/cadence:brainstorm --crystallize` can parse it deterministically:

```markdown
# <H1 → becomes the new project's title>

<prose preamble → becomes the new project's Intent (motivation,
scope, felt-sense of done)>

## Next steps

- [ ] <first concrete action>
- [ ] <second concrete action>
- [ ] <...>
```

The `## Next steps` H2 with `- [ ]` lines is mandatory — `crystallize`
parses these as the new project's Actions. Solutions without a
`## Next steps` section get rejected by `crystallize` until the user
adds one. Other H2s in the file are preserved as part of the Intent
preamble.

### `decision.md` shape (written on crystallize)

```markdown
# <brainstorm slug>: chose <selected_solution>

<one or two paragraphs from the user explaining what was chosen and why>

Crystallized at <timestamp> → pursuits/<target_pursuit>/
```

### Closure dependency

The pursuit-closure ritual in `/cadence:resolve <pursuit>` blocks on
any brainstorm with `phase: diverging | converging` whose
`source_thoughts` or context references the pursuit. Each must be
crystallized (`/cadence:brainstorm --crystallize`) or archived
(`/cadence:brainstorm --archive`) before the pursuit can resolve. This
is the absolute block that replaces the v1 "unresolved Ideas" check.

## Pursuit Lifecycle

- **Active** pursuits live in `pursuits/<id>/`
- **Someday** pursuits live in `pursuits/_someday/<id>/` (set aside, may return)
- **Archived** pursuits live in `pursuits/_archived/<id>/` (resolved as **completed** — shipped; closed via the closure path of /resolve)
- **Dropped** pursuits live in `pursuits/_dropped/<id>/` (resolved as **dropped** — didn't ship; closed via the drop path of /resolve with `--state dropped --reason "..."`). Same Zeigarnik-release ritual as archived; different terminal outcome.
- **Inbox** is no longer a pursuit. In v1.1 it became a *view* over untriaged thoughts + diverging brainstorms — see `cadence-runtime.md`'s Inbox vocabulary entry and the reconciler's `inbox_pressure` flag. No `pursuits/inbox/` directory exists.
- Moving between states is a file move (`cadence move-pursuit <id> --to active|someday|archived|dropped`); the CLI updates the pursuit's `status` frontmatter to match.
- Someday pursuits can have cue metadata in frontmatter for reconciler
  surfacing.

The archived/dropped split matters because lessons synthesize differently
across the two corpora: archived pursuits teach lessons of execution
(what worked when committed to); dropped pursuits teach lessons of
judgment (what got learned without shipping). The `/cadence:narrate
lessons` scope reads from both folders by default; `--from completed`
or `--from dropped` filters the corpus for targeted synthesis.

## Universal Work-Entry (`/start` argument shapes)

`/cadence:start` is the one verb for "I want to begin doing something."
The argument shape selects which workspace opens. Canonical wording for
the curated menu and the awareness lines lives in
`cadence-plugin/workflows/coaching-strings.md` — the SKILL quotes from
there.

| Argument | What opens |
|---|---|
| (none) | Curated menu: active pursuits, open projects, active brainstorms, Inbox line, and the top `curateNextMoves()` suggestion. The same ranker the dashboard uses, so /start and /status stay consistent. |
| `<pursuit-id>` | Pursuit workspace view: Why, LP alignment, open projects with next unchecked action, attached brainstorms, Inbox slice. |
| `<project-id>` | Project view: Intent (first sentence or two) + N/M actions + first unchecked. Unchanged from earlier behavior. |
| `<brainstorm-slug>` | Resume the brainstorm at its current phase. Forwards to `/cadence:brainstorm <slug>`. |
| `inbox` (reserved) | Inbox triage walk: iterate untriaged items oldest-first with the outcome menu (action / project / brainstorm / close / keep / quit). Per-item routing flips `status: triaged, triaged_to: <ref>`. |
| `brainstorm` (reserved) | Forward to `/cadence:brainstorm` for a new workspace. |

**Reserved keywords win on collision.** A pursuit or project named
`inbox` or `brainstorm` is unreachable via `/start <id>`. Rename the
entity or drill in via `cadence pursuit inbox` / `cadence project
inbox` directly. The CLI does not reserve these tokens — only the
SKILL does.

**Inbox slice attribution heuristic** (used by `/start <pursuit>`):
a capture belongs to a pursuit if its `verb_context` references the
pursuit ID (e.g. `seed:<pursuit-id>`) OR its body contains the
pursuit ID as a substring. A brainstorm belongs to a pursuit if its
`source_thoughts` array overlaps with captures attributed to that
pursuit OR its slug contains a substantial pursuit-ID token.
Conservative on purpose — false attribution is more confusing than no
attribution; when nothing matches, the Inbox slice section is omitted.

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
(`status: active` AND has at least one unchecked action). If at or
above `config.max_active_projects`, warn: "You have [N] in-progress
projects (limit: [max]). Consider finishing or moving one to on_hold
before adding more." The user can override — this is a guardrail,
not a gate.

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

When the user dumps a raw thought mid-flow via inline `/capture`, save it to `thoughts/unprocessed/` with no response. The capture joins the Inbox view (status: untriaged) for later triage via `/cadence:start inbox` or during `/reflect` Get Clear's awareness block. Non-inline ingest paths (`--from`, `--source`, `--dump`) dispatch the `capture-ingest` subagent and surface a per-item outcome menu; see "Capture Ingestion" below for the full surface.

## MCP Integration

Cadence consumes resources from MCP servers (Glean, time, custom) and
writes them into Cadence primitives (captures, today). The integration
is **skill-driven** — Cadence keeps no MCP client, no MCP transport,
no parallel registry view of `mcpServers`. Claude Code is the MCP
host; it owns transport, OAuth, token storage, lifecycle. Cadence
skills consume MCP through the agent's normal tool-call surface
(`mcp__<server>__<tool>`). The Cadence CLI owns the *file write*, not
the network call.

Architectural rationale: an earlier prototype shipped a standalone MCP
client inside the cadence CLI. It hit OAuth at first contact with a
real HTTP MCP server (Glean) and required a `--token` workaround.
After a half-pivot, a parallel discovery layer + `cadence mcp-list`
also lingered, which was still duplicating Claude Code's authority.
The full pivot removed both — see `mcp-integration-story` project
Notes for the record. The agent's tool surface is the only source of
truth for which servers are reachable.

### `/cadence:mcp-pull` (skill, hidden verb)

The user-facing surface for pulling MCP resources into captures.
Hidden from `/cadence:help`'s primary catalogue; explicit-invocation
only (analogous to `/incoming` and `/report`). Flow:

1. Use `ToolSearch` to find `mcp__<server>__*` tools — if none match,
   surface a hint to register the server via `claude mcp add ...`
   and exit. (If the user supplied no `<server>`, group the matched
   tools by server segment and ask which to pull from.)
2. Adapt to the server's tool shape — `list_resources` if available,
   otherwise a `search`-style query path.
3. ELI5-confirm the candidate list with the user before any write.
4. Read each resource via the server's `read_resource` (or
   equivalent) tool.
5. For each text result, call `cadence write-capture --mcp-server
   <name> --mcp-uri <uri> --mcp-mime-type <type> --body <header+body>
   --verb-context "mcp-pull:<server>"`. The CLI auto-computes
   `content_hash` (sha256 of body) and auto-dedups against existing
   captures (by uri, then by content hash).
6. Summarize: written / skipped_existing / skipped_binary / errors.

See `cadence-plugin/skills/mcp-pull/SKILL.md` for the full contract.

To verify which MCP servers the agent can reach, use `claude mcp list`
(Claude Code's native command) — Cadence intentionally doesn't ship
its own equivalent.

### `cadence write-capture` MCP flags

```bash
cadence write-capture \
  --body "<text>" \
  --verb-context "mcp-pull:<server>" \
  --mcp-server <name> \
  --mcp-uri <uri> \
  --mcp-mime-type <mime>     # optional
```

When `--mcp-server` + `--mcp-uri` are present (must be supplied
together), the write:
- Stamps `mcp:` frontmatter on the capture
- Computes `mcp.content_hash` as `sha256:<hex>` of the body
- Dedups against existing captures — returns
  `{kind: "skipped_existing", reason: "uri_seen", path}` or
  `{kind: "skipped_existing", reason: "content_hash_seen", path}`
  instead of writing when a match exists
- Returns `{kind: "written", path}` on success

The dedup logic is owned by the CLI so the skill stays simple — it
calls write-capture for each resource and trusts the result.

### Capture frontmatter shape (mcp:)

```yaml
captured: 2026-05-22T10:00:00
verb_context: mcp-pull:glean_default
mcp:
  server: glean_default
  uri: glean://doc/abc
  mime_type: text/markdown
  content_hash: sha256:abc123...
```

### What's deliberately out of scope

- **Hosting our own MCP server.** Cadence is a consumer, not a host.
- **`callTool` from inside Cadence.** Read-only consumption. Letting
  an MCP server mutate Cadence state is a separate trust decision;
  would warrant its own warn-and-confirm surface like `/report` if
  revisited.
- **Resource subscriptions.** Pull-only model. Subscription needs a
  long-lived process that doesn't match Cadence's CLI shape.
- **A Cadence-owned MCP client / transport / registry.** Removed in
  the architecture pivot. If Cadence ever needs to talk to MCP
  outside of a Claude Code agent (e.g., a non-Claude-Code consumer),
  that's a separate project with its own design pass.
- **`cadence.yaml mcp_servers` config.** Removed in the full pivot —
  it can't contribute a server to the agent's tool surface, so it was
  dead config. Register MCP servers via `claude mcp add ...`.

## Capture Ingestion

`/cadence:capture` accepts five ingestion paths beyond inline text:
file (`--from <local-path>`), URL (`--from https://...`), MCP
(`--source <named>`), brain dump (`--dump`, opens `$EDITOR`), and
stdin (`--`). For the MCP path, `--source <name>` resolves against a
config registry — `ingest_sources:` — that names canned queries
against MCP servers Claude Code already knows about.

### `ingest_sources:` config

Two files, both optional. Precedence: repo > user. Same-named entry
in `cadence.yaml` overrides the one in `~/.cadence/sources.yaml`.

**Repo-scoped (`cadence.yaml`):**

```yaml
ingest_sources:
  onboarding:
    server: glean                     # MCP server alias (registered via `claude mcp add`)
    query: "onboarding docs from last 30 days OR shared with me by hiring manager"
    prompt: "Pull action items I should own in my first 30 days."
  jira_inbox:
    server: jira
    jql: "assignee = currentUser() AND status = 'To Do'"
  cadence_issues:
    server: github
    query: "repo:kevinteg/cadence is:issue is:open label:capture-source"
```

**User-scoped (`~/.cadence/sources.yaml`):**

Same shape. Lives outside any single repo so personal pre-canned
queries (Glean credentials, personal inbox queries) survive across
projects.

```yaml
ingest_sources:
  morning-brief:
    server: glean
    query: "calendar events for today AND emails from VIPs in the last 24h"
    prompt: "Pull anything I should be aware of before my first meeting."
```

### Important caveat — what `ingest_sources` declares

It declares **named queries against MCP servers Claude Code already
knows about** (registered via `claude mcp add`). Cadence has no
server registry post-pivot (see "MCP Integration" → "What's
deliberately out of scope" — `cadence.yaml mcp_servers` is gone).
An entry like `server: glean` references whatever Claude Code knows
as `glean`, not a Cadence-declared server.

If `claude mcp list` doesn't show the server an `ingest_sources`
entry references, the `--source` flow exits with a clear hint to
register the server first.

### Flow

`/cadence:capture --source onboarding` runs as:

1. Resolve `onboarding` against `ingest_sources` (cadence.yaml first,
   then ~/.cadence/sources.yaml). Error with available names if no
   match.
2. Dispatch the `capture-ingest` subagent with the resolved server,
   query, and prompt. (See `cadence-plugin/agents/capture-ingest.md`.)
3. Subagent calls the relevant `mcp__<server>__*` tools via Claude
   Code's MCP transport, fetches results, distills per the prompt.
4. Raw payload lands at `thoughts/_raw/<id>.raw.md`; distilled body
   at `thoughts/<id>.md` with v2 frontmatter including
   `source: {kind: mcp, name: onboarding, server: glean, query, ...}`
   and the subagent's `suggested_outcomes`.
5. The capture SKILL surfaces the outcome menu so the user can
   immediately route items into actions / projects / brainstorms
   instead of leaving them in the Inbox.

### When to use which

| Flag | Use case |
|---|---|
| `cadence:capture "..."` | Inline stray thought, silent contract |
| `cadence:capture --from <path>` | One-shot local file ingest (PDF, doc, log) |
| `cadence:capture --from <url>` | One-shot URL ingest (article, gist, search result) |
| `cadence:capture --source <name>` | Repeatable MCP-driven pull (corporate search, Jira inbox, etc.) |
| `cadence:capture --dump` | Long-form brain dump in `$EDITOR` |
| `/cadence:mcp-pull --server <name>` | **Bulk many resources from one server** — the dedicated batch path; `--source` is the single-query shorthand for the same plumbing |

## Ambient Surfaces — Inbox, SessionStart, Stop hook

The v1.1 ambient surfaces share one mental model: **render state
where the user already is, rather than asking them to navigate to
it.** Three pieces — the Inbox view, the SessionStart splash, and
the Stop-hook session log — are described here as a set because they
share data structures, suppression mechanics, and canonical copy.

### Inbox view

The Inbox is a *view*, not a directory or pursuit. It's defined in
`src/inbox.ts` as:

```ts
inboxItems(snapshot, now?) → {
  items: InboxItem[],   // sorted oldest-first
  counts: { total, thoughts, brainstorms, fresh, aged, overdue },
}
```

Membership rules:
- `thoughts/unprocessed/*.md` where `status: untriaged` (the default
  on fresh captures) — surfaced as `kind: 'thought'`.
- `brainstorms/<slug>/meta.yaml` where `phase: diverging` — surfaced
  as `kind: 'brainstorm'`.

Bucket boundaries (from `src/inbox.ts`):
- `fresh` — age_days ≤ 2
- `aged` — 3 ≤ age_days ≤ 7
- `overdue` — age_days > 7

The reconciler emits an `inbox_pressure` flag when
`counts.total > inbox_soft_threshold` (default 10, configured via
`cadence.yaml`). Every surface that mentions "Inbox" consumes
`inboxItems()` — same definition across `/status`, the SessionStart
hook, the reconciler, and `/start inbox`.

Canonical strings for the Inbox line live in
`cadence-plugin/workflows/coaching-strings.md`. Skills, hooks, and
CLI render helpers quote from that doc rather than re-inventing
language per surface.

### Dashboard layout (status output)

`cadence status` (bare CLI) and the SessionStart hook share one renderer (`src/render/status.ts`). The dashboard is navigation-led:

```
# Cadence Status

**This week**: <LP framing>. Last touch was `<project>` (<ago>).

## Active Pursuits
### <pursuit> — <done>/<total> projects done
| Project | Status | Actions | What it's about |
...

## Active Brainstorms                    (collapses when none active)
## On Hold Pursuits                      (collapses when none on hold)

## Heads up
- Inbox: <line>
- <validations nudge>                    (collapses when empty)
- Health: <flag summary>                 (collapses when no non-inbox flags)

## Likely next moves
1. `<verb> <target>` — <rationale>
2. ...

---

*<tip content>*                          (optional, frequency-capped)
— <tip attribution>
```

Each section collapses when its input is empty. The "This week" line takes the first sentence of the LP (lower-cased, trailing punctuation stripped) plus the most recently active project's relative-time label. The "Likely next moves" block is computed by `curateNextMoves()` in `src/render/curation.ts` — priority order: LP alignment → recency → structural urgency → parking-lot pressure → routine surfaces, capped at 3 entries.

The optional tip footer surfaces via `pickDashboardTip()` in `src/tip/picker.ts` — a `type: quote` tip from the library matched on the `verb-status` or `idle` trigger tags, gated by the `status-marginalia` category cool-down (default 1 day; per-tip `cool_down_days` in `library.yaml` keep individual tip variety high). The empty-repo branch suppresses it. See `workflows/coaching-strings.md` "Tip footer" section for the canonical rendering.

Color is opt-in. The bare-CLI status enables ANSI escape codes when stdout is a TTY (with `NO_COLOR` / `FORCE_COLOR` env overrides). The hook-output path always emits plain markdown — ANSI codes would corrupt Claude Code's table rendering.

### SessionStart hook

Hook config in `cadence-plugin/hooks/hooks.json` registers the
`SessionStart` event (matchers: `startup`, `resume`, `clear`) and
invokes `cadence status --hook-output`. The hook emits a JSON
envelope with `systemMessage` (rendered inline) and
`hookSpecificOutput.additionalContext` (added to the model's context).

One behavior specific to `--hook-output`:

**Empty-repo branch.** When `isEmptyRepo(snapshot)` returns
true — zero pursuits AND Inbox empty AND
`validations/pending.md` empty — the hook emits the canonical
empty-repo coaching block from `coaching-strings.md` instead of
the dashboard. The bare CLI does NOT branch this way; an explicit
`/status` always renders the dashboard.

The hook always fires — there is no suppression layer. State-hash
dedup was tried (60-minute window via `.cadence/last_session_block.json`)
along with an explicit `cadence dismiss-splash --hours N` override,
both removed because they turned the hook into a guessing game about
whether it had actually run. The dashboard reappears on every new
conversation; the tip category cool-down in `pickDashboardTip` keeps
the marginalia from feeling repetitive.

### Stop hook + session log

The `Stop` event in `hooks.json` invokes `cadence stop-hook` when
Claude Code finishes a turn naturally. The hook:

1. Computes the same state hash as the SessionStart splash.
2. Reads `.cadence/last_session_log.json` (the hash + timestamp of
   the last logged stop). If the hash is unchanged, emits an empty
   envelope and exits — no log line.
3. If the hash has changed, appends a one-line summary to
   `narratives/session-log.md`:
   ```
   2026-05-21T14:23:45Z — pursuits:3 projects:5 (12/24 actions) inbox:4 brainstorms:1
   ```
   Counts come from the snapshot — no narrative claim, no editorial.
4. Updates `.cadence/last_session_log.json` with the new hash so
   the next unchanged stop is a no-op.

Stop-hook failures are swallowed silently — a session-log issue
must never break the user's session. `narratives/` is lazy-created
on first append; pre-existing repos don't need a migration.

The SubagentStop and PreCompact hooks are NOT wired. SubagentStop is
too chatty (fires per subagent invocation); PreCompact fires after
the user has already lost the thread.

## Maintainer Labels (Upstream Cadence Repo)

The maintainer-side `/incoming` workflow and the origin-sync CLI use
a small set of GitHub labels to coordinate state on the upstream
issue tracker. Create these once via `gh label create` on any repo
that consumes the workflow; they do not auto-create.

| Label | Color | Meaning |
|---|---|---|
| `triaged-routed` | `#0e8a16` (green) | Issue has been triaged through `/cadence:incoming` and routed to a Cadence project, action, or idea. Filtered out of the default `/incoming` queue. |
| `triaged-deferred` | `#fbca04` (yellow) | Issue has been deferred for later reconsideration. Filtered out of the default `/incoming` queue; surface again with `/incoming --include-deferred`. |
| `in-progress` | `#1d76db` (blue) | Cadence: a project tied to this issue is actively being worked on. Applied automatically (replacing `triaged-routed`) when the project transitions `on_hold` → `active`. Removed implicitly when the issue closes on project resolve. |

Create commands (one-time per repo):
```bash
gh label create triaged-routed --repo <owner>/<name> --color 0e8a16 --description "Triaged and routed to a Cadence project/action/idea"
gh label create triaged-deferred --repo <owner>/<name> --color fbca04 --description "Triaged and deferred for later reconsideration"
gh label create in-progress --repo <owner>/<name> --color 1d76db --description "Cadence: a project tied to this issue is actively being worked on"
```

The origin-sync side effects (label swaps + comments + issue close)
all flow through these labels. If a maintainer renames any of them
on the GitHub side, the sync logic in `src/write/origin-sync.ts`
needs to be updated to match — the label names are referenced as
string literals.

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

The CLI exposes three subcommands (matching the codebase's hyphenated
naming convention — `set-status`, `add-waiting-for`, etc.):

- `cadence tip-status [--triggers <tags>] [--eligible-only] [--json]`
  — show which tips have been shown, which are eligible right now,
  optionally filtered to a trigger set.
- `cadence tip-reset --match <id-substring>` (or `--all`) — clear
  show-state for matching tips. Useful for testing or repeating a tip.
- `cadence tip-pick --triggers <tags> [--tones <list>] [--types <list>] [--no-record]`
  — the consumer-facing primitive. Skills call this to ask "given
  these active trigger tags, give me one tip." Records the show by
  default; `--no-record` for preview. Returns JSON or `null`.

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
