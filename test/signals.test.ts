import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { computeSuggestionSignals } from '../src/render/signals.ts'
import {
  CONFIG_DEFAULTS,
  type Project,
  type Pursuit,
  type Reflection,
  type Snapshot,
} from '../src/types.ts'

function makePursuit(overrides: Partial<Pursuit> = {}): Pursuit {
  return {
    id: 'p',
    type: 'finite',
    status: 'active',
    lifecycle: 'active',
    created: '2026-01-01',
    description: '',
    path: 'pursuits/p/pursuit.md',
    ...overrides,
  }
}

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj',
    pursuit: 'p',
    status: 'active',
    created: '2026-01-01',
    waiting_for: [],
    intent: '',
    dod: [],
    actions: [{ text: 'act', checked: false }],
    description: '',
    path: 'pursuits/p/projects/proj.md',
    dodProgress: { done: 0, total: 0 },
    actionProgress: { done: 0, total: 1 },
    ...overrides,
  }
}

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    config: { ...CONFIG_DEFAULTS },
    pursuits: [makePursuit()],
    projects: [],
    ideas: [],
    captures: [],
    reflections: [],
    generatedAt: '2026-04-30T12:00:00.000Z', // Thursday, ISO week 18
    repoRoot: '/tmp/none',
    ...overrides,
  }
}

function withTempRoot(fn: (root: string) => void) {
  const root = mkdtempSync(join(tmpdir(), 'cadence-signals-'))
  try {
    fn(root)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('narrateTodayStale=true when activity landed today and no daily file exists', () => {
  withTempRoot((root) => {
    const snapshot = makeSnapshot({
      projects: [
        makeProject({ last_activity_at: '2026-04-30T08:00:00.000Z' }),
      ],
      repoRoot: root,
    })
    const signals = computeSuggestionSignals(snapshot, root)
    assert.equal(signals.narrateTodayStale, true)
  })
})

test('narrateTodayStale=false when a daily narrative for today already exists', () => {
  withTempRoot((root) => {
    mkdirSync(join(root, 'narratives', 'drafts'), { recursive: true })
    writeFileSync(join(root, 'narratives', 'drafts', 'daily-2026-04-30.md'), 'x')
    const snapshot = makeSnapshot({
      projects: [
        makeProject({ last_activity_at: '2026-04-30T08:00:00.000Z' }),
      ],
      repoRoot: root,
    })
    const signals = computeSuggestionSignals(snapshot, root)
    assert.equal(signals.narrateTodayStale, false)
  })
})

test('narrateTodayStale=false when no project moved today (only old activity)', () => {
  withTempRoot((root) => {
    const snapshot = makeSnapshot({
      projects: [
        makeProject({ last_activity_at: '2026-04-25T08:00:00.000Z' }),
      ],
      repoRoot: root,
    })
    const signals = computeSuggestionSignals(snapshot, root)
    assert.equal(signals.narrateTodayStale, false)
  })
})

test('weeklyPreviewDue=true on Thursday when no reflection exists in this ISO week', () => {
  withTempRoot((root) => {
    // 2026-04-30 is Thursday (ISO week 18). No reflections at all.
    const snapshot = makeSnapshot({ repoRoot: root })
    const signals = computeSuggestionSignals(snapshot, root)
    assert.equal(signals.weeklyPreviewDue, true)
  })
})

test('weeklyPreviewDue=false on Monday (early week) regardless of reflections', () => {
  withTempRoot((root) => {
    // 2026-04-27 is Monday.
    const snapshot = makeSnapshot({
      generatedAt: '2026-04-27T12:00:00.000Z',
      repoRoot: root,
    })
    const signals = computeSuggestionSignals(snapshot, root)
    assert.equal(signals.weeklyPreviewDue, false)
  })
})

test('weeklyPreviewDue=false on Thursday when a reflection has run earlier this ISO week', () => {
  withTempRoot((root) => {
    // 2026-04-27 (Monday) is in ISO week 18, same as 2026-04-30 (Thursday).
    const reflection: Reflection = {
      date: '2026-04-27',
      status: 'complete',
      body: '',
      path: 'reflections/2026-04-27.md',
    }
    const snapshot = makeSnapshot({
      reflections: [reflection],
      repoRoot: root,
    })
    const signals = computeSuggestionSignals(snapshot, root)
    assert.equal(signals.weeklyPreviewDue, false)
  })
})

test('weeklyPreviewDue=true on Thursday when the only reflection is from a prior week', () => {
  withTempRoot((root) => {
    // 2026-04-20 is in ISO week 17, prior to today's week 18.
    const reflection: Reflection = {
      date: '2026-04-20',
      status: 'complete',
      body: '',
      path: 'reflections/2026-04-20.md',
    }
    const snapshot = makeSnapshot({
      reflections: [reflection],
      repoRoot: root,
    })
    const signals = computeSuggestionSignals(snapshot, root)
    assert.equal(signals.weeklyPreviewDue, true)
  })
})

// ───── reflectEntryMode ────────────────────────────────────────────

function makeReflection(overrides: Partial<Reflection> = {}): Reflection {
  return {
    date: '2026-04-26',
    status: 'complete',
    phase: 'get_focused',
    leveraged_priority: undefined,
    path: 'reflections/2026-04-26.md',
    ...overrides,
  }
}

test('reflectEntryMode = first when no reflections exist', () => {
  withTempRoot((root) => {
    const snapshot = makeSnapshot({ reflections: [], repoRoot: root })
    const signals = computeSuggestionSignals(snapshot, root)
    assert.equal(signals.reflectEntryMode, 'first')
  })
})

test('reflectEntryMode = same_week_done when a complete reflection exists in the current ISO week', () => {
  withTempRoot((root) => {
    // generatedAt is 2026-04-30 (Thu, ISO week 18). Reflection on 2026-04-27
    // (Mon) is the same ISO week.
    const snapshot = makeSnapshot({
      reflections: [makeReflection({ date: '2026-04-27', status: 'complete' })],
      repoRoot: root,
    })
    const signals = computeSuggestionSignals(snapshot, root)
    assert.equal(signals.reflectEntryMode, 'same_week_done')
  })
})

test('reflectEntryMode = same_week_in_progress when a draft reflection exists in the current ISO week', () => {
  withTempRoot((root) => {
    const snapshot = makeSnapshot({
      reflections: [
        makeReflection({ date: '2026-04-27', status: 'in_progress' }),
      ],
      repoRoot: root,
    })
    const signals = computeSuggestionSignals(snapshot, root)
    assert.equal(signals.reflectEntryMode, 'same_week_in_progress')
  })
})

test('reflectEntryMode = long_gap when last reflection was >14 days ago', () => {
  withTempRoot((root) => {
    // generatedAt is 2026-04-30; 21 days back is 2026-04-09.
    const snapshot = makeSnapshot({
      reflections: [makeReflection({ date: '2026-04-09', status: 'complete' })],
      repoRoot: root,
    })
    const signals = computeSuggestionSignals(snapshot, root)
    assert.equal(signals.reflectEntryMode, 'long_gap')
  })
})

test('reflectEntryMode = early_in_week when last reflection was prior ISO week and today is Mon-Wed', () => {
  withTempRoot((root) => {
    // 2026-04-27 = Monday. Prior reflection on 2026-04-19 (Sun, ISO week 16)
    // is 8 days ago, prior ISO week, today is Mon → early_in_week.
    const snapshot = makeSnapshot({
      reflections: [makeReflection({ date: '2026-04-19', status: 'complete' })],
      repoRoot: root,
      generatedAt: '2026-04-27T12:00:00.000Z',
    })
    const signals = computeSuggestionSignals(snapshot, root)
    assert.equal(signals.reflectEntryMode, 'early_in_week')
  })
})

test('reflectEntryMode = normal when last reflection was prior ISO week, recent, and today is Thu-Sun', () => {
  withTempRoot((root) => {
    // generatedAt is 2026-04-30 (Thu). Reflection on 2026-04-19 (Sun, ISO
    // week 16) is 11 days ago, prior week, today is Thu → normal.
    const snapshot = makeSnapshot({
      reflections: [makeReflection({ date: '2026-04-19', status: 'complete' })],
      repoRoot: root,
    })
    const signals = computeSuggestionSignals(snapshot, root)
    assert.equal(signals.reflectEntryMode, 'normal')
  })
})

test('reflectEntryMode prefers most recent when multiple reflections exist', () => {
  withTempRoot((root) => {
    const snapshot = makeSnapshot({
      reflections: [
        makeReflection({ date: '2026-03-15', status: 'complete' }),
        makeReflection({ date: '2026-04-27', status: 'complete' }),
      ],
      repoRoot: root,
    })
    const signals = computeSuggestionSignals(snapshot, root)
    assert.equal(signals.reflectEntryMode, 'same_week_done')
  })
})

// ───── tip-state category cap ──────────────────────────────────────

import {
  isCategoryEligible,
  recordCategoryShow,
} from '../src/tip/state.ts'

test('isCategoryEligible: true when category has never fired', () => {
  withTempRoot((root) => {
    const state = { version: 1 as const, tips: {}, categories: {} }
    assert.equal(isCategoryEligible(state, 'narrate-interjection', 7), true)
  })
})

test('isCategoryEligible: false within cool-down window, true after', () => {
  withTempRoot((root) => {
    const recent = new Date('2026-05-04T12:00:00Z').toISOString()
    const state = {
      version: 1 as const,
      tips: {},
      categories: { 'narrate-interjection': recent },
    }
    // 3 days later — still on cool-down (cool-down 7d).
    const threeDays = new Date('2026-05-07T12:00:00Z')
    assert.equal(isCategoryEligible(state, 'narrate-interjection', 7, threeDays), false)
    // 8 days later — eligible again.
    const eightDays = new Date('2026-05-12T12:00:00Z')
    assert.equal(isCategoryEligible(state, 'narrate-interjection', 7, eightDays), true)
  })
})

test('recordCategoryShow persists to tip-state.json', () => {
  withTempRoot((root) => {
    recordCategoryShow(root, 'reflect-interjection', new Date('2026-05-04T10:00:00Z'))
    const path = join(root, '.cadence', 'tip-state.json')
    assert.ok(existsSync(path))
    const parsed = JSON.parse(readFileSync(path, 'utf8'))
    assert.equal(parsed.categories['reflect-interjection'], '2026-05-04T10:00:00.000Z')
  })
})
