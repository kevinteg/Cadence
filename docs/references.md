# Cadence v3 Design References

*Research foundations mapped to design patterns. Each entry answers: what does Cadence do, what research supports it, and how the research shaped the design.*

---

## 1. One voice, verb-defined registers

**Pattern:** A single agent with behavioral modes (Steward, Guide, Narrator) rather than separate agents. Sessions carry an explicit mode attribute (Ideation, Development, Execution, Reflect) that changes the agent's register. Mode is always visible to the user.

| Research | Key finding |
|----------|-------------|
| Guilford (1950), APA Presidential Address | Divergent production (many varied answers) and convergent production (narrowing to one answer) are dissociable cognitive processes. Mixing them degrades both. |
| Beaty et al. (2016), *Trends in Cognitive Sciences* | Creative thought requires dynamic coupling between the Default Mode Network (spontaneous association) and the Executive Control Network (evaluation). These networks are ordinarily antagonistic. Flexibility of switching between them predicts creative ability. |
| Puccio, Murdock & Mance (2010), *Creative Leadership* | Creative Problem Solving (CPS) structures every phase as a divergent pass (Osborn rules: defer judgment, quantity, wild connections, build) followed by a convergent pass (affirmative judgment, deliberate, check objectives). "Trying to do both at once is a mess." |
| UK Design Council (2005), Double Diamond | Four-phase pipeline: Discover (diverge) -> Define (converge) -> Develop (diverge) -> Deliver (converge). Mode boundaries must be explicit and ritually enforced. |
| De Bono (1985), Six Thinking Hats | One thinking mode at a time, facilitator-enforced, short durations. Green (creative), Yellow (benefits), Black (critique) run serially, never in parallel. |

**Application in Cadence:** The agent never runs divergent and convergent processes simultaneously. Ideation sessions suppress evaluation language and hold concerns on a Parking Lot. Execution sessions suppress divergent tangents. The mode attribute on each session determines which register the agent speaks in, matching the user's cognitive mode to the tool's behavior. This is the DMN/ECN switching principle made operational.

---

## 2. Brainstorm with provocation deck (no LLM generation)

**Pattern:** During Ideation sessions, the agent draws from a curated deck of tangential prompts (SCAMPER frames, Oblique Strategies, forced analogies, "How might we..." reframes) rather than generating candidate ideas directly.

| Research | Key finding |
|----------|-------------|
| Doshi & Hauser (2024), *Science Advances* | GPT-4 story ideas made individual writers more creative but made stories collectively more similar. LLMs raise the floor but compress variance. |
| Anderson, Shah & Kreminski (2024), ACM Creativity & Cognition | Replicated homogenization in ideation tasks. Users produced more ideas but more similar ones and felt less ownership. |
| Kumar et al. (2025), *Nature Human Behaviour* | Confirmed ChatGPT reduces idea diversity. The phenomenon is termed "mode collapse" in LLM output. |
| Eno & Schmidt (1975), Oblique Strategies | Randomized, tangential creative provocations disrupt fixation by supplying prompts whose relevance is initially unclear. Operates at a meta level: "Honor thy error as a hidden intention," "Do the last thing first." |
| Eberle (1971) / Osborn (1953), SCAMPER | Structured idea-spurring checklist: Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse. Direct provocations versus Oblique Strategies' indirect ones. |
| Lucas & Nordgren (2020), *PNAS* | Creative cliff illusion: people believe ideation productivity is collapsing when later ideas are typically more original. They quit early. Interventions that push past the perceived cliff unlock better ideas. |

**Application in Cadence:** The provocation deck perturbs the user's own associative search rather than generating ideas for them. This avoids the Doshi-Hauser homogenization trap. Prompts are timed to inject roughly every 8-12 minutes when fluency slows, pushing past the creative cliff. The LLM is reserved for convergent refinement in Development sessions (PPCo, criteria analysis, pre-mortem) where its convergent bias is an asset. Divergent work happens independently first; convergent work with LLM assistance second.

---

## 3. Marker three-field format (Where / Next / Open)

**Pattern:** Every session marker captures three structured fields: *Where I Was* (current state), *What's Next* (concrete next steps), and *Loose Threads* (what is still open in the user's head). The recap at session start reads the ready-to-resume plan verbatim before anything else.

| Research | Key finding |
|----------|-------------|
| Leroy (2009), *OBHDP* | Attention residue: cognitive activation from Task A persists after switching to Task B. Residue is greater under time pressure. The prior task literally contaminates the new one. |
| Leroy & Glomb (2018), *Organization Science* | A brief "ready-to-resume" plan (writing where you are and what you will do next before switching) measurably reduces attention residue on the next task. |
| Zeigarnik (1927) | Uncompleted tasks are remembered better than completed ones because they produce ongoing cognitive tension. The mind keeps rehearsing unfinished business. |
| Masicampo & Baumeister (2011), *JPSP* | Merely formulating a specific plan for an unfulfilled goal eliminates the intrusive-thought and executive-interference effects the goal otherwise produces. The plan must be specific; vague intentions do not work. |
| Gollwitzer (1999); Gollwitzer & Sheeran (2006) | Implementation intentions (if-then plans) improve goal follow-through with meta-analytic effect size d = 0.65. Specificity is the active ingredient. |

**Application in Cadence:** The "Loose Threads" field is the Masicampo-Baumeister exploit. Writing down what is still unresolved releases the Zeigarnik tension so the user can stop working without the open loop continuing to consume executive function. The "What's Next" field creates a Gollwitzer-grade specific plan. On resumption, reading the ready-to-resume plan verbatim minimizes Monsell's residual switch cost and Leroy's attention residue. The marker is not a summary; it is a cognitive handoff protocol.

---

## 4. Flow protection during /do

**Pattern:** During active flow state within a session: no nudges, no Narrator commentary, no Reconciler prompts, no notifications of any kind until a Breakpoint. The tool goes silent and protects the user's unbroken attention.

| Research | Key finding |
|----------|-------------|
| Csikszentmihalyi (1990), *Flow* | Optimal experience requires clear proximal goals, immediate feedback, and challenge-skill balance. The most actionable conditions a tool can instantiate are goals and feedback. The state is fragile and easily disrupted. |
| Mark, Gudith & Klocke (2008), CHI; Mark (2023), *Attention Span* | Knowledge workers switch activities every ~3 minutes. Self-interruption frequency approximately equals external-interruption frequency. Recovery from interruption takes substantial time (qualitative finding: many minutes, not seconds). |
| Monsell (2003), *Trends in Cognitive Sciences* | Task-switch costs have a residual component that preparation time can shrink but never eliminate. Every switch has an irreducible penalty. |
| Dietrich (2004), *Psychonomic Bulletin & Review* | Transient hypofrontality: deep absorption states involve reduced prefrontal activity. Interruptions force prefrontal re-engagement, breaking the state. Has meta-analytic support for motor tasks; weaker as universal mechanism but conceptually grounded. |

**Application in Cadence:** Flow protection is not a UX preference; it is the Leroy-Monsell principle enforced as architecture. During flow state, the system accumulates observations silently and delivers them only at breakpoints. Breakpoints are user-configurable in the 45-90 minute range. No Pomodoro defaults are imposed (Biwer et al. 2023 found structured breaks help but Pomodoro-specific timing is not empirically optimized). The tool refuses to be one of Gloria Mark's interruption sources.

---

## 5. Flow-safe /capture

**Pattern:** A single-keystroke affordance inside flow state that appends a typed Thought to a Parking Lot with no agent response, no acknowledgment, no prompt to elaborate. The Thought is reconciled at the next Breakpoint.

| Research | Key finding |
|----------|-------------|
| Mark (2008, 2023) | Self-interruption frequency matches external interruption. Blocking notifications solves at most half the attention problem. The other half comes from the user's own intrusive thoughts. |
| Zeigarnik (1927) / Masicampo & Baumeister (2011) | Unfulfilled goals produce intrusive thoughts. Writing down a specific plan releases the tension. Even minimal externalization (capturing the thought) reduces the cognitive load. |

**Application in Cadence:** The /capture command targets the internal-interruption half of Mark's finding. When a thought intrudes during flow, the user externalizes it in one motion, the Zeigarnik loop closes, and flow continues unbroken. The tool deliberately withholds any response because even an acknowledgment would force a context switch. This is the highest-leverage single feature for a user whose attention shifts originate internally.

---

## 6. Narrative generation (McAdams structure)

**Pattern:** Narrator output follows a four-part structure: *what happened* (factual trace), *what it meant* (reflective layer, invited not forced), *what shifted* (agency -- what the user caused or chose), and *what's next* (continuity). Framing is redemption-aware, not artificially positive.

| Research | Key finding |
|----------|-------------|
| McAdams & McLean (2013), *Current Directions in Psychological Science* | Narrative identity is a third level of personality. People who construct stories featuring redemptive meanings, personal agency, and exploration show higher well-being and generativity. Redemption sequences (bad -> good) predict well-being; contamination sequences (good -> bad) predict the opposite. |
| Pennebaker & Beall (1986); Pennebaker (2017) | Expressive writing about difficult experiences produces small but consistent health benefits (d = 0.16 across 100+ studies). Effects depend on engagement and emotion-acceptance. Four 15-minute sessions is the canonical protocol. |
| Deci, Koestner & Ryan (1999) meta-analysis | Evaluative praise undermines intrinsic motivation. Positive verbal feedback enhances it (d = +0.33). The difference is informational vs. controlling. "Great work!" backfires; "you unblocked the issue you identified Tuesday" does not. |

**Application in Cadence:** The Narrator describes what happened in specific, informative terms rather than evaluative ones. It frames hard sessions honestly ("you fought the test harness for four hours -- what did you learn that unblocks tomorrow?") rather than offering empty encouragement. The four-part structure mirrors McAdams' narrative-identity prompts and instantiates Pennebaker's engagement-plus-acceptance recipe. Redemption-aware means the Narrator helps the user find meaning in setbacks without manufacturing false positivity.

---

## 7. Reflect language rules ("what" not "why")

**Pattern:** During the Reflect ritual, all agent prompts default to "what" questions: *What did you do? What worked? What got in the way? What's the next concrete step?* The word "why" is reserved for Pursuit creation where it serves purpose-articulation.

| Research | Key finding |
|----------|-------------|
| Trapnell & Campbell (1999), *JPSP* | Reflection and rumination are independent factors, not a single dimension. Reflection (openness-linked, philosophical self-exploration) correlates with empathy and growth. Rumination (neuroticism-linked, repetitive maladaptive self-focus) correlates with depression, anxiety, and shame. |
| Eurich (2017), *Insight* | "Why?" questions trigger post-hoc storytelling and often spiral into rumination. "What?" questions generate observable data and action steps. Replacing "Why did this go poorly?" with "What happened?" changes the cognitive process from self-flagellation to analysis. (Based on Eurich's survey data; underlying Trapnell-Campbell distinction is peer-reviewed.) |

**Application in Cadence:** The Reflect ritual is structurally protected against becoming a rumination loop. The Reconciler and Guide never ask "why did you fail?" during reflection. "Why" appears only during Pursuit creation (Sinek's Golden Circle as framing device, minus the debunked neuroscience claims) where it serves a purpose-articulation function distinct from self-evaluation.

---

## 8. No gamification guardrails

**Pattern:** No streak counters, no leaderboards, no points for sessions logged, no scoring of any kind. Cadence shows progress in meaningful work, not metrics about tool usage.

| Research | Key finding |
|----------|-------------|
| Deci & Ryan, Self-Determination Theory | Three basic psychological needs drive intrinsic motivation: autonomy, competence, relatedness. Thwarting any of them degrades motivation. External controls undermine autonomy. |
| Lepper, Greene & Nisbett (1973), overjustification effect | Children who received expected rewards for drawing (an activity they already enjoyed) subsequently drew less in free-choice periods than unrewarded children. Expected tangible rewards turn play into work. |
| Deci, Koestner & Ryan (1999), *Psychological Bulletin* | Meta-analysis of 128 studies: engagement-contingent, completion-contingent, and performance-contingent tangible rewards significantly undermined free-choice intrinsic motivation (d = -0.28 to -0.40). |
| Goodhart (1975) / Goodhart's Law | "When a measure becomes a target, it ceases to be a good measure." Streak counters make the streak the goal instead of the work. Users optimize the metric at the expense of what it was supposed to measure. |

**Application in Cadence:** Gamification rewards for core behaviors can reduce those behaviors when rewards are withdrawn. The SDT evidence makes this a structural guardrail, not a style preference. Cadence's metrics serve the user's own sensemaking. The tool never punishes missed days or celebrates arbitrary milestones. This protects autonomy and prevents the system from becoming something the user resents.

---

## 9. Informational feedback, not evaluative praise

**Pattern:** The Narrator and Guide provide specific, descriptive feedback ("you advanced three projects this week; the pursuit is one project from completion") rather than evaluative judgment ("great job!" or letter grades).

| Research | Key finding |
|----------|-------------|
| Deci, Koestner & Ryan (1999) | Positive verbal feedback enhances free-choice intrinsic motivation (d = +0.33) and interest (d = +0.31). But the feedback must be informational (conveys competence) not controlling (conveys evaluation). The distinction matters: same words, different framing, opposite effects. |
| Amabile & Kramer (2011), *The Progress Principle* | In a 12,000-entry diary study, progress in meaningful work was the single strongest positive predictor of inner work life. When managers were surveyed on what motivates people, progress ranked last. People systematically underweight the thing that matters most. |

**Application in Cadence:** The system surfaces visible forward motion: projects advanced, pursuits closed, thoughts resolved. This is the highest-yield motivational feedback per Amabile, and it does not trigger overjustification because it measures what the user actually cares about. The Narrator describes what happened in specific terms; it does not grade or praise. This is the SDT-compatible mode that enhances rather than undermines intrinsic motivation.

---

## 10. WIP limits on projects, not pursuits or ideas

**Pattern:** Cadence enforces a small WIP limit (3-5) on active Projects in Development or Execution. Pursuits can number many more. Ideation sessions and Thoughts accumulate freely without WIP pressure.

| Research | Key finding |
|----------|-------------|
| Little (1961), Little's Law | WIP = throughput x cycle time. For a stable system, reducing WIP at constant throughput proportionally reduces cycle time. Fewer things in progress means each finishes faster. |
| Goldratt (1984), *The Goal* / Theory of Constraints | Every system has exactly one binding constraint at a time. Local optimization of non-constraints is waste. The Five Focusing Steps: identify, exploit, subordinate, elevate, return. |
| Benson & Barry (2011), *Personal Kanban* | Two rules: visualize work and limit WIP. Applied to individual knowledge work, not just manufacturing or software teams. |
| Sio & Ormerod (2009), meta-analysis on incubation | Setting problems aside is often productive for creative work. Low-demand interpolated activity during incubation produces the largest effects. Strict WIP limits on ideation would cut off the biological substrate of creative cognition. |

**Application in Cadence:** The resolution is mode-differentiated WIP. A half-finished Ideation session with 40 seeds is not waste; the seeds are incubating (Sio-Ormerod). A half-finished Execution session with three parallel code tasks is a WIP problem in the strict Kanban sense. Pursuits in Clarification or Ideation can sit for weeks without the Reconciler nagging. Only when convergent work (Development, Execution) exceeds the WIP limit does the system intervene. This combines TOC discipline with the neuroscience of creative incubation.

---

## 11. Closure as Zeigarnik-release event

**Pattern:** Project completion follows a deliberate protocol: all Definition of Done items checked, agent confirms with the user, status updated, milestone acknowledged. Completion is derived from the checklist, not declared arbitrarily.

| Research | Key finding |
|----------|-------------|
| Zeigarnik (1927) | Uncompleted tasks produce ongoing cognitive tension and are remembered (rehearsed) more than completed ones. Completion releases the tension. |
| Masicampo & Baumeister (2011) | A specific plan releases the same tension as actual completion. But actual completion is the clean release. Incomplete projects with no plan are the worst case: maximum cognitive drag. |
| Gollwitzer (1999), implementation intentions | Specificity is the active ingredient. A concrete definition of "done" (the checklist) makes completion unambiguous, preventing the "is this really done?" loop that would sustain Zeigarnik tension. |
| Gawande (2009), *The Checklist Manifesto* | Checklists work when they are 5-9 items, one page, precise language, with defined pause points. Read-Do vs. Do-Confirm formats. The WHO Surgical Safety Checklist reduced mortality by 47%. Checklists fail when they become bureaucratic or grow past nine items. |

**Application in Cadence:** The Definition of Done is a first-class Gawande-style checklist. Completion is derived (all items checked), not self-reported. The agent confirms completion as a ritual pause point. This creates an unambiguous Zeigarnik-release event: the open loop closes cleanly. The user's mind can let go of the project because the system confirms it is genuinely done. The acknowledgment matters because it marks the transition from "in progress" to "resolved" at the cognitive level.

---

## 12. Leveraged Priority

**Pattern:** Each week's Reflect ritual identifies a single Leveraged Priority -- the one thing whose completion would unlock the most downstream progress. Each Pursuit has a rolling Leveraged Priority (the one Project whose completion unblocks the rest).

| Research | Key finding |
|----------|-------------|
| Keller & Papasan (2013), *The ONE Thing* | "What's the ONE thing I can do such that by doing it everything else becomes easier or unnecessary?" Focusing question forces prioritization by leverage, not urgency. |
| Goldratt (1984), Theory of Constraints | Every system has exactly one binding constraint. Optimizing anything other than the constraint is waste. The Leveraged Priority IS the binding constraint translated into personal productivity. |
| Bentley & Bentley (2022), *Win the Week* | ~30-minute weekly planning ritual centered on a single leveraged priority aimed for early-week completion. Supply-demand matching on the calendar. The priority is set during the ritual, not discovered ad hoc. |

**Application in Cadence:** The Leveraged Priority nests across levels: the Pursuit's Leveraged Priority is the Project most blocking progress; the week's Leveraged Session is the block whose completion unlocks that Project. This maps Theory of Constraints thinking onto the personal hierarchy. The Reconciler surfaces the binding constraint -- typically not the most urgent item, which is exactly why the user needs the tool to see it.

---

## 13. 2-minute rule

**Pattern:** When a session opens on a project the user has been avoiding, the Steward offers a minimum-viable-action entry: the smallest possible first move. "Open the file. Read the last function. That's the session if you want it to be."

| Research | Key finding |
|----------|-------------|
| Allen (2001/2015), *Getting Things Done* | If an action takes less than two minutes, do it now rather than tracking it. The overhead of tracking exceeds the cost of doing. Applied here as a session-start heuristic, not just a triage rule. |
| Behavioral activation (Dimidjian et al. 2006) | Action precedes motivation, not the reverse. BA was comparable to antidepressant medication for severely depressed patients. Starting -- even minimally -- changes the motivational state. |
| Fogg (2019), *Tiny Habits* | Minimum-viable-action: make the behavior so small it requires almost no motivation. "After I [anchor], I will [tiny behavior]." Scales up naturally once started. |

**Application in Cadence:** The 2-minute entry is a behavioral activation technique. The research says the unlock for avoidance is not more motivation but a smaller first action. When the Steward detects a dormant project, it offers entry at the lowest possible threshold. This is not about efficiency (GTD's original framing); it is about overcoming the activation energy barrier that prevents sessions from starting at all.

---

## 14. If-then Nudges

**Pattern:** Nudges are phrased as implementation intentions: "When you open the orchestrator tomorrow, your first session is [Project X], starting with [Action Y]." Cadence constructs these from markers and user-configured triggers rather than asking the user to write them.

| Research | Key finding |
|----------|-------------|
| Gollwitzer & Sheeran (2006), meta-analysis | Implementation intentions (if-then plans) have a meta-analytic effect size of d = 0.65 for goal attainment. This is a large, robust effect across many domains. Generic goal intentions are far less effective. |
| Oettingen (2014), WOOP / MCII | Wish, Outcome, Obstacle, Plan. Mental contrasting with implementation intentions outperforms positive visualization alone. The "obstacle" step is critical: identifying what could go wrong and pre-committing to a response. |

**Application in Cadence:** Generic reminders ("work on Project X") are low-yield. If-then structures are high-yield. Cadence constructs nudges from captured markers plus user-configured triggers, using the Gollwitzer format. During Reflect, WOOP-style prompts (wish, outcome, obstacle, plan) generate nudges for anticipated obstacles. The system does the formatting work because the research shows the structure matters more than the content.

---

## 15. Graduation gates (Why / DoD / Concreteness)

**Pattern:** Project creation walks through a structured sequence: Which pursuit? (routing) What does done look like? (Definition of Done checklist) What's the first action? (concreteness). Pursuits optionally specify Why / How / What fields.

| Research | Key finding |
|----------|-------------|
| Sinek (2009), Golden Circle (as framing tool) | Why -> How -> What as a communication and motivation structure. The neuroscience claims (limbic/neocortex mapping) are rejected; the framing heuristic for purpose-articulation is useful. Explicit "why" at the Pursuit level provides a stable motivational anchor. |
| Allen (2001/2015), GTD Natural Planning Model | Purpose -> principles -> vision -> brainstorm -> organize -> next actions. Projects that skip purpose and vision produce vague actions. The natural planning sequence front-loads clarity. |
| Gollwitzer (1999), implementation intentions | Specificity is the active ingredient. A vague project ("improve the API") fails where a concrete one ("API returns paginated results with cursor tokens; integration test passes") succeeds. The Definition of Done forces Gollwitzer-grade specificity. |

**Application in Cadence:** The graduation gates prevent under-incubated projects from entering the execution pipeline. The Why question (Sinek, minus neuroscience) anchors motivation. The DoD question (Gollwitzer) forces specificity. The first-action question (Allen) creates an immediate entry point. Lightweight projects can move quickly through these gates; strategic ones get the full treatment. The gates exist because the research shows vague intentions do not produce the cognitive effects (plan-release, implementation-intention follow-through) that specific ones do.

---

## 16. PPCo in /develop

**Pattern:** Development sessions use the Pluses-Potentials-Concerns-Overcome (PPCo) framework: what is good about this idea, what potential does it have, what concerns exist, how might we overcome each concern. The LLM assists with structured critique.

| Research | Key finding |
|----------|-------------|
| Puccio (2014), Creative Problem Solving | PPCo is the CPS convergent-evaluation tool. It replaces binary yes/no judgment with a structured progression: acknowledge strengths before identifying concerns, then actively problem-solve each concern rather than using it as a kill reason. Prevents premature idea death. |
| Klein (2007), pre-mortem technique | "Imagine the project has failed. What went wrong?" Prospective hindsight generates 30% more reasons for failure than standard risk assessment (Mitchell, Russo & Pennington 1989). Complements PPCo's "Concerns" phase. |

**Application in Cadence:** The LLM's convergent bias becomes an asset during Development. It is strong at structured critique, criteria analysis, and stakeholder mapping -- exactly what PPCo requires. The pre-mortem ("imagine this failed") catches risks that optimistic planning misses. Development sessions are where the LLM earns its keep, precisely because convergent elaboration is what the task demands and what LLMs do well.

---

## 17. Working memory ceiling (4 chunks)

**Pattern:** No Cadence view shows more than 3-4 items at once. Active pursuit count, actions at session start, leveraged priority reminders -- all respect the chunk limit. Progressive disclosure provides depth on demand.

| Research | Key finding |
|----------|-------------|
| Cowan (2001), *Behavioral and Brain Sciences* | The focus of attention holds approximately four chunks when rehearsal and long-term recoding are blocked. Miller's 7 +/- 2 (1956) was a rhetorical estimate; Cowan's four is the empirically grounded figure. |
| Sweller (1988, 2010), Cognitive Load Theory | Intrinsic load (inherent to the material) cannot be reduced. Extraneous load (imposed by poor presentation) can and must be reduced. Every interface element consumes the same limited resource the user needs for actual work. The 2010 revision collapsed "germane load" into intrinsic, leaving two independent sources. |

**Application in Cadence:** This is not a style preference; it is a hard constraint. Exceeding four items means users will drop information or experience extraneous cognitive load that competes with their work. The "previously on..." recap defaults to terse (one sentence + ready-to-resume plan) and expands on request. Feature additions are evaluated against the Cowan budget: every new visible element must justify the chunk it consumes. The Reconciler, Nudges, Markers, Thoughts, Narratives, and Reflect already approach the limit.

---

## 18. Externalization as cognitive relief

**Pattern:** The entire system is built on the premise that capturing commitments, plans, and open loops into a trusted external store frees cognitive resources for actual thinking. Markdown is the source of truth. Local-first, user-owned, portable.

| Research | Key finding |
|----------|-------------|
| Allen (2001/2015), GTD "mind like water" | Unfulfilled commitments consume working memory until captured and trusted to a system. The mind is bad at storage and good at having ideas. Externalization frees cognition for idea-having. |
| Forte (2022), *Building a Second Brain* | CODE: Capture, Organize, Distill, Express. Knowledge work produces highest returns at the Express stage (publishing, sharing, reusing). Action-oriented organization (PARA) processes just-in-time. |
| Ahrens (2017) / Luhmann, Zettelkasten | Atomic, linked, bottom-up notes. Fleeting -> literature -> permanent. The slip-box is a thinking partner, not a filing cabinet. Luhmann produced ~70 books from ~90,000 cards. Idea-oriented rather than action-oriented. |
| Masicampo & Baumeister (2011) | The mechanism: unfulfilled goals produce executive interference (intrusive thoughts, impaired performance on current tasks). A specific plan for the goal eliminates the interference. This is *why* externalization works, not just *that* it works. |

**Application in Cadence:** Six independent frameworks converge on one mechanism: externalization releases cognitive load. Allen gives the commitment layer (next actions, waiting-for). Forte gives the knowledge layer (distill, express). Ahrens gives the idea layer (atomic, linked thoughts). Masicampo-Baumeister gives the mechanism (plan-specificity releases Zeigarnik tension). Cadence implements all three layers -- Pursuits/Projects/Actions for commitments, Thoughts for ideas, Narratives for expression -- in a local-first markdown store that satisfies the SDT autonomy requirement (user-owned, portable, no lock-in) and the Zettelkasten durability requirement (plain text, git-friendly, outlives any tool).

---

## Cross-cutting convergences

Five findings appeared across multiple patterns above. These are the highest-confidence design targets because independent research programs agree:

| Signal | Frameworks that converge | Cadence features it grounds |
|--------|--------------------------|----------------------------|
| Externalization releases cognitive load | Allen, Forte, Ahrens, Masicampo-Baumeister, Gollwitzer, Leroy | Markers, Thoughts, /capture, Parking Lot, ready-to-resume plans |
| Mode separation between generation and evaluation | Guilford, Beaty et al., Puccio CPS, Double Diamond, De Bono, Osborn, Ellamil et al. | Verb-defined registers, Ideation vs. Execution sessions, provocation deck |
| Small visible progress is the motivational backbone | Amabile-Kramer, Clear, Fogg, behavioral activation, SDT competence | Informational feedback, no gamification, Narrator structure |
| Specific plans outperform vague intentions | Gollwitzer, WOOP/MCII, Leroy, GTD next actions, OKR key results | If-then nudges, DoD checklists, marker three-field format |
| Ritualized reflection beats ad-hoc introspection (if it avoids rumination) | GTD weekly review, Win the Week, Trapnell-Campbell, Eurich | Reflect with "what" questions, rotating prompts, rumination guardrails |
