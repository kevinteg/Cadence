---
id: ideas-and-wandering
pursuit: build-cadence-v1
status: done
created: 2026-04-21
---

# Ideas Data Model and Wandering

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
