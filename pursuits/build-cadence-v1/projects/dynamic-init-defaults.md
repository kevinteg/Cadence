---
id: dynamic-init-defaults
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Dynamic Init Defaults

Make /cadence:init compute its win_cycle and mid_check defaults from the current date instead of the hardcoded 2026-H1 / 2026-01-01..2026-06-30 / 2026-04-01 values in skills/init/SKILL.md. The current template will silently expire and ship a wrong cycle to anyone running init in late 2026 or beyond.

## Actions

- [x] Update skills/init/SKILL.md step 4 to compute dates from today
  - Step 4 rewritten to compute win_cycles from today's date. Logic: year + month → H1/H2; start/end/mid_check derived. Past-mid_check branch surfaces and offers the next half (H2 → next year's H1 rollover). Hardcoded 2026-H1 example removed; YAML now shows <YYYY-Hn> placeholders with comments documenting the format.
