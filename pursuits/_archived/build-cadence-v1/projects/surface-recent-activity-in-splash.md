---
id: surface-recent-activity-in-splash
pursuit: build-cadence-v1
status: done
created: 2026-04-30
---

# Surface recent activity in the SessionStart splash

## Intent

The SessionStart splash already has a "Next:" block with heuristic verb suggestions (resume in-progress work, reflect when stale, browse help). It works, but the rule set is narrow — there's no nudge to recap recent activity, and no signal that the week is closing in on a Reflect. The richer "Recently moved" prose I originally considered turns out to live more naturally as additional context-aware suggestions in this existing section, not as a new prose block in the splash. The hook stays cheap and synchronous; the verbs themselves do the rich rendering once invoked. Concretely: extend `nextSteps()` with two new rules. Rule 1 — when fresh commits exist past the latest daily narrative's watermark (or no daily exists today and commits did happen), suggest `/cadence:narrate today` so the user can recap before they forget what shipped. Rule 2 — when the ISO week is in its closing days (Thursday onward) and no reflection has run for this week's cycle, suggest `/cadence:narrate week` to preview before the Reflect ritual lands. The "drill into recent project" idea the user mentioned is already covered by the existing "Resume in-progress work" rule. Done when: `nextSteps()` includes both new rules with sensible priority ordering and the cap-at-3 behavior preserved; unit tests cover each rule in isolation, both combined, and neither firing; and a fresh Claude conversation in this repo surfaces the new suggestions in the Next: block when their conditions are met.

## Actions

- [x] Add the "narrate today is stale" rule to nextSteps() in src/render/status.ts: fires when HEAD is past the consumed_through_commit of the latest narratives/drafts/daily-*.md, OR when no daily narrative exists today and commits landed today.
- [x] Add the "late-week weekly preview" rule to nextSteps(): fires when day-of-week is Thursday or later AND no reflection has run within the current ISO week.
- [x] Re-examine priority ordering — slot the new rules sensibly relative to existing rules (captures, in-progress, flags, reflect); keep the cap at 3.
- [x] Add unit tests covering both new rules: each in isolation, both combined, neither firing, and interaction with the cap-at-3 limit.
- [x] User-story validation: open a fresh Claude conversation in this repo and confirm the Next: section shows each new suggestion when its conditions are met.
