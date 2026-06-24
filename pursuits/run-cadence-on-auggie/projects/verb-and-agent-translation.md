---
id: verb-and-agent-translation
pursuit: run-cadence-on-auggie
status: done
created: 2026-06-24
---

# Verb + agent translation (auto-translate to Auggie terms)

## Intent

The bulk of 'auto-translate to Auggie terms'. Transform each skills/<verb>/SKILL.md into .augment/commands/cadence-<verb>.md (frontmatter description carries over, add argument-hint, substitute $ARGUMENTS) and each agents/<name>.md into .augment/agents/<name>.md (map tools allowlist, carry budget prose). Build rewrite.ts as the SINGLE shared token-rewrite surface every artifact body passes through, neutralizing to platform-agnostic terms rather than Auggie-specific ones: /cadence:<verb> -> /cadence-<verb> (working flat form); 'the Agent tool'/'dispatch the X subagent' -> platform-neutral subagent-dispatch phrasing; CC-internals teaching nouns (plugin model/ToolSearch/CLAUDE_PLUGIN_ROOT) -> platform-agnostic phrasing. Implemented as an ordered, reviewable, testable list of rules. Done means: all 18 skills + 5 agents transpile and no /cadence: token survives in output.

## Actions

- [x] Implement frontmatter+body mapping for one verb end-to-end (e.g. start) and snapshot-test the output
- [x] Build rewrite.ts as an ordered rule list; assert no /cadence: tokens survive and dispatch phrasing is rewritten
- [x] Extend the transform to all 18 skills and 5 subagents; snapshot a representative subset
