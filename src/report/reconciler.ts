import type { Flag, Project, Snapshot } from '../types.js'
import { daysBetween } from '../util/dates.js'

export function report(snapshot: Snapshot): { snapshot: Snapshot; flags: Flag[] } {
  const flags: Flag[] = []
  const now = new Date(snapshot.generatedAt)
  const config = snapshot.config

  const activePursuitIds = new Set(
    snapshot.pursuits.filter((p) => p.lifecycle === 'active').map((p) => p.id),
  )
  const activeProjects = snapshot.projects.filter(
    (p) => p.status === 'active' && activePursuitIds.has(p.pursuit),
  )

  flagOverdueWaitingFor(flags, snapshot, now)
  flagDormantProjects(flags, activeProjects, now, config)
  flagStructural(flags, activeProjects)
  flagWipOverLimit(flags, activeProjects, config)

  return { snapshot, flags }
}

function flagOverdueWaitingFor(
  flags: Flag[],
  snapshot: Snapshot,
  now: Date,
): void {
  const grace = snapshot.config.waiting_for_grace_days
  for (const project of snapshot.projects) {
    if (project.status === 'done' || project.status === 'dropped') continue
    for (const item of project.waiting_for) {
      const daysOverdue = daysBetween(item.expected, now) - grace
      if (daysOverdue > 0) {
        flags.push({
          kind: 'overdue_waiting_for',
          pursuitId: project.pursuit,
          projectId: project.id,
          item,
          daysOverdue,
        })
      }
    }
  }
}

function flagDormantProjects(
  flags: Flag[],
  activeProjects: Project[],
  now: Date,
  config: { dormant_days: number },
): void {
  for (const project of activeProjects) {
    const hasUnchecked = project.actions.some((a) => !a.checked)
    if (!hasUnchecked) continue
    const reference = project.last_activity_at ?? project.created
    const days = daysBetween(reference, now)
    if (days >= config.dormant_days) {
      flags.push({
        kind: 'dormant_project',
        pursuitId: project.pursuit,
        projectId: project.id,
        daysSinceActivity: project.last_activity_at ? days : null,
      })
    }
  }
}

function flagStructural(flags: Flag[], activeProjects: Project[]): void {
  for (const project of activeProjects) {
    const hasUncheckedActions = project.actions.some((a) => !a.checked)
    if (!hasUncheckedActions) {
      flags.push({
        kind: 'structural_active_no_open_actions',
        pursuitId: project.pursuit,
        projectId: project.id,
      })
    }
  }
}

function flagWipOverLimit(
  flags: Flag[],
  activeProjects: Project[],
  config: { max_active_projects: number },
): void {
  const inProgress = activeProjects.filter((p) =>
    p.actions.some((a) => !a.checked),
  )
  if (inProgress.length > config.max_active_projects) {
    flags.push({
      kind: 'wip_over_limit',
      count: inProgress.length,
      limit: config.max_active_projects,
      projectIds: inProgress.map((p) => p.id),
    })
  }
}
