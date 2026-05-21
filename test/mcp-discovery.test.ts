import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import {
  discoverMcpServers,
  mergeMcpRegistry,
} from '../src/integrations/mcp/discovery.ts'
import type { McpServerConfig } from '../src/types.ts'

async function withDirs(run: (repo: string, home: string) => Promise<void>) {
  const repo = await mkdtemp(path.join(os.tmpdir(), 'cadence-disc-repo-'))
  const home = await mkdtemp(path.join(os.tmpdir(), 'cadence-disc-home-'))
  try {
    await run(repo, home)
  } finally {
    await rm(repo, { recursive: true, force: true })
    await rm(home, { recursive: true, force: true })
  }
}

test('discoverMcpServers reads ~/.claude.json mcpServers (user scope)', async () => {
  await withDirs(async (repo, home) => {
    await writeFile(
      path.join(home, '.claude.json'),
      JSON.stringify({
        mcpServers: {
          glean: { type: 'http', url: 'https://glean.example/mcp' },
          fs: { command: 'npx', args: ['-y', 'mcp-server-fs', '/tmp'] },
        },
      }),
    )
    const discovered = await discoverMcpServers(repo, { homeDir: home })
    assert.equal(discovered.length, 2)
    const glean = discovered.find((s) => s.name === 'glean')!
    assert.equal(glean.kind, 'http')
    assert.equal(glean.source, 'claude-user')
    if (glean.kind === 'http') assert.equal(glean.url, 'https://glean.example/mcp')
    const fs = discovered.find((s) => s.name === 'fs')!
    assert.equal(fs.kind, 'stdio')
    if (fs.kind === 'stdio') {
      assert.equal(fs.command, 'npx')
      assert.deepEqual(fs.args, ['-y', 'mcp-server-fs', '/tmp'])
    }
  })
})

test('discoverMcpServers reads .mcp.json (project scope) with no type field', async () => {
  await withDirs(async (repo, home) => {
    await writeFile(
      path.join(repo, '.mcp.json'),
      JSON.stringify({
        mcpServers: {
          time: { command: 'uvx', args: ['mcp-server-time'] },
          api: { url: 'https://api.example/mcp', headers: { Authorization: 'Bearer x' } },
        },
      }),
    )
    const discovered = await discoverMcpServers(repo, { homeDir: home })
    assert.equal(discovered.length, 2)
    const time = discovered.find((s) => s.name === 'time')!
    assert.equal(time.kind, 'stdio')
    assert.equal(time.source, 'mcp-project')
    const api = discovered.find((s) => s.name === 'api')!
    assert.equal(api.kind, 'http')
    if (api.kind === 'http') {
      assert.equal(api.headers['Authorization'], 'Bearer x')
    }
  })
})

test('discoverMcpServers handles --transport field (Claude Code shape)', async () => {
  await withDirs(async (repo, home) => {
    await writeFile(
      path.join(home, '.claude.json'),
      JSON.stringify({
        mcpServers: {
          // Claude Code writes `transport: "http"` sometimes; verify both
          // spellings (type/transport) are honored.
          glean: { transport: 'http', url: 'https://glean.example' },
          sse_one: { transport: 'sse', url: 'https://stream.example' },
        },
      }),
    )
    const discovered = await discoverMcpServers(repo, { homeDir: home })
    assert.equal(discovered.length, 2)
    assert.ok(discovered.every((s) => s.kind === 'http'))
  })
})

test('discoverMcpServers skips malformed entries without throwing', async () => {
  await withDirs(async (repo, home) => {
    await writeFile(
      path.join(home, '.claude.json'),
      JSON.stringify({
        mcpServers: {
          ok: { command: 'a' },
          bad_no_target: { type: 'stdio' }, // no command
          bad_string: 'not an object',
          bad_null: null,
        },
      }),
    )
    const discovered = await discoverMcpServers(repo, { homeDir: home })
    assert.equal(discovered.length, 1)
    assert.equal(discovered[0]!.name, 'ok')
  })
})

test('discoverMcpServers returns [] when neither file exists', async () => {
  await withDirs(async (repo, home) => {
    const discovered = await discoverMcpServers(repo, { homeDir: home })
    assert.deepEqual(discovered, [])
  })
})

test('mergeMcpRegistry: project overrides user on name collision', async () => {
  await withDirs(async (repo, home) => {
    await writeFile(
      path.join(home, '.claude.json'),
      JSON.stringify({
        mcpServers: { glean: { url: 'https://user.example' } },
      }),
    )
    await writeFile(
      path.join(repo, '.mcp.json'),
      JSON.stringify({
        mcpServers: { glean: { url: 'https://project.example' } },
      }),
    )
    const discovered = await discoverMcpServers(repo, { homeDir: home })
    const { servers, sources } = mergeMcpRegistry([], discovered)
    assert.equal(servers.length, 1)
    const g = servers[0]!
    if (g.kind === 'http') assert.equal(g.url, 'https://project.example')
    assert.equal(sources.get('glean'), 'mcp-project')
  })
})

test('mergeMcpRegistry: cadence.yaml overrides both project and user', async () => {
  const cadenceYaml: McpServerConfig[] = [
    {
      kind: 'http',
      name: 'glean',
      url: 'https://override.example',
      headers: {},
      timeoutMs: 10000,
    },
  ]
  await withDirs(async (repo, home) => {
    await writeFile(
      path.join(home, '.claude.json'),
      JSON.stringify({ mcpServers: { glean: { url: 'https://user.example' } } }),
    )
    await writeFile(
      path.join(repo, '.mcp.json'),
      JSON.stringify({ mcpServers: { glean: { url: 'https://project.example' } } }),
    )
    const discovered = await discoverMcpServers(repo, { homeDir: home })
    const { servers, sources } = mergeMcpRegistry(cadenceYaml, discovered)
    assert.equal(servers.length, 1)
    if (servers[0]!.kind === 'http') {
      assert.equal(servers[0]!.url, 'https://override.example')
    }
    assert.equal(sources.get('glean'), 'cadence-yaml')
  })
})

test('mergeMcpRegistry: distinct names from all three sources coexist', async () => {
  const cadenceYaml: McpServerConfig[] = [
    {
      kind: 'stdio',
      name: 'local-only',
      command: 'cmd',
      args: [],
      env: {},
      timeoutMs: 10000,
    },
  ]
  await withDirs(async (repo, home) => {
    await writeFile(
      path.join(home, '.claude.json'),
      JSON.stringify({ mcpServers: { user_one: { command: 'a' } } }),
    )
    await writeFile(
      path.join(repo, '.mcp.json'),
      JSON.stringify({ mcpServers: { project_one: { url: 'https://p.example' } } }),
    )
    const discovered = await discoverMcpServers(repo, { homeDir: home })
    const { servers, sources } = mergeMcpRegistry(cadenceYaml, discovered)
    assert.equal(servers.length, 3)
    assert.equal(sources.get('user_one'), 'claude-user')
    assert.equal(sources.get('project_one'), 'mcp-project')
    assert.equal(sources.get('local-only'), 'cadence-yaml')
  })
})

test('discoverMcpServers tolerates malformed JSON (returns empty)', async () => {
  await withDirs(async (repo, home) => {
    await writeFile(path.join(home, '.claude.json'), '{not json')
    const discovered = await discoverMcpServers(repo, { homeDir: home })
    assert.deepEqual(discovered, [])
  })
})
