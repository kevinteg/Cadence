# Cadence — GTD Audit & Critique

*An honest assessment of where Cadence departs from proven productivity principles, where it might fail for users beyond the author, and what's missing.*

---

## What Cadence Gets Right

Before the critique, credit where it's due. Cadence correctly identifies several failures of traditional GTD that productivity practitioners have struggled with for two decades:

- **The higher horizons problem.** GTD practitioners notoriously get stuck at the "runway" level (next actions and projects) and never connect their daily work to purpose, vision, or goals. Cadence's Pursuit concept directly addresses this by making the *why* a first-class object. This is genuinely novel.
- **The maintenance burden.** The most common GTD failure mode is that the system takes too long to maintain and people abandon it. Cadence's AI triage and system-generated recaps attack this head-on.
- **The toolbox sprawl problem.** GTD practitioners end up with 5-7 apps that don't talk to each other. Cadence's "one app, one voice" philosophy is a direct response.
- **The narrative gap.** GTD has no concept of storytelling or meaning-making. Cadence's narrative layer is a genuine innovation that no mainstream productivity system offers.

Now, the critique.

---

## Critique 1: The Capture Pipeline Is Incomplete

**GTD says:** Capture *everything* that has your attention. Every open loop. Every "I should..." and "I need to..." and "what about..." The power of GTD is that your trusted system is *complete* — you can trust it because nothing is left in your head.

**Cadence says:** Drop a thought. AI triages it.

**The problem:** "Thought" is a warm, human word, but it's too narrow for what GTD capture actually needs to handle. People need to capture:

- Tasks ("call the electrician")
- Ideas ("what if we used cedar instead")
- Reference material ("the part number is XJ-4520")
- Commitments made to others ("I told Sarah I'd review her PR by Friday")
- Waiting-for items ("Amazon order arriving Thursday")
- Calendar events ("dentist appointment May 12")
- Someday/maybe items ("learn Rust someday")

Cadence treats all of these as "thoughts" and trusts AI triage to sort them. But AI triage is a black box. If the user can't see *how* things were triaged and *where* they went, trust in the system erodes. And trust is the entire foundation of GTD. If you don't trust your system, you keep things in your head, and the system becomes dead weight.

**What's missing:** A transparent triage process. The user needs to be able to see "you dropped 7 thoughts this week; here's where I filed them; here are 2 I wasn't sure about." The Reflect ritual touches on this but doesn't emphasize it enough. Triage review should be a prominent part of the ritual, not a background process.

**Who this hurts:** Anyone less technically confident than the author. A senior engineer trusts AI to route correctly. A project manager or a parent who isn't an AI native will wonder "did my system actually catch that?" and start keeping a parallel mental list — which defeats the entire purpose.

---

## Critique 2: The 2-Minute Rule Is Absent

**GTD says:** If an action takes less than 2 minutes, do it now. Don't file it, don't track it, don't triage it. Just do it.

**Cadence says:** Nothing about this.

**The problem:** The 2-minute rule is one of GTD's most powerful throughput accelerators. By omitting it, Cadence risks becoming a system that tracks *everything*, including things that should have just been done immediately. This creates overhead and bloat. Over time, the user's action lists grow with trivial items that make the real work harder to find.

**What's missing:** A concept of immediacy in the triage pipeline. When a thought arrives that would take less than 2 minutes to act on, the system should say "just do this now" rather than filing it into a milestone.

**Who this hurts:** Everyone. The 2-minute rule is universally applicable and its absence makes any system heavier than it needs to be.

---

## Critique 3: Contexts Are Dismissed Too Quickly

**GTD says:** Organize next actions by context — the tool, location, or energy level required to do them. @phone, @computer, @errands, @low-energy. This lets you batch similar actions and pick the right work for the moment.

**Cadence says:** Contexts are overhead. Not worth the hassle of tagging. The only exception is people-tagging for tech lead work.

**The problem for other users:** The author works from home, mostly on a computer, and is highly self-directed. For this person, contexts genuinely aren't useful — everything is @computer. But Cadence aspires to be a product others could use. For a user who splits time between an office, home, travel, and meetings with different stakeholders, contexts are essential. For a user with variable energy (a parent of young children, someone managing a health condition), energy-based contexts (@deep-work, @shallow, @brain-dead) are a lifeline.

**What's missing:** Contexts don't need to be mandatory, but the data model should support them. More importantly, Cadence could derive context automatically rather than requiring manual tagging — infer @computer from the fact that you're in a Claude Code session, infer @errands from a phone-captured thought that mentions "pick up." This would be a genuine innovation over GTD's manual context assignment.

**Who this hurts:** Anyone whose work spans physical locations, energy levels, or tooling contexts. Which is most people.

---

## Critique 4: The Pursuit Hierarchy Is Top-Heavy

**GTD says:** A project is anything that requires more than one action step to complete. "Buy a new tire" is a project if it requires researching options, calling the shop, and scheduling the appointment. GTD deliberately sets the bar *low* for what constitutes a project.

**Cadence says:** Pursuits are things you'd put on a performance review or share in a year-in-review newsletter. They carry intention and identity.

**The problem:** There is a vast middle ground of multi-step work that doesn't rise to the level of a Pursuit but is more than a single Action. "Get the car inspected." "File taxes." "Set up the new printer." "Renew the passport." These are GTD "projects" — they have multiple steps, they take a few days, and they matter — but they are not identity-level commitments. They're not performance review material. They're just... life maintenance.

Cadence currently forces these into one of two awkward positions:

1. Create a Pursuit for them (feels overwrought — "Pursue: Renew Passport")
2. Make them orphan Actions with no parent (breaks the hierarchy)

An ongoing Pursuit like "Maintain My Home" could absorb some of these as Milestones ("Get Car Inspected"), but then "Maintain My Home" becomes the exact grab-bag the author said he wanted to avoid.

**What's missing:** A lightweight container below Pursuit — what GTD simply calls a "project." Something that has a few actions, a clear done state, but doesn't need to carry the weight of values and identity. This could be as simple as allowing Milestones to exist without a parent Pursuit, or allowing Actions to be grouped into ad-hoc clusters.

**Who this hurts:** Everyone who has a normal amount of life maintenance. The current hierarchy is designed for someone with a strong sense of purpose and relatively few mundane obligations. Most people have 30-50 active GTD "projects" at any time, and the vast majority are not Pursuit-worthy.

---

## Critique 5: The Weekly Review Is Underspecified

**GTD says:** The weekly review is the critical success factor. It has specific steps: get clear (process all inboxes to zero), get current (review all action lists, waiting-for lists, project lists, someday/maybe), and get creative (review higher horizons, trigger new ideas).

**Cadence says:** Reflect ritual: Recap → Learn → Triage → Commit. ~30 minutes.

**The problem:** Cadence's Reflect ritual is heavily weighted toward the aspirational (narrative, learning, leveraged priority) and light on the operational (is every open loop captured? is every action list current? is anything falling through cracks?). The "get clear" phase — processing every inbox to zero — is completely absent.

GTD's weekly review works because it's a *complete audit* of your entire system. You touch everything. That's what rebuilds trust. Cadence's Reflect ritual is more like a planning session with a retrospective. It's missing the hygiene pass that keeps the system trustworthy.

**What's missing:** An explicit "get clear" phase where unprocessed thoughts are fully triaged, stale markers are reviewed, and every active milestone is confirmed as still relevant. The AI can pre-generate a lot of this, but the user needs to *touch* it for trust to be maintained.

**Who this hurts:** Anyone who tends to let things accumulate. The author's instinct is to trust the AI to keep the system clean, but for most people, the act of manually reviewing is what builds the psychological trust that makes the system work.

---

## Critique 6: "Waiting For" Is Missing Entirely

**GTD says:** Track everything you're waiting for someone else to do. Review it weekly. Follow up when things are overdue.

**Cadence says:** Nothing.

**The problem:** A tech lead managing 5 people (growing to 10) will have *dozens* of waiting-for items at any time. Code reviews, decisions from leadership, vendor responses, team deliverables. Without a waiting-for concept, these either get tracked as Actions (wrong — they're not things *you* do) or they fall through the cracks.

**What's missing:** A first-class "waiting for" state on Actions, with the person you're waiting on and an expected date. This ties directly to the people-tagging concept already in the vocabulary. "Show me everything I'm waiting on from Sarah" should be a natural query.

**Who this hurts:** Anyone in a leadership or coordination role. Which is the author's own use case at Nexthop.

---

## Critique 7: The System Requires an Extremely Sophisticated AI

**Cadence's most innovative features are also its riskiest:**

- AI triage of captured thoughts
- Auto-generated recaps from markers and session logs
- Narrative synthesis across pursuits
- WIP monitoring with intelligent pushback
- Curated session entry suggestions

Each of these is a hard AI problem. If the triage routes a thought incorrectly, trust erodes. If the recap misses something important, the user wastes time re-orienting. If the narrative doesn't sound like the user's voice, the blog output is useless.

**The risk:** The system is designed around AI capabilities that may not be reliable enough today. GTD's genius is that it works with index cards and a filing cabinet. It is deliberately technology-neutral. Cadence is technology-dependent — not just on AI existing, but on AI being *good enough* at nuanced judgment tasks.

**Who this hurts:** Anyone using the system during the inevitable periods when the AI gets things wrong. The author has the technical skill to debug and compensate. A less technical user will blame the system and abandon it.

**Mitigation:** Every AI-generated artifact (triage decision, recap, narrative) should be transparently reviewable. The user should always be able to see *what the AI did* and correct it. The system should degrade gracefully to manual operation when AI confidence is low.

---

## Critique 8: No Concept of Energy or Capacity

**GTD says:** Choose your work based on context, time available, energy available, and priority — in that order.

**Cadence says:** Flow state. Pomodoros. Nudges for water and stretching.

**The problem:** Cadence optimizes for flow state but doesn't model the user's *capacity*. Not every session can be a deep work session. Sometimes you have 15 minutes between meetings. Sometimes you're exhausted. A good productivity system helps you pick the *right* work for your current state, not just protect you during deep work.

**What's missing:** A lightweight energy/capacity signal. This doesn't need to be complex — even a simple "I have [deep focus / light work / 15 minutes] right now" at session entry would let the Guide curate better suggestions.

**Who this hurts:** Parents of young children, people managing health conditions, anyone whose available energy fluctuates significantly. The author's use case (a focused knowledge worker with controlled time blocks) is not representative.

---

## Critique 9: The Vocabulary May Be a Barrier

The Cadence vocabulary is carefully crafted and internally consistent. It's also *different from every other productivity system's vocabulary.* Projects become Pursuits. Tasks become Actions. Subtasks become Milestones (confusingly, since "milestone" usually means something *bigger* than a task, not smaller).

**The hierarchy inversion:** In most systems, a milestone is a *major* checkpoint in a project. In Cadence, a milestone is the *middle tier* — smaller than a Pursuit, bigger than an Action. A user coming from Jira, Asana, or any other tool will expect "milestone" to be a big, rare event. In Cadence, "Milestone: Buy Lumber" is a milestone. That will confuse people.

**Who this hurts:** Anyone who has used any other project management tool. The vocabulary needs to either align with conventions or be so self-evidently clear that the new meaning is obvious. Right now, "Milestone" falls into neither camp.

---

## Critique 10: No Delegation Model

**GTD says:** When you process an item, one of the key decisions is: should *I* do this, or should I delegate it?

**Cadence says:** Actions are things *you* do. Coding milestones can be automated (delegated to AI). But there's no concept of delegating to *people.*

**The problem:** A tech lead managing 5-10 people will spend significant time *not doing* but *delegating, reviewing, and following up.* Without a delegation model, Cadence can't represent "I asked James to write the integration tests" as anything other than a waiting-for item (which is also missing, see Critique 6).

**What's missing:** Actions should have an assignee. Most are assigned to self, but the ability to assign to a team member (and track it as waiting-for) is essential for a leadership role.

**Who this hurts:** Anyone managing people. Including the author in approximately 30 days.

---

## Summary: What Cadence Must Add for a General Audience

| Gap | Severity | Fix |
|-----|----------|-----|
| Lightweight projects below Pursuit | High | Allow Milestones without parent Pursuits, or add a "project" concept |
| Waiting-for tracking | High | First-class state on Actions with person + expected date |
| 2-minute rule | Medium | Triage pipeline should surface "just do it now" items |
| Transparent triage review | Medium | Show the user where thoughts were routed, flag uncertain ones |
| Delegation model | Medium | Action assignee + waiting-for integration |
| Context support (optional) | Medium | Auto-derived contexts, not manual tagging |
| Energy/capacity signal | Low | Simple session-entry prompt for current capacity |
| "Get clear" phase in Reflect | Medium | Explicit hygiene pass before the aspirational planning |
| Milestone naming confusion | Low | Consider renaming or clearly documenting the inversion |
| AI reliability graceful degradation | Medium | All AI decisions reviewable and correctable |

---

## The Fundamental Tension

Cadence is built on a beautiful insight: that productivity systems fail because they're *systems* when what people need is a *companion.* The narrative layer, the session lifecycle, the markers — these are genuinely innovative and address real gaps in GTD.

But the vision is so focused on the *aspirational* dimension (identity, values, narrative, flow state) that it underweights the *operational* dimension (capturing everything, tracking delegations, maintaining trust through completeness). GTD works because it's boringly comprehensive. Everything is captured, everything is reviewed, nothing falls through the cracks. That comprehensiveness is what creates the "mind like water" state that Allen promises.

Cadence risks creating a system that's inspiring to use on good days but doesn't catch you on bad ones. The weeks when you don't have a leveraged priority. The weeks when you're just surviving. The weeks when "win the week" feels like a cruel joke because your kid is sick and there's a production outage and you forgot to renew your car registration.

A great productivity system works when life is beautiful *and* when life is chaos. Right now, Cadence is optimized for the beautiful days.

---

*This critique is offered in the spirit of making Cadence better, not tearing it down. The vision is strong. The gaps are fillable. The question is whether to fill them before v1 or let them emerge through use.*
