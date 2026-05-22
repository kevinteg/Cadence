import path from 'node:path'
import { existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import type { CaptureMcpRef } from '../types.js'
import { scanCaptures } from '../scan/captures.js'
import {
  ensureDir,
  isoTimestamp,
  timestampSlug,
  writeFrontmatterFile,
} from './util.js'

export type WriteCaptureOpts = {
  body: string
  captured?: string
  verb_context?: string
  /**
   * Source pointer for captures synthesized via MCP integration.
   * Written as the `mcp:` frontmatter block; used for dedup on
   * subsequent pulls. When set, `content_hash` is auto-computed from
   * `body` if not provided by the caller. Optional — interactive
   * `/capture` does not set it.
   */
  mcp?: Partial<CaptureMcpRef> & { server: string; uri: string }
  /**
   * Optional filename slug. Defaults to the minute-resolution
   * timestampSlug. Callers writing many captures in one batch supply
   * a per-resource discriminator so files don't collide.
   */
  slug?: string
  now?: Date
}

export type WriteCaptureResult =
  | { kind: 'written'; path: string }
  | {
      kind: 'skipped_existing'
      reason: 'uri_seen' | 'content_hash_seen'
      path: string
    }

export async function writeCapture(
  repoRoot: string,
  opts: WriteCaptureOpts,
): Promise<WriteCaptureResult> {
  const now = opts.now ?? new Date()
  const dir = path.join(repoRoot, 'thoughts/unprocessed')
  await ensureDir(dir)

  // Compose the mcp: block with auto-hash for callers that didn't
  // supply one. Pull-style flows write many captures and shouldn't
  // re-hash bodies themselves — the CLI is the right place.
  let mcp: CaptureMcpRef | undefined
  if (opts.mcp) {
    const content_hash =
      opts.mcp.content_hash ?? `sha256:${sha256Hex(opts.body)}`
    mcp = {
      server: opts.mcp.server,
      uri: opts.mcp.uri,
      content_hash,
      ...(opts.mcp.mime_type ? { mime_type: opts.mcp.mime_type } : {}),
    }

    // Auto-dedup: an MCP-tagged write that matches an existing capture
    // by uri or content_hash is a no-op write — return the existing
    // path with a reason. Lets pull-style skills stay dumb (no dedup
    // logic in the agent).
    const existing = await scanCaptures(repoRoot)
    for (const c of existing) {
      if (c.mcp?.uri === mcp.uri) {
        return {
          kind: 'skipped_existing',
          reason: 'uri_seen',
          path: c.path,
        }
      }
    }
    for (const c of existing) {
      if (c.mcp?.content_hash && c.mcp.content_hash === mcp.content_hash) {
        return {
          kind: 'skipped_existing',
          reason: 'content_hash_seen',
          path: c.path,
        }
      }
    }
  }

  const data: Record<string, unknown> = {
    captured: opts.captured ?? isoTimestamp(now),
  }
  if (opts.verb_context) data['verb_context'] = opts.verb_context
  if (mcp) data['mcp'] = mcp

  const baseSlug = opts.slug ?? timestampSlug(now)
  const filePath = uniqueCapturePath(dir, baseSlug)
  await writeFrontmatterFile(filePath, data, opts.body)
  return { kind: 'written', path: path.relative(repoRoot, filePath) }
}

function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

/**
 * Same-minute collisions are real for batch writers like mcp-pull. If
 * `<slug>.md` already exists, append `-2`, `-3`, ... until we find an
 * unused path. Filesystem is the source of truth — no in-memory
 * tracking needed because each call hits disk before returning.
 */
function uniqueCapturePath(dir: string, slug: string): string {
  let candidate = path.join(dir, `${slug}.md`)
  let n = 2
  while (existsSync(candidate)) {
    candidate = path.join(dir, `${slug}-${n}.md`)
    n += 1
  }
  return candidate
}
