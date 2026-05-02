---
id: add-long-running-agent-interjections
pursuit: improve-ux-and-vision
status: on_hold
created: 2026-05-01
---

# Add Long-Running-Agent Interjections

When narrate, reflect's reconciler subagent, close's narrator call, and other long-running agent operations are working, the user is waiting with no signal beyond eventual prose output. This is a natural breakpoint where a brain-tickler tip from the repository (built in add-tip-and-teaching-surfaces) could appear non-interferingly — making the wait feel accompanied rather than empty.

## Intent

Surface tips from the tip repository (PA) during long-running agent operations as inline status, never interruption. When narrate / reflect / close / etc. invoke subagents that take more than a few seconds, the agent surfaces a contextually-fit one-line tip from the repository before/during the agent call so the user sees something useful instead of empty waiting. The tip is non-blocking — the agent invocation continues regardless. Frequency capped strictly to honor the 'wallpaper' warning: long-agent-run tips should feel like a surprise gift, not routine. Depends on add-tip-and-teaching-surfaces being in place. Content scope: brain-tickler quotes from the P-section (loading-screen tips), not skill-teaching content — this is 'while you wait, here's a frame to chew on' not 'here's how to use this verb.' Done feels like: long agent runs don't feel like dead air; the user occasionally learns something or gets a frame while waiting; the surface never becomes routine.

## Actions

- [ ] Audit which existing skills invoke long-running subagents and identify natural breakpoints for interjections: narrate (cadence:narrator), reflect (cadence:reconciler), close (cadence:narrator), possibly others. Document in this project's Notes.
- [ ] Decide architecture: pre-invocation interjection (simplest — agent surfaces a tip before calling the subagent, then waits silently for results) vs. real-time interjection (requires SDK plumbing). Pre-invocation is the right v1 choice. Document the decision and the reasons.
- [ ] Implement pre-invocation interjection in the affected skills: extend skills/narrate, skills/reflect, skills/close to surface a tip from the PA repository before/during their long agent calls. Honor frequency caps from .cadence/tip-state.json.
- [ ] Constrain content: long-agent-run interjections pull from the brain-tickler/quote category (P-section content), not the skill-teaching category. Encode this constraint in the tip selection logic.
- [ ] Strict frequency cap: long-running-agent interjections fire at most once per session and at most once per agent type per week (configurable in cadence.yaml). Verify against the 'wallpaper' warning by tracking interjection frequency over a typical week of dogfooding.
