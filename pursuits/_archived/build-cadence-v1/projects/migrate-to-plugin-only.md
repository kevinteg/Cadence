---
id: migrate-to-plugin-only
pursuit: build-cadence-v1
status: done
created: 2026-04-21
---

# Migrate to Plugin-Only Command Surface

## Actions
- [x] Remove user-facing .claude/commands/ files (select, status, recap, mark, reflect, thought)
- [x] Update CLAUDE.md product-dev section with plugin-dir launch instructions
- [x] Plugin is the single source of truth — local workflows remain as development copies
- [x] Update plugin README for v3 verb surface
- [x] Verify all 12 skills present in plugin
- [x] Document in plugin README: how to install and use

## Notes
Local workflows/ and cadence.yaml remain in the repo root as development
copies that get synced to the plugin. The plugin versions are canonical
for consumers. This repo uses its own plugin via --plugin-dir.
