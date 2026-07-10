import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

/**
 * Root-marker predicates shared by the CLI's repo-root resolution and
 * the per-machine registry.
 *
 * `cadence.yaml` is the authoritative marker (/cadence:init always
 * writes one). A `pursuits/` directory counts only when it actually
 * contains pursuit files — a bare, unrelated `pursuits/` folder
 * (e.g. ~/pursuits) must not hijack resolution for everything
 * beneath it.
 */
function pursuitsDirHasContent(root: string): boolean {
  const pursuits = path.join(root, 'pursuits')
  let children: string[]
  try {
    children = readdirSync(pursuits)
  } catch {
    return false
  }
  for (const child of children) {
    if (existsSync(path.join(pursuits, child, 'pursuit.md'))) return true
    // Lifecycle dirs (_someday, _archived, _dropped) nest one deeper.
    if (child.startsWith('_')) {
      let sub: string[]
      try {
        sub = readdirSync(path.join(pursuits, child))
      } catch {
        continue
      }
      for (const s of sub) {
        if (existsSync(path.join(pursuits, child, s, 'pursuit.md'))) {
          return true
        }
      }
    }
  }
  return false
}

export function isCadenceRepo(root: string): boolean {
  return (
    existsSync(path.join(root, 'cadence.yaml')) || pursuitsDirHasContent(root)
  )
}

/**
 * Walk up from `start` looking for a Cadence repo root. Returns null
 * when the walk reaches the filesystem root without a match — there is
 * deliberately NO fallback to the starting directory. Falling back to
 * CWD let write commands scaffold partial cadence structure into
 * arbitrary directories (and a single stray `pursuits/` dir then
 * self-promoted that directory into a detected repo).
 */
export function findRepoRoot(start: string): string | null {
  let dir = path.resolve(start)
  for (;;) {
    if (isCadenceRepo(dir)) return dir
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}
