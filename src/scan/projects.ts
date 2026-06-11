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
