---
id: remove-session-concept
pursuit: build-cadence-v1
status: done
created: 2026-04-30
---

# Remove Session Concept

## Intent

The Session/Marker concept layers ceremony on top of what pursuit/project/action already gives us — pursuit/project/action is itself a write-ahead log of intent: write the Intent, do the implementation, verify by checking actions. Markers carry only ceremony: the most recent unchecked action IS 'next'; project Notes IS open threads; the project file's git history IS provenance. Sessions also collide with Claude Code's own session model in user-facing strings. The one place Session/Marker carries real signal is /narrate, which today reads markers as the activity stream. Removing Session requires porting /narrate to a different stream — the natural choice is the git history of project files in the cadence repo, which is already the durable record of what changed when. To make narrative resumable across daily/weekly/monthly/annual cadences, each generated narrative carries frontmatter that doubles as a watermark (cadence, consumed_from_commit, consumed_through_commit, projects_consulted) so the next run for the same cadence reads only the slice of git history since the last narrative. The narrative IS the pointer into the stream. This project removes Session/Marker end-to-end (CLI subcommands, PreCompact hook, /pause skill, references in every other skill, hook config, the .cadence/active-session.json pointer) and ports /narrate to read from the project-file git stream with cadence-scoped pointers. Existing markers in the working tree are preserved as historical artifacts (still visible to git log, so they show up in retrospective narratives) but no longer read or written by the verb surface. Done when: Session vocabulary is gone from runtime, reference, every skill, journeys, CLI, and hooks; /narrate generates daily/weekly narratives with watermark frontmatter and resumes correctly on second run; an end-to-end run of /start a project, check actions, /complete works without writing a marker; the audit trail in Notes confirms nothing else depended on Session that we missed.

## Actions

- [x] Audit every reference to Session, Marker, /pause, write-marker, markers, session-open, session-close, pre-compact, .cadence/active-session.json across CLI, skills, runtime, reference, hooks, and journeys; capture the dependency graph in Notes
- [x] Design the /narrate port: git-log-as-stream reader (parse git log of pursuits/**/projects/*.md since a watermark commit, derive activity from intent edits / actions checked / status changes), the narrative frontmatter watermark schema (cadence, consumed_from_commit, consumed_through_commit, projects_consulted), and the resume logic that finds the latest narrative for a given cadence and reads forward from its watermark; document in Notes before implementing
- [x] Implement the /narrate port end-to-end including watermark-based resume; verify by generating a daily narrative, then a second daily narrative that consumes only the new slice
- [x] Delete CLI subcommands: session-open, session-close, write-marker, markers, pre-compact
- [x] Remove the PreCompact hook entry from cadence-plugin/hooks/hooks.json
- [x] Delete the /pause skill directory; remove pause/marker references across /start, /complete, /cancel, /capture, /reflect, /brainstorm, /develop, runtime, and reference
- [x] Rewrite /start to read project state directly (no marker read, no session-open); recap shows '[pursuit]/[project] — N/M actions' and 'Next: [first unchecked action]' from the project file alone
- [x] Update all 7 user-journey YAMLs that exercise /pause, /start with marker recap, marker assertions, or session-open/close
- [x] User-story validation in a fresh Claude conversation: /cadence:start <project>, check actions, /cadence:complete fires intent-feel-achieved, verify no markers were written and no .cadence/active-session.json exists; then /cadence:narrate today produces a narrative with the new watermark frontmatter, and a second /cadence:narrate today consumes only the new slice

## Notes

### Audit: Session/Marker dependency graph (2026-04-30)

**1. Hard dependencies (must port or replace before deletion)**

- `/narrate` — `cadence-plugin/agents/narrator.md:24-25, 55-61`. Reads markers via `cadence markers --json` for today/week/pursuit-arc narratives. Without marker data, narrative generation breaks. Port path: read git log of `pursuits/**/projects/*.md` instead (the planned watermark stream).
- Project marker annotation — `src/scan/repo.ts:42-51`. `annotateProjectMarker()` populates `project.hasMarker` and `project.mostRecentMarker`. Consumers:
  - `/start` recap (`cadence-plugin/skills/start/SKILL.md:40-127`) — reads most recent marker for "Next" line. Replace with first unchecked action from project file.
  - `nextSteps()` (`src/render/status.ts:48-91`, esp. 58-61) — filters in-progress projects by `hasMarker`. Replace with `status: active` + first-unchecked-action heuristic, OR git mtime of project file.
  - Reconciler (`src/report/reconciler.ts:58-89`) — `dormant_project` uses `mostRecentMarker ?? created`; `stale_marker` flag entirely marker-based. Replace dormancy basis with last commit timestamp on project file (git log -1).

**2. Soft dependencies (text references — rename/delete in place)**

- Skills: `/pause` (full skill, ~80 lines), `/start` (lines 2, 40, 69-120), `/narrate` (lines 27, 55-61), `/complete` and `/cancel` (implicit session-close).
- Reference docs: `cadence-plugin/cadence-reference.md` (lines 26-27, 53, 90, 105, 113, 220); `cadence-plugin/cadence-runtime.md` (lines 18, 24, 39, 45-46, 55-56, 111).
- Design docs: `docs/architecture.md` (lines 62-65, 100-104, 185-208, 247-277, 287, 335, 363); `docs/one-pager.md` (lines 50, 58, 74, 90); `docs/product-vision.md` (lines 47, 131, 160-176).
- `cadence-plugin/workflows/verb-contracts.md` lines 14, 45, 89-199 — ~110 lines of pause/marker contract.

**3. CLI surface to delete**

| Subcommand | Source | Purpose |
|---|---|---|
| `session-open` | `src/cli.ts:875-886` | Write `.cadence/active-session.json` |
| `session-close` | `src/cli.ts:889-896` | Remove pointer |
| `write-marker` | `src/cli.ts:463-510` | Write `pursuits/<p>/sessions/<ts>.md` |
| `markers` | `src/cli.ts:247-276` | List with filters |
| `pre-compact` | `src/cli.ts:901-916` | Hook command |

**4. Hook surface to delete**

- `PreCompact` hook entry in `cadence-plugin/hooks/hooks.json:32-41`. Behind it: `src/cli.ts:901-916` reads `.cadence/active-session.json`.
- `SessionStart` hook (lines 3-31) — survives; not Session-specific, calls `cadence status`.

**5. Data artifacts**

- 8 marker files at `pursuits/*/sessions/*.md` (build-cadence-v1, test-cancel residue). Per Intent: preserve in place, no longer read/written.
- `.cadence/active-session.json` (`src/write/session.ts:12`) currently exists in working tree. Delete during cleanup; gitignored, so no commit needed.

**6. Test/journey surface**

- `test/write.test.ts:150-177, 734-786` — writeMarker, openSession/readActiveSession/closeSession (~50 lines).
- `test/scan.test.ts:14, 22, 74-169` — marker scanning, projection annotation.
- `test/render.test.ts:63-165, 216-259, 495-501` — renderMarkers/markerTable, nextSteps with/without markers, stale_marker flag.
- `test/report.test.ts:107-171` — dormant/stale flag generation.
- Journeys: `core-session-loop.yaml` (full loop test), `reconciler-flags.yaml:30` (dormancy assertion), `capture-flow-safe.yaml:14` (vocab only).

**7. Decisions needed before downstream actions**

a. **Dormancy basis**: today is `mostRecentMarker ?? created`. Replace with `git log -1 --format=%aI -- <project-file>` (commit-timestamp). Acceptable that this gives commit cadence rather than session cadence — usually within minutes.
b. **"In-progress" definition for `nextSteps()` and WIP gating**: today is `status: active && hasMarker`. Replace with `status: active && firstUncheckedActionExists`, OR `status: active && hasCommitWithinNDays`.
c. **`config.marker_stale_days` schema field**: orphaned post-removal. Delete from `src/types.ts:158` and config defaults.
d. **`/start` switching projects auto-paused before**: post-removal, the new /start just changes context with no /pause ceremony. Documented behavior change.

(a) and (b) are the load-bearing port decisions; (c) and (d) are mechanical.

### Design: /narrate port (action 2, 2026-04-30)

**Stream source**: `git log` of `pursuits/**/projects/*.md`. Each commit that touches a project file is a discrete activity event. Project file diffs carry the semantic detail (action checked, status changed, intent edited) but **MVP skips diff parsing** — just emits commit metadata per project. Diff parsing is a v1.5 polish.

**New CLI subcommand**: `cadence project-activity`

```
cadence project-activity --json
  [--since-commit <hash>]   # default: HEAD~N for the cadence's window
  [--scope daily|weekly|monthly|annual|pursuit]
  [--pursuit <id>]          # required if --scope pursuit
```

Emits, per project that has commits in the window:
```json
{
  "project": "remove-session-concept",
  "pursuit": "build-cadence-v1",
  "current": { /* full project state — intent, actions, status, progress */ },
  "events": [
    { "timestamp": "2026-04-30T19:04:21Z", "commit": "abc123", "subject": "Drop define-checkpoint-and-restore; create remove-session-concept" }
  ]
}
```

The `current` snapshot lets the narrator describe project state without re-querying. Events are commits, sorted desc by timestamp.

Top-level response also carries:
```json
{
  "consumed_from_commit": "<since hash>",
  "consumed_through_commit": "<HEAD hash>",
  "projects": [ /* per-project entries above */ ]
}
```

**Watermark schema** (frontmatter on every saved narrative):
```yaml
---
cadence: daily | weekly | monthly | annual | pursuit
generated_at: 2026-04-30T19:30:00Z
consumed_from_commit: a1b2c3d
consumed_through_commit: e4f5g6h
projects_consulted:
  - build-cadence-v1/remove-session-concept
  - build-cadence-v1/audit-and-validate-v1
---
```

For `cadence: pursuit`, an extra `pursuit_id:` field names which one.

**Filenames** — the file IS the watermark, so every /narrate run saves:
- `narratives/drafts/daily-YYYY-MM-DD.md`
- `narratives/drafts/weekly-YYYY-WNN.md`
- `narratives/drafts/monthly-YYYY-MM.md`
- `narratives/drafts/annual-YYYY.md`
- `narratives/drafts/pursuit-<id>-YYYY-MM-DD.md`

Same-day re-runs of `/narrate today` overwrite `daily-YYYY-MM-DD.md` (one file per day per cadence).

**Resume logic** — implemented in the /narrate skill, not the CLI:
1. Skill computes the target filename from cadence + date.
2. If the file exists, read its `consumed_through_commit` and pass as `--since-commit` to `cadence project-activity`.
3. If the file doesn't exist, omit `--since-commit` — the CLI defaults the window per cadence:
   - daily: midnight today
   - weekly: ISO week start (Mon 00:00)
   - monthly: month start
   - annual: year start
   - pursuit: all commits touching that pursuit's projects (no time bound)
4. Skill passes the JSON event payload to the narrator subagent (via Agent tool).
5. Narrator returns prose; skill writes the file with watermark frontmatter.

**Argument mapping** (user-facing → internal cadence):
- `/narrate` (no arg) → `daily`
- `/narrate today` → `daily`
- `/narrate week` → `weekly`
- `/narrate month` → `monthly`
- `/narrate year` → `annual`
- `/narrate <pursuit>` → `pursuit`

**Narrator agent change**: input data shape switches from `{markers, ideas, captures}` to `{projects: [{project, pursuit, current, events}], cadence, consumed_from_commit, consumed_through_commit}`. Same McAdams output contract. Agent prompt lightly edited; keep it small.

**Edge cases**:
- Empty window (no commits since last run): narrator returns "Quiet day — no committed activity." Skill still writes the file with the new watermark to mark "we checked."
- First run with no prior file: default window applies; resume kicks in on second run.
- Rebased history (consumed_through_commit not reachable from HEAD): skill detects via `git merge-base --is-ancestor`, falls back to the cadence's default window and emits a warning.

**Reconciler / dormancy port** (folded into action 3 since it's same git-log territory):
- `dormant_project` flag: replace `mostRecentMarker ?? created` with `max(git log -1 committer-date, fs.mtime)`.
- `stale_marker` flag: deleted entirely.
- `nextSteps()` "in-progress" filter: switch from `hasMarker` to `status: active && hasUncheckedActions`.

### Decisions locked (2026-04-30)

- **(a) Dormancy basis**: `last_activity_at = max(git log committer-date, fs.mtime)` — captures both committed and uncommitted activity; computed at query time today (sub-ms at current scale); becomes a derived column when the indexer ships.
- **(b) Lifecycle / WIP**: `status: active` means "first action has been checked." The on_hold→active promotion via `/start` retires; only first action check promotes. WIP = `status: active && hasUncheckedActions`. The all-checked-but-not-yet-completed transient is surfaced by the existing `structural_active_no_open_actions` flag, not counted as WIP.
- **(c) `marker_stale_days`**: delete from `src/types.ts` config schema and defaults.
- **(d) `/start` switching auto-pause**: gone with `/pause`; new `/start` just changes context, no ceremony.
