import { existsSync, mkdirSync } from 'node:fs'
import { readFile, writeFile, appendFile } from 'node:fs/promises'
import path from 'node:path'
import type { Snapshot } from './types.js'
import { inboxItems } from './inbox.js'
import { computeStateHash } from './sessionstart.js'

const STATE_DIR = '.cadence'
const LAST_LOG_FILE = 'last_session_log.json'
const NARRATIVES_DIR = 'narratives'
const SESSION_LOG_FILE = 'session-log.md'

/**
 * Decides whether the Stop hook should append a session-log entry.
 * The contract: write a line when state has materially changed since
 * the last logged stop. No change → no entry. The hash is the same
 * SessionStart suppression hash — same definition of "material
 * change" across both surfaces.
 */
export async function shouldLogSession(
  repoRoot: string,
  currentHash: string,
): Promise<boolean> {
  const pointer = path.join(repoRoot, STATE_DIR, LAST_LOG_FILE)
  if (!existsSync(pointer)) return true
  try {
    const raw = await readFile(pointer, 'utf8')
    const parsed = JSON.parse(raw) as { hash?: string }
    if (!parsed.hash) return true
    return parsed.hash !== currentHash
  } catch {
    return true
  }
}

/**
 * Compose the one-line session-log entry. Shape:
 *   2026-05-21T14:23:45Z — pursuits:3 projects:5 (12/24 actions) inbox:4 brainstorms:1
 * Counts are derived from the snapshot — no narrative claim, no
 * editorial. Stop-hook entries are an audit trail, not prose.
 */
export function composeSessionLogLine(
  snapshot: Snapshot,
  now: Date = new Date(),
): string {
  const activePursuits = snapshot.pursuits.filter(
    (p) => p.lifecycle === 'active',
  ).length
  const activeProjects = snapshot.projects.filter(
    (p) => p.status === 'active',
  ).length
  let doneActions = 0
  let totalActions = 0
  for (const p of snapshot.projects) {
    if (p.status !== 'active') continue
    doneActions += p.actionProgress.done
    totalActions += p.actionProgress.total
  }
  const inbox = inboxItems(snapshot, now).counts.total
  const activeBrainstorms = snapshot.brainstorms.filter(
    (b) => b.phase === 'diverging' || b.phase === 'converging',
  ).length
  const ts = now.toISOString().replace(/\.\d{3}Z$/, 'Z')
  return `${ts} — pursuits:${activePursuits} projects:${activeProjects} (${doneActions}/${totalActions} actions) inbox:${inbox} brainstorms:${activeBrainstorms}`
}

/**
 * Append a session-log line and record the hash so a subsequent
 * unchanged Stop fires no-op. Lazy-creates `narratives/` — same
 * pattern as `thoughts/_raw/`.
 */
export async function appendSessionLog(
  repoRoot: string,
  line: string,
  currentHash: string,
  now: Date = new Date(),
): Promise<void> {
  const narrativesDir = path.join(repoRoot, NARRATIVES_DIR)
  if (!existsSync(narrativesDir)) mkdirSync(narrativesDir, { recursive: true })
  const logPath = path.join(narrativesDir, SESSION_LOG_FILE)
  await appendFile(logPath, line + '\n', 'utf8')

  const stateDir = path.join(repoRoot, STATE_DIR)
  if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true })
  const payload = JSON.stringify({
    timestamp: now.toISOString(),
    hash: currentHash,
  })
  await writeFile(
    path.join(stateDir, LAST_LOG_FILE),
    payload + '\n',
    'utf8',
  )
}

/**
 * The end-to-end Stop hook entry point. Returns true if a line was
 * appended, false if state was unchanged. Callers (the CLI) decide
 * what to emit on stdout — Stop hooks ignore stdout, so the return
 * is mostly for tests.
 */
export async function runStopHook(
  repoRoot: string,
  snapshot: Snapshot,
  now: Date = new Date(),
): Promise<{ logged: boolean; line: string | null }> {
  const hash = computeStateHash(snapshot)
  const should = await shouldLogSession(repoRoot, hash)
  if (!should) return { logged: false, line: null }
  const line = composeSessionLogLine(snapshot, now)
  await appendSessionLog(repoRoot, line, hash, now)
  return { logged: true, line }
}
