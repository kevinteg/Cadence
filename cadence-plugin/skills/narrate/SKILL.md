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
- `/narrate lessons [--from completed|dropped|both]` — synthesize recurring patterns across multiple resolved pursuits (cadence: lessons)
- `/narrate capstone <project|pursuit>` — the polished, source-grounded narrative of one unit, promoted to `wiki/narratives/` (cadence: capstone). The graduation path of the wiki layer — see "Capstone cadence" below.

Arguments resolve via fuzzy match. `today`, `week`, `month`, `year`, `lessons`, `capstone` are reserved keywords; anything else resolves to a pursuit ID.

## Steps

1. **Resolve cadence and target file.**

   | argument | cadence | target filename |
   |---|---|---|
   | (none) or `today` | `daily` | `wiki/drafts/daily-YYYY-MM-DD.md` |
   | `week` | `weekly` | `wiki/drafts/weekly-YYYY-WNN.md` (ISO week) |
   | `month` | `monthly` | `wiki/drafts/monthly-YYYY-MM.md` |
   | `year` | `annual` | `wiki/drafts/annual-YYYY.md` |
   | `<pursuit-id>` | `pursuit` | `wiki/drafts/pursuit-<id>-YYYY-MM-DD.md` |
   | `lessons` | `lessons` | `wiki/drafts/lessons-YYYY-MM-DD.md` |
   | `capstone <unit>` | `capstone` | `wiki/narratives/<unit-id>.md` |

   For pursuit cadence, fuzzy-match the argument against `cadence pursuits --json`; ask if ambiguous.

   For capstone cadence, the second token resolves to a project first,
   then a pursuit (same precedence as `/start`). `<unit-id>` in the
   filename is the project id (project capstone) or pursuit id
   (pursuit capstone). Re-runs overwrite — the capstone is the
   *current* durable telling, and prior versions live in git history.

   For lessons cadence, the source corpus is resolved pursuits in
   `pursuits/_archived/` and `pursuits/_dropped/`. The optional
   `--from completed` / `--from dropped` / `--from both` flag selects
   the corpus subset; default is `both`. The two folders give different
   signal: archived = what shipped (lessons of execution); dropped =
   what got learned without shipping (lessons of judgment).

2. **Compute resume watermark.**

   Look for prior narratives of the same cadence:
   - daily/weekly/monthly/annual: the target filename (overwrites the same file on same-period re-runs).
   - pursuit: the most recent `pursuit-<id>-*.md` file by mtime.
   - lessons: the most recent `lessons-*.md` file by mtime.

   If a prior file exists, read its frontmatter `consumed_through_commit` (or `pursuits_consulted` for lessons cadence — see below). That's the resume point. Otherwise, no resume point — the CLI defaults the window per cadence.

   **Legacy location:** repos that predate the wiki fold hold older
   narratives in `narratives/drafts/`. When nothing matches under
   `wiki/drafts/`, check the legacy path for the watermark (and for
   the lessons corpus, read both). New writes always land in
   `wiki/drafts/`. One-time migration: `git mv narratives/drafts
   wiki/drafts` — offer it when the legacy path is hit, never run it
   unprompted.

   For **lessons** cadence, the watermark is set-based, not commit-based: the prior narrative's frontmatter carries `pursuits_consulted: [<list of pursuit-ids>]` and `included_dropped: <bool>`. Re-runs read the current set of resolved pursuits (in `_archived/` and `_dropped/`) minus the consulted set, and synthesize patterns only from the new material. If no new pursuits have resolved since the prior run, return null and skip generation rather than re-running over the same corpus.

3. **Surface a brain-tickler tip (optional, frequency-capped).** Before calling the narrator subagent — which can run for tens of seconds — call:
   ```bash
   cadence tip-pick --triggers moment-long-agent-run --types quote \
     --category narrate-interjection --category-cool-down-days 7
   ```
   If a non-null tip is returned, render its `content` and `attribution` to the user as inline status before delegating: "While the narrator works, here's a frame to chew on: …" If null is returned (the category is on cool-down or no tip is eligible), skip silently. The category cap ensures narrate-interjections fire at most once every ~7 days so they feel like a surprise gift, not wallpaper. Honors the wallpaper warning explicitly.

4. **Delegate to the narrator subagent.** The whole point of this skill's design is to keep bulk activity JSON out of the main thread. The narrator agent fetches its own data via the cadence CLI in isolation and returns prose only.

   Invoke via the Agent tool:
   - `subagent_type: cadence:narrator`
   - `prompt`: a short briefing that includes:
     - The cadence (`daily` | `weekly` | `monthly` | `annual` | `pursuit:<id>`)
     - Resume hint if present: `since-commit <hash>`
     - Reminder of the McAdams output contract
     - **Explicit budget line** — `[Budget: 5 tool calls for daily/weekly/monthly/annual; 8 for pursuit-arc. If exceeded, return what you have without retrying.]` — see runtime's "Subagent budgets" principle.

   Example prompt (daily, no resume):
   ```
   Generate a daily narrative. Run `cadence project-activity --scope daily` to fetch project-file commits since midnight. Compose 3-5 paragraphs in McAdams structure (what happened / what it meant / what shifted / what's next). Return prose only — no frontmatter, no preamble.
   [Budget: 5 tool calls. If exceeded, return what you have without retrying.]
   ```

   Example prompt (daily, with resume):
   ```
   Generate a daily narrative. Resume from commit abc123. Run `cadence project-activity --scope daily --since-commit abc123` to fetch commits since that point. Compose 3-5 paragraphs in McAdams structure. Return prose only.
   [Budget: 5 tool calls. If exceeded, return what you have without retrying.]
   ```

   Example prompt (pursuit-arc, larger budget):
   ```
   Generate a pursuit-arc narrative for build-cadence-v1. Run `cadence project-activity --scope pursuit --pursuit build-cadence-v1` and read closure metadata as needed. Compose 5-8 paragraphs in McAdams structure: what was attempted, what shipped, what got dropped (with reasons), what brainstorms crystallized into projects, what was archived as decided-not-to-pursue.
   [Budget: 8 tool calls. If exceeded, return what you have without retrying.]
   ```

   Example prompt (lessons, multi-pursuit synthesis):
   ```
   Generate a lessons narrative across resolved pursuits. Read pursuit.md files in pursuits/_archived/ and pursuits/_dropped/, plus their resolution narratives in wiki/drafts/<id>-closure.md and <id>-drop.md. Synthesize 3-5 RECURRING patterns that show up across multiple pursuits — what's the lesson that keeps repeating? Frame archived (shipped) and dropped (didn't ship) lessons distinctly. Skip pursuits already in the prior narrative's pursuits_consulted list. Return prose only — no frontmatter.
   [Budget: 8 tool calls. If exceeded, return what you have without retrying.]
   ```

5. **Save with watermark frontmatter.**

   The agent returns prose; the skill wraps and saves it. Frontmatter shape:

   ```yaml
   ---
   cadence: daily | weekly | monthly | annual | pursuit | lessons
   pursuit_id: <id>          # only when cadence=pursuit
   generated_at: <ISO timestamp>
   consumed_from_commit: <hash>   # commit-watermark cadences only; omit on first run
   consumed_through_commit: <hash>  # commit-watermark cadences only
   projects_consulted:              # commit-watermark cadences only
     - <pursuit-id>/<project-id>
     - <pursuit-id>/<project-id>
   # Lessons-cadence-only fields:
   pursuits_consulted:              # set-watermark for lessons cadence
     - <pursuit-id>
     - <pursuit-id>
   included_dropped: true | false   # whether _dropped/ was in scope
   from_filter: completed | dropped | both   # the --from arg or default
   ---
   ```

   Commit-watermark cadences (daily/weekly/monthly/annual/pursuit) use
   `consumed_from_commit` + `consumed_through_commit` + `projects_consulted`.
   Lessons cadence uses the set-watermark fields instead — pursuits in
   the corpus are durable resolution events, not commits.

   To get `consumed_through_commit` and `projects_consulted` deterministically, run `cadence project-activity --scope <cadence> [--since-commit <hash>]` once with `--json` BEFORE delegating, and pass the resulting hashes to both the agent (in the prompt) and the file-write step. (Yes, this means two project-activity calls — once in the main thread for watermark metadata, once in the agent for prose generation. Acceptable since the call is cheap; alternatively, ask the agent to return the watermark fields alongside the prose.)

   Save the file at the resolved target path. Same-period re-runs overwrite (daily-2026-04-30.md gets written twice if /narrate today is run twice on the same day, with each subsequent run consuming the smaller slice since the prior write).

6. **Present.**

   Show the narrative prose to the user (not the frontmatter) under a heading like:
   - `Daily Narrative — 2026-04-30`
   - `Weekly Narrative — 2026 W18`
   - `[pursuit-id] — Full Arc`

   Mention the saved path so the user can find it.

## Capstone cadence — the graduation path

Capstone runs the same six steps with these deviations:

1. **Scaffold `wiki/_style/` on first use.** If `wiki/_style/voice.md`
   doesn't exist, copy the four defaults from the plugin:
   ```bash
   plugin_dir=$(cadence plugin-info --json | jq -r .plugin_dir)
   mkdir -p wiki/_style wiki/narratives
   cp "$plugin_dir"/styles/{voice,capstone,primer,diagrams}.md wiki/_style/
   ```
   Tell the user once: "Seeded `wiki/_style/` with Cadence defaults —
   edit them and your voice wins from then on." Never overwrite
   existing style files; the user's copies are theirs.

2. **Gather the unit's context** (main thread, cheap):
   - `cadence project <id> --pursuit <p> --json` (or `cadence pursuit
     <id> --json`) — current state + `effective_domain`.
   - Check for a research substrate at the unit's `research/index.md`
     (project scope; for pursuit capstones also check the pursuit-level
     substrate). Note `sources:` count when present.

3. **Brief the narrator dual-source + style-aware.** Example prompt:
   ```
   Generate a capstone narrative. Scope capstone:build-cadence-v1/mcp-integration.
   Unit path pursuits/build-cadence-v1/projects/mcp-integration.md;
   research substrate at pursuits/build-cadence-v1/projects/mcp-integration/research/
   (6 sources). effective_domain: digital. Read wiki/_style/voice.md,
   wiki/_style/capstone.md, wiki/_style/diagrams.md first and follow them.
   Activity: cadence project-activity --scope pursuit --pursuit build-cadence-v1
   (use the project's slice). Compose per the capstone contract: orientation,
   McAdams arc, How-it-works if diagrams clarify (Mermaid only), Sources
   stub list from the notes' provenance frontmatter. Full markdown document,
   no frontmatter.
   [Budget: 8 tool calls. If exceeded, return what you have without retrying.]
   ```
   Omit the substrate line when none exists (activity-only capstone is
   legal — the Sources section is then omitted).

4. **Save with wiki frontmatter** — the queryable layer for Markdown readers like Obsidian
   Bases/Dataview plus the standard watermark:
   ```yaml
   ---
   type: capstone
   cadence: capstone
   unit: <pursuit-id>[/<project-id>]
   pursuit: <pursuit-id>
   title: <human title>
   created: <YYYY-MM-DD>
   generated_at: <ISO timestamp>
   status: published
   sources: <N>                      # research sources consulted; 0 when no substrate
   tags: []
   consumed_from_commit: <hash>
   consumed_through_commit: <hash>
   projects_consulted: [...]
   ---
   ```

5. **Write the pointer seam — reference, not containment.** After
   saving, add one frontmatter line to the unit's file (project
   `<id>.md` or `pursuit.md`) via the Edit tool:
   ```yaml
   narrative: wiki/narratives/<unit-id>.md
   ```
   The unit file stays clean; the wiki owns the artifact; the pointer
   survives GC of the research substrate. If the line already exists,
   leave it (the path doesn't change on re-runs).

   Then maintain the discovery layer: add/refresh the artifact's line
   in `wiki/index.md` (Narratives section; create the index from the
   front-door format if missing) and append to `wiki/log.md`:
   `## [YYYY-MM-DD] promote | capstone <unit-id>`.

6. **Present** under `Capstone — <title>`, mention both the saved path
   and the pointer that was written.

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
- **Capstones promote; they don't embed.** The artifact lands in `wiki/narratives/`; the unit file carries only the one-line `narrative:` pointer. Never inline narrative prose into project or pursuit files.
- **Style files are the user's voice.** Read them every capstone run; never overwrite a user-edited `wiki/_style/` file with plugin defaults.
- **Capstone diagrams are Mermaid-only** and gated on `effective_domain: digital | hybrid`.
