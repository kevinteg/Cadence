---
id: pursuit-delegation
pursuit: improve-ux-and-authoring
status: active
created: 2026-07-09
origin:
  kind: github_issue
  repo: kevinteg/Cadence
  number: 15
  url: https://github.com/kevinteg/Cadence/issues/15
---

# Pursuit delegation: hub delegates pursuit authority to another cadence repo (read-only aggregation + hub-side guardrails)

Triaged from issue #15: https://github.com/kevinteg/Cadence/issues/15

## Intent

The ecosystem now has one intended hub (personal-assistant) and several spoke repos (pursuit-gaming, home-tech, city-services). The hub/spoke relationship exists only as prose today — hub cannot see spoke pursuits during /status or /reflect, no guardrail stops cross-repo project leakage, multiple hubs per machine require registry-based resolution.

Suggested solution: Make delegation a first-class relationship, read-only from the hub side:
1. Hub-side stub pursuit: a pursuit declares delegated_to: <git-url> (resolved per-machine like publish-resolve). Hub-side why/target/win_cycle live on hub; projects/actions/captures live in the delegate repo.
2. Read-only aggregation: /status and /reflect on the hub scan delegated repos via the deterministic CLI, render summaries inline (clearly marked as delegated). No hub verb ever writes into the delegate.
3. Hub-side guardrails: when a unit is delegated, /start, /brainstorm --crystallize, capture triage, etc. refuse to create projects under it and point to the delegate repo.
4. Registry: per-machine registry (~/.config/cadence/repos.yaml) lists known cadence repos and which are hubs.

Felt-sense of done: cross-life prioritization works as a query (not memory), and the CWD-leakage failure mode is structurally prevented.

## Actions

- [x] Read the issue thread and decide first concrete move.
  - Shipped 2026-07-10: delegated_to + delegates + guardrails.
- [x] delegated_to pursuit frontmatter (git URL or registered name) in PursuitFrontmatterSchema; scan passes it through
- [x] resolveDelegate: registry name → registry git-URL → sibling-dir discovery (reuses publish-resolve mechanism; never path-binds); src/delegation.ts
- [x] cadence delegates [--json]: read-only aggregation — resolves each delegated pursuit and scans its repo for a live summary
- [x] Hub-side guardrails: create-project + crystallize refuse against delegated pursuits with a pointer to the delegate repo
- [x] Render: delegated stubs show as 'delegated → <target>' in status dashboard and pursuit drill-down instead of a misleading 0/0
- [x] Docs: runtime Hub and Spoke section, reference Hub-and-Spoke mechanics, start/status skill contracts
- [ ] Hub /reflect aggregation (issue #15 item 2): surface delegated-repo summaries during Get Clear, not just /status
- [ ] Reference queue (issue #15 item 3): a hub-side pointer the delegate surfaces on its next reconcile — mechanism TBD, must preserve 'hub never writes into delegate'
