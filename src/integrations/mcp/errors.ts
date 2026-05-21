/**
 * Adapter-level errors surfaced to callers as a discriminated union.
 * The CLI subcommand translates each into a one-line message with an
 * actionable next step; library callers (skills, tests) match on
 * `kind`.
 */
export type McpErrorKind =
  | 'not_configured'
  | 'spawn_failed'
  | 'handshake_failed'
  | 'timeout'
  | 'server_error'

export class McpError extends Error {
  readonly kind: McpErrorKind
  readonly hint?: string
  constructor(kind: McpErrorKind, message: string, hint?: string) {
    super(message)
    this.name = 'McpError'
    this.kind = kind
    if (hint !== undefined) this.hint = hint
  }
}

export function notConfigured(name: string, available: string[]): McpError {
  const list = available.length === 0 ? '(none)' : available.join(', ')
  return new McpError(
    'not_configured',
    `MCP server '${name}' is not declared in cadence.yaml`,
    `Available: ${list}. Add an entry under mcp_servers: in cadence.yaml.`,
  )
}

export function spawnFailed(name: string, command: string, cause: unknown): McpError {
  const msg = cause instanceof Error ? cause.message : String(cause)
  return new McpError(
    'spawn_failed',
    `failed to spawn MCP server '${name}' (${command}): ${msg}`,
    'Check that the command is installed and on PATH.',
  )
}

export function handshakeFailed(name: string, cause: unknown): McpError {
  const msg = cause instanceof Error ? cause.message : String(cause)
  // OAuth-gated HTTP servers commonly fail handshake with 401/403.
  // Suggest the --token / env-var override so users have a path
  // forward without needing to read source.
  const looksLikeAuth =
    /401|403|unauthor|forbidden|oauth/i.test(msg) ||
    /unexpected status/i.test(msg)
  const hint = looksLikeAuth
    ? `Server may require OAuth. Supply a bearer token via --token <value> or set CADENCE_MCP_TOKEN_${name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}=<value>.`
    : undefined
  return new McpError(
    'handshake_failed',
    `MCP server '${name}' refused the initialize handshake: ${msg}`,
    hint,
  )
}

export function timeout(name: string, op: string, ms: number): McpError {
  return new McpError(
    'timeout',
    `MCP server '${name}' did not respond to ${op} within ${ms}ms`,
  )
}

export function serverError(name: string, cause: unknown): McpError {
  const msg = cause instanceof Error ? cause.message : String(cause)
  return new McpError('server_error', `MCP server '${name}' returned an error: ${msg}`)
}
