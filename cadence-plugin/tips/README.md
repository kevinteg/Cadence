# Cadence Tip Library — Editor's Guide

Curated content the agent surfaces at appropriate breakpoints. Three
types coexist: **quotes** (brain-ticklers), **skill-teaching** (verb
explanations), and **verb-hints** (contextual next-steps).

**Canonical schema reference:** `cadence-plugin/cadence-reference.md`,
"Tip Library" section.

**Source material:** `docs/teaching-tips-research.md` (the 227-entry
curated library from real reading: Allen, Newport, Doerr, Brooks,
Karpathy, Willison, and others). The research doc is the design
rationale; this YAML is the operational content.

## Tone target

The author's explicit tone target for this library is
**smart-colleague-marginalia, not motivational-poster.** A returning
user should feel accompanied by a thoughtful colleague who occasionally
mentions a useful frame — never lectured, never streak-flavored,
never sappy.

If a tip wouldn't survive being read aloud at a senior engineering
review with a straight face, it doesn't belong in the library.

## Adding a tip

1. Pick the right `type`:
   - **quote** — brain-tickler from real source material; requires `attribution`.
   - **skill-teaching** — explains what a verb does; surfaces when the user discovers a verb naturally or after a teaching-eligible action.
   - **verb-hint** — contextual next-step suggestion at the natural exit of a verb.
2. Pick `triggers` thoughtfully — a tip that fires on too many tags becomes wallpaper. Default to fewer, more specific triggers.
3. Pick `tone` honestly — `framing` for quotes, `directive` for next-steps, `diagnostic` for "consider whether X", `structural` for operational guidance.
4. Set frequency caps generously — for `quote` entries, default to `cool_down_days: 7` minimum; for verbose or distinctive ones, longer.
5. Assign `weight: low` if you're unsure — that lets the tip exist without dominating its trigger contexts.

## Trigger tag conventions

Tags are open-vocabulary strings. Conventional prefixes:

- `verb-*` — a specific verb invocation context (`verb-promote-pursuit`, `verb-resolve`, `verb-narrate`)
- `ritual-*` — a ritual phase (`ritual-reflect-get-clear`, `ritual-pursuit-close`)
- `state-*` — a system state (`state-pursuit-near-completion`, `state-wip-over-limit`)
- `moment-*` — a temporal breakpoint (`moment-long-agent-run`, `moment-end-of-day`)
- `discovery` — natural-language-to-verb teaching footer trigger
- `idle` — generic loading-screen fallback

Skills can register new tags freely — the schema doesn't validate.

## Migration status

This library currently holds a **seed of example entries** that exercise
the schema. Full content migration from
`docs/teaching-tips-research.md` is tracked under project
`add-tip-and-teaching-surfaces` action 3.

## Testing changes

After editing, verify the YAML is well-formed:

```bash
node -e "console.log(JSON.stringify(require('js-yaml').load(require('fs').readFileSync('cadence-plugin/tips/library.yaml','utf8')), null, 2))" | head -50
```

(Or any YAML linter.) Once the tip-state CLI lands, use
`cadence tip status` to inspect which tips would fire in the current
state and `cadence tip reset --match <id-substring>` to clear state
for re-testing.
