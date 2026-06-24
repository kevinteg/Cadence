/**
 * Host-aware verb prefix for human-readable CLI output.
 *
 * The bundled `cadence` CLI is shared verbatim across agent hosts, but its
 * human-facing hint strings name verbs with the Claude Code namespace
 * (`/cadence:status`). Under Auggie the namespace is flat (`/cadence-status`).
 *
 * Rather than thread a prefix through ~80 scattered render sites (and risk the
 * Claude Code path), we install a single, opt-in stdout filter: when
 * `CADENCE_VERB_PREFIX` is set to something other than the default, human output
 * has `/cadence:` swapped for that prefix on the way out. It is a no-op when the
 * env var is unset (the Claude Code default), and it never touches `--json`
 * output (structured data must pass through byte-for-byte).
 */

const DEFAULT_PREFIX = '/cadence:'

export function installVerbPrefixFilter(argv: string[]): void {
  const prefix = process.env.CADENCE_VERB_PREFIX
  if (!prefix || prefix === DEFAULT_PREFIX) return
  if (argv.includes('--json')) return // never rewrite structured output

  const original = process.stdout.write.bind(process.stdout)
  process.stdout.write = ((chunk: unknown, ...rest: unknown[]) => {
    if (typeof chunk === 'string') {
      chunk = chunk.split(DEFAULT_PREFIX).join(prefix)
    }
    // @ts-expect-error — passthrough of cac/node's variadic write signature
    return original(chunk, ...rest)
  }) as typeof process.stdout.write
}
