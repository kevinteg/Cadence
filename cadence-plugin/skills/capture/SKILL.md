---
description: Flow-safe capture — save a thought to thoughts/unprocessed/ with no agent response. TRIGGER ONLY when the user explicitly invokes /cadence:capture or /capture. SKIP all natural-language equivalents — never auto-fire from "remember this", "note that", "save this thought", "don't let me forget", or any stray-thought dump mid-conversation.
---

# /capture

Flow-safe capture to `thoughts/unprocessed/`. Reference
`workflows/verb-contracts.md` for the capture register.

## Usage

- `/capture "remembered to book the campsite"` — single input, no response
- `/capture` with text on same line — same behavior

## Steps

1. Accept the user's input. Do NOT respond, acknowledge, or ask for
   more detail. This is essential for flow safety.

2. Determine the verb context from the conversation:
   - Mid /brainstorm → `seed`
   - Mid /develop → `concern`
   - Otherwise → `note`

3. Write the capture via the bundled CLI:

   ```bash
   cadence write-capture --body "<raw input>" --verb-context <ctx>
   ```

   The CLI
   handles timestamp generation, file path, and frontmatter formatting.

4. **Do not respond.** The capture is saved silently. The user returns
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
