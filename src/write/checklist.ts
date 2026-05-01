import { extractSections } from '../parse/sections.js'

const ITEM_RE = /^(\s*-\s+\[)([ xX])(\]\s+)(.+?)(\s*)$/

export type ToggleResult = {
  body: string
  matched: string
}

/**
 * Toggle a checklist item in a named section. `match` is either a
 * 0-based index into the section's items or a substring (case-insensitive).
 * Returns the new body and the matched item text.
 */
export function toggleChecklistItem(
  body: string,
  sectionName: string,
  match: string | number,
  checked: boolean,
): ToggleResult {
  const result = mutateInSection(body, sectionName, (line, itemIndex, item) => {
    if (item === undefined) return null
    const isMatch =
      typeof match === 'number'
        ? itemIndex === match
        : item.text.toLowerCase().includes(match.toLowerCase())
    if (!isMatch) return null
    const re = ITEM_RE.exec(line)
    if (!re) return null
    const [, lead, , close, rest, trail] = re
    return {
      newLine: `${lead}${checked ? 'x' : ' '}${close}${rest}${trail}`,
      matchedText: item.text,
    }
  })
  if (!result) {
    throw new Error(
      `no checklist item matched "${match}" in section "${sectionName}"`,
    )
  }
  return result
}

export function appendChecklistItem(
  body: string,
  sectionName: string,
  text: string,
  checked = false,
): string {
  const sectionRe = headerRegex(sectionName)
  const lines = body.split('\n')
  const startIdx = lines.findIndex((l) => sectionRe.test(l))
  if (startIdx < 0) {
    // Section doesn't exist — append at end.
    const trailing = lines[lines.length - 1] === '' ? '' : '\n'
    return (
      body.replace(/\n+$/, '') +
      `\n\n## ${capitalize(sectionName)}\n- [${checked ? 'x' : ' '}] ${text}` +
      trailing
    )
  }
  // Find insertion point: end of this section (next H2 or EOF).
  let endIdx = lines.length
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i] ?? '')) {
      endIdx = i
      break
    }
  }
  // Skip trailing blanks within the section.
  while (endIdx > startIdx + 1 && (lines[endIdx - 1] ?? '').trim() === '') {
    endIdx--
  }
  const before = lines.slice(0, endIdx)
  const after = lines.slice(endIdx)
  before.push(`- [${checked ? 'x' : ' '}] ${text}`)
  return [...before, ...after].join('\n')
}

function mutateInSection(
  body: string,
  sectionName: string,
  fn: (
    line: string,
    itemIndex: number,
    item: { text: string; checked: boolean } | undefined,
  ) => { newLine: string; matchedText: string } | null,
): ToggleResult | null {
  const sectionRe = headerRegex(sectionName)
  const lines = body.split('\n')
  let inSection = false
  let itemIndex = 0
  let result: ToggleResult | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (sectionRe.test(line)) {
      inSection = true
      itemIndex = 0
      continue
    }
    if (inSection && /^##\s+/.test(line)) {
      inSection = false
    }
    if (!inSection) continue
    const re = ITEM_RE.exec(line)
    if (!re) continue
    const text = re[4] ?? ''
    const checked = (re[2] ?? ' ').toLowerCase() === 'x'
    const out = fn(line, itemIndex, { text, checked })
    itemIndex++
    if (out) {
      lines[i] = out.newLine
      result = { body: lines.join('\n'), matched: out.matchedText }
      // Use the first match.
      return result
    }
  }
  return result
}

function headerRegex(sectionName: string): RegExp {
  // Match `## <name>` case-insensitively, allowing trailing whitespace.
  const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^##\\s+${escaped}\\s*$`, 'i')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Append a free-form paragraph to a named section. Used for ## Notes
 * style sections that aren't checklists. Creates the section if it
 * doesn't exist. Inserts a blank line before the new paragraph if the
 * section already has content.
 */
export function appendParagraphToSection(
  body: string,
  sectionName: string,
  text: string,
): string {
  const sectionRe = headerRegex(sectionName)
  const lines = body.split('\n')
  const startIdx = lines.findIndex((l) => sectionRe.test(l))
  if (startIdx < 0) {
    const trailing = body.endsWith('\n') ? '' : '\n'
    return (
      body.replace(/\n+$/, '') +
      `\n\n## ${capitalize(sectionName)}\n\n${text}` +
      trailing
    )
  }
  // Find end of section (next H2 or EOF).
  let endIdx = lines.length
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i] ?? '')) {
      endIdx = i
      break
    }
  }
  // Skip trailing blanks within the section.
  while (endIdx > startIdx + 1 && (lines[endIdx - 1] ?? '').trim() === '') {
    endIdx--
  }
  const before = lines.slice(0, endIdx)
  const after = lines.slice(endIdx)
  // Add a blank separator if the existing section content isn't blank
  // and we have content beyond the header.
  if (
    endIdx > startIdx + 1 &&
    (before[before.length - 1] ?? '').trim() !== ''
  ) {
    before.push('')
  }
  before.push(text)
  return [...before, ...after].join('\n')
}

/**
 * Compute action and DoD progress from a project body by re-parsing
 * the checklist sections. Used by mutating commands to return updated
 * progress alongside their write, eliminating the need for a follow-up
 * scan call.
 */
export function computeProjectProgress(body: string): {
  dodProgress: { done: number; total: number }
  actionProgress: { done: number; total: number }
} {
  return {
    dodProgress: progressFor(body, 'Definition of Done'),
    actionProgress: progressFor(body, 'Actions'),
  }
}

function progressFor(
  body: string,
  sectionName: string,
): { done: number; total: number } {
  const sectionRe = headerRegex(sectionName)
  const lines = body.split('\n')
  let inSection = false
  let total = 0
  let done = 0
  for (const line of lines) {
    if (sectionRe.test(line)) {
      inSection = true
      continue
    }
    if (inSection && /^##\s+/.test(line)) inSection = false
    if (!inSection) continue
    const m = ITEM_RE.exec(line)
    if (!m) continue
    total++
    if ((m[2] ?? ' ').toLowerCase() === 'x') done++
  }
  return { done, total }
}
