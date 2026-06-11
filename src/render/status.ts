import type {
  Flag,
  Project,
  Pursuit,
  Report,
  Snapshot,
} from '../types.js'
import type { Tip } from '../tip/library.js'
import { daysBetween } from '../util/dates.js'
import { computeSuggestionSignals } from './signals.js'
import { renderIdleTimePrompt } from '../sessionstart.js'
import { readPendingValidations } from '../validation/queue.js'
import { inboxItems } from '../inbox.js'
import { curateNextMoves, type NextMove } from './curation.js'
import { bold, dim, gray, statusBadge } from './color.js'

/**
 * Render the dashboard. Layout (see
 * cadence-plugin/workflows/coaching-strings.md for the canonical
 * wording):
 *
 *   # Cadence Status
 *
 *   **This week**: <LP framing>. <Last-touch hook>.
 *
 *   ## Active Pursuits
 *   ### <pursuit> — <N/M projects done>
 *   <markdown table: project | status | actions | what it's about>
 *   ### <closing-in pursuit> — <N/N ✓ closing in>
 *   <ready-to-resolve framing>
 *
 *   ## On Hold Pursuits
 *   <markdown table: pursuit | paused | why it mattered>
 *
 *   ## Heads up
 *   - <Inbox line>
 *   - <validations nudge>
 *   - <flags summary>
 *
 *   ## Likely next moves
 *   1. **`<verb> <target>`** — <rationale>
 *
 *   [<idle prompt>]
 *
 * Sections collapse when their inputs are empty (no zero-count rows,
 * no "no flags" placeholder). The renderer composes prose from the
 * snapshot deterministically — same heuristic in the bare CLI and the
 * SessionStart hook so suggestions stay consistent.
 *
 * `opts.color` enables ANSI escape codes for terminal output. The hook
 * output path always passes `false` (Claude Code renders markdown;
 * ANSI codes would corrupt the table structure).
 */
export function renderStatus(
  result: Report,
  opts: { color?: boolean; tip?: Tip | null } = {},
): string {
  const color = opts.color ?? false
  const { snapshot, flags } = result
  const out: string[] = []

  out.push(bold('# Cadence Status', color))
  out.push('')

  const thisWeek = renderThisWeek(snapshot, color)
  if (thisWeek) {
    out.push(thisWeek)
    out.push('')
  }

  const activeBlock = renderActivePursuits(snapshot, flags, color)
  if (activeBlock) {
    out.push(activeBlock)
    out.push('')
  }

  const brainstormsBlock = renderActiveBrainstorms(snapshot, color)
  if (brainstormsBlock) {
    out.push(brainstormsBlock)
    out.push('')
  }

  const onHoldBlock = renderOnHoldPursuits(snapshot, color)
  if (onHoldBlock) {
    out.push(onHoldBlock)
    out.push('')
  }

  const headsUp = renderHeadsUp(snapshot, flags, color)
  if (headsUp) {
    out.push(headsUp)
    out.push('')
  }

  const signals = computeSuggestionSignals(snapshot, snapshot.repoRoot)
  const moves = curateNextMoves(snapshot, flags, signals)
  const movesBlock = renderLikelyNextMoves(moves, color)
  if (movesBlock) {
    out.push(movesBlock)
  }

  const idle = renderIdleTimePrompt(snapshot)
  if (idle) {
    out.push('')
    out.push(idle)
  }

  if (opts.tip) {
    out.push('')
    out.push('---')
    out.push('')
    out.push(renderTipBlock(opts.tip, color))
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()
}

/**
 * Render a tip as a dimmed, italicized one-or-two-liner. Smart-colleague
 * marginalia: present but quiet. The attribution renders on its own
 * line so the source is legible without taking visual weight from the
 * content. See cadence-plugin/tips/README.md for the editorial tone target.
 */
function renderTipBlock(tip: Tip, color: boolean): string {
  // Italic the content (markdown asterisks render in Claude Code; ANSI
  // dim approximates the same visual weight in a TTY).
  const content = `*${tip.content.replace(/\n+/g, ' ')}*`
  const attribution = tip.attribution
    ? `— ${tip.attribution}`
    : null
  const lines: string[] = []
  lines.push(dim(content, color))
  if (attribution) lines.push(dim(attribution, color))
  return lines.join('\n')
}

/**
 * Renders just the flags section in its plain form. Used by
 * `cadence flags`. Stays in the old shape (one line per flag) because
 * the consumer asked for flags explicitly — not the dashboard summary.
 */
export function renderFlags(flags: Flag[], snapshot: Snapshot): string {
  if (flags.length === 0) return 'No flags. System is healthy.'
  return flags.map((f) => '- ' + describeFlag(f, snapshot)).join('\n')
}

// ---------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------

function renderThisWeek(snapshot: Snapshot, color: boolean): string | null {
  const lp = leveragedPriority(snapshot)
  const lastTouch = snapshot.lastTouch ?? null

  if (!lp && !lastTouch) return null

  const parts: string[] = []
  parts.push(bold('**This week**', color) + ':')
  if (lp) {
    parts.push(`${lpToFraming(lp)}.`)
  } else {
    parts.push(`no leveraged priority set — /cadence:reflect to set one.`)
  }
  if (lastTouch) {
    const ago = relativeAgo(lastTouch.timestamp, snapshot.generatedAt)
    parts.push(`Last touch was \`${lastTouch.project_id}\` (${ago}).`)
  }
  return parts.join(' ')
}

function renderActivePursuits(
  snapshot: Snapshot,
  flags: Flag[],
  color: boolean,
): string | null {
  const activePursuits = snapshot.pursuits.filter(
    (p) => p.lifecycle === 'active',
  )
  if (activePursuits.length === 0) return null

  const out: string[] = []
  out.push(bold('## Active Pursuits', color))

  const closingInIds = new Set(
    flags
      .filter((f) => f.kind === 'closing_in_on_resolution')
      .map((f) => (f as Flag & { kind: 'closing_in_on_resolution' }).pursuitId),
  )

  // Stable ordering: most recently active pursuit first, then alpha.
  const pursuitsSorted = [...activePursuits].sort((a, b) => {
    const aTs = lastActivityOnPursuit(snapshot, a.id) ?? ''
    const bTs = lastActivityOnPursuit(snapshot, b.id) ?? ''
    if (aTs && !bTs) return -1
    if (!aTs && bTs) return 1
    if (aTs && bTs && aTs !== bTs) return aTs < bTs ? 1 : -1
    return a.id.localeCompare(b.id)
  })

  for (const pursuit of pursuitsSorted) {
    const allProjects = snapshot.projects.filter((p) => p.pursuit === pursuit.id)
    const done = allProjects.filter(
      (p) => p.status === 'done' || p.status === 'dropped',
    ).length
    const total = allProjects.length
    const openProjects = allProjects.filter(
      (p) => p.status === 'active' || p.status === 'on_hold',
    )
    const isClosingIn = closingInIds.has(pursuit.id)
    const allShipped = total > 0 && openProjects.length === 0
    const tag = allShipped
      ? gray(' (all projects shipped)', color)
      : isClosingIn
      ? gray(' (closing in)', color)
      : ''
    out.push('')
    out.push(
      bold(`### ${pursuit.id} — ${done}/${total} projects done${tag}`, color),
    )
    out.push('')

    if (allShipped) {
      out.push(
        `Ready to \`/cadence:resolve ${pursuit.id}\` — the closure narrative will surface what landed.`,
      )
      continue
    }

    if (openProjects.length === 0) {
      out.push(dim('_no open work — pursuit may be ready to resolve_', color))
      continue
    }

    out.push(renderPursuitTable(openProjects, color))
  }

  return out.join('\n')
}

function renderPursuitTable(
  projects: Project[],
  color: boolean,
): string {
  const rows: string[] = []
  rows.push('| Project | Status | Actions | What it\'s about |')
  rows.push('|---|---|---|---|')

  const projectsSorted = [...projects].sort((a, b) => {
    const order = (s: string) =>
      s === 'active' ? 0 : s === 'on_hold' ? 1 : 2
    const so = order(a.status) - order(b.status)
    if (so !== 0) return so
    return a.id.localeCompare(b.id)
  })

  for (const p of projectsSorted) {
    const status = statusBadge(p.status, color)
    const actions = `${p.actionProgress.done}/${p.actionProgress.total}`
    const blurb = escapeTableCell(firstSentence(p.intent, 60))
    rows.push(
      `| \`${p.id}\` | ${status} | ${actions} | ${blurb} |`,
    )
  }

  return rows.join('\n')
}

/**
 * Render active brainstorms (`diverging` or `converging`) as their own
 * block. Brainstorms aren't pursuit-attached in v1.1 — they live in
 * `brainstorms/<slug>/` and surface as standalone WIP. The block
 * collapses when no brainstorms are active.
 */
function renderActiveBrainstorms(
  snapshot: Snapshot,
  color: boolean,
): string | null {
  const active = snapshot.brainstorms
    .filter((b) => b.phase === 'diverging' || b.phase === 'converging')
    .sort((a, b) => b.last_touched.localeCompare(a.last_touched))
  if (active.length === 0) return null

  const out: string[] = []
  out.push(bold('## Active Brainstorms', color))
  out.push('')
  out.push('| Brainstorm | Phase | Last touched |')
  out.push('|---|---|---|')
  for (const b of active) {
    const phase = statusBadge(b.phase, color)
    const touched = b.last_touched.slice(0, 10)
    out.push(`| \`${b.slug}\` | ${phase} | ${touched} |`)
  }
  return out.join('\n')
}

function renderOnHoldPursuits(
  snapshot: Snapshot,
  color: boolean,
): string | null {
  const onHold = snapshot.pursuits.filter((p) => p.lifecycle === 'someday')
  if (onHold.length === 0) return null

  const out: string[] = []
  out.push(bold('## On Hold Pursuits', color))
  out.push('')
  out.push('| Pursuit | Paused | Why it mattered |')
  out.push('|---|---|---|')
  for (const p of onHold) {
    const paused = onHoldPausedDate(snapshot, p) ?? '—'
    const why = escapeTableCell(firstSentence(p.why ?? p.description, 80))
    out.push(`| \`${p.id}\` | ${paused} | ${why} |`)
  }
  return out.join('\n')
}

function renderHeadsUp(
  snapshot: Snapshot,
  flags: Flag[],
  color: boolean,
): string | null {
  const bullets: string[] = []

  // Inbox line — always emit (the empty-state "✓" is itself a signal).
  const inboxView = inboxItems(snapshot)
  const threshold = snapshot.config.inbox_soft_threshold
  bullets.push(renderInboxBullet(inboxView, threshold))

  // Pending validations as a nudge, not a numbered queue.
  const pending = readPendingValidations(snapshot.repoRoot)
  if (pending.length > 0) {
    const subjectFragment = pending.length === 1
      ? 'one behavior is queued'
      : `${pending.length} behaviors are queued`
    bullets.push(
      `${subjectFragment} for fresh-session validation — peek when you're ready.`,
    )
  }

  // Flags summary — one line, names the specific signals.
  const flagSummary = summarizeFlags(flags, snapshot)
  if (flagSummary) bullets.push(flagSummary)

  if (bullets.length === 0) return null

  const out: string[] = []
  out.push(bold('## Heads up', color))
  out.push('')
  for (const b of bullets) out.push(`- ${b}`)
  return out.join('\n')
}

function renderLikelyNextMoves(
  moves: NextMove[],
  color: boolean,
): string | null {
  if (moves.length === 0) return null
  const out: string[] = []
  out.push(bold('## Likely next moves', color))
  out.push('')
  moves.forEach((m, i) => {
    const call = m.target ? `${m.verb} ${m.target}` : m.verb
    out.push(`${i + 1}. ${bold('`' + call + '`', color)} — ${m.rationale}`)
  })
  return out.join('\n')
}

// ---------------------------------------------------------------------
// Composition helpers
// ---------------------------------------------------------------------

/**
 * Turn a Leveraged Priority phrase into a "This week" framing. Most
 * LPs are already gerund-shaped ("ship v1.1...", "finish the kitchen
 * tile..."); we lower-case the first letter and prefix with a verb if
 * the LP doesn't lead with one.
 *
 * Conservative: when in doubt, quote the LP verbatim.
 */
function lpToFraming(lp: string): string {
  const trimmed = lp.trim()
  if (!trimmed) return 'no leveraged priority set'
  // Take just the first sentence and cap at ~80 chars so a verbose LP
  // doesn't dominate the opening line. Strip any trailing "." (the
  // outer template appends its own) so we don't double-punctuate.
  const sentence = firstSentence(trimmed, 80).replace(/[.!?]+$/, '')
  if (!sentence) return 'no leveraged priority set'
  // Lower the first char so it reads as a continuation of the prose
  // ("**This week**: ship..." rather than "**This week**: Ship...").
  return sentence[0]!.toLowerCase() + sentence.slice(1)
}

function relativeAgo(timestamp: string, generatedAt: string): string {
  const now = new Date(generatedAt).getTime()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then
  if (diffMs < 0) return 'just now'
  const mins = Math.floor(diffMs / (60 * 1000))
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins}m ago`
  const hours = Math.floor(diffMs / (60 * 60 * 1000))
  if (hours < 24) return hours === 1 ? '1h ago' : `${hours}h ago`
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (days === 1) return 'yesterday'
  return `${days}d ago`
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

function firstSentence(text: string, maxLen: number): string {
  if (!text) return ''
  const cleaned = text.replace(/\s+/g, ' ').trim()
  const period = cleaned.search(/[.!?](\s|$)/)
  const sentence = period > 0 ? cleaned.slice(0, period).trim() : cleaned
  if (sentence.length <= maxLen) return sentence
  return sentence.slice(0, maxLen - 1).trim() + '…'
}

function escapeTableCell(text: string): string {
  // Markdown tables break on `|` inside cells; replace with the
  // visually-equivalent fullwidth bar so the table structure stays
  // intact without losing the character entirely.
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

function lastActivityOnPursuit(
  snapshot: Snapshot,
  pursuitId: string,
): string | null {
  let max: string | null = null
  for (const p of snapshot.projects) {
    if (p.pursuit !== pursuitId) continue
    if (!p.last_activity_at) continue
    if (max === null || p.last_activity_at > max) max = p.last_activity_at
  }
  return max
}

function onHoldPausedDate(
  snapshot: Snapshot,
  pursuit: Pursuit,
): string | null {
  // Heuristic: the most recent activity on any project under this
  // pursuit approximates when the pursuit was last touched before
  // being set aside. Falls back to the pursuit's `created` date.
  const ts = lastActivityOnPursuit(snapshot, pursuit.id)
  if (ts) return ts.slice(0, 10)
  return pursuit.created || null
}

function renderInboxBullet(
  view: ReturnType<typeof inboxItems>,
  threshold: number,
): string {
  const { total, overdue, aged, fresh } = view.counts
  if (total === 0) return 'Inbox: empty ✓'
  if (total <= threshold) return `Inbox: ${total} items ✓`
  const buckets: string[] = []
  if (overdue > 0) buckets.push(`${overdue} overdue`)
  if (aged > 0) buckets.push(`${aged} aged`)
  if (fresh > 0) buckets.push(`${fresh} fresh`)
  return `Inbox: ${total} items (${buckets.join(', ')}) — above soft cap (${threshold}). \`/cadence:start inbox\` to walk them.`
}

function summarizeFlags(flags: Flag[], snapshot: Snapshot): string | null {
  // The Inbox bullet already speaks for `inbox_pressure` — don't
  // double-render it here.
  const visible = flags.filter((f) => f.kind !== 'inbox_pressure')
  if (visible.length === 0) return null

  const phrases = visible.slice(0, 3).map((f) => describeFlagShort(f, snapshot))
  const tail =
    visible.length > 3
      ? ` and ${visible.length - 3} more`
      : ''
  const lead =
    visible.length === 1
      ? 'Health: one quiet signal —'
      : `Health: ${visible.length} quiet signals —`
  return `${lead} ${phrases.join('; ')}${tail}. \`/cadence:reconcile\` to walk them.`
}

function describeFlagShort(flag: Flag, _snapshot: Snapshot): string {
  switch (flag.kind) {
    case 'overdue_waiting_for':
      return `${flag.item.person} re: ${flag.item.what} (${flag.daysOverdue}d overdue)`
    case 'dormant_project':
      return flag.daysSinceActivity !== null
        ? `dormant project \`${flag.projectId}\` (${flag.daysSinceActivity}d)`
        : `dormant project \`${flag.projectId}\``
    case 'structural_active_no_open_actions':
      return `\`${flag.projectId}\` has all actions checked — ready to resolve?`
    case 'wip_over_limit':
      return `${flag.count} in-progress projects (limit ${flag.limit})`
    case 'closing_in_on_resolution':
      return `\`${flag.pursuitId}\` closing in (${flag.resolvedCount}/${flag.totalCount} done)`
    case 'inbound_issues_piling_up':
      return `${flag.count} untriaged issues on \`${flag.ownerRepo}\``
    case 'capstone_gap':
      return `\`${flag.unitId}\` resolved with ${flag.sources} researched sources and no capstone`
    case 'retrospective_due':
      return `${flag.newSinceLast} pursuits resolved since the last retrospective`
    case 'inbox_pressure':
      // Not reached — filtered above.
      return ''
  }
  const _exhaustive: never = flag
  return _exhaustive
}

// ---------------------------------------------------------------------
// Legacy flag rendering — used by `cadence flags` plain output.
// ---------------------------------------------------------------------

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
    case 'closing_in_on_resolution': {
      const remaining = flag.unresolvedCount === 1 ? '1 project' : `${flag.unresolvedCount} projects`
      return `closing in: ${flag.pursuitId} (${flag.resolvedCount}/${flag.totalCount} done, ${remaining} left) — what would need to be true to close?`
    }
    case 'inbound_issues_piling_up': {
      const issueWord = flag.count === 1 ? 'issue' : 'issues'
      const cachedNote = flag.fromCache ? ' (cached)' : ''
      return `inbound: ${flag.count} untriaged ${issueWord} on ${flag.ownerRepo}${cachedNote} — /cadence:incoming to triage`
    }
    case 'inbox_pressure': {
      const buckets: string[] = []
      if (flag.overdue > 0) buckets.push(`${flag.overdue} overdue`)
      if (flag.aged > 0) buckets.push(`${flag.aged} aged`)
      if (flag.fresh > 0) buckets.push(`${flag.fresh} fresh`)
      const breakdown = buckets.length ? ` (${buckets.join(', ')})` : ''
      return `Inbox: ${flag.count} items${breakdown} — above soft cap (${flag.threshold}). Run /cadence:start inbox to walk them.`
    }
    case 'capstone_gap': {
      const sourceWord = flag.sources === 1 ? 'source' : 'sources'
      return `capstone gap: ${flag.unitId} resolved with ${flag.sources} researched ${sourceWord} and no capstone — /cadence:narrate capstone ${flag.projectId ?? flag.pursuitId} to crystallize`
    }
    case 'retrospective_due':
      return `retrospective due: ${flag.newSinceLast} pursuits resolved since the last retrospective (${flag.pursuitIds.join(', ')}) — /cadence:narrate lessons to synthesize the arc`
  }
  const _exhaustive: never = flag
  return _exhaustive
}

// Re-exports for legacy callers that imported daysBetween via this module.
export { daysBetween }
