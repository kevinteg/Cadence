# Cadence at orchestration scale — design notes

> **Status: proposal (2026-09).** A whole-repo review against one question: how does Cadence hold up when most of the work is done by long, unattended Fable or Opus 5.5 sessions rather than by a person working a checklist in a terminal? This document plays the role `docs/narrative-wiki-architecture.md` played for the wiki layer: the blueprint a pursuit gets built from. Nothing here is implemented yet.

---

## TL;DR

Cadence was built around a person doing the work. Every primitive that touches execution assumes it: an Action is "a concrete move you can visualize doing," `/complete` checks one at a time, projects require an action at creation, and the activity stream that feeds narratives and dormancy is the git log of *project files* (`src/scan/git-activity.ts`), so progress is only visible when someone edits the tracker. That was the right shape for v1. It is the wrong shape once a capable model runs an ambiguous project unattended for hours: the agent generates the actions, checks them off itself, and the tracker becomes bookkeeping about bookkeeping.

The proposal keeps the three things that still matter and changes the layer underneath them:

- **Keep** Pursuits (Why), the project **Intent** narrative, the Leveraged Priority, the Inbox, brainstorms, the wiki, and every guardrail (no praise, no streaks, no speculative deadlines, flow protection, human-generated ideas).
- **Add three primitives.** A **Run** is one unattended agent execution against a project, recorded by the agent at the end as a compact record: what landed, what it produced, what it could not decide. A **Thread** is anything that needs the *human*: a decision, a review, an unblock, a person you are waiting on. An **Artifact** is a rich output (a site, a diagram, a report, a dashboard) registered on the project so the human follows the work by opening it.
- **Demote Actions** from the mandatory checklist to an optional, coarse list. Done-ness was always judged in dialogue against the Intent; that doctrine stays and the checkbox mechanic recedes.
- **Add a loop of two verbs.** `/brief` composes a handoff for an unattended run from the Intent, the open threads, and the pursuit's standing constraints. `/debrief` is the return path: the run record, updated threads, refreshed artifacts. The record has the three fields the attention-residue research asks for (Where / Next / Open), which is the v1 session marker reborn for a different actor.
- **Reshape attention.** The splash and `/start` lead with "Needs you: N threads," then "Landed since you last looked," then the LP. Curation ranks human decisions above recency. The reconciler learns what an unreviewed run and a stale thread look like.
- **Widen the activity stream.** Narratives and dormancy read runs and the commits in the *workspaces* where the work actually lands (other repos, resolved read-only through the existing registry), with project-file edits as one source among several.

---

## 1. What changed in how the work gets done

Three facts from this repo describe the shift better than any argument.

**The tracker's grain was set for a person.** `build-cadence-v1` closed with 47 projects and 331 actions; `improve-ux-and-vision` with 21 projects and 163. Actions like "Copy updated reconciler and reflect workflows to plugin" were written by the agent and checked by the agent. Issue #7 (`session-blast-radius-hygiene`) measured the pattern on the personal repo: 278 actions minted against 65 checked, scope inflow four times burn. Issue #6 found 28 of 34 open projects sitting in `on_hold`, invisible to every scan. The granularity that made a human session legible is noise at agent speed.

**Progress became invisible to the system.** `cadence project-activity` reads `git log -- pursuits/`. That is the only stream `/narrate`, the dormancy flag, `last_activity_at`, and the "Touched today" curation signal consume. The v1 self-review named this as the physical-pursuit failure ("no commit history of fatherhood"); it now applies to digital work too, because the commits land in the work repo and the generated site, and nobody edits the project file afterwards. This repo's own log shows it: product work stops in July 2026, the tone-gate commits in September are the only activity, and the reconciler has nothing to say about it because nothing it watches moved.

**The output changed shape.** The way you follow work now is a generated site or a diagram the agent wrote, opened in a browser. Cadence's output model is terminal markdown; the wiki's diagram policy is Mermaid-only with "no generated SVG, no image assets" (`wiki/_style/diagrams.md`). The Marimo console was deferred as "less central" once the wiki shipped; in practice the console arrived anyway, as agent-authored pages, and Cadence does not know they exist.

The self-review's gap table already listed the missing primitives: "Project automation — delegate coding projects to autonomous execution: not implemented," "Scheduled/triggered autonomous workflows: none," "Autonomous execution of recorded actions: `/complete` records, doesn't *do*." The docs then correctly stripped those claims. This document puts them back with a design.

## 2. What must survive

The request names three things, and each maps to something Cadence already does well:

| Keep | Where it lives today | What changes |
|---|---|---|
| **Open threads** | `waiting_for` on projects (person / what / expected), the Inbox view, pending validations, project Notes | Generalized into a first-class Thread with a small kind set, and a "Needs you" view that unions every open thread across projects, the way the Inbox unions captures and diverging brainstorms |
| **Curation** | `curateNextMoves()` (LP → recency → structural → parking-lot → routine), the wiki as curated corpus, tips | Two new inputs ranked *above* recency: threads waiting on a decision, and runs that landed unreviewed. Recency itself is re-derived from runs and workspace commits |
| **High-level intent** | Pursuit Why, project Intent, Leveraged Priority, win cycles | Unchanged. The Intent becomes the core of every brief; a pursuit gains an optional standing-constraints section that every brief under it inherits |

Everything in "Guardrails" and "Design Principles (Hard Rules)" in `wiki/concepts/architecture.md` stays in force. Two of the fourteen principles get amended rather than removed (see §10).

## 3. The model

```
Pursuit ──► Project ──► { Runs, Threads, Artifacts, Actions? }
   │           │              │        │         │
 Why?      Intent?      what the    what     what the human
                        agent did   needs    opens to follow
                                    a human
```

### Project

Still a scoped effort framed by an Intent narrative. Three additions to frontmatter, all optional:

- `workspaces:` — where this project's work lands. Each entry is a git URL or registered repo name plus optional branch or path. Resolved per machine through the existing registry and sibling-dir discovery (`src/delegation.ts`, `src/publish.ts`); never path-bound. Read-only, like delegates.
- `artifacts:` — registered rich outputs (see §6).
- `threads:` — open items needing the human (see below). `waiting_for` becomes the `waiting` kind of thread; the field stays readable for compatibility.

One change to creation: a project needs an Intent and *either* an action *or* a brief. "Defining work is not starting it" still holds; the first **run** promotes `on_hold → active` the way the first checked action does today.

### Run

One unattended agent execution against a project. Runs are the agent's sessions, and they earn a record because the agent writes it at zero cost to the human, which is the exact opposite of the reason v1 removed human session markers (`remove-session-concept`: markers carried only ceremony). The record is the ready-to-resume plan from Leroy & Glomb (2018), written by the actor that has the context, for the actor that has to pick it up:

```markdown
## [2026-09-29T14:10] run | rebuild the fleet nav site from the manifest
brief: briefs/2026-09-29T09-00.md
workspace: home-tech@main 3f2a9c1..8b77d04 (14 commits)
outcome: landed        # landed | partial | blocked | abandoned

**Where.** Nav site regenerates from `cadence fleet --json`; deployed to
the pages branch; three spoke repos render, city-services is missing a
manifest.

**Next.** Add `cadence-manifest.yaml` to city-services, then re-run
the site build. Suggested brief attached below.

**Open.** (→ threads) Should the nav site expose gated endpoints at
all? (decide) · Review the site before it replaces the hand-made
landing page. (review)

artifacts: site:https://nav.example.org · diagram:wiki/fleet/nav-flow.svg
```

Runs append to a per-project `runs.md` log (same H2-entry shape as research and wiki logs, append-only, never edited). The log is the activity stream for that project; git history of the log is the audit trail. Runs are not a WIP-limited entity and they are never "completed": they are events.

### Thread

Anything that needs the human. Small fixed kind set so surfaces can render one line per thread and rank them:

| kind | Meaning | Closes when |
|---|---|---|
| `decide` | A question the agent could not or should not answer alone | the human answers (the answer is recorded on the thread and inherited by the next brief) |
| `review` | Something landed that wants eyes before it counts | the human reviews (optionally with a one-line verdict) |
| `unblock` | The agent hit something only the human can do (credentials, a purchase, a phone call) | done |
| `waiting` | Waiting on a person, with an expected date — today's `waiting_for` | the person delivers |

Threads carry `opened` (timestamp), `by` (`run:<id>` or `human`), `text`, `status: open | closed`, and an optional `closed_with` note. They live in project frontmatter, the way `waiting_for` does, so the project file stays the single durable state. The **Needs-you view** (`needsYou(snapshot)` beside `inboxItems(snapshot)`) unions open threads across all projects in active pursuits, oldest-first within kind, and every surface quotes one canonical line: `Needs you: 3 (1 decide, 1 review, 1 waiting)`. One function, one number, every surface, same as the Inbox.

Threads are the Zeigarnik exploit relocated. In v1 the human's open loops were the unchecked actions; now the agent carries those, and the human's loops are the decisions and reviews the agent handed back. Writing them down where the human will see them next is what releases the tension (Masicampo & Baumeister 2011).

### Artifact

A registered rich output: `kind: site | diagram | report | dashboard | doc | other`, a `path` (repo-relative) or `url`, a `summary`, and `updated`. Artifacts are how the human follows the work. Project views, the pursuit workspace view, and the splash link to them; `cadence find` indexes their summaries. See §6 for where the files live.

### Actions, demoted

Actions stay for the two cases they still serve: physical-domain projects where the human is the executor, and small human moves that do not deserve a brief. They stop being mandatory, stop being the promotion trigger when a run exists, and stop driving the "all actions checked, does the intent feel achieved?" prompt when the project has runs (that prompt moves to `/debrief`, where the record is in hand). `/complete` keeps its contract for the actions that remain.

## 4. The loop

```
        ┌──────────────────────────────────────────────────┐
        │  /brief <project>                                  │
        │  Intent + standing constraints + open threads      │
        │  + last run's Next → a handoff document            │
        └───────────────┬────────────────────────────────────┘
                        ▼
        ┌──────────────────────────────────────────────────┐
        │  the run (outside Cadence's control)               │
        │  a Fable session in the workspace repo             │
        └───────────────┬────────────────────────────────────┘
                        ▼
        ┌──────────────────────────────────────────────────┐
        │  /debrief  (agent-authored, end of run)            │
        │  run record → runs.md · threads opened/closed      │
        │  artifacts refreshed · proposed next brief          │
        └───────────────┬────────────────────────────────────┘
                        ▼
        ┌──────────────────────────────────────────────────┐
        │  the human, at a breakpoint                        │
        │  splash: Needs you · Landed since you last looked  │
        │  /threads → decide / review / unblock              │
        │  /reflect → LP · /narrate → the story              │
        └──────────────────────────────────────────────────┘
```

### `/brief <project>`

Composes the handoff document for an unattended run and saves it to `pursuits/<p>/projects/<id>/briefs/<timestamp>.md`. Sections, in order:

1. **Intent** — verbatim from the project. This is the felt-sense of done the run is judged against.
2. **Standing constraints** — the pursuit's optional `## How we work here` section (voice, tools, what never to touch, review expectations). Written once per pursuit, inherited by every brief.
3. **Where we are** — the last run's Where/Next, the current artifacts, the workspace pointers.
4. **Decided** — closed `decide` threads and their answers, so the agent never re-litigates a settled question.
5. **Scope** — what this run is for, optionally narrowed by the user in the `/brief` dialogue.
6. **Stop conditions** — the Gollwitzer if-then plans for the agent: "if you need X that only the human can supply, open an `unblock` thread and stop; if a design choice would change the Intent, open a `decide` thread and stop; if a checkable acceptance criterion cannot be met, record `partial`." Specificity is the active ingredient; vague briefs produce vague runs.
7. **Debrief instruction** — the literal closing step: refresh artifacts, then `cadence run-log --root <cadence-repo> --project <id> ...` with the record, threads, and artifact lines.

`/brief` is a composition verb. It never dispatches. Dispatch is whatever the user does with the file: paste it into a fresh session, hand it to a scheduled routine, or (opt-in, later) `--dispatch` through `claude -p` or the remote-session surface. That keeps the suggest-don't-run discipline and the Scope rule intact: Cadence writes state in this repo; it does not run agents.

### The run

Happens in the workspace repo, outside Cadence's control. Cadence's only contract with it is the brief going in and the debrief coming out.

The debrief write is the one new sanctioned guest-mode surface. Today a session outside a Cadence repo may capture, read status, and file a report. It gains **run-log** (`cadence run-log --root <name>`): a compact, schema-checked append to one project's `runs.md` plus thread and artifact updates on that project's frontmatter. It is the same shape of exception as capture: a small structured write, into a registered repo, that the human triages at a breakpoint. No other write opens.

### `/debrief [<project>]`

Two callers. The agent at the end of a run calls the CLI directly per the brief's closing step. The human calls the verb to review what landed: it walks unreviewed runs newest-first, shows each record with its artifacts linked, and offers per run: accept (mark reviewed), open a thread, adjust the Intent, or write the next brief. When a run reports `landed` and the project's Intent reads as achieved, this is where the "does the intent feel achieved?" dialogue fires now, with the evidence on screen instead of a swept checklist.

A run is *unreviewed* until the human's review watermark passes it. The watermark is `last_reviewed_run` on the project, the same pointer-as-artifact pattern as narrative watermarks.

### `/threads`

The generalization of `/waiting`. No argument: render the Needs-you view grouped by kind, oldest first, each with its project and the run that opened it. With a thread: close it with an answer or verdict (recorded on the thread; a `decide` answer flows into the next brief's Decided section). `/waiting` stays as the alias that opens a `waiting` thread with the three-question flow it has today; its skill and contract do not change.

### What the existing verbs become

| Verb | Today | Under this design |
|---|---|---|
| `/start` | curated menu; project view shows Intent + N/M actions + first unchecked | menu leads with Needs-you and Landed-since; project view shows Intent, last run's Where/Next, open threads, artifacts, then actions if any |
| `/complete` | check an action; upward prompt when all checked | unchanged for actions; the upward prompt defers to `/debrief` when the project has runs |
| `/resolve` | intent-achieved dialogue; research and living-doc disposition | same, plus artifact disposition (keep / graduate to wiki / drop) and a block on open `decide` threads, override-with-reason like unchecked actions |
| `/waiting` | record a person blocker | alias for `/threads` kind `waiting`; unchanged UX |
| `/narrate` | reads project-file commits | reads runs and workspace commits too (§7); daily narrative gains a "landed while you were away" beat |
| `/reflect` | Get Clear: Inbox, dormant, closing-in, WIP | Get Clear adds Needs-you and unreviewed-runs counts before the awareness block; the LP question is unchanged |
| `/status` | dashboard | "Heads up" becomes thread-led; artifacts link from project rows |
| `/capture`, `/brainstorm`, `/research`, `/wiki`, `/publish` | | unchanged |

## 5. Attention at scale

When several runs can land in a day, the scarce resource is the human's review attention, and the design constraint is Cowan's four chunks. The SessionStart splash reorders to:

```
# Cadence Status

**This week**: <LP framing>.

## Needs you — 3
- decide · `fleet-nav-site` · Should the nav site expose gated endpoints? (run 14:10 today)
- review · `fleet-nav-site` · New site is live at nav.example.org — replaces the hand-made page? (run 14:10 today)
- waiting · `pursuit-delegation` · Sarah re: spoke access (expected 09-26, 3d over)

## Landed since you last looked — 2 runs
- `fleet-nav-site` · landed · 14 commits in home-tech · site + diagram refreshed
- `guest-mode` · partial · delegated-scope proxying half done; opened 1 decide

## Active Pursuits
…(as today)…

## Likely next moves
1. `/cadence:threads` — 1 decision is holding a run.
2. `/cadence:debrief fleet-nav-site` — landed today, unreviewed.
3. `/cadence:start guest-mode` — LP-aligned.
```

`curateNextMoves()` gains two inputs at the top of its priority order: an open `decide` thread that blocks a run (the binding constraint in Goldratt's sense, since a paused run is throughput lost), then unreviewed `landed` runs. LP alignment, recency, structural urgency, parking-lot pressure, and routine follow as today. Recency is re-derived: `last_activity_at` becomes `max(project-file commit, last run, last workspace commit)`.

WIP stays on projects, counted as today (`active` with open work), where "open work" now means an unchecked action, an open thread, or a run in the last `dormant_days`. A new soft cap, `needs_you_soft_threshold` (default 6), fires a `needs_you_pressure` flag the way `inbox_pressure` does: descriptive, never scolding.

New reconciler flags, in `workflows/reconciler.md` language:

- `run_unreviewed` — a `landed` or `partial` run older than `review_grace_days` (default 2) with no review. Informational: "3 runs landed without a look."
- `run_blocked` — a run ended `blocked` and its `unblock` or `decide` thread is still open. Highest-ranked flag; it is throughput on hold.
- `thread_stale` — an open thread older than `thread_stale_days` (default 7). Replaces the overdue-waiting-for flag for the `waiting` kind and generalizes it.
- `dormant_project` — unchanged semantics, new evidence: no action check, run, or workspace commit in `dormant_days`. This is the fix for the July-to-September silence.
- `artifact_stale` — an artifact whose `updated` predates the last `landed` run on its project by more than a day. Quiet nudge that the follow-along page may be behind.

## 6. Rich artifacts

The human follows the work by opening what the agent made. Cadence's job is to know what exists, link it from every entity view, and decide what survives closure. It does not generate sites or diagrams itself; runs do.

**Registry.** `artifacts:` on the project (§3). `cadence artifact-add` / `artifact-touch` are the CLI writes; `/debrief` refreshes `updated`. `cadence find` indexes `summary` so "where's the diagram of the fleet flow?" resolves.

**Where files live.** Three homes, chosen by lifetime:

| Home | Lifetime | Examples |
|---|---|---|
| The workspace repo (a URL or a path there) | the work's | a deployed site, a dashboard served from the project's own repo |
| `pursuits/<p>/projects/<id>/artifacts/` | the project's; disposition at `/resolve` like `research/raw/` | an HTML status page the run regenerates, an SVG, a PNG, a PDF |
| `wiki/<shelf>/` with assets beside the page | durable; never GC'd | a diagram promoted into a capstone, a primer's figure |

**Media policy.** `wiki/_style/diagrams.md` relaxes from Mermaid-only to Mermaid-first: Mermaid for anything that can be said in twelve nodes, because it diffs and renders everywhere; SVG, PNG, and HTML allowed as *assets referenced from a titled markdown page*, so recursive discovery (`scanWikiArtifacts`, title-keyed) keeps working unchanged and MkDocs serves the assets. Binary assets in `wiki/` are the durable exception; in `artifacts/` they are GC-eligible.

**The follow-along page.** A convention, not a verb: a run that produces a visual status page writes it to the project's `artifacts/index.html` (or a URL) and registers it as `kind: dashboard`. `/start <project>` and the splash link it first. This is the Marimo console's "notebook references, Claude Code owns sidecars" idea with the notebook removed: the agent owns the page, Cadence owns the pointer.

**The repo's own console.** `wiki/` already renders to GitHub Pages (`mkdocs.yml`, `.github/workflows/pages.yml`). A later step can add a generated `wiki/console/` page from `cadence status --json` plus the registered artifacts, rebuilt by the pages workflow, so the dashboard has a URL. Deferred until the artifact registry has content to show.

## 7. Activity streams

`cadence project-activity` becomes a union of three sources, each tagged so the narrator can say where a fact came from:

1. **Project-file commits** in the Cadence repo (today's stream; unchanged).
2. **Run records** from `runs.md` (structured: outcome, Where/Next/Open, artifacts, thread events). This is the richest source and the one physical and non-git projects can use too: a `/debrief` written by the human after an afternoon in the garage is a run record.
3. **Workspace commits** — `git log` in each resolved `workspaces:` entry since the watermark. Read-only, per-machine resolution, silently skipped when a workspace is not checked out here (the run record still carries the commit range, so nothing is lost).

Watermarks generalize to one per source: `consumed_through_commit` stays for the Cadence repo; `consumed_through_run` and `consumed_through_workspace: {<repo>: <hash>}` join it in narrative frontmatter. The narrative is still the pointer.

The narrator's contract changes in one place: the daily cadence gains a since-last-time beat sourced from runs ("two runs landed: … · one blocked on …"), and the pursuit and capstone cadences cite run records the way capstones cite research notes. No evaluative language; a `blocked` run is described, never judged.

## 8. Formats

Project frontmatter, additions only (everything today keeps working):

```yaml
---
id: fleet-nav-site
pursuit: improve-ux-and-authoring
status: active
created: 2026-09-20
workspaces:
  - repo: git@github.com:someone/home-tech.git   # or a registered name
    branch: main
    path: sites/nav                                # optional
artifacts:
  - kind: site
    url: https://nav.example.org
    summary: Fleet navigation site generated from cadence fleet --json
    updated: 2026-09-29
  - kind: diagram
    path: artifacts/nav-flow.svg
    summary: Manifest → fleet → site build flow
    updated: 2026-09-29
threads:
  - id: t1
    kind: decide
    text: Should the nav site expose gated endpoints at all?
    opened: 2026-09-29T14:10
    by: run:2026-09-29T14-10
    status: open
  - id: t2
    kind: waiting
    text: Sarah re: spoke repo access
    expected: 2026-09-26
    opened: 2026-09-22T09:00
    by: human
    status: open
last_reviewed_run: 2026-09-28T17-40
---
```

`waiting_for` remains parseable; the scanner maps each entry to a `waiting` thread so old files need no migration.

Per-project files beside the project markdown, created lazily on first use, same convention as `research/`:

```
pursuits/<p>/projects/<id>/
    runs.md            append-only run log (H2 per run; see §3)
    briefs/<ts>.md     the handoff documents (provenance for runs)
    artifacts/         GC-eligible rich outputs
```

Pursuit frontmatter is unchanged; `pursuit.md` gains an optional `## How we work here` body section that `/brief` inherits.

CLI additions: `run-log`, `runs <project>`, `thread-open`, `thread-close`, `threads`, `artifact-add`, `artifact-touch`, `brief-write`, plus `needs-you` for the view. `project-activity` gains `--sources project,runs,workspaces`.

Config additions in `cadence.yaml` → `defaults`: `review_grace_days: 2`, `thread_stale_days: 7`, `needs_you_soft_threshold: 6`.

## 9. Research alignment

The foundations in `wiki/research/research-foundations.md` do not change; several of them land in a new place.

| Pattern | Where it lived | Where it lives now |
|---|---|---|
| Ready-to-resume plan, attention residue (Leroy 2009; Leroy & Glomb 2018) | the retired session marker; then "the first unchecked action IS next" | the run record's Where / Next / Open, written by the agent for the human |
| Zeigarnik release via specific plans (Masicampo & Baumeister 2011) | unchecked actions and `waiting_for` | threads: the human's open loops, one line each, surfaced where the human will look next |
| Implementation intentions (Gollwitzer 1999) | if-then nudges in Reflect | the brief's stop conditions: if-then plans for the agent, which is where specificity now pays |
| Progress principle (Amabile & Kramer 2011) | "projects advanced" in narratives | "Landed since you last looked," informational, sourced from run outcomes |
| Working-memory ceiling (Cowan 2001) | 3-4 items per view | Needs-you capped at four lines on the splash; the rest behind `/threads` |
| Mode separation (Guilford; Beaty et al.) | verb registers | the human's modes are now brief (converge intent), review, decide, reflect; the agent executes. Brainstorm stays human-generated |
| WIP on the binding constraint (Goldratt) | active projects | active projects still; a blocked run is ranked as the binding constraint in curation |
| Closure as meaning-making | `/resolve` | unchanged, plus artifact disposition and a soft block on open decisions |

## 10. What this reverses, and why

Honesty about the reversals matters more than pretending continuity.

**Sessions become a primitive again, for a different actor.** v1 removed sessions and markers because a human writing a marker was ceremony with no consumer (`remove-session-concept`, 2026-04-30). A run record is written by the agent, costs the human nothing, and has four consumers on day one: the splash, `/debrief`, the narrator, and the reconciler. The v1 reasoning was correct; its premise (the human is the executor) no longer holds for most digital work.

**Actions stop being mandatory.** Principle 3 ("completion is derived, not declared") survives in stronger form: completion is derived from run evidence in dialogue against the Intent. The checklist was a proxy for evidence; the record is the evidence.

**Mermaid-only relaxes to Mermaid-first.** The reason for the rule (diffable, renders everywhere, local-first) still governs the durable wiki tier. Rich outputs are how the work is followed now, and a system that cannot point at them is not holding the user's context.

**The activity stream widens.** Principle 2 ("the artifact IS the state") is kept and extended: the project file is still the state; `runs.md` is the activity; workspace commits are evidence. The narrator reads all three and cites which.

**Guest mode gains one write.** The work/personal boundary stays: `run-log` writes a compact record into a *registered* repo, the same trust shape as capture, and nothing in a foreign repo with no registry entry changes.

## 11. Guardrails, unchanged and new

Unchanged: no streaks, scores, or badges; no evaluative praise (a run is "landed," "partial," or "blocked," never "great"); no mid-flow interruptions (the human's flow is at review breakpoints, and the agent's run is never interrupted by Cadence); no "why did it fail?" framing (run records answer "what happened" and "what's next"); no LLM-generated ideas in diverging brainstorms; no speculative deadlines (a brief carries stop conditions, never a due date); domain neutrality (a debrief after an afternoon of garden work is a run record with `workspace: none`).

New:

- **Cadence never dispatches on its own initiative.** `/brief` composes; the user runs. Any `--dispatch` path is explicit, opt-in, and ELI5-recapped.
- **Threads close only by the human.** An agent may open a thread; it may not close a `decide` or `review` thread. The answer is the human's.
- **Run records are informational and agent-authored; the human's review is the judgment.** The record says what happened; `/debrief` is where it counts.
- **Briefs inherit decisions, never re-open them.** A closed `decide` thread appears in every later brief's Decided section for that project.

## 12. Build sequence

Per `CLAUDE.md`, this is structural work and routes through Cadence: a new pursuit, proposed id `scale-to-orchestrated-work`, Why drawn from §1, with this document as its blueprint. Projects, each independently shippable and validated through the pending-validations queue:

1. **Threads and the Needs-you view** — `threads:` schema (with `waiting_for` mapped in), `thread-open/close/threads` CLI, `needsYou(snapshot)`, the canonical line in `coaching-strings.md`, `/threads` skill with `/waiting` as alias, splash and `/start` menu blocks, `thread_stale` and `needs_you_pressure` flags. Smallest step with the largest daily payoff; nothing else depends on runs yet.
2. **Run records and `/debrief`** — `runs.md` format, `run-log` CLI (guest-mode sanctioned with `--root`), `last_reviewed_run`, `/debrief` skill, `run_unreviewed` and `run_blocked` flags, "Landed since you last looked" on the splash, curation inputs for blocked runs and unreviewed landings. Actions become optional at creation; first run promotes.
3. **`/brief`** — brief composition from Intent, standing constraints, Decided threads, last run's Next; `briefs/` storage; the closing debrief instruction; pursuit `## How we work here` section.
4. **Workspaces and the widened activity stream** — `workspaces:` schema, per-machine resolution reusing `resolveDelegate`, `project-activity --sources`, dormancy and recency re-derived, narrator contract for the runs beat and multi-source watermarks.
5. **Artifacts** — registry schema and CLI, `artifacts/` disposition in `/resolve`, Mermaid-first media policy in `wiki/_style/diagrams.md`, artifact links on every entity view, `artifact_stale` flag, `cadence find` coverage.
6. **Docs and doctrine** — vision, architecture, runtime vocabulary, verb contracts, the two amended principles, the reversal notes from §10, and the "Feature Work Goes Through Cadence" rule in `CLAUDE.md` (Intent plus an action *or* a brief).
7. **Repo console page** (optional, last) — `wiki/console/` generated from `status --json` and the artifact registry, built by the existing pages workflow.

Steps 1 through 3 are the minimum coherent loop (threads → debrief → brief). Step 4 is what makes the reconciler and narrator honest again. Step 5 is what connects Cadence to the way the work is actually followed.

## 13. Open questions

1. **Run log per project or per pursuit?** Per project keeps the file next to the Intent it serves and matches `research/`. Per pursuit would make cross-project runs (one session touching three projects, the blast-radius pattern from issue #7) easier to record. Proposed: per project, with a run allowed to name `also_touched:` projects; the narrator follows the pointer.
2. **Should `/debrief` accept a transcript?** A run could hand its full transcript to a budgeted subagent (the capture-ingest pattern) that distills the record. Proposed: yes as an optional path (`run-log --from-transcript <path>`), never required; the brief's closing instruction produces a record without it.
3. **Dispatch.** Whether `/brief --dispatch` ships at all, and through which surface (`claude -p`, a routine, the remote-session API). Proposed: design it, ship it after the loop has been used by hand for a few weeks.
4. **Thread kinds.** Four is deliberately small. `question` (from the agent, non-blocking) and `idea` (the agent noticed something out of scope) are candidates; the second overlaps with capture and probably should stay a capture with `verb_context: run:<id>`.
5. **Migration of existing projects.** None required; every addition is optional. The 11 open projects in this repo become the first fixtures: brief one, run it in a fresh session, debrief it, and see whether the splash reads right the next morning.
