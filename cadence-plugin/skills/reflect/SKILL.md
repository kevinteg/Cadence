---
description: Start or resume the weekly Reflect ritual for review and prioritization
---

# /reflect

Start or resume the weekly Reflect ritual. Reference
`workflows/verb-contracts.md` for the reflect register and
`workflows/reflect.md` for the full ritual specification.

**Register:** Structured, honest, forward-looking. Prefer "what" over
"why" throughout. No evaluative praise. Informational feedback only.

## Steps

1. Determine the current week number (ISO week).

2. Check if a reflection file exists for this week in `reflections/`.
   Use `cadence scan --json` and inspect `reflections` to
   find one for this week's date range.
   - If `status: complete`, say "Your Week [N] reflection is already
     done. Want to review it or start something else?"
   - If `status: in_progress`, say "You started your Week [N]
     reflection and stopped during [phase]. Want to pick up where you
     left off?"
   - If no file exists, create one:
     ```bash
     cadence write-reflection \
       --date <YYYY-MM-DD-this-week> --status draft
     ```

3. Show context before starting:
   ```
   Reflect — Week [N], Phase 1: Get Clear
   ```
   Update when transitioning to Phase 2.

## CLI binding

Gather state for Get Clear with:

```bash
cadence report --json
```

This single call yields snapshot + reconciler flags — captures count,
projects with action lists, waiting-for items, and the structural/
dormant/stale/WIP flag set covered by checks 1-5 in
`workflows/reconciler.md`. Idea-specific checks (aging seeds,
unpromoted developed, growing backlog) and someday cues are agent-
implemented; for those, query
`cadence ideas --json` and apply the threshold logic from
`workflows/reconciler.md`.

4. **Phase 1 — Get Clear**

   a. Process captures: read `snapshot.captures` from the report. If
      non-empty, triage one by one: route to Idea (Seed), Action, or
      discard. Confirm with the user.

   b. 2-minute actions: scan unchecked items in `snapshot.projects[].actions`
      for active projects in active pursuits; surface trivial items
      ("These look quick — want to clear any of them now?").

   c. Walk reconciler flags interactively. For each entry in `flags`,
      present and ask: act on it, defer, or dismiss. The flag kinds the
      CLI emits are: `overdue_waiting_for`, `dormant_project`,
      `stale_marker`, `structural_*`, `wip_over_limit`. Then run the
      idea-specific checks (aging seeds > 14d, unpromoted developed
      > 7d, growing backlog ratio) by reading
      `cadence ideas --json` and applying the thresholds
      from `workflows/reconciler.md`. Finally check someday cues by
      iterating `snapshot.pursuits` filtered to `lifecycle: someday` —
      evaluate each `cue.trigger` against the current date.

   d. Project relevance check: iterate active projects from
      `snapshot.projects`. For each, ask "Still relevant?" If the user
      wants to change a project's status, use the CLI:
      ```bash
      cadence set-status <project-id> --pursuit <pursuit-id> \
        --status <on_hold|dropped|done> [--reason "..." for dropped]
      ```

   e. Update the reflection file via the CLI (re-running
      `write-reflection` with the same date is an upsert):
      ```bash
      cadence write-reflection \
        --date <YYYY-MM-DD> --status in_progress --phase get_clear
      ```

5. **Phase 2 — Get Focused**

   a. Generate a recap: summarize the week from markers, completed actions,
      and narrative notes. Keep it to a paragraph.

   b. Ask "What worked well this week?" Record the answer.

   c. WIP check: the `wip_over_limit` flag from step 4c already covers
      this if it fired. Otherwise count `snapshot.projects` filtered to
      `status: active` AND `hasMarker: true` AND active pursuits. If
      over `snapshot.config.max_active_projects`, suggest specific
      projects to pause or drop — pick the ones with the oldest
      `mostRecentMarker` or lowest alignment with the leveraged
      priority.

   d. Review waiting-for items: who owes you what, and what's your plan
      if they don't deliver?

   e. Generate if-then Nudges: "When you start tomorrow, your first
      session is [Project X], starting with [Action Y]."

   f. Ask: "What's the ONE thing that would make next week a win?"
      Record as the leveraged priority.

   g. Finalize the reflection file via the CLI:
      ```bash
      cadence write-reflection \
        --date <YYYY-MM-DD> --status complete --phase get_focused \
        --leveraged-priority "<their answer>"
      ```

6. Close with: "Reflection complete. Your leveraged priority for next week
   is: [priority]."
