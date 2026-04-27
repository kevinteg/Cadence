import type { ChecklistItem } from '../types.js'

const ITEM_RE = /^\s*-\s+\[([ xX])\]\s+(.+?)\s*$/

export function parseChecklist(text: string): ChecklistItem[] {
  const items: ChecklistItem[] = []
  for (const line of text.split('\n')) {
    const match = ITEM_RE.exec(line)
    if (!match) continue
    const mark = match[1] ?? ' '
    const itemText = match[2] ?? ''
    items.push({
      text: itemText,
      checked: mark.toLowerCase() === 'x',
    })
  }
  return items
}
