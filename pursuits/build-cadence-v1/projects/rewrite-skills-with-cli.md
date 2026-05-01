---
id: rewrite-skills-with-cli
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Rewrite Skills with CLI

Delegate read-side scanning from skill prose to the bundled CLI. Skills keep voice, register, and writes; CLI handles deterministic state lookup. Each rewrite drops error-prone scan-and-count prose and replaces it with a concrete `node "$CADENCE_BIN" <subcommand> --json` invocation the agent reasons over.

## Actions

- [x] Read all 14 skills; classify by CLI value (read-heavy vs. write-heavy)
- [x] Add CLI subcommands needed for the rewrites (drill-down + ideas + markers + captures)
- [x] Rewrite /reconcile (smallest, validates pattern)
- [x] Rewrite /status (largest single win)
- [x] Rewrite /develop
- [x] Rewrite /close
- [x] Rewrite /complete
- [x] Rewrite /start
- [x] Rewrite /reflect
- [x] Rewrite /narrate
- [x] Rebundle CLI; verify all rewritten skills resolve their CLI calls
