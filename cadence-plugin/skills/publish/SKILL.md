---
description: Contribute curated content from the Cadence workshop into an external destination repo — locate its local checkout (identity is the git URL, the checkout is discovered per-machine), conform to the destination's own conventions, flag private content before it crosses, and edit in place (mode B — git owns merge/auth/idempotency). Hidden verb — not on the visible 12-verb surface. TRIGGER ONLY when the user explicitly invokes /cadence:publish or /publish. SKIP all natural-language equivalents — never auto-fire from "publish this", "push it to the team wiki", "share this externally", or similar; instead surface the verb name as a suggestion when such language appears.
---

# /publish

Contribute curated content from the Cadence workshop (a wiki narrative,
a primer, a project's Intent/notes, a research primer) **into an
external destination repo** — a separate team/shared repo of markdown
that holds its own authoritative content. The promotion path that
complements the built-in `wiki/` path: that one lands in *your* corpus;
this one lands in *someone else's*.

Hidden verb — not on the visible 12-verb surface; explicit-invocation
only; agent-suggested when chat language signals publish intent.

Reference `workflows/verb-contracts.md` for the publish register. The
design rationale (why **mode B**, why the issue's three forks dissolved,
why **surface-and-warn** over enforce) lives in the archived brainstorm
at `wiki/_archive/brainstorms/first-class-publish/`.

## The shape (read this first)

- **Mode B — edit the destination in place.** You contribute by editing
  the destination's markdown files *in its own checkout*, committing
  there. Cadence keeps **no** target-shaped staging mirror. Because the
  edits land in the real repo, **git owns merge, conflict, auth, and
  idempotency** — re-publishing is just another commit.
- **Identity = the git URL** (stored in config). The **local checkout is
  discovered per-machine** (`cadence publish-resolve`), never path-bound
  — so a target survives machine moves.
- **Conform to the destination's conventions, re-read every publish.**
  The destination is authoritative and moving; learn its house-style
  *fresh* each time, never from a cache.
- **Privacy = surface-and-warn.** Cadence can't *enforce* judgment when
  your hands are in another repo. Its job is to make the boundary
  impossible to miss — flag private-looking content, and **never carry a
  link back to the private Cadence repo.** Provenance stays cadence-side.

## Usage

- `/publish` — no arg: list configured targets, ask which (or how to add one)
- `/publish <target>` — publish to a named target
- `/publish --to <target>` — same, explicit-flag form
- `/publish <target> <source>` — name the cadence-side source artifact up front

`<target>` matches a `name` in `cadence.yaml`'s `publish_targets`.
`<source>` is optional — a wiki slug, project id, or free description;
the skill helps locate it if omitted.

## Steps

### 1. Resolve the target

Run `cadence publish-targets --json`.

- **Empty:** coach and exit — "No publish targets configured. Add one
  under `publish_targets:` in `cadence.yaml` (a `name` + the repo's
  `git_url`), then re-run." Show the commented example block from
  `cadence.yaml`. Do not invent a target.
- **`<target>` given but no match:** list the configured `name`s and the
  add-instructions. Exit.
- **No argument:** list the targets (`name → git_url`) and ask which.

### 2. Locate the checkout (discovery — never path-bind)

Run `cadence publish-resolve <target> --json`. Branch on `checkout`:

- **Found (`checkout` non-null):** confirm the path with the user
  ("Found `<target>` at `<path>`"). If `clean` is `false`, **warn** —
  the destination has uncommitted changes; surface them
  (`git -C <path> status --short`) and ask whether to proceed (your
  publish edits will mix with what's already uncommitted there).
- **Not found (`checkout` is null):** surface what was searched, then
  prompt for the local path — "Couldn't find a local checkout of
  `<git_url>`. Searched: `<dirs>`. Where is it? (or clone it first, then
  re-run)." Re-run `cadence publish-resolve <target> --path <answer>
  --json` to **verify** the answer's remote matches the target URL. If
  it still doesn't match, say so and ask the user to confirm or correct
  — don't silently accept a mismatched repo.

**Never** write a discovered path back into config. Identity stays the
URL; the path is resolved fresh each run.

### 3. Identify the source — what's being contributed

Ask (or take `<source>`): what cadence-side material is this contributing?
Locate it with `cadence find <text>` or `cadence wiki ask "<q>"` /
`cadence wiki open <slug>`. Typical sources: a wiki capstone/primer, a
project's Intent + notes, a research primer. Read it into context — this
is the raw material you'll refactor for the destination's audience.

### 4. Get the destination's current state in front of you (round-trip)

The destination is authoritative — draft *against* it, not blind. Show
its branch + status (`git -C <checkout> status -sb`). If it's behind its
remote, **suggest** `git -C <checkout> pull` (or `fetch`) — but **ask
first; never auto-mutate the user's other repo.** This is the
"current-state-to-draft-against" requirement the design names.

### 5. Read the destination's conventions (re-read EVERY publish)

Examine the destination checkout fresh to learn its house-style — this
is the one sanctioned cross-repo read (the user directed it; see
Guardrails). Bounded: cap at ~10 representative files. Look for:

- **Layout** — where do pages live? Is there a `research/` /
  `references/` / `docs/` / `notes/` folder? A `CONTRIBUTING.md` or
  style guide (read it if present)?
- **Page shape** — open 2–4 existing pages closest to what you're
  contributing. Note frontmatter (shape, or none), heading conventions,
  naming (kebab? Title Case? dated?), link style (relative `.md` links?
  `[[wikilinks]]`?).
- **References** — *how does this repo cite?* Footnotes? A `## References`
  section? Inline links? A separate refs file/folder? If pages carry
  references a certain way, **match it** — if there's a `references/`
  folder, refs go there, linked the way that repo links them.

Present a short **house-style profile** the user can correct: "This repo
puts pages under `docs/`, kebab-cased, frontmatter is `title` + `tags`;
references go in a `## References` section as numbered links. I'll follow
that." Re-read each publish — do not cache a profile across runs.

### 6. Privacy scan + warn (surface-and-warn — make the boundary impossible to miss)

Before anything crosses, scan the source material (step 3) and **flag
private-looking content**. This is not enforcement — it's visibility —
**except** the back-link rule, which is hard:

- **Hard rule — links/paths that point home NEVER cross.** Any link or
  path into the Cadence repo (`pursuits/`, `thoughts/`, `wiki/`,
  `reflections/`, `brainstorms/`), any `[[wikilink]]`, any relative path
  into this repo, and the Cadence repo's own git URL — strip or rewrite
  them. The destination must carry **no pointer back to the private
  repo.**
- **Flag for the user's judgment** (don't auto-strip — surface):
  - Raw/unpolished private notes — capture bodies, reflection text,
    brainstorm raw notes.
  - Names / internal identifiers — people from `person:` anchors or 1-1
    logs, internal project/pursuit IDs, internal-only terminology.
  - Secrets-ish — tokens, internal URLs, internal file paths.

Present it as a checklist: "Before this crosses, here's what I flagged
as private-looking: [list]. I'll strip the back-links automatically
(hard rule); the rest is yours to decide." The boundary is the user's to
hold — your job is that they can't miss it.

### 7. Edit the destination in place (mode B — the handoff)

Now do the contribution: write/edit markdown **in the destination
checkout**, conforming to the house-style profile (step 5), with private
bits handled (step 6). Place references where that repo puts them; match
its naming, frontmatter, and link conventions. The content is
refactored *for the destination's audience* — not a raw copy of the
cadence artifact.

Before writing, show the user the planned file set (create/modify) and,
for a substantial change, an **ELI5 recap** of what lands where. Then
write.

### 8. Preview (confirm it renders right over there)

After writing, surface the change and confirm it reads correctly in the
destination's own conventions:

- `git -C <checkout> status --short` + `git -C <checkout> diff` for the
  exact change.
- Offer to open it in the destination's preferred reader, by detection:
  an `.obsidian/` dir → suggest opening the vault; a `_config.yml` /
  Jekyll / Pages setup → suggest the local-serve command or the Pages
  URL; otherwise render the new markdown for a visual check. **Suggest
  the command — don't auto-open.**

### 9. Hand off the commit (git owns it)

Cadence does **not** auto-commit or push the destination — it's the
user's authoritative repo and may sit behind a review gate (PR flow).
Surface the commands for the user to run there:

```
Changes are in <checkout>. Review and commit in that repo:
  git -C <checkout> add <files>
  git -C <checkout> commit -m "<suggested message>"
  # then push / open a PR per your team's flow
```

Run the commit yourself **only** if the user explicitly asks. Re-publish
is idempotent by construction: editing the same files again just
produces another commit — no manifest, no dedup logic.

### 10. Record provenance — cadence-side ONLY

So the round-trip works next time (your repo remembers where it
contributes), stamp the **source** artifact, never the destination. If
the source is a cadence-side file with frontmatter, append a
`published_to:` entry (target name + date) via `Edit`. **Write nothing
into the destination that points home.** (A future `cadence
publish-record` CLI may formalize this log; for now a frontmatter stamp
on the source is enough.)

## Exit — verb-hint + teaching footer

Per the universal exit convention:

1. **Verb-hint block** — 2–3 next steps tied to where the user now is:
   commit/push in the destination (step 9 commands); `/cadence:narrate`
   the contribution; `/publish <target>` again after edits.
2. **Teaching footer** — `cadence tip-pick --triggers verb-publish`
   returns a one-line tip when eligible; render below the verb-hints,
   blank-line separated. Skip on null.

## Guardrails

- **Mode B only.** Cadence edits the destination checkout in place and
  keeps no staging mirror. There is no whole-file slot-in/merge engine —
  git is the merge.
- **Identity is the URL; never persist a discovered path.** The checkout
  is resolved fresh each run via `cadence publish-resolve`.
- **The destination checkout is the ONE sanctioned cross-repo
  read/write.** The user named it; the publish is the consent. This is
  the explicit exception to the runtime's "don't read outside the repo
  root" scope rule. Never read *other* arbitrary repos, and never widen
  beyond the named checkout.
- **Privacy = surface-and-warn, with one hard rule.** Back-links/paths to
  the Cadence repo never cross (auto-stripped). Everything else is
  flagged for the user's decision — Cadence does not silently carry or
  silently strip private content.
- **Never auto-commit, auto-push, or auto-pull the destination.** It's
  the user's authoritative repo with a possible review gate. Surface the
  git commands; run them only on explicit direction.
- **Conventions are re-read every publish.** No cached house-style
  profile — the destination moves and is authoritative.
- **Hidden verb status.** Not in `/cadence:help`'s primary catalogue.
  Discovery is the suggest-don't-run path: when chat language signals
  publish intent ("publish this to the team wiki", "push this to
  `<repo>`", "contribute this upstream"), the agent SUGGESTS
  `/cadence:publish` — never auto-fires — frequency-capped via `cadence
  tip-pick --triggers intent-publish-signal --types skill-teaching`.
  Skip the suggestion when the user already named the verb.
- **Smart-colleague tone.** Functional, no cheer, no streak-flavor.
