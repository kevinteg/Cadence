---
type: capstone
cadence: capstone
unit: build-narrative-research-wiki
pursuit: build-narrative-research-wiki
title: Build the Narrative & Research Wiki
created: 2026-06-11
generated_at: 2026-06-11T17:30:00-07:00
status: published
sources: 0
tags: [wiki, research-substrate, capstone, llm-wiki, knowledge-architecture]
consumed_from_commit: 8803862
consumed_through_commit: 8803862
projects_consulted:
  - build-narrative-research-wiki/research-substrate-and-ingest
  - build-narrative-research-wiki/narrate-capstone-cadence
  - build-narrative-research-wiki/closure-capstone-gc-ritual
  - build-narrative-research-wiki/wiki-query-front-door
  - build-narrative-research-wiki/narrative-inbox-gists
  - build-narrative-research-wiki/wiki-lint-reconciler-integration
  - build-narrative-research-wiki/refactor-docs-into-wiki
---

# Build the Narrative & Research Wiki

Cadence generates narrative from git activity, but until this pursuit landed there was no durable artifact when work resolved. Finished projects left no trace beyond their project file; research notes evaporated when working directories were cleared. This pursuit implemented a two-tier knowledge architecture scoped to Cadence's existing hierarchy — a working research substrate under each unit of work, and a root-level wiki that outlives the research that produced it — turning the close-out ritual into the moment knowledge is most worth capturing.

**What happened**

The build followed the sequence laid out in `docs/narrative-wiki-architecture.md`, which the pursuit's description cites as its design blueprint. Seven projects landed, six in a single commit (`8803862`) on June 11, 2026, and one completed the same day as a concluding act of dogfooding.

The foundation was the research substrate (`research-substrate-and-ingest`): a conventional directory layout — `raw/` for immutable captured sources, `notes/` for LLM-distilled atomic notes, `index.md` as the catalog, `log.md` as the append-only record — scoped either to a pursuit or to an individual project. A dedicated `research-ingest` subagent mirrors the existing `capture-ingest` pattern exactly: restricted tools, explicit budget, distilling source material into an atomic note with provenance frontmatter while keeping the raw payload out of the main conversation thread. The `/research` skill owns ingest, ask, and primer operations over any substrate.

The capstone cadence (`narrate-capstone-cadence`) extended `/narrate` with a new output class. Where daily and weekly narratives are ephemeral views over activity, a capstone is a dual-source, style-aware artifact that promotes into `wiki/narratives/` rather than staying in drafts. Dual source means the narrator reads both the git activity stream and the research substrate's distilled notes before composing. Style-aware means it reads `wiki/_style/` first — `voice.md`, `capstone.md`, `diagrams.md` — with any user edits to those files overriding the defaults. The pointer seam makes the round-trip explicit: the capstone carries citation stubs back to its source notes, and the source unit file gains a `narrative:` frontmatter reference line.

The GC ritual (`closure-capstone-gc-ritual`) wired knowledge preservation into the existing close-out machinery at two points. The `closing_in_on_resolution` finalization menu, already surfaced during `/resolve`, gained capstone as an explicit option alongside audit and demo. The closure ritual itself gained a research-disposition step: when raw material exists, the user is prompted to choose between deleting it (git history retains it; back-references become citation stubs), archiving it to `wiki/_archive/`, or keeping it. The proposed default is delete. What always survives: the capstone, any graduated primer, and the provenance stubs — title, source URL, and capture date — so the knowledge chain persists even after the working files are gone.

The discovery layer (`wiki-query-front-door`) gave the promoted corpus a front door. Bare `/wiki` renders `wiki/index.md`, the curated entry point designed to be read by a person in their Markdown reader as naturally as parsed by the agent. `/wiki ask` answers questions index-first across narratives and primers with citations; at personal corpus scale, index-first retrieval outperforms vector search on reliability — no chunking artifacts, no missed segments, global reasoning over the full set. A good `/wiki ask` answer can be filed back as a new primer candidate, so exploration compounds rather than evaporating. The existing `narratives/drafts/` folded into `wiki/drafts/` as part of this project.

Two supporting projects completed the surface. Inbox gists (`narrative-inbox-gists`) added a one-sentence `triage_gist` to the capture-ingest subagent's output, rendered beside the item name on every Inbox surface — `/status`, the SessionStart hook, `/start inbox`, and Get Clear. The hot path (inline `/capture`) stays silent; gists are generated only when the subagent is already running. The maintenance layer (`wiki-lint-reconciler-integration`) added `/wiki lint` — a budgeted subagent that scans the corpus for contradictions, broken back-references, dangling narrative pointers, and coverage gaps, surfacing findings without auto-fixing. The reconciler gained two new flags: `capstone_gap` (a resolved unit with a research substrate but no narrative) and `retrospective_due` (pursuits accumulating past the threshold since the last lessons run).

The seventh project (`refactor-docs-into-wiki`) dogfooded the pattern on the repo itself. Vision and architecture rationale moved from `docs/` to `wiki/concepts/`. The motivating research, including Andrej Karpathy's LLM-wiki gist as the named blueprint, moved to `wiki/research/llm-wiki-pattern.md`, which maps each Cadence surface onto its corresponding LLM-wiki concept: `raw/` as the immutable source layer, `/wiki ask` as the index-first query, `/wiki lint` as the health check, `CLAUDE.md` and `cadence-reference.md` as the schema. A `how-we-work.md` concept page narrates the operating loop — brainstorm, research, learning, getting things done — so the wiki can serve as re-entry for a cold reader. `docs/` shrank to product and contributor material. The `wiki/drafts/` tier was cleared: the v1 self-review graduated to `_meta/`, and an overdue lessons run over four archived pursuits consumed the remaining closure narratives.

**How it works**

```mermaid
flowchart TD
    A[raw/ sources] -->|research-ingest subagent distills| B[notes/ atomic notes]
    B --> C[index.md catalog]
    B --> D[log.md event log]
    C --> E[/research ask\nindex-first query]
    C --> F[/research primer\norientation artifact]
    F -->|closure-time graduation| G[wiki/narratives/\ncapstone]
    B -->|citation stubs preserved| G
    G --> H[wiki/index.md\nfront door]
    H --> I[/wiki ask\ncross-corpus query]
    H --> J[/wiki lint\nhealth scan]
    J -->|capstone_gap flag| K[reconciler + Get Clear]
    G -->|narrative: pointer| L[unit project file]
```

The two tiers stay cleanly separated by what outlives the work. The research layer is co-located with the unit and GC-eligible; it exists to support active work and the capstone moment. The wiki layer is cross-cutting and permanent — a primer on a concept written during one project is still accessible after that project's research directory is cleared. The seam between them is graduation: a closure-time event, not a live embedding, that promotes a polished artifact upward and leaves provenance stubs pointing back.

**What it meant**

The design principle the pursuit's description names directly — "reference, not containment" — resolves a tension that had been latent in Cadence since the beginning. Projects are containers for work; they should not also be containers for finished knowledge. By separating the wiki into its own root-level structure and treating the project-to-wiki relationship as a pointer rather than a hierarchy, finished artifacts can outlive the pursuits that produced them and stay discoverable across the whole corpus. The phrase "the artifact IS the state" appears in the original architecture doc to describe how project files carry durable truth; this pursuit extended that one layer up: the narrative artifact is the durable state of what a pursuit meant.

The dogfooding project added something beyond completion. When the repo's own docs were refactored into `wiki/concepts/` and `wiki/research/`, the corpus became the first real test of the system it described. The Karpathy LLM-wiki pattern, which motivated the entire design, is now explicitly documented as the blueprint inside the wiki that realizes it.

**What shifted**

The most concrete shift is that closure is no longer a neutral event. Before this pursuit, resolving a project cleared the working state cleanly. Now the close-out ritual has two decision points — the finalization menu and the disposition step — both of which prompt the user to do something with accumulated knowledge before the substrate disappears. The pressure is soft (suggestion, not block) but it changes the default trajectory: you now have to actively decline to capture.

The Obsidian relationship also shifted. Earlier product docs framed Obsidian as a structural dependency. The refactor decoupled it: Obsidian is one suggested reader of a plaintext, version-controlled Markdown corpus that any editor can open. The vault configuration went into `.gitignore`. The corpus itself owns no Obsidian-specific conventions.

**What's next**

Several validation items are queued as pending validations: ingesting a real source end-to-end, generating a capstone for a real researched unit, seeding a broken back-reference and verifying lint surfaces it, running a `--from` ingest and checking that the gist renders across all Inbox surfaces. These are fresh-session checks that the system works as designed under real conditions, not further build work.

The open question the design doc flagged as needing user resolution — whether delete-by-default is too aggressive for the GC ritual — was encoded during the `closure-capstone-gc-ritual` project. The decision is in the skill now. The other open thread is practical: the corpus is currently thin. The value of `/wiki ask` and `/wiki lint` compounds as capstones accumulate; the validation runs will begin filling it.

## Sources

None — no research substrate was maintained for this pursuit.
