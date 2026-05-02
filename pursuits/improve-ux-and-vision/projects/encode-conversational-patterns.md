---
id: encode-conversational-patterns
pursuit: improve-ux-and-vision
status: done
created: 2026-05-01
---

# Encode Conversational Patterns into the Plugin

Three working-pattern feedbacks that surfaced during the 2026-W18 Reflect were initially saved to per-user memory at ~/.claude/projects/.../memory/. That's the wrong vehicle: memory is per-user, per-machine, ephemeral, and does not ship with the plugin. These behaviors should be how Cadence works for everyone, encoded in skill contracts and the runtime so they survive installation, propagate to new users, and live in the same review loop as the rest of the product.

## Intent

Three behaviors that emerged from real use need to migrate from personal memory into product behavior. (1) Reflect Phase 2 must be interactive: open question first, follow-ups to deepen, surface the agent's own observations only after the user has answered — pre-filling answers short-circuits meaning-making. (2) ELI5 recaps and natural alignment-quiz questions belong as a cross-cutting principle in the runtime: pause for plain-language recap before destructive/irreversible actions; periodically pose low-friction 'in your words…' questions during long arcs to prevent accept-by-default drift; lean into Claude-Code-internals teaching opportunities. (3) No speculative deadlines: the system should not propose target dates by default — only when an external commitment drives them — because aspirational deadlines turn into ambient pressure that distorts scope without giving anything back. This project encodes those three behaviors in the appropriate plugin files (skills/reflect, cadence-runtime, verb-contracts, project/pursuit creation flows), adds a CLAUDE.md note so this category of mistake (saving product behavior to personal memory) does not recur, and deletes the now-redundant memory files. Done when a fresh Claude conversation in this repo runs /reflect interactively without consulting any per-user memory, ELI5 recaps appear before destructive actions, target dates are not proposed by default, and the three migrated memory files plus their MEMORY.md entries are gone.

## Actions

- [x] Encode 'Reflect is interactive' into cadence-plugin/skills/reflect/SKILL.md Phase 2 — Steps 5b (what worked / what didn't work) and 5f (Leveraged Priority) become explicit interactive flows: open question first, follow-up cycle to deepen the user's own thinking, surface agent observations only after the user has answered. Update workflows/verb-contracts.md Reflect contract to match.
- [x] Encode ELI5 recaps + natural alignment quizzes as a cross-cutting principle in cadence-plugin/cadence-runtime.md — applies to all long-arc verbs (start, complete, cancel, close, reflect, narrate). Specify: pause for a plain-language recap before destructive/irreversible actions (close pursuit, archive, set-status dropped, force push, mass rename); periodically pose low-friction 'in your words…' alignment questions during long sessions; lean into Claude-Code-internals teaching opportunities when invoking non-obvious features (subagents, hooks, plugin model, MCP).
- [x] Add a 'no speculative deadlines' principle to cadence-runtime.md and update relevant skills (skills/promote, skills/start, project- and pursuit-creation guidance in cadence-reference.md) to omit --target by default. Only suggest a target date when the user names an external commitment that drives one.
- [x] Add a one-line note to CLAUDE.md: in this repo, working-style preferences belong in skill/runtime contracts (so they ship as product behavior), not in ~/.claude/.../memory/.
- [x] Delete the three migrated memory files (feedback_reflect_interactive.md, feedback_eli5_and_alignment_checks.md, feedback_no_speculative_deadlines.md) at ~/.claude/projects/-Users-kevinteg-code-cadence/memory/ and remove their entries from MEMORY.md.
- [x] User-story validation: in a fresh Claude conversation in this repo, run /cadence:reflect through Phase 2 and confirm (a) the agent asks open questions and waits for answers, (b) the agent surfaces an ELI5 recap before any irreversible action, and (c) the agent does not propose target dates when creating pursuits or projects.
