---
description: Complete an action — mark it done, trigger upward completion prompts. TRIGGER ONLY when the user explicitly invokes /cadence:complete or /complete. SKIP all natural-language equivalents — never auto-fire from "I finished X", "that's done", "check that off", or task-completion announcements.
---

# /complete

Mark an action as done. Completion flows upward: when all actions in a
project are checked, the system prompts the user against the Intent —
does it feel achieved? — to complete, extend, or split. Same for
pursuits.

## Usage

- `/complete` — complete the most recently discussed action
- `/complete <action>` — complete a specific action by description or fuzzy match
- `/complete <action> -- <note>` — complete with a note for the narrative

Arguments resolve via fuzzy match against unchecked actions in the
project under discussion (most recent /start with-arg, or the project
referenced earlier in the conversation). If unclear, resolve across
all active projects.

## CLI binding

Use it for all read-only state inspection (current action progress,
Intent text, project status). Writes (checking off items, updating
frontmatter) still use Edit.

## Steps

1. **Resolve the action:**
   - With no argument: complete the action under current discussion (the
     most recently mentioned unchecked action in the conversation).
   - With an argument and a project under discussion, fetch state with
     `cadence project <project-id> --pursuit <pursuit-id> --json` and
     fuzzy-match the argument against unchecked actions.
   - If no project context, fetch all active projects via
     `cadence scan --json` and fuzzy-match across their unchecked
     actions.
   - If the match is ambiguous, present options and ask.

2. **Mark the action(s) done via the CLI:**

   For a single action:
   ```bash
   cadence check <project-id> \
     --pursuit <pursuit-id> \
     --section action \
     --match "<action text or 0-based index>" \
     --note "<optional narrative note>"
   ```

   For multiple actions in one call (e.g., the user wants to check off
   several at once and per-action notes aren't needed), use the bulk
   variant:
   ```bash
   cadence check-items <project-id> \
     --pursuit <pursuit-id> --section action \
     --match "<action 1>" --match "<action 2>" --match "<action 3>"
   ```

   Both commands return the post-mutation `actionProgress` (and
   `dodProgress` for legacy DoD) directly in their JSON response —
   read it from the result; do not re-fetch the project. If the user
   wants to add more actions mid-flow, prefer
   `cadence add-items <id> --section action --text "..." --text "..."`
   over multiple `add-item` calls.

3. **Check for upward completion (no re-fetch):**

   **Project level:** read `actionProgress` from step 2's response.
   - If `actionProgress.done === actionProgress.total` (every action
     checked):
     ```
     All actions checked for [project]. Does the intent feel achieved?
     Complete this project, add more actions, or split?
     ```
     - If the user completes, set the project done AND get the pursuit
       upward summary in one call:
       ```bash
       cadence set-status <project-id> \
         --pursuit <pursuit-id> --status done --include-pursuit
       ```
       The response includes a `pursuit` object: `{id, projects[],
       done, total, allResolved}`. Use it directly in step 4 — do not
       re-fetch the pursuit.
     - If the user adds actions: use `cadence add-items --section
       action` (bulk) or single `add-item` calls. Project stays active.
     - If the user splits: drop or complete the existing project, then
       create new project(s) via `cadence create-project` for the
       remaining work, each carrying its own Intent.
     - An active project with no open actions is inconsistent state —
       resolve via one of these three paths.

4. **Pursuit level:** if `set-status --include-pursuit` was used in
   step 3, read `result.pursuit.allResolved` from the same response.
   Otherwise (e.g., a non-completing mutation) skip this step.
   - If `allResolved`:
     ```
     All projects in [pursuit] are resolved. Complete this pursuit, or
     add more projects?
     ```
     - If the user completes: `cadence move-pursuit <pursuit-id> --to
       archived`. Same rules: complete or extend, no third option.

5. **Confirm:**
   ```
   Done: [action text]
   [project] — [N/M actions]
   ```
   Read N/M from the post-edit `actionProgress` field returned by the
   mutating command in step 2 (no separate fetch needed).

## For physical/standalone tasks

`/complete` can be called without a prior `/start` for quick physical
tasks. In this case:
- Fetch state with `cadence scan --json` and resolve the action across
  all active projects.
- Mark it done with optional note.
- It's a point-in-time completion — no session ceremony either way.

## Guardrails

- No evaluative commentary. "Done: [action]" is sufficient.
- The upward completion prompt is mandatory when all items are checked.
  Do not silently leave a project in all-checked-but-active state.
- Notes are optional. Do not prompt for a note if none was given.
