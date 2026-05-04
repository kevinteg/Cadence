# Cadence Plugin

Cognitive operating system for Claude Code. Manages attention, protects
flow state, separates the modes of thought, and generates narrative
across pursuits.

## Installation

**Prerequisites:** Node 20+ (the bundled CLI is a self-contained Node
bundle). The plugin ships with `bin/cadence` already built — no `npm
install` or build step needed for end-users.

### Quick start

Clone the repo and launch Claude Code with the plugin:

```bash
git clone https://github.com/kevinteg/Cadence.git
cd Cadence
claude --plugin-dir ./cadence-plugin
```

The repo's `CLAUDE.md` already imports the runtime via a relative path,
so the SessionStart dashboard appears immediately. You're inside the
Cadence repo — poke around the active `improve-ux-and-vision` pursuit,
or `cd` into a fresh subdirectory and run `/cadence:init` to start clean.

### Use Cadence in your own repo

Clone the plugin to a stable location once, then point your own
Cadence-tracked repo at it:

```bash
git clone https://github.com/kevinteg/Cadence.git ~/code/cadence
mkdir my-work && cd my-work
git init
cat > CLAUDE.md <<'EOF'
@~/code/cadence/cadence-plugin/cadence-runtime.md
EOF
claude --plugin-dir ~/code/cadence/cadence-plugin
```

(Adjust `~/code/cadence` to wherever you want the plugin to live.)

### Bootstrap with /cadence:init

Inside Claude Code, run `/cadence:init`. It will:
- Create the directory structure (pursuits/, ideas, Inbox, etc.)
- Generate cadence.yaml with default configuration
- Walk you through creating your first pursuit and project
- Set up .gitignore entries for generated files

After init completes, you're ready to use `/cadence:start` to begin
work.

## Verbs

The user-facing surface is **12 verbs**, grouped by cognitive mode.
One voice, verb-defined register. Per-verb tone, behavior, and
guardrails are specified in
[`workflows/verb-contracts.md`](workflows/verb-contracts.md).

### Diverge — find what to build

| Verb | Description |
|------|-------------|
| `/cadence:brainstorm` | Facilitated divergent ideation. Agent deals provocation cards; user generates ideas. Chains internally into `develop` and `promote`. |

### Execute — do the work

| Verb | Description |
|------|-------------|
| `/cadence:start` | Open a project's view (Intent + actions + first unchecked). View-only — no session ceremony. |
| `/cadence:complete` | Mark an action done. First check promotes `on_hold` → `active`. Triggers upward completion prompt. |
| `/cadence:resolve` | Wrap up a project or pursuit. `--state complete` (default) walks the intent-feel-achieved dialogue; `--state dropped` requires a reason. Pursuit-level invokes the closure ritual + archive. |
| `/cadence:waiting` | Record an external blocker so it's tracked. |
| `/cadence:capture` | Flow-safe parking lot — saves a thought silently, no agent response. |

### Reflect — see meaning, check state

| Verb | Description |
|------|-------------|
| `/cadence:reflect` | Weekly ritual — Get Clear (process captures + flags) + Get Focused (interactive what-worked / Leveraged Priority). Catch-up entry modes for long gaps. |
| `/cadence:narrate` | Generate narrative — today (standup), week (LP-anchored), or pursuit arc (full story). Watermark-resume from git history. |

### Setup — one-off

| Verb | Description |
|------|-------------|
| `/cadence:init` | Bootstrap a new repo. |

### Browse — navigation

| Verb | Description |
|------|-------------|
| `/cadence:status` | System dashboard, or drill into pursuits/projects/actions. |
| `/cadence:find` | Substring search across projects, ideas, captures, and pursuits. |
| `/cadence:help` | Browse the verb surface — catalogue, group, or single verb. |

### Internal verbs (chained, not user-facing)

These are real verbs the agent invokes internally; users typically don't
type them directly. They appear when chained from another verb's flow.

- **`/cadence:develop`** — chained from `/brainstorm` when convergence is ready (PPCo, criteria, pre-mortems on Ideas).
- **`/cadence:promote`** — chained from `/develop` or `/start` at graduation moments (Idea → Pursuit/Project/Action with the appropriate gate).

Users CAN invoke them explicitly; the design target is conversational
discovery. The agent surfaces "running `/cadence:promote` — this advances
an Idea to a Project" as a teaching moment when the chain fires.

### System behavior (not a verb)

- **`reconciler`** — runs automatically at SessionStart hook (every fresh session) and during `/reflect` Get Clear. Surfaces stale state, aging Ideas, dormant projects, structural issues. The CLI subcommand `cadence flags` is available for power users who want to query on demand.

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
/cadence:status improve-ux-and-vision  # see projects in your active pursuit
/cadence:status <project>              # see Intent and actions
/cadence:start <project>               # open the project view
... do work, check off actions via /cadence:complete ...
/cadence:resolve <project>             # wrap it up when ready
```

## The Pipeline

```
  Idea ──► Pursuit ──► Project ──► Action
   │         │           │            │
  Why?    Intent?    Concrete?   /complete
```

Three graduation gates. `brainstorm` generates Seeds. `develop`
evaluates them (chained from brainstorm). `promote` advances them
through the gate that matches the target level (chained from develop
or start).

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
