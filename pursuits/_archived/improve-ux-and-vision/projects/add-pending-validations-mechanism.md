---
id: add-pending-validations-mechanism
pursuit: improve-ux-and-vision
status: done
created: 2026-05-01
---

# Add Pending Validations Mechanism

User-story validation actions inside projects create a structural failure mode: projects pile up at N-1 of N actions because the last action explicitly requires a fresh Claude session, leaving the upward-completion ritual blocked indefinitely. The encode-conversational-patterns project is the live example. The fix is a one-time sticky validations queue surfaced by the SessionStart hook.

## Intent

Replace the in-project user-story-validation action pattern with a sticky queue surfaced by the SessionStart hook. Projects ship without a dangling validation action; when a behavior needs fresh-session verification, a one-line entry is appended to validations/pending.md. The SessionStart hook reads the file and, if non-empty, surfaces 'New behaviors to validate in this fresh session' inline with the existing Next: block. The sticky persists across every session start until the user clears the entry. Once cleared, the hook stays silent. Projects complete cleanly when functional work is done; validation lives in its own surface and is no longer a per-project checkbox. This project also encodes the broader principle that drove choosing the hook over a /validate verb: Cadence verbs are domain-neutral. Most users work on non-dev repos (household projects, creative practice, fitness, family logistics), and dev-flavored verbs ('test', 'validate') would shrink the audience. The product-vision framing — pursuits hold 'be a present father' alongside 'stand up CI' — depends on every verb staying domain-agnostic. The reflect user journey YAML is updated to cover the new interactive Phase 2 shape so it serves as the durable acceptance test (replacing the manual fresh-session validation pattern for this project class). Done when: validations/pending.md exists with CLI subcommands to add/list/clear; SessionStart hook surfaces non-empty queue entries; CLAUDE.md project-creation guidance replaces the user-story-validation-action pattern with the queue-append pattern; cadence-runtime.md encodes the domain-neutrality principle; the reflect user journey YAML covers the new interactive Phase 2 shape; the dangling encode-conversational-patterns validation is migrated into the queue and that project is completed; this project itself ships WITHOUT a user-story-validation action, demonstrating the new pattern by example.

## Actions

- [x] Encode the 'domain neutrality' principle in cadence-runtime.md — Cadence verbs and vocabulary stay domain-agnostic because most users work on non-dev repos. New verbs and examples must serve household projects, creative practice, fitness, and family logistics as well as code. Avoid dev-flavored vocabulary ('test', 'deploy', 'merge'); favor universal language ('validate', 'ship', 'finish').
- [x] Design and implement the validations/pending.md storage format and CLI subcommands. Single markdown file with one entry per line (timestamp + description). Add cadence pending-validation add --description '...', cadence pending-validation list, cadence pending-validation clear --match '...'. CLI accepts --json. Use domain-neutral subcommand naming.
- [x] Extend the SessionStart hook output (cadence status --hook-output) to read validations/pending.md and, when non-empty, surface entries inline as a 'New behaviors to validate in this fresh session' block above the existing Next: block. Block stays silent when the file is empty.
- [x] Update CLAUDE.md 'Feature Work Goes Through Cadence' section: replace the user-story-validation-action guidance with the queue-append pattern. New guidance: when a project ships a behavior worth fresh-session verification, run cadence pending-validation add as part of the project work, not as a dangling action.
- [x] Update or write the reflect user journey YAML so it covers the new interactive Phase 2 shape (open 'what worked' question, follow-up cycle, agent observations only after the user has answered, LP question verbatim, ELI5 close). The journey YAML serves as the durable acceptance test, replacing manual fresh-session validation for this project class.
- [x] Migrate the dangling encode-conversational-patterns user-story validation action into the new validations queue (one entry: 'verify /reflect Phase 2 runs interactively, ELI5 recaps appear before destructive actions, no target dates proposed by default'); then complete encode-conversational-patterns via dialogue against its Intent.
