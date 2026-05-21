import { readFile } from 'node:fs/promises'
import path from 'node:path'
import yaml from 'js-yaml'
import {
  type Config,
  CONFIG_DEFAULTS,
  ConfigSchema,
  MCP_DEFAULT_TIMEOUT_MS,
  type McpServerConfig,
  type RawConfig,
} from './types.js'
import { discoverMcpServers, mergeMcpRegistry } from './integrations/mcp/discovery.js'

/**
 * Reads cadence.yaml from the repo root, applies defaults, and returns a
 * flat Config object. Missing file is fine — defaults apply.
 *
 * MCP servers in the returned Config are the *merged* registry:
 * `cadence.yaml mcp_servers` + `.mcp.json` (project) + `~/.claude.json`
 * (user), with cadence.yaml winning on name collision. Callers that
 * need source provenance use `discoverMcpServers` + `mergeMcpRegistry`
 * directly (the `cadence mcp-list` subcommand does this).
 */
export async function loadConfig(repoRoot: string): Promise<Config> {
  const configPath = path.join(repoRoot, 'cadence.yaml')
  let raw: RawConfig = ConfigSchema.parse({})
  try {
    const text = await readFile(configPath, 'utf8')
    const parsed = yaml.load(text, { schema: yaml.CORE_SCHEMA }) ?? {}
    raw = ConfigSchema.parse(parsed)
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
  }
  const cfg = mergeDefaults(raw, process.env)
  const discovered = await discoverMcpServers(repoRoot)
  const { servers } = mergeMcpRegistry(cfg.mcp_servers, discovered)
  return { ...cfg, mcp_servers: servers }
}

/**
 * Returns just the cadence.yaml `mcp_servers` entries (without the
 * discovery merge). Used by `cadence mcp-list` to tell the user which
 * servers come from cadence.yaml vs from discovered files. Regular
 * consumers should call `loadConfig` and read `cfg.mcp_servers` for
 * the merged live registry.
 */
export async function loadCadenceYamlMcpServers(
  repoRoot: string,
): Promise<McpServerConfig[]> {
  const configPath = path.join(repoRoot, 'cadence.yaml')
  let raw: RawConfig = ConfigSchema.parse({})
  try {
    const text = await readFile(configPath, 'utf8')
    const parsed = yaml.load(text, { schema: yaml.CORE_SCHEMA }) ?? {}
    raw = ConfigSchema.parse(parsed)
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
  }
  return normalizeMcpServers(raw.mcp_servers ?? [], process.env)
}

function mergeDefaults(
  raw: RawConfig,
  env: NodeJS.ProcessEnv = process.env,
): Config {
  const d = raw.defaults ?? {}
  const wip = raw.wip_limits ?? {}
  const reflect = raw.reflect ?? {}
  const wc = raw.win_cycles ?? {}
  return {
    waiting_for_grace_days:
      d.waiting_for_grace_days ?? CONFIG_DEFAULTS.waiting_for_grace_days,
    dormant_days: d.dormant_days ?? CONFIG_DEFAULTS.dormant_days,
    max_active_projects:
      wip.max_active_projects ?? CONFIG_DEFAULTS.max_active_projects,
    someday_review: d.someday_review ?? CONFIG_DEFAULTS.someday_review,
    reflect_day: reflect.day ?? CONFIG_DEFAULTS.reflect_day,
    reflect_duration_minutes:
      reflect.duration_minutes ?? CONFIG_DEFAULTS.reflect_duration_minutes,
    incoming_queue_threshold:
      d.incoming_queue_threshold ?? CONFIG_DEFAULTS.incoming_queue_threshold,
    incoming_queue_cache_ttl_minutes:
      d.incoming_queue_cache_ttl_minutes ??
      CONFIG_DEFAULTS.incoming_queue_cache_ttl_minutes,
    inbox_seed_stale_days:
      d.inbox_seed_stale_days ?? CONFIG_DEFAULTS.inbox_seed_stale_days,
    inbox_seed_softcap:
      d.inbox_seed_softcap ?? CONFIG_DEFAULTS.inbox_seed_softcap,
    mcp_servers: normalizeMcpServers(raw.mcp_servers ?? [], env),
    win_cycle_current: wc.current,
    win_cycle_start: wc.start,
    win_cycle_end: wc.end,
    win_cycle_mid_check: wc.mid_check,
  }
}

/**
 * Translates the raw YAML representation into the flat McpServerConfig
 * shape consumed by the adapter. Two transformations happen here:
 *
 * 1. `${env:NAME}` references inside string values are expanded against
 *    `env`. Missing variables throw with a message that points at the
 *    server name + the missing key — fail loudly at load, not at
 *    first use.
 * 2. Per-server `timeout_ms` is folded into `timeoutMs` with the
 *    MCP_DEFAULT_TIMEOUT_MS fallback so the adapter never sees `undefined`.
 *
 * Duplicate server names raise immediately — alias collisions would
 * silently shadow each other downstream.
 */
function normalizeMcpServers(
  raw: RawConfig['mcp_servers'],
  env: NodeJS.ProcessEnv,
): McpServerConfig[] {
  if (!raw || raw.length === 0) return []
  const seen = new Set<string>()
  return raw.map((s) => {
    if (seen.has(s.name)) {
      throw new Error(`duplicate MCP server name in cadence.yaml: ${s.name}`)
    }
    seen.add(s.name)
    if (s.transport === 'stdio') {
      return {
        kind: 'stdio',
        name: s.name,
        command: expandEnv(s.command, env, s.name),
        args: s.args.map((a) => expandEnv(a, env, s.name)),
        env: Object.fromEntries(
          Object.entries(s.env).map(([k, v]) => [k, expandEnv(v, env, s.name)]),
        ),
        ...(s.cwd ? { cwd: expandHome(expandEnv(s.cwd, env, s.name)) } : {}),
        timeoutMs: s.timeout_ms ?? MCP_DEFAULT_TIMEOUT_MS,
      }
    }
    return {
      kind: 'http',
      name: s.name,
      url: expandEnv(s.url, env, s.name),
      headers: Object.fromEntries(
        Object.entries(s.headers).map(([k, v]) => [k, expandEnv(v, env, s.name)]),
      ),
      timeoutMs: s.timeout_ms ?? MCP_DEFAULT_TIMEOUT_MS,
    }
  })
}

const ENV_REF = /\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g

function expandEnv(
  value: string,
  env: NodeJS.ProcessEnv,
  serverName: string,
): string {
  return value.replace(ENV_REF, (_, name: string) => {
    const v = env[name]
    if (v === undefined) {
      throw new Error(
        `MCP server '${serverName}' references missing env var ${name}`,
      )
    }
    return v
  })
}

function expandHome(value: string): string {
  if (value === '~') return process.env['HOME'] ?? value
  if (value.startsWith('~/')) {
    const home = process.env['HOME']
    return home ? path.join(home, value.slice(2)) : value
  }
  return value
}
