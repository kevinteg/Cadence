import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { needsYou, renderNeedsYouLine, describeNeedsYouItem } from '../src/needs-you.ts'
import { CONFIG_DEFAULTS, type Project, type Pursuit, type Snapshot, type Thread } from '../src/types.ts'

const NOW = new Date('2026-09-29T12:00:00Z')

function pursuit(o: Partial<Pursuit> = {}): Pursuit {
  return { id: 'p', type: 'finite', status: 'active', lifecycle: 'active', created: '2026-01-01', description: '', path: 'pursuits/p/pursuit.md', ...o }
}
function project(o: Partial<Project> = {}): Project {
  return {
    id: 'proj', pursuit: 'p', status: 'active', created: '2026-01-01', waiting_for: [], threads: [],
    intent: '', dod: [], actions: [], description: '', path: 'pursuits/p/projects/proj.md',
    dodProgress: { done: 0, total: 0 }, actionProgress: { done: 0, total: 0 },
    detected_domain: 'unknown', effective_domain: 'unknown', ...o,
  }
}
function thread(o: Partial<Thread> & { id: string; kind: Thread['kind'] }): Thread {
  return { text: o.id, opened: '2026-09-28T09:00:00', by: 'human', status: 'open', ...o }
}
function snap(o: Partial<Snapshot> = {}): Snapshot {
  return { config: { ...CONFIG_DEFAULTS }, pursuits: [pursuit()], projects: [], brainstorms: [], captures: [], reflections: [], livingDocs: [], wikiArtifacts: [], generatedAt: NOW.toISOString(), repoRoot: '/tmp/fake', ...o }
}

test('needsYou unions open threads across open projects in active pursuits only', () => {
  const s = snap({
    pursuits: [pursuit(), pursuit({ id: 'someday', lifecycle: 'someday', status: 'someday' })],
    projects: [
      project({ threads: [thread({ id: 'a', kind: 'review' }), thread({ id: 'b', kind: 'decide', status: 'closed' })] }),
      project({ id: 'held', status: 'on_hold', threads: [thread({ id: 'c', kind: 'waiting', person: 'sam', expected: '2026-09-26' })] }),
      project({ id: 'done', status: 'done', threads: [thread({ id: 'd', kind: 'decide' })] }),
      project({ id: 'parked', pursuit: 'someday', threads: [thread({ id: 'e', kind: 'decide' })] }),
    ],
  })
  const view = needsYou(s, NOW)
  assert.deepEqual(view.items.map((i) => i.thread.id), ['a', 'c'])
  assert.equal(view.counts.total, 2)
  assert.equal(view.counts.review, 1)
  assert.equal(view.counts.waiting, 1)
})

test('needsYou orders by kind (decide, review, unblock, waiting) then oldest first', () => {
  const s = snap({
    projects: [project({ threads: [
      thread({ id: 'w', kind: 'waiting', opened: '2026-09-01', person: 'x', expected: '2026-09-01' }),
      thread({ id: 'r', kind: 'review' }),
      thread({ id: 'd-new', kind: 'decide', opened: '2026-09-28T09:00:00' }),
      thread({ id: 'd-old', kind: 'decide', opened: '2026-09-20T09:00:00' }),
      thread({ id: 'u', kind: 'unblock' }),
    ] })],
  })
  assert.deepEqual(needsYou(s, NOW).items.map((i) => i.thread.id), ['d-old', 'd-new', 'r', 'u', 'w'])
})

test('renderNeedsYouLine is null when empty and lists only non-zero kinds', () => {
  assert.equal(renderNeedsYouLine(needsYou(snap(), NOW)), null)
  const s = snap({ projects: [project({ threads: [thread({ id: 'a', kind: 'decide' }), thread({ id: 'b', kind: 'waiting', person: 'x', expected: '2026-09-30' })] })] })
  assert.equal(renderNeedsYouLine(needsYou(s, NOW)), 'Needs you: 2 (1 decide, 1 waiting)')
})

test('describeNeedsYouItem shows expected date for waiting and age + run for the rest', () => {
  const s = snap({ projects: [project({ threads: [
    thread({ id: 'a', kind: 'decide', text: 'Gated endpoints?', opened: '2026-09-27T12:00:00', by: 'run:r1' }),
    thread({ id: 'b', kind: 'waiting', text: 'sam re: access', person: 'sam', expected: '2026-09-26' }),
  ] })] })
  const [d, w] = needsYou(s, NOW).items
  assert.equal(describeNeedsYouItem(d!), 'decide · `proj` · Gated endpoints? (2d · run:r1)')
  assert.equal(describeNeedsYouItem(w!), 'waiting · `proj` · sam re: access (expected 2026-09-26)')
})
