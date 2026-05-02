import type {
  Idea,
  Project,
  Pursuit,
  Snapshot,
} from '../types.js'

export function renderPursuits(snapshot: Snapshot): string {
  const out: string[] = []
  out.push('Pursuits')
  out.push('')
  const active = snapshot.pursuits.filter((p) => p.lifecycle === 'active')
  const someday = snapshot.pursuits.filter((p) => p.lifecycle === 'someday')
  const archivedCount = snapshot.pursuits.filter(
    (p) => p.lifecycle === 'archived',
  ).length

  if (active.length > 0) {
    out.push('Active:')
    let idx = 1
    for (const p of active) {
      const counts = projectCounts(snapshot, p.id)
      out.push(
        `  ${idx}. ${p.id} — ${counts.active} active | ${counts.on_hold} on_hold | ${counts.done} done`,
      )
      idx++
    }
    out.push('')
  }
  if (someday.length > 0) {
    out.push('Someday:')
    let idx = active.length + 1
    for (const p of someday) {
      const desc = firstLine(p.description)
      out.push(`  ${idx}. ${p.id}${desc ? ` — "${desc}"` : ''}`)
      idx++
    }
    out.push('')
  }
  if (archivedCount > 0) {
    out.push(`[${archivedCount} archived hidden]`)
  }
  out.push('')
  out.push('Available actions:')
  for (const line of pursuitsListMenu()) out.push('  ' + line)
  return out.join('\n')
}

export function renderPursuit(snapshot: Snapshot, pursuitId: string): string {
  const pursuit = snapshot.pursuits.find((p) => p.id === pursuitId)
  if (!pursuit) return `pursuit not found: ${pursuitId}`
  const projects = snapshot.projects.filter((p) => p.pursuit === pursuitId)
  const active = projects.filter((p) => p.status === 'active')
  const onHold = projects.filter((p) => p.status === 'on_hold')
  const done = projects.filter((p) => p.status === 'done')

  const out: string[] = []
  const total = active.length + onHold.length + done.length
  out.push(`${pursuit.id} — ${done.length}/${total} projects done`)
  out.push('')

  let idx = 1
  if (active.length > 0) {
    out.push('Active:')
    for (const p of active) {
      out.push(formatProjectLine(idx, p))
      idx++
    }
    out.push('')
  }
  if (onHold.length > 0) {
    out.push('On hold:')
    for (const p of onHold) {
      out.push(formatProjectLine(idx, p))
      idx++
    }
    out.push('')
  }
  if (done.length > 0) {
    out.push(`[${done.length} done projects hidden]`)
  }
  out.push('')
  out.push('Available actions:')
  for (const line of pursuitMenu(pursuit.id)) out.push('  ' + line)
  return out.join('\n')
}

export function renderProject(
  snapshot: Snapshot,
  projectId: string,
  pursuitHint?: string,
): string {
  const candidates = snapshot.projects.filter((p) => p.id === projectId)
  let project: Project | undefined
  if (pursuitHint) {
    project = candidates.find((p) => p.pursuit === pursuitHint)
  }
  if (!project) project = candidates[0]
  if (!project) return `project not found: ${projectId}`

  const out: string[] = []
  const startedTag = project.status === 'on_hold' ? ' [not started]' : ''
  out.push(
    `${project.id} — ${project.actionProgress.done}/${project.actionProgress.total} actions [${project.status}]${startedTag}`,
  )
  out.push('')

  if (project.intent && project.intent.length > 0) {
    out.push('Intent:')
    for (const line of project.intent.split('\n')) {
      out.push(`  ${line}`)
    }
    out.push('')
  }
  if (project.dod.length > 0) {
    out.push('Definition of Done (legacy):')
    for (const item of project.dod) {
      out.push(`  - [${item.checked ? 'x' : ' '}] ${item.text}`)
    }
    out.push('')
  }
  if (project.actions.length > 0) {
    out.push('Actions:')
    for (const item of project.actions) {
      out.push(`  - [${item.checked ? 'x' : ' '}] ${item.text}`)
    }
    out.push('')
  }
  if (project.waiting_for.length > 0) {
    out.push('Waiting for:')
    for (const w of project.waiting_for) {
      const flag = w.flagged ? ' [flagged]' : ''
      out.push(`  - ${w.person} re: ${w.what} (expected ${w.expected})${flag}`)
    }
    out.push('')
  }
  out.push('Available actions:')
  for (const line of projectMenu(project.id, project.status)) {
    out.push('  ' + line)
  }
  return out.join('\n').trimEnd()
}

export function renderIdeas(ideas: Idea[]): string {
  if (ideas.length === 0) return 'No ideas match.'
  const out: string[] = []
  for (const i of ideas) {
    out.push(
      `- ${i.id} [${i.state}] parent=${i.parent} age=${i.ageDays}d` +
        (i.closed_reason ? `\n    closed: ${i.closed_reason}` : ''),
    )
  }
  return out.join('\n')
}

function projectCounts(snapshot: Snapshot, pursuitId: string) {
  const projects = snapshot.projects.filter((p) => p.pursuit === pursuitId)
  return {
    active: projects.filter((p) => p.status === 'active').length,
    on_hold: projects.filter((p) => p.status === 'on_hold').length,
    done: projects.filter((p) => p.status === 'done').length,
  }
}

function formatProjectLine(idx: number, p: Project): string {
  const desc = firstLine(p.intent || p.description)
  const not_started = p.status === 'on_hold' ? ' [not started]' : ''
  const tail = desc ? `: ${desc}` : ''
  return `  ${idx}. ${p.id}${tail} — ${p.actionProgress.done}/${p.actionProgress.total} actions${not_started}`
}

function firstLine(text: string): string {
  const line = text.split('\n')[0]?.trim() ?? ''
  return line.length > 120 ? line.slice(0, 117) + '...' : line
}

// keep Pursuit referenced for future drill-downs that need pursuit-level fields
void ((_: Pursuit) => null)

// Inline action menus per drill-down view. Wording uses two-column
// layout (verb + one-line hint). Always-on for v1 — discoverability
// over noise. A quieter mode is a follow-up consideration.

const MENU_PAD = 36

function pad(verb: string): string {
  return verb.length >= MENU_PAD ? verb + '  ' : verb.padEnd(MENU_PAD)
}

function pursuitsListMenu(): string[] {
  return [
    `${pad('/cadence:status <id|N>')}Drill into a pursuit`,
    `${pad('/cadence:start')}Pick a project to work on`,
    `${pad('/cadence:reflect')}Weekly review`,
    `${pad('/cadence:help')}Browse the full verb surface`,
  ]
}

function pursuitMenu(_pursuitId: string): string[] {
  return [
    `${pad('/cadence:start')}Pick a project to work on`,
    `${pad('/cadence:status <project|N>')}Drill into a project`,
    `${pad('/cadence:narrate <pursuit>')}Tell the pursuit's full arc`,
    `${pad('/cadence:resolve <pursuit>')}Walk the closure ritual`,
    `${pad('/cadence:help')}Browse the full verb surface`,
  ]
}

function projectMenu(
  _projectId: string,
  status: 'active' | 'on_hold' | 'done' | 'dropped',
): string[] {
  if (status === 'done' || status === 'dropped') {
    return [
      `${pad('/cadence:narrate <project>')}Tell this project's story`,
      `${pad('/cadence:status')}Back to dashboard`,
      `${pad('/cadence:help')}Browse the full verb surface`,
    ]
  }
  return [
    `${pad('/cadence:start <project>')}Open the project view`,
    `${pad('/cadence:complete <action>')}Mark an action done`,
    `${pad('/cadence:resolve <project>')}Wrap up (--state complete | dropped)`,
    `${pad('/cadence:waiting <project>')}Track an external blocker`,
    `${pad('/cadence:narrate <project>')}Tell this project's story`,
    `${pad('/cadence:help')}Browse the full verb surface`,
  ]
}
