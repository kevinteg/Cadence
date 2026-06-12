# Cadence — Architecture

*Design decisions and the rationale behind them. Operational mechanics (file formats, CLI catalog, lifecycle states, directory structure) live in `cadence-plugin/cadence-runtime.md` and `cadence-plugin/cadence-reference.md` and are not duplicated here.*

This document answers the **why**: why the model is shaped the way it is, what tradeoffs got made, what we deliberately chose not to do. The vision (`wiki/concepts/vision.md`) covers what Cadence is and what it does. The research foundations are in `wiki/research/research-foundations.md`.

---

## The Conceptual Model

```
Pursuit ──► Project ──► Action
   │           │            │
 Why?       Intent?    Concrete?
```

**Pursuits, Projects, and Actions form the work hierarchy.** Pursuits are intentional commitments tied to values or roles; Projects are scoped efforts with an Intent narrative; Actions are atomic tasks. Each level has a different cognitive cost and a different lifecycle.

**Divergent exploration lives in brainstorm workspaces, not as standalone Idea entities.** A brainstorm is a first-class workspace at `brainstorms/<slug>/` that runs a phase machine (`diverging → converging → crystallized | archived`). Crystallizing a brainstorm materializes a Pursuit or Project from the chosen solution; archiving preserves the artifact as a decided-but-shelved lineage record. Workspaces hold the cluster — divergent notes, candidate solutions, the decision — together.

**Raw and unsorted material lives in the Inbox view.** The Inbox is the union of untriaged captures (`thoughts/unprocessed/` where `status: untriaged`) and brainstorms still in `diverging`. It's a view, not a directory. Triage moves material out of the Inbox: as an action on a pursuit, as a new project, as a brainstorm crystallized into one, or closed with a reason.

**Why this shape rather than a flat task list?** A flat list (tasks under projects, no levels above) collapses the difference between "what I'm working on" and "what I'm committed to over years." Without that distinction, the system can't help you see the story of what you're building, and it can't protect long-running commitments from urgent-but-unimportant work. The Pursuit level is where identity lives.

**Why brainstorm workspaces rather than per-idea entities with graduation gates?** The earlier model treated each idea as a separate object with its own lifecycle (Seed → Developed → Promoted) and three graduation verbs (`brainstorm`, `develop`, `promote`). In practice users think in clusters of solutions to a problem, not in isolated seeds. The workspace shape holds the cluster's divergent notes, candidate solutions, and decision artifact together; the phase machine encodes the cognitive transition (diverging → converging) without requiring the user to invoke a different verb for each step. `develop` and `promote` were retired in v1.1 — their work folds into brainstorm-workspace mechanics and a single `--crystallize` flag.

**Why Inbox-as-view rather than Inbox-as-pursuit?** The previous model carried a standing `pursuits/inbox/` pursuit that never closed, whose job was to hold orphan Ideas. After Ideas-as-entities retired, the directory had no mechanism filling it. The Inbox is more honest as a view: one number ("Inbox: N items") computed deterministically from the untriaged captures + diverging brainstorms across the repo. Surfaces (status / SessionStart / capture exit menu / `/reflect` Get Clear) all consume the same view function — and consistency is enforced by source, not by editorial discipline.

---

## One Voice, Verb-Defined Registers

The agent is a single voice, not a roster of named personas. The active **verb** determines the agent's tone, behavior, and guardrails. Brainstorm is non-judgmental during `diverging` and structured-critical during `converging`; start is silent-during-flow; narrate is reflective-not-evaluative; reflect is structured-and-forward-looking.

**Why one voice and not multiple agents?** Two reasons. First, the user's mental model is "I'm using Cadence" — they don't think about which sub-agent is in the chair. Naming personas adds vocabulary the user has to learn. Second, the verb is already a deliberate choice the user is making; tying the register to the verb is automatic and visible. It also matches the user's cognitive mode to the tool's behavior, which the DMN/ECN switching research (`wiki/research/research-foundations.md` §1) says is the load-bearing capacity for creative work.

**Why verb-defined and not mode-declared?** A declared mode requires the user to remember to set it. The verb the user invokes IS the mode. No declaration step, no mismatch between declared and actual.

---

## Two Processes: Diverge → Converge → Plan → Execute

```
capture ──► thoughts/  ─┐
                        ├─► brainstorm ──► --crystallize ──► Pursuit / Project
brainstorm <topic> ─────┘    diverging → converging                  │
                                                                     ▼
                                                                  Project + Actions ──► start → complete → resolve
```

The diverge process feeds candidate commitments. The converge process executes the work. They are deliberately separated because the research is unambiguous that mixing them degrades both (`wiki/research/research-foundations.md` §1).

**Why explicit verbs for divergent work and not just "use brainstorm and capture"?** Without a named divergent surface, ideation collapses into capture (which is convergent — a queue to be processed). The brainstorm verb is the named container that protects divergent thinking from premature evaluation.

**Why a phase machine inside brainstorm rather than three separate verbs (`brainstorm` → `develop` → `promote`)?** The user's mental model is one continuous arc: exploring → choosing → committing. Three verbs forced the user to declare a transition that should be implicit. The phase machine on `meta.yaml` captures the transition in the workspace's own state — the user types `cadence:brainstorm <topic>` to open or resume, and `--crystallize` to commit; the cognitive transition lives in the workspace, not in the verb surface.

**Why the LLM provokes rather than generates ideas during the diverging phase?** Doshi-Hauser (2024) and Anderson-Shah-Kreminski (2024) showed LLMs raise the floor of individual creativity but compress its variance — "mode collapse." The provocation deck (Oblique Strategies + SCAMPER + How-Might-We) preserves the user's own associative search; the LLM's convergent bias is reserved for the `converging` phase where it's an asset (PPCo, criteria matrices, pre-mortems).

**Why capture is an audit trail with an outcome menu, not just a file write.** Inline `/capture "..."` stays silent — flow safety beats everything. Non-inline paths (`--from`, `--source`, `--dump`) dispatch a **capture-ingest subagent** with restricted tools that pulls the raw payload to `thoughts/_raw/<id>.raw.md`, distills per the `--prompt` into `thoughts/<id>.md`, and returns suggested per-item outcomes (`two_minute_action`, `action`, `project`, `brainstorm_seed`, `note`). The capture SKILL surfaces a small menu — the user can route any item immediately, or leave it in the Inbox. The subagent isolation is the load-bearing detail: bulk payloads stay out of the main conversation; only structured summaries return. The thoughts file IS the audit trail and is always written, regardless of whether the user routes the item immediately.

---

## WIP Limits, Asymmetric

| Entity | Limit | Why |
|---|---|---|
| Pursuits | None | Pursuits represent long-running commitments and may incubate. Limiting them would force premature commitment or premature abandonment. |
| Projects | `max_active_projects` (default 5; counted only if status=active with at least one unchecked action) | Theory of Constraints: only the binding constraint matters. Cadence enforces WIP at the level where convergent attention is being split. |
| Brainstorms | None directly; the Inbox view soft-caps untriaged material | Sio & Ormerod (2009) meta-analysis on incubation: setting problems aside is often productive. Strict WIP on ideation cuts off the biological substrate of creative cognition. Visibility (the Inbox count + the `inbox_pressure` flag) is the signal, not a hard limit. |
| Captures | None | Captures are flow-safe and meant to be triaged at breakpoints. WIP on captures would re-introduce the interruption they exist to prevent. The Inbox view's soft threshold (`inbox_soft_threshold`, default 10) is what surfaces accumulation. |

**Why WIP only on active Projects?** The Kanban argument (Little's Law) is most valid when items are roughly homogeneous and flow through a pipeline. Projects-in-execution behave that way. Pursuits and brainstorms don't.

**Why a soft Inbox threshold rather than a hard cap?** The Inbox holds heterogeneous material at different ages of triage debt. A hard cap would either reject new captures (breaking flow-safe capture) or force premature triage. The soft threshold is descriptive — "above soft cap" surfaces in the dashboard and as a reconciler flag, but the user decides when to act. The framing is deliberately not scolding ("above soft cap," not "overdue") because the goal is awareness, not guilt.

**Why the Reconciler flags rather than blocks?** A WIP block forces a hard stop; a flag is a signal the user can act on or override. Cadence trusts the user's judgment; it surfaces the structural signal without enforcing.

---

## Closure: Zeigarnik Release as a Hard Constraint

Pursuit closure is an **absolute block** if unresolved exploration exists — open projects (`active` or `on_hold`) or active brainstorms (`diverging` or `converging`). Each open item must be resolved (project: complete or drop-with-reason; brainstorm: crystallize, archive-with-learning, or move to another pursuit) before the pursuit can close.

Project closure uses **override-with-reason** rather than absolute block — friction-sensitive at projects' frequency.

**Why an absolute block at the pursuit level?** Unfinished commitments produce ongoing executive interference (Zeigarnik 1927; Masicampo–Baumeister 2011). Closing a pursuit while leaving exploration unresolved silently drops cognitive loops the user is still rehearsing. The cleaning ritual converts ending into meaning-making. Without the absolute block, the ritual gets skipped under time pressure — exactly the moment when the cognitive cost is highest.

**Why override-with-reason at the project level?** Projects close more often than pursuits. Strict blocking at every project closure would create ritual fatigue. The reason-required-for-override preserves the meaning-making intent without the friction.

**Two terminal outcomes for pursuits: archived vs dropped.** Completed pursuits route to `pursuits/_archived/` and produce a closure narrative (what shipped). Dropped pursuits route to `pursuits/_dropped/` and produce a drop narrative (what was learned without shipping). The directory split lets the `/narrate lessons` surface treat them as distinct signal — archived = lessons of execution, dropped = lessons of judgment. A pursuit that needs setting aside (might come back) is a different operation: `cadence move-pursuit --to someday` is a relocation without a ritual or narrative.

---

## Persistence: Markdown Is the Source of Truth

All Cadence state lives as markdown files in the user's repo: `pursuits/<id>/pursuit.md`, `pursuits/<id>/projects/<id>.md`, `brainstorms/<slug>/`, `thoughts/unprocessed/`, `thoughts/_raw/`, `reflections/`, `wiki/drafts/`, `narratives/session-log.md`, `validations/pending.md`, etc. There is no database; the deterministic CLI scans markdown directly and returns in well under a second on this repo.

**Why markdown and not a database?** Three reasons. First, markdown survives any tool — the user owns their data forever, even if Cadence dies. Second, git history of project files is itself the activity stream the narrate verb reads from; the file IS the watermark. Third, the GTD/Zettelkasten/BASB literature converges on durable, portable, plain-text storage as the precondition for trust in a productivity system.

**Why no SQLite hybrid?** The original architecture promised one as an index for cross-cutting queries. The deterministic CLI handles current scale fine. SQLite (or, more likely, an embedding index) is on the Future Work list (`wiki/concepts/vision.md`). When performance hurts or semantic recall becomes load-bearing, the index ships. Until then it would be a maintenance tax with no benefit.

**Why git-history-as-activity-stream rather than a separate event log?** Git already stores every change with a timestamp, author, and diff. A separate event log would duplicate this and risk drift. The narrate verb's watermark-resume pattern reads the project-file git log directly: each generated narrative carries `consumed_through_commit` in its frontmatter, and the next narrative for the same cadence resumes from there. The narrative file IS the read pointer. No separate state.

---

## Ambient Surfaces and Coaching Consistency

Three ambient surfaces — the Inbox view, the SessionStart splash, and the Stop-hook session log — share one mental model: **render state where the user already is, rather than asking them to navigate to it.**

The Inbox view is a single function (`inboxItems(snapshot)`) consumed by `/status`, the SessionStart hook, the reconciler, the capture exit menu, and `/reflect` Get Clear. One number — "Inbox: N items" — across every surface. The SessionStart hook extends the dashboard with the Inbox line, an active-brainstorms line, an empty-repo coaching block (when state is empty), and an idle-time prompt (when activity is stale). The Stop hook appends a one-line audit entry to `narratives/session-log.md` when state has materially changed since the last logged stop.

**Why split function (definition) from form (canonical wording)?** The function lives in code (`src/inbox.ts`, `src/sessionstart.ts`); the canonical wording lives in `cadence-plugin/workflows/coaching-strings.md`. Skills, hooks, the runtime, and the CLI render helpers quote from `coaching-strings.md` rather than re-inventing language per surface. A user opens Cadence, sees "Inbox: 4 items," and understands the term from context — because every surface uses the same words. Consistency is the load-bearing UX; the doc is where it's enforced.

**Why the splash fires on every new conversation.** The SessionStart hook always emits — there is no state-hash suppression and no dismiss-until override. Both were tried and removed: dedup turned the surface into a guessing game about whether the hook had actually run, which is worse than the wallpaper risk it was guarding against. The dashboard is the orienting move on session entry; if marginalia gets repetitive, the per-category tip cool-down handles that without hiding the dashboard itself.

**Why the Stop hook over SubagentStop or PreCompact?** SubagentStop fires per subagent call (too chatty). PreCompact fires after the user has lost the thread (too late). Stop fires when Claude Code finishes a turn naturally — the right frequency for an audit log.

## Multi-Repo Plugin Model

Cadence ships as a Claude Code plugin at `cadence-plugin/`. The plugin installs into any repo via `claude --plugin-dir ./cadence-plugin` (or future marketplace). Each repo with a `cadence.yaml` is a self-contained Cadence instance. `/cadence:init` bootstraps a new repo. The SessionStart hook handles uninit repos gracefully.

**Why per-repo and not per-user?** Per-repo isolation matches how users actually think — work-repo pursuits are different from personal-repo pursuits. Per-repo also means no cross-repo state to synchronize; each instance stands alone.

**Why no cross-repo discovery?** "Show me my pursuits across all my Cadence repos" sounds useful but reintroduces the cross-cutting query problem markdown-as-source-of-truth was meant to avoid, and it cuts against the each-repo-stands-alone principle.

---

## Domain Neutrality

Cadence is a cognitive operating system, not a dev tool. Most users work on non-dev repos: household projects, creative practice, fitness, family logistics. Every verb, vocabulary choice, and example stays domain-agnostic — universal language ("validate" not "test", "ship" not "deploy", "wrap up" not "merge"); examples rotate domains; heuristics adapt by detected domain.

**Why this matters at the architecture level:** the vision-doc framing ("be a present father" alongside "stand up CI") only holds if every primitive is domain-agnostic. Once a coding metaphor enters the verb surface, the audience implicit in the vocabulary shrinks.

---

## Design Principles (Hard Rules)

These are not stylistic preferences. They are structural constraints; the system fails its own goals if they're violated.

1. **Markdown is the source of truth.** If the index breaks (when an index ships), rebuild from markdown.
2. **The artifact IS the state.** Project files, narratives, reflections, captures — each carries its own status. No separate state file mirrors what a content file already says.
3. **Completion is derived, not declared.** All actions checked + Intent confirmed through dialogue + status set to done. Self-reported "done" without dialogue against Intent is forbidden.
4. **Verbs define behavior; no mode announcements.** The verb the user invokes IS the mode.
5. **Flow protection.** No mid-flow interruptions. Batch observations for breakpoints.
6. **No gamification.** No streaks, scores, badges, leaderboards, evaluative praise.
7. **No "why did you fail?" prompts.** Reflection is forward-looking, not interrogative. "Why" is reserved for Pursuit creation.
8. **Ideas come from the user.** The LLM provokes during the diverging phase and develops/critiques during the converging phase. It does not generate ideas on the user's behalf during brainstorm.
9. **Workflows are soft.** Defined in markdown, editable, swappable. The user can fork their own copy of the plugin and reshape any contract.
10. **No speculative deadlines.** Target dates only when an external commitment drives one.
11. **Domain-neutral by default.** Verb names, examples, and heuristics serve household projects as well as code.
12. **Pending-validation queue, not in-project validation actions.** Project completion decouples from fresh-session verification (the queue surfaces validations on every fresh session until cleared).
13. **One canonical wording per ambient surface.** The Inbox line, the active-brainstorms line, the empty-repo block, and the idle-time prompt are written once in `coaching-strings.md` and quoted everywhere. Drift between surfaces breaks the mental model that makes "Inbox" intelligible.
14. **Subagent isolation for bulk-payload work.** Non-inline capture, narrative generation, and reconciler scans run as subagents with restricted tools and explicit budgets. The raw payloads stay in the subagent's context; only structured summaries return.

---

## What's Inside the Plugin

Operational specifics are in the plugin itself:

- `cadence-plugin/cadence-runtime.md` — always-loaded operational truth (vocabulary, verbs, working-a-project rules, upward completion, engagement and alignment principles, guardrails, scope)
- `cadence-plugin/cadence-reference.md` — on-demand reference (verb catalogue, file formats, full CLI subcommand catalog, lifecycle mechanics, Intent and Actions discipline, Brainstorm Workspaces, Capture Ingestion, Ambient Surfaces, project recipes, tip library schema)
- `cadence-plugin/workflows/verb-contracts.md` — per-verb behavioral contracts
- `cadence-plugin/workflows/coaching-strings.md` — canonical wording for ambient surfaces (Inbox line, empty-repo block, idle-time prompt, post-capture menu, threshold-aware language principles)
- `cadence-plugin/skills/<verb>/SKILL.md` — per-verb skill definitions invoked by Claude Code
- `cadence-plugin/agents/<name>.md` — subagent definitions (capture-ingest, narrator, reconciler) with restricted tool surfaces
- `cadence-plugin/deck/provocations.yaml` — the divergent-thinking deck for /brainstorm
- `cadence-plugin/tips/library.yaml` — the tip repository for teaching footers and verb hints
- `cadence-plugin/hooks/hooks.json` — SessionStart + Stop hook registrations
- `cadence-plugin/bin/cadence` — bundled deterministic CLI

This document does not duplicate any of those — read them for the operational truth.
