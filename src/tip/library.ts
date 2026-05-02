import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'
import {
  isEligible,
  readTipState,
  type FrequencyCap,
  type TipState,
} from './state.js'

export type TipType = 'quote' | 'skill-teaching' | 'verb-hint'
export type TipTone = 'framing' | 'directive' | 'diagnostic' | 'structural'
export type TipWeight = 'low' | 'normal' | 'high'

export interface Tip {
  id: string
  type: TipType
  content: string
  attribution?: string
  triggers: string[]
  tone: TipTone
  weight: TipWeight
  frequency: FrequencyCap
  tags?: string[]
}

export interface Library {
  version: 1
  tips: Tip[]
}

interface RawTip {
  id?: unknown
  type?: unknown
  content?: unknown
  attribution?: unknown
  triggers?: unknown
  tone?: unknown
  weight?: unknown
  frequency?: { cool_down_minutes?: unknown; cool_down_days?: unknown; lifetime_max?: unknown }
  tags?: unknown
}

interface RawLibrary {
  version?: unknown
  tips?: unknown
}

const VALID_TYPES: TipType[] = ['quote', 'skill-teaching', 'verb-hint']
const VALID_TONES: TipTone[] = ['framing', 'directive', 'diagnostic', 'structural']
const VALID_WEIGHTS: TipWeight[] = ['low', 'normal', 'high']

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string')
}

function asNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  return undefined
}

function asString(v: unknown): string | undefined {
  if (typeof v === 'string' && v.length > 0) return v
  return undefined
}

export function libraryPath(): string {
  // bin/cadence is bundled; library.yaml is a sibling under tips/
  const here = fileURLToPath(import.meta.url)
  return path.resolve(path.dirname(here), '..', 'tips', 'library.yaml')
}

export function readLibrary(libPath?: string): Library {
  const filePath = libPath ?? libraryPath()
  if (!existsSync(filePath)) {
    return { version: 1, tips: [] }
  }
  const raw = readFileSync(filePath, 'utf8')
  const doc = yaml.load(raw) as RawLibrary
  if (!doc || typeof doc !== 'object') {
    return { version: 1, tips: [] }
  }
  if (doc.version !== 1 || !Array.isArray(doc.tips)) {
    return { version: 1, tips: [] }
  }
  const tips: Tip[] = []
  for (const r of doc.tips as RawTip[]) {
    const id = asString(r.id)
    const type = VALID_TYPES.find((t) => t === r.type)
    const content = asString(r.content)
    const triggers = asStringArray(r.triggers)
    if (!id || !type || !content || triggers.length === 0) continue
    const tone = VALID_TONES.find((t) => t === r.tone) ?? 'structural'
    const weight = VALID_WEIGHTS.find((w) => w === r.weight) ?? 'normal'
    const frequency: FrequencyCap = {}
    if (r.frequency && typeof r.frequency === 'object') {
      const cdm = asNumber(r.frequency.cool_down_minutes)
      const cdd = asNumber(r.frequency.cool_down_days)
      const lim = asNumber(r.frequency.lifetime_max)
      if (cdm !== undefined) frequency.cool_down_minutes = cdm
      if (cdd !== undefined) frequency.cool_down_days = cdd
      if (lim !== undefined) frequency.lifetime_max = lim
    }
    const tip: Tip = {
      id,
      type,
      content: content.replace(/\s+$/u, ''),
      triggers,
      tone,
      weight,
      frequency,
    }
    const attribution = asString(r.attribution)
    if (attribution) tip.attribution = attribution
    const tags = asStringArray(r.tags)
    if (tags.length > 0) tip.tags = tags
    tips.push(tip)
  }
  return { version: 1, tips }
}

export interface SelectOptions {
  /** Active context tags. A tip matches if any of its triggers overlap. */
  triggers: string[]
  /** Optional tone filter — if set, only tips of these tones are eligible. */
  tones?: TipTone[]
  /** Optional type filter — if set, only tips of these types are eligible. */
  types?: TipType[]
  /** Optional repo root for state lookup; defaults to no eligibility filtering. */
  repoRoot?: string
  /** Override "now" for deterministic testing. */
  now?: Date
}

export interface CandidateTip {
  tip: Tip
  matched_triggers: string[]
}

/** Returns all tips matching the active triggers (no eligibility filtering). */
export function matchingTips(
  library: Library,
  options: SelectOptions,
): CandidateTip[] {
  const active = new Set(options.triggers)
  const candidates: CandidateTip[] = []
  for (const tip of library.tips) {
    const matched = tip.triggers.filter((t) => active.has(t))
    if (matched.length === 0) continue
    if (options.types && !options.types.includes(tip.type)) continue
    if (options.tones && !options.tones.includes(tip.tone)) continue
    candidates.push({ tip, matched_triggers: matched })
  }
  return candidates
}

/** Returns matching tips that are also frequency-eligible. */
export function eligibleTips(
  library: Library,
  state: TipState,
  options: SelectOptions,
): CandidateTip[] {
  const now = options.now ?? new Date()
  return matchingTips(library, options).filter((c) => {
    return isEligible(state, c.tip.id, c.tip.frequency, now).eligible
  })
}

/**
 * Selects ONE tip from the eligible candidates, or null if none.
 * Selection rule: weight-weighted random among eligible candidates,
 * with high > normal > low. Ties broken by least-recently-shown
 * (or never-shown) preference.
 */
export function selectTip(
  library: Library,
  state: TipState,
  options: SelectOptions,
): CandidateTip | null {
  const eligible = eligibleTips(library, state, options)
  if (eligible.length === 0) return null

  const weightValue = (w: TipWeight): number =>
    w === 'high' ? 3 : w === 'low' ? 1 : 2

  // Filter to highest-weight tier first.
  const maxWeight = Math.max(
    ...eligible.map((c) => weightValue(c.tip.weight)),
  )
  const topTier = eligible.filter(
    (c) => weightValue(c.tip.weight) === maxWeight,
  )

  // Within top tier, prefer never-shown, then least-recently-shown.
  topTier.sort((a, b) => {
    const ra = state.tips[a.tip.id]
    const rb = state.tips[b.tip.id]
    if (!ra && rb) return -1
    if (ra && !rb) return 1
    if (!ra && !rb) return 0
    const ta = new Date(ra!.last_shown).getTime()
    const tb = new Date(rb!.last_shown).getTime()
    return ta - tb
  })

  return topTier[0] ?? null
}

export interface TipStatusEntry {
  id: string
  type: TipType
  content_preview: string
  triggers: string[]
  show_count: number
  last_shown?: string
  eligible_now: boolean
  next_eligible_at?: string
}

/** Status report for `cadence tip-status`. */
export function tipStatus(
  library: Library,
  state: TipState,
  now: Date = new Date(),
): TipStatusEntry[] {
  return library.tips.map((tip) => {
    const elig = isEligible(state, tip.id, tip.frequency, now)
    const record = state.tips[tip.id]
    const entry: TipStatusEntry = {
      id: tip.id,
      type: tip.type,
      content_preview: tip.content.split('\n')[0]?.slice(0, 80) ?? '',
      triggers: tip.triggers,
      show_count: record?.show_count ?? 0,
      eligible_now: elig.eligible,
    }
    if (record?.last_shown) entry.last_shown = record.last_shown
    if (elig.next_eligible_at) entry.next_eligible_at = elig.next_eligible_at
    return entry
  })
}
