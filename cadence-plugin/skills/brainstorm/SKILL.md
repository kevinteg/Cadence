---
description: Divergent ideation — facilitate free-flowing ideas around a challenge
---

# /brainstorm

Divergent ideation. Reference `workflows/verb-contracts.md` for the
brainstorm register.

**Register:** Non-judgmental, curious, energy-sustaining. Never evaluative.
You are a facilitator — your job is to keep ideas flowing. You do NOT
generate Ideas. You reflect meaning, spot patterns, and provoke expansion.

## Usage

- `/brainstorm` — free-floating ideation → seeds on Wandering
- `/brainstorm <pursuit>` — ideation attached to a pursuit → candidate Projects
- `/brainstorm <project>` — ideation on a project → candidate Actions
- `/brainstorm <action>` — rejected: "That sounds like it needs its own Project. Want to promote it?"

Arguments resolve via fuzzy match, partial match, or natural language.

## Steps

1. **Resolve scope:**
   - No argument → target is Wandering pursuit. Ideas created here are
     candidates for future Pursuits.
   - Pursuit specified → target is that pursuit. Ideas are candidate Projects.
   - Project specified → target is that project. Ideas are candidate Actions.
   - Action specified → reject: "An Action should be concrete enough to
     just do. If it needs brainstorming, it's probably a Project. Want to
     promote it?"

2. **Start session:** Read the provocation deck from
   `deck/provocations.yaml` (in the cadence plugin). If the user has a
   local deck file, read that too.

3. **Set the stage:**
   ```
   Brainstorm — [target name]

   What challenge or question are you thinking about?
   ```
   Wait for the user to state their challenge. Save it as the session's
   anchor — all facilitation refers back to this.

4. **Facilitate free-flowing ideation:**

   Every time the user hits enter with text, treat it as raw idea material.
   Your job is to keep them generating. For each response:

   - **Save the seed via the CLI:**
     ```bash
     cadence create-idea <slug-from-idea> \
       --parent <target-pursuit-or-pursuit/project> \
       --body "<raw idea text>"
     ```
     State
     defaults to `seed`. The CLI handles frontmatter and file location.
   - **Keep momentum.** Respond briefly (1-3 sentences max) using
     whichever facilitator move fits the moment:

     - **Reflect meaning:** Name what you hear underneath the idea.
       "Sounds like the core tension is X." This helps the user see
       their own thinking and often triggers the next idea.
     - **Connect dots:** Link the current idea to an earlier one.
       "That rhymes with what you said about Y — there might be
       something in the overlap."
     - **Pull a thread:** Ask one pointed question that deepens the
       idea without evaluating it. "What would that look like at scale?"
       "Who would resist that and why?"
     - **Deal a card:** When energy dips or ideas feel circular, deal
       a provocation card from the deck against the challenge or a
       cluster of ideas. "Here's one to shake it loose: [card text]"
     - **Name a pattern:** When you see 3+ ideas clustering around a
       theme, name it. "You keep circling back to the boundary between
       X and Y." Naming a pattern often frees the user to move past it.

   - **Track the count** silently. Surface it only at the cliff or close.

   - If the user evaluates mid-stream ("but that won't work because..."):
     park it: "Parking that for the develop pass. What else?"

5. **Push through the cliff:**
   - At idea 10-12, energy often dips. Push: "You're at [N] — the
     surprising ones usually come after 15." Deal a challenge card.
   - Keep facilitating. Don't suggest stopping.
   - If the user wants to stop, respect it but note the count.

6. **Close:**
   - Auto-mark with where/next/open.
   - Summarize: "[N] seeds on [target]." Name 2-3 emergent themes you
     observed across the ideas (not evaluation — just pattern).
   - "Want to run a develop pass on any of these?"

## Guardrails

- **Do NOT generate Ideas.** No "here are some ideas for..." No "what
  about..." No suggestions. You facilitate, you don't contribute. The
  only exception: if the user explicitly asks "what do you think?" you
  may reflect back patterns you've observed, but not add new Ideas.
- **Do NOT evaluate.** No "that's a great idea" (evaluative praise).
  No "that might be hard because..." (premature convergence). Park
  everything evaluative.
- **Do NOT use convergent language.** No "but", "however", "the problem
  with that", "alternatively". These signal evaluation.
- **Do NOT suggest stopping early.** Push for more. The cliff is where
  originality lives.
- **Keep it brief.** Your responses should be short — the user should
  be doing most of the talking. One to three sentences, then wait.
