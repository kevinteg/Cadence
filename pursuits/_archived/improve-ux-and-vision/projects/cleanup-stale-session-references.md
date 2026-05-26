---
id: cleanup-stale-session-references
pursuit: improve-ux-and-vision
status: done
created: 2026-05-04
---

# Cleanup Stale Session References

Sessions/Markers were structurally removed in build-cadence-v1's remove-session-concept project, but documentation drift remains. The plugin README still lists /cadence:pause as a current verb (most-misleading — first thing a new plugin user reads); cadence-reference.md references hasMarker as a project condition; the root workflows/ directory has vestigial pre-v3 copies; the Inbox pursuit has leftover legacy session data; journeys/core-session-loop.yaml has a historical name. This project clears all of it so a new reader doesn't get confused by docs that contradict the runtime.

## Intent

Eliminate the lingering Session/Marker references that survived build-cadence-v1's remove-session-concept project. The feature is gone (no /pause skill, no session-open/close/write-marker CLI subcommands, no PreCompact hook, runtime hard-guardrail forbids session ceremony) — but stale docs and leftover fixtures still mention it, with the plugin README being the most-misleading offender. Done feels like: a new reader of the plugin README sees the current 12-verb surface, no /pause, no PreCompact references; the WIP check in cadence-reference.md is correct under the post-Session model; the root workflows/ vestigial copies are gone (canonical lives under cadence-plugin/workflows/); the Inbox pursuit has no leftover Sessions data confusing its display; the journey YAML's filename matches its post-Session content; and a grep for Session|Marker in the live tree returns only intentional references (CHANGELOG history, Claude Code's SessionStart hook, the runtime guardrail, the validations queue's 'fresh-session' wording).

## Actions

- [x] Rewrite cadence-plugin/README.md Verb Catalogue to match the slim 12-verb surface from P2 (no /pause, no /cancel, no /close, no /reconcile in user-facing tables; develop+promote noted as internal-chain; reconciler noted as system behavior). Remove the PreCompact hook reference (hook is gone). Update the install/usage examples to use current verbs.
- [x] Fix cadence-plugin/cadence-reference.md line 230 — the 'WIP check before creating' instructions reference 'status: active AND hasMarker: true' as the in-progress condition. Markers don't exist; the post-Session in-progress condition is 'status: active AND has at least one unchecked action.' Update the instruction.
- [x] Delete the root-level workflows/ directory (3 files: reflect.md, reconciler.md, verb-contracts.md). All canonical workflow docs live under cadence-plugin/workflows/. Verify no active in-repo references point at the root workflows/ paths before deletion (only archived/historical content should reference them).
- [x] Delete the leftover legacy artifacts from the Inbox pursuit: pursuits/inbox/sessions/2026-04-30T18-18.md (legacy marker file from before remove-session-concept) and pursuits/inbox/projects/session-test.md (legacy test fixture from the Sessions era). Git history preserves them.
- [x] Rename journeys/core-session-loop.yaml → journeys/core-lifecycle-loop.yaml. The journey content is correct (it tests the post-Session lifecycle); only the filename is stale.
- [x] Clean up the stale 'Marker:' comment in src/find.ts:9 — replace with current vocabulary.
