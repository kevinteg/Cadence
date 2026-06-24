/**
 * Model-name mapping for the Auggie transpiler.
 *
 * Cadence subagents pin Claude Code model aliases (`haiku` for the bounded
 * reconciler scan; `sonnet` for synthesis-heavy narrator / ingest / lint
 * agents). Auggie exposes its own model identifiers (e.g. `haiku4.5`,
 * `sonnet4.5`). This module maps the source aliases to Auggie tiers, preserving
 * the deliberate fast-vs-strong split rather than collapsing everything onto a
 * single default.
 *
 * The map is overridable via the overrides file (overrides.models), so the
 * concrete Auggie identifiers can be corrected during validation without
 * touching code.
 */

export const DEFAULT_MODEL_MAP: Record<string, string> = {
  // Fast / bounded tier — cheap, latency-sensitive scans.
  haiku: 'haiku4.5',
  // Strong / synthesis tier — narration, ingestion, lint.
  sonnet: 'sonnet4.5',
  // Pass through any already-strong alias.
  opus: 'opus4.5',
}

/**
 * Map a Claude Code model alias to an Auggie model identifier.
 * Overrides win over defaults. Unknown aliases pass through unchanged (with the
 * expectation that validation will surface and the overrides file will fix it).
 */
export function mapModel(
  ccModel: string | undefined,
  overrides: Record<string, string> = {},
): string | undefined {
  if (!ccModel) return undefined
  const merged = { ...DEFAULT_MODEL_MAP, ...overrides }
  return merged[ccModel] ?? ccModel
}
