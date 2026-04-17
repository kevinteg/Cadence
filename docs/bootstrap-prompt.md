# Cadence — Claude Code Bootstrap Prompt

Paste the following into your first Claude Code session after running `bootstrap.sh`.

---

## Prompt

```
Read CLAUDE.md and docs/architecture.md to understand this repo. This is a
Cadence repository — a cognitive operating system for managing attention and
generating narrative across pursuits.

This repo is Cadence's own first user. The pursuit "Build Cadence v1" tracks
building the tool itself, and the project files double as test fixtures for
validating the data format.

Start by running /recap to see the current state of the system. The
"define-data-format" project is nearly complete — it just needs the seed
data validated (which we're doing right now by using the repo). The next
active project is "implement-agent-skills" — testing and iterating on the
slash commands against real data.

After the recap, let's test /mark by writing a marker for the architecture
session we just completed. Here's the context for the marker:

- Pursuit: build-cadence-v1
- Project: define-data-format
- We completed the full architecture design session covering: persistence
  model (hybrid markdown + SQLite cache), directory layout, file formats
  for pursuits/projects/markers/reflections, session levels (project,
  pursuit, orchestrator), pursuit lifecycle (active/someday/archived),
  tooling architecture (skills → CLI → MCP progression), and repo structure.
- The remaining work on define-data-format is validating the formats by
  using them — which we're doing now.
- Next steps: test all slash commands against seed data, iterate on
  command prompts, then move to the implement-agent-skills project.
```
