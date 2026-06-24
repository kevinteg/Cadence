---
id: auggie-transpiler-core
pursuit: run-cadence-on-auggie
status: done
created: 2026-06-24
---

# Auggie transpiler core (cadence build-auggie)

## Intent

Stand up the transpiler skeleton: a new CAC subcommand 'cadence build-auggie' in src/cli.ts plus a src/auggie/ module (transform.ts walk, manifest.ts, overrides.ts loader). It reads cadence-plugin/ as read-only source and writes a committed auggie-plugin/ output tree (.augment-plugin/ manifest, .augment/commands, .augment/agents, .augment/rules, .augment/settings.json). This project owns the framework and output layout; the per-artifact transforms land in sibling projects. Done means: the command exists, scaffolds the full output directory structure, and emits the .augment-plugin manifest derived from .claude-plugin/plugin.json.

## Actions

- [x] Add the build-auggie CAC command stub in src/cli.ts and create src/auggie/transform.ts that scaffolds the auggie-plugin/ output dir
- [x] Implement manifest.ts: emit the .augment-plugin/ manifest from .claude-plugin/plugin.json (name/version/author/homepage)
- [x] Implement overrides.ts loader + a stub src/auggie/overrides.yaml that later projects populate
