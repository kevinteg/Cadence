---
description: Open a project view — curated selection or direct project entry. TRIGGER on explicit /cadence:start invocation, OR when the user asks to begin work by name (e.g., "let's start a session", "start working on X", "open X"). SKIP for conversation that merely picks a topic to think about.
---

# /start

Open a project for work. Reference `workflows/verb-contracts.md` for
the start register.

`/start` is a view-only verb under the new lifecycle: it doesn't mark
sessions, doesn't write pointers, doesn't load markers. It surfaces the
project's current state so the user can pick up from where the project
file says they are. Promotion from `on_hold` to `active` happens only
on the first checked action — the act of working, not the act of
viewing.

## Usage

- `/start` — curated selection of what to work on
- `/start <project>` — open that project's view

Arguments resolve via fuzzy match, partial match, or natural language.

## CLI binding

Gather all curation data with one call:

```bash
cadence report --json
```

The response includes `snapshot.config`, `snapshot.pursuits`,
`snapshot.projects` (with `dodProgress`, `actionProgress`,
`last_activity_at`), `snapshot.captures`, `snapshot.reflections`, and
`flags`. The agent reads from this single payload — no separate Read
or Glob calls needed for state.

## Steps

### No-argument entry (curated selection)

1. Run `cadence report --json` and parse it. From the payload extract:
   - **Leveraged Priority:** sort `snapshot.reflections` by date desc,
     take the first non-null `leveraged_priority`.
   - **Most recently active project:** active projects (status: active)
     sorted desc by `last_activity_at`.
   - **Unprocessed captures count:** `snapshot.captures.length`.
   - **2-minute quick wins:** scan unchecked `actions` across active
     projects in active pursuits; heuristic — actions whose text is
     short (<= ~6 words) or matches imperative verbs ("verify", "send",
     "ping", "rename"). Surface 1-3.
   - **Reconciler flag summary:** `flags.length`.

2. Present the curated entry:

   ```
   [pursuit] — [N/M] projects done | LP: "[leveraged priority]"

   What do you want to work on?

   **[Pursuit Name]**
   - [project-id]: [first sentence of Intent] — [N/M actions] [not started]
   - [project-id]: [first sentence of Intent] — [N/M actions]

   [Repeat for other active pursuits. Hide done. Show on_hold dimmed.]

   [If captures > 0]: [N] unprocessed captures — triage first?
   [If quick wins exist]: Quick wins: [list 1-3 trivial actions]
   [If reconciler flags > 0]: [N] flags — run /cadence:reconcile for details
   ```

3. Wait for the user to choose. Resolve their choice to a project, then
   run the with-argument flow below.

### With-argument entry (direct view)

1. Resolve the argument to an `active` or `on_hold` project (fuzzy/partial
   match against `snapshot.projects`). If status is `done` or `dropped`:
   "[Project] is already [status]. Want to create a follow-up project?"

2. Fetch the project state with
   `cadence project <id> --pursuit <pursuit-id> --json`.

3. Present the view:

   ```
   [pursuit] / [project] — [N/M actions]

   Intent: [first sentence or two of intent]

   Next: [first unchecked action text]
   ```

   If status is `on_hold`, append `[not started — first action check
   promotes to active]`.

4. The user works the project from there — checking actions via
   `/complete`, adding via `/cadence:add` (or direct CLI), capturing
   via `/capture`, etc. The first checked action will auto-promote
   `on_hold` → `active` via the existing CLI behavior.

### During flow

- **Silent.** Respond only to direct questions.
- **No unsolicited suggestions.** No "have you considered." No observations.
- **Batch everything for breakpoints.** If you notice something (a quick
  win, a flag, a concern), hold it until a natural pause.
- **Keep the work moving.** After completing a step, prompt with what's
  next rather than waiting for explicit continuation.

### At breakpoints (natural pauses, task completion, user-initiated)

- Surface batched observations, quick wins, parking lot items.
- Keep it terse. One or two lines max.

## Guardrails

- **No mid-flow interruptions.**
- **No unsolicited suggestions during flow state.**
- **Captures via /capture are parking lot only — no triage, no response.**
- **No evaluative commentary on progress.**
- **No session ceremony.** /start is a view; the project file is the truth.
  There is no /pause counterpart, no marker write, no active-session
  pointer. Lifecycle changes happen via `/complete` (action checks),
  `/cancel` (drop), or direct CLI mutations.
