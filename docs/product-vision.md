# Cadence — Product Vision (v3)

*The rhythm you return to.*

---

## What Is Cadence?

Cadence is a cognitive operating system for people who get a lot done but struggle to see the story of what they're building. It helps you diverge into ideas, converge on commitments, protect flow state during execution, and generate the narrative of what you're building across the many threads of your work and life.

Cadence is not a task manager. It is not a calendar. It is not a gamified productivity app. It is the skilled, trusted partner who holds your context — who knows where you left off, orients you when you sit back down, nudges you when you're overextended, and helps you see that today's scattered work actually served a theme.

It runs inside agentic coding tools like Claude Code, meeting you where you already work. One app. One voice. One rhythm.

---

## The Problem

Modern knowledge workers — especially technical leaders who span coding, architecture, coordination, family, and personal growth — face a specific kind of overwhelm:

**They're productive but disoriented.** They finish weeks feeling like they worked hard but can't articulate what moved forward. They context-switch between pursuits constantly and lose the thread. Their task manager is a graveyard of half-finished projects. Their goals exist in one system, their code in another, their ideas in a third, and none of them talk to each other.

**And the systems they use conflate two very different cognitive modes.** Divergent ideation — generating possibilities — is neurologically and psychologically distinct from convergent capture-and-execute. Research on the Default Mode and Executive Control networks (Beaty et al., 2015, 2016) shows these are separable systems whose dynamic coupling predicts creative output; the brainstorming literature (Diehl & Stroebe, 1987; Paulus & Nijstad) shows that mixing generation with evaluation degrades both. Yet task managers treat Ideas and Actions as the same kind of thing, and productivity frameworks largely begin downstream of the creative work that should have produced the Pursuits in the first place.

Existing tools solve pieces of this:

- **OmniFocus / Things / Todoist** — capture and organize tasks, but don't connect them to identity, values, or narrative. No flow state protection. No AI. No code integration. No divergent phase.
- **Notion / Obsidian** — flexible knowledge bases, but require constant manual curation. They're blank canvases, not active partners.
- **Jira / Linear / GitHub Issues** — track code-level work, but can't hold "be a present father" or "keep my kitchen appliances in good condition" alongside "stand up the CI pipeline."
- **Journaling apps** — capture reflection, but don't connect it to what you're actually doing.
- **Brainstorming apps** — produce diverge output, but never hand off to execution.

None of them play the role of a skilled companion who holds your whole context and helps you navigate it — from the first Idea through to the story of its completion.

---

## The Vision

Cadence is one voice whose register is set by the activity. You invoke verbs; the voice adapts.

**During `brainstorm`** — non-judgmental, quantity-seeking, the voice deals provocation cards from a curated Oblique/SCAMPER deck, refuses to evaluate mid-stream, pushes through the creative cliff ("you're at 12 — the original ones usually come after 15"). It parks any evaluative concern that surfaces and promises to return to it in the next phase. *This is the voice that helps you find what the Pursuit is.*

**During `develop`** — structured-critical. It runs PPCo (Praise, Potentials, Concerns, Overcome), criteria matrices, pre-mortems across clusters of Ideas. Allowed to kill an Idea respectfully, with a reason worth remembering. *This is the voice that helps you decide what to commit to.*

**During `start`** — silent during flow. Terse at breakpoints. Surfaces captures only at breakpoints. Hands you the ready-to-resume plan when you return. *This is the voice that protects your attention.*

**During `narrate`** — reflective but not evaluative. "What" questions, not "why" questions. Redemption-aware — willing to tell the honest story of a hard session without empty optimism. Informational, not praise-based. *This is the voice that helps you see what you did.*

**During `reflect`** — what moved, what's the Leveraged Priority, what's the outside-view estimate. Produces if-then plans for next week, not vague intentions. *This is the voice that helps you focus.*

**In the background** — the Reconciler. Quiet. Watches for stalled waiting-fors, aging Seeds, dormant Projects, stale Markers, Ideas piling up faster than they resolve. Surfaces what needs attention during Reflect, never mid-flow. *This is the voice that keeps the system honest.*

One voice. Six registers. The register matches what you're doing, so the system mode and your cognitive mode stay aligned.

---

## The Pipeline

```
  Pursuit ──► Project ──► Action

  Idea ─────────────────► (enters hierarchy via /promote)
   │
  Why? / DoD? / Concrete?
```

Ideas are adjacent to the work hierarchy, not part of the linear flow. They enter the hierarchy through `/promote`, which enforces graduation gates. Each gate draws from a different research tradition that fits its level:

- **Idea → Pursuit** is gated by articulating a **Why** (Sinek's Golden Circle as framing; Self-Determination Theory as motivation anchor). An Idea without a Why cannot become a Pursuit.
- **Idea → Project** is gated by a **Definition of Done** (GTD Natural Planning; Theory of Constraints throughput logic). An Idea without a DoD cannot become a Project.
- **Idea → Action** is gated by **concreteness** (GTD next-action test; Gollwitzer implementation intentions). If you can't visualize yourself doing it, it is not yet an Action.

Brainstorming scope matches the verb's context: top-level produces candidate Pursuits, Pursuit-level produces candidate Projects, Project-level produces candidate Actions. Brainstorming on an Action is rejected with a structural suggestion that the Action is probably a Project.

Promotion can be direct (`cadence promote <idea>`) when you already know where an Idea belongs, or can go through `develop` first — the default for strategic work.

---

## Core Concepts

### The Work Hierarchy

**Pursuit** → **Project** → **Action**, with **Ideas** as a first-class adjacent collection.

A **Pursuit** is something you've intentionally chosen to accomplish or maintain, anchored to your values and identity. Pursuits carry a Why. They are the things you'd mention in a performance review, share with neighbors, or write about in a year-in-review. They carry a verb and an outcome as a guideline: "Establish AI Test Framework at Nexthop," "Be a Present Father," "Sustain Operations at Nexthop."

Pursuits come in three flavors (same data model):

- *Finite* — has an end state and a timeframe
- *Ongoing* — maintains a standard, uses recurring projects
- *Someday* — aspirational, not yet active

**Pursuits are unlimited.** They can incubate without guilt. The Reconciler does not nag a Pursuit for not finishing — Pursuits carry the long-running nature of your commitments.

A **Project** is a scoped effort with a clear **Definition of Done**. It's the familiar GTD concept — anything requiring more than one action to complete. Projects live inside Pursuits and range from substantial to small. Every Project has an explicit DoD — a concrete statement of what "finished" looks like. When a DoD is met, that's a **milestone** — a moment of measurable progress worth noting in the Narrative.

**Projects are WIP-limited.** Three to five active in Development or Execution is the default ceiling. A Project that won't end is a structural signal — either it needs to be split, or it's actually a Pursuit. The Reconciler surfaces this without punishing.

The agent coaches Project scoping. It suggests verb + outcome names, flags Projects that are too vague, and proposes splits when a Project grows unwieldy.

An **Action** is the atomic unit of doing. Concrete, GTD-native, no implied sequence.

Actions have several possible states:

- *Active* — ready to be done by you
- *Waiting* — delegated to or dependent on someone else, with an expected resolution date and the person you're waiting on. The Reconciler watches these and flags items stalled beyond their expected date.
- *Done* — completed

An **Idea** is a captured seed, possibly developed, not yet promoted. See below.

### Ideas and Wandering

Ideas are a first-class section adjacent to the Pursuit/Project/Action stack. Every Idea has a parent. The default parent for unattached Ideas is **Wandering** — a standing Pursuit that never closes, whose purpose is to hold seeds that don't yet belong, so nothing is lost and everything gets decided eventually.

Top-level `brainstorm` creates Ideas attached to Wandering by default. Pursuit-level brainstorm attaches to that Pursuit. Ideas can move between parents.

**States:**

- **Seed** — raw, captured during brainstorm, associative, unevaluated
- **Developed** — has been through `develop`: PPCo notes, criteria, maybe a pre-mortem
- **Promoted** — advanced to Pursuit, Project, or Action (origin link persists)
- **Moved** — reattached to a different parent
- **Closed** — killed with a reason (what did this Idea teach us?)

**No WIP limit on Ideas.** The incubation research (Sio & Ormerod, 2009; Beaty et al.) is clear that sitting on seeds is productive. Visibility is high instead: the Reconciler surfaces Seeds aging without development, Developed Ideas sitting unpromoted, backlogs growing faster than resolving, and Wandering Ideas past their review dates.

### Closure as a Zeigarnik-Release Event

A Pursuit cannot close while it has unresolved Ideas. **Absolute block.**

`cadence close <pursuit>` invokes a **cleaning ritual** — a Gawande-style pause point that walks each unresolved Idea. For each, the choice is:

- **Move** — reattach to another Pursuit, or to Wandering
- **Close** — with a reason; what did this Idea teach? (redemption-aware; enters the Narrative as meaning-making material)
- **Promote** — if it still has life, advance it to Pursuit/Project/Action
- **Develop first** — if it's a raw Seed, run `develop` before deciding

Projects use **override-with-reason** closure rather than absolute block — friction-sensitive at their frequency. Cancellation walks the ritual regardless of type.

The closure ritual turns ending into meaning-making. A completed Pursuit's Narrative reads like: *"Generated 23 Ideas — 4 became Projects, 2 became their own Pursuits, 11 were closed with reasons (notably: rejected synthetic-traffic approach because capture-replay matched operational reality), 6 moved to Wandering for later."* That is the Pursuit's story, not a checkbox.

The mechanism is Masicampo–Baumeister (2011) at the organizational level: unfulfilled goals consume executive function until a plan releases them. Closure without a cleaning ritual leaves loops open; closure with the ritual releases them.

### The 2-Minute Rule

When a Thought is captured or an Action is identified that could be completed in under two minutes, Cadence surfaces it immediately with high priority rather than filing it into the Project structure. During the Reflect ritual, any remaining sub-two-minute items are called out first for rapid clearance. The goal: trivial items never accumulate into a drag on the system.

### Sessions and Markers

A **Session** is a focused work block. It is an internal primitive — the user invokes verbs (`start`, `brainstorm`, `develop`, `narrate`, `reflect`), and the Session wraps them underneath. Sessions have a beginning (recap from Marker), a middle (verb-specific activity, flow-protected during `start`), and an end (Marker written).

A **Marker** is the save point you leave behind. Every Marker has three fields:

- *Where* — what state is the work in?
- *Next* — what's the first thing to do when you return?
- *Open* — what's still running in your head about this?

The *Open* field is the Masicampo–Baumeister/Gollwitzer hook — writing down the open loop releases the Zeigarnik tension so you can leave without residue. The *Next* field is the Leroy "ready-to-resume" plan that measurably reduces attention residue on the next task.

Markers are wayfinding artifacts. They work at two scales: ending a work session you'll return to tomorrow, or setting aside a Pursuit you'll return to in weeks.

A **Recap** is the "previously on..." context restoration when re-entering a Session. Generated from the most recent Marker, leading with the *Next* field verbatim. Gets you to flow state fast.

### Thoughts and Capture

A **Thought** is raw input captured on the go — a voice note while walking, an idea in the shower, a task that occurs to you during dinner. Thoughts are undifferentiated at capture time. The system's AI triage routes them to the right place.

During `start` flow state, Thoughts are **flow-safe**: a single keystroke appends a typed Thought to the Parking Lot with no agent response. No prompt, no acknowledgment, no elaboration request. The Thought is reconciled at the next Breakpoint or during Reflect. This is essential — Gloria Mark's research shows self-interruption matches external-interruption in frequency; flow-safe capture addresses the internal half.

Thoughts are typed by the verb context in which they're captured: a Thought from `brainstorm` is a **seed**; from `develop`, a **concern** or **criterion**; from `start`, a **note** or **blocker**. The Reconciler respects type and never silently promotes a Seed to an Action without going through Development.

**Capture transparency** is a design principle. The user can always see where Thoughts were routed. Uncertain triage decisions are flagged for human review. During Reflect, the user reviews recent triage to maintain trust in the system. The goal is GTD's "capture everything" completeness combined with AI's ability to organize — but with the human always able to verify.

### Contexts (Derived, Not Manual)

Cadence does not require manual context tagging. Instead, it derives context from signals: a phone-captured Thought mentioning "pick up" implies @errands; an Action created during a Claude Code session is @computer; a person-tagged Action implies @meeting or @communication. Users who want explicit contexts can add them, but the system works without them.

### Rituals

**Reflect** is the weekly ritual (~30 minutes). It has two phases:

**Phase 1 — Get Clear (operational hygiene):**

- Process any unreviewed Thought triage decisions
- Review the Reconciler's flags: stalled waiting-fors, dormant Projects, stale Markers, aging Seeds, Wandering Ideas past review
- Clear sub-two-minute Actions immediately
- Confirm every active Project is still relevant

**Phase 2 — Get Focused (aspirational planning):**

- Recap: system-generated Narrative of what happened this week
- Learn: what worked, what didn't, patterns identified by AI
- Outside-view pass: what did Projects of this class actually take? (planning-fallacy correction)
- Triage: review WIP across all Pursuits, mark or close what's no longer serving you
- Commit: choose the ONE **Leveraged Priority** for next week

**Leveraged Priority cascades.** The Pursuit has one (the Project whose completion unlocks the rest). The week has one Leveraged Session (the block that advances the Pursuit's Leveraged Priority). This nests cleanly and pays rent on Theory of Constraints thinking — there is always exactly one binding constraint worth elevating.

Reflect prompts prefer "what" over "why" (Eurich/Trapnell: "why" triggers rumination; "what" generates observable data and next steps). "Why" is reserved for Pursuit creation, where it serves the Sinek purpose-articulation function.

The Reconciler pre-generates the inputs for both phases, so the Reflect ritual is a *review*, not a *construction* from scratch.

**Win cycles** are the 6-month planning horizon — set Pursuits at the start, mid-cycle check-in at 3 months, celebrate and reflect at the end.

### The Reconciler

The Reconciler is a background process that monitors the health of the system:

- **Stalled waiting-for items** — Actions assigned to others that have exceeded their expected date
- **Dormant Projects** — Projects with no Action in a configurable period; proposes mark, drop, or re-engage
- **Long-running Projects** — Projects whose actual elapsed time exceeds their outside-view estimate by a threshold; proposes split or re-scope to Pursuit
- **Aging Seeds** — Ideas captured but never developed, past a threshold
- **Unpromoted Developed Ideas** — Ideas that went through `develop` but never got moved into the pipeline
- **Growing backlog ratio** — Pursuits whose Idea generation outpaces resolution
- **Stale Markers** — Markers older than a configurable threshold; asks if still accurate
- **Structural suggestions** — proposes reorganization based on patterns; Pursuits accumulating too many Projects might need splitting; Projects with only one Action might not need to be Projects
- **Someday Pursuit check-ins** — periodically surfaces aspirational Pursuits for re-evaluation

The Reconciler is visible but quiet. `cadence reconcile` produces a report on demand without prompting; the loud version lives inside Reflect.

### Nudges as If-Then Plans

**Nudges** are gentle, batched notifications surfaced at breakpoints — never during flow. They are implementation intentions (Gollwitzer & Sheeran, 2006), not reminders. Instead of *"don't forget to work on Project X"*, a Nudge reads: *"When you open the orchestrator tomorrow, your first Session is Project X, starting with Action Y."* The tool constructs these from Markers and user-configured triggers; the user does not write them.

Categories:

- *Wellbeing* — water, stretch, breaks, movement
- *Awareness* — PRs submitted, team activity, new Thoughts to process
- *Quick wins* — small Actions (including two-minute items) batchable between deep sessions
- *WIP warning* — you're overextended; consider marking something
- *Reconciler flags* — stalled items, dormant Projects, stale Markers, aging Seeds
- *Oblique provocation* — when a Pursuit has stalled, a Nudge can be a card from the provocation deck ("Do the last thing first"), letting your own associative machinery do the work

### Narratives

**Narratives** are the written output of the system — generated, not manually authored. Narrative output follows the McAdams-compatible structure: *what happened / what it meant / what shifted / what's next*.

They serve multiple audiences at multiple time horizons:

- *Standup* — "What did I do yesterday?" — quick, shareable
- *Reflect* — weekly narrative for the ritual — personal, honest
- *Blog* — Pursuit-level or milestone-level story of progress and learning — quality writing, transparent, authentic
- *Review* — longer-horizon Narrative ("my first 90 days," "year in review") — performance-ready
- *Pursuit close* — the full arc of a completed Pursuit, including the Ideas that were promoted, moved, and closed-with-reason

Narratives mark growth, capture learning so it doesn't get lost, and provide transparency into who you are as a person and professional. They are views over activity data, not separate content to maintain.

### People

Actions can be tagged with people — both for delegation/waiting-for tracking and for relationship context. "Show me everything involving Sarah" returns Actions you're waiting on her for, Actions she's waiting on you for, and Projects where she's a stakeholder. This is essential for a tech lead managing a growing team.

---

## The Command Surface

```
cadence brainstorm                   # free-floating ideation → seeds on Wandering
cadence brainstorm <pursuit>         # ideation attached to a Pursuit → candidate Projects
cadence brainstorm <project>         # ideation on a Project → candidate Actions
cadence develop                      # convergent pass on Ideas ready for evaluation
cadence develop <idea>               # PPCo, criteria, pre-mortem on a specific Idea
cadence promote <idea>               # fast-track to Pursuit/Project/Action (enforces gate)
cadence start                        # curated selection; Leveraged Priority surfaced
cadence start <project>              # protected flow on that Project
cadence pause                        # save point with where/next/open
cadence complete                     # mark an action done; trigger upward completion
cadence complete <action>            # mark a specific action done
cadence cancel <project>             # drop a project with a reason
cadence narrate                      # today's activity, redemption-aware
cadence narrate <pursuit>            # full arc of the Pursuit
cadence narrate week                 # weekly reflection narrative
cadence reflect                      # full ritual: Get Clear + Get Focused
cadence reflect clear                # just Get Clear
cadence reflect focus                # just Get Focused
cadence capture "..."                # Parking Lot thought, no agent response (flow-safe)
cadence status                       # system dashboard — pursuits, WIP, flags
cadence status <pursuit|project>     # drill into a specific pursuit or project
cadence reconcile                    # quiet report of stale state
cadence close <pursuit|project>      # triggers the cleaning ritual
```

Inside Claude Code these are invoked as /cadence:<verb> via the Cadence plugin.

---

## Research Guardrails

### What the Voice Never Does

- **No streaks, no scores, no badges, no leaderboards.** Self-Determination Theory: explicit gamification of intrinsically motivated work degrades the motivation (Deci, Koestner & Ryan, 1999).
- **No "why did you fail?" prompts.** Trapnell & Campbell (1999); Eurich (2017): "why" triggers rumination, "what" generates observable data.
- **No evaluative praise.** Informational feedback enhances intrinsic motivation; praise undermines it. Feedback is specific and descriptive ("you unblocked the worktree issue you identified Tuesday; the Pursuit is one Project from completion"), never evaluative.
- **No mid-flow interruptions.** Leroy attention residue; Monsell switch costs. All non-flow work lives at Breakpoints.
- **No LLM-generated Ideas during `brainstorm`.** Doshi & Hauser (2024); Anderson, Shah & Kreminski (2024): LLMs raise the floor of individual creativity but compress its variance — the "mode collapse" effect. The agent provokes; the user generates.

### What the Voice Measures

- **Progress.** Projects advanced, Pursuits closed, Ideas resolved. Amabile & Kramer (2011): visible forward motion in meaningful work is the strongest positive predictor of inner work life.
- **Drift.** Estimates vs. actuals, aging Seeds, stalled waiting-fors. Planning-fallacy correction via reference classes (Flyvbjerg et al., 2009).
- **Cleanliness.** Unresolved Ideas on open Pursuits, stale Markers, dormant Projects. Zeigarnik load at the system level.

---

## What Cadence Is Not

- **Not a calendar.** Cadence doesn't manage your time — it manages your attention and context.
- **Not a velocity tracker.** No story points, no burndown charts. Progress is narrative, not numeric.
- **Not a gamified app.** No XP, no streaks, no achievements. The reward is the work itself and the story it tells.
- **Not a therapy bot.** Cadence is a skilled companion, not a counselor. It has the wisdom to remind you to drink water, not to diagnose your feelings.
- **Not a standalone app.** Cadence lives inside agentic tools you already use. It meets you in your terminal, not in a new browser tab.
- **Not an idea generator.** Cadence provokes your divergent thinking with curated prompts. It does not generate Ideas for you.

---

## Who Is This For?

Cadence is for people who:

- Juggle multiple high-stakes Pursuits across work, family, and personal growth
- Value depth and flow state over shallow multitasking
- Want their productivity system to understand code, PRs, and technical work — not just generic tasks
- Believe writing about their work is how they learn and grow
- Need a system that takes divergent ideation as seriously as convergent execution
- Are tired of maintaining their productivity system and want it to maintain itself
- Trust AI as a capable partner but want to stay in control of what matters

**Cadence also works on the bad days.** When you're overwhelmed, when your kid is sick and there's a production outage and you forgot to renew your car registration — the Get Clear phase of Reflect, the Reconciler, the 2-minute rule, and the flow-safe Parking Lot ensure nothing falls through the cracks. The system is your safety net, not just your inspiration.

---

## Technical Philosophy

- **Local-first.** Your data lives on your machines. SQLite for structure, markdown for readability. Sync to your own infrastructure if you want it.
- **CLI-native.** Cadence lives in the terminal, inside agentic coding tools. No web dashboard required (initially). The interface is conversation.
- **One voice, verb-defined contracts.** The user sees one agent, Cadence, whose register is set by the active verb. The implementation may internally separate concerns for testability and scaling, but the user-facing surface is a single voice.
- **TypeScript for integration, Python for intelligence.** TypeScript for Claude Code integrations and MCP servers. Python for RAG, data processing, and AI pipelines.
- **Three-tier isolation.** Sandbox (learning, experimentation), production (real data, read access to privileged systems), and work (employer-scoped). Configured per-repo with environment profiles.
- **Coding projects can be automated.** Delegate an entire coding Project to autonomous execution. Life and personal Projects stay human-driven. Cadence suggests; you decide.
- **Transparent AI.** Every AI decision (triage routing, narrative generation, structural suggestion) is reviewable and correctable. The system degrades gracefully when AI confidence is low, surfacing uncertain decisions for human judgment.
- **Oblique provocation deck, not free generation.** The `brainstorm` verb draws from a curated deck of tangential prompts (SCAMPER, "how might we…", forced analogies, Eno-style obliques). The user can extend the deck. LLM-as-generator is deliberately absent from the divergent phase.
- **Outside-view estimation is structural.** At Action creation: "what's the closest past Action and how long did it actually take?" Actuals are stored and surfaced during Reflect.
- **Open-source aspirations.** Built as a personal tool first, architected for sharing. Clean separation between the Cadence framework (what anyone could use) and your Cadence instance (your specific Pursuits, goals, and integrations).

---

## Future Work

- **Typed Idea-to-Idea links** (variant-of, refines, contrasts-with, requires, supersedes, duplicate-of) for cluster-aware `develop` passes, promotion-aware closure ("the alternative you didn't take"), and richer Narrative material. Ideas duplicate across Pursuits rather than sharing attachment; links are breadcrumbs, not bindings.
- **Idea clustering** in `develop` — evaluate design spaces rather than disconnected seeds once links exist.
- **Spaced-recap tuning** — Cepeda ISI scaling on "previously on…" for dormant Pursuits; occasional Roediger–Karpicke active recall ("what do you remember about where this left off?") before the Marker is shown.
- **WOOP prompts** during Reflect — Wish, Outcome, Obstacle, Plan — to generate Nudges for anticipated obstacles.
- **Shared Pursuits** — collaborative variants for team Leveraged Priority alignment.
- **Voice-capture mobile companion** — a lightweight capture surface for Thoughts when away from the terminal.

---

## The Tagline

**Cadence** — *The rhythm you return to.*

A cognitive operating system that holds your context, protects your flow, separates the modes of thought, and tells the story of what you're building.
