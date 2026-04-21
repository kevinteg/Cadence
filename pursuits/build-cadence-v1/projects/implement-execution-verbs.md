---
id: implement-execution-verbs
pursuit: build-cadence-v1
status: done
created: 2026-04-21
---

# Implement Execution Verbs (do, capture, mark)

## Definition of Done
- [x] `/do` skill: no arg → curated selection (LP, active projects with "next" from marker, quick wins, flags), with project → session on that project resuming from marker
- [x] Do is silent during flow, terse at breakpoints
- [x] Do auto-marks on session exit (no confirmation prompt)
- [x] `/capture` skill: flow-safe parking lot, single input, no agent response, typed by verb context (note/blocker during do, seed during brainstorm, concern during develop)
- [x] `/mark` skill: three fields — where, next, open. Recap on session entry leads with "next" verbatim
- [x] Existing 4 markers rewritten to new three-field format
- [x] `/select`, `/recap`, `/thought` removed from plugin (absorbed into do, session entry, capture)
- [x] `.claude/commands/` cleaned: remove all user-facing commands, keep only run-journey

## Actions
- [x] Create do SKILL.md with curated selection and flow protection
- [x] Create capture SKILL.md with flow-safe behavior and verb-context typing
- [x] Rewrite mark SKILL.md with three-field format (where, next, open)
- [x] Migrate 4 existing markers to new format (one-time rewrite)
- [x] Remove select, recap, thought skills from plugin
- [x] Remove user-facing commands from .claude/commands/ (keep run-journey)
- [x] Add do, capture skills to plugin
- [x] Update plugin mark skill
- [ ] Test do → work → mark → do cycle with marker resume

## Notes
Testing deferred — requires user interaction. The v2-to-v3 cutover is
complete: old commands removed, new verbs in place.
