# Developing Cadence

Notes for hacking on Cadence itself. The user-facing install + walkthrough lives in [`docs/getting-started.md`](docs/getting-started.md); this document is for editing the plugin and its CLI.

## Repo layout

```
src/                        TypeScript source for the bundled CLI
  cli.ts                    CAC-based entrypoint; all subcommands
  scan/                     Repo scanning (pursuits, projects, brainstorms, captures, reflections)
  report/                   Reconciler (flag detection)
  render/                   Dashboard layout, drill-down views, curation ranker, color helpers
  write/                    Mutating helpers (pursuit, project, brainstorm, capture, reflection)
  validation/               Pending-validation queue (validations/pending.md)
  inbox.ts                  The canonical Inbox view function (inboxItems)
  sessionstart.ts           SessionStart-hook suppression + render helpers
  stophook.ts               Stop-hook session-log writer
  types.ts                  Zod schemas + inferred types (Pursuit, Project, Brainstorm, Capture, Flag, Snapshot, etc.)

cadence-plugin/             The distributable Claude Code plugin
  bin/cadence               Pre-bundled CLI (esbuild output of src/cli.ts; runs on Node 20+)
  cadence-runtime.md        Always-loaded runtime instructions
  cadence-reference.md      On-demand reference (file formats, CLI catalog, lifecycle mechanics, etc.)
  workflows/                Behavioral docs
    verb-contracts.md       Per-verb tone + behavior + guardrails (the canonical register source)
    coaching-strings.md     Canonical wording for ambient surfaces (Inbox line, This-week opener, etc.)
    reconciler.md           Flag detection logic
    reflect.md              Reflect ritual structure
  skills/<verb>/SKILL.md    Per-verb Claude Code skill definitions
  agents/<name>.md          Subagent definitions (capture-ingest, narrator, reconciler)
  hooks/hooks.json          SessionStart + Stop hook registrations
  deck/provocations.yaml    Divergent-thinking provocation deck for /brainstorm
  tips/library.yaml         Tip library (quotes, skill-teaching, verb-hints)

test/                       Node test runner suites
docs/                       Vision, architecture, getting-started, research, marimo-console-design
pursuits/, brainstorms/, thoughts/, reflections/, narratives/, validations/
                            Cadence's own state (this repo is its own first user)
```

## Build + test

```bash
npm run bundle              # Rebuild cadence-plugin/bin/cadence via esbuild (~10ms)
npm test                    # Node test runner across test/*.test.ts
```

The bundle is committed to the repo (`cadence-plugin/bin/cadence`) so end-users don't need a build step. Rebundle after touching anything under `src/`.

A pre-commit hook at `.githooks/pre-commit` auto-rebundles when any `src/**/*.ts` file is staged. Activate it once per clone:

```bash
git config core.hooksPath .githooks
```

`core.hooksPath` is local config and doesn't propagate from `git clone` — re-run after fresh checkouts.

## Plugin architecture

Three layers, loaded progressively:

1. **`cadence-runtime.md`** is always loaded via the @-import in `CLAUDE.md`. Vocabulary, verb shapes, working-a-project rules, upward completion, engagement and alignment principles, guardrails, scope.

2. **`cadence-reference.md`** is on-demand. File formats, full CLI catalog, lifecycle mechanics, Intent and Actions discipline, Brainstorm Workspaces, Capture Ingestion, Ambient Surfaces, project recipes, tip library schema. Read when the active task needs the detail.

3. **`workflows/verb-contracts.md`** is the per-verb register source. Each verb has a Purpose / Tone / Behavior / No-argument entry / Guardrails / Exit block. SKILL.md files quote from here rather than re-inventing per-skill.

The **skills** under `cadence-plugin/skills/<verb>/SKILL.md` are what Claude Code's tool selector loads when the user invokes a verb (or natural-language intent matches the frontmatter `description`). The SKILL files describe the agent's behavior; they shell out to `cadence <subcommand>` for deterministic reads and well-formed writes.

The **subagents** in `cadence-plugin/agents/<name>.md` carry per-agent system prompts, restricted tool surfaces, and default budgets. Skills dispatch them via the Agent tool to isolate bulk-payload work (narrative generation, capture ingestion, reconciler scans).

The **hooks** in `cadence-plugin/hooks/hooks.json` wire `cadence status --hook-output` to SessionStart events (`startup` / `resume` / `clear`) and `cadence stop-hook` to Stop. The hook output is plain markdown (no ANSI codes; would break Claude Code's table rendering).

## Adding a new verb

1. Decide it's a verb. Most user-facing actions belong in the existing 12; new verbs are scrutinized for domain bias and surface bloat. If it's only useful from one domain (coding, household) it's probably a SKILL internal or CLI subcommand, not a top-level verb.
2. Create `cadence-plugin/skills/<verb>/SKILL.md` with the YAML frontmatter (`description` is what Claude Code's tool selector reads).
3. Add the verb to `cadence-plugin/workflows/verb-contracts.md` with the full Purpose / Tone / Behavior / Guardrails / Exit block.
4. Add the catalogue entry to `cadence-plugin/cadence-reference.md` under the appropriate group.
5. Mention the verb in `cadence-plugin/cadence-runtime.md`'s "One Voice" section if it changes the register set.
6. If the verb introduces a new ambient string, add it to `cadence-plugin/workflows/coaching-strings.md` first, then have the SKILL quote from there.
7. If the verb has a CLI binding, add the subcommand under `src/cli.ts` and rebundle.

## Adding a new reconciler flag

1. Extend the `Flag` discriminated union in `src/types.ts`.
2. Implement the detection in `src/report/reconciler.ts`.
3. Update `src/render/status.ts` `describeFlag` + the dashboard's `summarizeFlags` for the Heads up line.
4. Add the curation case to `src/render/curation.ts` if the flag should bubble into Likely next moves.
5. Document the new flag in `cadence-plugin/workflows/reconciler.md`.
6. Add a test.

## Bundled CLI conventions

- All read paths emit text by default and JSON via `--json`.
- Mutating commands always emit a JSON summary so SKILLs can read structured response.
- Date handling uses local wall-clock (not UTC) for ISO weeks and daily file names — this matches the user's filing intuition.
- Don't introduce dependencies casually. The bundle is ~715KB; every dependency is one more reason for the bundle to break on a Node upgrade.

## This repo is its own first user

Three modes of work can happen in any session — they're called out in [`CLAUDE.md`](CLAUDE.md):

1. **Building** — engineering work on the product: editing skills, writing code, updating formats.
2. **Using** — using Cadence as designed: `/cadence:start`, `/cadence:complete`, `/cadence:reflect` for real workflow.
3. **Testing** — validating that a feature works.

The active pursuit (currently `improve-ux-and-vision`) tracks real work AND serves as test fixtures. When Building and Using interleave (common), session context holds: the active project doesn't change because we edited a skill.

When a Building request implies **substantial feature work**, route through the Cadence lifecycle first — create a project under the appropriate pursuit, add Intent + at least one Action, then work the project's actions. This product earns its keep by being used to build itself.

## Validation pattern

For behaviors that need fresh-session verification, queue them via:

```bash
cadence pending-validation-add --description "..."
```

The SessionStart hook surfaces the queue on every fresh session until the entry is cleared:

```bash
cadence pending-validation-clear --match "<text>"
```

Don't add "validate in fresh session" actions to project files — they pile up at N-1 of N and block project closure indefinitely. The queue is decoupled from project completion on purpose.

## The Auggie fallback build

Cadence also runs on [Auggie](https://docs.augmentcode.com/cli/overview) as a
fallback when Claude Code is unavailable. The Claude Code plugin
(`cadence-plugin/`) is the **single source of truth**; the Auggie build at
`auggie-plugin/` is **generated** by a transpiler and committed so the fallback
is ready to run without a build step.

- **Generate:** `cadence build-auggie` (reads `cadence-plugin/`, writes `auggie-plugin/`).
- **Check drift:** `cadence build-auggie --check` (exits non-zero if `auggie-plugin/` is stale). CI runs this on every PR.
- **Never hand-edit `auggie-plugin/`.** Edit the source plugin (and `src/` for the CLI), then regenerate.

Transpiler internals live in `src/auggie/`:

| File | Role |
|---|---|
| `transform.ts` | Orchestrator — builds the output as an in-memory file map (manifest, commands, agents, runtime rule, AGENTS.md, reference docs, settings.json, CLI binary, README). |
| `rewrite.ts` | The single shared token-rewrite surface. Neutralizes host terms: `/cadence:` → `/cadence-`, "Agent tool" → "subagent dispatcher", "Claude Code" → "the agent host", ToolSearch → tool discovery. |
| `model-map.ts` | Subagent model aliases → Auggie tiers (`haiku→haiku4.5`, `sonnet→sonnet4.5`), overridable. |
| `manifest.ts` | `.claude-plugin/plugin.json` → `.augment-plugin/plugin.json`. |
| `frontmatter.ts` | Tolerant reader for SKILL/agent frontmatter (their `description` values contain unescaped colons that strict YAML rejects). |
| `overrides.ts` + `overrides.yaml` | Hand-maintained adapter layered on top of generated output (model ids, argument hints, subagent colors, the SessionStart command). |

The shared `cadence` CLI prints verb hints with the Claude Code namespace by
default. Setting `CADENCE_VERB_PREFIX=/cadence-` swaps them to Auggie's flat form
in human output (never `--json`); see `src/verb-prefix.ts`. The generated
SessionStart hook sets this inline.

End-user install + usage lives in [`docs/running-on-auggie.md`](docs/running-on-auggie.md).

## Releasing

There's no published release process yet. The plugin is distributed by `git clone + --plugin-dir`. The bundled CLI is committed alongside the source so end-users don't need a build step.

When publishing to a Claude Code marketplace becomes relevant, the package manifest lives at `cadence-plugin/.claude-plugin/plugin.json`.
