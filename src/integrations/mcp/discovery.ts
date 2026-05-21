import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { MCP_DEFAULT_TIMEOUT_MS, type McpServerConfig } from '../../types.js'

/**
 * Where a particular McpServerConfig came from. Surfaced by
 * `cadence mcp-list` so users can tell which file owns a given entry
 * when they want to edit it.
 *
 * Precedence (most-local wins on name collision): `cadence-yaml` >
 * `mcp-project` > `claude-user`. Lower-priority entries are dropped
 * silently — the merged result presents what's actually live.
 */
export type McpServerSource =
  | 'cadence-yaml'   // declared in cadence.yaml mcp_servers
  | 'mcp-project'    // declared in <repoRoot>/.mcp.json
  | 'claude-user'    // declared in ~/.claude.json mcpServers

export type DiscoveredServer = McpServerConfig & { source: McpServerSource }

export type DiscoveryOpts = {
  /**
   * Test seam — overrides $HOME. Production calls leave this unset.
   */
  homeDir?: string
}

/**
 * Reads `.mcp.json` (project) and `~/.claude.json` (user), parses
 * tolerantly, and returns the discovered servers in lowest-to-highest-
 * priority order. The caller merges this with `cadence.yaml` entries
 * and applies cadence-yaml-wins-on-collision via mergeMcpRegistry().
 */
export async function discoverMcpServers(
  repoRoot: string,
  opts: DiscoveryOpts = {},
): Promise<DiscoveredServer[]> {
  const homeDir = opts.homeDir ?? os.homedir()
  const userServers = await readClaudeUserServers(homeDir)
  const projectServers = await readProjectMcpServers(repoRoot)
  return [...userServers, ...projectServers]
}

/**
 * Merges discovered servers with cadence.yaml entries under the
 * precedence cadence-yaml > mcp-project > claude-user. Name collisions
 * resolve to the higher-priority source. Returns the live registry +
 * a map keyed by name → source so callers (mcp-list) can show
 * provenance without re-walking the input.
 */
export function mergeMcpRegistry(
  cadenceYamlServers: McpServerConfig[],
  discovered: DiscoveredServer[],
): { servers: McpServerConfig[]; sources: Map<string, McpServerSource> } {
  const merged = new Map<string, DiscoveredServer>()
  for (const s of discovered) {
    // discovered[] arrives in low→high order (user, then project),
    // so a later same-name entry simply overwrites — exactly the
    // precedence we want.
    merged.set(s.name, s)
  }
  for (const s of cadenceYamlServers) {
    merged.set(s.name, { ...s, source: 'cadence-yaml' })
  }
  const servers: McpServerConfig[] = []
  const sources = new Map<string, McpServerSource>()
  for (const [name, entry] of merged) {
    const { source: _ignored, ...rest } = entry
    void _ignored
    servers.push(rest as McpServerConfig)
    sources.set(name, entry.source)
  }
  return { servers, sources }
}

async function readClaudeUserServers(homeDir: string): Promise<DiscoveredServer[]> {
  const candidate = path.join(homeDir, '.claude.json')
  if (!existsSync(candidate)) return []
  return parseMcpServersFile(candidate, 'claude-user')
}

async function readProjectMcpServers(repoRoot: string): Promise<DiscoveredServer[]> {
  const candidate = path.join(repoRoot, '.mcp.json')
  if (!existsSync(candidate)) return []
  return parseMcpServersFile(candidate, 'mcp-project')
}

/**
 * Tolerant parser for the Claude-Code / MCP-spec `mcpServers` shape.
 * Both files use the same top-level structure:
 *
 *   { "mcpServers": { "<name>": { ...entry... } } }
 *
 * Entries don't always carry an explicit `type` field — we infer
 * stdio when `command` is present and http when `url` is. Unknown
 * shapes are skipped rather than thrown so a single malformed entry
 * doesn't poison the registry.
 */
async function parseMcpServersFile(
  filePath: string,
  source: McpServerSource,
): Promise<DiscoveredServer[]> {
  let raw: string
  try {
    raw = await readFile(filePath, 'utf8')
  } catch {
    return []
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  const root = parsed as Record<string, unknown>
  const entries = root['mcpServers']
  if (!entries || typeof entries !== 'object') return []
  const out: DiscoveredServer[] = []
  for (const [name, val] of Object.entries(entries as Record<string, unknown>)) {
    const cfg = coerceEntry(name, val, source)
    if (cfg) out.push(cfg)
  }
  return out
}

function coerceEntry(
  name: string,
  raw: unknown,
  source: McpServerSource,
): DiscoveredServer | null {
  if (!raw || typeof raw !== 'object') return null
  const entry = raw as Record<string, unknown>
  const declaredType =
    typeof entry['type'] === 'string' ? (entry['type'] as string) : undefined
  const declaredTransport =
    typeof entry['transport'] === 'string'
      ? (entry['transport'] as string)
      : undefined
  const kindHint = declaredType ?? declaredTransport
  const url = typeof entry['url'] === 'string' ? (entry['url'] as string) : undefined
  const command =
    typeof entry['command'] === 'string' ? (entry['command'] as string) : undefined

  // Infer kind: explicit declaration wins; otherwise `url` → http,
  // `command` → stdio. http-style hints (http, https, sse, websocket)
  // all map to our single http kind since StreamableHTTPClientTransport
  // handles both Streamable HTTP and SSE.
  const isHttp =
    kindHint === 'http' ||
    kindHint === 'https' ||
    kindHint === 'sse' ||
    kindHint === 'streamable-http' ||
    (kindHint === undefined && url !== undefined)
  const isStdio =
    kindHint === 'stdio' ||
    (kindHint === undefined && command !== undefined)

  if (isHttp && url) {
    return {
      kind: 'http',
      name,
      url,
      headers: coerceStringMap(entry['headers']) ?? {},
      timeoutMs:
        typeof entry['timeout_ms'] === 'number'
          ? (entry['timeout_ms'] as number)
          : MCP_DEFAULT_TIMEOUT_MS,
      source,
    }
  }
  if (isStdio && command) {
    const args = Array.isArray(entry['args'])
      ? (entry['args'] as unknown[]).filter(
          (a): a is string => typeof a === 'string',
        )
      : []
    return {
      kind: 'stdio',
      name,
      command,
      args,
      env: coerceStringMap(entry['env']) ?? {},
      ...(typeof entry['cwd'] === 'string' ? { cwd: entry['cwd'] as string } : {}),
      timeoutMs:
        typeof entry['timeout_ms'] === 'number'
          ? (entry['timeout_ms'] as number)
          : MCP_DEFAULT_TIMEOUT_MS,
      source,
    }
  }
  return null
}

function coerceStringMap(v: unknown): Record<string, string> | undefined {
  if (!v || typeof v !== 'object') return undefined
  const out: Record<string, string> = {}
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof val === 'string') out[k] = val
  }
  return out
}
