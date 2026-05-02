---
id: add-physical-domain-awareness-to-prompts
pursuit: improve-ux-and-vision
status: on_hold
created: 2026-05-01
---

# Add Physical-Domain Awareness to Prompts

Cadence's verb surface today assumes digital/coding work in subtle ways: prompts ask about CI configuration, code paths, PRs. For Cadence to genuinely serve non-dev pursuits (household, creative practice, fitness, family logistics), the verbs need to detect when a project is physical-space-shaped and adapt their prompts accordingly. The elegant move (per discussion): don't add a /log verb; encode domain awareness into existing verbs' prompts so /complete becomes the natural place to log physical-state changes.

## Intent

Add physical-domain awareness to the prompts in promote, start, and complete so projects on physical work get prompts that fit their domain. Specifically: (1) add a heuristic for detecting physical-domain projects via keyword scanning of Intent text and project ID (rooms, tools, materials, body parts, cooking, repair vocabulary, etc.); (2) add an optional domain frontmatter field on projects (values: physical | digital | hybrid) that overrides the heuristic; (3) update /promote so when domain is physical, Intent questions ask about workspace, tools/parts, constraints (water shutoff, parts availability, weather window) rather than CI config; (4) update /promote so first-action suggestions for physical projects are physical-action-shaped; (5) update /complete so when completing an action on a physical project, the prompt asks 'what changed in the physical space?' and appends the response to the project's Notes section — this becomes the natural log replacement, accumulating activity for narratives without adding a /log verb. Done feels like: a fresh pursuit/project for 'fix the kitchen sink' gets prompts about water shutoff and replacement parts, not Git workflows; completing actions on it leaves a meaningful Notes trail that the narrative engine can read; no new verb is required.

## Actions

- [ ] Add a heuristic for physical-domain detection — keyword-based scan of Intent text and project ID for physical-space language (rooms, tools, materials, body parts, cooking verbs, repair verbs, etc.). Returns confidence + detected domain (physical | digital | hybrid | unknown). Implement in CLI and expose via the project JSON output.
- [ ] Add an optional 'domain' frontmatter field to project files (values: physical | digital | hybrid). When set, overrides the heuristic. Document in cadence-reference.md.
- [ ] Update skills/promote/SKILL.md so when promoting an Idea to a Project and the detected/declared domain is physical, the Intent questions adapt: ask about workspace, tools/parts, constraints (water shutoff, parts availability), rather than digital-flavored questions about CI/code paths.
- [ ] Update skills/promote/SKILL.md (and possibly start) so first-action suggestions for physical-domain projects are physical-action-shaped (e.g., 'turn off water supply', 'lay drop cloth') rather than digital examples.
- [ ] Update skills/complete/SKILL.md (or wherever /complete prompts live) so when completing an action on a physical-domain project, the prompt asks 'what changed in the physical space?' and appends the response to the project's Notes section as a timestamped entry. This is the natural log replacement.
- [ ] Add domain awareness as a cross-cutting principle in cadence-runtime.md, noting that domain detection is heuristic with optional frontmatter override, and that prompts should adapt across promote/start/complete to fit the detected domain.
