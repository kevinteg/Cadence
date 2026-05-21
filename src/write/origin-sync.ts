import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { Origin } from '../types.js'

const execFileP = promisify(execFile)

export type OriginSyncOutcome =
  | { kind: 'done' }
  | { kind: 'dropped'; reason: string }
  | { kind: 'started' }

export type OriginSyncResult =
  | {
      kind: 'closed'
      issue_number: number
      repo: string
      url: string
    }
  | {
      kind: 'already_closed'
      issue_number: number
      repo: string
      url: string
    }
  | {
      kind: 'started'
      issue_number: number
      repo: string
      url: string
    }
  | {
      kind: 'already_started'
      issue_number: number
      repo: string
      url: string
    }
  | { kind: 'no_origin' }
  | { kind: 'gh_unavailable' }
  | { kind: 'error'; message: string }

/**
 * Reconciles a project's origin with its lifecycle transition. Today
 * the only wired kind is `github_issue`:
 *
 * - `done` / `dropped` → close the linked issue with a comment naming
 *   the project + outcome
 * - `started` → swap `triaged-routed` → `in-progress` label and post a
 *   "work started" comment
 *
 * Idempotent across re-invocation: closing an already-closed issue
 * returns `already_closed`; starting an already-in-progress issue
 * returns `already_started`. No duplicate comments or labels.
 *
 * Gh-gated: missing or unauthed `gh` returns `gh_unavailable` so
 * callers can surface a one-line note without failing the underlying
 * state mutation.
 */
export async function syncOrigin(
  origin: Origin | undefined,
  outcome: OriginSyncOutcome,
  context: { projectId: string; pursuitId: string },
): Promise<OriginSyncResult> {
  if (!origin) return { kind: 'no_origin' }
  if (origin.kind !== 'github_issue') return { kind: 'no_origin' }

  const { repo, number, url } = origin

  if (outcome.kind === 'started') {
    return syncStarted(repo, number, url, context)
  }
  return syncClosed(repo, number, url, outcome, context)
}

async function syncClosed(
  repo: string,
  number: number,
  url: string,
  outcome: { kind: 'done' } | { kind: 'dropped'; reason: string },
  context: { projectId: string; pursuitId: string },
): Promise<OriginSyncResult> {
  const state = await ghIssueState(repo, number)
  if (state === 'gh_unavailable') return { kind: 'gh_unavailable' }
  if (state === 'error') {
    return { kind: 'error', message: 'gh issue view failed' }
  }
  if (state === 'CLOSED') {
    return { kind: 'already_closed', issue_number: number, repo, url }
  }

  const tag = `project \`${context.pursuitId}/${context.projectId}\``
  const comment =
    outcome.kind === 'done'
      ? `Closed by Cadence — ${tag} resolved as done.`
      : `Closed by Cadence — ${tag} was dropped. Reason: ${outcome.reason}`
  try {
    await execFileP(
      'gh',
      ['issue', 'close', String(number), '--repo', repo, '--comment', comment],
      { timeout: 8000 },
    )
    return { kind: 'closed', issue_number: number, repo, url }
  } catch (err) {
    return {
      kind: 'error',
      message: err instanceof Error ? err.message : String(err),
    }
  }
}

async function syncStarted(
  repo: string,
  number: number,
  url: string,
  context: { projectId: string; pursuitId: string },
): Promise<OriginSyncResult> {
  const meta = await ghIssueMeta(repo, number)
  if (meta === 'gh_unavailable') return { kind: 'gh_unavailable' }
  if (meta === 'error') {
    return { kind: 'error', message: 'gh issue view failed' }
  }

  const hasInProgress = meta.labels.includes('in-progress')
  if (hasInProgress) {
    return { kind: 'already_started', issue_number: number, repo, url }
  }

  const tag = `project \`${context.pursuitId}/${context.projectId}\``
  const comment = `Work started by Cadence on ${tag}.`
  try {
    const labelArgs: string[] = ['--add-label', 'in-progress']
    if (meta.labels.includes('triaged-routed')) {
      labelArgs.push('--remove-label', 'triaged-routed')
    }
    await execFileP(
      'gh',
      ['issue', 'edit', String(number), '--repo', repo, ...labelArgs],
      { timeout: 8000 },
    )
    await execFileP(
      'gh',
      ['issue', 'comment', String(number), '--repo', repo, '--body', comment],
      { timeout: 8000 },
    )
    return { kind: 'started', issue_number: number, repo, url }
  } catch (err) {
    return {
      kind: 'error',
      message: err instanceof Error ? err.message : String(err),
    }
  }
}

type GhState = 'OPEN' | 'CLOSED' | 'gh_unavailable' | 'error'

async function ghIssueState(repo: string, number: number): Promise<GhState> {
  try {
    const { stdout } = await execFileP(
      'gh',
      ['issue', 'view', String(number), '--repo', repo, '--json', 'state'],
      { timeout: 5000 },
    )
    const parsed = JSON.parse(stdout) as { state?: string }
    if (parsed.state === 'OPEN' || parsed.state === 'CLOSED') return parsed.state
    return 'error'
  } catch (err) {
    if (isGhMissing(err)) return 'gh_unavailable'
    return 'error'
  }
}

type GhIssueMeta = { state: 'OPEN' | 'CLOSED'; labels: string[] }

async function ghIssueMeta(
  repo: string,
  number: number,
): Promise<GhIssueMeta | 'gh_unavailable' | 'error'> {
  try {
    const { stdout } = await execFileP(
      'gh',
      [
        'issue',
        'view',
        String(number),
        '--repo',
        repo,
        '--json',
        'state,labels',
      ],
      { timeout: 5000 },
    )
    const parsed = JSON.parse(stdout) as {
      state?: string
      labels?: Array<{ name?: string }>
    }
    if (parsed.state !== 'OPEN' && parsed.state !== 'CLOSED') return 'error'
    const labels = (parsed.labels ?? [])
      .map((l) => l.name)
      .filter((n): n is string => typeof n === 'string')
    return { state: parsed.state, labels }
  } catch (err) {
    if (isGhMissing(err)) return 'gh_unavailable'
    return 'error'
  }
}

function isGhMissing(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return /ENOENT|not found.*gh|command not found/i.test(msg)
}
