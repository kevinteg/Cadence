---
description: File a GitHub issue against the upstream Cadence repo. Privacy-by-default — never includes any pursuit/project/capture/reflection content unless the user explicitly opts in via warn-and-confirm. TRIGGER ONLY when the user explicitly invokes /cadence-report or /report. SKIP all natural-language equivalents — never auto-fire from "this is buggy", "we should add X", "I have feedback", or any in-conversation gripe; instead surface the verb name as a suggestion when such language appears.
---

<arguments>$ARGUMENTS</arguments>


# /report

File a bug report, feature request, documentation note, or general
feedback against the upstream Cadence repo. Hidden verb — not on the
visible 12-verb surface; agent-suggested when friction, bug, or
feature-wish language appears in chat.

Reference `.augment/workflows/verb-contracts.md` for the report register.

## Usage

- `/report` — interactive flow (kind → title → body)
- `/report <kind>` — preset the kind; prompt for title and body
- `/report <kind> "<title>"` — preset kind and title; prompt for body
- `/report --include-content` — opt-in to attach Cadence content via warn-and-confirm

Valid `kind` values (GitHub default labels): `bug`, `enhancement`, `documentation`, `question`.

## Steps

1. **Resolve the issue target.** Run `cadence plugin-info --json`. It returns:

   ```json
   { "plugin_dir": "...", "version": "...", "repository": "...", "owner_repo": "owner/repo" }
   ```

   Use `owner_repo` as the `--repo` arg for `gh issue create`. Keep `version` and `plugin_dir` for the environment footer (step 5).

   If `owner_repo` is null (unparseable repository field), refuse:
   > "Plugin manifest has no parseable `repository` field — can't target an issue tracker."

2. **Check `gh` availability and auth.** Run `gh auth status`. Three branches:
   - **Installed and authed:** proceed.
   - **Installed but not authed:** print `gh auth login` instructions inline. Continue the gather flow below; at step 7, dump the final issue body to the terminal as the fallback. Do not persist a draft.
   - **Not installed:** print `brew install gh && gh auth login` (Mac) or the platform-appropriate equivalent. Same fallback as above.

3. **Open with a one-line welcome.** Set the surface to broader than bugs:

   > Report a bug, request a feature, or share feedback — anything goes.

4. **Gather the three fields**, one at a time, skipping any the user already supplied:

   ```
   What kind? (bug | enhancement | documentation | question)
   ```
   ```
   Title (one-line summary):
   ```
   ```
   Describe it. What happened, what you expected, repro steps (if a bug); what you want and why (if enhancement/question/documentation).
   ```

5. **Build the environment footer.** Append to the body:

   ```
   ---
   _Environment_
   - Cadence plugin: <version from cadence plugin-info>
   - Cadence SHA: <git -C <plugin_dir> rev-parse HEAD>
   - the agent host: <claude --version>
   - Node: <node --version>
   - OS: <uname -sr>
   ```

   If any detection command fails, render the line as `unknown` and continue. Never block on env detection.

6. **Privacy guard (opt-in path only).** If the user invoked `--include-content`, OR mid-flow explicitly says "include my project file" / "attach the capture" / similar:

   1. Identify the specific path or block to attach — one at a time. Never offer an "everything Cadence knows" toggle.
   2. Read the content (only the path the user named).
   3. Display the full text that would be appended.
   4. ELI5 prompt:
      ```
      This will be posted publicly to <owner/repo>. Anyone with internet access can read it. Confirm? [y/N]
      ```
   5. On `y`: append under a `<details><summary>Repro content</summary>…</details>` block in the body so it doesn't dominate the visual surface but is searchable.
   6. On `N`: drop the attachment, continue with the no-content body.

7. **Display the final body for visual confirmation.**

   ```
   About to file:

   ## <kind>: <title>

   <body>

   <environment footer>

   <attached content if any>

   Post? [y/N]
   ```

   On `N`: ask what to change (title / body / attachments / cancel). On `y`: proceed.

   **Fallback branch (gh missing or unauthed):** instead of posting, print:
   ```
   gh is not configured. Paste the following into <owner/repo>'s issue tracker:

   <full final body, including env footer>
   ```
   No draft is persisted on this branch (the user has the dump on screen).

8. **Post via `gh`.**

   ```bash
   gh issue create \
     --repo <owner/repo> \
     --title "<title>" \
     --body "<body>" \
     --label <kind>
   ```

   - **On success:**
     ```
     Filed #<number> against <owner/repo>: <title>
     <url>
     ```
   - **On mid-flight failure** (network, auth expired, rate limit): save the body to `.cadence/drafts/report-<YYYY-MM-DDTHHMMSS>.md` (create the dir if needed). Surface:
     ```
     gh failed: <error>
     Draft saved to .cadence/drafts/report-<ts>.md
     Retry with: gh issue create --repo <owner/repo> --title "<title>" --body-file <path> --label <kind>
     ```

## Guardrails

- **Never auto-include Cadence content.** Project IDs, pursuit IDs, any pursuit/project/idea/capture/reflection/narrative text, and the conversation transcript — none of it goes into the issue body unless the user opts in via step 6 and confirms in step 7. The default body is the user's text plus the environment footer, nothing more.
- **Never read files outside the plugin directory** and the explicitly-confirmed attachment paths from step 6. No glob, no scan, no implicit attachment.
- **No state writes outside the success path.** Drafts only land on disk when `gh` was attempted and failed mid-flight. The `gh not installed` and `gh not authed` paths produce a terminal dump only — no draft persisted.
- **Mid-flow cancel is graceful.** If the user responds `N` at step 7, drop the in-memory body without saving. Privacy default extends to abandoned drafts.
- **Hidden verb status.** Do not surface in `/cadence-help`'s primary verb catalogue. Discovery happens via the natural-language suggestion path defined in `.augment/workflows/verb-contracts.md`.
- **Smart-colleague tone.** Same editorial guide as the tip library — no cheery, no apologetic, no streak-flavor. The welcome line at step 3 is the only flavor; everything else is functional.
