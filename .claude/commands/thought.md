# /thought

Capture a raw idea and triage it. Can be used mid-session or standalone.

## Usage

The user will say something like:
- "/thought I should ask James about the custom test runner"
- "/thought What if we auto-generate test scaffolding from topology files?"
- "/thought Remember to book the campsite before May"

## Steps

1. Generate a timestamp for the filename: `YYYY-MM-DDTHH-MM`.

2. Analyze the input and suggest routing:
   - Is this an action on an existing project? (check active projects)
   - Is this a new project candidate? (too big for a single action)
   - Is this a 2-minute item? (can be done right now)
   - Is this reference material? (not actionable)
   - Rate confidence: high, medium, low.

3. Create a thought file:

   ```markdown
   ---
   captured: <ISO-8601>
   source: text
   ---

   [Raw input from the user]

   # Triage

   **Suggestion:**
   1. "[extracted action]" → [routing] (confidence: [level])
   ```

4. Present the triage suggestion to the user:
   - If confidence is high and it's an action on an existing project:
     "This sounds like an action for [project] in [pursuit]. Want me to
     add it?" If yes, add the action to the project file and move the
     thought to `thoughts/processed/`.
   - If it's a 2-minute item: "This seems quick — want to just do it now?"
   - If confidence is medium or low: "I'm not sure where this belongs.
     I'll save it for review during your next Reflect."
   - If it's a new project candidate: "This sounds bigger than a single
     action. Want to create a new project for it?"

5. Save the thought file to `thoughts/unprocessed/` (if deferred) or
   `thoughts/processed/` (if acted on immediately).
