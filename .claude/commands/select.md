# /select

Pick a project to work on. This starts a new session and activates Guide mode.

## Usage

The user may say:
- "/select" — show active projects and let them choose
- "/select implement-agent-skills" — select a specific project by ID
- "I want to work on the indexer" — natural language, resolve to a project

## Steps

1. If no project specified, list all active projects across all active
   pursuits (exclude done, dropped, and on_hold projects). Present them
   grouped by pursuit:

   ```
   What would you like to work on?

   **[Pursuit Name]**
   - [project-id]: [project name] — [N/M DoD items done]
   - [project-id]: [project name] — [N/M DoD items done]

   [Repeat for other active pursuits]
   ```

2. If a project is specified (by ID or natural language), resolve it to
   an active project file. If the project status is `done` or `dropped`,
   say: "[Project] is already [status]. Want to create a new project
   for follow-up work?"

3. **Close any existing session** before starting a new one:
   - If there is an active session on a different project, write a marker
     for it (follow the /mark workflow) before switching.
   - If the active session's project was just completed (status: done),
     no marker is needed — completion closed the session.

4. Once a project is selected, start a new session:
   a. Set the active pursuit and project for this session.
   b. Read the most recent marker for this project in
      `pursuits/<pursuit-id>/sessions/`. Filter markers by the `project`
      field in frontmatter — markers for other projects are ignored.
   c. If a marker exists, present a "previously on..." recap:
      ```
      Starting session on **[Project Name]**.

      Previously: [2-3 sentences from marker's "Where I Was"]
      You were thinking: [1-2 sentences from "What I Was Thinking"]
      Next up: [first item from "What's Next"]
      ```
   d. If no marker exists, present the project's current state:
      ```
      Starting session on **[Project Name]** (new session).

      DoD: [N/M items complete]
      First action: [first unchecked action]
      ```

5. Shift to Guide mode for the selected project. This establishes the
   active session context for all subsequent commands (/mark, /recap,
   action tracking) until the session ends.
