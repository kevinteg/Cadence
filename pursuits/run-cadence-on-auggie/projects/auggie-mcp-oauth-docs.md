---
id: auggie-mcp-oauth-docs
pursuit: run-cadence-on-auggie
status: active
created: 2026-06-26
origin:
  kind: github_issue
  repo: kevinteg/Cadence
  number: 12
  url: https://github.com/kevinteg/Cadence/issues/12
---

# Auggie as host: MCP OAuth undocumented + mcp-pull gotcha is Claude-Code-specific

Triaged from issue #12: https://github.com/kevinteg/Cadence/issues/12

## Intent

The Cadence MCP docs are Claude-Code-first, leaving gaps for users running Auggie as the agent host (hit while consuming Glean MCP). Two parts. (1) No documented way to obtain the OAuth token under Auggie: Auggie 0.30.0 runs the full OAuth 2.1 flow (well-known discovery, authorization-code grant, dynamic client registration) but only interactively via /mcp; this should be a documented step, not reverse-engineered from the binary and the server 401 WWW-Authenticate metadata. (2) The mcp-pull gotcha is Claude-Code-specific (the standalone CLI does not pick up Claude Code's OAuth token); the same gap exists under Auggie, so reframe as the general rule: the standalone cadence CLI never performs its own MCP transport or OAuth; it relies on the agent host surfacing mcp__server__* tool results and only writes captures via write-capture. Done looks like: docs/running-on-auggie.md (or the MCP reference) documents the Auggie /mcp OAuth step and states the host-agnostic mcp-pull rule.

## Actions

- [x] Document the Auggie /mcp OAuth flow and the host-agnostic mcp-pull rule in docs/running-on-auggie.md
  - docs/running-on-auggie.md: new 'MCP servers' section (Auggie /mcp OAuth flow + host-agnostic mcp-pull rule); also de-staled the SessionStart hook bullet for the #11 shell-wrap.
