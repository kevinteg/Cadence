import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import { parseFrontmatter } from '../parse/frontmatter.js'
import type { LessonsWatermark } from '../types.js'

/**
 * Finds the most recent lessons narrative (`lessons-YYYY-MM-DD.md`) and
 * returns its set-watermark. Latest wins by the date embedded in the
 * filename (lexicographic on the basename works for ISO dates).
 */
export async function scanLessonsWatermark(
  repoRoot: string,
): Promise<LessonsWatermark | null> {
  const files = await fg(['wiki/drafts/lessons-*.md'], {
    cwd: repoRoot,
    absolute: true,
    onlyFiles: true,
  })
  if (files.length === 0) return null
  const latest = files
    .map((f) => ({ file: f, base: path.basename(f) }))
    .sort((a, b) => (a.base < b.base ? 1 : -1))[0]!
  let raw: string
  try {
    raw = await readFile(latest.file, 'utf8')
  } catch {
    return null
  }
  const { data } = parseFrontmatter(raw)
  const consulted = (data as Record<string, unknown>)['pursuits_consulted']
  return {
    path: path.relative(repoRoot, latest.file),
    pursuits_consulted: Array.isArray(consulted)
      ? consulted.map((x) => String(x))
      : [],
  }
}
