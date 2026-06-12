---
id: research-substrate-and-ingest
pursuit: build-narrative-research-wiki
status: done
created: 2026-06-11
---

# Research substrate + /research ingest verb

## Intent

The foundation layer (design doc sections 2, 4, 6). Research accumulates under the unit of work as a working substrate: pursuits/<p>/research/ and pursuits/<p>/projects/<proj>/research/, each with raw/ (immutable captured sources, never edited), notes/ (LLM-distilled atomic notes with provenance frontmatter), index.md (catalog of every source and note with one-line summaries), and log.md (append-only ingest/query log). A new /research skill owns Ingest, mirroring the capture-ingest subagent pattern exactly: pull the raw payload to raw/, dispatch a research-ingest subagent (restricted tools, explicit budget) that distills an atomic note and returns only the structured summary plus suggested cross-links, then update index and log from the skill. /research ask queries the substrate index-first (read index, drill into notes, synthesize with citations). /research primer generates the on-ramp artifact: a short orientation, a suggested learning order with one-line rationale per source, and links into the distilled notes. Scope defaults to the active project, with --pursuit to escalate (design question 1, proposed yes — confirm during work). Done feels like: ingesting a real source produces raw file + distilled note + updated index + log entry without the bulk payload ever entering the main conversation, and ask/primer work over a substrate of three or more sources.

## Actions

- [x] Scaffold the substrate conventions: directory layout for pursuit- and project-scoped research/, the research template (Primer / Suggested learning / Sources / Open questions), and index.md + log.md formats — document in cadence-reference.md
- [x] Write the research-ingest subagent (cadence-plugin/agents/) mirroring capture-ingest: restricted tools, explicit budget, distill-to-atomic-note contract with provenance frontmatter and cross-link suggestions
- [x] Build the /research skill ingest path: raw pull, subagent dispatch, index/log update, project-scope default with --pursuit escalation
- [x] Add /research ask: index-first query over the substrate with citations into notes
- [x] Add /research primer: orientation + suggested learning order generated from accumulated notes into the template Primer section
- [x] Queue fresh-session validation via pending-validation-add: ingest a real source end-to-end, verify raw/note/index/log and that the bulk payload stayed out of the main thread
