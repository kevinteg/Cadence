---
cadence: pursuit
pursuit_id: improve-ux-and-vision
generated_at: 2026-05-26T19:22:26Z
consumed_through_commit: 0f494727ec1d4cb238bd42dbea29a5b17ceea446
projects_consulted:
  - improve-ux-and-vision/add-closing-in-on-resolution-prompts
  - improve-ux-and-vision/add-long-running-agent-interjections
  - improve-ux-and-vision/add-pending-validations-mechanism
  - improve-ux-and-vision/add-physical-domain-awareness-to-prompts
  - improve-ux-and-vision/add-subagent-budgets
  - improve-ux-and-vision/add-tip-and-teaching-surfaces
  - improve-ux-and-vision/build-catch-up-reflect-path
  - improve-ux-and-vision/build-indexer
  - improve-ux-and-vision/cleanup-stale-session-references
  - improve-ux-and-vision/encode-conversational-patterns
  - improve-ux-and-vision/expand-provocation-deck
  - improve-ux-and-vision/extend-ingestion-surface-and-coaching
  - improve-ux-and-vision/extract-lessons-and-split-archived-folders
  - improve-ux-and-vision/harden-inbox-as-triage-zone
  - improve-ux-and-vision/rebuild-brainstorm-as-workspace-with-phase-machine
  - improve-ux-and-vision/reconcile-docs-with-implementation
  - improve-ux-and-vision/rename-wandering-to-inbox
  - improve-ux-and-vision/reshape-status-output-for-navigation
  - improve-ux-and-vision/retire-develop-and-promote-cleanly
  - improve-ux-and-vision/slim-verb-surface-and-teach-by-usage
  - improve-ux-and-vision/unify-work-entry-under-start
  - improve-ux-and-vision/write-quickstart-and-demo-guide
---

The `improve-ux-and-vision` pursuit shipped 21 projects across roughly four weeks, beginning from a v1 self-review that surfaced structural gaps in the input surface, verb count, doc credibility, onboarding ceiling, and domain targeting. The opening diagnosis was honest: the implementation was sound where it had shipped, but the vision had over-promised, the verb surface was a memorization problem, and the only user who could operate Cadence without friction was the person who built it. The pursuit chose to prune and sharpen rather than build new — and held that choice across every project.

The foundational batch cleared the ground. `reconcile-docs-with-implementation` stripped the documentation of claims that weren't real: Python references, three-tier isolation, autonomous coding execution, an SQLite hybrid that was never built. Research citations were extracted from the vision doc and moved to `docs/research-references.md`, leaving the vision readable as motivating prose rather than a literature review. In parallel, `rename-wandering-to-inbox` replaced the pursuit name "Wandering" with a word anyone recognizes, and `slim-verb-surface-and-teach-by-usage` collapsed the user-facing verb count by merging `close` and `cancel` into a single `resolve` verb and demoting `reconcile` from an invocable verb to system behavior. The catalog went from something requiring help-doc consulting to something scannable in under a minute. The natural-language-to-verb teaching pattern was encoded at the same time — when the system maps natural speech to a verb, it names the verb aloud, making the surface self-teaching through use rather than requiring upfront documentation.

The structural middle demolished the Idea entity entirely. `retire-develop-and-promote-cleanly` deleted every `pursuits/<id>/ideas/*.md` file across all pursuits, removed `IdeaSchema` and `IdeaStateSchema` from the data model, and took `/develop` and `/promote` out of the verb surface — all as deliberate clearance for `rebuild-brainstorm-as-workspace-with-phase-machine`. Brainstorm became a workspace verb with a phase machine: `diverging` → `converging` → `crystallized | archived`, each driven by user dialogue, with a `--crystallize` flag that materializes a pursuit or project directly from the selected solution. The Idea lifecycle — three verbs, three states, an origin-link trace — collapsed into one verb with a structured workspace that the user navigates in a single session. `reshape-status-output-for-navigation` followed, moving counts and flags to a footer and leading the dashboard with pursuits and active projects instead, so opening `/status` answers "what should I do next?" in under five seconds.

The late-arc projects reshaped the ingestion surface and the Inbox concept root-to-tip. `extend-ingestion-surface-and-coaching` redefined the Inbox as a view — the union of `thoughts/unprocessed/` with `status: untriaged` plus brainstorms in `phase: diverging` — rather than a directory or a pursuit. Five capture paths (inline text, stdin, file/URL, named MCP query, long-form dump) replaced a single text-to-file write, and every non-inline ingest dispatched a capture subagent that returned a menu of suggested outcomes rather than a single nudge. `harden-inbox-as-triage-zone` encoded the behavioral constraint to match: Inbox is a short-term holding zone, not an organizational layer, and the coaching language across every surface teaches transience without lecturing. `unify-work-entry-under-start` completed the consolidation: `/start` became the one entry point for beginning work, with argument shape determining mode — no arg for a curated menu, a pursuit name for that pursuit's workspace view, a brainstorm slug to resume a workspace, and the reserved keyword `inbox` to walk the Inbox item by item with the same outcome menu the capture exit uses. Reflect was rebalanced at the same time, shrinking Get Clear from a capture-by-capture triage walk to a two-line awareness block.

Two projects shaped the lifecycle at both ends. `add-closing-in-on-resolution-prompts` added a structured prompt that fires when a pursuit approaches resolution, asking what would need to be true for it to close and surfacing a curated list of finalizing work — audit, narrative, demo, validation review. This converted finalization from something discovered late into a planned phase, built into `/complete` upward completion. At the other end, `extract-lessons-and-split-archived-folders` added the `dropped` lifecycle state for pursuits, a `pursuits/_dropped/` directory, and a lessons-extraction narration scope that synthesizes patterns across archived and dropped pursuits distinctly — archived pursuits teaching lessons of execution, dropped pursuits teaching lessons of judgment. The directory tree now visibly distinguishes "pursuits I shipped" from "pursuits I learned from without shipping."

What shifted across the pursuit's arc is the location of the system's cognitive work. In v1, the user carried the model — they had to know which verb addressed which work mode, when to invoke the reconciler, what Wandering was, how to navigate from a status screen to anything actionable, and where untriaged material lived. In v1.1, that navigation is in the system: `/start` routes by argument, the dashboard leads with what to do next, the Inbox is a view the system maintains, capture produces a menu of outcomes, and the teaching pattern names verbs in the flow rather than requiring the user to memorize a catalog. The verb surface narrowed from something that required help-doc consulting to something a new user can walk through in ten minutes — which is what the quickstart, written last, captured as a concrete walkthrough of the full loop from install to narrate.

What's next is the `make-cadence-public` pursuit now staged in `pursuits/make-cadence-public/` — the surface is sharpened, the documentation matches the implementation, and the quickstart exists. The foundation this pursuit built is the one that makes a public release legible to someone who encounters Cadence without context.
