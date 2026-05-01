import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Reflection, Snapshot } from '../types.js'

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
}

export const NO_SIGNALS: SuggestionSignals = {
  narrateTodayStale: false,
  weeklyPreviewDue: false,
}

export function computeSuggestionSignals(
  snapshot: Snapshot,
  repoRoot: string,
): SuggestionSignals {
  const now = new Date(snapshot.generatedAt)
  return {
    narrateTodayStale: detectNarrateTodayStale(snapshot, repoRoot, now),
    weeklyPreviewDue: detectWeeklyPreviewDue(snapshot.reflections, now),
  }
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
