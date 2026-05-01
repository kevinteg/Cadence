import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { renderSnapshot, renderReport } from '../src/render/snapshot.ts'
import { nextSteps, renderStatus } from '../src/render/status.ts'
import {
  renderProject,
  renderPursuit,
  renderPursuits,
} from '../src/render/drilldown.ts'
import {
  CONFIG_DEFAULTS,
  type Capture,
  type Flag,
  type Idea,
  type Project,
  type Pursuit,
  type Reflection,
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
    ...overrides,
  }
}

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    config: { ...CONFIG_DEFAULTS },
    pursuits: [],
    projects: [],
    ideas: [],
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

test('renderSnapshot project table shows actions progress + LAST ACTIVITY', () => {
  const out = renderSnapshot(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [
        makeProject({
          id: 'started',
          actionProgress: { done: 1, total: 4 },
          last_activity_at: '2026-04-25T10:00:00Z',
        }),
        makeProject({
          id: 'cold',
          actionProgress: { done: 0, total: 0 },
        }),
      ],
    }),
  )
  assert.match(out, /Projects \(2\)/)
  assert.match(out, /started\s+p\s+active\s+1\/4\s+2026-04-25/)
  assert.match(out, /cold\s+p\s+active\s+0\/0\s+—/)
})

test('renderSnapshot empty collections render "None." instead of a table', () => {
  const out = renderSnapshot(makeSnapshot())
  assert.match(out, /Pursuits \(0\)\n  None\./)
  assert.match(out, /Projects \(0\)\n  None\./)
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

test('nextSteps surfaces unprocessed captures as priority 1', () => {
  const cap: Capture = {
    captured: '2026-04-29T08:00:00',
    body: 'something',
    path: 'thoughts/unprocessed/x.md',
  }
  const steps = nextSteps(
    makeSnapshot({ pursuits: [makePursuit()], captures: [cap] }),
    [],
  )
  assert.ok(steps[0]!.includes('1 unprocessed capture'))
  assert.ok(steps[0]!.includes('/cadence:reflect'))
})

test('nextSteps surfaces in-progress projects with marker first', () => {
  const steps = nextSteps(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [
        makeProject({ id: 'foo' }),
        makeProject({ id: 'bar' }),
      ],
    }),
    [],
  )
  assert.ok(steps.some((s) => s.includes('Resume') && s.includes('foo')))
  assert.ok(steps.some((s) => s.includes('1 other in-progress')))
})

test('nextSteps surfaces flags as priority 2', () => {
  const flags: Flag[] = [
    {
      kind: 'dormant_project',
      pursuitId: 'p',
      projectId: 'proj',
      daysSinceActivity: 30,
    },
  ]
  const steps = nextSteps(makeSnapshot({ pursuits: [makePursuit()] }), flags)
  assert.ok(steps.some((s) => s.includes('1 flag') && s.includes('/cadence:reconcile')))
})

test('nextSteps suggests reflect when last reflect is older than 7 days', () => {
  const oldReflection: Reflection = {
    date: '2026-04-15',
    status: 'complete',
    body: '',
    path: '',
  }
  // /reflect suggestion only fires when there's something to reflect on,
  // so include at least one project.
  const steps = nextSteps(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [makeProject({ id: 'foo', status: 'on_hold' })],
      reflections: [oldReflection],
    }),
    [],
  )
  assert.ok(steps.some((s) => /Last reflect was \d+d ago/.test(s)))
})

test('nextSteps falls back to on-hold pickup when no active', () => {
  const steps = nextSteps(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [makeProject({ id: 'paused', status: 'on_hold' })],
    }),
    [],
  )
  assert.ok(
    steps.some((s) => s.includes('on hold') && s.includes('/cadence:start')),
  )
})

test('nextSteps emits a bootstrap suggestion when nothing else applies', () => {
  const steps = nextSteps(
    makeSnapshot({ pursuits: [makePursuit({ id: 'wandering' })] }),
    [],
  )
  // No reflections, no projects, no captures, no flags →
  // bootstrap message.
  assert.ok(
    steps.some(
      (s) =>
        s.includes('Get started') &&
        (s.includes('/cadence:brainstorm') || s.includes('/cadence:init')),
    ),
  )
})

test('nextSteps caps suggestions at 3 and always points at /cadence:help when room', () => {
  const steps = nextSteps(makeSnapshot({ pursuits: [makePursuit()] }), [])
  assert.ok(steps.length <= 3)
  // With sparse state, /cadence:help should appear.
  assert.ok(steps.some((s) => s.includes('/cadence:help')))
})

test('renderStatus appends a Next: block computed by nextSteps', () => {
  const out = renderStatus({
    snapshot: makeSnapshot({ pursuits: [makePursuit()] }),
    flags: [],
  })
  assert.match(out, /Next:\n/)
  assert.match(out, /\/cadence:help/)
})

test('renderPursuits ends with an Available actions menu', () => {
  const out = renderPursuits(
    makeSnapshot({
      pursuits: [
        makePursuit({ id: 'alpha' }),
      ],
    }),
  )
  assert.match(out, /Available actions:/)
  assert.match(out, /\/cadence:status <id\|N>/)
  assert.match(out, /\/cadence:start/)
  assert.match(out, /\/cadence:help/)
})

test('renderPursuit ends with the pursuit-level action menu', () => {
  const out = renderPursuit(
    makeSnapshot({
      pursuits: [makePursuit({ id: 'p' })],
      projects: [makeProject({ id: 'foo', pursuit: 'p' })],
    }),
    'p',
  )
  assert.match(out, /Available actions:/)
  assert.match(out, /\/cadence:start /)
  assert.match(out, /\/cadence:narrate <pursuit>/)
  assert.match(out, /\/cadence:reconcile/)
  assert.match(out, /\/cadence:close <pursuit>/)
})

test('renderProject ends with the project-level action menu for active projects', () => {
  const out = renderProject(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [makeProject({ id: 'foo', status: 'active' })],
    }),
    'foo',
  )
  assert.match(out, /Available actions:/)
  assert.match(out, /\/cadence:start <project>/)
  assert.match(out, /\/cadence:complete <action>/)
  assert.match(out, /\/cadence:cancel <project>/)
  assert.match(out, /\/cadence:waiting <project>/)
})

test('renderProject shows a smaller menu for done or dropped projects', () => {
  const outDone = renderProject(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [makeProject({ id: 'foo', status: 'done' })],
    }),
    'foo',
  )
  assert.match(outDone, /Available actions:/)
  assert.match(outDone, /\/cadence:narrate <project>/)
  assert.match(outDone, /\/cadence:status/)
  // Active-only verbs should be absent.
  assert.doesNotMatch(outDone, /\/cadence:complete <action>/)
  assert.doesNotMatch(outDone, /\/cadence:cancel <project>/)
})

// --- find / search tests ---

import { findEntities, extractSnippet } from '../src/find.ts'
import { renderFindResults } from '../src/render/find.ts'

test('findEntities returns project matches in id, intent, and actions', () => {
  const snapshot = makeSnapshot({
    pursuits: [makePursuit({ id: 'p' })],
    projects: [
      makeProject({
        id: 'foo-bar',
        intent: 'Build a thing about plugins.',
        actions: [{ text: 'Touch the plugin manifest', checked: false }],
      }),
    ],
  })
  const results = findEntities(snapshot, 'plugin')
  assert.equal(results.length, 1)
  assert.equal(results[0]!.kind, 'project')
  assert.equal(results[0]!.id, 'foo-bar')
  assert.ok(results[0]!.matched_fields.includes('intent'))
  assert.ok(results[0]!.matched_fields.some((f) => f.startsWith('action')))
})

test('findEntities is case-insensitive', () => {
  const snapshot = makeSnapshot({
    pursuits: [makePursuit({ id: 'p' })],
    projects: [
      makeProject({
        id: 'mixed-case',
        intent: 'About PLUGINS and Plugin work.',
      }),
    ],
  })
  assert.equal(findEntities(snapshot, 'PLUGIN').length, 1)
  assert.equal(findEntities(snapshot, 'plugin').length, 1)
  assert.equal(findEntities(snapshot, 'Plugin').length, 1)
})

test('findEntities returns no results for empty query', () => {
  const snapshot = makeSnapshot({
    pursuits: [makePursuit({ id: 'p' })],
    projects: [makeProject({ id: 'foo', intent: 'something' })],
  })
  assert.deepEqual(findEntities(snapshot, ''), [])
})

test('findEntities orders by entity-kind priority then recency', () => {
  const snapshot: Snapshot = makeSnapshot({
    pursuits: [
      makePursuit({ id: 'p-target', description: 'matches target word' }),
    ],
    projects: [
      makeProject({
        id: 'older-project',
        intent: 'target match here',
        created: '2026-01-01',
      }),
      makeProject({
        id: 'newer-project',
        intent: 'target match here',
        created: '2026-04-01',
      }),
    ],
  })
  const results = findEntities(snapshot, 'target')
  // Two projects come before the pursuit (kind priority).
  assert.equal(results[0]!.kind, 'project')
  assert.equal(results[1]!.kind, 'project')
  assert.equal(results[2]!.kind, 'pursuit')
  // Within projects, newer first (recency desc tiebreaker).
  assert.equal(results[0]!.id, 'newer-project')
  assert.equal(results[1]!.id, 'older-project')
})

test('extractSnippet centers the window on the first match with ellipses on truncation', () => {
  const longText =
    'lorem ipsum dolor sit amet consectetur adipiscing elit ' +
    'sed do eiusmod tempor incididunt ut labore et dolore magna ' +
    'aliqua match here in the middle ' +
    'ut enim ad minim veniam quis nostrud exercitation ullamco'
  const snippet = extractSnippet(longText, 'match', 40)
  assert.match(snippet, /…/)
  assert.match(snippet, /match/)
  assert.ok(snippet.length <= 50, `snippet too long: ${snippet.length}`)
})

test('renderFindResults groups by kind and emits per-group Verbs line', () => {
  const snapshot = makeSnapshot({
    pursuits: [makePursuit({ id: 'p' })],
    projects: [
      makeProject({
        id: 'proj-foo',
        intent: 'about widgets',
      }),
    ],
  })
  const results = findEntities(snapshot, 'widget')
  const out = renderFindResults(results, 'widget')
  assert.match(out, /Found 1 match for "widget"/)
  assert.match(out, /Projects \(1\):/)
  assert.match(out, /1\. proj-foo \(in p\)/)
  assert.match(out, /Verbs: \/cadence:status <id>/)
  assert.match(out, /\/cadence:help to browse/)
})

test('renderFindResults handles zero results', () => {
  const out = renderFindResults([], 'nothing')
  assert.equal(out, 'No matches for "nothing".')
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
    {
      kind: 'dormant_project',
      pursuitId: 'p',
      projectId: 'proj',
      daysSinceActivity: 30,
    },
    { kind: 'wip_over_limit', count: 6, limit: 5, projectIds: ['a', 'b'] },
  ]
  const out = renderReport({ snapshot: makeSnapshot(), flags })
  assert.match(out, /Flags \(3\)/)
  assert.match(out, /overdue_waiting_for\s+p\/proj\s+alice re: review \(5d overdue\)/)
  assert.match(out, /dormant_project\s+p\/proj\s+30d since activity/)
  assert.match(out, /wip_over_limit\s+\s+6 in-progress \(limit 5\): a, b/)
})
