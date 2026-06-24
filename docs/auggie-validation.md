# Auggie build — validation report

What was verified for the generated `auggie-plugin/` build, and what still needs a
live authenticated Auggie session. Date: 2026-06-24. Auggie version tested:
`0.30.0`.

## Verified headlessly (no Augment auth required)

| Check | Result |
|---|---|
| Transpiler runs clean | `cadence build-auggie` → 42 files, no errors |
| Coverage | 19 skills → 19 commands; 5 agents → 5 subagents; runtime, manifest, settings, AGENTS.md, CLI binary all emitted |
| Drift detection | `--check` exits 0 in sync, exits 1 after a source edit (proven) |
| Generated JSON | `.augment/settings.json` + `.augment-plugin/plugin.json` parse |
| Generated frontmatter | all 25 command/agent/rule frontmatter blocks parse under **strict** js-yaml |
| Namespace neutralization | 0 residual `/cadence:` tokens in any generated text file |
| SessionStart hook (simulated) | running the exact hook command in a scratch repo emits a clean markdown dashboard |
| Verb prefix | hook output uses `/cadence-` (flat); `--json` output left byte-for-byte |
| Unit tests | `test/auggie.test.ts` — 15/15 pass; full suite 148/149 (1 pre-existing env-only `publish` git-URL failure) |
| Auggie feature parity | `auggie --help` confirms `--rules`, `--print`, `--quiet`, `--model`, subagents, MCP, settings.json hooks |

## Pending — requires `auggie login`

A live, authenticated session is needed to confirm the LLM-driven behavior. These
are queued in `validations/pending.md` and surface on every fresh session:

- Core verbs end-to-end (`/cadence-start`, `-capture`, `-complete`, `-reflect`).
- Subagent dispatch (`/cadence-narrate today` → `cadence-narrator`).
- Plugin `bin/` on PATH for the SessionStart hook (else set an absolute
  `sessionStartCommand` in `overrides.yaml`).
- Subagent model ids (`haiku4.5` / `sonnet4.5`) accepted by Auggie.
- `.augment-plugin/plugin.json` manifest schema accepted by the loader.
- MCP pull parity (`/cadence-mcp-pull`).

## Quality-delta assessment

The translation is near-lossless: Auggie's plugin model is field-for-field
compatible, and the load-bearing `cadence` CLI ships unchanged. The only behavioral
seams are (1) verb namespace (`:` → `-`, fully rewritten), (2) host-internals
teaching prose (neutralized), and (3) per-subagent model selection (mapped,
overridable). No verb logic is duplicated or reimplemented, so the two builds
cannot diverge in behavior — only in packaging, which the CI drift gate enforces.
