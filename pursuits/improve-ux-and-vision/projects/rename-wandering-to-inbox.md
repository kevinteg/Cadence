---
id: rename-wandering-to-inbox
pursuit: improve-ux-and-vision
status: on_hold
created: 2026-05-01
---

# Rename Wandering to Inbox

The standing-pursuit-for-unattached-ideas concept is load-bearing in Cadence, but the name 'Wandering' carries cognitive tax: new users have to learn the metaphor before they can use it. Notion's 'Inbox' is the same concept with a name everyone already knows. The metaphorical weight isn't worth the onboarding cost.

## Intent

Rename the standing pursuit from Wandering to Inbox throughout the system: directory, frontmatter, all docs, all skills, the runtime, and the CLI's init logic. Domain-neutral familiar word, reduces cognitive tax. Plan a graceful migration for existing repos that have a Wandering pursuit (this dogfood repo plus any future early adopters). Done feels like: a new user runs /cadence:init and sees 'Inbox' (not 'Wandering') as the standing-pursuit name; existing repos with Wandering get a one-time migration prompt or auto-rename on next CLI operation.

## Actions

- [ ] Rename pursuits/wandering/ → pursuits/inbox/ in this repo (git mv); update pursuit.md frontmatter id field; update H1 title.
- [ ] Update cadence-runtime.md Vocabulary section (Wandering → Inbox); update any other runtime references to Wandering.
- [ ] Update product-vision.md, one-pager.md, docs/architecture.md to use Inbox throughout — including the example narratives ('moved to Wandering for later' becomes 'moved to Inbox for later').
- [ ] Update cadence-plugin/cadence-reference.md to use Inbox throughout.
- [ ] Update all skill files that reference wandering by name (capture, brainstorm, promote, develop, close) — change to Inbox in user-facing strings and parent IDs.
- [ ] Update CLI init logic that creates the wandering pursuit by default — change to create the inbox pursuit. Also handle migration: if a repo has pursuits/wandering/ on first cadence command after upgrade, prompt user once or auto-rename with a notice.
