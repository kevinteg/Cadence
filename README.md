# Cadence

*The rhythm you return to.*

A cognitive operating system that holds your context, protects your flow, separates the modes of thought, and tells the story of what you're building — across work, family, and personal growth. Lives inside Claude Code as a plugin.

## Quick Start

```bash
# In any repo where you want to run Cadence:
cd <your-repo>
git init  # if it's not already a git repo
claude --plugin-dir <path-to>/cadence-plugin
```

In Claude Code, run `/cadence:init` to bootstrap, then `/cadence:start` to begin.

## What's Here

```
CLAUDE.md                    Agent entry point (imports cadence-runtime.md)
cadence.yaml                 Repo-local configuration
cadence-plugin/              The Claude Code plugin (skills, runtime, workflows, deck, tips, CLI)
pursuits/                    Pursuits with projects and ideas
thoughts/                    Captured thoughts awaiting triage
reflections/                 Weekly reflection artifacts
narratives/                  Generated narratives
validations/                 Pending fresh-session validations queue
journeys/                    User-journey YAML tests
docs/                        Reference documentation (this directory)
```

## This Repo Is Its Own First User

The pursuit `improve-ux-and-vision` (currently active) and the archived `build-cadence-v1` track building Cadence itself. The project files and directory structure ARE Cadence data — used for real tracking AND as test fixtures for validating the format.

## Documentation

- **`docs/vision.md`** — what Cadence is and why. The single vision doc (TL;DR + deep dive). **Read this first.**
- **`docs/architecture.md`** — design rationale: why the model is shaped this way, what tradeoffs got made.
- **`docs/research-references.md`** — research foundations mapped to design patterns (Allen, Newport, Doerr, Kahneman, McAdams, Gollwitzer, Karpathy, Willison, etc.).
- **`docs/teaching-tips-research.md`** — the curated content library that powers the in-product tip surfaces.

Operational truth lives inside the plugin:

- `cadence-plugin/cadence-runtime.md` — always-loaded runtime instructions
- `cadence-plugin/cadence-reference.md` — on-demand reference (file formats, CLI catalog, lifecycle mechanics, Intent and Actions discipline, tip library schema)
- `cadence-plugin/workflows/verb-contracts.md` — per-verb behavioral contracts
- `cadence-plugin/skills/<verb>/SKILL.md` — per-verb skill definitions
