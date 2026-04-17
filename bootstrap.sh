#!/usr/bin/env bash
set -euo pipefail

# Cadence Bootstrap Script
# Creates a new Cadence repo with all seed data and agent configuration.
#
# Usage:
#   ./bootstrap.sh [target-directory]
#
# Default target: ./cadence

TARGET="${1:-./cadence}"

if [ -d "$TARGET/.git" ]; then
  echo "Error: $TARGET is already a git repo. Aborting."
  exit 1
fi

echo "Bootstrapping Cadence repo in $TARGET..."

mkdir -p "$TARGET"

# --- Directory Structure ---
mkdir -p "$TARGET/.claude/commands"
mkdir -p "$TARGET/docs"
mkdir -p "$TARGET/pursuits/build-cadence-v1/projects"
mkdir -p "$TARGET/pursuits/build-cadence-v1/sessions"
mkdir -p "$TARGET/pursuits/_someday/make-cadence-public"
mkdir -p "$TARGET/pursuits/_archived"
mkdir -p "$TARGET/thoughts/unprocessed"
mkdir -p "$TARGET/thoughts/processed"
mkdir -p "$TARGET/reflections"
mkdir -p "$TARGET/narratives/drafts"
mkdir -p "$TARGET/workflows"
mkdir -p "$TARGET/src"

# --- .gitignore ---
cat > "$TARGET/.gitignore" << 'GITIGNORE'
# SQLite index (derived from markdown, rebuild with cadence rebuild-index)
.cadence.db
.cadence.db-journal
.cadence.db-wal

# Generated manifests (regenerated from markdown)
_manifest.md

# Node
node_modules/
dist/

# OS
.DS_Store
Thumbs.db
GITIGNORE

# --- cadence.yaml ---
cat > "$TARGET/cadence.yaml" << 'YAML'
# Cadence Configuration
version: 1

win_cycles:
  current: 2026-H1
  start: 2026-01-01
  end: 2026-06-30
  mid_check: 2026-04-01

defaults:
  someday_review: monthly       # how often reconciler surfaces someday pursuits
  marker_stale_days: 7          # markers older than this get flagged
  waiting_for_grace_days: 2     # days past expected date before flagging

reflect:
  day: sunday                   # preferred day for weekly Reflect
  duration_minutes: 30
YAML

# --- CLAUDE.md ---
cat > "$TARGET/CLAUDE.md" << 'CLAUDEMD'
# Cadence — Cognitive Operating System

You are operating inside a Cadence repository. Cadence manages attention,
protects flow state, and generates narrative across pursuits.

Read `docs/architecture.md` for full design decisions and rationale.

## Vocabulary

- **Pursuit**: An intentional commitment tied to values or a role/responsibility.
  Lives in `pursuits/<pursuit-id>/pursuit.md`. Lifecycle: active → someday → archived.
- **Project**: A scoped effort with a Definition of Done (checklist).
  Lives in `pursuits/<pursuit-id>/projects/<project-id>.md`.
  Status: active | on_hold | done | dropped.
- **Action**: An atomic task. A checkbox inside a project's Actions section.
- **Marker**: A session save point. Lives in `pursuits/<pursuit-id>/sessions/<timestamp>.md`.
  Captures where I was, what I was thinking, and what's next.
- **Thought**: A captured idea awaiting triage. Lives in `thoughts/unprocessed/`.
- **Reflection**: A weekly ritual artifact. Lives in `reflections/`.
- **Narrative**: Generated writing from activity data. Lives in `narratives/`.
- **Leveraged Priority**: The ONE thing that defines next week's win. Set during Reflect.
- **Definition of Done**: First-class checklist in each project. Managed through
  conversation. Project completion is derived from this checklist.
- **Reconciler**: Background process that flags stale markers, overdue waiting-for
  items, dormant projects, and structural issues.

## Agent Modes

You operate in three modes. Do not announce mode switches — just behave appropriately.

**Steward** — System-level awareness. Active during /recap, /status, /reflect.
Read the full system state. Surface what matters. Route me to the right work.
Never interrupt flow state to offer suggestions.

**Guide** — Session-level focus. Active when working on a specific project.
Stay in context. Help me make progress. When I'm done or switching, prompt
for a marker. Protect my flow — batch observations for natural breakpoints.

**Narrator** — Writing mode. Active when generating narratives, reflections,
blog posts, or summaries. Draw from markers, reflections, and project history.
Write in my voice — direct, technical, reflective.

## Conventions

### File Operations
- All paths are relative to this repo root.
- Frontmatter is YAML between `---` fences.
- Dates use ISO 8601. Timestamps in filenames use `YYYY-MM-DDTHH-MM`.
- IDs are slug-case: lowercase, hyphens, no special characters.
- Generated files (`_manifest.md`, `.cadence.db`) are gitignored.

### Session Lifecycle
1. **Entry**: Read the latest marker for the relevant pursuit/project.
   Present a "previously on..." recap. Keep it to 3-5 sentences.
2. **During**: Work normally. Note things that should go in the exit marker.
3. **Exit**: When I say I'm stopping, switching, or wrapping up — write a
   marker to `pursuits/<pursuit>/sessions/<timestamp>.md` capturing:
   where I was, what I was thinking, what's next, any loose threads.

### Creating a Project
When I describe new work, ask:
1. Which pursuit does this belong to? (suggest if obvious)
2. What does "done" look like? (translate my answer into checklist items)
3. What's the first action?

Create the project file with frontmatter, Definition of Done checklist,
and initial action(s).

### Completing a Project
When all Definition of Done items are checked:
1. Confirm with me that the project is done
2. Update `status: done` in frontmatter
3. Note the milestone — this is worth acknowledging

### Waiting For
Track in project frontmatter as structured data:
```yaml
waiting_for:
  - person: name
    what: description
    expected: YYYY-MM-DD
    flagged: false
```
The reconciler sets `flagged: true` when items are overdue.

### Thoughts
When I dump a raw idea, create a thought file in `thoughts/unprocessed/`
with the raw input and your triage suggestion. Flag uncertain routing
for review during Reflect.

### Pursuit Lifecycle
- **Active** pursuits live in `pursuits/<id>/`
- **Someday** pursuits live in `pursuits/_someday/<id>/`
- **Archived** pursuits live in `pursuits/_archived/<id>/`
- Moving between states is a file move (git mv)
- Someday pursuits can have cue metadata in frontmatter for reconciler surfacing

### File Formats
See `docs/architecture.md` for complete format specifications including
frontmatter schemas for pursuits, projects, markers, thoughts, and reflections.

### Workflows
Workflow definitions in `workflows/` describe multi-step processes like
the Reflect ritual. These are reference documents — read them when
executing the corresponding slash command.
CLAUDEMD

# --- Slash Commands ---

cat > "$TARGET/.claude/commands/recap.md" << 'CMD'
# /recap

Show me where I left off. This activates Steward mode.

## Steps

1. List all active pursuits by scanning `pursuits/` (skip `_someday/` and
   `_archived/`). For each, read `pursuit.md` frontmatter.

2. For each active pursuit, find the most recent marker in
   `pursuits/<pursuit-id>/sessions/` by filename (lexicographic sort,
   most recent last). Read the marker content.

3. For each active pursuit, scan `projects/` for active projects
   (status: active in frontmatter). Count them and note any with
   `waiting_for` entries.

4. Check `thoughts/unprocessed/` for pending thought count.

5. Check `reflections/` for the most recent reflection and whether
   its `status` is `complete`.

6. Present a curated summary using this format:

   ```
   Welcome back. Here's where things stand:

   [Leveraged Priority if set — from most recent complete reflection]

   **[Pursuit Name]** — last session [relative time]
   > [2-3 sentence recap from most recent marker's "Where I Was" section]
   > Next: [first item from marker's "What's Next" section]
   > Active projects: [count] | Waiting on: [names if any]

   [Repeat for other active pursuits, ordered by most recent session]

   [If pending thoughts > 0]: You have [N] unprocessed thoughts.
   [If reflection incomplete]: Your Week [N] reflection is unfinished.

   What would you like to work on?
   ```

7. Wait for the user's choice. When they pick a pursuit or project, read
   the full latest marker and present the detailed recap, then shift to
   Guide mode for that project.
CMD

cat > "$TARGET/.claude/commands/mark.md" << 'CMD'
# /mark

Write a session marker (save point). This is typically called at the end of
a work session, or when switching between pursuits/projects.

## Steps

1. Determine the current context:
   - Which pursuit and project was the user working on?
   - If unclear, ask.

2. Generate a timestamp for the filename: `YYYY-MM-DDTHH-MM` using current time.

3. Review the session's conversation to extract:
   - **Where I Was**: What was the user working on? What state is the work in?
   - **What I Was Thinking**: What decisions were being considered? What's
     the user's current mental model or hypothesis?
   - **What's Next**: Concrete next steps, ordered by priority.
   - **Loose Threads**: Anything noticed but not acted on. Side observations.
     Things to flag for later.
   - **Actions completed**: Any actions checked off during this session.
   - **Actions in progress**: Any actions partially done.

4. Draft the marker and show it to the user for confirmation:

   ```markdown
   ---
   pursuit: <pursuit-id>
   project: <project-id>
   session_start: <ISO-8601>
   session_end: <ISO-8601>
   actions_completed: []
   actions_in_progress: []
   ---

   # Marker: <Project or Pursuit Name>

   ## Where I Was
   [2-5 sentences]

   ## What I Was Thinking
   [Decisions, hypotheses, open questions]

   ## What's Next
   1. [Concrete next step]
   2. [Follow-up]

   ## Loose Threads
   - [Observations, side notes]
   ```

5. Write the marker to `pursuits/<pursuit-id>/sessions/<timestamp>.md`.

6. If any actions were completed, update the project file to check them off.

7. Confirm: "Marker saved. You can pick up here next time with /recap."
CMD

cat > "$TARGET/.claude/commands/reflect.md" << 'CMD'
# /reflect

Start or resume the weekly Reflect ritual. This activates Steward mode.
Reference `workflows/reflect.md` for the full ritual specification.

## Steps

1. Determine the current week number (ISO week).

2. Check if a reflection file exists for this week in `reflections/`.
   - If yes, read it. Check `status` and `phase` fields.
   - If `status: complete`, say "Your Week [N] reflection is already done.
     Want to review it or start something else?"
   - If `status: in_progress`, say "You started your Week [N] reflection
     and stopped during [phase]. Want to pick up where you left off?"
   - If no file exists, create a new one with `status: draft`.

3. **Phase 1 — Get Clear**

   a. Count unprocessed thoughts in `thoughts/unprocessed/`.
      If any, process them one by one: show the thought, suggest triage
      routing, confirm with the user. Move processed thoughts to
      `thoughts/processed/`.

   b. Scan all active projects for 2-minute actions (trivial items the user
      can knock out right now). Surface them: "These look quick — want to
      clear any of them now?"

   c. Run reconciler checks:
      - `waiting_for` items past their expected date → flag
      - Projects with no actions completed in 14+ days → flag as dormant
      - Markers older than `marker_stale_days` from cadence.yaml → flag
      - Report flags to the user for review

   d. Project relevance check: list all active projects across all pursuits.
      For each, ask "Still relevant?" Mark reviewed projects in the
      reflection file.

   e. Update the reflection file: `phase: get_clear`, mark Get Clear
      section as complete. Save after each sub-step so partial progress
      is preserved.

4. **Phase 2 — Get Focused**

   a. Generate a recap: summarize the week from markers, completed actions,
      and any narrative notes. Keep it to a paragraph.

   b. Ask "What worked well this week?" Record the answer.

   c. WIP check: count active pursuits and active projects. If pursuits > 4
      or projects > 8, flag as potentially overextended.

   d. Review waiting-for items: who owes you what, and what's your plan
      if they don't deliver?

   e. Ask: "What's the ONE thing that would make next week a win?"
      Record as the leveraged priority.

   f. Update the reflection file: `status: complete`,
      `leveraged_priority: "<their answer>"`.

5. Close with: "Reflection complete. Your leveraged priority for next week
   is: [priority]. /recap will surface this when you start your next session."
CMD

cat > "$TARGET/.claude/commands/thought.md" << 'CMD'
# /thought

Capture a raw idea and triage it. Can be used mid-session or standalone.

## Usage

The user will say something like:
- "/thought I should ask James about the custom test runner"
- "/thought What if we auto-generate test scaffolding from topology files?"
- "/thought Remember to book the campsite before May"

## Steps

1. Generate a timestamp for the filename: `YYYY-MM-DDTHH-MM`.

2. Analyze the input and suggest routing:
   - Is this an action on an existing project? (check active projects)
   - Is this a new project candidate? (too big for a single action)
   - Is this a 2-minute item? (can be done right now)
   - Is this reference material? (not actionable)
   - Rate confidence: high, medium, low.

3. Create a thought file:

   ```markdown
   ---
   captured: <ISO-8601>
   source: text
   ---

   [Raw input from the user]

   # Triage

   **Suggestion:**
   1. "[extracted action]" → [routing] (confidence: [level])
   ```

4. Present the triage suggestion to the user:
   - If confidence is high and it's an action on an existing project:
     "This sounds like an action for [project] in [pursuit]. Want me to
     add it?" If yes, add the action to the project file and move the
     thought to `thoughts/processed/`.
   - If it's a 2-minute item: "This seems quick — want to just do it now?"
   - If confidence is medium or low: "I'm not sure where this belongs.
     I'll save it for review during your next Reflect."
   - If it's a new project candidate: "This sounds bigger than a single
     action. Want to create a new project for it?"

5. Save the thought file to `thoughts/unprocessed/` (if deferred) or
   `thoughts/processed/` (if acted on immediately).
CMD

cat > "$TARGET/.claude/commands/status.md" << 'CMD'
# /status

Show a system-level overview. This is a quick health check — less detailed
than /recap, focused on numbers and flags.

## Steps

1. Scan all active pursuits and count them.

2. For each active pursuit, count active projects, done projects,
   and on_hold projects.

3. Count total unchecked actions across all active projects.

4. Count all `waiting_for` items across all projects. Flag any that
   are past their expected date.

5. Count unprocessed thoughts.

6. Find the most recent reflection and check if it's complete.
   Extract the leveraged priority if set.

7. Find the most recent marker across all pursuits. Calculate age.

8. Present a dashboard:

   ```
   Cadence Status

   Leveraged Priority: [priority or "not set"]
   Last Reflect: [date] ([complete/incomplete])
   Last Session: [relative time] on [pursuit/project]

   Pursuits: [N active] | [N someday]
   Projects: [N active] | [N on_hold] | [N done]
   Actions:  [N pending] | [N waiting]
   Thoughts: [N unprocessed]

   Flags:
   - [any overdue waiting-for items]
   - [any stale markers]
   - [any dormant projects]
   - [WIP warning if pursuits > 4]

   [If no flags]: No flags. System is healthy.
   ```
CMD

# --- Pursuit: Build Cadence v1 ---
cat > "$TARGET/pursuits/build-cadence-v1/pursuit.md" << 'PURSUIT'
---
id: build-cadence-v1
type: finite
status: active
created: 2026-04-15
target: 2026-05-15
win_cycle: 2026-H1
---

# Build Cadence v1

Build the first working version of Cadence — a cognitive operating system
that manages attention, protects flow state, and generates narrative. This
is the proving ground for demonstrating AI-augmented engineering leadership
before starting as Tech Lead at Nexthop AI.

The goal is a system that works from day one at the new job: tracking
onboarding pursuits, capturing thoughts, generating weekly reflections,
and producing the first 90-day narrative.

Cadence is also its own first user — this pursuit and its projects ARE
Cadence data, used as both real tracking and test fixtures.
PURSUIT

# --- Projects ---
cat > "$TARGET/pursuits/build-cadence-v1/projects/define-data-format.md" << 'PROJECT'
---
id: define-data-format
pursuit: build-cadence-v1
status: active
created: 2026-04-15
---

# Define Data Format

## Definition of Done
- [x] Hierarchy decided (Pursuit > Project > Action)
- [x] Pursuit file format with frontmatter schema
- [x] Project file format with Definition of Done as first-class checklist
- [x] Marker file format with session context sections
- [x] Thought file format with triage suggestion
- [x] Reflection file format that serves as its own checkpoint
- [x] Persistence model decided (markdown source of truth + SQLite cache)
- [x] Directory layout designed with lifecycle directories
- [x] Session levels defined (project, pursuit, orchestrator)
- [ ] Formats validated by writing real seed data

## Actions
- [x] Draft initial state examples (markdown format exploration)
- [x] Evaluate markdown vs SQLite vs hybrid persistence
- [x] Decide on hybrid: markdown source of truth, SQLite as derived index
- [x] Design directory layout with per-pursuit markers and projects
- [x] Define project file format with DoD checklist and waiting_for
- [x] Define marker format for session save points
- [x] Define reflection format as self-checkpointing artifact
- [x] Design pursuit lifecycle (active / someday / archived)
- [x] Decide against standby state — someday with cues is sufficient
- [x] Design session levels (project, pursuit, orchestrator)
- [ ] Write seed pursuit and project files for build-cadence-v1
- [ ] Validate formats work with Claude Code slash commands

## Notes
Key insight from the architecture session: the reflection file IS the
orchestrator's marker. Its status/phase fields tell the agent exactly
where you stopped in the Reflect ritual. No separate checkpoint needed.

Another insight: Definition of Done should be conversationally managed.
The agent asks "what does done look like?" at project creation, translates
natural language into checklist items, and derives project completion from
the checklist state.

Decided against people and tags on project files for v1 — keep it simple.
waiting_for is the only structured relationship, and it carries person data.
PROJECT

cat > "$TARGET/pursuits/build-cadence-v1/projects/implement-agent-skills.md" << 'PROJECT'
---
id: implement-agent-skills
pursuit: build-cadence-v1
status: active
created: 2026-04-17
---

# Implement Agent Skills

## Definition of Done
- [ ] CLAUDE.md teaches agent the full Cadence vocabulary and conventions
- [ ] /recap shows curated session entry with pursuit/project status
- [ ] /mark writes a well-structured session marker
- [ ] /reflect walks through the full Get Clear + Get Focused ritual
- [ ] /thought captures and triages a raw idea
- [ ] /status shows a system health dashboard
- [ ] Agent naturally prompts for markers on session exit
- [ ] All commands work against real seed data in this repo

## Actions
- [x] Draft CLAUDE.md with vocabulary, modes, and conventions
- [x] Draft /recap command
- [x] Draft /mark command
- [x] Draft /reflect command
- [x] Draft /thought command
- [x] Draft /status command
- [ ] Test /recap against seed data — does the output make sense?
- [ ] Test /mark — write a real marker for this session
- [ ] Test /thought — capture a test thought and verify triage
- [ ] Test /status — verify dashboard output
- [ ] Iterate on command prompts based on testing
- [ ] Test /reflect — run a mock Reflect ritual

## Notes
Starting with pure skills (agent reads/writes markdown directly). No CLI
or MCP needed yet. The commands ARE the implementation for Phase 1.

If a command is too slow or error-prone as pure agent instructions, that's
the signal to extract it into CLI tooling (the build-indexer project).
PROJECT

cat > "$TARGET/pursuits/build-cadence-v1/projects/build-indexer.md" << 'PROJECT'
---
id: build-indexer
pursuit: build-cadence-v1
status: on_hold
created: 2026-04-17
---

# Build Indexer

## Definition of Done
- [ ] CLI command rebuilds SQLite index from markdown files
- [ ] CLI command generates _manifest.md at repo root and per-pursuit
- [ ] Index rebuild completes in under 1 second for typical repo size
- [ ] Slash commands updated to use CLI where it improves performance

## Actions
- [ ] Identify which slash commands are too slow as pure agent skills
- [ ] Design SQLite schema based on actual query needs
- [ ] Implement indexer in TypeScript
- [ ] Implement manifest generator
- [ ] Update CLAUDE.md to reference CLI commands

## Notes
On hold until the pure skills approach (implement-agent-skills) reveals
which operations need extraction to CLI tooling. Don't build the indexer
until we know what queries actually matter in practice.

The indexer should be a TypeScript CLI — `npx cadence rebuild-index` or
similar. SQLite and _manifest.md files are gitignored.
PROJECT

cat > "$TARGET/pursuits/build-cadence-v1/projects/bootstrap-personal-repo.md" << 'PROJECT'
---
id: bootstrap-personal-repo
pursuit: build-cadence-v1
status: on_hold
created: 2026-04-17
---

# Bootstrap Personal Repo

## Definition of Done
- [ ] Separate repo created for personal Cadence data
- [ ] Personal pursuits migrated from any scratch notes
- [ ] Nexthop onboarding pursuit created with initial projects
- [ ] Slash commands and CLAUDE.md work in the personal repo
- [ ] This repo (cadence) retains its own pursuit data as test fixtures

## Actions
- [ ] Decide how personal repo references cadence tooling
- [ ] Create personal repo with same directory structure
- [ ] Create "Establish AI Test Framework at Nexthop" pursuit
- [ ] Create "Be a Present Father" pursuit
- [ ] Verify /recap works in the new repo

## Notes
On hold until implement-agent-skills is validated. The personal repo
should be a clean clone of the directory structure with its own CLAUDE.md
that references the cadence repo's conventions.

Key question to resolve: does the personal repo copy the slash commands
and CLAUDE.md, or does it reference them from the cadence repo? Copying
is simpler but creates drift. Referencing requires a mechanism (symlinks,
git submodule, or npm package).
PROJECT

# --- Someday Pursuit ---
cat > "$TARGET/pursuits/_someday/make-cadence-public/pursuit.md" << 'PURSUIT'
---
id: make-cadence-public
type: someday
status: someday
created: 2026-04-17
cue:
  trigger: review
  review: monthly
---

# Make Cadence Public

Open-source Cadence as a framework others can use. Write about the design
philosophy, publish the repo, build a community around cognitive operating
systems for technical leaders.

Depends on Cadence being validated through personal use first. Don't
ship a framework — ship a tool that works, then extract the framework.
PURSUIT

# --- Reflect Workflow ---
cat > "$TARGET/workflows/reflect.md" << 'WORKFLOW'
# Reflect Workflow

*The weekly ritual. ~30 minutes. Anchored to win cycles.*

---

## Overview

Reflect has two phases. Get Clear ensures nothing is falling through the
cracks. Get Focused sets the direction for next week. The reflection file
serves as its own checkpoint — if you stop mid-ritual, the agent can see
exactly where you left off and resume.

## Phase 1 — Get Clear

**Purpose:** Process everything that's accumulated. Restore trust in the system.

### Steps
1. **Process thoughts** — Review each unprocessed thought. Triage: route to
   a project as an action, create a new project, defer, or discard.
2. **Clear 2-minute items** — Surface trivial actions from active projects.
   Do them now or consciously defer them.
3. **Review reconciler flags** — Check for:
   - Waiting-for items past their expected date
   - Projects with no activity in 14+ days
   - Markers older than the stale threshold
   - Orphaned actions or structural issues
4. **Project relevance check** — Review every active project. Is it still
   relevant? Should it be on_hold, dropped, or restructured?

### Completion
Phase 1 is complete when all thoughts are processed, flags are reviewed,
and every project has been confirmed as relevant or acted on.

## Phase 2 — Get Focused

**Purpose:** Step back and see the whole picture. Set one priority.

### Steps
1. **Recap** — System-generated summary of the week: what was accomplished,
   what changed, what's in flight.
2. **What worked** — User reflects on what approaches, habits, or decisions
   were effective. Captured in the reflection file.
3. **WIP check** — Count active pursuits and projects. Flag if overextended
   (guideline: 3-4 active pursuits, 6-8 active projects).
4. **Waiting-for review** — Who owes you what? What's your escalation plan?
5. **Leveraged priority** — Commit to ONE thing that defines next week's win.
   This should be the highest-leverage action — the thing that unblocks the
   most other work or creates the most value.

### Completion
Phase 2 is complete when the leveraged priority is set.

---

## Win Cycles

Reflect is anchored to 6-month win cycles (H1/H2). Each cycle has a theme
or set of goals, a mid-cycle check-in, and an end-of-cycle review.

The leveraged priority should connect to the current win cycle's goals.

---

## Customization (future)

This workflow is a markdown file. Users can modify the steps, add phases,
or create alternative workflows. The agent reads the workflow file when
executing the corresponding slash command.
WORKFLOW

# --- Keep empty dirs in git ---
touch "$TARGET/pursuits/build-cadence-v1/sessions/.gitkeep"
touch "$TARGET/pursuits/_archived/.gitkeep"
touch "$TARGET/thoughts/unprocessed/.gitkeep"
touch "$TARGET/thoughts/processed/.gitkeep"
touch "$TARGET/reflections/.gitkeep"
touch "$TARGET/narratives/drafts/.gitkeep"
touch "$TARGET/src/.gitkeep"

# --- Init git ---
cd "$TARGET"
git init
git add -A
git commit -m "Bootstrap Cadence repo

Initial structure with seed pursuit (Build Cadence v1), four projects,
agent configuration (CLAUDE.md + slash commands), and reference docs.

This repo is Cadence's own first user — the pursuit data tracks building
the tool itself and doubles as test fixtures."

echo ""
echo "✓ Cadence repo bootstrapped at $TARGET"
echo ""
echo "Next steps:"
echo "  cd $TARGET"
echo "  claude"
echo "  Then type: /recap"
echo ""
echo "Or paste the bootstrap prompt from docs/bootstrap-prompt.md"
