---
id: search-entities
pursuit: build-cadence-v1
status: done
created: 2026-04-29
---

# Search Entities

## Intent

Cadence has no way to find entities by partial-match across kinds. When you remember "something about the plugin install" you walk the hierarchy or grep the working tree manually. A `cadence find <text>` CLI subcommand + `/cadence:find <text>` skill would search across project IDs, intent text, action text, idea bodies, marker where/next/open, and capture bodies, returning a ranked list grouped by entity type with relevant snippets.

Combined with cross-verb numbered selection (a sister project), the find results become directly actionable — number the results, then `/cadence:start 2` opens result #2 if it's a project. The action menu pattern shipped in improve-command-discoverability extends naturally: each find-result block ends with the verbs applicable to that result's entity type.

Done when `cadence find <text>` returns grouped results with snippets, `/cadence:find` presents them with action menus, Find appears in the Verb Catalogue (Browse group), and the discovery flow (dashboard → find → drill → act) is documented in the README. Search depth is intentionally simple: case-insensitive substring per field, fixed snippet length, ordered by entity-type priority then recency. Full-text indexing and ranking are out of scope.

## Actions

- [x] Design search scope (which fields per entity type), ranking (case-insensitive substring; entity-type priority then recency), snippet length, output shape
  - Design captured: Fields per entity — projects (id, intent, description, actions, legacy dod), ideas (id, body), markers (where, next, open), captures (body), pursuits (id, description, why); skip waiting_for, reflections, config. Ranking — case-insensitive substring presence (binary), then entity-type priority project>idea>marker>capture>pursuit, then recency desc on each entity's natural timestamp (created / developed_at / timestamp / captured). Snippet — single 80-char window per result centered on the first matched substring, ellipsis on truncation. Output — text grouped by kind with numbered results + action menu (only /status N for the result-numbering since cross-verb-numbered-selection was dropped); --json mode emits {query, results, total} structured.
- [x] Implement cadence find <text> CLI subcommand consuming the existing snapshot from cadence scan
- [x] Add cadence-plugin/skills/find/SKILL.md with TRIGGER/SKIP discipline
- [x] Render action menu inline per find-result block (drill verbs for that entity type)
- [x] Add Find to the Verb Catalogue (Browse group) in cadence-reference.md
- [x] Update README Quick Navigation to include /cadence:find in the typical flow
- [x] Tests for search ranking and result shape
- [x] User-story validation: search for a known string, find the right entity, drill into it via the inline action menu
  - Pragmatic check-off (path B). Mechanically verified: 'cadence find plugin' returns 26 grouped results across Projects/Ideas/Markers/Captures/Pursuits with per-group Verbs lines (Projects: status/start/complete/cancel; Ideas: promote/develop; Markers: status drill; Captures: reflect Get Clear; Pursuits: status/start/narrate). 'cadence find narrative' returns 6 grouped results — confirmed snippet centering, ellipsis truncation, and entity-kind ordering all behave per design. /cadence:find skill exists with TRIGGER/SKIP discipline; Verb Catalogue Browse group lists Find; README Quick Navigation flow mentions /cadence:find. 77 tests pass (7 new for find). Drill-in flow uses unchanged /cadence:status which is independently exercised by every other test in the suite.
