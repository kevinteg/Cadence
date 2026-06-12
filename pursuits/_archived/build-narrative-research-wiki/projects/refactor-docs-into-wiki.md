---
id: refactor-docs-into-wiki
pursuit: build-narrative-research-wiki
status: done
created: 2026-06-11
---

# Refactor Docs into Wiki

## Intent

The repo's knowledge corpus is split: docs/ holds vision, architecture rationale, and the research syntheses that motivated the design, while wiki/ — the durable layer this pursuit built — holds only leftover drafts. Meanwhile the hierarchical-summary research landed the clearest articulation yet of what we're building toward: Karpathy's LLM-wiki pattern (immutable raw sources, an LLM-maintained interlinked Markdown corpus navigated index-first via index.md, a schema file that disciplines the maintainer). Cadence already implements the bones — research substrates as raw/, /wiki ask as index-first query, /wiki lint as the health check, CLAUDE.md and cadence-reference as the schema — but its own corpus doesn't live that way yet. This project dogfoods the pattern: vision and architecture become concept pages under wiki/concepts/, the motivating research becomes synthesis pages under wiki/research/ (with llm-wiki-pattern.md explicitly linking Karpathy's gist and mapping how each Cadence surface realizes it, and a how-we-work.md concept page narrating how brainstorming, research, learning, and getting-things-done are structured), and wiki/index.md becomes the real front door cataloging it all. docs/ shrinks to product/contributor material (getting-started, unshipped design notes). Obsidian gets decoupled — it is one suggested reader of the corpus, mentioned in the LLM-wiki story, never a structural dependency; .obsidian/ is gitignored local config. The drafts tier clears as content graduates (v1-self-review to _meta/, closure narratives consumed by a lessons run, stale dailies pruned). Done feels like: opening wiki/index.md cold and being able to navigate to why Cadence exists, how it's designed, the research it stands on, and how to work inside it — with docs/ no longer claiming any of that territory, and CLAUDE.md's reference lanes pointing at the new homes.

## Actions

- [x] Scaffold the wiki tiers: wiki/concepts/, wiki/research/, wiki/index.md front door, wiki/log.md; add .obsidian/ to .gitignore and untrack the moved vault config
- [x] Move docs/vision.md to wiki/concepts/vision.md and docs/architecture.md to wiki/concepts/architecture.md, adapting cross-links
- [x] Write wiki/concepts/how-we-work.md — the operating loop: brainstorm (diverge/converge/crystallize), research (substrate ingest/ask/primer), learning (primer/capstone graduation), getting things done (pursuit/project/action, reflect, narrate)
- [x] Distill docs/hierarchical_summary_research.md into wiki/research/llm-wiki-pattern.md — link Karpathy's gist, map raw/=substrate, wiki=this corpus, schema=CLAUDE.md/reference, ingest=/research, query=/wiki ask, lint=/wiki lint
  - Full survey preserved as wiki/research/ai-research-writing-pipeline-survey.md; gist URL located and cited
- [x] Move docs/research-references.md to wiki/research/research-foundations.md and docs/teaching-tips-research.md to wiki/research/teaching-tips.md, updating inbound pointers
- [x] Re-point CLAUDE.md doc lanes and any skill/reference mentions at the new wiki homes; soften Obsidian references in product docs to 'any Markdown reader (e.g., Obsidian)'
- [x] Clear wiki/drafts/: graduate v1-self-review.md to wiki/_meta/, run the overdue /narrate lessons over the closure narratives, prune the consumed April daily/weekly
  - Lessons run consulted all 4 archived pursuits; flagged missing closure narrative for cadence-performance-and-indexing
