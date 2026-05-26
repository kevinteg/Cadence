---
id: unify-work-entry-under-start
pursuit: improve-ux-and-vision
status: done
created: 2026-05-22
---

# Unify work-entry under /cadence:start and rebalance /reflect to be actual reflection

## Intent

Today, picking up work in Cadence has uneven UX. /cadence:start opens a project view cleanly — that path is obvious. But starting a pursuit (rehydrating its mental model and picking what to work on within it), resuming a mid-flight brainstorm, or processing the Inbox don't have equivalent entry surfaces. The user has to know which verb to invoke based on what work-type they want to enter. That's friction the system shouldn't impose.

Worse, /cadence:reflect Get Clear has become the de facto triage clearinghouse — every untriaged capture, every dormant project, every stale flag gets walked one at a time during the weekly ritual. That's not what Reflect is for. Reflect should be actual reflection: looking at the week's arc, naming what worked and what didn't, generating narrative, setting the Leveraged Priority. Triage belongs elsewhere — closer to the moment of capture (already covered by P3's outcome menu) or as a dedicated work-entry mode (this project's /start inbox).

This project does three things together, because they pull on one mental model:

UNIVERSAL /cadence:start. The verb becomes the one entry point for "I want to begin doing something." Argument-shape determines what:
- /start (no arg) → curated menu surfacing all work modes equivalently: pursuits to rehydrate, in-progress projects, active brainstorms, the Inbox count, a priority-ranked recommendation.
- /start <pursuit> → NEW: pursuit workspace view. The pursuit's Why, leveraged-priority alignment, active projects (with their next unchecked action), brainstorms tied to this pursuit, and the slice of the Inbox attributable to this pursuit. Then the user picks what within.
- /start <project> → unchanged from today.
- /start <brainstorm-slug> → resume the workspace at its current phase (consumes P2).
- /start inbox → NEW: reserved keyword. Walks the Inbox view item by item using the same outcome menu the capture exit uses (action / project / brainstorm-seed / discard). Triage entry, equivalent UX to opening a project.

REFLECT REBALANCE. Get Clear shrinks dramatically. No capture-by-capture triage walk. No per-project relevance pass. Replace with a 2-3 line awareness block: "Inbox: 4 items (oldest 9d). Dormant: 1 project. Closing-in: 1 pursuit. Want to handle any of these now, or note them in the reflection and move on?" If the user picks handling, the SKILL hands off to /start inbox or /resolve <project> and the reflection persists at status: in_progress, phase: get_clear so they can resume. Get Focused stays the meat — narrative recap, worked/didn't-work, WIP check, waiting-for, Nudges, LP.

INBOX-ISN'T-A-PARKING-LOT FRAMING. The coaching surfaces teach transience without lecturing. Recency-tagging in Inbox display (age_days per item, fresh/aged buckets). Threshold-aware language: above the soft cap reads "Inbox: 12 items — overdue for triage"; below reads "Inbox: 3 items ✓"; empty reads "Inbox: empty ✓". The capture-exit outcome menu defaults to a non-Inbox outcome when the subagent's confidence is high — "Suggested: add as action on nexthop-onboarding [y/N — defaults to y]." Keeps "land in Inbox" available but not the path of least resistance.

Depends on: P2 (brainstorms exist + scannable), P3 (Inbox view + coaching-strings.md + capture-exit outcome menu), P4 (curation-rank function and reshaped /status — shared logic).

Done feels like: opening /cadence:start with no argument surfaces a single curated menu of all work modes (pursuits, projects, brainstorms, Inbox); /start <pursuit> drops you into the pursuit's workspace context; /start inbox walks untriaged items as cleanly as opening a project; /cadence:reflect is short and reflection-shaped, no longer a triage clearinghouse, and any triage hand-off resumes the reflection cleanly afterward. New users open Cadence, see "Inbox: 4 items" + a menu, and understand from context.

## Actions

- [x] Rewrite cadence-plugin/skills/start/SKILL.md end-to-end for the universal-entry model: no-arg curated menu (pursuits + projects + brainstorms + Inbox + priority-ranked recommendation), branched argument resolution (pursuit / project / brainstorm-slug / reserved 'inbox' keyword).
- [x] Design and implement the pursuit-workspace view rendered by /start <pursuit>: Why narrative, LP alignment (does the current LP touch this pursuit?), active projects with next unchecked action, brainstorms tied to this pursuit, Inbox slice attributable to this pursuit (heuristic: source_thoughts or capture verb_context references this pursuit). Source: cadence pursuit <id> --json plus the Inbox view from P3.
- [x] Implement /start inbox triage walk: iterate Inbox items oldest-first, render each with the same outcome menu the capture-exit uses (action on pursuit / new project / new brainstorm / discard / keep in Inbox), mark the thought status: triaged + triaged_to on selection. Exit summary: 'Triaged N items: M as actions, K as brainstorms, L closed, J kept.'
- [x] Wire the curation-rank function from P4 into /start's no-arg curated menu so the priority recommendation is consistent across /status and /start. Both surfaces consume the same ranker (LP alignment > recency > structural urgency > parking-lot pressure).
- [x] Reserve 'inbox' as a keyword in /start argument resolution (and 'brainstorm' as a no-slug shortcut to /cadence:brainstorm). Update the fuzzy-match so user-typed names never collide with the reserved tokens; document the reservation in the SKILL.md.
- [x] Rewrite cadence-plugin/skills/reflect/SKILL.md Get Clear phase: replace the capture-by-capture triage walk and per-project relevance walk with a 2-3 line awareness block listing Inbox / dormant / closing-in / over-WIP counts. Offer 'handle these now? (y / note and continue / pause)' — on handle, hand off to /start inbox or /resolve and persist the reflection at status: in_progress, phase: get_clear so it resumes cleanly. On note/continue, append the awareness counts to the reflection body and proceed straight to Get Focused.
- [x] Add Reflect-pause-and-resume to cadence-plugin/skills/reflect/SKILL.md: when the user bounces mid-Reflect to triage, the partial reflection persists; on the next /cadence:reflect invocation, signals.reflectEntryMode reports same_week_in_progress and the user lands back where they left off.
- [x] Add recency-tagging to the Inbox view (extend P3's inboxItems function): each item carries age_days; the view exposes a bucketed breakdown ('fresh' <=2d, 'aged' 3-7d, 'overdue' >7d). Status and /start consume this.
- [x] Add threshold-aware language to the canonical Inbox-line string in coaching-strings.md (introduced in P3): 'Inbox: N items — overdue for triage' above inbox_soft_threshold, 'Inbox: N items ✓' below, 'Inbox: empty ✓' at zero. Status SKILL, SessionStart hook, and /start menu all quote this.
- [x] Adjust the capture-exit outcome menu (introduced in P3) so it defaults to the highest-confidence non-Inbox outcome when the capture-ingest subagent flagged the item with high confidence — 'Suggested: add as action on nexthop-onboarding [y/N — defaults to y]'. Falls back to 'keep in Inbox' as the y/n default only when confidence is low or no pursuit can be suggested.
- [x] Update cadence-plugin/cadence-runtime.md vocabulary entry for /start: name the universal-entry shape (curated menu / pursuit workspace / project view / brainstorm / inbox) so the SKILL contracts in workflows/verb-contracts.md can quote it.
- [x] Update cadence-plugin/workflows/verb-contracts.md Start contract for the universal-entry model and Reflect contract for the lightened Get Clear.
- [x] Update cadence-plugin/cadence-reference.md to document the four /start argument shapes and the reserved 'inbox' keyword; cross-reference the coaching-strings.md doc from P3 for the canonical phrasing.
