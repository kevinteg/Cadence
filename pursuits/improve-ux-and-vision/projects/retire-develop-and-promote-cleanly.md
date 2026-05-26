---
id: retire-develop-and-promote-cleanly
pursuit: improve-ux-and-vision
status: done
created: 2026-05-22
---

# Retire develop and promote, delete legacy Ideas

## Intent

/develop and /promote were chained internal verbs in v1: Ideas walked a lifecycle (seed → developed → promoted | moved | closed); /develop ran PPCo on a Seed; /promote enforced graduation gates (Why for Pursuit, Intent for Project, Concrete for Action). In practice these split a single thought process — brainstorm → decide → commit — across three verbs the user almost never explicitly invoked.

v1.1 dissolves them into brainstorm-internal mechanics — the next project (rebuild-brainstorm-as-workspace-with-phase-machine) builds that. Fresh start: the SKILL.mds get deleted outright (no archive), and so do all existing Ideas — every pursuits/<id>/ideas/*.md file, across active, someday, archived, and dropped pursuits. Promoted Ideas were origin links (their promoted_to field points at a project/pursuit/action that still exists); we accept losing that trace.

The Idea entity itself is removed from the data model: cadence ideas, cadence create-idea, cadence set-idea-state go away; IdeaSchema and IdeaStateSchema come out of src/types.ts; the scanner stops reading idea files; the snapshot stops carrying an ideas field. The reconciler's idea-specific flags (aging_seed, unpromoted_idea, growing_backlog) leave with them.

All references in runtime, CLAUDE.md, verb-contracts, reflect, resolve, find, incoming, capture, the narrator agent, the reconciler agent, and journeys get cleaned up. Old narratives stay as historical record.

Done feels like: /cadence:develop and /cadence:promote no longer exist. cadence ideas doesn't exist. pursuits/<id>/ideas/ directories are all gone. The Pipeline diagram doesn't mention Ideas/develop/promote. The reconciler doesn't surface idea-state flags. The resolve closure ritual doesn't block on Ideas. All tests pass. cadence flags --json doesn't emit aging_seed/unpromoted_idea/growing_backlog.

## Actions

- [x] Delete cadence-plugin/skills/develop/ and cadence-plugin/skills/promote/ directories outright.
- [x] Delete every pursuits/**/ideas/ directory and its contents (active, someday, archived, dropped pursuits).
- [x] Delete src/scan/ideas.ts and remove its call from the scan() aggregator in src/scan/repo.ts.
- [x] Remove cadence ideas, cadence create-idea, cadence set-idea-state subcommand bindings from src/cli.ts and their writer functions in src/write/idea.ts and src/write/edits.ts.
- [x] Remove IdeaFrontmatterSchema, IdeaStateSchema, Idea type, and the ideas field on Snapshot from src/types.ts.
- [x] Delete aging_seed, unpromoted_idea, growing_backlog flag-fns from src/report/reconciler.ts; remove their case branches from src/render/status.ts and src/render/snapshot.ts; remove their Flag union members from src/types.ts; update or delete the corresponding test cases in test/report.test.ts.
- [x] Remove the Internal verbs (chained, not user-facing) table from cadence-plugin/cadence-reference.md Verb Catalogue.
- [x] Remove The Pipeline diagram and graduation-gate references from cadence-plugin/cadence-runtime.md, including the Internal verbs the agent invokes by chaining sentence.
- [x] Replace the Idea Lifecycle section in cadence-plugin/cadence-reference.md with a single-paragraph historical note pointing to Brainstorm Workspaces.
- [x] Remove the entire Develop section from cadence-plugin/workflows/verb-contracts.md.
- [x] Strip the idea-specific check delegation from cadence-plugin/skills/reflect/SKILL.md Phase 1 step 4c.
- [x] Rewrite cadence-plugin/skills/resolve/SKILL.md pursuit-closure absolute-block: drop unresolved Ideas, insert placeholder for unresolved brainstorms in phase diverging or converging (P2 wires the real check).
- [x] Remove the Mid /develop → concern branch from cadence-plugin/skills/capture/SKILL.md step 2 (verb-context derivation).
- [x] Audit cadence-plugin/skills/{brainstorm,find,incoming}/SKILL.md for develop/promote/Idea references and strip them; rewrite /cadence:incoming's i — capture-as-idea triage outcome to i — capture-as-thought (writes via cadence write-capture instead of create-idea).
- [x] Strip develop/promote/idea-state mentions from cadence-plugin/agents/narrator.md and cadence-plugin/agents/reconciler.md.
- [x] Delete journeys/brainstorm-develop-promote.yaml and journeys/idea-closure.yaml; trim journeys/core-lifecycle-loop.yaml of idea-state references.
- [x] Update CLAUDE.md plugin-development section: remove the Two verbs are hidden internal sentence.
- [x] Run npm test; fix or delete any tests that exercised Idea/develop/promote paths.
