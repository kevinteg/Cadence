import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'
import type { McpServerConfig } from '../../types.js'
import {
  handshakeFailed,
  notConfigured,
  serverError,
  spawnFailed,
  timeout,
} from './errors.js'

/**
 * Minimal resource metadata returned by listResources. Slimmed down
 * from the SDK's richer shape — annotations, size, and _meta are
 * intentionally dropped: the v1 capture path doesn't use them, and
 * surfacing them invites premature dependency on shape that may
 * shift.
 */
export type McpResource = {
  uri: string
  name: string
  description?: string
  mimeType?: string
}

/**
 * Single resource read result. Text resources populate `text`;
 * binary resources are flagged but their bytes are intentionally
 * dropped (the capture primitive is text-only, and we don't want
 * to silently truncate binary data). Callers route on `isBinary`.
 */
export type McpResourceContent = {
  uri: string
  mimeType?: string
  text?: string
  isBinary: boolean
}

export interface McpClient {
  listResources(): Promise<McpResource[]>
  readResource(uri: string): Promise<McpResourceContent>
  close(): Promise<void>
}

export type ConnectOpts = {
  /**
   * Bearer token override for HTTP transports. When set, the value is
   * threaded into the request as `Authorization: Bearer <token>`,
   * replacing any Authorization header already on cfg.headers.
   * Sourced upstream from --token / CADENCE_MCP_TOKEN_<NAME>. Ignored
   * for stdio configs.
   */
  tokenOverride?: string
}

/**
 * Connects to a configured MCP server. Both stdio and HTTP transports
 * are wired; the returned client is single-use (open → list/read →
 * close). No connection pooling.
 *
 * All adapter-level failures surface as McpError; SDK-level failures
 * are wrapped so callers never see the raw SDK types.
 */
export async function connectMcpServer(
  cfg: McpServerConfig,
  opts: ConnectOpts = {},
): Promise<McpClient> {
  let transport: Transport
  if (cfg.kind === 'stdio') {
    try {
      transport = new StdioClientTransport({
        command: cfg.command,
        args: cfg.args,
        env: { ...process.env, ...cfg.env } as Record<string, string>,
        ...(cfg.cwd ? { cwd: cfg.cwd } : {}),
      })
    } catch (cause) {
      throw spawnFailed(cfg.name, cfg.command, cause)
    }
  } else {
    // kind === 'http'. SDK's StreamableHTTPClientTransport handles
    // both Streamable HTTP and SSE flavors against the same URL; auth
    // headers ride on requestInit.
    const headers: Record<string, string> = { ...cfg.headers }
    if (opts.tokenOverride) {
      headers['Authorization'] = `Bearer ${opts.tokenOverride}`
    }
    try {
      transport = new StreamableHTTPClientTransport(new URL(cfg.url), {
        requestInit: { headers },
      })
    } catch (cause) {
      // URL parsing throws synchronously; treat as a config error
      // surfaced under spawn_failed since the failure shape (can't
      // open the transport) is analogous to a missing stdio command.
      throw spawnFailed(cfg.name, cfg.url, cause)
    }
  }
  return createMcpClient(transport, cfg.name, cfg.timeoutMs)
}

/**
 * Internal seam — exported for tests. Takes any Transport (in
 * production: StdioClientTransport from connectMcpServer; in tests:
 * InMemoryTransport from the SDK's testing helpers) and wraps it in
 * the Cadence McpClient surface. All timeouts and error translation
 * live here, not in the transport-specific entry point.
 */
export async function createMcpClient(
  transport: Transport,
  serverName: string,
  timeoutMs: number,
): Promise<McpClient> {
  const client = new Client(
    { name: 'cadence', version: '0.1.0' },
    { capabilities: {} },
  )
  try {
    await withTimeout(
      client.connect(transport),
      timeoutMs,
      serverName,
      'initialize',
    )
  } catch (cause) {
    if (cause instanceof Error && cause.name === 'TimeoutError') throw cause
    throw handshakeFailed(serverName, cause)
  }

  return {
    async listResources(): Promise<McpResource[]> {
      try {
        const res = await withTimeout(
          client.listResources(),
          timeoutMs,
          serverName,
          'listResources',
        )
        return res.resources.map((r) => ({
          uri: r.uri,
          name: r.name,
          ...(r.description !== undefined ? { description: r.description } : {}),
          ...(r.mimeType !== undefined ? { mimeType: r.mimeType } : {}),
        }))
      } catch (cause) {
        if (cause instanceof Error && cause.name === 'TimeoutError') throw cause
        throw serverError(serverName, cause)
      }
    },

    async readResource(uri: string): Promise<McpResourceContent> {
      try {
        const res = await withTimeout(
          client.readResource({ uri }),
          timeoutMs,
          serverName,
          'readResource',
        )
        // The SDK returns an array of contents; we pick the first text
        // content if any exists. Multi-content reads (e.g., a resource
        // backed by several files) get the first; downstream pulls the
        // others if needed via a richer surface later.
        const first = res.contents[0]
        if (!first) {
          return { uri, isBinary: false }
        }
        const mimeType =
          typeof first.mimeType === 'string' ? first.mimeType : undefined
        if ('text' in first && typeof first.text === 'string') {
          return {
            uri: first.uri,
            ...(mimeType ? { mimeType } : {}),
            text: first.text,
            isBinary: false,
          }
        }
        return {
          uri: first.uri,
          ...(mimeType ? { mimeType } : {}),
          isBinary: true,
        }
      } catch (cause) {
        if (cause instanceof Error && cause.name === 'TimeoutError') throw cause
        throw serverError(serverName, cause)
      }
    },

    async close(): Promise<void> {
      try {
        await client.close()
      } catch {
        // Close errors are non-actionable — the process is going away
        // either way. Swallow rather than surface noise.
      }
    },
  }
}

/**
 * Resolves a server by name out of a config list. Centralized so the
 * not-configured error consistently lists alternatives.
 */
export function resolveMcpServer(
  servers: McpServerConfig[],
  name: string,
): McpServerConfig {
  const found = servers.find((s) => s.name === name)
  if (!found) {
    throw notConfigured(
      name,
      servers.map((s) => s.name),
    )
  }
  return found
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  serverName: string,
  op: string,
): Promise<T> {
  let timer: NodeJS.Timeout | undefined
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      const err = timeout(serverName, op, ms)
      // Tag with a name we can detect upstream so other catch blocks
      // don't re-wrap a timeout as e.g. handshakeFailed.
      ;(err as Error).name = 'TimeoutError'
      reject(err)
    }, ms)
  })
  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timer) clearTimeout(timer)
  }
}
