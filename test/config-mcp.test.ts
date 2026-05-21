import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { loadConfig } from '../src/config.ts'

async function withRepo(yamlBody: string, run: (dir: string) => Promise<void>) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cadence-cfg-'))
  try {
    await writeFile(path.join(dir, 'cadence.yaml'), yamlBody)
    await run(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

test('loadConfig parses mcp_servers and applies default timeout', async () => {
  await withRepo(
    `version: 1
mcp_servers:
  - name: time
    transport: stdio
    command: uvx
    args: ["mcp-server-time"]
`,
    async (dir) => {
      process.env['IRRELEVANT'] = 'set'
      const cfg = await loadConfig(dir)
      assert.equal(cfg.mcp_servers.length, 1)
      const s = cfg.mcp_servers[0]!
      assert.equal(s.kind, 'stdio')
      if (s.kind === 'stdio') {
        assert.equal(s.name, 'time')
        assert.equal(s.command, 'uvx')
        assert.deepEqual(s.args, ['mcp-server-time'])
        assert.equal(s.timeoutMs, 10000)
      }
    },
  )
})

test('loadConfig expands ${env:NAME} references in stdio server fields', async () => {
  process.env['CADENCE_TEST_TOKEN'] = 'sekret'
  await withRepo(
    `mcp_servers:
  - name: glean
    transport: stdio
    command: glean-mcp
    env:
      GLEAN_TOKEN: \${env:CADENCE_TEST_TOKEN}
    args: ["--token", "\${env:CADENCE_TEST_TOKEN}"]
`,
    async (dir) => {
      const cfg = await loadConfig(dir)
      const s = cfg.mcp_servers[0]!
      if (s.kind === 'stdio') {
        assert.equal(s.env['GLEAN_TOKEN'], 'sekret')
        assert.deepEqual(s.args, ['--token', 'sekret'])
      }
    },
  )
  delete process.env['CADENCE_TEST_TOKEN']
})

test('loadConfig throws a clear error when a referenced env var is missing', async () => {
  delete process.env['CADENCE_MISSING_TOKEN']
  await withRepo(
    `mcp_servers:
  - name: glean
    transport: stdio
    command: glean-mcp
    env:
      GLEAN_TOKEN: \${env:CADENCE_MISSING_TOKEN}
`,
    async (dir) => {
      await assert.rejects(loadConfig(dir), (err: Error) =>
        /MCP server 'glean' references missing env var CADENCE_MISSING_TOKEN/.test(
          err.message,
        ),
      )
    },
  )
})

test('loadConfig rejects duplicate MCP server names', async () => {
  await withRepo(
    `mcp_servers:
  - name: dup
    transport: stdio
    command: a
  - name: dup
    transport: stdio
    command: b
`,
    async (dir) => {
      await assert.rejects(loadConfig(dir), /duplicate MCP server name/)
    },
  )
})

test('loadConfig accepts http transport in raw config (adapter rejects later)', async () => {
  await withRepo(
    `mcp_servers:
  - name: remote
    transport: http
    url: https://example.com/mcp
    headers:
      Authorization: Bearer token
`,
    async (dir) => {
      const cfg = await loadConfig(dir)
      const s = cfg.mcp_servers[0]!
      assert.equal(s.kind, 'http')
      if (s.kind === 'http') {
        assert.equal(s.url, 'https://example.com/mcp')
        assert.equal(s.headers['Authorization'], 'Bearer token')
        assert.equal(s.timeoutMs, 10000)
      }
    },
  )
})

test('loadConfig returns empty mcp_servers when omitted from yaml', async () => {
  await withRepo(`version: 1`, async (dir) => {
    const cfg = await loadConfig(dir)
    assert.deepEqual(cfg.mcp_servers, [])
  })
})
