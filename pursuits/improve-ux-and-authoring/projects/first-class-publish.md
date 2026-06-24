---
id: first-class-publish
pursuit: improve-ux-and-authoring
status: done
created: 2026-06-23
origin:
  kind: github_issue
  repo: kevinteg/Cadence
  number: 9
  url: https://github.com/kevinteg/Cadence/issues/9
---

# First-class publish: contribute curated content into an external destination repo

Triaged from issue #9: https://github.com/kevinteg/Cadence/issues/9. Scope
refined via the `first-class-publish` brainstorm (archived at
`wiki/_archive/brainstorms/first-class-publish/` — keeps the reasoning, including
why the issue's three "open forks" dissolved).

## Intent

Cadence already promotes work from the pursuit/project workshop into its own
`wiki/` (the existing narrate/capstone path → GitHub Pages). This project adds the
*other* promotion path: contributing curated content from the workshop into an
**external destination** — a separate team/shared repo of markdown that holds its
own authoritative content. That's the non-obvious case, and the one this targets
first.

The design that cohered in the brainstorm:

- **Mode B — edit the destination in place.** You cd into the destination's local
  checkout and edit its markdown directly, committing there. Cadence does *not*
  maintain a target-shaped staging tier inside the cadence repo. Because your
  hands are in the real repo, **git owns merge, conflict, auth, and idempotency**
  — so the three "open forks" issue #9 was scoped around (merge granularity, auth
  model, conflict handling) dissolve. The verb gets smaller and sharper.
- **Destination identity = git URL** (stored, portable across machines). The
  **local checkout is discovered per-machine** — search peer directories, match
  the git remote, prompt if not found. Never a hard-coded path.
- **Handoff conforms to the destination's own conventions, re-read every
  publish.** Cadence examines the destination's *current* structure (where
  references live, how pages cite, naming) and follows it. The destination is
  authoritative and moving, so conventions are read fresh each time — no cached
  profile. If the destination has a `research/` or `references/` folder, refs go
  there, linked the way that repo links them.
- **Privacy = surface-and-warn.** Cadence can't truly *enforce* judgment when
  you're hand-editing in another repo; its job is to make the boundary impossible
  to miss — flag private-looking content (internal links, raw notes, names)
  before it crosses, and **never carry a link back to the private cadence repo.**
  Provenance lives cadence-side only, which also powers the round-trip: your repo
  remembers where it contributes, so you can always draft against the
  destination's current state.

Done feels like: `cadence publish --to <named-target>` locates the destination,
surfaces the relevant cadence-side material with private bits flagged, and drops
you into the destination repo conforming to its conventions — with nothing leaking
home.

## Actions

- [x] Verb surface + destination registry: pin the `cadence publish --to <target>` shape and the config schema for a named target (git URL + discovery hints).
  - Built: `PublishTargetSchema` + config flattening; `publish-targets` + `publish-resolve` CLI commands; documented schema in `cadence.yaml`.
- [x] Checkout discovery: resolve a target's git URL to a local checkout (peer-directory search → git-remote match → prompt fallback). Never path-bind.
  - Built `src/publish.ts`: `normalizeGitUrl` + `discoverCheckout` (siblings → hints → prompt fallback). 5 unit tests + live e2e against a real sibling repo (ssh clone matched https target).
- [x] Convention-read + reference-placement: examine the destination fresh each publish and follow its existing patterns when placing content + references.
  - Specified in /publish SKILL step 5: bounded fresh read of the destination (layout, page shape, reference convention) → correctable house-style profile; re-read every publish, never cached.
- [x] Privacy warn-detection: flag private-looking content before it crosses; never auto-carry a link back to the private cadence repo.
  - Specified in /publish SKILL step 6: hard rule auto-strips back-links/paths home; raw notes / names / internal IDs / secrets flagged for the user's decision (surface-and-warn).
- [x] Preview: confirm content renders correctly in the destination's conventions.
  - Specified in /publish SKILL step 8: git diff + reader-by-detection (Obsidian vault / Pages serve); suggest, never auto-open.
- [x] Write the `publish` SKILL + verb contract; wire runtime/reference/help; bundle. (Live end-to-end validation against a real external repo is queued as a pending-validation — skills load only at session start.)
  - SKILL written (skills/publish/SKILL.md, 10-step contract); Publish register added to verb-contracts.md; wired into cadence-runtime.md hidden-verb list, cadence-reference.md CLI catalog, help skill. Bundle current.
