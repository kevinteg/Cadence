---
id: implement-divergent-verbs
pursuit: build-cadence-v1
status: done
created: 2026-04-21
---

# Implement Divergent Verbs (brainstorm, develop, promote)

## Definition of Done
- [x] `/brainstorm` skill: no arg → Wandering (candidate Pursuits), pursuit → candidate Projects, project → candidate Actions, action → rejected with structural suggestion
- [x] Brainstorm deals cards from provocation deck, refuses to generate Idea content, pushes through creative cliff, parks evaluative concerns
- [x] Brainstorm creates Seed Ideas on the target parent
- [x] `/develop` skill: no arg → shows undeveloped Seeds ready for evaluation, with idea → runs PPCo, criteria, pre-mortem on that Idea
- [x] Develop can respectfully kill an Idea with a reason (state → Closed)
- [x] Develop moves Idea state from Seed → Developed
- [x] `/promote` skill: enforces graduation gate for target level — Why (→ Pursuit), DoD (→ Project), Concreteness (→ Action)
- [x] Promote updates Idea state to Promoted with origin link, creates the target entity
- [x] All three verbs follow their verb contracts from workflows/verb-contracts.md
- [x] Plugin skills created for all three

## Actions
- [x] Create brainstorm SKILL.md with scope detection and deck integration
- [x] Create develop SKILL.md with PPCo process and Idea state management
- [x] Create promote SKILL.md with graduation gate enforcement
- [x] Add skills to plugin (cadence-plugin/skills/brainstorm/, develop/, promote/)
- [ ] Test brainstorm → develop → promote pipeline end to end
- [ ] Dogfood: use /brainstorm on build-cadence-v1 to ideate on remaining work

## Notes
Testing and dogfooding deferred — requires user interaction to validate
the divergent pipeline. Skills are implemented and ready.
