---
id: auggie-deploy-reference-docs
pursuit: run-cadence-on-auggie
status: done
created: 2026-06-26
origin:
  kind: github_issue
  repo: kevinteg/Cadence
  number: 13
  url: https://github.com/kevinteg/Cadence/issues/13
---

# Auggie transpile omits on-demand reference docs from deployed .augment/

Triaged from issues #13 + #14 (duplicates): https://github.com/kevinteg/Cadence/issues/13

## Intent

The Auggie build's commands, the always-on runtime rule (.augment/rules/cadence-runtime.md), and the generated AGENTS.md instruct the agent to consult on-demand reference content (Reference workflows/verb-contracts.md, see cadence-reference.md, coaching-strings.md) but those files are NOT deployed into the .augment/ workspace, so every pointer dangles in a vendored Cadence data repo. The /cadence-publish flow depends on the publish register in workflows/verb-contracts.md, which cannot load. Missing from deployed .augment/: workflows/verb-contracts.md, workflows/coaching-strings.md, workflows/reflect.md, workflows/reconciler.md, cadence-reference.md. Root cause (per #13): src/auggie/transform.ts emitReferenceDocs writes REFERENCE_FILES (cadence-reference.md) and REFERENCE_DIRS (workflows, styles, tips, deck) to the repo root, not under .augment/, so when only .augment/ is vendored they are absent. Fix: emit the on-demand reference docs where the runtime rule's relative pointers resolve in the Auggie host (under .augment/), so command and runtime references resolve in a vendored repo. Done looks like: a deployed .augment/ carries the reference docs, the runtime and AGENTS pointers resolve, the drift check is clean, and /cadence-publish can load its register. Consolidates #13 and #14.

## Actions

- [x] Make src/auggie/transform.ts emit on-demand reference docs under deployed .augment/
  - transform.ts emits reference docs under .augment/ (REFERENCE_DEST_PREFIX); rewrite.ts adds surgical re-point rules (bare cadence-reference.md / workflows/ → .augment/-prefixed, lookbehind skips cadence-plugin/ & .github/).
- [x] Rebuild auggie-plugin; confirm pointers resolve and drift check clean
  - Regenerated: .augment/cadence-reference.md + .augment/workflows/* present; runtime/commands/AGENTS pointers repointed; 0 double-prefix, 0 mangled source paths; drift clean. NOTE: that Auggie resolves these from workspace root is the bet — queued for live verify.
