---
id: split-runtime-core-and-reference
pursuit: build-cadence-v1
status: active
created: 2026-04-27
---

# Split Runtime Core And Reference

Split cadence-runtime.md (~256 lines, ~10KB loaded every turn via CLAUDE.md) into a lean core that always loads and a reference doc that skills pull on demand. The current runtime mixes attention-shaping content (vocabulary, one voice, session rules) with reference content (file format schemas, full CLI subcommand catalog, lifecycle file mechanics) — only the first set needs to live in everyone's system prompt.

## Definition of Done

- [ ] cadence-runtime.md trimmed to ~80 lines covering: Vocabulary, One Voice, Sessions, Upward Completion, Pipeline, Guardrails, Scope
- [ ] New cadence-reference.md created containing: File Formats, full CLI subcommand catalog, Pursuit Lifecycle file mechanics, Waiting-For schema, Creating-a-Project / Completing-a-Project recipes, Conventions
- [ ] Skills that need format/CLI specifics reference cadence-reference.md inline (same pattern as today's reference to workflows/verb-contracts.md)
- [ ] CLAUDE.md and README install instructions updated; the @-import line still pulls cadence-runtime.md only
- [ ] Token-budget check: measure size of imported runtime before/after, document the reduction in the project notes
- [ ] User-story validation: in a session, run /cadence:status and a write verb like /cadence:capture; confirm both execute correctly with no information loss from the trimmed runtime
- [ ] User-story validation: invoke a verb whose skill needs file-format details (e.g., /cadence:promote, which writes new files) and confirm it correctly pulls cadence-reference.md when needed

## Actions

- [ ] Inventory cadence-runtime.md sections and tag each as core (always-load) or reference (on-demand)
