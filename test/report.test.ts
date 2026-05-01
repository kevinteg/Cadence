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
    intent: '',
    dod: [],
    actions: [{ text: 'action', checked: false }],
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

test('dormant project flagged when last activity > dormant_days old', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        last_activity_at: '2026-04-01T10:00:00Z',
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
        last_activity_at: '2026-04-01T10:00:00Z',
      }),
    ],
  })
  const { flags } = report(snapshot)
  assert.equal(flags.filter((f) => f.kind === 'dormant_project').length, 0)
})

test('dormant_project uses last_activity_at when set', () => {
  // last_activity_at 20 days ago → dormant (>14)
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        last_activity_at: '2026-04-07T12:00:00Z',
      }),
    ],
  })
  const r = report(snapshot)
  const dormant = r.flags.filter((f) => f.kind === 'dormant_project')
  assert.equal(dormant.length, 1)
  if (dormant[0]?.kind === 'dormant_project') {
    assert.equal(dormant[0].daysSinceActivity, 20)
  }
})

test('structural_active_no_open_actions fires when active project has no unchecked actions', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        actions: [{ text: 'a', checked: true }],
        actionProgress: { done: 1, total: 1 },
      }),
    ],
  })
  const { flags } = report(snapshot)
  assert.ok(flags.some((f) => f.kind === 'structural_active_no_open_actions'))
})

test('structural_active_no_open_actions does not fire when an unchecked action remains', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        actions: [
          { text: 'a', checked: true },
          { text: 'b', checked: false },
        ],
        actionProgress: { done: 1, total: 2 },
      }),
    ],
  })
  const { flags } = report(snapshot)
  assert.equal(
    flags.filter((f) => f.kind === 'structural_active_no_open_actions').length,
    0,
  )
})

test('WIP over limit fires when in-progress projects exceed max', () => {
  const projects: Project[] = []
  for (let i = 0; i < 6; i++) {
    projects.push(
      makeProject({
        id: `proj-${i}`,
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
      }),
      makeProject({
        id: 'done',
        status: 'done',
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
      }),
    ],
  })
  const { flags } = report(snapshot)
  assert.equal(flags.length, 0)
})
