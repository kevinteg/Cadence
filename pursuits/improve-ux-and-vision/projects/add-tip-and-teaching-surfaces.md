---
id: add-tip-and-teaching-surfaces
pursuit: improve-ux-and-vision
status: active
created: 2026-05-01
---

# Add Tip and Teaching Surfaces

Cadence today has a sparse teaching surface: the SessionStart Next: block and a few drill-down menus. The user wants the system to feel like a thoughtful colleague who occasionally surfaces a useful frame, asks a clarifying question, or quietly mentions a verb the user hasn't tried — without becoming a productivity-app dispensing motivational quotes. The 227-entry docs/teaching-tips-research.md library (curated from Allen, Newport, Doerr, Brooks, Karpathy, Willison, and others) provides quality content; this project builds the tip repository design and the delivery patterns, respecting the 'smart-colleague-marginalia, not wallpaper' tone target the research doc itself names.

## Intent

Build a tip repository and the delivery patterns that surface from it. Three content types coexist in the repository: (1) skill-teaching tooltips ('Running /resolve — this marks projects done'), (2) brain-tickler quotes from the curated library (Newport, Doerr, Allen, Brooks, Karpathy, Willison — non-sappy, smart-colleague tone), (3) status-aware verb hints (already exist in /status, formalize and expand). Each entry in the repository carries metadata for trigger conditions and frequency caps so over-rotation never turns the surface into wallpaper. The library content (currently in docs/teaching-tips-research.md) gets vocabulary-updated to current v3 terminology and migrated into a structured cadence-plugin/tips/library.yaml that ships with the plugin. Delivery patterns: (a) status-aware verb hints almost everywhere — every verb's natural exit shows 2-3 contextual next-step suggestions based on current state; (b) per-skill teaching footers as multi-fire tooltips (not once-only — frequency-capped per-tip per-session, with longer cool-downs per-tip per-week, can repeat). A .cadence/tip-state.json (gitignored, per-repo) tracks shown-tip history. The closing-in-on-resolution lifecycle prompt is split into add-closing-in-on-resolution-prompts; long-running-agent interjections are split into add-long-running-agent-interjections and consume from this repository. Done feels like: a returning user feels accompanied by a thoughtful colleague; the verb surface is discoverable through usage rather than docs; tips never feel like wallpaper.

## Actions

- [x] Audit and update docs/teaching-tips-research.md vocabulary to current v3 terminology: Steward/Narrator/Guide → 'the agent' (in the relevant verb's register); Cadence Sessions (gone since remove-session-concept) → project work / deep work blocks depending on context; Markers (gone) → project Notes entries / completion notes; preserve all content, modernize labels only. Add a header note acknowledging the v3 vocabulary update.
- [x] Design the tip repository schema. Each entry: id, type (skill-teaching | quote | verb-hint), content, attribution (for quotes), trigger conditions (verb context, system state, frequency), per-tip frequency cap. Storage at cadence-plugin/tips/library.yaml — alongside the deck. Document the schema in cadence-reference.md.
- [x] Migrate curated content from the updated teaching-tips-research.md into the structured cadence-plugin/tips/library.yaml so it ships with the plugin and is queryable. Preserve attribution. The research doc stays as design rationale; the YAML is operational content.
- [x] Document the tip-delivery primitive in cadence-runtime.md as an Engagement and Alignment principle: tips selected by contextual fit (not random); frequency-capped per-tip; rendered as smart-colleague-marginalia (not motivational-poster); never interrupt flow. Honor the 'wallpaper' warning explicitly with concrete frequency limits.
- [x] Expand status-aware verb hints to cover every verb's natural exit point (not just /status drill-downs). Each verb shows 2-3 contextual next-step suggestions based on current state. Update affected skills + verb-contracts.md.
- [x] Implement per-skill teaching footers as a runtime pattern: after teaching-eligible actions (verb invocations, action checks, status changes), the agent pulls from the tip repository and surfaces a one-line tooltip when frequency cap allows. Pairs with the natural-language-to-verb teaching from slim-verb-surface-and-teach-by-usage. Multi-fire (not once-only) — can repeat after cool-down period.
- [x] Build tip-state tracking: .cadence/tip-state.json (gitignored, per-repo) records last-shown timestamp + show count per tip-id for frequency capping. CLI exposes cadence tip status / cadence tip reset for power users to inspect or clear.
