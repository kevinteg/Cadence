# Cadence — Product Development

@cadence-plugin/cadence-runtime.md

## Meta-Awareness: This Repo's Dual Nature

This repo is both the Cadence product AND its own first Cadence user.
The pursuit "Build Cadence v1" is real data tracking real work — AND it
serves as test fixtures for validating the system.

Three modes of work can happen in any session:

1. **Building** — Engineering work on the product: editing skills, writing
   code, updating formats. Signaled by: "update the skill", "add to
   the runtime", "fix the format", "implement X".
2. **Using** — Using Cadence as designed: /cadence:start, /cadence:pause, /cadence:complete,
   /cadence:brainstorm, /cadence:reflect for real workflow. Signaled by:
   "wrap up", "what's next", running verbs without "test" framing.
3. **Testing** — Validating that a feature works. Signaled by: "test
   /cadence:X", "let's see if this works", "try that again".

After a **test**, report results (what worked, what didn't, what needs
iteration) rather than treating the output as real workflow state.

When **using** and **building** interleave (common), maintain session
context: the active project doesn't change because we edited a skill.

## Product-Specific References

Read `docs/architecture.md` for full design decisions and rationale.
Read `docs/product-vision-v3.md` and `docs/one-pager-v3.md` for the
current product direction.

## Plugin Development

The `cadence-plugin/` directory IS the distributable plugin. This repo
uses its own plugin via `claude --plugin-dir ./cadence-plugin`.

All user-facing skills live in `cadence-plugin/skills/`. The runtime
is at `cadence-plugin/cadence-runtime.md`. Workflows are at
`cadence-plugin/workflows/`. The provocation deck is at
`cadence-plugin/deck/provocations.yaml`.

When editing skills or workflows, edit the plugin files directly —
they are the single source of truth. The `.claude/commands/` directory
only contains dev-only commands (run-journey).
