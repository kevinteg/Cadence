import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const QUEUE_DIR = 'validations'
const QUEUE_FILENAME = 'pending.md'

const HEADER = `# Pending Validations

Behaviors that need fresh-session verification. The SessionStart hook
surfaces these on every fresh session until cleared. Add via
\`cadence pending-validation add --description "..."\`; clear via
\`cadence pending-validation clear --match "..."\` after running the
verification in a fresh session.

`

export interface PendingValidation {
  timestamp: string // ISO-8601
  description: string
  raw_line: string
}

const ENTRY_RE = /^-\s+(\S+)\s+—\s+(.+?)\s*$/u

function queuePath(repoRoot: string): string {
  return path.join(repoRoot, QUEUE_DIR, QUEUE_FILENAME)
}

export function readPendingValidations(
  repoRoot: string,
): PendingValidation[] {
  const filePath = queuePath(repoRoot)
  if (!existsSync(filePath)) {
    return []
  }
  const raw = readFileSync(filePath, 'utf8')
  const entries: PendingValidation[] = []
  for (const line of raw.split(/\r?\n/u)) {
    const match = line.match(ENTRY_RE)
    if (!match) continue
    const [, timestamp, description] = match
    if (!timestamp || !description) continue
    entries.push({ timestamp, description, raw_line: line })
  }
  return entries
}

function writeQueue(repoRoot: string, entries: PendingValidation[]): void {
  const dir = path.join(repoRoot, QUEUE_DIR)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  const filePath = queuePath(repoRoot)
  if (entries.length === 0) {
    // File becomes header-only when empty so the path stays tracked
    // and the contract (file present == queue exists, body == entries)
    // is uniform.
    writeFileSync(filePath, HEADER)
    return
  }
  const body = entries.map((e) => `- ${e.timestamp} — ${e.description}`).join(
    '\n',
  )
  writeFileSync(filePath, HEADER + body + '\n')
}

export function addPendingValidation(
  repoRoot: string,
  description: string,
  now: Date = new Date(),
): PendingValidation {
  const entries = readPendingValidations(repoRoot)
  const trimmed = description.trim().replace(/\s+/gu, ' ')
  if (trimmed.length === 0) {
    throw new Error('description must not be empty')
  }
  const entry: PendingValidation = {
    timestamp: now.toISOString(),
    description: trimmed,
    raw_line: `- ${now.toISOString()} — ${trimmed}`,
  }
  entries.push(entry)
  writeQueue(repoRoot, entries)
  return entry
}

export function clearPendingValidations(
  repoRoot: string,
  predicate: (entry: PendingValidation) => boolean,
): PendingValidation[] {
  const entries = readPendingValidations(repoRoot)
  const cleared: PendingValidation[] = []
  const remaining: PendingValidation[] = []
  for (const e of entries) {
    if (predicate(e)) cleared.push(e)
    else remaining.push(e)
  }
  writeQueue(repoRoot, remaining)
  return cleared
}
