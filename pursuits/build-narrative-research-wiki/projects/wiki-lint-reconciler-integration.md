---
id: wiki-lint-reconciler-integration
pursuit: build-narrative-research-wiki
status: done
created: 2026-06-11
---

# /wiki lint + reconciler meta-awareness

## Intent

The maintenance layer, lands last once there is a corpus worth linting (design doc sections 3, 4, 10). /wiki lint is the Lint operation: a budgeted subagent scans the durable corpus for contradictions, stale claims, orphan artifacts, broken back-references, dangling narrative: pointers, and coverage gaps, returning a short findings list. It never auto-fixes — it surfaces for the user to decide, consistent with how the reconciler surfaces flags rather than acting on them. Specifically valuable post-GC: verify every capstone back-reference still resolves to at least a citation stub, and flag any narrative whose provenance evaporated. The reconciler gains meta-awareness: a capstone_gap flag (resolved unit with a research substrate but no narrative), a retrospective_due nudge (N pursuits resolved since the last retrospective — reuses the frequency-cap and set-watermark machinery /narrate lessons already implements), and /wiki lint scheduling. /reflect Get Clear surfaces substrates-without-capstone as a gentle finalization signal. Done feels like: the corpus stays trustworthy without anyone remembering to check it.

## Actions

- [x] Build /wiki lint as a budgeted subagent: findings list covering contradictions, stale claims, orphans, broken back-references, dangling pointers, and coverage gaps — surface only, no auto-fix
- [x] Add reconciler flags: capstone_gap (resolved unit with research but no narrative) and retrospective_due (reuse the /narrate lessons watermark machinery)
- [x] Surface the new flags in /reflect Get Clear and the SessionStart heads-up block
- [x] Queue fresh-session validation: seed a broken back-reference and a capstone gap, verify lint and the reconciler surface both
