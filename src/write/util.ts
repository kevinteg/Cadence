import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseFrontmatter } from '../parse/frontmatter.js'
import { formatFrontmatterFile } from './yaml.js'

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true })
}

export async function writeFrontmatterFile(
  filePath: string,
  data: Record<string, unknown>,
  body: string,
): Promise<void> {
  await ensureDir(path.dirname(filePath))
  await writeFile(filePath, formatFrontmatterFile(data, body), 'utf8')
}

export async function loadFrontmatterFile(
  filePath: string,
): Promise<{ data: Record<string, unknown>; content: string }> {
  const text = await readFile(filePath, 'utf8')
  return parseFrontmatter(text)
}

export async function mutateFrontmatter(
  filePath: string,
  mutate: (
    data: Record<string, unknown>,
    body: string,
  ) => { data: Record<string, unknown>; body: string } | Promise<{
    data: Record<string, unknown>
    body: string
  }>,
): Promise<void> {
  const { data, content } = await loadFrontmatterFile(filePath)
  const next = await mutate({ ...data }, content)
  await writeFrontmatterFile(filePath, next.data, next.body)
}

export async function moveFile(from: string, to: string): Promise<void> {
  await ensureDir(path.dirname(to))
  await rename(from, to)
}

export async function moveDir(from: string, to: string): Promise<void> {
  await ensureDir(path.dirname(to))
  await rename(from, to)
}

/**
 * Format a JS Date as the timestamp Cadence uses in filenames.
 * 2026-04-27T13:42:08Z → "2026-04-27T13-42"
 */
export function timestampSlug(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}-${pad(date.getMinutes())}`
  )
}

/**
 * Format a JS Date as ISO without subseconds, suitable for frontmatter
 * fields like `captured`, `session_start`, etc. Uses local TZ to match
 * `timestampSlug`.
 */
export function isoTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

export function dateString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
