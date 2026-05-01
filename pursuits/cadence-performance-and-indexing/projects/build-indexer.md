---
id: build-indexer
pursuit: cadence-performance-and-indexing
status: on_hold
created: 2026-04-17
---

# Build Indexer

## Intent

Markdown is the source of truth, but cross-cutting queries (active
projects across pursuits, aging seeds, flags, dormant projects)
require scanning many files. A SQLite index — derived from markdown,
gitignored — would make queries fast and the reconciler cheap.
Per-pursuit and repo-root `_manifest.md` files would also give humans
a quick navigable summary without running the CLI.

Done when an indexer rebuilds reliably from markdown, manifests stay
in sync, and slash commands use the index where it materially helps.

**Open question worth front-loading:** whether the index is even
needed yet. The deterministic CLI shipped last week handles the
current query load fine — `cadence scan/report/status/flags` already
return in well under a second. First action is a profiling pass; if
no slowness shows up, this project may defer until performance
actually hurts. Don't build until we know what queries matter.

## Actions

- [ ] Profile current slash-command performance — identify any commands too slow as pure file-scanning
- [ ] Decide: ship the indexer now, or defer until profiling shows it's needed (capture decision in Notes)
- [ ] (if shipping) Design SQLite schema based on actual query needs
- [ ] (if shipping) Implement indexer in TypeScript with rebuild-from-markdown — `cadence rebuild-index`
- [ ] (if shipping) Implement manifest generator (per-pursuit + repo-root `_manifest.md`)
- [ ] (if shipping) Verify rebuild completes in under 1 second on this repo
- [ ] (if shipping) Update slash commands and CLAUDE.md to reference index/CLI where it helps
- [ ] User-story validation: pick the slowest command identified in step 1, measure before/after, confirm meaningful speedup

## Notes

The indexer should be a TypeScript CLI — `cadence rebuild-index` or
similar. SQLite (`.cadence.db`) and `_manifest.md` files are
gitignored. This project was created 2026-04-17 before the
deterministic CLI shipped; revisit the premise (does the index still
buy us anything?) before committing to the implementation.
