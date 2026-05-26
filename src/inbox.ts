import type { Brainstorm, Capture, Snapshot } from './types.js'
import { daysBetween } from './util/dates.js'

/**
 * The Inbox is a *view*, not a directory. It unions everything
 * untriaged across the repo:
 *
 *   - captures in `thoughts/unprocessed/`:
 *       - v1 captures (no `status` field) — all of them, since v1
 *         had no triage primitive on the capture itself
 *       - v2 captures with `status: untriaged`
 *   - brainstorm workspaces with `phase: diverging` — once a
 *     brainstorm converges (the user names solutions), it's no
 *     longer "untriaged material," it's "active WIP shaping a
 *     pursuit"
 *
 * This single function is the source of truth for what the Inbox
 * contains. All surfaces consume it:
 *
 *   - `cadence:status` dashboard ("Inbox: 4 items")
 *   - SessionStart hook (same line)
 *   - `/cadence:capture` exit menu ("3 items now in your Inbox")
 *   - `/cadence:reflect` Get Clear awareness pass
 *   - reconciler `inbox_pressure` flag
 *   - `/cadence:start inbox` triage entry
 *
 * One union, one count, consistent vocabulary.
 */

export type InboxItemKind = 'thought' | 'brainstorm'
export type InboxBucket = 'fresh' | 'aged' | 'overdue'

/** Recency bucket boundaries. */
const FRESH_MAX_DAYS = 2
const AGED_MAX_DAYS = 7

export type InboxItem = {
  kind: InboxItemKind
  id: string
  source: string
  age_days: number
  path: string
  bucket: InboxBucket
}

export type InboxView = {
  items: InboxItem[]
  counts: {
    total: number
    thoughts: number
    brainstorms: number
    fresh: number
    aged: number
    overdue: number
  }
}

export function inboxItems(
  snapshot: Snapshot,
  now: Date = new Date(),
): InboxView {
  const items: InboxItem[] = []

  for (const c of snapshot.captures) {
    if (!isUntriagedCapture(c)) continue
    const age = ageDays(c.captured, now)
    items.push({
      kind: 'thought',
      id: c.captured,
      source: describeCaptureSource(c),
      age_days: age,
      path: c.path,
      bucket: bucketFor(age),
    })
  }

  for (const b of snapshot.brainstorms) {
    if (b.phase !== 'diverging') continue
    const age = ageDays(b.last_touched, now)
    items.push({
      kind: 'brainstorm',
      id: b.slug,
      source: `brainstorm: ${b.slug}`,
      age_days: age,
      path: b.path,
      bucket: bucketFor(age),
    })
  }

  // Oldest first — triage walks the most-overdue items first.
  items.sort((a, b) => b.age_days - a.age_days)

  return {
    items,
    counts: {
      total: items.length,
      thoughts: items.filter((i) => i.kind === 'thought').length,
      brainstorms: items.filter((i) => i.kind === 'brainstorm').length,
      fresh: items.filter((i) => i.bucket === 'fresh').length,
      aged: items.filter((i) => i.bucket === 'aged').length,
      overdue: items.filter((i) => i.bucket === 'overdue').length,
    },
  }
}

function isUntriagedCapture(c: Capture): boolean {
  // v2: explicit untriaged status (or no status = legacy v2 write without status set, still untriaged)
  if (c.schema_version === 2) {
    return c.status === undefined || c.status === 'untriaged'
  }
  // v1: no status primitive. Any v1 capture in thoughts/unprocessed/ is implicitly untriaged.
  return true
}

function describeCaptureSource(c: Capture): string {
  if (c.source) {
    if (c.source.kind === 'mcp' && c.source.server) {
      return c.source.name
        ? `from ${c.source.server} (${c.source.name})`
        : `from ${c.source.server}`
    }
    if (c.source.kind === 'file' && c.source.name) {
      return `file: ${c.source.name}`
    }
    if (c.source.kind === 'url' && c.source.uri) {
      return `url: ${c.source.uri}`
    }
    if (c.source.kind === 'dump') return 'brain dump'
    if (c.source.kind === 'stdin') return 'piped'
    return c.source.kind
  }
  if (c.mcp) {
    return `from ${c.mcp.server}`
  }
  if (c.verb_context) {
    return c.verb_context
  }
  return 'inline note'
}

function ageDays(timestamp: string, now: Date): number {
  // Captures use ISO timestamp (YYYY-MM-DDTHH:MM:SS); brainstorms
  // last_touched is the same shape. daysBetween() handles either.
  return Math.max(0, daysBetween(timestamp, now))
}

function bucketFor(age: number): InboxBucket {
  if (age <= FRESH_MAX_DAYS) return 'fresh'
  if (age <= AGED_MAX_DAYS) return 'aged'
  return 'overdue'
}

/** Re-exported so callers don't have to know the constants. */
export const InboxBuckets = {
  FRESH_MAX_DAYS,
  AGED_MAX_DAYS,
} as const

// Brainstorm + Capture re-exports for caller convenience.
export type { Brainstorm, Capture }
