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

- [x] Audit current subagent invocations across narrate (cadence:narrator), reflect (cadence:reconciler in Get Clear), resolve (cadence:narrator for pursuit-closure narrative), and reconcile (cadence:reconciler). For each, characterize the call shape (read-only data fetch vs. generative prose) and the typical iteration count under healthy conditions. Document in this project's Notes.
- [x] Add a 'Subagent budgets' principle to cadence-runtime.md's Engagement and Alignment section. Specify: every Agent tool invocation must include an explicit max_turns parameter; conservative defaults per agent type (data-fetch agents: 3; prose-generating agents: 5; pursuit-arc generators: 8); what to do if the budget is exhausted (return what's available with a brief note, don't auto-retry, surface the situation to the user).
- [x] Update skills/narrate/SKILL.md to pass max_turns to the narrator subagent invocation. Default 5 (enough for one data fetch + composition); pursuit-arc narratives can pass 8.
- [x] Update skills/reflect/SKILL.md (step 4c reconciler invocation) and skills/reconcile/SKILL.md to pass max_turns: 3 to the reconciler subagent — it's a flag scan, not generative prose.
- [x] Update skills/resolve/SKILL.md (step 8 closure narrative narrator invocation) to pass max_turns: 8 — pursuit arcs need more iterations than daily/weekly narratives. Same applies to the lessons-extraction narrator call once that lands (under the separate extract-lessons project).

## Notes

### Audit (action 1)

| Skill | Subagent | Call shape | Healthy iteration count | Budget |
|---|---|---|---|---|
| `/narrate` (daily/weekly/monthly/annual) | `cadence:narrator` | One `cadence project-activity` data fetch + prose composition. No retries needed. | ~2-3 tool calls | **5** |
| `/narrate <pursuit>` (pursuit-arc) | `cadence:narrator` | Multi-pursuit synthesis — closure metadata, project files, ideas, captures. | ~4-6 tool calls | **8** |
| `/reflect` Get Clear (step 4c) | `cadence:reconciler` | Pure flag scan. Three CLI calls (`flags --json`, `ideas --state seed`, `ideas --state developed`). No generation. | 3 tool calls | **3** |
| `/resolve <pursuit>` (closure narrative) | `cadence:narrator` | Pursuit-arc synthesis with closure framing. | ~4-6 tool calls | **8** |
| `/reconcile` (power-user verb) | `cadence:reconciler` | Same flag scan as reflect. | 3 tool calls | **3** |

### Soft enforcement (Agent tool schema reality)

Claude Code's Agent tool schema today exposes `description`, `subagent_type`, `prompt`, `isolation`, `model`, `run_in_background` — no `max_turns` parameter. So budgets ride at two levels:

1. **Prompt-level reminder** at every skill's invocation site: a `[Budget: N tool calls. If exceeded, return what you have without retrying.]` instruction in the prompt body.
2. **Agent-system-prompt default**: each agent's `cadence-plugin/agents/<name>.md` carries its default budget so behavior holds even when a skill omits the reminder.

When the SDK exposes `max_turns` (or equivalent), migration is parameter-side and the prompt redundancy drops out.
