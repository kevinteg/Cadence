---
id: provocation-deck
pursuit: build-cadence-v1
status: done
created: 2026-04-21
---

# Provocation Deck

## Definition of Done
- [x] Curated YAML file with 40-60 provocation cards across categories
- [x] Categories: oblique (Eno-style), scamper, how-might-we, forced-analogy
- [x] Each card has id, category, and text
- [x] Deck is user-extensible (users add cards to their own deck file)
- [x] Within-session anti-repetition works (agent tracks dealt cards in conversation context)
- [x] Deck ships with the plugin
- [x] Card selection is pseudo-random, not LLM-curated

## Actions
- [x] Research and curate Oblique Strategies-style cards (18)
- [x] Write SCAMPER prompt cards (10)
- [x] Write "how might we..." framing cards (12)
- [x] Write forced analogy cards (10)
- [x] Write challenge/push-through-the-cliff cards (8)
- [x] Design YAML format with id, category, text fields
- [x] Create deck file at `cadence-plugin/deck/provocations.yaml`
