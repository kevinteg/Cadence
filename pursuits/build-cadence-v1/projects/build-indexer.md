---
id: build-indexer
pursuit: build-cadence-v1
status: on_hold
created: 2026-04-17
---

# Build Indexer

## Definition of Done
- [ ] CLI command rebuilds SQLite index from markdown files
- [ ] CLI command generates _manifest.md at repo root and per-pursuit
- [ ] Index rebuild completes in under 1 second for typical repo size
- [ ] Slash commands updated to use CLI where it improves performance

## Actions
- [ ] Identify which slash commands are too slow as pure agent skills
- [ ] Design SQLite schema based on actual query needs
- [ ] Implement indexer in TypeScript
- [ ] Implement manifest generator
- [ ] Update CLAUDE.md to reference CLI commands

## Notes
On hold until the pure skills approach (implement-agent-skills) reveals
which operations need extraction to CLI tooling. Don't build the indexer
until we know what queries actually matter in practice.

The indexer should be a TypeScript CLI — `npx cadence rebuild-index` or
similar. SQLite and _manifest.md files are gitignored.
