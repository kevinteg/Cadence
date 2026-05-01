import type { Flag, Report, Snapshot } from '../types.js'

export function renderSnapshot(snapshot: Snapshot): string {
  const out: string[] = []
  out.push('Cadence Snapshot')
  out.push(`generated: ${snapshot.generatedAt}`)
  out.push(`root: ${snapshot.repoRoot}`)
  out.push('')

  out.push('Config')
  out.push(renderKV(configRows(snapshot)))
  out.push('')

  out.push(...renderSection('Pursuits', pursuitTable(snapshot)))
  out.push(...renderSection('Projects', projectTable(snapshot)))
  out.push(...renderSection('Ideas', ideaTable(snapshot)))
  out.push(...renderSection('Captures', captureTable(snapshot)))
  out.push(...renderSection('Reflections', reflectionTable(snapshot)))

  return out.join('\n').trimEnd()
}

export function renderReport(report: Report): string {
  const out: string[] = []
  out.push(renderSnapshot(report.snapshot))
  out.push('')
  out.push(...renderSection('Flags', flagTable(report.flags), 'No flags.'))
  return out.join('\n').trimEnd()
}

type Table = { headers: string[]; rows: string[][] }

function renderSection(
  title: string,
  table: Table,
  emptyText = 'None.',
): string[] {
  const lines: string[] = []
  lines.push(`${title} (${table.rows.length})`)
  if (table.rows.length === 0) {
    lines.push(`  ${emptyText}`)
  } else {
    lines.push(tabulate(table))
  }
  lines.push('')
  return lines
}

function configRows(snapshot: Snapshot): [string, string][] {
  const c = snapshot.config
  const rows: [string, string][] = [
    ['marker_stale_days', String(c.marker_stale_days)],
    ['waiting_for_grace_days', String(c.waiting_for_grace_days)],
    ['dormant_days', String(c.dormant_days)],
    ['max_active_projects', String(c.max_active_projects)],
    ['someday_review', c.someday_review],
    ['reflect_day', c.reflect_day],
    ['reflect_duration_minutes', String(c.reflect_duration_minutes)],
  ]
  if (c.win_cycle_current) rows.push(['win_cycle_current', c.win_cycle_current])
  if (c.win_cycle_start) rows.push(['win_cycle_start', c.win_cycle_start])
  if (c.win_cycle_end) rows.push(['win_cycle_end', c.win_cycle_end])
  if (c.win_cycle_mid_check)
    rows.push(['win_cycle_mid_check', c.win_cycle_mid_check])
  return rows
}

function pursuitTable(snapshot: Snapshot): Table {
  return {
    headers: ['ID', 'TYPE', 'LIFECYCLE', 'STATUS', 'CREATED'],
    rows: snapshot.pursuits.map((p) => [
      p.id,
      p.type,
      p.lifecycle,
      p.status,
      p.created,
    ]),
  }
}

function projectTable(snapshot: Snapshot): Table {
  return {
    headers: ['ID', 'PURSUIT', 'STATUS', 'ACTIONS', 'LAST ACTIVITY'],
    rows: snapshot.projects.map((p) => [
      p.id,
      p.pursuit,
      p.status,
      `${p.actionProgress.done}/${p.actionProgress.total}`,
      p.last_activity_at
        ? p.last_activity_at.slice(0, 10)
        : '—',
    ]),
  }
}

function ideaTable(snapshot: Snapshot): Table {
  return {
    headers: ['ID', 'STATE', 'PARENT', 'AGE', 'CREATED'],
    rows: snapshot.ideas.map((i) => [
      i.id,
      i.state,
      i.parent,
      `${i.ageDays}d`,
      i.created,
    ]),
  }
}

function captureTable(snapshot: Snapshot): Table {
  return {
    headers: ['CAPTURED', 'CONTEXT', 'BODY'],
    rows: snapshot.captures.map((c) => [
      c.captured,
      c.verb_context ?? '',
      truncate(firstLine(c.body), 60),
    ]),
  }
}

function reflectionTable(snapshot: Snapshot): Table {
  const sorted = [...snapshot.reflections].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  )
  return {
    headers: ['DATE', 'STATUS', 'PHASE', 'LEVERAGED_PRIORITY'],
    rows: sorted.map((r) => [
      r.date,
      r.status,
      r.phase ?? '',
      truncate(r.leveraged_priority ?? '', 60),
    ]),
  }
}

function flagTable(flags: Flag[]): Table {
  return {
    headers: ['KIND', 'TARGET', 'DETAIL'],
    rows: flags.map((f) => [f.kind, flagTarget(f), flagDetail(f)]),
  }
}

function flagTarget(flag: Flag): string {
  if (flag.kind === 'wip_over_limit') return ''
  return `${flag.pursuitId}/${flag.projectId}`
}

function flagDetail(flag: Flag): string {
  switch (flag.kind) {
    case 'overdue_waiting_for':
      return `${flag.item.person} re: ${flag.item.what} (${flag.daysOverdue}d overdue)`
    case 'dormant_project':
      return flag.daysSinceActivity !== null
        ? `${flag.daysSinceActivity}d since activity`
        : 'no activity'
    case 'structural_active_no_open_actions':
      return 'all actions checked — does the intent feel achieved?'
    case 'wip_over_limit':
      return `${flag.count} in-progress (limit ${flag.limit}): ${flag.projectIds.join(', ')}`
  }
}

function tabulate(table: Table): string {
  const widths = table.headers.map((h, i) =>
    Math.max(h.length, ...table.rows.map((r) => (r[i] ?? '').length)),
  )
  const fmt = (cells: string[]) =>
    '  ' + cells.map((c, i) => c.padEnd(widths[i] ?? 0)).join('  ').trimEnd()
  return [fmt(table.headers), ...table.rows.map(fmt)].join('\n')
}

function renderKV(rows: [string, string][]): string {
  const keyWidth = Math.max(...rows.map(([k]) => k.length))
  return rows.map(([k, v]) => `  ${k.padEnd(keyWidth)}  ${v}`).join('\n')
}

function firstLine(text: string): string {
  return text.split('\n')[0]?.trim() ?? ''
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}
