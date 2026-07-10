import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import {
  MANIFEST_FILENAME,
  ManifestSchema,
  collectFleet,
  loadManifest,
} from '../src/manifest.ts'
import { saveRegistry } from '../src/registry.ts'

async function makeRepo(opts: {
  pursuitId?: string
  delegatedTo?: string
  manifest?: string
}): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cadence-manifest-'))
  await writeFile(path.join(dir, 'cadence.yaml'), 'version: 1\n')
  if (opts.pursuitId) {
    await mkdir(path.join(dir, `pursuits/${opts.pursuitId}/projects`), {
      recursive: true,
    })
    await writeFile(
      path.join(dir, `pursuits/${opts.pursuitId}/pursuit.md`),
      `---
id: ${opts.pursuitId}
type: finite
status: active
created: 2026-01-01
${opts.delegatedTo ? `delegated_to: ${opts.delegatedTo}\n` : ''}---

# ${opts.pursuitId}
`,
    )
  }
  if (opts.manifest) {
    await writeFile(path.join(dir, MANIFEST_FILENAME), opts.manifest)
  }
  return dir
}

test('schema is loose: unknown keys pass through at every level', () => {
  const parsed = ManifestSchema.parse({
    repo: 'garden',
    endpoints: [
      { url: 'https://garden.example.com', kind: 'photo-album', theme: 'dark' },
    ],
    data_roots: [{ path: 'beds/', role: 'content', renderer: 'hugo' }],
    services: ['infra/reverse-proxy.yaml'],
    custom_top_level: { anything: true },
  })
  assert.equal(
    (parsed as Record<string, unknown>)['custom_top_level'] !== undefined,
    true,
  )
  assert.equal(
    (parsed.endpoints?.[0] as Record<string, unknown>)['theme'],
    'dark',
  )
  assert.equal(
    (parsed.data_roots?.[0] as Record<string, unknown>)['renderer'],
    'hugo',
  )
  // kind/access/role are free-form strings, not enums.
  assert.equal(parsed.endpoints?.[0]?.kind, 'photo-album')
})

test('loadManifest: missing file → null; repo name defaults to basename', async () => {
  const bare = await makeRepo({})
  const named = await makeRepo({
    manifest: 'endpoints:\n  - url: https://family.example.com\n',
  })
  try {
    assert.equal(loadManifest(bare), null)
    const manifest = loadManifest(named)
    assert.equal(manifest?.repo, path.basename(named))
    assert.equal(manifest?.endpoints?.length, 1)
  } finally {
    await rm(bare, { recursive: true, force: true })
    await rm(named, { recursive: true, force: true })
  }
})

test('loadManifest: malformed YAML and schema violations throw with the path', async () => {
  const badYaml = await makeRepo({ manifest: 'endpoints: [unclosed\n' })
  // An endpoint without its required url is a schema violation.
  const badSchema = await makeRepo({
    manifest: 'endpoints:\n  - kind: site\n',
  })
  try {
    for (const dir of [badYaml, badSchema]) {
      assert.throws(
        () => loadManifest(dir),
        (err: unknown) =>
          err instanceof Error &&
          err.message.includes(path.join(dir, MANIFEST_FILENAME)),
      )
    }
  } finally {
    await rm(badYaml, { recursive: true, force: true })
    await rm(badSchema, { recursive: true, force: true })
  }
})

test('collectFleet: union of self + registry + delegates, deduped by path', async () => {
  // Hub delegates a pursuit to the garden repo by git URL; the garden
  // repo is ALSO registered — it must appear exactly once.
  const hub = await makeRepo({
    pursuitId: 'garden-overhaul',
    delegatedTo: 'git@example.com:someone/garden.git',
    manifest:
      'repo: family-hub\nendpoints:\n  - url: https://family.example.com\n    kind: site\n',
  })
  const garden = await makeRepo({
    pursuitId: 'soil',
    manifest:
      'endpoints:\n  - url: https://garden.example.com\n    kind: site\n    access: gated\ndata_roots:\n  - path: beds/\n    role: content\n',
  })
  const recipes = await makeRepo({ pursuitId: 'weeknight-rotation' })
  const regDir = await mkdtemp(path.join(os.tmpdir(), 'cadence-manifest-reg-'))
  const prev = process.env['CADENCE_REGISTRY_PATH']
  process.env['CADENCE_REGISTRY_PATH'] = path.join(regDir, 'repos.yaml')
  try {
    saveRegistry({
      repos: [
        { name: 'family-hub', path: hub, hub: true },
        {
          name: 'garden',
          path: garden,
          git_url: 'git@example.com:someone/garden.git',
        },
        { name: 'recipes', path: recipes },
        { name: 'ghost', path: path.join(regDir, 'missing') }, // stale → skipped
      ],
    })
    const fleet = await collectFleet(hub)
    assert.equal(fleet.generated_from, hub)
    assert.deepEqual(
      fleet.members.map((m) => m.name).sort(),
      ['family-hub', 'garden', 'recipes'],
    )
    assert.deepEqual(
      new Set(fleet.members.map((m) => m.path)),
      new Set([hub, garden, recipes]),
    )

    const hubMember = fleet.members.find((m) => m.path === hub)
    assert.equal(hubMember?.hub, true)
    assert.deepEqual(hubMember?.active_pursuits, ['garden-overhaul'])

    const gardenMember = fleet.members.find((m) => m.path === garden)
    assert.equal(gardenMember?.hub, false)
    assert.equal(gardenMember?.manifest?.endpoints?.[0]?.access, 'gated')
    assert.deepEqual(gardenMember?.active_pursuits, ['soil'])

    // No manifest is legal — the member still shows up.
    const recipesMember = fleet.members.find((m) => m.path === recipes)
    assert.equal(recipesMember?.manifest, null)

    const endpointTotal = fleet.members.reduce(
      (n, m) => n + (m.manifest?.endpoints?.length ?? 0),
      0,
    )
    assert.equal(endpointTotal, 2)
  } finally {
    if (prev === undefined) delete process.env['CADENCE_REGISTRY_PATH']
    else process.env['CADENCE_REGISTRY_PATH'] = prev
    await rm(hub, { recursive: true, force: true })
    await rm(garden, { recursive: true, force: true })
    await rm(recipes, { recursive: true, force: true })
    await rm(regDir, { recursive: true, force: true })
  }
})
