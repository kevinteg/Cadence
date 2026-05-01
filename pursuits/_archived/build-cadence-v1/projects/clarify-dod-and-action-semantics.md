---
id: clarify-dod-and-action-semantics
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Clarify Dod And Action Semantics

Two clarifications to fix observed confusion. (1) Definition of Done items are high-level exit criteria — user acceptance check, journey suite passes, key validations — distinct from Actions, which are atomic tasks the agent or user does. Today many projects mix the two, so DoD bloats with implementation steps. (2) Newly-created projects default to status: on_hold and only flip to active when /start opens a session or when the first action is checked off. The CLI also rejects creation with zero actions, since a project with no concrete first move is just an Idea.

## Actions

- [x] Update cadence-runtime.md with the DoD-vs-Action conceptual split and the on_hold-by-default project lifecycle rule
  - Expanded scope to include CLAUDE.md, src/write/project.ts, src/write/edits.ts, /start SKILL, plus 4 new unit tests
