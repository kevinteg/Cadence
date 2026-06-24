---
id: model-mapping-and-overrides
pursuit: run-cadence-on-auggie
status: done
created: 2026-06-24
---

# Model mapping + overrides adapter

## Intent

Cadence subagents pin models (reconciler=haiku, narrator/capture-ingest/research-ingest/wiki-lint=sonnet). Auggie uses different model names (e.g. sonnet4.5, gpt5) and its own routing. Build model-map.ts (haiku/sonnet -> Auggie tiers) and a hand-maintained src/auggie/overrides.yaml that layers on top of generated output for anything not mechanically derivable: the model map, Auggie-specific subagent-dispatch idioms, and any per-verb fixups discovered during validation. Define a Zod schema for the overrides file in src/types.ts and a clear merge order (generated <- overrides). Done means: model names are mapped, the overrides layer is documented, and merge behavior is tested.

## Actions

- [x] Draft the model-map table and the overrides.yaml schema (Zod in src/types.ts) + merge logic
- [x] Apply overrides in transform.ts (generated output then overrides on top) and test the merge
