---
id: mcp-integration-story
pursuit: make-cadence-public
status: active
created: 2026-05-21
origin:
  kind: github_issue
  repo: kevinteg/Cadence
  number: 1
  url: https://github.com/kevinteg/Cadence/issues/1
---

# MCP integration story: clean Glean (and other-MCP) consumption in Cadence

Triaged from issue #1: https://github.com/kevinteg/Cadence/issues/1

## Intent

Cadence is a *client* of MCP servers, not a host — the cognitive-OS layer should be able to read from external corpora (Glean today, others tomorrow) without owning the transport or becoming a host of arbitrary tool calls. The integration path needs to be **generic over MCP servers** so no specific server becomes a hard dependency: Glean is the validation target because the user has a live one on their work machine, but the contract has to work for any MCP server reachable via stdio or HTTP.

The work splits into two arcs that run in parallel and inform each other:

1. **Design (here, on the personal repo).** Sketch the smallest useful MCP-client surface inside Cadence: configuration shape (named servers in `cadence.yaml`), a thin adapter that wraps a single MCP server's list/read/call primitives, and one integration point against an existing Cadence primitive to keep scope honest. Cleanest first-target: read MCP resources into `thoughts/unprocessed/` as captures — same flow-safe primitive `/capture` writes, no new entity type required, and the user can already see the result in `/reflect` Get Clear. The other use cases (calendar → actions, corpus → learning curation, demos → narratives) stay parked until the capture path works.

2. **Validate (on the work computer with the real Glean MCP server).** The personal repo can't reach the work MCP server, so all live testing happens there. The user runs the path end-to-end, captures what worked / what broke / what was surprising, and relays it back to this repo for iteration. This is the loop that keeps the design from drifting into theoretical territory — every design assumption gets a real-server reality check before it hardens.

What this project does *not* solve: making Cadence an MCP host (we'd surface our own tools to other agents), surfacing MCP-aware tool calls inside Cadence skills, or building Glean-specific transformations. Those are downstream — they only become worth considering after the read-into-captures path proves itself useful.

Out of scope, but worth noting once: the original issue suggested three use cases (calendar augmentation, learning-curation corpus, demo capture). Pick ONE for the first integration; the rest go on the project's Notes section or become follow-up projects.

## Background

Originally surfaced during an Inbox brainstorm session for personal onboarding planning (2026-05-21). The user wanted Glean to feed the Cadence operating layer cleanly without making Glean a hard dependency. The three use cases named at filing time:

1. **Glean reads calendar + obligation sources → augments Cadence project/action layer.** Cadence shows next-best work given external due dates / meetings.
2. **Glean serves as the corpus a Claude-driven learning-curation system queries against.** The protected learning half-hour gets filled with next-best content automatically.
3. **Tech-talks / demos / interactions captured via Glean flow back into Cadence narratives.** Less re-typing, more compounding knowledge.

Filed by user ktegtmeier-nexthop via claude-code.

## Notes

### Adapter contract sketch (action 2)

Three pieces: config shape in `cadence.yaml`, a thin TypeScript client surface, and how named servers get referenced from skills/CLI.

**1. Config shape (`cadence.yaml`).** Add a top-level `mcp_servers:` array. Stdio transport is v1; HTTP is the shape we leave room for but don't ship yet.

```yaml
mcp_servers:
  - name: glean                 # alias used by --server flag and skills
    transport: stdio            # v1: stdio only. Schema permits 'http' but the adapter rejects it.
    command: glean-mcp          # executable on PATH
    args: ["--profile", "default"]
    env:                        # optional; merged with parent env at spawn
      GLEAN_TOKEN: ${env:GLEAN_TOKEN}   # ${env:NAME} expanded at config load
    cwd: ~/.glean               # optional; tilde expanded
    timeout_ms: 10000           # optional per-call timeout (default 10000)
  - name: time
    transport: stdio
    command: uvx
    args: ["mcp-server-time"]
```

`${env:NAME}` expansion happens once at `loadConfig` time, so the adapter never sees raw `${...}` strings. Missing env vars surface a clear "MCP server 'glean' references missing env var GLEAN_TOKEN" error at the CLI boundary — not at first call.

Future HTTP shape (parsed-but-rejected by v1 adapter):
```yaml
  - name: remote-mcp
    transport: http
    url: https://mcp.example.com/foo
    headers: { Authorization: "Bearer ${env:FOO_TOKEN}" }
```

**2. TypeScript client surface (`src/integrations/mcp/client.ts`).** Thin wrapper over `@modelcontextprotocol/sdk` (recommend adopting — it's the standard transport + JSON-RPC + framing; rolling our own is busy work that pays nothing). Stateless by default: connect → list/read → close. No connection pooling in v1 — open cost is dominated by subprocess spawn, but the CLI pull flow is batchy so one connection per pull is fine.

```typescript
export type McpServerConfig =
  | { kind: 'stdio'; name: string; command: string; args: string[]; env: Record<string, string>; cwd?: string; timeoutMs: number }
  // | { kind: 'http'; ... }  // deferred to v2

export type McpResource = {
  uri: string
  name?: string
  description?: string
  mimeType?: string
}

export type McpResourceContent = {
  uri: string
  mimeType?: string
  text?: string         // populated for text/* mimeTypes
  blob?: Uint8Array     // populated for binary mimeTypes (v1: we ignore blob, captures are text-only)
}

export interface McpClient {
  listResources(): Promise<McpResource[]>
  readResource(uri: string): Promise<McpResourceContent>
  close(): Promise<void>
}

export async function connectMcpServer(cfg: McpServerConfig): Promise<McpClient>
```

What's deliberately out:
- `listTools` / `callTool` — v1 is read-only consumption. Tool-call surfaces would let an MCP server *mutate* Cadence state, which is a much bigger trust call. Park it.
- `listPrompts` / `getPrompt` — no current use case in Cadence.
- Resource subscriptions — pull-only model; subscription needs a long-lived process.

**3. How named servers get referenced.** Two surfaces:

- **CLI:** `cadence mcp-pull --server glean [--filter <substring>] [--limit N] [--dry-run]`. Resolves `--server` against `mcp_servers[*].name`; clean error if not found.
- **Skills:** future skill code reads `mcp_servers` from the Config object via the same `loadConfig` path everything else uses. Skills never poke at YAML directly. (No skill needs this yet — v1 is CLI-driven.)

Config defaults: empty `mcp_servers: []` is valid (means "no MCP integration on this repo"). The CLI subcommand errors gracefully when no servers are configured.

**Failure modes the adapter exposes to callers:**
- Server name not in config → `McpError.NotConfigured`
- Subprocess spawn fails (command not on PATH) → `McpError.SpawnFailed` with the underlying error
- Handshake fails / timeout → `McpError.HandshakeFailed`
- Per-call timeout → `McpError.Timeout`
- Server returns error → `McpError.ServerError(code, message)`

Callers (the `mcp-pull` subcommand) translate these into one-line CLI errors with actionable next steps. No silent failures.

### Open contract questions worth deferring

- **Dedup strategy for action 5.** When we pull resources twice, we don't want N copies of the same capture. Naive option: dedup by `uri` (skip if a capture with the same `mcp_uri` exists). Better option: hash the content + write a `mcp_uri` + `mcp_content_hash` to capture frontmatter so the dedup is precise. Park this until action 5.
- **What counts as "the right resources to pull"?** MCP servers can expose enormous resource lists (Glean's corpus could be huge). Need a filter strategy — substring, glob, MIME, an LLM relevance gate? Park this; first cut just uses `--filter <substring>` and `--limit N`.
- **Should Cadence ever invoke tools on an MCP server?** v1: no. Once the read path proves useful, revisit. Probably wants a separate confirmation surface (like /report's warn-and-confirm) because tool-calls can be destructive.

### Architecture pivot (post-validation-attempt)

The first validation attempt against the real Glean MCP server (HTTP, OAuth-gated) failed at handshake because Cadence's standalone MCP client doesn't share Claude Code's OAuth token. Investigation showed the token isn't on disk — it lives in macOS Keychain — and `claude mcp get` deliberately doesn't surface it.

The user pushed back on the architecture: *"Why did you put MCP integration in the cadence command? The cadence command is for manipulating the pursuit/project/action hierarchy. How do plugins normally leverage MCP servers?"*

That critique was correct. The cadence CLI is for file-hierarchy mutations against the local repo. MCP integration is network I/O against external systems with credentials. They don't belong in the same module, and the Claude Code plugin model already provides the right shape:

- **Claude Code is the MCP host.** It owns the transport, OAuth, token storage, session lifecycle.
- **Plugins consume MCP via the agent's tool-call surface.** When a server is registered via `claude mcp add`, Claude Code exposes its tools as `mcp__<server>__<tool>` to the agent. Plugin skills invoke those directly — no client code needed inside the plugin.
- **Plugins can host their own MCP servers** by declaring `mcpServers` in plugin metadata, but that's "the plugin ships a server," not "the plugin talks to one." Different concern.

Building a separate MCP client inside the cadence CLI was solving a problem Claude Code already solves — and inheriting all the auth/transport complexity along the way. The pivot drops the standalone client entirely:

- **Stays:** discovery (`cadence mcp-list`), capture `mcp:` frontmatter shape, the project's intent and architectural notes, all dedup logic (moves to the skill).
- **Goes:** `src/integrations/mcp/{client,pull,errors}.ts`, the `cadence mcp-pull` CLI subcommand, the `--token` / env-var workaround, the `@modelcontextprotocol/sdk` dependency.
- **New:** a `/cadence:mcp-pull` skill (hidden verb, parallel to `/incoming`) that uses the agent's MCP tool surface to list/read; `cadence write-capture` gains `--mcp-*` flags so the skill can stamp captures with `mcp:` frontmatter via the CLI; dedup logic lives in the new write-capture flags (uri-seen + content-hash-seen short-circuits).

This solves the OAuth problem for free: the agent's tool calls go through Claude Code, which already holds the token. It also restores Cadence CLI's single responsibility (manipulate local file state) and aligns with how Claude Code plugins normally integrate.

## Actions

- [x] Read the issue thread and decide first concrete move.
- [x] Sketch the MCP-client adapter contract — what surface does Cadence wrap (list_resources / read_resource / list_tools / call_tool), what does the cadence.yaml config shape look like, how do named servers get referenced from skills/CLI
- [x] Decide the first integration target — recommendation: MCP resources → captures (writes to thoughts/unprocessed/ via the same primitive as /capture). Lock in the scope before coding.
- [x] Implement the minimal MCP-client adapter (TypeScript). Stdio transport first; HTTP later if needed. No real server required at this step — unit-tested against a fake MCP responder.
- [x] Wire a cadence:mcp-pull CLI subcommand (or extend an existing verb) that reads a named MCP server's resources and writes each as a capture. Includes server selection, resource filter, dedup against existing captures.
- [x] Document the cadence.yaml mcp_servers shape + the mcp-pull surface in cadence-reference.md and workflows/verb-contracts.md.
- [ ] VALIDATE on work computer: user runs cadence:mcp-pull against the real Glean MCP server, captures what worked / what broke / what was surprising, relays findings back here for iteration. Loop until the first integration target is genuinely useful, not just functional.
- [x] Add MCP server discovery — read ~/.claude.json mcpServers (user scope) + <repoRoot>/.mcp.json (project scope) into the same McpServerConfig[] shape. Merge with cadence.yaml entries; precedence cadence.yaml > .mcp.json > ~/.claude.json. Surface via new 'cadence mcp-list' subcommand for verification.
- [x] Add HTTP transport to the adapter — wrap SDK's StreamableHTTPClientTransport, thread auth headers from cfg.headers via requestInit, get the same timeout + error-wrapping treatment as stdio. Stop rejecting kind: http at the adapter boundary.
- [x] ~~Investigate Claude Code's OAuth token store and auto-share credentials with Cadence for HTTP MCP servers~~ **dropped — wrong layer.** Diagnostic on work computer showed `claude mcp get` doesn't expose the token and `~/.claude/` has no cred files (token lives in macOS Keychain). Reading the keychain entry directly would couple us to Claude Code's internals; building our own OAuth client duplicates work the host already does. The right answer is to stop trying to talk to the MCP server ourselves — let Claude Code (the host) do it, and have Cadence consume MCP via the agent's tool-call surface. See "Architecture pivot" in Notes.
- [x] Extend `cadence write-capture` with `--mcp-server`, `--mcp-uri`, `--mcp-mime-type` flags. Auto-compute `mcp.content_hash` from body (sha256). Auto-dedup against existing captures by uri and by content hash; return `{kind: "skipped_existing", reason}` instead of writing when matched. This is the low-level write primitive a skill calls per-resource.
- [x] Create the `/cadence:mcp-pull` skill — hidden verb, explicit invocation only (analogous to `/incoming`). Orchestrates: resolve server via `cadence mcp-list --json`, use the agent's `mcp__<server>__*` tool surface to list/search and read resources, write each text result via `cadence write-capture --mcp-*` (which handles dedup). Skip binary resources. Summarize at end. No client code in Cadence — Claude Code owns the transport and OAuth.
- [x] Delete the now-obsolete CLI MCP client code: `src/integrations/mcp/{client,pull,errors}.ts`, the `cadence mcp-pull` subcommand, the `--token` / `CADENCE_MCP_TOKEN_*` workaround, the `@modelcontextprotocol/sdk` dependency, and the `test/mcp-client.test.ts` + `test/mcp-pull.test.ts` files. Keep discovery + `cadence mcp-list` + the capture `mcp:` frontmatter shape — all still load-bearing.
