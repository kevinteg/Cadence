import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import { z } from 'zod'
import { resolveDelegate } from './delegation.js'
import {
  entryByGitUrl,
  entryPath,
  loadRegistry,
  type Registry,
} from './registry.js'
import { isCadenceRepo } from './root.js'
import { scan } from './scan/repo.js'

/**
 * Content manifest + fleet aggregation — the hub/spoke discovery seam.
 *
 * A repo advertises what it publishes by dropping a
 * `cadence-manifest.yaml` at its root (beside pursuits/): endpoints it
 * serves, data roots other tooling renders, and opaque service
 * pointers. Cadence owns the schema and the aggregation, NOT the
 * semantics of the entries — the schemas are deliberately loose
 * (passthrough, free-form kind/access/role strings) so a spoke can
 * evolve its vocabulary without a Cadence release.
 *
 * The fleet view is the hub-side aggregate: this repo, every registered
 * repo, and every delegated pursuit's resolved checkout, deduped by
 * absolute path. Everything here is read-only — nothing in this module
 * writes to any repo.
 */

export const MANIFEST_FILENAME = 'cadence-manifest.yaml'

const EndpointSchema = z
  .object({
    /** Where the published thing lives — the only required field. */
    url: z.string(),
    /** Free-form: 'site', 'feed', 'api', … — spoke vocabulary. */
    kind: z.string().optional(),
    /** Free-form: 'public', 'gated', … */
    access: z.string().optional(),
    summary: z.string().optional(),
  })
  .passthrough()
export type ManifestEndpoint = z.infer<typeof EndpointSchema>

const DataRootSchema = z
  .object({
    /** Repo-relative directory the content lives in. */
    path: z.string(),
    /** Free-form: 'content', 'media', 'config', … */
    role: z.string().optional(),
    summary: z.string().optional(),
  })
  .passthrough()
export type ManifestDataRoot = z.infer<typeof DataRootSchema>

export const ManifestSchema = z
  .object({
    /** Display name; defaults to basename(repoRoot) at load. */
    repo: z.string().optional(),
    /** Git URL of this repo's hub, when it has one. */
    hub: z.string().optional(),
    endpoints: z.array(EndpointSchema).optional(),
    data_roots: z.array(DataRootSchema).optional(),
    /** Opaque pointers to files owned by other tooling. */
    services: z.array(z.string()).optional(),
  })
  .passthrough()
export type Manifest = z.infer<typeof ManifestSchema>

export function manifestPath(repoRoot: string): string {
  return path.join(path.resolve(repoRoot), MANIFEST_FILENAME)
}

/** Missing file → null (advertising nothing is legal). Malformed throws. */
export function loadManifest(repoRoot: string): Manifest | null {
  const file = manifestPath(repoRoot)
  let text: string
  try {
    text = readFileSync(file, 'utf8')
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  }
  let manifest: Manifest
  try {
    const parsed = yaml.load(text, { schema: yaml.CORE_SCHEMA }) ?? {}
    manifest = ManifestSchema.parse(parsed)
  } catch (err) {
    throw new Error(`Malformed manifest at ${file}: ${String(err)}`)
  }
  if (!manifest.repo) manifest.repo = path.basename(path.resolve(repoRoot))
  return manifest
}

export type FleetMember = {
  /** Registry name, else manifest display name, else basename. */
  name: string
  /** Absolute path of the checkout — the dedupe key. */
  path: string
  /** Registry hub flag, or named as a hub by a member's manifest. */
  hub: boolean
  manifest: Manifest | null
  /** Why a present-but-unloadable manifest shows as null. */
  manifest_error?: string
  active_pursuits: string[]
}

export type FleetView = {
  generated_from: string
  members: FleetMember[]
}

/**
 * Aggregate manifests across the fleet: the union of this repo, every
 * registry entry whose path exists and is a Cadence repo, and every
 * delegated pursuit's resolved checkout. Registry entries are hints —
 * stale paths are skipped, not errors — and a spoke's malformed
 * manifest degrades to `manifest: null` + `manifest_error` rather than
 * failing the whole view (the spoke's own `cadence manifest` is the
 * debugging surface).
 */
export async function collectFleet(
  repoRoot: string,
  registry?: Registry,
): Promise<FleetView> {
  const reg = registry ?? loadRegistry()
  const root = path.resolve(repoRoot)

  // Candidate checkouts by absolute path; the registry name (when one
  // exists) wins the display name.
  const candidates = new Map<string, { registry_name?: string }>()
  candidates.set(root, {})

  for (const entry of reg.repos) {
    const p = entryPath(entry)
    if (!existsSync(p) || !isCadenceRepo(p)) continue
    if (!candidates.get(p)?.registry_name) {
      candidates.set(p, { registry_name: entry.name })
    }
  }

  // Delegated pursuits pull their spoke checkouts into the fleet even
  // when unregistered (resolution may go through discovery).
  const rootSnapshot = await scan(root)
  for (const pursuit of rootSnapshot.pursuits) {
    if (
      !pursuit.delegated_to ||
      pursuit.lifecycle === 'archived' ||
      pursuit.lifecycle === 'dropped'
    ) {
      continue
    }
    const resolution = resolveDelegate(
      root,
      pursuit.id,
      pursuit.delegated_to,
      reg,
    )
    if (!resolution.checkout) continue
    const p = path.resolve(resolution.checkout)
    if (!candidates.has(p)) {
      candidates.set(p, { registry_name: resolution.registry_name })
    }
  }

  const members: FleetMember[] = []
  for (const [p, meta] of candidates) {
    let manifest: Manifest | null = null
    let manifestError: string | undefined
    try {
      manifest = loadManifest(p)
    } catch (err) {
      manifestError = err instanceof Error ? err.message : String(err)
    }
    // Read-only: scan() never mutates the member repo.
    const snapshot = p === root ? rootSnapshot : await scan(p)
    members.push({
      name: meta.registry_name ?? manifest?.repo ?? path.basename(p),
      path: p,
      hub: false, // marked below once all manifests are in hand
      manifest,
      ...(manifestError ? { manifest_error: manifestError } : {}),
      active_pursuits: snapshot.pursuits
        .filter((pu) => pu.lifecycle === 'active')
        .map((pu) => pu.id),
    })
  }

  // A member is a hub when the registry flags it, or when any member's
  // manifest names it as its hub (git-URL identity resolved through
  // the registry).
  const hubPaths = new Set<string>()
  for (const entry of reg.repos) {
    if (entry.hub) hubPaths.add(entryPath(entry))
  }
  for (const member of members) {
    const hubUrl = member.manifest?.hub
    if (!hubUrl) continue
    const entry = entryByGitUrl(reg, hubUrl)
    if (entry) hubPaths.add(entryPath(entry))
  }
  for (const member of members) member.hub = hubPaths.has(member.path)

  return { generated_from: root, members }
}
