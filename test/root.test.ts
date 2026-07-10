import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { findRepoRoot, isCadenceRepo } from '../src/root.ts'
import {
  defaultEntry,
  entryByGitUrl,
  entryByName,
  loadRegistry,
  registryPath,
  saveRegistry,
} from '../src/registry.ts'

async function tempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), 'cadence-root-test-'))
}

test('findRepoRoot returns null instead of falling back to CWD', async () => {
  const dir = await tempDir()
  try {
    assert.equal(findRepoRoot(dir), null)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('findRepoRoot walks up to a cadence.yaml marker', async () => {
  const dir = await tempDir()
  try {
    await writeFile(path.join(dir, 'cadence.yaml'), 'version: 1\n')
    const nested = path.join(dir, 'a/b/c')
    await mkdir(nested, { recursive: true })
    assert.equal(findRepoRoot(nested), dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('a bare pursuits/ dir is NOT a root marker (weak-marker fix)', async () => {
  const dir = await tempDir()
  try {
    await mkdir(path.join(dir, 'pursuits'), { recursive: true })
    assert.equal(isCadenceRepo(dir), false)
    assert.equal(findRepoRoot(dir), null)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('pursuits/ with a pursuit.md IS a root marker (legacy repos)', async () => {
  const dir = await tempDir()
  try {
    await mkdir(path.join(dir, 'pursuits/p1'), { recursive: true })
    await writeFile(
      path.join(dir, 'pursuits/p1/pursuit.md'),
      '---\nid: p1\n---\n',
    )
    assert.equal(isCadenceRepo(dir), true)
    assert.equal(findRepoRoot(path.join(dir, 'pursuits/p1')), dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('archived pursuits alone also mark a root', async () => {
  const dir = await tempDir()
  try {
    await mkdir(path.join(dir, 'pursuits/_archived/old'), { recursive: true })
    await writeFile(
      path.join(dir, 'pursuits/_archived/old/pursuit.md'),
      '---\nid: old\n---\n',
    )
    assert.equal(isCadenceRepo(dir), true)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('registry: load missing file → empty; save/load round-trip; lookups', async () => {
  const dir = await tempDir()
  const prev = process.env['CADENCE_REGISTRY_PATH']
  process.env['CADENCE_REGISTRY_PATH'] = path.join(dir, 'repos.yaml')
  try {
    assert.equal(registryPath(), path.join(dir, 'repos.yaml'))
    assert.deepEqual(loadRegistry(), { repos: [] })

    saveRegistry({
      repos: [
        {
          name: 'personal',
          path: '~/code/personal',
          hub: true,
          git_url: 'git@github.com:someone/personal.git',
        },
        { name: 'garden', path: '/tmp/garden' },
      ],
      default: 'personal',
    })
    const loaded = loadRegistry()
    assert.equal(loaded.repos.length, 2)
    assert.equal(entryByName(loaded, 'garden')?.path, '/tmp/garden')
    assert.equal(
      entryByGitUrl(loaded, 'https://github.com/someone/personal')?.name,
      'personal',
    )
    assert.equal(defaultEntry(loaded)?.name, 'personal')
  } finally {
    if (prev === undefined) delete process.env['CADENCE_REGISTRY_PATH']
    else process.env['CADENCE_REGISTRY_PATH'] = prev
    await rm(dir, { recursive: true, force: true })
  }
})

test('registry: defaultEntry falls back to sole entry, then sole hub', async () => {
  const sole = { repos: [{ name: 'only', path: '/x' }] }
  assert.equal(defaultEntry(sole)?.name, 'only')
  const hubbed = {
    repos: [
      { name: 'a', path: '/a' },
      { name: 'b', path: '/b', hub: true },
      { name: 'c', path: '/c' },
    ],
  }
  assert.equal(defaultEntry(hubbed)?.name, 'b')
  const ambiguous = {
    repos: [
      { name: 'a', path: '/a', hub: true },
      { name: 'b', path: '/b', hub: true },
    ],
  }
  assert.equal(defaultEntry(ambiguous), null)
})
