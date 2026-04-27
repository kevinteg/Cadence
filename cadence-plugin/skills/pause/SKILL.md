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

3. **Extract marker content** scoped to the active project only:
   - **Where**: What state is the work in? What was accomplished?
   - **Next**: The first concrete thing to do when returning. Specific
     enough to start immediately.
   - **Open**: Unresolved questions, parked concerns, loose threads.
   - **Actions completed**: Actions checked off during the session.

4. **Write the marker via the bundled CLI:**

   ```bash
   node "$CADENCE_BIN" write-marker \
     --pursuit <pursuit-id> --project <project-id> \
     --where "<2-5 sentences on current state>" \
     --next "<first thing to do on return>" \
     --open "<unresolved questions / loose threads>" \
     --action-completed "<text>" \  # repeatable
     --action-completed "<text>"
   ```

   `$CADENCE_BIN` defaults to `./cadence-plugin/bin/cadence.js`. The CLI
   handles timestamp generation, filename, and frontmatter formatting.
   Session start/end default to 30 minutes ago and now.

5. If any actions were completed during the session and aren't yet
   checked in the project file, run `cadence check <project-id>
   --section action --match "<text>"` for each. The marker's
   `actions_completed` list is provenance; the project file's checkboxes
   are the source of truth for completion.

6. Confirm with pursuit-level context:
   ```
   Paused. [pursuit] — [N/M] projects done
   ```
   Use `node "$CADENCE_BIN" pursuit <id> --json` to read counts.

## Guardrails

- No confirmation prompt. Write the marker directly.
- One marker per session. If a mid-session `/pause` was already written,
  update the same file rather than creating a second.
- Do not bleed context from other projects or background topics into
  the marker.
