import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import {
  readDelegation,
  resolveDelegate,
  summarizeDelegateSnapshot,
} from '../src/delegation.ts'
import { createProject } from '../src/write/project.ts'
import { scan } from '../src/scan/repo.ts'
import { saveRegistry } from '../src/registry.ts'

async function makeRepo(opts: {
  pursuitId: string
  delegatedTo?: string
}): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cadence-delegation-'))
  await writeFile(path.join(dir, 'cadence.yaml'), 'version: 1\n')
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

A pursuit.
`,
  )
  return dir
}

test('readDelegation peeks delegated_to without a scan', async () => {
  const hub = await makeRepo({
    pursuitId: 'garden-overhaul',
    delegatedTo: 'git@example.com:someone/garden.git',
  })
  try {
    assert.equal(
      readDelegation(hub, 'garden-overhaul'),
      'git@example.com:someone/garden.git',
    )
    assert.equal(readDelegation(hub, 'nope'), undefined)
  } finally {
    await rm(hub, { recursive: true, force: true })
  }
})

test('createProject refuses on a delegated pursuit (covers crystallize too)', async () => {
  const hub = await makeRepo({
    pursuitId: 'garden-overhaul',
    delegatedTo: 'git@example.com:someone/garden.git',
  })
  try {
    await assert.rejects(
      createProject(hub, { pursuit: 'garden-overhaul', id: 'new-beds' }),
      /delegated to git@example\.com:someone\/garden\.git/,
    )
  } finally {
    await rm(hub, { recursive: true, force: true })
  }
})

test('resolveDelegate: registry name and git-url matches, hints not authority', async () => {
  const hub = await makeRepo({ pursuitId: 'p' })
  const spoke = await makeRepo({ pursuitId: 'sp' })
  const regDir = await mkdtemp(path.join(os.tmpdir(), 'cadence-reg-'))
  const prev = process.env['CADENCE_REGISTRY_PATH']
  process.env['CADENCE_REGISTRY_PATH'] = path.join(regDir, 'repos.yaml')
  try {
    saveRegistry({
      repos: [
        {
          name: 'garden',
          path: spoke,
          git_url: 'git@example.com:someone/garden.git',
        },
        { name: 'ghost', path: path.join(regDir, 'missing') },
      ],
    })
    // By registered name.
    const byName = resolveDelegate(hub, 'p', 'garden')
    assert.equal(byName.checkout, spoke)
    assert.equal(byName.via, 'registry-name')
    // By git URL identity (https spelling matches ssh registration).
    const byUrl = resolveDelegate(
      hub,
      'p',
      'https://example.com/someone/garden.git',
    )
    assert.equal(byUrl.checkout, spoke)
    assert.equal(byUrl.via, 'registry-git-url')
    assert.equal(byUrl.registry_name, 'garden')
    // Stale entry (missing path) is a miss, not an error.
    const ghost = resolveDelegate(hub, 'p', 'ghost')
    assert.equal(ghost.checkout, null)
  } finally {
    if (prev === undefined) delete process.env['CADENCE_REGISTRY_PATH']
    else process.env['CADENCE_REGISTRY_PATH'] = prev
    await rm(hub, { recursive: true, force: true })
    await rm(spoke, { recursive: true, force: true })
    await rm(regDir, { recursive: true, force: true })
  }
})

test('delegated pursuits scan through with delegated_to intact; summary reduces a snapshot', async () => {
  const hub = await makeRepo({
    pursuitId: 'garden-overhaul',
    delegatedTo: 'garden',
  })
  const spoke = await makeRepo({ pursuitId: 'soil' })
  try {
    await createProject(spoke, {
      pursuit: 'soil',
      id: 'raised-beds',
      status: 'active',
      actions: ['buy lumber', 'assemble frames'],
    })
    const hubSnapshot = await scan(hub)
    const stub = hubSnapshot.pursuits.find((p) => p.id === 'garden-overhaul')
    assert.equal(stub?.delegated_to, 'garden')

    const spokeSnapshot = await scan(spoke)
    const summary = summarizeDelegateSnapshot(spokeSnapshot)
    assert.equal(summary.active_projects, 1)
    assert.equal(summary.open_actions, 2)
    assert.deepEqual(summary.active_pursuits, ['soil'])
  } finally {
    await rm(hub, { recursive: true, force: true })
    await rm(spoke, { recursive: true, force: true })
  }
})
