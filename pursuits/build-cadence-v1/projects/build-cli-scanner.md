---
id: build-cli-scanner
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Build CLI Scanner

Extract the read-side of skill scanning into a deterministic TypeScript library + CLI. Replaces ad-hoc agent globbing/parsing with a single typed Snapshot + Report. Independently usable during AI outage.

## Definition of Done

- [x] TypeScript package at repo root: package.json, tsconfig.json, strict ESM, NodeNext modules
- [x] Parse layer: frontmatter (gray-matter + js-yaml CORE schema to preserve date strings), checklist, sections
- [x] Types layer: zod schemas for every entity (pursuit, project, idea, marker, capture, reflection, config) with inferred TS types
- [x] Config loader applies defaults; dormant_days knob promoted to cadence.yaml (was hardcoded at 14d)
- [x] Scan layer: per-entity modules + repo orchestrator that composes cross-references (e.g., Project.mostRecentMarker)
- [x] Report layer: applies thresholds → flags for overdue waiting_for, dormant projects, stale markers, structural issues, WIP over limit
- [x] CLI subcommands: scan, report, status, flags, pursuits, pursuit, project, ideas, markers, captures
- [x] Human-readable output by default; --json for skill consumption
- [x] Repo-root auto-detection from cwd; --root override
- [x] esbuild bundle to cadence-plugin/bin/cadence.js (single file, no node_modules runtime dependency)
- [x] Unit tests with node --test (24 tests: parse, scan synthetic, scan against live repo, report flags)
- [x] $CADENCE_BIN env var convention documented in plugin README

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
