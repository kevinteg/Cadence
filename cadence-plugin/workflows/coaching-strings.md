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
`cadence-runtime.md` Inbox vocabulary entry). When `/cadence:status`
calls it "Inbox," the SessionStart hook calls it "Inbox," the capture
exit menu calls it "Inbox," and `/cadence:start inbox` walks "the
Inbox" — that repetition IS the teaching mechanism. Drift between
surfaces breaks the mental model.

Same for the threshold language, the empty-state phrasing, and the
idle-time prompt: written once, quoted everywhere.

## Inbox line — used by SessionStart hook, `/cadence:status`, post-capture exit

The line that summarizes the current Inbox state. Three shapes,
selected by count vs. the soft threshold (default 10, configured at
`cadence.yaml` `inbox_soft_threshold`):

```
empty:        "Inbox: empty ✓"
within cap:   "Inbox: <N> items ✓"
above cap:    "Inbox: <N> items (<O> overdue, <A> aged, <F> fresh) — above soft cap (<threshold>). Run /cadence:start inbox to walk them."
```

**Bucket boundaries** (see `src/inbox.ts` `InboxBuckets`):
- `fresh` — age_days ≤ 2
- `aged` — 3 ≤ age_days ≤ 7
- `overdue` — age_days > 7

**Bucket breakdown in the "above cap" line:** include only buckets
with count > 0. Order: `overdue`, then `aged`, then `fresh`. If all
items are fresh, the breakdown reads `(N fresh)`.

The "above cap" wording is **descriptive, not scolding**. "Above soft
cap" tells the user the system noticed; "Run /cadence:start inbox" is
the path forward. No deficit framing ("overdue for triage," "you're
behind").

## Active-brainstorms line — SessionStart hook, `/cadence:status`

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

## Empty-repo coaching block — SessionStart hook, `/cadence:status` empty-state branch

Fires when ALL of:
- zero pursuits
- Inbox empty (no captures, no diverging brainstorms)
- `validations/pending.md` empty

```
Cadence is initialized. Your Inbox is empty ✓.

What do you want to start?
  • Quick thought          → /cadence:capture "..."
  • Long brain dump        → /cadence:capture --dump
  • Ingest a doc           → /cadence:capture --from <path-or-url>
  • Pull from a saved source → /cadence:capture --source <name>
  • Open ideation          → /cadence:brainstorm <topic>
  • See the verb surface   → /cadence:help
```

The Inbox line ("empty ✓") is the user's first signal that "Inbox" is
a real noun in the system. The menu options name verbs explicitly so
the surface is self-teaching.

## Idle-time prompt — SessionStart hook

Fires when `max(snapshot.projects[].last_activity_at)` is more than
7 days ago AND the repo isn't in the empty-repo state. Appended after
the Next: block:

```
"It's been a while since the last activity here. /cadence:reflect to catch up, or /cadence:status to see what's open."
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
  - 'inbox' (or just press enter) — leave everything in the Inbox; triage later via /cadence:start inbox

  (Each routing prompts an ELI5 confirm before any write outside thoughts/.)"
```

## `/cadence:reflect` Get Clear awareness block — short-form (lands in P5)

Get Clear is being rebalanced in `unify-work-entry-under-start` (P5)
to shrink to a 2-3 line awareness block, then proceed to Get Focused.
The canonical block:

```
"Inbox: <N> items  ·  Dormant: <M> projects  ·  Closing-in: <K> pursuits  ·  WIP: <X>/<max>

Want to handle these now, or note them in the reflection and move on?
  - 'handle' — hand off to /cadence:start inbox (or /resolve <project>); reflection persists at status: in_progress, phase: get_clear
  - 'note' — append the awareness counts to the reflection body and proceed to Get Focused
  - 'pause' — exit; reflection stays in_progress for next time"
```

When all counts are zero: "Inbox empty, no dormant, no closing-in,
WIP healthy. Going straight to Get Focused."

(This string ships when P5 lands; this section is the
single-source-of-truth contract.)

## Threshold-aware language — guiding principles

1. **Above cap reads as a system observation, not a scold.** "Above
   soft cap" / "schedule a triage pass" — not "overdue," not "you're
   behind."
2. **Empty state is celebratory.** The ✓ on "empty" is a real signal,
   not decoration. It tells the user the steady state exists.
3. **Numbers are factual.** "Inbox: 4 items" is more useful than
   "you have 4 captures to triage." Names the noun, not the work.
4. **Verb suggestions are forward, not backward.** "Run /cadence:start
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
