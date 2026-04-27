import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import { parseFrontmatter } from '../parse/frontmatter.js'
import { type Capture, CaptureFrontmatterSchema } from '../types.js'

export async function scanCaptures(repoRoot: string): Promise<Capture[]> {
  const files = await fg('thoughts/unprocessed/*.md', {
    cwd: repoRoot,
    absolute: true,
    onlyFiles: true,
  })
  const results: Capture[] = []
  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const { data, content } = parseFrontmatter(raw)
    const fm = CaptureFrontmatterSchema.parse(data)
    results.push({
      ...fm,
      body: content.trim(),
      path: path.relative(repoRoot, file),
    })
  }
  return results
}
