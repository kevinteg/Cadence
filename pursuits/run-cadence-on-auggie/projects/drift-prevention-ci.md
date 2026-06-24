---
id: drift-prevention-ci
pursuit: run-cadence-on-auggie
status: done
created: 2026-06-24
---

# Drift prevention + CI gate

## Intent

Keep the generated auggie-plugin/ honest. Add 'cadence build-auggie --check' that regenerates to a temp dir and diffs against the committed auggie-plugin/, exiting non-zero on any difference. Wire it into a GitHub Actions workflow so a PR that edits plugin source without regenerating fails. Extend the existing .githooks/pre-commit (already rebundles on src/** changes) to also regenerate auggie-plugin/ when plugin source changes, so local commits stay in sync. Done means: --check detects drift, CI enforces it, and the pre-commit hook auto-regenerates.

## Actions

- [x] Implement build-auggie --check diff mode (regenerate to temp, diff, non-zero on drift)
- [x] Add a GitHub Actions drift-check workflow and extend .githooks/pre-commit to regenerate auggie-plugin/
