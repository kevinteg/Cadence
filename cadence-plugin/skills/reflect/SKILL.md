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
   - If yes, read it. Check `status` and `phase` fields.
   - If `status: complete`, say "Your Week [N] reflection is already done.
     Want to review it or start something else?"
   - If `status: in_progress`, say "You started your Week [N] reflection
     and stopped during [phase]. Want to pick up where you left off?"
   - If no file exists, create a new one with `status: draft`.

3. Show context before starting:
   ```
   Reflect — Week [N], Phase 1: Get Clear
   ```
   Update when transitioning to Phase 2.

4. **Phase 1 — Get Clear**

   a. Process captures: count unprocessed items in the parking lot.
      If any, triage one by one: route to Idea (Seed), Action, or discard.
      Confirm with the user.

   b. Scan all active projects for 2-minute actions (trivial items the user
      can knock out right now). Surface them: "These look quick — want to
      clear any of them now?"

   c. Run reconciler checks (reference `workflows/reconciler.md` for full
      detection logic):
      - **Overdue waiting-for:** flag items past expected + grace days
      - **Dormant projects:** active projects with no marker in 14+ days
      - **Stale markers:** most recent marker older than threshold
      - **Aging Seeds:** Ideas in seed state past review threshold
      - **Unpromoted Developed Ideas:** Ideas through develop but not promoted
      - **Growing backlog:** Pursuits with Idea generation outpacing resolution
      - **Structural issues:** empty DoD, all-done-but-not-closed, long-running
        projects (propose split-or-promote)
      - **Someday cues:** pursuits in _someday/ with triggers due
      - Present each flag interactively. For each, ask: act on it, defer,
        or dismiss.

   d. Project relevance check: list all active projects across all pursuits.
      For each, ask "Still relevant?" If the user changes a project's status,
      update the project file's frontmatter.

   e. Update the reflection file: `phase: get_clear`, mark Get Clear
      section as complete. Save after each sub-step.

5. **Phase 2 — Get Focused**

   a. Generate a recap: summarize the week from markers, completed actions,
      and narrative notes. Keep it to a paragraph.

   b. Ask "What worked well this week?" Record the answer.

   c. WIP check: Read `max_active_projects` from cadence.yaml. Count
      in-progress projects (active with at least one marker). If over limit,
      suggest specific projects to pause or drop — pick the ones with the
      least recent activity or lowest alignment with the leveraged priority.

   d. Review waiting-for items: who owes you what, and what's your plan
      if they don't deliver?

   e. Generate if-then Nudges: "When you start tomorrow, your first
      session is [Project X], starting with [Action Y]."

   f. Ask: "What's the ONE thing that would make next week a win?"
      Record as the leveraged priority.

   g. Update the reflection file: `status: complete`,
      `leveraged_priority: "<their answer>"`.

6. Close with: "Reflection complete. Your leveraged priority for next week
   is: [priority]."
