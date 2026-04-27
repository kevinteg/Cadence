---
id: expand-session-hook-matchers
pursuit: build-cadence-v1
status: on_hold
created: 2026-04-27
---

# Expand Session Hook Matchers

Today hooks/hooks.json only fires on SessionStart matcher 'startup'. Users who /clear or /resume see no Cadence dashboard, and a long session that hits autocompaction loses its in-flight state because nothing writes a marker. Expand hook coverage so context boundaries become Cadence checkpoints.

## Definition of Done

- [ ] SessionStart hook fires on startup, resume, and clear matchers — all three present a fresh dashboard
- [ ] PreCompact hook added that writes a marker for the active session before compaction begins, preserving where/next/open across the context boundary
- [ ] PreCompact hook is a no-op when no active session is detected (don't spam markers for idle conversations)
- [ ] Hook documentation added to README explaining each matcher's behavior and the --hook-output flag
- [ ] User-story validation: in an active session, manually trigger /clear and confirm the hook re-emits the dashboard
- [ ] User-story validation: simulate a PreCompact event (manually invoke the hook command with an active session present) and confirm a marker file appears under pursuits/<id>/sessions/

## Actions

- [ ] Add resume and clear matchers to hooks/hooks.json and confirm cadence status --hook-output is the right command for all three
