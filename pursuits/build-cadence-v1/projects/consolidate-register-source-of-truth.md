---
id: consolidate-register-source-of-truth
pursuit: build-cadence-v1
status: on_hold
created: 2026-04-27
---

# Consolidate Register Source Of Truth

Make workflows/verb-contracts.md the single canonical source for the per-verb register. Today the register text exists in three places — verb-contracts.md, the **Register:** block in each SKILL.md body, and the One Voice section of cadence-runtime.md — and will drift over time. Pick one home and make the others reference it.

## Definition of Done

- [ ] Audit all three locations and confirm verb-contracts.md is the most complete; back-fill any register language only present in SKILL.md or runtime
- [ ] **Register:** blocks removed from each SKILL.md (or replaced with the single-line 'Reference workflows/verb-contracts.md for the X register' pattern that some skills already use)
- [ ] cadence-runtime.md One Voice section trimmed to the vocabulary-of-voice principle only; no per-verb register specifics
- [ ] User-story validation: change a register line in verb-contracts.md (e.g., loosen brainstorm's facilitator rule) and confirm /cadence:brainstorm picks up the new behavior with no other files needing edits

## Actions

- [ ] Diff register language across verb-contracts.md, SKILL.md files, and runtime to map the duplication
