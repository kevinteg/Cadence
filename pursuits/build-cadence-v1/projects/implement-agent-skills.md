---
id: implement-agent-skills
pursuit: build-cadence-v1
status: active
created: 2026-04-17
---

# Implement Agent Skills

## Definition of Done
- [ ] CLAUDE.md teaches agent the full Cadence vocabulary and conventions
- [ ] /recap shows curated session entry with pursuit/project status
- [ ] /mark writes a well-structured session marker
- [ ] /reflect walks through the full Get Clear + Get Focused ritual
- [ ] /thought captures and triages a raw idea
- [ ] /status shows a system health dashboard
- [ ] Agent naturally prompts for markers on session exit
- [ ] All commands work against real seed data in this repo

## Actions
- [x] Draft CLAUDE.md with vocabulary, modes, and conventions
- [x] Draft /recap command
- [x] Draft /mark command
- [x] Draft /reflect command
- [x] Draft /thought command
- [x] Draft /status command
- [ ] Test /recap against seed data — does the output make sense?
- [ ] Test /mark — write a real marker for this session
- [ ] Test /thought — capture a test thought and verify triage
- [ ] Test /status — verify dashboard output
- [ ] Iterate on command prompts based on testing
- [ ] Test /reflect — run a mock Reflect ritual

## Notes
Starting with pure skills (agent reads/writes markdown directly). No CLI
or MCP needed yet. The commands ARE the implementation for Phase 1.

If a command is too slow or error-prone as pure agent instructions, that's
the signal to extract it into CLI tooling (the build-indexer project).
