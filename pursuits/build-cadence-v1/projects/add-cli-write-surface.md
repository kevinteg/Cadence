---
id: add-cli-write-surface
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Add CLI Write Surface

Extend the deterministic CLI from read-only to read+write. Skills and the project-creation runtime convention now delegate file mutations (markers, captures, reflections, status changes, idea state transitions, pursuit moves, project/idea creation) to the CLI in place of direct Edit/Write.

## Definition of Done

- [x] Write helpers: yaml serializer (CORE schema, stable order), frontmatter mutator that preserves body, checklist line editor that toggles or appends - [ ] / - [x] within named sections
- [x] Entity creators: create-pursuit, create-project, create-idea, write-marker, write-capture, write-reflection (upserts when file exists)
- [x] Frontmatter editors: set-status (with --reason for dropped), set-idea-state (developed stamps developed_at, promoted requires --promoted-to, closed requires --reason)
- [x] Body editors: check (toggle DoD/action by index or substring, append optional note), add-item (append to DoD or Actions)
- [x] Waiting-for editors: add-waiting-for, flag-waiting-for (by index or substring match)
- [x] Lifecycle moves: move-pursuit between active / someday / archived, updates frontmatter status
- [x] 13 new CLI subcommands wired with cac; --json result for every write
- [x] 16 unit tests covering happy path, error paths (missing reason for dropped/closed), empty-section handling, round-trip via scan
- [x] Bundle output 608 KB esbuild self-contained; passes from /tmp with no node_modules
- [x] Two cac quirks fixed: type:[String] sentinel of ["undefined"] and empty-string flag rendering as 0; covered by regression tests
- [x] create-project, create-pursuit, create-idea accept --created for back-dating; --dod-checked / --action-checked for retroactive imports
- [x] All 10 mutating skills updated: /pause, /capture, /complete, /cancel, /brainstorm, /develop, /promote, /close, /reflect, /init plus the runtime project-creation convention
- [x] cadence-runtime.md split into Read subcommands and Write subcommands sections
- [x] All 7 journeys pass end-to-end with the new write CLI

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
