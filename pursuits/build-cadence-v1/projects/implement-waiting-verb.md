---
id: implement-waiting-verb
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Implement /waiting verb

Add a /waiting verb so users can record external blockers conversationally. The CLI already shipped add-waiting-for and the reconciler flagged overdue items, but no skill exposed an input path — making the feature dead-on-arrival. This project closes the input-side gap so blockers are reachable from the verb surface.

## Actions

- [x] Wrote cadence-plugin/skills/waiting/SKILL.md
- [x] Added Waiting section to cadence-plugin/workflows/verb-contracts.md
- [x] Updated cadence-plugin/cadence-runtime.md verb listing and Waiting For doc
