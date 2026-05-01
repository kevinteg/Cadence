---
id: define-checkpoint-and-restore
pursuit: build-cadence-v1
status: dropped
created: 2026-04-30
dropped_reason: Pivoted scope — superseded by remove-session-concept (Session adds ceremony without signal; project files already cover the rich state)
dropped_at: 2026-04-30T19:00:37
---

# Define Checkpoint and Restore

## Intent

Cadence today carries a 'Session' concept that doesn't quite earn its keep: the only durable artifact is a Marker (where/next/open), and the word collides with Claude Code's own session model — every 'active session' string inside a Claude conversation is ambiguous. Worse, Markers don't capture the rich in-flight context that actually escapes the system today: distilled investigation results, decisions made but not yet acted on, files edited but uncommitted, the working understanding the agent has built up. Today that context lives only in the Claude transcript, which is conversation-anchored, ephemeral after compact, and machine-local. This project audits whether 'Session' should disappear as a concept (verbs operate on projects directly), renames Marker → Checkpoint with a richer schema covering what Cadence currently misses, and introduces a /restore verb plus a SessionStart prompt that unobtrusively offers to restore from a recent checkpoint when a fresh Claude conversation opens. Critically, the project must defend its own existence against the obvious counter — 'isn't claude --resume already doing this?' — and if the answer turns out to be yes, the project completes by deleting the Session vocabulary instead of redesigning it. Done when: the audit and the Claude-session-resume comparison are in Notes, the schema and verb pair are designed, the rename ships across CLI/skills/runtime/reference/hooks, journeys are updated, and a fresh Claude conversation correctly surfaces a restore prompt when a recent checkpoint exists.

## Actions

- [ ] Audit every use of 'session' across CLI output, skills, runtime, reference, hooks, and active-session.json — categorize each as: rename to checkpoint, rename to a verb action, or delete entirely; capture in project Notes
- [ ] Defend the concept: write a one-page comparison in project Notes between a Cadence Checkpoint and Claude Code's claude --resume — concrete scenarios where each wins; if the case fails, pivot the project to 'remove Session vocabulary, lean on Claude sessions' and rescope
- [ ] Design the enhanced Checkpoint schema beyond where/next/open — at minimum: working_context (distilled investigation), open_threads (loose ends not action-worthy), files_in_flight (edited but uncommitted), and optional conversation_summary; tradeoff doc in Notes
- [ ] Implement the rename Marker → Checkpoint across CLI subcommands (write-marker → write-checkpoint, markers → checkpoints, etc.), file paths (sessions/ → checkpoints/), frontmatter, and all skill/runtime/reference references
- [ ] Add /checkpoint verb (replaces /pause) and /restore <project> verb; update verb-contracts.md; ensure /start with-arg prompts to restore when a fresh checkpoint exists
- [ ] Enhance the SessionStart hook so a fresh Claude conversation unobtrusively surfaces 'Restore <project> from <when>?' when the most recent checkpoint is below a freshness threshold; user confirms or starts fresh — never auto-hydrates
- [ ] Update all 7 user-journey YAMLs that reference markers, sessions, or /pause
- [ ] User-story validation: in a fresh Claude Code session in this repo, confirm the SessionStart hook offers restore for a recent checkpoint; accept the prompt and confirm the conversation hydrates to where/next/open + working_context
