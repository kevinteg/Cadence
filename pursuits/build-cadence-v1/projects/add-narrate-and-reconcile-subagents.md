---
id: add-narrate-and-reconcile-subagents
pursuit: build-cadence-v1
status: on_hold
created: 2026-04-27
---

# Add Narrate And Reconcile Subagents

/narrate and /reflect today pull large JSON payloads (every marker, every idea, every flag) into the main conversation context just to summarize them into a few paragraphs of narrative. A specialized subagent that runs in isolation, ingests the bulk data, and returns only the narrative or flag summary keeps the main thread clean. agents/ directory currently unused — this is the natural fit.

## Definition of Done

- [ ] agents/ directory created at plugin root
- [ ] narrator subagent that handles McAdams generation for /narrate (today, week, pursuit-arc) — accepts a time window or pursuit ID, returns prose only
- [ ] reconciler subagent that runs the cadence flags scan with idea-specific checks and returns a flag-only summary — main thread never sees the raw scan payload
- [ ] /narrate and /reconcile skills updated to delegate to these subagents via the Agent tool, falling back to in-thread execution if the subagent isn't available
- [ ] User-story validation: run /cadence:narrate week and confirm narrative quality is at least equivalent to today's; check that main-thread context tokens used are visibly lower (note the before/after in project notes)
- [ ] User-story validation: run /cadence:reconcile and confirm the flag report is identical in content to today's behavior

## Actions

- [ ] Read Claude Code agents/ directory conventions and decide which agent type/persona fits each subagent
