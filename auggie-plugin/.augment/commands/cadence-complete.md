---
description: Complete an action — mark it done, trigger upward completion prompts. TRIGGER ONLY when the user explicitly invokes /cadence-complete or /complete. SKIP all natural-language equivalents — never auto-fire from "I finished X", "that's done", "check that off", or task-completion announcements.
argument-hint: '[project|action]'
---

<arguments>$ARGUMENTS</arguments>


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
     All projects in [pursuit] are resolved. `/cadence-resolve
     <pursuit>` to walk the closure ritual, or add more projects?
     ```
     - If the user resolves: `/cadence-resolve <pursuit>` walks the
       closure ritual (absolute block on open projects + active
       brainstorms; each gets resolved, crystallized, or archived)
       then routes via `cadence move-pursuit <pursuit-id> --to
       archived` (completed) or `--to dropped` (with reason). Same
       rules: complete or extend, no third option.
   - If NOT `allResolved` AND a project just completed AND
     `cadence report --json | .flags[]` includes a
     `closing_in_on_resolution` flag for this pursuit:
     ```
     [pursuit] is closing in — [resolvedCount]/[totalCount] projects
     done, [unresolvedCount] left. What would need to be true for
     [pursuit] to close? Common finalizing work to consider:

     - audit: does the implementation match the Intent?
     - narrative: capture the arc (run /cadence-narrate <pursuit>)
     - capstone: crystallize the research into a durable narrative
       (run /cadence-narrate capstone <pursuit>) — especially when a
       research substrate exists with no capstone yet
     - demo: prepare to show others
     - validation review: clear the pending-validations queue
       (cadence pending-validation-list)

     Add finalizing projects, or are we close enough to /resolve?
     ```
     This is a **suggestion, not a block** — the user can ignore it
     and continue working. The point is to surface finalization as a
     planned phase rather than a surprise discovery, so pursuits like
     build-cadence-v1 don't need their audit/narrative/demo work
     inserted at the very end.

5. **Physical-domain Notes capture.** If the project's
   `effective_domain` is `physical` or `hybrid` (read from
   `cadence project <id> --json`), prompt before confirming:
   ```
   What changed in the physical space? (Optional — anything notable
   about the result, condition, parts used, time spent, surprises.)
   ```
   If the user provides text, append it to the project's Notes section
   as a timestamped entry:
   ```bash
   cadence add-item <project-id> --pursuit <pursuit-id> \
     --section notes --text "<YYYY-MM-DDTHH:MM> — [action text]: <user response>"
   ```
   This is the natural log replacement — the project file accumulates
   activity that the narrative engine can read, without adding a /log
   verb. For digital and unknown domains, skip this step (commit
   messages and code changes already provide the activity stream).

6. **Confirm:**
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
