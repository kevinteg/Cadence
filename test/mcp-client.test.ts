import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { createMcpClient, resolveMcpServer } from '../src/integrations/mcp/client.ts'
import type { McpServerConfig } from '../src/types.ts'

type FakeResource = {
  uri: string
  name: string
  description?: string
  mimeType?: string
  text?: string
  binary?: boolean
}

/**
 * Spin up a fake MCP server that advertises a fixed resource list and
 * answers reads from the same fixture. Returns a connected client +
 * the server so tests can introspect or close.
 */
async function startFakePair(resources: FakeResource[]) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const server = new Server(
    { name: 'fake-mcp', version: '0.0.1' },
    { capabilities: { resources: {} } },
  )
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: resources.map((r) => ({
      uri: r.uri,
      name: r.name,
      ...(r.description !== undefined ? { description: r.description } : {}),
      ...(r.mimeType !== undefined ? { mimeType: r.mimeType } : {}),
    })),
  }))
  server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
    const found = resources.find((r) => r.uri === req.params.uri)
    if (!found) throw new Error(`unknown resource: ${req.params.uri}`)
    if (found.binary) {
      return {
        contents: [
          {
            uri: found.uri,
            mimeType: found.mimeType ?? 'application/octet-stream',
            blob: Buffer.from([0x00, 0x01, 0x02]).toString('base64'),
          },
        ],
      }
    }
    return {
      contents: [
        {
          uri: found.uri,
          mimeType: found.mimeType ?? 'text/plain',
          text: found.text ?? '',
        },
      ],
    }
  })
  await server.connect(serverTransport)
  const client = await createMcpClient(clientTransport, 'fake-mcp', 5000)
  return { client, server }
}

test('McpClient lists resources from a fake server', async () => {
  const { client, server } = await startFakePair([
    { uri: 'mem://hello', name: 'Hello', mimeType: 'text/plain', text: 'hi' },
    { uri: 'mem://world', name: 'World', description: 'second one', mimeType: 'text/markdown', text: '# w' },
  ])
  try {
    const list = await client.listResources()
    assert.equal(list.length, 2)
    assert.equal(list[0]!.uri, 'mem://hello')
    assert.equal(list[0]!.name, 'Hello')
    assert.equal(list[1]!.description, 'second one')
  } finally {
    await client.close()
    await server.close()
  }
})

test('McpClient reads a text resource and returns text + mimeType', async () => {
  const { client, server } = await startFakePair([
    { uri: 'mem://doc', name: 'Doc', mimeType: 'text/plain', text: 'the body' },
  ])
  try {
    const content = await client.readResource('mem://doc')
    assert.equal(content.uri, 'mem://doc')
    assert.equal(content.text, 'the body')
    assert.equal(content.mimeType, 'text/plain')
    assert.equal(content.isBinary, false)
  } finally {
    await client.close()
    await server.close()
  }
})

test('McpClient flags binary resources as isBinary without bytes', async () => {
  const { client, server } = await startFakePair([
    { uri: 'mem://image', name: 'Image', mimeType: 'image/png', binary: true },
  ])
  try {
    const content = await client.readResource('mem://image')
    assert.equal(content.isBinary, true)
    assert.equal(content.text, undefined)
    assert.equal(content.mimeType, 'image/png')
  } finally {
    await client.close()
    await server.close()
  }
})

test('McpClient surfaces server errors as McpError(kind=server_error)', async () => {
  const { client, server } = await startFakePair([
    { uri: 'mem://known', name: 'Known', text: 'x' },
  ])
  try {
    await assert.rejects(
      client.readResource('mem://nope'),
      (err: Error) => {
        const e = err as Error & { kind?: string }
        return e.kind === 'server_error' && /unknown resource/.test(e.message)
      },
    )
  } finally {
    await client.close()
    await server.close()
  }
})

test('resolveMcpServer returns matched server and throws not_configured on miss', () => {
  const servers: McpServerConfig[] = [
    {
      kind: 'stdio',
      name: 'glean',
      command: 'glean-mcp',
      args: [],
      env: {},
      timeoutMs: 10000,
    },
  ]
  assert.equal(resolveMcpServer(servers, 'glean').name, 'glean')
  assert.throws(
    () => resolveMcpServer(servers, 'time'),
    (err: Error) => {
      const e = err as Error & { kind?: string; hint?: string }
      return (
        e.kind === 'not_configured' &&
        /not declared/.test(e.message) &&
        /glean/.test(e.hint ?? '')
      )
    },
  )
})
