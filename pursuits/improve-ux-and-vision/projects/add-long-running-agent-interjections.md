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

- [x] Audit complete (see Notes): four skills invoke long-running subagents — narrate, reflect (Get Clear), resolve (pursuit closure), reconcile.
- [x] Architecture decision (see Notes): **pre-invocation interjection**. Agent surfaces a tip BEFORE calling the subagent, then delegates silently. Real-time mid-agent interjection would require SDK plumbing; not worth it for v1.
- [x] Pre-invocation interjection wired into skills/narrate, skills/reflect (step c — reconciler subagent invocation), skills/resolve (step 7 — closure narrative), skills/reconcile (step 1).
- [x] Content constrained to `--types quote` so only brain-tickler/quote category surfaces. Skill-teaching content is gated to its own contexts (verb discovery, post-action footers).
- [x] Strict frequency cap via new `--category` + `--category-cool-down-days` flags on `cadence tip-pick`. Per-agent-type cool-downs: narrate 7d, reflect 14d, resolve 30d, reconcile 14d. State persisted in `.cadence/tip-state.json` `categories` field. 3 unit tests cover eligibility + persistence.

## Notes

### Audit (action 1)

Four skills invoke long-running subagents:
- `cadence-plugin/skills/narrate/SKILL.md` → `cadence:narrator` for daily/weekly/monthly/annual/pursuit narratives.
- `cadence-plugin/skills/reflect/SKILL.md` step 4c → `cadence:reconciler` during Get Clear.
- `cadence-plugin/skills/resolve/SKILL.md` step 8 → `cadence:narrator` for pursuit-closure narrative (only at pursuit-level resolve).
- `cadence-plugin/skills/reconcile/SKILL.md` step 2 → `cadence:reconciler` (power-user verb; rare).

Natural breakpoint in all four: the moment BEFORE the Agent tool invocation, when the user is about to wait several seconds.

### Architecture decision (action 2)

**Pre-invocation interjection chosen.** The skill calls `cadence tip-pick` with the long-agent-run trigger BEFORE invoking the subagent. If a tip is returned, the agent renders it inline as a single line ("While the narrator works, here's a frame to chew on: …"), then proceeds with the subagent call silently.

Reasons:
- **Simplest possible mechanism.** No SDK plumbing, no streaming, no progress hooks. The skill text is the contract; the agent does the right thing.
- **Non-blocking by construction.** The tip is already rendered before the agent call starts; the call's outcome doesn't depend on the tip.
- **Matches the "wait" UX.** The user sees the tip first, then sees nothing while the agent works (acceptable), then sees the agent's prose. The tip frames the wait; it doesn't compete with the prose.
- **Real-time mid-agent interjection** (e.g., the agent emitting a tip after N seconds) would require SDK changes in Claude Code (no current hook for "agent is still running"). Not worth it for v1. Pre-invocation gets ~80% of the value at ~5% of the cost.

### Frequency caps (action 5)

Per-agent-type cool-downs honor the wallpaper warning:
- narrate: 7 days (daily narratives are common; tip every ~7 invocations)
- reflect: 14 days (weekly ritual; tip every other Reflect)
- resolve: 30 days (pursuit closures are rare; one tip per ~3-5 closures is the right cadence for a ritual moment)
- reconcile: 14 days (power-user ad-hoc invocations)

Implemented via new `--category <key> --category-cool-down-days <n>` flags on `cadence tip-pick`. State persisted in `.cadence/tip-state.json` under a `categories` field, keyed by category name with ISO timestamp. Forward-compatible with older state files (categories field defaults to empty object).

If users want to tune the cool-downs later, exposing them via cadence.yaml is straightforward — but YAGNI for v1; the defaults are sensible and the CLI flag is overridable.
