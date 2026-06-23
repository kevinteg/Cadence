import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { normalizeGitUrl, discoverCheckout } from '../src/publish.ts'

function git(dir: string, args: string[]): void {
  execFileSync('git', ['-C', dir, ...args], { stdio: 'ignore' })
}

test('normalizeGitUrl collapses the equivalent spellings of one repo', () => {
  const forms = [
    'git@github.com:org/repo.git',
    'git@github.com:org/repo',
    'https://github.com/org/repo.git',
    'https://github.com/org/repo',
    'ssh://git@github.com/org/repo.git',
  ]
  for (const f of forms) {
    assert.equal(normalizeGitUrl(f), 'github.com/org/repo', `failed for ${f}`)
  }
})

test('normalizeGitUrl lowercases host/owner/repo and trims trailing slash', () => {
  assert.equal(
    normalizeGitUrl('https://GitHub.com/Org/Repo/'),
    'github.com/org/repo',
  )
})

test('discoverCheckout finds a sibling checkout by matching its remote', () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'cad-pub-'))
  try {
    const workspace = path.join(tmp, 'workspace')
    const cadenceRepo = path.join(workspace, 'cadence')
    const teamWiki = path.join(workspace, 'team-wiki')
    mkdirSync(cadenceRepo, { recursive: true })
    mkdirSync(teamWiki, { recursive: true })
    git(teamWiki, ['init', '-q'])
    git(teamWiki, ['remote', 'add', 'origin', 'git@github.com:org/team-wiki.git'])

    // Target spells the URL in https form — discovery should still match.
    const res = discoverCheckout(cadenceRepo, {
      name: 'team-wiki',
      git_url: 'https://github.com/org/team-wiki',
      discovery_hints: [],
    })
    assert.equal(res.checkout, teamWiki)
    assert.equal(res.matched_remote, 'git@github.com:org/team-wiki.git')
    assert.equal(res.clean, true)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})

test('discoverCheckout returns null (with searched dirs) when no remote matches', () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'cad-pub-'))
  try {
    const workspace = path.join(tmp, 'workspace')
    const cadenceRepo = path.join(workspace, 'cadence')
    const other = path.join(workspace, 'unrelated')
    mkdirSync(cadenceRepo, { recursive: true })
    mkdirSync(other, { recursive: true })
    git(other, ['init', '-q'])
    git(other, ['remote', 'add', 'origin', 'git@github.com:org/something-else.git'])

    const res = discoverCheckout(cadenceRepo, {
      name: 'team-wiki',
      git_url: 'https://github.com/org/team-wiki',
      discovery_hints: [],
    })
    assert.equal(res.checkout, null)
    assert.ok(res.searched.includes(workspace))
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})

test('discoverCheckout accepts an explicit checkout path via extraSearchDirs', () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'cad-pub-'))
  try {
    // checkout lives somewhere that is NOT a sibling of the cadence repo
    const cadenceRepo = path.join(tmp, 'somewhere', 'cadence')
    const dest = path.join(tmp, 'elsewhere', 'team-wiki')
    mkdirSync(cadenceRepo, { recursive: true })
    mkdirSync(dest, { recursive: true })
    git(dest, ['init', '-q'])
    git(dest, ['remote', 'add', 'origin', 'git@github.com:org/team-wiki.git'])

    const target = {
      name: 'team-wiki',
      git_url: 'https://github.com/org/team-wiki',
      discovery_hints: [],
    }
    // Without the hint, it's not found.
    assert.equal(discoverCheckout(cadenceRepo, target).checkout, null)
    // With the explicit path, it resolves.
    const res = discoverCheckout(cadenceRepo, target, [dest])
    assert.equal(res.checkout, dest)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})
