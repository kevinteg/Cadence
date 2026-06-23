import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { scanWikiArtifacts } from '../src/scan/wiki.ts'
import { scanLivingDocs } from '../src/scan/living.ts'
import { findEntities } from '../src/find.ts'
import { CONFIG_DEFAULTS, type Snapshot, type WikiArtifact } from '../src/types.ts'

function write(root: string, rel: string, body: string): void {
  const abs = path.join(root, rel)
  mkdirSync(path.dirname(abs), { recursive: true })
  writeFileSync(abs, body)
}

function makeWiki(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), 'cad-wiki-'))
  // Navigation/log files — no title → must be skipped.
  write(root, 'wiki/index.md', '---\nupdated: 2026-06-11\nartifacts: 3\n---\n\n# Index\n')
  write(root, 'wiki/log.md', '# Log\n\nno frontmatter here\n')
  // A known tier.
  write(
    root,
    'wiki/narratives/cap.md',
    '---\ntype: capstone\ntitle: The Capstone\ncreated: 2026-06-11\n---\n\nbody of the capstone\n',
  )
  // A user-created shelf — the #8 case.
  write(
    root,
    'wiki/code-deep-dives/arch.md',
    '---\ntype: code-deep-dive\ntitle: Architecture Deep Dive\ntags: [architecture, internals]\n---\n\nhow the scheduler works internally\n',
  )
  // Living doc at the tier root.
  write(
    root,
    'wiki/living/spanish.md',
    '---\ntype: living-doc\nkind: phase-doc\ntitle: Spanish Learning\nanchors: [pursuit:learn-spanish]\n---\n\nrolling phase doc\n',
  )
  // Nested living doc — the living/1-1s/ flat-glob case.
  write(
    root,
    'wiki/living/1-1s/coach-sam.md',
    '---\ntype: living-doc\nkind: log\ntitle: Coach Sam 1-1s\nanchors: [person:coach-sam]\n---\n\nrunning relationship log\n',
  )
  // _archive provenance tier — excluded even though it has a title.
  write(
    root,
    'wiki/_archive/brainstorms/old/note.md',
    '---\ntitle: Archived Note\n---\n\nshould not surface\n',
  )
  return root
}

test('scanWikiArtifacts discovers arbitrary shelves and nested files, skips nav + _archive', async () => {
  const root = makeWiki()
  try {
    const arts = await scanWikiArtifacts(root)
    const slugs = arts.map((a) => a.slug).sort()
    assert.deepEqual(slugs, ['arch', 'cap', 'coach-sam', 'spanish'])
    // index.md / log.md (no title) excluded; _archive excluded.
    assert.ok(!slugs.includes('index'))
    assert.ok(!slugs.includes('note'))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('scanWikiArtifacts captures tier, type, tags from a user shelf', async () => {
  const root = makeWiki()
  try {
    const arts = await scanWikiArtifacts(root)
    const arch = arts.find((a) => a.slug === 'arch')
    assert.ok(arch)
    assert.equal(arch.tier, 'code-deep-dives')
    assert.equal(arch.type, 'code-deep-dive')
    assert.equal(arch.title, 'Architecture Deep Dive')
    assert.deepEqual(arch.tags, ['architecture', 'internals'])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('scanLivingDocs is recursive — finds nested living/1-1s/ docs', async () => {
  const root = makeWiki()
  try {
    const docs = await scanLivingDocs(root)
    const slugs = docs.map((d) => d.slug).sort()
    assert.deepEqual(slugs, ['coach-sam', 'spanish'])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('find surfaces a file in an arbitrary wiki shelf (the #8 bug)', async () => {
  const root = makeWiki()
  try {
    const arts = await scanWikiArtifacts(root)
    const snap: Snapshot = {
      config: CONFIG_DEFAULTS,
      pursuits: [],
      projects: [],
      brainstorms: [],
      captures: [],
      reflections: [],
      livingDocs: [],
      wikiArtifacts: arts,
      generatedAt: '2026-06-23T00:00:00.000Z',
      repoRoot: root,
    }
    // A verbatim phrase from the body of the user-shelf page.
    const hits = findEntities(snap, 'scheduler works internally')
    assert.equal(hits.length, 1)
    assert.equal(hits[0]!.kind, 'doc')
    assert.equal(hits[0]!.id, 'arch')
    assert.equal(hits[0]!.context, 'code-deep-dive')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
