# Coaching Strings — canonical copy for ambient surfaces

This file holds the exact wording for Cadence's ambient coaching
surfaces. Skills, hooks, the runtime, and CLI render helpers quote
from here rather than re-inventing language per surface.

The point: a new user opens Cadence, sees "Inbox: 4 items," and
understands the term from context — because every surface uses the
same words. Consistency is the load-bearing UX; this doc is where
it lives.

## Why this exists

The word **Inbox** carries a specific meaning in v1.1: the union view
of untriaged captures + diverging brainstorms (see
`cadence-runtime.md` Inbox vocabulary entry). When `/cadence-status`
calls it "Inbox," the SessionStart hook calls it "Inbox," the capture
exit menu calls it "Inbox," and `/cadence-start inbox` walks "the
Inbox" — that repetition IS the teaching mechanism. Drift between
surfaces breaks the mental model.

Same for the threshold language, the empty-state phrasing, and the
idle-time prompt: written once, quoted everywhere.

## Inbox line — used by SessionStart hook, `/cadence-status`, post-capture exit

The line that summarizes the current Inbox state. Three shapes,
selected by count vs. the soft threshold (default 10, configured at
`cadence.yaml` `inbox_soft_threshold`):

```
empty:        "Inbox: empty ✓"
within cap:   "Inbox: <N> items ✓"
above cap:    "Inbox: <N> items (<O> overdue, <A> aged, <F> fresh) — above soft cap (<threshold>). Run /cadence-start inbox to walk them."
```

**Bucket boundaries** (see `src/inbox.ts` `InboxBuckets`):
- `fresh` — age_days ≤ 2
- `aged` — 3 ≤ age_days ≤ 7
- `overdue` — age_days > 7

**Bucket breakdown in the "above cap" line:** include only buckets
with count > 0. Order: `overdue`, then `aged`, then `fresh`. If all
items are fresh, the breakdown reads `(N fresh)`.

The "above cap" wording is **descriptive, not scolding**. "Above soft
cap" tells the user the system noticed; "Run /cadence-start inbox" is
the path forward. No deficit framing ("overdue for triage," "you're
behind").

## Active-brainstorms line — SessionStart hook, `/cadence-status`

```
"Active brainstorms: <N> (<slug-1> [<phase>], <slug-2> [<phase>], ...)"
```

When N = 0, the line is omitted (no value in surfacing zero).
When N > 4, truncate to first 3 + " and N-3 more":

```
"Active brainstorms: 6 (alpha [diverging], beta [converging], gamma [diverging] and 3 more)"
```

Sort by `last_touched` desc (most recent first) so the truncation
hides stale ones.

## Empty-repo coaching block — SessionStart hook, `/cadence-status` empty-state branch

Fires when ALL of:
- zero pursuits
- Inbox empty (no captures, no diverging brainstorms)
- `validations/pending.md` empty

```
Cadence is initialized. Your Inbox is empty ✓.

What do you want to start?
  • Quick thought          → /cadence-capture "..."
  • Long brain dump        → /cadence-capture --dump
  • Ingest a doc           → /cadence-capture --from <path-or-url>
  • Pull from a saved source → /cadence-capture --source <name>
  • Open ideation          → /cadence-brainstorm <topic>
  • See the verb surface   → /cadence-help
```

The Inbox line ("empty ✓") is the user's first signal that "Inbox" is
a real noun in the system. The menu options name verbs explicitly so
the surface is self-teaching.

## Idle-time prompt — SessionStart hook

Fires when `max(snapshot.projects[].last_activity_at)` is more than
7 days ago AND the repo isn't in the empty-repo state. Appended after
the Next: block:

```
"It's been a while since the last activity here. /cadence-reflect to catch up, or /cadence-status to see what's open."
```

**No deficit framing.** Not "you missed N days" or "Cadence is going
stale." "It's been a while" + a forward-pointing verb suggestion is
the entire message.

## Post-capture outcome menu — capture SKILL

After the capture-ingest subagent returns, the parent surfaces a
menu of distilled items + suggested outcomes. Header line:

```
"Captured <N> item(s) from <source>. Now in your Inbox at thoughts/unprocessed/."
```

Per-item line shape (default-to-action for high-confidence items):

```
"  1. [<outcome_kind>] <title>"
"     → suggested: add as action on <pursuit>   (confidence <conf>)"
```

When `confidence >= 0.8` AND `suggested_pursuit` is present:

```
"     → Suggested: add as action on <pursuit> [Y/n]"
```

(Capital Y = default Yes.) The capital-Y framing is the load-bearing
detail: it makes "act on it" the path of least resistance instead of
"hoard it in the Inbox."

Footer / prompt:

```
"What now?
  - <number> [+ outcome override] — route that item
  - 'all <outcome>' — apply the suggested outcome to all (or override)
  - 'inbox' (or just press enter) — leave everything in the Inbox; triage later via /cadence-start inbox

  (Each routing prompts an ELI5 confirm before any write outside thoughts/.)"
```

## `/cadence-reflect` Get Clear awareness block — short-form (lands in P5)

Get Clear is being rebalanced in `unify-work-entry-under-start` (P5)
to shrink to a 2-3 line awareness block, then proceed to Get Focused.
The canonical block:

```
"Inbox: <N> items  ·  Dormant: <M> projects  ·  Closing-in: <K> pursuits  ·  WIP: <X>/<max>
Capstone gaps: <G> resolved units with uncrystallized research  ·  Retrospective: <R> pursuits since the last lessons run

Want to handle these now, or note them in the reflection and move on?
  - 'handle' — hand off to /cadence-start inbox (or /resolve <project>); reflection persists at status: in_progress, phase: get_clear
  - 'note' — append the awareness counts to the reflection body and proceed to Get Focused
  - 'pause' — exit; reflection stays in_progress for next time"
```

The second line carries the wiki signals (`capstone_gap` count and
`retrospective_due` `newSinceLast`); it renders only when G or R is
non-zero — both zero → omit the line, keeping the block at its
2-3 line contract.

When all counts are zero: "Inbox empty, no dormant, no closing-in,
WIP healthy. Going straight to Get Focused."

(This string ships when P5 lands; this section is the
single-source-of-truth contract.)

## Dashboard "This week" opener — `/cadence-status`, SessionStart hook

The opening orientation line of the dashboard. One line, manager-recap
tone, up-leveled. Two ingredients: the user's current Leveraged
Priority (first sentence, lower-cased, trailing punctuation stripped)
and the most recently touched active/on_hold project.

```
**This week**: <LP framing>. Last touch was `<project>` (<ago>).
```

Empty-state variant (no LP recorded yet, but there's a recent touch):

```
**This week**: no leveraged priority set — /cadence-reflect to set one. Last touch was `<project>` (<ago>).
```

When both are absent the line is omitted entirely — the dashboard
moves straight to Active Pursuits.

## Heads up nudges — `/cadence-status`, SessionStart hook

The dashboard's "Heads up" section reads as bulleted nudges, never as
a queue or counter list. Three bullets in order, each conditional:

```
- Inbox: <line>                                              (always; uses the canonical Inbox line above)
- <N> behaviors are queued for fresh-session validation — peek when you're ready.
                                                              (when validations/pending.md is non-empty)
- Health: <N> quiet signals — <specific signal>; <specific signal>. /cadence-reconcile to walk them.
                                                              (when ≥1 non-inbox flag exists)
```

Specific-signal phrasing per flag kind (used inside the Health line):

| Flag                                    | Phrase                                                |
|-----------------------------------------|-------------------------------------------------------|
| `overdue_waiting_for`                   | `<person> re: <what> (<N>d overdue)`                  |
| `dormant_project`                       | `dormant project \`<id>\` (<N>d)`                     |
| `structural_active_no_open_actions`     | `` `<id>` has all actions checked — ready to resolve? `` |
| `wip_over_limit`                        | `<N> in-progress projects (limit <M>)`                |
| `closing_in_on_resolution`              | `` `<id>` closing in (<N>/<M> done) ``                |
| `inbound_issues_piling_up`              | `<N> untriaged issues on \`<repo>\``                  |

The `inbox_pressure` flag does NOT appear in the Health line — the
Inbox bullet above already carries that signal. Double-rendering would
look like noise.

## Likely next moves — `/cadence-status`, SessionStart hook

A numbered list of up to 3 priority-ranked verb suggestions. Each
entry is `N. \`<verb> <target>\` — <one-line rationale>.` The
rationale is descriptive and forward-pointing, never a scold.

Priority order: LP alignment → recency (in-progress today) →
structural urgency (closing-in pursuits, all-actions-checked
projects) → parking-lot pressure (Inbox above soft cap) → routine
surfaces (reflect-due, narrate-week, narrate-today). Filled out with
`/cadence-help` ("Browse the full verb surface.") when room remains
and no higher-priority signal applies.

## Tip footer — `/cadence-status`, SessionStart hook

The dashboard ends with an optional tip from the curated library — a
brain-tickler quote rendered as smart-colleague marginalia. Shape:

```
---

*<quote content>*
— <attribution>
```

Italicized content, dimmed when color is on. The attribution lives on
its own line so the source stays legible without taking visual weight
from the quote.

**Frequency.** The status surface fires every dashboard render, but a
tip surfaces only when the `status-marginalia` category is off
cool-down (default: 3 days). A typical user sees a tip on roughly 1 in
10-15 invocations — present but not wallpaper. The empty-repo branch
suppresses the tip entirely; the coaching block is the teaching
surface there.

**Selection.** `pickDashboardTip()` in `src/tip/picker.ts` reads from
`cadence-plugin/tips/library.yaml`, filtered to `type: quote` with
`triggers` overlap on `verb-status` or `idle`. Per-tip cool-downs in
the library file gate which quotes are eligible at any moment.

The wallpaper warning applies here harder than anywhere else: status
fires constantly. If a tip context starts firing too often in
practice, lengthen the per-tip cool-down in `library.yaml` or the
category cool-down in `pickDashboardTip()`. Don't shorten it without
evidence.

## Threshold-aware language — guiding principles

1. **Above cap reads as a system observation, not a scold.** "Above
   soft cap" / "schedule a triage pass" — not "overdue," not "you're
   behind."
2. **Empty state is celebratory.** The ✓ on "empty" is a real signal,
   not decoration. It tells the user the steady state exists.
3. **Numbers are factual.** "Inbox: 4 items" is more useful than
   "you have 4 captures to triage." Names the noun, not the work.
4. **Verb suggestions are forward, not backward.** "Run /cadence-start
   inbox" — not "you should have triaged earlier."

These principles also govern any new strings added to this file.

## Editor's checklist

Before adding a new ambient string anywhere in the codebase, check:

- Does this string already exist here? If so, quote it; don't re-write.
- If new, does it use the canonical noun ("Inbox") and not a synonym
  ("backlog," "queue," "unprocessed pile")?
- Does it match the tone target — descriptive, forward-pointing,
  smart-colleague rather than coach-talk?
- If it's a threshold/state surface, does it have an empty-state
  variant? (Empty surfaces should feel like wins, not gaps in display.)

Add the string here first; then have skills/hooks/render-code quote
it. One file, one set of words.
