# /recap

Show me where I left off. This activates Steward mode.

## Steps

1. List all active pursuits by scanning `pursuits/` (skip `_someday/` and
   `_archived/`). For each, read `pursuit.md` frontmatter.

2. For each active pursuit, find the most recent marker in
   `pursuits/<pursuit-id>/sessions/` by filename (lexicographic sort,
   most recent last). Read the marker content.

3. For each active pursuit, scan `projects/` for active projects
   (status: active in frontmatter). Count them and note any with
   `waiting_for` entries.

4. Check `thoughts/unprocessed/` for pending thought count.

5. Check `reflections/` for the most recent reflection and whether
   its `status` is `complete`.

6. Present a curated summary using this format:

   ```
   Welcome back. Here's where things stand:

   [Leveraged Priority if set — from most recent complete reflection]

   **[Pursuit Name]** — last session [relative time]
   > [2-3 sentence recap from most recent marker's "Where I Was" section]
   > Next: [first item from marker's "What's Next" section]
   > Active projects: [count] | Waiting on: [names if any]

   [Repeat for other active pursuits, ordered by most recent session]

   [If pending thoughts > 0]: You have [N] unprocessed thoughts.
   [If reflection incomplete]: Your Week [N] reflection is unfinished.

   What would you like to work on?
   ```

7. Wait for the user's choice. When they pick a pursuit or project, read
   the full latest marker and present the detailed recap, then shift to
   Guide mode for that project.
