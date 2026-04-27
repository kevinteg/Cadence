---
id: rewrite-skills-with-cli
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Rewrite Skills with CLI

Delegate read-side scanning from skill prose to the bundled CLI. Skills keep voice, register, and writes; CLI handles deterministic state lookup. Each rewrite drops error-prone scan-and-count prose and replaces it with a concrete `node "$CADENCE_BIN" <subcommand> --json` invocation the agent reasons over.

## Definition of Done

- [x] /reconcile delegates to cadence flags
- [x] /status dashboard uses cadence status; drill-down (pursuits, pursuit, project) uses corresponding subcommands; skill keeps fuzzy-match and number-shortcut tracking
- [x] /develop no-arg lists undeveloped seeds via cadence ideas --state seed --json
- [x] /close unresolved-Ideas check (both pursuit absolute-block and project override-with-reason) uses cadence ideas --parent X --state seed,developed --json
- [x] /complete action lookup and upward-completion checks use cadence project <id> --json and cadence pursuit <id> --json
- [x] /start curated entry pulls one cadence report --json payload for LP, last marker, captures count, flag count, project listing
- [x] /reflect Get Clear data gathering uses cadence report --json; idea-specific checks use cadence ideas --json
- [x] /narrate time-windowed scans use cadence markers --since and cadence ideas --since
- [x] cadence-runtime.md adds canonical Bundled CLI section establishing $CADENCE_BIN convention; skills assume it
- [x] Each rewritten skill keeps a fallback note for when the bin is unavailable

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
