# Changelog

All notable changes to the Cadence plugin will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Version-bump policy:**
- **Major** (`X.0.0`) — breaking changes to verb contracts, file formats,
  or the bundled CLI surface that require user action
- **Minor** (`0.X.0`) — new verbs, new CLI subcommands, new opt-in features,
  meaningful behavior additions
- **Patch** (`0.0.X`) — fixes, doc updates, internal refactors with no
  user-visible behavior change

---

## [Unreleased] — v1.1 in progress (improve-ux-and-vision pursuit)

### Renamed: Wandering → Inbox

The standing pursuit that holds unattached Ideas — formerly `wandering` —
is now `inbox`. Domain-neutral familiar word; reduces cognitive tax for
new users. The metaphor was load-bearing in the v1 vision but the
audience cost outweighed the framing benefit.

**Migration for existing repos with `pursuits/wandering/`:**

```bash
# 1. Move the directory
git mv pursuits/wandering pursuits/inbox

# 2. Update the pursuit.md frontmatter
# Open pursuits/inbox/pursuit.md and change:
#   id: wandering   →   id: inbox
# Update the H1 title from "# Wandering" to "# Inbox"
```

The CLI still resolves either name in legacy data, but new installs and
new Ideas use `inbox`. The init skill has a legacy-detection note that
surfaces the migration command if it sees `pursuits/wandering/`.

## [Unreleased]

## [0.1.0] — 2026-04-27

First versioned release. The v1 surface:

### Verbs (13)

- **Divergent:** `/cadence:brainstorm`, `/cadence:develop`, `/cadence:promote`
- **Execution:** `/cadence:start`, `/cadence:pause`, `/cadence:complete`,
  `/cadence:cancel`, `/cadence:capture`
- **Reflection & output:** `/cadence:reflect`, `/cadence:narrate`,
  `/cadence:close`, `/cadence:reconcile`, `/cadence:waiting`
- **Utility:** `/cadence:status`, `/cadence:init`

Each verb sets a register (tone, behavior, guardrails) defined in
`workflows/verb-contracts.md`. State-modifying verbs require explicit
invocation; conversational verbs may auto-trigger when named.

### Bundled CLI

Self-contained Node bundle at `bin/cadence`, exposed on `PATH`
automatically by Claude Code's plugin loader. Read subcommands (`scan`,
`report`, `status`, `flags`, `pursuits`, `pursuit`, `project`, `ideas`,
`markers`, `captures`) and write subcommands (`create-pursuit`,
`create-project`, `create-idea`, `write-marker`, `write-capture`,
`write-reflection`, `set-status`, `set-idea-state`, `check`, `add-item`,
`add-waiting-for`, `flag-waiting-for`, `move-pursuit`).

### SessionStart hook

Plugin ships its own `hooks/hooks.json` that fires on session start,
showing the Cadence dashboard and an interaction hint. Gracefully degrades
in un-initialized repos with a "run `/cadence:init`" nudge.

### Ideas + Wandering

First-class Ideas collection adjacent to the work hierarchy. Every Idea
has a parent (a pursuit or project); unattached Ideas land on the
auto-created `wandering` pursuit. Lifecycle: seed → developed → promoted
| moved | closed.

### Architecture

- Plugin-only distribution — no per-repo skill copies
- Lean runtime (~110 lines, always loaded via `@`-import) with on-demand
  reference content in `cadence-reference.md`
- Single source for register language (`workflows/verb-contracts.md`)
- Skill descriptions encode TRIGGER/SKIP discipline so state-modifying
  verbs can't auto-fire from natural-language phrasings
