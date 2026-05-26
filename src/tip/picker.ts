import { readLibrary, selectTip, type Tip } from './library.js'
import {
  isCategoryEligible,
  readTipState,
  recordCategoryShow,
  recordShow,
} from './state.js'

/**
 * Pick a tip eligible for the dashboard (`/cadence:status` + the
 * SessionStart hook). Returns the selected tip or null if the category
 * is on cool-down, no tip is eligible, or the library can't be read.
 *
 * The dashboard is the most frequent breakpoint in the system. The
 * default `coolDownDays: 1` gates the *category* — once a dashboard
 * tip fires, no other dashboard tip fires for ~24h — while the
 * per-tip `cool_down_days` in `library.yaml` (typically 14-30 days)
 * keeps individual tip variety high. That preserves the
 * "smart-colleague marginalia, not wallpaper" tone target while still
 * letting the surface refresh daily. See
 * `docs/teaching-tips-research.md` for the rationale.
 *
 * Side effects on success: records the per-tip show + the category
 * show, both via `recordShow` / `recordCategoryShow` in tip-state.json.
 * On failure (caught), returns null silently — surfacing a tip is
 * never load-bearing for the dashboard.
 */
export function pickDashboardTip(
  repoRoot: string,
  coolDownDays: number = 1,
): Tip | null {
  try {
    const state = readTipState(repoRoot)
    const categoryKey = 'status-marginalia'
    if (!isCategoryEligible(state, categoryKey, coolDownDays)) return null
    const library = readLibrary()
    const picked = selectTip(library, state, {
      triggers: ['verb-status', 'idle'],
      types: ['quote'],
    })
    if (!picked) return null
    recordShow(repoRoot, picked.tip.id)
    recordCategoryShow(repoRoot, categoryKey)
    return picked.tip
  } catch {
    return null
  }
}
