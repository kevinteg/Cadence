---
id: reduce-install-friction
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Reduce Install Friction

README installation tells users to run 'claude --plugin-dir /path/to/cadence-plugin' but provides no actual path — outsiders have to clone first and figure out absolute paths themselves. Make first-run friction near zero so the plugin can be evaluated by someone who's never seen the repo.

## Actions

- [x] Walk through the README install steps from /tmp as if a new user; note every place a manual edit was required
  - Walkthrough complete. Friction points documented in project Notes (4 items). README rewritten with: Quick start (3-line copy-pasteable block — git clone, cd, claude --plugin-dir ./cadence-plugin) and a separate 'Use Cadence in your own repo' section with absolute-path setup. Prerequisite (Node 20+) and 'no build step' note added at the top.

## Notes

### Deferred decisions

**Marketplace listing (DoD #3):** Deferred to the someday pursuit
`make-cadence-public`. Tracked as Idea
`claude-code-marketplace-listing` on that pursuit. Rationale: a
marketplace entry is a public-launch concern, not an install-friction
concern — it depends on the project being public, which is itself a
someday-pursuit decision.

**Installer script (DoD #4):** Decided not to add. The Quick start is
3 lines (`git clone`, `cd`, `claude --plugin-dir`); the full
own-repo path is 5 lines. A wrapper script wouldn't materially
shorten this and would add a moving piece to maintain.

### Friction points found in walkthrough

1. README never told users where to get the plugin — no clone URL.
2. `/path/to/cadence-plugin` was a placeholder requiring manual edit.
3. `@/path/to/cadence-plugin/cadence-runtime.md` was a placeholder
   requiring manual edit.
4. No distinction between "try it out" and "use it for my own work" —
   the original flow created an empty `my-cadence` dir and then
   referenced a plugin path the user never installed.

All four addressed in the rewrite.
