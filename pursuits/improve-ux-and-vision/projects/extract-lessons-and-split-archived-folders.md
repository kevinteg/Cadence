---
id: extract-lessons-and-split-archived-folders
pursuit: improve-ux-and-vision
status: on_hold
created: 2026-05-04
---

# Extract Lessons + Split Archived/Dropped Folders

Two related needs from the v1 self-review: (1) lessons extraction across completed pursuits — the meaning-making loop the vision claims but doesn't yet provide. A cron'd narrator pass over completed pursuits that surfaces 'patterns I keep hitting' would close that loop. (2) Dropped/canceled pursuits should not be mixed in with completed ones — they're different signal. A pursuit that finished is a story of what shipped; a pursuit that got dropped is a story of what got learned without shipping. Mixing them in pursuits/_archived/ contaminates the lessons-extraction signal and erases an important distinction in the system's view of itself.

## Intent

Add a 'dropped' lifecycle state for pursuits, a corresponding pursuits/_dropped/ folder, and a /resolve <pursuit> --state dropped --reason path that walks the same Zeigarnik-release ritual as a completion close but with different framing (what did this teach you?) and routes the pursuit to the dropped folder. Then build a lessons-extraction surface as a new /narrate scope that synthesizes patterns across multiple completed (and optionally dropped) pursuits, distinct from per-pursuit closure narratives. Done feels like: a pursuit can be cleanly dropped via /resolve <pursuit> --state dropped (parallel to projects' --state dropped); the resulting drop narrative captures the teach-me content; the directory tree visibly distinguishes 'pursuits I shipped' from 'pursuits I learned from without shipping'; and /cadence:narrate lessons synthesizes a cross-pursuit summary that's read-only over the archived + dropped folders, watermarked so re-runs add only new material.

## Actions

- [ ] Design the dropped lifecycle for pursuits. Add 'dropped' to the PursuitLifecycle schema in src/types.ts. Document the lifecycle transitions in cadence-runtime.md vocabulary: active → someday → archived (completed) | dropped. Pursuits drop with a reason; pursuits don't 'cancel' (project-level vocabulary preserved at project level).
- [ ] Add the pursuits/_dropped/ folder convention. Update src/scan/pursuits.ts to recognize and parse pursuits in _dropped/ alongside _archived/ and _someday/. Update src/write/move.ts so move-pursuit --to dropped routes correctly. Update src/write/paths.ts so resolvePursuitDir() looks in pursuits/_dropped/ as well. Tests for the new lifecycle transition.
- [ ] Extend skills/resolve/SKILL.md pursuit-level path: /resolve <pursuit> --state dropped --reason '<text>' walks the cleaning ritual (same absolute-Ideas block — dropped pursuits still need meaning-making for their unresolved seeds), then move-pursuit --to dropped instead of --to archived. Save a drop narrative (vs closure narrative) at narratives/drafts/<pursuit-id>-drop.md with framing 'what did this teach you?' rather than 'what shipped?' Suggestion: surface a tip-style framing prompt at the start ('You're ending [pursuit] without shipping. What did it teach you?').
- [ ] New /narrate scope: lessons. cadence narrate lessons reads from pursuits/_archived/ AND pursuits/_dropped/ by default; --from completed restricts to archived; --from dropped restricts to dropped; --from both is the default. The narrator subagent synthesizes recurring patterns across multiple pursuits — what shows up more than once across the corpus — rather than a single pursuit's arc. Save to narratives/drafts/lessons-YYYY-MM-DD.md with watermark frontmatter (pursuits_consulted, included_dropped flag, generated_at). Re-runs read existing watermark and consume only new material.
- [ ] Update cadence-plugin/cadence-reference.md to document: (a) the new dropped lifecycle state, (b) the pursuits/_dropped/ folder convention, (c) the new /narrate lessons scope and its watermark schema, (d) the resolve --state dropped path for pursuits.
- [ ] Update cadence-plugin/cadence-runtime.md vocabulary section to include the dropped lifecycle and the distinction in framing (completed = what shipped; dropped = what got learned without shipping). Update Working a Project section's resolve verb description to note pursuit-level --state dropped as a valid path.
- [ ] Migration consideration: existing archived pursuits stay where they are. cadence-performance-and-indexing was archived after being absorbed into improve-ux-and-vision; technically that's neither cleanly 'completed' nor 'dropped' but it's already in _archived and shouldn't be retroactively moved without lived signal. If future archived pursuits surface as misclassified, address case-by-case. Do NOT auto-migrate any existing archives. Document this decision in the project's Notes.
