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
| `brainstorm` | Divergent ideation. Generate quantity. Find what the Pursuit is. Chains internally into `develop` when the user is ready to converge, and `promote` when an Idea is ready to graduate. |

### Execute — do the work

| Verb | Purpose |
|---|---|
| `start` | Open a project's view (Intent + actions + first unchecked). View-only — no session ceremony. |
| `complete` | Mark an action done. First check promotes on_hold → active. Triggers upward completion prompts. |
| `resolve` | Wrap up a project or pursuit. `resolve <project> --state complete` (default) walks the intent-feel-achieved dialogue; `--state dropped` requires a reason. `resolve <pursuit>` walks the closure ritual with absolute-Ideas-block, then archives. |
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
| `status` | System dashboard with contextual next-step hints, or drill into pursuits / projects / actions. Each drill ends with an action menu showing the verbs applicable to the viewed entity. |
| `find` | Search across projects, ideas, captures, and pursuits by case-insensitive substring. Results grouped by kind with per-group verb hints so any result is directly actionable. |
| `help` | Render this catalogue inline, or a single verb's contract. |

### Internal verbs (chained, not user-facing)

These are real verbs the agent invokes internally; users typically
don't type them. They appear in the catalog only when chained from
another verb's flow.

| Verb | Chained from |
|---|---|
| `develop` | `brainstorm` (when convergence is ready: PPCo, criteria, pre-mortems on Ideas) |
| `promote` | `develop` or `start` (when an Idea is ready to graduate to Pursuit / Project / Action — enforces the appropriate gate) |

Users CAN invoke `develop` and `promote` explicitly, but the design
target is conversational discovery: the agent surfaces "running
`/cadence:promote` — this advances an Idea to a Project" as a teaching
moment when the chain fires (see the natural-language-to-verb teaching
principle in `cadence-runtime.md`).

### System behavior (not a verb)

| Behavior | When it runs |
|---|---|
| `reconciler` | Automatically at SessionStart hook (every fresh session); during `/reflect` Get Clear; on demand via the `cadence flags` CLI subcommand for power users. Surfaces stale state, aging Ideas, dormant projects, structural issues — no longer a user-facing verb. |

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
  used by `/promote` and `/complete` to adapt their prompts; leave
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

  The union is designed to extend to additional kinds (`idea`, `url`,
  `capture`, etc.) without re-engineering the frontmatter. See
  `src/types.ts` `OriginSchema`. The CLI shorthand
  `cadence create-project --origin-issue owner/repo#42` constructs
  the github_issue shape from `repo#number`; the URL is derived.
- **Idea** (`<id>.md`): frontmatter with id, parent, state, created,
  optional developed_at, promoted_to, closed_reason
- **Capture** (`<timestamp>.md`): frontmatter with captured, verb_context;
  raw input. Lives in `thoughts/unprocessed/`.
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
`project-activity`, `mcp-list`. All accept `--json` for structured
output. Skills consume `--json` and reason over the typed result; the
human-readable default is for the user invoking the CLI directly
during an AI outage.

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
`move-pursuit <id>`, `sync-origin <project-id>`,
`mcp-pull --server <name>`.
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

## Idea Lifecycle

Ideas are a first-class collection adjacent to the work hierarchy. Every
Idea has a parent — either a pursuit or a project. Ideas without a clear
parent are placed on the Inbox with an auto-generated name; the Inbox
is a *short-term triage zone*, not a permanent home for unattached or
cross-cutting ideas — the expectation is that the next `/develop` or
`/promote` pass moves them to a real pursuit (or closes them). The
parent field uses the same ID convention as projects (e.g., `parent:
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
- **Someday** pursuits live in `pursuits/_someday/<id>/` (set aside, may return)
- **Archived** pursuits live in `pursuits/_archived/<id>/` (resolved as **completed** — shipped; closed via the closure path of /resolve)
- **Dropped** pursuits live in `pursuits/_dropped/<id>/` (resolved as **dropped** — didn't ship; closed via the drop path of /resolve with `--state dropped --reason "..."`). Same Zeigarnik-release ritual as archived; different terminal outcome.
- **Inbox** lives in `pursuits/inbox/` — never closes; it's a short-term triage zone for ideas without an obvious home, not an organizational layer. A growing Inbox is a triage debt signal; the reconciler surfaces it.
- Moving between states is a file move (`cadence move-pursuit <id> --to active|someday|archived|dropped`); the CLI updates the pursuit's `status` frontmatter to match.
- Someday pursuits can have cue metadata in frontmatter for reconciler
  surfacing.

The archived/dropped split matters because lessons synthesize differently
across the two corpora: archived pursuits teach lessons of execution
(what worked when committed to); dropped pursuits teach lessons of
judgment (what got learned without shipping). The `/cadence:narrate
lessons` scope reads from both folders by default; `--from completed`
or `--from dropped` filters the corpus for targeted synthesis.

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

When the user dumps a raw thought mid-flow via `/capture`, save it to
`thoughts/unprocessed/` with no response. Captures are triaged into
Ideas or Actions at the next breakpoint or during Reflect. Flag
uncertain routing for human review.

## MCP Integration

Cadence is a *client* of MCP servers — it consumes resources from
external MCP servers (Glean, time, custom) and writes them into
Cadence primitives. It does not host its own tools. Both stdio and
HTTP (Streamable HTTP / SSE) transports are wired.

### Discovery is the primary mechanism

If you've already declared an MCP server elsewhere (Claude Code's
`claude mcp add ...`, or a project-scope `.mcp.json`), Cadence sees it
automatically — no need to re-declare in `cadence.yaml`. Discovery
walks two locations:

| Source | File | Tag |
|---|---|---|
| User scope | `~/.claude.json` `mcpServers` | `claude-user` |
| Project scope | `<repoRoot>/.mcp.json` `mcpServers` | `mcp-project` |
| Local override | `cadence.yaml` `mcp_servers` | `cadence-yaml` |

**Precedence (most-local wins):** `cadence-yaml` > `mcp-project` >
`claude-user`. Name collisions resolve to the higher-priority source.

The discovery parser is tolerant — entries without an explicit `type`
field are inferred (`command` → stdio, `url` → http). `transport: sse`
maps to the same http kind since SDK's StreamableHTTPClientTransport
handles both flavors. Malformed entries are skipped silently rather
than throwing.

Run `cadence mcp-list` to verify what Cadence sees and which file each
entry comes from.

### Configuration (optional override / local-only servers)

`cadence.yaml mcp_servers` is the override path — use it when you want
to add a repo-only server, or pin specific config that should win over
what Claude Code or `.mcp.json` declares.

```yaml
mcp_servers:
  - name: glean                 # alias used by --server
    transport: stdio            # stdio | http
    command: glean-mcp          # stdio: executable on PATH
    args: ["--profile", "default"]
    env:
      GLEAN_TOKEN: ${env:GLEAN_TOKEN}   # ${env:NAME} expanded at config load
    cwd: ~/.glean               # optional; ~/ expanded
    timeout_ms: 10000           # optional per-call timeout (default 10000)

  - name: remote-glean
    transport: http
    url: https://glean.example.com/mcp
    headers:
      Authorization: Bearer ${env:GLEAN_TOKEN}
```

`${env:NAME}` expansion happens at `loadConfig` time for cadence.yaml
entries (discovered entries don't expand — they ride whatever the
source file declared). Missing variables surface as `MCP server
'<name>' references missing env var <NAME>` at the CLI boundary —
never at first use. Duplicate server names raise immediately to
prevent silent shadowing.

### `cadence mcp-list` (verify the merged registry)

```bash
cadence mcp-list           # human table
cadence mcp-list --json    # structured output
```

Shows the merged registry across `cadence.yaml`, `.mcp.json`, and
`~/.claude.json` with a `source` column. Use this before `mcp-pull` to
confirm the server name + target + source.

### `cadence mcp-pull` (read resources → captures)

```bash
cadence mcp-pull --server <name> [--filter <substring>] [--limit <N>] [--dry-run]
```

- **`--server`** (required): alias from `mcp_servers[*].name`.
- **`--filter`**: case-insensitive substring matched against
  resource uri / name / description.
- **`--limit`**: cap the post-filter set.
- **`--dry-run`**: list what would be written without touching disk.

**Behavior:** connects to the named server, lists resources, applies
filter + limit, and for each resource: reads content, dedups against
existing captures by `mcp.uri` (fast) and `mcp.content_hash` (precise
across renames), writes a capture to `thoughts/unprocessed/` with an
`mcp:` frontmatter block. Binary resources are flagged and skipped
(the capture primitive is text-only). Connection is per-invocation —
no pooling.

**Output (JSON):**
```json
{
  "server": "glean",
  "dry_run": false,
  "total_listed": 47,
  "after_filter": 12,
  "entries": [ { "kind": "written", "uri": "...", "path": "..." }, ... ],
  "summary": { "written": 9, "skipped_existing": 2, "skipped_binary": 1, "errors": 0 }
}
```

**Capture frontmatter** written by `mcp-pull` (extends the standard
shape with the `mcp:` block — see "File Formats" → Capture):
```yaml
captured: 2026-05-22T10:00:00
verb_context: mcp-pull:glean
mcp:
  server: glean
  uri: glean://doc/abc
  mime_type: text/markdown
  content_hash: sha256:...
```

**Errors** (emitted to stderr as `{ error: { kind, message, hint } }`
with exit code 1):
- `not_configured` — `--server` doesn't match any entry in the merged
  registry (cadence.yaml + discovered)
- `spawn_failed` — stdio command not on PATH, stdio process refused to
  start, or http URL was unparseable
- `handshake_failed` — server didn't complete the MCP initialize step
- `timeout` — a call exceeded `timeout_ms`
- `server_error` — MCP server returned a protocol-level error

### CLI subcommand catalog (mcp- prefix)

| Command | Purpose |
|---|---|
| `cadence mcp-list` | Verify merged registry across cadence.yaml + .mcp.json + ~/.claude.json |
| `cadence mcp-pull --server <name>` | Read resources from a server into thoughts/unprocessed/ as captures |

### What's deliberately out of v1

- `listTools` / `callTool` — read-only consumption only. Letting an
  MCP server mutate Cadence state is a separate trust call (would
  warrant its own warn-and-confirm surface like `/report`).
- Resource subscriptions — pull-only.
- OAuth flows for HTTP transport — bearer-token headers only. OAuth
  added when a server demands it.
- Hosting our own MCP server — Cadence is a client, not a host. If
  that flips later, it's a separate project.

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
