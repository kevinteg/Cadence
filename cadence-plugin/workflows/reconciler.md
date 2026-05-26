# Reconciler

*Systematic checks for system health. Referenced by /status and /reflect.*

---

## Overview

The reconciler scans the system for issues that need attention: overdue
commitments, dormant work, stale context, and structural problems. It
produces a list of **flags** — each flag identifies a specific issue,
the affected entity, and a suggested action.

The reconciler is not a separate process. It is a set of checks the agent
runs when executing /status (summary) or /reflect (interactive review).

## Flag Format

Each flag has four fields:

| Field | Description |
|-------|-------------|
| **type** | Category: `overdue_waiting_for`, `dormant_project`, `stale_marker`, `structural`, `someday_cue` |
| **severity** | `action_needed` (requires decision), `warning` (worth reviewing), `info` (awareness only) |
| **entity** | The affected item: project ID, pursuit ID, or waiting_for description |
| **suggestion** | A concrete next step the user can take |

### Presentation

**In /status** — Summary list under "Flags:". One line per flag:
```
Flags:
- [type] [entity]: [suggestion]
```
If no flags: "No flags. System is healthy."

**In /reflect** — Interactive review during Get Clear step 3. Present
each flag with context and ask the user to act on it or consciously defer:
```
Reconciler found [N] flags:

1. [severity] [entity]
   [explanation with context]
   Suggested: [suggestion]
   → [Act on it / Defer / Dismiss]
```

---

## Checks

### 1. Overdue Waiting-For

**Type:** `overdue_waiting_for`
**Severity:** `action_needed`

**Logic:**
1. Scan all project files across active pursuits for `waiting_for` in frontmatter
2. For each item, compare `expected` date against today
3. Flag if today > expected + `waiting_for_grace_days` (from cadence.yaml, default: 2)

**Suggestion format:** "Follow up with [person] about [what] — [N days] overdue"

**Side effect in /reflect:** If the user acts, update the project frontmatter:
set `flagged: true` on the item, or remove it if resolved.

### 2. Dormant Projects

**Type:** `dormant_project`
**Severity:** `warning`

**Logic:**
1. For each active project across active pursuits:
2. Find the most recent marker referencing this project (by `project` field in session frontmatter)
3. Determine last activity date: most recent marker date, or project `created` date if no markers exist
4. Flag if last activity date is 14+ days ago AND the project has unchecked actions

**Suggestion format:** "No activity on [project] in [N days] — still active, or move to on_hold?"

**Note:** Projects with all actions checked are not dormant — they need
completion, which is a structural flag instead.

### 3. Stale Markers

**Type:** `stale_marker`
**Severity:** `warning`

**Logic:**
1. For each active project across active pursuits:
2. Find the most recent marker referencing this project
3. Flag if marker age > `marker_stale_days` (from cadence.yaml, default: 7)

**Suggestion format:** "Last marker for [project] is [N days] old — context may be stale. Start a session to refresh."

**Note:** A project can be both dormant AND have a stale marker. The dormant
flag takes priority — stale marker is suppressed if dormant is already flagged
for the same project (avoid noise).

### 4. Structural Issues

**Type:** `structural`
**Severity:** `info`

**Logic — check each of these:**
- **All actions checked, not closed:** Active project where every action
  is checked off but `status` is not `done`. The project either needs
  completion or another round of actions.
  Suggestion: "[project] has all actions checked — does the intent
  feel achieved? Mark done, add more actions, or split."

The older model carried two additional structural flags ("empty DoD",
"open DoD but no actions"). Both are obsolete under the narrative-first
model: a project's body is Intent prose (no checklist to be empty), and
the Actions list is the single checklist. Existing project files with
legacy `## Definition of Done` sections do not produce these flags;
the section is parsed-but-ignored.

### 5. Someday Cue Surfacing

**Type:** `someday_cue`
**Severity:** `info`

**Logic:**
1. Scan `pursuits/_someday/` for pursuit files with `cue` in frontmatter
2. Evaluate trigger conditions:
   - `trigger: review` + `review: monthly` — flag if no reflection in the
     past 30 days has mentioned this pursuit (search reflection files)
   - `trigger: date` + `date: YYYY-MM-DD` — flag if today >= date
   - `trigger: seasonal` + `season: [spring|summer|fall|winter]` — flag
     if current season matches
3. Only surface during /reflect, not /status (these are strategic, not urgent)

**Suggestion format:** "Time to revisit [pursuit]? [cue context]"

---

## Closing-In and Inbox Checks

### 6. Closing-In on Resolution

**Type:** `closing_in_on_resolution`
**Severity:** `info`

**Logic:**
1. For each active pursuit, count resolved (done|dropped) vs unresolved (active|on_hold) projects
2. Flag if ≥1 project is resolved AND 1-2 unresolved projects remain

**Suggestion format:** "[pursuit] closing in ([R]/[T] done) — what would need to be true to close?"

**Surfaces in:** `/status`, `/reconcile`, `/reflect`. The dashboard renders this inline as `(closing in)` next to the pursuit header; the curation surface uses it to rank a `/cadence:status <pursuit>` next-move.

### 7. Inbox Pressure

**Type:** `inbox_pressure`
**Severity:** `info`

**Logic:**
1. Compute `inboxItems(snapshot).counts.total` — the union of untriaged captures + brainstorms in `phase: diverging`
2. Flag once if total exceeds `cadence.yaml` `inbox_soft_threshold` (default 10)

The flag carries the bucket breakdown (`fresh` ≤2d / `aged` 3-7d / `overdue` >7d) so the dashboard's Inbox bullet can render the per-bucket counts inline.

**Suggestion format:** "Inbox: [N] items ([O] overdue, [A] aged, [F] fresh) — above soft cap ([T]). Run /cadence:start inbox to walk them."

**Surfaces in:** `/status`, `/reconcile`, `/reflect` (Get Clear awareness block).

### 8. Inbound Issues Piling Up

**Type:** `inbound_issues_piling_up`
**Severity:** `warning`

**Logic:**
1. Read the upstream owner/repo from `cadence plugin-info --json`
2. Query open issues bearing neither `triaged-routed` nor `triaged-deferred` via `gh issue list`
3. Flag if count exceeds `cadence.yaml` `incoming_queue_threshold` (default 5)
4. Cache result in `.cadence/inbound-cache.json` for `incoming_queue_cache_ttl_minutes` (default 15) to avoid hammering GitHub

Skipped silently when `gh` is unavailable or unauthed — no error, no flag.

**Suggestion format:** "[N] untriaged issues on `<owner/repo>` — /cadence:incoming to triage."

**Surfaces in:** `/status`, `/reconcile`. (Maintainer-mode signal; not surfaced during `/reflect` Get Clear.)

---

## Thresholds

All thresholds come from `cadence.yaml` under `defaults`:

| Setting | Default | Used by |
|---------|---------|---------|
| `waiting_for_grace_days` | 2 | Overdue waiting-for |
| `marker_stale_days` | 7 | Stale markers |
| `someday_review` | monthly | Someday cue surfacing |
| `inbox_seed_stale_days` | 7 | Stale Inbox seed |
| `inbox_seed_softcap` | 10 | Inbox overcap |

Dormant project threshold is fixed at 14 days. Aging seed threshold is
14 days. Unpromoted idea threshold is 7 days. Long-running project
threshold is 30 days with <50% of actions checked.
