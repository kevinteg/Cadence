import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export interface TipShowRecord {
  show_count: number
  last_shown: string // ISO-8601
}

export interface TipState {
  version: 1
  tips: Record<string, TipShowRecord>
  /**
   * Per-category cool-down timestamps. Used by long-running-agent
   * interjections (and any future bulk-rate-limit case) where the cap
   * is on a category of show events, not on individual tip IDs.
   * Examples: "narrate-interjection" → "2026-05-04T10:00:00.000Z".
   * Optional — older state files without this field are forward-compatible.
   */
  categories?: Record<string, string>
}

const STATE_FILENAME = 'tip-state.json'

function statePath(repoRoot: string): string {
  return path.join(repoRoot, '.cadence', STATE_FILENAME)
}

export function readTipState(repoRoot: string): TipState {
  const filePath = statePath(repoRoot)
  if (!existsSync(filePath)) {
    return { version: 1, tips: {}, categories: {} }
  }
  try {
    const raw = readFileSync(filePath, 'utf8')
    const parsed = JSON.parse(raw) as TipState
    if (parsed.version !== 1 || typeof parsed.tips !== 'object') {
      return { version: 1, tips: {}, categories: {} }
    }
    if (!parsed.categories) parsed.categories = {}
    return parsed
  } catch {
    return { version: 1, tips: {}, categories: {} }
  }
}

export function writeTipState(repoRoot: string, state: TipState): void {
  const dir = path.join(repoRoot, '.cadence')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(statePath(repoRoot), JSON.stringify(state, null, 2) + '\n')
}

export function recordShow(
  repoRoot: string,
  tipId: string,
  now: Date = new Date(),
): TipShowRecord {
  const state = readTipState(repoRoot)
  const prior = state.tips[tipId]
  const updated: TipShowRecord = {
    show_count: (prior?.show_count ?? 0) + 1,
    last_shown: now.toISOString(),
  }
  state.tips[tipId] = updated
  writeTipState(repoRoot, state)
  return updated
}

export interface FrequencyCap {
  cool_down_minutes?: number
  cool_down_days?: number
  lifetime_max?: number
}

export interface EligibilityResult {
  eligible: boolean
  reason?:
    | 'cool-down-minutes'
    | 'cool-down-days'
    | 'lifetime-max'
    | 'never-shown'
    | 'eligible'
  next_eligible_at?: string // ISO-8601, when the tip becomes eligible again
}

export function isEligible(
  state: TipState,
  tipId: string,
  cap: FrequencyCap,
  now: Date = new Date(),
): EligibilityResult {
  const record = state.tips[tipId]
  if (!record) {
    return { eligible: true, reason: 'never-shown' }
  }
  if (cap.lifetime_max !== undefined && record.show_count >= cap.lifetime_max) {
    return { eligible: false, reason: 'lifetime-max' }
  }
  const lastShown = new Date(record.last_shown)
  const elapsedMs = now.getTime() - lastShown.getTime()

  if (cap.cool_down_minutes !== undefined) {
    const requiredMs = cap.cool_down_minutes * 60 * 1000
    if (elapsedMs < requiredMs) {
      return {
        eligible: false,
        reason: 'cool-down-minutes',
        next_eligible_at: new Date(
          lastShown.getTime() + requiredMs,
        ).toISOString(),
      }
    }
  }
  if (cap.cool_down_days !== undefined) {
    const requiredMs = cap.cool_down_days * 24 * 60 * 60 * 1000
    if (elapsedMs < requiredMs) {
      return {
        eligible: false,
        reason: 'cool-down-days',
        next_eligible_at: new Date(
          lastShown.getTime() + requiredMs,
        ).toISOString(),
      }
    }
  }
  return { eligible: true, reason: 'eligible' }
}

export function resetTips(
  repoRoot: string,
  predicate: (tipId: string) => boolean,
): string[] {
  const state = readTipState(repoRoot)
  const cleared: string[] = []
  for (const id of Object.keys(state.tips)) {
    if (predicate(id)) {
      delete state.tips[id]
      cleared.push(id)
    }
  }
  writeTipState(repoRoot, state)
  return cleared
}

/**
 * Returns true if the named category is eligible to fire — either it
 * has never fired before, OR more than `cool_down_days` have passed
 * since the last fire. Used by `tip-pick --category` to bulk-rate-limit
 * an entire class of show events (e.g. "narrate-interjection") rather
 * than gating per-tip.
 */
export function isCategoryEligible(
  state: TipState,
  categoryKey: string,
  coolDownDays: number,
  now: Date = new Date(),
): boolean {
  const lastShown = state.categories?.[categoryKey]
  if (!lastShown) return true
  const last = new Date(lastShown)
  const elapsedMs = now.getTime() - last.getTime()
  const requiredMs = coolDownDays * 24 * 60 * 60 * 1000
  return elapsedMs >= requiredMs
}

/**
 * Atomically record that a category fired at the given time. Skills
 * call this AFTER successfully surfacing a tip from that category.
 */
export function recordCategoryShow(
  repoRoot: string,
  categoryKey: string,
  now: Date = new Date(),
): void {
  const state = readTipState(repoRoot)
  if (!state.categories) state.categories = {}
  state.categories[categoryKey] = now.toISOString()
  writeTipState(repoRoot, state)
}
