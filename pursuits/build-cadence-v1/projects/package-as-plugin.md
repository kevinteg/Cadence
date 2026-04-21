---
id: package-as-plugin
pursuit: build-cadence-v1
status: done
created: 2026-04-21
---

# Package as Plugin

## Definition of Done
- [x] CLAUDE.md split into runtime (portable) and product-dev (this repo only)
- [x] Plugin manifest (plugin.json) created with correct structure
- [x] All slash commands moved to plugin skills/ directory
- [x] Workflows (reflect, reconciler) included in plugin
- [x] cadence.yaml template or defaults included in plugin
- [x] Plugin installable in another repo via local path
- [x] This repo's CLAUDE.md imports runtime from plugin and adds product-dev layer

## Actions
- [x] Audit CLAUDE.md to identify runtime vs product-dev content
- [x] Create cadence-plugin/ directory with plugin.json manifest
- [x] Extract runtime CLAUDE.md content into plugin (vocabulary, agent modes, session context, conventions)
- [x] Move .claude/commands/*.md to cadence-plugin/skills/ (exclude run-journey which is dev-only)
- [x] Move workflows/*.md into plugin
- [x] Include cadence.yaml defaults in plugin
- [x] Rewrite this repo's CLAUDE.md: import runtime from plugin, keep meta-awareness and building/testing modes
- [x] Update this repo's .claude/commands/ to reference plugin skills or keep dev-only commands locally
- [x] Test plugin installation via local path in a scratch repo
- [x] Document plugin installation steps

## Notes
The CLAUDE.md in this repo has three layers:

1. **Runtime** (portable — goes in plugin): Vocabulary, Agent Modes,
   Session Context, Conventions (file ops, session lifecycle, creating/
   completing projects, waiting-for, thoughts, pursuit lifecycle, formats,
   workflows).

2. **Product-dev** (this repo only): Meta-awareness dual nature section,
   building/using/testing modes, architecture doc reference.

3. **Commands and workflows** (portable — goes in plugin): All slash
   commands except run-journey (dev/test only), reflect workflow,
   reconciler workflow.

Claude Code plugins support:
- skills/ directory for slash commands (namespaced as /cadence:select etc.)
- CLAUDE.md @import syntax for runtime content
- Local path installation for development

The personal repo (test-personal-repo) is the first consumer of this plugin.
