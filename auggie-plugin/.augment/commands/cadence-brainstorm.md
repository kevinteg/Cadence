---
description: Open or resume a brainstorm workspace, facilitate divergent ideation, write candidate solutions on convergence, crystallize a chosen solution into a pursuit. TRIGGER on explicit /cadence-brainstorm invocation, OR when the user requests divergent ideation by name (e.g., "let's brainstorm onboarding", "I want to brainstorm ideas for X"). SKIP for conversation that merely touches a topic without requesting an ideation session.
argument-hint: '[slug]'
---

<arguments>$ARGUMENTS</arguments>


# /brainstorm

Workspace-shaped ideation verb. A brainstorm is a `brainstorms/<slug>/`
directory carrying `workspace.md` (divergent notes), `meta.yaml` (phase
machine + provenance), `solutions/<name>.md` (candidate solutions when
converging), and `decision.md` (written on crystallize). See
`.augment/cadence-reference.md` "Brainstorm Workspaces" for the file shapes.

Reference `.augment/workflows/verb-contracts.md` for the brainstorm register.

## Usage

- `/cadence-brainstorm <slug>` — start or resume the workspace at `brainstorms/<slug>/`
- `/cadence-brainstorm` — no-arg: list active workspaces (phase diverging or converging), offer to open one
- `/cadence-brainstorm --crystallize` — in a converging workspace: materialize a pursuit from the selected solution
- `/cadence-brainstorm --archive` — close out the workspace (keep in wiki/_archive/brainstorms/ by default; --delete to remove)

Arguments resolve via fuzzy match against existing workspace slugs.

## Steps

### 1. Resolve the workspace

- **`<slug>` given:** if `brainstorms/<slug>/` exists, **resume** —
  read `meta.yaml`, see the current phase, present what's in
  `workspace.md` and any `solutions/<name>.md` files. If it doesn't
  exist, **create** via `cadence create-brainstorm <slug>` (phase
  `diverging`). The CLI lays out `workspace.md`, `meta.yaml`, empty
  `refs/`, empty `solutions/`.
- **No argument:** run `cadence scan --json` and list brainstorms
  with `phase: diverging | converging`. Ask which to resume, or
  whether to create a new one.
- **`--crystallize` or `--archive`:** these require a slug context.
  If the user invoked the flag without naming a workspace in the
  current conversation, ask which workspace.

### 2. Diverging phase — facilitate ideation

While `phase: diverging`, the agent is a facilitator, not a generator
(same guardrails as the v1 brainstorm verb):

- Every user input is raw idea material. Append to `workspace.md` via
  `Edit` — keep notes flowing.
- For each user input, keep momentum with a brief facilitator move:
  - **Reflect meaning:** "Sounds like the core tension is X."
  - **Connect dots:** "That rhymes with what you said about Y."
  - **Pull a thread:** one pointed non-evaluative question.
  - **Deal a card:** when energy dips, pull from `deck/provocations.yaml`.
  - **Name a pattern:** "You keep circling back to the boundary between X and Y."
- **Park evaluative content.** If the user starts critiquing ("but
  that won't work because..."), park it: "Saving that for when we
  converge. What else?"
- **Push through the cliff:** at idea 10–12, energy often dips.
  "You're at [N] — the surprising ones usually come after 15."
- **Track silently.** Surface the count only at the cliff or close.

### 3. Signal-detect convergence

When the user says something like "I think I have a few candidate
directions" / "let me start picking between these" / "I want to weigh
two approaches" — that's the convergence signal. Confirm: "Want to
move into the converging phase? I'll create `solutions/<name>.md`
files for each candidate so we can iterate on them as separate
artifacts."

On confirmation:

1. Ask the user to name 2–4 candidate solutions (a short slug per).
2. For each name, write `brainstorms/<slug>/solutions/<name>.md`
   with a starter template:
   ```markdown
   # <one-line title — the user supplies>

   <prose preamble — to be filled in as the solution clarifies. The
   user owns this; the agent reflects + sharpens without generating
   new content.>

   ## Next steps

   - [ ] <first concrete action>
   ```
   Use `Write` for these files.
3. Update `meta.yaml`: `phase: converging` (via
   `cadence set-brainstorm-phase <slug> --phase converging`), set
   `candidate_solutions: [<name1>, <name2>, ...]`.

### 4. Converging phase — iterate on solutions

In this phase the user iterates on each `solutions/<name>.md` —
fleshing out the preamble (which will become the pursuit's Intent on
crystallize) and the `## Next steps` checklist (which becomes the
pursuit's Actions). The agent helps:

- **Sharpen Intent:** ask clarifying questions about each solution's
  motivation, scope, and what "done" would feel like. The user owns
  the prose; the agent reflects and asks.
- **Concretize next steps:** push abstract bullets toward visualizable
  actions ("Audit the current storage calls" → "Run `rg storage` in
  `src/` and list each call site").
- **Surface tradeoffs without picking.** "Solution A makes the
  migration safer; solution B finishes sooner. Which is more
  important to you?"
- **Don't add solutions in this phase.** New candidates that surface
  go back to diverging or get captured for a follow-up brainstorm.

The user picks one when ready ("let's go with option-a"). That's the
signal to crystallize.

### 5. Crystallize

Confirm the choice: "Crystallize `<solution>` into a pursuit under
`<pursuit>` as project `<id>`?" Then run:

```bash
cadence crystallize <slug> \
  --solution <name> \
  --pursuit <pursuit-id> \
  [--project-id <id>] \
  [--decision-note "<why this solution, in the user's words>"]
```

The CLI parses `solutions/<name>.md` (H1 → title, prose preamble →
Intent, `## Next steps` `- [ ]` lines → actions), creates the
project, writes `decision.md`, updates `meta.yaml` to `phase:
crystallized` with `selected_solution` + `target_pursuit`. The
brainstorm directory persists as a narrative artifact pointing at
the pursuit it produced.

After crystallize, suggest opening the new project: `/cadence-start
<project-id>`.

### 6. Archive

When a brainstorm needs to close without crystallizing (the user
realizes the topic was wrong, or they want to set it aside):

```bash
cadence archive-brainstorm <slug>            # default: --keep
cadence archive-brainstorm <slug> --delete   # remove outright
```

Default keeps the workspace as a narrative artifact at
`wiki/_archive/brainstorms/<slug>/`. Delete is for actual mistakes.

## Guardrails

- **Diverging phase: agent facilitates, user generates.** No
  agent-contributed ideas. Park evaluative content. No suggestions to
  stop early. Push through the cliff.
- **Converging phase: agent reflects + sharpens, user owns prose.**
  The Intent and Next-steps content come from the user; the agent
  helps clarify and concretize. Don't generate the Intent.
- **Crystallize requires `phase: converging`.** Gate enforced
  CLI-side; if the user tries to crystallize from diverging, prompt
  them to converge first.
- **`## Next steps` is mandatory** in any solution that gets
  crystallized — the CLI rejects solutions without a `## Next steps`
  H2 with `- [ ]` lines (there's nothing to extract as actions).
- **Archive (--delete) is destructive.** ELI5 confirm before removing
  a workspace outright.
- **No mid-flow interruptions.** Keep responses brief during ideation
  (1–3 sentences); the user should be doing most of the talking.

## Exit conventions

After ideation closes (whether crystallized, archived, or just paused):

```
[N] notes in workspace.md, [M] candidate solutions.
Phase: <phase>.
```

Then the verb-hint block + teaching footer per the universal exit
convention (`cadence tip-pick --triggers verb-brainstorm`).
