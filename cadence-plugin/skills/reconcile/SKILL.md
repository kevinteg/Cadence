---
description: Quiet report of system health — stale state, aging Ideas, dormant projects
---

# /reconcile

Standalone quiet report of system health. The full detection logic lives
in `workflows/reconciler.md`.

This is the on-demand version of the reconciler. The loud version lives
inside /reflect (Get Clear phase). This produces a report without
prompting for action.

## Usage

- `/reconcile` — full system health report

## Steps

1. Run the bundled CLI to get current flags. The command auto-detects the
   repo root from cwd:

   ```bash
   cadence flags
   ```
2. The CLI emits flags one per line in the form `- [type] [entity]:
   [details]`. Present the output verbatim under a "Reconciler Report"
   heading. If the CLI prints "No flags. System is healthy.", report
   "System is clean. No flags."

3. Do not prompt for action. The user reads the report and acts on
   their own, or addresses flags during /reflect.

## Notes

The CLI implements checks 1-5 from `workflows/reconciler.md` (overdue
waiting-for, dormant projects, stale markers, structural issues, WIP over
limit). Idea-specific checks (aging seeds, unpromoted developed,
backlog ratio) and someday-cue surfacing are still agent-implemented and
appear in /reflect, not /reconcile.

If the CLI is unavailable, fall back to scanning the file tree manually
following `workflows/reconciler.md`.

## Guardrails

- Quiet. No prompts, no "would you like to..." — just the report.
- Present all flags, not just a summary. The user needs the detail.
- Informational tone. No alarm language ("critical", "urgent").
  Just describe the state.
