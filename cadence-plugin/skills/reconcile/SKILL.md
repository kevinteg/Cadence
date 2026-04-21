---
description: Quiet report of system health — stale state, aging Ideas, dormant projects
---

# /reconcile

Standalone quiet report of system health. Reference
`workflows/reconciler.md` for full detection logic.

This is the on-demand version of the reconciler. The loud version lives
inside /reflect (Get Clear phase). This produces a report without
prompting for action.

## Usage

- `/reconcile` — full system health report

## Steps

1. Run all reconciler checks from `workflows/reconciler.md`:
   - Overdue waiting-for items
   - Dormant projects (no marker in 14+ days)
   - Stale markers (older than threshold)
   - Structural issues (empty DoD, all-done-not-closed, no actions)
   - Aging Seeds (seed state > 14 days)
   - Unpromoted Developed Ideas (developed > 7 days)
   - Growing backlog ratio (Ideas generated > 2x resolved)
   - Long-running projects (30+ days, <50% DoD)
   - Pursuit completion proximity (1-2 projects remaining)
   - Someday cues (triggers due)

2. Present as a quiet report — informational, not interactive:
   ```
   Reconciler Report

   [If flags found]:
   - [type] [entity]: [suggestion]
   - [type] [entity]: [suggestion]

   [N] flags across [M] pursuits.

   [If no flags]: System is clean. No flags.
   ```

3. Do not prompt for action. The user reads the report and acts on
   their own, or addresses flags during /reflect.

## Guardrails

- Quiet. No prompts, no "would you like to..." — just the report.
- Present all flags, not just a summary. The user needs the detail.
- Informational tone. No alarm language ("critical", "urgent").
  Just describe the state.
