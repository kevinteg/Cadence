# /recap

Show the current session state. This is a within-session command that
previews what the marker would capture if saved right now.

Requires an active session (set by /select). If no session is active,
suggest running /select first.

## Steps

1. Confirm there is an active session (a project selected via /select).
   If not, say: "No active session. Run /select to pick a project."

2. Review the current session's conversation and extract:
   - **Where I Am**: What is the user currently working on? What state
     is the work in?
   - **What I'm Thinking**: Current decisions, hypotheses, open questions.
   - **What's Next**: Remaining steps, ordered by priority.
   - **Loose Threads**: Things noticed but not acted on.

3. Read the active project file to get current DoD and action status.

4. Present the session state:

   ```
   Session: **[Project Name]**

   **Where I Am**
   [2-3 sentences of current state]

   **What I'm Thinking**
   [Current decisions and open questions]

   **What's Next**
   1. [Next step]
   2. [Follow-up]

   DoD: [N/M items complete]
   Actions: [N completed this session] | [M remaining]
   ```

5. Stay in Guide mode. This is informational — it does not change
   session context or write anything to disk.
