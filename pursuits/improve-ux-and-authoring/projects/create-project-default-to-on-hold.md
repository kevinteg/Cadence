---
id: create-project-default-to-on-hold
pursuit: improve-ux-and-authoring
status: done
created: 2026-06-05
origin:
  kind: github_issue
  repo: kevinteg/Cadence
  number: 3
  url: https://github.com/kevinteg/Cadence/issues/3
---

# create-project should default to on_hold rather than active

Triaged from issue #3: https://github.com/kevinteg/Cadence/issues/3

## Intent

Filed observation (#3): when several projects get created in a session from external triggers, every one lands as `status: active` and the WIP-flag fires on definition rather than engagement. The user had to bulk-flip 8 projects to on_hold immediately after creating them. The cleaner mental model is 'active iff some progress has happened' — operationally, 1+ actions checked off.

Concrete change: flip `cadence create-project`'s `--status` default from `active` → `on_hold`. `--status active` stays available for explicit opt-in (crystallize-into-active, recovery-from-archive, etc.).

Larger move flagged but not requested in the issue: derive `active` from action-checkoff state instead of storing it as a top-level status. Four current values collapse to (derived) active vs (explicit) on_hold/done/dropped. Bigger change — decide during work whether to take the small win first or pursue the larger refactor.

Done means: new projects default to `on_hold`; the dashboard's 'first checked action promotes to active' behavior continues to work; tests cover the new default; the skill docs and the issue stay in sync with what shipped.

## Actions

- [x] Read the issue thread + decide whether to ship the small win (flip default) or pursue the larger derive-active-from-actions refactor.
