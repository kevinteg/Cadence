import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { scan } from '../src/scan/repo.ts'

async function makeTempRepo(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cadence-test-'))
  await writeFile(
    path.join(dir, 'cadence.yaml'),
    `version: 1
defaults:
  waiting_for_grace_days: 2
  dormant_days: 14
wip_limits:
  max_active_projects: 5
`,
  )
  await mkdir(path.join(dir, 'pursuits/p1/projects'), { recursive: true })
  await mkdir(path.join(dir, 'pursuits/p1/sessions'), { recursive: true })
  await mkdir(path.join(dir, 'pursuits/p1/ideas'), { recursive: true })
  await mkdir(path.join(dir, 'pursuits/_someday/sp'), { recursive: true })
  await mkdir(path.join(dir, 'thoughts/unprocessed'), { recursive: true })
  await mkdir(path.join(dir, 'reflections'), { recursive: true })

  await writeFile(
    path.join(dir, 'pursuits/p1/pursuit.md'),
    `---
id: p1
type: finite
status: active
created: 2026-01-01
---

# Pursuit One

This is the description of pursuit one.
`,
  )
  await writeFile(
    path.join(dir, 'pursuits/p1/projects/proj-a.md'),
    `---
id: proj-a
pursuit: p1
status: active
created: 2026-04-01
waiting_for:
  - person: bob
    what: feedback
    expected: 2026-04-20
    flagged: false
---

# Project A

This is project A.

## Intent

The intent narrative — what we're aiming at and why.

## Definition of Done
- [x] one
- [ ] two

## Actions
- [ ] do work
- [x] previous step
`,
  )
  await writeFile(
    path.join(dir, 'pursuits/p1/sessions/2026-04-20T10-00.md'),
    `---
pursuit: p1
project: proj-a
session_start: 2026-04-20T10:00:00Z
session_end: 2026-04-20T10:30:00Z
actions_completed: []
---

## Where
context

## Next
do thing

## Open
question
`,
  )
  await writeFile(
    path.join(dir, 'pursuits/p1/ideas/seed-1.md'),
    `---
id: seed-1
parent: p1
state: seed
created: 2026-04-15
---

idea body
`,
  )
  await writeFile(
    path.join(dir, 'pursuits/_someday/sp/pursuit.md'),
    `---
id: sp
type: someday
status: someday
created: 2026-02-01
---

# Someday Pursuit
`,
  )
  await writeFile(
    path.join(dir, 'thoughts/unprocessed/2026-04-26T08-00.md'),
    `---
captured: 2026-04-26T08:00:00Z
verb_context: note
---

a thought
`,
  )
  await writeFile(
    path.join(dir, 'reflections/2026-04-19.md'),
    `---
date: 2026-04-19
status: complete
phase: get_focused
leveraged_priority: ship the CLI
---

reflection body
`,
  )

  return dir
}

test('scan returns a populated Snapshot for a synthetic repo', async () => {
  const dir = await makeTempRepo()
  try {
    const snapshot = await scan(dir, new Date('2026-04-27T12:00:00Z'))
    assert.equal(snapshot.pursuits.length, 2)
    const active = snapshot.pursuits.filter((p) => p.lifecycle === 'active')
    const someday = snapshot.pursuits.filter((p) => p.lifecycle === 'someday')
    assert.equal(active.length, 1)
    assert.equal(someday.length, 1)
    assert.equal(active[0]?.id, 'p1')
    assert.match(active[0]!.description, /description of pursuit one/)

    assert.equal(snapshot.projects.length, 1)
    const proj = snapshot.projects[0]!
    assert.equal(proj.id, 'proj-a')
    assert.match(proj.intent, /intent narrative/)
    assert.equal(proj.dodProgress.done, 1)
    assert.equal(proj.dodProgress.total, 2)
    assert.equal(proj.actionProgress.done, 1)
    assert.equal(proj.actionProgress.total, 2)
    assert.equal(proj.waiting_for.length, 1)
    assert.equal(proj.waiting_for[0]?.person, 'bob')

    assert.equal(snapshot.ideas.length, 1)
    assert.equal(snapshot.ideas[0]?.state, 'seed')
    assert.equal(snapshot.ideas[0]?.ageDays, 12)

    assert.equal(snapshot.captures.length, 1)
    assert.equal(snapshot.reflections.length, 1)
    assert.equal(
      snapshot.reflections[0]?.leveraged_priority,
      'ship the CLI',
    )

    assert.equal(snapshot.config.dormant_days, 14)
    assert.equal(snapshot.config.max_active_projects, 5)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('scan against this repo matches expected counts', async () => {
  const repoRoot = path.resolve(import.meta.dirname, '..')
  const snapshot = await scan(repoRoot, new Date('2026-04-27T12:00:00Z'))
  // Active pursuits: build-cadence-v1, cadence-performance-and-indexing, wandering
  const active = snapshot.pursuits.filter((p) => p.lifecycle === 'active')
  assert.equal(active.length, 3, 'expected 3 active pursuits')
  // Someday: make-cadence-public
  const someday = snapshot.pursuits.filter((p) => p.lifecycle === 'someday')
  assert.equal(someday.length, 1, 'expected 1 someday pursuit')
})
