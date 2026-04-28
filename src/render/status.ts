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
  out.push(lastSessionLine(snapshot))
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
  return out.join('\n')
}

export function renderFlags(flags: Flag[], snapshot: Snapshot): string {
  if (flags.length === 0) return 'No flags. System is healthy.'
  return flags.map((f) => '- ' + describeFlag(f, snapshot)).join('\n')
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

function lastSessionLine(snapshot: Snapshot): string {
  if (snapshot.markers.length === 0) return 'Last Session: none'
  const sorted = [...snapshot.markers].sort((a, b) =>
    a.timestamp < b.timestamp ? 1 : -1,
  )
  const m = sorted[0]!
  const project = snapshot.projects.find(
    (p) => p.id === m.project && p.pursuit === m.pursuit,
  )
  const stateLabel = project?.status === 'done' ? 'done' : 'WIP'
  const days = daysBetween(m.timestamp, new Date(snapshot.generatedAt))
  const ago = relativeDays(days)
  return `Last Session: ${ago} on ${m.pursuit}/${m.project} (${stateLabel})`
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
      return flag.daysSinceMarker !== null
        ? `dormant: ${flag.pursuitId}/${flag.projectId} (${flag.daysSinceMarker}d since marker)`
        : `dormant: ${flag.pursuitId}/${flag.projectId} (no markers; project created earlier)`
    case 'stale_marker':
      return `stale marker: ${flag.pursuitId}/${flag.projectId} (${flag.daysSinceMarker}d old)`
    case 'structural_active_no_open_actions':
      return `structural: ${flag.pursuitId}/${flag.projectId} all actions checked — does the intent feel achieved?`
    case 'wip_over_limit':
      return `WIP over limit: ${flag.count} in-progress projects (limit: ${flag.limit})`
  }
  const _exhaustive: never = flag
  return _exhaustive
}
