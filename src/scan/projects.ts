import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import { parseFrontmatter } from '../parse/frontmatter.js'
import { parseChecklist } from '../parse/checklist.js'
import {
  extractDescription,
  extractSections,
} from '../parse/sections.js'
import {
  type Project,
  type Thread,
  type WaitingFor,
  ProjectFrontmatterSchema,
} from '../types.js'
import { detectDomain } from './domain.js'
import { readResearchRef } from './research.js'

export async function scanProjects(repoRoot: string): Promise<Project[]> {
  const files = await fg('pursuits/*/projects/*.md', {
    cwd: repoRoot,
    absolute: true,
    onlyFiles: true,
    ignore: ['pursuits/_*/**'],
  })
  const results: Project[] = []
  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const { data, content } = parseFrontmatter(raw)
    const fm = ProjectFrontmatterSchema.parse(data)
    const sections = extractSections(content)
    const intent = (sections.get('intent') ?? '').trim()
    const dod = parseChecklist(sections.get('definition of done') ?? '')
    const actions = parseChecklist(sections.get('actions') ?? '')
    const detection = detectDomain(intent, fm.id)
    // Project-scoped substrate lives in a directory named after the
    // project file, sibling to it: projects/<id>/research/.
    const research = await readResearchRef(file.slice(0, -'.md'.length))
    results.push({
      ...fm,
      threads: resolveThreads(fm.threads, fm.waiting_for),
      intent,
      dod,
      actions,
      description: extractDescription(content),
      path: path.relative(repoRoot, file),
      dodProgress: progress(dod),
      actionProgress: progress(actions),
      detected_domain: detection.domain,
      effective_domain: fm.domain ?? detection.domain,
      ...(research ? { research } : {}),
    })
  }
  return results
}

function progress(items: { checked: boolean }[]) {
  return {
    done: items.filter((i) => i.checked).length,
    total: items.length,
  }
}

/**
 * The resolved thread view: explicit `threads:` entries plus legacy
 * `waiting_for` entries mapped to `kind: waiting`. Mapped threads get
 * ids `w<index>` so `thread-close` can still target them; closing one
 * removes the underlying waiting_for entry (src/write/edits.ts).
 */
export function resolveThreads(
  explicit: Thread[],
  waitingFor: WaitingFor[],
): Thread[] {
  const mapped: Thread[] = waitingFor.map((w, i) => ({
    id: `w${i}`,
    kind: 'waiting',
    text: `${w.person} re: ${w.what}`,
    // waiting_for carries no opened timestamp; the expected date is
    // the only clock it has. Age-based checks use `expected` for the
    // waiting kind anyway.
    opened: w.expected,
    by: 'human',
    status: 'open',
    person: w.person,
    expected: w.expected,
  }))
  return [...explicit, ...mapped]
}
