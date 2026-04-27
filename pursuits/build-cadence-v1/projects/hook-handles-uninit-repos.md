---
id: hook-handles-uninit-repos
pursuit: build-cadence-v1
status: on_hold
created: 2026-04-27
---

# Hook Handles Uninit Repos

The SessionStart hook runs cadence status --hook-output on every Claude Code startup, including in fresh repos with no cadence.yaml. First-time users get a confusing empty/garbage dashboard before they even know /cadence:init exists. Detect uninitialized repos in the CLI and emit a single bootstrap nudge instead.

## Definition of Done

- [ ] cadence status --hook-output detects missing cadence.yaml and prints exactly one line: 'Cadence not initialized in this repo. Run /cadence:init to bootstrap.'
- [ ] Initialized repos see no behavior change (same dashboard as today)
- [ ] The detection is also useful outside the hook: cadence status (without --hook-output) gives the same nudge in uninit repos so the standalone CLI degrades gracefully
- [ ] User-story validation: cd to /tmp/empty-test-dir, start Claude Code with --plugin-dir pointing at this plugin, confirm SessionStart hook output is the single bootstrap line
- [ ] User-story validation: cd back to this repo, start Claude Code, confirm the full status dashboard appears as today

## Actions

- [ ] Add an isInitialized() check to the status command in src/cli.ts
