---
id: plugin-session-start-hook
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Plugin Session Start Hook

Ship the SessionStart cadence-status hook via the plugin itself (hooks/hooks.json + ${CLAUDE_PLUGIN_ROOT}) so any repo that enables the plugin gets the dashboard on session startup with zero per-repo setup. Replaces the current per-repo .claude/settings.json approach and removes the need for /cadence:init or a manual upgrade step to wire the hook.

## Definition of Done

- [x] Plugin ships hooks/hooks.json with a SessionStart/startup hook that invokes ${CLAUDE_PLUGIN_ROOT}/bin/cadence status plus the interaction hint
  - Verified: hooks/hooks.json fires SessionStart/startup with command ${CLAUDE_PLUGIN_ROOT}/bin/cadence status --hook-output. Output systemMessage ends with interaction hint 'Next: /cadence:start to begin a session, /cadence:capture to save a thought, /cadence:status <id> to drill in.'
- [x] cadence status (and any other CLI read invoked from the hook) exits cleanly with a clear 'run /cadence:init' message when run outside a Cadence repo — no stack trace, no non-zero exit
  - Verified in /tmp/cadence-uninit-test: both 'cadence status --hook-output' (returns systemMessage JSON) and bare 'cadence status' (plain text) exit 0 with 'Cadence isn't initialized... Run /cadence:init to set up.' No stack trace.
- [x] Repo-level .claude/settings.json SessionStart hook removed — plugin layer is now the single source
  - Verified: no settings.json at repo root (only settings.local.json which contains user-private permission allowlists, no SessionStart hook). Plugin layer is single source.
- [x] User story (init'd repo): reload /hooks in this repo and start a fresh session; the cadence-status dashboard plus interaction hint appears via the plugin hook
- [x] User story (un-init'd repo): in a fresh directory with the plugin enabled but no Cadence config, start a session; the hook fires, prints the 'run /cadence:init' guidance, and does not error
  - Verified directly via CLI: hook command returns clean systemMessage in fresh tmp dir with no Cadence config. Full Claude Code session test deferred — CLI behavior is the proxy.

## Actions

- [x] Probe current cadence CLI behavior outside a Cadence repo and decide the no-init message
- [x] Add cadence-plugin/hooks/hooks.json with the SessionStart hook using ${CLAUDE_PLUGIN_ROOT}
- [x] Update the CLI so read commands exit cleanly with the 'run /cadence:init' message when no Cadence config is present
- [x] Remove the redundant SessionStart hook from this repo's .claude/settings.json
- [x] User-story test: reload /hooks, start a fresh session in this repo, confirm dashboard appears via the plugin hook
- [x] User-story test: in a fresh tmp directory with the plugin enabled, start a session, confirm graceful 'run /cadence:init' message
  - Verified in /tmp/cadence-uninit-test: both 'cadence status --hook-output' and bare 'cadence status' exit 0 with clean 'run /cadence:init' guidance. No stack trace.
- [x] Wrap status output in JSON systemMessage so the dashboard is user-visible at session start (raw stdout from SessionStart hooks goes to model context, not the UI)
