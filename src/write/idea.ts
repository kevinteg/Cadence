import path from 'node:path'
import { existsSync } from 'node:fs'
import { dateString, writeFrontmatterFile } from './util.js'
import { resolvePursuitDir } from './paths.js'

export type CreateIdeaOpts = {
  parent: string // 'pursuit-id' or 'pursuit-id/project-id'
  id: string
  state?: 'seed' | 'developed' | 'promoted' | 'moved' | 'closed'
  body?: string
  created?: string
  developed_at?: string
  promoted_to?: string
  closed_reason?: string
  now?: Date
}

export async function createIdea(
  repoRoot: string,
  opts: CreateIdeaOpts,
): Promise<{ path: string }> {
  const now = opts.now ?? new Date()
  const pursuitId = opts.parent.split('/')[0] ?? opts.parent
  const pursuitDir = resolvePursuitDir(repoRoot, pursuitId)
  if (!pursuitDir) {
    throw new Error(`pursuit not found for idea parent: ${opts.parent}`)
  }
  const filePath = path.join(pursuitDir, 'ideas', `${opts.id}.md`)
  if (existsSync(filePath)) {
    throw new Error(`idea already exists: ${opts.parent}/${opts.id}`)
  }

  const state = opts.state ?? 'seed'
  const data: Record<string, unknown> = {
    id: opts.id,
    parent: opts.parent,
    state,
    created: opts.created ?? dateString(now),
  }
  if (opts.developed_at) data['developed_at'] = opts.developed_at
  if (opts.promoted_to) data['promoted_to'] = opts.promoted_to
  if (opts.closed_reason) data['closed_reason'] = opts.closed_reason

  await writeFrontmatterFile(filePath, data, opts.body ?? '')
  return { path: path.relative(repoRoot, filePath) }
}
