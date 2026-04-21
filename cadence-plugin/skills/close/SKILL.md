---
description: Close a pursuit or project — triggers the cleaning ritual for unresolved Ideas
---

# /close

Close a pursuit or project. Triggers a cleaning ritual that walks
unresolved Ideas before closure — a Zeigarnik-release event that turns
ending into meaning-making.

## Usage

- `/close <pursuit>` — close a pursuit (absolute block on unresolved Ideas)
- `/close <project>` — close a project (override-with-reason for Ideas)

Arguments resolve via fuzzy match, partial match, or natural language.

## Steps

### Pursuit Closure (absolute block)

1. Resolve the pursuit. Confirm intent: "Close [pursuit]?"

2. Check for unresolved Ideas in `pursuits/<pursuit>/ideas/` — any Idea
   with state `seed` or `developed`. Ideas in `promoted`, `moved`, or
   `closed` state are considered resolved. For `moved` Ideas, the move
   only counts as resolution if the target pursuit/project is active (not
   archived or someday) — otherwise the Idea is still unresolved.

3. **If unresolved Ideas exist — absolute block.**
   Cannot close until every Idea is resolved:
   ```
   [pursuit] has [N] unresolved Ideas. Each needs a decision before closing.
   ```

4. Walk each unresolved Idea. For each, present the Idea and offer:
   - **Move** — reattach to another Pursuit or to Wandering
   - **Close** — with a reason. Ask: "What did this Idea teach you?"
   - **Promote** — advance to Pursuit/Project/Action (run /promote flow)
   - **Develop first** — if it's a raw Seed, run /develop before deciding

5. Once all Ideas are resolved, check that all Projects are done or dropped.
   If active/on_hold projects remain, ask: "These projects are still open.
   Drop them, or complete them first?"

6. Update pursuit frontmatter: `status: archived`. Move to `pursuits/_archived/`.

7. Generate closure narrative — summarize the Pursuit's arc:
   "Generated [N] Ideas — [X] became Projects, [Y] became their own
   Pursuits, [Z] were closed with reasons, [W] moved to Wandering."

8. Save narrative to `narratives/drafts/<pursuit-id>-closure.md`.

### Project Closure (override-with-reason)

1. Resolve the project. Check DoD status.

2. If all DoD items are checked → standard completion:
   - Confirm: "[project] has all DoD items complete. Mark as done?"
   - Update `status: done` in frontmatter
   - Run pursuit checkpoint (see Completing a Project in runtime)

3. If DoD items remain (cancellation/drop):
   - Ask: "Not all DoD items are done. Drop this project?"
   - Require a reason: "What's the reason for dropping?"

4. Check for unresolved Ideas in `pursuits/<pursuit>/ideas/` that
   reference this project as parent. If any exist:
   - **Override-with-reason** (not absolute block): "This project has
     [N] unresolved Ideas. You can close anyway, but let's walk them."
   - Walk each: move, close-with-reason, promote, or develop-first.
   - If the user wants to skip: accept with reason logged.

5. Update project frontmatter: `status: done` or `status: dropped`.

6. Run pursuit checkpoint.

### Cancellation (either type)

If the user cancels mid-ritual ("actually, never mind"):
- Walk the ritual anyway for any Ideas already reviewed
- Save progress — partially resolved Ideas stay resolved
- Don't update the pursuit/project status

## Guardrails

- Pursuit closure is an absolute block on unresolved Ideas. No override.
- Project closure allows override-with-reason for Ideas.
- Every closed Idea must have a reason — "what did this teach us?"
- The closure narrative is generated, not manual. The user reviews but
  doesn't write it.
