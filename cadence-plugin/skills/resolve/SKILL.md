---
description: Wrap up a project or pursuit. Replaces the old /close + /cancel pair. Project-level uses --state complete (default) or --state dropped (with reason). Pursuit-level always means closure ritual + archive. TRIGGER ONLY when the user explicitly invokes /cadence:resolve or /resolve. SKIP all natural-language equivalents — never auto-fire from "wrap this up", "we're done with X", "drop this project", or finalization talk.
---

# /resolve

Wrap up a project or pursuit. One verb, entity-aware behavior. Replaces
the old `/close` and `/cancel` verbs.

## Usage

- `/resolve <project>` — same as `--state complete`
- `/resolve <project> --state complete` — finish the project; walks the intent-feel-achieved dialogue
- `/resolve <project> --state dropped --reason "<text>"` — drop with override-with-reason
- `/resolve <pursuit>` — walk the closure ritual (absolute block on unresolved brainstorms in `phase: diverging | converging`), then archive

Arguments resolve via fuzzy match. State defaults to `complete` for
projects. Pursuits don't take a state — they always mean closure.

## Routing

Resolve the argument to a specific entity:

1. Try as a pursuit ID (`cadence pursuits --json`, fuzzy/partial OK).
   If matched → run **Pursuit Closure** below.
2. Try as a project ID (`cadence scan --json`, fuzzy/partial OK).
   If matched → run **Project Resolution** below (use `--pursuit <id>`
   to disambiguate if multiple match).
3. If no match: "No pursuit or project matches '[arg]'. Try
   `/cadence:status` to see options."

If `--state` was provided alongside a pursuit argument, ignore it with
a one-line note: "Pursuits don't take --state — running closure ritual."

---

## Project Resolution

### `--state complete` (default)

1. Confirm intent: "Resolve [project] as complete?"
2. Check action progress via `cadence project <id> --pursuit <pursuit-id> --json`.
3. **If all actions are checked** → standard completion:
   - Surface the project's Intent and ask:
     "All actions checked. Does the intent feel achieved? Mark as done?"
   - On confirmation: `cadence set-status <project-id> --pursuit <pursuit-id> --status done --include-pursuit`
4. **If actions remain unchecked** → require explicit override:
   - "[N] actions still open. Resolving as complete anyway?"
   - On confirmation: same `set-status` call as above; the user is
     declaring done by Intent dialogue, not by action sweep.
5. **Research disposition.** If the project has a research substrate
   (`pursuits/<pursuit>/projects/<id>/research/` exists), walk the GC
   ritual — see "Research disposition (the GC ritual)" below. No
   substrate → skip silently.
6. Check the `--include-pursuit` response: if `allResolved: true`,
   prompt the upward-completion question:
   "All projects in [pursuit] resolved. `/resolve <pursuit>` to walk
   the closure ritual?"

### `--state dropped`

1. Require a reason: if `--reason` was not supplied, ask: "What's the
   reason for dropping?" Store as required field.
2. (Placeholder until `rebuild-brainstorm-as-workspace-with-phase-machine` lands: walk the override-with-reason path for unresolved brainstorms tied to this project. The post-P2 check will scan `brainstorms/<slug>/meta.yaml` for entries with `phase: diverging | converging` whose `source_thoughts` or context links reference this project, and prompt to archive or crystallize each one before dropping.)
3. Drop the project:
   ```bash
   cadence set-status <project-id> --pursuit <pursuit-id> --status dropped --reason "<reason>"
   ```
4. **Research disposition.** Same as the complete path — a dropped
   project's research is often the most valuable thing it produced.
   The no-capstone encouragement applies with drop framing ("the
   project didn't ship; the learning can still graduate").
5. Same upward-completion check via `--include-pursuit`.

---

## Pursuit Resolution

`/resolve <pursuit>` resolves a pursuit. Two paths, both walk the same
Zeigarnik-release cleaning ritual but produce different outcomes:

- **`/resolve <pursuit>`** (default — completed/archived): closure
  ritual + archive. The pursuit shipped; the narrative captures what
  was done.
- **`/resolve <pursuit> --state dropped --reason "<text>"`**: drop
  ritual + route to `_dropped/`. The pursuit didn't ship but you
  learned from it; the narrative captures what it taught you.

Both paths require the absolute block on unresolved brainstorms (in
`phase: diverging | converging`) — dropped pursuits still need
meaning-making for their open workspaces; silent abandonment is
exactly what the ritual exists to prevent.

If a pursuit needs to be set aside without resolving (might come back),
use `cadence move-pursuit --to someday` instead — that's a different
move (no ritual, no narrative).

### Steps (both paths)

1. Confirm intent based on the path:
   - completed: "Close [pursuit]?"
   - dropped: "Drop [pursuit]? What's the reason?" (require `--reason`
     before proceeding)
2. **Check for unresolved brainstorms via the bundled CLI:**
   ```bash
   cadence scan --json
   ```
   Read `snapshot.brainstorms` and filter to entries with
   `phase: diverging | converging` whose `source_thoughts` or
   `target_pursuit` references this pursuit. (Without an explicit
   tie, treat any active brainstorm whose `source_thoughts` traces
   back to a capture inside this pursuit as a candidate.) Each must
   be archived (`/cadence:brainstorm --archive`) or crystallized
   (`/cadence:brainstorm --crystallize`) before the pursuit can
   resolve.

3. **If unresolved brainstorms exist — absolute block.** Cannot
   resolve until every workspace is archived or crystallized (applies
   to both completed AND dropped paths):
   ```
   [pursuit] has [N] unresolved brainstorms. Each needs a decision before resolving.
   ```

4. Walk each unresolved brainstorm. For each:
   - **Archive** — close the workspace via `/cadence:brainstorm --archive` (keep in wiki/_archive/brainstorms/ or delete)
   - **Crystallize** — materialize one of its solutions as a new pursuit via `/cadence:brainstorm --crystallize`

5. Once all brainstorms are resolved, check that all Projects are done or
   dropped. If active/on_hold projects remain, ask:
   "These projects are still open. Drop them, or resolve them first?"
   For dropping inline: `cadence set-status <project-id> --pursuit <pursuit-id> --status dropped --reason "<reason>"`

6. **Research disposition — pursuit sweep.** Before the directory
   moves: walk the GC ritual (see "Research disposition (the GC
   ritual)" below) for the pursuit-level substrate AND any
   project-scoped substrates beneath it whose disposition was skipped
   or kept earlier. This is the last natural moment — after the move,
   the substrate travels into `_archived/`/`_dropped/` as-is.

7. **Move the pursuit via the CLI** — to `archived` for completed,
   `dropped` for dropped:
   ```bash
   # completed (default)
   cadence move-pursuit <pursuit-id> --to archived
   # dropped (with --state dropped)
   cadence move-pursuit <pursuit-id> --to dropped
   ```
   The CLI moves the directory to `pursuits/_archived/` or
   `pursuits/_dropped/` and updates the pursuit's `status` frontmatter.

8. **Surface a brain-tickler tip before generating the resolution narrative
   (frequency-capped):**
   ```bash
   cadence tip-pick --triggers moment-long-agent-run --types quote \
     --category resolve-pursuit-interjection --category-cool-down-days 30
   ```
   Pursuit resolutions are rare — a 30-day cool-down means a tip might
   accompany every ~3-5 resolutions, which is the right cadence for a
   ritual moment. If null, skip silently.

9. Generate resolution narrative — summarize the Pursuit's arc via the
   narrator subagent (`subagent_type: cadence:narrator`). When a
   capstone exists for the pursuit (or its projects), brief the
   narrator to reference it rather than retell it — the closure
   narrative records the resolution event; the capstone is the
   durable telling:
   - **Completed/archived**: framing emphasizes what shipped. "Generated
     [N] brainstorms — [X] crystallized into projects, [Y] archived."
   - **Dropped**: framing emphasizes what was learned. "[Pursuit]
     didn't ship — what did it teach? Reason for dropping: [reason].
     [N] brainstorms surfaced; [X] were crystallized into other
     pursuits, [Y] were archived with their own lessons."
   Pass `[Budget: 8 tool calls. If exceeded, return what you have
   without retrying.]` to the narrator. See runtime "Subagent budgets"
   principle.

10. Save narrative to:
   - `wiki/drafts/<pursuit-id>-closure.md` for completed/archived
   - `wiki/drafts/<pursuit-id>-drop.md` for dropped
   The filename suffix lets `/cadence:narrate lessons` distinguish "what
   shipped" from "what got learned without shipping" when synthesizing
   patterns across pursuits.

---

## Research disposition (the GC ritual)

Runs whenever a unit with a research substrate resolves — project
paths after the status mutation, pursuit path before the directory
moves. **GC is prompted, never silent.** Close-out is the forcing
function for crystallizing knowledge at the moment it's most complete;
the disposition prompt IS the capstoning ritual.

1. **Branch on capstone existence** — does `wiki/narratives/<unit-id>.md`
   exist (equivalently: does the unit file carry a `narrative:`
   pointer)?

   **Capstone exists** — offer disposition, delete as default:
   ```
   Capstone exists at wiki/narratives/<unit-id>.md. The research
   substrate (<N> raw sources) is safe to clear.
     [D] Delete raw/ (default) — working tree cleaned; git history retains;
         notes/, index.md, log.md stay; the capstone's stubs stand alone
     [A] Archive — relocate raw/ to wiki/_archive/<unit-id>/raw/
     [K] Keep — the substrate still feeds follow-on work
   ```

   **No capstone** — encourage capstoning; this is the moment:
   ```
   You pulled <N> sources into this and never crystallized them. This
   is the moment to summarize the arc and link back to what you
   learned, before the raw research is cleared.
     [G] Generate a capstone now (recommended) — runs
         /cadence:narrate capstone <unit>, then re-offers disposition
     [C] Clear without capstone — provenance survives only in notes/ + git
     [K] Keep raw — defer the decision
   ```

2. **Primer graduation offer.** If the substrate's `index.md` has a
   non-empty `## Primer` section, offer once: "Graduate the primer to
   `wiki/primers/<unit-id>-primer.md`?" On yes, copy the Primer +
   Suggested learning content into a standalone artifact with wiki
   frontmatter (`type: primer`, `unit`, `pursuit`, `created`,
   `sources`, `status: published`, `tags`), add its line to
   `wiki/index.md` (Primers section), and log the graduation in
   `wiki/log.md`. A good primer is the fastest re-entry into a topic
   months later — deleting it with the scaffolding wastes it.

3. **Stub verification before any delete.** When a capstone exists,
   check its Sources section lines are stub-complete (title + uri +
   captured date). If the capstone predates some sources or lacks the
   section, offer to regenerate it first — provenance must never
   depend on `raw/` surviving.

4. **ELI5 before delete.** Plain-language recap, then act:
   - What clears: `raw/` only. What stays: `notes/`, `index.md`,
     `log.md`, the capstone, any graduated primer, git history.
   - Then `rm -rf <unit-path>/research/raw/`, set the index
     frontmatter `status: cleared`, and append the log entry:
     `## [YYYY-MM-DD] gc | raw cleared (<N> sources) — capstone wiki/narratives/<unit-id>.md`

5. **Archive path** (non-default): `mkdir -p wiki/_archive/<unit-id>
   && mv <unit-path>/research/raw wiki/_archive/<unit-id>/raw`
   (`git mv` when tracked), set index `status: archived-raw`, append
   the matching log entry.

**What always survives GC:** the capstone narrative, any graduated
primer, the distilled notes + index + log, and the citation stubs
(title, url, capture date) embedded in the capstone — *"link back to
the sources we pulled from"* holds even after `raw/` is gone.

---

## Cancellation mid-ritual

If the user cancels mid-ritual ("actually, never mind"):
- Walk the ritual anyway for any brainstorms already reviewed
- Save progress — partially resolved brainstorms stay resolved
- Don't update the pursuit/project status

## Guardrails

- Pursuit closure is an absolute block on unresolved brainstorms. No override.
- Project closure with `--state dropped` uses override-with-reason for brainstorms tied to the project (post-P2).
- Every archived brainstorm should carry a reason in its decision.md — "what did this teach us?"
- Closure narratives are generated from activity data. The user reviews but doesn't write.
- Resolving a project as `complete` with unchecked actions requires explicit override (the agent surfaces the count and asks).
- `--state` is a project-only argument. Surfacing it on a pursuit request gets a one-line note and falls through to closure.
- **GC is prompted, never silent.** No research file is deleted or moved without the disposition prompt + ELI5 recap. Delete-by-default applies only once a capstone exists; "Keep" is always on the menu.
- **Only `raw/` is GC-eligible.** Distilled notes, index, and log are durable working state; the wiki tier (capstones, primers) is never GC'd.
