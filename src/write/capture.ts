import path from 'node:path'
import { existsSync } from 'node:fs'
import type { CaptureMcpRef } from '../types.js'
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
   * Source pointer for captures synthesized by `cadence mcp-pull`.
   * Written as the `mcp:` frontmatter block; used for dedup on
   * subsequent pulls. Optional — interactive `/capture` does not set it.
   */
  mcp?: CaptureMcpRef
  /**
   * Optional filename slug. Defaults to the minute-resolution
   * timestampSlug. Callers writing many captures in one batch
   * (e.g. mcp-pull) supply a per-resource discriminator so files
   * don't collide.
   */
  slug?: string
  now?: Date
}

export async function writeCapture(
  repoRoot: string,
  opts: WriteCaptureOpts,
): Promise<{ path: string }> {
  const now = opts.now ?? new Date()
  const dir = path.join(repoRoot, 'thoughts/unprocessed')
  await ensureDir(dir)

  const data: Record<string, unknown> = {
    captured: opts.captured ?? isoTimestamp(now),
  }
  if (opts.verb_context) data['verb_context'] = opts.verb_context
  if (opts.mcp) data['mcp'] = opts.mcp

  const baseSlug = opts.slug ?? timestampSlug(now)
  const filePath = uniqueCapturePath(dir, baseSlug)
  await writeFrontmatterFile(filePath, data, opts.body)
  return { path: path.relative(repoRoot, filePath) }
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
