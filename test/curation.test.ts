import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { curateNextMoves } from '../src/render/curation.ts'
import { NO_SIGNALS } from '../src/render/signals.ts'
import {
  CONFIG_DEFAULTS,
  type Flag,
  type Project,
  type Pursuit,
  type Reflection,
  type Snapshot,
} from '../src/types.ts'

const NOW = '2026-05-26T12:00:00.000Z'

function makePursuit(o: Partial<Pursuit> = {}): Pursuit {
  return {
    id: 'p',
    type: 'finite',
    status: 'active',
    lifecycle: 'active',
    created: '2026-01-01',
    description: '',
    path: 'pursuits/p/pursuit.md',
    ...o,
  }
}

function makeProject(o: Partial<Project> = {}): Project {
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
    ...o,
  }
}

function makeSnapshot(o: Partial<Snapshot> = {}): Snapshot {
  return {
    config: { ...CONFIG_DEFAULTS },
    pursuits: [],
    projects: [],
    brainstorms: [],
    captures: [],
    reflections: [],
    generatedAt: NOW,
    repoRoot: '/tmp/fake',
    ...o,
  }
}

// ---------------------------------------------------------------------
// LP alignment (priority 1)
// ---------------------------------------------------------------------

test('curateNextMoves surfaces the LP-aligned active project at the top', () => {
  const lp: Reflection = {
    date: '2026-05-20',
    status: 'complete',
    body: '',
    path: '',
    leveraged_priority: 'reshape status output for navigation',
  }
  const moves = curateNextMoves(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [
        makeProject({ id: 'reshape-status-output-for-navigation' }),
        makeProject({ id: 'other-project' }),
      ],
      reflections: [lp],
    }),
    [],
    NO_SIGNALS,
  )
  assert.equal(moves[0]!.verb, '/cadence:start')
  assert.equal(moves[0]!.target, 'reshape-status-output-for-navigation')
  assert.match(moves[0]!.rationale, /LP-aligned/)
})

test('curateNextMoves does not surface a false LP match when no overlap', () => {
  const lp: Reflection = {
    date: '2026-05-20',
    status: 'complete',
    body: '',
    path: '',
    leveraged_priority: 'finish the kitchen tile',
  }
  const moves = curateNextMoves(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [makeProject({ id: 'reshape-status-output' })],
      reflections: [lp],
    }),
    [],
    NO_SIGNALS,
  )
  // The LP doesn't share tokens with any project ID — no LP-aligned move.
  assert.ok(!moves.some((m) => m.rationale.includes('LP-aligned')))
})

// ---------------------------------------------------------------------
// Recency (priority 2)
// ---------------------------------------------------------------------

test('curateNextMoves surfaces in-progress-today via recency', () => {
  const moves = curateNextMoves(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [
        makeProject({
          id: 'recent-project',
          last_activity_at: NOW,
        }),
      ],
    }),
    [],
    NO_SIGNALS,
  )
  assert.ok(
    moves.some(
      (m) =>
        m.verb === '/cadence:start' &&
        m.target === 'recent-project' &&
        /Touched today/.test(m.rationale),
    ),
  )
})

// ---------------------------------------------------------------------
// Structural urgency (priority 3)
// ---------------------------------------------------------------------

test('curateNextMoves surfaces /resolve when a pursuit has all projects shipped', () => {
  // The closing_in_on_resolution flag never fires when 0 projects are
  // unresolved; the curation detects this directly from the snapshot
  // (≥1 done|dropped project + zero open projects).
  const moves = curateNextMoves(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [
        makeProject({ id: 'a', status: 'done' }),
        makeProject({ id: 'b', status: 'done' }),
      ],
    }),
    [],
    NO_SIGNALS,
  )
  assert.ok(
    moves.some(
      (m) =>
        m.verb === '/cadence:resolve' &&
        m.target === 'p' &&
        /ready to close/.test(m.rationale),
    ),
  )
})

test('curateNextMoves surfaces /status drill-down for a closing-in pursuit', () => {
  const flag: Flag = {
    kind: 'closing_in_on_resolution',
    pursuitId: 'p',
    unresolvedCount: 2,
    resolvedCount: 3,
    totalCount: 5,
  }
  const moves = curateNextMoves(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [
        makeProject({ id: 'a', status: 'done' }),
        makeProject({ id: 'b', status: 'active' }),
        makeProject({ id: 'c', status: 'on_hold' }),
      ],
    }),
    [flag],
    NO_SIGNALS,
  )
  assert.ok(
    moves.some(
      (m) =>
        m.verb === '/cadence:status' &&
        m.target === 'p' &&
        /what would need to be true/.test(m.rationale),
    ),
  )
})

test('curateNextMoves surfaces a structural-no-open-actions /resolve', () => {
  const flag: Flag = {
    kind: 'structural_active_no_open_actions',
    pursuitId: 'p',
    projectId: 'foo',
  }
  const moves = curateNextMoves(
    makeSnapshot({ pursuits: [makePursuit()] }),
    [flag],
    NO_SIGNALS,
  )
  assert.ok(
    moves.some(
      (m) =>
        m.verb === '/cadence:resolve' &&
        m.target === 'foo' &&
        /actions checked/.test(m.rationale),
    ),
  )
})

// ---------------------------------------------------------------------
// Parking-lot pressure (priority 4)
// ---------------------------------------------------------------------

test('curateNextMoves surfaces /start inbox when inbox_pressure fires', () => {
  const flag: Flag = {
    kind: 'inbox_pressure',
    count: 14,
    threshold: 10,
    fresh: 3,
    aged: 5,
    overdue: 6,
  }
  const moves = curateNextMoves(
    makeSnapshot({ pursuits: [makePursuit()] }),
    [flag],
    NO_SIGNALS,
  )
  assert.ok(
    moves.some(
      (m) => m.verb === '/cadence:start inbox' && /above soft cap/.test(m.rationale),
    ),
  )
})

// ---------------------------------------------------------------------
// Routine surfaces (priority 5)
// ---------------------------------------------------------------------

test('curateNextMoves surfaces narrate-week when weeklyPreviewDue is set', () => {
  const moves = curateNextMoves(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [makeProject({ id: 'foo' })],
    }),
    [],
    { ...NO_SIGNALS, weeklyPreviewDue: true },
  )
  assert.ok(
    moves.some(
      (m) =>
        m.verb === '/cadence:narrate week' && /Week is closing/.test(m.rationale),
    ),
  )
})

test('curateNextMoves surfaces narrate-today when narrateTodayStale is set', () => {
  const moves = curateNextMoves(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [makeProject({ id: 'foo' })],
    }),
    [],
    { ...NO_SIGNALS, narrateTodayStale: true },
  )
  assert.ok(
    moves.some(
      (m) =>
        m.verb === '/cadence:narrate today' &&
        /Activity landed today/.test(m.rationale),
    ),
  )
})

test('curateNextMoves surfaces /reflect when last reflection is > 7d ago', () => {
  // Last reflect is 2026-05-15; NOW is 2026-05-26 → 11d ago.
  const old: Reflection = {
    date: '2026-05-15',
    status: 'complete',
    body: '',
    path: '',
  }
  const moves = curateNextMoves(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [makeProject({ id: 'foo', status: 'on_hold' })],
      reflections: [old],
    }),
    [],
    NO_SIGNALS,
  )
  assert.ok(
    moves.some(
      (m) =>
        m.verb === '/cadence:reflect' && /since the last one/.test(m.rationale),
    ),
  )
})

test('curateNextMoves surfaces a no-reflection-yet /reflect when reflections is empty', () => {
  const moves = curateNextMoves(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [makeProject({ id: 'foo', status: 'on_hold' })],
    }),
    [],
    NO_SIGNALS,
  )
  assert.ok(
    moves.some(
      (m) =>
        m.verb === '/cadence:reflect' && /No reflection yet/.test(m.rationale),
    ),
  )
})

// ---------------------------------------------------------------------
// Fallbacks
// ---------------------------------------------------------------------

test('curateNextMoves falls back to on-hold pickup with sparse state', () => {
  const moves = curateNextMoves(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [makeProject({ id: 'paused', status: 'on_hold' })],
    }),
    [],
    NO_SIGNALS,
  )
  assert.ok(
    moves.some(
      (m) =>
        m.verb === '/cadence:start' &&
        m.target === 'paused' &&
        /On hold/.test(m.rationale),
    ),
  )
})

test('curateNextMoves emits a brainstorm bootstrap when nothing else applies', () => {
  const moves = curateNextMoves(
    makeSnapshot({ pursuits: [makePursuit({ id: 'p' })] }),
    [],
    NO_SIGNALS,
  )
  assert.ok(
    moves.some((m) => m.verb === '/cadence:brainstorm'),
  )
})

test('curateNextMoves caps at 3 entries and fills with /help when room', () => {
  const moves = curateNextMoves(
    makeSnapshot({ pursuits: [makePursuit()] }),
    [],
    NO_SIGNALS,
  )
  assert.ok(moves.length <= 3)
  assert.ok(moves.some((m) => m.verb === '/cadence:help'))
})

// ---------------------------------------------------------------------
// Ranking — LP > recency > structural > parking > routine
// ---------------------------------------------------------------------

test('curateNextMoves ranks LP alignment above structural urgency', () => {
  const lp: Reflection = {
    date: '2026-05-20',
    status: 'complete',
    body: '',
    path: '',
    leveraged_priority: 'reshape status output for navigation',
  }
  const structural: Flag = {
    kind: 'structural_active_no_open_actions',
    pursuitId: 'p',
    projectId: 'unrelated-project',
  }
  const moves = curateNextMoves(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [makeProject({ id: 'reshape-status-output-for-navigation' })],
      reflections: [lp],
    }),
    [structural],
    NO_SIGNALS,
  )
  const lpIdx = moves.findIndex((m) =>
    m.rationale.includes('LP-aligned'),
  )
  const structuralIdx = moves.findIndex((m) =>
    /actions checked/.test(m.rationale),
  )
  assert.ok(lpIdx >= 0)
  assert.ok(structuralIdx >= 0)
  assert.ok(lpIdx < structuralIdx)
})

test('curateNextMoves ranks parking-lot pressure above narrate-week', () => {
  const inbox: Flag = {
    kind: 'inbox_pressure',
    count: 12,
    threshold: 10,
    fresh: 2,
    aged: 5,
    overdue: 5,
  }
  const moves = curateNextMoves(
    makeSnapshot({
      pursuits: [makePursuit()],
      projects: [makeProject({ id: 'foo' })],
    }),
    [inbox],
    { ...NO_SIGNALS, weeklyPreviewDue: true },
  )
  const inboxIdx = moves.findIndex((m) =>
    m.verb === '/cadence:start inbox',
  )
  const weekIdx = moves.findIndex((m) =>
    m.verb === '/cadence:narrate week',
  )
  assert.ok(inboxIdx >= 0)
  assert.ok(weekIdx >= 0)
  assert.ok(inboxIdx < weekIdx)
})
