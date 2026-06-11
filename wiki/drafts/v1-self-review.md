---
cadence: self-review
generated_at: 2026-04-30T22:15:00-07:00
scope: build-cadence-v1 post-closure review
inputs:
  - docs/product-vision.md
  - docs/one-pager.md
  - docs/architecture.md
  - cadence-plugin/workflows/verb-contracts.md
  - cadence-plugin/skills/*/SKILL.md
  - journeys/*.yaml
  - cadence-plugin/deck/provocations.yaml
  - cadence-plugin/cadence-runtime.md
  - cadence-plugin/cadence-reference.md
external_survey:
  - 2026 agentic-tooling SOTA (Letta, Mem0, LangGraph, Dust, AGENTS.md, MCP)
  - PKM/cognitive-OS competitors (Tana, Mem.ai, Reflect, Saner, Granola, Sunsama, Reclaim, Motion, Devin)
  - GTD/leveraged-priority lineage (Allen, Newport, McKeown, McAdams, Christensen)
---

# Cadence — Deep Review

Compiled from `docs/product-vision.md` (362 lines), `docs/one-pager.md` (165 lines), `docs/architecture.md` (442 lines), the verb contracts, 9 user-journey YAMLs, the 25-subcommand CLI surface, the 58-card provocation deck, and a parallel survey of the 2026 agentic-tooling landscape.

---

## Goals → Implementation Gap Matrix

| Stated goal (from vision/one-pager) | Implementation today | Gap |
|---|---|---|
| "Holds your context" | Project file = durable state; SessionStart hook surfaces dashboard | Strong |
| "Protects flow state" | `/capture` is flow-safe; no mid-flow interrupts | Strong |
| "Separates divergent from convergent" | brainstorm/develop verbs with distinct voice contracts; provocation deck instead of LLM generation | Strong |
| "Generates the narrative of what you're building" | `/narrate` daily/weekly contracts shipped; watermark-resume from git | Strong on coding work; weak on non-git work (see below) |
| "One voice, register set by verb" | 16 verbs with explicit contracts; TRIGGER/SKIP discipline | Strong |
| "Works across work, family, personal growth" | Verbs are domain-agnostic in principle | **Weak** — terminal-only, requires git commit cadence to feed narratives |
| "Ideas are first-class adjacent collection" | `cadence ideas` CLI; states; Wandering as default parent | Strong |
| "Closure as Zeigarnik release" | Pursuit close = absolute block on unresolved Ideas; closure ritual implemented | Strong (you just exercised it) |
| "Reconciler watches stalled state" | 10 flag rules implemented | Strong |
| "Outside-view estimation is structural" | **Not implemented.** No actuals tracked, no reference-class lookup | Missing |
| "Nudges as Gollwitzer if-then plans" | **Not implemented** as a feature. Only the SessionStart Next: block exists | Missing |
| "Derived contexts (no manual tagging)" | **Not implemented.** No context derivation logic | Missing |
| "Project automation — delegate coding projects to autonomous execution" | **Not implemented.** No agent execution surface | Missing |
| "Voice-capture mobile companion" | Listed as future work | Missing |
| "Local-first SQLite + markdown" | **No SQLite.** Markdown only. Architecture doc claims hybrid; reality is markdown-only with on-disk git scan | Doc/code drift |
| "TypeScript for integration, Python for intelligence" | TypeScript CLI only. No Python pipeline | Doc/code drift |
| "Three-tier isolation (sandbox/production/work)" | **Not implemented** | Missing |

The MVP delivered roughly **half** of the stated vision. The shipped half is the half that benefits a single coding user dogfooding the tool. The unshipped half is the half that would make it work for someone who isn't you.

---

## Persona 1 — The Skeptic (no punches)

You wrote a 362-line vision document for a markdown-and-git task tracker. The research citations (Beaty, Masicampo–Baumeister, Gollwitzer, Eurich, Amabile, Doshi-Hauser) are *design rationale*, not features. None of them are operationalized in code. Citing the Default Mode Network in your product doc is performative academic anchoring; the user-facing behavior — "the agent's tone changes based on which slash command you typed" — is something every Claude Code user already gets for free with custom slash commands. The novelty bar in this space is not "I have verbs"; it is "I have memory, retrieval, and execution." You have neither the first nor the third.

The "one voice, verb-defined registers" framing is a strong essay and a thin product. The actual differentiator the survey turned up — Intent narrative + git-history-as-activity-stream + watermarked narrative resume — is real, but it is one feature, not a cognitive operating system. Your dogfood is convincing because *you* are the only user, and you happen to commit your project files frequently because you wrote the thing. The moment a user is not in their terminal — and "be a present father" is your own example — the entire input surface fails. There is no commit history of fatherhood.

The provocation deck is 58 cards. Eno's *Oblique Strategies* is 100+ and was iterated by two people for over a decade before it was good. Yours is design philosophy, not yet a refined artifact. The "no LLM-generated ideas" stance is well-grounded (Doshi & Hauser is real), but a deck this small will repeat itself within five brainstorm sessions and the user will lose trust.

The reconciler is your second-best feature, but it surfaces flags only when the user runs `/reconcile` or starts a session. There is no proactive surface — no email, no notification, no calendar event. A "background process" that requires the user to invoke it is not a background process; it's a query. Real cognitive operating systems (Reclaim, Sunsama) push to the calendar or to the user's existing notification stream. Cadence pushes to a terminal the user has to re-enter.

The 17-verb surface is a memorization problem. New users will not distinguish brainstorm from develop from promote without the help text in front of them, and they will not run `/cadence:help` because they will not know it exists. The vision says "meets you where you already work"; the reality is "demands you learn 17 verbs and a 442-line architecture document."

There is no exit strategy for a user who falls off. Skip Reflect for three weeks and the system has no recovery — no "let's catch up," no "here's what got stale, prioritize one." Productivity systems that lack a graceful re-onboarding path lose all their users; they don't lose 50% of them. Cadence has no answer to this.

**Verdict**: a thoughtful prototype with one real wedge (intent + narrative-from-git), papered over with academic citations to claim more breadth than it has. Good enough to use yourself. Not yet a product.

---

## Persona 2 — Supportive Technical

The skeptic is right about the surface being thin. He is wrong about the wedge being thin. *No competitor combines intent capture + execution + verification + narrative generation in one loop.* I checked: Tana, Mem.ai, Reflect, Saner, Granola, Sunsama, Motion, Reclaim, Dust — they each pick a slice. You picked the loop. That's defensible.

The git-as-activity-stream choice is genuinely novel and gives you something the SOTA stack does not: **perfect provenance**. A Cadence narrative can cite the exact commit that backs a claim. Letta and Mem0 cannot do this — their memory is summarized facts in a vector store, lossy by construction. Yours is lossless. That is rare and worth keeping.

The Intent-and-Actions migration (away from DoD checklists) was the right call and is the kind of decision a designer only makes when they're using their own tool seriously. Same for the Session/Marker removal — recognizing that pursuit/project/action is itself a write-ahead log of intent is a strong piece of design. The closure ritual with absolute Ideas block is also strong: you took the Zeigarnik-effect framing and turned it into a hard product constraint, which forces the user to do the meaning-making work. Most tools wave at "reflection"; yours blocks closure on it.

The watermark-resume narrative is the most under-celebrated piece of the system. It's a pointer-as-artifact pattern — the narrative IS the cursor — and it gives you cheap incremental updates without a separate state file. Once you have embeddings (you should add them), the watermark + embedding-of-the-prose pair becomes a substrate for retrieval-augmented narratives that *can* say "this echoes a frustration from three months ago in a different pursuit." That's where the real differentiation goes.

The architecture is thoughtful where it has been pressure-tested (the bits you used) and aspirational where it hasn't (SQLite hybrid, three-tier isolation, Python pipeline). That's normal. Keep the doc honest by deleting unimplemented promises until you ship them.

**Concrete improvements I'd make in order:**
1. Add an embeddings layer over project files, Ideas, and captures (OpenAI `text-embedding-3-small` is fine; pgvector or a flat numpy index — don't overbuild). Unlocks `/find` semantic, capture clustering, idea de-dup, and retrieval-augmented narratives.
2. Add a non-terminal capture surface. The cheapest is a Telegram or Signal bot whose messages land in `thoughts/unprocessed/`. Voice via Whisper. This is the single highest-leverage feature you don't have.
3. Build a real state-machine layer underneath the verbs — explicit FSM for project lifecycle (`on_hold → active → done|dropped`), with checkpoint/resume so a half-finished `/reflect` survives a process restart. LangGraph is overkill for one user but its `interrupt()`/`Command(resume=)` semantic is the pattern to imitate.
4. Tool budgets and iteration caps on the narrator/reconciler subagents. Right now an agent can run away.
5. Drift detection: embed the Intent at project creation; weekly compare against the prose of completed actions. When divergence is high, flag it. This is a 100-line feature with outsized payoff.

---

## Persona 3 — Product Manager

The vision document is 362 lines. The architecture document is 442 lines. The runtime is 200 lines. There is no "you have five minutes" entry path. **Onboarding is the product's biggest risk.** A user who does not already have your taste for productivity-research synthesis will bounce in the first session.

The verb count is the second risk. Sixteen state-modifying verbs is too many for a casual user to internalize. Tana exposes ~6 primary actions; Notion exposes 4–5. Cadence's TRIGGER/SKIP discipline is sound engineering but it does not change the user's memorization load.

The terminal-only constraint excludes the audience the vision targets. "Technical leaders juggling work, family, personal growth" — most of those people do not write code daily. They might tolerate a terminal at the office; they will not open one to capture a thought about their kid's dentist appointment. Either narrow the audience to "ICs in active codebases" or fix the input surface.

Wandering as a default parent for unattached Ideas is a clever metaphor and a cognitive tax. Users have to remember the metaphor exists. Notion's "Inbox" is the same idea with a name everyone already knows. Pick a familiar word.

There is no migration path. A new user starts with an empty repo and has to seed pursuits, projects, ideas from scratch. Most users have an existing system (OmniFocus, Notion, Things) and will not abandon it for a tool with no import. A `cadence import --from notion` would matter.

Pricing/distribution is undefined. If this is open source for personal use, that's fine; if there's a SaaS path, the local-first markdown-and-git stance is at odds with how SaaS works today.

**The PM's prioritized punch list:**
1. Write a 1-page quickstart. "In 10 minutes you will: capture three ideas, promote one to a project, reflect on the week, see the narrative." That's the demo.
2. Cut the verb surface. Hide develop and promote behind brainstorm and start; merge close and cancel into a single resolve verb with paths for done/dropped/closed; demote help and find to flags on status.
3. Build a non-terminal capture surface. Without it, the audience is wrong.
4. Ship a single 60-second video. The onboarding ceiling is raised entirely by showing what the loop feels like.
5. Identify the first non-self user. The dogfooding evidence is strong; the externalizable evidence is zero.

---

## Physical-Pursuit Fit (You Specifically Asked)

Currently theoretical. Two structural problems:

1. **The narrative engine reads git history of project files.** A "fix the kitchen sink" project generates no commits unless the user manually edits the project file after each action. The system's most distinctive feature does not function for non-git work without ceremonial editing the user will not do.
2. **Capture is terminal-only.** Most physical-pursuit thoughts happen away from a desk: at the hardware store, in the car, before bed. With no voice/SMS/mobile path, those thoughts never enter the system, which means physical pursuits never accumulate a healthy idea backlog or an honest activity stream.

The system's *primitives* (Intent, Actions, Ideas, Reflect) are domain-agnostic and would work fine for physical pursuits. The *I/O surface* doesn't. Fix the I/O surface and the rest follows. Concrete fixes, ordered by leverage:

- A capture endpoint over Telegram/Signal/SMS that writes to `thoughts/unprocessed/` and commits.
- A `cadence log <project> "<what I did>"` verb that records a non-action update — appends to the project's Notes section with a timestamp and commits, generating a real activity event for narratives.
- Photo capture for physical projects (kitchen sink before/after) — store under `pursuits/<id>/projects/<id>/media/`.

---

## What You're Missing or Compensating For (Agentic-Tooling Gap)

Pulled from the parallel community survey:

| Missing primitive | What you're using instead | Concrete reference to study |
|---|---|---|
| **Tiered semantic memory** (episodic/semantic/procedural with self-edit) | Git history as flat archival memory | [Letta](https://www.letta.com/) (post-MemGPT); [Mem0](https://mem0.ai/); Anthropic's [memory tool](https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool) |
| **Embeddings + vector recall** | Substring `find` | OpenAI `text-embedding-3-small`; pgvector; Chroma |
| **State graph / FSM with checkpoints + HIL interrupts** | Skill files + procedural CLI mutations | [LangGraph](https://blog.langchain.com/making-it-easier-to-build-human-in-the-loop-agents-with-interrupt/) `interrupt()` / `Command(resume=)` |
| **Cross-tool agent context standard** | `CLAUDE.md` only | [AGENTS.md](https://hivetrail.com/blog/agents-md-vs-claude-md-cross-tool-standard) — Sourcegraph + OpenAI + Google + Cursor + Factory |
| **External-resource tool protocol** | Local-only | MCP servers (calendar, email, GitHub, Linear) |
| **Tool budgets / iteration caps** | None — agents can run away | LangGraph `recursion_limit`; Claude Agent SDK budget config |
| **Scheduled/triggered autonomous workflows** | None — everything is user-initiated | [Dust](https://dust.tt/blog/automate-dust-agents-workflow-tools); Claude Managed Agents |
| **Idea de-duplication / capture clustering** | None | Embeddings + DBSCAN |
| **Drift detection** | None | Embed Intent, compare weekly to action prose |
| **Lessons extraction across completed work** | None | Cron'd narrator pass over `_archived/` |
| **Calendar / email integration for `waiting_for`** | Manual flagging | Reclaim, Sunsama, Dust |
| **Voice / mobile capture** | Terminal only | Whisper-on-iOS; Telegram bot; [Limitless Pendant](https://www.limitless.ai/) for ambient |
| **Time tracking / where attention actually went** | None | Toggl + LLM categorization; Rewind |
| **Autonomous execution of recorded actions** | `/complete` records, doesn't *do* | Claude Managed Agents; Devin; Dust scheduled agents |

You are not reinventing the wheel on the synthesis (the GTD + McAdams + git-as-stream combination is genuinely uncommon). You **are** reinventing it on retrieval, memory, orchestration, and I/O — and those are where the 2026 SOTA has the most leverage. The cost is hidden today because you're a single user with ~50 projects; it will become structural at 500 projects or with a second user.

---

## Suggested Next Pursuits, Ordered

A pursuit is the right grain for each of these — they're multi-project arcs.

1. **`expand-cadence-input-surface`** — voice/SMS/Telegram capture, photo storage, `/log` verb for non-action progress. Unlocks physical pursuits and the audience the vision targets. *Highest leverage.*
2. **`add-semantic-layer`** — embeddings over project files, ideas, captures, narratives. Powers semantic find, idea de-dup, retrieval-augmented narratives, drift detection. Unlocks scale beyond ~100 projects.
3. **`first-external-user`** — onboard one person (a friend, a colleague) who is not you. Strip the architecture doc to a 1-page quickstart. Cut the verb surface. Run them through a week. Capture every friction point. This pursuit's user-story validation is "they used it for two weeks without you in the room."
4. **`drift-and-lessons`** — embed Intent at creation, weekly compare to action progress, surface drift. Cron'd narrator pass over `_archived/` to extract recurring lessons. Closes the meaning-making loop the vision claims.
5. **`recover-from-skipped-reflect`** — when a user skips Reflect for >2 weeks, run a "catch-up" path that batches reconciler flags, surfaces top-3-priority items, and re-sets a Leveraged Priority. Without this, churn is the failure mode.
6. **`external-integrations`** — MCP servers for calendar, email, GitHub. Auto-resolve `waiting_for` items when their associated event lands. Convert the reconciler from query-driven to event-driven.
7. **`ship-cadence-publicly`** — the someday pursuit, now with the prerequisites done. Marketplace listing, install friction, separate plugin repo, docs.

The first three are the difference between "elegant prototype I use" and "thing other humans can use." The next three are the difference between "thing other humans can use" and "thing that competes with the SOTA."

---

## One-Sentence Honest Verdict

A thoughtful synthesis with a real wedge (Intent + git-history-as-activity-stream + watermark-resume narratives) wrapped in more vision than implementation, written by a designer who has clearly used their own product — but the input surface, the memory layer, and the orchestration substrate need to ship before this is a tool anyone else can adopt or before "be a present father" lives in the same system as "stand up CI."
