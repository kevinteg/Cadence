---
description: Pause the current session — save a marker with where/next/open
---

# /pause

Save a marker and suspend the current session. The session can be
resumed later with `/start`.

## Usage

- `/pause` — pause the active session

## Steps

1. **Verify active session.** If no session is active in this conversation:
   "No active session. Use /start to begin one."

2. **Determine session context:**
   - The active pursuit and project are set by the current session.
   - Use the active project — do NOT infer the project from conversation
     topics or background context.
   - **If the active project is done** (status: done, all DoD checked):
     do not write a marker. Instead, follow the "Completing a Project"
     workflow in the Cadence runtime.

3. **Generate timestamp** for the filename: `YYYY-MM-DDTHH-MM` using
   current time.

4. **Extract marker content** scoped to the active project only:
   - **Where**: What state is the work in? What was accomplished?
   - **Next**: The first concrete thing to do when returning. Specific
     enough to start immediately.
   - **Open**: Unresolved questions, parked concerns, loose threads.
   - **Actions completed**: Actions checked off during the session.

5. **Write the marker directly** (no confirmation draft):

   ```markdown
   ---
   pursuit: <pursuit-id>
   project: <project-id>
   session_start: <ISO-8601>
   session_end: <ISO-8601>
   actions_completed: []
   ---

   # Marker: <Project Name>

   ## Where
   [2-5 sentences on current state]

   ## Next
   [The first thing to do on return — specific and actionable]

   ## Open
   [Unresolved questions, parked concerns, loose threads]
   ```

6. Write to `pursuits/<pursuit-id>/sessions/<timestamp>.md`.

7. If any actions were completed, update the project file to check them off.

8. Confirm with pursuit-level context:
   ```
   Paused. [pursuit] — [N/M] projects done
   ```

## Guardrails

- No confirmation prompt. Write the marker directly.
- One marker per session. If a mid-session `/pause` was already written,
  update the same file rather than creating a second.
- Do not bleed context from other projects or background topics into
  the marker.
