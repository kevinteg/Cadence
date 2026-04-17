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
