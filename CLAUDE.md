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

## Feature Work Goes Through Cadence

When a Building request implies **substantial feature work or structural
changes** to this product (a new verb, a new format, a new architectural
piece, a non-trivial refactor), do not jump to implementation. Route the
work through the Cadence lifecycle first — this product earns its keep
by being used to build itself.

1. Identify the appropriate pursuit (usually `build-cadence-v1`).
2. Create a project via `cadence create-project` with a Definition of
   Done. The DoD must include a **user-story validation step** —
   how we'll exercise the feature end-to-end from the user's perspective
   (e.g., "Run `/cadence:foo bar` and confirm X happens"). This is the
   feature's acceptance test.
3. Work the project's actions in order, checking off DoD items via
   `/cadence:complete` as each is satisfied.
4. The user-story step runs last and proves the feature works as a user
   would experience it.
5. Complete the project via `/cadence:complete` once all DoD items pass.

This does **NOT** apply to:
- Small fixes (typos, single-line bugs, copy edits, broken links)
- Local adjustments to existing skills or docs
- Trivial config tweaks
- Settings/permission changes

When the size is ambiguous, ask: "Is this a project, or just a fix?"
before proceeding.

## Product-Specific References

Read `docs/architecture.md` for full design decisions and rationale.
Read `docs/product-vision.md` and `docs/one-pager.md` for the
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
