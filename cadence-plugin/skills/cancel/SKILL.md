---
description: Cancel a project — drop it with a reason
---

# /cancel

Drop a project. Not completion — it didn't succeed, or it's no longer
relevant. The reason is recorded for the narrative.

## Usage

- `/cancel` — cancel the active session's project
- `/cancel <project>` — cancel a specific project

Arguments resolve via fuzzy match, partial match, or natural language.

## Steps

1. **Resolve the project:**
   - If in an active session with no argument: target the active project.
   - If an argument is given: resolve to a project by fuzzy match.
   - If the project is already done or dropped:
     "[Project] is already [status]."

2. **Ask for the reason:**
   ```
   Cancelling [project]. What's the reason?
   ```
   The reason matters — it enters the narrative as meaning-making material.
   A cancelled project without a reason is incomplete closure.

3. **Check for unresolved Ideas:**
   - Scan for Ideas with `parent` matching this project that are in
     `seed` or `developed` state.
   - If any exist:
     ```
     [N] Ideas on this project are still open:
     - [idea-id]: [summary]

     Move them to Wandering, close them, or move to another project?
     ```
   - Resolve each Idea before proceeding. Moving to Wandering or closing
     with a reason counts as resolution.

4. **Update the project via the CLI:**
   ```bash
   node "$CADENCE_BIN" set-status <project-id> \
     --pursuit <pursuit-id> --status dropped --reason "<user's reason>"
   ```
   `$CADENCE_BIN` defaults to `./cadence-plugin/bin/cadence.js`. The CLI
   sets `status: dropped`, `dropped_reason: <reason>`, and stamps
   `dropped_at: <ISO timestamp>` in frontmatter.

5. **If an active session was on this project,** close the session (no
   marker needed — cancellation closed it).

6. **Resolve any unresolved Ideas** the user identified in step 3 by
   using the appropriate CLI commands:
   - Move to Wandering: `cadence set-idea-state <id> --state moved
     --new-parent wandering`
   - Close with reason: `cadence set-idea-state <id> --state closed
     --reason "<reason>"`

7. **Confirm with pursuit context:**
   ```
   Cancelled: [project] — "[reason]"
   [pursuit] — [N/M] projects done, [K] dropped
   ```
   Read counts via `cadence pursuit <id> --json`.

## Guardrails

- Always require a reason. Do not allow cancellation without one.
- Unresolved Ideas must be handled before cancellation completes.
  This is the closure ritual — nothing gets silently orphaned.
- No evaluative commentary on the decision to cancel.
