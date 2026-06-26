/**
 * Auggie transpiler — orchestrator.
 *
 * Reads the Claude Code plugin source (cadence-plugin/) and produces the full
 * Auggie build as an in-memory file map (relative output path → contents). The
 * caller (the `build-auggie` CLI command) writes the map to disk or, in
 * `--check` mode, diffs it against the committed `auggie-plugin/` tree.
 *
 * Keeping the output in memory makes drift-checking a pure comparison with no
 * temp directories, and makes the whole transform unit-testable.
 *
 * Coverage: manifest, every skill → command, every subagent, runtime → always
 * rule + AGENTS.md, on-demand reference docs (rewritten), hooks → settings.json,
 * the bundled CLI binary, and a generated do-not-edit README.
 */
import { readFile, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import { readPluginFrontmatter } from './frontmatter.js'
import { applyRewrites, DEFAULT_RULES, type RewriteRule } from './rewrite.js'
import { mapModel } from './model-map.js'
import { buildAugmentManifest, type ClaudePluginManifest } from './manifest.js'
import { EMPTY_OVERRIDES, type Overrides } from './overrides.js'

export interface OutputFile {
  content: string | Buffer
  /** Unix mode bits (e.g. 0o755 for the CLI binary). */
  mode?: number
}

export type OutputMap = Map<string, OutputFile>

export interface TranspileOptions {
  /** Source plugin directory (cadence-plugin/). */
  pluginDir: string
  overrides?: Overrides
}

/** Reference-doc directories/files copied verbatim (with rewrite) so command and
 *  rule bodies that reference them by relative path keep resolving. Emitted under
 *  `.augment/` (REFERENCE_DEST_PREFIX) so they travel with the vendored Auggie
 *  install — which deploys only the .augment/ tree; the rewrite layer re-points
 *  the bare references to match. See issues #13/#14. */
const REFERENCE_FILES = ['cadence-reference.md']
const REFERENCE_DIRS = ['workflows', 'styles', 'tips', 'deck']
const REFERENCE_DEST_PREFIX = '.augment'

const TEXT_EXT = new Set(['.md', '.yaml', '.yml', '.json', '.txt'])

function yamlFrontmatter(data: Record<string, unknown>): string {
  const dumped = yaml.dump(data, { schema: yaml.CORE_SCHEMA, lineWidth: -1 })
  return `---\n${dumped}---\n`
}

function rewriteText(text: string, rules: RewriteRule[]): string {
  return applyRewrites(text, rules)
}

/**
 * Wrap a hook command so a non-shell hook runner (Auggie spawns directly,
 * tokenizing on whitespace) still evaluates shell syntax like inline
 * `VAR=value` env prefixes. Inner single quotes are POSIX-escaped (`'\''`).
 */
function shellWrapHook(inner: string): string {
  const escaped = inner.replace(/'/g, `'\\''`)
  return `sh -c '${escaped}'`
}

function toToolList(tools: unknown): string[] | undefined {
  if (Array.isArray(tools)) return tools.map(String)
  if (typeof tools === 'string') {
    return tools
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }
  return undefined
}

export async function transpile(opts: TranspileOptions): Promise<OutputMap> {
  const { pluginDir } = opts
  const overrides = opts.overrides ?? EMPTY_OVERRIDES
  const rules: RewriteRule[] = [
    ...DEFAULT_RULES,
    ...(overrides.rewrite?.extraRules ?? []),
  ]
  const out: OutputMap = new Map()

  await emitManifest(pluginDir, out)
  await emitCommands(pluginDir, overrides, rules, out)
  await emitAgents(pluginDir, overrides, rules, out)
  await emitRuntimeRule(pluginDir, rules, out)
  await emitAgentsMd(pluginDir, rules, out)
  await emitReferenceDocs(pluginDir, rules, out)
  await emitSettings(pluginDir, overrides, out)
  await emitCliBinary(pluginDir, out)
  emitReadme(out)

  return out
}

async function emitManifest(pluginDir: string, out: OutputMap): Promise<void> {
  const manifestPath = path.join(pluginDir, '.claude-plugin', 'plugin.json')
  const cc = JSON.parse(
    await readFile(manifestPath, 'utf-8'),
  ) as ClaudePluginManifest
  const manifest = buildAugmentManifest(cc)
  out.set(
    '.augment-plugin/plugin.json',
    { content: JSON.stringify(manifest, null, 2) + '\n' },
  )
}

async function emitCommands(
  pluginDir: string,
  overrides: Overrides,
  rules: RewriteRule[],
  out: OutputMap,
): Promise<void> {
  const skillsDir = path.join(pluginDir, 'skills')
  if (!existsSync(skillsDir)) return
  const verbs = (await readdir(skillsDir, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
  for (const verb of verbs) {
    const skillPath = path.join(skillsDir, verb, 'SKILL.md')
    if (!existsSync(skillPath)) continue
    const raw = await readFile(skillPath, 'utf-8')
    const { data, content } = readPluginFrontmatter(raw)
    const ov = overrides.commands?.[verb] ?? {}

    const fm: Record<string, unknown> = {
      description: rewriteText(String(data.description ?? ''), rules),
    }
    if (ov.argumentHint) fm['argument-hint'] = ov.argumentHint
    if (ov.model) fm.model = ov.model

    const takesArgs = ov.takesArguments !== false // default on
    const argPreamble = takesArgs
      ? '<arguments>$ARGUMENTS</arguments>\n\n'
      : ''
    const body = argPreamble + rewriteText(content, rules)
    out.set(`.augment/commands/cadence-${verb}.md`, {
      content: yamlFrontmatter(fm) + '\n' + body.replace(/^\n+/, ''),
    })
  }
}

async function emitAgents(
  pluginDir: string,
  overrides: Overrides,
  rules: RewriteRule[],
  out: OutputMap,
): Promise<void> {
  const agentsDir = path.join(pluginDir, 'agents')
  if (!existsSync(agentsDir)) return
  const files = (await readdir(agentsDir))
    .filter((f) => f.endsWith('.md'))
    .sort()
  for (const file of files) {
    const name = file.replace(/\.md$/, '')
    const raw = await readFile(path.join(agentsDir, file), 'utf-8')
    const { data, content } = readPluginFrontmatter(raw)
    const ov = overrides.agents?.[name] ?? {}

    const fm: Record<string, unknown> = {
      name: `cadence-${name}`,
      description: rewriteText(String(data.description ?? ''), rules),
    }
    const model = ov.model ?? mapModel(data.model as string, overrides.models)
    if (model) fm.model = model
    const tools = toToolList(data.tools)
    if (tools) fm.tools = tools
    if (ov.color) fm.color = ov.color

    out.set(`.augment/agents/cadence-${name}.md`, {
      content: yamlFrontmatter(fm) + '\n' + rewriteText(content, rules),
    })
  }
}

async function emitRuntimeRule(
  pluginDir: string,
  rules: RewriteRule[],
  out: OutputMap,
): Promise<void> {
  const runtimePath = path.join(pluginDir, 'cadence-runtime.md')
  if (!existsSync(runtimePath)) return
  const raw = await readFile(runtimePath, 'utf-8')
  const fm = {
    type: 'always',
    description: 'Cadence runtime — always-on operating instructions.',
  }
  out.set('.augment/rules/cadence-runtime.md', {
    content: yamlFrontmatter(fm) + '\n' + rewriteText(raw, rules),
  })
}

async function emitAgentsMd(
  pluginDir: string,
  rules: RewriteRule[],
  out: OutputMap,
): Promise<void> {
  // Hierarchical entry point Auggie reads automatically. Kept as a thin pointer
  // so the always-on rule stays the single source of the runtime text.
  const body = [
    '# Cadence',
    '',
    'This repository runs Cadence — a cognitive operating system that manages',
    'attention, protects flow state, separates the modes of thought, and',
    'generates narrative across pursuits.',
    '',
    'The always-on runtime lives in `.augment/rules/cadence-runtime.md` and is',
    'loaded automatically. On-demand reference content:',
    '',
    '- `cadence-reference.md` — file formats, full CLI catalog, lifecycle mechanics.',
    '- `workflows/verb-contracts.md` — per-verb tone + behavior + guardrails.',
    '- `workflows/coaching-strings.md` — canonical wording for ambient surfaces.',
    '',
    'Commands are exposed as `/cadence-<verb>` slash commands under',
    '`.augment/commands/`. The deterministic `cadence` CLI ships at `bin/cadence`.',
    '',
  ].join('\n')
  out.set('AGENTS.md', { content: rewriteText(body, rules) })
}

async function emitReferenceDocs(
  pluginDir: string,
  rules: RewriteRule[],
  out: OutputMap,
): Promise<void> {
  for (const file of REFERENCE_FILES) {
    const p = path.join(pluginDir, file)
    if (existsSync(p)) {
      out.set(`${REFERENCE_DEST_PREFIX}/${file}`, {
        content: rewriteText(await readFile(p, 'utf-8'), rules),
      })
    }
  }
  for (const dir of REFERENCE_DIRS) {
    const abs = path.join(pluginDir, dir)
    if (!existsSync(abs)) continue
    await walkCopy(abs, pluginDir, rules, out)
  }
}

async function walkCopy(
  abs: string,
  pluginDir: string,
  rules: RewriteRule[],
  out: OutputMap,
): Promise<void> {
  const entries = await readdir(abs, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(abs, entry.name)
    const rel =
      REFERENCE_DEST_PREFIX +
      '/' +
      path.relative(pluginDir, full).split(path.sep).join('/')
    if (entry.isDirectory()) {
      await walkCopy(full, pluginDir, rules, out)
    } else {
      const ext = path.extname(entry.name).toLowerCase()
      if (TEXT_EXT.has(ext)) {
        out.set(rel, {
          content: rewriteText(await readFile(full, 'utf-8'), rules),
        })
      } else {
        out.set(rel, { content: await readFile(full) })
      }
    }
  }
}

async function emitSettings(
  pluginDir: string,
  overrides: Overrides,
  out: OutputMap,
): Promise<void> {
  // Translate hooks/hooks.json → .augment/settings.json. Collapse the source
  // SessionStart startup|resume|clear matchers into a single SessionStart entry
  // (Auggie injects SessionStart stdout as context — the faithful analogue of
  // Claude Code's --hook-output envelope). Use a plain, no-color dashboard so
  // the injected context is clean markdown.
  const inner =
    overrides.sessionStartCommand ??
    'NO_COLOR=1 CADENCE_VERB_PREFIX=/cadence- cadence status'
  // Auggie spawns hook commands without a shell, so inline `VAR=value cmd`
  // env-prefix syntax — which a shell would consume — makes `VAR=value` the
  // argv[0] and fails with `spawn VAR=value ENOENT` every session start.
  // Wrap in `sh -c '…'` so a real shell evaluates the env prefix. Claude Code's
  // hook runner already uses a shell, so the source needs no wrapping — this is
  // Auggie-specific. See issue #11. (sessionStartCommand overrides are the
  // INNER command and get wrapped here too.)
  const command = shellWrapHook(inner)
  const settings = {
    hooks: {
      SessionStart: [
        {
          hooks: [{ type: 'command', command }],
        },
      ],
    },
  }
  out.set('.augment/settings.json', {
    content: JSON.stringify(settings, null, 2) + '\n',
  })
  void pluginDir
}

async function emitCliBinary(pluginDir: string, out: OutputMap): Promise<void> {
  const binPath = path.join(pluginDir, 'bin', 'cadence')
  if (!existsSync(binPath)) return
  const info = await stat(binPath)
  out.set('bin/cadence', {
    content: await readFile(binPath),
    mode: info.mode | 0o111,
  })
}

function emitReadme(out: OutputMap): void {
  const body = [
    '# Cadence — Auggie build (generated)',
    '',
    '> **Do not edit by hand.** Every file in this directory is generated by',
    '> `cadence build-auggie` from the authoritative Claude Code plugin in',
    '> `cadence-plugin/`. Edit the source plugin and regenerate; a CI drift',
    '> check fails if this tree is out of sync.',
    '',
    'This is the **fallback** runtime for Cadence — used when Claude Code is',
    'unavailable. See `docs/running-on-auggie.md` for install and usage.',
    '',
    '## Layout',
    '',
    '- `.augment-plugin/` — plugin manifest',
    '- `.augment/commands/` — `/cadence-<verb>` slash commands',
    '- `.augment/agents/` — subagents',
    '- `.augment/rules/cadence-runtime.md` — always-on runtime',
    '- `.augment/settings.json` — SessionStart hook',
    '- `bin/cadence` — the deterministic Cadence CLI (must be on PATH)',
    '',
  ].join('\n')
  out.set('README.md', { content: body })
}
