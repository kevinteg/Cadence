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
  flagClosingInOnResolution(flags, snapshot, activePursuitIds)
  flagStaleInboxSeeds(flags, snapshot, config)
  flagInboxOvercap(flags, snapshot, config)

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

/**
 * Flag Inbox seeds that have aged past the Inbox-specific threshold
 * (default 7d — one Reflect cycle). Distinct from the general
 * aging_seed check (14d, any pursuit): the Inbox is meant to be a
 * short-term triage zone, so an Inbox seed surviving a Reflect is the
 * triage-debt signal worth surfacing. One flag per stale seed.
 */
function flagStaleInboxSeeds(
  flags: Flag[],
  snapshot: Snapshot,
  config: { inbox_seed_stale_days: number },
): void {
  const threshold = config.inbox_seed_stale_days
  for (const idea of snapshot.ideas) {
    if (idea.parent !== 'inbox') continue
    if (idea.state !== 'seed') continue
    if (idea.ageDays <= threshold) continue
    flags.push({
      kind: 'stale_inbox_seed',
      ideaId: idea.id,
      ageDays: idea.ageDays,
      threshold,
    })
  }
}

/**
 * Flag the Inbox when its seed count exceeds the soft cap (default
 * 10). Volume signal, not age — even fresh seeds piling up are worth
 * a triage pass before brainstorm-debt compounds. One flag total.
 */
function flagInboxOvercap(
  flags: Flag[],
  snapshot: Snapshot,
  config: { inbox_seed_softcap: number },
): void {
  const softcap = config.inbox_seed_softcap
  const count = snapshot.ideas.filter(
    (i) => i.parent === 'inbox' && i.state === 'seed',
  ).length
  if (count <= softcap) return
  flags.push({ kind: 'inbox_overcap', count, softcap })
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
