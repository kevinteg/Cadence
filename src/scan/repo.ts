import { stat } from 'node:fs/promises'
import path from 'node:path'
import { loadConfig } from '../config.js'
import type { LastTouch, Project, Snapshot } from '../types.js'
import { scanBrainstorms } from './brainstorms.js'
import { scanCaptures } from './captures.js'
import { lastActivityMap, parseProjectPath } from './git-activity.js'
import { scanLessonsWatermark } from './lessons.js'
import { scanProjects } from './projects.js'
import { scanPursuits } from './pursuits.js'
import { scanReflections } from './reflections.js'

export async function scan(
  repoRoot: string,
  now: Date = new Date(),
): Promise<Snapshot> {
  const [
    config,
    pursuits,
    projects,
    brainstorms,
    captures,
    reflections,
    lessonsWatermark,
  ] = await Promise.all([
    loadConfig(repoRoot),
    scanPursuits(repoRoot),
    scanProjects(repoRoot),
    scanBrainstorms(repoRoot),
    scanCaptures(repoRoot),
    scanReflections(repoRoot),
    scanLessonsWatermark(repoRoot),
  ])

  const activityMap = await lastActivityMap(repoRoot)
  await Promise.all(
    projects.map((p) => annotateLastActivity(p, repoRoot, activityMap)),
  )

  const lastTouch = computeLastTouch(activityMap)

  return {
    config,
    pursuits,
    projects,
    brainstorms,
    captures,
    reflections,
    generatedAt: now.toISOString(),
    repoRoot,
    lastTouch,
    lessons_watermark: lessonsWatermark,
  }
}

function computeLastTouch(
  activityMap: Map<string, string>,
): LastTouch | null {
  let best: { file: string; timestamp: string } | null = null
  for (const [file, ts] of activityMap) {
    if (!best || ts > best.timestamp) best = { file, timestamp: ts }
  }
  if (!best) return null
  const parsed = parseProjectPath(best.file)
  if (!parsed) return null
  return {
    project_id: parsed.project_id,
    pursuit_id: parsed.pursuit_id,
    pursuit_archived: parsed.pursuit_archived,
    timestamp: best.timestamp,
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
