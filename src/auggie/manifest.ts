/**
 * Emit the Auggie plugin manifest from the Claude Code plugin.json.
 *
 * Auggie plugins are described by a manifest under `.augment-plugin/`. The exact
 * schema is still being pinned during validation (project: hooks-and-cli-bridge /
 * end-to-end-validation), so we mirror the well-understood, portable fields from
 * the source `.claude-plugin/plugin.json` and keep the shape close to it. Any
 * Auggie-specific manifest keys that validation surfaces get layered in here.
 */

export interface ClaudePluginManifest {
  name?: string
  version?: string
  description?: string
  author?: { name?: string; url?: string } | string
  homepage?: string
  repository?: string
  license?: string
  keywords?: string[]
}

export interface AugmentPluginManifest {
  name: string
  version: string
  description?: string
  author?: { name?: string; url?: string } | string
  homepage?: string
  repository?: string
  license?: string
  keywords?: string[]
  /** Generated-artifact marker so the source is unambiguous. */
  generated_from: string
}

export function buildAugmentManifest(
  cc: ClaudePluginManifest,
): AugmentPluginManifest {
  return {
    name: cc.name ?? 'cadence',
    version: cc.version ?? '0.0.0',
    ...(cc.description ? { description: cc.description } : {}),
    ...(cc.author ? { author: cc.author } : {}),
    ...(cc.homepage ? { homepage: cc.homepage } : {}),
    ...(cc.repository ? { repository: cc.repository } : {}),
    ...(cc.license ? { license: cc.license } : {}),
    ...(cc.keywords ? { keywords: cc.keywords } : {}),
    generated_from: 'cadence-plugin/.claude-plugin/plugin.json',
  }
}
