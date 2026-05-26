import type { Flag, Project, Snapshot } from '../types.js'
import { daysBetween } from '../util/dates.js'
import { inboxItems } from '../inbox.js'

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
  flagClosingInOnResolution(flags, snapshot, activePursuitIds)
  flagInboxPressure(flags, snapshot, now, config)

  return { snapshot, flags }
}

/**
 * Fires when the Inbox view (untriaged thoughts + diverging
 * brainstorms) exceeds inbox_soft_threshold. One flag total — the
 * per-item story lives in /start inbox, not here. Carries the
 * bucket breakdown so renderers can show "12 items: 3 fresh, 4
 * aged, 5 overdue."
 */
function flagInboxPressure(
  flags: Flag[],
  snapshot: Snapshot,
  now: Date,
  config: { inbox_soft_threshold: number },
): void {
  const view = inboxItems(snapshot, now)
  if (view.counts.total <= config.inbox_soft_threshold) return
  flags.push({
    kind: 'inbox_pressure',
    count: view.counts.total,
    threshold: config.inbox_soft_threshold,
    fresh: view.counts.fresh,
    aged: view.counts.aged,
    overdue: view.counts.overdue,
  })
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

/**
 * Flag pursuits that are closing in on resolution: ≥1 project already
 * resolved AND 1-2 unresolved projects remain. Errs toward earlier
 * surfacing — better to ask "what would close this?" before the user
 * is staring at the final action.
 */
function flagClosingInOnResolution(
  flags: Flag[],
  snapshot: Snapshot,
  activePursuitIds: Set<string>,
): void {
  for (const pursuitId of activePursuitIds) {
    const pursuitProjects = snapshot.projects.filter(
      (p) => p.pursuit === pursuitId,
    )
    if (pursuitProjects.length === 0) continue

    const unresolvedCount = pursuitProjects.filter(
      (p) => p.status === 'active' || p.status === 'on_hold',
    ).length
    const resolvedCount = pursuitProjects.filter(
      (p) => p.status === 'done' || p.status === 'dropped',
    ).length

    if (
      resolvedCount >= 1 &&
      unresolvedCount >= 1 &&
      unresolvedCount <= 2
    ) {
      flags.push({
        kind: 'closing_in_on_resolution',
        pursuitId,
        unresolvedCount,
        resolvedCount,
        totalCount: pursuitProjects.length,
      })
    }
  }
}
