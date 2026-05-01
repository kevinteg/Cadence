import { stat } from 'node:fs/promises'
import path from 'node:path'
import { loadConfig } from '../config.js'
import type { Project, Snapshot } from '../types.js'
import { scanCaptures } from './captures.js'
import { lastActivityMap } from './git-activity.js'
import { scanIdeas } from './ideas.js'
import { scanProjects } from './projects.js'
import { scanPursuits } from './pursuits.js'
import { scanReflections } from './reflections.js'

export async function scan(
  repoRoot: string,
  now: Date = new Date(),
): Promise<Snapshot> {
  const [config, pursuits, projects, ideas, captures, reflections] =
    await Promise.all([
      loadConfig(repoRoot),
      scanPursuits(repoRoot),
      scanProjects(repoRoot),
      scanIdeas(repoRoot, now),
      scanCaptures(repoRoot),
      scanReflections(repoRoot),
    ])

  const activityMap = await lastActivityMap(repoRoot)
  await Promise.all(
    projects.map((p) => annotateLastActivity(p, repoRoot, activityMap)),
  )

  return {
    config,
    pursuits,
    projects,
    ideas,
    captures,
    reflections,
    generatedAt: now.toISOString(),
    repoRoot,
  }
}

async function annotateLastActivity(
  project: Project,
  repoRoot: string,
  activityMap: Map<string, string>,
): Promise<void> {
  const gitTs = activityMap.get(project.path)
  let fsTs: string | undefined
  try {
    const s = await stat(path.join(repoRoot, project.path))
    fsTs = s.mtime.toISOString()
  } catch {
    fsTs = undefined
  }
  if (gitTs && fsTs) {
    project.last_activity_at = gitTs > fsTs ? gitTs : fsTs
  } else {
    project.last_activity_at = gitTs ?? fsTs
  }
}
