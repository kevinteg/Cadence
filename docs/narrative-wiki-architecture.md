# Cadence Narrative & Research Wiki — Design / Architecture

*A self-documenting narrative companion to the planning and brainstorming workflow.*

**Status:** shipped (2026-06). The two-layer research→wiki architecture, the `/research`, `/wiki`, and `/narrate capstone` verbs, the living-docs tier, and the close-out GC/disposition rituals are all live. Composes with the existing 12-verb surface, runtime, reference, and skill conventions; does not replace `/narrate` — it extends the narrative system from "views over git activity" into "a curated, durable library of finished artifacts grounded in researched sources." Two capabilities have since extended the *authoring* story — **recursive, frontmatter-keyed discovery** (organize the corpus into your own shelves) and **first-class publishing** (`/publish` to an external repo; GitHub Pages for this repo's own wiki). See **§14**.

---

## 1. Orienting vision

Adopt Karpathy's **LLM-wiki** pattern (immutable raw sources → LLM-maintained markdown wiki → a schema that tells the agent how the wiki is structured), scoped to Cadence's existing hierarchy. The wiki is not a sidecar product — it cross-cuts the whole lifecycle:

- **Research** accumulates *under* the unit of work (pursuit or project) as a working substrate: raw sources, distilled notes, an index, a log.
- **Polished narrative** graduates *out* of that substrate at closure into a durable, root-level **wiki** — the capstone artifact that shows progress concretely.
- **Lifecycle/GC** turns close-out into the forcing function for capstoning: when work resolves, Cadence prompts to crystallize the research into a narrative *before* the raw tier is cleared, capturing the summary and the back-links to sources at exactly the moment that knowledge is freshest.

The design principle that keeps this from being awkward: **reference, not containment.** Projects and pursuits never *own* polished content. They point at it. The wiki owns the finished corpus, and Obsidian reads the wiki as a first-class viewer.

This is the realization of a line already in the architecture doc — *"the artifact IS the state"* — extended one layer up: the narrative artifact is the durable state of what a pursuit *meant*, and it persists after the working files that produced it are gone.

---

## 2. Two layers, one seam

```
┌─────────────────────────────────────────────────────────────────────┐
│  RESEARCH LAYER  (working substrate — GC-eligible)                   │
│  Lives UNDER the unit of work.                                        │
│                                                                       │
│  pursuits/<p>/research/                  ← pursuit-scoped research     │
│  pursuits/<p>/projects/<proj>/research/  ← project-scoped research     │
│      raw/          immutable captured sources (never edited)          │
│      notes/        LLM-distilled atomic notes (literature notes)      │
│      index.md      catalog: every source + note, one-line summary     │
│      log.md        append-only ingest/query/lint log                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │  GRADUATION (a closure-time event,
                              │  not a live embed). Promotes a polished
                              │  artifact up; leaves a pointer + provenance
                              │  stub behind.
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  WIKI / NARRATIVE LAYER  (durable, curated, cross-cutting)           │
│  Lives at REPO ROOT. Outlives the research that produced it.         │
│                                                                       │
│  wiki/                                                                │
│      index.md            the curated front door (the discovery layer) │
│      log.md              wiki-level ingest/lint log                   │
│      narratives/         capstone narratives (promoted from drafts)   │
│      primers/            evergreen explainers / learning primers      │
│      _style/             house voice + user style overrides           │
│      _meta/              retrospectives, reflections (the meta-project)│
│      drafts/             ← existing narratives/drafts/ folds in here   │
└─────────────────────────────────────────────────────────────────────┘
```

**Why split this way (and not nest the wiki under pursuits):**

- The polished corpus is **cross-cutting**. A primer on RoCEv2 written during one project is valuable to the next; if it lived under the project it would be archived/deleted with it. Promotion to root keeps finished knowledge alive across the GC boundary.
- A root-level `wiki/` is a **clean Obsidian vault target**. Pointing Obsidian at the whole repo works, but a curated root folder is what makes the graph view and discovery surfaces coherent rather than polluted with raw research dumps.
- It matches the existing **`thoughts/` precedent**: raw payloads live in `thoughts/_raw/`, distilled artifacts in `thoughts/`, and only structured summaries graduate forward. The wiki is the same shape at a higher altitude.

**The seam is a pointer, not a link-through.** After graduation, the project/pursuit file carries one frontmatter line:

```yaml
narrative: wiki/narratives/<slug>.md
```

…and the narrative carries *back-references* to the sources it drew from (captured before GC removes them). The project file stays clean; the wiki stays browsable; the provenance survives the deletion of `raw/`.

---

## 3. The meta-project (`wiki/_meta/`)

Your central, long-living home for retrospectives, reflections, and cross-pursuit synthesis. This is the LLM-wiki applied to *Cadence-the-user-data-repo itself* — the place where the system narrates its own arc across pursuits.

What lives here:

- **Retrospectives** — periodic (per win-cycle, per quarter) syntheses across resolved pursuits. This is where `/narrate lessons` output graduates from a draft into a durable, linked retrospective.
- **Reflections** — the existing `reflections/` weekly artifacts can surface here as a navigable, cross-linked set rather than a flat date pile.
- **The meta-index** — a `wiki/_meta/index.md` that catalogs the durable narrative corpus: which pursuits produced which capstones, which primers exist, what threads recur.

The meta-project is **never GC'd**. It's the layer that gives continuity — the thing you read to remember what you were building and why, across months. It's the answer to the vision doc's core problem statement: *"they finish weeks feeling like they worked hard but can't articulate what moved forward."*

The reconciler (already system behavior) gains a light meta-awareness check: when N pursuits have resolved since the last retrospective, surface a nudge — *"3 pursuits have closed since your last retrospective. Want to synthesize the arc?"* — reusing the exact frequency-cap and set-watermark machinery `/narrate lessons` already implements.

---

## 4. The wiki-lifecycle skills (first-class verbs)

Four new skills own the wiki lifecycle. They follow Karpathy's three operations (Ingest / Query / Lint) plus the Cadence-specific graduation step. They are designed to be **invoked by other Cadence skills**, not just directly — tight integration is the point.

### `/research` — ingest + maintain the research substrate

The Ingest operation, scoped to the current unit of work.

```
/research <source>            ingest a source into the active project/pursuit's raw/,
                              distill an atomic note, update index + log
/research --pursuit <p> <src> ingest at pursuit scope rather than project scope
/research ask "<question>"     query the research substrate (read index → drill → synthesize)
/research primer               generate a learning primer from the substrate (see §6)
```

**Mechanics (mirrors the capture-ingest subagent pattern exactly):**

1. Inline source → pull raw payload to `<unit>/research/raw/<id>.raw.md` (immutable).
2. Dispatch a **research-ingest subagent** (restricted tools, explicit budget) that reads the raw source, distills an atomic note to `notes/<id>.md` with provenance frontmatter, and returns *only* the structured summary + suggested cross-links.
3. The skill updates `index.md` (append the new note + one-line summary) and `log.md` (append `## [YYYY-MM-DD] ingest | <title>`).
4. A single source "might touch several notes" — the subagent suggests cross-references to existing notes; the skill writes the back-links.

The subagent isolation matters here for the same reason it does in capture: bulk source payloads never enter the main conversation; only distilled notes and summaries return.

### `/wiki` — query + curate the durable corpus

The Query operation over the *promoted* corpus (not the research substrate).

```
/wiki                    show the curated front door (wiki/index.md)
/wiki ask "<question>"   semantic/index-driven Q&A across all narratives + primers
/wiki <slug>             open a specific wiki artifact
/wiki related <slug>     surface related artifacts (link-graph + optional semantic)
```

Query reads `wiki/index.md` first (the catalog), drills into relevant artifacts, synthesizes with citations. Per the research finding: for a personal-scale corpus this **outperforms vector RAG on retrieval reliability** — no chunking, no missed segments, global reasoning over the whole set. Semantic search (Smart Connections in Obsidian, or a local hybrid engine) is an *optional later add-on* when the corpus outgrows index-navigation, not a starting requirement.

Crucially (Karpathy's compounding insight): **good `/wiki ask` answers can be filed back into the wiki as new artifacts.** A synthesis worth keeping becomes a primer. Explorations compound rather than evaporating.

### `/narrate` (extended) — graduate research into a capstone

`/narrate` already exists and already does watermark-based narrative generation from git activity. It gains **one new cadence: `capstone`** — the polished, source-grounded project/pursuit narrative that promotes into `wiki/narratives/`.

```
/narrate capstone <project>   generate the capstone narrative for a project,
                              grounded in BOTH git activity AND the research substrate,
                              with diagrams for technical work, promote to wiki/
```

This is the natural extension point you identified: at closure, *"let's generate a nicely written narrative, maybe even with diagrams for technical projects."* The capstone cadence differs from the existing cadences:

- **Dual source:** git activity (what was done) + research substrate (what was learned + the sources). The existing cadences read only git; capstone also reads `<unit>/research/`.
- **Diagrams:** for `effective_domain: digital`/technical units, the narrator is briefed to include Mermaid diagrams (architecture, sequence, state) where they clarify. (The runtime already routes on `effective_domain` for physical-vs-digital behavior — same signal, new use.)
- **Promotion:** the output lands in `wiki/narratives/<slug>.md` (durable), not `narratives/drafts/` (working). It carries back-references to the research sources.
- **Style-aware:** reads `wiki/_style/` before generating (see §5).

It reuses everything `/narrate` already has: subagent isolation, explicit budgets, McAdams structure, the no-evaluative-praise guardrails, the watermark frontmatter pattern.

### `/wiki lint` — the health check

Karpathy's Lint operation. Periodic, low-priority, reconciler-surfaced.

```
/wiki lint        scan for contradictions, stale claims, orphan artifacts,
                  broken back-references, dangling pointers, coverage gaps
```

Specifically valuable post-GC: when `raw/` is deleted, lint verifies every narrative's source back-references still resolve to *something* (a captured citation stub, even if the raw file is gone) and flags any narrative whose provenance evaporated. It runs as a subagent with a budget and returns a short findings list — it does not auto-fix; it surfaces for the user to decide, consistent with how the reconciler surfaces flags rather than acting on them.

---

## 5. Style files (`wiki/_style/`)

Cadence ships sensible defaults; the user overrides. This mirrors how the tip library, coaching-strings, and provocation deck already externalize voice from code.

```
wiki/_style/
    voice.md          house voice: tone, person, what to avoid
    capstone.md       structural template for capstone narratives
    primer.md         structural template for learning primers
    diagrams.md       diagram conventions (when to use which Mermaid type)
```

- **Defaults provided by Cadence** encode the existing narrative guardrails: McAdams structure (what happened / what it meant / what shifted / what's next), no evaluative praise, no "why" framing, redemption-aware honesty.
- **User overrides** sit in the same files; if present, the wiki skills read them and the user's preferences win. A user who wants a punchier blog voice, or first-person, or a specific diagram palette, drops it here.
- The skills **read style before generating** — a `read wiki/_style/voice.md` + `read wiki/_style/<artifact-type>.md` step in the subagent briefing, exactly analogous to how `/narrate` reminds the narrator of the McAdams contract today.

This keeps voice out of code and in version-controlled, user-editable markdown — consistent with the whole local-first ethos.

---

## 6. The research template & learning primer

When research starts on a pursuit/project, `/research` scaffolds a template so the substrate is structured from the first source (structure beats embeddings for discoverability):

```markdown
---
unit: <pursuit-id>/<project-id>
created: <ISO date>
status: researching
sources: 0
---

# Research: <unit name>

## Primer
<!-- generated by /research primer once enough sources accumulate -->

## Suggested learning
<!-- curated reading order + why each source matters -->

## Sources
<!-- index of raw sources, each linking to its distilled note -->

## Open questions
<!-- what we still need to find — the backfill targets -->
```

**The primer** (`/research primer`) is the on-ramp artifact you described — *"a nice research template where we have links to our sources and suggested learning and a primer on the material."* It's generated from the accumulated notes: a short orientation to the material, a *suggested learning order* with one-line rationale per source, and links into the distilled notes. It's a working-tier artifact, but a *good* primer is exactly the kind of thing that graduates to `wiki/primers/` at closure rather than being deleted.

This directly serves the "go back and discover" goal: months later, the primer (durable, in `wiki/primers/`) is the fastest re-entry into a topic you researched once.

---

## 7. Narrative inbox capture

Your idea: captures shouldn't be bare names in the triage queue — each carries a one-line narrative you can read while triaging.

This composes cleanly with the existing capture pipeline. Capture already writes a `thoughts/<id>.md` distilled artifact via the capture-ingest subagent; it already returns suggested outcomes. The extension is small:

- For **non-inline** captures (`--from`, `--source`, `--dump`) — which already run the subagent — the distillation adds a **one-sentence "triage gist"** to the thought's frontmatter:

  ```yaml
  ---
  id: <id>
  captured: <ISO>
  triage_gist: "A pattern for keeping bulk JSON out of the main thread via subagent budgets."
  suggested_outcome: note
  ---
  ```

- The **Inbox view** (`inboxItems(snapshot)` — the single function consumed by `/status`, the SessionStart hook, the reconciler, `/reflect` Get Clear) renders the gist beside the name:

  ```
  Inbox: 3 items
    • subagent-budgets-pattern — keeping bulk JSON out of the main thread via budgets
    • rocev2-pfc-watchout — PFC head-of-line blocking risk under incast
    • cadence-wiki-idea — narrative companion to the planning workflow
  ```

- **Inline** `/capture "..."` stays bare — flow safety beats everything; the inline path must not spend tokens on gist generation. The gist appears only where a subagent is already running, so there's zero added cost on the hot path. (If an inline capture is later opened during triage, a gist can be generated then.)

One number, one function, every surface — the gist rides along the existing Inbox plumbing rather than adding a parallel system.

---

## 8. Lifecycle / GC — close-out as the capstoning ritual

GC is **prompted, never silent**, and it doubles as the forcing function for capturing knowledge before it's lost. It hooks into the existing closure machinery rather than adding a parallel one.

**Where it hooks in:**

- `/complete`'s `closing_in_on_resolution` finalization-suggestion block already lists *audit / narrative / demo / validation-review* as planned finalizing work. **Add "capstone" to that menu.** When a pursuit is closing in, surface: *"capstone: crystallize the research into a durable narrative (run `/narrate capstone <pursuit>`)."*
- `/resolve`'s closure ritual (the absolute block on open projects + active brainstorms) gains a **research-disposition step** after the existing resolution work.

**The GC decision flow at closure:**

```
Pursuit/project resolving.
        │
        ▼
  Does a capstone narrative exist for this unit?
        │
   ┌────┴─────┐
   NO         YES
   │           │
   │           ▼
   │     Offer raw disposition:
   │       "Capstone exists at wiki/narratives/<slug>.md.
   │        The research substrate (14 raw sources) is safe to clear.
   │        Delete raw/ · Archive raw/ · Keep"
   │
   ▼
  ENCOURAGE capstoning — this is the moment:
    "You pulled 14 sources into this and never crystallized them.
     This is the moment to summarize the arc and link back to what
     you learned, before the raw research is cleared.
     Generate a capstone now? (recommended) · Clear without capstone · Keep raw"
```

**Disposition options:**

- **Delete `raw/`** — git history retains it; the working tree is cleaned. The capstone's back-references become citation stubs (title + source URL + capture date, preserved in the narrative) rather than live file links. This is the default once a capstone exists.
- **Archive `raw/`** — relocate to a cold path (e.g., `wiki/_archive/<unit>/raw/`) if the user wants the bulk content reachable without git archaeology. Heavier; offered, not default.
- **Keep** — leave the substrate in place (e.g., research still active for a follow-on pursuit).

**What always survives GC:**

- The capstone narrative (in `wiki/narratives/`).
- Any graduated primer (in `wiki/primers/`).
- The provenance: source titles, URLs, capture dates — embedded as citation stubs in the narrative's back-reference section, so *"link back to the sources we pulled from initially"* holds even after `raw/` is gone.

The lifecycle reframing: **the chance to summarize and link back is the close-out prompt.** Far from risking lost knowledge, GC is the ritual that captures knowledge at the moment it's most complete, then clears the scaffolding.

---

## 9. Obsidian as a first-class viewer

The wiki is plain markdown with `[[wikilinks]]` and YAML frontmatter — natively an Obsidian vault. Recommended setup:

- **Point Obsidian at the repo root**, but the curated experience lives in `wiki/`. The graph view over `wiki/` shows the narrative+primer corpus and its cross-links; `_meta/` shows the retrospective spine.
- **Frontmatter as the queryable layer.** Capstones and primers carry structured frontmatter (`unit`, `created`, `sources`, `pursuit`, `tags`, `status`). Obsidian **Bases/Dataview** turn these into live tables — e.g., "all capstones from win-cycle 2026-H1," "all primers tagged #networking." Per the research: put anything you'll sort/filter on into formal YAML properties (Bases reads frontmatter, not inline fields).
- **Smart Connections (optional)** — zero-setup local semantic "related notes" as the corpus grows past index-navigation scale. This is the upgrade path for `/wiki related`, not a day-one dependency.
- **The index files are the human front door too.** `wiki/index.md` and `wiki/_meta/index.md` are written to be read by a person in Obsidian, not just parsed by the agent — curated, linked, one-line summaries. The discovery layer is the same artifact for human and agent.

Cadence writes the markdown; Obsidian reads and renders it; the agent navigates it via the index. Three views of one source of truth, no sync, no lock-in. (Per the research: *"Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase."*)

---

## 10. How it cross-cuts the existing surface

| Existing surface | Integration with the wiki/narrative system |
|---|---|
| **`/capture`** | Non-inline captures gain a `triage_gist`; Inbox renders it. Zero cost on the inline hot path. |
| **`/brainstorm`** | A crystallizing brainstorm can seed a research substrate on the materialized pursuit/project. An archived brainstorm's exploration is itself a candidate primer. |
| **`/start`** | Silent — wiki work never intrudes on flow. (Capstoning is a closure activity, not an execution one.) |
| **`/complete`** | `closing_in_on_resolution` finalization menu gains "capstone" alongside audit/demo/validation. |
| **`/resolve`** | Closure ritual gains the research-disposition + capstone-encouragement step (§8). |
| **`/narrate`** | Extended with the `capstone` cadence — dual-source, diagram-aware, promotes to `wiki/`. |
| **`/reflect`** | Get Clear can surface "research substrates with no capstone" as a gentle finalization signal; retrospective-due nudges surface here. |
| **`/status`** | Inbox gists; optionally a "wiki freshness" line (substrates awaiting capstone). |
| **`reconciler`** (system) | Gains: retrospective-due check (meta-project), capstone-gap flag (resolved units missing a narrative), `/wiki lint` scheduling. |
| **`/find`** | Searches the wiki corpus, not just work items — shipped, and now **recursive + frontmatter-keyed** so arbitrary shelves and nested folders are found, not a fixed tier list (§14). |

---

## 11. New skills summary

| Skill | Operation | Scope | Subagent? | Promotes to |
|---|---|---|---|---|
| `/research <src>` | Ingest | unit (project/pursuit) | yes (research-ingest) | — (working tier) |
| `/research ask` | Query | research substrate | optional | — |
| `/research primer` | Synthesize | research substrate | yes | `wiki/primers/` at closure |
| `/wiki` / `/wiki ask` | Query | durable corpus | optional | — |
| `/wiki lint` | Lint | durable corpus | yes | — (surfaces findings) |
| `/narrate capstone` | Graduate | unit → wiki | yes (narrator, extended) | `wiki/narratives/` |

All follow the established conventions: frontmatter `description` with explicit TRIGGER/SKIP, CLI binding for read-only state, subagent isolation with explicit budgets for bulk-payload work, watermark/pointer frontmatter, no-evaluative-praise guardrails.

---

## 12. Open design questions for chat iteration

1. **Research scope default.** When `/research` is invoked inside an active project session, does it default to *project* scope, with `--pursuit` to escalate? (Proposed: yes — most research attaches to a specific project; pursuit-scope is the cross-project case.)

2. **Primer vs capstone overlap.** A primer (on-ramp to *sources*) and a capstone (story of *the work*) are different artifacts, but a technical blog post might want both fused. Do we want a third template (`/narrate capstone --with-primer`) that produces a combined "here's what I built and here's the background you need" piece? This is the closest thing to the "technical blog post" final artifact in the original research.

3. **GC default aggressiveness.** Proposed default once a capstone exists: delete `raw/` (git retains). Is delete-by-default too aggressive for your comfort, or is git history sufficient backstop? Archive-to-cold is the more conservative default.

4. **Meta-project location.** `wiki/_meta/` vs a top-level `meta/`. Proposed `wiki/_meta/` so the whole durable corpus is one Obsidian vault. Counter-argument: the meta-project is conceptually distinct enough to warrant its own root folder. Your call on how unified the vault should feel.

5. **Diagram rendering.** Mermaid in markdown renders in Obsidian and GitHub natively. For capstones that want richer diagrams, do we stop at Mermaid, or eventually allow the capstone subagent to emit an SVG asset alongside? (Proposed: Mermaid-only to start — it's diffable, text-based, and fits the local-first/version-controlled ethos. SVG is a later escalation.)

6. **Style inheritance.** Should `wiki/_style/` support per-pursuit overrides (a pursuit about family writes in a different voice than one about networking architecture), or is one repo-level house voice enough? (Proposed: repo-level to start; per-pursuit is a clean extension if needed.)

---

## 13. Suggested build sequence (routes through Cadence itself)

Per `CLAUDE.md`'s "feature work goes through Cadence" rule, this is substantial structural work → it becomes projects under `improve-ux-and-vision`, each with an Intent and Actions:

1. **Research substrate + `/research` ingest** — the foundation: directory layout, template, research-ingest subagent, index/log maintenance. (Mirrors capture-ingest; lowest-risk starting point.)
2. **`/narrate capstone` cadence** — extend the existing narrate skill with dual-source + diagrams + promotion. (Highest user-visible value; the capstone is the payoff artifact.)
3. **GC ritual in `/resolve` + `/complete`** — research disposition + capstone encouragement. (Closes the loop; depends on 1 and 2.)
4. **`/wiki` query + curate + `wiki/index.md`** — the discovery front door. (Depends on having promoted artifacts to query.)
5. **Narrative inbox gists** — small, independent; can land any time after the capture pipeline is touched.
6. **`/wiki lint` + reconciler integration** — the maintenance layer; lands last, once there's a corpus worth linting.
7. **Style files** — ship defaults with step 2; user-override wiring can follow.

Each step is independently shippable and independently validates. Step 1 + 2 + 3 is the minimum coherent feature (research → capstone → GC); 4–7 are the discovery and maintenance enrichments.

---

## 14. Authoring quality wikis: organize, discover, publish

Three capabilities turn the wiki from "a place capstones land" into a corpus you actively **author**, **organize**, and **ship**. The first two graduated from field-review issues (#8, #9) after the core layer landed; the third is this repo eating its own dog food.

### Organize into your own shelves — recursive, frontmatter-keyed discovery

The query surface (`cadence find`, `/wiki ask`) originally scanned a fixed tier list (`narratives/`, `primers/`, `living/`) with a *flat* glob. A hand-made shelf like `wiki/code-deep-dives/` — properly frontmattered, linked from `index.md` — was invisible to search, and nested folders like `living/1-1s/` were silently missed.

Discovery is now **recursive and keyed on wiki-shaped frontmatter** (a `title`), not a hardcoded tier list. Drop a frontmattered markdown file in *any* subfolder under `wiki/` and it's first-class to `cadence find` and `/wiki ask` — no tier registration, no glob to maintain. You organize the corpus the way the topic wants (a `code-deep-dives/` shelf distinct from one-sitting `primers/`; a `1-1s/` subfolder under `living/`) and the tooling keeps up. Navigation/log files (no `title`) and the `_archive/` provenance tier are skipped; everything you'd actually search for is found.

> Implementation: `scanWikiArtifacts` walks `wiki/**`, includes any file carrying a `title`, and feeds the unified corpus to `find`. The typed living-doc view stays alongside it for the anchoring features (doc shelves, `narrate --into`, resolve disposition). The signal is the `title`, so the way to make generated drafts findable is to give them one — not to loosen the key.

### Publish into an external repo — `/publish`

`/wiki` and `/narrate capstone` land curated work in *your* `wiki/`. The next step — contributing that work into **someone else's authoritative repo** (a team or shared wiki) — is `/publish`. The model that cohered (see the archived `first-class-publish` brainstorm):

- **Identity is the git URL**; the local checkout is **discovered per-machine** (sibling dirs → git-remote match → prompt), never path-bound, so a target travels across laptops.
- **You edit the destination in place** (mode B): `/publish` locates the checkout, reads *its* conventions fresh each time (where references live, how pages cite), and helps you write conforming content directly in the destination repo. Git owns merge, auth, conflict, and idempotency — re-publishing is just another commit, no manifest.
- **The personal→public boundary is surface-and-warn**: private-looking content is flagged before it crosses, and a hard rule strips any link pointing back into the private Cadence repo. Provenance stays cadence-side — which also lets your repo remember where it contributes, so you can always draft against the destination's current state.

> Configured under `publish_targets:` in `cadence.yaml`; CLI primitives `cadence publish-targets` / `cadence publish-resolve`; full register in `cadence-plugin/workflows/verb-contracts.md`.

### Publish your own wiki as a site — GitHub Pages

Because the wiki is plain, Obsidian-shaped markdown, it renders directly to a static site. This repo's `wiki/` builds to **GitHub Pages via MkDocs Material** — a `[[wikilinks]]`-aware build — so the curated corpus is browsable as a website, not just in an editor. The working tiers (`drafts/`, `_archive/`) stay out of the published site. The same source of truth now has **three coherent views** — Obsidian, the agent's index navigation, and a public Pages site — with no sync step and no lock-in.

> Build config: `mkdocs.yml` at the repo root; deploy workflow at `.github/workflows/pages.yml`. `wiki/` is the source — no file moves.
