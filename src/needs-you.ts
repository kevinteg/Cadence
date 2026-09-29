import type { Snapshot, Thread, ThreadKind } from './types.js'
import { daysBetween } from './util/dates.js'

/**
 * The Needs-you view — everything that needs the human, across every
 * project in an active pursuit. A *view*, like the Inbox: one function,
 * one count, quoted by every surface (the status dashboard, the
 * SessionStart splash, `/threads`, `/reflect` Get Clear, the
 * reconciler's `needs_you_pressure` flag).
 *
 *   - open threads on projects with status active | on_hold
 *   - only projects whose pursuit is lifecycle: active
 *
 * Ordered oldest-first within a fixed kind order (decide, review,
 * unblock, waiting): a decision that is holding work outranks a
 * review, which outranks a person you are waiting on. Design:
 * docs/orchestrated-work-design.md §3 (Thread), §5.
 */

export const NEEDS_YOU_KIND_ORDER: ThreadKind[] = [
  'decide',
  'review',
  'unblock',
  'waiting',
]

export type NeedsYouItem = {
  thread: Thread
  projectId: string
  pursuitId: string
  age_days: number
  path: string
}

export type NeedsYouView = {
  items: NeedsYouItem[]
  counts: {
    total: number
    decide: number
    review: number
    unblock: number
    waiting: number
  }
}

export function needsYou(
  snapshot: Snapshot,
  now: Date = new Date(snapshot.generatedAt),
): NeedsYouView {
  const activePursuitIds = new Set(
    snapshot.pursuits.filter((p) => p.lifecycle === 'active').map((p) => p.id),
  )
  const items: NeedsYouItem[] = []
  for (const project of snapshot.projects) {
    if (!activePursuitIds.has(project.pursuit)) continue
    if (project.status !== 'active' && project.status !== 'on_hold') continue
    for (const thread of project.threads) {
      if (thread.status !== 'open') continue
      items.push({
        thread,
        projectId: project.id,
        pursuitId: project.pursuit,
        age_days: Math.max(0, daysBetween(thread.opened, now)),
        path: project.path,
      })
    }
  }
  items.sort((a, b) => {
    const ka = NEEDS_YOU_KIND_ORDER.indexOf(a.thread.kind)
    const kb = NEEDS_YOU_KIND_ORDER.indexOf(b.thread.kind)
    if (ka !== kb) return ka - kb
    return b.age_days - a.age_days
  })
  const count = (k: ThreadKind) =>
    items.filter((i) => i.thread.kind === k).length
  return {
    items,
    counts: {
      total: items.length,
      decide: count('decide'),
      review: count('review'),
      unblock: count('unblock'),
      waiting: count('waiting'),
    },
  }
}

/**
 * The canonical Needs-you line. Returns null when nothing needs the
 * human — callers omit the line rather than render a zero. Wording is
 * canonical in cadence-plugin/workflows/coaching-strings.md.
 */
export function renderNeedsYouLine(view: NeedsYouView): string | null {
  if (view.counts.total === 0) return null
  const parts: string[] = []
  for (const k of NEEDS_YOU_KIND_ORDER) {
    const n = view.counts[k]
    if (n > 0) parts.push(`${n} ${k}`)
  }
  return `Needs you: ${view.counts.total} (${parts.join(', ')})`
}

/** One line per thread, the shape every list surface uses. */
export function describeNeedsYouItem(item: NeedsYouItem): string {
  const t = item.thread
  const when =
    t.kind === 'waiting' && t.expected
      ? `expected ${t.expected}`
      : `${item.age_days}d`
  const by = t.by && t.by !== 'human' ? ` · ${t.by}` : ''
  return `${t.kind} · \`${item.projectId}\` · ${t.text} (${when}${by})`
}
