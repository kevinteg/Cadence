---
description: Promote an Idea to Pursuit, Project, or Action — enforces graduation gates. TRIGGER ONLY when the user explicitly invokes /cadence:promote or /promote. SKIP all natural-language equivalents — never auto-fire from "turn this into a project", "let's make X a pursuit", "this idea is ready", or graduation talk.
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
   - Idea on Inbox (no parent pursuit context) → candidate **Pursuit**
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

   **Idea → Project (Intent gate):**
   - Ask: "What's the Intent? Take a brain dump — motivation, scope,
     what success would feel like. The narrative will get tightened as
     actions land."
   - Capture the user's prose as the Intent. Lightly expand if the
     picture is unclear; don't generate it for them.
   - If the Intent reads like a single tweetable goal with no shape to
     it: "This might be an Action, not a Project. A Project usually
     covers more than one move. Is this really a Project?"
   - **Domain-adapt the prompts.** Run the domain heuristic on the
     Intent draft (or read it back from `cadence project <id> --json`
     after creation) and adapt follow-up questions to fit:
     - **Physical domain** (kitchen, garage, garden, fitness, etc.):
       ask about workspace ("where is this work going to happen?"),
       tools and parts ("what materials do you need? are they on hand
       or do you need to source them?"), and constraints ("water
       shutoff timing, weather window, parts availability, who else
       in the space"). Avoid CI/code metaphors entirely.
     - **Digital domain** (code, infrastructure, schemas, etc.):
       standard Cadence prompts work — ask about the test surface,
       integration points, deploy considerations.
     - **Hybrid** (e.g., a kitchen-inventory app): ask both kinds of
       questions in turn. Surface the duality explicitly: "this looks
       hybrid — let's cover both the physical workflow and the
       software."
     - **Unknown**: ask one open question ("what's the shape of this
       work?") and let the user lead. Don't guess.
   - Ask for first action(s); if the user doesn't have one ready, the
     CLI defaults to `Brainstorm and add concrete actions for this
     project`. If the user names multiple, pass them all as repeated
     `--action` flags on the create call (cheaper than create + add).
   - **Domain-adapt first-action suggestions.** If the agent suggests
     a first action when the user hesitates:
     - Physical: physical-action-shaped ("turn off the water supply",
       "lay drop cloth in the work area", "measure the existing
       fixture", "drive to the hardware store").
     - Digital: digital-action-shaped ("open the file at `path:line`",
       "run the existing test to confirm it currently fails", "draft
       the schema migration").
     - Don't volunteer suggestions for hybrid/unknown — ask instead.
   - Once accepted:
     ```bash
     cadence create-project <slug> --pursuit <pursuit-id> \
       --intent "<the Intent narrative>" \
       --action "<first action>" --action "<second action>"
     ```
   - **Optional explicit override.** If the heuristic gets the domain
     wrong, the user can set `domain: physical | digital | hybrid` in
     the project's frontmatter. The override is documented in
     `cadence-reference.md`. The agent should not auto-set this; only
     surface the option if the user volunteers their domain framing
     differently than the heuristic detected.
   - If more actions need to land after creation, use the bulk variant
     to avoid per-action round trips:
     ```bash
     cadence add-items <slug> --pursuit <pursuit-id> --section action \
       --text "<...>" --text "<...>"
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

- **Enforce the gate.** Don't let vague Whys, missing Intents, or
  abstract Actions through without pushback. The gate exists to
  protect the user from premature commitment.
- **Respect the user's override.** If they insist after pushback, accept.
  The gate is friction, not a block.
- **Don't generate the Why/Intent/Action for the user.** Ask questions
  to help them articulate it, but the content comes from them. (Light
  agent expansion of an Intent brain dump is fine — that's
  co-editing — but the kernel comes from the user.)
