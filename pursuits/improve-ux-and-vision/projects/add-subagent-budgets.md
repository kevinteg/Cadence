---
id: add-subagent-budgets
pursuit: improve-ux-and-vision
status: done
created: 2026-05-04
---

# Add Subagent Budgets

Long-running subagents (cadence:narrator, cadence:reconciler) currently run without iteration or token budgets. If a run hits a degenerate case (model loops, generates excessive output, retries pathologically), nothing fires a guard rail — the user pays in tokens, time, and trust. The v1 self-review's Supportive Technical persona named this as concrete improvement #4: a real safety gap with low cost and pure-win value.

## Intent

Add explicit budgets to every Agent tool invocation in the skill surface, document the pattern as a runtime principle so future verbs inherit the discipline, and pick conservative per-agent-type budgets that match the call's nature (data-fetch vs. generative prose). Done feels like: a runaway subagent run hits its budget cleanly and returns what it has so far rather than spinning indefinitely; every Agent invocation in the plugin's skills passes an explicit max_turns (or equivalent) parameter; the runtime carries this as a guardrail so it survives future skill rewrites.

## Actions

- [ ] Audit current subagent invocations across narrate (cadence:narrator), reflect (cadence:reconciler in Get Clear), resolve (cadence:narrator for pursuit-closure narrative), and reconcile (cadence:reconciler). For each, characterize the call shape (read-only data fetch vs. generative prose) and the typical iteration count under healthy conditions. Document in this project's Notes.
- [ ] Add a 'Subagent budgets' principle to cadence-runtime.md's Engagement and Alignment section. Specify: every Agent tool invocation must include an explicit max_turns parameter; conservative defaults per agent type (data-fetch agents: 3; prose-generating agents: 5; pursuit-arc generators: 8); what to do if the budget is exhausted (return what's available with a brief note, don't auto-retry, surface the situation to the user).
- [ ] Update skills/narrate/SKILL.md to pass max_turns to the narrator subagent invocation. Default 5 (enough for one data fetch + composition); pursuit-arc narratives can pass 8.
- [ ] Update skills/reflect/SKILL.md (step 4c reconciler invocation) and skills/reconcile/SKILL.md to pass max_turns: 3 to the reconciler subagent — it's a flag scan, not generative prose.
- [ ] Update skills/resolve/SKILL.md (step 8 closure narrative narrator invocation) to pass max_turns: 8 — pursuit arcs need more iterations than daily/weekly narratives. Same applies to the lessons-extraction narrator call once that lands (under the separate extract-lessons project).
