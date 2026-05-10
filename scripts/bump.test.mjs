import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import assert from 'node:assert/strict';
import packageJson from '../package.json' with { type: 'json' };

const execFileAsync = promisify(execFile);

test('exposes pnpm bump as the release entrypoint', () => {
  assert.equal(packageJson.scripts.bump, 'node scripts/bump.mjs');
});

test('plans workspace versioning, release checks, push, and publish watch for a valid bump type', async () => {
  const { stdout } = await execFileAsync(
    process.execPath,
    ['scripts/bump.mjs', '--dry-run', 'minor'],
    { cwd: process.cwd() }
  );

  const plan = JSON.parse(stdout);

  assert.equal(plan.bump, 'minor');
  assert.deepEqual(plan.commands, [
    { command: 'git', args: ['status', '--porcelain'] },
    { command: 'git', args: ['branch', '--show-current'] },
    { command: 'node', args: ['scripts/bump.mjs', 'set-version', '<version>'] },
    { command: 'pnpm', args: ['install', '--lockfile-only'] },
    { command: 'pnpm', args: ['run', 'typecheck'] },
    { command: 'pnpm', args: ['run', 'lint'] },
    { command: 'pnpm', args: ['test'] },
    { command: 'pnpm', args: ['run', 'build'] },
    { command: 'node', args: ['scripts/pack-workspace.mjs'] },
    { command: 'git', args: ['add', 'package.json', 'pnpm-lock.yaml', 'packages/api/package.json'] },
    { command: 'git', args: ['commit', '-m', 'chore(release): v<version>'] },
    { command: 'git', args: ['tag', '-a', 'v<version>', '-m', 'v<version>'] },
    { command: 'git', args: ['push', 'origin', '<branch>', '--follow-tags'] },
    {
      command: 'gh',
      args: ['run', 'list', '--workflow', 'Publish', '--json', 'databaseId,headSha,status', '--limit', '20']
    },
    { command: 'gh', args: ['run', 'watch', '<run-id>', '--exit-status'] }
  ]);
});

test('rejects unsupported bump types', async () => {
  await assert.rejects(
    execFileAsync(
      process.execPath,
      ['scripts/bump.mjs', '--dry-run', 'premajor'],
      { cwd: process.cwd() }
    ),
    error => error.stderr.includes('Usage: pnpm bump <patch|minor|major>')
  );
});
