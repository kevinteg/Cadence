---
id: add-incoming-verb-and-triage-flag
pursuit: make-cadence-public
status: active
created: 2026-05-21
---

# Add /cadence:incoming Verb and Inbound-Triage Reconciler Flag

Issues filed via /cadence:report or the GitHub UI need a maintainer-side surface that triages them into Cadence-shaped state. Without this, inbound issues live only in GitHub — outside the project/action lifecycle — and the maintainer bounces between two systems. A hidden /cadence:incoming verb opens an on-demand triage view. A reconciler flag surfaces when the unrouted-issue count grows past a configurable threshold.

## Intent

When coworkers and OSS adopters file issues, those issues need a maintainer-side surface that triages them into Cadence-shaped state: an action on an existing project, a new project under a chosen pursuit, an Idea on a pursuit's parking lot, a graceful close, or a deferral. Without this, inbound issues live in GitHub's UI alone — outside the project/action lifecycle — and the developer ends up bouncing between two systems instead of one. A new hidden verb /cadence:incoming opens an on-demand triage view: lists open issues (Cadence-specific, read via gh issue list against plugin-info's owner_repo), and for each one routes it to one of five outcomes (route-to-action / promote-to-project / capture-as-idea / close-with-comment / defer-with-label). A new reconciler flag surfaces when the open-issue count past a configurable threshold (excluding deferred issues), nudging the maintainer toward a triage pass without forcing it — same architecture as other reconciler flags, so it lands on SessionStart and during /reflect Get Clear automatically. Cadence-specific for now: only operates against the repo named in plugin-info's owner_repo. Done feels like: the maintainer types /cadence:incoming, sees a clean list of unrouted issues, walks each one in under 30 seconds, and ends with every open issue either resolved or attached to Cadence state.

## Actions

- [x] Design the /cadence:incoming verb contract: list rendering (issue #, title, label, age), per-issue actions (route-to-action | promote-to-project | capture-as-idea | close-with-comment | defer-with-label), gh wiring for read and write, the 'triaged-deferred' label convention, behavior when gh is unavailable (skip with a clear message; no fallback).
- [x] Implement the skill at cadence-plugin/skills/incoming/SKILL.md with the contract and the per-issue triage flow. Welcome line invites broader-than-bugs framing parallel to /report. Hidden verb status; suggest-don't-run pattern via tip system.
- [x] Wire the five routing operations: route-to-action (cadence add-item --section action, include issue URL); promote-to-project (cadence create-project with issue body as Intent seed); capture-as-idea (cadence create-idea on a chosen pursuit); close (gh issue close --comment); defer (gh issue edit --add-label triaged-deferred).
- [x] Add a reconciler flag for inbound-queue growth: when open issues excluding the 'triaged-deferred' label exceed a configurable threshold (cadence.yaml key incoming_queue_threshold, default 5), emit an 'inbound-issues-piling-up' flag with the count. Skip the check (no flag, no error) when gh is unavailable.
- [x] Add the verb to workflows/verb-contracts.md as hidden (alongside /report).
- [x] Update cadence-plugin/cadence-runtime.md to add /incoming to the hidden user-invoked verbs list.

## Notes

2026-05-21 — Contract drafted and approved. To be applied to `workflows/verb-contracts.md` in action 5 and implemented as a skill in action 2.

### `/cadence:incoming` — Contract Draft

**Purpose:** Maintainer-side triage view of open issues on the upstream Cadence repo. Each issue is walked end-to-end and routed into Cadence-shaped state (action / project / idea / close / defer) so the inbound queue never lives only in GitHub.

**Tone:** Light, terse, maintainer-functional. One welcome line: `"<N> open issues to triage. First up:"`. Don't editorialize the issues (no "this looks like a duplicate"); the maintainer decides.

**Behavior:**
- Reads the upstream repo from `cadence plugin-info --json`'s `owner_repo`. Refuses if unparseable.
- Verifies `gh` is installed and authenticated. If not, prints install instructions and **exits with no fallback** — unlike `/report`, no useful offline work to do.
- Fetches the inbound queue:
  ```bash
  gh issue list --repo <owner_repo> --state open \
    --search "-label:triaged-deferred -label:triaged-routed" \
    --json number,title,labels,author,createdAt,url,body,comments
  ```
- Sorts oldest-first so stale issues bubble up.
- For each issue, displays:
  ```
  #<num> [<label>] <age> — <title>     by @<author>
  <body>
  <comments if any, truncated to first 3 if >3>
  ```
  Then prompts: `Triage: [r]oute / [p]romote / [i]dea / [c]lose / [d]efer / [s]kip:` — accepts either single-key or typed answer.

**Triage outcomes (six):**

| Outcome | What it does | gh side-effect |
|---|---|---|
| **r** — route-to-action | Presents all active projects (no fuzzy-prediction), prompts for choice; appends an action via `cadence add-item --section action` with the issue URL embedded | Adds `triaged-routed` label; posts a linking comment |
| **p** — promote-to-project | Prompts for a pursuit (default `make-cadence-public`); creates a project via `cadence create-project` using the issue title as the project name and the issue body as the Intent seed (thin Intent acceptable — co-editable later via `/cadence:start`) | Adds `triaged-routed` label; posts a linking comment |
| **i** — capture-as-idea | Prompts for a pursuit; creates an idea via `cadence create-idea` with the issue body | Adds `triaged-routed` label; posts a linking comment |
| **c** — close-with-comment | Prompts for a one-line comment (e.g., "duplicate of #N", "by design"); closes the issue | `gh issue close --comment` |
| **d** — defer | Marks the issue triaged-but-not-actionable-now | Adds `triaged-deferred` label |
| **s** — skip | Moves on without changing anything | None |

The `triaged-routed` and `triaged-deferred` labels are **symmetric** — both drop the issue out of the active queue. The reconciler flag counts only issues bearing **neither** label, so the count reflects truly-unrouted work.

**Defaults to highlight:**
- Route operations do **NOT** close the issue. The issue stays open until the action/project completes. Maintainer closes it later when the work lands (a `--close-on-route` shorthand is a planned future flag, not in v1).
- Skip is non-destructive and non-persistent — re-running `/cadence:incoming` shows the skipped issue again at the top of the next queue. No `triaged-skipped` label (would create sprawl with no semantic meaning).

**No-argument entry:** Walks the full queue, one issue at a time, oldest-first. End-of-queue: `"All <N> issues triaged. Done."`

**With-argument entry:** `/cadence:incoming <issue-number>` jumps directly to one issue, triages it, exits.

**Optional flag:** `--include-deferred` includes `triaged-deferred` issues in the list — for periodic re-checks of the deferred backlog.

**Discovery (the suggest-don't-run pattern):**
- Hidden from `/cadence:help`'s primary catalogue.
- Agent suggests the verb when chat language signals maintainer-mode ("any new issues?", "what should I triage?", "check inbound") via a new tip trigger `intent-maintainer-triage`. Frequency-capped via `cadence tip-pick`.
- Already surfaced via the reconciler flag pathway (SessionStart + `/reflect` Get Clear) when the inbound queue exceeds `cadence.yaml`'s `incoming_queue_threshold` (default 5).

**Guardrails:**
- `gh` is a hard prerequisite — no offline mode.
- Never auto-route. Every outcome requires explicit per-issue choice.
- Never silently include attribution data beyond what's already public on GitHub. The verb only **reads** public issue content and **writes** new labels/comments visible on the issue.
- Skip does not persist — no skipped-label sprawl.

**Exit:**
```
Triaged <N> issues:
  - <M> routed to projects/actions/ideas
  - <K> closed
  - <D> deferred
  - <S> skipped

<inbound queue: <remaining> issues>
```

Plus verb-hint block + teaching footer per the universal exit convention.
