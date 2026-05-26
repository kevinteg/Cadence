import { cac } from 'cac'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scan } from './scan/repo.js'
import { getInboundCount } from './scan/inbound.js'
import { report } from './report/reconciler.js'
import { renderStatus, renderFlags } from './render/status.js'
import { computeSuggestionSignals } from './render/signals.js'
import { renderSnapshot, renderReport } from './render/snapshot.js'
import { findEntities } from './find.js'
import { renderFindResults } from './render/find.js'
import {
  renderProject,
  renderPursuit,
  renderPursuits,
} from './render/drilldown.js'
import type { Flag, Snapshot } from './types.js'
import { createPursuit } from './write/pursuit.js'
import { createProject } from './write/project.js'
import {
  archiveBrainstorm,
  createBrainstorm,
  crystallize,
  setBrainstormPhase,
} from './write/brainstorm.js'
import { writeCapture } from './write/capture.js'
import { writeReflection } from './write/reflection.js'
import {
  addItem,
  addItems,
  addWaitingFor,
  checkItem,
  checkItems,
  flagWaitingFor,
  setProjectStatus,
  syncProjectOrigin,
} from './write/edits.js'
import { movePursuit } from './write/move.js'
import {
  projectActivity,
  type ActivityScope,
} from './scan/git-activity.js'
import {
  readLibrary,
  selectTip,
  tipStatus,
  type SelectOptions,
  type TipTone,
  type TipType,
} from './tip/library.js'
import {
  isCategoryEligible,
  readTipState,
  recordCategoryShow,
  recordShow,
  resetTips,
} from './tip/state.js'
import {
  addPendingValidation,
  clearPendingValidations,
  readPendingValidations,
} from './validation/queue.js'
const cli = cac('cadence')

cli
  .command('scan', 'Show a tabular summary of the repo snapshot')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--json', 'Emit the full Snapshot as JSON')
  .action(async (opts: { root?: string; json?: boolean }) => {
    const repoRoot = await resolveRepoRoot(opts.root)
    const snapshot = await scan(repoRoot)
    if (opts.json) {
      process.stdout.write(JSON.stringify(snapshot, null, 2) + '\n')
    } else {
      process.stdout.write(renderSnapshot(snapshot) + '\n')
    }
  })

cli
  .command('report', 'Show a tabular summary of the snapshot + reconciler flags')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--json', 'Emit the full Report as JSON')
  .action(async (opts: { root?: string; json?: boolean }) => {
    const repoRoot = await resolveRepoRoot(opts.root)
    const snapshot = await scan(repoRoot)
    const result = report(snapshot)
    const inbound = await composeInboundFlag(repoRoot, snapshot)
    if (inbound) result.flags.push(inbound)
    if (opts.json) {
      // Include derived signals so skills (e.g. /reflect) can branch on
      // entry mode without a second CLI call. Additive — preserves
      // backward compatibility with consumers that ignore signals.
      const signals = computeSuggestionSignals(snapshot, repoRoot)
      process.stdout.write(
        JSON.stringify({ ...result, signals }, null, 2) + '\n',
      )
    } else {
      process.stdout.write(renderReport(result) + '\n')
    }
  })

cli
  .command('status', 'Show the system dashboard (human-readable)')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--json', 'Emit dashboard data as JSON instead of text')
  .option(
    '--hook-output',
    'Emit a SessionStart-hook JSON envelope (systemMessage for the user, additionalContext for the model)',
  )
  .action(
    async (opts: { root?: string; json?: boolean; hookOutput?: boolean }) => {
      const repoRoot = await resolveRepoRoot(opts.root)
      if (!isCadenceRepo(repoRoot)) {
        const text = `Cadence isn't initialized in ${repoRoot}.\nRun /cadence:init to set up.`
        if (opts.hookOutput) {
          process.stdout.write(
            JSON.stringify({
              systemMessage: text,
              hookSpecificOutput: {
                hookEventName: 'SessionStart',
                additionalContext: text,
              },
            }) + '\n',
          )
        } else if (opts.json) {
          process.stdout.write(
            JSON.stringify({ initialized: false, repoRoot }, null, 2) + '\n',
          )
        } else {
          process.stdout.write(text + '\n')
        }
        return
      }
      const snapshot = await scan(repoRoot)
      const result = report(snapshot)
      const inbound = await composeInboundFlag(repoRoot, snapshot)
      if (inbound) result.flags.push(inbound)
      if (opts.hookOutput) {
        // renderStatus now appends a "Next:" block with up to 3
        // contextual suggestions (computed via nextSteps()), so we
        // emit the same text in both bare-CLI and hook-output paths.
        const text = renderStatus(result)
        process.stdout.write(
          JSON.stringify({
            systemMessage: text,
            hookSpecificOutput: {
              hookEventName: 'SessionStart',
              additionalContext: text,
            },
          }) + '\n',
        )
      } else if (opts.json) {
        process.stdout.write(JSON.stringify(result, null, 2) + '\n')
      } else {
        process.stdout.write(renderStatus(result) + '\n')
      }
    },
  )

cli
  .command('flags', 'Print reconciler flags only')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--json', 'Emit flags as JSON')
  .action(async (opts: { root?: string; json?: boolean }) => {
    const repoRoot = await resolveRepoRoot(opts.root)
    const snapshot = await scan(repoRoot)
    const { flags } = report(snapshot)
    const inbound = await composeInboundFlag(repoRoot, snapshot)
    if (inbound) flags.push(inbound)
    if (opts.json) {
      process.stdout.write(JSON.stringify(flags, null, 2) + '\n')
    } else {
      process.stdout.write(renderFlags(flags, snapshot) + '\n')
    }
  })

cli
  .command('pursuits', 'List all pursuits grouped by lifecycle')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--json', 'Emit as JSON')
  .action(async (opts: { root?: string; json?: boolean }) => {
    const repoRoot = await resolveRepoRoot(opts.root)
    const snapshot = await scan(repoRoot)
    if (opts.json) {
      process.stdout.write(JSON.stringify(snapshot.pursuits, null, 2) + '\n')
    } else {
      process.stdout.write(renderPursuits(snapshot) + '\n')
    }
  })

cli
  .command('pursuit <id>', 'Show projects in a pursuit')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--json', 'Emit as JSON')
  .action(async (id: string, opts: { root?: string; json?: boolean }) => {
    const repoRoot = await resolveRepoRoot(opts.root)
    const snapshot = await scan(repoRoot)
    const pursuit = snapshot.pursuits.find((p) => p.id === id)
    if (!pursuit) {
      process.stderr.write(`pursuit not found: ${id}\n`)
      process.exit(2)
    }
    const projects = snapshot.projects.filter((p) => p.pursuit === id)
    if (opts.json) {
      process.stdout.write(
        JSON.stringify({ pursuit, projects }, null, 2) + '\n',
      )
    } else {
      process.stdout.write(renderPursuit(snapshot, id) + '\n')
    }
  })

cli
  .command('project <id>', 'Show Intent, Actions, and waiting_for for a project')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--pursuit <id>', 'Disambiguate when project IDs collide')
  .option('--json', 'Emit as JSON')
  .action(
    async (
      id: string,
      opts: { root?: string; pursuit?: string; json?: boolean },
    ) => {
      const repoRoot = await resolveRepoRoot(opts.root)
      const snapshot = await scan(repoRoot)
      const candidates = snapshot.projects.filter((p) => p.id === id)
      const project = opts.pursuit
        ? candidates.find((p) => p.pursuit === opts.pursuit)
        : candidates[0]
      if (!project) {
        process.stderr.write(`project not found: ${id}\n`)
        process.exit(2)
      }
      if (opts.json) {
        process.stdout.write(JSON.stringify(project, null, 2) + '\n')
      } else {
        process.stdout.write(
          renderProject(snapshot, id, opts.pursuit) + '\n',
        )
      }
    },
  )

cli
  .command('captures', 'List unprocessed captures')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--json', 'Emit as JSON')
  .action(async (opts: { root?: string; json?: boolean }) => {
    const repoRoot = await resolveRepoRoot(opts.root)
    const snapshot = await scan(repoRoot)
    if (opts.json) {
      process.stdout.write(
        JSON.stringify(snapshot.captures, null, 2) + '\n',
      )
    } else if (snapshot.captures.length === 0) {
      process.stdout.write('No unprocessed captures.\n')
    } else {
      for (const c of snapshot.captures) {
        process.stdout.write(
          `- ${c.captured}${c.verb_context ? ` [${c.verb_context}]` : ''}\n    ${firstLine(c.body)}\n`,
        )
      }
    }
  })

cli
  .command(
    'find <query>',
    'Search projects, captures, and pursuits by case-insensitive substring',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--json', 'Emit results as JSON')
  .action(
    async (query: string, opts: { root?: string; json?: boolean }) => {
      const repoRoot = await resolveRepoRoot(opts.root)
      const snapshot = await scan(repoRoot)
      const results = findEntities(snapshot, query)
      if (opts.json) {
        process.stdout.write(
          JSON.stringify(
            { query, results, total: results.length },
            null,
            2,
          ) + '\n',
        )
      } else {
        process.stdout.write(renderFindResults(results, query) + '\n')
      }
    },
  )

cli
  .command('create-pursuit <id>', 'Create a new pursuit')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--type <type>', 'finite | ongoing | someday', { default: 'finite' })
  .option('--status <status>', 'active | someday | archived')
  .option('--why <text>', 'Optional why')
  .option('--target <date>', 'Optional target date')
  .option('--win-cycle <cycle>', 'Optional win cycle')
  .option('--title <text>', 'H1 title (default: derived from id)')
  .option('--description <text>', 'Body description paragraph')
  .option('--created <YYYY-MM-DD>', 'Override created date (default: today)')
  .action(
    async (
      id: string,
      opts: {
        root?: string
        type: 'finite' | 'ongoing' | 'someday'
        status?: 'active' | 'someday' | 'archived'
        why?: string
        target?: string
        winCycle?: string
        title?: string
        description?: string
        created?: string
      },
    ) => {
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await createPursuit(repoRoot, {
        id,
        type: opts.type,
        ...(opts.status ? { status: opts.status } : {}),
        ...(opts.why ? { why: opts.why } : {}),
        ...(opts.target ? { target: opts.target } : {}),
        ...(opts.winCycle ? { win_cycle: opts.winCycle } : {}),
        ...(opts.title ? { title: opts.title } : {}),
        ...(opts.description ? { description: opts.description } : {}),
        ...(opts.created ? { created: opts.created } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command('create-project <id>', 'Create a new project')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--pursuit <id>', 'Pursuit id (required)')
  .option('--status <status>', 'active | on_hold | done | dropped')
  .option('--title <text>', 'H1 title')
  .option('--description <text>', 'Intro paragraph (no header)')
  .option('--intent <text>', 'Intent narrative — motivation, scope, felt-sense of done')
  .option('--action <item>', 'Action item (unchecked, repeatable)', {
    type: [String],
  })
  .option('--action-checked <item>', 'Action item already complete (repeatable)', {
    type: [String],
  })
  .option('--dod <item>', '[legacy] DoD item (unchecked, repeatable). Prefer --intent for new projects.', { type: [String] })
  .option('--dod-checked <item>', '[legacy] DoD item already complete (repeatable). Prefer --intent for new projects.', {
    type: [String],
  })
  .option('--origin-issue <repo#number>', 'Tag the project with a GitHub-issue origin, e.g. owner/repo#42. Recorded in frontmatter as origin.kind = github_issue.')
  .option('--created <YYYY-MM-DD>', 'Override created date (default: today)')
  .action(
    async (
      id: string,
      opts: {
        root?: string
        pursuit?: string
        status?: 'active' | 'on_hold' | 'done' | 'dropped'
        title?: string
        description?: string
        intent?: string
        dod?: string[]
        dodChecked?: string[]
        action?: string[]
        actionChecked?: string[]
        originIssue?: string
        created?: string
      },
    ) => {
      if (!opts.pursuit) {
        throw new Error('--pursuit is required')
      }
      const repoRoot = await resolveRepoRoot(opts.root)
      const dod = multistring(opts.dod)
      const dodChecked = multistring(opts.dodChecked)
      const actions = multistring(opts.action)
      const actionsChecked = multistring(opts.actionChecked)
      const origin = parseOriginIssue(opts.originIssue)
      const result = await createProject(repoRoot, {
        pursuit: opts.pursuit,
        id,
        ...(opts.status ? { status: opts.status } : {}),
        ...(opts.title ? { title: opts.title } : {}),
        ...(opts.description ? { description: opts.description } : {}),
        ...(opts.intent ? { intent: opts.intent } : {}),
        ...(dod ? { dod } : {}),
        ...(dodChecked ? { dod_checked: dodChecked } : {}),
        ...(actions ? { actions } : {}),
        ...(actionsChecked ? { actions_checked: actionsChecked } : {}),
        ...(origin ? { origin } : {}),
        ...(opts.created ? { created: opts.created } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command('create-brainstorm <slug>', 'Create a brainstorm workspace at brainstorms/<slug>/ with phase: diverging')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--source-thought <id>', 'Thought id this brainstorm grew out of (repeatable)', {
    type: [String],
  })
  .action(
    async (
      slug: string,
      opts: { root?: string; sourceThought?: string[] },
    ) => {
      const repoRoot = await resolveRepoRoot(opts.root)
      const source_thoughts = multistring(opts.sourceThought)
      const result = await createBrainstorm(repoRoot, {
        slug,
        ...(source_thoughts ? { source_thoughts } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command('set-brainstorm-phase <slug>', 'Update a brainstorm\'s phase in meta.yaml')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--phase <phase>', 'diverging | converging | crystallized | archived (required)')
  .action(
    async (
      slug: string,
      opts: { root?: string; phase?: string },
    ) => {
      if (!opts.phase) throw new Error('--phase is required')
      const allowed = ['diverging', 'converging', 'crystallized', 'archived']
      if (!allowed.includes(opts.phase)) {
        throw new Error(`--phase must be one of ${allowed.join(' | ')}`)
      }
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await setBrainstormPhase(repoRoot, {
        slug,
        phase: opts.phase as 'diverging' | 'converging' | 'crystallized' | 'archived',
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command(
    'crystallize <slug>',
    'Materialize a pursuit from a chosen solution. Parses solutions/<name>.md (H1 → title, preamble → Intent, ## Next steps → actions), creates the project, writes decision.md, sets phase: crystallized.',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--solution <name>', 'Solution name (required); must match a solutions/<name>.md file')
  .option('--pursuit <id>', 'Pursuit the new project lands under (required)')
  .option('--project-id <id>', 'Slug for the new project. Defaults to the brainstorm slug.')
  .option('--decision-note <text>', 'Free-form prose appended to decision.md')
  .action(
    async (
      slug: string,
      opts: {
        root?: string
        solution?: string
        pursuit?: string
        projectId?: string
        decisionNote?: string
      },
    ) => {
      if (!opts.solution) throw new Error('--solution is required')
      if (!opts.pursuit) throw new Error('--pursuit is required')
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await crystallize(repoRoot, {
        slug,
        solution: opts.solution,
        pursuit: opts.pursuit,
        newProjectId: opts.projectId ?? slug,
        ...(opts.decisionNote ? { decisionNote: opts.decisionNote } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command(
    'archive-brainstorm <slug>',
    'Close out a brainstorm workspace. --keep moves it to narratives/brainstorms/<slug>/; --delete removes it.',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--keep', 'Move to narratives/brainstorms/<slug>/ (default)')
  .option('--delete', 'Delete the workspace outright')
  .action(
    async (
      slug: string,
      opts: { root?: string; keep?: boolean; delete?: boolean },
    ) => {
      if (opts.keep && opts.delete) {
        throw new Error('--keep and --delete are mutually exclusive')
      }
      const mode: 'keep' | 'delete' = opts.delete ? 'delete' : 'keep'
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await archiveBrainstorm(repoRoot, { slug, mode })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command('write-capture', 'Write a thought to thoughts/unprocessed/. When --mcp-server + --mcp-uri are supplied, the capture is stamped with an mcp: frontmatter block, content_hash is auto-computed (sha256 of body), and the write auto-dedups against existing captures by uri and by content hash.')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--body <text>', 'Capture body (required)')
  .option('--verb-context <ctx>', 'Verb context (note | seed | concern | mcp-pull:<server> | ...)')
  .option('--mcp-server <name>', 'MCP server name that sourced this capture. Requires --mcp-uri.')
  .option('--mcp-uri <uri>', 'MCP resource URI. Requires --mcp-server. Enables auto-dedup.')
  .option('--mcp-mime-type <type>', 'Optional MIME type of the source resource.')
  .option('--slug <slug>', 'Override the timestamp-based filename slug (batch writers pass per-item discriminators).')
  .action(
    async (opts: {
      root?: string
      body?: string
      verbContext?: string
      mcpServer?: string
      mcpUri?: string
      mcpMimeType?: string
      slug?: string
    }) => {
      if (!opts.body) throw new Error('--body is required')
      if ((opts.mcpServer && !opts.mcpUri) || (opts.mcpUri && !opts.mcpServer)) {
        throw new Error('--mcp-server and --mcp-uri must be supplied together')
      }
      const repoRoot = await resolveRepoRoot(opts.root)
      const mcp =
        opts.mcpServer && opts.mcpUri
          ? {
              server: opts.mcpServer,
              uri: opts.mcpUri,
              ...(opts.mcpMimeType ? { mime_type: opts.mcpMimeType } : {}),
            }
          : undefined
      const result = await writeCapture(repoRoot, {
        body: opts.body,
        ...(opts.verbContext ? { verb_context: opts.verbContext } : {}),
        ...(mcp ? { mcp } : {}),
        ...(opts.slug ? { slug: opts.slug } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command('write-reflection', 'Write or update a reflection file')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--date <YYYY-MM-DD>', 'Reflection date (default: today)')
  .option('--status <status>', 'draft | in_progress | complete (required)')
  .option('--phase <phase>', 'get_clear | get_focused')
  .option('--leveraged-priority <text>', 'Leveraged priority for next week')
  .option('--body <text>', 'Reflection body')
  .action(
    async (opts: {
      root?: string
      date?: string
      status?: 'draft' | 'in_progress' | 'complete'
      phase?: 'get_clear' | 'get_focused'
      leveragedPriority?: string
      body?: string
    }) => {
      if (!opts.status) throw new Error('--status is required')
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await writeReflection(repoRoot, {
        status: opts.status,
        ...(opts.date ? { date: opts.date } : {}),
        ...(opts.phase ? { phase: opts.phase } : {}),
        ...(opts.leveragedPriority
          ? { leveraged_priority: opts.leveragedPriority }
          : {}),
        ...(opts.body ? { body: opts.body } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command('set-status <project-id>', 'Update a project status')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--pursuit <id>', 'Disambiguate when project IDs collide')
  .option('--status <status>', 'active | on_hold | done | dropped (required)')
  .option('--reason <text>', 'Required when --status=dropped')
  .option(
    '--include-pursuit',
    'Also return pursuit summary (id, projects, done/total, allResolved) for the upward-completion check',
  )
  .action(
    async (
      projectId: string,
      opts: {
        root?: string
        pursuit?: string
        status?: 'active' | 'on_hold' | 'done' | 'dropped'
        reason?: string
        includePursuit?: boolean
      },
    ) => {
      if (!opts.status) throw new Error('--status is required')
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await setProjectStatus(repoRoot, {
        id: projectId,
        status: opts.status,
        ...(opts.pursuit ? { pursuit: opts.pursuit } : {}),
        ...(opts.reason ? { reason: opts.reason } : {}),
        ...(opts.includePursuit ? { include_pursuit: true } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command(
    'sync-origin <project-id>',
    'Re-run the origin sync for a project (backfill path). For github_issue origins, closes the linked issue with a comment if it is still open. Idempotent.',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--pursuit <id>', 'Disambiguate when project IDs collide')
  .action(
    async (
      projectId: string,
      opts: { root?: string; pursuit?: string },
    ) => {
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await syncProjectOrigin(repoRoot, {
        id: projectId,
        ...(opts.pursuit ? { pursuit: opts.pursuit } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command('check <project-id>', 'Toggle an Action item (or legacy DoD item) in a project')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--pursuit <id>', 'Disambiguate when project IDs collide')
  .option('--section <section>', 'dod | action (required)')
  .option('--match <text>', 'Substring or 0-based index of the item (required)')
  .option('--unchecked', 'Mark as unchecked instead of checked')
  .option('--note <text>', 'Append a sub-bullet note (only when checking)')
  .action(
    async (
      projectId: string,
      opts: {
        root?: string
        pursuit?: string
        section?: 'dod' | 'action'
        match?: string
        unchecked?: boolean
        note?: string
      },
    ) => {
      if (!opts.section || !opts.match) {
        throw new Error('--section and --match are required')
      }
      const repoRoot = await resolveRepoRoot(opts.root)
      const numericMatch = /^\d+$/.test(opts.match) ? Number(opts.match) : opts.match
      const result = await checkItem(repoRoot, {
        project: projectId,
        section: opts.section,
        match: numericMatch,
        checked: !opts.unchecked,
        ...(opts.pursuit ? { pursuit: opts.pursuit } : {}),
        ...(opts.note ? { note: opts.note } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command(
    'check-items <project-id>',
    'Toggle multiple Action items (or legacy DoD items) in one call',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--pursuit <id>', 'Disambiguate when project IDs collide')
  .option('--section <section>', 'dod | action (required)')
  .option(
    '--match <text>',
    'Substring or 0-based index of an item (repeatable)',
    { type: [String] },
  )
  .option('--unchecked', 'Mark as unchecked instead of checked')
  .action(
    async (
      projectId: string,
      opts: {
        root?: string
        pursuit?: string
        section?: 'dod' | 'action'
        match?: string[]
        unchecked?: boolean
      },
    ) => {
      if (!opts.section) throw new Error('--section is required')
      const matches = multistring(opts.match)
      if (!matches || matches.length === 0) {
        throw new Error('at least one --match is required')
      }
      const repoRoot = await resolveRepoRoot(opts.root)
      const normalized = matches.map((m) =>
        /^\d+$/.test(m) ? Number(m) : m,
      )
      const result = await checkItems(repoRoot, {
        project: projectId,
        section: opts.section,
        matches: normalized,
        checked: !opts.unchecked,
        ...(opts.pursuit ? { pursuit: opts.pursuit } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command('add-item <project-id>', 'Append an item to a section (Actions, legacy DoD, or Notes)')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--pursuit <id>', 'Disambiguate when project IDs collide')
  .option('--section <section>', 'action | dod | notes (required)')
  .option('--text <text>', 'Item text (required)')
  .option('--checked', 'Add as already checked (action/dod only; ignored for notes)')
  .action(
    async (
      projectId: string,
      opts: {
        root?: string
        pursuit?: string
        section?: 'dod' | 'action' | 'notes'
        text?: string
        checked?: boolean
      },
    ) => {
      if (!opts.section || !opts.text) {
        throw new Error('--section and --text are required')
      }
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await addItem(repoRoot, {
        project: projectId,
        section: opts.section,
        text: opts.text,
        ...(opts.pursuit ? { pursuit: opts.pursuit } : {}),
        ...(opts.checked ? { checked: true } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command(
    'add-items <project-id>',
    'Append multiple items to a section in one call',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--pursuit <id>', 'Disambiguate when project IDs collide')
  .option('--section <section>', 'action | dod | notes (required)')
  .option('--text <text>', 'Item text (repeatable)', { type: [String] })
  .option('--checked', 'Add all as already checked (action/dod only)')
  .action(
    async (
      projectId: string,
      opts: {
        root?: string
        pursuit?: string
        section?: 'dod' | 'action' | 'notes'
        text?: string[]
        checked?: boolean
      },
    ) => {
      if (!opts.section) throw new Error('--section is required')
      const texts = multistring(opts.text)
      if (!texts || texts.length === 0) {
        throw new Error('at least one --text is required')
      }
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await addItems(repoRoot, {
        project: projectId,
        section: opts.section,
        texts,
        ...(opts.pursuit ? { pursuit: opts.pursuit } : {}),
        ...(opts.checked ? { checked: true } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command('add-waiting-for <project-id>', 'Add a waiting_for item to a project')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--pursuit <id>', 'Disambiguate when project IDs collide')
  .option('--person <name>', 'Person waited on (required)')
  .option('--what <text>', 'What is being waited for (required)')
  .option('--expected <YYYY-MM-DD>', 'Expected date (required)')
  .action(
    async (
      projectId: string,
      opts: {
        root?: string
        pursuit?: string
        person?: string
        what?: string
        expected?: string
      },
    ) => {
      if (!opts.person || !opts.what || !opts.expected) {
        throw new Error('--person, --what, --expected are required')
      }
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await addWaitingFor(repoRoot, {
        project: projectId,
        person: opts.person,
        what: opts.what,
        expected: opts.expected,
        ...(opts.pursuit ? { pursuit: opts.pursuit } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command(
    'flag-waiting-for <project-id>',
    'Set flagged: true on a waiting_for item',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--pursuit <id>', 'Disambiguate when project IDs collide')
  .option('--match <text>', 'Substring or 0-based index of the item (required)')
  .option('--unflag', 'Set flagged: false instead')
  .action(
    async (
      projectId: string,
      opts: {
        root?: string
        pursuit?: string
        match?: string
        unflag?: boolean
      },
    ) => {
      if (!opts.match) throw new Error('--match is required')
      const repoRoot = await resolveRepoRoot(opts.root)
      const numericMatch = /^\d+$/.test(opts.match) ? Number(opts.match) : opts.match
      const result = await flagWaitingFor(repoRoot, {
        project: projectId,
        match: numericMatch,
        flagged: !opts.unflag,
        ...(opts.pursuit ? { pursuit: opts.pursuit } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command(
    'move-pursuit <id>',
    'Move a pursuit between active / someday / archived / dropped',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option(
    '--to <lifecycle>',
    'active | someday | archived | dropped (required). archived = closure ritual outcome (what shipped); dropped = drop ritual outcome (what got learned without shipping).',
  )
  .action(
    async (
      id: string,
      opts: {
        root?: string
        to?: 'active' | 'someday' | 'archived' | 'dropped'
      },
    ) => {
      if (!opts.to) throw new Error('--to is required')
      const valid = ['active', 'someday', 'archived', 'dropped']
      if (!valid.includes(opts.to)) {
        throw new Error(`--to must be one of: ${valid.join(', ')}`)
      }
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await movePursuit(repoRoot, { id, to: opts.to })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command(
    'project-activity',
    'Emit project-file git-log activity (the stream /narrate consumes)',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option(
    '--since-commit <hash>',
    'Resume from this commit (exclusive); falls back to scope window if not an ancestor of HEAD',
  )
  .option(
    '--scope <scope>',
    'daily | weekly | monthly | annual | pursuit (default: daily)',
  )
  .option('--pursuit <id>', 'Filter to one pursuit')
  .option('--project <id>', 'Filter to one project (requires --pursuit)')
  .action(
    async (opts: {
      root?: string
      sinceCommit?: string
      scope?: string
      pursuit?: string
      project?: string
    }) => {
      const repoRoot = await resolveRepoRoot(opts.root)
      const scope = (opts.scope ?? 'daily') as ActivityScope
      const result = await projectActivity(repoRoot, {
        sinceCommit: opts.sinceCommit,
        scope,
        pursuit: opts.pursuit,
        project: opts.project,
      })
      process.stdout.write(JSON.stringify(result, null, 2) + '\n')
    },
  )

cli
  .command(
    'tip-status',
    'Show tip-library state: which tips have been shown, which are eligible',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--json', 'Emit the full status as JSON')
  .option('--eligible-only', 'Only show tips that are eligible right now')
  .option('--triggers <tags>', 'Comma-separated active trigger tags to filter by')
  .action(
    async (opts: {
      root?: string
      json?: boolean
      eligibleOnly?: boolean
      triggers?: string
    }) => {
      const repoRoot = await resolveRepoRoot(opts.root)
      const library = readLibrary()
      const state = readTipState(repoRoot)
      let entries = tipStatus(library, state)
      if (opts.triggers) {
        const active = new Set(
          opts.triggers
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
        )
        entries = entries.filter((e) =>
          e.triggers.some((t) => active.has(t)),
        )
      }
      if (opts.eligibleOnly) {
        entries = entries.filter((e) => e.eligible_now)
      }
      if (opts.json) {
        process.stdout.write(
          JSON.stringify(
            { library_size: library.tips.length, entries },
            null,
            2,
          ) + '\n',
        )
        return
      }
      const lines: string[] = []
      lines.push(
        `Tip Library — ${library.tips.length} tips total, ${entries.length} shown / filtered`,
      )
      lines.push('')
      const eligible = entries.filter((e) => e.eligible_now).length
      const shown = entries.filter((e) => e.show_count > 0).length
      lines.push(`Eligible now: ${eligible}    Ever shown: ${shown}`)
      lines.push('')
      const recentlyShown = entries
        .filter((e) => e.show_count > 0)
        .sort((a, b) => {
          const ta = a.last_shown ? new Date(a.last_shown).getTime() : 0
          const tb = b.last_shown ? new Date(b.last_shown).getTime() : 0
          return tb - ta
        })
        .slice(0, 10)
      if (recentlyShown.length > 0) {
        lines.push('Recently shown:')
        for (const e of recentlyShown) {
          const when = e.last_shown
            ? new Date(e.last_shown).toISOString().slice(0, 16).replace('T', ' ')
            : 'never'
          const status = e.eligible_now
            ? 'eligible'
            : e.next_eligible_at
              ? `cap until ${e.next_eligible_at.slice(0, 10)}`
              : 'capped'
          lines.push(
            `  ${e.id.padEnd(40)} ${when} (×${e.show_count})  [${status}]`,
          )
        }
      } else {
        lines.push('No tips shown yet.')
      }
      process.stdout.write(lines.join('\n') + '\n')
    },
  )

cli
  .command('tip-reset', 'Clear show-state for tips matching a substring')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--match <text>', 'Substring or exact id to match (required)')
  .option('--all', 'Clear ALL tip state (use with care)')
  .action(
    async (opts: { root?: string; match?: string; all?: boolean }) => {
      const repoRoot = await resolveRepoRoot(opts.root)
      if (!opts.match && !opts.all) {
        throw new Error('--match <text> or --all is required')
      }
      const cleared = resetTips(repoRoot, (id) => {
        if (opts.all) return true
        return id.includes(opts.match!)
      })
      process.stdout.write(
        JSON.stringify({ cleared_count: cleared.length, cleared }, null, 2) +
          '\n',
      )
    },
  )

cli
  .command(
    'tip-pick',
    'Pick one tip eligible for the given active trigger context (returns JSON or null)',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option(
    '--triggers <tags>',
    'Comma-separated active trigger tags (required, e.g., verb-resolve,state-pursuit-near-completion)',
  )
  .option(
    '--tones <tones>',
    'Comma-separated tone filter (framing | directive | diagnostic | structural)',
  )
  .option(
    '--types <types>',
    'Comma-separated type filter (quote | skill-teaching | verb-hint)',
  )
  .option(
    '--no-record',
    'Do not update tip-state with the show (preview mode)',
  )
  .option(
    '--category <key>',
    'Category cap key (e.g. narrate-interjection). When present with --category-cool-down-days, the call returns null if the category is on cool-down, otherwise picks a tip AND records the category timestamp. Used by long-running-agent interjections to enforce per-agent-type rate limits.',
  )
  .option(
    '--category-cool-down-days <days>',
    'Days a category stays on cool-down once fired (default: 7). Ignored without --category.',
  )
  .action(
    async (opts: {
      root?: string
      triggers?: string
      tones?: string
      types?: string
      record?: boolean
      category?: string
      categoryCoolDownDays?: string | number
    }) => {
      const repoRoot = await resolveRepoRoot(opts.root)
      if (!opts.triggers || opts.triggers.trim().length === 0) {
        throw new Error('--triggers <tags> is required')
      }
      const triggers = opts.triggers
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
      const select: SelectOptions = { triggers }
      if (opts.tones) {
        select.tones = opts.tones
          .split(',')
          .map((s) => s.trim() as TipTone)
          .filter((s) =>
            ['framing', 'directive', 'diagnostic', 'structural'].includes(s),
          )
      }
      if (opts.types) {
        select.types = opts.types
          .split(',')
          .map((s) => s.trim() as TipType)
          .filter((s) =>
            ['quote', 'skill-teaching', 'verb-hint'].includes(s),
          )
      }
      const library = readLibrary()
      const state = readTipState(repoRoot)
      // Category cap — short-circuit if the category is on cool-down.
      if (opts.category) {
        const coolDownDays =
          typeof opts.categoryCoolDownDays === 'number'
            ? opts.categoryCoolDownDays
            : opts.categoryCoolDownDays
              ? Number(opts.categoryCoolDownDays)
              : 7
        if (!isCategoryEligible(state, opts.category, coolDownDays)) {
          process.stdout.write('null\n')
          return
        }
      }
      const picked = selectTip(library, state, select)
      if (!picked) {
        process.stdout.write('null\n')
        return
      }
      if (opts.record !== false) {
        recordShow(repoRoot, picked.tip.id)
        if (opts.category) {
          recordCategoryShow(repoRoot, opts.category)
        }
      }
      process.stdout.write(
        JSON.stringify(
          {
            id: picked.tip.id,
            type: picked.tip.type,
            content: picked.tip.content,
            attribution: picked.tip.attribution,
            tone: picked.tip.tone,
            matched_triggers: picked.matched_triggers,
          },
          null,
          2,
        ) + '\n',
      )
    },
  )

cli
  .command(
    'pending-validation-add',
    'Append a behavior to the pending-validations queue (surfaced by the SessionStart hook on every fresh session until cleared)',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--description <text>', 'What needs fresh-session validation (required)')
  .action(async (opts: { root?: string; description?: string }) => {
    const repoRoot = await resolveRepoRoot(opts.root)
    if (!opts.description || opts.description.trim().length === 0) {
      throw new Error('--description <text> is required')
    }
    const entry = addPendingValidation(repoRoot, opts.description)
    process.stdout.write(JSON.stringify({ added: entry }, null, 2) + '\n')
  })

cli
  .command(
    'pending-validation-list',
    'List pending validations awaiting fresh-session verification',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--json', 'Emit as JSON')
  .action(async (opts: { root?: string; json?: boolean }) => {
    const repoRoot = await resolveRepoRoot(opts.root)
    const entries = readPendingValidations(repoRoot)
    if (opts.json) {
      process.stdout.write(
        JSON.stringify({ count: entries.length, entries }, null, 2) + '\n',
      )
      return
    }
    if (entries.length === 0) {
      process.stdout.write('No pending validations.\n')
      return
    }
    const lines: string[] = [
      `${entries.length} pending validation${entries.length === 1 ? '' : 's'}:`,
      '',
    ]
    for (const e of entries) {
      lines.push(`- ${e.timestamp.slice(0, 10)} — ${e.description}`)
    }
    process.stdout.write(lines.join('\n') + '\n')
  })

cli
  .command(
    'pending-validation-clear',
    'Clear pending validations matching a substring (or --all)',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--match <text>', 'Substring to match against the description')
  .option('--all', 'Clear ALL pending validations (use with care)')
  .action(
    async (opts: { root?: string; match?: string; all?: boolean }) => {
      const repoRoot = await resolveRepoRoot(opts.root)
      if (!opts.match && !opts.all) {
        throw new Error('--match <text> or --all is required')
      }
      const cleared = clearPendingValidations(repoRoot, (entry) => {
        if (opts.all) return true
        return entry.description.includes(opts.match!)
      })
      process.stdout.write(
        JSON.stringify({ cleared_count: cleared.length, cleared }, null, 2) +
          '\n',
      )
    },
  )

cli
  .command(
    'plugin-info',
    'Print plugin manifest info: repository, version, plugin dir, gh shorthand',
  )
  .option('--json', 'Emit as JSON')
  .action(async (opts: { json?: boolean }) => {
    const info = await readPluginInfo()
    if (opts.json) {
      process.stdout.write(JSON.stringify(info, null, 2) + '\n')
    } else {
      process.stdout.write(
        `Cadence plugin\n` +
          `  Version:    ${info.version ?? '(unknown)'}\n` +
          `  Repository: ${info.repository ?? '(unknown)'}\n` +
          `  Shorthand:  ${info.owner_repo ?? '(unparseable)'}\n` +
          `  Plugin dir: ${info.plugin_dir}\n`,
      )
    }
  })

cli.help()
cli.version('0.1.0')

cli.parse(process.argv, { run: false })

if (cli.matchedCommand) {
  cli.runMatchedCommand().catch((err: unknown) => {
    process.stderr.write(formatError(err) + '\n')
    process.exit(1)
  })
} else if (process.argv.length <= 2) {
  cli.outputHelp()
}

async function resolveRepoRoot(explicit?: string): Promise<string> {
  if (explicit) return path.resolve(explicit)
  return findRepoRoot(process.cwd())
}

function findRepoRoot(start: string): string {
  let dir = path.resolve(start)
  for (;;) {
    if (existsSync(path.join(dir, 'cadence.yaml'))) return dir
    if (existsSync(path.join(dir, 'pursuits'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return path.resolve(start)
}

function isCadenceRepo(root: string): boolean {
  return (
    existsSync(path.join(root, 'cadence.yaml')) ||
    existsSync(path.join(root, 'pursuits'))
  )
}

/**
 * cac's `type: [String]` repeatable option returns ["undefined"] (the
 * literal string!) when the flag is omitted. Coerce to a clean string[]
 * by filtering that sentinel and any non-strings.
 */
function multistring(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined
  const cleaned = v.filter(
    (x): x is string =>
      typeof x === 'string' && x !== 'undefined' && x.length > 0,
  )
  return cleaned.length > 0 ? cleaned : undefined
}

/**
 * Parse `owner/repo#42` shorthand into a github_issue Origin. Returns
 * undefined when input is missing; throws on malformed input so the
 * caller hears about typos at the CLI boundary rather than silently
 * persisting an unparseable origin.
 */
function parseOriginIssue(
  raw: string | undefined,
): { kind: 'github_issue'; repo: string; number: number; url: string } | undefined {
  if (!raw) return undefined
  const match = raw.match(/^([^/\s#]+\/[^/\s#]+)#(\d+)$/)
  if (!match) {
    throw new Error(
      `--origin-issue must be "owner/repo#number" (e.g. kevinteg/Cadence#42), got: ${raw}`,
    )
  }
  const repo = match[1] as string
  const number = Number(match[2])
  return {
    kind: 'github_issue',
    repo,
    number,
    url: `https://github.com/${repo}/issues/${number}`,
  }
}

function firstLine(text: string): string {
  const line = text.split('\n')[0]?.trim() ?? ''
  return line.length > 200 ? line.slice(0, 197) + '...' : line
}

function formatError(err: unknown): string {
  if (err instanceof Error) {
    return `cadence: ${err.message}`
  }
  return `cadence: ${String(err)}`
}

async function composeInboundFlag(
  repoRoot: string,
  snapshot: Snapshot,
): Promise<Flag | null> {
  let pluginInfo: PluginInfo
  try {
    pluginInfo = await readPluginInfo()
  } catch {
    return null
  }
  if (!pluginInfo.owner_repo) return null
  const ttl = snapshot.config.incoming_queue_cache_ttl_minutes
  const threshold = snapshot.config.incoming_queue_threshold
  const result = await getInboundCount(repoRoot, pluginInfo.owner_repo, ttl)
  if (result === null) return null
  if (result.count <= threshold) return null
  return {
    kind: 'inbound_issues_piling_up',
    count: result.count,
    threshold,
    ownerRepo: pluginInfo.owner_repo,
    fromCache: result.fromCache,
  }
}

interface PluginInfo {
  plugin_dir: string
  version: string | null
  repository: string | null
  owner_repo: string | null
}

async function readPluginInfo(): Promise<PluginInfo> {
  const pluginDir = findPluginDir()
  if (!pluginDir) {
    throw new Error(
      'Could not locate plugin directory — no .claude-plugin/plugin.json found above the cadence binary.',
    )
  }
  const manifestPath = path.join(pluginDir, '.claude-plugin', 'plugin.json')
  const raw = await readFile(manifestPath, 'utf-8')
  const manifest = JSON.parse(raw) as {
    version?: string
    repository?: string
    homepage?: string
  }
  const repository = manifest.repository ?? manifest.homepage ?? null
  return {
    plugin_dir: pluginDir,
    version: manifest.version ?? null,
    repository,
    owner_repo: parseOwnerRepo(repository),
  }
}

function findPluginDir(): string | null {
  const scriptPath = fileURLToPath(import.meta.url)
  let dir = path.dirname(scriptPath)
  for (let i = 0; i < 6; i++) {
    if (existsSync(path.join(dir, '.claude-plugin', 'plugin.json'))) {
      return dir
    }
    const nested = path.join(dir, 'cadence-plugin', '.claude-plugin', 'plugin.json')
    if (existsSync(nested)) {
      return path.join(dir, 'cadence-plugin')
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

function parseOwnerRepo(url: string | null): string | null {
  if (!url) return null
  const https = url.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/.]+?)(?:\.git)?\/?$/,
  )
  if (https) return `${https[1]}/${https[2]}`
  const ssh = url.match(/^git@github\.com:([^/]+)\/([^/.]+?)(?:\.git)?$/)
  if (ssh) return `${ssh[1]}/${ssh[2]}`
  return null
}

