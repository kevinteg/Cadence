# /reflect

Start or resume the weekly Reflect ritual. This activates Steward mode.
Reference `workflows/reflect.md` for the full ritual specification.

## Steps

1. Determine the current week number (ISO week).

2. Check if a reflection file exists for this week in `reflections/`.
   - If yes, read it. Check `status` and `phase` fields.
   - If `status: complete`, say "Your Week [N] reflection is already done.
     Want to review it or start something else?"
   - If `status: in_progress`, say "You started your Week [N] reflection
     and stopped during [phase]. Want to pick up where you left off?"
   - If no file exists, create a new one with `status: draft`.

3. **Phase 1 — Get Clear**

   a. Count unprocessed thoughts in `thoughts/unprocessed/`.
      If any, process them one by one: show the thought, suggest triage
      routing, confirm with the user. Move processed thoughts to
      `thoughts/processed/`.

   b. Scan all active projects for 2-minute actions (trivial items the user
      can knock out right now). Surface them: "These look quick — want to
      clear any of them now?"

   c. Run reconciler checks:
      - `waiting_for` items past their expected date → flag
      - Projects with no actions completed in 14+ days → flag as dormant
      - Markers older than `marker_stale_days` from cadence.yaml → flag
      - Report flags to the user for review

   d. Project relevance check: list all active projects across all pursuits.
      For each, ask "Still relevant?" Mark reviewed projects in the
      reflection file. If the user changes a project's status (drop,
      on_hold), update the project file's frontmatter accordingly.

   e. Update the reflection file: `phase: get_clear`, mark Get Clear
      section as complete. Save after each sub-step so partial progress
      is preserved.

4. **Phase 2 — Get Focused**

   a. Generate a recap: summarize the week from markers, completed actions,
      and any narrative notes. Keep it to a paragraph.

   b. Ask "What worked well this week?" Record the answer.

   c. WIP check: count active pursuits and active projects. If pursuits > 4
      or projects > 8, flag as potentially overextended.

   d. Review waiting-for items: who owes you what, and what's your plan
      if they don't deliver?

   e. Ask: "What's the ONE thing that would make next week a win?"
      Record as the leveraged priority.

   f. Update the reflection file: `status: complete`,
      `leveraged_priority: "<their answer>"`.

5. Close with: "Reflection complete. Your leveraged priority for next week
   is: [priority]. /recap will surface this when you start your next session."
