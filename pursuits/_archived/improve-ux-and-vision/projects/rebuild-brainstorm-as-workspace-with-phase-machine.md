---
id: rebuild-brainstorm-as-workspace-with-phase-machine
pursuit: improve-ux-and-vision
status: done
created: 2026-05-22
---

# Rebuild brainstorm as workspace with phase machine and --crystallize

## Intent

With develop and promote retired and legacy Ideas deleted (P1 = retire-develop-and-promote-cleanly), /cadence:brainstorm becomes a workspace verb rather than a generator. Each session opens a workspace at brainstorms/<slug>/ carrying workspace.md (divergent scratch), meta.yaml (phase: diverging | converging | crystallized | archived, plus created_at, last_touched, source_thoughts, candidate_solutions, selected_solution, target_pursuit), optional refs/ (pulled-in thoughts), solutions/<name>.md (one per candidate when converging), and decision.md (populated on crystallize).

The phase machine is driven by user dialogue inside the session. When the user signals "I have three candidate solutions," the agent writes solutions/ files and updates meta.yaml to phase: converging. When the user picks one, /cadence:brainstorm --crystallize materializes a pursuit from the selected solution: parses H1 to title, prose preamble to Intent, ## Next steps H2 with - [ ] lines to actions; writes brainstorms/<slug>/decision.md; updates meta.yaml to phase: crystallized + target_pursuit. /cadence:brainstorm --archive closes a workspace, moving it to narratives/brainstorms/<slug>/ (keep) or deleting (delete) per user choice.

The top-level brainstorms/ directory is created lazily on first invocation, matching the existing pattern for validations/ and thoughts/processed/. Active brainstorms (phase diverging or converging) are first-class citizens in /cadence:status and become a blocker for pursuit closure in /cadence:resolve — no resolving a pursuit with diverging/converging brainstorms hanging off it. /cadence:find searches brainstorm workspaces and solutions alongside other entities.

Brainstorms+solutions are now the only ideation surface; the Idea entity no longer exists.

Done feels like: /cadence:brainstorm <topic> creates brainstorms/<topic>/ with workspace.md and meta.yaml; the agent facilitates ideation, writing notes to workspace.md; when the user names candidate solutions the agent creates solutions/<name>.md files and bumps phase to converging; /brainstorm --crystallize produces a new pursuit with Intent + actions extracted from the chosen solution and writes decision.md; the status dashboard shows active brainstorms with phase + last_touched.

## Actions

- [x] Document the brainstorms/<slug>/ layout and meta.yaml schema in cadence-plugin/cadence-reference.md (new Brainstorm Workspaces section).
- [x] Add cadence create-brainstorm <slug> [--source-thought <id>] CLI subcommand: creates brainstorms/<slug>/{workspace.md, meta.yaml, refs/, solutions/} with phase: diverging.
- [x] Add cadence set-brainstorm-phase <slug> --phase <diverging|converging|crystallized|archived> CLI subcommand (touches meta.yaml: phase and last_touched).
- [x] Add cadence crystallize <slug> --solution <name> --pursuit <new-id> CLI subcommand: reads solutions/<name>.md, extracts H1 to title, preamble to Intent, ## Next steps - [ ] lines to actions, calls existing project-creation path, writes brainstorms/<slug>/decision.md, updates meta.yaml to phase: crystallized + target_pursuit.
- [x] Add cadence archive-brainstorm <slug> [--keep|--delete] CLI subcommand: moves to narratives/brainstorms/<slug>/ (keep) or deletes; sets phase: archived if kept.
- [x] Add src/scan/brainstorms.ts and a brainstorms field on Snapshot; emit per-workspace {slug, phase, last_touched, source_thoughts, candidate_solutions} from cadence scan --json.
- [x] Rewrite cadence-plugin/skills/brainstorm/SKILL.md end-to-end to drive the phase machine: open or resume workspace, facilitate divergent ideation writing into workspace.md, prompt for solution-naming when convergence signal appears, write solutions/<name>.md files, gate --crystallize on phase: converging + selected_solution.
- [x] Wire active brainstorms into cadence-plugin/skills/resolve/SKILL.md pursuit-closure absolute-block (replaces the P1 placeholder).
- [x] Update cadence-plugin/skills/status/SKILL.md to render active brainstorms with phase + last_touched (P4 reshape will consume this).
- [x] Update cadence-plugin/skills/find/SKILL.md to search brainstorms/**/workspace.md and brainstorms/**/solutions/*.md.
- [x] Rewrite or replace journeys/core-lifecycle-loop.yaml (touched by P1) to use brainstorm + crystallize instead of brainstorm + develop + promote.
