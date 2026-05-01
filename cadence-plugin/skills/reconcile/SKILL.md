---
description: Quiet report of system health — stale state, aging Ideas, dormant projects. TRIGGER on explicit /cadence:reconcile invocation, OR when the user asks for a system health check by name (e.g., "reconcile the system", "show flags", "what's gone stale"). SKIP for general state questions that don't request the health report.
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

1. **Delegate to the reconciler subagent.** Avoid pulling the full
   `cadence flags --json` and `cadence ideas --json` payloads into this
   thread; the agent runs the scans in isolation and returns a tight
   flag list.

   Invoke via the Agent tool:
   - `subagent_type: cadence:reconciler`
   - `prompt: scan` (the agent doesn't take parameters; it does its
     standard pass)

   The agent returns either `No flags. System is healthy.` or one flag
   per line in the form:
   `[severity] [kind] [pursuit/project or pursuit] — [one-line context]`,
   grouped by severity (`action_needed`, `warning`, `info`).

2. **Present verbatim** under a `Reconciler Report` heading. Do not
   reformat, summarize, or annotate the agent's output — the format is
   the contract.

3. **Do not prompt for action.** The user reads the report and acts on
   their own, or addresses flags during /reflect.

## Fallback (in-thread)

If the reconciler subagent invocation fails (unrecognized
`subagent_type`, agent error, plugin loader issue), run the scans
inline:

```bash
cadence flags
```

Present the CLI output verbatim. For the idea-specific checks the CLI
doesn't yet implement (`aging_seed`, `unpromoted_idea`,
`growing_backlog`), additionally query `cadence ideas --json` and
`cadence pursuits --json`, apply the thresholds from
`workflows/reconciler.md`, and append any matches to the report.

The fallback keeps /reconcile functional during plugin issues but
pulls bulk JSON into the main context — the agent path is preferred
whenever it works.

## Guardrails

- Quiet. No prompts, no "would you like to..." — just the report.
- Present all flags, not just a summary. The user needs the detail.
- Informational tone. No alarm language ("critical", "urgent").
  Just describe the state.
