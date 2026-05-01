---
id: add-cli-write-surface
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Add CLI Write Surface

Extend the deterministic CLI from read-only to read+write. Skills and the project-creation runtime convention now delegate file mutations (markers, captures, reflections, status changes, idea state transitions, pursuit moves, project/idea creation) to the CLI in place of direct Edit/Write.

## Actions

- [x] Add yaml + frontmatter helpers and checklist toggling utilities
- [x] Implement entity creators (pursuit, project, idea, marker, capture, reflection)
- [x] Implement frontmatter editors (status, idea-state, check, add-item, waiting-for, move)
- [x] Wire write subcommands into the cac CLI
- [x] Write 16 unit tests covering round-trip, error paths, edge cases
- [x] Update 10 skills + project-creation runtime convention to use the write CLI
- [x] Update plugin README with write subcommand examples
- [x] Rebundle and run journeys; debug undefined-DoD bug from cac type:[String] sentinel
- [x] Fix marker empty-section rendering and add regression tests
- [x] Add --created flag and --dod-checked / --action-checked flags for retroactive imports
- [x] Recreate three retroactive projects via the new CLI to validate the path
