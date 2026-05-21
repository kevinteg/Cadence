import { execFile } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileP = promisify(execFile)

const CACHE_PATH_SEGMENTS = ['.cadence', 'inbound-cache.json']

type CacheFile = {
  owner_repo: string
  count: number
  ts: string // ISO timestamp of fetch
}

export type InboundResult = {
  count: number
  fromCache: boolean
  ts: string
}

/**
 * Returns the count of open issues on `ownerRepo` that bear neither
 * the `triaged-routed` nor the `triaged-deferred` label. Cached at
 * `.cadence/inbound-cache.json` for `ttlMinutes`. Returns null when
 * `gh` is unavailable, unauthenticated, or fails for any other reason
 * — callers treat this as "skip the check, no flag, no error."
 *
 * Network shell-out is `gh issue list --json number`. The cache file
 * is gitignored under `.cadence/`.
 */
export async function getInboundCount(
  repoRoot: string,
  ownerRepo: string,
  ttlMinutes: number,
  opts: { force?: boolean } = {},
): Promise<InboundResult | null> {
  if (!opts.force) {
    const cached = await readCache(repoRoot, ownerRepo)
    if (cached && isFresh(cached.ts, ttlMinutes)) {
      return { count: cached.count, fromCache: true, ts: cached.ts }
    }
  }
  const fetched = await fetchInboundCount(ownerRepo)
  if (fetched === null) return null
  const ts = new Date().toISOString()
  await writeCache(repoRoot, { owner_repo: ownerRepo, count: fetched, ts })
  return { count: fetched, fromCache: false, ts }
}

async function fetchInboundCount(ownerRepo: string): Promise<number | null> {
  try {
    const { stdout } = await execFileP(
      'gh',
      [
        'issue',
        'list',
        '--repo',
        ownerRepo,
        '--state',
        'open',
        '--search',
        '-label:triaged-routed -label:triaged-deferred',
        '--json',
        'number',
        '--limit',
        '200',
      ],
      { timeout: 5000 },
    )
    const issues = JSON.parse(stdout) as Array<{ number: number }>
    return issues.length
  } catch {
    // gh missing, unauthed, network failure, rate-limited, repo not
    // found — all treated as "skip the check."
    return null
  }
}

async function readCache(
  repoRoot: string,
  ownerRepo: string,
): Promise<CacheFile | null> {
  const filePath = path.join(repoRoot, ...CACHE_PATH_SEGMENTS)
  if (!existsSync(filePath)) return null
  try {
    const raw = await readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as CacheFile
    if (parsed.owner_repo !== ownerRepo) return null
    return parsed
  } catch {
    return null
  }
}

async function writeCache(repoRoot: string, data: CacheFile): Promise<void> {
  const dir = path.join(repoRoot, '.cadence')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const filePath = path.join(dir, 'inbound-cache.json')
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function isFresh(ts: string, ttlMinutes: number): boolean {
  const age = Date.now() - new Date(ts).getTime()
  return age >= 0 && age < ttlMinutes * 60_000
}
