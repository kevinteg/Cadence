---
id: write-quickstart-and-demo-guide
pursuit: improve-ux-and-vision
status: on_hold
created: 2026-05-01
---

# Write Quickstart and Demo Guide

There's no 'you have 5 minutes' entry point for a new Cadence user. The vision doc, architecture doc, and runtime sit at 1000+ lines of dense prose between them. A new user has to wade through productivity-research synthesis to figure out what to do first. A one-page quickstart that walks them through a complete loop in 10 minutes — and that doubles as demo material when showing Cadence to friends — closes that gap.

## Intent

Write a 1-page quickstart that walks a new user through 'in 10 minutes you will: install Cadence, init a repo, capture three thoughts, promote one to a project, reflect on what shipped, see the narrative.' The artifact doubles as demo material — a clear narrative arc the user can walk a friend through to show what Cadence feels like. **Build late in the pursuit** (after the personal-repo experiment, slimmed verb surface, Inbox rename, and physical-domain awareness have landed) so the quickstart is written from lived ground truth on the slimmed/sharpened surface. Done feels like: a friend the user has never coached can install the plugin, follow the quickstart on their own, and complete a full Cadence loop in 10 minutes; the quickstart is also what the user reaches for when demoing Cadence.

## Actions

- [ ] Wait until prerequisite projects land: P1 (docs reconciled), P2 (verb surface slimmed), P3 (Inbox rename), P5 (physical-domain awareness). The quickstart is written against the post-v1.1 surface, not v1.
- [ ] Use lived ground truth from the personal-repo experiment (the W18 Leveraged Priority's outcome) — write from the actual install/init/capture/promote/reflect/narrate flow you walked.
- [ ] Draft the quickstart as a single page. Walk one concrete loop end-to-end in plain language — install, init, capture three thoughts, promote one, reflect, narrate. Include enough screenshots or terminal output to make it scannable.
- [ ] Make sure the quickstart works for a non-dev pursuit (household or family or creative example) — the demo example should not be a coding project. Per domain neutrality.
- [ ] Save to docs/quickstart.md or README.md (or both — README points at quickstart). Cross-link from product-vision.md so a new reader has a clear path to action.
