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
    threads: [],
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
    brainstorms: [],
    captures: [],
    livingDocs: [],
    wikiArtifacts: [],
    reflections: [],
    generatedAt: NOW.toISOString(),
    repoRoot: '/tmp/fake',
    ...overrides,
  }
}

test('thread_stale fires for a legacy waiting_for past expected + grace_days', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        waiting_for: [
          { person: 'alice', what: 'review', expected: '2026-04-20', flagged: false },
        ],
        threads: [
          {
            id: 'w0', kind: 'waiting', text: 'alice re: review',
            opened: '2026-04-20', by: 'human', status: 'open',
            person: 'alice', expected: '2026-04-20',
          },
        ],
      }),
    ],
  })
  const { flags } = report(snapshot)
  const flag = flags.find((f) => f.kind === 'thread_stale')
  assert.ok(flag, 'expected a thread_stale flag')
  if (flag!.kind === 'thread_stale') {
    // expected 2026-04-20, grace 2 days, now 2026-04-27 → 5 days overdue
    assert.equal(flag!.daysStale, 5)
    assert.equal(flag!.thread.kind, 'waiting')
  }
})

test('thread_stale does not fire for a waiting thread within grace', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        threads: [
          {
            id: 'w0', kind: 'waiting', text: 'alice re: review',
            opened: '2026-04-26', by: 'human', status: 'open',
            person: 'alice', expected: '2026-04-26',
          },
        ],
      }),
    ],
  })
  const { flags } = report(snapshot)
  assert.equal(flags.filter((f) => f.kind === 'thread_stale').length, 0)
})

test('thread_stale fires for a decide thread older than thread_stale_days, not a fresh one', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({
        threads: [
          { id: 't1', kind: 'decide', text: 'old', opened: '2026-04-10T09:00:00', by: 'run:r1', status: 'open' },
          { id: 't2', kind: 'decide', text: 'new', opened: '2026-04-26T09:00:00', by: 'run:r1', status: 'open' },
          { id: 't3', kind: 'decide', text: 'closed', opened: '2026-04-01T09:00:00', by: 'human', status: 'closed' },
        ],
      }),
    ],
  })
  const { flags } = report(snapshot)
  const stale = flags.filter((f) => f.kind === 'thread_stale')
  assert.equal(stale.length, 1)
  if (stale[0]!.kind === 'thread_stale') assert.equal(stale[0]!.thread.id, 't1')
})

test('needs_you_pressure fires above needs_you_soft_threshold with a per-kind breakdown', () => {
  const threads = Array.from({ length: 7 }, (_, i) => ({
    id: `t${i}`, kind: i < 4 ? ('decide' as const) : ('review' as const),
    text: `t${i}`, opened: '2026-04-27T09:00:00', by: 'human', status: 'open' as const,
  }))
  const { flags } = report(makeSnapshot({ projects: [makeProject({ threads })] }))
  const flag = flags.find((f) => f.kind === 'needs_you_pressure')
  assert.ok(flag)
  if (flag!.kind === 'needs_you_pressure') {
    assert.equal(flag!.count, 7)
    assert.equal(flag!.decide, 4)
    assert.equal(flag!.review, 3)
  }
  const under = report(makeSnapshot({ projects: [makeProject({ threads: threads.slice(0, 6) })] }))
  assert.equal(under.flags.filter((f) => f.kind === 'needs_you_pressure').length, 0)
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
  // Filter to "active-only" flags — closing_in_on_resolution is a
  // pursuit-level flag (a separate category) and is expected to fire
  // here because the pursuit has 1 done + 1 unresolved (on_hold).
  const activeOnlyFlags = flags.filter(
    (f) => f.kind !== 'closing_in_on_resolution',
  )
  assert.equal(activeOnlyFlags.length, 0)
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

// ───── closing_in_on_resolution ────────────────────────────────────

test('closing_in_on_resolution fires when 1 done project + 1 active remains', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({ id: 'p1', status: 'done' }),
      makeProject({ id: 'p2', status: 'active' }),
    ],
  })
  const { flags } = report(snapshot)
  const closing = flags.find((f) => f.kind === 'closing_in_on_resolution')
  assert.ok(closing, 'expected closing_in_on_resolution flag')
  if (closing && closing.kind === 'closing_in_on_resolution') {
    assert.equal(closing.unresolvedCount, 1)
    assert.equal(closing.resolvedCount, 1)
    assert.equal(closing.totalCount, 2)
  }
})

test('closing_in_on_resolution fires with 2 unresolved (mixed active + on_hold)', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({ id: 'd1', status: 'done' }),
      makeProject({ id: 'd2', status: 'dropped' }),
      makeProject({ id: 'a1', status: 'active' }),
      makeProject({ id: 'h1', status: 'on_hold' }),
    ],
  })
  const { flags } = report(snapshot)
  const closing = flags.find((f) => f.kind === 'closing_in_on_resolution')
  assert.ok(closing, 'expected closing_in_on_resolution flag with 2 unresolved')
  if (closing && closing.kind === 'closing_in_on_resolution') {
    assert.equal(closing.unresolvedCount, 2)
    assert.equal(closing.resolvedCount, 2)
  }
})

test('closing_in_on_resolution does NOT fire when 3+ unresolved remain', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({ id: 'd1', status: 'done' }),
      makeProject({ id: 'a1', status: 'active' }),
      makeProject({ id: 'a2', status: 'active' }),
      makeProject({ id: 'a3', status: 'active' }),
    ],
  })
  const { flags } = report(snapshot)
  assert.equal(
    flags.filter((f) => f.kind === 'closing_in_on_resolution').length,
    0,
    '3 unresolved is not "closing in" — should not fire',
  )
})

test('closing_in_on_resolution does NOT fire on a brand-new pursuit (no done projects yet)', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({ id: 'a1', status: 'active' }),
      makeProject({ id: 'h1', status: 'on_hold' }),
    ],
  })
  const { flags } = report(snapshot)
  assert.equal(
    flags.filter((f) => f.kind === 'closing_in_on_resolution').length,
    0,
    'no done projects means the pursuit hasn\'t shipped anything yet',
  )
})

test('closing_in_on_resolution does NOT fire when all projects are resolved', () => {
  const snapshot = makeSnapshot({
    projects: [
      makeProject({ id: 'd1', status: 'done' }),
      makeProject({ id: 'd2', status: 'done' }),
    ],
  })
  const { flags } = report(snapshot)
  assert.equal(
    flags.filter((f) => f.kind === 'closing_in_on_resolution').length,
    0,
    'all-done means resolve the pursuit, not "closing in"',
  )
})

test('capstone_gap fires for resolved units with uncrystallized research, not for cleared or capstoned ones', () => {
  const snapshot = makeSnapshot({
    pursuits: [
      makePursuit(),
      makePursuit({
        id: 'old-pursuit',
        lifecycle: 'archived',
        status: 'archived',
        research: { sources: 4, status: 'researching' },
        path: 'pursuits/_archived/old-pursuit/pursuit.md',
      }),
    ],
    projects: [
      // Fires: done + researching substrate + no narrative pointer.
      makeProject({
        id: 'gap',
        status: 'done',
        research: { sources: 6, status: 'researching' },
      }),
      // Silent: GC ritual already cleared raw/.
      makeProject({
        id: 'cleared',
        status: 'done',
        research: { sources: 3, status: 'cleared' },
      }),
      // Silent: capstone pointer exists.
      makeProject({
        id: 'capstoned',
        status: 'done',
        research: { sources: 5, status: 'researching' },
        narrative: 'wiki/narratives/capstoned.md',
      }),
      // Silent: still open.
      makeProject({
        id: 'open',
        status: 'active',
        research: { sources: 2, status: 'researching' },
      }),
    ],
  })
  const { flags } = report(snapshot)
  const gaps = flags.filter((f) => f.kind === 'capstone_gap')
  assert.equal(gaps.length, 2)
  assert.deepEqual(
    gaps.map((g) => (g.kind === 'capstone_gap' ? g.unitId : '')).sort(),
    ['old-pursuit', 'p/gap'],
  )
})

test('retrospective_due fires at threshold and respects the lessons set-watermark', () => {
  const resolved = ['a', 'b', 'c'].map((id) =>
    makePursuit({
      id,
      lifecycle: 'archived',
      status: 'archived',
      path: `pursuits/_archived/${id}/pursuit.md`,
    }),
  )
  // Three resolved, no watermark → fires at the default threshold (3).
  const due = report(makeSnapshot({ pursuits: resolved })).flags.filter(
    (f) => f.kind === 'retrospective_due',
  )
  assert.equal(due.length, 1)
  assert.equal(due[0]?.kind === 'retrospective_due' && due[0].newSinceLast, 3)

  // Same three already consulted by the last lessons run → silent.
  const quiet = report(
    makeSnapshot({
      pursuits: resolved,
      lessons_watermark: {
        path: 'wiki/drafts/lessons-2026-04-01.md',
        pursuits_consulted: ['a', 'b', 'c'],
      },
    }),
  ).flags.filter((f) => f.kind === 'retrospective_due')
  assert.equal(quiet.length, 0)
})

