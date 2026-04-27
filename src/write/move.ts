import path from 'node:path'
import { existsSync } from 'node:fs'
import { mutateFrontmatter, moveDir } from './util.js'
import { resolvePursuitDir } from './paths.js'

export type MovePursuitOpts = {
  id: string
  to: 'active' | 'someday' | 'archived'
}

export async function movePursuit(
  repoRoot: string,
  opts: MovePursuitOpts,
): Promise<{ from: string; to: string }> {
  const from = resolvePursuitDir(repoRoot, opts.id)
  if (!from) throw new Error(`pursuit not found: ${opts.id}`)

  const targetParent =
    opts.to === 'active'
      ? path.join(repoRoot, 'pursuits')
      : opts.to === 'someday'
        ? path.join(repoRoot, 'pursuits/_someday')
        : path.join(repoRoot, 'pursuits/_archived')
  const to = path.join(targetParent, opts.id)

  if (path.resolve(from) === path.resolve(to)) {
    return {
      from: path.relative(repoRoot, from),
      to: path.relative(repoRoot, to),
    }
  }
  if (existsSync(to)) {
    throw new Error(`destination already exists: ${path.relative(repoRoot, to)}`)
  }

  await moveDir(from, to)
  // Update frontmatter status to match new lifecycle.
  await mutateFrontmatter(path.join(to, 'pursuit.md'), (data, body) => {
    data['status'] = opts.to
    return { data, body }
  })
  return {
    from: path.relative(repoRoot, from),
    to: path.relative(repoRoot, to),
  }
}
