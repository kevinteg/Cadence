---
id: narrative-inbox-gists
pursuit: build-narrative-research-wiki
status: done
created: 2026-06-11
---

# Narrative inbox: triage gists on captures

## Intent

Small and independent (design doc section 7): captures should not be bare names in the triage queue — each carries a one-line narrative readable while triaging. For non-inline captures (--from / --source / --dump), which already run the capture-ingest subagent, the distillation adds a one-sentence triage_gist to the thought frontmatter at zero added cost on the hot path. The Inbox view (inboxItems(), the single function consumed by /status, the SessionStart hook, the capture-exit menu, /start inbox, and /reflect Get Clear) renders the gist beside the name on every surface. Inline /capture stays bare — flow safety beats everything; the inline path must not spend tokens on gist generation. If an inline capture is later opened during triage, a gist can be generated then. One number, one function, every surface: the gist rides the existing Inbox plumbing rather than adding a parallel system. Done feels like: walking the inbox, every subagent-ingested item reads as a sentence instead of a bare slug.

## Actions

- [x] Add triage_gist to the capture-ingest subagent contract and the write-capture v2 frontmatter schema
- [x] Render the gist beside the name in inboxItems() consumers (status, SessionStart hook, /start inbox triage, Get Clear) with graceful fallback when absent
- [x] Add gist-on-open: generate a gist during triage when an inline capture without one is opened
- [x] Queue fresh-session validation: run a --from ingest and verify the gist renders across all Inbox surfaces
