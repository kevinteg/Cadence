---
description: Record an external blocker — capture a waiting_for item with person, what, and expected date. TRIGGER ONLY when the user explicitly invokes /cadence:waiting or /waiting. SKIP all natural-language equivalents — never auto-fire from "I'm waiting on X", "blocked by Y", "Z owes me a reply", or status mentions of pending external items.
---

# /waiting

Track an external dependency. The reconciler flags items that go past
their expected date so blockers don't silently rot. Reference
`workflows/verb-contracts.md` for the waiting register.

## Usage

- `/waiting` — attach to the active session's project
- `/waiting <project>` — attach to a specific project

Arguments resolve via fuzzy match, partial match, or natural language.

## Steps

1. **Resolve the project:**
   - If in an active session with no argument: target the active project.
   - If an argument is given: resolve to a project by fuzzy match against
     `cadence scan --json` (filter to `status: active` or `on_hold`).
   - If no session and no argument: ask "Which project is this for?"
     and present a short list of active projects.
   - Refuse if the project is `done` or `dropped`:
     "[Project] is [status] — waiting items only attach to live projects."

2. **Gather the three fields conversationally** (one question at a time;
   if the user already supplied any in their initial message, skip that
   question):

   ```
   Who are you waiting on?
   ```
   ```
   What are you waiting for?
   ```
   ```
   When do you expect to hear back? (YYYY-MM-DD)
   ```

   Resolve relative dates ("Friday", "next week", "in 3 days") to absolute
   YYYY-MM-DD. If the user is vague ("soon"), pick a reasonable default
   (1 week out) and confirm: "I'll use [date] — adjust?"

3. **Write the waiting item via the CLI:**

   ```bash
   cadence add-waiting-for <project-id> \
     --pursuit <pursuit-id> \
     --person "<name>" --what "<description>" --expected <YYYY-MM-DD>
   ```

   The CLI appends a structured entry to the project's frontmatter
   `waiting_for` array with `flagged: false`. The reconciler will set
   `flagged: true` once the expected date passes by `waiting_for_grace_days`.

4. **Confirm tersely:**

   ```
   Waiting: [person] re: [what] (expected [date])
   [pursuit/project] — [N] open waiting items
   ```

   Get the count from `cadence project <id> --json`.

## Guardrails

- Three fields only — person, what, expected. No notes, no priority,
  no follow-up cadence. Keep the surface minimal.
- Do not re-ask if the user supplied a field in their opening message.
- Resolve relative dates yourself; don't make the user type ISO format.
- Don't surface this verb mid-flow — it's a breakpoint action. If the
  user invokes it during a `/start` session, write it, confirm, and
  return them to the session immediately.
