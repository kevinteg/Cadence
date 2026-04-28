---
description: Complete an action — mark it done, trigger upward completion prompts. TRIGGER ONLY when the user explicitly invokes /cadence:complete or /complete. SKIP all natural-language equivalents — never auto-fire from "I finished X", "that's done", "check that off", or task-completion announcements.
---

# /complete

Mark an action as done. Completion flows upward: when all actions in a
project are checked, the system prompts the user against the Intent —
does it feel achieved? — to complete, extend, or split. Same for
pursuits.

## Usage

- `/complete` — complete the current/most recent action in the active session
- `/complete <action>` — complete a specific action by description or fuzzy match
- `/complete <action> -- <note>` — complete with a note for the narrative

Arguments resolve via fuzzy match against unchecked actions in the active
project. If no active session, resolve against all active projects.

## CLI binding

Use it for all read-only state inspection (current action progress,
Intent text, project status). Writes (checking off items, updating
frontmatter) still use Edit.

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
   The CLI returns the matched action's text. If the user wants to add
   more actions mid-session, run `cadence add-item <id> --section
   action --text "..."` for each.

3. **Check for upward completion:**

   **Project level:** Re-fetch the project after the edit:
   `cadence project <id> --pursuit <pursuit-id> --json`.
   Read `actionProgress` and `intent` from the response.
   - If `actionProgress.done === actionProgress.total` (every action
     checked):
     ```
     All actions checked for [project]. Does the intent feel achieved?
     Complete this project, add more actions, or split?
     ```
     - If the user completes:
       ```bash
       cadence set-status <project-id> \
         --pursuit <pursuit-id> --status done
       ```
       Then follow the Completing a Project workflow from
       `cadence-reference.md` (pursuit checkpoint, suggest next project).
     - If the user adds actions: use `cadence add-item --section action`
       for each. Project stays active.
     - If the user splits: drop or complete the existing project, then
       create new project(s) via `cadence create-project` for the
       remaining work, each carrying its own Intent.
     - An active project with no open actions is inconsistent state —
       resolve via one of these three paths.

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
   [project] — [N/M actions]
   ```
   Read N/M from the post-edit `actionProgress` field.

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
