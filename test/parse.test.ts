import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { parseFrontmatter } from '../src/parse/frontmatter.ts'
import { parseChecklist } from '../src/parse/checklist.ts'
import {
  extractSections,
  extractDescription,
} from '../src/parse/sections.ts'

test('parseFrontmatter splits YAML frontmatter from body', () => {
  const raw = `---
id: foo
status: active
---

# Title

Body text.
`
  const { data, content } = parseFrontmatter(raw)
  assert.equal(data['id'], 'foo')
  assert.equal(data['status'], 'active')
  assert.match(content, /Body text\./)
})

test('parseFrontmatter returns empty data for files without frontmatter', () => {
  const { data, content } = parseFrontmatter('# Just a title\n\nbody')
  assert.deepEqual(data, {})
  assert.match(content, /Just a title/)
})

test('parseFrontmatter handles arrays and nested objects', () => {
  const raw = `---
waiting_for:
  - person: alice
    what: review
    expected: 2026-04-30
---
body
`
  const { data } = parseFrontmatter(raw)
  const wf = data['waiting_for'] as Array<{ person: string }>
  assert.equal(wf.length, 1)
  assert.equal(wf[0]?.person, 'alice')
})

test('parseChecklist parses unchecked and checked items', () => {
  const text = `- [ ] one
- [x] two
- [X] three uppercase
`
  const items = parseChecklist(text)
  assert.equal(items.length, 3)
  assert.deepEqual(items[0], { text: 'one', checked: false })
  assert.deepEqual(items[1], { text: 'two', checked: true })
  assert.deepEqual(items[2], { text: 'three uppercase', checked: true })
})

test('parseChecklist ignores lines that are not list items', () => {
  const text = `Some prose.

- [ ] real item
not a list item
- not a checkbox

- [x] another
`
  const items = parseChecklist(text)
  assert.equal(items.length, 2)
  assert.equal(items[0]?.text, 'real item')
  assert.equal(items[1]?.text, 'another')
})

test('parseChecklist handles indented items', () => {
  const text = `  - [ ] indented
    - [x] more indented
`
  const items = parseChecklist(text)
  assert.equal(items.length, 2)
  assert.equal(items[1]?.checked, true)
})

test('extractSections keys by H2 header (lowercased)', () => {
  const content = `# Title

intro

## Definition of Done

- [ ] one
- [x] two

## Actions

- [ ] do thing

## Notes

free text
`
  const sections = extractSections(content)
  assert.ok(sections.has('definition of done'))
  assert.ok(sections.has('actions'))
  assert.ok(sections.has('notes'))
  assert.match(sections.get('definition of done')!, /\[ \] one/)
  assert.match(sections.get('actions')!, /do thing/)
})

test('extractSections preserves code fences and ignores headers inside them', () => {
  const content = `## Code

\`\`\`
## not a real header
text
\`\`\`

after
`
  const sections = extractSections(content)
  assert.equal(sections.size, 1)
  assert.match(sections.get('code')!, /not a real header/)
})

test('extractDescription returns first paragraph after H1, skipping the title', () => {
  const content = `# Title

This is the description.
Continued on next line.

More body.
`
  const desc = extractDescription(content)
  assert.equal(desc, 'This is the description. Continued on next line.')
})

test('extractDescription handles missing H1', () => {
  const content = `Just a body line.
And another.

Second paragraph.
`
  assert.equal(
    extractDescription(content),
    'Just a body line. And another.',
  )
})

test('extractDescription returns empty for empty content', () => {
  assert.equal(extractDescription(''), '')
})
