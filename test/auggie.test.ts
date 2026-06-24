import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import path from 'node:path'
import {
  applyRewrites,
  findResidualNamespaceTokens,
  DEFAULT_RULES,
} from '../src/auggie/rewrite.ts'
import { mapModel, DEFAULT_MODEL_MAP } from '../src/auggie/model-map.ts'
import { readPluginFrontmatter } from '../src/auggie/frontmatter.ts'
import { transpile, type OutputMap } from '../src/auggie/transform.ts'
import { loadOverrides } from '../src/auggie/overrides.ts'

const PLUGIN_DIR = path.join(process.cwd(), 'cadence-plugin')
const OVERRIDES = path.join(process.cwd(), 'src', 'auggie', 'overrides.yaml')

// ---------- rewrite ----------

test('rewrite: slash-command namespace is flattened', () => {
  assert.equal(applyRewrites('run /cadence:start now'), 'run /cadence-start now')
  assert.equal(applyRewrites('`/cadence:<verb>`'), '`/cadence-<verb>`')
  assert.equal(applyRewrites('prefix `/cadence:` or `/`'), 'prefix `/cadence-` or `/`')
})

test('rewrite: bare subagent identifiers are flattened', () => {
  assert.equal(applyRewrites('dispatch cadence:narrator'), 'dispatch cadence-narrator')
})

test('rewrite: documented YAML field with colon-space is preserved', () => {
  // `cadence: capstone` is a watermark frontmatter field, NOT the namespace.
  assert.equal(applyRewrites('cadence: capstone'), 'cadence: capstone')
})

test('rewrite: host-internals teaching is neutralized', () => {
  assert.equal(applyRewrites('the Agent tool'), 'the subagent dispatcher')
  assert.equal(applyRewrites("Claude Code's plugin loader"), "the agent host's plugin loader")
  assert.equal(applyRewrites('on Claude Code today'), 'on the agent host today')
  assert.equal(applyRewrites('use ToolSearch'), 'use tool discovery')
  assert.equal(applyRewrites('Claude-Code-internals teaching'), 'agent-host internals teaching')
})

test('rewrite: no residual namespace tokens after a full pass', () => {
  const src = 'See `/cadence:status`, `/cadence:start <id>`, and cadence:reconciler.'
  const out = applyRewrites(src)
  assert.deepEqual(findResidualNamespaceTokens(out), [])
})

test('rewrite: rules are an ordered, named list', () => {
  assert.ok(DEFAULT_RULES.length > 0)
  assert.ok(DEFAULT_RULES.every((r) => typeof r.name === 'string' && r.name.length > 0))
})

// ---------- model map ----------

test('model-map: aliases map to Auggie tiers', () => {
  assert.equal(mapModel('haiku'), DEFAULT_MODEL_MAP.haiku)
  assert.equal(mapModel('sonnet'), DEFAULT_MODEL_MAP.sonnet)
})

test('model-map: overrides win, unknown passes through, undefined stays undefined', () => {
  assert.equal(mapModel('sonnet', { sonnet: 'sonnet9' }), 'sonnet9')
  assert.equal(mapModel('mystery'), 'mystery')
  assert.equal(mapModel(undefined), undefined)
})

// ---------- tolerant frontmatter ----------

test('frontmatter: tolerates colons inside a description value', () => {
  const raw = ['---', 'description: stamps each capture with mcp: frontmatter via cadence', '---', '', '# body'].join('\n')
  const { data, content } = readPluginFrontmatter(raw)
  assert.equal(data.description, 'stamps each capture with mcp: frontmatter via cadence')
  assert.equal(content.trim(), '# body')
})

// ---------- transpile (against the real plugin) ----------

let MAP: OutputMap
test('transpile: produces the full Auggie build', async () => {
  const overrides = await loadOverrides(OVERRIDES)
  MAP = await transpile({ pluginDir: PLUGIN_DIR, overrides })
  assert.ok(MAP.size > 20)
  for (const key of [
    '.augment-plugin/plugin.json',
    '.augment/rules/cadence-runtime.md',
    '.augment/settings.json',
    'AGENTS.md',
    'README.md',
    'bin/cadence',
  ]) {
    assert.ok(MAP.has(key), `expected ${key} in output`)
  }
})

test('transpile: commands are flat-namespaced and carry $ARGUMENTS', () => {
  const start = MAP.get('.augment/commands/cadence-start.md')
  assert.ok(start, 'cadence-start command exists')
  const body = String(start!.content)
  assert.match(body, /\$ARGUMENTS/)
  assert.match(body, /argument-hint:/)
  assert.equal(findResidualNamespaceTokens(body).length, 0)
})

test('transpile: subagent model is mapped and namespaced', () => {
  const rec = MAP.get('.augment/agents/cadence-reconciler.md')
  assert.ok(rec, 'cadence-reconciler agent exists')
  const body = String(rec!.content)
  assert.match(body, /name: cadence-reconciler/)
  assert.match(body, /model: haiku4\.5/)
  assert.match(body, /color: cyan/) // from overrides
})

test('transpile: runtime is an always-on rule', () => {
  const rule = String(MAP.get('.augment/rules/cadence-runtime.md')!.content)
  assert.match(rule, /^---\ntype: always/)
})

test('transpile: settings.json wires a SessionStart hook', () => {
  const settings = JSON.parse(String(MAP.get('.augment/settings.json')!.content))
  const cmd = settings.hooks.SessionStart[0].hooks[0].command
  assert.match(cmd, /cadence status/)
  assert.match(cmd, /CADENCE_VERB_PREFIX=\/cadence-/)
})

test('transpile: no residual namespace tokens in ANY generated text file', () => {
  for (const [key, file] of MAP) {
    if (typeof file.content !== 'string') continue // skip the binary
    if (key === 'README.md') continue // intentionally names the Claude Code source
    const residual = findResidualNamespaceTokens(file.content)
    assert.deepEqual(residual, [], `${key} has residual tokens: ${residual.join(', ')}`)
  }
})
