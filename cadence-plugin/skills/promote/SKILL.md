---
description: Promote an Idea to Pursuit, Project, or Action — enforces graduation gates
---

# /promote

Advance an Idea through the pipeline. Enforces the graduation gate
appropriate to the target level.

## Usage

- `/promote <idea>` — promote a specific Idea (agent determines target level)
- `/promote` — show promotable Ideas (developed state), let user choose

Arguments resolve via fuzzy match, partial match, or natural language.

## Steps

1. **Resolve the Idea:**
   - If specified, find the Idea file by ID or fuzzy match.
   - If no argument, show Ideas with `state: developed` (ready for promotion)
     and Seeds that might be ready for direct promotion:
     ```
     Promote — Ideas ready to advance

     Developed (evaluated):
     1. [idea-id]: [summary] — parent: [pursuit]
     2. [idea-id]: [summary] — parent: [pursuit]

     Seeds (may need develop first):
     3. [idea-id]: [summary] — parent: [pursuit]

     Which Idea? (or "develop first" for Seeds)
     ```

2. **Determine target level:**
   - Idea on Wandering (no parent pursuit context) → candidate **Pursuit**
   - Idea on a Pursuit → candidate **Project**
   - Idea on a Project → candidate **Action**
   - Ask to confirm: "This looks like a [Project]. Is that right, or should
     it be a [Pursuit/Action] instead?"
   - Push back on mismatches: "This looks like a Project — are you sure it
     warrants its own Pursuit?"

3. **Enforce the graduation gate:**

   **Idea → Pursuit (Why gate):**
   - Ask: "What's the Why behind this? Why does this matter to you?"
   - The Why must connect to values, identity, or responsibility.
   - If the Why is vague: "That's a start — can you make it more specific?
     A Pursuit without a clear Why won't survive the first hard week."
   - Once accepted:
     ```bash
     cadence create-pursuit <slug> \
       --type finite \
       --why "<the user's why>" \
       --description "<the user's framing>"
     ```

   **Idea → Project (DoD gate):**
   - Ask: "What does done look like? When you finish this, what's true
     that isn't true now?"
   - Translate the answer into a Definition of Done checklist.
   - If the DoD is vague or has only one item: "This might be an Action,
     not a Project. A Project needs multiple steps. Is this really a Project?"
   - Once accepted:
     ```bash
     cadence create-project <slug> --pursuit <pursuit-id> \
       --description "<one-paragraph framing>" \
       --dod "<item 1>" --dod "<item 2>" \
       --action "<first action>" --action "<second action>"
     ```

   **Idea → Action (Concreteness gate):**
   - Ask: "Can you visualize doing this? What's the specific next physical
     or digital action?"
   - If abstract: "That's still abstract — what would you actually do first?
     Where would you start?"
   - Once accepted:
     ```bash
     cadence add-item <project-id> --pursuit <pursuit-id> \
       --section action --text "<concrete action>"
     ```

4. **Update the Idea via the CLI:**
   ```bash
   cadence set-idea-state <idea-id> --state promoted \
     --promoted-to <type>:<id>    # e.g., project:build-indexer
   ```
   The Idea file persists as an origin link — the Narrative can
   reference where this Pursuit/Project/Action came from.

5. **Confirm:**
   ```
   Promoted [idea] → [type]: [name]
   [Brief description of what was created]
   ```

## Guardrails

- **Enforce the gate.** Don't let vague Whys, missing DoDs, or abstract
  Actions through without pushback. The gate exists to protect the user
  from premature commitment.
- **Respect the user's override.** If they insist after pushback, accept.
  The gate is friction, not a block.
- **Don't generate the Why/DoD/Action for the user.** Ask questions to
  help them articulate it, but the content comes from them.
