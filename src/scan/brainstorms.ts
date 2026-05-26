import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import yaml from 'js-yaml'
import { type Brainstorm, BrainstormMetaSchema } from '../types.js'

/**
 * Scans `brainstorms/<slug>/meta.yaml` files at the repo root.
 * The top-level `brainstorms/` directory is created lazily on first
 * `/cadence:brainstorm <topic>`; absence is the steady-state of a
 * fresh repo and returns [].
 *
 * Malformed meta.yaml files are skipped silently — a single broken
 * workspace shouldn't poison the scan. Real callers (the CLI flags +
 * resolve closure block) iterate the returned list directly.
 */
export async function scanBrainstorms(
  repoRoot: string,
): Promise<Brainstorm[]> {
  const root = path.join(repoRoot, 'brainstorms')
  if (!existsSync(root)) return []
  const out: Brainstorm[] = []
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const metaPath = path.join(root, entry.name, 'meta.yaml')
    if (!existsSync(metaPath)) continue
    let raw: unknown
    try {
      const text = await readFile(metaPath, 'utf8')
      raw = yaml.load(text, { schema: yaml.CORE_SCHEMA })
    } catch {
      continue
    }
    const parsed = BrainstormMetaSchema.safeParse(raw)
    if (!parsed.success) continue
    out.push({
      ...parsed.data,
      path: path.relative(repoRoot, path.join(root, entry.name)),
    })
  }
  return out
}
