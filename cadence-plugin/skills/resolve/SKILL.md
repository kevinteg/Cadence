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
- `/resolve <pursuit>` — walk the closure ritual (absolute block on unresolved Ideas), then archive

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
5. Check the `--include-pursuit` response: if `allResolved: true`,
   prompt the upward-completion question:
   "All projects in [pursuit] resolved. `/resolve <pursuit>` to walk
   the closure ritual?"

### `--state dropped`

1. Require a reason: if `--reason` was not supplied, ask: "What's the
   reason for dropping?" Store as required field.
2. Walk the override-with-reason path for unresolved Ideas:
   ```bash
   cadence ideas --parent <pursuit-id>/<project-id> --state seed,developed --json
   ```
   If any are returned: "[Project] has [N] unresolved Ideas. You can
   drop anyway, but let's walk them." For each: move (to another
   parent or to inbox), close-with-reason, promote, or develop-first.
   The user can skip with a logged reason.
3. Drop the project:
   ```bash
   cadence set-status <project-id> --pursuit <pursuit-id> --status dropped --reason "<reason>"
   ```
4. Same upward-completion check via `--include-pursuit`.

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

Both paths require the absolute Ideas block — dropped pursuits still
need meaning-making for their unresolved seeds; silent abandonment is
exactly what the ritual exists to prevent.

If a pursuit needs to be set aside without resolving (might come back),
use `cadence move-pursuit --to someday` instead — that's a different
move (no ritual, no narrative).

### Steps (both paths)

1. Confirm intent based on the path:
   - completed: "Close [pursuit]?"
   - dropped: "Drop [pursuit]? What's the reason?" (require `--reason`
     before proceeding)
2. Check for unresolved Ideas via the bundled CLI:
   ```bash
   cadence ideas --parent <pursuit-id> --state seed,developed --json
   ```
   For ideas whose parent is `<pursuit-id>/<project-id>`, run a second
   query per project (or scan with no `--parent` and filter by prefix
   in the agent). Ideas in `promoted`, `moved`, or `closed` state are
   resolved. For `moved` Ideas, the move only counts as resolution if
   the target pursuit/project is active (not archived, dropped, or
   someday) — verify by reading the Idea's `promoted_to` field and
   cross-checking against `cadence pursuits --json`.

3. **If unresolved Ideas exist — absolute block.** Cannot resolve until
   every Idea is resolved (applies to both completed AND dropped paths):
   ```
   [pursuit] has [N] unresolved Ideas. Each needs a decision before resolving.
   ```

4. Walk each unresolved Idea. For each:
   - **Move** — reattach to another Pursuit or to Inbox (the standing pursuit for unattached Ideas)
   - **Close** — with a reason. Ask: "What did this Idea teach you?"
   - **Promote** — advance to Pursuit/Project/Action (run /promote flow)
   - **Develop first** — if it's a raw Seed, run /develop before deciding

5. Once all Ideas are resolved, check that all Projects are done or
   dropped. If active/on_hold projects remain, ask:
   "These projects are still open. Drop them, or resolve them first?"
   For dropping inline: `cadence set-status <project-id> --pursuit <pursuit-id> --status dropped --reason "<reason>"`

6. **Move the pursuit via the CLI** — to `archived` for completed,
   `dropped` for dropped:
   ```bash
   # completed (default)
   cadence move-pursuit <pursuit-id> --to archived
   # dropped (with --state dropped)
   cadence move-pursuit <pursuit-id> --to dropped
   ```
   The CLI moves the directory to `pursuits/_archived/` or
   `pursuits/_dropped/` and updates the pursuit's `status` frontmatter.

7. **Surface a brain-tickler tip before generating the resolution narrative
   (frequency-capped):**
   ```bash
   cadence tip-pick --triggers moment-long-agent-run --types quote \
     --category resolve-pursuit-interjection --category-cool-down-days 30
   ```
   Pursuit resolutions are rare — a 30-day cool-down means a tip might
   accompany every ~3-5 resolutions, which is the right cadence for a
   ritual moment. If null, skip silently.

8. Generate resolution narrative — summarize the Pursuit's arc via the
   narrator subagent (`subagent_type: cadence:narrator`):
   - **Completed/archived**: framing emphasizes what shipped. "Generated
     [N] Ideas — [X] became Projects, [Y] became their own Pursuits,
     [Z] were closed with reasons, [W] moved to Inbox."
   - **Dropped**: framing emphasizes what was learned. "[Pursuit]
     didn't ship — what did it teach? Reason for dropping: [reason].
     [N] Ideas surfaced; [X] were salvaged into other pursuits, [Y]
     were closed with their own lessons."
   Pass `[Budget: 8 tool calls. If exceeded, return what you have
   without retrying.]` to the narrator. See runtime "Subagent budgets"
   principle.

9. Save narrative to:
   - `narratives/drafts/<pursuit-id>-closure.md` for completed/archived
   - `narratives/drafts/<pursuit-id>-drop.md` for dropped
   The filename suffix lets `/cadence:narrate lessons` distinguish "what
   shipped" from "what got learned without shipping" when synthesizing
   patterns across pursuits.

---

## Cancellation mid-ritual

If the user cancels mid-ritual ("actually, never mind"):
- Walk the ritual anyway for any Ideas already reviewed
- Save progress — partially resolved Ideas stay resolved
- Don't update the pursuit/project status

## Guardrails

- Pursuit closure is an absolute block on unresolved Ideas. No override.
- Project closure with `--state dropped` uses override-with-reason for Ideas.
- Every closed Idea must have a reason — "what did this teach us?"
- Closure narratives are generated from activity data. The user reviews but doesn't write.
- Resolving a project as `complete` with unchecked actions requires explicit override (the agent surfaces the count and asks).
- `--state` is a project-only argument. Surfacing it on a pursuit request gets a one-line note and falls through to closure.
