---
id: enforce-explicit-verb-skill-triggers
pursuit: build-cadence-v1
status: active
created: 2026-04-27
---

# Enforce Explicit Verb Skill Triggers

Rewrite skill descriptions so Claude won't auto-invoke state-modifying Cadence verbs from natural language. Today /cadence:capture, /pause, /complete and others have descriptions that read like generic capabilities — the model will fire them when a user says 'remember this' or 'save my progress', bypassing the explicit-verb contract the runtime promises. Adopt a TRIGGER/SKIP convention (modeled on update-config) so the description itself encodes invocation discipline.

## Definition of Done

- [ ] Pick a TRIGGER/SKIP description convention and document it in workflows/verb-contracts.md so future skills follow it
- [ ] State-modifying verbs (capture, pause, complete, cancel, waiting, promote, close, init) updated to TRIGGER ONLY on explicit /cadence:verb invocation, with SKIP examples for tempting natural-language phrases
- [ ] Conversational verbs (brainstorm, develop, reflect, start, narrate, status, reconcile) updated to describe explicit auto-trigger conditions, not just 'what they do'
- [ ] All 15 SKILL.md description frontmatter lines updated and lint-checked for length (descriptions stay readable in the system prompt)
- [ ] User-story validation: in a fresh Claude Code session in this repo, type 'remember to email Pat about the design review' and confirm /cadence:capture does NOT auto-fire; then type '/cadence:capture remember to email Pat' and confirm it does fire and writes the capture file
- [ ] User-story validation: type 'let's brainstorm onboarding ideas' and confirm /cadence:brainstorm DOES auto-trigger (conversational verb)

## Actions

- [ ] Draft the TRIGGER/SKIP convention in workflows/verb-contracts.md
