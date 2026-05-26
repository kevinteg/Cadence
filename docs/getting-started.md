# Getting Started

In about ten minutes you'll have Cadence installed, a fresh repo bootstrapped, a real pursuit on the board, and a full loop walked from capture through reflection to narrative.

The example uses a **non-coding** pursuit (cleaning out a garage) on purpose. Cadence is a cognitive operating system, not a dev tool — most users work on non-dev things (household projects, creative practice, fitness, family logistics) and the demo should match that. Coding pursuits work the same way.

## Install

### Prerequisites (fresh Mac)

Skip the steps you already have.

1. **Homebrew** — [brew.sh](https://brew.sh) if you don't have it.

2. **Node.js (LTS) via nvm**. Cadence's bundled CLI runs on Node. nvm makes upgrades painless:

   ```bash
   brew install nvm
   ```

   Add the line Homebrew prints to your shell profile (`~/.zshrc` or `~/.bashrc`), open a new shell, then:

   ```bash
   nvm install --lts
   nvm use --lts
   ```

3. **Claude Code CLI:**

   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

4. **GitHub CLI (optional, recommended).** `gh` pairs with `/cadence:report` for filing issues and with `/cadence:incoming` for maintainer-side triage:

   ```bash
   brew install gh
   gh auth login
   ```

### Install Cadence

Clone the plugin to a stable location. Anywhere is fine; the path is referenced by `--plugin-dir`:

```bash
git clone https://github.com/kevinteg/Cadence.git ~/code/cadence
```

## Bootstrap a fresh repo

Pick (or make) a directory that will hold your Cadence data. It needs to be a git repo:

```bash
mkdir ~/work/garage-cleanout
cd ~/work/garage-cleanout
git init
claude --plugin-dir ~/code/cadence/cadence-plugin
```

Inside Claude Code, run:

```
/cadence:init
```

Init is a conversational SKILL — it walks you through:

- Creating the directory structure (`pursuits/`, `brainstorms/`, `thoughts/`, `reflections/`, `narratives/`, `validations/`)
- Generating `cadence.yaml` with sensible defaults
- Creating your first pursuit (it asks you for a **Why** — the values or role-anchor; never something the agent invents)
- Adding the first project under that pursuit (an **Intent** narrative + at least one Action)
- Setting up `.gitignore` for generated files

Expected: a `pursuits/get-the-garage-cleaned-out/` directory with a `pursuit.md` carrying your Why, plus a `projects/sort-and-donate-old-tools.md` (or whatever name you picked) carrying the Intent and a few actions.

## The 10-minute loop

### Step 1 — Drop a few thoughts into the Inbox

You're walking through the garage and notice things. They're not actions yet; they're raw observations:

```
/cadence:capture "Check whether the old framing nail gun still works before it goes in the donation pile"
/cadence:capture "Buy a third pegboard hook pack — running short"
```

These are **silent** — no agent response, no acknowledgment, no elaboration request. That's the flow-safe contract: the system never interrupts the moment you're in. The captures land in `thoughts/unprocessed/` and join the **Inbox view**.

### Step 2 — See where you are

```
/cadence:status
```

You'll see the navigation-led dashboard:

```
# Cadence Status

**This week**: no leveraged priority set — /cadence:reflect to set one. Last touch was `sort-and-donate-old-tools` (just now).

## Active Pursuits

### get-the-garage-cleaned-out — 0/1 projects done

| Project | Status | Actions | What it's about |
|---|---|---|---|
| `sort-and-donate-old-tools` | active | 1/5 | The toolbox in the corner has duplicates of everything — th… |

## Heads up

- Inbox: 2 items ✓

## Likely next moves

1. `/cadence:start sort-and-donate-old-tools` — Touched today — natural to pick back up.
2. `/cadence:narrate today` — Activity landed today with no daily narrative yet.
3. `/cadence:reflect` — No reflection yet — set a Leveraged Priority.
```

The shape:

- **"This week"** sets the orientation — a one-line manager-recap with the LP framing and the last-touch hook.
- **Active Pursuits** lead with what to work on. Each pursuit gets a table of its open projects: status, action progress, first sentence of the Intent.
- **Heads up** carries the conversational nudges: the Inbox line ("✓" when at or below the soft cap), any pending fresh-session validations, and a one-line summary of any reconciler flags.
- **Likely next moves** ranks up to 3 suggestions by LP alignment → recency → structural urgency → parking-lot pressure → routine surfaces. Each is a concrete verb invocation with a one-line rationale.

### Step 3 — Walk the Inbox

The Inbox is a **view**, not a directory. It unions untriaged captures with brainstorms still in `diverging` phase. `/start inbox` walks them one at a time:

```
/cadence:start inbox
```

You'll see something like:

```
Walking 2 untriaged thoughts, oldest first.

aged · 3d · capture
---
Check whether the old framing nail gun still works before it goes in the donation pile
---
Outcome:
  [a] action — add to a pursuit's project
  [p] project — create a new project from this
  [b] brainstorm — open a new diverging workspace from this seed
  [c] close — discard with a reason
  [k] keep — leave in Inbox; surface again next walk
  [q] quit — exit the walk; remaining items stay

> a

Which project?
  1. sort-and-donate-old-tools

> 1

Action text? (default: "Check whether the old framing nail gun still works")

> [enter]

Added: Check whether the old framing nail gun still works
     to sort-and-donate-old-tools (action 6 of 6).
```

The capture flips to `status: triaged, triaged_to: action:get-the-garage-cleaned-out/sort-and-donate-old-tools/6` and disappears from the Inbox count.

The second capture might be `[b] brainstorm` if it sparks a new workspace, `[k] keep` if you're not ready to decide, or `[c] close` with a one-line lesson.

### Step 4 — Open the project and make progress

```
/cadence:start sort-and-donate-old-tools
```

```
sort-and-donate-old-tools — 1/5 actions [active]

Intent:
  The toolbox in the corner has duplicates of everything — three claw hammers, two sets of socket wrenches, drill bits from a job site I left in 2020. Sorting them down to one good set per kind and donating the rest is the first move; the rest of the garage cleanup works better with a clean tool wall as the anchor. Done when the wall pegboard holds the keepers and the donation bin is at Goodwill.

Actions:
  - [x] Confirm Goodwill drop-off hours this week
  - [ ] Lay out everything on the workbench, sorted by kind
  - [ ] Pick keepers — one of each, best condition wins
  - [ ] Bag the rest and load the car
  - [ ] Drop off at Goodwill

Available actions:
  /cadence:start <project>            Open the project view
  /cadence:complete <action>          Mark an action done
  /cadence:resolve <project>          Wrap up (--state complete | dropped)
  /cadence:waiting <project>          Track an external blocker
  /cadence:narrate <project>          Tell this project's story
  /cadence:help                       Browse the full verb surface
```

You actually go to the garage, lay out the tools, then check the action off:

```
/cadence:complete "Lay out everything on the workbench"
```

The agent flips the checkbox. Because the project was `on_hold` it would have auto-promoted to `active` on the first check — the **act of working** is what promotes a project, not the act of opening its view.

### Step 5 — Wrap the loop with reflection

End of the week (or whenever you want to step back):

```
/cadence:reflect
```

Reflect is the weekly ritual. Two phases:

**Phase 1 — Get Clear (short).** A 2-3 line awareness block:

```
Inbox: 1 item (oldest 1d)  ·  Dormant: 0 projects  ·  Closing-in: 0 pursuits  ·  WIP: 1/5

Want to handle these now, or note them in the reflection and move on?
  - 'handle' — hand off to /cadence:start inbox
  - 'note' — append the awareness counts to the reflection and proceed
  - 'pause' — exit; reflection resumes next time
```

If you pick `handle`, Reflect hands off to `/cadence:start inbox` and persists at `phase: get_clear` so the next invocation resumes here cleanly. The previous version of Cadence walked every capture and every project per Reflect — that turned a weekly ritual into a triage clearinghouse. v1.1 puts triage where it belongs (at the moment of capture, or via the dedicated `/start inbox` walk).

**Phase 2 — Get Focused.** Interactive. The agent asks open questions and waits for your answer before offering any observation:

- What worked well this week?
- What didn't work?
- The canonical Leveraged Priority question, asked verbatim: **"What is the one thing you will do that will make you feel like you won the week?"**

You name it; the agent helps you pressure-test the shape (proof at next Friday's Reflect, achievability ceiling, bundled-goals risk) without pre-suggesting. The reflection saves to `reflections/<YYYY-MM-DD>.md` with `status: complete`.

### Step 6 — See the story

```
/cadence:narrate week
```

The agent reads the week's project-file commits (via `cadence project-activity --scope weekly`), composes a 3-5 paragraph narrative in **McAdams structure** (what happened / what it meant / what shifted / what's next), and saves it to `narratives/drafts/weekly-YYYY-Www.md` with a watermark in the frontmatter. The next weekly run resumes from the last consumed commit.

The output reads like:

```
This week the garage stopped being a holding zone. Tuesday you confirmed
Goodwill's drop-off hours; Thursday you laid out the tools on the workbench
and saw what was actually there — three claw hammers, two socket sets,
drill bits from a job you'd forgotten you took. The act of looking was the
shift; everything before that was avoidance.

Two captures landed in the Inbox and one of them — the nail-gun question —
became a sixth action on the sort-and-donate project, which makes sense:
the question is part of the sorting decision, not separate from it. The
other (pegboard hooks) is still in the Inbox; it can ride.

For next week: the leveraged move is the donation drop-off itself. Until
the bin is in the car and out of the house, the cleanup hasn't shipped.
The Goodwill window is Saturday morning.
```

That narrative IS the watermark — the next time you run `/cadence:narrate week`, it reads the frontmatter, finds the commit it stopped at, and resumes from there. No separate state file.

## What you just did

In ten minutes you:

1. Bootstrapped a Cadence repo (`/cadence:init`)
2. Captured raw thoughts without breaking flow (`/cadence:capture`)
3. Saw the navigation-led dashboard (`/cadence:status`)
4. Triaged the Inbox into a real outcome (`/cadence:start inbox`)
5. Worked a project and checked off an action (`/cadence:start <project>` → `/cadence:complete`)
6. Closed the week with a short ritual (`/cadence:reflect`)
7. Generated the story of what shipped (`/cadence:narrate week`)

That's the full loop. The same loop works for any pursuit — physical (this one), knowledge work (reviewing a paper, writing an essay), code (shipping a feature, paying down tech debt), or anything else with a Why and a felt-sense of done.

## What to read next

- **[`docs/vision.md`](vision.md)** — the conceptual model. What a Pursuit is, what a Project is, why Cadence separates divergent and convergent modes, what we deliberately don't measure.
- **[`docs/architecture.md`](architecture.md)** — design rationale. The tradeoffs behind the model.
- **[`cadence-plugin/README.md`](../cadence-plugin/README.md)** — the verb surface with examples.
- **[`cadence-plugin/workflows/verb-contracts.md`](../cadence-plugin/workflows/verb-contracts.md)** — the per-verb behavioral contracts. The agent's register changes by verb; this doc says how.

## Troubleshooting

**`cadence` command not found inside Claude Code.** The CLI is on PATH via the plugin loader. If it's missing, confirm `claude --plugin-dir ~/code/cadence/cadence-plugin` was the launch command and that `cadence-plugin/bin/cadence` exists and is executable.

**SessionStart hook didn't fire on the first run.** Known Claude Code bug for marketplace-installed plugins ([anthropics/claude-code#10997](https://github.com/anthropics/claude-code/issues/10997)). The local `--plugin-dir` install path is unaffected.

**The dashboard says "Inbox: empty ✓" but I captured something.** Captures land at `thoughts/unprocessed/`. Confirm the file exists; the Inbox view reads from there.

**I want the SessionStart splash to be quieter.** Run `cadence dismiss-splash --hours 24` (or any duration) to suppress it for the named window. The splash also auto-suppresses when state hasn't changed in 60 minutes.
