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
2. **Using** — Using Cadence as designed: /cadence:start, /cadence:complete,
   /cadence:resolve, /cadence:brainstorm, /cadence:reflect for real
   workflow. Signaled by: "wrap up", "what's next", running verbs
   without "test" framing.
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

1. Identify the appropriate pursuit (currently `improve-ux-and-vision`
   for v1.1 work; `inbox` for unattached structural ideas).
2. Create a project via `cadence create-project` with an **Intent**
   narrative and at least one **Action**. The Intent captures
   motivation, scope, and the felt-sense of what "done" would look
   like — a brain dump that gets co-edited as the work focuses.
   Actions are atomic, concrete moves you can visualize doing.
3. **Validation pattern:** when a behavior needs fresh-session
   verification, do NOT add a "user-story validation in a fresh
   conversation" action to the project — those pile up at N-1 of N
   and block project closure indefinitely. Instead, queue the
   validation via `cadence pending-validation-add --description "..."`
   as part of the project work. The SessionStart hook reads
   `validations/pending.md` and surfaces a "New behaviors to validate
   in this fresh session" block above Next: on every fresh session
   until the user clears the entry with
   `cadence pending-validation-clear --match "<text>"` after
   verifying. Project completion is decoupled from fresh-session
   validation.
4. New projects start as `on_hold` and promote to `active` when
   `/cadence:start` opens a session OR when the first action is
   checked off. Work the project's actions in order; check each off
   via `/cadence:complete` (or `cadence check`) as it lands.
5. When all actions are checked, the upward-completion prompt is:
   "All actions checked. `/cadence:resolve <project>` to wrap this up,
   or add more actions?" The actual project transition (status=done,
   intent-feel-achieved dialogue) happens via `/cadence:resolve`, not
   `/cadence:complete` — `/complete` is for actions only. Done-ness
   is judged through dialogue against the Intent, not by sweeping a
   checklist.

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

All skills live in `cadence-plugin/skills/`. The runtime is at
`cadence-plugin/cadence-runtime.md` (always loaded via @-import);
on-demand reference content (file formats, full CLI catalog, lifecycle
mechanics, operational recipes) is at `cadence-plugin/cadence-reference.md`.
Workflows are at `cadence-plugin/workflows/`. The provocation deck is at
`cadence-plugin/deck/provocations.yaml`. The tip library is at
`cadence-plugin/tips/library.yaml`.

The user-facing surface is **12 verbs** (slimmed from the original 16):
`brainstorm`, `start`, `complete`, `resolve`, `waiting`, `capture`,
`reflect`, `narrate`, `status`, `find`, `help`, `init`. Two verbs are
**hidden internal**: `develop` (chained from `brainstorm`) and `promote`
(chained from `develop` or `start`). `reconciler` runs as **system
behavior** (SessionStart hook + during `/reflect` Get Clear); the
`cadence flags` CLI subcommand stays for power use.

When editing skills or workflows, edit the plugin files directly —
they are the single source of truth. The `.claude/commands/` directory
only contains dev-only commands (run-journey).

## Product Behavior vs Personal Memory

In this repo, do **not** save working-style preferences, conversational
patterns, or verb behavior to per-user memory at
`~/.claude/projects/.../memory/`. That memory is per-user and per-machine
and does not ship with the plugin. Anything that should be how Cadence
works for **everyone** belongs in the plugin's skill contracts
(`cadence-plugin/skills/*/SKILL.md`), the runtime
(`cadence-plugin/cadence-runtime.md`), or the verb contracts
(`cadence-plugin/workflows/verb-contracts.md`) — so it survives
installation, propagates to every user, and lives in the same review
loop as the rest of the product. Reserve memory for things that are
genuinely user-specific (user role, project context, references to
external systems).
