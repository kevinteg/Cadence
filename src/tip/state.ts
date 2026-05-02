import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export interface TipShowRecord {
  show_count: number
  last_shown: string // ISO-8601
}

export interface TipState {
  version: 1
  tips: Record<string, TipShowRecord>
}

const STATE_FILENAME = 'tip-state.json'

function statePath(repoRoot: string): string {
  return path.join(repoRoot, '.cadence', STATE_FILENAME)
}

export function readTipState(repoRoot: string): TipState {
  const filePath = statePath(repoRoot)
  if (!existsSync(filePath)) {
    return { version: 1, tips: {} }
  }
  try {
    const raw = readFileSync(filePath, 'utf8')
    const parsed = JSON.parse(raw) as TipState
    if (parsed.version !== 1 || typeof parsed.tips !== 'object') {
      return { version: 1, tips: {} }
    }
    return parsed
  } catch {
    return { version: 1, tips: {} }
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
