---
id: status-navigation
pursuit: build-cadence-v1
status: done
created: 2026-04-21
---

# Status Navigation

## Definition of Done
- [x] `/status pursuits` lists all pursuits grouped by lifecycle (active, someday), hiding archived
- [x] `/status <pursuit>` lists projects in that pursuit, showing active and not-started, hiding done
- [x] `/status <project>` shows actions and DoD for that project (works in or out of session)
- [x] `/status` (no argument) remains the system dashboard with counts and flags
- [x] Arguments resolve via fuzzy match, partial match, and natural language
- [x] Numbered shortcuts work after any list output (e.g., `/status 1` drills into first item)
- [x] Display rules: active/not-started shown, done hidden (with count summary), on_hold shown dimmed

## Actions
- [x] Design output format for each drill-down level (pursuits, projects, actions)
- [x] Update status.md command to accept optional argument and route to appropriate level
- [x] Implement pursuit list view (grouped by lifecycle, project counts per pursuit)
- [x] Implement project list view (DoD progress, started vs not-started, done count hidden)
- [x] Implement action/DoD view for a single project
- [x] Add fuzzy/partial matching logic to argument resolution
- [x] Add numbered shortcut support (reference previous list output)
- [x] Test navigation flow: /status → /status pursuits → /status build-cadence-v1 → /status package-as-plugin

## Notes
Navigation pattern:
```
/status                    → dashboard with counts and flags
/status pursuits           → pursuit list with project summaries
/status <pursuit-id>       → project list for that pursuit
/status <project-id>       → actions and DoD for that project
```

Arguments are flexible — the agent resolves by matching against IDs,
partial slugs, or natural language. `/status build` matches
`build-cadence-v1`, `/status the plugin project` matches
`package-as-plugin`.

After any list output, numbered shortcuts let the user drill in without
typing IDs: `/status 1` selects the first item from the previous list.

> **v3 note:** /status remains as the system dashboard and drill-down
> navigator. The /do verb replaced /select for entering a project to
> work on. /status is read-only navigation; /do is the execution entry
> point.
