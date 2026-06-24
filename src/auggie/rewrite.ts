/**
 * Token-rewrite passes for the Auggie transpiler.
 *
 * This is the SINGLE shared surface every transpiled artifact body passes
 * through. Source plugin prose is written for the Claude Code host; the rules
 * below neutralize host-specific terms to platform-agnostic phrasing so the
 * generated Auggie build reads correctly without naming a foreign tool.
 *
 * Rules are an ordered, reviewable list (order matters — earlier rules can
 * feed later ones). Each rule is regex-or-string based and named so tests and
 * `build-auggie --check` can reason about them. Extra rules can be layered in
 * via the overrides file (see overrides.ts → rewrite.extraRules).
 */

export interface RewriteRule {
  /** Stable identifier for tests / debugging. */
  name: string
  /** Pattern to match. Strings are treated as global literal replacements. */
  pattern: RegExp | string
  /** Replacement string (supports `$1` capture refs when pattern is a RegExp). */
  replacement: string
}

/**
 * The default, ordered rewrite rules. Keep the slash-command and `cadence:`
 * identifier rules FIRST — neutralizing the namespace separator is the single
 * most load-bearing transform (Auggie commands and subagents are flat-named).
 */
export const DEFAULT_RULES: RewriteRule[] = [
  // 1. Slash commands: `/cadence:` → `/cadence-` (Auggie commands are flat files
  //    under .augment/commands/, invoked /cadence-verb). The leading slash makes
  //    this unambiguously the command namespace — never a YAML key — so the swap
  //    is safe even for placeholders (`/cadence:<verb>`) and the bare prefix.
  {
    name: 'slash-command-namespace',
    pattern: /\/cadence:/g,
    replacement: '/cadence-',
  },
  // 2. Bare `cadence:name` identifiers (subagent ids like `cadence:narrator`,
  //    referenced in prose and dispatch instructions) → `cadence-name` to match
  //    the flat Auggie subagent names emitted by the transpiler.
  {
    name: 'subagent-identifier-namespace',
    pattern: /\bcadence:([a-z][\w-]*)/g,
    replacement: 'cadence-$1',
  },
  // 3. Subagent dispatch phrasing → platform-neutral.
  {
    name: 'agent-tool-phrase',
    pattern: /\bthe Agent tool\b/g,
    replacement: 'the subagent dispatcher',
  },
  {
    name: 'agent-tool-via',
    pattern: /\bvia (?:the )?`?Agent`? tool\b/g,
    replacement: 'via the subagent dispatcher',
  },
  // 4. Host-internals teaching nouns → platform-agnostic.
  //    "Claude-Code-internals teaching" / "Claude Code internals" → "agent-host internals".
  {
    name: 'cc-internals-hyphenated',
    pattern: /Claude[- ]Code[- ]internals/g,
    replacement: 'agent-host internals',
  },
  // 5. Possessive "Claude Code's plugin loader" → "the agent host's plugin loader".
  {
    name: 'cc-possessive',
    pattern: /Claude Code's/g,
    replacement: "the agent host's",
  },
  // 6. Remaining standalone "Claude Code" → "the agent host".
  {
    name: 'cc-standalone',
    pattern: /\bClaude Code\b/g,
    replacement: 'the agent host',
  },
  // 7. ToolSearch (a host-specific tool) → platform-neutral "tool discovery".
  {
    name: 'toolsearch',
    pattern: /\bToolSearch\b/g,
    replacement: 'tool discovery',
  },
  // 8. ${CLAUDE_PLUGIN_ROOT} appearing in prose → "the plugin root". (The hooks
  //    transform handles the real settings.json command path separately.)
  {
    name: 'plugin-root-var',
    pattern: /\$\{CLAUDE_PLUGIN_ROOT\}/g,
    replacement: 'the plugin root',
  },
]

function toGlobalRegex(pattern: RegExp | string): RegExp {
  if (typeof pattern === 'string') {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(escaped, 'g')
  }
  return pattern.flags.includes('g')
    ? pattern
    : new RegExp(pattern.source, pattern.flags + 'g')
}

/** Apply an ordered rule list to a body of text. */
export function applyRewrites(
  text: string,
  rules: RewriteRule[] = DEFAULT_RULES,
): string {
  let out = text
  for (const rule of rules) {
    out = out.replace(toGlobalRegex(rule.pattern), rule.replacement)
  }
  return out
}

/**
 * Verification helper: returns any residual `/cadence:` or `cadence:<verb>`
 * tokens that survived the rewrite. Used by tests and `--check` to assert the
 * namespace neutralization was complete.
 */
export function findResidualNamespaceTokens(text: string): string[] {
  const matches = text.match(/\/?\bcadence:[a-z][\w-]*/g)
  return matches ? Array.from(new Set(matches)) : []
}
