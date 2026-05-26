---
id: harden-inbox-as-triage-zone
pursuit: improve-ux-and-vision
status: done
created: 2026-05-21
origin:
  kind: github_issue
  repo: kevinteg/Cadence
  number: 2
  url: https://github.com/kevinteg/Cadence/issues/2
---

# Inbox is a triage zone, not an organization layer — surface guidance and consider tooling nudges

Triaged from issue #2: https://github.com/kevinteg/Cadence/issues/2

## Intent

## The anti-pattern

During a brainstorm session, the assistant (claude-code + cadence plugin) proposed keeping "cross-cutting" or "standing meta" ideas on the Inbox pursuit indefinitely, treating Inbox as an organizational layer for items that don't fit cleanly under a specific pursuit.

The user corrected this:

> *"Inbox is not for standing items. They should be triaged as soon as possible. It is not an organization system, just a short term holding zone."*

The fix on the user side: force-fit cross-cutting seeds into the pursuit they most touch, even when fit is imperfect. The pursuit owner can move them later.

## Why this matters

If users (or assistants) come to treat Inbox as a permanent home for cross-cutting / meta ideas, it:
- Bloats Inbox over time, eroding its function as a quick triage queue.
- Hides "cross-cutting" ideas from the pursuit they most affect, where they'd otherwise be acted on.
- Creates a quasi-organizational layer competing with pursuits, undermining the pursuit-as-role model.

## Possible mitigations to consider

- **Skill / prompt guidance:** Strengthen language in brainstorm / develop / reconcile skills that surfaces Inbox as a transient holding zone, not an organizational tool. (The brainstorm skill currently says ideas are "candidates for future Pursuits" — could be more explicit about the triage requirement.)
- **Reconciler flag:** Surface Inbox seed age (e.g., > N days) as a reconciler flag prompting triage. The age field already exists.
- **Capacity hint:** Tooling-level surfacing when Inbox grows beyond a soft cap (e.g., > 10 seeds), suggesting a triage pass.
- **Status verb:** Could `cadence status` show Inbox seed count distinctly and prompt action when it's non-trivial.

## Provenance

Filed by user ktegtmeier-nexthop via claude-code; the assistant proposed the anti-pattern, the user corrected it, and asked for an upstream issue to potentially harden the Cadence flow against this misuse.

## Actions

- [x] Read the issue thread and decide first concrete move.
- [x] Audit and tighten Inbox-as-transient language in brainstorm/develop/reconcile skills
- [x] Add reconciler flag for stale Inbox seeds (use existing age field; choose threshold)
