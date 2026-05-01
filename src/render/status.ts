import type { Flag, Pursuit, Report, Snapshot } from '../types.js'
import { daysBetween } from '../util/dates.js'

export function renderStatus(result: Report): string {
  const { snapshot, flags } = result
  const out: string[] = []
  out.push('Cadence Status')
  out.push('')

  const lp = leveragedPriority(snapshot)
  out.push(`Leveraged Priority: ${lp ?? 'not set'}`)
  out.push(lastReflectLine(snapshot))
  out.push(lastActivityLine(snapshot))
  out.push('')

  out.push(pursuitsLine(snapshot))
  out.push(projectsLine(snapshot))
  out.push(actionsLine(snapshot))
  out.push(`Thoughts: ${snapshot.captures.length} unprocessed`)
  out.push('')

  out.push('Flags:')
  if (flags.length === 0) {
    out.push('  No flags. System is healthy.')
  } else {
    for (const flag of flags) out.push('  - ' + describeFlag(flag, snapshot))
  }
  out.push('')

  const next = nextSteps(snapshot, flags)
  out.push('Next:')
  for (const step of next) out.push('  - ' + step)

  return out.join('\n')
}

export function renderFlags(flags: Flag[], snapshot: Snapshot): string {
  if (flags.length === 0) return 'No flags. System is healthy.'
  return flags.map((f) => '- ' + describeFlag(f, snapshot)).join('\n')
}

/**
 * Compute up to 3 contextual next-step suggestions based on snapshot
 * state and reconciler flags. Heuristic, deterministic — no model
 * involvement. Used by both the bare-CLI dashboard and the
 * SessionStart hook output so the suggestions stay consistent.
 */
export function nextSteps(snapshot: Snapshot, flags: Flag[]): string[] {
  const suggestions: string[] = []

  const activePursuitIds = new Set(
    snapshot.pursuits.filter((p) => p.lifecycle === 'active').map((p) => p.id),
  )
  const projectsInActivePursuits = snapshot.projects.filter((p) =>
    activePursuitIds.has(p.pursuit),
  )
  const inProgress = projectsInActivePursuits.filter(
    (p) =>
      p.status === 'active' && p.actions.some((a) => !a.checked),
  )
  const onHold = projectsInActivePursuits.filter((p) => p.status === 'on_hold')
  const capturesCount = snapshot.captures.length

  // Days since most recent reflection.
  const sortedReflections = [...snapshot.reflections].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  )
  const lastReflect = sortedReflections[0]
  const today = new Date(snapshot.generatedAt)
  const daysSinceReflect = lastReflect
    ? daysBetween(lastReflect.date, today)
    : Number.POSITIVE_INFINITY

  // Priority 1 — high signal, do this first.
  if (capturesCount > 0) {
    suggestions.push(
      `Triage ${capturesCount} unprocessed capture${capturesCount === 1 ? '' : 's'} — /cadence:reflect (Get Clear).`,
    )
  }
  if (inProgress.length > 0) {
    const first = inProgress[0]!
    const tail =
      inProgress.length > 1
        ? ` (or one of ${inProgress.length - 1} other in-progress project${inProgress.length - 1 === 1 ? '' : 's'})`
        : ''
    suggestions.push(
      `Resume in-progress work — /cadence:start ${first.id}${tail}.`,
    )
  }

  // Priority 2 — medium signal.
  if (flags.length > 0 && suggestions.length < 3) {
    suggestions.push(
      `Review ${flags.length} flag${flags.length === 1 ? '' : 's'} — /cadence:reconcile.`,
    )
  }
  // Suggesting /reflect only makes sense if there's something to reflect on.
  if (
    daysSinceReflect > 7 &&
    suggestions.length < 3 &&
    projectsInActivePursuits.length > 0
  ) {
    suggestions.push(
      lastReflect
        ? `Last reflect was ${daysSinceReflect}d ago — time for /cadence:reflect.`
        : `No reflection yet — /cadence:reflect to set a Leveraged Priority.`,
    )
  }

  // Priority 3 — fallbacks when nothing higher fired.
  if (suggestions.length < 2 && onHold.length > 0) {
    suggestions.push(
      `${onHold.length} project${onHold.length === 1 ? '' : 's'} on hold — /cadence:start to pick one up.`,
    )
  }
  if (suggestions.length === 0) {
    suggestions.push(
      `Get started — /cadence:brainstorm to generate ideas, or /cadence:init for a fresh repo.`,
    )
  }

  // Always suggest help if we have spare room and nothing about it
  // already.
  if (suggestions.length < 3) {
    suggestions.push(`Browse the full verb surface — /cadence:help.`)
  }

  return suggestions.slice(0, 3)
}

function leveragedPriority(snapshot: Snapshot): string | undefined {
  const sorted = [...snapshot.reflections].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  )
  for (const r of sorted) {
    if (r.leveraged_priority) return r.leveraged_priority
  }
  return undefined
}

function lastReflectLine(snapshot: Snapshot): string {
  if (snapshot.reflections.length === 0) return 'Last Reflect: none'
  const sorted = [...snapshot.reflections].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  )
  const r = sorted[0]!
  return `Last Reflect: ${r.date} (${r.status})`
}

function lastActivityLine(snapshot: Snapshot): string {
  const candidates = snapshot.projects.filter(
    (p) => p.last_activity_at && p.status !== 'done' && p.status !== 'dropped',
  )
  if (candidates.length === 0) return 'Last Activity: none'
  const sorted = [...candidates].sort((a, b) =>
    (a.last_activity_at ?? '') < (b.last_activity_at ?? '') ? 1 : -1,
  )
  const p = sorted[0]!
  const stateLabel = p.status === 'on_hold' ? 'on hold' : 'WIP'
  const days = daysBetween(p.last_activity_at!, new Date(snapshot.generatedAt))
  const ago = relativeDays(days)
  return `Last Activity: ${ago} on ${p.pursuit}/${p.id} (${stateLabel})`
}

function relativeDays(days: number): string {
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

function pursuitsLine(snapshot: Snapshot): string {
  const groups = countLifecycle(snapshot.pursuits)
  return `Pursuits: ${groups.active} active | ${groups.someday} someday`
}

function projectsLine(snapshot: Snapshot): string {
  const activePursuitIds = new Set(
    snapshot.pursuits.filter((p) => p.lifecycle === 'active').map((p) => p.id),
  )
  const inActive = snapshot.projects.filter((p) =>
    activePursuitIds.has(p.pursuit),
  )
  const active = inActive.filter((p) => p.status === 'active').length
  const onHold = inActive.filter((p) => p.status === 'on_hold').length
  const done = inActive.filter((p) => p.status === 'done').length
  return `Projects: ${active} active | ${onHold} on_hold | ${done} done`
}

function actionsLine(snapshot: Snapshot): string {
  const activePursuitIds = new Set(
    snapshot.pursuits.filter((p) => p.lifecycle === 'active').map((p) => p.id),
  )
  let pending = 0
  let waiting = 0
  for (const project of snapshot.projects) {
    if (project.status !== 'active') continue
    if (!activePursuitIds.has(project.pursuit)) continue
    pending += project.actions.filter((a) => !a.checked).length
    waiting += project.waiting_for.length
  }
  return `Actions:  ${pending} pending | ${waiting} waiting`
}

function countLifecycle(pursuits: Pursuit[]) {
  return {
    active: pursuits.filter((p) => p.lifecycle === 'active').length,
    someday: pursuits.filter((p) => p.lifecycle === 'someday').length,
    archived: pursuits.filter((p) => p.lifecycle === 'archived').length,
  }
}

function describeFlag(flag: Flag, _snapshot: Snapshot): string {
  switch (flag.kind) {
    case 'overdue_waiting_for':
      return `overdue: ${flag.pursuitId}/${flag.projectId} — ${flag.item.person} re: ${flag.item.what} (${flag.daysOverdue}d overdue)`
    case 'dormant_project':
      return flag.daysSinceActivity !== null
        ? `dormant: ${flag.pursuitId}/${flag.projectId} (${flag.daysSinceActivity}d since last activity)`
        : `dormant: ${flag.pursuitId}/${flag.projectId} (no activity recorded; project created earlier)`
    case 'structural_active_no_open_actions':
      return `structural: ${flag.pursuitId}/${flag.projectId} all actions checked — does the intent feel achieved?`
    case 'wip_over_limit':
      return `WIP over limit: ${flag.count} in-progress projects (limit: ${flag.limit})`
  }
  const _exhaustive: never = flag
  return _exhaustive
}
