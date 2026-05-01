---
description: Start or resume the weekly Reflect ritual for review and prioritization. TRIGGER on explicit /cadence:reflect invocation, OR when the user asks for the weekly review by name (e.g., "let's reflect on the week", "time for my weekly reflection", "do my Reflect ritual"). SKIP for conversation that merely revisits past work without requesting the ritual.
---

# /reflect

Start or resume the weekly Reflect ritual. Reference
`workflows/verb-contracts.md` for the reflect register and
`workflows/reflect.md` for the full ritual specification.

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
`workflows/reconciler.md`.

**Idea-specific checks and someday cues** are extracted into the
reconciler subagent (see step 4c) so the bulk Ideas JSON does not have
to land in this thread.

4. **Phase 1 — Get Clear**

   a. Process captures: read `snapshot.captures` from the report. If
      non-empty, triage one by one: route to Idea (Seed), Action, or
      discard. Confirm with the user.

   b. 2-minute actions: scan unchecked items in `snapshot.projects[].actions`
      for active projects in active pursuits; surface trivial items
      ("These look quick — want to clear any of them now?").

   c. Walk reconciler flags interactively. **Delegate the scan to the
      reconciler subagent** to keep bulk Ideas JSON out of this thread:
      invoke the Agent tool with `subagent_type: cadence:reconciler`
      and `prompt: scan`. The agent returns a flag list (one per line,
      grouped by severity) covering both the in-CLI checks
      (`overdue_waiting_for`, `dormant_project`,
      `structural_active_no_open_actions`, `wip_over_limit`) and the
      idea-specific checks (`aging_seed`, `unpromoted_idea`,
      `growing_backlog`). For each flag, present and ask: act on it,
      defer, or dismiss. Finally check someday cues by iterating
      `snapshot.pursuits` filtered to `lifecycle: someday` — evaluate
      each `cue.trigger` against the current date.

      **Fallback:** if the reconciler subagent invocation fails, run
      the scans inline using `cadence flags --json` plus
      `cadence ideas --json` with the thresholds from
      `workflows/reconciler.md`.

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

   Phase 2 is interactive. The user owns the reflection. Every prompt
   below is an open question first, with a follow-up cycle to deepen
   the user's own thinking. The agent surfaces its own observations
   only AFTER the user has answered fully — and frames them as
   "I also noticed X — does that resonate?", never as a top-of-list
   claim. Pre-filling answers short-circuits meaning-making (the user
   either rubber-stamps or argues with the agent's list, neither of
   which is the reflective work the ritual exists to do).

   a. Generate a recap: summarize the week from project-file activity
      (run `cadence project-activity --scope weekly`) and idea state
      changes. Keep it to a paragraph. Or invoke `/cadence:narrate week`
      to get the McAdams version.

   b. **What worked well this week?** Open question — wait for the
      user's answer. Use follow-ups to deepen ("what made that work?",
      "say more about that"), not to lead. After the user has finished
      naming what worked, the agent MAY add observations it noticed
      that the user did not — phrased as "I also noticed X — does
      that resonate?" Capture all of it as the worked-well narrative.

   c. **What didn't work this week?** Same shape — open question first,
      follow-ups to deepen, agent observations only after the user has
      answered. The "what didn't work" pass is not in the legacy step
      ordering; treat it as a distinct turn after step b. Use "what
      happened" / "what shifted" framing — never "why did you fail."

   d. WIP check: the `wip_over_limit` flag from step 4c already covers
      this if it fired. Otherwise count `snapshot.projects` filtered to
      `status: active` with at least one unchecked action. If over
      `snapshot.config.max_active_projects`, suggest specific projects
      to drop or hold — pick the ones with the oldest
      `last_activity_at` or lowest alignment with the leveraged
      priority.

   e. Review waiting-for items: who owes you what, and what's your plan
      if they don't deliver?

   f. Generate if-then Nudges: "When you start tomorrow, the first
      project to open is [Project X], starting with [Action Y]."

   g. **Leveraged Priority — ask the canonical question verbatim:**
      "What is the one thing you will do that will make you feel like
      you won the week?" Wait for the user's candidate. Once they have
      one, help them shape it interactively for the right balance of
      achievable and challenging — pressure-test by asking about the
      win condition's shape ("what does proof look like at next
      Friday's Reflect?"), the achievability ceiling ("is this one
      week's worth of work, or three?"), and the bundled-goals risk
      ("of these N things you named, which one IS the win and the
      others are preconditions?"). Don't pre-suggest the priority.
      Once the user names it, capture it verbatim as the leveraged
      priority.

   h. Finalize the reflection file via the CLI:
      ```bash
      cadence write-reflection \
        --date <YYYY-MM-DD> --status complete --phase get_focused \
        --leveraged-priority "<their answer>"
      ```

6. Close with an ELI5 recap of what the Reflect produced (captures
   triaged, any structural changes, the worked/didn't-work narrative,
   the LP), then the canonical exit line: "Your Leveraged Priority
   for next week is: [priority]."
