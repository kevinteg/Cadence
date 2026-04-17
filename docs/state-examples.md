# Cadence State — Markdown Format Example

*This is what your Cadence data might look like if stored as markdown files. Review this to decide whether markdown, SQLite, or hybrid feels right.*

---

## Example Directory Structure

```
~/.cadence/
├── cadence.yaml                  # Global config (win cycle dates, defaults)
├── pursuits/
│   ├── establish-ai-test-framework.md
│   ├── be-a-present-father.md
│   ├── sustain-operations-nexthop.md
│   ├── build-cadence-v1.md
│   └── _someday/
│       └── become-a-trail-runner.md
├── markers/
│   ├── 2026-04-16T14-32-establish-ai-test-framework.md
│   ├── 2026-04-15T09-15-build-cadence-v1.md
│   └── 2026-04-14T20-00-be-a-present-father.md
├── thoughts/
│   ├── unprocessed/
│   │   ├── 2026-04-16T07-45.md
│   │   └── 2026-04-16T12-30.md
│   └── processed/
│       └── 2026-04-15T18-22.md
├── reflections/
│   └── 2026-W16.md
└── narratives/
    └── drafts/
        └── building-cadence-week-1.md
```

---

## Example: Pursuit File

**`pursuits/establish-ai-test-framework.md`**

```markdown
---
id: establish-ai-test-framework
type: finite
status: active
created: 2026-05-01
target: 2026-10-31
win_cycle: 2026-H2
tags: [nexthop, career, tech-lead]
people: [sarah, james, priya]
---

# Establish AI Test Framework at Nexthop

The business value to customers hinges on our ability to deliver a reliable
product vetted in more ways than competitors. This framework needs to balance
unblocking current use cases with delivering new value on AI and analytics.

## Projects

### Stand Up CI Pipeline
- **status:** active
- **definition_of_done:** All PRs trigger automated test runs, results posted
  to GitHub, team can self-serve adding new test suites
- **actions:**
  - [x] Evaluate existing test infrastructure
  - [x] Choose CI platform (GitHub Actions)
  - [ ] Configure GitHub Actions workflow
  - [ ] Set up test result reporting
  - [ ] Document onboarding for team members
  - **waiting:** James to provide access to staging environment (expected: 2026-05-10)

### Define Test Strategy for SONiC Integration
- **status:** active
- **definition_of_done:** Written strategy doc reviewed and approved by VP,
  covering unit, integration, and customer-scenario test layers
- **actions:**
  - [ ] Review existing test coverage
  - [ ] Interview 3 customer DevOps teams about their testing needs
  - [ ] Draft strategy doc
  - **waiting:** Priya to schedule customer interviews (expected: 2026-05-08)

### Build Relationship with QA Team
- **status:** active  
- **definition_of_done:** Completed 1:1s with all 5 team members, documented
  each person's strengths, concerns, and growth goals
- **actions:**
  - [x] Schedule 1:1s with all team members
  - [ ] Complete 1:1 with Sarah (Tuesday)
  - [ ] Complete 1:1 with James (Wednesday)
  - [ ] Complete 1:1 with Priya (Thursday)
  - [ ] Write up team assessment notes
```

---

## Example: Marker File

**`markers/2026-04-16T14-32-establish-ai-test-framework.md`**

```markdown
---
pursuit: establish-ai-test-framework
project: stand-up-ci-pipeline
session_start: 2026-04-16T10:00
session_end: 2026-04-16T14:32
actions_completed:
  - evaluate-existing-test-infrastructure
  - choose-ci-platform
actions_in_progress:
  - configure-github-actions-workflow
---

# Marker: Stand Up CI Pipeline

## Where I Was
Halfway through configuring the GitHub Actions workflow. Got the basic
pipeline triggering on PR events. Currently stuck on the test runner
integration — the existing test harness uses a custom runner that doesn't
play well with GHA's container actions.

## What I Was Thinking
I think we need to wrap the custom runner in a Docker container rather
than trying to make it work with GHA natively. This is a bigger lift than
I expected — maybe 2 more sessions. I should ask James if there's a
reason the runner was built custom instead of using pytest.

## What's Next
1. Ask James about the custom runner history (might be a quick Slack msg)
2. Spike the Docker wrapper approach (~1 session)
3. If Docker works, finish the GHA config
4. If not, evaluate switching to pytest (bigger conversation with team)

## Loose Threads
- Noticed the staging env has stale test data — need to flag this
- Sarah mentioned flaky tests in the switch config module — worth
  investigating but not blocking this project
```

---

## Example: Thought (Unprocessed)

**`thoughts/unprocessed/2026-04-16T07-45.md`**

```markdown
---
captured: 2026-04-16T07:45
source: voice
transcript: "Hey, remind me to ask James about why they built a custom
test runner instead of using pytest. Also I had an idea last night about
using the SONiC test topology file to auto-generate integration test
scaffolding — that could be really powerful for customers."
---

# Triage (pending)

**AI suggestion:**
1. "Ask James about custom test runner" → Action in project "Stand Up CI
   Pipeline" under pursuit "Establish AI Test Framework" (confidence: high)
2. "Auto-generate integration test scaffolding from topology file" → New
   project candidate under "Establish AI Test Framework" — too big for an
   action, has multiple steps (confidence: medium — needs user confirmation
   on scope)
```

---

## Example: Reflection

**`reflections/2026-W16.md`**

```markdown
---
week: 2026-W16
leveraged_priority: "Complete 1:1s with all QA team members"
leveraged_priority_achieved: true
pursuits_touched: 3
projects_completed: 0
actions_completed: 8
actions_created: 5
thoughts_captured: 12
thoughts_processed: 10
---

# Week 16 Reflection

## Recap
First full week at Nexthop. Focused on three pursuits: Establish AI Test
Framework (primary), Be a Present Father, and Build Cadence v1.

At work, completed all 5 team 1:1s — every conversation surfaced something
useful. Sarah is underutilized and wants more ownership. James has deep
institutional knowledge about the test infra but is frustrated by tech debt.
Priya is the bridge to customers and should be in every strategy conversation.

Started the CI pipeline work. Got further than expected on day 1 but hit
a wall with the custom test runner. Left a marker with a Docker wrapper
spike as the next step.

At home, took Ellie to the park twice and did bedtime every night. Small
wins but they matter.

On Cadence, designed the marker format and wrote the first real marker.
Meta: using the system to build the system.

## What I Learned
- The custom test runner is load-bearing — can't just replace it
- 1:1s in the first week were the highest-leverage thing I could have done
- Voice capture while walking is already paying off — 4 of my best ideas
  this week came from morning walk thoughts

## WIP Check
- **Active pursuits:** 3 (healthy)
- **Active projects:** 5 (fine — none are blocked)
- **Waiting on:** James (staging access), Priya (customer interviews)
- **Stale markers:** none (everything < 3 days old)

## Next Week
- **Leveraged priority:** Draft the test strategy doc — this unlocks
  everything else and demonstrates early value to the VP
- **Commitments:** Finish CI pipeline spike, process remaining thoughts,
  publish first Cadence blog post
```

---

## Example: Ongoing Pursuit

**`pursuits/be-a-present-father.md`**

```markdown
---
id: be-a-present-father
type: ongoing
status: active
created: 2026-04-01
tags: [family, personal]
people: [ellie, partner]
---

# Be a Present Father

## Projects

### Plan Summer Camping Trip
- **status:** active
- **definition_of_done:** Campsite booked, gear checked, dates on calendar,
  partner aligned on plans
- **actions:**
  - [ ] Research family-friendly campgrounds within 3 hours of Seattle
  - [ ] Check camping gear — what needs replacing?
  - [ ] Pick dates that work with Nexthop schedule
  - [ ] Book campsite

### Establish Weekly Daddy-Daughter Time
- **status:** active
- **definition_of_done:** Recurring weekly activity that Ellie looks forward
  to — not forced, genuinely fun for both of us
- **recurring:** true
- **recurrence:** weekly, last_completed
- **actions:**
  - [ ] Try 3 different activities over 3 weeks
  - [ ] Let Ellie pick the one she likes best
  - [ ] Lock it into the weekly rhythm
```

---

## Tradeoffs to Consider

**Markdown advantages:**
- Human-readable and editable without tools
- Git-friendly (diff, version history, branching)
- Portable (works with any editor, any system)
- Transparent (you can always see your data)
- Natural fit for narratives and reflections

**Markdown disadvantages:**
- Querying is slow ("show me all waiting-for items across all pursuits" requires parsing every file)
- Relationships are implicit (pursuit → project → action is encoded in nesting, not in references)
- Reconciler needs to scan everything to find stale items
- Concurrent writes from multiple agents could conflict
- No transactional integrity

**Hybrid approach (markdown + SQLite):**
- Markdown as the source of truth for human-authored content (markers, reflections, pursuit descriptions)
- SQLite as a query index that mirrors the markdown structure
- Write to markdown, sync to SQLite on change
- Query from SQLite, edit from markdown
- Best of both: human-readable AND fast queries

**Pure SQLite:**
- Fast queries, transactional, handles concurrent writes
- But you can't just open a file and read your marker
- And it's not git-friendly

---

*Review these examples and bring your thoughts to the architecture session.
The key question: do you want to be able to `cat` your markers and read them,
or is that a nice-to-have you'd trade for query speed?*
