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

## [Unreleased]

### Added

- Per-machine repo registry — `cadence repos` / `repos-add` /
  `repos-remove`, backed by `~/.config/cadence/repos.yaml` — plus
  `cadence context`.
- Guest mode — repo-root resolution no longer falls back to CWD;
  commands run outside a Cadence repo error with guidance instead of
  scaffolding state; the SessionStart hook is silent in non-Cadence
  directories (one-line guest context when repos are registered).
- Pursuit delegation — `delegated_to` frontmatter, `cadence delegates`
  read-only aggregation, hub-side write guardrails.
- Content manifest + fleet discovery — `cadence-manifest.yaml`,
  `cadence manifest`, `cadence fleet`.
- PreToolUse permission gate auto-allowing plain `cadence` CLI
  invocations.

### Changed

- `pursuits/` alone no longer marks a repo root unless it contains
  pursuit files; `--root` accepts a registered repo name.

### Removed

- Author's `cadence.yaml` from the plugin directory.

## [0.2.0] — 2026-07-10

### Added: `/research` verb + research substrate (hidden verb)

The working tier of the narrative/wiki system (build-narrative-research-wiki
pursuit, step 1 of 6). A unit of work (project or pursuit) can now
accumulate a **research substrate** at `<unit>/research/` — `raw/`
(immutable captured sources), `notes/` (LLM-distilled atomic notes with
provenance frontmatter + `[[wikilink]]` cross-links), `index.md` (the
research template: catalog, primer, suggested learning, open questions),
`log.md` (append-only event log). New `research-ingest` subagent mirrors
capture-ingest's bump-in-the-wire isolation: bulk payloads never enter
the main thread. Skill operations: ingest (`/research <path-or-url>`,
project-scope default, `--pursuit` escalation), `ask` (index-first
query with citations), `primer` (orientation + reading order). Hidden
from the visible 12-verb catalogue for now — promotes when the wiki
layer ships. Formats documented in `cadence-reference.md` → "Research
Substrate"; contract in `workflows/verb-contracts.md` → "Research".

### Added: `/narrate capstone` + the wiki narrative layer

`/narrate` gains the **capstone** cadence (build-narrative-research-wiki
pursuit, step 2 of 6): a polished, source-grounded narrative for one
unit that promotes into root-level `wiki/narratives/<unit-id>.md`
instead of `narratives/drafts/`. Dual-source (project-file git activity
+ the unit's research substrate), style-aware (reads `wiki/_style/`,
seeded from new plugin `styles/` defaults — voice, capstone, primer,
diagrams; user edits win), Mermaid diagrams gated on
`effective_domain: digital | hybrid`, and a Sources section of
citation stubs designed to outlive the research substrate's `raw/`.
The unit file gains a one-line `narrative:` frontmatter pointer —
reference, not containment. Narrator agent gains the capstone contract
(budget 8, full-markdown return exception). Wiki layout + capstone
frontmatter schema documented in `cadence-reference.md` → "Wiki —
Durable Narrative Layer".

### Added: research-disposition GC ritual at closure

`/resolve` gains the GC ritual (build-narrative-research-wiki pursuit,
step 3 of 6): when a unit with a research substrate resolves, the
closure walks raw-disposition — capstone exists → Delete `raw/` by
default (git retains; notes + citation stubs survive), Archive to
`wiki/_archive/<unit>/raw/`, or Keep; no capstone → encouragement to
run `/narrate capstone` at the moment knowledge is freshest. Primer
graduation to `wiki/primers/` offered when the index has one. Stub
verification + ELI5 recap before any delete; only `raw/` is ever
GC-eligible; prompted, never silent. `/complete`'s
closing_in_on_resolution finalization menu gains "capstone" alongside
audit/narrative/demo/validation-review (runtime + contract + skill all
updated). Substrate index `status:` now tracks `researching → cleared
| archived-raw`.

### Added: `/wiki` verb + front door; drafts fold into `wiki/drafts/`

The discovery layer (build-narrative-research-wiki pursuit, step 4 of
6). New hidden verb `/wiki`: front door (`wiki/index.md`, rebuilt from
artifact frontmatter when stale), `ask` (index-first Q&A with mandatory
citations; subagent ask-mode for large corpora), open-by-slug, and
`related` (link-graph + frontmatter kinship). Compounding path: a good
ask answer can file back as a `status: draft` primer. Front-door,
meta-index (`wiki/_meta/index.md`), and wiki log formats documented in
the reference. `/find` extends with a Wiki results group.

**Breaking-ish:** working narratives move `narratives/drafts/` →
`wiki/drafts/` (writers use the new path; readers fall back to the
legacy path; one-time migration `git mv narratives/drafts wiki/drafts`
offered when the legacy path is hit). Root `narratives/` remains the
home of `session-log.md` and archived brainstorms only. `/init` now
scaffolds `wiki/drafts/`.

### Added: narrative Inbox — `triage_gist` on captures

Captures stop being bare names in the triage queue
(build-narrative-research-wiki pursuit, step 5 of 6). Distillation
paths (`--from` / `--source` / `--dump`), which already run the
capture-ingest subagent, now stamp a one-sentence `triage_gist` in v2
frontmatter — zero added cost on the hot path; inline `/capture`
stays bare by contract. New `cadence write-capture --triage-gist`
flag; `inboxItems()` exposes `gist` per item; `/start inbox` renders
it beside the name and generates gist-on-open for inline captures
during the walk. 120 tests pass (one new round-trip test).

### Added: `/wiki lint` + reconciler meta-awareness

The maintenance layer (build-narrative-research-wiki pursuit, step 6 of
6). New `wiki-lint` subagent (budget 8): scans the durable corpus for
dangling `narrative:` pointers, evaporated provenance (post-GC stub
integrity), orphan artifacts, stale index entries, draft pile-up, and
contradictions — findings only, never auto-fix. Reconciler gains two
flags: `capstone_gap` (resolved unit with a still-`researching`
substrate and no capstone pointer; GC-cleared substrates don't fire)
and `retrospective_due` (resolved pursuits since the last `/narrate
lessons` set-watermark reach `retrospective_due_threshold`, default 3,
configurable under `cadence.yaml` `defaults:`). Scan layer now reads
substrate refs (`<unit>/research/index.md` → `project.research` /
`pursuit.research`), the `narrative:` pointer as a first-class
frontmatter field, and the lessons watermark
(`snapshot.lessons_watermark`). Both flags render in the status Health
line, `cadence flags`, and `/reflect` Get Clear (new wiki-signals line
in the awareness block). 122 tests pass (two new).

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
