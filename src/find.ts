import type { Snapshot } from './types.js'

export type FindKind = 'project' | 'idea' | 'capture' | 'pursuit'

export type FindResult = {
  kind: FindKind
  id: string
  // Project: parent pursuit id. Idea: parent (pursuit or pursuit/project).
  // Marker: <pursuit>/<project>. Capture/pursuit: omitted.
  context?: string
  matched_fields: string[]
  snippet: string
  // Used as recency tiebreaker; raw form (date or ISO timestamp).
  timestamp: string
}

const KIND_PRIORITY: Record<FindKind, number> = {
  project: 1,
  idea: 2,
  marker: 3,
  capture: 4,
  pursuit: 5,
}

export function findEntities(
  snapshot: Snapshot,
  query: string,
): FindResult[] {
  const q = query.toLowerCase()
  if (q.length === 0) return []
  const results: FindResult[] = []

  for (const p of snapshot.projects) {
    const fields: Array<{ name: string; text: string }> = [
      { name: 'id', text: p.id },
      { name: 'intent', text: p.intent ?? '' },
      { name: 'description', text: p.description ?? '' },
    ]
    for (let i = 0; i < p.actions.length; i++) {
      fields.push({ name: `action[${i}]`, text: p.actions[i]!.text })
    }
    for (let i = 0; i < p.dod.length; i++) {
      fields.push({ name: `dod[${i}]`, text: p.dod[i]!.text })
    }
    const matched = fields.filter((f) => f.text.toLowerCase().includes(q))
    if (matched.length > 0) {
      results.push({
        kind: 'project',
        id: p.id,
        context: p.pursuit,
        matched_fields: matched.map((m) => m.name),
        snippet: extractSnippet(matched[0]!.text, q),
        timestamp: p.created,
      })
    }
  }

  for (const i of snapshot.ideas) {
    const fields = [
      { name: 'id', text: i.id },
      { name: 'body', text: i.body },
    ]
    const matched = fields.filter((f) => f.text.toLowerCase().includes(q))
    if (matched.length > 0) {
      results.push({
        kind: 'idea',
        id: i.id,
        context: i.parent,
        matched_fields: matched.map((m) => m.name),
        snippet: extractSnippet(matched[0]!.text, q),
        timestamp: i.developed_at ?? i.created,
      })
    }
  }

  for (const c of snapshot.captures) {
    const fields = [{ name: 'body', text: c.body }]
    const matched = fields.filter((f) => f.text.toLowerCase().includes(q))
    if (matched.length > 0) {
      results.push({
        kind: 'capture',
        id: c.captured,
        matched_fields: matched.map((mm) => mm.name),
        snippet: extractSnippet(matched[0]!.text, q),
        timestamp: c.captured,
      })
    }
  }

  for (const p of snapshot.pursuits) {
    const fields = [
      { name: 'id', text: p.id },
      { name: 'description', text: p.description ?? '' },
      { name: 'why', text: p.why ?? '' },
    ]
    const matched = fields.filter((f) => f.text.toLowerCase().includes(q))
    if (matched.length > 0) {
      results.push({
        kind: 'pursuit',
        id: p.id,
        matched_fields: matched.map((m) => m.name),
        snippet: extractSnippet(matched[0]!.text, q),
        timestamp: p.created,
      })
    }
  }

  results.sort((a, b) => {
    const pa = KIND_PRIORITY[a.kind]
    const pb = KIND_PRIORITY[b.kind]
    if (pa !== pb) return pa - pb
    if (a.timestamp === b.timestamp) return 0
    return a.timestamp < b.timestamp ? 1 : -1
  })

  return results
}

/**
 * Build a snippet around the first occurrence of `query` in `text`.
 * The window is `windowChars` characters wide centered on the match,
 * with leading/trailing ellipsis when truncated. Whitespace within
 * the snippet is collapsed for readability.
 */
export function extractSnippet(
  text: string,
  query: string,
  windowChars = 80,
): string {
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const idx = lowerText.indexOf(lowerQuery)
  if (idx < 0) {
    const head = text.slice(0, windowChars).replace(/\s+/g, ' ').trim()
    return text.length > windowChars ? head + '…' : head
  }
  const half = Math.floor((windowChars - query.length) / 2)
  const start = Math.max(0, idx - half)
  const end = Math.min(text.length, idx + query.length + half)
  let snippet = text.slice(start, end).replace(/\s+/g, ' ').trim()
  if (start > 0) snippet = '…' + snippet
  if (end < text.length) snippet = snippet + '…'
  return snippet
}
