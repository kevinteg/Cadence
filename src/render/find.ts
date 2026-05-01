import type { FindKind, FindResult } from '../find.js'

const KIND_LABELS: Record<FindKind, string> = {
  project: 'Projects',
  idea: 'Ideas',
  capture: 'Captures',
  pursuit: 'Pursuits',
}

const KIND_ORDER: FindKind[] = ['project', 'idea', 'capture', 'pursuit']

// Per-entity-type verb hints. Inline at the end of each result group
// so users see what's actionable for that specific kind.
const KIND_VERBS: Record<FindKind, string[]> = {
  project: [
    '/cadence:status <id>',
    '/cadence:start <id>',
    '/cadence:complete <action>',
    '/cadence:cancel <id>',
  ],
  idea: [
    '/cadence:promote <id>',
    '/cadence:develop <id>',
  ],
  capture: ['/cadence:reflect (Get Clear) to triage'],
  pursuit: [
    '/cadence:status <id>',
    '/cadence:start (pick a project)',
    '/cadence:narrate <id>',
  ],
}

export function renderFindResults(
  results: FindResult[],
  query: string,
): string {
  if (results.length === 0) return `No matches for "${query}".`

  const grouped = new Map<FindKind, FindResult[]>()
  for (const r of results) {
    const list = grouped.get(r.kind) ?? []
    list.push(r)
    grouped.set(r.kind, list)
  }

  const out: string[] = []
  out.push(
    `Found ${results.length} match${results.length === 1 ? '' : 'es'} for "${query}"`,
  )
  out.push('')

  let n = 1
  for (const kind of KIND_ORDER) {
    const list = grouped.get(kind) ?? []
    if (list.length === 0) continue
    out.push(`${KIND_LABELS[kind]} (${list.length}):`)
    for (const r of list) {
      const idLine = formatHeader(r)
      out.push(`  ${n}. ${idLine}`)
      out.push(`     "${r.snippet}"`)
      n++
    }
    out.push(`  Verbs: ${KIND_VERBS[kind].join(' | ')}`)
    out.push('')
  }

  out.push('/cadence:help to browse the full verb surface.')
  return out.join('\n')
}

function formatHeader(r: FindResult): string {
  if (r.kind === 'idea') {
    return r.context ? `${r.id} (parent: ${r.context})` : r.id
  }
  if (r.kind === 'project') {
    return r.context ? `${r.id} (in ${r.context})` : r.id
  }
  if (r.kind === 'capture') {
    return r.id // timestamp
  }
  return r.id
}
