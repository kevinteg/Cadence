import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { scan } from '../src/scan/repo.ts'
import { findEntities } from '../src/find.ts'
import {
  docsAnchoredToProject,
  docsAnchoredToPursuit,
} from '../src/scan/living.ts'
import { renderProject, renderPursuit } from '../src/render/drilldown.ts'

async function makeTempRepo(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cadence-living-test-'))
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
  await mkdir(path.join(dir, 'wiki/living'), { recursive: true })
  await writeFile(
    path.join(dir, 'wiki/living/coach-sam.md'),
    `---
type: living-doc
kind: log
title: Coach Sam 1-1 log
created: 2026-05-01
anchors:
  - person:coach-sam
  - pursuit:marathon-2026
---

## 2026-05-03

Discussed periodization and the tempo-run cadence for the base phase.
`,
  )
  await writeFile(
    path.join(dir, 'wiki/living/spanish-spring.md'),
    `---
type: living-doc
kind: phase-doc
title: Spanish learning — spring phase
created: 2026-04-10
status: frozen
anchors:
  - pursuit:learn-spanish
---

Subjunctive drills wrapped; moved to immersion podcasts.
`,
  )
  // Not a living doc — no type: living-doc frontmatter. Must be skipped.
  await writeFile(
    path.join(dir, 'wiki/living/stray-note.md'),
    `# Stray note

No frontmatter at all. Mentions periodization but is not schema-valid.
`,
  )
  await mkdir(path.join(dir, 'pursuits/marathon-2026/projects'), {
    recursive: true,
  })
  await writeFile(
    path.join(dir, 'pursuits/marathon-2026/pursuit.md'),
    `---
id: marathon-2026
type: finite
status: active
created: 2026-03-01
---

# Marathon 2026
`,
  )
  await writeFile(
    path.join(dir, 'pursuits/marathon-2026/projects/build-base-mileage.md'),
    `---
id: build-base-mileage
pursuit: marathon-2026
status: active
created: 2026-04-01
---

# Build base mileage

## Intent

Get to a stable weekly base before speed work.

## Actions

- [ ] Write the week-by-week base plan.
`,
  )
  // Doc anchored to the project (not just the pursuit).
  await writeFile(
    path.join(dir, 'wiki/living/base-phase-notes.md'),
    `---
type: living-doc
kind: live-notes
title: Base phase notes
created: 2026-05-10
anchors:
  - project:marathon-2026/build-base-mileage
---

Long-run pacing observations.
`,
  )
  return dir
}

test('scanLivingDocs picks up schema-valid docs and skips invalid ones', async () => {
  const dir = await makeTempRepo()
  try {
    const snapshot = await scan(dir)
    assert.equal(snapshot.livingDocs.length, 3)
    const log = snapshot.livingDocs.find((d) => d.slug === 'coach-sam')
    assert.ok(log)
    assert.equal(log.kind, 'log')
    assert.equal(log.status, 'living')
    assert.deepEqual(log.anchors, ['person:coach-sam', 'pursuit:marathon-2026'])
    assert.equal(log.path, 'wiki/living/coach-sam.md')
    const frozen = snapshot.livingDocs.find((d) => d.slug === 'spanish-spring')
    assert.ok(frozen)
    assert.equal(frozen.status, 'frozen')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('findEntities matches living docs by body, title, slug, and anchors', async () => {
  const dir = await makeTempRepo()
  try {
    const snapshot = await scan(dir)

    // Verbatim body phrase — the "where did I write about X?" case.
    const byBody = findEntities(snapshot, 'tempo-run cadence')
    assert.equal(byBody.length, 1)
    assert.equal(byBody[0]!.kind, 'doc')
    assert.equal(byBody[0]!.id, 'coach-sam')
    assert.equal(byBody[0]!.context, 'log')
    assert.ok(byBody[0]!.snippet.includes('tempo-run cadence'))

    // Anchor match.
    const byAnchor = findEntities(snapshot, 'person:coach-sam')
    assert.equal(byAnchor.length, 1)
    assert.equal(byAnchor[0]!.matched_fields.includes('anchors'), true)

    // Title match on the frozen doc.
    const byTitle = findEntities(snapshot, 'spanish learning')
    assert.equal(byTitle.length, 1)
    assert.equal(byTitle[0]!.id, 'spanish-spring')

    // The schema-invalid file is invisible.
    const stray = findEntities(snapshot, 'not schema-valid')
    assert.equal(stray.length, 0)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('anchored-doc helpers and drill-down shelves', async () => {
  const dir = await makeTempRepo()
  try {
    const snapshot = await scan(dir)

    // Project anchor matches only the exact project.
    const projDocs = docsAnchoredToProject(
      snapshot.livingDocs,
      'marathon-2026',
      'build-base-mileage',
    )
    assert.deepEqual(
      projDocs.map((d) => d.slug),
      ['base-phase-notes'],
    )

    // Pursuit shelf: direct pursuit anchor + project anchors beneath it.
    const pursuitDocs = docsAnchoredToPursuit(
      snapshot.livingDocs,
      'marathon-2026',
    )
    assert.deepEqual(
      pursuitDocs.map((d) => d.slug).sort(),
      ['base-phase-notes', 'coach-sam'],
    )

    // Renderers surface the shelf.
    const projectView = renderProject(snapshot, 'build-base-mileage')
    assert.ok(projectView.includes('Anchored docs:'))
    assert.ok(
      projectView.includes('base-phase-notes [live-notes] — Base phase notes'),
    )
    const pursuitView = renderPursuit(snapshot, 'marathon-2026')
    assert.ok(pursuitView.includes('Anchored docs:'))
    assert.ok(pursuitView.includes('coach-sam [log] — Coach Sam 1-1 log'))

    // No-shelf entities render without the section.
    const learnSpanish = renderPursuit(snapshot, 'no-such-pursuit')
    assert.ok(!learnSpanish.includes('Anchored docs:'))
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
