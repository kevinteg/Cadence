import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Reflection, Snapshot } from '../types.js'

/**
 * Threshold for `reflectEntryMode === 'long_gap'`. Matches the
 * conventional "more than two weeks" intuition the catch-up flow
 * targets, and aligns with the default `dormant_days` threshold
 * elsewhere (close enough to be one constant worth keeping in mind).
 */
export const LONG_GAP_DAYS = 14

/**
 * Three-state-plus-shading classification of how /reflect should greet
 * the user. The skill branches once on this signal at the top:
 *
 * - `first` — no reflections yet; standard fresh-draft flow
 * - `same_week_done` — a complete reflection exists in the current
 *   ISO week; offer to add to it (re-opens by flipping status back to
 *   in_progress) or call it finished
 * - `same_week_in_progress` — a draft/in_progress reflection exists in
 *   the current ISO week; standard "pick up where you left off"
 * - `early_in_week` — last reflection was the *prior* ISO week and
 *   today is Monday/Tuesday/Wednesday; confirm "are you wrapping the
 *   week, or just checking in?" before proceeding
 * - `long_gap` — last reflection was >LONG_GAP_DAYS ago; encouraging
 *   "let's catch up — we'll keep this short" entry, condensed Get
 *   Clear (top severity-1 flags + most-recent captures only)
 * - `normal` — last reflection was in a prior ISO week, ≤14 days ago
 *   (and not early-in-week); standard flow
 */
export type ReflectEntryMode =
  | 'first'
  | 'same_week_done'
  | 'same_week_in_progress'
  | 'early_in_week'
  | 'long_gap'
  | 'normal'

/**
 * Inputs to context-aware suggestion rules in nextSteps() that the
 * pure Snapshot can't answer on its own (filesystem checks, derived
 * date math). Computed once per renderStatus() call and threaded
 * through so nextSteps() stays deterministic and easy to test.
 */
export type SuggestionSignals = {
  /**
   * True when activity landed today but no daily narrative draft
   * exists for today's date — i.e. there's something to recap and
   * /cadence:narrate today hasn't been run yet.
   */
  narrateTodayStale: boolean
  /**
   * True when the ISO week is in its closing days (Thursday onward)
   * AND no reflection has been recorded within the current ISO week.
   * Hint that the weekly Reflect ritual is approaching.
   */
  weeklyPreviewDue: boolean
  /**
   * How /reflect should greet the user. See ReflectEntryMode for the
   * branch table. Defaults to 'normal' for callers that don't pass
   * signals (older tests, NO_SIGNALS).
   */
  reflectEntryMode: ReflectEntryMode
}

export const NO_SIGNALS: SuggestionSignals = {
  narrateTodayStale: false,
  weeklyPreviewDue: false,
  reflectEntryMode: 'normal',
}

export function computeSuggestionSignals(
  snapshot: Snapshot,
  repoRoot: string,
): SuggestionSignals {
  const now = new Date(snapshot.generatedAt)
  return {
    narrateTodayStale: detectNarrateTodayStale(snapshot, repoRoot, now),
    weeklyPreviewDue: detectWeeklyPreviewDue(snapshot.reflections, now),
    reflectEntryMode: detectReflectEntryMode(snapshot.reflections, now),
  }
}

function detectReflectEntryMode(
  reflections: Reflection[],
  now: Date,
): ReflectEntryMode {
  if (reflections.length === 0) return 'first'

  const sorted = [...reflections].sort((a, b) => (a.date < b.date ? 1 : -1))
  const latest = sorted[0]!
  const latestDate = localMidnight(latest.date)
  const currentWeek = isoWeekKeyLocal(now)
  const latestWeek = isoWeekKeyLocal(latestDate)

  if (latestWeek === currentWeek) {
    return latest.status === 'complete'
      ? 'same_week_done'
      : 'same_week_in_progress'
  }

  // Different ISO week. Check the gap.
  const daysSince = daysBetweenLocal(latestDate, now)

  if (daysSince > LONG_GAP_DAYS) return 'long_gap'

  // Last reflection was the prior ISO week (or close) AND today is
  // Mon/Tue/Wed → likely too early to wrap a fresh week. Confirm.
  const dow = mondayBasedDowLocal(now)
  if (dow <= 3) return 'early_in_week'

  return 'normal'
}

function detectNarrateTodayStale(
  snapshot: Snapshot,
  repoRoot: string,
  now: Date,
): boolean {
  // Date math here uses local (system) time to match the /narrate
  // skill's file-naming convention — daily-YYYY-MM-DD.md is dated by
  // the user's wall clock, not UTC, so the splash signal and the
  // narrate output have to share that frame to stay aligned.
  const todayKey = isoDateLocal(now)
  const activityToday = snapshot.projects.some(
    (p) => p.last_activity_at && isoDateLocal(new Date(p.last_activity_at)) === todayKey,
  )
  if (!activityToday) return false
  const draftPath = join(repoRoot, 'narratives', 'drafts', `daily-${todayKey}.md`)
  return !existsSync(draftPath)
}

function detectWeeklyPreviewDue(reflections: Reflection[], now: Date): boolean {
  // Same wall-clock alignment as detectNarrateTodayStale: weekly
  // narratives and reflections are filed by local date.
  const dow = mondayBasedDowLocal(now)
  if (dow < 4) return false // Mon=1, Thu=4
  const currentWeek = isoWeekKeyLocal(now)
  const hasReflectionThisWeek = reflections.some(
    (r) => isoWeekKeyLocal(localMidnight(r.date)) === currentWeek,
  )
  return !hasReflectionThisWeek
}

function isoDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Mon=1, Tue=2, ..., Sun=7 — ISO 8601 ordering, local TZ. */
function mondayBasedDowLocal(d: Date): number {
  return ((d.getDay() + 6) % 7) + 1
}

/**
 * ISO 8601 week key in `YYYY-Www` form, local TZ. Weeks start
 * Monday; the week containing the year's first Thursday is week 1.
 */
function isoWeekKeyLocal(d: Date): string {
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7))
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7))
  const week =
    1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000))
  return `${target.getFullYear()}-W${String(week).padStart(2, '0')}`
}

/** Parse a YYYY-MM-DD date string as local midnight (not UTC). */
function localMidnight(yyyyMmDd: string): Date {
  const [y, m, d] = yyyyMmDd.split('-').map(Number)
  return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

/** Day count between two Date objects in local-midnight days. */
function daysBetweenLocal(from: Date, to: Date): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((end.getTime() - start.getTime()) / (24 * 3600 * 1000))
}
