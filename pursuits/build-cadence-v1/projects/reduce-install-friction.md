---
id: reduce-install-friction
pursuit: build-cadence-v1
status: on_hold
created: 2026-04-27
---

# Reduce Install Friction

README installation tells users to run 'claude --plugin-dir /path/to/cadence-plugin' but provides no actual path — outsiders have to clone first and figure out absolute paths themselves. Make first-run friction near zero so the plugin can be evaluated by someone who's never seen the repo.

## Definition of Done

- [ ] README installation section provides a single copy-pasteable block: git clone, cd, claude --plugin-dir ./cadence-plugin (no manual path edits)
- [ ] CLAUDE.md import line updated to a form that works from a freshly cloned repo (relative or env-based, not /path/to/)
- [ ] If a Claude Code marketplace listing is feasible, evaluate it and capture decision in the project notes (defer to a follow-up project if not now)
- [ ] An optional installer script or one-liner is included if it materially shortens the path
- [ ] User-story validation: in a fresh /tmp directory, follow the README from scratch (no prior context) and reach a working /cadence:init prompt without needing to edit any paths

## Actions

- [ ] Walk through the README install steps from /tmp as if a new user; note every place a manual edit was required
