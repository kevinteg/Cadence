import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import yaml from 'js-yaml'
import { z } from 'zod'
import { expandHome, normalizeGitUrl } from './publish.js'
import { isCadenceRepo } from './root.js'

/**
 * Per-machine registry of known Cadence repos, at
 * `$XDG_CONFIG_HOME/cadence/repos.yaml` (default
 * `~/.config/cadence/repos.yaml`).
 *
 * This file is a deliberate exception to the "all data lives in the
 * repo" rule: it holds machine-local *paths only* — names, locations,
 * and hub markers — never pursuit/project content, and it is never
 * synced between machines. Identity for cross-repo features
 * (delegation, fleet) is the git URL; the registry maps identities to
 * where the checkouts live on THIS machine.
 *
 * Entries are hints, not authority: consumers validate the path with
 * isCadenceRepo() before use, so a stale entry fails safe.
 */

export const RegistryEntrySchema = z.object({
  /** Short unique name, usable as `--root <name>`. */
  name: z.string(),
  /** Path to the local checkout; `~` expands. */
  path: z.string(),
  /** Hub repos aggregate delegated pursuits from spoke repos. */
  hub: z.boolean().optional(),
  /** Git URL identity, for matching `delegated_to` / manifest `hub`. */
  git_url: z.string().optional(),
})
export type RegistryEntry = z.infer<typeof RegistryEntrySchema>

export const RegistrySchema = z.object({
  repos: z.array(RegistryEntrySchema).optional().default([]),
  /** Name of the repo guest-mode captures route to by default. */
  default: z.string().optional(),
})
export type Registry = z.infer<typeof RegistrySchema>

export function registryPath(): string {
  const override = process.env['CADENCE_REGISTRY_PATH']
  if (override) return path.resolve(expandHome(override))
  const xdg = process.env['XDG_CONFIG_HOME']
  const base =
    xdg && xdg.length > 0
      ? path.resolve(expandHome(xdg))
      : path.join(os.homedir(), '.config')
  return path.join(base, 'cadence', 'repos.yaml')
}

/** Missing file is legal — an empty registry. Parse errors throw. */
export function loadRegistry(): Registry {
  const file = registryPath()
  let text: string
  try {
    text = readFileSync(file, 'utf8')
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { repos: [] }
    }
    throw err
  }
  const parsed = yaml.load(text, { schema: yaml.CORE_SCHEMA }) ?? {}
  try {
    return RegistrySchema.parse(parsed)
  } catch (err) {
    throw new Error(`Malformed registry at ${file}: ${String(err)}`)
  }
}

export function saveRegistry(registry: Registry): string {
  const file = registryPath()
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, yaml.dump(registry, { lineWidth: 100 }), 'utf8')
  return file
}

export function entryByName(
  registry: Registry,
  name: string,
): RegistryEntry | undefined {
  return registry.repos.find((r) => r.name === name)
}

/** Match an entry by git-URL identity (normalized host/owner/repo). */
export function entryByGitUrl(
  registry: Registry,
  gitUrl: string,
): RegistryEntry | undefined {
  const wanted = normalizeGitUrl(gitUrl)
  return registry.repos.find(
    (r) => r.git_url && normalizeGitUrl(r.git_url) === wanted,
  )
}

/** Absolute, ~-expanded path of an entry. */
export function entryPath(entry: RegistryEntry): string {
  return path.resolve(expandHome(entry.path))
}

/** Validated view of an entry for rendering / JSON output. */
export function entryStatus(entry: RegistryEntry): {
  exists: boolean
  initialized: boolean
} {
  const p = entryPath(entry)
  const exists = existsSync(p)
  return { exists, initialized: exists && isCadenceRepo(p) }
}

/**
 * The repo guest-mode routes to when none is named: the explicit
 * `default`, else the sole entry, else the sole hub, else null.
 */
export function defaultEntry(registry: Registry): RegistryEntry | null {
  if (registry.default) {
    return entryByName(registry, registry.default) ?? null
  }
  if (registry.repos.length === 1) return registry.repos[0] ?? null
  const hubs = registry.repos.filter((r) => r.hub)
  if (hubs.length === 1) return hubs[0] ?? null
  return null
}
