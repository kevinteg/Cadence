---
id: surface-in-progress-pursuits-in-status
pursuit: improve-ux-and-notebook-integration
status: active
created: 2026-05-26
---

# Surface in-progress pursuits in status output

## Intent

The current `cadence status` dashboard surfaces pursuits by lifecycle: an `## Active Pursuits` section per active pursuit, and an `## On Hold Pursuits` table for `lifecycle: someday` pursuits. Pursuit-level progress is not derived from the underlying project state — a `lifecycle: active` pursuit whose projects are all on_hold still appears with full table rendering, and there's no visual signal that nothing's actually moving inside it.

The fix is to derive pursuit display from project state. A pursuit is *in progress* when at least one of its projects is `status: active` with unchecked actions. Display rule:

- Pursuits with 1+ active project → render full table including active AND on_hold projects underneath (the on_hold projects belong to a pursuit that's moving, so they're context worth seeing).
- Pursuits with 0 active projects but 1+ on_hold project → render the pursuit header + done/total counts but with an empty table (the pursuit is real, but nothing is in motion right now — that itself is signal).
- Pursuits with 0 projects, or only done/dropped projects → not surfaced in the in-progress section.

Open question to resolve during work: how does this interact with the existing `## On Hold Pursuits` section (currently filtered to `lifecycle: someday`)? Two candidate models — (a) keep the section as a separate someday view (lifecycle-driven), distinct from the derived in-progress view, or (b) fold all non-active pursuits under the new derived rule. Lean toward (a): lifecycle:someday is an explicit set-aside with its own ritual; derived 'no active projects' is a different signal (drift, not deliberate parking).

Done means: the dashboard reflects real pursuit motion, not just lifecycle state. The splash and SessionStart hook both inherit the change since they share `curateNextMoves()` and the status renderer.

## Actions

- [x] Audit current cadence status renderer and curateNextMoves(): map where pursuit grouping is derived, identify the exact files + functions that need to change.
- [ ] Draft the derived-display rule as a small pure function (input: pursuit + its projects; output: render decision). Land it with unit tests covering the three cases (active projects present / only on_hold / only done).
- [x] Resolve the lifecycle:someday interaction question — keep separate section, or fold in?
- [ ] Wire the new rule into cadence status output (both bare CLI and --hook-output paths). Verify the splash on this repo renders correctly with the new rule.
