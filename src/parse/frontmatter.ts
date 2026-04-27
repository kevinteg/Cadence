import matter from 'gray-matter'
import yaml from 'js-yaml'

export type ParsedDocument = {
  data: Record<string, unknown>
  content: string
}

const yamlEngine = {
  parse: (str: string) =>
    yaml.load(str, { schema: yaml.CORE_SCHEMA }) as object,
  stringify: (obj: object) =>
    yaml.dump(obj, { schema: yaml.CORE_SCHEMA }),
}

export function parseFrontmatter(raw: string): ParsedDocument {
  const result = matter(raw, { engines: { yaml: yamlEngine } })
  return {
    data: (result.data ?? {}) as Record<string, unknown>,
    content: result.content,
  }
}
