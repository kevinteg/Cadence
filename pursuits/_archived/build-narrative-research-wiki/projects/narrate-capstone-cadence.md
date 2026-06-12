---
id: narrate-capstone-cadence
pursuit: build-narrative-research-wiki
status: done
created: 2026-06-11
---

# Extend /narrate with the capstone cadence + style files

## Intent

The payoff artifact (design doc sections 4, 5). /narrate gains a capstone cadence: a polished, source-grounded narrative for a project or pursuit that promotes into wiki/narratives/<slug>.md rather than narratives/drafts/. It differs from existing cadences in four ways: dual source (git activity via project-activity AND the research substrate of the unit), Mermaid diagrams where they clarify for effective_domain digital/hybrid units (same signal the runtime already routes on), promotion with provenance (the narrative carries back-references to its sources; the unit file gains one frontmatter pointer line — narrative: wiki/narratives/<slug>.md — reference, not containment), and style-awareness (reads wiki/_style/ before generating). Ships the wiki/_style/ defaults alongside: voice.md, capstone.md, primer.md, diagrams.md encoding the existing guardrails (McAdams structure, no evaluative praise, redemption-aware honesty); user edits to those files win over defaults. Reuses everything /narrate already has: narrator subagent isolation, the 8-tool-call budget class, watermark frontmatter. Done feels like: running /narrate capstone on a real unit with a research substrate produces a wiki-quality artifact with diagrams where they help, source back-references, and a pointer round-trip from the unit file.

## Actions

- [x] Extend the narrate skill + narrator agent contract with the capstone cadence: dual-source briefing (project-activity stream + research substrate), promotion target wiki/narratives/, watermark frontmatter
- [x] Ship wiki/_style/ defaults (voice.md, capstone.md, primer.md, diagrams.md) encoding the McAdams + no-evaluative-praise guardrails; wire the style-read step into the capstone briefing with user overrides winning
- [x] Add Mermaid diagram briefing gated on effective_domain (digital/hybrid only): architecture, sequence, and state diagrams, with guidance on when each clarifies
- [x] Write the pointer seam: narrative frontmatter line on the source unit file plus a back-reference section in the capstone (CLI support if needed)
- [x] Queue fresh-session validation: generate a capstone for a real unit, verify dual-source grounding, style application, diagrams, and the pointer round-trip
