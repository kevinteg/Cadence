import type { Flag, Project, Snapshot } from '../types.js'
import { daysBetween } from '../util/dates.js'
import { inboxItems } from '../inbox.js'
import { needsYou } from '../needs-you.js'

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

  flagThreadStale(flags, snapshot, now)
  flagNeedsYouPressure(flags, snapshot, now)
  flagDormantProjects(flags, activeProjects, now, config)
  flagStructural(flags, activeProjects)
  flagWipOverLimit(flags, activeProjects, config)
  flagClosingInOnResolution(flags, snapshot, activePursuitIds)
  flagInboxPressure(flags, snapshot, now, config)
  flagCapstoneGap(flags, snapshot)
  flagRetrospectiveDue(flags, snapshot, config)

  return { snapshot, flags }
}

/**
 * A resolved unit still carries an uncrystallized research substrate:
 * the index status is `researching` (the GC ritual never ran, or the
 * user chose Keep) and the unit has no `narrative:` capstone pointer.
 * Substrates marked `cleared` / `archived-raw` don't fire — the user
 * already made the disposition call at close-out.
 */
function flagCapstoneGap(flags: Flag[], snapshot: Snapshot): void {
  for (const project of snapshot.projects) {
    if (project.status !== 'done' && project.status !== 'dropped') continue
    if (!project.research || project.research.status !== 'researching') continue
    if (project.narrative) continue
    flags.push({
      kind: 'capstone_gap',
      unitId: `${project.pursuit}/${project.id}`,
      pursuitId: project.pursuit,
      projectId: project.id,
      sources: project.research.sources,
    })
  }
  for (const pursuit of snapshot.pursuits) {
    if (pursuit.lifecycle !== 'archived' && pursuit.lifecycle !== 'dropped')
      continue
    if (!pursuit.research || pursuit.research.status !== 'researching') continue
    if (pursuit.narrative) continue
    flags.push({
      kind: 'capstone_gap',
      unitId: pursuit.id,
      pursuitId: pursuit.id,
      sources: pursuit.research.sources,
    })
  }
}

/**
 * N pursuits have resolved since the last lessons retrospective. Reads
 * the set-watermark of the latest lessons narrative (scanned into
 * snapshot.lessons_watermark); resolved pursuits not yet consulted
 * count toward the threshold. The meta-project nudge — "want to
 * synthesize the arc?" — surfaces via /reflect Get Clear and the
 * SessionStart heads-up.
 */
function flagRetrospectiveDue(
  flags: Flag[],
  snapshot: Snapshot,
  config: { retrospective_due_threshold: number },
): void {
  const consulted = new Set(
    snapshot.lessons_watermark?.pursuits_consulted ?? [],
  )
  const newSince = snapshot.pursuits.filter(
    (p) =>
      (p.lifecycle === 'archived' || p.lifecycle === 'dropped') &&
      !consulted.has(p.id),
  )
  if (newSince.length < config.retrospective_due_threshold) return
  flags.push({
    kind: 'retrospective_due',
    newSinceLast: newSince.length,
    threshold: config.retrospective_due_threshold,
    pursuitIds: newSince.map((p) => p.id),
  })
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

/**
 * An open thread has gone quiet. `waiting` threads keep the old
 * overdue-waiting-for semantics (past `expected` by more than
 * `waiting_for_grace_days`); every other kind fires once the thread is
 * older than `thread_stale_days`. Only projects in active pursuits
 * that are themselves open (active | on_hold) count.
 */
function flagThreadStale(
  flags: Flag[],
  snapshot: Snapshot,
  now: Date,
): void {
  const grace = snapshot.config.waiting_for_grace_days
  const staleDays = snapshot.config.thread_stale_days
  const activePursuitIds = new Set(
    snapshot.pursuits.filter((p) => p.lifecycle === 'active').map((p) => p.id),
  )
  for (const project of snapshot.projects) {
    if (project.status === 'done' || project.status === 'dropped') continue
    if (!activePursuitIds.has(project.pursuit)) continue
    for (const thread of project.threads) {
      if (thread.status !== 'open') continue
      const daysStale =
        thread.kind === 'waiting' && thread.expected
          ? daysBetween(thread.expected, now) - grace
          : daysBetween(thread.opened, now) - staleDays
      if (daysStale > 0) {
        flags.push({
          kind: 'thread_stale',
          pursuitId: project.pursuit,
          projectId: project.id,
          thread,
          daysStale,
        })
      }
    }
  }
}

/**
 * Fires when the Needs-you view exceeds needs_you_soft_threshold. One
 * flag total, carrying the per-kind breakdown so renderers can read
 * "Needs you: 8 (3 decide, 2 review, 3 waiting)".
 */
function flagNeedsYouPressure(
  flags: Flag[],
  snapshot: Snapshot,
  now: Date,
): void {
  const view = needsYou(snapshot, now)
  if (view.counts.total <= snapshot.config.needs_you_soft_threshold) return
  flags.push({
    kind: 'needs_you_pressure',
    count: view.counts.total,
    threshold: snapshot.config.needs_you_soft_threshold,
    decide: view.counts.decide,
    review: view.counts.review,
    unblock: view.counts.unblock,
    waiting: view.counts.waiting,
  })
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
