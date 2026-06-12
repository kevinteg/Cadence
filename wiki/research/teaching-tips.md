# Cadence Library: 130 Quotes, Concepts & Loading-Screen Tips

A categorized library mined from Kevin's reading list and the Cadence design philosophy (Pursuit > Project > Action; Ideas adjacent to the work hierarchy; Captures, Reflections, Narratives; Reconciler; Leveraged Priority; one agent voice with verb-defined contracts). Each entry is sized for in-product surfacing. Direct quotes are in quotation marks and attributed; everything else is paraphrase or distilled concept.

> **Vocabulary note (2026-05-01 v1.1 alignment pass):** This document was originally drafted before v3's voice collapse and the Session/Marker removal in build-cadence-v1. It has been updated to reflect current vocabulary: "Steward", "Narrator", and "Guide" are now "the agent" (in the relevant verb's register, e.g., during `/promote`, `/develop`, `/reflect`, `/narrate`); "Sessions" as a Cadence primitive has been replaced by project work or deep work sessions (lowercase, the general concept) — the project file IS the durable state; "Markers" have been replaced by project Notes-section entries and completion notes. Content is preserved as research; only labels are modernized. Canonical current vocabulary lives in `cadence-plugin/cadence-runtime.md`.

---

## A. Setting the "Why" — Pursuit-Level Framing

1. **The Golden Circle.** Sinek's claim is causal: "People don't buy WHAT you do; they buy WHY you do it." (*Start with Why*, Ch. 3). **Cadence:** Agent prompt (during `/promote` Idea→Pursuit) when user creates a new Pursuit — auto-ask for the Why before the What.
2. **Why precedes how.** Sinek argues the inspired order is Why → How → What, mirroring the limbic-then-neocortex path of decision (*Start with Why*). **Cadence:** Pursuit creation form orders the fields Why / How / What in that sequence.
3. **A Pursuit without a Why decays into busywork.** Paraphrase of Sinek's warning that companies losing clarity of Why "start to deteriorate." **Cadence:** Reconciler flags Pursuits whose Why field hasn't been touched in 90 days.
4. **"Ideas are easy. Execution is everything."** — John Doerr, *Measure What Matters*. **Cadence:** Agent tip (during `/narrate`) when user has 5+ Pursuits but no Actions logged this week.
5. **Objectives = WHAT, Key Results = HOW we know.** Distilled OKR rule from Doerr (*Measure What Matters*, Ch. 2). **Cadence:** Pursuit template prompts for one objective + 3–5 measurable Key Results.
6. **"It's not a key result unless it has a number."** — Marissa Mayer, quoted in Doerr's *Measure What Matters*. **Cadence:** Validation hint when a user enters a vague KR.
7. **Pursuits should be inspirational; KRs should be uncomfortable.** Doerr's heuristic: "If you're certain you're going to nail it, you're probably not pushing hard enough." **Cadence:** Agent asks "Is this a stretch?" on KR commit.
8. **Less is more.** Andy Grove (via Doerr): "A few extremely well-chosen objectives impart a clear message about what we say 'yes' to and what we say 'no' to." **Cadence:** Soft-cap of 5 active Pursuits; warning above that.
9. **Personal-scale OKRs.** Doerr's frame translates to personal scale: Pursuits are objectives, Projects are KRs, Actions are the daily inputs. **Cadence:** Architectural guideline visible in onboarding.
10. **"We do not learn from experience . . . we learn from reflecting on experience."** — Doerr quoting Dewey, *Measure What Matters*. **Cadence:** Reflect ritual quote of the week.
11. **A clear Why survives the founder leaving.** Sinek paraphrase. **Cadence:** Yearly Pursuit review prompt — could a stranger continue this Pursuit from your notes?
12. **Pursuits as missions.** Newport's first-principle reduction: "Any attempt to succeed with our first principle of slow productivity must begin with the reduction of your main objectives." (*Slow Productivity*, Ch. 3). **Cadence:** Quarterly Pursuit pruning ritual.

---

## B. Capturing Intent — Before Project Work or an Action

13. **"Your mind is for having ideas, not holding them."** — David Allen, *Getting Things Done*. **Cadence:** Tooltip on the captures inbox.
14. **The two-minute rule.** Allen, *GTD*: if it takes less than two minutes, do it now; otherwise capture, defer, or delegate. **Cadence:** Captures triage — explicit "<2 min: do now" branch.
15. **Capture → Clarify → Organize → Reflect → Engage.** Allen's GTD workflow. **Cadence:** Maps directly to Captures → Triage → Idea/Action → Reflect → Project Work.
16. **"You must use your mind to get things off your mind."** — Allen, *GTD*. **Cadence:** Friction-free capture from any agent screen.
17. **Mind like water.** Allen, *GTD*: a relaxed mind that responds proportionally to input "doesn't overreact or underreact." **Cadence:** North-star phrasing for the Reflect ritual's "Get Clear" stage.
18. **Open loops cost RAM.** Allen: "as soon as you have two things to do stored in your RAM, you've generated personal failure." **Cadence:** Agent nudges user to capture stray thoughts before starting project work.
19. **"What is the very next physical, visible action required?"** — Allen, *GTD*. **Cadence:** Mandatory field on every Action; rejects "Plan X" placeholders.
20. **Audience-first communication = intent-first work.** Sullivan, *Simply Said*: "It's not about you, it's all about the value you can provide to others." Reframed for solo work: define who/what the artifact serves before generating it. **Cadence:** Agent prompt before kicking off a long agent run — "Who consumes this output?"
21. **One sentence, fewer than ten words.** Sullivan's rule for the core message of a presentation (*Simply Said*, Ch. 1). **Cadence:** Project Intent prompts begin from a one-sentence kernel before expanding into the full narrative.
22. **Most-important-info-first.** Sullivan: structure "main concept → key points → fundamental takeaways." **Cadence:** Narrate-recap template ordering.
23. **"Ask yourself, 'what's the one key takeaway I want everyone to leave with?'"** — Sullivan, *Simply Said*. **Cadence:** Pre-`/start` prompt — what is the one outcome from this work block?
24. **Clarify before you generate.** Allen on resistance: "Most people have a resistance to initiating the burst of energy that it will take to clarify the real meaning… of something they have let into their world." **Cadence:** Friction-by-design pause between "I have a thought" and "send to agent."
25. **A clear next step is half the work.** Mark Twain via Allen: "The secret of getting started is breaking your complex overwhelming tasks into small, manageable tasks." **Cadence:** Auto-decomposition agent action when a Project has zero Actions.
26. **Use your mind to think *about* things, not *of* them.** Allen, *GTD*. **Cadence:** Captures cleanup — if a capture is a reminder, convert it to a project Notes entry; if it's an idea, leave it as a Seed.

---

## C. Diverge / Explore — Opening the Solution Space

27. **Defer judgment, go for quantity, make connections, seek novelty.** Puccio's four principles for the divergence phase (*The Creative Thinker's Toolkit*, Lect. 5). **Cadence:** Diverge-mode agent checklist (during `/brainstorm`) before convergence.
28. **"Combining Opposites — Diverge, Then Converge."** Puccio (Lect. 4) frames the rhythm as deliberately switching modes, not blending them. **Cadence:** Project work can be framed as Diverge (`/brainstorm` register) or Converge (`/develop` register); the agent adopts a different posture for each.
29. **Lateral thinking is a survival skill.** Puccio (Lect. 2). **Cadence:** When stuck, agent suggests a `/brainstorm` pass on a sibling Project.
30. **Brainwriting beats brainstorming.** Puccio shows that silent parallel idea generation outperforms group talking (*Toolkit*, Lect. 10). **Cadence:** "Brainwrite with agent" mode — though Cadence's design rule is the agent does NOT generate ideas; the agent provokes via the deck and the user generates.
31. **Adaptors vs. Innovators.** Puccio's Kirton-derived distinction: do better, or do differently. **Cadence:** Project-creation prompt: are we doing this better, or doing it differently?
32. **Sampling beats specializing — early.** Epstein, *Range*, on athletes' "sampling period" before late specialization. **Cadence:** Encourage one exploratory Pursuit alongside the focused ones.
33. **"Lateral thinking with withered technology."** — Gunpei Yokoi, quoted in Epstein's *Range*. **Cadence:** Loading-screen tip when user is stuck on a hard new problem — "Old tools, new uses."
34. **"Test-and-learn, not plan-and-implement."** — Herminia Ibarra, quoted in *Range*. **Cadence:** Pursuit-discovery ritual: act first, then label.
35. **Birds and frogs both matter.** Freeman Dyson via Epstein: visionary birds see horizons; focused frogs solve problems one at a time. **Cadence:** Two agent register modes — bird (synthesis, during `/narrate` and `/reflect`) and frog (next-action, during `/start` and `/complete`).
36. **Wicked vs. kind environments.** Epstein, *Range*: in kind environments specialization wins; in wicked ones, generalists do. Most agentic engineering is wicked. **Cadence:** Reflect prompt — "Is this Project kind or wicked?" — guides whether to drill or to broaden.
37. **Analogical thinking.** Epstein: "Deep analogical thinking… recognizing conceptual similarities in multiple domains." **Cadence:** Diverge-mode prompt — "What is this Project like?"
38. **"What if we don't just think with our heads?"** — paraphrase of Annie Murphy Paul, *The Extended Mind*. **Cadence:** Loading-screen tip during `/brainstorm` — externalize before deciding.
39. **Externalize to iterate.** Paul: "Whenever possible, we should endeavor to transform information into an artifact… and then proceed to interact with it." (*The Extended Mind*). **Cadence:** Diverge work auto-creates a sketch surface alongside the agent stream.
40. **Sketches "talk back."** Paul on the iterative dialog between thinker and external representation (*The Extended Mind*, Pt. II). **Cadence:** Project Notes entries function as scratch sticky notes you can rearrange during `/reflect`.
41. **Quantity is a quality strategy.** Puccio's reframe: more options means a better best option. **Cadence:** Agent asks "We have 3 options — want 7?" before locking decisions.
42. **"A paradox of innovation and mastery is that breakthroughs often occur when you start down a road, but wander off."** — Epstein, *Range*. **Cadence:** Permission slip in Reflect: "What did you wander into this week that's worth keeping?"

---

## D. Converge / Decide — Narrowing and Committing

43. **Practice affirmative judgment.** Puccio's converge principle: judge, but for *what could work*, not what won't (*Toolkit*, Lect. 6). **Cadence:** In `/develop` mode, the agent replaces "no, because…" with "yes, if…"
44. **Keep novelty alive in convergence.** Puccio: don't let convergence kill the most interesting option. **Cadence:** `/develop` ritual asks user to mark one "wild card" before pruning.
45. **"Deciding what not to do is as important as deciding what to do."** — Cal Newport, *Slow Productivity*. **Cadence:** Reconciler weekly question — what did you decide NOT to do?
46. **"If we try to focus on everything, we focus on nothing."** — John Doerr, *Measure What Matters*. **Cadence:** Hard cap on concurrent active Projects per Pursuit.
47. **"Put more wood behind fewer arrows."** — Larry Page, quoted in *Measure What Matters*. **Cadence:** Loading-screen tip during weekly review.
48. **"Hire smart people so they can tell us what to do."** — Steve Jobs, quoted in *Measure What Matters*. Reframed: when delegating to a sub-agent, brief outcome, not procedure. **Cadence:** Agent briefing template emphasizes outcome + constraints, omits procedure.
49. **Leveraged priority.** Bentley, *Winning the Week*: pick the priority that "acts as a force multiplier"—reducing work this week and the next quarter. **Cadence:** This is already a Cadence ritual; surface the Bentley framing in onboarding.
50. **The daily list trap.** Bentley: "The daily to-do list is where high-impact tasks go to die." **Cadence:** Default planning unit is the Week, not the Day.
51. **Triage ruthlessly.** Bentley's "Triage Your Task List" stage forces three buckets: do, defer, delete. **Cadence:** Reconciler review imposes a three-bucket sort.
52. **"Roll a hard six."** Horowitz, *The Hard Thing About Hard Things*: wartime CEOs accept there's no contingency. **Cadence:** Reflect surface for moments when there are "no good moves" — name the chosen risk explicitly.
53. **"At the time of any given decision, the CEO will generally have less than 10 percent of the information."** — Horowitz, *The Hard Thing About Hard Things*. **Cadence:** Decision Notes record assumptions explicitly so future-you remembers what was unknown.
54. **Single Project per day.** Newport, *Slow Productivity*: "work on at most one project per day." **Cadence:** Daily focus selector defaults to 1 Project.
55. **Convergence is commitment.** Puccio: implementation planning is the unsung fourth stage of creative problem solving. **Cadence:** Converge work blocks end with a written commit message-style summary.

---

## E. Steering the Stream — Human-in-the-Loop on Agentic Work

56. **"Keep AI on the leash."** — Andrej Karpathy, YC AI Startup School keynote, June 2025. **Cadence:** Default agent posture; autonomy slider exposed per Project.
57. **"I'm still the bottleneck."** — Karpathy, same keynote, on verifying agent output. **Cadence:** Agent surfaces verification queues so the bottleneck is visible, not hidden.
58. **Iron Man suit, not Iron Man robot.** Karpathy's framing — partial-autonomy products with an autonomy slider and human verification. **Cadence:** Per-project work block "autonomy" setting from low (every step) to high (overnight).
59. **"An LLM agent runs tools in a loop to achieve a goal. The art of using them well is to carefully design the tools and loop."** — Simon Willison, *Designing agentic loops*, Sept 30, 2025. **Cadence:** A Cadence project work block IS that designed loop.
60. **"An AI agent is an LLM wrecking its environment in a loop."** — Simon Willison, same post. **Cadence:** Worktree isolation is non-negotiable; surface the wrecked-environment risk in onboarding.
61. **Coding agents are brute-force search.** Willison's framing: they explore solution-space at speed; the human's job is curation. **Cadence:** The agent's `/narrate` job is to summarize search, not narrate keystrokes.
62. **Move from "in the loop" to "on the loop."** Industry framing (Karpathy-adjacent, 2025–26): the human steers and oversees rather than approving each step. **Cadence:** Default Reflect cadence — daily helmsman check, not per-action approval.
63. **"With an orchestrated army of agents… you have removed yourself from the loop, so you don't even know that all the innocent booboos have formed a monster."** — Simon Willison endorsing on his agentic-engineering tag, 2025. **Cadence:** Reconciler mandates a human read-through before merge.
64. **Code like a surgeon.** Geoffrey Litt: stay in the loop for the critical incision; let agents do prep and grunt work. **Cadence:** Two agent posture verbs: "scrub in" (lead) vs. "delegate" (agent leads).
65. **Helmsman, not hostage.** Project-level framing: a helmsman feels the wind and the wheel; a hostage just watches the feed. **Cadence:** The agent's `/narrate` job is to compress the feed into helmsman-grade signal.
66. **"Cybernetic" steering.** Stafford Beer's Viable Systems Model adapted: the human is the meta-controller of agent loops, intervening only on dashboard violations. **Cadence:** Project Notes act as the dashboard; Nudges fire only when invariants break.
67. **Attention triage by salience, not recency.** Without curation, the most recent agent token wins your attention. **Cadence:** The agent surfaces by importance score, not chronology.
68. **Verification is the new craft.** When generation is cheap, the scarce skill is judging output. **Cadence:** Reflect ritual includes a "What did you verify?" prompt.
69. **Don't review every line — review every assumption.** Practitioner heuristic for agentic PRs. **Cadence:** Reconciler diff-view groups by intent, not by file.
70. **Two-layer architecture mirrors human cognition.** Orchestrator (System 2) plans; per-project work (System 1) executes. Kahneman's frame applied to agent stack. **Cadence:** Already core to design; surface the analogy in docs.

---

## F. Cognitive Ease & Attention Management

71. **System 1 / System 2.** Kahneman, *Thinking, Fast and Slow*: fast/automatic vs. slow/deliberate. **Cadence:** The agent in `/promote`, `/develop`, `/reflect` registers serves System 2; the agent in `/narrate` register serves as a System 1 prosthetic.
72. **"Recognize the signs that you are in a cognitive minefield, slow down, and ask for reinforcement of system 2."** — Kahneman, *TFAS*. **Cadence:** Nudge fires on patterns of error/oscillation in agent loops.
73. **Cognitive ease = reduced vigilance.** Kahneman: cognitive ease "links… to illusions of truth, pleasant feelings, and reduced vigilance." **Cadence:** Beware the polished agent answer that's wrong; Reconciler asks for one disconfirming check.
74. **WYSIATI — What You See Is All There Is.** Kahneman: "The confidence individuals have in their beliefs depends mostly on the quality of the story they can tell about what they see, even if they see little." **Cadence:** Agent planning prompt: "What's NOT in the context window?"
75. **"Intelligence is… the ability to find relevant material in memory and to deploy attention when needed."** — Kahneman, *TFAS*. **Cadence:** Cadence's project files and Captures ARE that external memory.
76. **"If you care about being thought credible and intelligent, do not use complex language where simpler language will do."** — Kahneman, *TFAS*. **Cadence:** Narrate style guide.
77. **Law of least effort.** Kahneman: people gravitate to the least demanding course of action. **Cadence:** Make the right action also the easy action; default to the leveraged priority.
78. **Anchoring bites.** Kahneman: arbitrary first numbers shape later judgment. **Cadence:** Agent separates "estimate" from "agent's first guess" to avoid auto-anchoring.
79. **Brain offloading is not weakness.** Annie Murphy Paul, *The Extended Mind*: "The human brain is limited in its ability to pay attention, limited in facility with abstract concepts, and limited in its power to persist." **Cadence:** Frame the trusted system not as crutch but as competence.
80. **"Cognitively congenial situations."** Paul, *The Extended Mind*, Pt. II: deliberately design your space to think well. **Cadence:** Encourage a per-Project workspace ritual (terminal, music, location).
81. **Movement breaks sharpen thought.** Paul: "Moderate-intensity exercise sharpens our mental faculties." **Cadence:** Long work-session timer recommends a movement break at ~50 min.
82. **"We offload some of our mental contents onto our hands when we gesture."** — Paul, *The Extended Mind*. **Cadence:** Voice-and-whiteboard input modes, not just text.
83. **Place-anchoring.** Paul cites that negotiators win 80% more value on their own turf. **Cadence:** Same chair, same hour, same agent for deep work sessions.
84. **Attention residue.** Cal Newport, *Deep Work*: "When switching tasks some of our attention remains attached to the previous task." **Cadence:** Worktree-per-Project isolates not just code but *attention*.
85. **Don't peek.** Newport: "even the very quickest of glances can actually be the worst" because residue is the cost. **Cadence:** Notification mute by default during work blocks.
86. **"Clarity about what matters provides clarity about what does not."** — Newport, *Deep Work*. **Cadence:** Tagline candidate for the Pursuits dashboard.

---

## G. Deep Work Sessions — Protecting Focused Time

87. **High-Quality Work = Time Spent × Intensity of Focus.** Newport's heuristic, *Deep Work*. **Cadence:** Work-session metric exposed in the narrate recap.
88. **Three to four hours, five days a week.** Newport's empirical ceiling for sustained deep work. **Cadence:** Default work block is 90 minutes; daily cap warning at 4h cumulative.
89. **Schedule shutdown, complete.** Newport's ritual to close the workday and let the brain restore. **Cadence:** End-of-day Reflect prompt closes open project work and writes a one-line "tomorrow first move."
90. **"Without structure, it's easy to allow your time to devolve into the shallow."** — Newport, *Deep Work*. **Cadence:** Default to time-blocked work over open-ended work.
91. **Single-tasking.** Newport: multi-tasking fragments cognition; one Project per work block. **Cadence:** UI hard-prevents two active project work blocks in different worktrees simultaneously.
92. **"Disciplined people are better at structuring their lives in a way that does not require heroic willpower."** — James Clear, *Atomic Habits*, paraphrased. **Cadence:** The trusted system is the discipline; willpower is reserved for the work.
93. **Environment > willpower.** Clear, *Atomic Habits*. **Cadence:** Per-Project workspace presets that mute Slack, open the right files, start the right agent.
94. **Drop the network tools.** Newport: "Schedule in advance when you'll use the Internet, and then avoid it altogether outside these times." **Cadence:** Work mode toggles a comms-block window.
95. **Boredom is a feature.** Newport, *Deep Work*: train the ability to tolerate non-stimulation; it's the soil for depth. **Cadence:** No "filler" agent chatter when an inner agent is thinking.
96. **Depth = craftsmanship.** Newport on Dreyfus & Kelly: craftsmanship reopens "a sense of sacredness" to work. **Cadence:** Frame Cadence as a craftsperson's tool, not a productivity dashboard.

---

## H. Reflect Ritual — Get Clear / Get Focused

97. **Weekly review = pre-vacation hygiene.** Allen, *GTD*: "Most people feel best about their work the week before their vacation… Do this weekly instead of yearly." **Cadence:** Weekly Reflect framed as "the Friday-before-vacation review."
98. **Five steps.** GTD's capture / clarify / organize / reflect / engage maps to Cadence's Reflect modes. **Cadence:** Reflect ritual checklist.
99. **30-minute weekly plan.** Bentley, *Winning the Week*: a 30-min weekly planning session beats hours of daily list-making. **Cadence:** Reflect ritual time-boxed to 30 minutes.
100. **"Plan your week. Work your plan. Win the week."** — Bentley, *Winning the Week*. **Cadence:** Tagline candidate for the weekly Reflect.
101. **Feedback loop, weekly.** Bentley pairs the Weekly Preview with a Weekly Review for learning. **Cadence:** Reconciler is exactly this loop.
102. **Reflection beats experience.** Doerr quoting Dewey: "We do not learn from experience . . . we learn from reflecting on experience." **Cadence:** Reflect ritual asks one "what did this Project teach me?" question.
103. **Closing-cycle questions.** Doerr's OKR retrospective questions: What contributed to success? What obstacles? What would I rewrite? What altered my approach? **Cadence:** End-of-Pursuit checklist seeded with these four prompts.
104. **"Your actions reveal your true motivations."** — James Clear, *Atomic Habits*. **Cadence:** Reflect surfaces the gap between stated Pursuits and where Action time actually went.
105. **Mood-affect calibration.** Kahneman: bad mood narrows; good mood loosens. **Cadence:** Reflect prompt asks for current energy/mood — agent adjusts ambition accordingly.
106. **Renegotiate weekly.** Allen: "renegotiate all your agreements with yourself." **Cadence:** Old commitments either get a new date or get killed.
107. **Forgive missed deadlines.** Newport, *Slow Productivity*, Principle 2: "forgive yourself when you miss your deadlines." **Cadence:** Reconciler reschedules without shame language.

---

## I. Sustainable Pace & Burnout Defense

108. **The three principles.** Newport, *Slow Productivity*: "1. Do fewer things. 2. Work at a natural pace. 3. Obsess over quality." **Cadence:** Onboarding triad.
109. **Pseudo-productivity.** Newport: "the use of visible activity as the primary means of approximating actual productive effort." **Cadence:** Narrate output never uses "agent is busy" as a proxy for progress; surface output, not motion.
110. **The overhead tax.** Newport: every commitment brings ongoing administrative drag. **Cadence:** Active-Project count display as a visible "overhead tax" indicator.
111. **Work seasonally.** Newport, *Slow Productivity*: alternate intense periods with recovery. **Cadence:** Pursuits can be tagged "in season" or "fallow."
112. **Double your timelines.** Newport's correction for the inside-view bias on estimation. **Cadence:** Agent auto-doubles user-supplied estimates and labels them as such.
113. **Six causes of burnout.** *HBR Guide to Beating Burnout*: workload, lack of control, insufficient reward, broken community, unfairness, value mismatch. **Cadence:** Burnout self-check Reflect option.
114. **Workload that matches capacity.** *HBR Guide to Beating Burnout*: matched workload allows "rest and recovery, and time for professional growth." **Cadence:** Capacity slider on the weekly plan; warning when over.
115. **Regain control with micro-decisions.** *HBR Guide to Beating Burnout*: small autonomous choices restore agency. **Cadence:** Daily Nudge: one thing this week you control.
116. **"Life doesn't have to be the way it's always been."** — *HBR Guide to Beating Burnout*. **Cadence:** Reflect prompt during a stuck week.
117. **Co-drive, don't push harder.** *HBR Guide to Beating Burnout*: speed without burning out comes from empowering others. With agents, this means delegating cleanly, not micromanaging. **Cadence:** Agent delegation template.
118. **Reward into the loop.** Bentley, *Winning the Week*: "no habit loop can establish itself without a juicy reward." **Cadence:** Work blocks can be paired with explicit recovery rewards.
119. **"Trying to squeeze a little more work out of your evenings might reduce your effectiveness the next day."** — Newport, *Deep Work*. **Cadence:** Hard cutoff option for end-of-day; agents pause, don't crash through.
120. **"My big learning was that I have to do less today to create a foundation to do more tomorrow."** — Demir Bentley, *Winning the Week*. **Cadence:** Loading-screen tip on a heavy week.

---

## J. Habits & Systems

121. **"You do not rise to the level of your goals. You fall to the level of your systems."** — James Clear, *Atomic Habits*. **Cadence:** Hero quote on the systems page.
122. **Identity-based habits.** Clear: be the type of person who… rather than try to do…. **Cadence:** Pursuit prompt: "What kind of engineer is this Pursuit making you?"
123. **"Every action you take is a vote for the type of person you wish to become."** — Clear, *Atomic Habits*. **Cadence:** Action-completion micro-copy.
124. **Compound interest of habits.** Clear: small, repeated improvements outpace heroic bursts. **Cadence:** Streak/cadence visualization is core, not gamified.
125. **Make-it-obvious.** Clear's first habit law. **Cadence:** Today's Leveraged Priority is the first thing on the dashboard.
126. **"Never miss twice."** Clear's resilience rule. **Cadence:** Reflect ritual treats one missed day as noise, two as a signal.
127. **"Habits are easier to build when they fit into the flow of your life."** — Clear, *Atomic Habits*. **Cadence:** Reflect ritual is anchored to an existing weekly anchor (e.g., Sunday coffee).
128. **Trusted system.** Allen, *GTD*: stress drops not because you have less to do, but because nothing is unaccounted for. **Cadence:** "Capture velocity" metric — how fast a thought goes from capture to a typed project Notes entry.

---

## K. Curiosity & Presence

129. **Illuminator vs. Diminisher.** Brooks, *How to Know a Person*. **Cadence:** Apply the lens to your own work — be an Illuminator of your projects.
130. **"The essential moral act is the act of attention."** — Brooks, *How to Know a Person* (citing Iris Murdoch). **Cadence:** Loading-screen tip.
131. **"Wise people don't tell us what to do. They start by witnessing our story."** — Brooks, *How to Know a Person*. **Cadence:** Agent's default register — Cadence reflects before it advises.
132. **"What crossroads are you at?"** — Brooks's signature question, *How to Know a Person*. **Cadence:** Quarterly Pursuit Reflect prompt verbatim.
133. **Accompaniment.** Brooks: "When you're accompanying someone, you're in a state of relaxed awareness—attentive and sensitive and unhurried." **Cadence:** Agent's posture during long sub-agent runs.
134. **Naïve realism kills empathy.** Brooks: assuming your view is the objective view. **Cadence:** Reconciler asks "what does the consumer of this PR see that I don't?"
135. **Inverse charisma.** Brooks: "a sense of being listened to with such intensity that you have to be your most honest, sharpest, and best self." **Cadence:** Aspirational tone for the agent's `/develop` and `/reflect` registers.
136. **Curiosity as craft.** Brooks: illuminators "have been trained or have trained themselves in the craft of understanding others." **Cadence:** Frame attention as a learnable skill, not a personality trait.
137. **Tenderness, receptivity, active curiosity, affection, generosity, holistic attitude.** Brooks's six features of an illuminator's gaze. **Cadence:** Six-question Reflect for relationships at work — for the Tech Lead transition.

---

## L. Leadership & The First 90 Days

138. **"The actions you take during your first few months… will largely determine whether you succeed or fail."** — Watkins, *The First 90 Days*. **Cadence:** Special "First 90 Days" Pursuit template for new role transitions.
139. **STARS framework.** Watkins: Start-up / Turnaround / Accelerated Growth / Realignment / Sustaining Success — each demands a different leadership posture. **Cadence:** Tag the Tech Lead role with its STARS classification on day one.
140. **Five conversations with your boss.** Watkins: situational diagnosis, expectations, style, resources, personal development. **Cadence:** Five-meeting ritual scheduled in the first two weeks.
141. **The break-even point.** Watkins: how fast does the value you create equal the value you've consumed? **Cadence:** Reflect metric for new-role Pursuits.
142. **Diagnose before prescribing.** Watkins: don't apply your last-job playbook. **Cadence:** Agent asks "what's different here?" before suggesting tactics.
143. **Get the right early wins, the right way.** Watkins: wins that align with your boss's priorities and the company's culture. **Cadence:** Early-win candidates get a "boss-aligned?" tag.
144. **Five questions for situational diagnosis.** Watkins: "What are the biggest challenges? Why? What unexploited opportunities? What would need to happen? What would you focus on?" **Cadence:** Onboarding Reflect template seeds these five.
145. **"Peacetime and wartime require radically different management styles."** — Horowitz, *The Hard Thing About Hard Things*. **Cadence:** Tag each Project with a peacetime/wartime mode; agent posture changes accordingly.
146. **Wartime focus.** Horowitz: "Wartime CEO cares about a speck of dust on a gnat's ass if it interferes with the prime directive." **Cadence:** Wartime mode amplifies Nudges; peacetime mode quiets them.
147. **The Struggle is normal.** Horowitz's chapter on "The Struggle" — every leader feels it; greatness comes from working through it. **Cadence:** Reflect prompt acknowledges the Struggle by name when stress markers spike.
148. **"Lead bullets, not silver bullets."** — Horowitz, *The Hard Thing About Hard Things*: most hard problems require many small fixes. **Cadence:** Loading-screen tip when the user is searching for one big move.
149. **"My single biggest personal improvement as CEO occurred on the day when I stopped being too positive."** — Horowitz. **Cadence:** Reconciler permits naming what's wrong without sugar-coating.
150. **Hire for strengths, tolerate weaknesses.** Horowitz: "Write down the strengths you want and the weaknesses that you are willing to tolerate." **Cadence:** Apply to delegation: write what you want from this agent run and what flaws are acceptable.
151. **Process exists for communication.** Horowitz: "The purpose of process is communication. If there are five people in your company, you don't need process." **Cadence:** Don't impose ceremony for Pursuits with no collaborators.
152. **"Bad companies are destroyed by crisis. Good companies survive them. Great companies are improved by them."** — Andy Grove via Doerr, *Measure What Matters*. **Cadence:** Postmortem Notes always ask: improved by it, or merely survived?

---

## M. Communication & Recap (narrate register)

153. **Recipient-first framing.** Sullivan, *Simply Said*: open with "You all are here today for X" not "I am here to…." **Cadence:** Narrate recap template starts with the consumer's question.
154. **Three structural moves.** Sullivan: state main concept → detail key points → reinforce takeaway. **Cadence:** Default narrate structure.
155. **Glance-test slides / glance-test recaps.** Sullivan: an audience should grasp it briefly. **Cadence:** Narrate one-line summary precedes any detail.
156. **Avoid corporate-speak.** Sullivan: "Let's pool our strengths to work together more efficiently" beats "leverage core competencies for synergy." **Cadence:** Narrate style guide bans jargon.
157. **Keep it short.** Sullivan: "the longer your document, the less likely it is to be read." **Cadence:** Hard token cap on narrate messages.
158. **Persuasive structure.** Sullivan: problem → solution → benefit → evidence → next step. **Cadence:** Agent's "make-the-case" template (during `/develop`).
159. **Status-update three-line rule.** Distilled: what's done, what's next, what's blocked. **Cadence:** Default narrate status format.
160. **Emotion before reason.** Heinrichs (cited in Sullivan reviews): vivid stories outperform data for action. **Cadence:** Narrate output can include a one-line "what this unlocks" hook for stakeholder updates.
161. **Watered-down feedback is worse than none.** Horowitz: "Watered-down feedback can be worse than no feedback at all." **Cadence:** Reconciler delivers blunt, attributed observations, not platitudes.

---

## N. Range & Breadth

162. **"Test-and-learn, not plan-and-implement."** — Ibarra via Epstein, *Range*. **Cadence:** Allow exploratory Pursuits without forcing a polished Why upfront.
163. **Quitting is a strategic skill.** Epstein, *Range*: "Knowing when to quit is such a big strategic advantage that every single person… should enumerate conditions under which they should quit." **Cadence:** Each Pursuit lists kill criteria up front.
164. **Match quality.** Epstein, *Range*: career fit emerges from sampling and reflecting, not introspecting. **Cadence:** Quarterly question — "Which Pursuit fits you best right now?"
165. **Read widely.** Abbie Griffin's "serial innovators" via Epstein: they "read more (and more broadly) than other technologists." **Cadence:** Loading-screen tip — log one cross-domain read this week.
166. **Desirable difficulties.** Epstein on Bjork: harder, slower learning sticks better. **Cadence:** Agent avoids over-hinting; lets the user struggle a bit before assistance.
167. **"Knowledge with enduring utility must be very flexible."** — Epstein, *Range*. **Cadence:** Project Notes are tagged by concept, not just by Project, to enable cross-pollination.
168. **Hypercorrection.** Epstein: "The more confident a learner is of their wrong answer, the better the information sticks when they subsequently learn the right answer." **Cadence:** Reconciler highlights surprising wrong answers from past work blocks.

---

## O. Measuring What Matters at Personal Scale

169. **Action → Project → Pursuit alignment.** Doerr's cascade adapted: each Action ladders to a Project Key Result that ladders to a Pursuit Objective. **Cadence:** Visible breadcrumb in every Action.
170. **Aspirational vs. committed.** Doerr's two OKR types. **Cadence:** Pursuits tagged "committed" or "aspirational"; the latter expects ~50% completion as success.
171. **"Stretch goals can be crushing if people don't believe they're achievable."** — Doerr, *Measure What Matters*. **Cadence:** Agent calibrates stretch suggestions to recent throughput.
172. **Decouple measurement from compensation.** Doerr's principle. Personal application: don't tie self-worth to KR completion. **Cadence:** Reflect language — "What did this teach you?" before "Did you hit it?"
173. **Continuous performance management = CFRs.** Doerr: Conversations, Feedback, Recognition. **Cadence:** Weekly Reflect logs all three for the Tech Lead role.
174. **"Contributors are most engaged when they can actually see how their work contributes."** — Doerr. **Cadence:** The Action's parent-Pursuit is always visible in the agent's prompt context.
175. **"Habit tracking… keeps your eyes on the ball: you're focused on the process rather than the result."** — Clear, *Atomic Habits*. **Cadence:** Cadence rewards work blocks logged, not just outcomes shipped.
176. **"Measurement is only useful when it guides you and adds context to a larger picture, not when it consumes you."** — Clear. **Cadence:** No leaderboards, no streak shame; metrics are private and contextual.

---

## P. Loading-Screen Tips (one-liners)

177. **"Your mind is for having ideas, not holding them." — David Allen.**
178. Capture now; clarify later; the captures inbox is cheaper than your working memory.
179. The first action is never "Plan X." It's "Open editor at file Y."
180. **"You do not rise to the level of your goals. You fall to the level of your systems." — James Clear.**
181. Decide what NOT to do this week. Then earn back the rest.
182. Keep AI on the leash; you're still the bottleneck. (after Karpathy)
183. **"An AI agent is an LLM wrecking its environment in a loop." — Simon Willison.** Use the worktree.
184. Move from in-the-loop to on-the-loop: steer, don't approve every keystroke.
185. Diverge first. Converge second. Don't blend them.
186. Quantity is the cheapest form of quality — generate more, then prune.
187. **"It's not a key result unless it has a number." — Marissa Mayer.**
188. Doubling your estimate isn't pessimism — it's calibration.
189. Do fewer things. Work at a natural pace. Obsess over quality. (Newport)
190. The daily to-do list is where high-impact tasks go to die. (Bentley)
191. Calendar your task list; add the good stuff first.
192. Attention residue is the tax you pay for "just one quick check."
193. Stop peeking at the agent's output every 30 seconds. Trust the loop or kill it.
194. **"Clarity about what matters provides clarity about what does not." — Cal Newport.**
195. Ship your shutdown ritual. Then actually shut down.
196. Externalize the thought before you debate the thought.
197. Walk for ten minutes; the prefrontal cortex thanks you.
198. The whiteboard "talks back." Use one. (after Annie Murphy Paul)
199. Three to four hours of deep work a day, five days a week, beats a 60-hour blur.
200. "Watered-down feedback can be worse than no feedback at all." — Ben Horowitz.
201. Wartime or peacetime? Pick one before opening Slack. (after Horowitz)
202. Lead bullets, not silver bullets. Most hard things take ten small fixes.
203. **"What crossroads are you at?" — David Brooks.**
204. Be an illuminator of your own work — not a diminisher.
205. Naïve realism: assuming the way the code looks to you is the way it looks to everyone.
206. Test-and-learn, not plan-and-implement. (after Ibarra / Epstein)
207. Late specialization is fine. Sample first.
208. **"Lateral thinking with withered technology." — Gunpei Yokoi.** Reuse old tools for new problems.
209. The Struggle is where greatness comes from. Don't romanticize it; don't deny it.
210. Hard leads to fun. (Newport)
211. Friction is a feature when it's protecting work blocks.
212. One Project per day. (Newport)
213. Never miss twice. (Clear)
214. **"The essential moral act is the act of attention." — David Brooks (citing Iris Murdoch).**
215. Brain offloading is competence, not weakness.
216. Big things from small beginnings — every Pursuit started as a captured thought.
217. Compress agent output into helmsman-grade signal. Skip the foam.
218. The first sentence answers the question. Everything else supports it. (Sullivan)
219. **"We do not learn from experience . . . we learn from reflecting on experience." — Doerr (citing Dewey).**
220. Plan your week. Work your plan. Win the week. (Bentley)
221. If you're certain you'll nail it, you're not stretching. (Doerr)
222. **"Put more wood behind fewer arrows." — Larry Page.**
223. **"Ideas are easy. Execution is everything." — John Doerr.**
224. The break-even point: when does the value you create equal the value you've consumed? (Watkins)
225. The first 90 days will outweigh the next 900. Diagnose first. (Watkins)
226. STARS: which one are you in this week — Start-up, Turnaround, Accelerated Growth, Realignment, Sustaining Success?
227. **"Hire smart people so they can tell us what to do." — Steve Jobs (via Doerr).** Brief outcomes to your agents, not procedures.

---

## How Cadence Could Use This

### Loading-screen rotation
Pull the **P-section** entries (177–227) for the agent's idle/loading-state strings. Weight by current ritual: during a long agent build, surface the Steering-the-Stream lines (#56–70, #182–184, #192–193); during Reflect, surface the H-section lines (#97–107, #214, #219–220).

### Agent interjection triggers (during long sub-agent runs)
- **Long sub-agent run > 10 min:** rotate Karpathy/Willison helmsman lines (#56, #59, #61).
- **Pattern of failed agent attempts:** Kahneman cognitive minefield (#72) + lead-bullets framing (#148, #202).
- **Work block > 90 min:** Newport restoration line (#119) or Paul movement-break line (#81, #197).
- **Worktree drift / merge time:** Allen "renegotiate weekly" (#106) + Reconciler review prompt.
- **End-of-day:** Newport "Schedule shutdown, complete" (#89, #195).

### Reflect ritual prompt seeds
- Get Clear: #99 ("30-min plan"), #13 ("mind for ideas"), #16 ("get it off your mind"), #128 (capture velocity).
- Get Focused: #49 (leveraged priority), #50 (daily-list trap), #54 (one Project per day), #51 (triage).
- Weekly Review: Doerr's four close-cycle questions (#103), #102 (reflect-on-experience), #104 (actions reveal motivations), #117 (co-drive check).
- Pursuit Review: Brooks's "What crossroads?" (#132), Sinek's Why audit (#3), Newport's mission reduction (#12).

### Agent planning prompts (during `/promote`, `/develop`, `/start`)
- New Pursuit: Why → How → What (#1–3); kill-criteria (#163); STARS tag if leadership context (#139); aspirational vs. committed (#170).
- New Project: peacetime/wartime tag (#145); kind/wicked diagnosis (#36); single-Project-per-day reminder (#54).
- New Action: physical-next-step rule (#19); bird/frog mode selection (#35); audience-of-one core message (#21–23).
- New work block: explicit intent statement before agent invocation (#20–24); autonomy slider (#58); workspace ritual (#80, #83).

### Narrate-mode (status & recap) defaults
- One-line summary first (#155), recipient-first framing (#153), three-line status (what's done / next / blocked) (#159), no jargon (#156), short total length (#157).

### Nudge/Reconciler triggers
- Stale Pursuit (no Why update in 90 days) → #3.
- Active-Project count exceeds capacity → #110, Bentley calendar/triage (#51).
- Burnout indicators (long work blocks, late hours, high agent error rate) → #113–117, #119.
- Verification queue piling up → #57, #67, #69.
- Decision Notes missing assumptions → #53.

### A note on tone
The harvest above deliberately leans toward the **smart-colleague-marginalia** voice rather than the motivational-poster voice. The Brooks/Murdoch attention line (#214) and the Karpathy "leash" line (#182) are brain-tickle endpoints; Doerr/Newport/Allen supply the structural backbone; Horowitz, Watkins, Sullivan, and the agentic-engineering community give Kevin language for the Tech Lead-and-agent-orchestrator role he's stepping into. Use the loading-screen tips sparingly — over-rotation will turn them into wallpaper.
