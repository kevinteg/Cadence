---
id: wip-guardrails
pursuit: build-cadence-v1
status: done
created: 2026-04-20
---

# WIP Guardrails

## Definition of Done
- [x] /status warns when active projects > `max_active_projects`
- [x] Project creation (CLAUDE.md convention) checks WIP limits before creating, warns if over
- [x] Pursuit activation (someday → active) checks project count, warns if over
- [x] /reflect Get Focused WIP check suggests specific projects to pause/drop when overextended
- [x] Thresholds configurable in cadence.yaml under `wip_limits` (default: `max_active_projects: 10`)
- [x] Warnings are firm but not blocking (user can override)

## Actions
- [x] Add `wip_limits` section to cadence.yaml with `max_active_projects: 10`
- [x] Update /status to check WIP limits and display warning in Flags section
- [x] Update CLAUDE.md "Creating a Project" convention to include WIP check
- [x] Add pursuit activation WIP check convention to CLAUDE.md
- [x] Update /reflect Get Focused WIP check to suggest specific projects to pause when over limit
- [x] Test by temporarily lowering thresholds to trigger warnings

## Notes
Prevents the system from degrading over time by actively resisting
overcommitment rather than just reporting counts. The vision calls for
"active pushback when overextended" — currently /status shows numbers
but doesn't warn or push back.

**WIP counting:** Only count "started" projects against the limit — projects
that have at least one marker or session. Projects that have been created
but never worked on are backlog, not active attention. The WIP limit
measures cognitive load, not planning ambition. There is no pursuit-level
limit (pursuits are uncapped); the constraint is on active projects.

Warning language should be firm but not blocking. Example:
"You have 12 active projects (limit: 10). Consider pausing or completing
some before adding more. Which project has the least momentum right now?"

> **v3 note:** Original design had `max_pursuits: 6` and `max_projects: 10`.
> v3 removed the pursuit limit (pursuits are uncapped) and renamed
> `max_projects` to `max_active_projects` to clarify it counts started
> projects, not all projects.
