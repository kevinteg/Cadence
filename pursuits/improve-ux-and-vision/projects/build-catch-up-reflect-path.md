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

- [x] ~~Add reflect_cadence and reflect_grace_days config fields to cadence.yaml schema~~ — **dropped during planning.** The user explicitly asked to keep this small ("It shouldn't be too fancy"). The fuzzy-week detection collapsed into a single hard-coded `LONG_GAP_DAYS = 14` constant in `src/render/signals.ts`, and the configurable cadence + 6-9 day fuzzy window was deemed YAGNI. If users want a different threshold later, expose it then.
- [x] Implement time-since-last-reflect detection with entry-mode logic in the CLI. Added `ReflectEntryMode` type and `detectReflectEntryMode` to `src/render/signals.ts` covering 6 modes (first / normal / same_week_done / same_week_in_progress / early_in_week / long_gap). Surfaced via `cadence report --json` so the skill can branch on `signals.reflectEntryMode` without a new CLI subcommand. 7 unit tests added.
- [x] Add catch-up trigger to skills/reflect/SKILL.md: long_gap mode opens with the encouraging "It's been a while — let's catch up. We'll keep this short." line and runs a condensed Get Clear (top 3 most recent captures + severity-1 reconciler flags only + single "anything obvious to drop or hold?" question instead of per-project walk). No deficit framing.
- [x] Add early-invocation check to skills/reflect/SKILL.md: early_in_week mode (last reflection was prior ISO week + today is Mon-Wed) asks "Are you wrapping the week, or is something else up?" with easy override before starting a draft. If checking in, drops to a status summary instead of writing a reflection file. Also added: same_week_done re-open path that flips status back to in_progress (preserves existing LP and body via the upsert).
- [x] Update workflows/verb-contracts.md Reflect contract: catch-up entry modes documented under Behavior; new "no 'you missed N weeks' framing" guardrail. Same content also added to cadence-plugin/workflows/reflect.md as a "Catch-up entry" section.
- [x] Add the reflect catch-up user journey YAML (journeys/reflect-catchup.yaml) covering long_gap entry (encouraging-tone assertion + deficit-framing absence) and same_week re-open (status-flip + LP preservation). The early_in_week tone check is queued via `cadence pending-validation-add` rather than YAML-asserted (the confirmation prompt is hard to pin to a regex without overfitting).
