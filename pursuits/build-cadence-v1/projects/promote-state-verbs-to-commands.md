---
id: promote-state-verbs-to-commands
pursuit: build-cadence-v1
status: dropped
created: 2026-04-27
dropped_reason: Original premise (skills can fire unpredictably; need deterministic command templates) was substantially solved by other shipped work — TRIGGER/SKIP discipline (enforce-explicit-verb-skill-triggers) prevents auto-firing from natural language; Tier-1 bundling (reduce-cli-round-trips) collapsed the multi-call patterns; active-session state added a new bundled write that breaks the 'single predictable write' framing. Walked each candidate (/pause, /complete, /cancel, /waiting, /capture) — only /capture genuinely fits the command-template shape, and converting it is low-leverage. Right call to drop and let the existing skills surface stand.
dropped_at: 2026-04-30T12:45:25
---

# Promote State Verbs To Commands

## Intent

Skills are model-mediated — Claude decides whether and how to invoke
them. Slash commands (`commands/*.md`) are deterministic templates.
For verbs whose job is a single predictable write (pause, complete,
cancel, waiting, capture), a command template is safer and more
predictable than a skill description.

Conversational verbs (brainstorm, develop, reflect, start, narrate)
stay as skills because they need model judgment.

Done when the five state-modifying verbs have command templates that
compose cleanly with their skill counterparts (command takes
precedence when explicitly invoked) and `/cadence:pause` writes a
marker with minimal turns end-to-end.

## Actions

- [ ] Read Claude Code commands/ directory conventions to confirm format and slash-namespace behavior
- [ ] Create cadence-plugin/commands/ directory
- [ ] Write command template for /cadence:pause (delegates to `cadence write-marker`)
- [ ] Write command template for /cadence:complete (delegates to `cadence check` + `set-status`)
- [ ] Write command template for /cadence:cancel (delegates to `cadence set-status --status dropped`)
- [ ] Write command template for /cadence:waiting (delegates to `cadence add-waiting-for`)
- [ ] Write command template for /cadence:capture (delegates to `cadence write-capture`)
- [ ] Verify each command takes precedence over its skill when explicitly invoked
- [ ] Update README with a "commands vs skills" section
- [ ] User-story validation: `/cadence:pause` writes marker without conversational back-and-forth
- [ ] User-story validation: `/cadence:brainstorm` still uses the skill (not collapsed into a command)
