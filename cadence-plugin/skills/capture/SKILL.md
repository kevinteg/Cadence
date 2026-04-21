---
description: Flow-safe capture — save a thought to thoughts/unprocessed/ with no agent response
---

# /capture

Flow-safe capture to `thoughts/unprocessed/`. Reference
`workflows/verb-contracts.md` for the capture register.

**Register:** Silent. No response. No acknowledgment. No elaboration request.

## Usage

- `/capture "remembered to book the campsite"` — single input, no response
- `/capture` with text on same line — same behavior

## Steps

1. Accept the user's input. Do NOT respond, acknowledge, or ask for
   more detail. This is essential for flow safety.

2. Generate a timestamp for the filename: `YYYY-MM-DDTHH-MM`.

3. Determine the verb context from the current session:
   - During a brainstorm session → type: `seed`
   - During a develop session → type: `concern`
   - During a do session → type: `note`
   - No active session → type: `note`

4. Create a capture file in `thoughts/unprocessed/<timestamp>.md`:

   ```markdown
   ---
   captured: <ISO-8601>
   verb_context: <seed|concern|note>
   ---

   [Raw input from the user, exactly as typed]
   ```

5. **Do not respond.** The capture is saved silently. The user returns
   to whatever they were doing. Triage happens at the next breakpoint
   or during /reflect.

## Guardrails

- **No response after capture.** None. Not even "got it." The whole
  point is zero interruption.
- **No triage at capture time.** Triage is a separate, explicit step
  during /reflect or at breakpoints.
- **No prompt for more detail.** Accept whatever the user gives.
- **Never silently promote a capture to an Action or Idea.** Triage
  happens explicitly with user confirmation.
