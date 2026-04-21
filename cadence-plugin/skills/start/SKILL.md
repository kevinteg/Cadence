---
description: Start a session — curated selection or direct project entry with flow protection
---

# /start

Begin a work session. Reference `workflows/verb-contracts.md` for the
start register.

**Register:** Silent during flow. Terse at breakpoints. The voice
protects your attention — it does not compete for it.

## Usage

- `/start` — curated selection of what to work on
- `/start <project>` — start a session on that project

Arguments resolve via fuzzy match, partial match, or natural language.

## Steps

### No-argument entry (curated selection)

1. Read the most recent reflection to extract the Leveraged Priority.
2. Find the most recent marker across all pursuits.
3. Count unprocessed captures in the parking lot.
4. Scan active projects for 2-minute quick wins.
5. Run reconciler checks (reference `workflows/reconciler.md`) for a
   flag summary.
6. Present the curated entry:

   ```
   [pursuit] — [N/M] projects done | LP: "[leveraged priority]"

   What do you want to work on?

   **[Pursuit Name]**
   - [project-id]: [brief description] — [N/M DoD] [not started]
   - [project-id]: [brief description] — [N/M DoD]

   [Repeat for other active pursuits. Hide done. Show on_hold dimmed.]

   [If captures > 0]: [N] unprocessed captures — triage first?
   [If quick wins exist]: Quick wins: [list 1-3 trivial actions]
   [If reconciler flags > 0]: [N] flags — run /cadence:reconcile for details
   ```

7. Wait for the user to choose. Resolve their choice to a project.

### With-argument entry (direct session)

1. Resolve the argument to an active project. If done or dropped:
   "[Project] is already [status]. Want to create a follow-up project?"

2. If there is already an active session in this conversation, prompt:
   "You have an active session on [project]. /pause first, or switch?"
   If the user switches, auto-pause the current session before starting
   the new one.

### Session start

1. Read the most recent marker for this project (filter by `project`
   field in session frontmatter).
2. If a marker exists, present the ready-to-resume recap:
   ```
   [pursuit] / [project] — [N/M DoD]

   Next: [*next* field from marker, verbatim]
   Where: [brief summary of *where* field]
   ```
3. If no marker exists:
   ```
   [pursuit] / [project] — [N/M DoD]

   New session. First action: [first unchecked action]
   ```

### During flow

- **Silent.** Respond only to direct questions.
- **No unsolicited suggestions.** No "have you considered." No observations.
- **Batch everything for breakpoints.** If you notice something (a quick
  win, a flag, a concern), hold it until a natural pause.
- **Keep the session moving.** After completing a step, prompt with what's
  next rather than waiting for explicit continuation.

### At breakpoints (natural pauses, task completion, user-initiated)

- Surface batched observations, quick wins, parking lot items.
- Keep it terse. One or two lines max.

## Guardrails

- No mid-flow interruptions.
- No unsolicited suggestions during flow state.
- Captures via /capture are parking lot only — no triage, no response.
- No evaluative commentary on progress.
- Sessions do NOT auto-close. The user must explicitly `/pause` or
  `/complete` actions. No auto-mark on natural language exit signals.
