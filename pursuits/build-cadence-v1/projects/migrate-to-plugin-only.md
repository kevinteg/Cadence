---
id: migrate-to-plugin-only
pursuit: build-cadence-v1
status: done
created: 2026-04-21
---

# Migrate to Plugin-Only Command Surface

## Definition of Done
- [x] All user-facing commands removed from `.claude/commands/` (only dev commands like run-journey remain)
- [x] All v3 skills live in `cadence-plugin/skills/` as the single source of truth
- [x] CLAUDE.md updated with instructions to use `--plugin-dir ./cadence-plugin`
- [x] Plugin cadence-runtime.md, workflows, and cadence.yaml are the canonical copies
- [x] This repo's local workflows/ and cadence.yaml are either symlinked to plugin or removed
- [x] Verified: plugin provides all 12 `/cadence:*` skills
- [x] Run-journey updated to work with plugin skill names if needed

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
