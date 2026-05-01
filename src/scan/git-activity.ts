import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { scan } from './repo.js'
import type { Project } from '../types.js'

const execFileP = promisify(execFile)

export type ActivityScope =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'annual'
  | 'pursuit'

export type ActivityEvent = {
  timestamp: string
  commit: string
  subject: string
}

export type ProjectActivity = {
  project: string
  pursuit: string
  current: Project
  events: ActivityEvent[]
}

export type ActivityResult = {
  scope?: ActivityScope
  consumed_from_commit?: string
  consumed_through_commit?: string
  projects: ProjectActivity[]
}

export type ProjectActivityOpts = {
  sinceCommit?: string
  scope?: ActivityScope
  pursuit?: string
  project?: string
}

export async function projectActivity(
  repoRoot: string,
  opts: ProjectActivityOpts,
): Promise<ActivityResult> {
  const head = (await git(repoRoot, ['rev-parse', 'HEAD'])).trim()

  let revRange: string[] = []
  let consumed_from: string | undefined
  if (opts.sinceCommit) {
    const isAncestor = await isAncestorOf(repoRoot, opts.sinceCommit, 'HEAD')
    if (isAncestor) {
      revRange = [`${opts.sinceCommit}..HEAD`]
      consumed_from = opts.sinceCommit
    } else {
      revRange = scopeToRevRange(opts.scope)
    }
  } else {
    revRange = scopeToRevRange(opts.scope)
  }

  const pathArg =
    opts.pursuit && opts.project
      ? `pursuits/${opts.pursuit}/projects/${opts.project}.md`
      : opts.pursuit
        ? `pursuits/${opts.pursuit}/projects/`
        : 'pursuits/'

  const logOut = await git(repoRoot, [
    'log',
    '--name-only',
    '--format=COMMIT %H%n%aI%n%s',
    ...revRange,
    '--',
    pathArg,
  ])

  const commits = parseLog(logOut)

  const grouped = new Map<string, ActivityEvent[]>()
  for (const c of commits) {
    for (const file of c.files) {
      const m = file.match(/^pursuits\/([^/]+)\/projects\/([^/]+)\.md$/)
      if (!m) continue
      const [, pursuit, project] = m
      if (opts.pursuit && pursuit !== opts.pursuit) continue
      if (opts.project && project !== opts.project) continue
      const key = `${pursuit}/${project}`
      const list = grouped.get(key) ?? []
      list.push({
        timestamp: c.timestamp,
        commit: c.commit,
        subject: c.subject,
      })
      grouped.set(key, list)
    }
  }

  const snapshot = await scan(repoRoot)
  const projects: ProjectActivity[] = []
  for (const [key, events] of grouped) {
    const [pursuit, projectId] = key.split('/')
    const current = snapshot.projects.find(
      (p) => p.pursuit === pursuit && p.id === projectId,
    )
    if (!current) continue
    projects.push({ project: projectId, pursuit, current, events })
  }

  return {
    scope: opts.scope,
    consumed_from_commit: consumed_from,
    consumed_through_commit: head,
    projects,
  }
}

async function git(repoRoot: string, args: string[]): Promise<string> {
  const { stdout } = await execFileP('git', args, {
    cwd: repoRoot,
    maxBuffer: 50 * 1024 * 1024,
  })
  return stdout
}

async function isAncestorOf(
  repoRoot: string,
  ancestor: string,
  descendant: string,
): Promise<boolean> {
  try {
    await execFileP(
      'git',
      ['merge-base', '--is-ancestor', ancestor, descendant],
      { cwd: repoRoot },
    )
    return true
  } catch {
    return false
  }
}

function scopeToRevRange(scope?: ActivityScope): string[] {
  if (!scope || scope === 'pursuit') return []
  const now = new Date()
  let since: Date
  switch (scope) {
    case 'daily':
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'weekly': {
      const dow = (now.getDay() + 6) % 7
      since = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - dow,
      )
      break
    }
    case 'monthly':
      since = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'annual':
      since = new Date(now.getFullYear(), 0, 1)
      break
  }
  return [`--since=${since.toISOString()}`]
}

type RawCommit = {
  commit: string
  timestamp: string
  subject: string
  files: string[]
}

function parseLog(out: string): RawCommit[] {
  const lines = out.split('\n')
  const commits: RawCommit[] = []
  let i = 0
  while (i < lines.length) {
    if (!lines[i].startsWith('COMMIT ')) {
      i++
      continue
    }
    const hash = lines[i].slice('COMMIT '.length).trim()
    i++
    const timestamp = (lines[i] ?? '').trim()
    i++
    const subject = lines[i] ?? ''
    i++
    if ((lines[i] ?? '').trim() === '') i++
    const files: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('COMMIT ')
    ) {
      files.push(lines[i].trim())
      i++
    }
    commits.push({ commit: hash, timestamp, subject, files })
  }
  return commits
}

/**
 * Map of project file path → most recent commit timestamp (ISO).
 * Single git invocation; returns empty map on any git failure
 * (including non-git directories, common in tests).
 */
export async function lastActivityMap(
  repoRoot: string,
): Promise<Map<string, string>> {
  let out: string
  try {
    out = await git(repoRoot, [
      'log',
      '--name-only',
      '--format=COMMIT %aI',
      '--',
      'pursuits/',
    ])
  } catch {
    return new Map()
  }
  const map = new Map<string, string>()
  let currentTs = ''
  for (const line of out.split('\n')) {
    if (line.startsWith('COMMIT ')) {
      currentTs = line.slice('COMMIT '.length).trim()
      continue
    }
    const file = line.trim()
    if (!file) continue
    if (!/^pursuits\/[^/]+\/projects\/[^/]+\.md$/.test(file)) continue
    if (!map.has(file)) map.set(file, currentTs)
  }
  return map
}
