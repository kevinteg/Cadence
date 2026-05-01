---
id: cross-verb-numbered-selection
pursuit: build-cadence-v1
status: dropped
created: 2026-04-29
dropped_reason: Pulling back on adding numbered selection across verbs — existing /status N is enough; resolution to entity names via fuzzy match is fine for the rest. May revisit if pain shows up in real use.
dropped_at: 2026-04-29T18:34:37
---

# Cross Verb Numbered Selection

## Intent

Today /cadence:status remembers numbered selections within /status calls — `/status N` works to drill in. The action menus shipped in improve-command-discoverability advertise `/cadence:status <id|N>` and `/cadence:status <project|N>`. But other verbs don't pick up the numbering: `/cadence:start 2`, `/cadence:complete 1`, `/cadence:narrate 1` all fall through to fuzzy ID match (or fail). This kills fast navigation: after seeing a list, the user has to type a project ID instead of a number. The action menus become aspirational rather than functional.

Make numbered selections persistent across all verbs that take an entity argument. Two implementation paths to weigh: (A) skill-context tracking — every verb-skill reads the conversation transcript for the most recent numbered list and resolves N against it; (B) disk cache — `.cadence/last-list.json` storing the most recent list emitted by any list-rendering CLI command, with kind, items, and timestamp. Path B is more robust (works across /clear and /resume; doesn't depend on the agent's interpretation of conversation context) but adds a persistent file and stale-detection concerns. Path A is simpler but loses state across context resets.

Done when after any list-rendering verb (`status pursuits`, `status <pursuit>`, `status <project>`, `find`), the consuming verb-skills (`start`, `complete`, `cancel`, `narrate`, `reconcile`, `close`) accept N and resolve to the listed entity. The action menus already shipped become functional promises.

## Actions

- [ ] Decide path A (skill-context tracking) vs path B (disk cache); capture decision and rationale in Notes
- [ ] If path B: design .cadence/last-list.json schema (kind, items, timestamp, ttl); add to .gitignore
- [ ] If path B: implement cadence record-list write subcommand and cadence resolve <kind> <N> read subcommand with stale-detection
- [ ] If path A: document the convention in cadence-runtime.md for skills tracking numbered lists in conversation context
- [ ] Update list-rendering paths (status pursuits / status pursuit / status project / find) to record numbered lists per the chosen mechanism
- [ ] Update consuming verb-skills (start, complete, cancel, narrate, reconcile, close) to accept N and resolve via the chosen mechanism
- [ ] Tests for resolution logic (path B) or convention documentation (path A)
- [ ] User-story validation: /status pursuits → /status 1 → /start 1 from that pursuit's view, no IDs typed manually
