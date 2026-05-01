import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { createPursuit } from '../src/write/pursuit.ts'
import { createProject } from '../src/write/project.ts'
import { createIdea } from '../src/write/idea.ts'
import { writeCapture } from '../src/write/capture.ts'
import { writeReflection } from '../src/write/reflection.ts'
import {
  addItem,
  addItems,
  addWaitingFor,
  checkItem,
  checkItems,
  flagWaitingFor,
  setIdeaState,
  setProjectStatus,
} from '../src/write/edits.ts'
import { movePursuit } from '../src/write/move.ts'
import { scan } from '../src/scan/repo.ts'
import { writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

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

test('createProject populates Intent and Actions for new projects', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'proj',
      title: 'Project Title',
      intent: 'A short narrative about motivation, scope, and success.',
      actions: ['First action', 'Second action'],
      now: NOW,
    })
    const snapshot = await scan(dir, NOW)
    assert.equal(snapshot.projects.length, 1)
    const proj = snapshot.projects[0]!
    assert.match(proj.intent, /motivation, scope/)
    assert.equal(proj.dod.length, 0)
    assert.equal(proj.actionProgress.total, 2)
    assert.equal(proj.actions[1]?.text, 'Second action')
    const text = await readFile(
      path.join(dir, 'pursuits/p/projects/proj.md'),
      'utf8',
    )
    assert.match(text, /## Intent/)
    assert.doesNotMatch(text, /## Definition of Done/)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('createProject still emits legacy DoD section when --dod opts provided', async () => {
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
      actions: ['kickoff'],
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

test('createProject with empty DoD but one action writes clean sections (no undefined items)', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'bare',
      actions: ['kickoff'],
      now: NOW,
    })
    const text = await readFile(
      path.join(dir, 'pursuits/p/projects/bare.md'),
      'utf8',
    )
    assert.doesNotMatch(text, /undefined/)
    assert.doesNotMatch(text, /\[ \]\s*$/m)
    const snapshot = await scan(dir, NOW)
    assert.equal(snapshot.projects[0]?.dod.length, 0)
    assert.equal(snapshot.projects[0]?.actions.length, 1)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('createProject applies a default first action when no --action provided', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'bare',
      intent: 'just a narrative',
      now: NOW,
    })
    const snapshot = await scan(dir, NOW)
    const proj = snapshot.projects[0]!
    assert.equal(proj.actions.length, 1)
    assert.match(proj.actions[0]!.text, /Brainstorm and add concrete actions/)
    assert.equal(proj.actions[0]!.checked, false)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('createProject defaults status to on_hold; explicit status wins', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'default-hold',
      actions: ['kickoff'],
      now: NOW,
    })
    await createProject(dir, {
      pursuit: 'p',
      id: 'explicit-active',
      status: 'active',
      actions: ['kickoff'],
      now: NOW,
    })
    const snapshot = await scan(dir, NOW)
    const onHold = snapshot.projects.find((p) => p.id === 'default-hold')!
    const active = snapshot.projects.find((p) => p.id === 'explicit-active')!
    assert.equal(onHold.status, 'on_hold')
    assert.equal(active.status, 'active')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('checkItem promotes on_hold → active when first action is checked; not on uncheck or DoD', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'proj',
      dod: ['Ship'],
      actions: ['First action', 'Second action'],
      now: NOW,
    })
    let snap = await scan(dir, NOW)
    assert.equal(snap.projects[0]?.status, 'on_hold')

    // DoD check on on_hold: status stays on_hold
    const dodResult = await checkItem(dir, {
      project: 'proj',
      section: 'dod',
      match: 0,
    })
    assert.equal(dodResult.promoted, undefined)
    snap = await scan(dir, NOW)
    assert.equal(snap.projects[0]?.status, 'on_hold')

    // First action check: promotes to active
    const r1 = await checkItem(dir, {
      project: 'proj',
      section: 'action',
      match: 'First',
    })
    assert.equal(r1.promoted, true)
    snap = await scan(dir, NOW)
    assert.equal(snap.projects[0]?.status, 'active')

    // Subsequent action check on already-active: no further promotion flag
    const r2 = await checkItem(dir, {
      project: 'proj',
      section: 'action',
      match: 'Second',
    })
    assert.equal(r2.promoted, undefined)

    // Set back to on_hold and try unchecking — must not promote
    await setProjectStatus(dir, { id: 'proj', status: 'on_hold' })
    const r3 = await checkItem(dir, {
      project: 'proj',
      section: 'action',
      match: 'First',
      checked: false,
    })
    assert.equal(r3.promoted, undefined)
    snap = await scan(dir, NOW)
    assert.equal(snap.projects[0]?.status, 'on_hold')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('checkItem returns post-mutation actionProgress and dodProgress', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'proj',
      actions: ['First', 'Second', 'Third'],
      now: NOW,
    })
    const r = await checkItem(dir, {
      project: 'proj',
      section: 'action',
      match: 'First',
    })
    assert.equal(r.actionProgress.done, 1)
    assert.equal(r.actionProgress.total, 3)
    assert.equal(r.dodProgress.done, 0)
    assert.equal(r.dodProgress.total, 0)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('checkItems toggles multiple items in one call and returns combined progress', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'proj',
      actions: ['One', 'Two', 'Three', 'Four'],
      now: NOW,
    })
    const r = await checkItems(dir, {
      project: 'proj',
      section: 'action',
      matches: ['One', 'Three', 'Four'],
    })
    assert.deepEqual(r.matched, ['One', 'Three', 'Four'])
    assert.equal(r.actionProgress.done, 3)
    assert.equal(r.actionProgress.total, 4)
    assert.equal(r.promoted, true) // first action checked promotes on_hold → active
    const snapshot = await scan(dir, NOW)
    const proj = snapshot.projects[0]!
    assert.equal(proj.actions.filter((a) => a.checked).length, 3)
    assert.equal(proj.status, 'active')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('setProjectStatus with include_pursuit returns the pursuit summary in one call', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'alpha',
      actions: ['a'],
      now: NOW,
    })
    await createProject(dir, {
      pursuit: 'p',
      id: 'beta',
      actions: ['b'],
      now: NOW,
    })
    // Mark alpha done; pursuit not yet fully resolved.
    const r1 = await setProjectStatus(dir, {
      id: 'alpha',
      status: 'done',
      include_pursuit: true,
    })
    assert.ok(r1.pursuit)
    assert.equal(r1.pursuit!.id, 'p')
    assert.equal(r1.pursuit!.total, 2)
    assert.equal(r1.pursuit!.done, 1)
    assert.equal(r1.pursuit!.allResolved, false)
    // Mark beta done; pursuit now fully resolved.
    const r2 = await setProjectStatus(dir, {
      id: 'beta',
      status: 'done',
      include_pursuit: true,
    })
    assert.equal(r2.pursuit!.done, 2)
    assert.equal(r2.pursuit!.allResolved, true)
    // Without --include-pursuit, pursuit field omitted.
    await createProject(dir, {
      pursuit: 'p',
      id: 'gamma',
      actions: ['g'],
      now: NOW,
    })
    const r3 = await setProjectStatus(dir, {
      id: 'gamma',
      status: 'on_hold',
    })
    assert.equal(r3.pursuit, undefined)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('addItem returns post-mutation progress', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'proj',
      actions: ['Existing'],
      now: NOW,
    })
    const r = await addItem(dir, {
      project: 'proj',
      section: 'action',
      text: 'New action',
    })
    assert.equal(r.actionProgress.done, 0)
    assert.equal(r.actionProgress.total, 2)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('addItems appends multiple items in one call (bulk variant)', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'proj',
      actions: ['Existing'],
      now: NOW,
    })
    const r = await addItems(dir, {
      project: 'proj',
      section: 'action',
      texts: ['First new', 'Second new', 'Third new'],
    })
    assert.equal(r.added, 3)
    assert.equal(r.actionProgress.total, 4)
    assert.equal(r.actionProgress.done, 0)
    const snapshot = await scan(dir, NOW)
    const proj = snapshot.projects[0]!
    assert.equal(proj.actions.length, 4)
    assert.equal(proj.actions[3]?.text, 'Third new')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('addItem with section notes appends a paragraph and creates the section', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'proj',
      actions: ['kickoff'],
      now: NOW,
    })
    const r1 = await addItem(dir, {
      project: 'proj',
      section: 'notes',
      text: 'First note paragraph.',
    })
    // Notes don't affect checklist progress
    assert.equal(r1.actionProgress.total, 1)
    const r2 = await addItem(dir, {
      project: 'proj',
      section: 'notes',
      text: 'Second note paragraph.',
    })
    assert.equal(r2.actionProgress.total, 1)
    const text = await readFile(
      path.join(dir, 'pursuits/p/projects/proj.md'),
      'utf8',
    )
    assert.match(text, /## Notes/)
    assert.match(text, /First note paragraph\./)
    assert.match(text, /Second note paragraph\./)
    // Both paragraphs should be present, separated by a blank line.
    assert.match(text, /First note paragraph\.\n\nSecond note paragraph\./)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('addItems with section notes appends multiple paragraphs in one call', async () => {
  const dir = await tempRepo()
  try {
    await createPursuit(dir, { id: 'p', type: 'finite', now: NOW })
    await createProject(dir, {
      pursuit: 'p',
      id: 'proj',
      actions: ['kickoff'],
      now: NOW,
    })
    await addItems(dir, {
      project: 'proj',
      section: 'notes',
      texts: ['Para one.', 'Para two.', 'Para three.'],
    })
    const text = await readFile(
      path.join(dir, 'pursuits/p/projects/proj.md'),
      'utf8',
    )
    assert.match(text, /## Notes\n\nPara one\.\n\nPara two\.\n\nPara three\./)
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
