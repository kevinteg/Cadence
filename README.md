# Cadence

*The rhythm you return to.*

A cognitive operating system that holds your context, protects your flow, separates the modes of thought, and tells the story of what you're building. It works as well for **physical pursuits** (cleaning out the garage, training for a 10K, planning a wedding) as for **knowledge work** (a code review, a paper, a launch). Lives inside Claude Code as a plugin.

## At a glance

```
# Cadence Status

**This week**: no leveraged priority set — /cadence:reflect to set one. Last touch was `sort-and-donate-old-tools` (just now).

## Active Pursuits

### get-the-garage-cleaned-out — 0/1 projects done

| Project | Status | Actions | What it's about |
|---|---|---|---|
| `sort-and-donate-old-tools` | active | 2/5 | The toolbox in the corner has duplicates of everything — th… |

## Heads up

- Inbox: 2 items ✓

## Likely next moves

1. `/cadence:start sort-and-donate-old-tools` — Touched today — natural to pick back up.
2. `/cadence:narrate today` — Activity landed today with no daily narrative yet.
3. `/cadence:reflect` — No reflection yet — set a Leveraged Priority.
```

Navigation-led: what to work on, what's drifting, what to do next. No counts-as-noise, no scolding.

## Get started

If you already have Node, Claude Code, and `gh` installed:

```bash
git clone https://github.com/kevinteg/Cadence.git ~/code/cadence
cd <your-repo>             # any repo, or a fresh directory + git init
claude --plugin-dir ~/code/cadence/cadence-plugin
```

Then in Claude Code: `/cadence:init` walks the bootstrap and your first pursuit.

Fresh-Mac install (Node + Claude Code + `gh` from scratch) and the **10-minute walkthrough** with a working example: [`docs/getting-started.md`](docs/getting-started.md).

## Why Cadence

- **Hold your commitments alongside the work.** Pursuits (`be a present father`, `stand up CI for the team`, `get the garage cleaned out`) aren't a separate system; they're the parent of every project and action. → [`wiki/concepts/vision.md`](wiki/concepts/vision.md)

- **Protect flow state.** `/cadence:capture "..."` saves a thought silently — no agent response, no acknowledgment, no elaboration. The system never interrupts mid-flow; everything else surfaces at breakpoints. → [`wiki/concepts/architecture.md`](wiki/concepts/architecture.md)

- **Diverge before you converge.** `/cadence:brainstorm` opens a workspace with a phase machine (`diverging → converging → crystallized | archived`). Quantity-first ideation, then PPCo / criteria / pre-mortems, then a `--crystallize` flag that materializes the chosen solution as a Pursuit or Project. → [`wiki/concepts/architecture.md`](wiki/concepts/architecture.md)

- **See the story.** Generated narratives — daily, weekly, per-pursuit, multi-pursuit-lessons — pull from git history of your project files. The narrative IS the watermark; each run resumes from the last. → [`wiki/concepts/vision.md`](wiki/concepts/vision.md)

- **Author and publish a quality wiki.** The `wiki/` is a durable, Obsidian-shaped corpus — capstones, primers, living docs, and any shelf you invent. `cadence find` and `/cadence:wiki ask` discover it **recursively** (organize into your own folders, no fixed tier list); `/cadence:publish` contributes curated work into an external team repo (you edit the destination in place, private content flagged before it crosses); and the corpus renders straight to a **GitHub Pages** site. → [`docs/narrative-wiki-architecture.md`](docs/narrative-wiki-architecture.md)

The 12 user-facing verbs (`brainstorm`, `start`, `complete`, `resolve`, `waiting`, `capture`, `reflect`, `narrate`, `status`, `find`, `help`, `init`) are documented in [`cadence-plugin/README.md`](cadence-plugin/README.md) and the full per-verb contracts live in [`cadence-plugin/workflows/verb-contracts.md`](cadence-plugin/workflows/verb-contracts.md).

## What's in this repo

This repo is both the **plugin source** and **Cadence's own first user**.

The `cadence-plugin/` directory IS the distributable Claude Code plugin (skills, runtime, workflows, agents, hooks, bundled CLI). Pointing `claude --plugin-dir` at it gives you working Cadence in any repo.

The `pursuits/`, `brainstorms/`, `thoughts/`, `reflections/`, and `narratives/` directories contain **real data** — the work of building Cadence itself, tracked in Cadence. They double as live test fixtures for validating the format.

```
README.md                    This file
DEVELOPING.md                Build, test, plugin architecture (for hacking on Cadence)
CLAUDE.md                    Claude Code entry point (imports cadence-runtime.md)
cadence.yaml                 Repo-local configuration
cadence-plugin/              The distributable Claude Code plugin
pursuits/                    Active pursuits + projects; _archived/ and _dropped/ hold resolved pursuits
brainstorms/                 Divergent-ideation workspaces
thoughts/                    Captured thoughts awaiting triage (the Inbox view)
reflections/                 Weekly reflection artifacts
narratives/                  Generated narratives + drafts/ + session-log.md
docs/                        Vision, architecture, getting started, research, teaching tips, Marimo Console design
```

## Documentation

- **[`docs/getting-started.md`](docs/getting-started.md)** — install + the 10-minute walkthrough. Start here.
- **[`wiki/concepts/vision.md`](wiki/concepts/vision.md)** — what Cadence is and why. TL;DR plus the deep dive.
- **[`wiki/concepts/architecture.md`](wiki/concepts/architecture.md)** — design rationale. Why the model is shaped this way, what tradeoffs got made.
- **[`docs/narrative-wiki-architecture.md`](docs/narrative-wiki-architecture.md)** — the narrative & research wiki: the two-layer research→capstone architecture, and how you author, organize (recursive discovery), and publish (`/publish`, GitHub Pages) a quality wiki.
- **[`wiki/research/research-foundations.md`](wiki/research/research-foundations.md)** — research foundations mapped to design patterns.
- **[`wiki/research/teaching-tips.md`](wiki/research/teaching-tips.md)** — the curated content library that powers the in-product tip surfaces.
- **[`docs/marimo-console-design.md`](docs/marimo-console-design.md)** — forward-looking design notes for Cadence Console (Marimo notebook view). Not yet shipped.

Operational truth lives inside the plugin: [`cadence-plugin/cadence-runtime.md`](cadence-plugin/cadence-runtime.md) (always-loaded), [`cadence-plugin/cadence-reference.md`](cadence-plugin/cadence-reference.md) (on-demand), [`cadence-plugin/workflows/verb-contracts.md`](cadence-plugin/workflows/verb-contracts.md), and the per-verb [`cadence-plugin/skills/<verb>/SKILL.md`](cadence-plugin/skills/) files.

## Hacking on Cadence

See [`DEVELOPING.md`](DEVELOPING.md) for build, test, and the codebase tour.
