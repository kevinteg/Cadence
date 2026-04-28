---
id: clarify-dod-and-action-semantics
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Clarify Dod And Action Semantics

Two clarifications to fix observed confusion. (1) Definition of Done items are high-level exit criteria — user acceptance check, journey suite passes, key validations — distinct from Actions, which are atomic tasks the agent or user does. Today many projects mix the two, so DoD bloats with implementation steps. (2) Newly-created projects default to status: on_hold and only flip to active when /start opens a session or when the first action is checked off. The CLI also rejects creation with zero actions, since a project with no concrete first move is just an Idea.

## Definition of Done

- [x] Runtime (cadence-runtime.md) and CLAUDE.md make the DoD-vs-Action distinction explicit, with at least one worked example showing what belongs where
- [x] cadence create-project rejects input with zero actions and surfaces a clear error
- [x] New projects default to status: on_hold; promotion to active happens only via /cadence:start or when the first action is checked off
- [x] All 7 journey tests pass after the change
- [x] User-story validation: create a project with one action via the CLI, confirm status is on_hold; run /cadence:start on it, confirm status flips to active; check off the action and confirm the flip works from the check path too

## Actions

- [x] Update cadence-runtime.md with the DoD-vs-Action conceptual split and the on_hold-by-default project lifecycle rule
  - Expanded scope to include CLAUDE.md, src/write/project.ts, src/write/edits.ts, /start SKILL, plus 4 new unit tests
