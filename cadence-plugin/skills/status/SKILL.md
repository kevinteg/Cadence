---
description: Show system dashboard or drill into pursuits, projects, and actions
---

# /status

Show a system-level overview, or drill down into pursuits, projects, and
actions. Accepts an optional argument to navigate the hierarchy.

The bundled CLI does the scanning. Skill responsibility is fuzzy
argument resolution and number-shortcut tracking.

## Usage

- `/status` — system dashboard with counts and flags
- `/status pursuits` — list all pursuits grouped by lifecycle
- `/status <pursuit>` — list projects in a pursuit
- `/status <project>` — show DoD and actions for a project
- `/status 1`, `/status 2` — numbered shortcut from the last list shown

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

1. Run `cadence status`. The CLI produces the entire
   dashboard:
   - Leveraged Priority (extracted from latest reflection)
   - Last Reflect (date + status)
   - Last Session (relative time on pursuit/project, done|WIP)
   - Pursuits / Projects / Actions / Thoughts counts
   - Reconciler flags

2. Present the CLI output verbatim. Do not paraphrase or annotate.

3. If the CLI output indicates an active session in this conversation
   that supersedes the "Last Session" line (the user invoked `/start`
   on a different project earlier in the conversation), replace the
   Last Session line with `Active session: <pursuit/project>`. This is
   the only field the agent overrides — everything else is CLI-authored.

## Fallback

If the CLI is unavailable (missing binary, Node not installed), fall
back to manual scanning:
- Glob `pursuits/*/pursuit.md` for active pursuits
- Glob `pursuits/*/projects/*.md` for projects, parse status from
  frontmatter, count DoD/Actions checkboxes
- Glob `pursuits/**/sessions/*.md` for the most recent marker
- Read `cadence.yaml` for thresholds
- Apply `workflows/reconciler.md` checks for flags

The CLI is preferred — it's deterministic and faster. Only fall back
when the bin is verifiably absent.
