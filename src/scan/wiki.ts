import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import { parseFrontmatter } from '../parse/frontmatter.js'
import type { WikiArtifact } from '../types.js'

/**
 * Recursively discover curated wiki artifacts under `wiki/**`, keyed on
 * wiki-shaped frontmatter (a `title`) rather than a hardcoded tier list.
 * Covers every tier plus arbitrary user-created shelves
 * (`wiki/code-deep-dives/`) and nested subfolders (`wiki/living/1-1s/`).
 * Skips the `_archive/` provenance tier and any file without a `title`
 * (index.md, log.md, frontmatter-less notes). Tolerant: unreadable or
 * malformed files are skipped silently — a hand-authored doc mid-edit
 * must never break the snapshot.
 */
export async function scanWikiArtifacts(
  repoRoot: string,
): Promise<WikiArtifact[]> {
  const files = await fg('wiki/**/*.md', {
    cwd: repoRoot,
    absolute: true,
    onlyFiles: true,
    ignore: ['wiki/_archive/**'],
  })
  const results: WikiArtifact[] = []
  for (const file of files) {
    let raw: string
    try {
      raw = await readFile(file, 'utf8')
    } catch {
      continue
    }
    const { data, content } = parseFrontmatter(raw)
    // Wiki-shaped = carries a title. This is the signal that separates a
    // curated artifact (capstone, primer, living doc, user-shelf page)
    // from navigation/log files (index.md, log.md) and frontmatter-less
    // drafts — without enumerating tiers.
    const title = typeof data.title === 'string' ? data.title : undefined
    if (!title) continue

    const rel = path.relative(repoRoot, file)
    const parts = rel.split(path.sep)
    // parts[0] === 'wiki'; the tier is the next segment when the file is
    // nested in a folder, '' when it sits directly under wiki/.
    const tier = parts.length > 2 ? (parts[1] ?? '') : ''

    results.push({
      slug: path.basename(file, '.md'),
      tier,
      type: typeof data.type === 'string' ? data.type : 'doc',
      title,
      tags: Array.isArray(data.tags)
        ? data.tags.filter((t): t is string => typeof t === 'string')
        : [],
      anchors: Array.isArray(data.anchors)
        ? data.anchors.filter((a): a is string => typeof a === 'string')
        : [],
      ...(typeof data.created === 'string' ? { created: data.created } : {}),
      body: content.trim(),
      path: rel,
    })
  }
  return results
}
