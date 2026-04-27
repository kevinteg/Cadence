import path from 'node:path'
import {
  ensureDir,
  isoTimestamp,
  timestampSlug,
  writeFrontmatterFile,
} from './util.js'
import { resolvePursuitDir } from './paths.js'

export type WriteMarkerOpts = {
  pursuit: string
  project: string
  session_start?: string
  session_end?: string
  actions_completed?: string[]
  where?: string
  next?: string
  open?: string
  now?: Date
}

export async function writeMarker(
  repoRoot: string,
  opts: WriteMarkerOpts,
): Promise<{ path: string }> {
  const now = opts.now ?? new Date()
  const pursuitDir = resolvePursuitDir(repoRoot, opts.pursuit)
  if (!pursuitDir) throw new Error(`pursuit not found: ${opts.pursuit}`)
  const sessionsDir = path.join(pursuitDir, 'sessions')
  await ensureDir(sessionsDir)

  const session_start =
    opts.session_start ?? isoTimestamp(new Date(now.getTime() - 30 * 60 * 1000))
  const session_end = opts.session_end ?? isoTimestamp(now)

  const actions_completed = (opts.actions_completed ?? [])
    .filter((a): a is string => typeof a === 'string' && a.length > 0)
  const data: Record<string, unknown> = {
    pursuit: opts.pursuit,
    project: opts.project,
    session_start,
    session_end,
    actions_completed,
  }

  const sections: string[] = [`# Marker: ${opts.project}`]
  if (truthy(opts.where)) sections.push('## Where', String(opts.where))
  if (truthy(opts.next)) sections.push('## Next', String(opts.next))
  if (truthy(opts.open)) sections.push('## Open', String(opts.open))
  const body = sections.join('\n\n')

  const filePath = path.join(sessionsDir, `${timestampSlug(now)}.md`)
  await writeFrontmatterFile(filePath, data, body)
  return { path: path.relative(repoRoot, filePath) }
}

function truthy(v: unknown): boolean {
  if (typeof v === 'string') return v.length > 0
  if (typeof v === 'number') return v !== 0
  return Boolean(v)
}
