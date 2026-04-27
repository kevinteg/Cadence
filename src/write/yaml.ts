import yaml from 'js-yaml'

/**
 * Serialize a plain object to YAML using CORE_SCHEMA so date-shaped
 * strings (e.g., "2026-04-27") stay as strings on the way out, matching
 * the parse-side convention.
 */
export function dumpYaml(data: Record<string, unknown>): string {
  return yaml.dump(data, {
    schema: yaml.CORE_SCHEMA,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  })
}

/**
 * Format a frontmatter file: --- yaml --- followed by body. Trailing
 * newline ensured. Body leading newlines normalized to a single blank
 * line after the frontmatter fence.
 */
export function formatFrontmatterFile(
  data: Record<string, unknown>,
  body: string,
): string {
  const yamlText = dumpYaml(data).trimEnd()
  const trimmedBody = body.replace(/^\n+/, '').replace(/\n+$/, '')
  return `---\n${yamlText}\n---\n\n${trimmedBody}\n`
}
