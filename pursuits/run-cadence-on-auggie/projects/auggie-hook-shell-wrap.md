---
id: auggie-hook-shell-wrap
pursuit: run-cadence-on-auggie
status: active
created: 2026-06-26
origin:
  kind: github_issue
  repo: kevinteg/Cadence
  number: 11
  url: https://github.com/kevinteg/Cadence/issues/11
---

# build-auggie: SessionStart hook fails (spawn NO_COLOR=1 ENOENT)

Triaged from issue #11: https://github.com/kevinteg/Cadence/issues/11

## Intent

The build-auggie transpiler emits a SessionStart hook in auggie-plugin/.augment/settings.json whose command carries inline env-prefix syntax: NO_COLOR=1 CADENCE_VERB_PREFIX=/cadence- cadence status. Auggie spawns hook commands directly via child_process.spawn (tokenized on whitespace, no shell), so the first token NO_COLOR=1 is treated as the executable and the hook fails every session start with spawn NO_COLOR=1 ENOENT. Non-blocking, but the dashboard never renders and the warning prints each session. Root cause: inline VAR=value cmd is shell syntax; Claude Code's hook runner evaluates via a shell, Auggie does not. Fix: shell-wrap the emitted hook command in src/auggie/ (the layer producing settings.json) so it runs as sh -c with the env prefix intact. Done looks like: a fresh build-auggie emits a shell-wrapped hook, the drift check stays clean, and the hook renders the dashboard under Auggie with no ENOENT.

## Actions

- [x] Shell-wrap the SessionStart hook command in the src/auggie settings.json emitter
  - src/auggie/transform.ts: added shellWrapHook(); hook now emits sh -c '...' so Auggie's no-shell spawn evaluates the env prefix. Single-quote escaped.
- [x] Rebuild auggie-plugin; confirm drift check clean and hook tokenizes correctly
  - Rebundled CLI + regenerated auggie-plugin; settings.json command = sh -c 'NO_COLOR=1 CADENCE_VERB_PREFIX=/cadence- cadence status'. Drift clean (42 files), suite 149/149.
