---
id: expand-provocation-deck
pursuit: improve-ux-and-vision
status: on_hold
created: 2026-05-01
---

# Expand Provocation Deck

The brainstorm verb's provocation deck currently has 58 cards across 5 categories (oblique, scamper, hmw, analogy, challenge). Eno's Oblique Strategies deck — the inspiration — has 100+ cards and was iterated for over a decade. A 58-card deck risks repetition within five brainstorm sessions, which would undermine trust. Real curation, sourced from established creative-thinking references, can grow the deck to ~100 quality cards without much drift in tone or quality.

## Intent

Grow deck/provocations.yaml from 58 to ~100 cards by sourcing from established creative-thinking references (Creative Thinker's Toolkit, expanded SCAMPER, Six Thinking Hats, Eno's Oblique Strategies, How Might We exemplars, etc.). Emphasize verb-anchored prompts — 'shrink/expand/merge/separate/reverse/relocate/age/personify/exaggerate this idea' — that the agent can apply with content-relevant nouns at runtime, since verb-anchored prompts adapt naturally to whatever the user is brainstorming. Done feels like: the deck reaches ~100 cards, the categories cover enough creative-thinking territory that repetition becomes rare in normal use, and the brainstorm experience feels less canned.

## Actions

- [ ] Source candidate prompts from Creative Thinker's Toolkit, expanded SCAMPER variants, Six Thinking Hats, Eno's Oblique Strategies (full deck), classic 'How Might We' exemplars, and forced-analogy/forced-connection literature. Curate ~50 new card candidates in a working doc.
- [ ] Emphasize verb-anchored prompts in the curation: shrink/expand/merge/separate/reverse/relocate/age/personify/exaggerate/recombine/abstract/concretize/animate. The agent should be able to substitute content-relevant nouns at runtime, so the prompts adapt to the user's actual brainstorm topic.
- [ ] Add new categories to the deck if the curation surfaces them naturally (e.g., 'thinking-hats', 'forced-connection'). Update the brainstorm skill if new categories require category-specific handling.
- [ ] Update deck/provocations.yaml with the new cards, organized by category. Hand-edit YAML; don't auto-generate — quality matters more than count.
- [ ] Verify the brainstorm skill still works correctly with the expanded deck (no schema regressions, category sampling still feels balanced).
