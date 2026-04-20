---
id: define-user-journeys
pursuit: build-cadence-v1
status: done
created: 2026-04-17
---

# Define User Journeys

## Definition of Done
- [x] Format defined for scripted user journeys (command sequences + assertions)
- [x] At least one journey covering the core loop: /select → work → /mark → /select
- [x] Journey runner implemented that parses YAML and executes steps
- [x] Claude Code can run a journey end-to-end and report pass/fail without human input

## Actions
- [x] Draft the journey format
- [x] Write a journey for the core session loop (/select → work → /mark → /select)
- [x] Implement the journey runner
- [x] Test the journey runner against the core-session-loop journey

## Notes
Originated from thought captured during implement-agent-skills testing.
The goal is automated end-to-end validation of slash commands so iteration
doesn't require constant oversight.
