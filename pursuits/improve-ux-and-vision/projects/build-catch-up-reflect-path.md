---
id: build-catch-up-reflect-path
pursuit: improve-ux-and-vision
status: on_hold
created: 2026-05-01
---

# Build Catch-Up Path for Skipped Reflect

The current /reflect ritual assumes the user shows up roughly weekly. When weeks slip — vacation, illness, life — there's no graceful re-onboarding: the user faces the same full ritual after a 3-week gap as they would after 6 days, with no acknowledgment of the gap and no compressed-Get-Clear path. This is a documented failure mode for productivity systems; without a catch-up path, users who fall off don't come back.

## Intent

Add a non-judgmental catch-up path for skipped Reflects with encouraging tone, fuzzy week boundaries, and a gentle 'are you sure?' check when /reflect is invoked too soon. Specifically: when /reflect is invoked and the most recent reflection is older than ~2 weeks (configurable threshold), run a condensed Get Clear that batches reconciler flags and surfaces only the top 1-3 priority items before going to Get Focused. Tone is supportive ('let's catch up — it's been a while'), never guilty. Use fuzzy week boundaries: treat ~6 days through ~9 days as 'a week' for review eligibility (some users do reviews Friday one week and Monday the next). When /reflect is invoked too soon (e.g., 3 days into a fresh week), agent gently asks 'this is earlier than usual — are you sure?' before proceeding; easy override. Make review cadence configurable in cadence.yaml so users can set bi-weekly or other rhythms. Done feels like: skipping a Reflect for several weeks doesn't punish the user, the catch-up path makes returning feel welcoming and fast, and the system respects natural variation in when people actually do reviews.

## Actions

- [ ] Add reflect_cadence and reflect_grace_days config fields to cadence.yaml schema (defaults: weekly, fuzzy 6-9 days = 'a week'). Document in cadence-reference.md.
- [ ] Implement time-since-last-reflect detection with fuzzy-week logic in the CLI. cadence status output and report --json should include a next_reflect_status field (early | due | overdue | long-gap).
- [ ] Add catch-up trigger to skills/reflect/SKILL.md: when /reflect is invoked and time-since-last is in the long-gap range (configurable threshold; default >2 weeks), run a condensed Get Clear (top reconciler flags + top 1-3 priority items only) before standard flow. Encouraging tone ('let's catch up — it's been a while'), no guilt language.
- [ ] Add early-invocation check to skills/reflect/SKILL.md: when /reflect is invoked too soon (e.g., 3 days into a fresh week), agent asks gently before proceeding ('this is earlier than usual — are you sure?'). Easy override; respects user agency.
- [ ] Update workflows/verb-contracts.md Reflect contract to reflect the new behaviors (catch-up path, fuzzy boundaries, early-invocation check).
- [ ] Update or extend the reflect user journey YAML to cover the new catch-up path and early-invocation check, so the journey serves as durable acceptance test.
