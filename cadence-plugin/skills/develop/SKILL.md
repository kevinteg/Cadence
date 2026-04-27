---
description: Convergent evaluation of Ideas — PPCo, criteria, pre-mortem
---

# /develop

Convergent evaluation pass on Ideas. Reference `workflows/verb-contracts.md`
for the develop register.

**Register:** Structured-critical. Respectful but honest. Allowed to kill
an Idea — with a reason worth remembering.

## Usage

- `/develop` — show undeveloped Seeds ready for evaluation, let user choose
- `/develop <idea>` — run PPCo on a specific Idea

Arguments resolve via fuzzy match, partial match, or natural language.

## Steps

1. **Resolve target:**
   - No argument → list undeveloped Seeds via the bundled CLI:
     ```bash
     cadence ideas --state seed --json
     ```
     Group
     the returned ideas by `parent` (Wandering first, then other
     pursuits) and present:
     ```
     Develop — Ideas ready for evaluation

     **Wandering** (unattached)
     1. [idea-id]: [first line of body]

     **[Parent Pursuit ID]**
     2. [idea-id]: [first line of body]

     Which Ideas do you want to develop? (number, name, or "all")
     ```
     If the JSON list is empty, say "No undeveloped Seeds. Run
     `/cadence:brainstorm` to generate some."
   - Idea specified → resolve to that Idea file (use
     `cadence ideas --json` and fuzzy-match against `id`).

2. **Run PPCo on each selected Idea:**

   **P — Praise:** What's genuinely good about this Idea? What's the
   kernel of value? Be specific and honest — not flattery.

   **P — Potentials:** What could this become if it worked? What doors
   does it open? What's the best-case outcome?

   **C — Concerns:** What could go wrong? What assumptions does it make?
   What's the biggest risk? Frame as "I have a concern that..." not
   "this won't work because..."

   **O — Overcome:** For each concern, how might it be addressed? What
   would need to be true for the concern not to matter?

   Present each section and wait for user input before proceeding to
   the next.

3. **For high-stakes Ideas, offer a pre-mortem:**
   "Imagine this failed completely. Six months from now, looking back —
   what went wrong?" Let the user generate failure modes. Record them.

4. **For competing Ideas, offer criteria evaluation:**
   Ask the user what criteria matter (or suggest: feasibility, impact,
   alignment with Leveraged Priority, time-to-value). Score each Idea
   against criteria. Present as a matrix.

5. **Update Idea state via the CLI:**
   - If the user wants to keep developing: leave as seed; append PPCo
     notes to the Idea file body (use Edit on the markdown body).
   - If developed:
     ```bash
     cadence set-idea-state <idea-id> --state developed
     ```
     The CLI stamps `developed_at` automatically. Then append PPCo
     notes and pre-mortem results to the body via Edit.
   - If killed:
     ```bash
     cadence set-idea-state <idea-id> --state closed \
       --reason "<what did this Idea teach us?>"
     ```
     The reason matters — it enters the narrative as meaning-making material.

6. **Close:**
   - Auto-mark with where/next/open.
   - Summarize: "[N] developed, [M] closed, [K] ready for promotion."
   - If any are ready: "Want to promote any of these?"

## Guardrails

- **Do NOT generate new Ideas.** Develop evaluates existing Ideas only.
  If new Ideas surface during evaluation, capture them as Seeds — they
  get their own develop pass later.
- **Feedback is informational, not evaluative.** No "great idea" or
  "that's brilliant." Describe what's specifically valuable.
- **Use "what" not "why" when probing concerns.** "What could go wrong?"
  not "why might this fail?"
- **Every killed Idea gets a reason.** The reason enters the Narrative
  as meaning-making material. A closed Idea without a reason is
  incomplete closure.
