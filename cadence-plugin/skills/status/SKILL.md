---
description: Show system dashboard or drill into pursuits, projects, and actions. TRIGGER on explicit /cadence:status invocation, OR when the user asks for the dashboard by name (e.g., "what's my status", "show the dashboard", "how is X going"). SKIP for unrelated questions that mention a project or pursuit in passing.
---

# /status

Show a system-level overview, or drill down into pursuits, projects, and
actions. Accepts an optional argument to navigate the hierarchy.

The bundled CLI does the scanning. Skill responsibility is fuzzy
argument resolution and number-shortcut tracking.

## Usage

- `/status` — system dashboard with counts and flags
- `/status pursuits` — list all pursuits grouped by lifecycle
- `/status <pursuit>` — list projects in a pursuit (active brainstorms surface here too — phase + last_touched)
- `/status <project>` — show Intent and actions for a project
- `/status 1`, `/status 2` — numbered shortcut from the last list shown

Active brainstorms (workspaces with `phase: diverging | converging`)
are first-class entries in the dashboard and pursuit drill-down —
they surface alongside on_hold/active projects so the user can resume
ideation without hunting. See `cadence-reference.md` "Brainstorm
Workspaces" for the underlying shape. The full Next:-block reshape
that surfaces them in priority order lands in
`reshape-status-output-for-navigation`.

Arguments resolve via fuzzy match, partial match, or natural language.
`/status build` matches `build-cadence-v1`. `/status the plugin project`
matches `package-as-plugin`.

## CLI binding

Skills invoke `cadence <subcommand>` directly — the plugin's `bin/`
is on PATH. The CLI auto-detects repo root from cwd; default output
is tabular for humans, `--json` switches to structured output.

## Routing

If no argument is provided → run **Dashboard** below.

If the argument is exactly `pursuits` → run `cadence
pursuits` and present its output verbatim. Remember the displayed
ordering for number shortcuts.

If the argument is a number that matches the most recent numbered list
shown in this conversation, resolve it to the corresponding pursuit or
project and re-route accordingly.

Otherwise → resolve the argument:
1. Try as a pursuit ID (run `cadence pursuits --json`,
   match against `id` field; fuzzy/partial OK). If matched, run
   `cadence pursuit <id>` and present output verbatim.
2. Try as a project ID (run `cadence scan --json` and
   match against project IDs; fuzzy/partial OK). If matched, run
   `cadence project <id>` (use `--pursuit <id>` to
   disambiguate if multiple match) and present output verbatim.
3. If no match: "No pursuit or project matches '[arg]'. Try
   `/cadence:status pursuits` to see options."

When presenting any numbered list, remember the mapping in conversation
context so future `/status N` calls resolve correctly.

## Dashboard

When no argument is provided:

1. Run `cadence status`. The CLI produces the entire dashboard:
   - Leveraged Priority (extracted from latest reflection)
   - Last Reflect (date + status)
   - Last Activity (most recent commit/edit on a non-done project)
   - Pursuits / Projects / Actions counts
   - **Inbox line** — the canonical Inbox view (union of untriaged
     `thoughts/unprocessed/` captures + brainstorms in
     `phase: diverging`). Three threshold-aware shapes from
     `workflows/coaching-strings.md`:
       - empty: `Inbox: empty ✓`
       - within cap: `Inbox: <N> items ✓`
       - above cap: `Inbox: <N> items (<O> overdue, <A> aged, <F> fresh) — above soft cap (<threshold>). Run /cadence:start inbox to walk them.`
   - **Active brainstorms line** — when at least one brainstorm is
     `diverging` or `converging`. Omitted when none are active.
   - Pending validations (when `validations/pending.md` is non-empty)
   - Reconciler flags (includes `inbox_pressure` when the Inbox
     view exceeds `cadence.yaml` `inbox_soft_threshold`)
   - **Next:** up to 3 contextual next-step suggestions ranked by
     state (in-progress projects, unprocessed captures, flags,
     reflect cadence, on-hold pickup candidates, and a
     `/cadence:help` pointer in any spare slot)
   - **Idle-time prompt** — appended below `Next:` when activity
     is stale (>7 days). Wording is the canonical string from
     `workflows/coaching-strings.md`.

2. Present the CLI output verbatim. Do not paraphrase or annotate.
   The "Next:" block is computed deterministically by `nextSteps()`
   in the CLI — same heuristic in both the bare-CLI dashboard and
   the SessionStart hook output, so suggestions stay consistent.

## Empty-state branch

When the repo state is empty — zero pursuits AND Inbox empty AND
`validations/pending.md` empty — the SessionStart hook emits the
canonical empty-repo coaching block (from
`workflows/coaching-strings.md`) in place of the dashboard. The bare
CLI (`cadence status`) does NOT branch this way: an explicit `/status`
call on an empty repo still renders the dashboard so the user can
verify state. The branch is hook-only — the implicit ambient surface
gets the coaching, the explicit verb gets the data.

If a user runs `/status` on a freshly-initialized repo and asks "what
should I do?", quote the empty-repo block from `coaching-strings.md`
inline as the answer. Don't paraphrase — the consistent wording across
the SessionStart hook, empty-state answers, and the
`coaching-strings.md` doc is the teaching mechanism.

## SessionStart hook output

The SessionStart hook reuses `cadence status` via the `--hook-output`
flag. It adds two behaviors not present on the bare CLI:

- **Suppression** — `.cadence/last_session_block.json` (state hash +
  timestamp) suppresses the splash when state is unchanged AND less
  than 60 minutes have passed since the last emission. A
  `.cadence/dismissed_until <ISO>` file (written by
  `cadence dismiss-splash --hours <N>`) suppresses the splash for the
  named window regardless of state change.
- **Empty-state branch** — when `isEmptyRepo()` returns true, the
  hook emits the canonical coaching block instead of the dashboard.

The bare CLI bypasses both — the user explicitly asked for the
dashboard.

## Drill-down action menus

Every drill-down view (`cadence pursuits`, `cadence pursuit <id>`,
`cadence project <id>`) ends with an inline **Available actions**
block listing the verbs applicable to the viewed entity, with a
one-line hint each. The CLI renders these — present them verbatim
along with the rest of the drill output. Do not strip or rewrite.

The menus are status-aware: a `done` or `dropped` project shows a
narrower menu (narrate / back to dashboard) instead of the full
work surface (start / complete / cancel / etc.).

If the user wants to see the full verb surface across all groups,
`/cadence:help` renders the catalogue inline.

## Fallback

If the CLI is unavailable (missing binary, Node not installed), fall
back to manual scanning:
- Glob `pursuits/*/pursuit.md` for active pursuits
- Glob `pursuits/*/projects/*.md` for projects, parse status from
  frontmatter, count Action checkboxes
- For activity recency, fall back to fs.stat mtime on each project file
- Read `cadence.yaml` for thresholds
- Apply `workflows/reconciler.md` checks for flags

The CLI is preferred — it's deterministic and faster. Only fall back
when the bin is verifiably absent.
