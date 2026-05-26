# Cadence — Vision

*The rhythm you return to.*

A cognitive operating system that holds your context, protects your flow, separates the modes of thought, and tells the story of what you're building — across work, family, and personal growth.

---

## TL;DR

Cadence is a cognitive operating system for people who get a lot done but struggle to see the story of what they're building. It helps you diverge into ideas, converge on commitments, protect flow state during execution, and generate the narrative of what you're shipping across many threads of life and work.

It runs inside agentic coding tools like Claude Code, meeting you where you already work. One app. One voice. One rhythm.

**Core pipeline:**

```
  Pursuit ──► Project ──► Action
     │           │            │
  Why?       Intent?     Concrete?
```

Divergent exploration happens in **brainstorm workspaces** that run a phase machine — `diverging → converging → crystallized | archived`. A crystallized brainstorm materializes into a Pursuit or Project; an archived brainstorm preserves the exploration as a decided-but-shelved artifact. Raw seeds and unsorted material live in the **Inbox** — a *view*, not a directory, that unions untriaged captures with brainstorms still in `diverging`.

**The user-facing surface is 12 verbs**, grouped by cognitive mode:

| Mode | Verbs |
|---|---|
| **Diverge** — find what to build | `brainstorm` (owns the phase machine; `--crystallize` materializes a Pursuit/Project) |
| **Execute** — do the work | `start`, `complete`, `resolve`, `waiting`, `capture` |
| **Reflect** — see meaning, check state | `reflect`, `narrate` |
| **Setup** — one-off | `init` |
| **Browse** — navigation | `status`, `find`, `help` |

The reconciler runs as system behavior (SessionStart hook + during `/reflect` Get Clear), not a verb. The earlier `develop` and `promote` verbs are retired — their work folds into brainstorm-workspace mechanics, which match the user's mental model better than three separate verbs ever did.

**One voice, verb-defined contracts.** The agent is a single voice; the verb determines its register. During `brainstorm` it's non-judgmental and quantity-seeking. During `start` it's silent and protects flow. During `narrate` it's reflective without being evaluative. During `reflect` it's structured and forward-looking. The register matches your cognitive mode so the system stays out of your way.

**Local-first.** Markdown files in your repo are the source of truth. Plugin installs into any repo via `claude --plugin-dir`; each repo with `cadence.yaml` is a self-contained Cadence instance.

---

## The Problem

Modern knowledge workers — especially technical leaders who span coding, architecture, coordination, family, and personal growth — face a specific kind of overwhelm.

**They're productive but disoriented.** They finish weeks feeling like they worked hard but can't articulate what moved forward. They context-switch between pursuits constantly and lose the thread. Their task manager is a graveyard of half-finished projects. Their goals exist in one system, their code in another, their ideas in a third, and none of them talk to each other.

**And the systems they use conflate two very different cognitive modes.** Divergent ideation — generating possibilities — is neurologically and psychologically distinct from convergent capture-and-execute. Mixing them degrades both. Yet task managers treat Ideas and Actions as the same kind of thing, and productivity frameworks largely begin downstream of the creative work that should have produced the Pursuits in the first place.

Existing tools solve pieces:

- **OmniFocus / Things / Todoist** — capture and organize tasks, but don't connect them to identity, values, or narrative. No flow protection. No AI. No divergent phase.
- **Notion / Obsidian** — flexible knowledge bases, but require constant manual curation. Blank canvases, not active partners.
- **Jira / Linear / GitHub Issues** — track code-level work, but can't hold "be a present father" or "keep the kitchen appliances in good condition" alongside "stand up the CI pipeline."
- **Journaling apps** — capture reflection, but don't connect it to what you're doing.

None of them play the role of a skilled companion who holds your whole context and helps you navigate it from the first Idea through to the story of its completion.

---

## What Cadence Is Not

- **Not a calendar.** Cadence doesn't manage your time — it manages your attention and context.
- **Not a velocity tracker.** No story points, no burndown charts. Progress is narrative, not numeric.
- **Not a gamified app.** No XP, no streaks, no achievements. The reward is the work itself and the story it tells.
- **Not a therapy bot.** Cadence is a skilled companion, not a counselor.
- **Not a standalone app.** Cadence lives inside agentic tools you already use. It meets you in your terminal.
- **Not an idea generator.** Cadence provokes your divergent thinking with curated prompts. It does not generate Ideas for you.

---

## The Vision: One Voice, Verb-Defined Registers

Cadence is one voice whose register is set by the activity. You invoke verbs; the voice adapts.

**During `brainstorm`** — non-judgmental and quantity-seeking in the `diverging` phase; structured-critical in the `converging` phase. Deals provocation cards from a curated Oblique/SCAMPER deck during divergent work, refuses to evaluate mid-stream, pushes through the creative cliff. When the user signals "I have candidate solutions," the workspace shifts to `converging` and the voice runs PPCo (Praise, Potentials, Concerns, Overcome), criteria matrices, pre-mortems across candidates. `--crystallize` materializes the chosen solution as a Pursuit or Project, lifting the workspace's notes into Intent + initial Actions. *This is the voice that helps you find what the Pursuit is — and then helps you decide what to commit to.*

**During `start`** — silent during flow. Terse at breakpoints. Surfaces captures only at breakpoints. Hands you the ready-to-resume plan when you return. *This is the voice that protects your attention.*

**During `narrate`** — reflective but not evaluative. McAdams structure: what happened / what it meant / what shifted / what's next. "What" questions, not "why" questions. Redemption-aware — willing to tell the honest story of a hard week without empty optimism. Informational, not praise-based. *This is the voice that helps you see what you did.*

**During `reflect`** — what moved, what's the Leveraged Priority, what's the outside-view estimate. Phase 1 (Get Clear) processes captures, surfaces reconciler flags, confirms project relevance. Phase 2 (Get Focused) is interactive: open questions first, follow-ups to deepen, agent observations only after the user has answered, and the canonical Leveraged Priority question asked verbatim ("What is the one thing you will do that will make you feel like you won the week?"). *This is the voice that helps you focus.*

**In the background** — the Reconciler. Quiet. Watches for stalled waiting-fors, dormant Projects, Inbox pressure (untriaged material above the soft threshold), near-completion pursuits, and structural inconsistencies (active projects with no open actions). Surfaces what needs attention at SessionStart and during Reflect, never mid-flow.

One voice. Five registers (the verbs that change tone) plus the silent reconciler. The register matches what you're doing.

---

## Core Concepts

### The Work Hierarchy

**Pursuit** → **Project** → **Action**.

A **Pursuit** is something you've intentionally chosen to accomplish or maintain, anchored to your values and identity. Pursuits carry a Why. They are the things you'd mention in a performance review, share with neighbors, or write about in a year-in-review. They carry a verb and an outcome as a guideline: "Improve UX and Vision," "Be a Present Father," "Sustain Operations at Nexthop." Pursuits come in three flavors (same data model): *finite* (has an end state), *ongoing* (maintains a standard), *someday* (aspirational, not yet active).

**Pursuits are unlimited.** They can incubate without guilt. The Reconciler does not nag a Pursuit for not finishing — Pursuits carry the long-running nature of your commitments.

A **Project** is a scoped effort framed by an **Intent** narrative. It's the familiar GTD concept — anything requiring more than one Action. The Intent absorbs both the motivation/scope and the felt-sense of what "finished" would look like — co-edited with the agent as actions land and the picture sharpens. When the Intent feels achieved and the actions have shipped, that's a milestone worth noting in the Narrative.

**Projects are WIP-limited.** Three to five active in execution is the default ceiling. A Project that won't end is a structural signal — either it needs to be split, or it's actually a Pursuit. The Reconciler surfaces this without punishing.

An **Action** is the atomic unit of doing. Concrete, GTD-native. Actions can be tagged as *Active* (ready to be done by you), *Waiting* (delegated to or dependent on someone else, with an expected resolution date — Reconciler watches these), or *Done*.

### Brainstorm Workspaces

A brainstorm is a first-class workspace at `brainstorms/<slug>/`. It carries `meta.yaml: phase: diverging | converging | crystallized | archived`, a workspace file for divergent notes, `solutions/<name>.md` files for each candidate as the workspace converges, and `decision.md` written on crystallize. The phase machine reflects the cognitive mode:

- **`diverging`** — non-judgmental ideation; provocation cards from the deck; quantity over quality; no killing.
- **`converging`** — candidates are surfaced as solutions, run through PPCo, criteria, pre-mortems.
- **`crystallized`** — `--crystallize` materialized the chosen solution into a Pursuit or Project. The workspace is preserved as the lineage record (what was considered, why this won, what got let go).
- **`archived`** — the exploration is complete but didn't produce a commitment. Preserved as a learning artifact.

**Why workspaces rather than free-floating Ideas?** The earlier model treated each idea as a separate entity with its own lifecycle (Seed → Developed → Promoted). In practice users think in *clusters* — "I'm exploring how to do X, and here are the four shapes that came out of that exploration." Workspaces match that mental model; they hold the cluster's notes, candidates, and decision together, and they survive as a coherent artifact when crystallized.

### Inbox

The **Inbox** is a *view*, not a directory or pursuit. It unions two surfaces: untriaged captures in `thoughts/unprocessed/` and brainstorms still in the `diverging` phase. One number — "Inbox: 4 items" — across the SessionStart hook, the `/status` dashboard, the capture exit menu, and the `/reflect` Get Clear walk.

**A growing Inbox is a triage debt signal, not an organizational layer.** The Reconciler surfaces an `inbox_pressure` flag once the count exceeds a soft threshold (default 10), with a forward-pointing suggestion. The signal is descriptive ("above soft cap"), never scolding. Triage means moving material *out* of the Inbox — onto a Pursuit as an action, into a Project, crystallizing a brainstorm, or closing with a reason. The Inbox is meant to shrink toward empty, not to be browsed.

### Closure as a Zeigarnik-Release Event

A Pursuit cannot close while it has unresolved exploration. **Absolute block.** "Unresolved" means open projects (status `active` or `on_hold`) or active brainstorms (`diverging` or `converging`). Each open item is a cognitive loop the user is still rehearsing; closing the pursuit while leaving them open is what the ritual exists to prevent.

`/resolve <pursuit>` walks the cleaning ritual. For each open brainstorm: crystallize (it earned a Pursuit/Project), archive (decided not to pursue — what was learned?), or move (reattach to another pursuit if it belongs there). For each open project: resolve as complete or drop with a reason. Projects themselves use **override-with-reason** closure — friction-sensitive at their frequency.

The closure ritual turns ending into meaning-making. A completed Pursuit's narrative reads like: *"Ran three brainstorms — `capture-redesign` crystallized into the v1.1 ingestion surface, `inbox-as-pursuit` archived once we saw Inbox should be a view, `outcome-menu-shapes` crystallized into the post-capture menu. Five projects shipped; one was dropped with the reason that the SQLite index wasn't yet load-bearing."* That is the Pursuit's story.

### The 2-Minute Rule

When a thought is captured or an action is identified that could be completed in under two minutes, Cadence surfaces it immediately rather than filing it. During the Reflect ritual, any remaining sub-two-minute items are called out first for rapid clearance. The goal: trivial items never accumulate into a drag on the system.

### Captures (Flow-Safe Audit Trail)

A **capture** is raw input saved on the go. Inline `/capture "..."` is silent: a single keystroke appends a typed thought to `thoughts/unprocessed/` with no agent response, no acknowledgment, no elaboration request. Half the attention-fragmentation problem is self-interruption; flow-safe capture addresses that half.

v1.1 expanded capture into a five-path ingestion surface — inline text, stdin (`--`), local file or URL (`--from <path|url>`), named MCP query (`--source <name>`), and long-form brain dump (`--dump` opens `$EDITOR`). Every non-inline path dispatches a **capture-ingest subagent** for context isolation: the raw payload lands at `thoughts/_raw/<id>.raw.md` and never bloats the main conversation; the agent distills per the `--prompt` into `thoughts/<id>.md`; and it returns suggested outcomes per item — `two_minute_action`, `action`, `project`, `brainstorm_seed`, or `note`. The capture SKILL surfaces a small outcome menu after distillation. The user can route any item out into a real outcome immediately, or leave it in the Inbox.

**Capture is the audit trail; the outcome menu lets material exit the Inbox immediately when the user has clarity.** Inline silent capture's contract is unchanged — flow safety beats everything.

### Pending Validations

Behaviors that need fresh-session verification (from a project's user-story perspective) live in `validations/pending.md` — added via `cadence pending-validation-add`, surfaced by the SessionStart hook on every fresh session until cleared. Project completion is decoupled from this validation queue, so projects close cleanly when functional work is done; the validation check happens whenever the user is in a fresh session.

### Rituals

**Reflect** is the weekly ritual (~30 minutes). Two phases:

**Phase 1 — Get Clear (operational hygiene):**
- Process unprocessed captures
- Review the Reconciler's flags: stalled waiting-fors, dormant Projects, aging Seeds, near-completion pursuits
- Clear sub-two-minute Actions immediately
- Confirm every active Project is still relevant

**Phase 2 — Get Focused (aspirational planning):**
- Recap: narrative-generated summary of what happened this week
- Interactive: "What worked well?" and "What didn't work?" — open questions first, follow-up cycle, agent observations only after the user has answered
- WIP check across active Projects
- Waiting-for review
- If-then Nudge generation
- Commit to ONE **Leveraged Priority** for next week — the canonical question: "What is the one thing you will do that will make you feel like you won the week?"

**Leveraged Priority cascades.** The Pursuit has one (the Project whose completion unlocks the rest). The week has one (the block that advances the Pursuit's Leveraged Priority).

Reflect prompts prefer "what" over "why" — "why" triggers rumination; "what" generates observable data and next steps. "Why" is reserved for Pursuit creation, where it serves the purpose-articulation function.

### The Reconciler

The Reconciler is a system behavior (not a verb) that monitors the health of the system:

- **Stalled waiting-for items** — past their expected date by the grace window
- **Dormant Projects** — no activity in a configurable period
- **Inbox pressure** — untriaged Inbox count exceeds the soft threshold (default 10); the flag carries the bucket breakdown (overdue/aged/fresh)
- **Pursuit near-completion** — only 1–2 projects left; time to think about closure
- **Structural** — projects with all actions checked but status still active (does the Intent feel achieved?)
- **Inbound issues** — open upstream issues piling up against the Cadence repo (maintainer-mode surface)

The Reconciler runs at SessionStart and during `/reflect` Get Clear. The CLI subcommand `cadence flags` is available for power users who want to query on demand.

### Tip Library and Teaching Surfaces

Cadence ships a curated tip library (`cadence-plugin/tips/library.yaml`) with three content types: **quotes** (brain-tickler material from Allen, Newport, Doerr, Brooks, Karpathy, Willison, etc.), **skill-teaching** tooltips ("Running `/cadence:resolve` — this marks projects done. Next time, type `/resolve <project>` directly."), and **verb-hints** (contextual next-step suggestions). At natural breakpoints — verb completion, ritual phase, long-agent-run wait — the agent surfaces a tip whose triggers overlap the active context, frequency-capped per tip. Tone target: smart-colleague-marginalia, never motivational-poster, never sappy.

### Narratives

Generated writing from activity data. McAdams-compatible structure: *what happened / what it meant / what shifted / what's next*. Each narrative is a watermarked view over committed project-file changes — the file IS the read pointer for the next run.

Narratives serve multiple time horizons: **standup** ("what did I do yesterday?"), **reflect** (weekly), **pursuit-arc** (the full story of a completed Pursuit), **closure** (the meaning-making ritual narrative). Daily narratives use a standup three-beat (since-last-time / for-next-time / blockers); weekly narratives anchor on the Leveraged Priority; monthly/annual/pursuit fall through to McAdams structure.

Narratives mark growth, capture learning so it doesn't get lost, and provide transparency into who you are as a person and professional. They are views over activity data, not separate content to maintain.

### People

Actions can be tagged with people — both for delegation/waiting-for tracking and for relationship context. "Show me everything involving Sarah" returns Actions you're waiting on her for, Actions she's waiting on you for, and Projects where she's a stakeholder.

---

## Domain Neutrality

Cadence is a cognitive operating system, not a dev tool. Most users work on non-dev repos: household projects, creative practice, fitness arcs, family logistics, writing, study. Every verb, vocabulary choice, and example stays domain-agnostic — verbs favor universal language ("validate" not "test", "ship" or "finish" not "deploy", "wrap up" not "merge"); examples rotate domains; heuristics adapt by detected domain. Pursuits hold "be a present father" alongside "stand up CI" because the system was designed for both.

---

## The Command Surface

```
cadence brainstorm <topic>           # open or resume a workspace at brainstorms/<slug>/
cadence brainstorm                   # list active brainstorms, offer to open one
cadence brainstorm --crystallize     # in converging: materialize selected solution as Pursuit/Project
cadence brainstorm --archive         # close out (decided not to pursue — preserves the artifact)
cadence start                        # curated selection; Leveraged Priority surfaced
cadence start <project>              # protected flow on that Project
cadence complete <action>            # mark an action done; trigger upward completion prompt
cadence resolve <project>            # wrap up a project (--state complete | dropped)
cadence resolve <pursuit>            # walk the closure ritual (absolute block on unresolved work)
cadence waiting <project>            # record an external blocker
cadence capture "..."                # silent inline capture
cadence capture --from <path|url>    # ingest a doc; dispatches capture-ingest subagent
cadence capture --source <name>      # named MCP-driven pull (resolved from ingest_sources)
cadence capture --dump               # long-form brain dump in $EDITOR
cadence reflect                      # full ritual: Get Clear + Get Focused
cadence narrate                      # today's activity (cadence: daily)
cadence narrate week                 # this ISO week
cadence narrate <pursuit>            # full arc of the Pursuit
cadence status                       # system dashboard or drill into a pursuit/project
cadence find <query>                 # search across projects, brainstorms, captures, pursuits
cadence help                         # render the verb catalogue
cadence init                         # bootstrap a new repo
```

Inside Claude Code these are invoked as `/cadence:<verb>` via the Cadence plugin.

Hidden verbs (not on the visible 12-verb surface; explicit-invocation only): `/report` files an issue against the upstream Cadence repo, `/incoming` runs maintainer-side triage of inbound issues, `/mcp-pull` is the bulk-ingest path for pulling many MCP resources at once. The reconciler runs as system behavior. The CLI also exposes power-user subcommands (`cadence flags`, `cadence project-activity`, `cadence pending-validation-*`, `cadence tip-*`, `cadence stop-hook`, etc.) for direct use outside the slimmed verb surface.

---

## Research Guardrails

### What the Voice Never Does

- **No streaks, no scores, no badges, no leaderboards.** Self-Determination Theory: explicit gamification of intrinsically motivated work degrades motivation.
- **No "why did you fail?" prompts.** "Why" triggers rumination; "what" generates observable data.
- **No evaluative praise.** Informational feedback enhances intrinsic motivation; praise undermines it. Feedback is specific and descriptive ("you unblocked the worktree issue you identified Tuesday; the Pursuit is one Project from completion"), never evaluative.
- **No mid-flow interruptions.** All non-flow work lives at breakpoints.
- **No LLM-generated Ideas during `brainstorm`.** The agent provokes; the user generates.
- **No speculative deadlines.** Target dates only when an external commitment drives one. Aspirational deadlines turn into ambient pressure that distorts scope.

### What the Voice Measures

- **Progress.** Projects advanced, Pursuits closed, brainstorms crystallized into commitments. (Amabile's Progress Principle: visible forward motion in meaningful work is the strongest predictor of inner work life.)
- **Drift.** Stalled waiting-fors, near-completion pursuits, Inbox above its soft cap.
- **Cleanliness.** Open brainstorms on closing-in pursuits, dormant Projects, active projects with no open actions.

Full research foundations and citations: `docs/research-references.md`.

---

## Who Is This For?

Cadence is for people who:

- Juggle multiple high-stakes Pursuits across work, family, and personal growth
- Value depth and flow state over shallow multitasking
- Want their productivity system to hold "stand up CI" alongside "be a present father" without one shape dominating
- Believe writing about their work is how they learn and grow
- Need a system that takes divergent ideation as seriously as convergent execution
- Are tired of maintaining their productivity system and want it to maintain itself
- Trust AI as a capable partner but want to stay in control of what matters

**Cadence also works on the bad days.** When you're overwhelmed, when your kid is sick and there's a production outage and you forgot to renew your car registration — the Get Clear phase of Reflect, the Reconciler, the 2-minute rule, and the flow-safe captures inbox ensure nothing falls through the cracks. The system is your safety net, not just your inspiration.

---

## Technical Philosophy

- **Local-first.** Markdown files in your repo are the source of truth. No cloud dependencies. Sync to your own infrastructure if you want it.
- **CLI-native.** Cadence lives inside agentic coding tools (Claude Code today). The interface is conversation; the persistence is markdown.
- **One voice, verb-defined contracts.** The user sees one agent whose register is set by the active verb.
- **Multi-repo plugin model.** The plugin installs into any repo via `claude --plugin-dir ./cadence-plugin` (or future marketplace). Each repo with `cadence.yaml` is a self-contained Cadence instance. `/cadence:init` bootstraps a new repo. The SessionStart hook handles uninit repos gracefully.
- **TypeScript implementation.** The bundled CLI at `cadence-plugin/bin/cadence` is the single deterministic entry point for read and write operations. Skills shell out to it.
- **Transparent AI.** Every AI decision (triage routing, narrative generation, structural suggestion) is reviewable and correctable.
- **Oblique provocation deck, not free generation.** The `brainstorm` verb draws from a curated deck (SCAMPER, "how might we…", forced analogies, Eno-style obliques). The user can extend the deck. LLM-as-generator is deliberately absent from the divergent phase.
- **Open-source aspirations.** Built as a personal tool first, architected for sharing. Clean separation between the Cadence framework (what anyone could use) and your Cadence instance (your specific Pursuits).

---

## Future Work

These are aspirational features the implementation does not yet provide. They live here so the vision is honest about what's built versus what's planned.

- **Cadence Console — the Marimo notebook.** A live dashboard view over your Cadence repo that surfaces active pursuits, pending validations, the Inbox, active brainstorms, and the most recent reflection in one place, with cells that trigger `cadence:narrate` regenerations and `cadence:capture` quick-writes. Design distilled at `docs/marimo-console-design.md`: the "notebook references, Claude Code owns sidecars" pattern (the agent writes `narratives/console/*.cc.md`; Marimo cells render them via `mo.watch.file`), subprocess to `claude -p` as the default invocation path, with the Agent Client Protocol path documented for power users.
- **Outside-view estimation.** Vision originally claimed reference-class lookup at Action creation. Real implementation requires actuals tracking, which requires time tracking — neither of which Cadence has. A possible later addition is Pomodoro-style 90-minute work-windows for dev/study contexts only, where session-duration tracking would be a natural primitive. Not a first-class feature for now.
- **Nudges as if-then plans, expanded.** Today the SessionStart hook surfaces a small "Next:" block with heuristic suggestions, contextual tip-library content, an Inbox line, an active-brainstorms line, and an idle-time prompt. The richer Nudges system originally specified — categorized (wellbeing, awareness, quick-wins, WIP warnings, oblique provocation) and Gollwitzer-formatted — splits into two future paths: dev-specific session/progress nudges (water, stretch, deep-work timers — opt-in for coding contexts) and domain-neutral calendar nudges (review-due, week-closing — extension of what's already in the splash).
- **Derived contexts.** GTD-style `@home`/`@errands`/`@computer` tags derived automatically from signals. Not built; the pursuit IS the context in current Cadence.
- **SQLite/embedding index.** The architecture originally promised a SQLite hybrid for cross-cutting queries. Today the deterministic CLI scans markdown directly and returns in well under a second. The `build-indexer` project is parked on hold until performance actually hurts; an embedding index is a stronger move once enough scale exists to justify it (semantic find, brainstorm de-duplication, retrieval-augmented narratives).
- **`claude-agent-sdk` (Python) integration.** Once Cadence Console is in real use, Pattern B from the Console design — in-cell SDK calls with `setting_sources=["project"]` — opens richer programmatic surfaces: a Marimo cell that exposes a custom in-process MCP tool the agent can call back into during the same query. Deferred until subprocess UX feels heavy in practice.

## Someday

- **Voice/SMS/mobile capture.** Most thoughts about non-dev pursuits happen away from a desk. Without an off-terminal capture surface, the system underserves the audience the vision targets. Held in the someday pursuit `expand-cadence-input-and-ingestion`.
- **External-tool ingestion.** `cadence import --from notion|things|omnifocus|reading-list|...` for users coming from existing systems and for processing reading-list backlogs. Same someday pursuit.

---

## The Tagline

**Cadence** — *The rhythm you return to.*

A cognitive operating system that holds your context, protects your flow, separates the modes of thought, and tells the story of what you're building.
