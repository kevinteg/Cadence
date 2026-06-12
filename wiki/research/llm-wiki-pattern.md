---
type: research
title: The LLM-Wiki Pattern and How Cadence Realizes It
created: 2026-06-11
source: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
tags: [llm-wiki, knowledge-base, retrieval, karpathy]
---

# The LLM-Wiki Pattern

Andrej Karpathy's "LLM wiki" ([gist, April 2, 2026](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)) is the clearest articulation of the knowledge layer Cadence builds toward. Distilled here from the fuller survey in [[ai-research-writing-pipeline-survey]]; how the layer fits the rest of the operating loop is in [[how-we-work]].

## The pattern

Three layers:

1. **Raw sources** — immutable. "The LLM reads from them but never modifies them. This is your source of truth."
2. **The wiki** — "a directory of LLM-generated markdown files. Summaries, entity pages, concept pages, comparisons, an overview, a synthesis. The LLM owns this layer entirely."
3. **The schema** — a config document (CLAUDE.md or equivalent) that "makes the LLM a disciplined wiki maintainer rather than a generic chatbot."

Three operations:

- **Ingest** — drop a source into raw/, the LLM distills it, updates the index, touches related pages, appends to the log.
- **Query** — the LLM reads the index *first*, drills into relevant pages, synthesizes with citations. Good answers file back as new pages, so explorations compound.
- **Lint** — periodic health check: contradictions, stale claims, orphan pages, missing cross-references.

Two navigation files do the heavy lifting: `index.md` (catalog, one line per page) and `log.md` (append-only, greppable `## [date] op | subject` entries).

## Why it beats RAG at personal scale

Below roughly 50k–100k tokens (~150–200 dense pages), a structured Markdown corpus navigated index-first gives 100% retrieval reliability — no chunking, no missed segments, global reasoning over the whole set — at near-zero infrastructure cost. In RAG, "the LLM is rediscovering knowledge from scratch on every question. There's no accumulation." The wiki is a persistent, compounding artifact. And the historical blocker is gone: "Humans abandon wikis because the maintenance burden grows faster than the value. LLMs don't get bored." Semantic search is a later add-on, justified only by concrete retrieval failures.

## How Cadence realizes it

| Karpathy's pattern | Cadence surface |
|---|---|
| Immutable `raw/` | Research substrate `<unit>/research/raw/` — never edited, GC-eligible at closure |
| LLM-maintained wiki pages | This corpus: `wiki/` — concepts, research syntheses, capstone narratives, primers |
| The schema (CLAUDE.md) | `CLAUDE.md` + `cadence-plugin/cadence-reference.md` ("Wiki — Durable Narrative Layer") + the skill contracts |
| Ingest | `/research` — budgeted subagent distills the source into an atomic note; bulk payload never enters the main thread |
| Query | `/wiki ask` — index-first with citations; `/research ask` for the working tier |
| Lint | `/wiki lint` — budgeted health scan; findings surfaced, never auto-fixed |
| `index.md` | `wiki/index.md` (front door) + per-substrate `research/index.md` |
| `log.md` | `wiki/log.md` + per-substrate `research/log.md` |
| Answers file back as pages | `/wiki ask` compounding path — good answers become draft primers |

## Where Cadence diverges deliberately

- **Two tiers, one seam.** Karpathy's wiki is one corpus. Cadence splits a *working tier* (unit-scoped research substrates, GC-eligible) from this *durable tier* (never GC'd). Graduation — capstone promotion, primer graduation — is the seam, and GC at `/resolve` is the forcing function for crystallizing knowledge while it's freshest. Citation stubs preserve provenance after raw/ clears.
- **Knowledge is scoped to commitments.** Substrates live under pursuits and projects, so research carries the context of *why it was studied*. The durable wiki holds what outlived the work.
- **Human in the crystallization loop.** Auto-ingesting wikis are an indirect-prompt-injection surface; Cadence keeps promotion and graduation as prompted rituals, never silent.

## Reading the corpus

The wiki is a plain Markdown folder under git — readable in any Markdown editor or graph viewer. Karpathy's framing: "Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase." Obsidian works well as that IDE (the frontmatter here is Bases/Dataview-friendly), but nothing in Cadence depends on it.
