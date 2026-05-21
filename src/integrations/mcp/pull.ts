import { createHash } from 'node:crypto'
import type { Config } from '../../types.js'
import { scanCaptures } from '../../scan/captures.js'
import { writeCapture } from '../../write/capture.js'
import { timestampSlug } from '../../write/util.js'
import {
  connectMcpServer,
  resolveMcpServer,
  type McpClient,
  type McpResource,
} from './client.js'

export type PullOpts = {
  serverName: string
  filter?: string
  limit?: number
  dryRun?: boolean
  now?: Date
  /**
   * Test seam — overrides the real stdio connect with an injected
   * client. Production callers (the CLI subcommand) leave this unset.
   */
  connect?: (cfg: ReturnType<typeof resolveMcpServer>) => Promise<McpClient>
}

export type PullResultEntry =
  | { kind: 'written'; uri: string; path: string }
  | { kind: 'skipped_existing'; uri: string; reason: 'uri_seen' | 'content_hash_seen' }
  | { kind: 'skipped_binary'; uri: string; mimeType?: string }
  | { kind: 'error'; uri: string; message: string }

export type PullResult = {
  server: string
  dry_run: boolean
  total_listed: number
  after_filter: number
  entries: PullResultEntry[]
  summary: {
    written: number
    skipped_existing: number
    skipped_binary: number
    errors: number
  }
}

/**
 * Runs the read-resources → write-captures path against a configured
 * MCP server. Dedup is keyed on `mcp.uri` first (fastest) and falls
 * back to content hash so renamed/republished resources don't
 * duplicate. Dry-run lists what would be written without touching
 * disk or the network beyond the listing call.
 */
export async function pullMcpServerResources(
  repoRoot: string,
  config: Config,
  opts: PullOpts,
): Promise<PullResult> {
  const serverCfg = resolveMcpServer(config.mcp_servers, opts.serverName)
  const connector = opts.connect ?? connectMcpServer
  const client = await connector(serverCfg)

  const result: PullResult = {
    server: opts.serverName,
    dry_run: opts.dryRun ?? false,
    total_listed: 0,
    after_filter: 0,
    entries: [],
    summary: { written: 0, skipped_existing: 0, skipped_binary: 0, errors: 0 },
  }

  try {
    const all = await client.listResources()
    result.total_listed = all.length
    const filtered = applyFilterAndLimit(all, opts.filter, opts.limit)
    result.after_filter = filtered.length

    const existing = await loadExistingMcpRefs(repoRoot)
    const now = opts.now ?? new Date()

    for (const resource of filtered) {
      if (existing.uris.has(resource.uri)) {
        result.entries.push({
          kind: 'skipped_existing',
          uri: resource.uri,
          reason: 'uri_seen',
        })
        result.summary.skipped_existing += 1
        continue
      }

      try {
        const content = await client.readResource(resource.uri)
        if (content.isBinary || !content.text) {
          result.entries.push({
            kind: 'skipped_binary',
            uri: resource.uri,
            ...(content.mimeType ? { mimeType: content.mimeType } : {}),
          })
          result.summary.skipped_binary += 1
          continue
        }
        const hash = sha256(content.text)
        if (existing.hashes.has(hash)) {
          result.entries.push({
            kind: 'skipped_existing',
            uri: resource.uri,
            reason: 'content_hash_seen',
          })
          result.summary.skipped_existing += 1
          continue
        }

        if (opts.dryRun) {
          result.entries.push({
            kind: 'written',
            uri: resource.uri,
            path: '(dry-run)',
          })
          result.summary.written += 1
          continue
        }

        const slug = `${timestampSlug(now)}-mcp-${shortHash(resource.uri)}`
        const body = composeBody(resource, content.text, opts.serverName)
        const written = await writeCapture(repoRoot, {
          body,
          verb_context: `mcp-pull:${opts.serverName}`,
          mcp: {
            server: opts.serverName,
            uri: resource.uri,
            ...(content.mimeType ? { mime_type: content.mimeType } : {}),
            content_hash: hash,
          },
          slug,
          now,
        })
        // Add to in-memory dedup so a single pull doesn't double-write
        // when a resource happens to appear twice in listResources.
        existing.uris.add(resource.uri)
        existing.hashes.add(hash)
        result.entries.push({ kind: 'written', uri: resource.uri, path: written.path })
        result.summary.written += 1
      } catch (err) {
        result.entries.push({
          kind: 'error',
          uri: resource.uri,
          message: err instanceof Error ? err.message : String(err),
        })
        result.summary.errors += 1
      }
    }
  } finally {
    await client.close()
  }

  return result
}

function applyFilterAndLimit(
  resources: McpResource[],
  filter: string | undefined,
  limit: number | undefined,
): McpResource[] {
  let out = resources
  if (filter) {
    const needle = filter.toLowerCase()
    out = out.filter((r) =>
      [r.uri, r.name, r.description]
        .filter((x): x is string => typeof x === 'string')
        .some((s) => s.toLowerCase().includes(needle)),
    )
  }
  if (typeof limit === 'number' && limit > 0 && out.length > limit) {
    out = out.slice(0, limit)
  }
  return out
}

async function loadExistingMcpRefs(
  repoRoot: string,
): Promise<{ uris: Set<string>; hashes: Set<string> }> {
  const captures = await scanCaptures(repoRoot)
  const uris = new Set<string>()
  const hashes = new Set<string>()
  for (const c of captures) {
    if (c.mcp?.uri) uris.add(c.mcp.uri)
    if (c.mcp?.content_hash) hashes.add(c.mcp.content_hash)
  }
  return { uris, hashes }
}

function composeBody(
  resource: McpResource,
  text: string,
  serverName: string,
): string {
  const header = [`# ${resource.name}`, '']
  if (resource.description) {
    header.push(`> ${resource.description}`, '')
  }
  header.push(`Source: \`${serverName}\` → ${resource.uri}`, '', '---', '')
  return header.join('\n') + text.trim() + '\n'
}

function sha256(text: string): string {
  return 'sha256:' + createHash('sha256').update(text, 'utf8').digest('hex')
}

function shortHash(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 8)
}
