---
id: run-cadence-on-auggie
type: finite
status: active
created: 2026-06-24
why: When Claude Code credits run out, Cadence stops working. Auggie (Augment Code's terminal agent) is our first fallback runtime. Research shows Auggie mirrors Claude Code's plugin model almost field-for-field (commands, subagents, rules, settings.json hooks, .augment-plugin manifest, MCP), so we keep the Claude Code plugin as the single source of truth and generate the Auggie build via a transpiler kept honest by a CI drift check. The crown-jewel cadence CLI is platform-agnostic Node and ports unchanged; only the packaging and dispatch layer needs translation.
---

# Run Cadence on Auggie

Deliver and keep-in-sync an Auggie build of Cadence via a build-time transpiler (cadence build-auggie), so Cadence keeps running when Claude Code is unavailable.
