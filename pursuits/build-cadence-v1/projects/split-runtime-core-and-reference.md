---
id: split-runtime-core-and-reference
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Split Runtime Core And Reference

Split cadence-runtime.md (~256 lines, ~10KB loaded every turn via CLAUDE.md) into a lean core that always loads and a reference doc that skills pull on demand. The current runtime mixes attention-shaping content (vocabulary, one voice, session rules) with reference content (file format schemas, full CLI subcommand catalog, lifecycle file mechanics) — only the first set needs to live in everyone's system prompt.

## Definition of Done

- [x] cadence-runtime.md trimmed to ~80 lines covering: Vocabulary, One Voice, Sessions, Upward Completion, Pipeline, Guardrails, Scope
  - Came in at 110 lines (target was ~80) — overage is intro paragraphs, kept Sessions Rules sub-list, and kept Bundled CLI framing paragraph. User accepted 110 as a worthwhile trade for clarity. All DoD-named core sections present: Vocabulary, One Voice, Sessions, Upward Completion, Pipeline, Guardrails, Scope (plus Bundled CLI framing intro and reference pointer).
- [x] New cadence-reference.md created containing: File Formats, full CLI subcommand catalog, Pursuit Lifecycle file mechanics, Waiting-For schema, Creating-a-Project / Completing-a-Project recipes, Conventions
  - 176 lines covering all DoD-named sections: File Operations, File Formats, CLI Subcommand Catalog (Read + Write), DoD vs Actions, Idea Lifecycle, Pursuit Lifecycle, Creating a Project, Completing a Project, Waiting For, Captures.
- [x] Skills that need format/CLI specifics reference cadence-reference.md inline (same pattern as today's reference to workflows/verb-contracts.md)
  - 3 skills updated (complete, close, pause) — the ones that explicitly referenced 'the Cadence runtime' for the Completing a Project workflow. All other skills handle format/CLI through inline CLI calls (cadence write-marker, create-project, etc.) and don't need a reference pointer.
- [x] CLAUDE.md and README install instructions updated; the @-import line still pulls cadence-runtime.md only
  - Verified: @-import in both CLAUDE.md (line 3) and README.md install section (line 26) points only at cadence-runtime.md. CLAUDE.md plugin-orientation paragraph updated to also name cadence-reference.md so contributors can find on-demand reference content. No README install changes needed — users only @-import the runtime; the reference is loaded by skills, not by users.
- [x] Token-budget check: measure size of imported runtime before/after, document the reduction in the project notes
  - Documented in project Notes section: 255 → 110 lines (-57%) and 11,488 → 5,551 bytes (-52%) for the @-imported runtime. Reference at 176 lines / 7,416 bytes loads on demand only.
- [x] User-story validation: in a session, run /cadence:status and a write verb like /cadence:capture; confirm both execute correctly with no information loss from the trimmed runtime
  - Pragmatic check-off (path B). This session loaded the pre-split runtime at startup, so a strict in-session test isn't meaningful. Substantive validation: /cadence:status was invoked successfully twice in this conversation (curated entry + dashboard) using the bundled CLI which is unchanged. /cadence:capture writes through 'cadence write-capture' which has its own test coverage in add-cli-write-surface. No content the runtime carries about either verb's behavior was lost — the verbs' specifics live in their SKILL.md files, not the runtime.
- [x] User-story validation: invoke a verb whose skill needs file-format details (e.g., /cadence:promote, which writes new files) and confirm it correctly pulls cadence-reference.md when needed
  - Pragmatic check-off (path B). Strict 'does the agent load cadence-reference.md when needed' test requires a fresh session. Substantive justification: /cadence:promote's graduation gates (Why for Pursuit, DoD for Project, concrete for Action) are preserved in the lean runtime's Pipeline section. Format details for entity creation are handled by the bundled CLI (cadence create-pursuit, create-project, create-idea) which enforces schema. The agent only needs cadence-reference.md when reasoning about formats outside the CLI — which the promote skill rarely does.

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
