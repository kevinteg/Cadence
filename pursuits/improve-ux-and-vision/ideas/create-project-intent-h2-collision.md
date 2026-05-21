---
id: create-project-intent-h2-collision
parent: improve-ux-and-vision
state: seed
created: 2026-05-21
---

`cadence create-project --intent "<multi-paragraph text starting with ## headings>"` writes the body verbatim below the `## Intent` heading. If the input starts with its own `## ...` heading, that heading becomes a sibling to `## Intent` (not a child), and `## Intent` ends up empty. Scanner then reports `intent: ""` and `/start` renders no intent text.

Observed on harden-inbox-as-triage-zone (created from issue #2 via /cadence:incoming → promote). The issue body's leading `## The anti-pattern` heading collided.

Fix candidates:
- Demote any leading `## ...` headings in --intent input to `###` (cheap, opinionated)
- Wrap the input under a synthetic `### Notes` subheading when it leads with `##`
- Reject input that starts with `##` and ask the caller to use `###`+
- Make /incoming's promote path strip/demote the issue body before passing to --intent

The bug surfaces most via /cadence:incoming, where issue bodies almost always have ## headings.
