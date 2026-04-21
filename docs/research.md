# Cadence: A theory-grounded design synthesis

**Bottom line up front.** Cadence's one-pager is architecturally sound for *capture, focus, and execution* — it reads like GTD + Kanban + agentic CLI, done well. Its load-bearing gap is exactly the one Kevin already named: there is no dedicated **divergent-ideation mode** before capture, and the research is unusually clear that divergent and convergent thinking are dissociable cognitive processes that corrupt each other when mixed (Guilford, 1950; Beaty et al., 2016; Diehl & Stroebe, 1987). Three other gaps fall out of the research: narrative-generation mechanics are under-specified given how much identity work a "Narrator" mode implies (McAdams & McLean, 2013; Pennebaker, 1986); reflection is vulnerable to rumination unless explicitly scaffolded (Trapnell & Campbell, 1999; Eurich, 2017); and the LLM itself is now known to be a *convergent anchor* that homogenizes ideation (Doshi & Hauser, 2024; Anderson, Shah & Kreminski, 2024) — which has sharp implications for how Guide and Steward modes should be prompted. The rest of this document is a theory-grounded map with explicit design implications in Cadence's vocabulary after each theme.

---

## 1. The core tension: divergent creation vs. GTD-style capture are different cognitive modes

### What the research actually says

J. P. Guilford's 1950 APA presidential address (*American Psychologist*, 5, 444–454) split creative cognition from ordinary problem-solving by distinguishing **divergent production** (many varied answers to an open prompt — fluency, flexibility, originality, elaboration) from **convergent production** (narrowing to a single correct answer). Modern neuroscience gives this split a biological basis. Beaty, Benedek, Silvia, and Schacter (2016, *Trends in Cognitive Sciences*, 20, 87–95) and Beaty et al. (2015, *Scientific Reports*, 5, 10964) show that creative idea production depends on **dynamic coupling between the Default Mode Network (DMN)** — posterior cingulate, medial prefrontal, inferior parietal, the machinery of spontaneous associative retrieval — **and the Executive Control Network (ECN)** — dorsolateral prefrontal and lateral parietal, the machinery of evaluation and constraint. These networks are ordinarily antagonistic. Beaty et al. (2025, *Communications Biology*, 8, 54) found that **flexibility of switching** between them predicts creative ability better than static connectivity does. Dietrich's (2004, *Psychonomic Bulletin & Review*, 11, 1011–1026) framework layers a second distinction on top: **deliberate** (PFC-driven goal search) versus **spontaneous** (defocused, DMN-seeded) modes, crossed with cognitive vs. emotional content.

This is why **mixing modes harms both**. Diehl and Stroebe (1987, *JPSP*, 53, 497–509) and the subsequent Paulus/Nijstad program established three mechanisms by which early evaluation kills ideation: *production blocking* (waiting to speak disrupts associative retrieval — Nijstad, Stroebe & Lodewijkx, 2003, *JESP*, 39, 531–548), *evaluation apprehension* (fear of judgment suppresses wild ideas even when the "no criticism" rule is stated), and *social loafing*. The **creative cliff illusion** (Lucas & Nordgren, 2020, *PNAS*, 117, 19830–19836) compounds the problem: people systematically believe ideation productivity is collapsing when in fact later ideas are typically *more* original than earlier ones (Beaty & Silvia, 2012), so they quit early. Conversely, trying to *diverge* during what should be a convergent phase starves the decision of the executive control needed to select on criteria (Ellamil et al., 2012, *NeuroImage*, on differential network dominance during generation vs. evaluation phases of creative drawing).

Puccio's Creative Problem Solving model (Puccio, Murdock & Mance, 2010, *Creative Leadership*; Puccio, 2014, *The Creative Thinker's Toolkit*, Great Courses) is literally built around this separation. Every CPS phase contains a divergent pass governed by rules borrowed from Osborn (1953, *Applied Imagination*) — **defer judgment, go for quantity, make wild connections, combine and build** — followed by a convergent pass with opposing rules — **apply affirmative judgment, be deliberate, check objectives, improve rather than kill**. Puccio's one-line summary, "trying to do both at once is a mess," is empirically supported.

GTD is a *convergent* process from start to finish. David Allen's five steps — Capture, Clarify, Organize, Reflect, Engage (Allen, *Getting Things Done*, 2001/2015) — treat the mind as an incoming queue to be processed to zero. The foundational cognitive claim, "your mind is for having ideas, not holding them," is a claim about **working memory externalization**, not about having ideas in the first place. Allen's Natural Planning Model *does* include a brainstorm step, but it is embedded as a subroutine inside an otherwise convergent project-planning workflow. GTD is agnostic about what should be in the inbox; it is expressly a downstream machine.

The upshot is that **GTD and CPS are complementary but non-overlapping**. GTD is the best-in-class downstream process once you know what deserves to be a Project. CPS is the best-in-class upstream process for figuring out what deserves to be a Project. Cadence's current one-pager has the downstream process (Sessions → Actions → Markers → Reconciler) but no explicit upstream process, which is why new Pursuits risk being under-incubated — they arrive as captured intentions rather than as the survivors of a diverge/converge cycle.

### How to integrate them without contamination

The Double Diamond (UK Design Council, 2005) is the cleanest prescriptive answer. It formalizes a **four-phase diverge/converge pipeline** — Discover (diverge into the problem) → Define (converge on the problem) → Develop (diverge into solutions) → Deliver (converge on the solution) — each diamond forcing a mode switch before the next expansion. The Stanford d.school's five modes (Empathize / Define / Ideate / Prototype / Test) encode the same rhythm, as does Puccio's four-phase CPS (Clarification / Ideation / Development / Implementation). All three converge on the same structural claim: **never compress a diamond into a single phase**; mode boundaries must be explicit and ritually enforced.

De Bono's *Six Thinking Hats* (1985) gives the tactical pattern at the micro level: one mode at a time, facilitator-enforced, short durations. Blue (process control) opens and closes; Green (creative), Yellow (benefits), Black (critique), White (data), Red (feelings) run serially, not in parallel. Moseley et al. (2005, *Frameworks for Thinking*) note the Six Hats evidence base is thin compared to CPS, but the role-separation principle is independently supported by the DMN/ECN switching literature.

### Design implications for Cadence

**Introduce a fifth mode or promote Guide to a two-submode structure.** The current Steward/Guide/Narrator trio has no home for pure divergent facilitation. Either add a fourth agent mode — **Provocateur** — whose sole job is to run divergent rituals with Osborn-rules prompting, or make Guide polymorphic: *Guide-Diverge* and *Guide-Converge*, with explicit handoffs. The Provocateur/Diverge-Guide must never critique, never evaluate, and must refuse the user's attempts to converge mid-stream ("you're in Ideation — save that concern for Development; I'll remember it").

**Reframe Pursuit creation as a four-diamond pipeline, not a single capture.** A new Pursuit should optionally (but by default) walk through a compressed CPS/Double-Diamond arc: a Clarification Session (diverge on what the real challenge is; converge on a "How might we…?" framing), an Ideation Session (diverge-only, no evaluation, with explicit quantity goal), a Development Session (PPCo — Praise, Potentials, Concerns, Overcome — on top candidates; criteria matrix to select), and only then a first Implementation/Planning Session that spawns Projects and Actions. Each phase is a distinct Session type with distinct prompts and distinct permissions on the agent. Lightweight Pursuits (the "I just need to ship this feature" case) can skip through, but the full arc is the default for anything Kevin tags as strategic.

**Sessions carry a mode attribute.** `cadence session start --mode ideation` vs. `--mode execution` should change the agent's behavior fundamentally. Ideation mode suppresses convergent language, rejects "is this a good idea" prompts, and holds any emerging concerns on a **Parking Lot** that surfaces only when the next Development Session begins — this exploits both the Osborn rule and Masicampo–Baumeister's plan-release mechanism (writing the concern down releases the Zeigarnik tension so the ideator can return to divergence).

**Thoughts should be typed by mode.** A Thought captured in Ideation mode is a **seed**; one captured in Development is a **concern** or **criterion**; one captured in Execution is a **note** or **blocker**. The Reconciler should respect type and never silently promote an Ideation seed to an Action without going through Development.

---

## 2. Protecting flow and paying the true cost of context switching

### What the research actually says

Csikszentmihalyi's *Flow* (1990) characterizes the optimal-experience state via nine features — clear proximal goals, immediate feedback, challenge-skill balance calibrated slightly above current ability, action-awareness merging, concentration, sense of control, loss of self-consciousness, time transformation, autotelic quality — validated in Experience Sampling Method studies over two decades. The most replicated antecedent is the **challenge-skill balance**; goals and feedback are the most actionable conditions for a tool to instantiate.

Kotler's popular extension (*The Rise of Superman*, 2014; Flow Research Collective) adds 22 "flow triggers" and a neurochemical story (dopamine/norepinephrine/anandamide/endorphins/serotonin). The underlying construct is robust; the specific five-neurotransmitter cocktail is **not directly measured in flow states** and should be treated as extrapolation. Dietrich's transient hypofrontality account (2003, 2004) has meta-analytic support for *high-intensity motor* activity (Jung et al., 2022, *QJEP*) but weaker support as a universal flow mechanism. The "500% productivity in flow" figure is from a McKinsey executive survey, not a controlled study.

The cost of breaking flow is established more firmly than flow's neurochemistry. Gloria Mark's program (Mark, Gudith & Klocke, 2008, CHI; Mark, *Attention Span*, 2023) documents that knowledge workers switch activities roughly every **three minutes** and that **self-interruption frequency approximately equals external-interruption frequency** — a finding with sharp implications for tool design. The widely cited "23 minutes 15 seconds to refocus" comes from Mark's broader field work reported in interviews and the 2023 book; the *qualitative* finding (substantial recovery time) is well-supported; the precise number should be cited with care. Sophie Leroy (2009, *OBHDP*, 109, 168–181) isolated the mechanism: **attention residue** — cognitive activation of Task A persists when you switch to Task B, and residue is *greater* when the switch is under time pressure. Leroy and Glomb (2018, *Organization Science*) showed that a brief **"ready-to-resume" plan** — writing where you are on A and what you will do next before switching — measurably reduces residue on B. Monsell's task-switching work (2003, *Trends in Cognitive Sciences*, 7, 134–140) gives the underlying mechanism: switch costs have a residual component that preparation time can shrink but not eliminate.

Self-interruption is driven by the same machinery as open-loop intrusion. Masicampo and Baumeister (2011, *JPSP*, 101, 667–683) showed that **merely formulating a specific plan for an unfulfilled goal eliminates the intrusive-thought and executive-interference effects** that unfulfilled goals otherwise produce. The effect requires specificity; vague intentions do not produce it. This finding has not been subjected to a pre-registered multi-lab replication, so the magnitude is uncertain, but it converges with Gollwitzer's implementation-intentions program (Gollwitzer, 1999; Gollwitzer & Sheeran, 2006, meta-analytic d ≈ 0.65) which has robust independent support. Together they form the empirical backbone for "externalize → flow returns" — Zeigarnik (1927) identified the tension; Masicampo–Baumeister showed plan-making releases it.

On scheduling, the **Pomodoro** convention (25/5 minutes) is a convention, not an optimized parameter. Biwer et al. (2023) found that structured breaks of any disciplined kind outperform unstructured self-paced work without showing Pomodoro-specific superiority. **Ultradian rhythms** — Kleitman's ~90-minute Basic Rest-Activity Cycle — are *biologically plausible* during wake but the direct cognitive-performance evidence is mixed (Kerkhof et al., 1996, *Physiology & Behavior*). Tony Schwartz's 90-minute-block prescription is a reasonable heuristic, not an established empirical optimum. **Decision fatigue** inherits the replication problems of ego depletion (see §4); the "hungry judges" study (Danziger et al., 2011, *PNAS*) has been critiqued on serious confounds (Weinshall-Margel & Shapard, 2011; Glöckner, 2016). Cal Newport's *Deep Work* (2016) operationalizes flow protection into four scheduling philosophies (monastic, bimodal, rhythmic, journalistic) and popularized attention-residue thinking; the prescriptions are generally evidence-concordant even if Newport's claims about "deep work hours as the metric" are stylized.

Working memory is the ultimate bottleneck. Miller's 7±2 (1956) was explicitly a rhetorical estimate; Cowan (2001, *BBS*, 24, 87–114) places the focus-of-attention capacity at approximately **four chunks** when rehearsal and long-term recoding are blocked. Sweller's Cognitive Load Theory (1988, 2010) distinguishes **intrinsic load** (inherent to the material) from **extraneous load** (imposed by poor presentation); the 2010 revision absorbed "germane load" into intrinsic, leaving only two independent sources. Interface decisions that force the user to track more than three to four distinct items simultaneously will fail for most users; chunking, externalization, and progressive disclosure are the primary mitigations.

### Design implications for Cadence

**Hard flow protection during Session flow state, with silent external-interruption suppression.** The one-pager already says "Flow state (silent, protected)"; formalize this as: no nudges, no Narrator commentary, no Reconciler reconciliation prompts, no notifications of any kind until a Breakpoint. This is not a UX preference; it is the Leroy-Monsell principle — the cost of a mid-flow interruption is measurable and carries into the next task.

**Ready-to-resume is a first-class primitive, not a side feature.** Every Marker should by default include three fields: *where I am*, *what's next*, *what's still open in my head*. The "what's still open" field is the Masicampo–Baumeister/Gollwitzer plan-release hook — it is how Cadence exploits one of the strongest findings in the literature on attention residue and unfulfilled goals. When the next Session recaps with "previously on…", the first utterance should be the ready-to-resume plan verbatim, not a summary. This minimizes Monsell's residual switch cost.

**Self-interruption is half the problem and must be addressed.** Mark's finding that self-interruption matches external-interruption in frequency means blocking notifications solves at most half. Cadence should offer an explicit "intrusive thought capture" affordance inside Flow state that does *not* break flow — a single keystroke that appends a typed Thought to a Parking Lot, with no agent response, no acknowledgment, no prompt to elaborate. The Thought is reconciled at the next Breakpoint. This is the single highest-leverage feature for a user whose attention shifts originate internally, as Kevin's technical-leader profile implies.

**Breakpoints are the ritual containers for all non-flow work.** Nudges, Reconciler prompts, wellbeing checks, and the ready-to-resume ritual all live at Breakpoints, not mid-Session. Default Breakpoint cadence should be user-configurable in the 45–90 minute range; 25-minute Pomodoros are fine for shallow work but are sub-ultradian for deep coding. Do not claim Pomodoro is empirically optimized — it isn't.

**Respect the four-chunk working memory ceiling.** The active Pursuit count, the Actions shown at Session start, the Leveraged Priority reminders — none should exceed three to four items visible at once. Cowan's limit is not a style preference; exceeding it means users will drop items or experience extraneous cognitive load that competes with the actual work.

**Hedge the flow-neurochemistry marketing copy.** If Cadence ships with an on-boarding narrative, do not promise dopamine/anandamide cocktails or 500% productivity. Promise clear goals, immediate feedback, and protected blocks — the load-bearing evidence. The copy will age better.

---

## 3. The externalization argument: why a trusted system changes cognition

### What the research actually says

The strongest empirical convergence across the productivity canon is on externalization. David Allen's "mind like water" metaphor rests on the claim that unfulfilled commitments consume working memory until captured and trusted to a system; Tiago Forte's "second brain" (CODE: Capture, Organize, Distill, Express; PARA organization); Sönke Ahrens' Zettelkasten (fleeting → literature → permanent notes, atomic, linked, bottom-up); and Niklas Luhmann's original slip-box (which produced ~70 books from ~90,000 cards) all make variants of the same claim: the mind is bad at storage and good at having ideas, and externalizing state frees cognition for idea-having. The Zeigarnik (1927) and Masicampo–Baumeister (2011) findings give this folk wisdom a mechanism — unfulfilled goals produce executive interference that a specific plan releases.

The frameworks disagree on *what* to externalize. GTD externalizes **commitments and next actions**; Zettelkasten/BASB externalize **ideas and connections**; OKRs (Doerr, 2018, *Measure What Matters*; origin in Grove's *High Output Management*) externalize **intentions and measurement**. Forte's PARA and Ahrens' atomic notes represent a deeper disagreement: PARA is **action-oriented** (projects, areas, resources, archives; process just-in-time); Zettelkasten is **idea-oriented** (link notes by semantic relationship; bottom-up project emergence). Critics at zettelkasten.de argue progressive summarization under-engages with ideas; BASB practitioners counter that Zettelkasten over-engineers for people whose output is not scholarly writing. Both arguments contain truth, and both systems can be combined.

The cascade structure — yearly/quarterly/monthly/weekly/daily — appears in multiple frameworks. Win the Week (Bentley & Bentley, 2022) prescribes a ~30-minute weekly planning ritual around a single **leveraged priority** (from Keller & Papasan's *The ONE Thing*) aimed for early-week completion, with calendar interrogation, task triage, and supply-demand matching. GTD's Horizons of Focus run from ground (actions) up through purpose/principles at six altitudes. OKRs run quarterly with ambitious (stretch, 0.7-is-good) and committed (1.0-expected) variants, explicitly **decoupled from compensation** to prevent sandbagging. Covey's Quadrant II (important/not urgent) and the "big rocks" metaphor are the same argument in a 2x2.

Weekly rituals have a weaker empirical base than the canonical books imply — most evidence is author-reported case studies — but they are consistent with three better-established findings. First, reference-class forecasting (Flyvbjerg, Garbuio & Lovallo, 2009) as a remedy for the **planning fallacy** (Kahneman & Tversky, 1979; Buehler, Griffin & Ross, 1994, *JPSP*, 67, 366–381): a weekly review structurally forces the "outside view" that the daily view misses. Second, implementation-intention setting (Gollwitzer & Sheeran, 2006): the weekly review produces "if-then" plans that reliably improve follow-through. Third, small-wins celebration (Amabile & Kramer, 2011, *The Progress Principle*): the strongest predictor of positive "inner work life" in their 12,000-entry diary study was daily progress in meaningful work, which weekly rituals operationalize.

### Design implications for Cadence

**The Reconciler is the Zeigarnik-release engine.** Its job is not bookkeeping; its job is to ensure every Thought, blocker, and open loop captured during any Session is either (a) converted into a specific plan (time, place, mechanism — Gollwitzer-specificity, not a vague "look at later"), (b) parked on a Someday list with a review date, or (c) discarded with a reason. Anything left ambiguous continues to consume executive function. Reconciler prompts should use the Gollwitzer frame: *"If [cue], then I will [specific response]."*

**Cadence's hierarchy (Pursuit > Project > Action) is the GTD-horizons compression.** Make the full hierarchy optional but name the levels explicitly so users can expand when needed: **Purpose (Why) > Pursuit (3–5 year vision / OKR-O) > Project (quarter / OKR-KR) > Session (week or sub-project) > Action (next action) > Thought (capture)**. The one-pager under-specifies the top and bottom of this stack. "Purpose" is where Sinek's Golden Circle lives (see §6). "Thought" is where BASB's Capture and Zettelkasten's fleeting notes live.

**Reflect ritual = Get Clear + Get Focused, formalized as GTD weekly review + Win-the-Week leveraged-priority selection + PPCo on open Pursuits.** Get Clear does the convergent inbox-to-zero work (GTD). Get Focused does the leveraged-priority selection (Bentley) plus a mandatory **outside-view pass** on estimation — "what has a project of this class actually taken in the past?" — to mechanically correct for the planning fallacy. Reconciler should surface the three Pursuits most overdue relative to their original estimates; this is how Cadence pays Kahneman's rent.

**Narratives are the "Distill" and "Express" stages of CODE.** If Cadence auto-generates narratives at Session close, they are the compressed, progressively summarized form of the raw Session log — exactly what Forte calls Distillation. Export of narratives (to journal, to post, to weekly review) is Expression. The Reconciler plus Narrator pair is a PARA-Zettelkasten hybrid: PARA-like actionable projects on one axis, Zettelkasten-like linked Thoughts forming a second, emergent structure.

**Leveraged Priority should be scoped at the Pursuit level, not the week.** The Bentleys' one-leveraged-priority-per-week rule works in a corporate calendar but under-fits Kevin's model of long-horizon Pursuits. Cadence's version: each Pursuit has a rolling Leveraged Priority (the one Project whose completion unlocks the rest); each week has a Leveraged Session (the one block whose completion unlocks the Pursuit's Leveraged Priority). This nests cleanly and maps onto Theory-of-Constraints thinking — see §5.

---

## 4. Habits, motivation, and the measurement paradox

### What the research actually says

James Clear's *Atomic Habits* (2018) is a disciplined synthesis rather than original research. The habit loop (cue → craving → response → reward) is drawn from Duhigg's popularization of Graybiel's basal-ganglia work. The 4 Laws (make it obvious / attractive / easy / satisfying) are well-chosen heuristics with varying underlying evidence — the "obvious" law is supported by Wood and Neal (2007) on context-cue automaticity; the "easy" law by behavioral-activation and effort-cost literatures; the "satisfying" law by immediate-reward research. Identity-based habits ("every action is a vote for the person you want to become") is a restatement of self-concept theory. The "plateau of latent potential" is an intuition pump rather than a finding. Two claims need hedging: the popular "21 days to form a habit" is a misread of Maxwell Maltz's 1960 post-surgical adjustment data; Lally et al. (2010, *European Journal of Social Psychology*) gave the better estimate — median 66 days, range 18–254, high behavior-type variance. "Missing once is an accident, missing twice is the start of a habit" has weak empirical support; Lally et al. found a single missed day had negligible effect.

Simon Sinek's *Start With Why* (2009) is most useful as a communication heuristic. Sinek's neurological claim that Why maps to the limbic system and What maps to the neocortex is **widely rejected by neuroscientists**; modern neuroscience does not support strict functional localization of "emotional decision-making" to the limbic system. The Golden Circle as a *framing device* for motivation is still valuable; the underlying neuroscience is not.

Dweck's growth/fixed mindset work is more contested than the popular treatment suggests. Mueller and Dweck (1998, *JPSP*) showed praise-for-intelligence harms subsequent performance relative to praise-for-effort. But Sisk et al. (2018, *Psychological Science*, k = 273 correlation studies and k = 43 intervention studies) found mindset-intervention effects of d ≈ 0.08, with high heterogeneity. Macnamara and Burgoyne (2023) extended this to 63 studies (N ≈ 97,672) and found d ≈ 0.05, with the highest-quality subsample at d ≈ 0.02 (non-significant). Yeager and Dweck (2020) dispute these conclusions for targeted interventions on struggling students, where moderator effects do appear. The honest reading is that mindset effects, if real, are small and specific; a productivity tool should not promise them.

Self-Determination Theory (Deci & Ryan) is more empirically robust and more consequential for tool design than any of the above. The theory posits three basic psychological needs — **autonomy, competence, relatedness** — whose satisfaction drives intrinsic motivation and whose thwarting degrades it. Deci, Koestner, and Ryan's (1999, *Psychological Bulletin*) meta-analysis of 128 studies found engagement-contingent, completion-contingent, and performance-contingent tangible rewards significantly undermined free-choice intrinsic motivation (d ≈ –0.28 to –0.40), while positive verbal feedback *enhanced* both free-choice behavior (d ≈ +0.33) and interest (d ≈ +0.31). Lepper, Greene, and Nisbett's (1973) original **overjustification effect** study in preschoolers established the pattern.

Gamification inherits this ambivalence. Hamari, Koivisto, and Sarsa's (2014) review found ~62.5% positive motivational effects but highly context-dependent. Sailer and Homner's (2020, *Educational Psychology Review*) meta-analysis gave g ≈ 0.49 on cognitive outcomes and g ≈ 0.36 on motivational outcomes. The effects are real but brittle; when the extrinsic scaffold is removed, intrinsic motivation can end up lower than baseline. **Goodhart's Law** ("when a measure becomes a target, it ceases to be a good measure"; Goodhart, 1975) and Ries' *Lean Startup* critique of vanity metrics formalize the same risk at the organizational level.

Amabile and Kramer's Progress Principle (2011) cuts through this with a simple empirical result from their 12,000-entry diary study: **progress in meaningful work** was the single strongest positive predictor of inner work life. Crucially, when they surveyed managers on what they thought motivated people, progress ranked *last* — managers systematically underweight exactly the thing that matters most. **Catalysts** (clear goals, autonomy, resources) and **nourishers** (respect, encouragement) support progress; their inverses kill it.

The behavioral-activation literature (Lewinsohn; Jacobson; Martell; Dimidjian et al., 2006, *JCCP*, 74, 658–670 — BA comparable to antidepressant medication and superior to cognitive therapy for severely depressed patients) establishes the general principle that **action precedes motivation**, not the reverse. BJ Fogg's *Tiny Habits* operationalizes this as minimum-viable-action, converging with Clear's 2-minute rule. **Implementation intentions** (Gollwitzer, 1999; Gollwitzer & Sheeran, 2006, d ≈ 0.65) and WOOP/MCII (Oettingen's extension: Wish, Outcome, Obstacle, Plan) give the concrete format — *if [situation], then I will [behavior]* — that converts intention into behavior more reliably than goal-setting alone.

### Design implications for Cadence

**Design for autonomy, competence, and relatedness — not for streaks and badges.** The SDT evidence is that explicit gamification rewards for core behaviors can *reduce* the behaviors when rewards are withdrawn. Cadence's metrics should serve the user's own sensemaking, not the tool's retention. This means: no streak counters that punish missed days; no leaderboards; no "points" for Sessions logged. What can be shown is **progress**: Amabile's finding says surfacing visible forward motion (Projects advanced, Pursuits closed, Thoughts resolved) is the highest-yield motivational feedback, and it does not trigger overjustification because it measures what the user actually wants to measure anyway.

**The Narrator's job is competence feedback, not praise.** Drawing on Deci, Koestner & Ryan (1999), positive verbal feedback *enhances* intrinsic motivation where tangible rewards suppress it — so Narrator-generated reflection should describe what happened in specific, informative terms ("you unblocked the worktree issue you identified Tuesday; the Pursuit is one Project from completion") rather than in evaluative terms ("great work!"). Specific, informational feedback is the SDT-compatible mode.

**Nudges must be implementation-intentions, not reminders.** Generic reminders are low-yield; if-then structures are high-yield (Gollwitzer & Sheeran, 2006). A Nudge should be phrased: *"When you open the orchestrator tomorrow, your first Session is [Project X], starting with [Action Y]."* Cadence should **construct** these nudges from captured Markers plus user-configured triggers, not ask the user to write them. WOOP-style prompts during Reflect — wish, outcome, obstacle, plan — can generate nudges for obstacles the user anticipates.

**Minimum-viable-action as a first-class starting mode.** Borrowing from behavioral activation and Fogg: when a Session opens on a Project the user has avoided for N days, the Steward should offer a **two-minute entry**: the smallest possible first move. "Open the file. Read the last function. That's the Session if you want it to be." The research on action-precedes-motivation says this is often the unlock.

**Habits should be scaffolded, not hardcoded.** Lally et al.'s 18-254 day range warns against any UI that treats habit formation as a deterministic countdown. A user should be able to define habit stacks (Clear's "after [current habit], I will [new habit]") that Cadence honors, but the tool should never punish drift. The cage-becomes-routine failure mode is a real SDT violation of autonomy; see §7 on failure modes.

**Drop or soft-pedal Sinek's neuroscience; keep the Golden Circle as framing.** In Pursuit creation, allow the user to specify Why (purpose), How (approach/values), What (output). This is useful structure. Do not market it as "limbic brain alignment."

---

## 5. WIP limits, Theory of Constraints, and the special case of creative work

### What the research actually says

Little's Law (1961) — WIP = throughput × cycle time — is the structural backbone for Kanban and Theory of Constraints. For a stable system, reducing WIP at constant throughput proportionally reduces cycle time. David Anderson's Kanban method and Jim Benson and Tonianne DeMaria Barry's **Personal Kanban** (2011) build on two rules: *visualize work* and *limit WIP*. The empirical logic is sound for stationary systems with roughly homogeneous work items (code tickets, manufacturing); variability in item size degrades predictive accuracy.

Goldratt's Theory of Constraints (*The Goal*, 1984) generalizes: every system has exactly one binding constraint at a time; local optimization of non-constraints is waste; throughput (money generated by sales) matters, not inventory or operating expense. The Five Focusing Steps — identify, exploit, subordinate, elevate, return — operationalize this.

The application to creative work is where the research thins. Half-finished brainstorms, open ideation threads, and speculative explorations do not behave like code tickets. The Sio–Ormerod (2009) meta-analysis on incubation shows that **setting problems aside is often productive**, not wasteful; low-demand interpolated activity during incubation produces the largest effects; misleading cues during preparation *amplify* the benefit of incubation. The DMN/ECN research (Beaty et al., 2015, 2016) suggests that parallel low-intensity background exploration is exactly what the default-mode system is optimized to do. So strict WIP limits applied to ideation would cut off the biological substrate of creative cognition.

The prescriptive resolution: **WIP limits apply to convergent work-in-progress but not to divergent thinking**. A half-finished Ideation Session that generated 40 seeds is not waste; the seeds are incubating. A half-finished Development Session that has three candidate designs in active evaluation *is* a WIP problem because convergent attention is being split. A half-finished Execution Session on code is a WIP problem in the strict Kanban sense. This distinction is not in the popular Personal Kanban literature but follows from combining the TOC logic with Beaty/Sio/Ormerod.

Kahneman's planning fallacy (see §3) compounds the WIP risk. Buehler et al. (1994) found only ~30% of students finished projects by their own "best estimate" date; even at 99% confidence, predictions were vastly below actuals. Reference-class forecasting (outside view) is the best-supported remedy.

### Design implications for Cadence

**Enforce WIP limits on Projects and convergent Sessions, not on Pursuits and not on Ideation.** Cadence should default to a small number — three to five — of *active* Projects (in Development or Execution). Pursuits can number many more because they may be incubating. Ideation Sessions accumulate Thoughts freely; their presence is not a Kanban violation.

**Make the constraint visible.** Borrowing from TOC, Cadence should offer a "what's the binding constraint today?" view — the Project most blocking the Pursuit's Leveraged Priority. This is typically not the most urgent Project, which is why the user doesn't see it without the tool. The Reconciler is the natural home for this calculation.

**Outside-view estimation, structurally.** When the user creates an Action, the Steward should prompt: *"What's the closest past Action and how long did it actually take?"* This forces reference-class framing (Flyvbjerg-style) without lecturing about the planning fallacy. The tool stores actuals and offers them on request.

**Allow ideation without penalty.** A Pursuit can sit in Clarification or Ideation for weeks; the Reconciler should not nag. Only when a Pursuit has been in Development for more than N Sessions without convergence should the Guide prompt for decision — that is a genuine convergent-WIP problem.

---

## 6. Purpose, narrative, and identity — the Narrator mode

### What the research actually says

Dan McAdams' narrative identity model (*The Redemptive Self*; McAdams & McLean, 2013, *Current Directions in Psychological Science*, 22, 233–238) treats the life story as a third level of personality, above dispositional traits and characteristic adaptations. Narrators who construct stories featuring **redemptive meanings, personal agency, and exploration** show higher mental health, well-being, and generativity. Agency and communion are the two fundamental thematic axes. Redemption sequences (bad → good) and contamination sequences (good → bad) have large, empirically established correlations with well-being in opposite directions.

Pennebaker's expressive-writing paradigm (Pennebaker & Beall, 1986, *Journal of Abnormal Psychology*, 95, 274–281) showed that four 15-minute writing sessions about deepest thoughts and feelings about a difficult experience produced fewer physician visits over six months. Pennebaker's (2017, *Perspectives on Psychological Science*) overall effect size estimate across 100+ studies is approximately **d = 0.16** — small but consistent. A *Frontiers* 2023 review noted three later meta-analyses with null results; effects depend on writer engagement, emotion-acceptance instructions, trauma type, and individual moderators. So: narrative writing has real, small, conditional effects on health and identity; it is not a panacea.

Sinek's Golden Circle (see §4) fits here as a framing tool for purpose even if its neuroscience is weak. For a technical leader, explicit articulation of *Why* at the Pursuit level provides a stable anchor that intrinsically motivates sustained effort (SDT, autonomy + identity alignment).

Reflection is easily contaminated by rumination. Trapnell and Campbell (1999, *JPSP*, 76, 284–304) distinguished reflection (openness-linked, philosophical self-exploration) from rumination (neuroticism-linked, repetitive maladaptive self-focus); both are independent factors, and rumination correlates with depression, anxiety, and shame while reflection correlates with empathy and growth. Tasha Eurich's *Insight* (2017) popularized a practical intervention — replace **"Why?"** questions (which trigger post-hoc storytelling and often rumination) with **"What?"** questions (which generate observable data and action steps). Eurich's support is mostly from trade books and her survey data, not peer-reviewed papers under her authorship, and should be cited with that caveat; the underlying Trapnell–Campbell distinction is robust.

Spaced repetition and the testing effect inform the "previously on..." recap. Cepeda et al. (2006, *Psychological Bulletin*) meta-analyzed 317 experiments and established the **spacing effect** with the critical nuance that optimal inter-study interval scales with desired retention interval — longer memory goals require longer gaps between reviews. Roediger and Karpicke (2006) established the **testing effect**: at delays of two days or longer, prior testing produces substantially greater retention than repeated study (meta-analytic g ≈ 0.50–0.61). Students persistently misjudge this, preferring rereading — an "illusion of competence" (Karpicke, Butler & Roediger, 2009).

### Design implications for Cadence

**Narrator generates narratives in a Pennebaker-compatible form, not a marketing form.** Narrator output at Session close should include: *what happened* (the factual trace), *what it meant to you* (the reflective layer — invited but not forced), *what shifted* (agency — what did you cause? where did you exercise choice?), and *what's next* (continuity). The structure mirrors McAdams' narrative-identity prompts, avoids Eurich-rumination traps (no "why did this go poorly?" default), and instantiates Pennebaker's engagement-plus-acceptance recipe.

**Redemption-aware, not Pollyanna.** The research shows it is *redemptive meaning-making* that predicts well-being, not artificial positivity. Narrator should be willing to frame a hard Session honestly ("you fought a test harness for four hours and didn't ship — what did you learn that unblocks tomorrow?") and avoid "great job!" optimism that Deci–Koestner–Ryan's undermining data predict will backfire.

**Reflect ritual uses "What" questions by default.** Eurich-Trapnell: Guide prompts during Reflect should be *What did you do? What worked? What got in the way? What's the next concrete step?* — not *Why did you fail?* The Reconciler and Guide should avoid "why" prompts in reflection contexts; use "why" only during Pursuit creation where it serves Sinek's purpose-articulation function.

**"Previously on..." should be spacing-aware and testing-enhanced.** Cepeda's optimal-ISI finding suggests the recap at Session start should not always be the most recent Marker; when a Pursuit has been dormant, a slightly earlier or deeper recap is more retention-productive. Roediger-Karpicke's testing effect suggests an occasional **active recap** — the Narrator asks "what do you remember about where this Project left off?" before providing the Marker. This is a low-friction retrieval-practice primitive and measurably improves long-term retention of project context.

**Narrative export is a first-class output.** Building-a-Second-Brain's Express stage argues that expression (publishing, sharing, re-using) is where knowledge work produces its highest returns. Cadence should make exporting a Pursuit Narrative — the full diverge/converge/plan/execute arc of a completed Pursuit — into a blog post, a retro document, or a standalone essay a one-command operation. This closes CODE.

**Purpose lives at the Pursuit level, Golden Circle style.** Each Pursuit has optional Why/How/What fields. The Guide can offer Sinek-style prompts when a Pursuit is created ("what becomes possible if this succeeds?") without making them mandatory. Autonomy-supportive, not prescriptive.

---

## 7. Failure modes and why productivity systems don't stick

### What the research actually says

The literature on why productivity systems fail is thinner than the literature on what they prescribe. Cal Newport's blog writings and several empirical threads converge on a short list. First, **system complexity beyond Cowan's four-chunk working memory** — systems that require the user to hold many states in mind at once fail because they impose exactly the extraneous cognitive load they purport to relieve. Second, **SDT violation** — systems that convert intrinsic work into extrinsically measured performance degrade the underlying motivation (Deci, Koestner & Ryan, 1999); over time the user resents the system. Third, **Goodhart/vanity metrics drift** — the tool starts measuring streaks, task counts, or time blocks, and the user begins optimizing the metric at the expense of the actual work. Fourth, **ritual decay** — weekly reviews that become perfunctory stop producing the reference-class-forecasting benefit (Buehler et al., 1994) they originally produced, and become performative. Fifth, **habit rigidity** — Clear-style habit stacks optimized for one context fail to transfer to another, and without explicit re-planning (WOOP/MCII; Oettingen) the user drops the habit entirely rather than adapting it. Sixth, **rumination capture** — a reflection journal that becomes a rumination loop (Trapnell & Campbell, 1999) is worse than no journal.

Checklist failure has its own literature. Gawande's *The Checklist Manifesto* (2009) distinguishes **Read-Do** checklists (perform each step as read) from **Do-Confirm** (perform from memory, pause-point confirm), with five-to-nine items, one page, precise language. The WHO Surgical Safety Checklist reduced surgical mortality by 47% and complications by 36% across eight pilot hospitals. Checklists fail when they become bureaucratic rather than functional, when they grow past nine items, or when pause points are not respected.

### Design implications for Cadence

**Fight complexity as a first principle.** Every feature added to Cadence consumes Cowan-budget. The Reconciler, Nudges, Markers, Thoughts, Narratives, and Reflect already approach the working-memory limit; adding more is actively harmful. Kill features rather than accreting them.

**No streaks, no leaderboards, no scoring of Sessions.** This is the Goodhart guardrail, not a style choice.

**Reflect must be light enough to sustain.** A 30-minute Win-the-Week ritual is acceptable; a 90-minute GTD weekly review is not, for most users, long-term. Cadence should offer a **low-friction Reflect default** and a heavier variant for users who want it, and should measure its own ritual's effectiveness by whether the user returns to it — not by whether they checked every box.

**Ritual prompts rotate to prevent decay.** If Reflect always asks the same three questions, they lose their effectiveness. Draw on Oblique Strategies — see §8 — to inject variation into Reflect prompts.

**Checklists for standardized phases.** The Session-start ritual, the Marker ritual, the Reflect ritual are natural Gawande checklists — five to nine items, precise language, defined pause points. Keep them short. Do not create a checklist culture around creative work.

---

## 8. Prompt design for divergent thinking — the Oblique Strategies pattern

### What the research actually says

Brian Eno and Peter Schmidt's Oblique Strategies (1975) is the cleanest existing model for **randomized, tangential creative provocations**. The mechanism, as Eno describes on the original card, is to disrupt fixation by supplying a prompt whose appropriateness is initially unclear; the prompt is trusted even without immediate relevance. Example cards: "Honor thy error as a hidden intention." "Use an old idea." "Retrace your steps." "Be less critical more often." "Do the last thing first." "What would your closest friend do?" The design principle is **oblique**, not direct — prompts that would be applicable to almost any creative situation because they operate at a meta level.

SCAMPER (Eberle, 1971, drawing on Osborn's original idea-spurring questions in *Applied Imagination*) is the **direct** version: Substitute, Combine, Adapt, Modify/Magnify, Put to other uses, Eliminate, Reverse/Rearrange. "How might we...?" questions (Stanford d.school; Puccio) convert problems into invitations to ideate. Forced analogies/connections — "when you look at this unrelated object, what ideas do you get for your problem?" — exploit analogical transfer.

LLMs can serve this role but with a documented risk. Doshi and Hauser (2024, *Science Advances*) found GPT-4 story ideas made individual writers more creative — especially less-creative writers — but made stories *collectively more similar*. Anderson, Shah, and Kreminski (2024, ACM Creativity & Cognition) replicated the homogenization in ideation tasks; users produced more ideas but more similar ones and felt less ownership. Meincke, Mollick, and Terwiesch (2024) measured cosine similarity of LLM brainstorming pools at 0.26–0.43 versus ~0.24 for MBA human pools; Chain-of-Thought prompting substantially narrowed the gap. Kumar et al. (2025, *Nature Human Behaviour*) confirmed ChatGPT reduces idea diversity. The general phenomenon is termed **mode collapse** in LLM output.

The practical implication: LLMs are **convergent anchors**. If the user brainstorms with the LLM too early, the LLM's distribution compresses the user's distribution. The evidence-concordant approach is to use the LLM for *convergent refinement* — Development-phase work: PPCo, criteria analysis, stakeholder mapping, counter-argument generation — and to protect the *divergent phase* by either withholding LLM output until after the user has generated independently, or by using the LLM specifically as an **Oblique-Strategies-style tangential prompter** rather than as an idea generator.

### Design implications for Cadence

**The Provocateur/Guide-Diverge mode uses an Oblique-Strategies deck, not free LLM generation.** A curated set of tangential prompts (SCAMPER derivatives, "how might we" frames, forced analogies, Eno-style obliques, Six-Hats role cards) is drawn — pseudo-randomly — during Ideation Sessions. This avoids the Doshi-Hauser homogenization trap because the prompt perturbs the user's own associative search rather than generating candidate ideas directly. The deck can be extended by the user and shared across projects.

**Divergent prompts are timed and rotated.** Research on incubation (Sio & Ormerod, 2009) and the creative cliff (Lucas & Nordgren, 2020) suggests injecting a fresh provocation roughly every 8–12 minutes during an Ideation Session — specifically when fluency visibly slows — unlocks deeper categories. Guide-Diverge should offer but not force.

**Guide-Converge uses the LLM for PPCo, criteria matrix, pre-mortem, and stakeholder analysis** — tasks where LLMs are strong (structured critique and elaboration) and where their convergent bias is an asset rather than a liability.

**Divergent work happens independently first, convergent work with LLM assistance second.** At the Pursuit level: Ideation Session generates Thoughts with the Provocateur supplying prompts but *not* candidate ideas; Development Session then invokes the LLM to organize, cluster, critique, and select from what the user produced. This inverts the naive "just ask Claude" pattern and is directly supported by the 2024–2025 LLM homogenization literature.

**Nudges can be Oblique.** When a Pursuit stalls, the Nudge need not be "work on Pursuit X"; it can be a card from the deck — "Do the last thing first." — and let the user's own associative machinery do the work. This is a light, high-leverage pattern that the one-pager's Nudge primitive already permits.

---

## 9. CLI-native interaction design and cognitive load

### What the research actually says

Sweller's Cognitive Load Theory (1988, 2010) and Cowan's (2001) four-chunk working memory limit together set hard constraints on interface design. **Intrinsic load** (inherent to the task) cannot be reduced, only scaffolded; **extraneous load** (imposed by poor presentation) can and must be reduced. Every visual element, every stateful menu, every unlabeled command consumes the same limited resource the user needs for the actual work. Split-attention, redundancy, and transient dialogs are the three classical CLT anti-patterns.

CLIs have specific advantages for deep work. They minimize visual extraneous load (no chrome, no notifications, no infinite pools). They are **journalable** — every command and output is textual, greppable, and diff-able, which supports the externalization arguments of GTD/BASB/Zettelkasten directly. They are **composable** — the user's own shell scripts, aliases, and pipelines extend the tool without the tool's consent, which supports SDT-autonomy. They are **scriptable** — automations can be built without tool-vendor permission.

CLIs have specific disadvantages that the research identifies. Recall vs. recognition: the user must remember commands, which consumes working memory. Discoverability: novices cannot find features that menus would surface. Error cost: typos produce invalid commands rather than corrected suggestions. Mode ambiguity: without visible state, the user may not know which mode the tool is currently in, which directly violates the DMN/ECN switching clarity the creative work requires (Beaty et al., 2025).

### Design implications for Cadence

**Commands should follow Gawande checklist rules at the primitive level.** Short (5–9 components per command), precise names, defined pause points (confirmations on destructive operations, not on routine ones). Verb-noun ordering is Cowan-friendly because the user holds two chunks rather than an arbitrary string.

**Mode must be visible at all times.** The shell prompt, the TUI header, or the status line must show which Session mode is active (Ideation / Development / Execution / Reflect) and which agent mode is responding (Steward / Guide / Narrator / Provocateur). This is not decoration; it is the only way the user can reliably match their own cognitive mode to the tool's mode, which is what the DMN/ECN switching research says is the load-bearing capacity.

**"Previously on..." is multi-resolution.** The recap at Session start should default to terse (one sentence + ready-to-resume plan) and expand to full Narrative on request. This respects Sweller's extraneous-load discipline while allowing the user to pull more context when working memory needs more scaffolding.

**Undo everything.** Markers, Thoughts, and Session-level state should be trivially reversible. This reduces the cognitive cost of experimentation, which is essential for divergent work.

**No notifications. No badges. No unread counts.** The Gloria Mark self-interruption data says the user's attention will fragment whether or not the tool helps; the tool's job is not to add to the fragmentation.

**Local-first + markdown is evidence-concordant.** The GTD/Zettelkasten/BASB literature all converge on durable, portable, user-owned state. SQLite + markdown satisfies this directly. Export should be trivial; lock-in should be absent. This is an SDT-autonomy argument as much as a technical one.

---

## 10. What the one-pager is missing — specific, prescriptive

Cadence's one-pager covers: Pursuit > Project > Action hierarchy, Session/Marker/Thought primitives, Reflect (Get Clear + Get Focused), Narratives, Nudges, Reconciler, Leveraged Priority, three agent modes, two-layer architecture, local-first storage. The gaps flagged by the research:

**Ideation is absent as a first-class Session type.** The one-pager has Sessions for execution but no named container for divergent work. Add an **Ideation Session** whose contract is Osborn-rules (defer judgment, quantity, build-on), whose agent is Provocateur/Guide-Diverge, whose output is a Thought-cluster, and whose closure is a hand-off to a Development Session. This is the single highest-priority gap.

**Development is absent as a distinct phase.** The one-pager goes from capture to execution without a convergent evaluation step. Add a **Development Session** whose contract is PPCo, criteria-matrix, pre-mortem, stakeholder mapping, whose agent is Guide-Converge, and whose output is a selected-and-plannable candidate.

**The ready-to-resume plan is not an explicit Marker field.** Add three structured fields to every Marker: *where*, *next*, *open*. The "open" field is the Masicampo–Baumeister exploit and must be prompted.

**Purpose at the top of the hierarchy is not named.** Add optional Why/How/What fields at the Pursuit level. This anchors SDT autonomy and gives the Narrator material to work with.

**Narrator's prompts are under-specified.** Commit to McAdams-compatible structure (what-happened / what-it-meant / what-shifted / what's-next), Eurich "what" questions in reflection, and explicit redemption-aware framing. Rule out generic praise.

**Reflect must have rumination guardrails.** The Reconciler and Guide should not allow Reflect to become a "why did I fail?" loop; the "what" reframe is a tool-level default.

**Measurement is under-specified and vulnerable.** The one-pager should explicitly commit to *no streaks, no scores, no leaderboards*; surface Amabile progress only, and frame feedback as competence-informational rather than evaluative. This is the SDT guardrail.

**WIP limits are not differentiated by mode.** Apply strict WIP to active Projects in Development/Execution; allow unrestricted incubation in Ideation; surface the TOC-style binding-constraint view.

**Oblique prompt deck is not yet a primitive.** Build it. It is the highest-leverage piece of infrastructure for the Provocateur mode and solves the LLM-homogenization problem structurally.

**Planning-fallacy correction is not a structural feature.** Add outside-view estimation prompts (Flyvbjerg reference classes) at Action creation; store actuals; surface drift at Reflect.

**Spaced recap is not yet a primitive.** The "previously on..." feature should use Cepeda's ISI scaling and Roediger-Karpicke retrieval practice occasionally. Both are robust and cheap.

**Self-interruption capture affordance is not explicit.** A single keystroke, inside Flow, that adds a typed Thought to the Parking Lot without any agent response. This is half the attention-problem.

---

## 11. Resolving the divergent-vs-GTD tension — prescriptive

Kevin's core question was whether divergent creative thinking and GTD-style capture-and-clarify can be integrated in one system without contamination. The research answers yes, conditionally, with four rules:

First, **mode must be explicit and ritually separated**. The Double Diamond's four phases (Discover / Define / Develop / Deliver), Puccio's four CPS phases, and de Bono's one-hat-at-a-time rule all converge on this. Cadence should never allow a Session to be simultaneously divergent and convergent; the Session type determines the mode, the agent behaves accordingly, and the user knows which mode they are in at all times.

Second, **GTD-style capture is downstream of CPS-style ideation, not upstream**. The sequence is Ideation Session → Development Session → (candidate emerges) → Project created → GTD machinery (Actions, contexts, Waiting-Fors, Weekly Review) takes over. Capture-first is correct *within* a Session, not across the lifecycle of a Pursuit. The one-pager currently treats Pursuits as if they arrive fully formed; they should arrive from CPS.

Third, **Thoughts captured in divergent mode must be held and protected, not reconciled immediately**. The Reconciler's hunger for convergence is useful during Execution and dangerous during Ideation. A Thought seeded in Ideation belongs to a cluster, not an Action list, until Development. The tool should track Thought type (seed / concern / criterion / note / blocker) and refuse to flatten them.

Fourth, **the LLM is a convergent anchor and must be deployed accordingly**. Doshi-Hauser and Anderson-Shah-Kreminski give the empirical ground: LLMs raise the floor of individual creativity but compress its variance. Use LLMs for Development, Execution, and Narration — tasks where convergence and structured elaboration are the job. Use a curated Oblique-Strategies-style deck of prompts, not free LLM generation, during Ideation.

If Cadence implements these four rules, the tension dissolves: GTD-style capture-and-clarify becomes the second half of a larger diverge/converge pipeline, and both halves get the mode protection they need.

---

## 12. Convergences across frameworks — the strong signals

Across everything researched, the convergences — places where independent frameworks agree — are the highest-confidence design targets:

- **Externalization releases cognitive load.** Allen's mind-like-water, Forte's second brain, Ahrens' thinking partner, Masicampo–Baumeister's plan-making-releases-Zeigarnik, Gollwitzer's implementation intentions, Leroy's ready-to-resume — six frameworks, one mechanism.
- **Mode separation between generation and evaluation.** Puccio's CPS, d.school's five modes, the Double Diamond, de Bono's hats, the DMN/ECN neural account, Osborn's original brainstorming rules, Ellamil et al.'s fMRI generation-vs-evaluation data — seven frameworks, one claim.
- **Small, visible progress is the motivational backbone.** Amabile-Kramer progress principle, Clear's compounding/plateau of latent potential, Fogg's tiny habits, behavioral activation's action-precedes-motivation, SDT competence need — five frameworks, one lesson.
- **Specific plans outperform vague intentions.** Gollwitzer's implementation intentions, WOOP/MCII, Leroy's ready-to-resume, GTD's concrete next actions, OKR's key results — five frameworks, one prescription.
- **Ritualized reflection beats ad-hoc introspection if it avoids rumination.** GTD's weekly review, Win the Week's ritual, Make Time's nightly notes, Trapnell-Campbell's reflection-not-rumination, Eurich's what-not-why — five frameworks, one conditional rule.

## 13. Incongruences — where frameworks contradict

- **Bottom-up vs top-down goal structure.** GTD builds up from captured actions; OKRs cascade down from objectives. Cadence should offer both, letting Pursuits be authored either way.
- **System vs goal.** Clear says "forget about goals, focus on systems"; Sinek says start with Why; Doerr's OKRs are explicitly goal-oriented. Both are partially right: systems sustain execution; purpose sustains systems. Cadence should not force the user to pick.
- **Daily vs weekly cadence.** Make Time is daily-first; Win the Week is weekly-first; GTD is continuous-plus-weekly. Cadence should support both rhythms; the Breakpoint-Marker structure is already flexible enough to do so.
- **Mindset effects.** Popular treatments claim large; meta-analyses (Sisk et al., 2018; Macnamara & Burgoyne, 2023) show small and contested. Do not market mindset; do structure feedback so that it is informational (growth-compatible) rather than evaluative (fixed-compatible).
- **Ego depletion / decision fatigue / Kotler neurochemistry.** All three are contested or unreplicated; do not build Cadence's explanations on them.

## Conclusion — the prescription

Cadence's existing one-pager is two-thirds of what the research supports — it gets externalization, mode-visible flow protection, local-first autonomy, and progress-oriented feedback broadly right. The missing third is a structural commitment to the **diverge → converge → plan → execute** pipeline upstream of the existing Project/Action machinery, manifested as Ideation and Development Session types with their own agent mode (Provocateur or Guide-Diverge/Guide-Converge), an Oblique-Strategies-style prompt deck that deliberately avoids using the LLM for divergent generation (which the 2024–2025 literature shows homogenizes output), Masicampo–Baumeister ready-to-resume fields on every Marker, Eurich-aware "what" prompts in Reflect, explicit mode-differentiated WIP limits, and outside-view estimation that pays rent on Kahneman's planning fallacy.

The deepest insight from the research is not in any single framework but in the pattern of convergence. The cognitive science of attention (Leroy, Mark, Sweller, Cowan), the cognitive science of creativity (Guilford, Beaty, Dietrich, Paulus-Nijstad), the psychology of motivation (Deci-Ryan, Amabile, Gollwitzer), and the design literature (Puccio, Double Diamond, Gawande) agree on one thing: **the mind works better when its modes are separated, its open loops are externalized, its feedback is informational rather than evaluative, and its rituals are specific rather than performative.** Cadence is already aligned with three of those four. Adding the first — explicit mode separation with a real divergent phase — is the design move that makes the system coherent, and it is the move the user already sensed was missing.