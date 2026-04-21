---
id: implement-reconciler
pursuit: build-cadence-v1
status: done
created: 2026-04-20
---

# Implement Reconciler

## Definition of Done
- [x] Detect waiting_for items past `expected` + `waiting_for_grace_days` (from cadence.yaml), set `flagged: true`
- [x] Detect dormant projects (active, no marker/action activity in 14+ days)
- [x] Detect stale markers (most recent marker per project older than `marker_stale_days`)
- [x] Detect structural issues (empty DoD, projects with all actions done but status not `done`)
- [x] Surface someday pursuit cues whose trigger conditions are met
- [x] /reflect Get Clear step 3c presents reconciler flags with suggested actions
- [x] /status Flags section uses reconciler output
- [x] Tested against real data with at least one synthetic flag scenario

## Actions
- [x] Define reconciler flag output format (type, severity, entity, suggested action)
- [x] Implement waiting_for overdue detection in /status and /reflect
- [x] Implement dormant project detection (scan markers for last activity date)
- [x] Implement stale marker detection (compare most recent marker age per project)
- [x] Implement structural checks (empty DoD, all-done-but-not-closed)
- [x] Implement someday cue surfacing (scan pursuits/_someday/ cue metadata)
- [x] Update /reflect Get Clear step 3c to present flags with suggested actions
- [x] Update /status Flags section to use systematic reconciler checks
- [x] Test reconciler against real build-cadence-v1 data

## Notes
The reconciler is already referenced by /cadence:status (Flags section),
/cadence:reflect (step 3c), and CLAUDE.md (waiting_for conventions) — but
the detection logic was unimplemented at time of this project. The agent
was doing ad-hoc best-effort counting.

This is pure agent skill work — the reconciler logic lives in the slash
command definitions, not in external tooling. The agent reads markdown
files, applies the rules from cadence.yaml, and reports flags.

Thresholds from cadence.yaml:
- `marker_stale_days: 7`
- `waiting_for_grace_days: 2`
- `someday_review: monthly`

> **v3 note:** /status and /reflect are now namespaced as /cadence:status
> and /cadence:reflect in the v3 verb-based command surface. The reconciler
> logic itself is unchanged.
