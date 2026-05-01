---
description: Search projects, ideas, captures, and pursuits by case-insensitive substring. TRIGGER on explicit /cadence:find invocation, OR when the user asks to find a Cadence entity by partial text by name (e.g., "find anything mentioning plugin", "search for that idea about onboarding", "where did I write about X"). SKIP for general code-search or filesystem-search requests that aren't about Cadence entities.
---

# /find

Surface entities matching a substring across all of Cadence's content
— project IDs, intent prose, action texts, idea bodies, capture
bodies, and pursuit metadata. Results are grouped by entity kind with
snippets and per-group verb hints.

## Usage

- `/find <text>` — find anything matching the substring (case-insensitive)

## Steps

1. **Run the CLI** to do the search:
   ```bash
   cadence find "<query>"
   ```
   The CLI scans the snapshot, ranks by entity-kind priority
   (Project > Idea > Capture > Pursuit) with recency as a tiebreaker,
   and returns results grouped by kind with one snippet per result and
   a per-group verb hint line.

2. **Present output verbatim.** Each group ends with a `Verbs:` line
   listing the applicable verbs for that entity kind (e.g.,
   `/cadence:promote <id>` for Ideas; `/cadence:start <id>` for
   Projects). The user can pick a result and invoke the verb directly.

3. **No drill-in agency.** This skill returns search results; it does
   not auto-drill or auto-act on a result. The user follows the
   inline verb hints.

## Fallback

If the CLI is unavailable, fall back to a manual scan:

1. `cadence scan --json` (if even partially available) and filter
   client-side by case-insensitive substring against project IDs,
   `intent`, action texts, idea bodies, and capture bodies.
2. If `cadence` is fully missing, glob the working tree (`pursuits/**/*.md`,
   `thoughts/unprocessed/*.md`) and grep — note that this is slower
   and doesn't see structural fields the same way.

## Guardrails

- **Case-insensitive substring only.** No regex, no full-text rank,
  no fuzzy. Keep search depth simple.
- **Don't reformat results.** The `Verbs:` line per group is the
  contract; the user reads it to see what's actionable.
- **No drill-in or follow-up action automatically.** The user picks
  what to do next.
