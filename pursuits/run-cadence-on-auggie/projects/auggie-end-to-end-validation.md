---
id: auggie-end-to-end-validation
pursuit: run-cadence-on-auggie
status: active
created: 2026-06-24
---

# End-to-end validation under Auggie

## Intent

Prove Cadence actually runs under Auggie and measure any quality delta vs Claude Code. Install Auggie, load the generated auggie-plugin/, and in a scratch Cadence repo exercise the core flows: SessionStart status dashboard; /cadence-start curated menu; /cadence-capture is silent and lands a thought; /cadence-complete checks an action; /cadence-reflect walks reconciler flags; a subagent-backed verb (/cadence-narrate today) runs the narrator; and an MCP pull ingests a resource. Record gaps and quality deltas, feed fixups back into overrides.yaml, and queue fresh-session checks via 'cadence pending-validation-add'. Done means: the core surface works under Auggie and degradations are documented or resolved.

## Actions

- [x] Install Auggie and load the generated auggie-plugin/ in a scratch repo
- [ ] Run the core verb + hook + subagent + MCP flows; record behavior/quality deltas vs Claude Code
- [x] Feed fixups into overrides.yaml and queue any fresh-session validations
