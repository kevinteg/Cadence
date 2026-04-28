import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { renderSnapshot, renderReport } from '../src/render/snapshot.ts'
import {
  CONFIG_DEFAULTS,
  type Flag,
  type Idea,
  type Marker,
  type Project,
  type Pursuit,
  type Report,
  type Snapshot,
} from '../src/types.ts'

const NOW = '2026-04-27T12:00:00.000Z'

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
    hasMarker: false,
    ...overrides,
  }
}

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    config: { ...CONFIG_DEFAULTS },
    pursuits: [],
    projects: [],
    ideas: [],
    markers: [],
    captures: [],
    reflections: [],
    generatedAt: NOW,
    repoRoot: '/tmp/fake',
    ...overrides,
  }
}

test('renderSnapshot includes header, generated timestamp, and root', () => {
  const out = renderSnapshot(makeSnapshot())
  assert.match(out, /^Cadence Snapshot/)
  assert.match(out, new RegExp(`generated: ${NOW}`))
  assert.match(out, /root: \/tmp\/fake/)
})

test('renderSnapshot config block lists every default key', () => {
  const out = renderSnapshot(makeSnapshot())
  for (const key of [
    'marker_stale_days',
    'waiting_for_grace_days',
    'dormant_days',
    'max_active_projects',
    'someday_review',
    'reflect_day',
    'reflect_duration_minutes',
  ]) {
    assert.match(out, new RegExp(key))
  }
})

test('renderSnapshot pursuit table shows id, type, lifecycle, status, created', () => {
  const out = renderSnapshot(
    makeSnapshot({
      pursuits: [
        makePursuit({ id: 'alpha', type: 'finite', lifecycle: 'active' }),
        makePursuit({
          id: 'beta',
          type: 'someday',
          lifecycle: 'someday',
          status: 'someday',
        }),
      ],
    }),
  )
  assert.match(out, /Pursuits \(2\)/)
  assert.match(out, /alpha\s+finite\s+active/)
  assert.match(out, /beta\s+someday\s+someday/)
})

test('renderSnapshot project table shows actions progress + STARTED flag', () => {
  const out = renderSnapshot(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [
        makeProject({
          id: 'started',
          actionProgress: { done: 1, total: 4 },
          hasMarker: true,
        }),
        makeProject({
          id: 'cold',
          actionProgress: { done: 0, total: 0 },
          hasMarker: false,
        }),
      ],
    }),
  )
  assert.match(out, /Projects \(2\)/)
  assert.match(out, /started\s+p\s+active\s+1\/4\s+yes/)
  assert.match(out, /cold\s+p\s+active\s+0\/0\s+no/)
})

test('renderSnapshot markers sort newest first and truncate next field', () => {
  const longNext = 'x'.repeat(120)
  const markers: Marker[] = [
    {
      pursuit: 'p',
      project: 'proj',
      session_start: '2026-04-20T08:00:00',
      actions_completed: [],
      where: '',
      next: 'older',
      open: '',
      path: '',
      timestamp: '2026-04-20T08:00:00',
    },
    {
      pursuit: 'p',
      project: 'proj',
      session_start: '2026-04-25T08:00:00',
      actions_completed: [],
      where: '',
      next: longNext,
      open: '',
      path: '',
      timestamp: '2026-04-25T08:00:00',
    },
  ]
  const out = renderSnapshot(makeSnapshot({ markers }))
  const newerIdx = out.indexOf('2026-04-25')
  const olderIdx = out.indexOf('2026-04-20')
  assert.ok(newerIdx > 0 && olderIdx > newerIdx, 'newer marker appears first')
  assert.ok(!out.includes(longNext), 'long next is truncated')
  assert.match(out, /…/)
})

test('renderSnapshot empty collections render "None." instead of a table', () => {
  const out = renderSnapshot(makeSnapshot())
  assert.match(out, /Pursuits \(0\)\n  None\./)
  assert.match(out, /Projects \(0\)\n  None\./)
  assert.match(out, /Markers \(0\)\n  None\./)
  assert.match(out, /Ideas \(0\)\n  None\./)
  assert.match(out, /Captures \(0\)\n  None\./)
  assert.match(out, /Reflections \(0\)\n  None\./)
})

test('renderSnapshot ideas table shows state, parent, age', () => {
  const idea: Idea = {
    id: 'spark',
    parent: 'wandering',
    state: 'seed',
    created: '2026-04-21',
    body: '',
    path: 'pursuits/wandering/ideas/spark.md',
    ageDays: 6,
  }
  const out = renderSnapshot(makeSnapshot({ ideas: [idea] }))
  assert.match(out, /Ideas \(1\)/)
  assert.match(out, /spark\s+seed\s+wandering\s+6d/)
})

test('renderReport appends a Flags section after the snapshot', () => {
  const report: Report = { snapshot: makeSnapshot(), flags: [] }
  const out = renderReport(report)
  assert.match(out, /^Cadence Snapshot/)
  assert.match(out, /Flags \(0\)\n  No flags\./)
})

test('renderReport tabulates each flag kind with target and detail', () => {
  const flags: Flag[] = [
    {
      kind: 'overdue_waiting_for',
      pursuitId: 'p',
      projectId: 'proj',
      item: { person: 'alice', what: 'review', expected: '2026-04-20', flagged: true },
      daysOverdue: 5,
    },
    { kind: 'stale_marker', pursuitId: 'p', projectId: 'proj', daysSinceMarker: 9 },
    { kind: 'wip_over_limit', count: 6, limit: 5, projectIds: ['a', 'b'] },
  ]
  const out = renderReport({ snapshot: makeSnapshot(), flags })
  assert.match(out, /Flags \(3\)/)
  assert.match(out, /overdue_waiting_for\s+p\/proj\s+alice re: review \(5d overdue\)/)
  assert.match(out, /stale_marker\s+p\/proj\s+9d old/)
  assert.match(out, /wip_over_limit\s+\s+6 in-progress \(limit 5\): a, b/)
})
