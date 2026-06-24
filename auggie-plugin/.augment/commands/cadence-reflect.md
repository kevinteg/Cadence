---
description: Start or resume the weekly Reflect ritual for review and prioritization. TRIGGER on explicit /cadence-reflect invocation, OR when the user asks for the weekly review by name (e.g., "let's reflect on the week", "time for my weekly reflection", "do my Reflect ritual"). SKIP for conversation that merely revisits past work without requesting the ritual.
---

# /reflect

Start or resume the weekly Reflect ritual. Reference
`workflows/verb-contracts.md` for the reflect register and
`workflows/reflect.md` for the full ritual specification.

## Steps

1. Determine the current week number (ISO week).

2. **Branch on `signals.reflectEntryMode`** from `cadence report --json`.
   The signal answers "how should I greet the user right now?" with one
   of six values; each leads to a different opener and possibly a
   different Phase 1 scope. The branch happens once at the top — Phase
   2 is unchanged regardless.

   - **`first`** — no reflections yet. Standard fresh-draft flow:
     ```bash
     cadence write-reflection --date <YYYY-MM-DD-this-week> --status draft
     ```
     Continue to Phase 1.

   - **`normal`** — last reflection was a prior ISO week, ≤14 days ago,
     today is Thu–Sun. Standard fresh-draft flow (same as `first`).

   - **`same_week_in_progress`** — a draft/in_progress reflection
     exists in the current ISO week. Say:
     > "You started your Week [N] reflection and stopped during
     > [phase]. Want to pick up where you left off?"
     Continue from where it left off.

   - **`same_week_done`** — a complete reflection already exists in
     the current ISO week. Say:
     > "You already wrapped your Week [N] reflection on [date]. Want
     > to add to it (it stays editable while we're in the same week),
     > or call it finished and start something else?"
     If the user wants to add: re-run with the existing date and flip
     status back:
     ```bash
     cadence write-reflection \
       --date <existing-date> --status in_progress --phase get_focused
     ```
     The CLI's `writeReflection` upsert preserves the existing body
     and Leveraged Priority — re-opening loses nothing. Skip Phase 1
     and land directly in Phase 2 with the existing LP visible.

   - **`long_gap`** — last reflection was >14 days ago. Open with the
     canonical encouraging line:
     > "It's been a while — let's catch up. We'll keep this short."
     **No deficit framing.** No "you missed N weeks" language. The
     lightened Get Clear (step 4 below) is already short — render the
     awareness block, offer the same handle/note/pause choice, and
     move on to Phase 2.

   - **`early_in_week`** — last reflection was the prior ISO week and
     today is Mon/Tue/Wed. Before opening a draft, say:
     > "This is earlier than usual — your last reflection was [N] days
     > ago. Are you wrapping the week, or is something else up? (We
     > can go ahead either way.)"
     If the user confirms wrapping: proceed with the standard fresh-
     draft flow. If they say "just checking in" or similar: drop to a
     status summary instead of starting a draft (i.e., delegate to
     `cadence status`-like output and exit cleanly without writing a
     reflection file).

3. Show context before starting:
   ```
   Reflect — Week [N], Phase 1: Get Clear
   ```
   For `same_week_done` re-open, label as `Phase 2: Get Focused`
   (the user is editing the existing reflection, not starting fresh).
   Update when transitioning to Phase 2.

## CLI binding

Gather state for Get Clear with:

```bash
cadence report --json
```

This single call yields snapshot + reconciler flags — Inbox view,
dormant-project flags, closing-in pursuits, WIP, and the rest. The
lightened Get Clear (step 4) consumes counts directly from this
payload; it does not walk items individually.

4. **Phase 1 — Get Clear (awareness block, not triage clearinghouse)**

   Get Clear is **short**. It is not the triage clearinghouse — that
   work happens at the moment of capture (the capture exit menu) or
   via `/cadence-start inbox` for accumulated material. Reflect's job
   is to make the user aware of what's drifting and offer a choice,
   then move on.

   a. Compute the awareness counts from `cadence report --json`:
      - **Inbox**: `inboxItems(snapshot).counts.total` plus the bucket
        breakdown (`overdue` / `aged` / `fresh`).
      - **Dormant projects**: count of flags with `kind: dormant_project`.
      - **Closing-in pursuits**: count of flags with `kind: closing_in_on_resolution`.
      - **WIP**: count of `snapshot.projects` filtered to `status: active`
        with at least one unchecked action; the limit is
        `snapshot.config.max_active_projects`.
      - **Capstone gaps**: count of flags with `kind: capstone_gap`
        (resolved units whose research never crystallized).
      - **Retrospective**: the `retrospective_due` flag's
        `newSinceLast`, when present.

   b. Render the canonical awareness block from
      `workflows/coaching-strings.md`:

      ```
      Inbox: <N> items (oldest <D>d)  ·  Dormant: <M> projects  ·  Closing-in: <K> pursuits  ·  WIP: <X>/<max>
      Capstone gaps: <G> resolved units with uncrystallized research  ·  Retrospective: <R> pursuits since the last lessons run

      Want to handle these now, or note them in the reflection and move on?
        - 'handle' — hand off to /cadence-start inbox (or /resolve <project>); reflection persists at status: in_progress, phase: get_clear
        - 'note' — append the awareness counts to the reflection body and proceed to Get Focused
        - 'pause' — exit; reflection stays in_progress for next time
      ```

      When all counts are zero: "Inbox empty, no dormant, no closing-in, WIP healthy. Going straight to Get Focused."

   c. Branch on the user's choice:

      - **`handle`** — ask "which one?" if multiple non-zero buckets
        exist. Route accordingly:
        - Inbox → forward to `/cadence-start inbox` (the triage walk)
        - Closing-in pursuit → forward to `/cadence-status <pursuit>`
          and let them decide; they can `/cadence-resolve` from there
        - Dormant projects → forward to `/cadence-reconcile` for the
          full flag walk
        - Capstone gap → suggest `/cadence-narrate capstone <unit>`
        - Retrospective due → suggest `/cadence-narrate lessons`
        Before handing off, persist the reflection at `get_clear`:
        ```bash
        cadence write-reflection \
          --date <YYYY-MM-DD> --status in_progress --phase get_clear
        ```
        The next `/cadence-reflect` invocation will see
        `same_week_in_progress` and resume here. After the user
        finishes handling, they re-invoke `/cadence-reflect`; the
        skill picks up at this awareness block (the counts will have
        shifted) and offers handle/note/pause again. The user can
        loop through several handle passes if they want.

      - **`note`** — append the awareness counts to the reflection
        body as a "Going-in state" subsection, then advance the
        reflection phase:
        ```bash
        cadence write-reflection \
          --date <YYYY-MM-DD> --status in_progress --phase get_focused
        ```
        Continue to Phase 2.

      - **`pause`** — persist the reflection at `get_clear` and exit:
        ```bash
        cadence write-reflection \
          --date <YYYY-MM-DD> --status in_progress --phase get_clear
        ```
        Tell the user: "Paused at Get Clear. `/cadence-reflect` will
        pick this back up." Emit the verb-hint + teaching footer.

   d. Optional brain-tickler tip surface before Phase 2 (frequency-capped):
      ```bash
      cadence tip-pick --triggers moment-reflect-phase-transition \
        --types quote --category reflect-interjection --category-cool-down-days 14
      ```
      If a non-null tip is returned, render inline ("Before we look
      forward, a frame to chew on: …"). Skip silently on null.

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
      changes. Keep it to a paragraph. Or invoke `/cadence-narrate week`
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
