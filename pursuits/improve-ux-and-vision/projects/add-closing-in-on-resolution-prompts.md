---
id: add-closing-in-on-resolution-prompts
pursuit: improve-ux-and-vision
status: on_hold
created: 2026-05-01
---

# Add Closing-In-On-Resolution Prompts

During build-cadence-v1, several finalizing projects had to be inserted manually as the pursuit approached completion (audit-and-validate-v1, define-narrate-cadence-contracts, surface-recent-activity-in-splash). Closing work was discovered late, not anticipated. The user wants Claude to prompt for 'what would need to be true for this pursuit to close?' as an expected lifecycle moment so finalization becomes a planned phase rather than surprise-discovered.

## Intent

Add a lifecycle prompt that fires when a pursuit approaches resolution, asking 'what would need to be true for [pursuit] to close?' so finalizing work (audit, narrative, demo, validation queue review) is surfaced as a planned phase rather than discovered late. Trigger criteria: pursuit has 1-2 projects left active OR all remaining projects' actions are mostly checked. The reconciler already has a pursuit_near_completion flag; this project extends that into an actionable prompt that fires during /complete on the last action of a project on a near-closing pursuit. The prompt is suggestion, not block. The suggestion list is curated and domain-neutral (audit, narrative, demo, validation queue review) so it works for non-dev pursuits. Done feels like: pursuits close cleanly because finalizing work was anticipated; the closure ritual itself becomes a checkpoint of 'are we truly done?' rather than 'wait, we missed X.'

## Actions

- [ ] Define and tune the trigger criteria for 'pursuit approaching resolution': N projects left active, M% of actions checked across remaining projects, recent activity rate. Extend the reconciler's existing pursuit_near_completion logic. Settle on a heuristic that errs toward earlier surfacing (better to ask early).
- [ ] Update the reconciler check to fire a closing_in_on_resolution flag with the actionable prompt content when criteria are met. Surface in /status output and SessionStart hook output.
- [ ] Update /complete skill: when completing the last action of a project on a near-closing pursuit, agent surfaces 'What would need to be true for [pursuit] to close? Common finalizing work to consider: audit (does the implementation match the intent?), narrative (capture the arc), demo (prepare to show others), validation review (clear the pending-validations queue). Add finalizing projects, or are we close enough to /resolve?' Suggestion, not block.
- [ ] Update cadence-runtime.md (Upward Completion section) and verb-contracts.md (Complete contract) to document the new lifecycle prompt as expected behavior, not bonus.
- [ ] Update or extend the complete-upward user journey YAML to cover the new prompt behavior.
