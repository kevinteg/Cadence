/**
 * Minimal ANSI helper. Two principles:
 *
 * 1. **Color is opt-in.** Callers pass `color: true` only when they
 *    know the consumer is a terminal that renders ANSI. The hook
 *    output (Claude Code consumes markdown) always passes `false`
 *    because ANSI escape codes break markdown table parsing.
 *
 * 2. **Respect `NO_COLOR`.** Even on a TTY, `NO_COLOR=1` in env wins.
 *    No detection magic inside the renderer — the CLI entrypoint
 *    decides once and threads the boolean through.
 */

const ESC = '\x1b['

function wrap(code: string, text: string, on: boolean): string {
  if (!on) return text
  return `${ESC}${code}m${text}${ESC}0m`
}

export function bold(text: string, on: boolean): string {
  return wrap('1', text, on)
}

export function dim(text: string, on: boolean): string {
  return wrap('2', text, on)
}

export function green(text: string, on: boolean): string {
  return wrap('32', text, on)
}

export function yellow(text: string, on: boolean): string {
  return wrap('33', text, on)
}

export function blue(text: string, on: boolean): string {
  return wrap('34', text, on)
}

export function magenta(text: string, on: boolean): string {
  return wrap('35', text, on)
}

export function cyan(text: string, on: boolean): string {
  return wrap('36', text, on)
}

export function gray(text: string, on: boolean): string {
  return wrap('90', text, on)
}

/**
 * Color a status badge consistently across the dashboard. `active` is
 * green (in motion), `on hold` is yellow (paused but live), `done` is
 * gray (terminal), `diverging`/`converging` are blue/magenta to mark
 * brainstorms apart from projects.
 */
export function statusBadge(status: string, on: boolean): string {
  switch (status) {
    case 'active':
      return green(status, on)
    case 'on_hold':
    case 'on hold':
      return yellow('on hold', on)
    case 'done':
      return gray(status, on)
    case 'dropped':
      return gray(status, on)
    case 'diverging':
      return blue(status, on)
    case 'converging':
      return magenta(status, on)
    default:
      return status
  }
}

/**
 * Decide whether to enable color for the bare CLI based on the
 * runtime environment. Hook output always passes `false` directly —
 * this helper is just for the bare `cadence status` path.
 */
export function shouldEnableColor(): boolean {
  if (process.env.NO_COLOR) return false
  if (process.env.FORCE_COLOR) return true
  return Boolean(process.stdout.isTTY)
}
