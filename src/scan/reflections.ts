import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import { parseFrontmatter } from '../parse/frontmatter.js'
import {
  type Reflection,
  ReflectionFrontmatterSchema,
} from '../types.js'

export async function scanReflections(
  repoRoot: string,
): Promise<Reflection[]> {
  const files = await fg('reflections/*.md', {
    cwd: repoRoot,
    absolute: true,
    onlyFiles: true,
  })
  const results: Reflection[] = []
  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const { data, content } = parseFrontmatter(raw)
    const fm = ReflectionFrontmatterSchema.parse(data)
    results.push({
      ...fm,
      body: content.trim(),
      path: path.relative(repoRoot, file),
    })
  }
  return results
}
