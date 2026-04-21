---
id: ideas-and-wandering
pursuit: build-cadence-v1
status: done
created: 2026-04-21
---

# Ideas Data Model and Wandering

## Definition of Done
- [x] Idea file format defined: frontmatter with id, parent, state (seed/developed/promoted/moved/closed), created, optional developed_at, promoted_to, closed_reason
- [x] Ideas live in `pursuits/<pursuit-id>/ideas/<idea-id>.md`
- [x] `_seeds/` directory at repo root holds unparented ideas
- [x] Wandering pursuit auto-created: standing pursuit that never closes, default parent for unattached ideas
- [x] `/cadence:init` skill updated to create Wandering pursuit and _seeds directory
- [x] Idea state transitions documented in runtime or verb-contracts
- [x] Reconciler updated to detect: aging Seeds, unpromoted Developed Ideas, growing backlog ratio

## Actions
- [x] Design Idea file format with frontmatter schema
- [x] Create `_seeds/` directory convention in repo structure
- [x] Create Wandering pursuit template for init
- [x] Update init SKILL.md to create Wandering and _seeds
- [x] Document Idea lifecycle in cadence-runtime.md (Seed → Developed → Promoted/Moved/Closed)
- [x] Update reconciler workflow with Idea-specific checks
- [x] Update plugin files (runtime, init skill, reconciler workflow)

## Notes
Ideas are adjacent to the Pursuit/Project/Action stack, not part of it.
Every Idea has a parent — either a Pursuit or Wandering. Unparented
ideas (captured outside any context) go to _seeds/ until triaged.
