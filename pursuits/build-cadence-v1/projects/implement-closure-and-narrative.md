---
id: implement-closure-and-narrative
pursuit: build-cadence-v1
status: done
created: 2026-04-21
---

# Implement Closure, Narrative, Reconcile, Reflect Updates

## Definition of Done
- [x] `/close` skill: pursuit closure with absolute block on unresolved Ideas — walks each (move/close/promote/develop-first)
- [x] `/close` skill: project closure with override-with-reason for unresolved Ideas
- [x] Cancellation walks the cleaning ritual regardless of type
- [x] Closure feeds the Pursuit/Project Narrative
- [x] `/narrate` skill: no arg → today's activity, with pursuit → full arc, `week` → weekly narrative
- [x] Narrate follows McAdams structure: what happened / what it meant / what shifted / what's next
- [x] Narrate is informational not evaluative — no praise, "what" not "why"
- [x] `/reconcile` skill: standalone quiet report, extends reconciler with aging Seeds, unpromoted Developed Ideas, growing backlog ratio, long-running Projects (propose split-or-promote), pursuit-completion-proximity
- [x] `/reflect` updated: language rules (what not why), no evaluative praise, if-then Nudge generation, reconciler pre-generates inputs, WIP check uses max_active_projects (in-progress only)
- [x] All skills follow verb contracts and ship in plugin

## Actions
- [x] Create close SKILL.md with cleaning ritual for pursuits and projects
- [x] Create narrate SKILL.md with McAdams structure and scope options
- [x] Create reconcile SKILL.md as standalone quiet report
- [x] Update reflect SKILL.md with language rules, guardrails, if-then Nudges
- [x] Update reconciler workflow with Idea-aware checks and long-running Project detection
- [x] Add close, narrate, reconcile skills to plugin
- [x] Update plugin reflect skill
- [x] Copy updated reconciler and reflect workflows to plugin
- [ ] Test pursuit closure with Ideas walk-through
- [ ] Test narrate output for McAdams structure compliance

## Notes
Testing deferred — requires user interaction and real Ideas data to validate
closure rituals and narrative generation.
