import { existsSync } from 'node:fs'
import path from 'node:path'

/**
 * Locate a pursuit directory across active, someday, archived, and the
 * special wandering location. Returns the absolute directory path or
 * null if not found.
 */
export function resolvePursuitDir(
  repoRoot: string,
  pursuitId: string,
): string | null {
  const candidates = [
    path.join(repoRoot, 'pursuits', pursuitId),
    path.join(repoRoot, 'pursuits/_someday', pursuitId),
    path.join(repoRoot, 'pursuits/_archived', pursuitId),
  ]
  for (const c of candidates) {
    if (existsSync(path.join(c, 'pursuit.md'))) return c
  }
  return null
}

export function resolveProjectFile(
  repoRoot: string,
  pursuitId: string,
  projectId: string,
): string | null {
  const dir = resolvePursuitDir(repoRoot, pursuitId)
  if (!dir) return null
  const file = path.join(dir, 'projects', `${projectId}.md`)
  if (!existsSync(file)) return null
  return file
}

export function resolveIdeaFile(
  repoRoot: string,
  parent: string,
  ideaId: string,
): string | null {
  // parent is either "<pursuit-id>" or "<pursuit-id>/<project-id>" — both
  // store ideas under <pursuit>/ideas/<idea-id>.md.
  const pursuitId = parent.split('/')[0] ?? parent
  const dir = resolvePursuitDir(repoRoot, pursuitId)
  if (!dir) return null
  const file = path.join(dir, 'ideas', `${ideaId}.md`)
  if (!existsSync(file)) return null
  return file
}
