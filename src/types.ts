import { z } from 'zod'

export const ChecklistItemSchema = z.object({
  text: z.string(),
  checked: z.boolean(),
})
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>

export const WaitingForSchema = z.object({
  person: z.string(),
  what: z.string(),
  expected: z.string(),
  flagged: z.boolean().optional().default(false),
})
export type WaitingFor = z.infer<typeof WaitingForSchema>

export const PursuitTypeSchema = z.enum(['finite', 'ongoing', 'someday'])
export const PursuitStatusSchema = z.enum([
  'active',
  'someday',
  'archived',
  'dropped',
])
export const PursuitLifecycleSchema = z.enum([
  'active',
  'someday',
  'archived',
  'dropped',
])

export const PursuitCueSchema = z.object({
  trigger: z.enum(['review', 'date', 'seasonal']),
  review: z.string().optional(),
  date: z.string().optional(),
  season: z.string().optional(),
})
export type PursuitCue = z.infer<typeof PursuitCueSchema>

export const PursuitFrontmatterSchema = z.object({
  id: z.string(),
  type: PursuitTypeSchema,
  status: PursuitStatusSchema,
  created: z.string(),
  why: z.string().optional(),
  target: z.string().optional(),
  win_cycle: z.string().optional(),
  cue: PursuitCueSchema.optional(),
})
export type PursuitFrontmatter = z.infer<typeof PursuitFrontmatterSchema>

export type Pursuit = PursuitFrontmatter & {
  lifecycle: z.infer<typeof PursuitLifecycleSchema>
  description: string
  path: string
}

export const ProjectStatusSchema = z.enum([
  'active',
  'on_hold',
  'done',
  'dropped',
])
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>

export const DomainSchema = z.enum(['physical', 'digital', 'hybrid'])
export type DomainOverride = z.infer<typeof DomainSchema>

/**
 * Where a project (or other entity) came from. Generic by design —
 * the discriminated union extends to new kinds (idea, url, capture)
 * without re-engineering the frontmatter. Today only `github_issue`
 * is wired end-to-end (via /cadence:incoming's promote path).
 *
 * Downstream uses the origin to close the loop on the source — e.g.,
 * `cadence set-status … --status done` on a project with a
 * github_issue origin auto-closes the issue (gh-gated).
 */
export const OriginGithubIssueSchema = z.object({
  kind: z.literal('github_issue'),
  repo: z.string(),
  number: z.number(),
  url: z.string(),
})
export const OriginSchema = z.discriminatedUnion('kind', [
  OriginGithubIssueSchema,
])
export type Origin = z.infer<typeof OriginSchema>

export const ProjectFrontmatterSchema = z.object({
  id: z.string(),
  pursuit: z.string(),
  status: ProjectStatusSchema,
  created: z.string(),
  waiting_for: z.array(WaitingForSchema).optional().default([]),
  /**
   * Optional override for the heuristic in src/scan/domain.ts. When
   * set, this value takes precedence and `effective_domain` reports
   * it directly. When absent, `effective_domain` falls back to the
   * `detected_domain` (which may be 'unknown'). Skills should adapt
   * their prompts based on `effective_domain`.
   */
  domain: DomainSchema.optional(),
  origin: OriginSchema.optional(),
})
export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>

export type Progress = { done: number; total: number }

export type Project = ProjectFrontmatter & {
  intent: string
  dod: ChecklistItem[]
  actions: ChecklistItem[]
  description: string
  path: string
  dodProgress: Progress
  actionProgress: Progress
  /**
   * Most recent activity timestamp on the project file:
   * `max(git log committer-date, fs.mtime)`. Used for dormancy
   * and recency heuristics. Undefined for tests and non-git
   * directories.
   */
  last_activity_at?: string
  /** Result of running the domain heuristic over `intent` + `id`. */
  detected_domain: 'physical' | 'digital' | 'hybrid' | 'unknown'
  /** Override (`domain` frontmatter) if set, else `detected_domain`. */
  effective_domain: 'physical' | 'digital' | 'hybrid' | 'unknown'
}

export const BrainstormPhaseSchema = z.enum([
  'diverging',
  'converging',
  'crystallized',
  'archived',
])
export type BrainstormPhase = z.infer<typeof BrainstormPhaseSchema>

export const BrainstormMetaSchema = z.object({
  slug: z.string(),
  created_at: z.string(),
  last_touched: z.string(),
  phase: BrainstormPhaseSchema,
  source_thoughts: z.array(z.string()).optional().default([]),
  candidate_solutions: z.array(z.string()).optional().default([]),
  selected_solution: z.string().nullable().optional().default(null),
  target_pursuit: z.string().nullable().optional().default(null),
})
export type BrainstormMeta = z.infer<typeof BrainstormMetaSchema>

export type Brainstorm = BrainstormMeta & {
  path: string
}

export const CaptureMcpRefSchema = z.object({
  server: z.string(),
  uri: z.string(),
  mime_type: z.string().optional(),
  content_hash: z.string().optional(),
})
export type CaptureMcpRef = z.infer<typeof CaptureMcpRefSchema>

/**
 * v2 source block — present on captures synthesized via /cadence:capture
 * --from / --source / --dump (or the capture-ingest subagent that
 * processes those flows). Supersedes the v1 `mcp:` block, which stays
 * for backwards compat. Scanner reads both and treats them equivalently.
 */
export const CaptureSourceSchema = z.object({
  kind: z.enum(['inline', 'stdin', 'file', 'url', 'mcp', 'dump']),
  name: z.string().optional(),
  server: z.string().optional(),
  uri: z.string().optional(),
  query: z.string().optional(),
  mime_type: z.string().optional(),
  raw_path: z.string().optional(),
  content_hash: z.string().optional(),
})
export type CaptureSource = z.infer<typeof CaptureSourceSchema>

export const CaptureStatusSchema = z.enum(['untriaged', 'triaged', 'discarded'])
export type CaptureStatus = z.infer<typeof CaptureStatusSchema>

/**
 * One outcome the capture-ingest subagent suggests for a distilled
 * capture. The capture-exit menu in /cadence:capture renders these
 * for the user to confirm or override. Preserved in frontmatter so
 * later triage (in `/start inbox` or `/reflect`) sees the same
 * suggestions without re-running the subagent.
 */
export const CaptureSuggestedOutcomeSchema = z.object({
  kind: z.enum([
    'two_minute_action',
    'action',
    'project',
    'brainstorm_seed',
    'note',
  ]),
  suggested_pursuit: z.string().optional(),
  suggested_project: z.string().optional(),
  confidence: z.number().optional(),
})
export type CaptureSuggestedOutcome = z.infer<
  typeof CaptureSuggestedOutcomeSchema
>

export const CaptureFrontmatterSchema = z.object({
  captured: z.string(),
  verb_context: z.string().optional(),
  /**
   * v1 (legacy) — set on captures synthesized through MCP via the
   * old `cadence write-capture --mcp-*` flags driven by
   * `/cadence:mcp-pull`. Supersceded by `source:` in v2 but kept for
   * backwards compat. Scanner reads both.
   */
  mcp: CaptureMcpRefSchema.optional(),
  /**
   * Frontmatter schema version. Absent or 1 → v1 shape (just
   * captured + verb_context + optional mcp:). 2 → v2 shape adds
   * source / status / two_minute_eligible / triaged_to / prompt /
   * suggested_outcomes.
   */
  schema_version: z.number().optional(),
  source: CaptureSourceSchema.optional(),
  status: CaptureStatusSchema.optional(),
  two_minute_eligible: z.boolean().optional(),
  triaged_to: z.string().nullable().optional(),
  prompt: z.string().optional(),
  suggested_outcomes: z.array(CaptureSuggestedOutcomeSchema).optional(),
})
export type CaptureFrontmatter = z.infer<typeof CaptureFrontmatterSchema>

export type Capture = CaptureFrontmatter & {
  body: string
  path: string
}

export const ReflectionFrontmatterSchema = z.object({
  date: z.string(),
  status: z.enum(['draft', 'in_progress', 'complete']),
  phase: z.enum(['get_clear', 'get_focused']).optional(),
  leveraged_priority: z.string().optional(),
})
export type ReflectionFrontmatter = z.infer<typeof ReflectionFrontmatterSchema>

export type Reflection = ReflectionFrontmatter & {
  body: string
  path: string
}

export const ConfigSchema = z.object({
  version: z.number().optional().default(1),
  win_cycles: z
    .object({
      current: z.string().optional(),
      start: z.string().optional(),
      end: z.string().optional(),
      mid_check: z.string().optional(),
    })
    .optional(),
  defaults: z
    .object({
      someday_review: z.string().optional(),
      waiting_for_grace_days: z.number().optional(),
      dormant_days: z.number().optional(),
      incoming_queue_threshold: z.number().optional(),
      incoming_queue_cache_ttl_minutes: z.number().optional(),
      inbox_soft_threshold: z.number().optional(),
    })
    .optional(),
  wip_limits: z
    .object({
      max_active_projects: z.number().optional(),
    })
    .optional(),
  reflect: z
    .object({
      day: z.string().optional(),
      duration_minutes: z.number().optional(),
    })
    .optional(),
})
export type RawConfig = z.infer<typeof ConfigSchema>

export type Config = {
  waiting_for_grace_days: number
  dormant_days: number
  max_active_projects: number
  someday_review: string
  reflect_day: string
  reflect_duration_minutes: number
  incoming_queue_threshold: number
  incoming_queue_cache_ttl_minutes: number
  inbox_soft_threshold: number
  win_cycle_current?: string
  win_cycle_start?: string
  win_cycle_end?: string
  win_cycle_mid_check?: string
}

export const CONFIG_DEFAULTS: Config = {
  waiting_for_grace_days: 2,
  dormant_days: 14,
  max_active_projects: 5,
  someday_review: 'monthly',
  reflect_day: 'sunday',
  reflect_duration_minutes: 30,
  incoming_queue_threshold: 5,
  incoming_queue_cache_ttl_minutes: 15,
  inbox_soft_threshold: 10,
}

export type LastTouch = {
  project_id: string
  pursuit_id: string
  pursuit_archived: boolean
  timestamp: string
}

export type Snapshot = {
  config: Config
  pursuits: Pursuit[]
  projects: Project[]
  brainstorms: Brainstorm[]
  captures: Capture[]
  reflections: Reflection[]
  generatedAt: string
  repoRoot: string
  lastTouch?: LastTouch | null
}

export type Flag =
  | {
      kind: 'overdue_waiting_for'
      pursuitId: string
      projectId: string
      item: WaitingFor
      daysOverdue: number
    }
  | {
      kind: 'dormant_project'
      pursuitId: string
      projectId: string
      daysSinceActivity: number | null
    }
  | {
      kind: 'structural_active_no_open_actions'
      pursuitId: string
      projectId: string
    }
  | { kind: 'wip_over_limit'; count: number; limit: number; projectIds: string[] }
  | {
      // Pursuit is closing in on resolution: ≥1 project resolved
      // (done|dropped) AND 1-2 unresolved (active|on_hold) remain.
      // Surfaces a "what would need to be true to close?" prompt at
      // /complete and during /reflect Get Clear so finalization
      // becomes a planned phase, not a surprise discovery.
      kind: 'closing_in_on_resolution'
      pursuitId: string
      unresolvedCount: number
      resolvedCount: number
      totalCount: number
    }
  | {
      // Untriaged inbound issues on the upstream Cadence repo have
      // grown past the configured threshold. Surfaces a nudge toward
      // /cadence:incoming. Count excludes issues already labeled
      // triaged-routed or triaged-deferred. Skipped silently when gh
      // is unavailable (no flag, no error). Cached in
      // .cadence/inbound-cache.json for the configured TTL.
      kind: 'inbound_issues_piling_up'
      count: number
      threshold: number
      ownerRepo: string
      fromCache: boolean
    }
  | {
      // The Inbox view (untriaged thoughts + diverging brainstorms)
      // has grown past inbox_soft_threshold. One flag fires regardless
      // of count; the per-item story belongs in /start inbox, not in
      // the flag list. The bucket counts (fresh / aged / overdue)
      // give the flag rendering enough to read like
      // "Inbox: 12 items — 3 fresh, 4 aged, 5 overdue".
      kind: 'inbox_pressure'
      count: number
      threshold: number
      fresh: number
      aged: number
      overdue: number
    }

export type Report = {
  snapshot: Snapshot
  flags: Flag[]
}
