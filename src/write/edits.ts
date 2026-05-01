import path from 'node:path'
import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import {
  appendChecklistItem,
  appendParagraphToSection,
  computeProjectProgress,
  toggleChecklistItem,
} from './checklist.js'
import type { Progress } from '../types.js'
import {
  dateString,
  isoTimestamp,
  mutateFrontmatter,
} from './util.js'
import {
  resolveIdeaFile,
  resolveProjectFile,
  resolvePursuitDir,
} from './paths.js'
import { parseFrontmatter } from '../parse/frontmatter.js'

export type SetProjectStatusOpts = {
  pursuit?: string
  id: string
  status: 'active' | 'on_hold' | 'done' | 'dropped'
  reason?: string
  include_pursuit?: boolean
  now?: Date
}

export type PursuitSummary = {
  id: string
  projects: Array<{
    id: string
    status: 'active' | 'on_hold' | 'done' | 'dropped'
  }>
  done: number
  total: number
  allResolved: boolean
}

export type SetProjectStatusResult = {
  path: string
  pursuit?: PursuitSummary
}

export async function setProjectStatus(
  repoRoot: string,
  opts: SetProjectStatusOpts,
): Promise<SetProjectStatusResult> {
  const filePath = await locateProject(repoRoot, opts.id, opts.pursuit)
  const now = opts.now ?? new Date()
  await mutateFrontmatter(filePath, (data, body) => {
    data['status'] = opts.status
    if (opts.status === 'dropped') {
      if (!opts.reason) {
        throw new Error('dropping a project requires a reason')
      }
      data['dropped_reason'] = opts.reason
      data['dropped_at'] = isoTimestamp(now)
    }
    return { data, body }
  })
  const result: SetProjectStatusResult = {
    path: path.relative(repoRoot, filePath),
  }
  if (opts.include_pursuit) {
    result.pursuit = await summarizePursuit(repoRoot, filePath)
  }
  return result
}

async function summarizePursuit(
  repoRoot: string,
  projectFilePath: string,
): Promise<PursuitSummary> {
  // The pursuit dir is two levels up from the project file: pursuits/<id>/projects/<file>.md
  const projectsDir = path.dirname(projectFilePath)
  const pursuitDir = path.dirname(projectsDir)
  const pursuitId = path.basename(pursuitDir)
  const projects: PursuitSummary['projects'] = []
  if (existsSync(projectsDir)) {
    for (const entry of await readdir(projectsDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue
      const file = path.join(projectsDir, entry.name)
      const text = await readFile(file, 'utf8')
      const { data } = parseFrontmatter(text)
      const id = String(data['id'] ?? entry.name.replace(/\.md$/, ''))
      const status = String(data['status'] ?? 'active') as
        | 'active'
        | 'on_hold'
        | 'done'
        | 'dropped'
      projects.push({ id, status })
    }
  }
  const done = projects.filter(
    (p) => p.status === 'done' || p.status === 'dropped',
  ).length
  const total = projects.length
  void repoRoot
  return {
    id: pursuitId,
    projects,
    done,
    total,
    allResolved: total > 0 && done === total,
  }
}

export type SetIdeaStateOpts = {
  parent?: string
  id: string
  state: 'seed' | 'developed' | 'promoted' | 'moved' | 'closed'
  reason?: string
  promoted_to?: string
  new_parent?: string
  now?: Date
}

export async function setIdeaState(
  repoRoot: string,
  opts: SetIdeaStateOpts,
): Promise<{ path: string }> {
  const filePath = await locateIdea(repoRoot, opts.id, opts.parent)
  const now = opts.now ?? new Date()
  await mutateFrontmatter(filePath, (data, body) => {
    data['state'] = opts.state
    if (opts.state === 'developed') {
      if (!data['developed_at']) data['developed_at'] = dateString(now)
    } else if (opts.state === 'promoted') {
      if (!opts.promoted_to) {
        throw new Error('promoting an idea requires --promoted-to')
      }
      data['promoted_to'] = opts.promoted_to
    } else if (opts.state === 'closed') {
      if (!opts.reason) {
        throw new Error('closing an idea requires a reason')
      }
      data['closed_reason'] = opts.reason
    } else if (opts.state === 'moved') {
      if (opts.new_parent) data['parent'] = opts.new_parent
    }
    return { data, body }
  })
  return { path: path.relative(repoRoot, filePath) }
}

export type CheckItemOpts = {
  pursuit?: string
  project: string
  section: 'dod' | 'action'
  match: string | number
  checked?: boolean
  note?: string
}

export type CheckItemResult = {
  path: string
  matched: string
  promoted?: boolean
  dodProgress: Progress
  actionProgress: Progress
}

export async function checkItem(
  repoRoot: string,
  opts: CheckItemOpts,
): Promise<CheckItemResult> {
  const filePath = await locateProject(repoRoot, opts.project, opts.pursuit)
  const checked = opts.checked ?? true
  const sectionName =
    opts.section === 'dod' ? 'Definition of Done' : 'Actions'
  let matched = ''
  let promoted = false
  let finalBody = ''
  await mutateFrontmatter(filePath, (data, body) => {
    const result = toggleChecklistItem(body, sectionName, opts.match, checked)
    matched = result.matched
    let nextBody = result.body
    if (opts.note && checked) {
      nextBody = appendNote(nextBody, sectionName, matched, opts.note)
    }
    if (
      opts.section === 'action' &&
      checked &&
      data['status'] === 'on_hold'
    ) {
      data['status'] = 'active'
      promoted = true
    }
    finalBody = nextBody
    return { data, body: nextBody }
  })
  const progress = computeProjectProgress(finalBody)
  return {
    path: path.relative(repoRoot, filePath),
    matched,
    ...(promoted ? { promoted: true } : {}),
    ...progress,
  }
}

export type CheckItemsOpts = {
  pursuit?: string
  project: string
  section: 'dod' | 'action'
  matches: Array<string | number>
  checked?: boolean
}

export type CheckItemsResult = {
  path: string
  matched: string[]
  promoted?: boolean
  dodProgress: Progress
  actionProgress: Progress
}

export async function checkItems(
  repoRoot: string,
  opts: CheckItemsOpts,
): Promise<CheckItemsResult> {
  const filePath = await locateProject(repoRoot, opts.project, opts.pursuit)
  const checked = opts.checked ?? true
  const sectionName =
    opts.section === 'dod' ? 'Definition of Done' : 'Actions'
  const matched: string[] = []
  let promoted = false
  let finalBody = ''
  await mutateFrontmatter(filePath, (data, body) => {
    let nextBody = body
    for (const match of opts.matches) {
      const result = toggleChecklistItem(nextBody, sectionName, match, checked)
      matched.push(result.matched)
      nextBody = result.body
    }
    if (
      opts.section === 'action' &&
      checked &&
      data['status'] === 'on_hold' &&
      opts.matches.length > 0
    ) {
      data['status'] = 'active'
      promoted = true
    }
    finalBody = nextBody
    return { data, body: nextBody }
  })
  const progress = computeProjectProgress(finalBody)
  return {
    path: path.relative(repoRoot, filePath),
    matched,
    ...(promoted ? { promoted: true } : {}),
    ...progress,
  }
}

export type AddItemOpts = {
  pursuit?: string
  project: string
  section: 'dod' | 'action' | 'notes'
  text: string
  checked?: boolean
}

export type AddItemResult = {
  path: string
  dodProgress: Progress
  actionProgress: Progress
}

export async function addItem(
  repoRoot: string,
  opts: AddItemOpts,
): Promise<AddItemResult> {
  const filePath = await locateProject(repoRoot, opts.project, opts.pursuit)
  const sectionName =
    opts.section === 'dod' ? 'Definition of Done'
    : opts.section === 'action' ? 'Actions'
    : 'Notes'
  let finalBody = ''
  await mutateFrontmatter(filePath, (data, body) => {
    const nextBody =
      opts.section === 'notes'
        ? appendParagraphToSection(body, sectionName, opts.text)
        : appendChecklistItem(body, sectionName, opts.text, opts.checked ?? false)
    finalBody = nextBody
    return { data, body: nextBody }
  })
  const progress = computeProjectProgress(finalBody)
  return {
    path: path.relative(repoRoot, filePath),
    ...progress,
  }
}

export type AddItemsOpts = {
  pursuit?: string
  project: string
  section: 'dod' | 'action' | 'notes'
  texts: string[]
  checked?: boolean
}

export type AddItemsResult = {
  path: string
  added: number
  dodProgress: Progress
  actionProgress: Progress
}

export async function addItems(
  repoRoot: string,
  opts: AddItemsOpts,
): Promise<AddItemsResult> {
  const filePath = await locateProject(repoRoot, opts.project, opts.pursuit)
  const sectionName =
    opts.section === 'dod' ? 'Definition of Done'
    : opts.section === 'action' ? 'Actions'
    : 'Notes'
  let finalBody = ''
  await mutateFrontmatter(filePath, (data, body) => {
    let nextBody = body
    for (const text of opts.texts) {
      nextBody =
        opts.section === 'notes'
          ? appendParagraphToSection(nextBody, sectionName, text)
          : appendChecklistItem(
              nextBody,
              sectionName,
              text,
              opts.checked ?? false,
            )
    }
    finalBody = nextBody
    return { data, body: nextBody }
  })
  const progress = computeProjectProgress(finalBody)
  return {
    path: path.relative(repoRoot, filePath),
    added: opts.texts.length,
    ...progress,
  }
}

export type AddWaitingForOpts = {
  pursuit?: string
  project: string
  person: string
  what: string
  expected: string
}

export async function addWaitingFor(
  repoRoot: string,
  opts: AddWaitingForOpts,
): Promise<{ path: string }> {
  const filePath = await locateProject(repoRoot, opts.project, opts.pursuit)
  await mutateFrontmatter(filePath, (data, body) => {
    const list = Array.isArray(data['waiting_for'])
      ? [...(data['waiting_for'] as unknown[])]
      : []
    list.push({
      person: opts.person,
      what: opts.what,
      expected: opts.expected,
      flagged: false,
    })
    data['waiting_for'] = list
    return { data, body }
  })
  return { path: path.relative(repoRoot, filePath) }
}

export type FlagWaitingForOpts = {
  pursuit?: string
  project: string
  match: string | number
  flagged?: boolean
}

export async function flagWaitingFor(
  repoRoot: string,
  opts: FlagWaitingForOpts,
): Promise<{ path: string; matched: { person: string; what: string } }> {
  const filePath = await locateProject(repoRoot, opts.project, opts.pursuit)
  const flagged = opts.flagged ?? true
  let matched = { person: '', what: '' }
  await mutateFrontmatter(filePath, (data, body) => {
    const list = Array.isArray(data['waiting_for'])
      ? ([...(data['waiting_for'] as unknown[])] as Array<
          Record<string, unknown>
        >)
      : []
    let foundIndex = -1
    if (typeof opts.match === 'number') {
      foundIndex = opts.match
    } else {
      const lower = opts.match.toLowerCase()
      foundIndex = list.findIndex((w) => {
        const person = String(w['person'] ?? '').toLowerCase()
        const what = String(w['what'] ?? '').toLowerCase()
        return person.includes(lower) || what.includes(lower)
      })
    }
    if (foundIndex < 0 || foundIndex >= list.length) {
      throw new Error(`no waiting_for matched "${opts.match}"`)
    }
    const item = list[foundIndex] ?? {}
    item['flagged'] = flagged
    list[foundIndex] = item
    matched = {
      person: String(item['person'] ?? ''),
      what: String(item['what'] ?? ''),
    }
    data['waiting_for'] = list
    return { data, body }
  })
  return { path: path.relative(repoRoot, filePath), matched }
}

async function locateProject(
  repoRoot: string,
  projectId: string,
  pursuitHint?: string,
): Promise<string> {
  if (pursuitHint) {
    const file = resolveProjectFile(repoRoot, pursuitHint, projectId)
    if (!file) {
      throw new Error(`project not found: ${pursuitHint}/${projectId}`)
    }
    return file
  }
  // Search across active+someday+archived for any project with this id.
  const roots = ['pursuits', 'pursuits/_someday', 'pursuits/_archived']
  for (const root of roots) {
    const absRoot = path.join(repoRoot, root)
    if (!existsSync(absRoot)) continue
    for (const pursuit of await readdir(absRoot, { withFileTypes: true })) {
      if (!pursuit.isDirectory()) continue
      const candidate = path.join(
        absRoot,
        pursuit.name,
        'projects',
        `${projectId}.md`,
      )
      if (existsSync(candidate)) return candidate
    }
  }
  throw new Error(
    `project not found: ${projectId} (pass --pursuit to disambiguate)`,
  )
}

async function locateIdea(
  repoRoot: string,
  ideaId: string,
  parentHint?: string,
): Promise<string> {
  if (parentHint) {
    const file = resolveIdeaFile(repoRoot, parentHint, ideaId)
    if (!file) throw new Error(`idea not found: ${parentHint}/${ideaId}`)
    return file
  }
  // Search any pursuit's ideas dir.
  const roots = ['pursuits', 'pursuits/_someday', 'pursuits/_archived']
  for (const root of roots) {
    const absRoot = path.join(repoRoot, root)
    if (!existsSync(absRoot)) continue
    for (const pursuit of await readdir(absRoot, { withFileTypes: true })) {
      if (!pursuit.isDirectory()) continue
      const candidate = path.join(
        absRoot,
        pursuit.name,
        'ideas',
        `${ideaId}.md`,
      )
      if (existsSync(candidate)) return candidate
    }
  }
  throw new Error(
    `idea not found: ${ideaId} (pass --parent to disambiguate)`,
  )
}

function appendNote(
  body: string,
  sectionName: string,
  itemText: string,
  note: string,
): string {
  const lines = body.split('\n')
  const sectionRe = new RegExp(`^##\\s+${escapeRe(sectionName)}\\s*$`, 'i')
  let inSection = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (sectionRe.test(line)) {
      inSection = true
      continue
    }
    if (inSection && /^##\s+/.test(line)) inSection = false
    if (!inSection) continue
    if (line.includes(itemText)) {
      const indent = (/^(\s*)/.exec(line)?.[1] ?? '') + '  '
      lines.splice(i + 1, 0, `${indent}- ${note}`)
      return lines.join('\n')
    }
  }
  return body
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Re-export readFile for the move module (avoids a bare import there).
export { readFile, parseFrontmatter }
