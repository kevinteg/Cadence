---
id: runtime-context-and-rules
pursuit: run-cadence-on-auggie
status: done
created: 2026-06-24
---

# Runtime context -> Auggie rules

## Intent

Claude Code always-loads cadence-runtime.md via an @-import in CLAUDE.md. Auggie reads CLAUDE.md/AGENTS.md hierarchically and supports .augment/rules/*.md (type Always/Manual/Auto) but may not honor @-imports. Convert cadence-runtime.md into .augment/rules/cadence-runtime.md with 'type: always' frontmatter (do not rely on @-import), and emit a top-level AGENTS.md. Copy on-demand reference docs (cadence-reference.md, workflows/*.md, coaching-strings.md) into the Auggie build with rewritten paths so commands reference them as today. Done means: the runtime loads as an Always rule under Auggie and on-demand docs resolve by path.

## Actions

- [x] Generate cadence-runtime.md as an .augment/rules/ Always rule and confirm Auggie loads it
- [x] Copy reference/workflows/coaching-strings docs into the Auggie build with rewritten internal paths
