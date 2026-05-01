---
id: harden-plugin-manifest
pursuit: build-cadence-v1
status: done
created: 2026-04-27
---

# Harden Plugin Manifest

The plugin.json is minimal — name, version, description, author, license, keywords, skills path. Missing the metadata that Claude Code marketplace listings and external installers will expect (homepage, repository, bugs URL). Add a CHANGELOG.md so external users can see what changes between versions. Establish version-bump discipline.

## Actions

- [x] Look up the current Claude Code plugin.json schema and list any fields we're missing
  - Schema researched via claude-code-guide agent. Cited official docs: https://code.claude.com/docs/en/plugins-reference.md#plugin-manifest-schema. Key findings: only 'name' is required; 'homepage' and 'repository' are supported metadata fields; 'bugs' is NOT a recognized schema field (it's a package.json-ism); 'displayName' and 'icon' (DoD #2 examples) are NOT supported. Useful additions actually available: expanded 'author' with 'url'. Path overrides (commands, agents, hooks, mcpServers, etc.) intentionally skipped — defaults work for our layout.
