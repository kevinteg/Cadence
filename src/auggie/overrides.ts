/**
 * Hand-maintained overrides for the Auggie transpiler.
 *
 * The transpiler is mostly mechanical, but a few things can't be derived from
 * the Claude Code source: the concrete Auggie model identifiers, per-command
 * argument hints, optional subagent colors, the SessionStart hook command (which
 * depends on how Auggie exposes the bundled CLI), and any per-artifact prose
 * fixups discovered during validation.
 *
 * These live in a YAML file (default: src/auggie/overrides.yaml) that layers ON
 * TOP of generated output. Merge order is always: generated defaults first, then
 * overrides. The file is optional — when absent, built-in defaults apply and the
 * transpiler never hard-fails.
 */
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import yaml from 'js-yaml'
import { z } from 'zod'

export const RewriteRuleSchema = z.object({
  name: z.string(),
  pattern: z.string(),
  replacement: z.string(),
})

export const CommandOverrideSchema = z.object({
  /** Auggie `argument-hint` frontmatter (e.g. "[project]"). */
  argumentHint: z.string().optional(),
  /** Force a model override for this command. */
  model: z.string().optional(),
  /** When true, append a "$ARGUMENTS" preamble so Auggie passes raw args. */
  takesArguments: z.boolean().optional(),
})

export const AgentOverrideSchema = z.object({
  /** Auggie subagent `color` frontmatter. */
  color: z.string().optional(),
  /** Force a model override for this subagent (skips the model map). */
  model: z.string().optional(),
})

export const OverridesSchema = z.object({
  /** Claude Code model alias → Auggie model identifier. Merged over DEFAULT_MODEL_MAP. */
  models: z.record(z.string()).optional(),
  /** Per-command tweaks, keyed by source verb (e.g. "start"). */
  commands: z.record(CommandOverrideSchema).optional(),
  /** Per-subagent tweaks, keyed by source agent name (e.g. "narrator"). */
  agents: z.record(AgentOverrideSchema).optional(),
  /** Extra rewrite rules appended after the defaults. */
  rewrite: z
    .object({ extraRules: z.array(RewriteRuleSchema).optional() })
    .optional(),
  /**
   * SessionStart hook command Auggie runs (stdout is injected as context).
   * Defaults to a PATH-based invocation; override if Auggie exposes a
   * plugin-root variable or requires an absolute path.
   */
  sessionStartCommand: z.string().optional(),
})

export type Overrides = z.infer<typeof OverridesSchema>
export type CommandOverride = z.infer<typeof CommandOverrideSchema>
export type AgentOverride = z.infer<typeof AgentOverrideSchema>

export const EMPTY_OVERRIDES: Overrides = {}

/**
 * Load and validate an overrides file. Returns EMPTY_OVERRIDES when the path
 * does not exist. Throws (with a clear message) only when the file exists but is
 * malformed — so a typo is caught at the build boundary rather than silently
 * dropped.
 */
export async function loadOverrides(filePath: string): Promise<Overrides> {
  if (!existsSync(filePath)) return EMPTY_OVERRIDES
  const raw = await readFile(filePath, 'utf-8')
  const parsed = yaml.load(raw, { schema: yaml.CORE_SCHEMA }) ?? {}
  const result = OverridesSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error(
      `Invalid Auggie overrides at ${filePath}: ${result.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ')}`,
    )
  }
  return result.data
}
