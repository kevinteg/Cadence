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

## Steps

### Today's Narrative (no argument)

1. Scan today's markers across all pursuits.
2. Scan actions completed today (from marker frontmatter).
3. Scan Ideas created, developed, promoted, or closed today.
4. Generate narrative following McAdams structure:
   - **What happened:** Activity summary — sessions, actions, Ideas moved
   - **What it meant:** Progress on pursuits, milestones reached
   - **What shifted:** Decisions made, direction changes, new priorities
   - **What's next:** Tomorrow's ready-to-resume plans from markers

### Pursuit Narrative (with pursuit argument)

1. Read all markers, project files, and Ideas for the pursuit.
2. Generate the full arc:
   - **What happened:** Timeline of projects, milestones, key sessions
   - **The Idea story:** How many Ideas generated, promoted to projects,
     promoted to their own pursuits, closed with reasons, moved to Wandering
   - **What it meant:** The pursuit's contribution to the win cycle
   - **What shifted:** Pivots, course corrections, things learned
   - **What's next:** Open projects, pending Ideas, trajectory

### Weekly Narrative (`week` argument)

1. Scan all markers from this ISO week.
2. Scan all actions completed, Ideas moved, projects completed.
3. Generate weekly summary:
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
