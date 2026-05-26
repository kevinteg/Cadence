import type { Flag, Project, Reflection, Snapshot } from '../types.js'
import { inboxItems } from '../inbox.js'
import type { SuggestionSignals } from './signals.js'

/**
 * A single "Likely next move" surfacing — a verb invocation tied to a
 * one-line rationale. The render layer formats the verb + target as a
 * code-styled call (`/cadence:start <id>`); the rationale renders as
 * prose.
 *
 * Why this shape rather than free-form strings? The dashboard ranks
 * across heterogeneous signals (LP alignment, recency, structural
 * urgency, parking-lot pressure, routine). Keeping the {verb, target,
 * rationale} triple lets each signal contribute its own rationale
 * without the renderer having to parse strings back apart.
 */
export type NextMove = {
  verb: string
  target?: string
  rationale: string
}

const MAX_MOVES = 3

/**
 * Compute up to 3 priority-ranked next moves. Inputs (in priority
 * order): LP alignment → recency → structural urgency → parking-lot
 * pressure → routine surfaces.
 *
 * Deterministic and pure — no LLM, no I/O. Used by the dashboard
 * renderer (which feeds both the bare CLI and the SessionStart hook),
 * so the suggestions stay consistent across surfaces.
 */
export function curateNextMoves(
  snapshot: Snapshot,
  flags: Flag[],
  signals: SuggestionSignals,
): NextMove[] {
  const moves: NextMove[] = []
  const seen = new Set<string>()
  const add = (m: NextMove) => {
    const key = `${m.verb}:${m.target ?? ''}`
    if (seen.has(key)) return
    if (moves.length >= MAX_MOVES) return
    seen.add(key)
    moves.push(m)
  }

  const activePursuitIds = new Set(
    snapshot.pursuits.filter((p) => p.lifecycle === 'active').map((p) => p.id),
  )
  const projectsInActive = snapshot.projects.filter((p) =>
    activePursuitIds.has(p.pursuit),
  )
  const lp = extractLeveragedPriority(snapshot.reflections)

  // 1. LP alignment — which active project most plausibly moves the LP?
  if (lp) {
    const aligned = findLpAlignedProject(lp, projectsInActive)
    if (aligned) {
      add({
        verb: '/cadence:start',
        target: aligned.id,
        rationale: `LP-aligned (${quoteShort(lp)}) — pick up where this leaves off.`,
      })
    }
  }

  // 2. Recency — in-progress today (active project with activity in
  //    the last ~24h), even if LP alignment didn't surface it.
  const inProgressToday = findInProgressToday(projectsInActive, snapshot.generatedAt)
  if (inProgressToday) {
    add({
      verb: '/cadence:start',
      target: inProgressToday.id,
      rationale: 'Touched today — natural to pick back up.',
    })
  }

  // 3. Structural urgency.
  // 3a. Pursuit with ≥1 project AND zero open projects — fully ready
  // to resolve. The `closing_in_on_resolution` flag never fires in
  // this state (it requires 1-2 unresolved), so we detect directly.
  const fullyShippedPursuit = findFullyShippedPursuit(snapshot, activePursuitIds)
  if (fullyShippedPursuit) {
    add({
      verb: '/cadence:resolve',
      target: fullyShippedPursuit,
      rationale: 'All projects shipped — the pursuit is ready to close.',
    })
  }

  // 3b. Closing-in pursuit (1-2 projects still open) — point at the
  // pursuit's status drill-down so the user sees the finalization question.
  const closingIn = flags.find(
    (f) => f.kind === 'closing_in_on_resolution',
  ) as
    | (Flag & { kind: 'closing_in_on_resolution' })
    | undefined
  if (closingIn) {
    add({
      verb: '/cadence:status',
      target: closingIn.pursuitId,
      rationale: `${closingIn.resolvedCount}/${closingIn.totalCount} projects done — what would need to be true to close?`,
    })
  }

  const structurallyDone = flags.find(
    (f) => f.kind === 'structural_active_no_open_actions',
  ) as
    | (Flag & { kind: 'structural_active_no_open_actions' })
    | undefined
  if (structurallyDone) {
    add({
      verb: '/cadence:resolve',
      target: structurallyDone.projectId,
      rationale: 'All actions checked — does the intent feel achieved?',
    })
  }

  // 4. Parking-lot pressure — Inbox above soft threshold.
  const inboxFlag = flags.find((f) => f.kind === 'inbox_pressure') as
    | (Flag & { kind: 'inbox_pressure' })
    | undefined
  if (inboxFlag) {
    add({
      verb: '/cadence:start inbox',
      rationale: `Inbox above soft cap (${inboxFlag.count} items) — walk them.`,
    })
  } else {
    const inboxCount = inboxItems(snapshot).counts.total
    if (inboxCount > 0 && moves.length < MAX_MOVES - 1) {
      // Below the soft cap but non-empty — surface only if we have
      // surplus slots; never push out an urgency signal.
      // Skip when other moves dominate.
    }
  }

  // 5. Routine surfaces — reflect-due, narrate-week, narrate-today,
  //    on_hold pickup, then the help fallback. Lower priority than the
  //    above; only fill remaining slots.
  if (signals.weeklyPreviewDue) {
    add({
      verb: '/cadence:narrate week',
      rationale: 'Week is closing — preview before /cadence:reflect.',
    })
  }
  if (signals.narrateTodayStale) {
    add({
      verb: '/cadence:narrate today',
      rationale: 'Activity landed today with no daily narrative yet.',
    })
  }
  const daysSinceReflect = daysSinceLastReflect(snapshot)
  if (
    daysSinceReflect !== null &&
    daysSinceReflect > 7 &&
    projectsInActive.length > 0
  ) {
    add({
      verb: '/cadence:reflect',
      rationale: `${daysSinceReflect}d since the last one — the week is moving.`,
    })
  } else if (daysSinceReflect === null && projectsInActive.length > 0) {
    add({
      verb: '/cadence:reflect',
      rationale: 'No reflection yet — set a Leveraged Priority.',
    })
  }

  // On-hold pickup fallback — only when nothing more urgent surfaced.
  if (moves.length < 2) {
    const onHold = projectsInActive.find((p) => p.status === 'on_hold')
    if (onHold) {
      add({
        verb: '/cadence:start',
        target: onHold.id,
        rationale: `On hold — pick it back up.`,
      })
    }
  }

  // Empty-state fallback.
  if (moves.length === 0) {
    add({
      verb: '/cadence:brainstorm',
      rationale: 'Nothing in flight — open ideation.',
    })
  }

  // Final fallback — fill spare slots with /help so the user can
  // browse if none of the above resonates.
  if (moves.length < MAX_MOVES) {
    add({
      verb: '/cadence:help',
      rationale: 'Browse the full verb surface.',
    })
  }

  return moves.slice(0, MAX_MOVES)
}

function extractLeveragedPriority(reflections: Reflection[]): string | null {
  const sorted = [...reflections].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  )
  for (const r of sorted) {
    if (r.leveraged_priority) return r.leveraged_priority
  }
  return null
}

/**
 * Find the active project whose ID, pursuit ID, or first-sentence Intent
 * best matches the LP text. Heuristic — exact-substring on lowered
 * project ID first, then pursuit ID, then any LP token longer than 3
 * characters appearing in either. Returns null when nothing matches.
 *
 * Conservative on purpose: a false-positive "LP-aligned" badge on the
 * wrong project would be more confusing than no badge at all.
 */
function findLpAlignedProject(
  lp: string,
  projects: Project[],
): Project | null {
  const lpLower = lp.toLowerCase()
  // Prefer active projects, then on_hold projects.
  const ranked = [...projects].sort((a, b) => {
    const aActive = a.status === 'active' ? 0 : 1
    const bActive = b.status === 'active' ? 0 : 1
    return aActive - bActive
  })

  // Exact substring on project ID (with dashes → spaces tolerance).
  for (const p of ranked) {
    if (p.status !== 'active' && p.status !== 'on_hold') continue
    const idTokens = p.id.toLowerCase().split('-')
    const allTokensInLp = idTokens.every((t) => t.length <= 2 || lpLower.includes(t))
    if (allTokensInLp && idTokens.length >= 2) return p
  }

  // Token-level overlap — at least 2 substantial tokens shared.
  const lpTokens = lpLower.split(/[^a-z0-9]+/).filter((t) => t.length > 3)
  if (lpTokens.length === 0) return null
  for (const p of ranked) {
    if (p.status !== 'active' && p.status !== 'on_hold') continue
    const idTokens = p.id.toLowerCase().split('-').filter((t) => t.length > 3)
    const shared = idTokens.filter((t) => lpTokens.includes(t))
    if (shared.length >= 2) return p
  }

  return null
}

/**
 * Find a pursuit that has ≥1 resolved project AND zero open ones.
 * That's the "all shipped, ready to close" state. Returns the first
 * such pursuit (sorted by id for determinism), or null.
 */
function findFullyShippedPursuit(
  snapshot: Snapshot,
  activePursuitIds: Set<string>,
): string | null {
  const candidates: string[] = []
  for (const pid of activePursuitIds) {
    const projects = snapshot.projects.filter((p) => p.pursuit === pid)
    if (projects.length === 0) continue
    const open = projects.filter(
      (p) => p.status === 'active' || p.status === 'on_hold',
    )
    if (open.length > 0) continue
    candidates.push(pid)
  }
  candidates.sort()
  return candidates[0] ?? null
}

function findInProgressToday(
  projects: Project[],
  generatedAt: string,
): Project | null {
  const now = new Date(generatedAt)
  const today = isoDateLocal(now)
  for (const p of projects) {
    if (p.status !== 'active') continue
    if (!p.last_activity_at) continue
    if (isoDateLocal(new Date(p.last_activity_at)) === today) return p
  }
  return null
}

function daysSinceLastReflect(snapshot: Snapshot): number | null {
  if (snapshot.reflections.length === 0) return null
  const sorted = [...snapshot.reflections].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  )
  const latest = sorted[0]!
  const now = new Date(snapshot.generatedAt)
  const last = new Date(latest.date + 'T00:00:00')
  const ms = now.getTime() - last.getTime()
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)))
}

function isoDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Truncate the LP text to a short quote suitable for inline use.
 * Goal: the rationale stays readable even when the LP is a full
 * sentence. Hard cap at ~40 chars + ellipsis.
 */
function quoteShort(s: string): string {
  const trimmed = s.trim()
  if (trimmed.length <= 40) return `"${trimmed}"`
  return `"${trimmed.slice(0, 37)}…"`
}
