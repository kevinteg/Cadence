# Cadence

*The rhythm you return to.*

A cognitive operating system that manages attention, protects flow state,
and generates narrative across pursuits.

## Quick Start

```bash
# Extract the archive, init git, and open Claude Code
cd cadence
git init
git add -A
git commit -m "Bootstrap Cadence repo"
claude
```

Then paste the prompt from `docs/bootstrap-prompt.md`, or just type `/recap`.

## What's Here

```
CLAUDE.md                    Agent entry point (vocabulary, modes, conventions)
cadence.yaml                 Global configuration
.claude/commands/            Slash commands (/recap, /mark, /reflect, /thought, /status)
pursuits/                    Active pursuits with projects and session markers
thoughts/                    Captured ideas awaiting triage
reflections/                 Weekly reflection artifacts
narratives/                  Generated writing
workflows/                   Workflow definitions (Reflect ritual, etc.)
docs/                        Reference documentation (architecture, vision, etc.)
src/                         Engine code (future — CLI, indexer, MCP server)
```

## This Repo is Its Own First User

The pursuit "Build Cadence v1" tracks building the tool itself. The project
files and directory structure ARE Cadence data — used for real tracking and
as test fixtures for validating the format.

## Documentation

- `docs/architecture.md` — All design decisions and rationale
- `docs/product-vision.md` — Full product vision
- `docs/one-pager.md` — Elevator pitch
- `docs/state-examples.md` — Example data formats with tradeoffs analysis
- `docs/gtd-critique.md` — GTD-informed critique (addressed in current design)
