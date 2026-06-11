---
description: Universal work-entry verb — curated selection, pursuit workspace, project view, brainstorm resume, or Inbox triage. TRIGGER on explicit /cadence:start invocation, OR when the user asks to begin work by name (e.g., "let's start a session", "start working on X", "open X", "what should I work on", "walk my inbox"). SKIP for conversation that merely picks a topic to think about.
---

# /start

Open a workspace for work. `/start` is the universal entry point — one
verb for every "I want to begin doing something" intent. Argument
shape determines what gets opened. Reference
`workflows/verb-contracts.md` for the start register.

`/start` is **view-only**: it doesn't mark sessions, doesn't write
pointers, doesn't load markers. It surfaces the entity's current
state so the user can pick up from where the file says they are.
Promotion from `on_hold` to `active` happens only on the first
checked action — the act of working, not the act of viewing.

## Usage

- `/start` — curated selection across pursuits, projects, brainstorms, Inbox
- `/start <pursuit>` — pursuit workspace view (Why, LP alignment, open projects, brainstorms tied here)
- `/start <project>` — open the project's view (Intent + next action)
- `/start <brainstorm-slug>` — resume the brainstorm at its current phase
- `/start inbox` — walk the Inbox view item-by-item with the outcome menu (reserved keyword)
- `/start brainstorm` — open `/cadence:brainstorm` for a new workspace (reserved keyword)

Arguments resolve via fuzzy match, partial match, or natural language —
**except** the reserved keywords `inbox` and `brainstorm`, which match
literally and never resolve to a user-named entity. Naming a pursuit
or project `inbox` or `brainstorm` should be avoided; the reserved
tokens win on collision.

## CLI binding

Gather all curation data with one call:

```bash
cadence report --json
```

The response includes `snapshot.config`, `snapshot.pursuits`,
`snapshot.projects` (with `dodProgress`, `actionProgress`,
`last_activity_at`), `snapshot.brainstorms`, `snapshot.captures`,
`snapshot.reflections`, and `flags`. The agent reads from this single
payload — no separate Read or Glob calls needed for state.

The curated menu's "Likely next move" is computed by the same
`curateNextMoves()` function the dashboard uses (`src/render/curation.ts`).
That keeps `/start` and `/cadence:status` consistent: a single ranker
deciding what to suggest.

## Routing

The argument resolves in this order:

1. **No argument** → curated selection (below).
2. **Reserved keyword `inbox`** → Inbox triage walk (below).
3. **Reserved keyword `brainstorm`** → forward to `/cadence:brainstorm`.
4. **Brainstorm slug** (exact or fuzzy match against `snapshot.brainstorms[].slug` where `phase` ∈ `diverging | converging`) → resume the workspace at its phase. Forward to `/cadence:brainstorm <slug>`.
5. **Pursuit ID** (fuzzy/partial against `snapshot.pursuits` where `lifecycle: active`) → pursuit workspace view.
6. **Project ID** (fuzzy/partial against `snapshot.projects`) → project view.
7. **No match** → "No pursuit, project, or brainstorm matches '[arg]'. Try `/cadence:status` to see options, or `/cadence:start` for a curated menu."

When a token could plausibly match both a pursuit and a project (e.g. fuzzy collision), prefer the more-specific match: project ID first, then pursuit. Brainstorm slugs are surfaced verbatim in the curated menu so the user can disambiguate.

## Steps

### No-argument entry (curated selection)

1. Run `cadence report --json` and parse it. Compute these from the payload:
   - **Leveraged Priority:** sort `snapshot.reflections` by date desc, take the first non-null `leveraged_priority`.
   - **Active pursuits:** `snapshot.pursuits` where `lifecycle: active`.
   - **Open projects per pursuit:** `snapshot.projects` filtered by `pursuit` and `status: active | on_hold`.
   - **Active brainstorms:** `snapshot.brainstorms` where `phase: diverging | converging`.
   - **Inbox view:** call `inboxItems(snapshot)` (or read its derived count from the dashboard helper) — total + the bucket breakdown (fresh/aged/overdue) per `coaching-strings.md`.
   - **Curated next moves:** the top entry from `curateNextMoves()` — same ranker the dashboard uses.

2. Present the menu (markdown, navigation-led):

   ```
   # What do you want to work on?

   **This week**: <LP framing (uplevelled, lower-cased)>.

   ## Pursuits — pick one to drop into its workspace
   - `<pursuit-id>` (<N/M projects done>) — <first sentence of Why>
   - `<pursuit-id>` (<N/M>) — <first sentence of Why>

   ## Open Projects — drop straight into one
   - `<project-id>` [active, <N/M actions>] — <first sentence of Intent>
   - `<project-id>` [on_hold, <N/M actions>] — <first sentence of Intent>

   ## Active Brainstorms — resume a workspace
   - `<slug>` [diverging] — last touched <ago>
   - `<slug>` [converging] — last touched <ago>

   ## Inbox — <line from coaching-strings.md>
   ## /start inbox — walk untriaged items (oldest first, outcome menu per item)

   ---
   **Suggested**: `<verb> <target>` — <rationale>
   ```

   Each section collapses when its input is empty:
   - No active pursuits → skip Pursuits section
   - No open projects → skip Open Projects section
   - No active brainstorms → skip Active Brainstorms section
   - Inbox empty → the Inbox line reads `Inbox: empty ✓` and the `/start inbox` row is omitted (nothing to triage)

   The **Suggested** line at the bottom takes the top entry from `curateNextMoves()`. The user is free to ignore it; it's a "if you don't know what to pick" hint, not a directive.

3. Wait for the user to choose. Resolve their choice (project ID, pursuit ID, brainstorm slug, `inbox`, or the suggested verb's target) and re-route through the routing rules above.

### `/start <pursuit>` — pursuit workspace view

1. Resolve the argument to an active pursuit. If `lifecycle: someday`, ask: "[Pursuit] is on hold — open it anyway? (this won't reactivate it until the first action is checked)." If `lifecycle: archived | dropped`, refuse: "[Pursuit] is [lifecycle]. New work needs a new pursuit."

2. Fetch the pursuit's full state with `cadence pursuit <id> --json`, plus the Inbox view to filter the pursuit's slice.

3. Present the workspace:

   ```
   # `<pursuit-id>` workspace

   **Why this pursuit exists**: <first 1-2 sentences of `why`>

   **LP alignment**: <one of>
     - "This pursuit IS the LP — `<lp text>`."     (when LP text overlaps the pursuit ID or Why)
     - "The current LP names a different pursuit (`<other-id>`)."  (when LP overlaps a different active pursuit)
     - "No LP set this week."                       (when no LP recorded)

   ## Open projects
   | Project | Status | Actions | Next action |
   |---|---|---|---|
   | `<project-id>` | <active/on_hold> | <N/M> | <first unchecked action text> |

   ## Active brainstorms tied here (if any)
   - `<slug>` [converging] — last touched <ago>

   ## Inbox slice (if any)
   <N> untriaged items reference this pursuit:
   - <one-line summary of the capture body or brainstorm topic> (<age>)

   ## Pick a move
   - `/cadence:start <project>` — drop into a project
   - `/cadence:brainstorm <slug>` — resume a brainstorm
   - `/cadence:start inbox` — triage the pursuit's slice (or all)
   ```

   **Inbox slice attribution heuristic.** A capture belongs to this pursuit if its `verb_context` references the pursuit ID (e.g. `seed:<pursuit-id>`, `note:<pursuit-id>`) OR its body contains the pursuit ID as a substring. A brainstorm belongs here if its `source_thoughts` array overlaps with captures attributed to this pursuit OR its slug contains a substantial pursuit-ID token. Conservative on purpose — false attribution is more confusing than no attribution.

   If no Inbox slice can be attributed, omit the Inbox section.

4. The user picks the next move. Resolve and forward.

### `/start <project>` — project view (existing behavior)

1. Resolve to an `active` or `on_hold` project. If status is `done` or `dropped`: "[Project] is already [status]. Want to create a follow-up project?"

2. Fetch the project state with `cadence project <id> --pursuit <pursuit-id> --json`.

3. Present:

   ```
   `<pursuit>` / `<project>` — <N/M actions>

   **Intent**: <first sentence or two of intent>

   **Next**: <first unchecked action text>
   ```

   If status is `on_hold`, append `[not started — first action check promotes to active]`.

4. The user works the project from there — checking actions via `/cadence:complete`, capturing via `/cadence:capture`, etc. The first checked action will auto-promote `on_hold` → `active` via the existing CLI behavior.

### `/start <brainstorm-slug>` — resume brainstorm

1. Resolve to a brainstorm with `phase: diverging` or `converging`. Crystallized/archived brainstorms surface a "this is closed — view at `brainstorms/<slug>/decision.md`" hint and refuse to resume.

2. Forward to `/cadence:brainstorm <slug>` — the brainstorm SKILL handles phase-specific behavior.

### `/start inbox` — Inbox triage walk

1. Load the Inbox view via `cadence report --json` (the snapshot already exposes inbox items, or call the dashboard helper).

2. If the Inbox is empty: "Inbox: empty ✓. Nothing to triage." Exit.

3. Walk items **oldest-first** (overdue → aged → fresh). For each item, render:

   ```
   <bucket> · <age> · <kind> — <triage_gist, when present>
   ---
   <item summary — body for captures, topic for brainstorms>
   ---
   Outcome:
     [a] action — add to a pursuit's project
     [p] project — create a new project from this
     [b] brainstorm — open a new diverging workspace from this seed
     [c] close — discard with a reason (what did this teach?)
     [k] keep — leave in Inbox; surface again next walk
     [q] quit — exit the walk; remaining items stay
   ```

   **Gist-on-open.** When a capture has no `triage_gist` (inline
   captures stay bare by contract), compose one now — one sentence,
   ≤120 chars, what the item IS — from the body already in context,
   and persist it into the capture's frontmatter via Edit before
   prompting for the outcome. Costs nothing extra (the body is being
   read anyway) and the next walk renders it. Items the user keeps
   come back gisted.

4. Apply the chosen outcome:
   - **action** — prompt for the target pursuit/project and the action text. Append via `cadence add-item <project-id> --pursuit <pursuit-id> --section action --text "<text>"`. Mark the source capture `status: triaged, triaged_to: action:<pursuit>/<project>/<index>` via `cadence write-capture --slug <existing> --status triaged --triaged-to ...`.
   - **project** — prompt for the project ID + Intent (one sentence). Create via `cadence create-project <id> --pursuit <pursuit-id> --status on_hold --intent "<text>" --action "<first action>"`. Mark source `triaged_to: project:<id>`.
   - **brainstorm** — prompt for a slug. Create via `cadence create-brainstorm <slug> --source-thought <existing-thought-id>`. Mark source `triaged_to: brainstorm:<slug>`.
   - **close** — prompt for the lesson ("what did this teach?"). Mark source `status: discarded` with the reason. The reason gets appended to the capture body as a Notes section.
   - **keep** — no-op. Continue.
   - **quit** — break out of the loop. Save progress (any items already triaged stay triaged).

5. Exit summary:

   ```
   Triaged <N> items: <A> as actions, <P> as projects, <B> as brainstorms, <K> closed, <J> kept, <Q> skipped (quit).
   <remaining-count> items still in the Inbox.
   ```

### During flow (any entry path)

- **Silent.** Respond only to direct questions or explicit prompts.
- **No unsolicited suggestions.** No "have you considered." No observations.
- **Batch everything for breakpoints.** If you notice something (a quick win, a flag, a concern), hold it until a natural pause.
- **Keep the work moving.** After completing a step, prompt with what's next rather than waiting for explicit continuation.

### At breakpoints (natural pauses, task completion, user-initiated)

- Surface batched observations, quick wins, parking lot items.
- Keep it terse. One or two lines max.

### Universal exit — verb-hint + teaching footer

Every `/start` natural exit emits the two standard surfaces from the
runtime contract:

1. **Verb-hint block** — 2-3 contextual next-step suggestions tied to where the user now is. After a triage walk: `/cadence:reflect` (the Inbox is fresh — capture the week's arc) or `/cadence:start <next-project>` (continue executing). After a project view: `/cadence:complete`, `/cadence:waiting`, `/cadence:capture`. After a pursuit view: drop into a project, resume a brainstorm, or `/cadence:resolve <pursuit>` if all projects are done.

2. **Teaching footer** — `cadence tip-pick --triggers verb-start` returns a one-line teaching tooltip when eligible. Render below the verb-hint block separated by a blank line. Skip when no tip is eligible (null return).

## Guardrails

- **No mid-flow interruptions.**
- **No unsolicited suggestions during flow state.**
- **Captures via /capture are parking lot only — no triage, no response.**
- **No evaluative commentary on progress.**
- **No session ceremony.** `/start` is a view; the project file is the truth. There is no `/pause` counterpart, no marker write, no active-session pointer. Lifecycle changes happen via `/complete` (action checks), `/cancel` (drop), or direct CLI mutations.
- **Reserved keywords win on collision.** A pursuit or project named `inbox` or `brainstorm` cannot be opened via `/start <id>` — the keyword takes precedence. Rename the entity or use the drill-down `cadence pursuit inbox` / `cadence project inbox` if you ever need to. (The CLI doesn't reserve these keywords; only the SKILL does.)
- **`/start inbox` does not auto-respond mid-walk.** Each item gets an explicit outcome choice. Don't auto-suggest actions even when the capture's `suggested_outcomes` frontmatter carries a high-confidence recommendation — the triage walk is the moment for explicit user decision-making.
