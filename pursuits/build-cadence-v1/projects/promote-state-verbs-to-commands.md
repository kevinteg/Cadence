---
id: promote-state-verbs-to-commands
pursuit: build-cadence-v1
status: on_hold
created: 2026-04-27
---

# Promote State Verbs To Commands

Skills are model-mediated — Claude decides whether and how to invoke them. Slash commands (commands/*.md) are deterministic templates. For verbs whose job is to write a single, predictable file (pause, complete, cancel, waiting, capture), a command template is safer and more predictable than a skill description. Conversational verbs (brainstorm, develop, reflect, start, narrate) stay as skills because they need model judgment.

## Definition of Done

- [ ] commands/ directory created at plugin root with template files for: pause, complete, cancel, waiting, capture
- [ ] Each command template handles the predictable single-write happy path deterministically (delegating to cadence CLI write subcommands)
- [ ] The command templates compose with the skill versions if present — no duplicate behavior, command takes precedence when invoked explicitly
- [ ] Skills retained for conversational verbs: brainstorm, develop, reflect, start, narrate, status, reconcile, promote, close
- [ ] README updated with a section explaining commands vs skills and which verbs live where
- [ ] User-story validation: invoke /cadence:pause from a session and confirm a marker is written without conversational back-and-forth
- [ ] User-story validation: invoke /cadence:brainstorm and confirm conversational facilitation still happens via the skill (not collapsed into a command)

## Actions

- [ ] Read Claude Code commands/ directory conventions to confirm command file format and slash-namespace behavior
