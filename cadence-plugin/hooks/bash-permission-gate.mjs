#!/usr/bin/env node
// PreToolUse gate: auto-allow Bash invocations of the plugin's own
// bundled CLI, so every skill's `cadence <subcommand>` call doesn't
// prompt the user one command-shape at a time.
//
// Deliberately conservative: only a single plain `cadence ...`
// invocation qualifies. Any shell composition — chaining, pipes,
// substitution, redirection, escapes — falls through to the normal
// permission flow, even when those characters appear inside quoted
// arguments. A denied prompt is annoying; an auto-allowed compound
// command would be a hole.
let raw = ''
process.stdin.on('data', (chunk) => (raw += chunk))
process.stdin.on('end', () => {
  let input
  try {
    input = JSON.parse(raw)
  } catch {
    process.exit(0)
  }
  if (input.tool_name !== 'Bash') process.exit(0)
  const command = String(input.tool_input?.command ?? '')
  const composition = /[;&|<>`$\\\n]/
  if (/^cadence(\s|$)/.test(command.trim()) && !composition.test(command)) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'allow',
          permissionDecisionReason:
            'cadence bundled CLI (auto-allowed by the cadence plugin gate)',
        },
      }) + '\n',
    )
  }
  process.exit(0)
})
