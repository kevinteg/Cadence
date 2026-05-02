---
id: improve-ux-and-vision
type: finite
status: active
created: 2026-05-01
why: The v1 self-review surfaced structural gaps — terminal-only input excludes physical pursuits and the audience the vision targets, the verb surface and onboarding ceiling are too high, and the architecture/runtime docs claim features that aren't built (SQLite hybrid, three-tier isolation, Python pipeline, derived contexts, outside-view estimation). Cadence isn't usable by anyone other than me until those gaps close or the vision contracts to match the implementation. This pursuit decides which path — prune the design or build the gaps — and ships v1.1 accordingly.
---

# Improve UX and Vision

The v1 self-review surfaced structural gaps in input surface, memory, verb count, doc/code drift, and onboarding. Walking those gaps revealed the answer is mostly **prune and sharpen, not build** — the implementation is sound where it shipped, the vision over-promised in places that don't fit Cadence's domain-neutral, local-first ethos, and most missing surface (autonomous execution, semantic memory, mobile capture, GTD-style derived contexts) belongs in Future Work or Someday rather than v1.1.

This pursuit's center of gravity is **conceptual clarity and surface ergonomics work** — trimming the vision to match implementation reality, slimming the verb surface so it stops being a memorization problem, renaming Wandering to Inbox to reduce cognitive tax, building a non-judgmental catch-up path for skipped Reflects, encoding physical-domain awareness into existing verbs' prompts (rather than adding a `/log` verb), expanding the provocation deck, and writing a quickstart guide doubled as demo material. The personal-repo experiment (this week's Leveraged Priority) provides lived signal that informs the late-pursuit projects.

Done feels like: a fresh user can install the plugin, run `/cadence:init` in any repo, browse a slim verb catalog without consulting help, and see vision-doc claims that match what they can actually do. The conceptual model is crisp enough that the mental tax is low. The personal-repo experiment landed and yielded the quickstart. Cadence is approachable and sticky enough to use on personal repos for non-dev pursuits.
