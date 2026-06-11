---
id: wiki-query-front-door
pursuit: build-narrative-research-wiki
status: done
created: 2026-06-11
---

# /wiki query verb + the curated front door

## Intent

The discovery layer (design doc sections 3, 4, 9). A /wiki skill owns Query over the promoted corpus: bare /wiki shows the curated front door (wiki/index.md), /wiki ask answers questions index-first across narratives and primers with citations (at personal scale this outperforms vector RAG on retrieval reliability — no chunking, no missed segments, global reasoning over the whole set), /wiki <slug> opens an artifact, and /wiki related surfaces link-graph neighbors (semantic search is a later optional add-on, not a day-one dependency). The index files are the human front door too: wiki/index.md and wiki/_meta/index.md are curated, linked, one-line-summary documents written to be read by a person in Obsidian as much as parsed by the agent. Frontmatter is the queryable layer — capstones and primers carry unit, created, sources, pursuit, tags, status so Obsidian Bases/Dataview can build live tables. The compounding insight: a good /wiki ask answer can be filed back into the wiki as a new artifact, so explorations compound rather than evaporate. Also folds the existing narratives/drafts/ into wiki/drafts/ and extends /find to search the wiki corpus. Depends on promoted artifacts existing to query. Done feels like: months-later re-entry via /wiki ask or the Obsidian graph lands on the right capstone or primer in seconds.

## Actions

- [x] Build the /wiki skill: front-door render, ask (index-first drill with citations), open by slug, related via the link graph
- [x] Establish wiki/index.md and wiki/_meta/index.md formats plus the frontmatter schema for capstones and primers (unit, created, sources, pursuit, tags, status) — Bases/Dataview ready
- [x] Wire the compounding path: offer to file a good /wiki ask answer back into the wiki as a primer candidate
- [x] Fold narratives/drafts/ into wiki/drafts/ and extend /find to include the wiki corpus
- [x] Queue fresh-session validation: seed a small promoted corpus, ask questions, verify index-first retrieval with citations and the Obsidian vault view
