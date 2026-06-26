# Diagram conventions

For wiki artifacts (capstones, primers). Edit freely; your version
wins.

## Format

**Mermaid only.** Fenced ```mermaid blocks render natively in
Obsidian and GitHub, diff cleanly, and stay editable as text — which
matches the local-first, version-controlled ethos. No generated SVG,
no image assets, no external diagram services.

## When to include a diagram

Only when prose makes the reader hold more than ~4 moving parts in
their head at once. A diagram that restates one sentence is
decoration; cut it. Most capstones need zero or one diagram.

Domain gate: diagrams are briefed for `effective_domain: digital` or
`hybrid` units. Physical-domain narratives almost never need one.

## Which type

| Shape of the thing | Mermaid type |
|---|---|
| Components and what talks to what | `flowchart` (prefer `LR` for pipelines, `TD` for hierarchies) |
| Who-calls-whom over time, request/response | `sequenceDiagram` |
| Lifecycle with named states and transitions | `stateDiagram-v2` |
| Timeline of phases | avoid — prose dates read better at wiki scale |

## Style

- Label edges with verbs ("promotes to", "reads", "dispatches").
- Node names match the vocabulary used in the surrounding prose —
  the diagram and the text must not drift apart.
- Keep one diagram under ~12 nodes; past that, split or simplify.
- No color directives, no themes — let the renderer decide.
