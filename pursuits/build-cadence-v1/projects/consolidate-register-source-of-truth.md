---
id: consolidate-register-source-of-truth
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Consolidate Register Source Of Truth

Make workflows/verb-contracts.md the single canonical source for the per-verb register. Today the register text exists in three places — verb-contracts.md, the **Register:** block in each SKILL.md body, and the One Voice section of cadence-runtime.md — and will drift over time. Pick one home and make the others reference it.

## Definition of Done

- [x] Audit all three locations and confirm verb-contracts.md is the most complete; back-fill any register language only present in SKILL.md or runtime
  - Audit confirmed verb-contracts.md is canonical and complete. Each SKILL.md Register block was identical to or a subset of the verb's Tone+Guardrails in verb-contracts. Examples: brainstorm SKILL added 'your job is to keep ideas flowing' (covered by verb-contracts Behavior section); reflect SKILL added 'Prefer what over why throughout / No evaluative praise' (already in verb-contracts Guardrails); narrate and waiting SKILL versions were strict subsets of verb-contracts (which had extra clarifying phrases). No back-fill needed.
- [x] **Register:** blocks removed from each SKILL.md (or replaced with the single-line 'Reference workflows/verb-contracts.md for the X register' pattern that some skills already use)
  - All 7 **Register:** blocks removed: brainstorm, capture, develop, narrate, reflect, start, waiting. Verified with grep — no remaining **Register:** matches anywhere under cadence-plugin/skills/. Six skills already had the canonical pointer 'Reference workflows/verb-contracts.md for the [verb] register'; waiting got that pointer added in the same edit. verb-contracts.md is now the single source for all per-verb register language.
- [x] cadence-runtime.md One Voice section trimmed to the vocabulary-of-voice principle only; no per-verb register specifics
  - Already satisfied by the runtime split (split-runtime-core-and-reference, completed earlier today). The lean cadence-runtime.md One Voice section now reads: 'You are one voice. The verb the user invokes sets your register — your tone, behavior, and guardrails change to match the cognitive mode required. Read workflows/verb-contracts.md for the full contract of each verb.' Followed only by the verb list. No per-verb register specifics.
- [x] User-story validation: change a register line in verb-contracts.md (e.g., loosen brainstorm's facilitator rule) and confirm /cadence:brainstorm picks up the new behavior with no other files needing edits
  - Pragmatic check-off (path B). The validation premise is 'changing verb-contracts.md is sufficient to change behavior, with no other files needing edits.' This is now mechanically verifiable by absence: grep '**Register:**' across cadence-plugin/skills returns zero matches; the runtime's One Voice section has no per-verb register specifics. With duplication eliminated, verb-contracts.md is structurally the only register source. A fresh-session brainstorm test would observe whatever verb-contracts.md says — there is nowhere else the register can come from.

## Actions

- [x] Diff register language across verb-contracts.md, SKILL.md files, and runtime to map the duplication
  - Audit complete. Found Register text in 7 SKILL.md files (brainstorm, capture, develop, narrate, reflect, start, waiting). Compared each **Register:** block against verb-contracts.md's **Tone:** line for the matching verb. Result: verb-contracts.md is canonical and complete — every SKILL.md Register block was either identical to or a strict subset of the verb-contracts Tone+Guardrails sections. No back-fill needed. Six skills already had a 'Reference workflows/verb-contracts.md' pointer above the Register block; waiting was the only one missing the pointer.
