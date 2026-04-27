import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import { parseFrontmatter } from '../parse/frontmatter.js'
import { extractDescription } from '../parse/sections.js'
import {
  type Pursuit,
  PursuitFrontmatterSchema,
  PursuitLifecycleSchema,
} from '../types.js'

const LIFECYCLE_ROOTS = [
  { lifecycle: 'active' as const, glob: 'pursuits/*/pursuit.md' },
  { lifecycle: 'someday' as const, glob: 'pursuits/_someday/*/pursuit.md' },
  { lifecycle: 'archived' as const, glob: 'pursuits/_archived/*/pursuit.md' },
]

export async function scanPursuits(repoRoot: string): Promise<Pursuit[]> {
  const results: Pursuit[] = []
  for (const { lifecycle, glob } of LIFECYCLE_ROOTS) {
    const files = await fg(glob, {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
      // Active glob would otherwise also match _someday/.../pursuit.md;
      // exclude underscore-prefixed dirs from the active scan.
      ...(lifecycle === 'active'
        ? { ignore: ['pursuits/_*/**'] }
        : {}),
    })
    for (const file of files) {
      const raw = await readFile(file, 'utf8')
      const { data, content } = parseFrontmatter(raw)
      const fm = PursuitFrontmatterSchema.parse(data)
      results.push({
        ...fm,
        lifecycle: PursuitLifecycleSchema.parse(lifecycle),
        description: extractDescription(content),
        path: path.relative(repoRoot, file),
      })
    }
  }
  return results
}
