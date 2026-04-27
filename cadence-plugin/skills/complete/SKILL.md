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

## CLI binding

Use it for all read-only state
inspection (current DoD/action progress, project status). Writes
(checking off items, updating frontmatter) still use Edit.

## Steps

1. **Resolve the action:**
   - If in an active session with no argument: complete the action currently
     being worked on (the most recently discussed unchecked action).
   - If an argument is given and there's an active session, fetch the
     project state with `cadence project <project-id>
     --pursuit <pursuit-id> --json` and fuzzy-match the argument against
     unchecked actions.
   - If no active session, fetch all active projects via
     `cadence scan --json` and fuzzy-match across their
     unchecked actions.
   - If the match is ambiguous, present options and ask.

2. **Mark the action done via the CLI:**
   ```bash
   cadence check <project-id> \
     --pursuit <pursuit-id> \
     --section action \
     --match "<action text or 0-based index>" \
     --note "<optional narrative note>"
   ```
   The CLI returns the matched action's text. If the user added new
   DoD items mid-session, run `cadence add-item <id> --section dod
   --text "..."` to append.

3. **Check for upward completion:**

   **Project level:** Re-fetch the project after the edit:
   `cadence project <id> --pursuit <pursuit-id> --json`.
   Read `dodProgress` and `actionProgress` from the response.
   - If `dodProgress.done === dodProgress.total` and all `actions` are
     checked:
     ```
     All DoD items checked for [project]. Complete this project, or add
     more items?
     ```
     - If the user completes:
       ```bash
       cadence set-status <project-id> \
         --pursuit <pursuit-id> --status done
       ```
       Then follow the Completing a Project workflow from the Cadence
       runtime (pursuit checkpoint, suggest next project).
     - If the user adds items: use `cadence add-item` for each. Project
       stays active.
     - **No third option.** An active project with no open items is
       inconsistent state.

   **Pursuit level:** If the project was just completed, check the
   pursuit via `cadence pursuit <pursuit-id> --json`. Inspect
   the `projects` array — if every project's `status` is `done` or
   `dropped`:
   ```
   All projects in [pursuit] are resolved. Complete this pursuit, or
   add more projects?
   ```
   - If the user completes: `cadence move-pursuit
     <pursuit-id> --to archived`. Same rules: complete or extend, no
     third option.

4. **Confirm:**
   ```
   Done: [action text]
   [project] — [N/M DoD]
   ```
   Read N/M from the post-edit `dodProgress` field.

## For physical/standalone tasks

`/complete` can be called without a prior `/start` for quick physical
tasks. In this case:
- Fetch state with `cadence scan --json` and resolve the
  action across all active projects.
- Mark it done with optional note.
- No session is opened or closed — it's a point-in-time completion.

## Guardrails

- No evaluative commentary. "Done: [action]" is sufficient.
- The upward completion prompt is mandatory when all items are checked.
  Do not silently leave a project in all-checked-but-active state.
- Notes are optional. Do not prompt for a note if none was given.
