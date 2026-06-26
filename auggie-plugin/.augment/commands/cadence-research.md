---
description: Build and use a unit-scoped research substrate — ingest a source into raw/ + a distilled atomic note (subagent-isolated), query the substrate index-first (ask), or synthesize an on-ramp (primer). TRIGGER ONLY when the user explicitly invokes /cadence-research or /research. SKIP all natural-language equivalents — never auto-fire from "look this up", "read this article", "research X", "what do my sources say", or a pasted link mid-conversation.
argument-hint: ingest|primer|ask
---

<arguments>$ARGUMENTS</arguments>


# /research

`/cadence-research` manages the **research substrate** — the working
tier of sources and distilled notes that accumulates *under* a unit of
work (a project or a pursuit). Substrate formats, directory layout,
the index/note/log shapes, and the id + dedup conventions live in
`.augment/cadence-reference.md` → "Research Substrate"; this skill follows them
exactly.

Three operations:

- **Ingest** (`/research <path-or-url>`) — pull a source into the
  unit's `research/raw/`, distill an atomic note into
  `research/notes/`, update the index and log. Bulk payload stays in
  the `research-ingest` subagent's context.
- **Ask** (`/research ask "<question>"`) — answer from the substrate,
  index-first, with citations into notes.
- **Primer** (`/research primer`) — synthesize the orientation + a
  suggested learning order from the accumulated notes into the index.

## Usage

- `/research <path-or-url>` — ingest at the current unit (project in scope)
- `/research <path-or-url> --prompt "<guidance>"` — ingest with distillation guidance
- `/research <path-or-url> --pursuit [<id>]` — ingest at pursuit scope
- `/research <path-or-url> --project <id>` — ingest at an explicit project
- `/research ask "<question>" [--pursuit [<id>] | --project <id>]` — query the substrate
- `/research primer [--pursuit [<id>] | --project <id>]` — generate/regenerate the primer

## Scope resolution (shared by all three paths)

1. Explicit flags win: `--project <id>` targets that project's
   substrate; `--pursuit <id>` targets that pursuit's; bare
   `--pursuit` escalates from the project in scope to its pursuit.
2. Otherwise the unit is the **project most recently in scope** in
   the conversation — the same targeting rule `/complete` uses.
   Mentioning other projects as background does not shift it.
3. Nothing in scope → ask: "Which project (or pursuit) is this
   research for?" — list 2-3 likely candidates from `cadence report
   --json`. Never guess.

Resolve ids against `cadence report --json` (`snapshot.projects`,
`snapshot.pursuits`). Unit paths:

- project unit → `pursuits/<pursuit>/projects/<project>/research/`
- pursuit unit → `pursuits/<pursuit>/research/`

Completed or dropped projects are not valid targets ("[project] is
[status] — research attaches to open work; use the pursuit scope or a
follow-up project"). Archived/dropped pursuits likewise.

## Steps — Ingest

1. **Resolve the unit** (above). Classify the source:
   `file` (local path), `url` (http/https), `mcp` (only when the user
   explicitly named a server/source — same user-direction discipline
   as everywhere else).

2. **Scaffold on first ingest.** If `<unit-path>/research/index.md`
   does not exist, Write it from the template in the reference
   (frontmatter `unit`, `created` (today), `status: researching`,
   `sources: 0`; H1 `# Research: <unit title>`; the four sections:
   Primer / Suggested learning / Sources / Open questions), and Write
   `log.md` with its `# Research log: <unit>` header. No other
   scaffolding — `raw/` and `notes/` are created by the subagent's
   writes.

3. **Generate the id**: kebab-case slug from the source title or file
   basename. Check `<unit-path>/research/notes/` for collisions;
   suffix `-2`, `-3`, … if taken.

4. **Dispatch the `research-ingest` subagent** (Agent tool,
   `subagent_type: research-ingest`). Prompt shape:

   ```
   ingest. unit=<pursuit>[/<project>], unit_path=<repo-relative unit path>,
   source_kind=<file|url|mcp>, source_name=<name>, [server=<...>,]
   [uri=<...>,] [query=<...>,] prompt=<--prompt text or empty>.
   id=<the generated id>. [Budget: 6 tool calls.]
   ```

   The subagent dedups against the index, fetches the source, writes
   `raw/<id>.raw.md` + `notes/<id>.md`, and returns a single JSON
   summary (see `agents/research-ingest.md` for the contract). The
   raw payload never enters this conversation.

5. **Integrate the return** (skill-owned writes, per the division of
   labor in the reference):
   - `status: skipped_existing` → report which existing source
     matched; write nothing; skip to step 6.
   - Append the Sources line to `index.md`:
     `- `<id>` — <summary> → [note](notes/<id>.md) · [raw](raw/<id>.raw.md)`
   - Bump the `sources:` count in the index frontmatter.
   - Merge any `open_questions` into `## Open questions` (skip
     near-duplicates of existing lines).
   - Append the log entry:
     `## [YYYY-MM-DD] ingest | <title>` + the one-line summary.
   - For each entry in `related`, append the back-link
     `- [[<new-id>]] — <why>` to that note's `## Related` section
     (create the section if absent). Bidirectional by convention.

6. **Summarize.** One compact block:

   ```
   Ingested into <unit> research (<N> sources):
     <id> — <one-line summary>
     related: [[<id>]], [[<id>]]        (omit when none)
     open question: <text>              (omit when none)
   ```

   Then the exit surfaces (below).

## Steps — Ask

1. **Resolve the unit.** No `index.md` → "No research substrate on
   <unit> yet — `/research <source>` starts one." Exit.

2. **Index-first discipline.** Read `index.md`. For substrates of
   **≤10 sources**, answer in the main thread: pick the most relevant
   notes from the Sources summaries (at most 4), read them, synthesize.
   For **larger substrates or broad questions**, dispatch the
   subagent instead (`ask. unit=..., unit_path=..., question=...
   [Budget: 6 tool calls.]`) so bulk note-reading stays isolated.

3. **Answer with citations.** Every load-bearing claim cites its note
   inline — `[<id>](.../notes/<id>.md)`. If the substrate can't answer,
   say so and offer the gap as an `## Open questions` entry (append on
   user confirmation). Never pad an answer beyond what the notes hold.

4. **Log the query.** Append to `log.md`:
   `## [YYYY-MM-DD] query | <question>` + `consulted: <ids> — <answer gist>`.

5. Exit surfaces.

A good answer is a candidate artifact: when a synthesis seems worth
keeping, offer once — "worth saving into the substrate as a note?" —
and on yes, write it as `notes/<slug>.md` with `source.kind: synthesis`
frontmatter plus an index line. Offer, never auto-file.

## Steps — Primer

1. **Resolve the unit.** No substrate → same hint as Ask. Fewer than
   3 sources → note it ("the primer gets better with more sources —
   <N> so far; generate anyway?") and proceed only on confirmation.

2. **Dispatch the subagent** in primer mode
   (`primer. unit=..., unit_path=... [Budget: 8 tool calls.]`). It
   reads the index + notes and returns `primer_markdown` +
   `suggested_learning` (see the agent contract).

3. **Write the sections.** Replace the contents of `## Primer` with
   `primer_markdown` and `## Suggested learning` with the ordered
   list (`1. [[<id>]] — <why>`). Regeneration replaces; the previous
   primer survives in git history. If the agent reported
   `notes_skipped`, append one line: `*(primer covers N of M notes)*`.

4. **Log it.** `## [YYYY-MM-DD] primer | regenerated` + `from <N> notes`.

5. **Render the primer** in the conversation (it's short by contract)
   and exit.

## Guardrails

- **Subagent isolation is load-bearing.** Never fetch a bulk source
  (file over ~200 lines, any URL, any MCP payload) in the main thread
  during ingest — that's the subagent's job. Small inline snippets the
  user pastes are still routed through the subagent for uniform raw/
  provenance.
- **`raw/` is immutable; the skill never writes it.** The skill owns
  `index.md`, `log.md`, and back-link appends into existing notes —
  nothing else inside `research/`.
- **No MCP on agent initiative.** `source_kind: mcp` only when the
  user named the server or source. External-tool discipline applies
  unchanged (see runtime).
- **Research is not capture.** A stray thought mid-flow belongs in
  `/capture` (Inbox, untriaged). The substrate holds deliberately
  studied sources attached to a unit. Don't route captures here; don't
  park sources in the Inbox when the user said `/research`.
- **No evaluative commentary, no fabricated synthesis.** Ask answers
  and primers cite notes; gaps are named, not papered over.
- **View-only on state.** `/research` never changes project status,
  checks actions, or touches anything outside the unit's `research/`
  directory.

## Exit conventions

Every path ends with the two standard surfaces:

1. **Verb-hint block** — state-derived, 2-3 lines. After ingest:
   `/research ask "<question>"` (the substrate can answer now),
   `/research primer` (once ≥3 sources), or back to the work
   (`/cadence-start <project>`). After ask/primer: `/research <source>`
   to fill a named gap, or `/cadence-capture` if the answer sparked
   off-topic thoughts.
2. **Teaching footer** — `cadence tip-pick --triggers verb-research`;
   render the one-liner when non-null, blank line above it, skip
   silently on null.
