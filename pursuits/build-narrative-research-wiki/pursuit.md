---
id: build-narrative-research-wiki
type: finite
status: active
created: 2026-06-11
why: 'Narrative today is generated views over git activity; finished work leaves no durable artifact, and research evaporates when working files are cleared. Adopt the LLM-wiki pattern scoped to the Cadence hierarchy: research substrates under units of work, capstone narratives that graduate to a root-level wiki/ at closure, GC as the capstoning ritual, Obsidian as a first-class viewer. This answers the vision problem directly — finishing weeks feeling like you worked hard but cannot articulate what moved forward. Design: docs/narrative-wiki-architecture.md.'
---

# Build the Narrative & Research Wiki

Implementation of docs/narrative-wiki-architecture.md — two layers, one seam: a GC-eligible research layer under each pursuit/project (raw sources, distilled notes, index, log) and a durable root-level wiki/ of capstone narratives and primers, with graduation at closure leaving a pointer behind. Six projects follow the build sequence in section 13: substrate (1), capstone cadence (2), and GC ritual (3) are the minimum coherent feature; wiki query (4), inbox gists (5), and lint + reconciler (6) are the discovery and maintenance enrichments. Style-file defaults ship with project 2.
