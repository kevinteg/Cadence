---
description: Render the Cadence verb catalogue inline — the 5-group overview, a single verb's contract, or all verbs in one group. TRIGGER on explicit /cadence:help invocation, OR when the user asks for the verb surface by name (e.g., "show me the verbs", "what cadence commands are there", "help me browse the surface"). SKIP for general programming-help requests that don't ask about Cadence's verb surface.
---

# /help

Browse the Cadence verb surface inline. Renders from
`cadence-reference.md` (Verb Catalogue) and
`workflows/verb-contracts.md` (per-verb contracts) — those files are
the source of truth, the skill just presents them.

## Usage

- `/help` — render the 5-group catalogue (Diverge / Execute / Reflect / Setup / Browse)
- `/help <verb>` — render the named verb's full contract
- `/help <group>` — render every verb in that group

## Steps

1. **Resolve the argument:**
   - No argument → render the catalogue overview (step 2).
   - Argument matches a group name (`diverge`, `execute`, `reflect`,
     `setup`, `browse`) — case-insensitive → render group view (step 3).
   - Argument matches a verb name (`brainstorm`, `develop`, `promote`,
     `start`, `pause`, `complete`, `cancel`, `capture`, `waiting`,
     `reflect`, `narrate`, `close`, `reconcile`, `init`, `status`,
     `help`) — case-insensitive, optional leading `/cadence:` or `/`
     stripped → render verb view (step 4).
   - Otherwise: "No verb or group matches '[arg]'. Try `/help` for
     the catalogue."

2. **Catalogue overview.** Read the "Verb Catalogue" section from
   `cadence-plugin/cadence-reference.md`. Present it verbatim
   (the 5 group tables + the Discovery flow paragraph). Don't add
   commentary or rephrase; the source is the source.

3. **Group view.** From the Verb Catalogue, extract the named group's
   table (e.g., for `diverge`: `brainstorm`, `develop`, `promote`).
   Then for each verb in the group, append its **Purpose** and
   **No-argument entry** lines from
   `cadence-plugin/workflows/verb-contracts.md`. Format:

   ```
   ## <Group> — <one-liner>

   ### /cadence:<verb>
   <Purpose paragraph>

   No-argument entry: <line>

   ### /cadence:<verb>
   ...
   ```

4. **Verb view.** Read the named verb's full section from
   `cadence-plugin/workflows/verb-contracts.md` (Purpose, Tone,
   Behavior, No-argument entry, Guardrails, Exit). Present verbatim
   under a `## /cadence:<verb>` heading.

## Guardrails

- **No paraphrasing.** Verb-contracts.md is the canonical register
  source. Render it as-is so the skill stays in sync when contracts
  change.
- **No invented verbs.** If the user asks for a verb that isn't in
  the catalogue, say so and suggest `/help` to see the list.
- **Keep it terse.** The catalogue is a reference, not a tutorial —
  no "let me explain" framing, no encouragement, just the content.
