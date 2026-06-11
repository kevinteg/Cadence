import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { parseFrontmatter } from '../parse/frontmatter.js'
import type { ResearchRef } from '../types.js'

/**
 * Reads the research-substrate index at `<unitDir>/research/index.md`
 * and returns its lifecycle ref, or undefined when the unit has no
 * substrate. `unitDir` is the unit's directory: the pursuit dir for
 * pursuit scope, or `projects/<id>` (the project file path minus
 * `.md`) for project scope.
 */
export async function readResearchRef(
  unitDir: string,
): Promise<ResearchRef | undefined> {
  const indexPath = path.join(unitDir, 'research', 'index.md')
  let raw: string
  try {
    raw = await readFile(indexPath, 'utf8')
  } catch {
    return undefined
  }
  const { data } = parseFrontmatter(raw)
  const sources = Number((data as Record<string, unknown>)['sources'] ?? 0)
  const status = String(
    (data as Record<string, unknown>)['status'] ?? 'researching',
  )
  return { sources: Number.isFinite(sources) ? sources : 0, status }
}
