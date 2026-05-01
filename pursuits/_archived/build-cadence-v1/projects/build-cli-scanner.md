---
id: build-cli-scanner
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Build CLI Scanner

Extract the read-side of skill scanning into a deterministic TypeScript library + CLI. Replaces ad-hoc agent globbing/parsing with a single typed Snapshot + Report. Independently usable during AI outage.

## Actions

- [x] Bootstrap TS package and install deps
- [x] Define types and zod schemas
- [x] Implement parse layer with unit tests
- [x] Implement config loader; promote dormant_days to cadence.yaml
- [x] Implement per-entity scan modules
- [x] Implement repo orchestrator with cross-references
- [x] Implement reconciler report layer
- [x] Implement CLI with cac; add status/flags/scan/report
- [x] Add drill-down subcommands (pursuits, pursuit, project)
- [x] Add ideas, markers, captures subcommands
- [x] Add esbuild bundle script with createRequire shim for CJS deps
- [x] Verify bundle runs from a clean shell with no node_modules
- [x] Document Bundled CLI convention in cadence-runtime.md
