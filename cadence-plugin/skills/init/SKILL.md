---
description: Bootstrap a new Cadence repo — create directory structure, config, Wandering pursuit, and .gitignore
---

# /init

Set up a new repo for Cadence. Only needs to run once per repo.

## Steps

1. **Check if already initialized**: Look for `cadence.yaml` in the repo
   root. If it exists, say: "This repo is already set up for Cadence.
   Run /cadence:start to get started."

2. **Create the Wandering pursuit via the CLI:**
   ```bash
   cadence create-pursuit wandering \
     --type ongoing \
     --description "The default home for unattached ideas. Seeds captured here don't yet belong to any pursuit — they're waiting to be developed, promoted, or closed. Wandering never closes."
   ```
   The CLI
   creates the pursuit directory plus `projects/`, `sessions/`, and
   `ideas/` subdirectories.

3. **Create remaining directories** (the CLI doesn't create these
   yet — they're per-repo, not per-pursuit):
   ```
   pursuits/_someday/
   pursuits/_archived/
   thoughts/unprocessed/
   reflections/
   narratives/drafts/
   ```

4. **Create cadence.yaml** from defaults:
   ```yaml
   # Cadence Configuration
   version: 1

   win_cycles:
     current: 2026-H1
     start: 2026-01-01
     end: 2026-06-30
     mid_check: 2026-04-01

   wip_limits:
     max_active_projects: 5

   defaults:
     someday_review: monthly
     marker_stale_days: 7
     waiting_for_grace_days: 2
     dormant_days: 14

   reflect:
     day: sunday
     duration_minutes: 30
   ```
   Ask the user to confirm or adjust the win_cycle dates and reflect day.

5. **Create .gitignore entries** (append if .gitignore exists):
   ```
   _manifest.md
   .cadence.db
   ```

6. **Confirm setup**:
   ```
   Ready. Run /cadence:brainstorm to start generating ideas, or
   /cadence:start if you already have work to track.
   ```
