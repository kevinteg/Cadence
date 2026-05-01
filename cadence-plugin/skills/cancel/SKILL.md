---
description: Cancel a project — drop it with a reason. TRIGGER ONLY when the user explicitly invokes /cadence:cancel or /cancel. SKIP all natural-language equivalents — never auto-fire from "drop this", "kill this project", "I'm giving up on X", "this isn't worth it", or abandonment language.
---

# /cancel

Drop a project. Not completion — it didn't succeed, or it's no longer
relevant. The reason is recorded for the narrative.

## Usage

- `/cancel` — cancel the project under current discussion
- `/cancel <project>` — cancel a specific project

Arguments resolve via fuzzy match, partial match, or natural language.

## Steps

1. **Resolve the project:**
   - With no argument: target the project most recently in focus
     (e.g., the most recent /start with-arg, or the project mentioned
     earlier in the conversation). If unclear, ask.
   - With an argument: resolve via fuzzy match against active projects.
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
   cadence set-status <project-id> \
     --pursuit <pursuit-id> --status dropped --reason "<user's reason>" \
     --include-pursuit
   ```
   The CLI sets `status: dropped`, `dropped_reason: <reason>`, and
   stamps `dropped_at: <ISO timestamp>` in frontmatter.
   `--include-pursuit` returns the pursuit summary in the same
   response — read `result.pursuit.allResolved` for step 6's pursuit
   context without a separate fetch.

5. **Resolve any unresolved Ideas** the user identified in step 3 by
   using the appropriate CLI commands:
   - Move to Wandering: `cadence set-idea-state <id> --state moved
     --new-parent wandering`
   - Close with reason: `cadence set-idea-state <id> --state closed
     --reason "<reason>"`

6. **Confirm with pursuit context:**
   ```
   Cancelled: [project] — "[reason]"
   [pursuit] — [N/M] projects done, [K] dropped
   ```
   Read counts from `result.pursuit` returned by step 4's
   `set-status --include-pursuit` call. Only fall back to a separate
   `cadence pursuit <id> --json` if `--include-pursuit` was omitted.

## Guardrails

- Always require a reason. Do not allow cancellation without one.
- Unresolved Ideas must be handled before cancellation completes.
  This is the closure ritual — nothing gets silently orphaned.
- No evaluative commentary on the decision to cancel.
