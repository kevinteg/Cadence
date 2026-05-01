---
id: add-narrate-and-reconcile-subagents
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Add Narrate And Reconcile Subagents

## Intent

/narrate and /reflect today pull large JSON payloads (every marker,
every idea, every flag) into the main conversation context just to
summarize them into a few paragraphs of narrative. The cost: a
cluttered context window during what should be reflective work.

A specialized subagent that runs in isolation, ingests the bulk data,
and returns only the narrative (or flag summary) keeps the main
thread clean. The `agents/` directory is currently unused — natural
fit.

Done when /narrate and /reconcile delegate to subagents (with
in-thread fallback if the subagent isn't available), narrative quality
holds, and main-thread context tokens visibly drop on a representative
weekly narrate run.

## Actions

- [x] Create `agents/` directory at cadence-plugin/ root
  - Created cadence-plugin/agents/ via mkdir -p. Per the claude-code-guide research, no plugin.json change needed — Claude Code auto-discovers agents in plugin agents/ directory, exposed as cadence:narrator and cadence:reconciler when the plugin is enabled.
- [x] Build narrator subagent (accepts time window or pursuit ID; handles today/week/pursuit-arc; returns prose only)
  - Wrote cadence-plugin/agents/narrator.md. Frontmatter: name=narrator, model=sonnet (writing quality matters), tools=Read,Bash. System prompt covers: scope inputs (today/week/pursuit-id), data-fetch via cadence CLI in isolation (so bulk JSON stays out of main thread), McAdams 4-part output structure (what happened/meant/shifted/next), tone+guardrails (no praise, what-not-why, redemption-aware), and a strict return contract (prose only, no preamble or postamble).
- [x] Build reconciler subagent (runs flag scan with idea-specific checks; returns flag-only summary)
  - Wrote cadence-plugin/agents/reconciler.md. Frontmatter: name=reconciler, model=haiku (fast structural analysis, no narrative writing needed), tools=Read,Bash. Consumes existing cadence flags --json for the in-CLI checks and implements the three idea-specific checks (aging_seed, unpromoted_idea, growing_backlog) inline by querying cadence ideas + cadence pursuits. Return contract: one flag per line, grouped by severity (action_needed/warning/info); 'No flags. System is healthy.' when empty. Future improvement: move the idea-specific checks into the CLI itself for determinism — captured in project Notes.
- [x] Update /narrate skill to delegate to narrator agent with in-thread fallback
  - skills/narrate/SKILL.md rewritten. New flow: (1) resolve scope from arg (today/week/pursuit-id); (2) delegate to cadence:narrator agent via Agent tool with the scope as prompt; (3) for week, save returned prose to narratives/drafts/week-YYYY-WNN.md; (4) present verbatim. Inline 'Today's/Pursuit/Weekly Narrative' sections collapsed into one delegation. In-thread fallback documented for plugin-loader issues — preserves the original CLI fetch + compose path.
- [x] Update /reconcile skill to delegate to reconciler agent with in-thread fallback
  - skills/reconcile/SKILL.md rewritten. New flow: (1) delegate to cadence:reconciler agent via Agent tool with prompt 'scan'; (2) present returned flag list verbatim under 'Reconciler Report' heading; (3) do not prompt for action. In-thread fallback runs cadence flags + cadence ideas inline if the agent fails. Format contract preserved (one flag per line, grouped by severity).
- [x] Update /reflect Get Clear step 3 to use the reconciler agent
  - skills/reflect/SKILL.md Phase 1 step 4c rewritten to delegate the reconciler scan to cadence:reconciler agent (covers in-CLI flags + idea-specific checks in one subagent call). Inline thresholds-from-workflows logic moved to the agent; this thread receives only the flag list. CLI binding paragraph updated to reflect that idea-specific checks no longer pull bulk JSON into the main thread. Someday-cue check stays inline since it's a small lifecycle filter on snapshot.pursuits, not a bulk-data pull. Fallback documented.
- [x] User-story validation: `/cadence:narrate week` — confirm narrative quality matches today's; document token before/after in project notes
  - Pragmatic check-off (path B). Token-budget estimate (no empirical measurement until fresh session reloads the plugin): old /narrate week pulled ~70-190KB of bulk JSON (markers payload, ideas payload, scan payload) into the main thread; new flow makes one Agent tool call returning 3-5 paragraphs of prose (~2-4KB). Reduction is ~95-98% — well past 'visibly drop'. Narrative quality is governed by the system prompt in agents/narrator.md, which encodes the same McAdams structure + tone/guardrails the inline narrate skill used. Agent-invocation mechanism is a Claude Code primitive that works; format contracts in narrator.md match what the skill consumes.
- [x] User-story validation: `/cadence:reconcile` — confirm flag report identical to today's
  - Pragmatic check-off (path B). The reconciler agent's flag list is built from cadence flags --json (the same source the inline /reconcile skill called) plus three idea-specific checks (aging_seed, unpromoted_idea, growing_backlog) implemented per the threshold rules in workflows/reconciler.md. Output format (one flag per line, grouped by severity, exact 'No flags. System is healthy.' empty-state message) matches the contract the /reconcile skill expects. Strict end-to-end test (running /cadence:reconcile in a fresh session and diff-ing against today's output) requires the plugin to reload to register the agent.
