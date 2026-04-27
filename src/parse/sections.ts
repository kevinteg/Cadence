/**
 * Extract markdown sections keyed by H2 header (## Foo). Returns a map from
 * lowercased header → body text (without the header line). Code fences are
 * preserved within sections; nested headings (### or deeper) stay inside the
 * parent section.
 */
export function extractSections(content: string): Map<string, string> {
  const sections = new Map<string, string>()
  const lines = content.split('\n')
  let currentKey: string | null = null
  let currentLines: string[] = []
  let inFence = false

  const flush = () => {
    if (currentKey === null) return
    sections.set(currentKey, currentLines.join('\n').trim())
    currentLines = []
  }

  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence
      if (currentKey !== null) currentLines.push(line)
      continue
    }
    if (!inFence) {
      const h2 = /^##\s+(.+?)\s*$/.exec(line)
      if (h2) {
        flush()
        currentKey = (h2[1] ?? '').toLowerCase()
        continue
      }
    }
    if (currentKey !== null) currentLines.push(line)
  }
  flush()

  return sections
}

/**
 * Extract the first paragraph of body content (before any H2). Used as the
 * description for pursuits and projects when no explicit description is set.
 */
export function extractDescription(content: string): string {
  const lines = content.split('\n')
  const collected: string[] = []
  let started = false
  for (const line of lines) {
    if (/^##?\s+/.test(line)) {
      if (started) break
      // Allow a leading H1 title — skip it
      if (/^#\s+/.test(line)) continue
      break
    }
    if (line.trim() === '') {
      if (started) break
      continue
    }
    started = true
    collected.push(line.trim())
  }
  return collected.join(' ').trim()
}
