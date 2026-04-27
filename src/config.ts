import { readFile } from 'node:fs/promises'
import path from 'node:path'
import yaml from 'js-yaml'
import {
  type Config,
  CONFIG_DEFAULTS,
  ConfigSchema,
  type RawConfig,
} from './types.js'

/**
 * Reads cadence.yaml from the repo root, applies defaults, and returns a
 * flat Config object. Missing file is fine — defaults apply.
 */
export async function loadConfig(repoRoot: string): Promise<Config> {
  const configPath = path.join(repoRoot, 'cadence.yaml')
  let raw: RawConfig = ConfigSchema.parse({})
  try {
    const text = await readFile(configPath, 'utf8')
    const parsed = yaml.load(text, { schema: yaml.CORE_SCHEMA }) ?? {}
    raw = ConfigSchema.parse(parsed)
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
  }
  return mergeDefaults(raw)
}

function mergeDefaults(raw: RawConfig): Config {
  const d = raw.defaults ?? {}
  const wip = raw.wip_limits ?? {}
  const reflect = raw.reflect ?? {}
  const wc = raw.win_cycles ?? {}
  return {
    marker_stale_days:
      d.marker_stale_days ?? CONFIG_DEFAULTS.marker_stale_days,
    waiting_for_grace_days:
      d.waiting_for_grace_days ?? CONFIG_DEFAULTS.waiting_for_grace_days,
    dormant_days: d.dormant_days ?? CONFIG_DEFAULTS.dormant_days,
    max_active_projects:
      wip.max_active_projects ?? CONFIG_DEFAULTS.max_active_projects,
    someday_review: d.someday_review ?? CONFIG_DEFAULTS.someday_review,
    reflect_day: reflect.day ?? CONFIG_DEFAULTS.reflect_day,
    reflect_duration_minutes:
      reflect.duration_minutes ?? CONFIG_DEFAULTS.reflect_duration_minutes,
    win_cycle_current: wc.current,
    win_cycle_start: wc.start,
    win_cycle_end: wc.end,
    win_cycle_mid_check: wc.mid_check,
  }
}
