import { loadConfig } from '../config.js'
import type { Marker, Project, Snapshot } from '../types.js'
import { scanCaptures } from './captures.js'
import { scanIdeas } from './ideas.js'
import { scanMarkers } from './markers.js'
import { scanProjects } from './projects.js'
import { scanPursuits } from './pursuits.js'
import { scanReflections } from './reflections.js'

export async function scan(
  repoRoot: string,
  now: Date = new Date(),
): Promise<Snapshot> {
  const [config, pursuits, projects, ideas, markers, captures, reflections] =
    await Promise.all([
      loadConfig(repoRoot),
      scanPursuits(repoRoot),
      scanProjects(repoRoot),
      scanIdeas(repoRoot, now),
      scanMarkers(repoRoot),
      scanCaptures(repoRoot),
      scanReflections(repoRoot),
    ])

  for (const project of projects) {
    annotateProjectMarker(project, markers)
  }

  return {
    config,
    pursuits,
    projects,
    ideas,
    markers,
    captures,
    reflections,
    generatedAt: now.toISOString(),
    repoRoot,
  }
}

function annotateProjectMarker(project: Project, markers: Marker[]): void {
  let mostRecent: string | undefined
  for (const m of markers) {
    if (m.pursuit !== project.pursuit) continue
    if (m.project !== project.id) continue
    if (!mostRecent || m.timestamp > mostRecent) mostRecent = m.timestamp
  }
  project.hasMarker = mostRecent !== undefined
  if (mostRecent) project.mostRecentMarker = mostRecent
}
