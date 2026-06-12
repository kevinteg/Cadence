---
type: concept
title: How We Work
created: 2026-06-11
tags: [operating-loop, brainstorm, research, learning, gtd]
---

# How We Work

Cadence separates four modes of thought that degrade when mixed: generating options, studying sources, consolidating knowledge, and executing commitments. Each mode has its own verbs, its own artifacts, and its own exit into the next. This page is the map; [[vision]] covers why the system exists, [[architecture]] covers why it is shaped this way.

## Brainstorming — diverge, converge, crystallize

A brainstorm is a workspace with a phase machine, not a chat transcript.

- **Diverging** — the user generates; the agent facilitates and records. No LLM-generated ideas in this phase: convergent bias contaminates divergence (see [[research-foundations]] on DMN/ECN switching).
- **Converging** — candidate solutions get written down and compared. Here the LLM's convergent bias becomes an asset.
- **Crystallizing** — `/brainstorm --crystallize` materializes the chosen solution into a real unit of work: title → Intent → first actions. Workspaces that don't crystallize get archived with their reasoning intact.

Entry: `/brainstorm` (new) or `/start <slug>` (resume). Stray thoughts mid-flow go to `/capture` — zero-response by contract, triaged later, never interrupting the phase.

## Research — substrate, ingest, ask, primer

Deliberate study accumulates under the unit of work it serves: `<unit>/research/` with `raw/` (immutable sources), `notes/` (distilled atomic notes with provenance), `index.md` (catalog), `log.md` (append-only events).

- **Ingest** — `/research` pulls a source into `raw/` and dispatches a budgeted subagent to distill an atomic note; the bulk payload never enters the main conversation.
- **Ask** — index-first query over the substrate, answers with citations into notes.
- **Primer** — the on-ramp artifact: orientation plus a suggested learning order over the sources.

The substrate is the *working tier* — GC-eligible at closure. What it produces graduates. The whole layer is an application of the LLM-wiki pattern; the mapping is documented in [[llm-wiki-pattern]].

## Learning — graduation into the durable corpus

Knowledge survives the work that produced it by graduating into this wiki:

- **Capstone** — `/narrate capstone <unit>` writes the polished, source-grounded narrative of a unit to `wiki/narratives/`, leaving a one-line `narrative:` pointer on the unit file. Reference, not containment.
- **Primer graduation** — at closure, a substrate's primer can graduate to `wiki/primers/` as an evergreen re-entry point.
- **GC as ritual** — `/resolve` prompts research disposition at close-out: crystallize first, then clear `raw/`. Citation stubs preserve provenance even after sources are gone.
- **Compounding** — a good `/wiki ask` answer can file back as a draft primer, so explorations accumulate instead of evaporating.

The corpus is navigated index-first from `wiki/index.md` and health-checked by `/wiki lint`. It reads as a plain Markdown folder in any reader (Obsidian works well, but nothing depends on it).

## Getting things done — pursuit, project, action

The execution hierarchy is a write-ahead log of intent:

- **Pursuit** — an intentional commitment with a Why, tied to values or a role.
- **Project** — a scoped effort framed by an Intent narrative (motivation + felt-sense of done) and an Actions list. Done-ness is judged in dialogue against the Intent, never by sweeping a checklist.
- **Action** — an atomic, concrete move you can visualize doing.

The loop: `/start` opens work (view-only; the file is the durable state — no session ceremony), `/complete` checks actions (first check promotes `on_hold` → `active`), `/waiting` records external blockers, `/resolve` wraps units with a closure ritual. Completion flows upward — finished actions prompt project resolution; resolved projects prompt pursuit finalization *before* the end, so audits, capstones, and narratives are planned phases rather than surprises.

Rhythm verbs close the loop:

- **`/reflect`** — the weekly ritual: Get Clear (triage, flags from the reconciler), Get Focused (set the Leveraged Priority — the ONE thing that defines next week's win).
- **`/narrate`** — generated narrative over real activity at daily/weekly/monthly/annual/pursuit cadences, watermark-resumed, McAdams-structured: what happened, what it meant, what shifted, what's next.
- **The reconciler** — background meta-awareness: stale state, overdue blockers, Inbox pressure, capstone gaps, retrospectives coming due. Surfaces flags at breakpoints; never interrupts flow.

## The seams

Each mode hands off cleanly: a brainstorm crystallizes into a project; a project accumulates a research substrate; the substrate graduates into capstones and primers at resolution; the wiki feeds the next brainstorm. Captures and the Inbox catch everything that arrives out-of-band. Flow state is protected at every seam — nudges live at breakpoints, the file is always the truth, and nothing demands ceremony to start or stop.
