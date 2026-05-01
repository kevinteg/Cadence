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
Cadence repo — poke around the existing `build-cadence-v1` pursuit, or
`cd` into a fresh subdirectory and run `/cadence:init` to start clean.

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
- Create the directory structure (pursuits/, ideas, Wandering, etc.)
- Generate cadence.yaml with default configuration
- Walk you through creating your first pursuit and project
- Set up .gitignore entries for generated files

After init completes, you're ready to use `/cadence:start` to begin
your first session.

## Verbs

The core command surface. One voice, verb-defined register. Per-verb
tone, behavior, and guardrails are specified in
[`workflows/verb-contracts.md`](workflows/verb-contracts.md).

### Divergent (find what to build)

| Verb | Description |
|------|-------------|
| `/cadence:brainstorm` | Facilitated ideation — you state a challenge, generate ideas, agent keeps momentum |
| `/cadence:develop` | Convergent evaluation — PPCo, criteria, pre-mortem on Ideas |
| `/cadence:promote` | Advance an Idea to Pursuit/Project/Action (enforces graduation gates) |

### Execution (build it)

| Verb | Description |
|------|-------------|
| `/cadence:start` | Open a session on a project — curated selection or direct entry, flow protection |
| `/cadence:pause` | Save a marker (where/next/open) and suspend the session |
| `/cadence:complete` | Mark an action done — triggers upward completion prompts |
| `/cadence:cancel` | Drop a project with a reason |
| `/cadence:capture` | Flow-safe parking lot — saves a thought with no agent response |

### Reflection & output (see what you did)

| Verb | Description |
|------|-------------|
| `/cadence:reflect` | Weekly ritual — Get Clear + Get Focused |
| `/cadence:narrate` | Generate narrative — today, weekly, or pursuit arc |
| `/cadence:close` | Close a pursuit or project — cleaning ritual for unresolved Ideas |
| `/cadence:reconcile` | Quiet system health report |

### Utility

| Verb | Description |
|------|-------------|
| `/cadence:status` | System dashboard, or drill into pursuits/projects/actions |
| `/cadence:find` | Search projects, ideas, markers, captures, and pursuits by substring |
| `/cadence:help` | Browse the verb surface — catalogue, group, or single verb |
| `/cadence:init` | Bootstrap a new repo |

## Quick Navigation

Cadence is designed to be navigated from the dashboard alone — you
shouldn't need to memorize 15 verbs to get started.

**At session start**, the SessionStart hook prints the dashboard with
up to 3 contextual `Next:` suggestions ranked by your current state
(in-progress sessions, unprocessed captures, reconciler flags, reflect
cadence, on-hold pickup candidates). Follow whichever fits.

**Drill in** with `/cadence:status pursuits` (list) → `/cadence:status
<pursuit>` (its projects) → `/cadence:status <project>` (Intent +
actions). Every drill-down ends with an **Available actions** block
listing the verbs that apply to the viewed entity, so you always know
what's possible without leaving the dashboard.

**Search by substring** with `/cadence:find <text>` — searches project
IDs, intent prose, action texts, idea bodies, marker where/next/open,
capture bodies, and pursuit metadata. Results group by kind with
per-group verb hints (e.g., Projects show `/cadence:start <id>`;
Ideas show `/cadence:promote <id>`).

**Browse the verb surface** with `/cadence:help`. The catalogue is
organized by cognitive mode:

- **Diverge** — `brainstorm`, `develop`, `promote`
- **Execute** — `start`, `pause`, `complete`, `cancel`, `capture`, `waiting`
- **Reflect** — `reflect`, `narrate`, `close`, `reconcile`
- **Setup** — `init`
- **Browse** — `status`, `find`, `help`

`/cadence:help <verb>` shows a single verb's full contract;
`/cadence:help <group>` lists every verb in that group.

**Typical first session:**

```
[session start: dashboard appears]
/cadence:status build-cadence-v1   # see projects in your active pursuit
/cadence:status <project>          # see Intent and actions
/cadence:start <project>           # open a session
... do work ...
/cadence:complete <action>         # mark progress
/cadence:pause                     # save a marker, end the session
```

## The Pipeline

```
  Idea ──► Pursuit ──► Project ──► Action
   │         │           │            │
  Why?    Intent?    Concrete?   /complete
```

Three graduation gates. `brainstorm` generates Seeds. `develop` evaluates
them. `promote` advances them through the gate that matches the target level.

## Configuration

Edit `cadence.yaml` in your repo root:

```yaml
wip_limits:
  max_active_projects: 5     # in-progress projects before warning

defaults:
  someday_review: monthly
  marker_stale_days: 7
  waiting_for_grace_days: 2
  dormant_days: 14           # active projects with no marker in this many days

reflect:
  day: sunday
  duration_minutes: 30
```

## Hooks

The plugin ships its own SessionStart and PreCompact hook config in
`hooks/hooks.json`. No per-repo setup required — installing the plugin
turns these on automatically.

| Event / matcher | Command | Purpose |
|---|---|---|
| `SessionStart / startup` | `cadence status --hook-output` | Show the dashboard when Claude Code launches |
| `SessionStart / resume` | `cadence status --hook-output` | Re-show the dashboard when a session resumes |
| `SessionStart / clear` | `cadence status --hook-output` | Re-show the dashboard after `/clear` |
| `PreCompact` | `cadence pre-compact` | If a Cadence session is active, urge `/cadence:pause` before context is discarded |

The `--hook-output` flag wraps the human-readable status in a JSON
envelope (`systemMessage` for the user, `hookSpecificOutput` for the
model) — Claude Code consumes that shape; bare `cadence status`
prints the plain text for terminal use.

`cadence pre-compact` reads `.cadence/active-session.json` (written
by `/cadence:start`, cleared by `/pause`/`/complete`/`/cancel`). If
absent: silent no-op. If present: emits a systemMessage naming the
active pursuit/project and urging `/cadence:pause` so a marker
captures where/next/open before compaction discards the context.

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
  --dod "It works" --dod "Tests pass" --action "Write code"
cadence check ship-it --section action --match "Write code"
cadence write-marker --pursuit my-thing --project ship-it \
  --where "..." --next "..." --open "..."
cadence write-capture --body "stray thought"
```

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
2. `/cadence:brainstorm` — generate ideas for what to build
3. `/cadence:develop` — evaluate your ideas
4. `/cadence:promote` — turn ideas into pursuits and projects
5. `/cadence:start` — begin working on a project
6. `/cadence:reflect` — weekly review to stay focused
