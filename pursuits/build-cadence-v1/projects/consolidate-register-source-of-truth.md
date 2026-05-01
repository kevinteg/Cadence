---
id: consolidate-register-source-of-truth
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Consolidate Register Source Of Truth

Make workflows/verb-contracts.md the single canonical source for the per-verb register. Today the register text exists in three places — verb-contracts.md, the **Register:** block in each SKILL.md body, and the One Voice section of cadence-runtime.md — and will drift over time. Pick one home and make the others reference it.

## Actions

- [x] Diff register language across verb-contracts.md, SKILL.md files, and runtime to map the duplication
  - Audit complete. Found Register text in 7 SKILL.md files (brainstorm, capture, develop, narrate, reflect, start, waiting). Compared each **Register:** block against verb-contracts.md's **Tone:** line for the matching verb. Result: verb-contracts.md is canonical and complete — every SKILL.md Register block was either identical to or a strict subset of the verb-contracts Tone+Guardrails sections. No back-fill needed. Six skills already had a 'Reference workflows/verb-contracts.md' pointer above the Register block; waiting was the only one missing the pointer.
