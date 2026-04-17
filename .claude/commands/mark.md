# /mark

Write a session marker (save point). This is typically called at the end of
a work session, or when switching between pursuits/projects.

## Steps

1. Determine the current context:
   - Which pursuit and project was the user working on?
   - If unclear, ask.

2. Generate a timestamp for the filename: `YYYY-MM-DDTHH-MM` using current time.

3. Review the session's conversation to extract:
   - **Where I Was**: What was the user working on? What state is the work in?
   - **What I Was Thinking**: What decisions were being considered? What's
     the user's current mental model or hypothesis?
   - **What's Next**: Concrete next steps, ordered by priority.
   - **Loose Threads**: Anything noticed but not acted on. Side observations.
     Things to flag for later.
   - **Actions completed**: Any actions checked off during this session.
   - **Actions in progress**: Any actions partially done.

4. Draft the marker and show it to the user for confirmation:

   ```markdown
   ---
   pursuit: <pursuit-id>
   project: <project-id>
   session_start: <ISO-8601>
   session_end: <ISO-8601>
   actions_completed: []
   actions_in_progress: []
   ---

   # Marker: <Project or Pursuit Name>

   ## Where I Was
   [2-5 sentences]

   ## What I Was Thinking
   [Decisions, hypotheses, open questions]

   ## What's Next
   1. [Concrete next step]
   2. [Follow-up]

   ## Loose Threads
   - [Observations, side notes]
   ```

5. Write the marker to `pursuits/<pursuit-id>/sessions/<timestamp>.md`.

6. If any actions were completed, update the project file to check them off.

7. Confirm: "Marker saved. You can pick up here next time with /recap."
