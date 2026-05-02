---
id: slim-verb-surface-and-teach-by-usage
pursuit: improve-ux-and-vision
status: on_hold
created: 2026-05-01
---

# Slim Verb Surface and Teach by Usage

Cadence exposes 16 user-facing verbs — too many for new users to internalize without consulting help, and the design pressure to add more (per dev-flavored requests, per audience expansion) is constant. The right move is to slim the user-facing surface while preserving the internal cognitive-mode separation, and to teach the surface through natural-language usage rather than upfront docs.

## Intent

Reduce the user-facing verb count and add a teaching pattern that makes the surface discoverable through natural-language conversation. Specifically: (1) hide develop and promote from the user-facing verb catalog — they remain invokable internally by other verbs (brainstorm chains into develop when appropriate; start chains into promote at graduation moments); (2) merge close + cancel into a single resolve verb that takes --state argument with values complete (default) and dropped, drawing from OmniFocus's vocabulary; pursuit-level resolve still triggers the closure ritual with absolute-Ideas-block, project-level resolve walks override-with-reason, and state-aware behavior preserves today's semantics; (3) demote /reconcile from user-facing verb to system behavior — reconciler still runs at SessionStart hook and during /reflect Get Clear, just no longer a verb the user invokes; (4) add a natural-language-to-verb teaching pattern as an Engagement and Alignment principle in the runtime — when the user speaks naturally and the agent maps to a verb, it surfaces the verb name as a teaching moment ('Running /cadence:resolve — this marks projects done. Next time, type /resolve <project> directly.'). Done feels like: the user-facing verb catalog drops to ~10-11 verbs, the conversational surface becomes self-teaching, and the cognitive-mode separation (diverge/execute/reflect/setup/browse) stays intact under the slimmed surface.

## Actions

- [ ] Hide develop and promote from the user-facing verb catalog in cadence-reference.md. They remain invokable internally — brainstorm chains into develop when ready; start chains into promote at graduation moments. Document the chaining pattern so the agent knows when to invoke them.
- [ ] Merge close + cancel into /resolve with --state argument (default complete; values complete | dropped). Update skills/close, skills/cancel (consolidate into skills/resolve), runtime, verb-contracts.md, cadence-reference.md. State-aware behavior: pursuit-level resolve --state complete walks closure ritual with absolute-Ideas-block; project-level resolve --state complete walks intent-feel-achieved dialogue; resolve --state dropped walks override-with-reason and preserves today's drop semantics. CLI add a corresponding subcommand or extend set-status.
- [ ] Demote /reconcile from user-facing verb to system behavior. Remove its skill catalog entry from cadence-reference.md and runtime One Voice list. Reconciler still runs automatically at SessionStart hook (already does) and surfaces flags during /reflect Get Clear (already does). The CLI subcommand cadence flags stays for power use.
- [ ] Add a 'Natural-Language-to-Verb Teaching' principle to cadence-runtime.md's Engagement and Alignment section: when the user speaks naturally and the agent maps to a verb, the agent runs the verb and surfaces the verb name as a teaching moment ('Running /cadence:resolve — this marks projects done. Next time, type /resolve <project> directly.'). Pairs with ELI5 recaps and Claude-Code-internals teaching.
- [ ] Update CLAUDE.md to reflect the slimmed user-facing verb surface (down from 16 to ~10-11 verbs). Note that develop/promote are still invokable but typically invoked by other verbs, and reconcile is system behavior not a verb.
- [ ] Update the SessionStart hook output's Available Actions menus to reflect the slimmed surface. Drill-down menus on pursuit/project views should show resolve (not close/cancel) and should not show reconcile/develop/promote in normal user-facing context.
