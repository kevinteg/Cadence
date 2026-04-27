---
description: Generate narrative from activity data — today, weekly, or pursuit arc
---

# /narrate

Generate narrative from activity data. Reference
`workflows/verb-contracts.md` for the narrate register.

**Register:** Reflective but not evaluative. "What" not "why."
Redemption-aware. Informational, not praise-based.

## Usage

- `/narrate` — today's activity
- `/narrate <pursuit>` — full arc of a pursuit
- `/narrate week` — weekly narrative (feeds into /reflect)

Arguments resolve via fuzzy match, partial match, or natural language.

## CLI binding

Use it to gather time-windowed
markers and ideas — the agent generates narrative prose from the
returned data.

## Steps

### Today's Narrative (no argument)

1. Today's markers and actions completed:
   ```bash
   cadence markers --since <YYYY-MM-DD-today> --json
   ```
   Each marker's `actions_completed` field lists what was finished.
2. Today's Idea movements:
   ```bash
   cadence ideas --since <YYYY-MM-DD-today> --json
   ```
   For Ideas that *changed state* today (developed/promoted/closed but
   `created` is older), read the `developed_at` field and per-idea
   metadata from `cadence ideas --json` and filter by
   timestamp.
3. Generate narrative following McAdams structure:
   - **What happened:** Activity summary — sessions, actions, Ideas moved
   - **What it meant:** Progress on pursuits, milestones reached
   - **What shifted:** Decisions made, direction changes, new priorities
   - **What's next:** Tomorrow's ready-to-resume plans from markers

### Pursuit Narrative (with pursuit argument)

1. Gather everything for the pursuit:
   ```bash
   cadence pursuit <pursuit-id> --json     # pursuit + projects
   cadence markers --pursuit <id> --json   # all markers, sorted desc
   cadence ideas --parent <id> --json      # parent-level ideas
   ```
   For project-scoped Ideas, run `ideas --json` and filter parents that
   start with `<id>/` agent-side.
2. Generate the full arc:
   - **What happened:** Timeline of projects, milestones, key sessions
   - **The Idea story:** How many Ideas generated, promoted to projects,
     promoted to their own pursuits, closed with reasons, moved to Wandering
   - **What it meant:** The pursuit's contribution to the win cycle
   - **What shifted:** Pivots, course corrections, things learned
   - **What's next:** Open projects, pending Ideas, trajectory

### Weekly Narrative (`week` argument)

1. Compute the ISO week's start date (Monday). Then:
   ```bash
   cadence markers --since <monday-YYYY-MM-DD> --json
   cadence ideas --since <monday-YYYY-MM-DD> --json
   ```
   For projects completed this week, filter `cadence scan
   --json | .projects[]` for `status: done` (the agent already knows
   which were not-done at week start by reading the previous week's
   reflection or markers).
2. Generate weekly summary:
   - **What happened:** Pursuits touched, projects advanced, actions done
   - **What it meant:** Progress toward Leveraged Priority
   - **What shifted:** New ideas, changed plans, things dropped
   - **What's next:** Leveraged Priority for the coming week

4. Save to `narratives/drafts/week-<YYYY-WNN>.md`.

## Guardrails

- **No evaluative praise.** No "great week" or "impressive progress."
  Describe what happened specifically: "Advanced 3 projects, closed 2
  Ideas, completed the reconciler in a single session."
- **No "why" framing.** "What happened" and "what shifted", not "why
  did this work" or "why did this fail."
- **Redemption-aware.** A hard week gets an honest narrative, not
  sugarcoating. "Tuesday's session stalled on the marker migration —
  the format change was more involved than expected. Wednesday's session
  resolved it by simplifying the field mapping."
- **Narratives are views over data.** They are generated from markers,
  actions, and Ideas — not separate content to maintain.
