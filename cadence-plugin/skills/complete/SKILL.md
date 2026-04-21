---
description: Complete an action — mark it done, trigger upward completion prompts
---

# /complete

Mark an action as done. Completion flows upward: when all actions/DoD
items in a project are checked, the system prompts to complete or extend
the project. Same for pursuits.

## Usage

- `/complete` — complete the current/most recent action in the active session
- `/complete <action>` — complete a specific action by description or fuzzy match
- `/complete <action> -- <note>` — complete with a note for the narrative

Arguments resolve via fuzzy match against unchecked actions in the active
project. If no active session, resolve against all active projects.

## Steps

1. **Resolve the action:**
   - If in an active session with no argument: complete the action currently
     being worked on (the most recently discussed unchecked action).
   - If an argument is given: fuzzy match against unchecked actions in the
     active project, or across all active projects if no session.
   - If the match is ambiguous, present options and ask.

2. **Mark the action done:**
   - Check off the action in the project file.
   - If a note was provided (after `--`), append it to the action line
     or as a sub-bullet. This note feeds the narrative.

3. **Check for upward completion:**

   **Project level:** After checking off the action, count remaining
   unchecked DoD items and actions in the project.
   - If all DoD items are checked:
     ```
     All DoD items checked for [project]. Complete this project, or add
     more items?
     ```
     - If the user completes: set `status: done`, follow the Completing a
       Project workflow from the Cadence runtime (pursuit checkpoint,
       suggest next project).
     - If the user adds items: they provide new DoD/action items, project
       stays active.
     - **No third option.** An active project with no open items is
       inconsistent state.

   **Pursuit level:** If the project was just completed, check the pursuit.
   - If all projects in the pursuit are done or dropped:
     ```
     All projects in [pursuit] are resolved. Complete this pursuit, or
     add more projects?
     ```
     - Same rules: complete or extend, no third option.

4. **Confirm:**
   ```
   Done: [action text]
   [project] — [N/M DoD]
   ```

## For physical/standalone tasks

`/complete` can be called without a prior `/start` for quick physical
tasks. In this case:
- Resolve the action across all active projects.
- Mark it done with optional note.
- No session is opened or closed — it's a point-in-time completion.

## Guardrails

- No evaluative commentary. "Done: [action]" is sufficient.
- The upward completion prompt is mandatory when all items are checked.
  Do not silently leave a project in all-checked-but-active state.
- Notes are optional. Do not prompt for a note if none was given.
