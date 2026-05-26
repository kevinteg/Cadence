import { createHash } from 'node:crypto'
import { existsSync, mkdirSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Snapshot } from './types.js'
import { inboxItems } from './inbox.js'
import { readPendingValidations } from './validation/queue.js'

const STATE_DIR = '.cadence'
const LAST_BLOCK_FILE = 'last_session_block.json'
const DISMISSED_UNTIL_FILE = 'dismissed_until'
const DEFAULT_SUPPRESS_MINUTES = 60

export type SuppressionDecision =
  | { suppress: false }
  | { suppress: true; reason: 'recent_unchanged' | 'dismissed' }

/**
 * Computes a stable hash of the snapshot state that ambient surfaces
 * care about. If this hash matches the previous emission AND <60min
 * have passed, the splash suppresses. The exact field set is the
 * load-bearing detail: it must change when something happens the user
 * should re-see, and stay constant when nothing has.
 */
export function computeStateHash(snapshot: Snapshot): string {
  const view = inboxItems(snapshot)
  const parts = {
    pursuits: snapshot.pursuits
      .map((p) => `${p.id}:${p.lifecycle}`)
      .sort(),
    projects: snapshot.projects
      .map((p) => `${p.id}:${p.status}:${p.actionProgress.done}/${p.actionProgress.total}`)
      .sort(),
    inbox_count: view.counts.total,
    brainstorms: snapshot.brainstorms
      .map((b) => `${b.slug}:${b.phase}`)
      .sort(),
    validations: readPendingValidations(snapshot.repoRoot)
      .map((v) => v.description)
      .sort(),
  }
  return createHash('sha256')
    .update(JSON.stringify(parts))
    .digest('hex')
    .slice(0, 16)
}

/**
 * Reads `.cadence/last_session_block.json` and `.cadence/dismissed_until`
 * to decide whether the SessionStart splash should emit. The bare CLI
 * (`cadence status`) bypasses suppression — the user explicitly asked
 * for the dashboard. Only `--hook-output` consults this.
 */
export async function shouldSuppressSplash(
  repoRoot: string,
  currentHash: string,
  now: Date = new Date(),
  suppressMinutes: number = DEFAULT_SUPPRESS_MINUTES,
): Promise<SuppressionDecision> {
  // Dismissed-until check first — it's the explicit user override.
  const dismissedPath = path.join(repoRoot, STATE_DIR, DISMISSED_UNTIL_FILE)
  if (existsSync(dismissedPath)) {
    try {
      const text = (await readFile(dismissedPath, 'utf8')).trim()
      const until = new Date(text)
      if (!Number.isNaN(until.getTime()) && now < until) {
        return { suppress: true, reason: 'dismissed' }
      }
    } catch {
      // unreadable / malformed → ignore, fall through
    }
  }

  // Recent + unchanged check.
  const blockPath = path.join(repoRoot, STATE_DIR, LAST_BLOCK_FILE)
  if (!existsSync(blockPath)) return { suppress: false }
  try {
    const raw = await readFile(blockPath, 'utf8')
    const parsed = JSON.parse(raw) as { timestamp?: string; hash?: string }
    if (!parsed.timestamp || !parsed.hash) return { suppress: false }
    const lastTs = new Date(parsed.timestamp)
    if (Number.isNaN(lastTs.getTime())) return { suppress: false }
    const ageMs = now.getTime() - lastTs.getTime()
    const withinWindow = ageMs < suppressMinutes * 60_000 && ageMs >= 0
    if (withinWindow && parsed.hash === currentHash) {
      return { suppress: true, reason: 'recent_unchanged' }
    }
  } catch {
    // unreadable / malformed → fall through
  }
  return { suppress: false }
}

export async function recordSplashEmission(
  repoRoot: string,
  currentHash: string,
  now: Date = new Date(),
): Promise<void> {
  const dir = path.join(repoRoot, STATE_DIR)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const payload = JSON.stringify({
    timestamp: now.toISOString(),
    hash: currentHash,
  })
  await writeFile(path.join(dir, LAST_BLOCK_FILE), payload + '\n', 'utf8')
}

export async function writeDismissedUntil(
  repoRoot: string,
  until: Date,
): Promise<void> {
  const dir = path.join(repoRoot, STATE_DIR)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  await writeFile(
    path.join(dir, DISMISSED_UNTIL_FILE),
    until.toISOString() + '\n',
    'utf8',
  )
}

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
