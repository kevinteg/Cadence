---
description: Bootstrap a new Cadence repo — create directory structure, config, Wandering pursuit, and .gitignore. TRIGGER ONLY when the user explicitly invokes /cadence:init or /init. SKIP all natural-language equivalents — never auto-fire from "set up Cadence", "initialize this repo", or onboarding requests; surface the command instead.
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
   The CLI creates the pursuit directory plus `projects/` and
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

4. **Create cadence.yaml** from defaults. Compute `win_cycles` from
   today's date — never hardcode a half:

   - Determine current year `YYYY` and half (`H1` if month is 1–6, else `H2`)
   - `current`: `{YYYY}-H{1|2}` (e.g., `2026-H2`)
   - `start`: `{YYYY}-01-01` for H1, `{YYYY}-07-01` for H2
   - `end`: `{YYYY}-06-30` for H1, `{YYYY}-12-31` for H2
   - `mid_check`: `{YYYY}-04-01` for H1, `{YYYY}-10-01` for H2 (start + 3 months)

   **Past mid_check check:** If today's date is on or after the computed
   `mid_check`, surface this and offer to start the next half instead:
   "Today is past the mid-check for {current}. Start the next half
   ({next}) instead?" Roll over: H2 → next year's H1. If the user
   accepts, recompute using the next half.

   Write the result, substituting the computed values:
   ```yaml
   # Cadence Configuration
   version: 1

   win_cycles:
     current: <YYYY-Hn>           # e.g., 2026-H2
     start: <YYYY-MM-DD>          # first day of the half
     end: <YYYY-MM-DD>            # last day of the half
     mid_check: <YYYY-MM-DD>      # start + 3 months

   wip_limits:
     max_active_projects: 5

   defaults:
     someday_review: monthly
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
