# Cadence — One Pager (v3)

*The rhythm you return to.*

---

**What it is:** A cognitive operating system that lives inside your terminal. A single AI voice, activity-driven, that helps you diverge into ideas, converge on commitments, protect flow state during execution, and generate the narrative of what you're building across work, family, and personal growth.

**What it replaces:** OmniFocus, scattered task lists, blank-page brainstorming, the mental overhead of remembering where you left off — and the gap between "I have a vague sense something needs attention" and "I have a Project with a clear next action."

**The core pipeline:**

```
  Idea ──► Pursuit ──► Project ──► Action
   │         │           │            │
  Why?      DoD?     Concrete?     Do it.
```

Three graduation gates. Each draws from a different research tradition that fits its level: **Why** at the Pursuit gate (Sinek, Self-Determination Theory), **Definition of Done** at the Project gate (GTD Natural Planning, Theory of Constraints throughput), **Concreteness** at the Action gate (GTD next-action test, Gollwitzer implementation intentions).

**The hierarchy:**

| Level | What it is | Limit | Example |
|-------|-----------|-------|---------|
| **Pursuit** | An intentional commitment tied to your values; has a Why | No limit | "Establish AI Test Framework at Nexthop" |
| **Project** | A scoped effort with a Definition of Done | WIP-limited (3–5 active in Development or Execution) | "Stand up the golden-path test harness" |
| **Action** | The atomic thing you do | Bounded by Project WIP | "Configure GitHub Actions workflow" |
| **Idea** | A captured seed, possibly developed, not yet promoted | Unlimited; visibility high | "Record real traffic from staging and replay" |

Pursuits can be finite, ongoing, or someday. Long-running threads are Pursuits, not Projects — Projects must end. A Project that won't close is a structural signal it's either a Pursuit or needs to be split; the Reconciler flags this without punishing.

**The verbs:**

```
cadence brainstorm                   # free-floating ideation → seeds on Wandering
cadence brainstorm <pursuit>         # ideation attached to a Pursuit → candidate Projects
cadence brainstorm <project>         # ideation on a Project → candidate Actions
cadence develop                      # convergent pass on Ideas ready for evaluation
cadence develop <idea>               # PPCo, criteria, pre-mortem on a specific Idea
cadence promote <idea>               # fast-track to Pursuit/Project/Action (enforces the graduation gate)
cadence do                           # curated selection; Leveraged Priority surfaced
cadence do <project>                 # protected flow on that Project
cadence narrate                      # today's activity as redemption-aware narrative
cadence narrate <pursuit>            # full arc of the Pursuit
cadence narrate week                 # weekly reflection narrative
cadence reflect                      # full ritual: Get Clear + Get Focused
cadence reflect clear                # inbox to zero; process captures
cadence reflect focus                # leveraged priority; outside-view estimation check
cadence capture "..."                # Parking Lot thought, no agent response (flow-safe)
cadence mark "..."                   # save point with ready-to-resume fields
cadence reconcile                    # quiet report of stale state
cadence close <pursuit|project>      # triggers the cleaning ritual
```

Session is an internal primitive — the unit that ties verb → Markers → Thoughts → Narrative. The user invokes verbs; Sessions happen underneath.

**One voice, verb-defined contracts:**

The agent is a single voice; the verb determines its register.

- **brainstorm** — non-judgmental, quantity-seeking, deals provocation cards from an Oblique/SCAMPER deck, refuses evaluation, pushes through the creative cliff ("you're at 12 — the original ones usually come after 15")
- **develop** — structured-critical, runs PPCo (Praise, Potentials, Concerns, Overcome), criteria matrices, pre-mortems; allowed to kill an Idea respectfully
- **do** — silent during flow, terse at Breakpoints, only surfaces Thoughts on explicit ask
- **narrate** — "what" questions not "why"; redemption-aware; informational, not evaluative
- **reflect** — what moved, what's the Leveraged Priority, Gollwitzer if-then plans

**The core loop:**

```
  Enter session → Recap ("previously on...") → Flow state (silent, protected)
       → Breakpoint (nudges, quick wins, wellbeing) → Mark (save point)
       → Exit or switch → Next session picks up from the ready-to-resume plan
```

**The Ideas lifecycle:**

Ideas are a first-class collection adjacent to the Pursuit/Project/Action stack. Every Idea has a parent; the default parent for unattached Ideas is **Wandering** — a standing Pursuit that never closes, whose purpose is to hold seeds that don't yet belong, so nothing is lost and everything gets decided eventually.

States: **Seed** (raw, captured) → **Developed** (has been through `develop`) → one of **Promoted** (advanced to Pursuit/Project/Action), **Moved** (reattached), or **Closed** (killed with a reason — what did we learn?).

No WIP limit on Ideas — the incubation research is clear that sitting on seeds is productive. Visibility is high instead: the Reconciler surfaces Seeds aging without development, Developed Ideas unpromoted, backlogs growing faster than resolving, and Wandering Ideas past their review dates.

Brainstorming scope matches the verb's context: top-level produces candidate Pursuits, Pursuit-level produces candidate Projects, Project-level produces candidate Actions. Brainstorming on an Action is rejected with a suggestion that the Action is probably a Project.

**Closure as a Zeigarnik-release event:**

A Pursuit cannot close while it has unresolved Ideas. **Absolute block.** `cadence close <pursuit>` invokes a **cleaning ritual** — a Gawande-style pause point that walks each unresolved Idea. For each, the choice is: **Move** (reattach to another Pursuit or to Wandering), **Close** (with a reason — what did this Idea teach?), **Promote** (if it still has life), or **Develop first** (if it's a raw Seed, run `develop` before deciding).

Projects use **override-with-reason** closure rather than absolute block — friction-sensitive at their frequency. Cancellation walks the ritual regardless of type.

The closure ritual turns ending into meaning-making. The completed Pursuit's Narrative reads like: *"Generated 23 Ideas — 4 became Projects, 2 became their own Pursuits, 11 were closed with reasons (notably: rejected synthetic-traffic approach because capture-replay matched operational reality), 6 moved to Wandering for later."* That's the Pursuit's story, not a checkbox.

**The weekly ritual — Reflect (~30 min):**

*Get Clear:* Process the Parking Lot, clear 2-minute items, review Reconciler flags (stalled waiting-fors, dormant Projects, stale Markers, aging Seeds, Wandering Ideas past review), confirm active Projects are still relevant.

*Get Focused:* Recap (narrative-generated) → Learn what worked → Outside-view pass on estimates (what did Projects of this class actually take?) → Commit to ONE Leveraged Priority.

Leveraged Priority cascades: the Pursuit has one (the Project whose completion unlocks the rest); the week has one Leveraged Session (the block that advances the Pursuit's Leveraged Priority).

Anchored to 6-month win cycles with a mid-cycle check-in.

**Key behaviors:**

- **Curated `do` selection** — prioritized suggestions with Leveraged Priority highlighted; agent suggests, user decides (autonomy-supportive)
- **Flow-safe capture** — single keystroke appends Thoughts to the Parking Lot during `do` with no agent response (half the attention-fragmentation problem is self-interruption; Cadence handles both halves)
- **Ready-to-resume Markers** — every Marker has three fields: *where*, *next*, *open*; the "open" field is the plan-making hook that releases Zeigarnik tension on context switch
- **The 2-minute rule** — trivial Actions surfaced immediately; cleared first during Reflect
- **Outside-view estimation** — at Action creation: "what's the closest past Action and how long did it actually take?"; stored actuals surface drift during Reflect
- **WIP management by mode** — strict limits on Projects in Development/Execution; no limits on Pursuits or Ideas (incubation is productive)
- **Waiting-for with Reconciler** — track delegated Actions by person and expected date; Reconciler flags stalled items, dormant Projects, stale Markers, aging Seeds
- **Oblique provocation deck** — curated prompts (SCAMPER, "how might we…", forced analogies, Eno-style obliques) drive `brainstorm` — the LLM is NOT used for free divergent generation (it homogenizes output; 2024–2025 research is clear on this)
- **Narratives** — standup summaries, weekly reflections, Pursuit stories, 90-day reviews — generated from real activity data; what happened / what it meant / what shifted / what's next
- **Nudges as if-then plans** — not reminders: "when you open the orchestrator tomorrow, your first Session is [Project X], starting with [Action Y]" (Gollwitzer implementation intentions)
- **Derived contexts** — inferred from signals (phone capture → @errands, Claude Code → @computer); no manual tagging required
- **Project automation** — delegate coding Projects to autonomous execution; life Projects stay human-driven
- **Structural coaching** — AI suggests Pursuit/Project names (verb + outcome), flags vague scoping, proposes reorganization, pushes back on re-scoping at promotion ("this looks like a Project — you're sure it warrants its own Pursuit?")

**People as a first-class concept:** Actions tagged with people for delegation, waiting-for, and relationship context. "Show me everything involving Sarah" is a natural query.

**What the voice never does:**

- No streaks. No scoring. No badges. No leaderboards. (Self-Determination Theory: explicit gamification of intrinsically motivated work degrades the motivation.)
- No "why did you fail?" prompts in reflection. (Eurich/Trapnell: "why" triggers rumination; "what" generates observable data and next steps.)
- No praise. Feedback is informational and specific, not evaluative. (Deci–Koestner–Ryan: positive informational feedback enhances intrinsic motivation; evaluative praise undermines it.)
- No mid-flow interruptions. Nudges, Reconciler prompts, and wellbeing checks live at Breakpoints — never during flow. (Leroy attention residue; Monsell switch costs.)
- No LLM-generated Ideas during `brainstorm`. The agent provokes; the user generates.

**What the voice measures:**

- **Progress.** Projects advanced, Pursuits closed, Ideas resolved. (Amabile's Progress Principle: visible forward motion in meaningful work is the strongest positive predictor of inner work life.)
- **Drift.** Estimates vs. actuals, aging Seeds, stalled waiting-fors. (Planning fallacy correction via reference classes.)
- **Cleanliness.** Unresolved Ideas on open Pursuits, stale Markers, dormant Projects. (Zeigarnik load at the system level.)

**Technical stack:**

- **Local-first** — SQLite + markdown on your machines
- **CLI-native** — lives inside Claude Code or similar agentic tools
- **TypeScript** for integrations and MCP servers, **Python** for RAG and AI pipelines
- **Three-tier isolation** — sandbox / production / work environments per-repo
- **Transparent AI** — every triage, narrative, and suggestion is reviewable and correctable
- **M4 Max** (compute) + **Synology NAS** (services) + **GitHub Actions** (CI/CD)

**Works on bad days too.** When you're overwhelmed, Get Clear, the Reconciler, the 2-minute rule, and the flow-safe Parking Lot capture ensure nothing falls through the cracks. The system is the safety net, not just the inspiration.

**Who it's for:** Technical leaders juggling high-stakes work, a growing team, family, personal projects, and career transitions — people who are productive but disoriented, who finish weeks unable to articulate what moved forward.

**First proving ground:** Onboarding as Tech Lead at an AI networking startup. Build the system before day one, use it to track the first 90 days, generate the blog from real Narrative data, and demonstrate AI-augmented engineering leadership in practice.

---

## Future work

- **Typed Idea-to-Idea links** (variant-of, refines, contrasts-with, requires, supersedes, duplicate-of) for cluster-aware develop passes, promotion-aware closure ("the alternative you didn't take"), and richer Narrative material. Ideas duplicate across Pursuits rather than sharing attachment; links are breadcrumbs, not bindings.
- **Idea clustering** in `develop` — evaluate design spaces rather than disconnected seeds once links exist.
- **Spaced-recap tuning** — Cepeda ISI scaling on "previously on…" for dormant Pursuits; occasional Roediger–Karpicke active recall ("what do you remember about where this left off?") before the Marker is shown.
- **WOOP prompts** during Reflect — Wish, Outcome, Obstacle, Plan — to generate Nudges for anticipated obstacles.
- **Shared Pursuits** — collaborative variants for team Leveraged Priority alignment.

---

*Cadence — one voice, one rhythm, one system that holds the whole story.*
