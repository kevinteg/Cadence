---
id: weekly-review-nudge
pursuit: build-cadence-v1
status: dropped
created: 2026-04-30
dropped_reason: Scope absorbed into surface-recent-activity-in-splash — the late-week weekly-preview suggestion becomes one of the two new rules added to nextSteps().
dropped_at: 2026-04-30T21:04:55
---

# Drop a weekly-review preview in the late-week splash

## Intent

The weekly Reflect ritual works best when the user arrives already primed — aware of what moved this week, with a candidate Leveraged Priority for next week already half-formed. Today there's no signal in the splash that the week is closing. The intent here is: by Thursday or Friday morning, the SessionStart splash should drop a soft 'Weekly preview' block — a brief LP-anchored summary of how the week tracked against the current Leveraged Priority — that hints /cadence:reflect is coming without nagging. The user reads it, primes themselves, and arrives at the ritual with an opinion forming. Constraints: this is a hint, not a nag. One-time per Reflect cycle. Disappears the moment /cadence:reflect runs. Reuses the bullet-shape and cached-narrative pattern established by the surface-recent-activity-in-splash project — same render/source story, different content. Done when: by Thursday or Friday morning (configurable threshold), opening a session in this repo shows a 'Weekly preview' block with current LP plus 2-3 progress bullets; the block does not appear earlier in the week; and the block disappears after /cadence:reflect runs.

## Actions

- [ ] Decide the trigger rule: day-of-week threshold (e.g., DOW >= Thursday) AND no completed Reflect newer than the latest reflection's date. Document inline.
- [ ] Add a 'cadence weekly-preview' subcommand (or extend 'cadence recent') that emits a short LP-anchored preview: latest leveraged_priority + 2-3 bullets of progress toward/away from it, sourced from this week's project activity.
- [ ] Wire the preview into src/render/status.ts behind the trigger condition. Render order: 'Recently' block (from the splash project) → 'Weekly preview' block (this project) → existing counts.
- [ ] Ensure the block suppresses cleanly the moment a new reflection lands — track via reflections/<YYYY-MM-DD>.md mtime relative to the trigger window.
- [ ] Add unit tests for the trigger logic (early-week off, late-week on, post-Reflect off) and a journey YAML simulating Thursday.
- [ ] User-story validation: simulate or wait until Thursday morning in a fresh conversation and confirm the Weekly preview appears with the current LP. Run /cadence:reflect and confirm the block disappears on the next session start.
