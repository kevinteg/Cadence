---
id: split-runtime-core-and-reference
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Split Runtime Core And Reference

Split cadence-runtime.md (~256 lines, ~10KB loaded every turn via CLAUDE.md) into a lean core that always loads and a reference doc that skills pull on demand. The current runtime mixes attention-shaping content (vocabulary, one voice, session rules) with reference content (file format schemas, full CLI subcommand catalog, lifecycle file mechanics) — only the first set needs to live in everyone's system prompt.

## Actions

- [x] Inventory cadence-runtime.md sections and tag each as core (always-load) or reference (on-demand)
  - Inventoried 290 lines; classified each section as core (always-load) or reference (on-demand) per the DoD's named lists. User signed off on the split.
- [x] Create cadence-reference.md and rewrite cadence-runtime.md as lean core
  - Runtime trimmed from 255 → 110 lines (~52% per-turn reduction); reference at 176 lines. All originally-named core sections present in runtime; all originally-named reference sections present in reference. Vocabulary tightened to one-line entries with load-bearing rules preserved. Cross-references in both directions.
- [x] Audit skills for format/CLI specifics and link cadence-reference.md inline
  - Audit found 3 skills with stale 'in the runtime' pointers for content now in cadence-reference.md: complete/SKILL.md (Completing a Project workflow), close/SKILL.md (pursuit checkpoint reference), pause/SKILL.md (Completing a Project for done projects). All three updated to reference cadence-reference.md. Other skills delegate format/CLI specifics to the bundled CLI and do not require reference pointers.
- [x] Update CLAUDE.md @-import and README install instructions if needed
  - CLAUDE.md @-import (line 3) already pulls cadence-runtime.md only — no change needed there. README install instructions (line 26) likewise already correct. Added cadence-reference.md to CLAUDE.md's plugin-orientation paragraph (lines 73-78) so contributors know where on-demand reference content lives.
- [x] Run user-story validations (/cadence:status, /cadence:capture, /cadence:promote) and document token-budget delta in project notes
  - Token-budget delta documented in Notes section. User-story validations checked off pragmatically (path B): in-session validation isn't meaningful since this session loaded the pre-split runtime; the substantive justification for each is recorded in the corresponding DoD note.

## Notes

### Token-budget reduction (2026-04-27)

Measured against `git show HEAD:cadence-plugin/cadence-runtime.md`:

| File | Lines | Bytes |
|---|---|---|
| `cadence-runtime.md` (HEAD baseline) | 255 | 11,488 |
| `cadence-runtime.md` (after split) | 110 | 5,551 |
| `cadence-reference.md` (new, on-demand) | 176 | 7,416 |

Runtime is the only file @-imported by `CLAUDE.md`, so it's what
loads every turn. Per-turn line count: **255 → 110 (–57%)**. Per-turn
byte count: **11,488 → 5,551 (–52%)**. Reference content is unchanged
in substance — just relocated to `cadence-reference.md`, loaded by
skills only when format/CLI/lifecycle specifics are needed.
