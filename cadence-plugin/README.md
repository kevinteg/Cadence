# Cadence Plugin

Cognitive operating system for Claude Code. Manages attention, protects
flow state, separates the modes of thought, and generates narrative
across pursuits — for **physical pursuits** (cleaning out the garage,
training for a 10K) and **knowledge work** (shipping a feature, writing
a paper) alike.

This README documents the plugin surface. For install + a 10-minute
walkthrough, see [`../README.md`](../README.md) and
[`../docs/getting-started.md`](../docs/getting-started.md).

## Quick install

Prerequisites: Node 20+ (the bundled CLI is a self-contained Node
bundle; no `npm install` needed at consume-time).

```bash
git clone https://github.com/kevinteg/Cadence.git ~/code/cadence
cd <your-cadence-tracked-repo>     # any git repo, or a fresh directory + git init
claude --plugin-dir ~/code/cadence/cadence-plugin
```

Inside Claude Code, run `/cadence:init` — the SKILL walks the bootstrap (directory structure, `cadence.yaml`, your first pursuit + project, `.gitignore` entries).

## Permissions

The plugin ships a PreToolUse gate (`hooks/bash-permission-gate.mjs`)
that auto-allows Bash calls consisting of a single plain
`cadence <subcommand>` invocation — the bundled CLI runs without
permission prompts out of the box. Compound or piped commands still
prompt, by design.

The hidden verbs `/cadence:report` and `/cadence:incoming` shell out
to the GitHub CLI. If you use them, pre-allow `gh issue` in your
repo's `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": ["Bash(gh issue:*)"]
  }
}
```

Nothing else needs a standing grant.

## Verbs

The user-facing surface is **12 verbs**, grouped by cognitive mode.
One voice, verb-defined register. Per-verb tone, behavior, and
guardrails are specified in
[`workflows/verb-contracts.md`](workflows/verb-contracts.md).

### Diverge — find what to build

| Verb | Description |
|------|-------------|
| `/cadence:brainstorm` | Facilitated divergent ideation in a first-class workspace at `brainstorms/<slug>/`. Phase machine: `diverging → converging → crystallized | archived`. `--crystallize` materializes a Pursuit or Project from the chosen solution. |

### Execute — do the work

| Verb | Description |
|------|-------------|
| `/cadence:start` | Universal work-entry verb. No arg → curated menu. `<pursuit>` → pursuit workspace view. `<project>` → project view. `<brainstorm-slug>` → resume the workspace. `inbox` (reserved) → triage walk with outcome menu. View-only — no session ceremony. |
| `/cadence:complete` | Mark an action done. First check promotes `on_hold` → `active`. Triggers upward completion prompt. |
| `/cadence:resolve` | Wrap up a project or pursuit. `--state complete` (default) walks the intent-feel-achieved dialogue; `--state dropped` requires a reason. Pursuit-level invokes the closure ritual + archive. |
| `/cadence:waiting` | Record an external blocker so it's tracked. |
| `/cadence:capture` | Flow-safe parking lot — inline `"..."` saves a thought silently. Extended ingest surface: `--from <path|url>`, `--source <name>` (named MCP queries), `--dump` (long-form in $EDITOR). Non-inline paths dispatch the `capture-ingest` subagent and surface a per-item outcome menu (`[Y/n]` defaults to a high-confidence suggested action). |

### Reflect — see meaning, check state

| Verb | Description |
|------|-------------|
| `/cadence:reflect` | Weekly ritual — Get Clear (short awareness block: Inbox / dormant / closing-in / WIP counts; choose handle / note / pause) + Get Focused (interactive what-worked / Leveraged Priority). Catch-up entry modes for long gaps. Hand-offs to `/start inbox` or `/resolve` persist the reflection at `phase: get_clear` so it resumes cleanly. |
| `/cadence:narrate` | Generate narrative — today (standup), week (LP-anchored), or pursuit arc (full story). Watermark-resume from git history. |

### Setup — one-off

| Verb | Description |
|------|-------------|
| `/cadence:init` | Bootstrap a new repo. |

### Browse — navigation

| Verb | Description |
|------|-------------|
| `/cadence:status` | System dashboard, navigation-led ("This week" framing + Active Pursuits tables + Active Brainstorms + On Hold Pursuits + Heads up + Likely next moves), or drill into a pursuit/project. |
| `/cadence:find` | Substring search across projects, brainstorms, captures, and pursuits. |
| `/cadence:help` | Browse the verb surface — catalogue, group, or single verb. |

### Hidden verbs (explicit invocation only)

Not on the visible 12-verb catalogue. They're gated to explicit
invocation because they write to state the user can't easily undo
(e.g., filing a public GitHub issue). The agent **suggests** them at
breakpoints when chat language signals intent, but never auto-fires.

- **`/cadence:report`** — file an issue against the upstream Cadence
  repo. Privacy-by-default; never auto-includes pursuit/project content.
- **`/cadence:incoming`** — maintainer-side triage of inbound issues
  against the upstream Cadence repo. Routes each to an action, project,
  capture, close, or defer. Requires `gh`.
- **`/cadence:mcp-pull`** — bulk ingest from a Claude-Code-registered
  MCP server into `thoughts/unprocessed/` as captures for later triage.

### System behavior (not a verb)

- **`reconciler`** — runs automatically at SessionStart hook (every fresh session) and during `/reflect` Get Clear. Surfaces overdue waiting-for items, dormant projects, Inbox pressure, closing-in pursuits, and structural inconsistencies. The CLI subcommand `cadence flags` is available for power users who want to query on demand.

## Quick Navigation

Cadence is designed to be navigated from the dashboard alone — you
shouldn't need to memorize the verb surface to get started.

**At session start**, the SessionStart hook prints the dashboard with
up to 3 contextual `Next:` suggestions ranked by your current state
(in-progress projects, unprocessed captures, reconciler flags, reflect
cadence, on-hold pickup candidates, pending validations). Follow
whichever fits.

**Drill in** with `/cadence:status pursuits` (list) → `/cadence:status
<pursuit>` (its projects) → `/cadence:status <project>` (Intent +
actions). Every drill-down ends with an **Available actions** block
listing the verbs that apply to the viewed entity, so you always know
what's possible without leaving the dashboard.

**Search by substring** with `/cadence:find <text>` — searches project
IDs, intent prose, action texts, idea bodies, capture bodies, and
pursuit metadata. Results group by kind with per-group verb hints.

**Browse the verb surface** with `/cadence:help`. Pass a group name
(`diverge` / `execute` / `reflect` / `setup` / `browse`) to list the
verbs in one mode, or a single verb name to see its full contract.

**Typical first session:**

```
[session start: dashboard appears]
/cadence:status <pursuit>              # see projects in your active pursuit
/cadence:status <project>              # see Intent and actions
/cadence:start <project>               # open the project view
... do work, check off actions via /cadence:complete ...
/cadence:resolve <project>             # wrap it up when ready
```

## The Pipeline

```
   Pursuit ──► Project ──► Action
      │           │            │
   Why?       Intent?    Concrete?
```

Pursuits are intentional commitments tied to values or roles. Projects are scoped efforts framed by an Intent narrative. Actions are atomic tasks.

Divergent exploration happens in **brainstorm workspaces** at `brainstorms/<slug>/` that run a phase machine (`diverging → converging → crystallized | archived`). `/cadence:brainstorm --crystallize` materializes the chosen solution as a Pursuit or Project, lifting the workspace's notes into Intent + initial Actions.

Unsorted material lives in the **Inbox** — a view, not a directory, over untriaged captures (`thoughts/unprocessed/`) and brainstorms still in `diverging`. Triage moves material out into a real outcome (action, project, brainstorm, close-with-reason).

## Configuration

Edit `cadence.yaml` in your repo root:

```yaml
wip_limits:
  max_active_projects: 5     # in-progress projects before warning

defaults:
  someday_review: monthly
  waiting_for_grace_days: 2
  dormant_days: 14           # active projects with no activity in this many days

reflect:
  day: sunday
  duration_minutes: 30
```

## Hooks

The plugin ships its SessionStart hook config in `hooks/hooks.json`. No
per-repo setup required — installing the plugin turns it on automatically.

| Event / matcher | Command | Purpose |
|---|---|---|
| `SessionStart / startup` | `cadence status --hook-output` | Show the dashboard when Claude Code launches |
| `SessionStart / resume` | `cadence status --hook-output` | Re-show the dashboard when a session resumes |
| `SessionStart / clear` | `cadence status --hook-output` | Re-show the dashboard after `/clear` |

The `--hook-output` flag wraps the human-readable status in a JSON
envelope (`systemMessage` for the user, `hookSpecificOutput` for the
model) — Claude Code consumes that shape; bare `cadence status`
prints plain text for terminal use.

The dashboard surfaces pending validations from `validations/pending.md`
above the Flags block on every fresh session until cleared, so
behaviors that need fresh-session verification stay visible without
piling up as dangling project actions.

## Bundled CLI

The plugin ships a self-contained CLI at `bin/cadence`. Claude Code
adds the plugin's `bin/` to `PATH` automatically, so skills (and you)
invoke it directly as `cadence <subcommand>`. The CLI also runs
standalone — useful for a status dashboard or a quick mutation without
an agent in the loop.

```bash
# Read commands (tabular by default; --json for structured output)
cadence status
cadence report
cadence flags
cadence project <id>

# Write commands
cadence create-pursuit my-thing --type finite
cadence create-project ship-it --pursuit my-thing \
  --intent "What done feels like" --action "Write code"
cadence check ship-it --section action --match "Write code"
cadence set-status ship-it --pursuit my-thing --status done
cadence write-capture --body "stray thought"
cadence pending-validation-add --description "verify X in a fresh session"
cadence tip-pick --triggers verb-resolve --types verb-hint
```

Full subcommand catalog: see `cadence-plugin/cadence-reference.md`
"CLI Subcommand Catalog".

The bundle requires Node 20+ and has no `node_modules` runtime
dependency.

To rebuild from source after changing TypeScript files (developers only):

```bash
npm install         # one-time, at repo root
npm test            # run the unit suite
npm run bundle      # rebuilds cadence-plugin/bin/cadence
```

## Getting Started

1. `/cadence:init` — bootstrap the repo
2. `/cadence:brainstorm` — generate ideas for what to build (chains into develop+promote at the right moments)
3. `/cadence:start <project>` — begin working
4. `/cadence:complete <action>` — mark progress; `/cadence:resolve <project>` to wrap up
5. `/cadence:reflect` — weekly review to stay focused
6. `/cadence:narrate week` — see the story of what you shipped
