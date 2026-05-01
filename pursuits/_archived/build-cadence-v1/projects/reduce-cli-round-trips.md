---
id: reduce-cli-round-trips
pursuit: build-cadence-v1
status: done
created: 2026-04-28
---

# Reduce Cli Round Trips

## Intent

Cadence's skills do many things one-at-a-time when bulk operations would be clearer and cheaper. The recent session repeatedly hit patterns like: adding 5 actions to a new project = 5 separate `cadence add-item` calls; checking off 6 DoD items = 6 `cadence check` calls; `/start` runs `cadence report` AND `cadence markers` separately when one combined call would do; `/complete` mutates via `cadence check` then re-fetches via `cadence project` to read updated progress when the write itself could return that progress. Each round trip costs an LLM turn (with full context) plus a CLI invocation.

Audit the skill + CLI surface for redundant or batch-able patterns; ship the bulk subcommands and combined-fetch responses that meaningfully reduce turn count without harming clarity.

Done when a representative flow (creating a project with multiple actions and validating it; or completing a multi-action project) takes visibly fewer turns and CLI invocations than the current baseline, and the audit captures any patterns intentionally left as one-at-a-time (e.g., per-action notes that need agent commentary between calls).

## Actions

- [x] Audit skills and CLI for round-trip wastefulness — list every observed loop and every duplicated call, with a proposed fix and effort estimate
  - Audit complete. Tier-1 (high value, low effort): A=bulk add-items/check-items, B=mutating commands return progress, C=Notes-section support. Tier-2 (medium): D=project --include-pursuit, E=atomic promote-idea. Tier-3 deferred: report-with-marker-bodies (payload bloat), per-idea state batching (interactive UX would suffer), scan/report consolidation (marginal). Estimated impact: A+B+C alone would have collapsed yesterday's 9-project sprint by ~40-60 LLM turns. Subagent extraction (narrator, reconciler) just shipped covers the agent-side analog — main thread no longer pulls bulk JSON for /narrate or /reconcile.
- [x] Add bulk-edit CLI subcommands: cadence add-items and cadence check-items (Tier-1 A) — accept --section + repeated --text/--match — with unit tests
- [x] Extend mutating commands (check, add-item, set-status, write-marker, add-waiting-for, flag-waiting-for) to include post-mutation actionProgress + dodProgress in their JSON response (Tier-1 B); update existing tests
- [x] Add Notes-section support to add-item (or new add-note) — append paragraphs to ## Notes (Tier-1 C); add unit tests
- [x] (optional, Tier-2 D) Add --include-pursuit flag to cadence project returning upward chain in one call; unit tests
  - Implemented as --include-pursuit flag on set-status (the mutating command), not on cadence project (the read command). Rationale: post-Tier-1-B, the only remaining round-trip in /complete's flow is the pursuit-level upward-completion check after marking a project done. Putting --include-pursuit on set-status eliminates that call directly. SetProjectStatusResult now optionally includes a PursuitSummary {id, projects, done, total, allResolved}. New test 'setProjectStatus with include_pursuit returns the pursuit summary in one call'. 57/57 tests pass; bundle 622.7kb.
- [x] (optional, Tier-2 E) Add atomic cadence promote-idea command (creates target entity + sets idea state in one write); unit tests
  - Deferred to its own focused project. Rationale: atomic promote-idea has real surface area (3 promotion paths: idea→pursuit, idea→project, idea→action × the existing creators/state-setters), and the win is concentrated in /promote which is already an interactive low-frequency flow. Better as a separate small project once we hit the friction in real use. Captured here so it's not lost. Suggested follow-up project slug: atomic-promote-idea.
- [x] Update consuming skills (promote, complete, pause, cancel, close, start) to use the new APIs where they help
  - Updated skills/complete (uses check-items for batch check-offs; reads actionProgress from check response without re-fetch; uses set-status --include-pursuit to skip the pursuit upward fetch); skills/pause (step 5 batches uncommitted action checks via check-items); skills/promote (Idea→Project gate notes --action is repeatable + add-items for post-create bulk); skills/cancel (set-status --status dropped now uses --include-pursuit, eliminating the step-7 pursuit fetch). Also updated cadence-reference.md Creating-a-Project recipe (now uses --intent not --description; mentions add-items for bulk) and Completing-a-Project recipe (notes the no-refetch pattern + --include-pursuit on set-status). Skills NOT updated: /close (closure ritual is per-idea interactive; bulk worsens UX), /start (read-only), /init (filesystem mkdir's, not CLI mutations). 57/57 tests pass.
- [x] Rebuild bundle; full test suite passes; backwards-parsing verified against existing 30+ project files
- [x] User-story validation: replay a representative flow (create project with 5 actions via add-items; check-off all via check-items; complete) and document turn-count reduction in project notes
  - Executed against a temp test-bulk-flow project on the wandering pursuit. New flow: 3 CLI calls (create-project with 5 --action flags; check-items with 5 --match; set-status --status done --include-pursuit). Old flow same shape: 9 calls (or 14 if actions were added one-by-one). Reduction: 9 → 3 (-67%) bundled, 14 → 3 (-79%) one-by-one. Full breakdown in project Notes.

## Notes

Tier-1 A/B/C shipped together (one cohesive set of changes to src/write/edits.ts, src/write/checklist.ts, src/cli.ts, plus 6 new tests in test/write.test.ts). New CLI subcommands: `cadence add-items` and `cadence check-items` (accept --section plus repeated --text/--match). Mutating commands (`addItem`, `addItems`, `checkItem`, `checkItems`) now return `dodProgress` and `actionProgress` in their JSON, eliminating the post-mutate refetch pattern. `add-item --section notes` appends paragraphs to the ## Notes section (creates the section if absent). All 56 tests pass; bundle rebuilt to 621.4kb. This Notes paragraph itself was written via the new add-item --section notes — eating our own dog food.

User-story validation flow (executed 2026-04-29):

Representative flow: create a project with 5 actions, check them all off, mark done.

NEW flow — 3 CLI calls:
1. cadence create-project test-bulk-flow --pursuit wandering --intent '...' --action 'A1' --action 'A2' --action 'A3' --action 'A4' --action 'A5'
2. cadence check-items test-bulk-flow --pursuit wandering --section action --match 'A1' --match 'A2' --match 'A3' --match 'A4' --match 'A5'
3. cadence set-status test-bulk-flow --pursuit wandering --status done --include-pursuit

Each call's response carried what the next step needed: check-items returned actionProgress {done: 5, total: 5} + promoted: true (no project re-fetch); set-status --include-pursuit returned the pursuit summary {id, projects, done, total, allResolved: true} (no pursuit re-fetch).

OLD flow same shape — 9 CLI calls:
1. cadence create-project (with 5 --action flags) — same
2-6. cadence check × 5 (separate calls)
7. cadence project --json (re-fetch progress)
8. cadence set-status --status done
9. cadence pursuit --json (upward fetch)

If actions were added one-by-one (no bundling on create), OLD becomes 14 calls (5 add-item + 5 check + 1 project + 1 set-status + 1 pursuit + 1 create-project).

Reduction: 9 → 3 (-67%) for the bundled-actions case; 14 → 3 (-79%) for the one-by-one case. Each saved CLI call also removes one LLM turn with full context, since each Bash invocation in a skill = one turn.
