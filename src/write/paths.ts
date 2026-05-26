import { existsSync } from 'node:fs'
import path from 'node:path'

/**
 * Locate a pursuit directory across active (which includes the standing
 * `inbox` pursuit), someday, and archived locations. Returns the absolute
 * directory path or null if not found.
 */
export function resolvePursuitDir(
  repoRoot: string,
  pursuitId: string,
): string | null {
  const candidates = [
    path.join(repoRoot, 'pursuits', pursuitId),
    path.join(repoRoot, 'pursuits/_someday', pursuitId),
    path.join(repoRoot, 'pursuits/_archived', pursuitId),
    path.join(repoRoot, 'pursuits/_dropped', pursuitId),
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

