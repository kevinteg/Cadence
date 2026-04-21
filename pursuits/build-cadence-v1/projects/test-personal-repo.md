---
id: test-personal-repo
pursuit: build-cadence-v1
status: on_hold
created: 2026-04-17
---

# Test Personal Repo

## Definition of Done
- [ ] Separate repo created for personal Cadence data
- [ ] Cadence plugin installed and working in the personal repo
- [ ] Personal pursuits migrated from any scratch notes
- [ ] Nexthop onboarding pursuit created with initial projects
- [ ] Core commands (/start, /pause, /complete, /status) work via plugin
- [ ] This repo (cadence) retains its own pursuit data as test fixtures

## Actions
- [ ] Create personal repo with Cadence directory structure (pursuits/, thoughts/, reflections/)
- [ ] Install cadence plugin in the personal repo
- [ ] Write a thin CLAUDE.md that imports runtime from plugin
- [ ] Create "Establish AI Test Framework at Nexthop" pursuit
- [ ] Create "Be a Present Father" pursuit
- [ ] Verify /start, /pause, /complete, /status work via plugin
- [ ] Verify /reflect works end-to-end in the personal repo

## Notes
On hold until package-as-plugin is complete. The personal repo installs
the Cadence plugin rather than copying commands — this validates the
plugin distribution model with real usage.

Bootstrap will happen out of band — this project focuses on verifying
that Cadence works correctly in a separate repo via the plugin.
