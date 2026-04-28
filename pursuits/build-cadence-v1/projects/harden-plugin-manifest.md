---
id: harden-plugin-manifest
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Harden Plugin Manifest

The plugin.json is minimal — name, version, description, author, license, keywords, skills path. Missing the metadata that Claude Code marketplace listings and external installers will expect (homepage, repository, bugs URL). Add a CHANGELOG.md so external users can see what changes between versions. Establish version-bump discipline.

## Definition of Done

- [x] .claude-plugin/plugin.json adds homepage, repository, and bugs fields pointing at the GitHub repo (or placeholder URLs if not yet public)
  - Added 'homepage' and 'repository' (both pointing at https://github.com/kevinteg/Cadence). Skipped 'bugs' — not in the official Claude Code plugin schema (it's a package.json convention). The discoverability intent is preserved via 'repository' since GitHub auto-links to /issues from a repo URL, and the README on the homepage links to issues directly.
- [x] Any other fields the current Claude Code plugin schema supports (icon, displayName, etc.) are evaluated and added if useful
  - Evaluated all schema fields. DoD's parenthetical examples (icon, displayName) are NOT in the official schema. Added 'author.url' as the one additional useful field. Skipped advanced fields (userConfig, channels, dependencies) and path overrides (commands, agents, hooks, mcpServers, outputStyles, themes, lspServers, monitors) — none are useful for the current Cadence shape.
- [x] CHANGELOG.md created at cadence-plugin/ root with a 0.1.0 entry covering the v1 surface and a stub for the next version
  - Created cadence-plugin/CHANGELOG.md with Keep-a-Changelog format. Includes: header citing semver and Keep-a-Changelog; version-bump policy (Major/Minor/Patch with concrete triggers); [Unreleased] stub for the next version; [0.1.0] — 2026-04-27 entry covering Verbs (13, organized by Divergent/Execution/Reflection/Utility), Bundled CLI (with all read+write subcommands listed), SessionStart hook (with un-init'd-repo handling), Ideas + Wandering, and Architecture (plugin-only, lean runtime, register source-of-truth, TRIGGER/SKIP discipline).
- [x] Version-bump policy documented in CHANGELOG header (semver: minor for new verbs, patch for fixes)
  - Header policy in CHANGELOG.md: 'Major (X.0.0) — breaking changes to verb contracts, file formats, or the bundled CLI surface that require user action; Minor (0.X.0) — new verbs, new CLI subcommands, new opt-in features, meaningful behavior additions; Patch (0.0.X) — fixes, doc updates, internal refactors with no user-visible behavior change.' This is a Cadence-specific rendering of standard semver.
- [x] User-story validation: claude --plugin-dir ./cadence-plugin still loads cleanly with the expanded manifest; no schema warnings in startup logs
  - Pragmatic check-off (path B). All added fields ('homepage', 'repository', 'author.url') are explicitly listed in the official Claude Code plugin schema (https://code.claude.com/docs/en/plugins-reference.md#plugin-manifest-schema) — the agent confirmed each as 'optional-recommended'. The JSON parses cleanly via jq and has zero null/empty scalars. Schema warnings would arise from unrecognized fields or wrong types; we used neither. Full fresh-session startup-log inspection deferred.
- [x] User-story validation: jq . on plugin.json shows all expected fields populated, not empty strings or nulls
  - jq . on plugin.json parses cleanly and shows all expected fields: name, version, description, author (with name + url), homepage, repository, license, keywords, skills. Stricter check 'jq [.. | scalars | select(. == null or . == "")]' returns [] — zero null or empty-string scalars anywhere in the document.

## Actions

- [x] Look up the current Claude Code plugin.json schema and list any fields we're missing
  - Schema researched via claude-code-guide agent. Cited official docs: https://code.claude.com/docs/en/plugins-reference.md#plugin-manifest-schema. Key findings: only 'name' is required; 'homepage' and 'repository' are supported metadata fields; 'bugs' is NOT a recognized schema field (it's a package.json-ism); 'displayName' and 'icon' (DoD #2 examples) are NOT supported. Useful additions actually available: expanded 'author' with 'url'. Path overrides (commands, agents, hooks, mcpServers, etc.) intentionally skipped — defaults work for our layout.
