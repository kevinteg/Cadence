import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
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
