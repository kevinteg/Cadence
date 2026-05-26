import path from 'node:path'
import os from 'node:os'
import { existsSync } from 'node:fs'
import { readFile, unlink, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import type {
  CaptureMcpRef,
  CaptureSource,
  CaptureStatus,
  CaptureSuggestedOutcome,
} from '../types.js'
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
   * v1 source pointer. Preserved for /cadence:mcp-pull's existing
   * mcp: frontmatter contract. New flows (P3) emit `source:` instead.
   */
  mcp?: Partial<CaptureMcpRef> & { server: string; uri: string }
  /**
   * v2 source pointer. When set, the capture is written with
   * `schema_version: 2` and the richer frontmatter (status, prompt,
   * suggested_outcomes, etc.). Auto-fills `content_hash` from `body`
   * if not supplied. Dedup against existing captures runs the same
   * way as v1 mcp: (uri match, then content_hash match).
   */
  source?: Partial<CaptureSource> & { kind: CaptureSource['kind'] }
  /**
   * v2 fields — only emitted when `source` is also set (i.e., when
   * the caller has opted into the v2 schema).
   */
  status?: CaptureStatus
  two_minute_eligible?: boolean
  triaged_to?: string | null
  prompt?: string
  suggested_outcomes?: CaptureSuggestedOutcome[]
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

  // ── v1 mcp: block (legacy) ──────────────────────────────────────
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
    const dedup = await checkDedup(repoRoot, { uri: mcp.uri, content_hash })
    if (dedup) return dedup
  }

  // ── v2 source: block ───────────────────────────────────────────
  let source: CaptureSource | undefined
  if (opts.source) {
    const content_hash =
      opts.source.content_hash ?? `sha256:${sha256Hex(opts.body)}`
    source = {
      kind: opts.source.kind,
      ...(opts.source.name ? { name: opts.source.name } : {}),
      ...(opts.source.server ? { server: opts.source.server } : {}),
      ...(opts.source.uri ? { uri: opts.source.uri } : {}),
      ...(opts.source.query ? { query: opts.source.query } : {}),
      ...(opts.source.mime_type ? { mime_type: opts.source.mime_type } : {}),
      ...(opts.source.raw_path ? { raw_path: opts.source.raw_path } : {}),
      content_hash,
    }
    // Dedup against both v1 mcp: and v2 source: prior captures.
    if (source.uri) {
      const dedup = await checkDedup(repoRoot, {
        uri: source.uri,
        content_hash,
      })
      if (dedup) return dedup
    } else {
      // No uri (file/inline/dump): hash-only dedup.
      const dedup = await checkDedup(repoRoot, { content_hash })
      if (dedup) return dedup
    }
  }

  // ── frontmatter assembly ────────────────────────────────────────
  const data: Record<string, unknown> = {
    captured: opts.captured ?? isoTimestamp(now),
  }
  if (opts.verb_context) data['verb_context'] = opts.verb_context
  if (mcp) data['mcp'] = mcp
  if (source) {
    data['schema_version'] = 2
    data['source'] = source
    data['status'] = opts.status ?? 'untriaged'
    if (opts.two_minute_eligible !== undefined) {
      data['two_minute_eligible'] = opts.two_minute_eligible
    }
    if (opts.triaged_to !== undefined) {
      data['triaged_to'] = opts.triaged_to
    }
    if (opts.prompt) data['prompt'] = opts.prompt
    if (opts.suggested_outcomes && opts.suggested_outcomes.length > 0) {
      data['suggested_outcomes'] = opts.suggested_outcomes
    }
  }

  const baseSlug = opts.slug ?? timestampSlug(now)
  const filePath = uniqueCapturePath(dir, baseSlug)
  await writeFrontmatterFile(filePath, data, opts.body)
  return { kind: 'written', path: path.relative(repoRoot, filePath) }
}

// ── helpers ──────────────────────────────────────────────────────

async function checkDedup(
  repoRoot: string,
  match: { uri?: string; content_hash: string },
): Promise<{ kind: 'skipped_existing'; reason: 'uri_seen' | 'content_hash_seen'; path: string } | null> {
  const existing = await scanCaptures(repoRoot)
  if (match.uri) {
    for (const c of existing) {
      if (c.mcp?.uri === match.uri || c.source?.uri === match.uri) {
        return { kind: 'skipped_existing', reason: 'uri_seen', path: c.path }
      }
    }
  }
  for (const c of existing) {
    const h = c.mcp?.content_hash ?? c.source?.content_hash
    if (h && h === match.content_hash) {
      return {
        kind: 'skipped_existing',
        reason: 'content_hash_seen',
        path: c.path,
      }
    }
  }
  return null
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

// ── CLI-helper: resolve --from / --dump into a body string ──────

export type ResolveBodyOpts = {
  from?: string
  dump?: boolean
  body?: string
  promptHint?: string
}

/**
 * Reads body content from --from (local file or URL) or --dump
 * ($EDITOR session). Used by the cadence write-capture CLI binding
 * so the SKILL can pass user-facing flags through without
 * pre-fetching content itself.
 *
 * Resolution order: --body wins if provided; --from next; --dump
 * last. Throws if more than one is set, since the intent is
 * ambiguous.
 */
export async function resolveBodyFromFlags(
  opts: ResolveBodyOpts,
): Promise<{ body: string; sourceKindHint?: 'file' | 'url' | 'dump' }> {
  const flagsSet = [opts.body, opts.from, opts.dump].filter(Boolean).length
  if (flagsSet === 0) {
    throw new Error('one of --body, --from, --dump is required')
  }
  if (flagsSet > 1) {
    throw new Error('--body, --from, --dump are mutually exclusive')
  }
  if (opts.body) return { body: opts.body }
  if (opts.from) {
    if (opts.from.startsWith('http://') || opts.from.startsWith('https://')) {
      const res = await fetch(opts.from)
      if (!res.ok) {
        throw new Error(
          `--from URL fetch failed: ${res.status} ${res.statusText}`,
        )
      }
      const body = await res.text()
      return { body, sourceKindHint: 'url' }
    }
    const filePath = path.resolve(opts.from)
    if (!existsSync(filePath)) {
      throw new Error(`--from file not found: ${filePath}`)
    }
    const body = await readFile(filePath, 'utf8')
    return { body, sourceKindHint: 'file' }
  }
  // --dump
  const editor = process.env['EDITOR'] || process.env['VISUAL'] || 'nano'
  const tmpPath = path.join(os.tmpdir(), `cadence-dump-${Date.now()}.md`)
  const header = opts.promptHint
    ? `# Brain dump — ${opts.promptHint}\n# Save and exit when done.\n\n`
    : '# Brain dump — save and exit when done.\n\n'
  await writeFile(tmpPath, header, 'utf8')
  const result = spawnSync(editor, [tmpPath], { stdio: 'inherit' })
  if (result.status !== 0) {
    await unlink(tmpPath).catch(() => {})
    throw new Error(`$EDITOR (${editor}) exited with code ${result.status}`)
  }
  const raw = await readFile(tmpPath, 'utf8')
  await unlink(tmpPath).catch(() => {})
  // Strip the hint header lines (each starts with '# ').
  const body = raw
    .split('\n')
    .filter((line, i) => !(i < 3 && line.startsWith('# ')))
    .join('\n')
    .trim()
  if (body.length === 0) {
    throw new Error('--dump produced empty body; nothing captured')
  }
  return { body, sourceKindHint: 'dump' }
}
