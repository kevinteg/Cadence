---
id: commitment-aware-attention
pursuit: improve-ux-and-notebook-integration
status: on_hold
created: 2026-06-11
origin:
  kind: github_issue
  repo: kevinteg/Cadence
  number: 6
  url: https://github.com/kevinteg/Cadence/issues/6
---

# Commitment-aware attention for finite pursuits: checkpoints in reconcile, Get Clear, and curation

Triaged from issue #6: https://github.com/kevinteg/Cadence/issues/6

## Intent

`target` exists on finite pursuits but nothing reads it. The attention stack is recency-shaped end to end: curateNextMoves() ranks LP alignment → recency → structural urgency → parking-lot pressure → routine surfaces, with no time-pressure input; dormancy scans only status: active projects (on_hold inherits "incubate without guilt"); Reflect's Get Clear shows Inbox / dormant / closing-in / WIP but never the clock, so the LP question gets answered by momentum.

That's right for speculative dates ("No speculative deadlines" — architecture.md), but the same rule carves out the case that matters: target dates only when an external commitment drives one. For an externally-committed finite pursuit, sequenced-but-parked work is structurally invisible until it's late. Reported instance shape: finite pursuit with an external target and a written mid-arc checkpoint requiring two prerequisite projects; one week out, both sit on_hold at 0 checked actions, no flag fires — no flag CAN fire — and three consecutive weekly LPs went to a different, momentum-rich pursuit. Instance-wide, 28 of 34 open projects lived in the unscanned on_hold state.

Design sketch from the issue: (1) optional structured checkpoints in pursuit frontmatter — only for externally-driven targets (checkpoints: [{date, label, projects}]). (2) Reconciler: quiet approaching_commitment flag when a checkpoint is within lead time and its listed projects show zero progress — informational voice, flags-not-blocks. (3) Reflect Get Clear: one commitment-pressure line ("Week-6 checkpoint in 7d — 2 listed projects untouched") BEFORE the LP question, so win-the-week is chosen with the clock visible. (4) curateNextMoves(): insert commitment pressure between LP alignment and recency. (5) Optional Get Clear awareness line (not a flag) — on_hold age inside finite pursuits with a target, distinguishing "incubating without guilt" (someday/ongoing) from "sequenced and forgotten" (finite, clock running).

Doctrine fit: rides entirely on the existing external-commitment carve-out. Respects the 3-4-item chunk limit — one line in Get Clear, one curation input. No per-project deadlines, no overdue shaming, no "why didn't you?" prompts.

Felt-sense of done: a finite pursuit with an external target and checkpoints gets quiet, well-placed clock visibility — reconciler flag, Get Clear line ahead of the LP question, and curation weight — without reintroducing deadline pressure anywhere else.

## Actions

- [ ] Read the issue thread and decide first concrete move.
