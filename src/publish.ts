import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { PublishTarget } from './types.js'

/**
 * Normalize a git remote URL to a comparable identity string of the
 * form `host/owner/repo` — lowercased, with scheme, userinfo, and a
 * trailing `.git` stripped. Collapses the three equivalent spellings of
 * the same repo so checkout discovery can match a configured target
 * against whatever form a local clone happens to use:
 *
 *   git@github.com:org/repo.git
 *   https://github.com/org/repo.git
 *   ssh://git@github.com/org/repo
 *
 * all → `github.com/org/repo`.
 */
export function normalizeGitUrl(url: string): string {
  let s = url.trim()
  // scp-like syntax: user@host:owner/repo(.git)
  const scp = s.match(/^[^@/]+@([^:/]+):(.+)$/)
  if (scp) {
    s = `${scp[1]}/${scp[2]}`
  } else {
    s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '') // strip scheme://
    s = s.replace(/^[^@/]+@/, '') // strip userinfo@
  }
  s = s.replace(/\.git$/i, '')
  s = s.replace(/\/+$/, '')
  return s.toLowerCase()
}

/** Expand a leading `~` / `~/` to the user's home directory. */
export function expandHome(p: string): string {
  if (p === '~') return os.homedir()
  if (p.startsWith('~/') || p.startsWith('~\\')) {
    return path.join(os.homedir(), p.slice(2))
  }
  return p
}

/** All remote URLs configured in the git repo at `dir`, or [] if none / not a repo. */
function gitRemotes(dir: string): string[] {
  try {
    const out = execFileSync('git', ['-C', dir, 'remote', '-v'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const urls = new Set<string>()
    for (const line of out.split('\n')) {
      const m = line.match(/^\S+\s+(\S+)\s+\(/)
      if (m && m[1]) urls.add(m[1])
    }
    return [...urls]
  } catch {
    return []
  }
}

/** Whether the working tree at `dir` is clean. undefined when git can't be queried. */
function isClean(dir: string): boolean | undefined {
  try {
    const out = execFileSync('git', ['-C', dir, 'status', '--porcelain'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return out.trim().length === 0
  } catch {
    return undefined
  }
}

export type CheckoutResolution = {
  target: string
  git_url: string
  /** Normalized identity the discovery matched on. */
  normalized: string
  /** Absolute path to the matched local checkout, or null when none found. */
  checkout: string | null
  /** The remote URL that matched (verbatim, as the local clone spells it). */
  matched_remote?: string
  /** Working-tree cleanliness of the matched checkout. */
  clean?: boolean
  /** Directories that were scanned — surfaced so a miss can explain itself. */
  searched: string[]
}

/**
 * Discover a local checkout of `target.git_url` without ever binding a
 * hard-coded path. Scans, in priority order: any `extraSearchDirs`
 * (e.g. a path the user supplied after auto-discovery missed), then the
 * target's `discovery_hints`, then the cadence repo's sibling
 * directories. Each candidate that is itself a git repo — or whose
 * immediate children are — has its remotes normalized and compared to
 * the target. First match wins.
 *
 * Returns `checkout: null` when nothing matches, leaving the prompt-the-
 * user fallback to the caller (the /publish skill). The cadence repo
 * itself is always skipped.
 */
export function discoverCheckout(
  repoRoot: string,
  target: PublishTarget,
  extraSearchDirs: string[] = [],
): CheckoutResolution {
  const wanted = normalizeGitUrl(target.git_url)
  const resolvedRoot = path.resolve(repoRoot)

  const searchRoots: string[] = []
  for (const d of extraSearchDirs) searchRoots.push(path.resolve(expandHome(d)))
  for (const hint of target.discovery_hints ?? []) {
    searchRoots.push(path.resolve(expandHome(hint)))
  }
  searchRoots.push(path.dirname(resolvedRoot)) // siblings of the cadence repo

  // Candidate dirs: each search root itself (covers an exact checkout path
  // passed via extraSearchDirs) plus its immediate children, depth 1 only.
  const candidates = new Set<string>()
  const searched: string[] = []
  for (const root of searchRoots) {
    if (!existsSync(root)) continue
    searched.push(root)
    candidates.add(root)
    let children: string[] = []
    try {
      children = readdirSync(root)
    } catch {
      children = []
    }
    for (const name of children) candidates.add(path.join(root, name))
  }

  for (const dir of candidates) {
    let isDir = false
    try {
      isDir = statSync(dir).isDirectory()
    } catch {
      continue
    }
    if (!isDir) continue
    if (!existsSync(path.join(dir, '.git'))) continue
    if (path.resolve(dir) === resolvedRoot) continue // never the cadence repo
    for (const remote of gitRemotes(dir)) {
      if (normalizeGitUrl(remote) === wanted) {
        return {
          target: target.name,
          git_url: target.git_url,
          normalized: wanted,
          checkout: dir,
          matched_remote: remote,
          clean: isClean(dir),
          searched,
        }
      }
    }
  }

  return {
    target: target.name,
    git_url: target.git_url,
    normalized: wanted,
    checkout: null,
    searched,
  }
}
