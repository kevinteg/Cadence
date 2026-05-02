---
id: reconcile-docs-with-implementation
pursuit: improve-ux-and-vision
status: on_hold
created: 2026-05-01
---

# Reconcile Docs with Implementation

The v1 self-review found significant doc/code drift in product-vision.md and architecture.md. The docs claim features that aren't built and over-anchor on academic citations, both of which raise the onboarding ceiling and create a credibility gap when readers compare claims against what works. This project reconciles the docs to reality: trim what isn't built, relocate what's aspirational to clearly-labeled Future Work or Someday sections, and move encyclopedic research citations to a dedicated references doc so the vision reads like motivating prose rather than a literature review.

## Intent

Trim, relocate, and re-frame doc claims so vision and architecture match implementation reality. Specifically: (1) move encyclopedic research citations from product-vision.md to a new docs/research-references.md, keeping only load-bearing references in vision (McAdams shape, Gollwitzer if-then, Zeigarnik for closure); (2) trim Python references entirely from vision and architecture (TypeScript-only is reality); (3) replace the misleading 'three-tier isolation' paragraph with an accurate multi-repo plugin model description; (4) trim the autonomous-coding-execution claim; (5) demote outside-view-estimation from first-class to a brief Future Work mention with the Pomodoro-style 90-minute-window framing; (6) add a clearly-labeled Future Work section housing SQLite/embedding index, Nudges system (split into dev-specific session/progress vs. domain-neutral calendar nudges), and derived contexts; (7) add a Someday pointer for voice/mobile capture pointing at the new someday pursuit. Done feels like: a new reader can read the vision doc and form an accurate mental model of what Cadence does today, with aspirational material clearly marked as such.

## Actions

- [ ] Create docs/research-references.md and migrate encyclopedic research citations from product-vision.md (Beaty, Diehl & Stroebe, Sio & Ormerod, Doshi-Hauser, Default Mode Network, etc.). Keep load-bearing references in vision (McAdams structure, Gollwitzer if-then, Zeigarnik closure, Eurich/Trapnell what-vs-why).
- [ ] Trim all Python references from product-vision.md and docs/architecture.md. The implementation is TypeScript-only; future LLM/embedding work can plausibly stay TypeScript.
- [ ] Replace the 'three-tier isolation (sandbox / production / work)' paragraph in product-vision.md with an accurate description of the multi-repo plugin model: plugin installs into any repo via plugin-dir or future marketplace; each repo with cadence.yaml is a self-contained Cadence instance; /cadence:init bootstraps a new repo; uninit repos handled gracefully by the SessionStart hook.
- [ ] Trim the autonomous-coding-execution claim ('Coding projects can be automated. Delegate an entire coding Project to autonomous execution.') from vision. Cuts against domain neutrality and isn't built.
- [ ] Demote outside-view-estimation from first-class feature in vision/architecture to a brief Future Work mention noting the Pomodoro-style 90-minute-window-with-breaks framing as a possible later addition for dev/study contexts only.
- [ ] Add a clearly-labeled 'Future Work' section in product-vision.md (or docs/architecture.md, whichever is the right home). Move into it: SQLite/embedding index (replacing 1.1's hybrid claim); Nudges system split into dev-specific session/progress nudges vs. domain-neutral calendar nudges; derived contexts (only if pursuing real GTD support).
- [ ] Add a 'Someday' or fast-follow pointer in vision for voice/SMS/mobile capture and external-tool/reading-list ingestion, pointing at the new expand-cadence-input-and-ingestion someday pursuit.
