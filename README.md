# Cadence

*The rhythm you return to.*

A cognitive operating system that holds your context, protects your flow, separates the modes of thought, and tells the story of what you're building — across work, family, and personal growth. Lives inside Claude Code as a plugin.

## Quick Start

### Prerequisites

For a fresh Mac. Skip the steps you already have.

1. **Homebrew** — install from [brew.sh](https://brew.sh) if you don't have it.

2. **Node.js (LTS) via nvm** — Cadence's plugin runs on Node. Install via nvm so future upgrades don't require a system reinstall:

   ```bash
   brew install nvm
   ```

   Follow the post-install instructions Homebrew prints to add nvm to your shell profile (typically a `source $(brew --prefix nvm)/nvm.sh` line in `~/.zshrc` or `~/.bashrc`), then open a new shell. Install and select Node LTS:

   ```bash
   nvm install --lts
   nvm use --lts
   ```

3. **Claude Code CLI:**

   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

4. **GitHub CLI (optional but recommended):** install `gh` if you want to file issues against this repo:

   ```bash
   brew install gh
   gh auth login
   ```

### Install Cadence

Clone the plugin somewhere on your machine — anywhere is fine; the path is referenced by `--plugin-dir` below.

```bash
git clone https://github.com/kevinteg/Cadence.git ~/code/cadence
```

### Run Cadence in a repo

```bash
cd <your-repo>
git init  # if it's not already a git repo
claude --plugin-dir ~/code/cadence/cadence-plugin
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
