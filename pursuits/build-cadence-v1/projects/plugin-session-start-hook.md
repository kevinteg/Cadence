---
id: plugin-session-start-hook
pursuit: build-cadence-v1
status: active
created: 2026-04-27
---

# Plugin Session Start Hook

Ship the SessionStart cadence-status hook via the plugin itself (hooks/hooks.json + ${CLAUDE_PLUGIN_ROOT}) so any repo that enables the plugin gets the dashboard on session startup with zero per-repo setup. Replaces the current per-repo .claude/settings.json approach and removes the need for /cadence:init or a manual upgrade step to wire the hook.

## Definition of Done

- [ ] Plugin ships hooks/hooks.json with a SessionStart/startup hook that invokes ${CLAUDE_PLUGIN_ROOT}/bin/cadence status plus the interaction hint
- [ ] cadence status (and any other CLI read invoked from the hook) exits cleanly with a clear 'run /cadence:init' message when run outside a Cadence repo — no stack trace, no non-zero exit
- [ ] Repo-level .claude/settings.json SessionStart hook removed — plugin layer is now the single source
- [ ] User story (init'd repo): reload /hooks in this repo and start a fresh session; the cadence-status dashboard plus interaction hint appears via the plugin hook
- [ ] User story (un-init'd repo): in a fresh directory with the plugin enabled but no Cadence config, start a session; the hook fires, prints the 'run /cadence:init' guidance, and does not error

## Actions

- [x] Probe current cadence CLI behavior outside a Cadence repo and decide the no-init message
- [x] Add cadence-plugin/hooks/hooks.json with the SessionStart hook using ${CLAUDE_PLUGIN_ROOT}
- [x] Update the CLI so read commands exit cleanly with the 'run /cadence:init' message when no Cadence config is present
- [x] Remove the redundant SessionStart hook from this repo's .claude/settings.json
- [ ] User-story test: reload /hooks, start a fresh session in this repo, confirm dashboard appears via the plugin hook
- [ ] User-story test: in a fresh tmp directory with the plugin enabled, start a session, confirm graceful 'run /cadence:init' message
