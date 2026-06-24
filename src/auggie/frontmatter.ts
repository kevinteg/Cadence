/**
 * Tolerant frontmatter reader for plugin source files (SKILL.md, agents/*.md).
 *
 * These files are authored for the agent host's reader, NOT for js-yaml. Their
 * `description:` values routinely contain unescaped colons (e.g. "stamps each
 * capture with mcp: frontmatter"), which strict YAML rejects as a mapping entry.
 * The product never YAML-parses them, so the transpiler can't either.
 *
 * We only need a handful of flat, single-line scalar keys (description, name,
 * tools, model), so we read the frontmatter line-by-line: any line starting at
 * column 0 with `key:` opens a value that runs to end-of-line; subsequent
 * indented lines are appended (for the rare folded value). This sidesteps YAML's
 * colon-in-scalar problem entirely.
 */

export interface PluginDoc {
  data: Record<string, string>
  content: string
}

const FENCE = /^---\s*$/

export function readPluginFrontmatter(raw: string): PluginDoc {
  const lines = raw.split('\n')
  if (!lines[0] || !FENCE.test(lines[0])) {
    return { data: {}, content: raw }
  }
  let end = -1
  for (let i = 1; i < lines.length; i++) {
    if (FENCE.test(lines[i] as string)) {
      end = i
      break
    }
  }
  if (end === -1) return { data: {}, content: raw }

  const data: Record<string, string> = {}
  let lastKey: string | null = null
  for (let i = 1; i < end; i++) {
    const line = lines[i] as string
    const m = line.match(/^([A-Za-z_][\w-]*):\s?(.*)$/)
    if (m) {
      lastKey = m[1] as string
      data[lastKey] = (m[2] ?? '').trim()
    } else if (lastKey && line.trim().length > 0) {
      // Continuation of a folded scalar.
      data[lastKey] = (data[lastKey] + ' ' + line.trim()).trim()
    }
  }

  const content = lines.slice(end + 1).join('\n')
  return { data, content }
}
