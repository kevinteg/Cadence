---
id: implement-waiting-verb
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Implement /waiting verb

Add a /waiting verb so users can record external blockers conversationally. The CLI already shipped add-waiting-for and the reconciler flagged overdue items, but no skill exposed an input path — making the feature dead-on-arrival. This project closes the input-side gap so blockers are reachable from the verb surface.

## Definition of Done

- [x] /waiting skill written with three-question conversational gather (person, what, expected) and relative-date resolution
- [x] Skill skips any field the user supplied in the opening message and refuses on done/dropped projects
- [x] Verb contract added to workflows/verb-contracts.md (Tone / Behavior / No-arg entry / Guardrails / Exit)
- [x] Runtime verb roster updated to include waiting; Waiting For convention section points at /waiting verb

## Actions

- [x] Wrote cadence-plugin/skills/waiting/SKILL.md
- [x] Added Waiting section to cadence-plugin/workflows/verb-contracts.md
- [x] Updated cadence-plugin/cadence-runtime.md verb listing and Waiting For doc
