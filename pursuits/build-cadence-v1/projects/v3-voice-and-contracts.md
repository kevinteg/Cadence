---
id: v3-voice-and-contracts
pursuit: build-cadence-v1
status: done
created: 2026-04-21
---

# v3 Voice Collapse and Verb Contracts

## Definition of Done
- [x] Agent Modes section removed from cadence-runtime.md, replaced with one-voice description
- [x] `workflows/verb-contracts.md` defines register for each verb: brainstorm, develop, do, narrate, reflect, capture
- [x] Each contract specifies tone, tool access, guardrails, and explicit examples of what the voice says vs. doesn't say
- [x] Session documented as internal cross-cutting concept in runtime (not user-facing vocabulary)
- [x] Select documented as internal pattern embedded in verb no-argument paths
- [x] Hard guardrails encoded: no streaks/scores/badges, no "why did you fail?", no evaluative praise, no mid-flow interrupts, no LLM-generated Ideas in brainstorm
- [x] cadence.yaml updated: max_pursuits removed, max_projects renamed to max_active_projects with default 5
- [x] All `[Steward]`/`[Guide]`/`[Reflect]` labels removed from output templates in existing skills
- [x] Plugin cadence-runtime.md and cadence.yaml updated to match

## Actions
- [x] Write `workflows/verb-contracts.md` with all six verb contracts
- [x] Rewrite cadence-runtime.md: remove Agent Modes, add one-voice section, add session-as-internal section, add guardrails section
- [x] Update cadence.yaml: remove max_pursuits, rename max_projects to max_active_projects
- [x] Update all plugin SKILL.md files to remove mode references and reference verb-contracts.md
- [x] Update plugin cadence-runtime.md and cadence.yaml
- [x] Copy updated workflows/verb-contracts.md to plugin

## Notes
This is the foundation — every subsequent project depends on the voice
contracts being defined. The implementation may internally keep separation
for testability, but the user-facing surface is one voice whose register
is set by the active verb.

Session still exists as the unit that wraps a verb invocation and ties it
to Markers/Thoughts/Narratives. The user never types "session." Select
logic (curated entry, marker resume) is embedded in each verb's no-argument
path — it's an internal pattern, not a command.
