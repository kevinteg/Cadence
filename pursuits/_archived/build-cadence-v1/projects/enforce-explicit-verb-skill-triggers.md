---
id: enforce-explicit-verb-skill-triggers
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Enforce Explicit Verb Skill Triggers

Rewrite skill descriptions so Claude won't auto-invoke state-modifying Cadence verbs from natural language. Today /cadence:capture, /pause, /complete and others have descriptions that read like generic capabilities — the model will fire them when a user says 'remember this' or 'save my progress', bypassing the explicit-verb contract the runtime promises. Adopt a TRIGGER/SKIP convention (modeled on update-config) so the description itself encodes invocation discipline.

## Actions

- [x] Draft the TRIGGER/SKIP convention in workflows/verb-contracts.md
