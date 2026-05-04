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

## Phase 1 — Get Clear

**Purpose:** Process everything that's accumulated. Restore trust in the system.

### Steps
1. **Process captures** — Triage each unprocessed capture from the parking
   lot. Route to Idea (Seed), Action, or discard. Confirm with user.
2. **Clear 2-minute items** — Surface trivial actions from active projects.
   Do them now or consciously defer them.
3. **Review reconciler flags** — Run full reconciler checks including:
   - Waiting-for items past their expected date
   - Projects with no activity in 14+ days
   - Markers older than the stale threshold
   - Aging Seeds (captured but never developed)
   - Unpromoted Developed Ideas
   - Growing backlog ratio (generation outpacing resolution)
   - Long-running projects (propose split-or-promote)
   - Structural issues (orphaned actions, vague naming)
   - Someday pursuit cues
   Present each flag interactively: act, defer, or dismiss.
4. **Project relevance check** — Review every active project. Is it still
   relevant? Should it be on_hold, dropped, or restructured?

### Completion
Phase 1 is complete when all captures are triaged, flags are reviewed,
and every project has been confirmed as relevant or acted on.

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
