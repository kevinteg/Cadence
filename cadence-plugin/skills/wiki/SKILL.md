---
description: Query and curate the durable wiki corpus — front door (wiki/index.md), index-first Q&A with citations across narratives and primers (ask), open an artifact by slug, surface link-graph neighbors (related), health-scan via budgeted subagent (lint). TRIGGER on explicit /cadence:wiki invocation, OR when the user asks the wiki by name (e.g., "check the wiki for X", "open the wiki", "what's in my wiki about Y"). SKIP for general topic questions that don't name the wiki — suggest the verb instead of auto-firing.
---

# /wiki

`/cadence:wiki` is the Query surface over the **durable corpus** —
the promoted artifacts in `wiki/` (capstone narratives, primers, the
meta-project). It does not read research substrates (that's
`/research ask`) and it does not generate narratives (that's
`/narrate capstone`). Layout and artifact formats live in
`cadence-reference.md` → "Wiki — Durable Narrative Layer".

The retrieval discipline is **index-first navigation**: read
`wiki/index.md` (the catalog), drill into the relevant artifacts,
synthesize with citations. At personal-corpus scale this outperforms
vector RAG on reliability — no chunking, no missed segments, global
reasoning over the whole set. Semantic search is a later optional
add-on (Obsidian Smart Connections), not a dependency.

## Usage

- `/wiki` — render the curated front door (`wiki/index.md`)
- `/wiki ask "<question>"` — index-driven Q&A across narratives + primers, with citations
- `/wiki <slug>` — open a specific artifact
- `/wiki related <slug>` — surface link-graph neighbors of an artifact
- `/wiki lint` — health-scan the corpus; findings only, no auto-fix

## Steps — front door (no argument)

1. If `wiki/` doesn't exist or holds no artifacts: "The wiki is empty —
   artifacts arrive when work closes. `/narrate capstone <unit>`
   promotes the first one." Exit.
2. If `wiki/index.md` is missing or stale (artifacts exist that it
   doesn't list), rebuild it: scan `wiki/narratives/` and
   `wiki/primers/` frontmatter and write the front-door format (see
   reference). Curation beats completeness — one line per artifact,
   newest first within each section.
3. Render the index body (not its frontmatter). The same file is the
   human front door in any Markdown reader — never let the rendered and on-disk
   versions diverge.

## Steps — ask

1. Read `wiki/index.md` first. Pick the most relevant artifacts from
   the one-line summaries — at most 4. Read those files (never the
   whole corpus blind).
2. Synthesize the answer from what the artifacts actually say. Every
   load-bearing claim cites inline: `[<slug>](wiki/narratives/<slug>.md)`.
   If the corpus can't answer, say so plainly — name which pursuit or
   substrate would have to produce the missing artifact.
3. Append to `wiki/log.md`: `## [YYYY-MM-DD] ask | <question>` +
   `consulted: <slugs> — <answer gist>`.
4. **The compounding path.** When the synthesis is worth keeping —
   it connected artifacts in a way none of them states alone — offer
   once: "Worth filing back into the wiki as a primer candidate?"
   On yes: write `wiki/primers/<slug>.md` with primer frontmatter
   (`type: primer`, `status: draft`, `unit: synthesis`, `created`,
   `tags`), the answer as body with its citations kept, an index line
   under Primers marked `(draft)`, and a `file-back` log entry.
   Explorations compound rather than evaporating. Offer, never
   auto-file.
5. For a corpus past ~10 artifacts (or a question spanning many), run
   the read-and-synthesize step through the `research-ingest` subagent
   in ask mode pointed at the wiki (`unit_path=wiki`; artifacts in
   `narratives/` + `primers/`) so bulk reads stay out of the main
   thread.

## Steps — open (`/wiki <slug>`)

1. Resolve the slug against `wiki/**/*.md` filenames (fuzzy OK; the
   index's wikilinks are the namespace). Ambiguous → list candidates.
2. Render the artifact body. Mention the file path and, when the
   frontmatter carries a `unit:`, the unit it graduated from.

## Steps — related (`/wiki related <slug>`)

1. Resolve the slug. Build the neighbor set from the link graph:
   - outbound `[[wikilinks]]` in the artifact's body
   - inbound: other wiki artifacts whose bodies reference `[[<slug>]]`
   - frontmatter kinship: same `pursuit`, overlapping `tags`
2. Render as a short list with one-line why-related per neighbor
   (link direction or shared field). No semantic scoring — the graph
   and the frontmatter are the signal until a semantic layer is
   added deliberately.

## Steps — lint

1. Empty corpus → "Nothing to lint yet." Exit.
2. **Dispatch the `wiki-lint` subagent** (Agent tool,
   `subagent_type: wiki-lint`): `lint. corpus=wiki/. [Budget: 8 tool
   calls.]` It scans for dangling `narrative:` pointers, evaporated
   provenance (post-GC stub integrity), orphan artifacts, stale index
   entries, draft pile-up, and contradictions — and returns a JSON
   findings list. See `agents/wiki-lint.md` for the contract.
3. **Render findings grouped by severity** (error → warn → note),
   each with its suggested move. Zero findings → "Corpus healthy:
   <checked counts>." **Never auto-fix** — even a dangling pointer
   gets surfaced, not repaired; the user decides (consistent with how
   the reconciler surfaces flags rather than acting on them).
4. Append to `wiki/log.md`: `## [YYYY-MM-DD] lint | <N> findings`.

Lint is also reconciler-adjacent: the `capstone_gap` and
`retrospective_due` flags (see `workflows/reconciler.md` §9-10) cover
the always-on checks; `/wiki lint` is the deeper, on-demand pass. Run
it after a GC ritual clears a substrate, or when `/reflect` Get Clear
suggests the corpus has drifted.

## Guardrails

- **Index-first, always.** Never grep-and-summarize the whole corpus
  when the index can route the read. If the index is stale, fix the
  index — that's the shared front door.
- **Read-only except the compounding path and index/log maintenance.**
  `/wiki` never edits capstones or published primers; regeneration
  belongs to `/narrate capstone`.
- **Citations are mandatory in ask answers.** An uncited synthesis
  over a citation-built corpus would be self-defeating.
- **Draft primers stay marked.** `status: draft` and the `(draft)`
  index marker only clear when the user explicitly promotes
  (`status: published`) during a later curation pass.
- **The wiki tier is never GC'd.** Nothing in this skill deletes
  artifacts.

## Exit conventions

1. **Verb-hint block** — after the front door: `/wiki ask`,
   `/wiki <slug>`, or `/narrate capstone <unit>` for units closing in.
   After ask: `/wiki related <slug>` on a cited artifact, or
   `/research <source>` to fill a named gap. After open/related:
   the neighbor slugs as next reads.
2. **Teaching footer** — `cadence tip-pick --triggers verb-wiki`;
   render when non-null, skip silently otherwise.
