# first-class-publish

> **Topic**: First-class `publish` — promote target-shaped drafts to named
> destinations (local wiki or external repo). From issue
> [#9](https://github.com/kevinteg/Cadence/issues/9), project
> `improve-ux-and-notebook-integration/first-class-publish`.

## The canvas (from the issue — starting context, not yet ideas)

**Gap**: artifacts can be curated into local `wiki/` (→ GitHub Pages), but
there's no first-class path for the step *after* — refactoring for an
audience and publishing to local wiki OR an external shared/team wiki
that's a living structure with its own contributors. So publishing must
merge-into-existing (update, not replace) + stay idempotent on re-publish.
Today: bespoke per-repo CI only.

**Proposed shape (3 parts)**: (1) target-shaped staging tier; (2) named
publish targets in `cadence.yaml`; (3) a `publish` verb.

**Three open forks** (the reason we're brainstorming):
1. **Merge granularity** — whole-file slot-in vs intra-file section merge
2. **Auth model** — PAT vs GitHub App vs deploy key
3. **Conflict handling** — when the destination diverged since last publish

---

## Divergent notes
_Edit freely; the agent appends as ideation flows._

### The deeper why (kt, opening dump)
- Cadence's built-in value: **documenting actions + research** is core to it
  being a capable assistant (continuity, finishing).
- KT's working shape: prompts → wide + deep research to learn a space + prior
  art → shape vision/idea into something tangible. Often an **interactive
  summary** that captures interest and is bolstered by research. Play with it,
  run similar initiatives — then *at some point, do something with it*.
- That "do something with it" = the artifact **moves out of the
  project/pursuits structure into a high-quality narrative.**
- **Audience fork** (named explicitly):
  - Sometimes **just for me** — document my learning, a how-to guide for
    future-me.
  - Sometimes **for others** — generate a draft to **solicit feedback in a
    private space.**
- KT's dominant context: **work, private org repo.** Lots of notes that must
  **stay private**, but surface as high-quality docs in the wiki structure.
  And **very often needs to publish to a team repo.**
- This project = the **workflow** for contributing content from the cadence
  repo → a published location (another repo, GitHub Pages, …).
- **Start with: publishing to another repo** — "the use case that wasn't
  obvious."
- Key property: **the destination repo holds the *authoritative* content.**
  Research happens in KT's own cadence repo to shape updates/additions *to*
  the other repo. → implies a **draft / staging concept.**

### Refinement (kt, 2nd dump) — the tiers, corrected
- **Workshop = the pursuit/project structure** (NOT the wiki). The own wiki is
  *already* a gallery — the existing narrate/capstone promotion path lands
  there.
- This project adds a **promotion path from pursuit/project → a *different*
  location.** The gallery is now **plural destinations**:
  - **most cases**: own wiki (+ associated GitHub Page) — already built.
  - **some cases**: updating **another location** — the new, "non-obvious" one.
- **Round-trip is NOT the default.** The own wiki is authoritative for most
  things. Only the external-destination case needs current-state-to-draft-against.
- **External destination assumptions**:
  - It's a **repo of markdown files.**
  - May need to **interpret how to render it** — open Obsidian (or similar) to
    confirm it *looks good* in the destination's own conventions. [house-style
    / preview thread — parked, return to it]
- **Authority / drafting**: for the external case, **need its current state in
  front of you to draft against.** May work **inside the other repo, committing
  there, checked out locally.**
- **Persistence requirement**: need a way to **define the destination so it
  persists across sessions AND across checkouts on different computers.**
  → portable, named target definition; not a one-off path.

### Destination identity, resolved (kt)
- Target identity = **the actual git URL** (canonical, portable, travels across
  machines).
- Local checkout location = **discovered at runtime, never persisted as
  identity**:
  - **Don't bind to `~/code`** or any hardcoded path.
  - **Look in neighboring/obvious locations** (peer directories of the cadence
    repo, etc.) for a checkout whose remote matches the URL.
  - **If not found, prompt the user** for the path.
- → clean split: **identity = URL (stored)**, **location = resolved per machine
  (search peers → match remote → else ask).**

### Where the hands go: **B — edit the destination directly** (kt)
- You **cd into the located checkout and edit the destination's markdown files
  in place**, committing *there* locally. No target-shaped staging tier inside
  cadence.
- Cadence's job shrinks to: **(1) get you there with the right context** + **(2)
  enforce the privacy boundary.**
- **Implication — the issue's three "open forks" largely dissolve** (they were
  bespoke-CI framing):
  - **Merge granularity** → moot. You edit real files; git is the merge.
  - **Conflict handling** → git's (pull/rebase as normal).
  - **Auth** → git's (your existing creds for that repo).
  - **Idempotency / re-publish** → just another commit; no manifest needed.
- So the verb is less "publish = copy + merge" and more **"open a working
  session against an external destination, research in reach, private notes
  fenced off."**
- Still-open in mode B [threads to pull]:
  - **Handoff**: what actually travels from cadence → the destination file?
  - **Privacy enforcement** when your hands are in *another* repo.
  - **House-style / preview** (parked): confirm it looks right over there.
  - **Provenance / round-trip**: record the link so next time you can draft
    against current state. → **CORRECTED below: no back-link on the destination
    side, ever.**

### Handoff = conform to the destination's conventions (kt)
- The handoff shape is **dictated by the destination, not by cadence.** Not one
  fixed flavor (reference/transclude/generate) — **do what this repo does.**
  - If the destination has a `research/` or `references/` folder → **put refs
    there and link them following the destination's own pattern.**
- **HARD privacy rule**: the handed-over content **must not link back to our
  repo in any way — our repo is private.** No provenance pointer, no source URL,
  nothing that leaks the private origin. (Kills the "back-link on destination"
  idea above — provenance, if kept at all, lives on the **cadence side only.**)
- **Associating with a destination includes a *learn-its-patterns* step**:
  **examine the existing files and follow the patterns found there.** If pages
  carry references a certain way, match it. House-style is *discovered*, not
  configured.
- → "publish" now includes a **read-the-destination-and-conform** behavior, not
  just a file drop.

### Convention discovery: **re-read each publish** (kt)
- The destination is the **authoritative, moving target** → cadence
  **re-examines the relevant neighborhood every publish** and conforms to
  *current* conventions. No cached/stale profile.

### Privacy: **surface-and-warn** (kt)
- Honest framing: cadence **can't truly *enforce*** judgment when your hands are
  hand-editing in another repo. Its real job is to make the boundary
  **impossible to miss.**
- **Flag private-looking content** before it crosses (raw notes, names, internal
  links, anything pointing home). **Never auto-carry a link back to the private
  repo.** The human makes the final call.
- → "enforce the privacy boundary" → restated as **"make the boundary
  impossible to miss."**

---

## The design that cohered (spine)
1. **Source** = the pursuit/project workshop. **Destination** = an external repo
   of markdown (the new, non-obvious gallery; own-wiki path already exists).
2. **Identity = git URL** (stored, portable). **Checkout = discovered per
   machine** (peer search → match remote → else prompt). Never bind a path.
3. **Mode B**: edit the destination **in place**, commit there. Git owns merge /
   conflict / auth / idempotency. The issue's three "forks" dissolve.
4. **Handoff = conform to the destination's own conventions**, **re-read every
   publish** (refs go where that repo puts refs, etc.).
5. **Privacy = surface-and-warn**, no back-link home; provenance lives
   **cadence-side only** (which also powers the round-trip: cadence remembers
   "I contribute to X" so you can draft against current state).

## Still-open mechanics (→ candidate actions, not yet decided)
- The **verb surface**: `cadence publish --to <target>`? what does invoking it
  actually *do* — open a working session? take an artifact arg?
- **Preview** (parked): confirm it renders right over there (Obsidian / Pages).
- **Warn detection**: what heuristics flag "private-looking" content.
- **Reference placement**: the mechanics of following the destination's ref
  pattern.
- **"Right context"**: which cadence artifacts get surfaced beside the edit, how.

---

## Landed → project `improve-ux-and-notebook-integration/first-class-publish`
Folded into the existing project (created from issue #9 via `/incoming`), **not**
crystallized — crystallize would have minted a duplicate. The project Intent was
rewritten to the mode-B spine above; the still-open mechanics became its action
list. This brainstorm is the durable record of *why* (mode B chosen, the three
issue forks dissolved, surface-and-warn over enforce). 2026-06-23.

