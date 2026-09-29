---
id: threads-and-needs-you-view
pursuit: scale-to-orchestrated-work
status: active
created: 2026-09-29
---

# Threads and the Needs-you view

## Intent

Open loops that need the human are today scattered across waiting_for arrays, project Notes, the Inbox, and pending validations. This project introduces Threads as a first-class project primitive (kinds: decide, review, unblock, waiting; fields per docs/orchestrated-work-design.md section 8) with waiting_for mapped in at scan time so no file migrates, plus a needsYou(snapshot) view beside inboxItems() that unions open threads across projects in active pursuits. Surfaces quote one canonical line from coaching-strings.md. Felt-sense of done: after a run opens two decide threads, the next fresh session's splash leads with Needs you: N, /threads walks and closes them, the answer is recorded on the thread, and thread_stale and needs_you_pressure flags fire when they should. Design: section 3 (Thread), section 5, build step 1.

## Actions

- [x] Schema: ThreadSchema and threads: on ProjectFrontmatterSchema; scanner maps legacy waiting_for entries to kind: waiting threads (src/types.ts, src/scan/projects.ts) with tests
- [x] View: needsYou(snapshot) in src/needs-you.ts, one canonical line in coaching-strings.md, rendered on the status dashboard Heads up block and the SessionStart splash
- [x] CLI: thread-open, thread-close, threads subcommands; thread-close records closed_with; add-waiting-for keeps working as the waiting-kind writer
- [x] Reconciler: thread_stale replaces overdue_waiting_for for the waiting kind and generalizes to all kinds; needs_you_pressure above needs_you_soft_threshold (config default 6); describeFlag + summarizeFlags + reconciler.md
- [x] Curation: an open decide thread ranks first in curateNextMoves(); tests
- [x] Skill: /threads SKILL.md and verb contract; /waiting becomes the waiting-kind alias with its UX unchanged; runtime vocabulary entry; bundle
- [x] Queue a pending validation for the fresh-session splash + /threads walk
