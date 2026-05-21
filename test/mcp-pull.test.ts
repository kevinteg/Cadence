import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { pullMcpServerResources } from '../src/integrations/mcp/pull.ts'
import type { McpClient, McpResource } from '../src/integrations/mcp/client.ts'
import { CONFIG_DEFAULTS, type Config, type McpServerConfig } from '../src/types.ts'

const NOW = new Date('2026-05-22T10:00:00Z')

function makeFakeClient(opts: {
  resources: McpResource[]
  contents: Record<string, { text?: string; mimeType?: string; isBinary?: boolean }>
}): McpClient {
  let closed = false
  return {
    async listResources() {
      if (closed) throw new Error('client used after close')
      return opts.resources
    },
    async readResource(uri: string) {
      if (closed) throw new Error('client used after close')
      const c = opts.contents[uri]
      if (!c) throw new Error(`unknown resource ${uri}`)
      return {
        uri,
        ...(c.mimeType ? { mimeType: c.mimeType } : {}),
        ...(c.text !== undefined ? { text: c.text } : {}),
        isBinary: c.isBinary ?? false,
      }
    },
    async close() {
      closed = true
    },
  }
}

function makeConfig(servers: McpServerConfig[]): Config {
  return { ...CONFIG_DEFAULTS, mcp_servers: servers }
}

const stdioServer: McpServerConfig = {
  kind: 'stdio',
  name: 'fake',
  command: 'unused',
  args: [],
  env: {},
  timeoutMs: 5000,
}

async function tempRepo() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cadence-pull-'))
  await mkdir(path.join(dir, 'thoughts/unprocessed'), { recursive: true })
  return dir
}

test('mcp-pull writes one capture per text resource', async () => {
  const dir = await tempRepo()
  try {
    const client = makeFakeClient({
      resources: [
        { uri: 'mem://a', name: 'A', mimeType: 'text/plain' },
        { uri: 'mem://b', name: 'B', description: 'second', mimeType: 'text/markdown' },
      ],
      contents: {
        'mem://a': { text: 'alpha body', mimeType: 'text/plain' },
        'mem://b': { text: '# Bravo', mimeType: 'text/markdown' },
      },
    })
    const result = await pullMcpServerResources(dir, makeConfig([stdioServer]), {
      serverName: 'fake',
      now: NOW,
      connect: async () => client,
    })
    assert.equal(result.summary.written, 2)
    assert.equal(result.summary.skipped_existing, 0)
    assert.equal(result.summary.skipped_binary, 0)
    assert.equal(result.summary.errors, 0)
    const written = result.entries.filter((e) => e.kind === 'written')
    assert.equal(written.length, 2)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('mcp-pull skips resources whose URI is already a capture', async () => {
  const dir = await tempRepo()
  try {
    await writeFile(
      path.join(dir, 'thoughts/unprocessed/existing.md'),
      `---
captured: 2026-05-21T09:00:00
verb_context: mcp-pull:fake
mcp:
  server: fake
  uri: mem://a
  content_hash: sha256:old
---

prior pull body
`,
    )
    const client = makeFakeClient({
      resources: [
        { uri: 'mem://a', name: 'A', mimeType: 'text/plain' },
        { uri: 'mem://b', name: 'B', mimeType: 'text/plain' },
      ],
      contents: {
        'mem://a': { text: 'fresh body' },
        'mem://b': { text: 'b body' },
      },
    })
    const result = await pullMcpServerResources(dir, makeConfig([stdioServer]), {
      serverName: 'fake',
      now: NOW,
      connect: async () => client,
    })
    assert.equal(result.summary.written, 1)
    assert.equal(result.summary.skipped_existing, 1)
    const skipped = result.entries.find((e) => e.kind === 'skipped_existing')
    assert.ok(skipped)
    if (skipped?.kind === 'skipped_existing') {
      assert.equal(skipped.uri, 'mem://a')
      assert.equal(skipped.reason, 'uri_seen')
    }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('mcp-pull dedups by content_hash even when uri differs', async () => {
  const dir = await tempRepo()
  try {
    // Prior pull stored the exact same body text under a different uri
    const sharedText = 'identical body'
    const { createHash } = await import('node:crypto')
    const hash =
      'sha256:' + createHash('sha256').update(sharedText, 'utf8').digest('hex')
    await writeFile(
      path.join(dir, 'thoughts/unprocessed/prior.md'),
      `---
captured: 2026-05-20T09:00:00
verb_context: mcp-pull:fake
mcp:
  server: fake
  uri: mem://old-uri
  content_hash: ${hash}
---

${sharedText}
`,
    )
    const client = makeFakeClient({
      resources: [{ uri: 'mem://new-uri', name: 'New' }],
      contents: { 'mem://new-uri': { text: sharedText } },
    })
    const result = await pullMcpServerResources(dir, makeConfig([stdioServer]), {
      serverName: 'fake',
      now: NOW,
      connect: async () => client,
    })
    assert.equal(result.summary.written, 0)
    assert.equal(result.summary.skipped_existing, 1)
    const skipped = result.entries[0]
    if (skipped?.kind === 'skipped_existing') {
      assert.equal(skipped.reason, 'content_hash_seen')
    } else {
      throw new Error('expected skipped_existing entry')
    }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('mcp-pull flags binary resources without writing', async () => {
  const dir = await tempRepo()
  try {
    const client = makeFakeClient({
      resources: [{ uri: 'mem://img', name: 'Image', mimeType: 'image/png' }],
      contents: { 'mem://img': { isBinary: true, mimeType: 'image/png' } },
    })
    const result = await pullMcpServerResources(dir, makeConfig([stdioServer]), {
      serverName: 'fake',
      now: NOW,
      connect: async () => client,
    })
    assert.equal(result.summary.written, 0)
    assert.equal(result.summary.skipped_binary, 1)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('mcp-pull --filter narrows by case-insensitive substring against uri/name/description', async () => {
  const dir = await tempRepo()
  try {
    const client = makeFakeClient({
      resources: [
        { uri: 'mem://docs/onboarding', name: 'Onboarding' },
        { uri: 'mem://docs/billing', name: 'Billing', description: 'finance' },
        { uri: 'mem://policies/code-review', name: 'CodeReview' },
      ],
      contents: {
        'mem://docs/onboarding': { text: 'one' },
        'mem://docs/billing': { text: 'two' },
        'mem://policies/code-review': { text: 'three' },
      },
    })
    const result = await pullMcpServerResources(dir, makeConfig([stdioServer]), {
      serverName: 'fake',
      filter: 'docs',
      now: NOW,
      connect: async () => client,
    })
    assert.equal(result.total_listed, 3)
    assert.equal(result.after_filter, 2)
    assert.equal(result.summary.written, 2)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('mcp-pull --limit caps the post-filter set', async () => {
  const dir = await tempRepo()
  try {
    const client = makeFakeClient({
      resources: Array.from({ length: 5 }, (_, i) => ({
        uri: `mem://r${i}`,
        name: `R${i}`,
      })),
      contents: Object.fromEntries(
        Array.from({ length: 5 }, (_, i) => [`mem://r${i}`, { text: `body ${i}` }]),
      ),
    })
    const result = await pullMcpServerResources(dir, makeConfig([stdioServer]), {
      serverName: 'fake',
      limit: 2,
      now: NOW,
      connect: async () => client,
    })
    assert.equal(result.total_listed, 5)
    assert.equal(result.after_filter, 2)
    assert.equal(result.summary.written, 2)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('mcp-pull --dry-run lists what would be written without touching disk', async () => {
  const dir = await tempRepo()
  try {
    const client = makeFakeClient({
      resources: [{ uri: 'mem://x', name: 'X' }],
      contents: { 'mem://x': { text: 'preview' } },
    })
    const result = await pullMcpServerResources(dir, makeConfig([stdioServer]), {
      serverName: 'fake',
      dryRun: true,
      now: NOW,
      connect: async () => client,
    })
    assert.equal(result.dry_run, true)
    assert.equal(result.summary.written, 1)
    const entry = result.entries[0]
    if (entry?.kind === 'written') {
      assert.equal(entry.path, '(dry-run)')
    } else {
      throw new Error('expected written entry')
    }
    // No actual file created
    const { readdir } = await import('node:fs/promises')
    const files = await readdir(path.join(dir, 'thoughts/unprocessed'))
    assert.equal(files.length, 0)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('mcp-pull raises an McpError when --server is not configured', async () => {
  const dir = await tempRepo()
  try {
    await assert.rejects(
      pullMcpServerResources(dir, makeConfig([]), {
        serverName: 'nope',
        now: NOW,
        connect: async () => makeFakeClient({ resources: [], contents: {} }),
      }),
      (err: Error) => {
        const e = err as Error & { kind?: string }
        return e.kind === 'not_configured'
      },
    )
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('mcp-pull captures per-resource read errors without aborting the batch', async () => {
  const dir = await tempRepo()
  try {
    const client: McpClient = {
      async listResources() {
        return [
          { uri: 'mem://ok', name: 'OK' },
          { uri: 'mem://bad', name: 'Bad' },
        ]
      },
      async readResource(uri: string) {
        if (uri === 'mem://bad') throw new Error('boom')
        return { uri, text: 'ok', isBinary: false }
      },
      async close() {},
    }
    const result = await pullMcpServerResources(dir, makeConfig([stdioServer]), {
      serverName: 'fake',
      now: NOW,
      connect: async () => client,
    })
    assert.equal(result.summary.written, 1)
    assert.equal(result.summary.errors, 1)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
