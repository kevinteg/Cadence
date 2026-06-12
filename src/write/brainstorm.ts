import path from 'node:path'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import yaml from 'js-yaml'
import {
  type BrainstormMeta,
  BrainstormMetaSchema,
  type BrainstormPhase,
} from '../types.js'
import { createProject } from './project.js'
import { isoTimestamp } from './util.js'

const BRAINSTORMS_ROOT = 'brainstorms'

export type CreateBrainstormOpts = {
  slug: string
  source_thoughts?: string[]
  now?: Date
}

/**
 * Creates `brainstorms/<slug>/{workspace.md, meta.yaml, refs/,
 * solutions/}` with `phase: diverging`. The top-level `brainstorms/`
 * directory is created lazily — first invocation produces it.
 */
export async function createBrainstorm(
  repoRoot: string,
  opts: CreateBrainstormOpts,
): Promise<{ path: string }> {
  const root = path.join(repoRoot, BRAINSTORMS_ROOT)
  const dir = path.join(root, opts.slug)
  if (existsSync(dir)) {
    throw new Error(`brainstorm already exists: ${opts.slug}`)
  }
  await mkdir(path.join(dir, 'refs'), { recursive: true })
  await mkdir(path.join(dir, 'solutions'), { recursive: true })

  const now = opts.now ?? new Date()
  const ts = isoTimestamp(now)
  const meta: BrainstormMeta = {
    slug: opts.slug,
    created_at: ts,
    last_touched: ts,
    phase: 'diverging',
    source_thoughts: opts.source_thoughts ?? [],
    candidate_solutions: [],
    selected_solution: null,
    target_pursuit: null,
  }
  await writeMeta(dir, meta)
  await writeFile(
    path.join(dir, 'workspace.md'),
    `# ${opts.slug}\n\n_Divergent notes go here. Edit freely; the agent appends as ideation flows._\n`,
    'utf8',
  )
  return { path: path.relative(repoRoot, dir) }
}

export type SetBrainstormPhaseOpts = {
  slug: string
  phase: BrainstormPhase
  now?: Date
}

export async function setBrainstormPhase(
  repoRoot: string,
  opts: SetBrainstormPhaseOpts,
): Promise<{ path: string; meta: BrainstormMeta }> {
  const dir = path.join(repoRoot, BRAINSTORMS_ROOT, opts.slug)
  const meta = await readMeta(dir)
  meta.phase = opts.phase
  meta.last_touched = isoTimestamp(opts.now ?? new Date())
  await writeMeta(dir, meta)
  return { path: path.relative(repoRoot, dir), meta }
}

export type CrystallizeOpts = {
  slug: string
  solution: string
  pursuit: string
  newProjectId: string
  decisionNote?: string
  now?: Date
}

export type CrystallizeResult = {
  brainstorm_path: string
  project_path: string
}

/**
 * Materializes a pursuit from a chosen solution. Parses the selected
 * `solutions/<name>.md` for its H1 (title), prose preamble (Intent),
 * and `## Next steps` `- [ ]` lines (actions). Calls createProject.
 * Writes decision.md. Updates meta.yaml to phase: crystallized.
 */
export async function crystallize(
  repoRoot: string,
  opts: CrystallizeOpts,
): Promise<CrystallizeResult> {
  const dir = path.join(repoRoot, BRAINSTORMS_ROOT, opts.slug)
  const meta = await readMeta(dir)
  if (meta.phase !== 'converging') {
    throw new Error(
      `brainstorm ${opts.slug} must be in phase 'converging' to crystallize (currently '${meta.phase}')`,
    )
  }
  const solutionPath = path.join(dir, 'solutions', `${opts.solution}.md`)
  if (!existsSync(solutionPath)) {
    throw new Error(
      `solution not found: ${opts.slug}/solutions/${opts.solution}.md`,
    )
  }

  const text = await readFile(solutionPath, 'utf8')
  const parsed = parseSolution(text)
  if (parsed.actions.length === 0) {
    throw new Error(
      `solution ${opts.solution}.md has no '## Next steps' section with '- [ ]' lines; cannot crystallize`,
    )
  }

  const projectResult = await createProject(repoRoot, {
    pursuit: opts.pursuit,
    id: opts.newProjectId,
    status: 'on_hold',
    ...(parsed.title ? { title: parsed.title } : {}),
    ...(parsed.intent ? { intent: parsed.intent } : {}),
    actions: parsed.actions,
    now: opts.now,
  })

  const now = opts.now ?? new Date()
  const decisionBody =
    `# ${opts.slug}: chose ${opts.solution}\n\n` +
    (opts.decisionNote ? `${opts.decisionNote.trim()}\n\n` : '') +
    `Crystallized at ${isoTimestamp(now)} → ${projectResult.path}\n`
  await writeFile(path.join(dir, 'decision.md'), decisionBody, 'utf8')

  meta.phase = 'crystallized'
  meta.selected_solution = opts.solution
  meta.target_pursuit = opts.pursuit
  meta.last_touched = isoTimestamp(now)
  await writeMeta(dir, meta)

  return {
    brainstorm_path: path.relative(repoRoot, dir),
    project_path: projectResult.path,
  }
}

export type ArchiveBrainstormOpts = {
  slug: string
  mode: 'keep' | 'delete'
  now?: Date
}

export type ArchiveResult =
  | { kind: 'kept'; from: string; to: string }
  | { kind: 'deleted'; from: string }

export async function archiveBrainstorm(
  repoRoot: string,
  opts: ArchiveBrainstormOpts,
): Promise<ArchiveResult> {
  const dir = path.join(repoRoot, BRAINSTORMS_ROOT, opts.slug)
  if (!existsSync(dir)) {
    throw new Error(`brainstorm not found: ${opts.slug}`)
  }
  if (opts.mode === 'delete') {
    await rm(dir, { recursive: true, force: true })
    return { kind: 'deleted', from: path.relative(repoRoot, dir) }
  }
  const meta = await readMeta(dir)
  meta.phase = 'archived'
  meta.last_touched = isoTimestamp(opts.now ?? new Date())
  await writeMeta(dir, meta)
  const target = path.join(repoRoot, 'wiki', '_archive', 'brainstorms', opts.slug)
  await mkdir(path.dirname(target), { recursive: true })
  await rename(dir, target)
  return {
    kind: 'kept',
    from: path.relative(repoRoot, dir),
    to: path.relative(repoRoot, target),
  }
}

// ── internals ────────────────────────────────────────────────────

async function readMeta(dir: string): Promise<BrainstormMeta> {
  const metaPath = path.join(dir, 'meta.yaml')
  if (!existsSync(metaPath)) {
    throw new Error(`brainstorm meta.yaml not found at ${metaPath}`)
  }
  const raw = yaml.load(await readFile(metaPath, 'utf8'), {
    schema: yaml.CORE_SCHEMA,
  })
  return BrainstormMetaSchema.parse(raw)
}

async function writeMeta(dir: string, meta: BrainstormMeta): Promise<void> {
  const yamlText = yaml.dump(meta, { lineWidth: -1 })
  await writeFile(path.join(dir, 'meta.yaml'), yamlText, 'utf8')
}

/**
 * Parses a solution file into {title, intent, actions}. Convention:
 * - first H1 → title
 * - prose between title and `## Next steps` (inclusive of other H2s
 *   except `## Next steps` itself) → intent
 * - `- [ ]` lines under `## Next steps` → actions
 *
 * Robust to extra whitespace; tolerant of missing sections (callers
 * decide whether the result is usable).
 */
export function parseSolution(text: string): {
  title?: string
  intent: string
  actions: string[]
} {
  const lines = text.split('\n')
  let title: string | undefined
  const intentLines: string[] = []
  const actions: string[] = []
  let inNextSteps = false
  let pastTitle = false
  for (const line of lines) {
    const titleMatch = !pastTitle && line.match(/^#\s+(.+?)\s*$/)
    if (titleMatch) {
      title = titleMatch[1]
      pastTitle = true
      continue
    }
    if (/^##\s+next steps\b/i.test(line)) {
      inNextSteps = true
      continue
    }
    if (inNextSteps) {
      const m = line.match(/^\s*-\s*\[\s\]\s*(.+?)\s*$/)
      if (m && m[1]) {
        actions.push(m[1])
        continue
      }
      // Another H2 ends the Next steps block.
      if (/^##\s+/.test(line)) {
        inNextSteps = false
        intentLines.push(line)
        continue
      }
      // Non-checkbox content inside Next steps — ignore for actions
      // but keep momentum.
      continue
    }
    intentLines.push(line)
  }
  const intent = intentLines.join('\n').trim()
  return { ...(title ? { title } : {}), intent, actions }
}
