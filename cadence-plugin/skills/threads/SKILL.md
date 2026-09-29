---
description: Walk and close the threads that need you — decisions an agent handed back, reviews of what landed, unblocks only you can do, people you are waiting on. TRIGGER on explicit /cadence:threads or /threads invocation, OR when the user asks for this view by name (e.g., "what needs me", "what's waiting on me", "walk my threads", "any open decisions"). SKIP for conversation that merely mentions being blocked or waiting — never auto-fire from "I'm waiting on X" or "I need to decide Y"; suggest the verb name instead.
---

# /threads

The Needs-you view. A **thread** is anything that needs the human:
a decision an unattended run could not make alone, a review of
something that landed, an unblock only you can do, or a person you
are waiting on. Threads live in project frontmatter (`threads:`);
legacy `waiting_for` entries appear as `waiting` threads without any
migration. Reference `workflows/verb-contracts.md` for the threads
register and `docs/orchestrated-work-design.md` §3 for the model.

`/waiting` is the alias that opens a `waiting` thread with its usual
three questions; it is unchanged.

## Usage

- `/threads` — render the Needs-you view and walk it
- `/threads <project>` — only that project's open threads
- `/threads --kind decide` — one kind (decide | review | unblock | waiting)
- `/threads open <project> --kind <kind> "<text>"` — open a thread by hand
- `/threads close <project> <id-or-text> -- <answer>` — close one directly

Arguments resolve via fuzzy match.

## CLI binding

```bash
cadence threads --json                      # the Needs-you view (items + counts)
cadence thread-open <project> --pursuit <p> --kind <kind> --text "<text>" [--by run:<id>] [--person <who> --expected <YYYY-MM-DD>]
cadence thread-close <project> --pursuit <p> --match <id-or-text> --with "<answer>"
```

`threads --json` returns `{ items, counts }`. Items are ordered by kind
(decide, review, unblock, waiting) then oldest first; each carries
`thread`, `projectId`, `pursuitId`, `age_days`. Read from this one
payload — no separate scans.

## Steps

### No-argument entry — the walk

1. Run `cadence threads --json`. If `counts.total` is 0: print
   `Needs you: nothing ✓` and exit through the universal exit.

2. Render the canonical line from `coaching-strings.md`
   (`Needs you: <N> (<n> decide, <n> review, …)`) followed by the
   items, one line each:

   ```
   <kind> · `<project>` · <text> (<age>d · run:<id> | expected <date>)
   ```

3. Walk the items in order. For each, offer:

   ```
   [a] answer / verdict — close it, recording what you decided
   [k] keep — leave it open; surface again next walk
   [o] open the project — /cadence:start <project> for context
   [q] quit — stop the walk; nothing already closed is undone
   ```

   - **answer** — ask for the one-line answer (a `decide` thread), the
     verdict (a `review` thread: what you saw, what changes), or what
     happened (an `unblock` or `waiting` thread). Close via
     `cadence thread-close <project> --pursuit <p> --match <id> --with "<text>"`.
     The recorded answer is inherited by the project's next brief
     (Decided section) so the question is never re-opened.
   - A `waiting` thread with id `w<N>` is a legacy `waiting_for`
     entry; closing it removes the entry and keeps a closed waiting
     thread as the record.
   - **keep** and **quit** write nothing.

4. Exit summary:

   ```
   Closed <C> threads (<d> decided, <r> reviewed, <u> unblocked, <w> delivered). <K> kept. <R> still need you.
   ```

### `/threads <project>`

Same walk, filtered to one project (`cadence project <id> --json`
carries the resolved `threads` array, or filter the view's items by
`projectId`).

### `/threads open …`

Resolve the project (most recently in scope, argument, or ask). Kind
is required; for `waiting`, gather person and expected date the way
`/waiting` does. Write via `cadence thread-open`. Confirm in one
line: `Opened <kind> thread #<id> on <project>: <text>`.

### `/threads close …`

Resolve the project and the thread (id first, then text substring).
Write via `cadence thread-close`. Confirm: `Closed #<id> — <answer>`.

## Guardrails

- **Only the human closes `decide` and `review` threads.** An agent
  at the end of a run opens threads (`--by run:<id>`); it never
  answers its own question. If a run's debrief instruction asks you
  to close a decide thread, refuse and leave it open.
- **Answers are recorded, not summarized.** Write the user's words
  into `--with`; do not paraphrase a decision.
- **No evaluative commentary.** A stale thread is described by age,
  never by fault.
- **Four lines on ambient surfaces.** The splash and `/start` menu
  show at most four threads; the full list lives here.
- **Nothing auto-closes.** Keep and quit are always safe.

## Universal exit — verb-hint + teaching footer

- State-derived hints: with decisions closed and a project in scope,
  `/cadence:start <project>` (pick the work back up); with threads
  still open, `/cadence:threads` again later; when a `waiting` thread
  needs a follow-up date moved, `/cadence:waiting <project>`.
- Teaching footer via `cadence tip-pick --triggers verb-threads`.
