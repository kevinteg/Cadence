---
id: add-report-verb-with-privacy-guard
pursuit: make-cadence-public
status: done
created: 2026-05-21
---

# Add /cadence:report Verb with Privacy Guard

The current plugin issue-filing path leaks the active pursuit into issue bodies by default, and there's no first-class surface that invites coworkers or OSS users to send feedback. As make-cadence-public opens the door to outside adopters, we need a frictionless hidden verb that drafts a GitHub issue via gh, defaults to zero Cadence-state inclusion, and offers explicit warn-and-confirm when the user opts to attach content for repro.

## Intent

Cadence users adopting from the OSS release (coworkers and the wider public) will hit bugs and feature gaps. They need a frictionless way to file issues against the upstream cadence repo from inside the plugin — without leaking personal content. A hidden /cadence:report verb drafts a GitHub issue via gh, asks the user to describe what's on their mind, and by default does NOT collect any pursuit/project/capture/reflection content. If the user wants to include content to reproduce a bug, the verb surfaces an explicit warn-and-confirm that shows exactly what would be attached before posting. Output flavor invites bug reports, feature requests, and general feedback — not just bugs. The verb is hidden from the visible 12-verb surface (alongside develop and promote) but agent-suggested: when the user mentions friction, a bug, or a feature wish in chat, the agent surfaces 'you can file this with /cadence:report.' Past failure mode to avoid: a previous issue-filing path auto-included the active pursuit in the issue body; the new verb must never collect Cadence state by default. Done feels like: a coworker hits a friction point, types /cadence:report, walks a short prompt, and a clean issue lands in the cadence repo with no personal content attached — and the user trusts the surface enough to use it.

## Actions

- [x] Audit the existing issue-filing path to find where the active pursuit was being auto-attached; document the leak so the new verb can't repeat it.
- [x] Design the /cadence:report verb contract: inputs (kind = bug/feature/feedback, title, body), gh wiring, default privacy (no Cadence content), warn-and-confirm flow when the user opts to attach content.
- [x] Implement the skill at cadence-plugin/skills/report/SKILL.md with the contract + privacy guard. Output flavor invites bug reports, feature requests, and general feedback — not bug-only.
- [x] Wire natural-language-to-verb suggestion: agent surfaces /cadence:report when the user mentions friction, a bug, or a feature wish in chat. Frequency-cap via the tip system.
- [x] Add the verb to workflows/verb-contracts.md as hidden (alongside develop and promote — discoverable but not on the 12-verb surface).
- [x] Update cadence-plugin/cadence-runtime.md to document /report as a hidden verb + the no-state-by-default privacy contract.
- [x] Add a 'cadence plugin-info --json' CLI subcommand returning {plugin_dir, version, repository, owner_repo}. The /cadence:report skill calls it instead of walking up from `which cadence`.

## Notes

2026-05-21 — Audit complete. No existing Cadence-plugin issue-filing path exists (no report/feedback/bug/issue skill; bin/cadence does not call `gh`). The previous leak (active pursuit attached to issue body) was Claude Code's built-in /bug feedback command capturing workdir context — not our code. Implication: greenfield build, not a fix. /cadence:report ships with privacy-by-default. Issue target = repository field in plugin.json (https://github.com/kevinteg/Cadence).

2026-05-21 — Contract drafted and approved. To be applied to `workflows/verb-contracts.md` in action 5 and implemented as a skill in action 3.

### `/cadence:report` — Contract Draft

**Purpose:** File a GitHub issue against the upstream Cadence repo. Hidden verb. Privacy-by-default: never includes Cadence state without explicit opt-in.

**Tone:** Light, welcoming, smart-colleague. Opening invites bug reports, feature requests, or general feedback — not bug-only.

**Behavior:**
- Resolves the issue target by reading `cadence-plugin/.claude-plugin/plugin.json`'s `repository` field.
- Verifies `gh` is installed and authenticated. If not, prints install instructions, dumps the final issue body to the terminal so the user can paste into the GitHub UI as a fallback, and exits without filing.
- Gathers three fields: `kind`, `title`, `body`. `kind` is one of GitHub's default labels: `bug`, `enhancement`, `documentation`, `question`.
- Auto-appends an environment footer to the body: plugin version (from plugin.json), cadence git SHA (`git rev-parse HEAD` in plugin dir), claude code version (`claude --version`), node version, OS (`uname -sr`).
- Prints the FULL final issue body to the user for visual confirmation before calling `gh`.
- Posts via `gh issue create --repo <repo> --title "<title>" --body "<body>" --label <kind>`.
- On `gh` mid-flight failure (network, auth expired, rate limit), saves the body to `.cadence/drafts/report-<timestamp>.md` and surfaces the path so nothing is lost.

**Privacy guard (opt-in path):**
- If the user explicitly says "include my project file" / "attach the capture" / similar mid-flow, OR invokes `/cadence:report --include-content`:
  1. Identify the specific content to attach.
  2. Display the full text that would be appended.
  3. ELI5 prompt: "This will be posted publicly to `<repo>`. Anyone with internet access can read it. Confirm? [y/N]"
  4. On `y`: append under a `<details>` block in the issue body.
  5. On `N`: drop the attachment, post without.

**No-argument entry:** Interactive — prompts for kind → title → body. Optional positional shortcut: `/cadence:report bug "<title>"` skips the kind prompt.

**Discovery:** Hidden from the visible 12-verb surface (alongside `develop` and `promote`). Agent-suggested when friction/bug/feature-wish language appears in chat; frequency-capped via the tip system.

**Guardrails:**
- Never auto-include conversation context, project/pursuit IDs, or any Cadence content unless opted in via the warn-and-confirm path.
- Never read files outside the plugin directory and explicitly-confirmed attachment paths.
- If `gh auth` isn't configured, exit gracefully — print fallback dump, no draft persisted (draft persistence is only for mid-flight `gh` failures, not pre-flight).

**Exit:** "Filed #<number> against `<repo>`: <title>" + issue URL.
