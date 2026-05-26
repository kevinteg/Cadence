# Reflect Workflow

*The weekly ritual. ~30 minutes. Anchored to win cycles.*

---

## Overview

Reflect has two phases. Get Clear ensures nothing is falling through the
cracks. Get Focused sets the direction for next week. The reflection file
serves as its own checkpoint — if you stop mid-ritual, the agent can see
exactly where you left off and resume.

**Language rules:** Prefer "what" over "why" throughout. "Why" triggers
rumination; "what" generates observable data and next steps. No evaluative
praise — feedback is informational and specific.

## Catch-up entry

The skill greets the user differently depending on how they arrive. The
agent reads `signals.reflectEntryMode` from `cadence report --json` and
branches once at the top:

- **`first` / `normal`** — standard fresh-draft flow.
- **`same_week_in_progress`** — pick up where the user left off mid-ritual.
- **`same_week_done`** — the user already wrapped the week. Offer to
  add to the existing reflection (the file's `status` flips back to
  `in_progress` via the same upsert; nothing is lost) or call it
  finished. Re-opening lands directly in Phase 2 with the existing
  Leveraged Priority visible.
- **`long_gap`** (>14 days since last reflection) — open with "It's
  been a while — let's catch up. We'll keep this short." **No deficit
  framing.** Run a condensed Get Clear (top 3 most recent captures,
  severity-1 flags only, skip the per-project walk in favor of a
  single "anything obvious to drop or hold?" question), then Phase 2
  proceeds normally.
- **`early_in_week`** (prior ISO week's reflection, today is Mon-Wed) —
  confirm "are you wrapping the week, or just checking in?" before
  starting a draft. Easy override either way; if checking in, the
  agent drops to a status summary and exits without writing a
  reflection file.

The operative phrasing for each mode lives in
`cadence-plugin/skills/reflect/SKILL.md`. This doc is the narrative
overview; the skill is the prompt source-of-truth.

## Phase 1 — Get Clear (awareness block, not triage clearinghouse)

**Purpose:** Make the user aware of what's drifting and offer a choice. Move on. Get Clear is intentionally short — the moment-of-capture menu and `/cadence:start inbox` handle the per-item triage work; Reflect's job is reflection, not clearinghouse.

### Steps

1. **Compute the awareness counts** from `cadence report --json`:
   - **Inbox** total + oldest-age (via `inboxItems(snapshot)`)
   - **Dormant projects** (flags with `kind: dormant_project`)
   - **Closing-in pursuits** (flags with `kind: closing_in_on_resolution`)
   - **WIP** (active projects with ≥1 unchecked action) vs `max_active_projects`

2. **Render the canonical awareness block** from `cadence-plugin/workflows/coaching-strings.md`:

   ```
   Inbox: <N> items (oldest <D>d)  ·  Dormant: <M> projects  ·  Closing-in: <K> pursuits  ·  WIP: <X>/<max>

   Want to handle these now, or note them in the reflection and move on?
     - 'handle' — hand off to /cadence:start inbox (or /resolve <project>); reflection persists at status: in_progress, phase: get_clear
     - 'note' — append the awareness counts to the reflection body and proceed to Get Focused
     - 'pause' — exit; reflection stays in_progress for next time
   ```

   When all counts are zero: "Inbox empty, no dormant, no closing-in, WIP healthy. Going straight to Get Focused."

3. **Branch on the user's choice**:
   - `handle` — persist at `phase: get_clear`, forward to `/cadence:start inbox` / `/cadence:resolve <project>` / `/cadence:reconcile` depending on which signal the user picks. Next `/cadence:reflect` resumes here cleanly.
   - `note` — append counts to the reflection body, advance to Phase 2.
   - `pause` — persist at `phase: get_clear`, exit.

### Completion
Phase 1 is complete when the user has picked `note` (advance to Phase 2) OR when all counts are zero (auto-advance).

## Phase 2 — Get Focused

**Purpose:** Step back and see the whole picture. Set one priority.

### Steps
1. **Recap** — System-generated narrative of the week: what was accomplished,
   what changed, what's in flight. Use /narrate week internally.
2. **What worked** — Ask "What worked well this week?" Record the answer.
   (Not "why did it work" — "what specifically worked.")
3. **WIP check** — Count in-progress projects (active with markers).
   If above max_active_projects, suggest specific projects to pause — pick
   the ones with the least recent activity or lowest alignment with the
   leveraged priority.
4. **Waiting-for review** — Who owes you what? What's your escalation plan?
5. **If-then Nudges** — Generate implementation intentions for next week:
   "When you start tomorrow, your first session is [Project X], starting
   with [Action Y]." Constructed from markers and leveraged priority.
6. **Leveraged priority** — Commit to ONE thing that defines next week's win.
   This should be the highest-leverage action — the thing that unblocks the
   most other work or creates the most value.

### Completion
Phase 2 is complete when the leveraged priority is set.

---

## Win Cycles

Reflect is anchored to 6-month win cycles (H1/H2). Each cycle has:
- A theme or set of goals
- A mid-cycle check-in (are the goals still right?)
- An end-of-cycle review (what was accomplished? what's next?)

The leveraged priority should connect to the current win cycle's goals.
