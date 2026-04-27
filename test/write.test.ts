import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { createPursuit } from '../src/write/pursuit.ts'
import { createProject } from '../src/write/project.ts'
import { createIdea } from '../src/write/idea.ts'
import { writeMarker } from '../src/write/marker.ts'
import { writeCapture } from '../src/write/capture.ts'
import { writeReflection } from '../src/write/reflection.ts'
import {
  addItem,
  addWaitingFor,
  checkItem,
  flagWaitingFor,
  setIdeaState,
  setProjectStatus,
} from '../src/write/edits.ts'
import { movePursuit } from '../src/write/move.ts'
import { scan } from '../src/scan/repo.ts'

const NOW = new Date('2026-04-27T13:00:00Z')

async function tempRepo(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), 'cadence-write-'))
}

test('createPursuit + scan round-trip', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, {
      id: 'demo',
      type: 'finite',
      why: 'because',
      title: 'Demo Pursuit',
      description: 'A test description.',
      now: NOW,
    })
    const snapshot = await scan(dir, NOW)
    assert.equal(snapshot.pursuits.length, 1)
    const p = snapshot.pursuits[0]!
    assert.equal(p.id, 'demo')
    assert.equal(p.lifecycle, 'active')
    assert.equal(p.why, 'because')
    assert.equal(p.created, '2026-04-27')
    assert.match(p.description, /test description/)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('createPursuit refuses to overwrite an existing pursuit', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await assert.rejects(
      createPursuit(dir, { id: 'p', type: 'finite', now: NOW }),
      /already exists/,
    )
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('createProject populates DoD and Actions', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'proj',
      title: 'Project Title',
      description: 'Body of the project.',
      dod: ['First criterion', 'Second criterion'],
      actions: ['First action', 'Second action'],
      now: NOW,
    })
    const snapshot = await scan(dir, NOW)
    assert.equal(snapshot.projects.length, 1)
    const proj = snapshot.projects[0]!
    assert.equal(proj.dodProgress.total, 2)
    assert.equal(proj.actionProgress.total, 2)
    assert.equal(proj.dod[0]?.text, 'First criterion')
    assert.equal(proj.actions[1]?.text, 'Second action')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('createIdea round-trip with body', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createIdea(dir, {
      parent: 'p',
      id: 'spark',
      body: 'A neat idea worth exploring.',
      now: NOW,
    })
    const snapshot = await scan(dir, NOW)
    assert.equal(snapshot.ideas.length, 1)
    const idea = snapshot.ideas[0]!
    assert.equal(idea.id, 'spark')
    assert.equal(idea.state, 'seed')
    assert.match(idea.body, /worth exploring/)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('writeMarker creates session file with where/next/open', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'proj',
      dod: ['ship'],
      actions: ['do thing'],
      now: NOW,
    })
    await writeMarker(dir, {
      pursuit: 'p',
      project: 'proj',
      where: 'context',
      next: 'first thing',
      open: 'big question',
      actions_completed: ['cleared inbox'],
      now: NOW,
    })
    const snapshot = await scan(dir, NOW)
    assert.equal(snapshot.markers.length, 1)
    const m = snapshot.markers[0]!
    assert.equal(m.where, 'context')
    assert.equal(m.next, 'first thing')
    assert.equal(m.open, 'big question')
    assert.deepEqual(m.actions_completed, ['cleared inbox'])
    // Project should reflect the new marker after re-scan.
    assert.equal(snapshot.projects[0]?.hasMarker, true)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('writeCapture produces a parseable capture', async () => {
  const dir = await tempRepo()
  try {
    await writeCapture(dir, {
      body: 'a stray thought',
      verb_context: 'note',
      now: NOW,
    })
    const snapshot = await scan(dir, NOW)
    assert.equal(snapshot.captures.length, 1)
    const c = snapshot.captures[0]!
    assert.equal(c.body, 'a stray thought')
    assert.equal(c.verb_context, 'note')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('writeReflection round-trip with leveraged_priority', async () => {
  const dir = await tempRepo()
  try {
    await writeReflection(dir, {
      status: 'complete',
      phase: 'get_focused',
      leveraged_priority: 'ship CLI writes',
      body: '# Reflection',
      now: NOW,
    })
    const snapshot = await scan(dir, NOW)
    assert.equal(snapshot.reflections.length, 1)
    const r = snapshot.reflections[0]!
    assert.equal(r.status, 'complete')
    assert.equal(r.leveraged_priority, 'ship CLI writes')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('setProjectStatus dropped requires reason and stamps frontmatter', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'proj',
      dod: ['x'],
      actions: ['y'],
      now: NOW,
    })
    await assert.rejects(
      setProjectStatus(dir, { id: 'proj', status: 'dropped' }),
      /requires a reason/,
    )
    await setProjectStatus(dir, {
      id: 'proj',
      status: 'dropped',
      reason: 'no longer relevant',
      now: NOW,
    })
    const text = await readFile(
      path.join(dir, 'pursuits/p/projects/proj.md'),
      'utf8',
    )
    assert.match(text, /status: dropped/)
    assert.match(text, /dropped_reason: no longer relevant/)
    assert.match(text, /dropped_at:/)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('setIdeaState closed requires reason; developed stamps developed_at', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createIdea(dir, { parent: 'p', id: 'i1', body: 'one', now: NOW })
    await createIdea(dir, { parent: 'p', id: 'i2', body: 'two', now: NOW })
    await setIdeaState(dir, { id: 'i1', state: 'developed', now: NOW })
    await setIdeaState(dir, {
      id: 'i2',
      state: 'closed',
      reason: 'duplicate',
    })
    const t1 = await readFile(
      path.join(dir, 'pursuits/p/ideas/i1.md'),
      'utf8',
    )
    const t2 = await readFile(
      path.join(dir, 'pursuits/p/ideas/i2.md'),
      'utf8',
    )
    assert.match(t1, /state: developed/)
    assert.match(t1, /developed_at: 2026-04-27/)
    assert.match(t2, /state: closed/)
    assert.match(t2, /closed_reason: duplicate/)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('checkItem toggles by index and by substring; appends note', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'proj',
      dod: ['Ship feature', 'Document feature'],
      actions: ['Write code', 'Write tests'],
      now: NOW,
    })
    const r1 = await checkItem(dir, {
      project: 'proj',
      section: 'action',
      match: 'tests',
      note: 'all 24 passing',
    })
    assert.equal(r1.matched, 'Write tests')
    const text1 = await readFile(
      path.join(dir, 'pursuits/p/projects/proj.md'),
      'utf8',
    )
    assert.match(text1, /- \[x\] Write tests/)
    assert.match(text1, /- all 24 passing/)

    const r2 = await checkItem(dir, {
      project: 'proj',
      section: 'dod',
      match: 0,
    })
    assert.equal(r2.matched, 'Ship feature')
    const text2 = await readFile(
      path.join(dir, 'pursuits/p/projects/proj.md'),
      'utf8',
    )
    assert.match(text2, /- \[x\] Ship feature/)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('addItem appends to DoD; addWaitingFor + flagWaitingFor round-trip', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'proj',
      dod: ['First'],
      actions: [],
      now: NOW,
    })
    await addItem(dir, {
      project: 'proj',
      section: 'dod',
      text: 'Second',
    })
    await addWaitingFor(dir, {
      project: 'proj',
      person: 'alice',
      what: 'review',
      expected: '2026-05-01',
    })
    await flagWaitingFor(dir, {
      project: 'proj',
      match: 'alice',
    })
    const snapshot = await scan(dir, NOW)
    const proj = snapshot.projects[0]!
    assert.equal(proj.dod.length, 2)
    assert.equal(proj.dod[1]?.text, 'Second')
    assert.equal(proj.waiting_for.length, 1)
    assert.equal(proj.waiting_for[0]?.flagged, true)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('createProject with no dod/actions writes empty sections (no undefined items)', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, { pursuit: 'p', id: 'bare', now: NOW })
    const text = await readFile(
      path.join(dir, 'pursuits/p/projects/bare.md'),
      'utf8',
    )
    assert.doesNotMatch(text, /undefined/)
    assert.doesNotMatch(text, /\[ \]\s*$/m) // no orphan empty checkbox lines
    const snapshot = await scan(dir, NOW)
    assert.equal(snapshot.projects[0]?.dod.length, 0)
    assert.equal(snapshot.projects[0]?.actions.length, 0)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('writeMarker omits empty section bodies', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'proj',
      dod: ['x'],
      actions: ['y'],
      now: NOW,
    })
    await writeMarker(dir, {
      pursuit: 'p',
      project: 'proj',
      where: 'something happened',
      // next + open intentionally omitted
      now: NOW,
    })
    const snapshot = await scan(dir, NOW)
    assert.equal(snapshot.markers[0]?.where, 'something happened')
    assert.equal(snapshot.markers[0]?.next, '')
    assert.equal(snapshot.markers[0]?.open, '')
    assert.deepEqual(snapshot.markers[0]?.actions_completed, [])
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('movePursuit relocates between lifecycles and updates frontmatter', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await movePursuit(dir, { id: 'p', to: 'archived' })
    const snapshot = await scan(dir, NOW)
    assert.equal(snapshot.pursuits.length, 1)
    assert.equal(snapshot.pursuits[0]?.lifecycle, 'archived')
    assert.equal(snapshot.pursuits[0]?.status, 'archived')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
