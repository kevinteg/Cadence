import { cac } from 'cac'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { scan } from './scan/repo.js'
import { report } from './report/reconciler.js'
import { renderStatus, renderFlags } from './render/status.js'
import { renderSnapshot, renderReport } from './render/snapshot.js'
import {
  renderIdeas,
  renderMarkers,
  renderProject,
  renderPursuit,
  renderPursuits,
} from './render/drilldown.js'
import type { Idea, IdeaState, Marker } from './types.js'
import { createPursuit } from './write/pursuit.js'
import { createProject } from './write/project.js'
import { createIdea } from './write/idea.js'
import { writeMarker } from './write/marker.js'
import { writeCapture } from './write/capture.js'
import { writeReflection } from './write/reflection.js'
import {
  addItem,
  addWaitingFor,
  checkItem,
  flagWaitingFor,
  setIdeaState,
  setProjectStatus,
} from './write/edits.js'
import { movePursuit } from './write/move.js'

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
    if (opts.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + '\n')
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
      if (opts.hookOutput) {
        const text =
          renderStatus(result) +
          '\n\nNext: /cadence:start to begin a session, /cadence:capture to save a thought, /cadence:status <id> to drill in.'
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
  .command('ideas', 'List ideas with optional filters')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--parent <id>', 'Filter by parent (pursuit or pursuit/project)')
  .option(
    '--state <state>',
    'Filter by state (comma-separated: seed,developed,promoted,moved,closed)',
  )
  .option('--since <date>', 'Only ideas created on/after this YYYY-MM-DD')
  .option('--json', 'Emit as JSON')
  .action(
    async (opts: {
      root?: string
      parent?: string
      state?: string
      since?: string
      json?: boolean
    }) => {
      const repoRoot = await resolveRepoRoot(opts.root)
      const snapshot = await scan(repoRoot)
      const states = opts.state
        ? (opts.state.split(',').map((s) => s.trim()) as IdeaState[])
        : undefined
      const ideas = snapshot.ideas.filter(
        (i) =>
          (!opts.parent || i.parent === opts.parent) &&
          (!states || states.includes(i.state)) &&
          (!opts.since || i.created >= opts.since),
      ) as Idea[]
      if (opts.json) {
        process.stdout.write(JSON.stringify(ideas, null, 2) + '\n')
      } else {
        process.stdout.write(renderIdeas(ideas) + '\n')
      }
    },
  )

cli
  .command('markers', 'List markers with optional filters')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--pursuit <id>', 'Filter by pursuit')
  .option('--project <id>', 'Filter by project')
  .option('--since <date>', 'Only markers on/after this YYYY-MM-DD')
  .option('--json', 'Emit as JSON')
  .action(
    async (opts: {
      root?: string
      pursuit?: string
      project?: string
      since?: string
      json?: boolean
    }) => {
      const repoRoot = await resolveRepoRoot(opts.root)
      const snapshot = await scan(repoRoot)
      const markers = snapshot.markers.filter(
        (m) =>
          (!opts.pursuit || m.pursuit === opts.pursuit) &&
          (!opts.project || m.project === opts.project) &&
          (!opts.since || m.timestamp >= opts.since),
      ) as Marker[]
      const sorted = [...markers].sort((a, b) =>
        a.timestamp < b.timestamp ? 1 : -1,
      )
      if (opts.json) {
        process.stdout.write(JSON.stringify(sorted, null, 2) + '\n')
      } else {
        process.stdout.write(renderMarkers(sorted) + '\n')
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
        ...(opts.created ? { created: opts.created } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command('create-idea <id>', 'Create a new idea (seed by default)')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--parent <parent>', 'pursuit-id or pursuit-id/project-id (required)')
  .option('--state <state>', 'seed | developed | promoted | moved | closed')
  .option('--body <text>', 'Idea body')
  .option('--created <YYYY-MM-DD>', 'Override created date (default: today)')
  .action(
    async (
      id: string,
      opts: {
        root?: string
        parent?: string
        state?: IdeaState
        body?: string
        created?: string
      },
    ) => {
      if (!opts.parent) throw new Error('--parent is required')
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await createIdea(repoRoot, {
        id,
        parent: opts.parent,
        ...(opts.state ? { state: opts.state } : {}),
        ...(opts.body ? { body: opts.body } : {}),
        ...(opts.created ? { created: opts.created } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command('write-marker', 'Write a session marker (pause)')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--pursuit <id>', 'Pursuit id (required)')
  .option('--project <id>', 'Project id (required)')
  .option('--where <text>', 'State of work')
  .option('--next <text>', 'First thing to do on return')
  .option('--open <text>', "What's still open")
  .option('--start <iso>', 'Session start ISO timestamp')
  .option('--end <iso>', 'Session end ISO timestamp')
  .option('--action-completed <text>', 'Completed action (repeatable)', {
    type: [String],
  })
  .action(
    async (opts: {
      root?: string
      pursuit?: string
      project?: string
      where?: string
      next?: string
      open?: string
      start?: string
      end?: string
      actionCompleted?: string[]
    }) => {
      if (!opts.pursuit || !opts.project) {
        throw new Error('--pursuit and --project are required')
      }
      const repoRoot = await resolveRepoRoot(opts.root)
      const actionsCompleted = multistring(opts.actionCompleted)
      const result = await writeMarker(repoRoot, {
        pursuit: opts.pursuit,
        project: opts.project,
        ...(typeof opts.where === 'string' && opts.where.length > 0
          ? { where: opts.where }
          : {}),
        ...(typeof opts.next === 'string' && opts.next.length > 0
          ? { next: opts.next }
          : {}),
        ...(typeof opts.open === 'string' && opts.open.length > 0
          ? { open: opts.open }
          : {}),
        ...(opts.start ? { session_start: opts.start } : {}),
        ...(opts.end ? { session_end: opts.end } : {}),
        ...(actionsCompleted ? { actions_completed: actionsCompleted } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command('write-capture', 'Write a thought to thoughts/unprocessed/')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--body <text>', 'Capture body (required)')
  .option('--verb-context <ctx>', 'Verb context (note | seed | concern | ...)')
  .action(
    async (opts: {
      root?: string
      body?: string
      verbContext?: string
    }) => {
      if (!opts.body) throw new Error('--body is required')
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await writeCapture(repoRoot, {
        body: opts.body,
        ...(opts.verbContext ? { verb_context: opts.verbContext } : {}),
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
  .action(
    async (
      projectId: string,
      opts: {
        root?: string
        pursuit?: string
        status?: 'active' | 'on_hold' | 'done' | 'dropped'
        reason?: string
      },
    ) => {
      if (!opts.status) throw new Error('--status is required')
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await setProjectStatus(repoRoot, {
        id: projectId,
        status: opts.status,
        ...(opts.pursuit ? { pursuit: opts.pursuit } : {}),
        ...(opts.reason ? { reason: opts.reason } : {}),
      })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

cli
  .command('set-idea-state <idea-id>', 'Update an idea state')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--parent <parent>', 'Disambiguate when idea IDs collide')
  .option(
    '--state <state>',
    'seed | developed | promoted | moved | closed (required)',
  )
  .option('--reason <text>', 'Required when --state=closed')
  .option('--promoted-to <ref>', 'Required when --state=promoted (e.g., project:foo)')
  .option('--new-parent <parent>', 'New parent when --state=moved')
  .action(
    async (
      ideaId: string,
      opts: {
        root?: string
        parent?: string
        state?: IdeaState
        reason?: string
        promotedTo?: string
        newParent?: string
      },
    ) => {
      if (!opts.state) throw new Error('--state is required')
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await setIdeaState(repoRoot, {
        id: ideaId,
        state: opts.state,
        ...(opts.parent ? { parent: opts.parent } : {}),
        ...(opts.reason ? { reason: opts.reason } : {}),
        ...(opts.promotedTo ? { promoted_to: opts.promotedTo } : {}),
        ...(opts.newParent ? { new_parent: opts.newParent } : {}),
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
  .command('add-item <project-id>', 'Append an Action item (or legacy DoD item)')
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--pursuit <id>', 'Disambiguate when project IDs collide')
  .option('--section <section>', 'dod | action (required)')
  .option('--text <text>', 'Item text (required)')
  .option('--checked', 'Add as already checked')
  .action(
    async (
      projectId: string,
      opts: {
        root?: string
        pursuit?: string
        section?: 'dod' | 'action'
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
    'Move a pursuit between active / someday / archived',
  )
  .option('--root <path>', 'Repo root (default: cwd or auto-detect)')
  .option('--to <lifecycle>', 'active | someday | archived (required)')
  .action(
    async (
      id: string,
      opts: { root?: string; to?: 'active' | 'someday' | 'archived' },
    ) => {
      if (!opts.to) throw new Error('--to is required')
      const repoRoot = await resolveRepoRoot(opts.root)
      const result = await movePursuit(repoRoot, { id, to: opts.to })
      process.stdout.write(JSON.stringify(result) + '\n')
    },
  )

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

