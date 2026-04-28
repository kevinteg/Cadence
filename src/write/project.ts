import path from 'node:path'
import { existsSync } from 'node:fs'
import { dateString, writeFrontmatterFile } from './util.js'
import { resolvePursuitDir } from './paths.js'

export type CreateProjectOpts = {
  pursuit: string
  id: string
  status?: 'active' | 'on_hold' | 'done' | 'dropped'
  title?: string
  description?: string
  intent?: string
  dod?: string[]
  dod_checked?: string[]
  actions?: string[]
  actions_checked?: string[]
  waiting_for?: Array<{
    person: string
    what: string
    expected: string
    flagged?: boolean
  }>
  created?: string
  now?: Date
}

export const DEFAULT_FIRST_ACTION =
  'Brainstorm and add concrete actions for this project'

export async function createProject(
  repoRoot: string,
  opts: CreateProjectOpts,
): Promise<{ path: string }> {
  const now = opts.now ?? new Date()
  const pursuitDir = resolvePursuitDir(repoRoot, opts.pursuit)
  if (!pursuitDir) {
    throw new Error(`pursuit not found: ${opts.pursuit}`)
  }
  const filePath = path.join(pursuitDir, 'projects', `${opts.id}.md`)
  if (existsSync(filePath)) {
    throw new Error(`project already exists: ${opts.pursuit}/${opts.id}`)
  }

  const cleanList = (xs: unknown): string[] =>
    Array.isArray(xs)
      ? xs.filter((x): x is string => typeof x === 'string' && x.length > 0)
      : []
  const dod = cleanList(opts.dod)
  const dodChecked = cleanList(opts.dod_checked)
  let actions = cleanList(opts.actions)
  const actionsChecked = cleanList(opts.actions_checked)

  if (actions.length + actionsChecked.length === 0) {
    actions = [DEFAULT_FIRST_ACTION]
  }

  const data: Record<string, unknown> = {
    id: opts.id,
    pursuit: opts.pursuit,
    status: opts.status ?? 'on_hold',
    created: opts.created ?? dateString(now),
  }
  if (opts.waiting_for && opts.waiting_for.length > 0) {
    data['waiting_for'] = opts.waiting_for.map((w) => ({
      person: w.person,
      what: w.what,
      expected: w.expected,
      flagged: w.flagged ?? false,
    }))
  }

  const title = opts.title ?? toTitleCase(opts.id)
  const sections: string[] = [`# ${title}`]
  if (opts.description) sections.push(opts.description)
  if (opts.intent && opts.intent.trim().length > 0) {
    sections.push('## Intent')
    sections.push(opts.intent.trim())
  }
  const dodLines = [
    ...dodChecked.map((d) => `- [x] ${d}`),
    ...dod.map((d) => `- [ ] ${d}`),
  ]
  if (dodLines.length > 0) {
    sections.push('## Definition of Done')
    sections.push(dodLines.join('\n'))
  }
  sections.push('## Actions')
  const actionLines = [
    ...actionsChecked.map((a) => `- [x] ${a}`),
    ...actions.map((a) => `- [ ] ${a}`),
  ]
  if (actionLines.length > 0) sections.push(actionLines.join('\n'))
  const body = sections.join('\n\n')

  await writeFrontmatterFile(filePath, data, body)
  return { path: path.relative(repoRoot, filePath) }
}

function toTitleCase(id: string): string {
  return id
    .split('-')
    .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}
