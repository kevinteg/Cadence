/**
 * Physical-domain detection heuristic.
 *
 * Cadence's verb surface defaults to digital/coding shapes. For non-dev
 * pursuits (household, creative practice, fitness, family logistics)
 * the verbs need to detect physical-space work and adapt their prompts
 * accordingly. This module supplies the detection layer; skills consume
 * the result via the `detected_domain` and `effective_domain` fields
 * exposed on each Project.
 *
 * Heuristic, not classifier — the user can always override via a
 * `domain:` frontmatter field on the project. The override takes
 * precedence; the heuristic only fills in when the field is absent.
 *
 * Tone target: this code shouldn't be too clever. A keyword scan with
 * sensible thresholds is enough to surface signal; ML or embeddings are
 * overkill for the current scale.
 */

export type Domain = 'physical' | 'digital' | 'hybrid' | 'unknown'

export interface DomainDetection {
  domain: Domain
  confidence: number
  evidence: {
    physical: string[]
    digital: string[]
  }
}

// Curation rule: each keyword should be a STRONG signal for its
// domain on its own. Words that legitimately appear in both contexts
// (fix, test, replace, mount, install, table, column, row, index,
// migration, level, season, practice, lift, run, cd, tap, branch,
// build) are deliberately omitted — they would create noise without
// adding signal.

const PHYSICAL_KEYWORDS: readonly string[] = [
  // Rooms / spaces
  'kitchen', 'bathroom', 'bedroom', 'garage', 'basement', 'attic',
  'garden', 'yard', 'lawn', 'driveway', 'patio', 'shed',
  'closet', 'pantry', 'hallway',
  // Tools
  'hammer', 'screwdriver', 'wrench', 'drill', 'saw', 'ladder',
  'pliers', 'crowbar', 'mallet',
  // Materials
  'lumber', 'paint', 'drywall', 'concrete', 'cement', 'mortar',
  'caulk', 'grout', 'plaster', 'fabric', 'thread', 'yarn',
  'tile', 'tiling',
  // Strong-signal repair verbs (skip ambiguous: fix, replace, install, mount)
  'repair', 'sanding', 'rewire', 'rewiring', 'plumbing',
  // Household objects / fixtures
  'sink', 'faucet', 'toilet', 'oven', 'stove', 'fridge',
  'refrigerator', 'dishwasher', 'washer', 'dryer', 'microwave',
  'couch', 'sofa', 'fixture', 'outlet', 'thermostat',
  'doorknob', 'hinge',
  // Cooking
  'cook', 'cooking', 'bake', 'baking', 'roast', 'grill',
  'simmer', 'recipe', 'ingredients', 'dough', 'batter',
  'marinade',
  // Outdoors
  'mow', 'mowing', 'prune', 'pruning', 'weed', 'weeds',
  'plant', 'planting', 'shrub', 'mulch', 'compost',
  // Body / health / fitness
  'workout', 'stretch', 'stretching', 'yoga', 'pilates',
  'gym', 'exercise', 'hike', 'hiking',
  // Family / kids / household logistics
  'kid', 'kids', 'child', 'children', 'family', 'dinner',
  'lunch', 'breakfast', 'school', 'daycare', 'soccer',
  'dentist', 'pediatrician', 'birthday', 'anniversary',
  // Creative practice (physical making)
  'painting', 'sketch', 'canvas', 'pottery', 'sculpt',
  'sculpting', 'knit', 'knitting', 'crochet', 'sew', 'sewing',
  'quilt', 'guitar', 'piano', 'violin',
  // Multi-word physical signals
  'by hand', 'in-person', 'in person',
]

const DIGITAL_KEYWORDS: readonly string[] = [
  // Code constructs (specific terms)
  'function', 'interface', 'namespace',
  // Languages
  'typescript', 'javascript', 'python', 'rust', 'golang',
  'kotlin', 'haskell', 'elixir',
  // Frameworks / runtimes
  'react', 'next.js', 'vue', 'angular', 'svelte', 'django',
  'flask', 'rails',
  // Infrastructure
  'docker', 'kubernetes', 'k8s', 'terraform', 'ansible',
  'aws', 'gcp', 'azure', 'lambda',
  // Dev tools / process (skip ambiguous: branch, build, cd, test, mr)
  'git', 'commit', 'rebase', 'pull request', 'codebase',
  'repository', 'repo', 'ci', 'pipeline', 'deploy',
  'deployment', 'compile', 'lint',
  // Data / API (skip ambiguous: index, table, column, row, migration)
  'api', 'endpoint', 'schema', 'database', 'sql', 'query',
  'json', 'yaml', 'http', 'rest', 'graphql', 'webhook',
  // Software concepts (skip ambiguous: fix, test, unit, fixture)
  'refactor', 'integration', 'regression',
  // Misc digital signals (skip ambiguous: cli, tap, click, level)
  'login', 'logout', 'auth', 'oauth', 'frontend', 'backend',
  'fullstack', 'unit test',
]

/**
 * Run the keyword heuristic on a project's intent + id. Returns the
 * detected domain plus the keywords that matched (for transparency).
 *
 * Logic:
 * - Count physical and digital keyword matches in the combined
 *   lowercase text (intent + project id, with hyphens treated as
 *   spaces for word-boundary matching).
 * - If both counts are 0 → unknown.
 * - If one count is 0 and the other ≥1 → that domain.
 * - If both ≥1: physical OR digital if one dominates by 2x or more,
 *   otherwise hybrid.
 *
 * Confidence is the dominant count, capped at 10. (Just signal — not
 * a probability. The skills should treat low confidence as a soft
 * suggestion, high confidence as a strong default.)
 */
export function detectDomain(
  intent: string,
  projectId: string,
): DomainDetection {
  const haystack = (intent + ' ' + projectId.replace(/-/gu, ' ')).toLowerCase()
  const physical = matchKeywords(haystack, PHYSICAL_KEYWORDS)
  const digital = matchKeywords(haystack, DIGITAL_KEYWORDS)

  const evidence = { physical, digital }
  const pCount = physical.length
  const dCount = digital.length

  if (pCount === 0 && dCount === 0) {
    return { domain: 'unknown', confidence: 0, evidence }
  }
  if (pCount > 0 && dCount === 0) {
    return { domain: 'physical', confidence: Math.min(pCount, 10), evidence }
  }
  if (dCount > 0 && pCount === 0) {
    return { domain: 'digital', confidence: Math.min(dCount, 10), evidence }
  }
  // Both present.
  if (pCount >= dCount * 2) {
    return { domain: 'physical', confidence: Math.min(pCount, 10), evidence }
  }
  if (dCount >= pCount * 2) {
    return { domain: 'digital', confidence: Math.min(dCount, 10), evidence }
  }
  return {
    domain: 'hybrid',
    confidence: Math.min(Math.max(pCount, dCount), 10),
    evidence,
  }
}

function matchKeywords(haystack: string, keywords: readonly string[]): string[] {
  const matched = new Set<string>()
  for (const kw of keywords) {
    if (kw.includes(' ')) {
      // Multi-word keywords already imply context — substring match.
      if (haystack.includes(kw)) matched.add(kw)
    } else {
      // Word-boundary match keeps "tile" from matching "tiles" (it
      // does — \b allows trailing s) and prevents "fix" from
      // matching "prefix". A character-class regex escape covers
      // the metachars our keyword list might contain (just `.` from
      // "next.js" today, but defensive for future additions).
      const escaped = escapeForRegex(kw)
      const re = new RegExp(`\\b${escaped}\\b`, 'iu')
      if (re.test(haystack)) matched.add(kw)
    }
  }
  return [...matched]
}

function escapeForRegex(s: string): string {
  return s.replace(/[\\^$.*+?()[\]{}|]/gu, (m) => '\\' + m)
}
