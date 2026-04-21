---
description: Show system dashboard or drill into pursuits, projects, and actions
---

# /status

Show a system-level overview, or drill down into pursuits, projects, and
actions. Accepts an optional argument to navigate the hierarchy.

## Usage

- `/status` — system dashboard with counts and flags
- `/status pursuits` — list all pursuits grouped by lifecycle
- `/status <pursuit>` — list projects in a pursuit
- `/status <project>` — show DoD and actions for a project
- `/status 1`, `/status 2` — numbered shortcut from the last list shown

Arguments resolve via fuzzy match, partial match, or natural language.
`/status build` matches `build-cadence-v1`. `/status the plugin project`
matches `package-as-plugin`.

## Argument Routing

If an argument is provided, resolve it and route:

### `/status pursuits`

List all pursuits grouped by lifecycle state. Hide archived.

```
Pursuits

Active:
1. [pursuit-id] — [N active] | [N on_hold] | [N done] projects

Someday:
2. [pursuit-id] — "[first line of description]"

[N archived hidden]
```

Number each entry for drill-down shortcuts.

### `/status <pursuit-id>`

List projects in the pursuit. Show active and on_hold. Hide done
(show count). Mark projects with no markers as `[not started]`.
Include a brief description for each project (from the `# Title` or
first sentence of Notes section).

```
[pursuit-id] — [N/M] projects done

Active:
1. [project-id]: [brief description] — [N/M DoD] [not started]
2. [project-id]: [brief description] — [N/M DoD]

On hold:
3. [project-id]: [brief description] — [N/M DoD]

[N done projects hidden]
```

Number each entry for drill-down shortcuts.

### `/status <project-id>`

Show full DoD checklist and Actions for the project. Works in or out
of a session.

```
[project-id] — [N/M DoD] [not started | active | on_hold | done]

Definition of Done:
- [ ] [item]
- [x] [item]

Actions:
- [ ] [action]
- [x] [action]

[If waiting_for items exist, show them]
```

### Numbered shortcuts

After presenting any numbered list, remember the mapping in conversation
context. If the user runs `/status 2`, resolve to the second item from
the most recent list.

---

## Dashboard (no argument)

When no argument is provided, show the system dashboard:

### Steps

1. Scan all active pursuits and count them.

2. For each active pursuit, count active projects, done projects,
   and on_hold projects.

3. Count total unchecked actions across all active projects.

4. Count all `waiting_for` items across all projects.

5. Count unprocessed thoughts.

6. Find the most recent reflection and check if it's complete.
   Extract the leveraged priority if set.

7. Determine session state:
   - If there is a current active session (established by a verb invocation
     in this conversation), show it as "[pursuit/project]"
   - If no active session, find the most recent marker across all pursuits.
     Calculate age. Check the status of the project referenced in that
     marker — if the project is done, show "done"; otherwise show "WIP".

8. **Run reconciler checks** (the reconciler workflow is included in the
   cadence plugin under workflows/reconciler.md — reference it for full
   detection logic):

   a. **Overdue waiting-for:** Scan all project frontmatter for `waiting_for`
      items. Flag if today > `expected` + `waiting_for_grace_days` from
      cadence.yaml.
   b. **Dormant projects:** For each active project with unchecked actions,
      find the most recent marker referencing it. Flag if no marker within
      14 days.
   c. **Stale markers:** For each active project, flag if most recent marker
      is older than `marker_stale_days` from cadence.yaml. Suppress if
      already flagged as dormant.
   d. **Structural issues:** Flag active projects with empty DoD, all DoD
      items checked but status not `done`, or open DoD but no unchecked
      actions.

   e. **WIP limits:** Check `wip_limits` in cadence.yaml. Count in-progress
      projects (active projects with at least one marker — unstarted projects
      are backlog, not WIP). Flag if in-progress projects > `max_active_projects`.

   Note: Someday cue surfacing is /reflect-only, not shown in /status.

9. Present a dashboard:

   ```
   Cadence Status

   Leveraged Priority: [priority or "not set"]
   Last Reflect: [date] ([complete/incomplete])
   [pursuit/project] or Last Session: [relative time] on [pursuit/project] ([done|WIP])

   Pursuits: [N active] | [N someday]
   Projects: [N active] | [N on_hold] | [N done]
   Actions:  [N pending] | [N waiting]
   Thoughts: [N unprocessed]

   Flags:
   - [reconciler flags, one per line]

   [If no flags]: No flags. System is healthy.
   ```
