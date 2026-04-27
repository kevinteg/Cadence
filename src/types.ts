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
export const PursuitStatusSchema = z.enum(['active', 'someday', 'archived'])
export const PursuitLifecycleSchema = z.enum(['active', 'someday', 'archived'])

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

export const ProjectFrontmatterSchema = z.object({
  id: z.string(),
  pursuit: z.string(),
  status: ProjectStatusSchema,
  created: z.string(),
  waiting_for: z.array(WaitingForSchema).optional().default([]),
})
export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>

export type Progress = { done: number; total: number }

export type Project = ProjectFrontmatter & {
  dod: ChecklistItem[]
  actions: ChecklistItem[]
  description: string
  path: string
  dodProgress: Progress
  actionProgress: Progress
  hasMarker: boolean
  mostRecentMarker?: string
}

export const IdeaStateSchema = z.enum([
  'seed',
  'developed',
  'promoted',
  'moved',
  'closed',
])
export type IdeaState = z.infer<typeof IdeaStateSchema>

export const IdeaFrontmatterSchema = z.object({
  id: z.string(),
  parent: z.string(),
  state: IdeaStateSchema,
  created: z.string(),
  developed_at: z.string().optional(),
  promoted_to: z.string().optional(),
  closed_reason: z.string().optional(),
})
export type IdeaFrontmatter = z.infer<typeof IdeaFrontmatterSchema>

export type Idea = IdeaFrontmatter & {
  body: string
  path: string
  ageDays: number
}

export const MarkerFrontmatterSchema = z.object({
  pursuit: z.string(),
  project: z.string(),
  session_start: z.string(),
  session_end: z.string().optional(),
  actions_completed: z.array(z.string()).optional().default([]),
})
export type MarkerFrontmatter = z.infer<typeof MarkerFrontmatterSchema>

export type Marker = MarkerFrontmatter & {
  where: string
  next: string
  open: string
  path: string
  timestamp: string
}

export const CaptureFrontmatterSchema = z.object({
  captured: z.string(),
  verb_context: z.string().optional(),
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
      marker_stale_days: z.number().optional(),
      waiting_for_grace_days: z.number().optional(),
      dormant_days: z.number().optional(),
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
  marker_stale_days: number
  waiting_for_grace_days: number
  dormant_days: number
  max_active_projects: number
  someday_review: string
  reflect_day: string
  reflect_duration_minutes: number
  win_cycle_current?: string
  win_cycle_start?: string
  win_cycle_end?: string
  win_cycle_mid_check?: string
}

export const CONFIG_DEFAULTS: Config = {
  marker_stale_days: 7,
  waiting_for_grace_days: 2,
  dormant_days: 14,
  max_active_projects: 5,
  someday_review: 'monthly',
  reflect_day: 'sunday',
  reflect_duration_minutes: 30,
}

export type Snapshot = {
  config: Config
  pursuits: Pursuit[]
  projects: Project[]
  ideas: Idea[]
  markers: Marker[]
  captures: Capture[]
  reflections: Reflection[]
  generatedAt: string
  repoRoot: string
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
      daysSinceMarker: number | null
    }
  | {
      kind: 'stale_marker'
      pursuitId: string
      projectId: string
      daysSinceMarker: number
    }
  | { kind: 'structural_empty_dod'; pursuitId: string; projectId: string }
  | {
      kind: 'structural_done_unchecked'
      pursuitId: string
      projectId: string
    }
  | {
      kind: 'structural_open_no_actions'
      pursuitId: string
      projectId: string
    }
  | { kind: 'wip_over_limit'; count: number; limit: number; projectIds: string[] }

export type Report = {
  snapshot: Snapshot
  flags: Flag[]
}
