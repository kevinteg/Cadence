---
id: define-data-format
pursuit: build-cadence-v1
status: done
created: 2026-04-15
---

# Define Data Format

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
- [x] Write seed pursuit and project files for build-cadence-v1
- [x] Validate formats work with Claude Code slash commands

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
