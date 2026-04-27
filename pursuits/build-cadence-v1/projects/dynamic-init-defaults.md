---
id: dynamic-init-defaults
pursuit: build-cadence-v1
status: on_hold
created: 2026-04-27
---

# Dynamic Init Defaults

Make /cadence:init compute its win_cycle and mid_check defaults from the current date instead of the hardcoded 2026-H1 / 2026-01-01..2026-06-30 / 2026-04-01 values in skills/init/SKILL.md. The current template will silently expire and ship a wrong cycle to anyone running init in late 2026 or beyond.

## Definition of Done

- [ ] skills/init/SKILL.md instructs the agent to compute win_cycle (e.g., 2026-H2) from today's date — Jan 1 or Jul 1 anchor depending on month
- [ ] Computed start, end (6 months later), and mid_check (3 months in) values get written into cadence.yaml
- [ ] If today is past the current cycle's mid_check, the init prompt acknowledges this and offers to start the next cycle instead
- [ ] Hardcoded 2026-H1 example removed from cadence.yaml template; replaced with placeholder syntax that documents the format
- [ ] User-story validation: in a fresh empty directory today, run /cadence:init and confirm cadence.yaml gets a 2026-H1 entry (since today is 2026-04-27, before mid_check 2026-04-01… actually after mid_check, so confirm the 'past mid_check' branch fires and offers H2)

## Actions

- [ ] Update skills/init/SKILL.md step 4 to compute dates from today
