import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { report } from '../src/report/reconciler.ts'
import {
  CONFIG_DEFAULTS,
  type Project,
  type Pursuit,
  type Snapshot,
} from '../src/types.ts'

const NOW = new Date('2026-04-27T12:00:00Z')

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
    dod: [{ text: 'do thing', checked: false }],
    actions: [{ text: 'action', checked: false }],
    description: '',
    path: 'pursuits/p/projects/proj.md',
    dodProgress: { done: 0, total: 1 },
    actionProgress: { done: 0, total: 1 },
    hasMarker: false,
    ...overrides,
  }
}

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    config: { ...CONFIG_DEFAULTS },
    pursuits: [makePursuit()],
    projects: [],
    ideas: [],
    markers: [],
    captures: [],
    reflections: [],
    generatedAt: NOW.toISOString(),
    repoRoot: '/tmp/fake',
    ...overrides,
  }
}

test('overdue waiting_for fires past expected + grace_days', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        waiting_for: [
          {
            person: 'alice',
            what: 'review',
            expected: '2026-04-20',
            flagged: false,
          },
        ],
      }),
    ],
  })
  const { flags } = report(snapshot)
  const flag = flags.find((f) => f.kind === 'overdue_waiting_for')
  assert.ok(flag)
  assert.equal(flag!.kind, 'overdue_waiting_for')
  if (flag!.kind === 'overdue_waiting_for') {
    // expected 2026-04-20, grace 2 days, now 2026-04-27 → 5 days overdue
    assert.equal(flag.daysOverdue, 5)
  }
})

test('overdue waiting_for does not fire within grace', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        waiting_for: [
          {
            person: 'a',
            what: 'b',
            expected: '2026-04-26',
            flagged: false,
          },
        ],
      }),
    ],
  })
  const { flags } = report(snapshot)
  assert.equal(
    flags.filter((f) => f.kind === 'overdue_waiting_for').length,
    0,
  )
})

test('dormant project flagged when last marker > dormant_days old', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        mostRecentMarker: '2026-04-01T10:00:00Z',
        hasMarker: true,
      }),
    ],
  })
  const { flags } = report(snapshot)
  const dormant = flags.find((f) => f.kind === 'dormant_project')
  assert.ok(dormant)
})

test('dormant project not flagged when actions are all checked', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        actions: [{ text: 'a', checked: true }],
        actionProgress: { done: 1, total: 1 },
        mostRecentMarker: '2026-04-01T10:00:00Z',
        hasMarker: true,
      }),
    ],
  })
  const { flags } = report(snapshot)
  assert.equal(flags.filter((f) => f.kind === 'dormant_project').length, 0)
})

test('stale marker fires past marker_stale_days but suppressed when dormant', () => {
  // Marker 10 days old: stale (>7) but not dormant (<14)
  const snapshot1 = makeSnapshot({
    projects: [
      makeProject({
        mostRecentMarker: '2026-04-17T12:00:00Z',
        hasMarker: true,
      }),
    ],
  })
  const r1 = report(snapshot1)
  assert.equal(
    r1.flags.filter((f) => f.kind === 'stale_marker').length,
    1,
  )
  assert.equal(
    r1.flags.filter((f) => f.kind === 'dormant_project').length,
    0,
  )

  // Marker 20 days old: dormant suppresses stale
  const snapshot2 = makeSnapshot({
    projects: [
      makeProject({
        mostRecentMarker: '2026-04-07T12:00:00Z',
        hasMarker: true,
      }),
    ],
  })
  const r2 = report(snapshot2)
  assert.equal(
    r2.flags.filter((f) => f.kind === 'dormant_project').length,
    1,
  )
  assert.equal(
    r2.flags.filter((f) => f.kind === 'stale_marker').length,
    0,
  )
})

test('structural empty DoD fires for active project with no DoD items', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        dod: [],
        dodProgress: { done: 0, total: 0 },
      }),
    ],
  })
  const { flags } = report(snapshot)
  assert.ok(flags.some((f) => f.kind === 'structural_empty_dod'))
})

test('structural done_unchecked fires when all DoD done but status active', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        dod: [{ text: 'd', checked: true }],
        dodProgress: { done: 1, total: 1 },
      }),
    ],
  })
  const { flags } = report(snapshot)
  assert.ok(flags.some((f) => f.kind === 'structural_done_unchecked'))
})

test('structural open_no_actions fires when DoD has open items but actions all checked', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        dod: [{ text: 'd', checked: false }],
        actions: [{ text: 'a', checked: true }],
        actionProgress: { done: 1, total: 1 },
      }),
    ],
  })
  const { flags } = report(snapshot)
  assert.ok(flags.some((f) => f.kind === 'structural_open_no_actions'))
})

test('WIP over limit fires when in-progress projects exceed max', () => {
  const projects: Project[] = []
  for (let i = 0; i < 6; i++) {
    projects.push(
      makeProject({
        id: `proj-${i}`,
        hasMarker: true,
        mostRecentMarker: '2026-04-26T12:00:00Z',
      }),
    )
  }
  const snapshot = makeSnapshot({ projects })
  const { flags } = report(snapshot)
  const wip = flags.find((f) => f.kind === 'wip_over_limit')
  assert.ok(wip)
  if (wip!.kind === 'wip_over_limit') {
    assert.equal(wip.count, 6)
    assert.equal(wip.limit, 5)
  }
})

test('on_hold and done projects do not get active-only flags', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        id: 'on-hold',
        status: 'on_hold',
        dod: [],
      }),
      makeProject({
        id: 'done',
        status: 'done',
        dod: [],
      }),
    ],
  })
  const { flags } = report(snapshot)
  assert.equal(flags.length, 0)
})

test('projects in non-active pursuits are excluded from active-only flags', () => {
  const snapshot = makeSnapshot({
    pursuits: [makePursuit({ id: 'someday-p', lifecycle: 'someday' })],
    projects: [
      makeProject({
        pursuit: 'someday-p',
        dod: [],
      }),
    ],
  })
  const { flags } = report(snapshot)
  assert.equal(flags.length, 0)
})
