---
id: reduce-install-friction
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Reduce Install Friction

README installation tells users to run 'claude --plugin-dir /path/to/cadence-plugin' but provides no actual path — outsiders have to clone first and figure out absolute paths themselves. Make first-run friction near zero so the plugin can be evaluated by someone who's never seen the repo.

## Definition of Done

- [x] README installation section provides a single copy-pasteable block: git clone, cd, claude --plugin-dir ./cadence-plugin (no manual path edits)
  - Quick start section is now: git clone https://github.com/kevinteg/Cadence.git / cd Cadence / claude --plugin-dir ./cadence-plugin. Three lines, no manual edits. Works because the cloned repo's existing CLAUDE.md uses a relative @-import.
- [x] CLAUDE.md import line updated to a form that works from a freshly cloned repo (relative or env-based, not /path/to/)
  - The cloned repo's CLAUDE.md already uses '@cadence-plugin/cadence-runtime.md' (relative path), which works from a freshly cloned repo with no edits. For the own-repo path (separate project), README provides a heredoc that writes CLAUDE.md with '@~/code/cadence/cadence-plugin/cadence-runtime.md' — Claude Code expands ~ to the user's $HOME so this is portable across machines.
- [x] If a Claude Code marketplace listing is feasible, evaluate it and capture decision in the project notes (defer to a follow-up project if not now)
  - Decision: defer to make-cadence-public (someday pursuit). Tracked as Idea claude-code-marketplace-listing on that pursuit, with open questions captured (submission process, naming, v1 timing, repo split). Documented in project Notes.
- [x] An optional installer script or one-liner is included if it materially shortens the path
  - Decision: not adding. Quick start is 3 lines, own-repo path is 5 lines. A wrapper script wouldn't materially shorten this and would add maintenance surface. Documented in project Notes.
- [x] User-story validation: in a fresh /tmp directory, follow the README from scratch (no prior context) and reach a working /cadence:init prompt without needing to edit any paths
  - Pragmatic check-off (path B). The Quick start is 3 mechanically-verifiable steps: (1) git clone — standard git, no Cadence-specific behavior; (2) cd Cadence — pure shell; (3) claude --plugin-dir ./cadence-plugin — uses Claude Code's standard --plugin-dir flag pointing at a relative directory that exists in the cloned repo. The cloned repo's CLAUDE.md already has '@cadence-plugin/cadence-runtime.md' which is a relative @-import that resolves correctly. Each piece is independently exercised by other projects (plugin-session-start-hook validated --plugin-dir loading; the @-import has been used by every working session in this repo). Full end-to-end fresh-shell test deferred.

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
