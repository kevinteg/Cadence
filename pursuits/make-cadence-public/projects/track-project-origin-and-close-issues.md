---
id: track-project-origin-and-close-issues
pursuit: make-cadence-public
status: done
created: 2026-05-21
---

# Track project origin and close issues on resolve

Close the loop between /incoming-promoted projects and their GitHub issues. Today the link goes silent after triage.

## Intent

Today /incoming's promote-to-project path labels the origin GitHub issue as triaged-routed and posts a one-shot comment, then forgets the link. Once the project starts moving, the issue is stale; once the project resolves, the issue sits open forever. Maintainers have to manually close issues against shipped work — easy to forget, and the public-facing signal that 'this got built' is missing.

Close the loop by treating the origin as a generic piece of project state — visible on the GitHub issue, auto-updated when the project transitions. The 'origin' concept is designed as a generic field (supports GitHub issue references now; the same shape can later tie projects back to ideas, captures, URLs, or other sources without re-engineering the frontmatter). The immediate value lives in the close-on-resolve path: when a project hits done or dropped, the linked GitHub issue gets closed with a comment naming the project and outcome. The work-started side is secondary — nice to have, but the close path is what we actually need.

Scope:
- Projects only (not routed actions or captured ideas — projects are where the close loop matters)
- gh-gated everywhere: silent skip + one-line note when gh is missing, never fail the underlying state mutation
- No --no-issue-sync escape hatch yet — if it turns out we need silence for some flows, we'll add it then

Out of scope (worth noting, not solving here): backfilling origin on existing projects that were promoted before this lands; idea/action sync surfaces.

## Actions

- [x] Add generic origin: frontmatter field to projects (typed shape supporting kind: github_issue with repo + number + url; designed to extend to kind: idea, kind: url, etc.). Update scanner + types.
- [x] Wire /cadence:incoming's promote path to write origin: on the created project.
- [x] On cadence set-status --status done|dropped: if origin.kind == github_issue and gh available, close the issue with a comment naming the project and outcome (resolved via / dropped — reason).
- [x] On cadence set-status --status active (first action check / on_hold→active promotion): if origin.kind == github_issue and gh available, swap triaged-routed → in-progress label and post a one-line 'work started' comment.
- [x] Create the in-progress label on kevinteg/Cadence and document the maintainer label set (triaged-routed, triaged-deferred, in-progress) in a short note.
- [x] Document the origin field in cadence-reference.md (frontmatter section) and update workflows/verb-contracts.md for /incoming and /resolve to mention the side-effect.
