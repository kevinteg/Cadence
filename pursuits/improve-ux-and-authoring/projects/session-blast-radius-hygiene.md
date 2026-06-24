---
id: session-blast-radius-hygiene
pursuit: improve-ux-and-authoring
status: on_hold
created: 2026-06-11
origin:
  kind: github_issue
  repo: kevinteg/Cadence
  number: 7
  url: https://github.com/kevinteg/Cadence/issues/7
---

# Session blast-radius hygiene: nudge toward capture when one session fans out across many projects

Triaged from issue #7: https://github.com/kevinteg/Cadence/issues/7

## Intent

When capture is under-used, every conversation routes its learnings into destination project files live: a single reading or meeting session ends by editing 3-6 projects across multiple pursuits. From a reported three-week instance: 8 captures total vs. 53 projects created; 12 of 20 project-touching commits spanned ≥2 pursuits; ~278 actions minted vs. 65 checked (scope inflow ≈ 4x burn). The capture→triage pipeline — the design's pressure valve — gets bypassed, and the entity graph absorbs each session's full surface area immediately. Subjectively this reads as "every small step expands the scope."

Shape example: a session reading a renovation newsletter ends by adding actions to kitchen-renovation/pick-contractor, kitchen-renovation/appliance-shortlist, garage-cleanout/donation-run, and a learning project — four files across three pursuits, none of which was the session's subject.

Design sketch from the issue — two escalating options, both guardrail-not-gate: (1) Stop-hook awareness line (smallest): the stop-hook already writes narratives/session-log.md; when a session modified more than N project files, append one informational line suggesting capture-then-route for cross-project facts. Tip-library voice, never blocking, no mid-flow interruption — it lands after the session. (2) Session routing buffer (optional, larger): /capture items can carry a suggested destination during the session; one routing menu is presented at session end (or next triage) instead of live cross-project edits.

Doctrine fit: flow protection is the point — batching the convergent bookkeeping out of the flow moment is what capture exists for ("flow-safe — no agent response at capture time," vision.md). Informational only — no "why did you fan out?" interrogation, consistent with the no-blame guardrail.

Felt-sense of done: a high-fan-out session produces one quiet post-session nudge toward capture-then-route (and possibly a batched routing menu), and the capture pipeline starts absorbing cross-project facts instead of live edits scattering across the entity graph.

## Actions

- [ ] Read the issue thread and decide first concrete move.
