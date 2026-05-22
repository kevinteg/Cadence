---
description: Pull resources from an MCP server into thoughts/unprocessed/ as captures. Uses the agent's MCP tool surface (Claude Code handles transport + OAuth) and stamps each capture with mcp: frontmatter via cadence write-capture. Hidden verb — not on the 12-verb surface. TRIGGER ONLY when the user explicitly invokes /cadence:mcp-pull. SKIP all natural-language equivalents — never auto-fire from "pull from glean", "ingest the corpus", or similar; surface the verb name as a suggestion when such language appears.
---

# /mcp-pull

Hidden verb — not in the visible 12-verb catalogue; explicit
invocation only. Drives MCP integration through the agent's normal
tool-call surface so Claude Code (the MCP host) owns the transport
and OAuth; Cadence owns the file write.

Reference `workflows/verb-contracts.md` for the mcp-pull register.

## Usage

- `/cadence:mcp-pull <server>` — interactively walk a server's resources, write captures
- `/cadence:mcp-pull <server> <filter>` — narrow by case-insensitive substring against name/uri/description
- `/cadence:mcp-pull` — no-arg: list available servers via `cadence mcp-list`, ask which to pull from

## Steps

### 1. Find the server's tool surface

MCP servers registered with Claude Code expose tools to the agent under the `mcp__<server>__<tool>` naming convention. Cadence does not maintain its own registry view — Claude Code's tool surface is the only source of truth. Use `ToolSearch` to enumerate:

```
ToolSearch with query "+mcp__<server>__"
```

- **No tools matched:** the server isn't registered (or isn't named what the user typed). Surface the install hint and exit:

  ```
  No MCP server named "<server>" is available to the agent. Register
  one with `claude mcp add <name> <url-or-command> [--transport http]`
  and start a new Claude Code session so the tools are loaded.
  ```

- **Tools matched but the user supplied no `<server>`:** group the matched tool names by their `<server>` segment and ask which to pull from.

### 2. Adapt to what the server exposes

MCP servers vary. Some expose `list_resources` + `read_resource` (the standard MCP surface), others only expose `search` + a per-result read (e.g., enterprise search like Glean). Decide from the matched tool names:

- **If `list_resources` (or similar — `list_documents`, `list_files`) is available:** call it to enumerate candidates.
- **If only `search` (or `query`, etc.) is available:** ask the user for a query, call it, take the top N results as candidates.
- **If neither is obvious:** show the matched tool list to the user and ask which to use as the enumeration surface.

### 3. Apply the filter (if provided)

When the user supplied a filter argument and the enumeration came from a `list`-style call, narrow the candidates to entries whose name / uri / description contain the substring (case-insensitive). When the enumeration came from `search`, the filter is redundant — the query already filtered. Skip the substring narrow in that case.

### 4. Show the user what's about to be pulled

ELI5 surface before writing — N captures are non-trivial state. Present:

```
About to pull <N> resources from <server> into thoughts/unprocessed/:
  - <uri-or-name-1>
  - <uri-or-name-2>
  - ...
Proceed? [y/n/limit:<N>]
```

Accept `y` (write all), `n` (cancel), or `limit:<N>` (write first N). Default to asking unless the user supplied an unambiguous one-shot intent.

### 5. Read each resource, write a capture

For each resource:

1. Read the resource via the server's `read_resource` tool (or equivalent — `get_document`, `fetch`, etc.).
2. Skip if the content is binary (no text, or `mimeType` starts with `image/`, `application/octet-stream`, etc.). Track as `skipped_binary` in the running tally.
3. Call `cadence write-capture` with the MCP fields:
   ```bash
   cadence write-capture \
     --body "$(printf '# %s\n\n> %s\n\nSource: `%s` → %s\n\n---\n\n%s\n' "<name>" "<description-if-any>" "<server>" "<uri>" "<text>")" \
     --verb-context "mcp-pull:<server>" \
     --mcp-server <server> \
     --mcp-uri <uri> \
     --mcp-mime-type <mime-if-known>
   ```
4. The CLI auto-computes `content_hash` (sha256 of body) and auto-dedups against existing captures by uri and by content hash. The result JSON tells you which happened:
   - `{kind: "written", path}` — new capture created
   - `{kind: "skipped_existing", reason: "uri_seen", path}` — same URI already captured (pull is idempotent)
   - `{kind: "skipped_existing", reason: "content_hash_seen", path}` — same body already captured under a different URI (rename-resilient)
5. If `write-capture` errors (transient I/O, etc.), capture the message in a running error list and continue — one resource shouldn't abort the batch.

### 6. Summarize

```
Pulled <N> resources from <server>:
  - <W> written
  - <S> skipped (existing)
  - <B> skipped (binary)
  - <E> errors
```

If any captures were written, suggest `/cadence:reflect` (or specifically the Get Clear phase) for triage. If everything was deduped, say so without ceremony — that's the steady-state result for repeat pulls.

End with the verb-hint block + teaching footer per the universal exit convention (`cadence tip-pick --triggers verb-mcp-pull`).

## Guardrails

- **No client code in Cadence.** Don't shell out to a Cadence-owned MCP transport; use the agent's `mcp__<server>__*` tools directly. Claude Code owns the host responsibilities (transport, OAuth, lifecycle). Cadence keeps no parallel registry — the agent's tool surface is the only source of truth.
- **No auto-fire from natural language.** A user saying "pull from glean" or "let's ingest the corpus" gets a suggestion, not an execution: "you can run `/cadence:mcp-pull glean`". Hidden state-modifying verbs are explicit-only (see runtime "Suggest-don't-run for hidden state-modifying verbs").
- **No fuzzy guess on resource selection.** When the server exposes thousands of resources, ask for a filter or query rather than pulling everything. Don't drown the parking lot.
- **Always show what will be written before writing.** ELI5 surface in step 4 is mandatory — the user should be able to cancel before any file is touched.
- **Binary resources are skipped, not transformed.** Capture is a text primitive. A future skill might handle binary (saved to `pursuits/.../media/`), but `/mcp-pull` writes captures only.
- **Tool calls are read-only.** `/mcp-pull` reads resources; it never invokes write-flavored MCP tools on the remote server. If a server exposes mutation tools, those are out of scope here.
