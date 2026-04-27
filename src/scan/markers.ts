import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import { parseFrontmatter } from '../parse/frontmatter.js'
import { extractSections } from '../parse/sections.js'
import { type Marker, MarkerFrontmatterSchema } from '../types.js'

export async function scanMarkers(repoRoot: string): Promise<Marker[]> {
  const files = await fg('pursuits/**/sessions/*.md', {
    cwd: repoRoot,
    absolute: true,
    onlyFiles: true,
  })
  const results: Marker[] = []
  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const { data, content } = parseFrontmatter(raw)
    const fm = MarkerFrontmatterSchema.parse(data)
    const sections = extractSections(content)
    const filename = path.basename(file, '.md')
    results.push({
      ...fm,
      where: sections.get('where') ?? '',
      next: sections.get('next') ?? '',
      open: sections.get('open') ?? '',
      path: path.relative(repoRoot, file),
      timestamp: fm.session_start || filenameToIso(filename),
    })
  }
  return results
}

function filenameToIso(name: string): string {
  // 2026-04-21T13-00 → 2026-04-21T13:00:00
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})$/.exec(name)
  if (!m) return name
  return `${m[1]}T${m[2]}:${m[3]}:00`
}
