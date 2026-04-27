---
id: harden-plugin-manifest
pursuit: build-cadence-v1
status: on_hold
created: 2026-04-27
---

# Harden Plugin Manifest

The plugin.json is minimal — name, version, description, author, license, keywords, skills path. Missing the metadata that Claude Code marketplace listings and external installers will expect (homepage, repository, bugs URL). Add a CHANGELOG.md so external users can see what changes between versions. Establish version-bump discipline.

## Definition of Done

- [ ] .claude-plugin/plugin.json adds homepage, repository, and bugs fields pointing at the GitHub repo (or placeholder URLs if not yet public)
- [ ] Any other fields the current Claude Code plugin schema supports (icon, displayName, etc.) are evaluated and added if useful
- [ ] CHANGELOG.md created at cadence-plugin/ root with a 0.1.0 entry covering the v1 surface and a stub for the next version
- [ ] Version-bump policy documented in CHANGELOG header (semver: minor for new verbs, patch for fixes)
- [ ] User-story validation: claude --plugin-dir ./cadence-plugin still loads cleanly with the expanded manifest; no schema warnings in startup logs
- [ ] User-story validation: jq . on plugin.json shows all expected fields populated, not empty strings or nulls

## Actions

- [ ] Look up the current Claude Code plugin.json schema and list any fields we're missing
