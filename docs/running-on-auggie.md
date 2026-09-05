# Running Cadence on Auggie (fallback runtime)

> **This is a fallback.** Cadence's primary home is Claude Code. This page is for
> when Claude Code is unavailable (e.g. you've run out of credits) and you want
> to keep working in [Auggie](https://docs.augmentcode.com/cli/overview), Augment
> Code's terminal agent.

Cadence runs on Auggie through a **generated build** at `auggie-plugin/`. The
authoritative source stays the Claude Code plugin (`cadence-plugin/`); a
transpiler (`cadence build-auggie`) translates it to Auggie's conventions, and a
CI drift check keeps the two in sync. You never edit `auggie-plugin/` by hand.

## Why a fallback works cleanly

Auggie mirrors Claude Code's plugin model almost field-for-field, so the
translation is mostly mechanical:

| Claude Code | Auggie |
|---|---|
| `skills/<verb>/SKILL.md` → `/cadence:verb` | `.augment/commands/cadence-<verb>.md` → `/cadence-verb` |
| `agents/<name>.md` (Agent tool) | `.augment/agents/cadence-<name>.md` (subagents) |
| `hooks/hooks.json` SessionStart | `.augment/settings.json` SessionStart (stdout injected as context) |
| `CLAUDE.md` + always-loaded runtime | `.augment/rules/cadence-runtime.md` (`type: always`) + `AGENTS.md` |
| `.claude-plugin/plugin.json` | `.augment-plugin/plugin.json` |
| `cadence` CLI on PATH | same binary, shipped at `auggie-plugin/bin/cadence` |

The deterministic `cadence` CLI — the piece everything depends on — is
platform-agnostic and ships unchanged. Only verb namespace (`/cadence:` →
`/cadence-`) and a few host-internal terms are neutralized during the transpile.

## Install

1. **Install Auggie** and sign in:
   ```bash
   npm install -g @augmentcode/auggie
   auggie    # follow the sign-in prompt once
   ```

2. **Make the Cadence CLI available on PATH.** The bundled binary ships at
   `auggie-plugin/bin/cadence`. Put it on your PATH so commands and the
   SessionStart hook can find it:
   ```bash
   export PATH="$PWD/auggie-plugin/bin:$PATH"   # or symlink it into ~/.local/bin
   cadence --help                                # confirm it resolves
   ```

3. **Load the plugin into your workspace.** Copy the generated Auggie config into
   the Cadence repo you want to work in (or install it via Auggie's plugin
   browser once published to a marketplace):
   ```bash
   cp -R auggie-plugin/.augment      <your-repo>/.augment
   cp -R auggie-plugin/.augment-plugin <your-repo>/.augment-plugin
   cp    auggie-plugin/AGENTS.md     <your-repo>/AGENTS.md
   ```

4. **Start Auggie** in that repo. The SessionStart hook surfaces the Cadence
   status dashboard, and the verbs are available as `/cadence-<verb>`.

## Usage

Everything you do in Claude Code works the same; only the slash-command
separator changes from `:` to `-`:

| Claude Code | Auggie |
|---|---|
| `/cadence:start` | `/cadence-start` |
| `/cadence:capture "..."` | `/cadence-capture "..."` |
| `/cadence:complete` | `/cadence-complete` |
| `/cadence:reflect` | `/cadence-reflect` |
| `/cadence:narrate today` | `/cadence-narrate today` |

You can also run a command non-interactively: `auggie command cadence-status`.

## MCP servers (Glean and friends)

Cadence consumes MCP servers (e.g. Glean enterprise search) through the **agent
host's** tool surface — `/cadence-mcp-pull` and ad-hoc lookups call the host's
`mcp__<server>__*` tools, and Cadence only ever writes the *results* to disk via
`cadence write-capture`. Two things to know under Auggie:

**Obtaining the OAuth token.** Auggie (0.30.0+) runs the full OAuth 2.1 flow for
HTTP MCP servers — well-known discovery, authorization-code grant, and dynamic
client registration — but only **interactively, via the `/mcp` command**. For a
server that returns `401` with a `WWW-Authenticate: Bearer resource_metadata=…`
header (Glean does):

1. Register the server in Auggie's MCP config.
2. Run `/mcp` in your Auggie session and complete the browser sign-in once.
3. Auggie now holds the token and exposes the server's `mcp__<server>__*` tools;
   `/cadence-mcp-pull` and ad-hoc lookups work from there.

You do **not** configure OAuth in Cadence — the host owns transport and auth.

**The standalone `cadence` CLI never performs its own MCP transport or OAuth.**
This is the host-agnostic rule (older notes phrase it Claude-Code-first, but the
gap is identical on every host): the bare `cadence` binary cannot reuse the token
the agent host obtained — not Claude Code's, not Auggie's. MCP always flows **host
tool call → result → `cadence write-capture`**. Running `cadence mcp-pull` outside
an agent session has no token and no transport; that's by design, not a gap.

## Known limitations / validation status

The transpile is faithful, but a few host details can only be confirmed against a
live Auggie session and are tracked as validation items:

- **CLI on PATH for the hook.** The SessionStart hook runs
  `sh -c 'NO_COLOR=1 CADENCE_VERB_PREFIX=/cadence- cadence status'` — shell-wrapped
  because Auggie spawns hooks directly (no shell), so a bare inline `VAR=value`
  prefix fails with `spawn NO_COLOR=1 ENOENT` (issue #11). If Auggie does not
  expose the plugin's `bin/` on PATH, set an absolute path via
  `sessionStartCommand` in `src/auggie/overrides.yaml` (give the inner command —
  it's shell-wrapped for you) and regenerate.
- **Verb hints in agent-run CLI output.** The `CADENCE_VERB_PREFIX=/cadence-`
  env var makes the shared CLI print Auggie-correct hints. The hook sets it
  inline; for CLI calls the agent makes mid-session, set it in your Auggie
  session environment so all human output uses the flat prefix.
- **Model identifiers.** Subagent models are mapped (`haiku→haiku4.5`,
  `sonnet→sonnet4.5`). Correct the exact ids in `overrides.yaml` → `models` if
  Auggie names them differently.
- **Subagent tool names.** The `tools` allowlist is carried over verbatim; if
  Auggie's tool names differ, adjust per-agent in the source plugin.
- **Plugin manifest schema.** `.augment-plugin/plugin.json` mirrors the portable
  fields; refine if Auggie requires additional keys.

## For contributors

- **Never edit `auggie-plugin/` by hand.** It is generated. Edit the source
  plugin in `cadence-plugin/` (and `src/` for the CLI), then regenerate.
- Regenerate after touching the plugin or the transpiler:
  ```bash
  npm run bundle            # only if you changed src/
  cadence build-auggie      # regenerate auggie-plugin/
  ```
- The pre-commit hook regenerates automatically when `cadence-plugin/` or
  `src/auggie/` is staged; CI runs `cadence build-auggie --check` and fails on
  drift.
- Transpiler internals live in `src/auggie/` (`transform`, `rewrite`,
  `model-map`, `manifest`, `overrides`, `frontmatter`). Host-specific tweaks that
  can't be derived mechanically go in `src/auggie/overrides.yaml`.
