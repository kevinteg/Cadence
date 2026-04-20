# /mark

Write a session marker (save point). This is typically called at the end of
a work session, or when switching between pursuits/projects.

## Steps

1. Determine the current session context:
   - The active pursuit and project are set by the current Guide mode session.
     This is established by /select or when the user explicitly says what
     they're working on.
   - Use the active project — do NOT infer the project from conversation
     topics or background context mentioned during the session.
   - If no project has been explicitly selected this session, ask.

2. Generate a timestamp for the filename: `YYYY-MM-DDTHH-MM` using current time.

3. Review the session's conversation to extract content **scoped to the
   active project only**. Do not bleed context from other projects or
   background topics discussed during the session:
   - **Where I Was**: What was the user working on within this project?
     What state is the work in?
   - **What I Was Thinking**: What decisions were being considered about
     this project? What's the user's current mental model or hypothesis?
   - **What's Next**: Concrete next steps for this project, ordered by priority.
   - **Loose Threads**: Anything noticed but not acted on that relates to
     this project. Side observations. Things to flag for later.
   - **Actions completed**: Actions checked off on this project during the session.
   - **Actions in progress**: Actions on this project partially done.

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

7. Confirm: "Marker saved. You can pick up here next time with /select."
