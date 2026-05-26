---
description: Capture into the Inbox. Inline `/capture "..."` is silent (flow-safe parking lot). Distillation paths (`--from`, `--source`, `--dump`) dispatch a capture-ingest subagent, write captures with v2 frontmatter + suggested_outcomes, then surface an outcome menu so the user can immediately route items out of the Inbox into actions / projects / brainstorms. TRIGGER ONLY when the user explicitly invokes /cadence:capture or /capture. SKIP all natural-language equivalents — never auto-fire from "remember this", "note that", "save this thought", "don't let me forget", or any stray-thought dump mid-conversation.
---

# /capture

`/cadence:capture` writes into the Inbox — the view across untriaged
captures and diverging brainstorms (see `cadence-runtime.md`'s Inbox
vocabulary entry). Two contracts coexist:

- **Inline silent capture** (`/capture "..."`, `/capture` with text on the same line, stdin via `--`) — zero agent response. Flow-safe parking lot. The body lands in `thoughts/unprocessed/` with v1 frontmatter (`captured` + `verb_context`); no outcome menu.
- **Distillation capture** (`--from`, `--source`, `--dump`) — dispatches the `capture-ingest` subagent, which reads the source, distills per `--prompt`, writes raw + distilled artifacts, and returns a per-item summary with `outcome_kind` suggestions. The parent session then surfaces a small outcome menu so the user can route items out of the Inbox immediately. Items the user doesn't route stay in the Inbox for triage via `/cadence:start inbox` (or surface during `/cadence:reflect` Get Clear awareness pass).

Both paths land in the same Inbox. **`thoughts/unprocessed/` is the audit trail.** The outcome menu just lets material *exit* the Inbox immediately when the user has clarity.

## Usage

- `/cadence:capture "<text>"` — inline, silent (the v1 contract; unchanged)
- `/cadence:capture` (no input) — opens `$EDITOR` for a brain dump (acts like `--dump`)
- `/cadence:capture --from <path-or-url> [--prompt "<distillation guidance>"]` — file or URL ingest, distilled
- `/cadence:capture --source <named> [--prompt "..."]` — named MCP query from `ingest_sources:` (see `cadence-reference.md` → Capture Ingestion)
- `/cadence:capture --dump [--prompt "..."]` — explicit `$EDITOR` brain dump

The `--prompt` field is what the capture-ingest subagent uses to
distill the source into items. Without a prompt, the subagent writes
a faithful condensation (one item). With a prompt, it extracts per
the instruction (potentially many items).

## Steps

### Silent inline path

1. Accept the user's input as the body. Do NOT respond, acknowledge, or ask for more detail. Flow safety is the contract.
2. Determine `verb_context`:
   - Mid `/brainstorm` → `seed`
   - Otherwise → `note`
3. Write via the bundled CLI:
   ```bash
   cadence write-capture --body "<raw input>" --verb-context <ctx>
   ```
4. **Do not respond.** The capture is saved silently. The user returns to whatever they were doing.

### Distillation path (`--from` / `--source` / `--dump`)

1. **Resolve the source.** If `--source <name>`, look it up in `ingest_sources:` (cadence.yaml first, then `~/.cadence/sources.yaml`). Error with available names if no match. Confirm the resolved server is registered with Claude Code (`mcp__<server>__*` tools visible via ToolSearch). If the server isn't registered, surface a hint to run `claude mcp add` and exit.

2. **Generate the timestamp id** matching `YYYY-MM-DD-HHMM-<slug>` shape. The slug derives from `--source` name or `--from` basename, kebab-cased.

3. **Dispatch the `capture-ingest` subagent.** Use the Agent tool with `subagent_type: capture-ingest`. Prompt shape:
   ```
   ingest. source_kind=<file|url|mcp>, source_name=<name>, [server=<...>,] [uri=<...>,] [query=<...>], prompt=<user's --prompt text or empty>. id=<the generated id>. [Budget: 5 tool calls.]
   ```
   The subagent reads the source, distills per the prompt, writes the raw payload to `thoughts/_raw/<id>.raw.md`, writes one capture per distilled item via `cadence write-capture --schema-version 2 ...`, and returns a single JSON block summarizing what it wrote. See `cadence-plugin/agents/capture-ingest.md` for the return contract.

4. **Surface the outcome menu.** Parse the agent's returned JSON. For each item, the subagent suggested an `outcome_kind` (`two_minute_action` | `action` | `project` | `brainstorm_seed` | `note`) and possibly a `suggested_pursuit`. Render the menu:

   ```
   Captured <N> item(s) from <source>. Now in your Inbox at thoughts/unprocessed/.

     1. [<outcome_kind>] <title>
        → suggested: add as action on <pursuit>     (confidence <conf>)
     2. [<outcome_kind>] <title>
        → suggested: propose as project              (confidence <conf>)
     3. [<outcome_kind>] <title>
        → keep in Inbox                              (no clear outcome)

   What now?
     - <number> [+ outcome override] — route that item
     - 'all <outcome>' — apply the suggested outcome to all (or override)
     - 'inbox' (or just press enter) — leave everything in the Inbox; triage later via /cadence:start inbox

   (Each routing prompts an ELI5 confirm before any write outside thoughts/.)
   ```

   **Default-to-action when confidence is high.** For items where the subagent returned `confidence >= 0.8` AND a `suggested_pursuit`, frame the choice as "Suggested: add as action on `<pursuit>` [Y/n]" — capital Y signals default Yes, so pressing Enter accepts the suggestion. This keeps the path of least resistance toward acting on high-confidence captures, not hoarding them in the Inbox. Fall back to "keep in Inbox" as the default ([Y/n] on `inbox`) only when confidence is low OR no `suggested_pursuit` is named. The exact wording lives in `cadence-plugin/workflows/coaching-strings.md` under "Post-capture outcome menu" — quote from there.

5. **Materialize routed outcomes.** Per the user's pick:
   - `two_minute_action` / `action` → `cadence add-item <project> --pursuit <pursuit> --section action --text "<title>"`. If the user chose a different project than suggested, ask which.
   - `project` → run the project-creation dialogue (Intent + first actions extracted from the capture body) via `cadence create-project`.
   - `brainstorm_seed` → `cadence create-brainstorm <slug>` (slug from the capture title, kebab-cased) and copy the body into `brainstorms/<slug>/workspace.md`.
   - `note` or `inbox` → leave as-is; the capture stays in the Inbox with `status: untriaged`.
   For each item the user routed, update the capture's frontmatter to `status: triaged, triaged_to: <ref>`:
   ```bash
   cadence write-capture-mark-triaged --path <capture-path> --triaged-to "<ref>"
   ```
   (TODO when the small CLI helper lands — for now, write a one-line script via Bash that uses `sed`/`yq` to flip the status, or rewrite via Edit. The cleanup-CLI surface is a small follow-on.)

6. **Summarize and exit.** One-line recap:
   ```
   Routed <M> items. <K> remain in the Inbox.
   ```
   Then the verb-hint block + teaching footer per the universal exit convention.

### `--dump` path

1. Open `$EDITOR` (via the CLI's `--dump` flag — `cadence write-capture --dump` handles this and reads back the saved content). If no `--prompt` given, write inline (silent path). If `--prompt` given, route through the distillation path with `source_kind: dump`.

## Guardrails

- **Inline silent contract holds.** `/capture "..."` produces zero response. No outcome menu, no nudge, no acknowledgment. The user is at-pace and the flow trumps everything.
- **Outcome menu only when a subagent processed the capture.** No mid-capture interruption for the silent path.
- **ELI5 confirm before any write outside `thoughts/`.** Materializing an outcome means writing to `pursuits/<id>/projects/...` or `brainstorms/<slug>/` — those are real state changes. The user confirms each one.
- **Default-to-action for high-confidence items, but never force.** "Suggested: add as action on `<pursuit>` [Y/n]" is the framing (capital Y = default Yes). The user can always say no by typing `n` or naming a different outcome. Low-confidence items default to "keep in Inbox" — the menu surface stays the same, but the default flips.
- **The audit trail always lands.** Even when the user routes everything immediately into outcomes, the underlying capture in `thoughts/unprocessed/` persists with `status: triaged, triaged_to: <ref>`. The captures are the record of what entered the Inbox; the outcomes are what left.
- **Don't generate content the source doesn't justify.** This applies to the subagent, but also to the parent surface: don't pad the menu with phantom items, don't volunteer extra outcomes beyond what the subagent suggested.

## Exit conventions

Inline silent: no exit. The verb-hint + teaching footer convention is suspended for `/capture`'s silent path (this is the documented exemption in `cadence-runtime.md`).

Distillation: one-line recap + verb-hint block + teaching footer (per `cadence tip-pick --triggers verb-capture`).
