---
id: hooks-and-cli-bridge
pursuit: run-cadence-on-auggie
status: done
created: 2026-06-24
---

# Hooks + CLI bridge (settings.json, PATH)

## Intent

Translate hooks/hooks.json into the .augment/settings.json hooks block. Collapse the SessionStart startup|resume|clear matchers into a single SessionStart entry (Auggie injects SessionStart stdout as context, same semantics as Claude Code's --hook-output). Resolve the binary-path question: Claude Code expands ${CLAUDE_PLUGIN_ROOT} and puts plugin bin/ on PATH; determine Auggie's equivalent. Prefer relying on PATH ('cadence status --hook-output'); fall back to an Auggie plugin-root variable or absolute/relative path if Auggie does not put plugin bin/ on PATH. Done means: a fresh Auggie session fires SessionStart and surfaces the Cadence status dashboard.

## Actions

- [x] Spike whether Auggie puts plugin bin/ on PATH and what plugin-root variable (if any) it exposes; choose the path strategy
- [x] Emit .augment/settings.json with the SessionStart hook and confirm the status surface is injected as context
