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

## Pursuit Closure

`/resolve <pursuit>` always means the closure ritual. There's no
project-style `--state` for pursuits — if a pursuit needs to be set
aside without closing, use `cadence move-pursuit --to someday`.

1. Confirm intent: "Close [pursuit]?"
2. Check for unresolved Ideas via the bundled CLI:
   ```bash
   cadence ideas --parent <pursuit-id> --state seed,developed --json
   ```
   For ideas whose parent is `<pursuit-id>/<project-id>`, run a second
   query per project (or scan with no `--parent` and filter by prefix
   in the agent). Ideas in `promoted`, `moved`, or `closed` state are
   resolved. For `moved` Ideas, the move only counts as resolution if
   the target pursuit/project is active (not archived or someday) —
   verify by reading the Idea's `promoted_to` field and cross-checking
   against `cadence pursuits --json`.

3. **If unresolved Ideas exist — absolute block.** Cannot close until
   every Idea is resolved:
   ```
   [pursuit] has [N] unresolved Ideas. Each needs a decision before closing.
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

6. **Archive the pursuit via the CLI:**
   ```bash
   cadence move-pursuit <pursuit-id> --to archived
   ```
   The CLI moves the directory to `pursuits/_archived/` and updates the
   pursuit's `status` frontmatter to `archived`.

7. Generate closure narrative — summarize the Pursuit's arc:
   "Generated [N] Ideas — [X] became Projects, [Y] became their own
   Pursuits, [Z] were closed with reasons, [W] moved to Inbox."

8. Save narrative to `narratives/drafts/<pursuit-id>-closure.md`.

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
