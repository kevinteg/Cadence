---
id: plugin-session-start-hook
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Plugin Session Start Hook

Ship the SessionStart cadence-status hook via the plugin itself (hooks/hooks.json + ${CLAUDE_PLUGIN_ROOT}) so any repo that enables the plugin gets the dashboard on session startup with zero per-repo setup. Replaces the current per-repo .claude/settings.json approach and removes the need for /cadence:init or a manual upgrade step to wire the hook.

## Actions

- [x] Probe current cadence CLI behavior outside a Cadence repo and decide the no-init message
- [x] Add cadence-plugin/hooks/hooks.json with the SessionStart hook using ${CLAUDE_PLUGIN_ROOT}
- [x] Update the CLI so read commands exit cleanly with the 'run /cadence:init' message when no Cadence config is present
- [x] Remove the redundant SessionStart hook from this repo's .claude/settings.json
- [x] User-story test: reload /hooks, start a fresh session in this repo, confirm dashboard appears via the plugin hook
- [x] User-story test: in a fresh tmp directory with the plugin enabled, start a session, confirm graceful 'run /cadence:init' message
  - Verified in /tmp/cadence-uninit-test: both 'cadence status --hook-output' and bare 'cadence status' exit 0 with clean 'run /cadence:init' guidance. No stack trace.
- [x] Wrap status output in JSON systemMessage so the dashboard is user-visible at session start (raw stdout from SessionStart hooks goes to model context, not the UI)
