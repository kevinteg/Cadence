---
id: implement-execution-verbs
pursuit: build-cadence-v1
status: done
created: 2026-04-21
---

# Implement Execution Verbs (do, capture, mark)

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
Testing deferred — requires user interaction. Old commands removed,
new verbs in place.
