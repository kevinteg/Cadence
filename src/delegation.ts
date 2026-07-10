import { readFileSync } from 'node:fs'
import path from 'node:path'
import { discoverCheckout, normalizeGitUrl } from './publish.js'
import {
  entryByGitUrl,
  entryByName,
  entryPath,
  loadRegistry,
  type Registry,
} from './registry.js'
import { isCadenceRepo } from './root.js'
import { parseFrontmatter } from './parse/frontmatter.js'
import { resolvePursuitDir } from './write/paths.js'
import { inboxItems } from './inbox.js'
import type { Snapshot } from './types.js'

/**
 * Pursuit delegation — the hub/spoke seam.
 *
 * A hub pursuit with `delegated_to` is a stub: prioritization metadata
 * lives on the hub, execution lives in the delegate (spoke) repo.
 * Everything here is read-only from the hub side — resolution finds
 * the delegate checkout, summarization scans it. No function in this
 * module writes to a delegate repo, ever.
 */

export type DelegateResolution = {
  pursuit: string
  delegated_to: string
  /** Absolute path of the delegate checkout, or null when unresolved. */
  checkout: string | null
  /** How the checkout was found. */
  via: 'registry-name' | 'registry-git-url' | 'discovery' | null
  /** Registry entry name when resolution went through the registry. */
  registry_name?: string
  /** Directories scanned when discovery ran and missed. */
  searched?: string[]
}

/**
 * Peek a pursuit's `delegated_to` without a full repo scan — used by
 * write guards, where refusing must not cost a whole-snapshot read.
 * Returns undefined for missing pursuits or absent frontmatter.
 */
export function readDelegation(
  repoRoot: string,
  pursuitId: string,
): string | undefined {
  const dir = resolvePursuitDir(repoRoot, pursuitId)
  if (!dir) return undefined
  let raw: string
  try {
    raw = readFileSync(path.join(dir, 'pursuit.md'), 'utf8')
  } catch {
    return undefined
  }
  const { data } = parseFrontmatter(raw)
  const value = (data as Record<string, unknown>)['delegated_to']
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/**
 * Resolve `delegated_to` to a local checkout. Precedence: registry
 * name match → registry git-URL match → discovery (sibling-dir scan,
 * same mechanism as publish-resolve). Registry entries are hints —
 * a path that no longer looks like a Cadence repo is treated as a
 * miss so the caller can say why. The hub repo itself never matches.
 */
export function resolveDelegate(
  repoRoot: string,
  pursuitId: string,
  delegatedTo: string,
  registry?: Registry,
): DelegateResolution {
  const reg = registry ?? loadRegistry()
  const base = { pursuit: pursuitId, delegated_to: delegatedTo }

  const named = entryByName(reg, delegatedTo)
  if (named) {
    const p = entryPath(named)
    if (isCadenceRepo(p) && p !== path.resolve(repoRoot)) {
      return {
        ...base,
        checkout: p,
        via: 'registry-name',
        registry_name: named.name,
      }
    }
  }

  const looksLikeGitUrl =
    delegatedTo.includes('/') || delegatedTo.includes(':')
  if (!looksLikeGitUrl) {
    // A bare name that isn't in the registry has nowhere else to go.
    return { ...base, checkout: null, via: null }
  }

  const byUrl = entryByGitUrl(reg, delegatedTo)
  if (byUrl) {
    const p = entryPath(byUrl)
    if (isCadenceRepo(p) && p !== path.resolve(repoRoot)) {
      return {
        ...base,
        checkout: p,
        via: 'registry-git-url',
        registry_name: byUrl.name,
      }
    }
  }

  const discovered = discoverCheckout(repoRoot, {
    name: pursuitId,
    git_url: delegatedTo,
    discovery_hints: [],
  })
  if (discovered.checkout && isCadenceRepo(discovered.checkout)) {
    return { ...base, checkout: discovered.checkout, via: 'discovery' }
  }
  return {
    ...base,
    checkout: null,
    via: null,
    searched: discovered.searched,
  }
}

export type DelegateSummary = {
  active_projects: number
  on_hold_projects: number
  done_projects: number
  open_actions: number
  waiting_for: number
  inbox: number
  active_pursuits: string[]
}

/** Light reduction over a delegate snapshot for hub-side rendering. */
export function summarizeDelegateSnapshot(
  snapshot: Snapshot,
): DelegateSummary {
  const open = snapshot.projects.filter(
    (p) => p.status === 'active' || p.status === 'on_hold',
  )
  return {
    active_projects: snapshot.projects.filter((p) => p.status === 'active')
      .length,
    on_hold_projects: snapshot.projects.filter((p) => p.status === 'on_hold')
      .length,
    done_projects: snapshot.projects.filter(
      (p) => p.status === 'done' || p.status === 'dropped',
    ).length,
    open_actions: open.reduce(
      (n, p) => n + p.actions.filter((a) => !a.checked).length,
      0,
    ),
    waiting_for: open.reduce((n, p) => n + p.waiting_for.length, 0),
    inbox: inboxItems(snapshot).counts.total,
    active_pursuits: snapshot.pursuits
      .filter((p) => p.lifecycle === 'active')
      .map((p) => p.id),
  }
}

/** One-line human rendering of a delegate summary. */
export function renderDelegateSummaryLine(s: DelegateSummary): string {
  const parts = [
    `${s.active_projects} active / ${s.on_hold_projects} on-hold projects`,
    `${s.open_actions} open actions`,
  ]
  if (s.waiting_for > 0) parts.push(`${s.waiting_for} waiting-for`)
  if (s.inbox > 0) parts.push(`inbox ${s.inbox}`)
  return parts.join(', ')
}

/** Delegation identity match: does `checkout` claim `delegatedTo`? */
export function sameGitIdentity(a: string, b: string): boolean {
  return normalizeGitUrl(a) === normalizeGitUrl(b)
}
