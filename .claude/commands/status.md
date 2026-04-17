# /status

Show a system-level overview. This is a quick health check — less detailed
than /recap, focused on numbers and flags.

## Steps

1. Scan all active pursuits and count them.

2. For each active pursuit, count active projects, done projects,
   and on_hold projects.

3. Count total unchecked actions across all active projects.

4. Count all `waiting_for` items across all projects. Flag any that
   are past their expected date.

5. Count unprocessed thoughts.

6. Find the most recent reflection and check if it's complete.
   Extract the leveraged priority if set.

7. Find the most recent marker across all pursuits. Calculate age.

8. Present a dashboard:

   ```
   Cadence Status

   Leveraged Priority: [priority or "not set"]
   Last Reflect: [date] ([complete/incomplete])
   Last Session: [relative time] on [pursuit/project]

   Pursuits: [N active] | [N someday]
   Projects: [N active] | [N on_hold] | [N done]
   Actions:  [N pending] | [N waiting]
   Thoughts: [N unprocessed]

   Flags:
   - [any overdue waiting-for items]
   - [any stale markers]
   - [any dormant projects]
   - [WIP warning if pursuits > 4]

   [If no flags]: No flags. System is healthy.
   ```
