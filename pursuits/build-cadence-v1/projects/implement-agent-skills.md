---
id: implement-agent-skills
pursuit: build-cadence-v1
status: done
created: 2026-04-17
---

# Implement Agent Skills

## Definition of Done
- [x] CLAUDE.md teaches agent the full Cadence vocabulary and conventions
- [x] /recap shows curated session entry with pursuit/project status
- [x] /mark writes a well-structured session marker
- [x] /reflect walks through the full Get Clear + Get Focused ritual
- [x] /thought captures and triages a raw idea
- [x] /status shows a system health dashboard
- [x] Agent naturally prompts for markers on session exit
- [x] All commands work against real seed data in this repo

## Actions
- [x] Draft CLAUDE.md with vocabulary, modes, and conventions
- [x] Draft /recap command
- [x] Draft /mark command
- [x] Draft /reflect command
- [x] Draft /thought command
- [x] Draft /status command
- [x] Test /recap against seed data — does the output make sense?
- [x] Test /mark — write a real marker for this session
- [x] Test /thought — capture a test thought and verify triage
- [x] Test /status — verify dashboard output
- [x] Iterate on command prompts based on testing
- [x] Test /reflect — run a mock Reflect ritual

## Notes
Starting with pure skills (agent reads/writes markdown directly). No CLI
or MCP needed yet. The commands ARE the implementation for Phase 1.

If a command is too slow or error-prone as pure agent instructions, that's
the signal to extract it into CLI tooling (the build-indexer project).
