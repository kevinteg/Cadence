---
id: reshape-status-output-for-navigation
pursuit: improve-ux-and-vision
status: active
created: 2026-05-22
---

# Reshape /cadence:status output to lead with navigation and priority-ranked next steps

## Intent

Today /cadence:status leads with leveraged priority + last reflect + last activity + counts (Pursuits: 3 active | 1 someday, Projects: 3 active | 1 on_hold | 17 done, Actions: 6 pending | 0 waiting, Thoughts: 0 unprocessed), then flags, then a Next: block. Counts aren't actionable; the navigation primitive (pursuits + active projects to /cadence:start) is buried; the Next: block is scattered (resume-in-progress mixed with reflect-due + flag-review).

Reshape: lead with pursuits + their active projects (and active brainstorms from P2), then a priority-ranked Next: block, then counts/flags as a footer. Priority-ranking inputs in order: leveraged-priority alignment (which active project moves the LP?), recency (in-progress today), structural urgency (all-actions-checked needing /resolve, closing-in pursuits), parking-lot pressure (untriaged thoughts > threshold), then routine surfaces (reflect-due, narrate-week). Trim to 3 max. Each Next: entry names a verb invocation alongside a one-line rationale.

Drill-down views (cadence status <pursuit>, cadence status <project>) keep their current shape — already navigation-led; the dashboard is what changes. Both the CLI dashboard AND the SessionStart hook use the same renderer to stay consistent (verify after P3's hook extensions land).

Done feels like: opening /cadence:status is scannable for "what should I do next" in under 5 seconds. Pursuits + active projects (including active brainstorms) are the visual lead. The Next: block names verbs with rationales. Counts/flags are footer reference, not the lead.

## Actions

- [x] Sketch the new dashboard render shape in src/render/status.ts — pursuits-first block, Next-ranked block, counts/flags footer.
- [x] Implement the priority-ranking function in src/render/signals.ts (or a new src/render/curation.ts): inputs LP alignment, recency, structural urgency, parking-lot pressure; returns at most 3 entries each shaped {verb, target?, rationale}.
- [x] Wire active brainstorms into the pursuits block (depends on P2).
- [x] Update cadence-plugin/skills/status/SKILL.md to describe the new output shape and render contract.
- [x] Ensure the SessionStart hook uses the same renderer so both surfaces stay consistent (verify after P3's hook extensions land).
- [x] Update cadence-plugin/cadence-reference.md Verb Catalogue → status entry to describe the new lead-with-navigation shape.
- [x] Add tests for the curation ranking function in test/curation.test.ts (or similar) covering the four input signals.
- [x] Update CLI catalog in cadence-plugin/cadence-reference.md if any new subcommands are needed (none anticipated, but verify).
