# /run-journey

Run a user journey test. Parses a YAML journey file, executes all steps,
evaluates assertions, and reports pass/fail.

## Usage

- "/run-journey core-session-loop" — run a specific journey by name
- "/run-journey" — run all journeys in the `journeys/` directory

## Steps

1. **Resolve journey file(s)**:
   - If a name is given, look for `journeys/<name>.yaml`
   - If no name given, glob `journeys/*.yaml` and run all sequentially
   - If the file doesn't exist, report error and stop.

2. **Parse the YAML** and validate structure (setup, steps, teardown).

3. **Execute setup**:
   - For each setup operation, create the specified files:
     - `create_pursuit`: Write `pursuit.md` with frontmatter to
       `pursuits/<id>/pursuit.md`. Create `projects/` and `sessions/` dirs.
     - `create_project`: Write project file with frontmatter, DoD, and
       actions to `pursuits/<pursuit>/projects/<id>.md`.
   - If setup fails, report error and skip to teardown.

4. **Execute steps** sequentially. For each step:
   - If `command`: Execute the slash command as if the user typed it.
     Capture the output.
   - If `action`: Execute the natural language instruction (e.g., check
     off an action on a project file). This is an agent action, not a
     user command.
   - After execution, evaluate each assertion in `assert`:
     - `contains: "text"` — output includes the text
     - `not_contains: "text"` — output does NOT include the text
     - `file_contains` — specified file matches the pattern
     - `file_created` — a file matching the glob exists; if `frontmatter`
       is specified, verify those fields match
     - `assert_clean: <path>` — `git status <path>` shows no changes
   - Record result: PASS or FAIL (with details on what didn't match).
   - If a step fails, continue remaining steps (don't short-circuit)
     unless the failure makes subsequent steps impossible.

5. **Execute teardown**:
   - `delete_files`: Remove specified files/directories
   - `assert_clean`: Verify `git status` shows no untracked or modified
     files in the specified path
   - Teardown always runs, even if steps failed.

6. **Report results**:
   ```
   Journey: [name]
   Result: [PASS | FAIL]

   Steps:
   1. [step description] — PASS
   2. [step description] — FAIL
      Expected: [assertion]
      Got: [actual]
   3. [step description] — PASS

   Teardown: [CLEAN | DIRTY (details)]
   ```

7. If running multiple journeys, present a summary at the end:
   ```
   Journey Results:
   - core-session-loop: PASS
   - thought-capture: FAIL (step 3)

   [N/M journeys passed]
   ```
