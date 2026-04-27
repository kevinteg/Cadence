---
id: update-journeys-for-schema
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Update Journeys for Canonical Schema

Bring the 7 journey YAMLs in journeys/ up to date with the canonical data model. Surfaced when the journey suite was run end-to-end against the rewritten skills: every journey failed at least one assertion, and every failure traced to journey-spec staleness rather than skill bugs.

## Definition of Done

- [x] All 7 journey YAMLs use state: for idea fixtures and assertions (was stage:)
- [x] idea-closure asserts on state: closed + closed_reason: instead of a non-existent resolution: field; step 2 closes both ideas uniformly so assertions are clean
- [x] contains: assertions match project IDs the skills actually render (was matching title: body text the skills don't print)
- [x] capture-flow-safe teardown narrowed to thoughts/unprocessed/*.md plus assert_clean so any captures the skill writes get cleared
- [x] All 7 journeys pass end-to-end against the rewritten skills
- [x] git status clean after journey runs (no leaked test fixtures)

## Actions

- [x] Run journey suite via subagent; collect failure reasons
- [x] Categorize failures: skill bug vs. schema staleness
- [x] Update core-session-loop.yaml (project ID assertion)
- [x] Update complete-upward.yaml (project ID assertion)
- [x] Update capture-flow-safe.yaml (project ID + teardown glob)
- [x] Update brainstorm-develop-promote.yaml (stage → state)
- [x] Update cancel-with-ideas.yaml (stage → state, project ID)
- [x] Update idea-closure.yaml (stage → state, replace resolution: assertions with state: closed + closed_reason)
- [x] Update reconciler-flags.yaml (project IDs in flag assertions)
- [x] Re-run journey suite; confirm 7/7 PASS
