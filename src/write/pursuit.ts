import path from 'node:path'
import { existsSync } from 'node:fs'
import {
  ensureDir,
  dateString,
  writeFrontmatterFile,
} from './util.js'

export type CreatePursuitOpts = {
  id: string
  type: 'finite' | 'ongoing' | 'someday'
  status?: 'active' | 'someday' | 'archived'
  why?: string
  target?: string
  win_cycle?: string
  title?: string
  description?: string
  created?: string
  now?: Date
}

export async function createPursuit(
  repoRoot: string,
  opts: CreatePursuitOpts,
): Promise<{ path: string }> {
  const now = opts.now ?? new Date()
  const status =
    opts.status ?? (opts.type === 'someday' ? 'someday' : 'active')
  const lifecycleDir =
    status === 'someday'
      ? 'pursuits/_someday'
      : status === 'archived'
        ? 'pursuits/_archived'
        : 'pursuits'
  const pursuitDir = path.join(repoRoot, lifecycleDir, opts.id)
  if (existsSync(pursuitDir)) {
    throw new Error(`pursuit already exists: ${opts.id}`)
  }
  await ensureDir(path.join(pursuitDir, 'projects'))
  await ensureDir(path.join(pursuitDir, 'ideas'))

  const data: Record<string, unknown> = {
    id: opts.id,
    type: opts.type,
    status,
    created: opts.created ?? dateString(now),
  }
  if (opts.why) data['why'] = opts.why
  if (opts.target) data['target'] = opts.target
  if (opts.win_cycle) data['win_cycle'] = opts.win_cycle

  const title = opts.title ?? toTitleCase(opts.id)
  const body =
    `# ${title}` + (opts.description ? `\n\n${opts.description}` : '')

  const filePath = path.join(pursuitDir, 'pursuit.md')
  await writeFrontmatterFile(filePath, data, body)
  return { path: path.relative(repoRoot, filePath) }
}

function toTitleCase(id: string): string {
  return id
    .split('-')
    .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}
