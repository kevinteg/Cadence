import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import { parseFrontmatter } from '../parse/frontmatter.js'
import { type Idea, IdeaFrontmatterSchema } from '../types.js'
import { daysBetween } from '../util/dates.js'

export async function scanIdeas(
  repoRoot: string,
  now: Date,
): Promise<Idea[]> {
  const files = await fg('pursuits/**/ideas/*.md', {
    cwd: repoRoot,
    absolute: true,
    onlyFiles: true,
  })
  const results: Idea[] = []
  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const { data, content } = parseFrontmatter(raw)
    const fm = IdeaFrontmatterSchema.parse(data)
    results.push({
      ...fm,
      body: content.trim(),
      path: path.relative(repoRoot, file),
      ageDays: daysBetween(fm.created, now),
    })
  }
  return results
}
