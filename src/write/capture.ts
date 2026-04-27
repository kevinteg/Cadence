import path from 'node:path'
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

  const filePath = path.join(dir, `${timestampSlug(now)}.md`)
  await writeFrontmatterFile(filePath, data, opts.body)
  return { path: path.relative(repoRoot, filePath) }
}
