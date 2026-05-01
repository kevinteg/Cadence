---
id: define-narrate-cadence-contracts
pursuit: build-cadence-v1
status: done
created: 2026-04-30
---

# Define Narrate Cadence Contracts

## Intent

The /narrate verb supports daily, weekly, monthly, and annual cadences mechanically — but the prose output today is the same generic McAdams shape regardless of cadence. Daily and weekly each want a distinct contract that matches how they get used in the wild: a daily narrative is a team-facing standup recap (factual, terse, share-ready — what shipped, what's in flight, what I'm waiting on), while a weekly narrative is an introspective check against the Leveraged Priority and a focusing exercise that helps choose next week's LP. This project defines those two contracts inside the narrator agent and ships journey YAMLs that exercise each end-to-end. Monthly and annual stay generic for now — future pursuits will customize. Critically, the daily contract leans on the watermark-resume mechanic: 'since last standup' is whatever consumed_through_commit the previous daily narrative recorded, so a daily run on Tuesday after a Monday daily covers only Monday-to-Tuesday work, and a daily run after a long weekend naturally widens to cover Friday-through-Tuesday. Done when: the narrator agent prompt has explicit per-cadence sections for daily and weekly with their output contracts; daily-narrative.yaml and weekly-narrative.yaml exist and run green via /run-journey; and a fresh /cadence:narrate today produces share-ready prose while /cadence:narrate week surfaces the Leveraged Priority and frames next week.

## Actions

- [x] Define the daily-standup contract: shape (what shipped / in flight / waiting on), tone (factual, share-ready, third-person OK), length (~150 words), structural sections (no McAdams — just the standup three-beat). Document as a daily-cadence section in the narrator agent prompt.
- [x] Define the weekly contract: open with whether the Leveraged Priority was met (cite project-activity evidence), what shifted, what next week's LP candidate is. Length 3-5 paragraphs, McAdams-flavored but anchored on the LP. Document as a weekly-cadence section in the narrator agent prompt.
- [x] Update cadence-plugin/agents/narrator.md so 'daily' and 'weekly' scopes invoke their cadence-specific contracts; monthly/annual/pursuit fall through to the generic McAdams default.
- [x] Write journeys/daily-narrative.yaml: fixture pursuit with two checked actions in the daily window; run /cadence:narrate today; assert the saved file's body lists the checked actions, mentions any waiting_for items, and stays under ~250 words.
- [x] Write journeys/weekly-narrative.yaml: fixture pursuit with a reflection containing a Leveraged Priority and project activity that demonstrates progress toward (or away from) it; run /cadence:narrate week; assert the saved file mentions the LP text and contains a next-week framing line.
- [x] User-story validation: in a fresh Claude conversation on this real repo, run /cadence:narrate today and confirm the output reads as something you'd plausibly drop into a team standup channel. Then run /cadence:narrate week and confirm it makes the LP visible and prompts a next-week focus question.
