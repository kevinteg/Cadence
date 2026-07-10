---
id: content-manifest
pursuit: improve-ux-and-authoring
status: active
created: 2026-07-09
origin:
  kind: github_issue
  repo: kevinteg/Cadence
  number: 17
  url: https://github.com/kevinteg/Cadence/issues/17
---

# Content manifest: repos advertise published endpoints, data roots, and services for hub discovery

Triaged from issue #17: https://github.com/kevinteg/Cadence/issues/17

## Intent

Spoke repos increasingly produce things the hub needs to discover: published sites (behind Cloudflare Access), wikis, data roots on the NAS (pristine vaults, staged device targets), and deployable service definitions. Today each is invisible outside its repo — home-tech has a pursuit-nav-site project whose whole job is a landing page linking all pursuit-* sites, currently hand-maintained. The hub has no way to answer 'what does this delegated pursuit publish, and where does its data live?' publish_targets in cadence.yaml models the outbound direction (push curated content elsewhere) but nothing models the advertisement direction (declare what this repo hosts/owns so others can discover it).

Suggested solution — a top-level machine-readable content manifest (cadence-manifest.yaml, beside pursuits/) per repo, covering:
  endpoints: url/kind/access/summary for published sites, wikis, APIs
  data_roots: NAS/local paths with roles (pristine, installed, staged)
  services: opaque pointer to service definition files (schema owned by service tooling)

Cadence owns the schema and aggregation, not the semantics of each entry. Hub-side discovery verb (/cadence:fleet or folded into hub status) walks the registry + delegated repos, collects manifests, renders 'what exists where' — sites, wikis, data roots, services. Exportable as JSON/YAML so a nav/landing site can be generated from it instead of hand-maintained. Complements publish_targets: publish = outbound contribution, manifest = inbound advertisement.

Felt-sense of done: holistic oversight is a query, not a habit — the hub can enumerate every published surface and every data root across all pursuit repos, and the nav-site can be generated from structured data.

## Actions

- [x] Read the issue thread and decide first concrete move.
  - Shipped 2026-07-10: cadence-manifest.yaml + manifest + fleet.
- [x] cadence-manifest.yaml schema (src/manifest.ts): endpoints/data_roots/services, loose passthrough — Cadence owns schema + aggregation, not entry semantics
- [x] cadence manifest [--json]: read/validate the local manifest
- [x] cadence fleet [--json]: union of self + registry repos + delegated checkouts, deduped; JSON is the exportable aggregation for nav-site generation
- [x] Hub flag propagation: registry hub markers + manifest hub back-pointers mark fleet members
- [x] Surface: /status fleet keyword in the status skill; formats documented in cadence-reference.md Hub and Spoke
