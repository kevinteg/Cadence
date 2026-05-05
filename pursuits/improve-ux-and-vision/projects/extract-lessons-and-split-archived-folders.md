---
id: extract-lessons-and-split-archived-folders
pursuit: improve-ux-and-vision
status: active
created: 2026-05-04
---

# Extract Lessons + Split Archived/Dropped Folders

Two related needs from the v1 self-review: (1) lessons extraction across completed pursuits — the meaning-making loop the vision claims but doesn't yet provide. A cron'd narrator pass over completed pursuits that surfaces 'patterns I keep hitting' would close that loop. (2) Dropped/canceled pursuits should not be mixed in with completed ones — they're different signal. A pursuit that finished is a story of what shipped; a pursuit that got dropped is a story of what got learned without shipping. Mixing them in pursuits/_archived/ contaminates the lessons-extraction signal and erases an important distinction in the system's view of itself.

## Intent

Add a 'dropped' lifecycle state for pursuits, a corresponding pursuits/_dropped/ folder, and a /resolve <pursuit> --state dropped --reason path that walks the same Zeigarnik-release ritual as a completion close but with different framing (what did this teach you?) and routes the pursuit to the dropped folder. Then build a lessons-extraction surface as a new /narrate scope that synthesizes patterns across multiple completed (and optionally dropped) pursuits, distinct from per-pursuit closure narratives. Done feels like: a pursuit can be cleanly dropped via /resolve <pursuit> --state dropped (parallel to projects' --state dropped); the resulting drop narrative captures the teach-me content; the directory tree visibly distinguishes 'pursuits I shipped' from 'pursuits I learned from without shipping'; and /cadence:narrate lessons synthesizes a cross-pursuit summary that's read-only over the archived + dropped folders, watermarked so re-runs add only new material.

## Actions

- [x] Design the dropped lifecycle for pursuits. Add 'dropped' to the PursuitLifecycle schema in src/types.ts. Document the lifecycle transitions in cadence-runtime.md vocabulary: active → someday → archived (completed) | dropped. Pursuits drop with a reason; pursuits don't 'cancel' (project-level vocabulary preserved at project level).
- [x] Add the pursuits/_dropped/ folder convention. Update src/scan/pursuits.ts to recognize and parse pursuits in _dropped/ alongside _archived/ and _someday/. Update src/write/move.ts so move-pursuit --to dropped routes correctly. Update src/write/paths.ts so resolvePursuitDir() looks in pursuits/_dropped/ as well. Tests for the new lifecycle transition.
- [x] Extend skills/resolve/SKILL.md pursuit-level path: /resolve <pursuit> --state dropped --reason '<text>' walks the cleaning ritual (same absolute-Ideas block — dropped pursuits still need meaning-making for their unresolved seeds), then move-pursuit --to dropped instead of --to archived. Save a drop narrative (vs closure narrative) at narratives/drafts/<pursuit-id>-drop.md with framing 'what did this teach you?' rather than 'what shipped?' Suggestion: surface a tip-style framing prompt at the start ('You're ending [pursuit] without shipping. What did it teach you?').
- [x] New /narrate scope: lessons. cadence narrate lessons reads from pursuits/_archived/ AND pursuits/_dropped/ by default; --from completed restricts to archived; --from dropped restricts to dropped; --from both is the default. The narrator subagent synthesizes recurring patterns across multiple pursuits — what shows up more than once across the corpus — rather than a single pursuit's arc. Save to narratives/drafts/lessons-YYYY-MM-DD.md with watermark frontmatter (pursuits_consulted, included_dropped flag, generated_at). Re-runs read existing watermark and consume only new material.
- [x] Update cadence-plugin/cadence-reference.md to document: (a) the new dropped lifecycle state, (b) the pursuits/_dropped/ folder convention, (c) the new /narrate lessons scope and its watermark schema, (d) the resolve --state dropped path for pursuits.
- [x] Update cadence-plugin/cadence-runtime.md vocabulary section to include the dropped lifecycle and the distinction in framing (completed = what shipped; dropped = what got learned without shipping). Update Working a Project section's resolve verb description to note pursuit-level --state dropped as a valid path.
- [x] Migration consideration: existing archived pursuits stay where they are. cadence-performance-and-indexing was archived after being absorbed into improve-ux-and-vision; technically that's neither cleanly 'completed' nor 'dropped' but it's already in _archived and shouldn't be retroactively moved without lived signal. If future archived pursuits surface as misclassified, address case-by-case. Do NOT auto-migrate any existing archives. Document this decision in the project's Notes.

## Notes

### Schema + scan + write changes

- `src/types.ts` — `PursuitLifecycleSchema` and `PursuitStatusSchema` both gain `'dropped'` as a fourth value (alongside active / someday / archived).
- `src/scan/pursuits.ts` — `LIFECYCLE_ROOTS` gains `{ lifecycle: 'dropped', glob: 'pursuits/_dropped/*/pursuit.md' }`.
- `src/write/move.ts` — `MovePursuitOpts.to` accepts `'dropped'`; routes to `pursuits/_dropped/`.
- `src/write/paths.ts` — `resolvePursuitDir` checks the `_dropped/` folder alongside `_someday/` and `_archived/`.
- `src/cli.ts` — `move-pursuit --to <lifecycle>` flag string and validator updated to include `dropped`.
- `test/write.test.ts` — two new cases (move-pursuit to dropped routes correctly; scan distinguishes archived from dropped). 110 tests pass.

### `/narrate lessons` design

- New cadence: `lessons`. Reserved keyword alongside `today`, `week`, `month`, `year`.
- Target file: `narratives/drafts/lessons-YYYY-MM-DD.md`.
- Source corpus: `pursuits/_archived/` + `pursuits/_dropped/` by default. `--from completed` restricts to archived; `--from dropped` restricts to dropped; `--from both` is the default.
- **Set-based watermark** (not commit-based): the prior narrative's frontmatter carries `pursuits_consulted: [<list>]`, `included_dropped: <bool>`, `from_filter: <string>`. Re-runs read the current set of resolved pursuits minus the consulted set; if no new pursuits have resolved since the prior run, return null and skip generation.
- The narrator subagent's lessons mode is documented in `cadence-plugin/agents/narrator.md` — frame archived pursuits as "lessons of execution" (what worked when committed to) and dropped pursuits as "lessons of judgment" (what got learned without shipping). Both are real signal.

### Resolution narrative filenames

- `narratives/drafts/<pursuit-id>-closure.md` — for archived/completed
- `narratives/drafts/<pursuit-id>-drop.md` — for dropped

The filename suffix is what `/narrate lessons` reads to distinguish the two corpora when synthesizing.

### Migration decision (action 7)

Existing archived pursuits stay where they are:
- `build-cadence-v1` — cleanly completed; correctly in `_archived/`. No move.
- `cadence-performance-and-indexing` — archived because it was absorbed into `improve-ux-and-vision`; technically neither cleanly "shipped" nor "dropped". It's already in `_archived/` and a retroactive reclassification to `_dropped/` (or somewhere else) would require context we don't have today. Leave it.

**Rule for future archives:** if a future archived pursuit surfaces as misclassified after the fact, address it case-by-case via `cadence move-pursuit <id> --to dropped` (or the reverse). Do NOT batch-migrate existing archives without lived signal that the framing matters.
