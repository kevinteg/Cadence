---
id: guest-mode
pursuit: improve-ux-and-authoring
status: active
created: 2026-07-09
origin:
  kind: github_issue
  repo: kevinteg/Cadence
  number: 16
  url: https://github.com/kevinteg/Cadence/issues/16
---

# Guest mode: run cadence verbs outside a cadence root, proxied into a registered repo with delegated-scope guardrails (kill the CWD fallback)

Triaged from issue #16: https://github.com/kevinteg/Cadence/issues/16

## Intent

Two recurring situations break the run-Cadence-in-the-repo-it-belongs-to assumption: (1) Working sessions in delegate/other repos — findRepoRoot() in src/cli.ts walks up looking for cadence.yaml/pursuits/ and falls back to CWD, which has caused cadence state to be created in repos that were never cadence-initialized (project leakage). (2) Foreign/work repos where writing cadence structure is unacceptable and a strong data boundary must hold: by design the only flow between work and personal domains is reporting cadence bugs — no content crosses.

Suggested solution — guest mode with proxied writes and delegated-scope guardrails:
1. Never fall back to CWD. If no cadence.yaml/pursuits/ found walking up, enter guest mode instead (or no-op with guidance).
2. Explicit target resolution from the per-machine registry (~/.config/cadence/repos.yaml, shared with the delegation feature). If ambiguous, ask once per session.
3. Proxied verbs, scoped. Guest mode proxies into the target repo via the deterministic CLI (cadence --repo <path>), but the skill layer enforces scope: only pursuits the target repo has delegated to this context (plus always-safe verbs: capture to target inbox, status read-only). Everything else refuses with a pointer.
4. Foreign-repo hard mode. No registry entry + no delegation = restrict to: report a bug/feature to the Cadence repo only. No filesystem writes to any personal repo.
5. No silent structure creation. Only /cadence:init may create cadence structure in a repo, ever.

Felt-sense of done: CWD fallback is dead; running Cadence in a non-Cadence repo never silently creates state; capture-from-anywhere works; the work/personal boundary holds by construction.

## Actions

- [x] Read the issue thread and decide first concrete move.
  - Shipped 2026-07-10: CWD fallback killed, registry, guest surfaces.
- [x] Kill the CWD fallback: findRepoRoot returns null; strict resolveRepoRoot errors with guidance; explicit --root validated (src/root.ts, src/cli.ts)
- [x] Strengthen the root marker: bare pursuits/ no longer marks a repo unless it contains pursuit files
- [x] Per-machine registry at ~/.config/cadence/repos.yaml: cadence repos / repos-add / repos-remove; --root accepts a registered name; cadence context --json orients skills
- [x] SessionStart hook: silent in non-Cadence dirs; one-line guest additionalContext (no systemMessage) when a registry default exists
- [x] Guest contracts in capture/start/status skills + runtime Hub-and-Spoke + Scope rewrite; reference Hub and Spoke section
- [x] PreToolUse bash-permission-gate.mjs auto-allows plain cadence CLI invocations (kills per-subcommand prompts)
- [ ] Delegated-scope proxying (issue #16 item 3): in a spoke session, allow manipulating only pursuits the target repo has delegated to this context — finer than the current refuse-all-but-capture/status guest surface
