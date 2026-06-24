---
id: anchored-narratives
pursuit: improve-ux-and-authoring
status: done
created: 2026-06-11
origin:
  kind: github_issue
  repo: kevinteg/Cadence
  number: 5
  url: https://github.com/kevinteg/Cadence/issues/5
---

# Anchored narratives: first-class living documents linked to pursuits/projects

Triaged from issue #5: https://github.com/kevinteg/Cadence/issues/5

## Intent

Filed as issue #5 before the narrative/research wiki landed (same day). Reconciled against the shipped wiki layer (2026-06-11): roughly half the original ask is already covered — multi-file research workspaces are the research substrate, reference notes are substrate notes/primers, "source links up front" became citation stubs + sources frontmatter, and the durable home is wiki/. This project ships the remaining gap, **inside the wiki architecture rather than as a parallel system**.

The gap: hand-authored *living* documents — relationship/session logs (1-1s/coach-sam.md), rolling phase docs spanning projects — accumulate during work, fit neither the substrate (deliberately studied sources) nor the wiki's finished tier (curated, closure-time artifacts). Consequences still true post-wiki: (1) cadence find searches only snapshot entities (src/find.ts) and /wiki ask covers only the wiki corpus — "where did I write about X?" answers living in these docs are unreachable. (2) Nothing structurally connects a project to its living docs; /start, status, resolve, narrate are anchor-unaware. (3) Users mint proxy projects to give docs dashboard presence (observed: 12 stub projects auto-promoting at once → WIP 18/5).

Scope — extend four existing wiki seams to living docs:

1. **Schema + home**: living docs join the wiki corpus as a living tier at canonical `wiki/living/` (decided 2026-06-11), reusing the wiki artifact frontmatter shape — type: living-doc, kind (log | phase-doc | live-notes), status (living | frozen), anchors ([pursuit:..., project:..., person:...]), sources. One schema, two producers (generated artifacts and hand-authored docs); anchors generalize the existing narrative: pointer seam.
2. **Ask coverage (hard requirement)**: /wiki ask answers from living docs — they enter wiki/index.md and the index-first ask path with citations. cadence find indexes them too (or routes to the same surface). "Where did I write about X?" must hit the logs.
3. **narrate --into <doc>**: append a generated, dated section to a living doc, advancing a per-doc consumed_through_commit watermark — a generalization of the capstone watermark machinery, not new invention.
4. **Lifecycle**: /resolve's existing disposition ritual extends to anchored living docs — freeze / re-anchor / hand off — instead of walking only research/ substrates. person: anchors later feed the People feature sketched in vision.md.

Non-goals / doctrine fit: no backlink graph, no knowledge-base ambitions — preserves the "not Notion/Obsidian" anti-goal. Anchors are plain frontmatter parsed at read time. "The artifact IS the state": Markdown stays the source of truth. Migration is git mv into wiki/living/ + a frontmatter block (history preserved) — the canonical-home decision supersedes the issue's original zero-moves sketch in exchange for one tree that lint/ask/index read whole. Living docs never get GC'd (they're not raw/). Complementary to #4 (cadence read).

Felt-sense of done: a hand-authored living log anchored to a pursuit/project/person is findable via /wiki ask and cadence find, listed on the project/pursuit views, can accumulate generated sections via narrate --into, and gets a disposition prompt at resolve time instead of being silently orphaned — all riding the wiki layer's existing schema, index, watermark, and ritual machinery.

## Actions

- [x] Read the issue thread and decide first concrete move.
- [x] Design the living-doc tier: home (wiki/ subdirectory vs indexed-in-place), frontmatter schema (kind/status/anchors/sources) as an extension of the wiki artifact shape; write it into cadence-reference.md.
- [x] Wire living docs into the ask surface: wiki/index.md entries + /wiki ask coverage with citations; index them in cadence find.
- [x] Surface anchored docs on entity views: /start <project>, cadence status <project>, and the pursuit workspace list their doc shelf.
- [x] Ship narrate --into <doc>: append a dated generated section, advance a per-doc consumed_through_commit watermark.
- [x] Extend /resolve disposition to anchored living docs: freeze / re-anchor / hand off prompt alongside the research GC ritual.
- [ ] Validate ask-coverage end to end (living log + verbatim-phrase query via /wiki ask and cadence find), then reply on #5 with what shipped vs what the substrate/wiki already covered.
