# Cadence Plugin

Cognitive operating system for Claude Code. Manages attention, protects
flow state, separates the modes of thought, and generates narrative
across pursuits.

## Installation

### 1. Create your repo and install the plugin

```bash
mkdir my-cadence && cd my-cadence
git init
```

Start Claude Code with the plugin:
```bash
claude --plugin-dir /path/to/cadence-plugin
```

### 2. Set up CLAUDE.md

Create a `CLAUDE.md` in your repo root that imports the runtime:

```markdown
@/path/to/cadence-plugin/cadence-runtime.md
```

Replace `/path/to/` with the absolute path to the plugin directory.

### 3. Bootstrap with /cadence:init

Run `/cadence:init` in Claude Code. This will:
- Create the directory structure (pursuits/, ideas, Wandering, etc.)
- Generate cadence.yaml with default configuration
- Walk you through creating your first pursuit and project
- Set up .gitignore entries for generated files

After init completes, you're ready to use `/cadence:start` to begin
your first session.

## Verbs

The core command surface. One voice, verb-defined register.

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
| `/cadence:init` | Bootstrap a new repo |

## The Pipeline

```
  Idea ──► Pursuit ──► Project ──► Action
   │         │           │            │
  Why?      DoD?     Concrete?   /complete
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
