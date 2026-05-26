---
id: extend-ingestion-surface-and-coaching
pursuit: improve-ux-and-vision
status: on_hold
created: 2026-05-22
---

# Extend the ingestion surface (capture flags + ingest subagent) and the ambient coaching that surfaces it

## Intent

Three concerns that share a mental model and one piece of UX: the ingestion surface (/cadence:capture), the conceptual Inbox that holds untriaged material, and the ambient coaching that surfaces both. They land together because the same vocabulary — "your Inbox has N items" — has to mean the same thing across the runtime entry, the capture exit menu, the SessionStart hook, and /cadence:status. Coaching consistency is a first-class deliverable, not a finishing pass.

THE INBOX IS A CONCEPT, NOT A DIRECTORY. After P1 retired Ideas, `pursuits/inbox/` became vestigial — no mechanism puts anything there anymore. This project replaces it with a *view*: the Inbox is the union of `thoughts/unprocessed/*.md` where `status: untriaged` plus brainstorms in `phase: diverging`. There is no physical inbox directory; the term refers to the set of untriaged material across both surfaces. The reconciler surfaces a single `inbox_pressure` flag with the count; status renders one line ("Inbox: N items — `/cadence:reflect` to triage" or "Inbox: empty ✓"). A growing Inbox is a triage debt signal, not an organizational layer.

CAPTURE IS AN AUDIT TRAIL WITH AN IMMEDIATE OUTCOME MENU. Today /cadence:capture is a one-shot text-to-file write. Expand to five ingest paths: inline text, stdin (--), local file or URL (--from <path|url>), named MCP query (--source <name> resolving against ingest_sources: in cadence.yaml or ~/.cadence/sources.yaml; precedence repo > user), and long-form brain dump (--dump opens $EDITOR). Every non-inline ingest dispatches a capture-ingest Claude Code subagent for context isolation — raw payload lands at thoughts/_raw/<id>.raw.md, the agent distills per --prompt into thoughts/<id>.md (the audit trail — always written), and returns a list of suggested outcomes rather than just a single nudge. Outcome shapes the subagent emits per item: two_minute_action (immediately doable), action (add to a named pursuit), project (proposes a new project with Intent + actions), brainstorm_seed (opens a new diverging brainstorm), or note (keep in Inbox). The capture SKILL surfaces a menu: "keep in Inbox" is the default, but the user can immediately route any item out into a real outcome via an ELI5-confirmed action. Inline /capture "..." keeps its silent contract — no menu, no nudge — because at-pace flow safety still trumps everything.

So the principle: **thoughts/ is the audit trail; the outcome menu lets material exit the Inbox immediately when the user has clarity.** Items the user leaves in Inbox surface during /cadence:reflect Get Clear (existing triage path).

FRONTMATTER v2: thoughts/<id>.md carries source, raw_path, distilled_path, status (untriaged | triaged | discarded), triaged_to (the outcome the item materialized into), suggested_outcomes (the subagent's recommendations, preserved for later triage), two_minute_eligible, prompt, schema_version: 2. Scanner tolerates v1 + v2.

Caveat for ingest_sources: it declares named queries against MCP servers Claude Code already knows about (registered via claude mcp add). Cadence has no server registry post-pivot, so server: glean in an entry references a server registered with Claude Code, not a Cadence-declared one.

COACHING HALF. The SessionStart hook gains: active-brainstorms line (consumes P2), Inbox-line (the new conceptual surface — "Inbox: 4 items" or "Inbox: empty ✓"), empty-repo coaching block (zero pursuits + zero Inbox items + empty validations → menu of first moves), idle-time prompt (last activity >7 days → suggest /cadence:reflect), suppression rules (.cadence/last_session_block.json with timestamp + state-hash → suppress if <60min and unchanged), explicit dismiss (cadence dismiss-splash --hours 24 → respected for the named window). The Stop hook adds session-log entries to narratives/session-log.md when the session had material state writes. Verb-level coaching: /cadence:capture with no input + no flags opens $EDITOR with a hint header; /cadence:status on an empty repo renders the same coaching block as SessionStart.

COACHING/MESSAGING CONTRACT — the load-bearing copy. The word "Inbox" carries the same meaning across all surfaces. Concretely:

- Runtime vocabulary: "Inbox" is redefined as the view, not a pursuit
- SessionStart hook: "Inbox: 4 items" or "Inbox: empty ✓"
- /cadence:status dashboard: same Inbox line
- /cadence:reflect Get Clear: walks the Inbox view, not separate captures + brainstorms lists
- capture SKILL exit menu: "Pulled 3 items into your Inbox. Want to land any of them as outcomes now? (default: keep in Inbox)"
- reconciler: emits `inbox_pressure` when the Inbox count exceeds a soft threshold
- empty-repo coaching: "Cadence is initialized — your Inbox is empty. What do you want to start? [menu]"

These strings are written once and reused. A user opening Cadence for the first time should read "Inbox" and understand it from context, without needing to read docs.

Done feels like: `cadence:capture --from ~/onboarding.pdf --prompt "first 30 days action items"` runs a subagent → raw + distilled written to thoughts/ (joining the Inbox) → the parent surfaces a small menu listing the subagent's suggested outcomes per item → user picks "add as action on nexthop-onboarding" → action lands on the pursuit, the thought is marked `status: triaged, triaged_to: ...`, the Inbox count drops. Inline `cadence:capture "remembered to book campsite"` is unchanged, silent, lands in Inbox. `cadence:status` shows "Inbox: 4 items" — one number for all untriaged material. Empty repos get a coaching menu instead of zeros. Sessions within 60 minutes of an unchanged-state previous session produce no splash.

## Actions

- [ ] Extend cadence write-capture CLI with --from <path|url>, --source <name>, --prompt <text>, --dump, --schema-version 2 flags.
- [ ] Extend cadence write-capture CLI with structured-source frontmatter flags: --raw-path, --source-kind, --source-name, --source-server, --source-query, --status, --two-minute-eligible, --triaged-to, --suggested-outcomes (JSON).
- [ ] Document v2 thoughts/<id>.md frontmatter schema in cadence-plugin/cadence-reference.md File Formats section; scanner tolerates v1 + v2; document suggested_outcomes shape (per-item outcome hint: two_minute_action | action | project | brainstorm_seed | note).
- [ ] Add ingest_sources: schema and precedence rules (cadence.yaml > ~/.cadence/sources.yaml) to cadence-plugin/cadence-reference.md (new Capture Ingestion section).
- [ ] Define the Inbox view in src/scan/ (or src/render/): a function inboxItems(snapshot) → unioning thoughts where status=untriaged + brainstorms where phase=diverging into a single list with shape {kind, id, source, age_days}. Single source of truth — all surfaces consume this.
- [ ] Add `inbox_pressure` reconciler flag in src/report/reconciler.ts firing when the Inbox view size exceeds inbox_soft_threshold (default 10 in cadence.yaml). Wire into src/render/{status,snapshot}.ts flag-case branches.
- [ ] Retire pursuits/inbox/ directory and strip pursuit-flavored Inbox references from the runtime vocabulary and reference docs. Inbox stays as a concept; the pursuit goes away. Move-pursuit script for fresh-install repos isn't needed (lazy: delete on next init or on first time we read pursuits/).
- [ ] Create cadence-plugin/agents/capture-ingest.md: restricted tools (relevant MCP server + Write), bump-in-the-wire prompt. Returns a list of suggested outcomes per distilled item, each tagged with shape (two_minute_action | action | project | brainstorm_seed | note) plus suggested_pursuit / suggested_project where the subagent can infer one. Action-shape detector heuristic (regex over keywords: email, schedule, send, ping, call, file, book, RSVP, reply, text) determines two_minute_action eligibility. Default budget 5 tool calls.
- [ ] Rewrite cadence-plugin/skills/capture/SKILL.md end-to-end: dispatch capture-ingest for --from / --source paths, gate inline path silent, present the outcome menu after subagent return (default "keep in Inbox", options to land items as action / project / brainstorm-seed / two-minute-action with ELI5 confirm before any write outside thoughts/), add no-input plus no-flags branch that opens $EDITOR with a hint header.
- [ ] Reconcile cadence-plugin/skills/mcp-pull/SKILL.md with --source: position mcp-pull as the bulk-many path, --source as single-query shorthand; both write captures via the same CLI flags.
- [ ] Add thoughts/_raw/ lazy directory creation in the write layer (no proactive init).
- [ ] Write the coaching/messaging contract document at cadence-plugin/workflows/coaching-strings.md naming the canonical Inbox copy across surfaces: runtime vocabulary entry, SessionStart hook line, status dashboard line, capture SKILL exit menu, /reflect Get Clear lead, empty-repo block, reconciler `inbox_pressure` flag suggestion. The doc holds the exact strings; the skills/runtime quote them rather than re-inventing.
- [ ] Update cadence-plugin/cadence-runtime.md vocabulary entry for Inbox to reflect the view-not-directory model. Single source of truth for the term, referenced by status/capture/reflect SKILLs.
- [ ] Extend the SessionStart hook output to include an active-brainstorms line (consumes P2 brainstorm scan) and a unified "Inbox: N items" line consuming the Inbox view.
- [ ] Implement empty-repo detection in the SessionStart hook: zero pursuits + Inbox empty + empty validations → emit coaching block (from coaching-strings.md) in place of dashboard.
- [ ] Implement .cadence/last_session_block.json writer + reader: state-hash + timestamp; SessionStart suppresses splash if <60min AND hash unchanged.
- [ ] Add cadence dismiss-splash [--hours N] CLI subcommand: writes .cadence/dismissed_until <ISO>; SessionStart respects it.
- [ ] Add idle-time prompt to SessionStart: if last_activity_at across all projects >7d, append the canonical idle-prompt string from coaching-strings.md pointing at /cadence:reflect.
- [ ] Add Stop hook at cadence-plugin/hooks/stop.sh (or equivalent): if the session wrote state (track via a sentinel touched by any state-modifying CLI subcommand), append a one-line entry to narratives/session-log.md.
- [ ] Extend cadence-plugin/skills/status/SKILL.md to render the Inbox line on every dashboard view, plus the empty-state branch (coaching block from coaching-strings.md) when state is empty.
- [ ] Document suppression behavior + dismiss-splash CLI + capture surface + ingest_sources + Stop hook + Inbox view + coaching-strings.md in cadence-plugin/cadence-reference.md.

(Note: the /reflect Get Clear rewrite that previously sat here moved to a dedicated project — unify-work-entry-under-start — because it ties together with the larger reflect rebalance, not just Inbox consumption.)
