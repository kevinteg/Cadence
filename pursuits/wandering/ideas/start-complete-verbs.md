---
id: start-complete-verbs
parent: wandering
state: promoted
promoted_to: project:implement-lifecycle-verbs
created: 2026-04-21
developed_at: 2026-04-21
---

Replace "do" with explicit lifecycle verbs: **start**, **pause**, **cancel**, **complete**.

- **start** — opens a session on a project. Flow protection, recap from most recent marker.
- **pause** — saves a marker (where/next/open). Session can be resumed with start.
- **cancel** — drops a project with a reason. Not completion — it didn't succeed.
- **complete** — operates on **actions**, not projects. Marks an action done, optionally with a note for narrative.

Completion flows upward:
- When all DoD/actions for a project are checked, the system prompts: "Everything's checked off. Complete this project, or add more items?" No third option.
- When all projects in a pursuit are done/dropped, same prompt for the pursuit.
- An active project with no open items is inconsistent state — must be resolved immediately.
- Physical tasks are actions that can be completed immediately with an optional note.

This replaces "do", "wrap up", and auto-mark-on-exit. The user declares intent explicitly through verb choice.

## PPCo Notes

**Praise:** Solves the overloading problem of "do" being both entry and mode. Physical tasks become first-class as actions. Completion flowing upward keeps the hierarchy consistent.

**Potentials:** Tool-assisted tasks get a natural wrapper (start → skill runs → pause/complete action). Narrative gets richer across task types. No ambiguity about session or entity state.

**Concern addressed:** Friction — resolved by keeping start as the only entry verb. Exit is pause (continuing) or complete (action done). Natural, explicit, no guessing.
