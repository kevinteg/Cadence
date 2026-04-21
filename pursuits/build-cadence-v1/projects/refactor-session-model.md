---
id: refactor-session-model
pursuit: build-cadence-v1
status: done
created: 2026-04-17
---

# Refactor Session Model

## Definition of Done
- [x] /select command created — picks a project, starts session, auto-recaps from marker
- [x] /recap redefined as within-session command showing current state
- [x] /mark references /select for session context
- [x] CLAUDE.md updated with per-project session model
- [x] /select tested — select a project and verify auto-recap from marker
- [x] /recap tested — run mid-session and verify it shows current state
- [x] /select tested — verify done projects cannot be selected
- [x] /mark tested — verify it closes session correctly under new model

## Actions
- [x] Create /select command prompt
- [x] Rewrite /recap as within-session state preview
- [x] Update /mark to reference /select
- [x] Update CLAUDE.md Session Context and Session Lifecycle sections
- [x] Test /select against real data
- [x] Test /recap within an active session
- [x] Test /select rejection of done projects
- [x] Test /mark under new model

## Notes
Emerged from feedback during implement-agent-skills testing. The original
model had /recap doing double duty as both system entry point and session
orientation. The new model separates concerns: /select starts sessions,
/recap shows current state within a session, /status shows system health.

> **v3 note:** The session model was further refactored in v3 to be
> internal-only. Users no longer interact with "sessions" directly.
> /select became /do, which auto-resumes from the latest marker. /recap
> was absorbed into the /do auto-resume flow. Sessions exist as an
> implementation detail (markers still track session state) but the
> concept is not exposed in the user-facing vocabulary.
