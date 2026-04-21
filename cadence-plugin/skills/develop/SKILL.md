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
   - No argument → scan all pursuits (including Wandering) for Ideas with
     `state: seed`. Present them grouped by parent:
     ```
     Develop — Ideas ready for evaluation

     **Wandering** (unattached)
     1. [idea-id]: [first line of idea text]
     2. [idea-id]: [first line of idea text]

     **[Pursuit Name]**
     3. [idea-id]: [first line of idea text]

     Which Ideas do you want to develop? (number, name, or "all")
     ```
   - Idea specified → resolve to that Idea file.
   - Also check `_seeds/` for unparented seeds.

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

5. **Update Idea state:**
   - If the user wants to keep developing: leave as seed, add PPCo notes
     to the Idea file.
   - If developed: update `state: developed`, add `developed_at: <date>`.
     Append PPCo notes and any pre-mortem results to the Idea file.
   - If killed: update `state: closed`, add `closed_reason: <reason>`.
     The reason matters — "what did this Idea teach us?"

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
