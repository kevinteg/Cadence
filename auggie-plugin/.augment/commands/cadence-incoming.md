---
description: Maintainer-side triage of open GitHub issues on the upstream Cadence repo. Walks each issue and routes to a project action, a new project, a capture, a close, or a defer. Cadence-specific (operates against plugin-info's owner_repo). TRIGGER ONLY when the user explicitly invokes /cadence-incoming or /incoming. SKIP all natural-language equivalents — never auto-fire from "any new issues?", "what should I triage?", "check inbound", or similar; instead surface the verb name as a suggestion when such language appears.
---

<arguments>$ARGUMENTS</arguments>


# /incoming

Maintainer-side triage of open issues on the upstream Cadence repo.
Hidden verb — not on the visible 12-verb surface; explicit-invocation
only. Agent-suggested when chat language signals maintainer-mode.

Reference `.augment/workflows/verb-contracts.md` for the incoming register.

## Usage

- `/incoming` — walk the full queue, one issue at a time, oldest-first
- `/incoming <issue-number>` — jump to a specific issue, triage it, exit
- `/incoming --include-deferred` — include `triaged-deferred` issues in the list (periodic re-check of the deferred backlog)

## Steps

1. **Resolve the upstream repo.** Run `cadence plugin-info --json`. Use `owner_repo` as the `--repo` arg for all `gh` calls. If null (unparseable repository field), refuse:
   > "Plugin manifest has no parseable `repository` field — can't target an issue tracker."

2. **Check `gh` availability and auth.** Run `gh auth status`. Two branches:
   - **Installed and authed:** proceed.
   - **Missing or unauthed:** print install instructions (`brew install gh && gh auth login` on Mac), then exit. Unlike `/report`, there's no useful offline mode — exit without ceremony.

3. **Fetch the inbound queue.**

   ```bash
   gh issue list --repo <owner_repo> --state open \
     --search "-label:triaged-deferred -label:triaged-routed" \
     --json number,title,labels,author,createdAt,url,body,comments \
     --limit 50
   ```

   With `--include-deferred`, drop the `-label:triaged-deferred` clause.

   Sort the result oldest-first by `createdAt`.

4. **Open with one welcome line.** If queue is empty: `"No untriaged issues against <owner_repo>. Done."` and exit. Otherwise:

   > `<N> open issues to triage. First up:`

5. **For each issue, walk the triage flow.**

   Display:
   ```
   #<num> [<label>] <age> — <title>     by @<author>
   <url>

   <body>

   <comments — first 3 if more than 3, with "...K omitted..." between>
   ```

   Then prompt:
   ```
   Triage: [r]oute / [p]romote / [b]rainstorm / [n]ote-to-inbox / [c]lose / [d]efer / [s]kip:
   ```

   Accept either single-key (`r`) or typed (`route`) answers.

6. **Apply the chosen outcome.** Each operation is described below. After applying, increment the per-outcome counter and proceed to the next issue.

   ### r — route-to-action

   1. List active projects (filter `cadence scan --json` to `status: active`).
   2. Prompt: `Which project? (1-N or project-id)`
   3. Append action:
      ```bash
      cadence add-item <project-id> \
        --pursuit <pursuit-id> \
        --section action \
        --text "<issue title> (#<num>: <url>)"
      ```
   4. Mark issue triaged:
      ```bash
      gh issue edit <num> --repo <owner_repo> --add-label triaged-routed
      gh issue comment <num> --repo <owner_repo> \
        --body "Triaged to project \`<project-id>\` as an action."
      ```

   ### p — promote-to-project

   1. List active pursuits. Prompt: `Which pursuit? (1-N or pursuit-id, default: make-cadence-public)`
   2. Derive project ID from issue title (lowercase, dash-separated, strip non-alphanumerics; if ambiguous, prompt for an override).
   3. Create the project, passing `--origin-issue` so the issue can be auto-closed on resolve (see `/cadence-resolve` side effect via `origin: github_issue` frontmatter):
      ```bash
      cadence create-project <project-id> \
        --pursuit <pursuit-id> \
        --status on_hold \
        --title "<issue title>" \
        --description "Triaged from issue #<num>: <url>" \
        --intent "<issue body — thin Intent acceptable; co-editable later via /cadence-start>" \
        --action "Read the issue thread and decide first concrete move." \
        --origin-issue "<owner_repo>#<num>"
      ```
   4. Mark issue triaged:
      ```bash
      gh issue edit <num> --repo <owner_repo> --add-label triaged-routed
      gh issue comment <num> --repo <owner_repo> \
        --body "Promoted to project \`<project-id>\` under pursuit \`<pursuit-id>\`."
      ```

   ### b — open-as-brainstorm

   1. Derive a slug from the issue title (kebab-cased; user can override).
   2. Create the brainstorm workspace, seeding the body into `workspace.md`:
      ```bash
      cadence create-brainstorm <slug> --topic "<issue title>"
      ```
      Then append the issue body to `brainstorms/<slug>/workspace.md` (with a "From #<num>: <url>" footer).
   3. Mark issue triaged:
      ```bash
      gh issue edit <num> --repo <owner_repo> --add-label triaged-routed
      gh issue comment <num> --repo <owner_repo> \
        --body "Opened as brainstorm \`<slug>\` for divergent ideation."
      ```

   ### n — note-to-inbox

   1. Write the issue as a v2 capture in `thoughts/unprocessed/`, sourced from the issue URL so dedup catches re-pulls:
      ```bash
      cadence write-capture \
        --body "<issue title>\n\n<issue body>\n\nFrom #<num>: <url>" \
        --source-kind url \
        --source-uri "<url>" \
        --verb-context "incoming:note"
      ```
      The capture lands in the Inbox view (status: untriaged) for later triage via `/cadence-start inbox`.
   2. Mark issue triaged:
      ```bash
      gh issue edit <num> --repo <owner_repo> --add-label triaged-routed
      gh issue comment <num> --repo <owner_repo> \
        --body "Noted to Inbox at thoughts/unprocessed/ for triage."
      ```

   ### c — close-with-comment

   1. Prompt: `One-line close comment (e.g., "duplicate of #45", "by design"):`
   2. Close:
      ```bash
      gh issue close <num> --repo <owner_repo> --comment "<text>"
      ```

   ### d — defer

   Apply the label, no further prompt:
   ```bash
   gh issue edit <num> --repo <owner_repo> --add-label triaged-deferred
   ```

   ### s — skip

   No state change. Move on. The issue reappears on the next `/incoming` run.

7. **End-of-queue summary.** Once all issues are walked (or the user types `quit` mid-flow):

   ```
   Triaged <N> issues:
     - <M> routed to projects/actions/captures
     - <K> closed
     - <D> deferred
     - <S> skipped

   <inbound queue: <remaining> issues>
   ```

   Then the verb-hint block + teaching footer per the universal exit convention (`cadence tip-pick --triggers verb-incoming`).

## Guardrails

- **`gh` is a hard prerequisite.** No offline mode. If `gh` is missing or unauthed, exit at step 2.
- **Never auto-route.** Every outcome requires explicit per-issue user choice. The agent does not infer "this looks like X" from the issue body.
- **Never silently include attribution data** beyond what's already public on GitHub. The verb only **reads** public issue content and **writes** new labels/comments visible on the issue.
- **Routes do not close issues.** The issue stays open until the corresponding work lands. Maintainer closes it manually later (or uses `c` for a graceful close at triage time).
- **Skip does not persist.** No `triaged-skipped` label — that would create label sprawl with no semantic meaning. Skipped issues reappear on the next run.
- **Hidden verb status.** Do not surface in `/cadence-help`'s primary verb catalogue. Discovery is via the reconciler-flag pathway (`inbound-issues-piling-up`) and the chat-language suggestion (`intent-maintainer-triage` tip).
- **Smart-colleague tone** — same editorial guide as the tip library. No editorializing about the issues; the maintainer decides.
