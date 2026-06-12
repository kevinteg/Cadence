import type { Snapshot } from './types.js'
import { inboxItems } from './inbox.js'
import { readPendingValidations } from './validation/queue.js'

/**
 * Is this an empty repo? All of: zero pursuits, Inbox empty (no
 * captures, no diverging brainstorms), no pending validations.
 * Empty-repo state gets the coaching block instead of the dashboard.
 */
export function isEmptyRepo(snapshot: Snapshot): boolean {
  if (snapshot.pursuits.length > 0) return false
  const view = inboxItems(snapshot)
  if (view.counts.total > 0) return false
  const pending = readPendingValidations(snapshot.repoRoot)
  if (pending.length > 0) return false
  return true
}

/**
 * The empty-repo coaching block — the canonical strings from
 * cadence-plugin/workflows/coaching-strings.md. Rendered when
 * isEmptyRepo() is true.
 */
export function renderEmptyRepoCoaching(): string {
  return [
    'Cadence is initialized. Your Inbox is empty ✓.',
    '',
    'What do you want to start?',
    '  • Quick thought          → /cadence:capture "..."',
    '  • Long brain dump        → /cadence:capture --dump',
    '  • Ingest a doc           → /cadence:capture --from <path-or-url>',
    '  • Pull from a saved source → /cadence:capture --source <name>',
    '  • Open ideation          → /cadence:brainstorm <topic>',
    '  • See the verb surface   → /cadence:help',
  ].join('\n')
}

/**
 * The canonical Inbox line, threshold-aware. See coaching-strings.md
 * for the contract.
 */
export function renderInboxLine(
  snapshot: Snapshot,
  threshold: number,
): string {
  const view = inboxItems(snapshot)
  if (view.counts.total === 0) return 'Inbox: empty ✓'
  if (view.counts.total <= threshold) {
    return `Inbox: ${view.counts.total} items ✓`
  }
  const buckets: string[] = []
  if (view.counts.overdue > 0) buckets.push(`${view.counts.overdue} overdue`)
  if (view.counts.aged > 0) buckets.push(`${view.counts.aged} aged`)
  if (view.counts.fresh > 0) buckets.push(`${view.counts.fresh} fresh`)
  return `Inbox: ${view.counts.total} items (${buckets.join(', ')}) — above soft cap (${threshold}). Run /cadence:start inbox to walk them.`
}

/**
 * The canonical active-brainstorms line. Returns null when there
 * are no active (diverging or converging) brainstorms — caller
 * should omit the line entirely rather than emit a "0" reading.
 */
export function renderActiveBrainstormsLine(snapshot: Snapshot): string | null {
  const active = snapshot.brainstorms
    .filter((b) => b.phase === 'diverging' || b.phase === 'converging')
    .sort((a, b) => b.last_touched.localeCompare(a.last_touched))
  if (active.length === 0) return null
  const head = active.slice(0, 3)
  const tailCount = active.length - head.length
  const formatted = head
    .map((b) => `${b.slug} [${b.phase}]`)
    .join(', ')
  const tail = tailCount > 0 ? ` and ${tailCount} more` : ''
  return `Active brainstorms: ${active.length} (${formatted}${tail})`
}

/**
 * The canonical idle-time prompt. Returns null when activity is
 * recent (≤7 days). Computed against `max(projects[].last_activity_at)`;
 * when no project carries an activity timestamp, returns null
 * (we can't claim idleness without evidence).
 */
export function renderIdleTimePrompt(
  snapshot: Snapshot,
  now: Date = new Date(),
  idleDayThreshold: number = 7,
): string | null {
  let mostRecent: number | null = null
  for (const p of snapshot.projects) {
    if (!p.last_activity_at) continue
    const ts = new Date(p.last_activity_at).getTime()
    if (Number.isNaN(ts)) continue
    if (mostRecent === null || ts > mostRecent) mostRecent = ts
  }
  if (mostRecent === null) return null
  const daysSince = (now.getTime() - mostRecent) / (1000 * 60 * 60 * 24)
  if (daysSince <= idleDayThreshold) return null
  return "It's been a while since the last activity here. /cadence:reflect to catch up, or /cadence:status to see what's open."
}
