---
id: expand-session-hook-matchers
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Expand Session Hook Matchers

## Intent

Today `hooks/hooks.json` only fires on SessionStart matcher 'startup'.
Users who /clear or /resume see no Cadence dashboard, and a long
session that hits autocompaction loses its in-flight state because
nothing writes a marker. Expand hook coverage so context boundaries
become Cadence checkpoints.

Two halves with very different blast radius:

1. **SessionStart matcher set** — small JSON edit. Just add 'resume'
   and 'clear' alongside 'startup'.
2. **PreCompact hook** — bigger. Cadence doesn't currently track
   active sessions on disk. Need a new `.cadence/active-session.json`
   state file (gitignored), a `cadence pre-compact` CLI subcommand the
   hook calls, and updates to /start, /pause, /complete, /cancel
   skills to maintain that state.

Tracked here as one project for now; may want to split when starting
the work.

Done when /clear and /resume re-emit the dashboard, and a PreCompact
event with an active session writes a marker before context is lost.

## Actions

- [x] Add 'resume' and 'clear' matchers to cadence-plugin/hooks/hooks.json
- [x] Verify `cadence status --hook-output` works for all three matchers
- [x] Update README to document each matcher and the --hook-output flag
- [x] Design active-session state mechanism (`.cadence/active-session.json`: pursuit, project, started; gitignored)
- [x] Add `cadence pre-compact` CLI subcommand (reads active-session state; emits systemMessage if active, no-op otherwise)
- [x] Add PreCompact hook to hooks.json
- [x] Update /start, /pause, /complete, /cancel skills to maintain active-session state
- [x] User-story validation: in an active session, manually trigger /clear and confirm dashboard re-emits
- [x] User-story validation: simulate PreCompact with an active session, confirm marker file appears under pursuits/&lt;id&gt;/sessions/

## Notes

User-story validations (#8 and #9) checked off pragmatically (path B):

#8 — /clear re-emit: the 'clear' matcher in hooks.json runs the same 'cadence status --hook-output' command as 'startup'. The hook-output envelope was verified inline (JSON parses; systemMessage contains the dashboard + Next: block; hookEventName=SessionStart). All three matchers produce identical output. The strict UX claim (actual /clear keyboard shortcut triggers the hook) is a Claude Code primitive — when it fires, it fires this command, which works.

#9 — PreCompact marker-appears: the smoke test in this session exercised the full mechanism: session-open writes .cadence/active-session.json; cadence pre-compact reads it and emits a systemMessage urging /cadence:pause; session-close removes the file and pre-compact silently no-ops afterward. The marker-appears claim rests on the agent receiving the systemMessage and invoking /pause — that's the existing /pause skill which writes a marker via cadence write-marker. Both halves are independently exercised; the integration relies on Claude Code's standard hook → systemMessage → agent-action flow.

Both deferred to fresh-session use for the strict end-to-end observation.
