---
description: Generate narrative from project-file git activity — daily, weekly, monthly, annual, or pursuit arc. TRIGGER on explicit /cadence:narrate invocation, OR when the user asks for a generated narrative by name (e.g., "narrate today", "narrate this week", "tell the story of pursuit X"). SKIP for general "what did I do" questions that don't request a saved narrative.
---

# /narrate

Generate narrative from activity data — committed changes to project files in the cadence repo. Each narrative carries a watermark in its frontmatter: subsequent runs for the same cadence resume from where the last one left off. The narrative IS the pointer into the stream.

## Usage

- `/narrate` — today's activity (cadence: daily)
- `/narrate today` — same as `/narrate`
- `/narrate week` — this ISO week (cadence: weekly)
- `/narrate month` — this calendar month (cadence: monthly)
- `/narrate year` — this calendar year (cadence: annual)
- `/narrate <pursuit>` — full arc of a pursuit (cadence: pursuit)

Arguments resolve via fuzzy match. `today`, `week`, `month`, `year` are reserved keywords; anything else resolves to a pursuit ID.

## Steps

1. **Resolve cadence and target file.**

   | argument | cadence | target filename |
   |---|---|---|
   | (none) or `today` | `daily` | `narratives/drafts/daily-YYYY-MM-DD.md` |
   | `week` | `weekly` | `narratives/drafts/weekly-YYYY-WNN.md` (ISO week) |
   | `month` | `monthly` | `narratives/drafts/monthly-YYYY-MM.md` |
   | `year` | `annual` | `narratives/drafts/annual-YYYY.md` |
   | `<pursuit-id>` | `pursuit` | `narratives/drafts/pursuit-<id>-YYYY-MM-DD.md` |

   For pursuit cadence, fuzzy-match the argument against `cadence pursuits --json`; ask if ambiguous.

2. **Compute resume watermark.**

   Look for prior narratives of the same cadence:
   - daily/weekly/monthly/annual: the target filename (overwrites the same file on same-period re-runs).
   - pursuit: the most recent `pursuit-<id>-*.md` file by mtime.

   If a prior file exists, read its frontmatter `consumed_through_commit`. That's the resume point. Otherwise, no resume point — the CLI defaults the window per cadence.

3. **Delegate to the narrator subagent.** The whole point of this skill's design is to keep bulk activity JSON out of the main thread. The narrator agent fetches its own data via the cadence CLI in isolation and returns prose only.

   Invoke via the Agent tool:
   - `subagent_type: cadence:narrator`
   - `prompt`: a short briefing that includes:
     - The cadence (`daily` | `weekly` | `monthly` | `annual` | `pursuit:<id>`)
     - Resume hint if present: `since-commit <hash>`
     - Reminder of the McAdams output contract

   Example prompt (daily, no resume):
   ```
   Generate a daily narrative. Run `cadence project-activity --scope daily` to fetch project-file commits since midnight. Compose 3-5 paragraphs in McAdams structure (what happened / what it meant / what shifted / what's next). Return prose only — no frontmatter, no preamble.
   ```

   Example prompt (daily, with resume):
   ```
   Generate a daily narrative. Resume from commit abc123. Run `cadence project-activity --scope daily --since-commit abc123` to fetch commits since that point. Compose 3-5 paragraphs in McAdams structure. Return prose only.
   ```

4. **Save with watermark frontmatter.**

   The agent returns prose; the skill wraps and saves it. Frontmatter shape:

   ```yaml
   ---
   cadence: daily | weekly | monthly | annual | pursuit
   pursuit_id: <id>          # only when cadence=pursuit
   generated_at: <ISO timestamp>
   consumed_from_commit: <hash>   # may be omitted on first run
   consumed_through_commit: <hash>
   projects_consulted:
     - <pursuit-id>/<project-id>
     - <pursuit-id>/<project-id>
   ---
   ```

   To get `consumed_through_commit` and `projects_consulted` deterministically, run `cadence project-activity --scope <cadence> [--since-commit <hash>]` once with `--json` BEFORE delegating, and pass the resulting hashes to both the agent (in the prompt) and the file-write step. (Yes, this means two project-activity calls — once in the main thread for watermark metadata, once in the agent for prose generation. Acceptable since the call is cheap; alternatively, ask the agent to return the watermark fields alongside the prose.)

   Save the file at the resolved target path. Same-period re-runs overwrite (daily-2026-04-30.md gets written twice if /narrate today is run twice on the same day, with each subsequent run consuming the smaller slice since the prior write).

5. **Present.**

   Show the narrative prose to the user (not the frontmatter) under a heading like:
   - `Daily Narrative — 2026-04-30`
   - `Weekly Narrative — 2026 W18`
   - `[pursuit-id] — Full Arc`

   Mention the saved path so the user can find it.

## Fallback (in-thread)

If the narrator subagent invocation fails, run the data fetching and narrative composition inline:

```bash
cadence project-activity --scope <cadence> [--since-commit <hash>]
```

Compose the McAdams narrative directly and write the file with the same watermark frontmatter. The fallback path keeps /narrate functional during plugin issues but pulls bulk JSON into the main context — the agent path is preferred whenever it works.

## Guardrails

- **No evaluative praise.** No "great week" or "impressive progress." Describe what happened specifically.
- **No "why" framing.** "What happened" and "what shifted", not "why did this work" or "why did this fail."
- **Redemption-aware.** A hard week gets an honest narrative, not sugarcoating.
- **Narratives are views over data.** They are generated from project-file git history, ideas, and captures — not separate content to maintain.
- **The narrative file IS the watermark.** Do not split watermark metadata into a separate pointer file. Subsequent runs read the latest narrative for the cadence and resume from its `consumed_through_commit`.
- **Empty windows still get saved.** If no commits since the resume point, the narrator returns a short "quiet day" paragraph; save the file anyway with the new watermark so the next run resumes correctly.
