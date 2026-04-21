---
id: implement-lifecycle-verbs
pursuit: build-cadence-v1
status: done
created: 2026-04-21
---

# Implement Lifecycle Verbs

Replace "do" with explicit lifecycle verbs: start, pause, complete, cancel.
Completion flows upward from actions to projects to pursuits. Active entities
with no open items must be resolved immediately.

## Definition of Done

- [x] Implement `/start` skill (session open, recap, flow protection)
- [x] Implement `/pause` skill (marker write, session suspend)
- [x] Implement `/complete` skill (mark action done, optional note, trigger upward completion prompt)
- [x] Implement `/cancel` skill (drop project with reason)
- [x] Remove `/do` skill
- [x] Update runtime to enforce "no open items = must resolve" constraint
- [x] Update user journeys to cover start/pause/complete/cancel flows
- [x] Test journeys pass

## Actions

- [x] Draft skill prompts for start, pause, complete, cancel
- [x] Implement /start skill
- [x] Implement /pause skill
- [x] Implement /complete skill
- [x] Implement /cancel skill
- [x] Remove /do skill and references
- [x] Update cadence-runtime.md for new verb set and upward completion
- [x] Update verb-contracts.md with new verb contracts
- [x] Write user journeys for lifecycle verb flows
- [x] Run journey tests

## Notes

Originated from idea: start-complete-verbs (wandering)
