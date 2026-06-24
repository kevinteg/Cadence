---
id: dual-runtime-docs
pursuit: run-cadence-on-auggie
status: done
created: 2026-06-24
---

# Dual-runtime docs + distribution

## Intent

Tell the dual-runtime story so users and contributors know Cadence runs on both Claude Code and Auggie. Add a 'Running on Auggie' section to README and DEVELOPING (the transpiler, the generated auggie-plugin/, the source-of-truth rule that you never hand-edit auggie-plugin/), an Auggie install path in docs/getting-started.md, and an mkdocs entry. Done means: a new user can install Cadence on Auggie from the docs, and a contributor understands that cadence-plugin/ is authoritative and auggie-plugin/ is generated.

## Actions

- [x] Add a Running on Auggie section to README and DEVELOPING (transpiler + never-hand-edit-generated rule)
- [x] Add Auggie install steps to docs/getting-started.md and an mkdocs nav entry
