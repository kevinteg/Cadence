---
id: recursive-wiki-discovery
pursuit: improve-ux-and-authoring
status: done
created: 2026-06-22
origin:
  kind: github_issue
  repo: kevinteg/Cadence
  number: 8
  url: https://github.com/kevinteg/Cadence/issues/8
---

# Wiki verbs index arbitrary top-level folders, not just known tiers

Triaged from issue #8: https://github.com/kevinteg/Cadence/issues/8

## Intent

The wiki query/curation verbs (find, wiki ask, wiki lint, wiki related) only scan the hardcoded tiers narratives/, primers/, living/. Artifacts in a user-created top-level folder under wiki/ (e.g. wiki/code-deep-dives/) are properly frontmattered and linked from index.md, so navigation works — but the CLI query surface is blind to them. Same root cause as the living/1-1s/ flat-glob limitation. The fix: recursive discovery keyed on wiki-shaped frontmatter rather than a hardcoded tier list, covering both gaps. Done looks like: drop a frontmattered file in any wiki/ subfolder and cadence find + /wiki ask surface it.

## Scoped (2026-06-23)

Root cause confirmed: `cadence find` only searches `snapshot.livingDocs`,
discovered by a **flat glob** `wiki/living/*.md` in `src/scan/living.ts`.
Narratives, primers, research, and any user-created shelf
(`wiki/code-deep-dives/`) are never in the find corpus; nested files
(`wiki/living/1-1s/`) are missed by the flat glob. Fix: a recursive,
frontmatter-keyed (title-keyed) wiki-artifact scanner feeding `find`,
plus making the living glob recursive for the anchoring features.

## Actions

- [x] Recursive wiki-artifact scanner: add `scanWikiArtifacts` (walk `wiki/**/*.md`, include any file with wiki-shaped frontmatter — a `title` — excluding `_archive/`), a `WikiArtifact` type, and `wikiArtifacts` on the Snapshot; wire into `repo.ts`.
  - src/scan/wiki.ts (scanWikiArtifacts: recursive wiki/** glob, title-keyed, _archive excluded); WikiArtifact type + Snapshot.wikiArtifacts; wired into repo.ts.
- [x] Point `cadence find` at the wiki-artifact corpus (replace the living-only loop) so arbitrary shelves + nested files + all tiers surface.
  - src/find.ts now loops snapshot.wikiArtifacts (slug/title/tags/anchors/body); context = artifact type. render/find.ts label 'Living docs' → 'Wiki'.
- [x] Fix the `wiki/living/` flat glob → recursive so nested living docs (e.g. `living/1-1s/`) reach the anchored-doc features (doc shelf, narrate --into, resolve disposition).
  - src/scan/living.ts glob wiki/living/*.md → wiki/living/**/*.md (recursive); nested living/1-1s/ now reach the anchoring features.
- [x] Tests (nested + arbitrary-shelf discovery; index/log/_archive excluded; find surfaces a novel-shelf file) + bundle.
  - test/wiki.test.ts (4 tests: nested + arbitrary-shelf discovery, nav/_archive exclusion, recursive living glob, find integration). Full suite 134/134. Bundled. Live-validated against the real repo wiki + a novel-shelf probe.
