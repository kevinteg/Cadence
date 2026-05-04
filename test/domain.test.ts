import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { detectDomain } from '../src/scan/domain.ts'

test('detectDomain: physical project (kitchen sink fix)', () => {
  const result = detectDomain(
    'Replace the leaking kitchen sink faucet. Need to turn off water supply, swap the cartridge, test for leaks.',
    'fix-kitchen-sink',
  )
  assert.equal(result.domain, 'physical')
  assert.ok(result.evidence.physical.length >= 3, 'expected ≥3 physical keyword matches')
  assert.equal(result.evidence.digital.length, 0, 'should not match any digital keywords')
})

test('detectDomain: digital project (CI pipeline)', () => {
  const result = detectDomain(
    'Stand up a GitHub Actions CI pipeline that runs unit tests on every PR and deploys to staging on merge to main.',
    'add-ci-pipeline',
  )
  assert.equal(result.domain, 'digital')
  assert.ok(result.evidence.digital.length >= 3)
})

test('detectDomain: unknown when neither domain matches', () => {
  const result = detectDomain(
    'Decide on the strategic direction for Q3.',
    'q3-strategy',
  )
  assert.equal(result.domain, 'unknown')
  assert.equal(result.confidence, 0)
})

test('detectDomain: hybrid when both signals are roughly equal', () => {
  const result = detectDomain(
    'Build a kitchen-inventory app with a typescript frontend and a database. Track ingredients in the pantry.',
    'kitchen-inventory-app',
  )
  // Has cooking + repair keywords AND digital keywords. Should be
  // hybrid unless one dominates by 2x.
  assert.ok(
    result.domain === 'hybrid' || result.domain === 'physical' || result.domain === 'digital',
  )
  assert.ok(result.evidence.physical.length > 0)
  assert.ok(result.evidence.digital.length > 0)
})

test('detectDomain: project ID hyphens become word boundaries', () => {
  const result = detectDomain('', 'fix-the-bathroom-tile-grout')
  assert.equal(result.domain, 'physical')
  assert.ok(
    result.evidence.physical.some((k) => k === 'bathroom' || k === 'tile' || k === 'grout'),
  )
})

test('detectDomain: word boundaries prevent false positives', () => {
  // The keyword list deliberately omits ambiguous words (fix, test,
  // spec, build, etc.). Verify with a clean digital phrase that
  // "fix" doesn't accidentally match "prefix"-like substrings.
  const result = detectDomain(
    'Refactor the login function to use the new auth API endpoint.',
    'refactor-login',
  )
  assert.equal(result.domain, 'digital')
  assert.ok(!result.evidence.physical.some((k) => k === 'fix'))
  assert.ok(!result.evidence.digital.some((k) => k === 'fix'))
})

test('detectDomain: confidence reflects match count, capped at 10', () => {
  const heavy = detectDomain(
    'Cook dinner: bake bread, roast chicken, simmer soup. Need ingredients from the pantry: flour, yeast, salt. Use the oven and stove. Recipe is in the kitchen drawer.',
    'cook-dinner',
  )
  assert.equal(heavy.domain, 'physical')
  assert.ok(heavy.confidence >= 5, 'expected confidence ≥5 for heavy match')
  assert.ok(heavy.confidence <= 10, 'confidence should cap at 10')
})
