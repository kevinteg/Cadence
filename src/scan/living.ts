import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import { parseFrontmatter } from '../parse/frontmatter.js'
import { type LivingDoc, LivingDocFrontmatterSchema } from '../types.js'

/**
 * Scans the wiki living-docs tier (`wiki/living/*.md`). Tolerant by
 * design: files without `type: living-doc` or with malformed
 * frontmatter are skipped silently — a hand-authored doc mid-edit
 * must never break the snapshot.
 */
/** Docs anchored to a specific project (`project:<pursuit>/<id>`). */
export function docsAnchoredToProject(
  docs: LivingDoc[],
  pursuitId: string,
  projectId: string,
): LivingDoc[] {
  const anchor = `project:${pursuitId}/${projectId}`
  return docs.filter((d) => d.anchors.includes(anchor))
}

/**
 * Docs anchored to a pursuit — directly (`pursuit:<id>`) or through
 * any of its projects (`project:<id>/...`). The pursuit's doc shelf.
 */
export function docsAnchoredToPursuit(
  docs: LivingDoc[],
  pursuitId: string,
): LivingDoc[] {
  const direct = `pursuit:${pursuitId}`
  const projectPrefix = `project:${pursuitId}/`
  return docs.filter((d) =>
    d.anchors.some((a) => a === direct || a.startsWith(projectPrefix)),
  )
}

export async function scanLivingDocs(repoRoot: string): Promise<LivingDoc[]> {
  const files = await fg('wiki/living/*.md', {
    cwd: repoRoot,
    absolute: true,
    onlyFiles: true,
  })
  const results: LivingDoc[] = []
  for (const file of files) {
    let raw: string
    try {
      raw = await readFile(file, 'utf8')
    } catch {
      continue
    }
    const { data, content } = parseFrontmatter(raw)
    const parsed = LivingDocFrontmatterSchema.safeParse(data)
    if (!parsed.success) continue
    results.push({
      ...parsed.data,
      slug: path.basename(file, '.md'),
      body: content.trim(),
      path: path.relative(repoRoot, file),
    })
  }
  return results
}
