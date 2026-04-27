import path from 'node:path'
import { existsSync } from 'node:fs'
import {
  dateString,
  ensureDir,
  loadFrontmatterFile,
  writeFrontmatterFile,
} from './util.js'

export type WriteReflectionOpts = {
  date?: string
  status: 'draft' | 'in_progress' | 'complete'
  phase?: 'get_clear' | 'get_focused'
  leveraged_priority?: string
  body?: string
  now?: Date
}

/**
 * Upsert a reflection file. If the file already exists, the existing
 * body is preserved unless `body` is explicitly passed; frontmatter
 * fields merge over what's there. This supports the multi-step Reflect
 * ritual where each phase writes back the latest state.
 */
export async function writeReflection(
  repoRoot: string,
  opts: WriteReflectionOpts,
): Promise<{ path: string }> {
  const now = opts.now ?? new Date()
  const date = opts.date ?? dateString(now)
  const dir = path.join(repoRoot, 'reflections')
  await ensureDir(dir)

  const filePath = path.join(dir, `${date}.md`)
  const existing = existsSync(filePath)
    ? await loadFrontmatterFile(filePath)
    : null

  const data: Record<string, unknown> = existing ? { ...existing.data } : {}
  data['date'] = date
  data['status'] = opts.status
  if (opts.phase) data['phase'] = opts.phase
  if (opts.leveraged_priority) {
    data['leveraged_priority'] = opts.leveraged_priority
  }

  const body =
    opts.body ?? existing?.content ?? `# Reflection — ${date}`

  await writeFrontmatterFile(filePath, data, body)
  return { path: path.relative(repoRoot, filePath) }
}
