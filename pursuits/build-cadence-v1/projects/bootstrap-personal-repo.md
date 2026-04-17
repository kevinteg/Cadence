---
id: bootstrap-personal-repo
pursuit: build-cadence-v1
status: on_hold
created: 2026-04-17
---

# Bootstrap Personal Repo

## Definition of Done
- [ ] Separate repo created for personal Cadence data
- [ ] Personal pursuits migrated from any scratch notes
- [ ] Nexthop onboarding pursuit created with initial projects
- [ ] Slash commands and CLAUDE.md work in the personal repo
- [ ] This repo (cadence) retains its own pursuit data as test fixtures

## Actions
- [ ] Decide how personal repo references cadence tooling
- [ ] Create personal repo with same directory structure
- [ ] Create "Establish AI Test Framework at Nexthop" pursuit
- [ ] Create "Be a Present Father" pursuit
- [ ] Verify /recap works in the new repo

## Notes
On hold until implement-agent-skills is validated. The personal repo
should be a clean clone of the directory structure with its own CLAUDE.md
that references the cadence repo's conventions.

Key question to resolve: does the personal repo copy the slash commands
and CLAUDE.md, or does it reference them from the cadence repo? Copying
is simpler but creates drift. Referencing requires a mechanism (symlinks,
git submodule, or npm package).
