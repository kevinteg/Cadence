# Cadence

This repository runs Cadence — a cognitive operating system that manages
attention, protects flow state, separates the modes of thought, and
generates narrative across pursuits.

The always-on runtime lives in `.augment/rules/cadence-runtime.md` and is
loaded automatically. On-demand reference content:

- `cadence-reference.md` — file formats, full CLI catalog, lifecycle mechanics.
- `workflows/verb-contracts.md` — per-verb tone + behavior + guardrails.
- `workflows/coaching-strings.md` — canonical wording for ambient surfaces.

Commands are exposed as `/cadence-<verb>` slash commands under
`.augment/commands/`. The deterministic `cadence` CLI ships at `bin/cadence`.
