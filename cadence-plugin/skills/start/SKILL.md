---
description: Start a session — curated selection or direct project entry with flow protection. TRIGGER on explicit /cadence:start invocation, OR when the user asks to begin a tracked work session by name (e.g., "let's start a session", "start working on X", "open a session on Y"). SKIP for conversation that merely picks a topic to think about without requesting a tracked session.
---

# /start

Begin a work session. Reference `workflows/verb-contracts.md` for the
start register.

## Usage

- `/start` — curated selection of what to work on
- `/start <project>` — start a session on that project

Arguments resolve via fuzzy match, partial match, or natural language.

## CLI binding

Gather all curation data with one
call:

```bash
cadence report --json
```

The response includes `snapshot.config`, `snapshot.pursuits`,
`snapshot.projects` (with `dodProgress`, `actionProgress`, `hasMarker`,
`mostRecentMarker`), `snapshot.captures`, `snapshot.reflections`, and
`flags`. The agent reads from this single payload — no separate Read or
Glob calls needed for state.

## Steps

### No-argument entry (curated selection)

1. Run `cadence report --json` and parse it. From the
   payload extract:
   - **Leveraged Priority:** sort `snapshot.reflections` by date desc,
     take the first non-null `leveraged_priority`.
   - **Most recent marker:** run
     `cadence markers --json` (sorted desc by timestamp,
     first entry is most recent across all pursuits).
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

3. Wait for the user to choose. Resolve their choice to a project.

### With-argument entry (direct session)

1. Resolve the argument to an `active` or `on_hold` project (fuzzy/partial
   match against the `snapshot.projects` array from
   `cadence scan --json`). If status is `done` or `dropped`:
   "[Project] is already [status]. Want to create a follow-up project?"

2. If there is already an active session in this conversation, prompt:
   "You have an active session on [project]. /pause first, or switch?"
   If the user switches, auto-pause the current session before starting
   the new one.

### Promote on_hold projects

If the resolved project's `status` is `on_hold`, promote it to `active`
before opening the session — starting the project IS the act of pulling
it off the backlog:

```bash
cadence set-status <project-id> --pursuit <pursuit-id> --status active
```

This applies to both no-argument (curated) and with-argument entry paths.

### Session start

1. Read the most recent marker for this project:
   ```bash
   cadence markers --pursuit <pursuit-id> --project <project-id> --json
   ```
   The list is sorted desc by timestamp; the first entry is the most
   recent.
2. If a marker exists, present the ready-to-resume recap:
   ```
   [pursuit] / [project] — [N/M actions]

   Next: [*next* field from marker, verbatim]
   Where: [brief summary of *where* field]
   ```
3. If no marker exists, fetch the project state with
   `cadence project <id> --pursuit <pursuit-id> --json` and
   present:
   ```
   [pursuit] / [project] — [N/M actions]

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
