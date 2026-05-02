# Pending Validations

Behaviors that need fresh-session verification. The SessionStart hook
surfaces these on every fresh session until cleared. Add via
`cadence pending-validation add --description "..."`; clear via
`cadence pending-validation clear --match "..."` after running the
verification in a fresh session.

- 2026-05-02T02:45:37.160Z — encode-conversational-patterns: in a fresh Claude conversation in this repo, run /cadence:reflect through Phase 2 and confirm (a) the agent asks open questions and waits for answers, (b) the agent surfaces an ELI5 recap before any irreversible action, and (c) the agent does not propose target dates when creating pursuits or projects
