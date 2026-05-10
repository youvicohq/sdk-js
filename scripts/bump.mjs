#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import {
  assertWorkspaceVersions,
  findWorkspacePackages,
  nextVersion,
  readPackageJson,
  setWorkspaceVersion
} from './release-utils.mjs';

const VALID_BUMPS = new Set(['patch', 'minor', 'major']);
const WORKFLOW_NAME = 'Publish';
const USAGE = 'Usage: pnpm bump <patch|minor|major>';

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run');
  const args = argv.filter(arg => arg !== '--dry-run');
  const [bump] = args;

  if (args.length !== 1 || !VALID_BUMPS.has(bump)) {
    throw new Error(USAGE);
  }

  return { bump, dryRun };
}

async function releasePlan(rootDir, bump, version = '<version>', branch = '<branch>', runId = '<run-id>') {
  const packagePaths = await workspacePackagePaths(rootDir);

  return {
    bump,
    commands: [
      { command: 'git', args: ['status', '--porcelain'] },
      { command: 'git', args: ['branch', '--show-current'] },
      { command: 'node', args: ['scripts/bump.mjs', 'set-version', version] },
      { command: 'pnpm', args: ['install', '--lockfile-only'] },
      { command: 'pnpm', args: ['run', 'typecheck'] },
      { command: 'pnpm', args: ['run', 'lint'] },
      { command: 'pnpm', args: ['test'] },
      { command: 'pnpm', args: ['run', 'build'] },
      { command: 'node', args: ['scripts/pack-workspace.mjs'] },
      { command: 'git', args: ['add', 'package.json', 'pnpm-lock.yaml', ...packagePaths] },
      { command: 'git', args: ['commit', '-m', `chore(release): v${version}`] },
      { command: 'git', args: ['tag', '-a', `v${version}`, '-m', `v${version}`] },
      { command: 'git', args: ['push', 'origin', branch, '--follow-tags'] },
      {
        command: 'gh',
        args: ['run', 'list', '--workflow', WORKFLOW_NAME, '--json', 'databaseId,headSha,status', '--limit', '20']
      },
      { command: 'gh', args: ['run', 'watch', runId, '--exit-status'] }
    ]
  };
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: options.encoding,
    stdio: options.stdio ?? 'inherit'
  });

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `${command} ${args.join(' ')} failed`);
  }

  return result.stdout?.trim() ?? '';
}

async function workspacePackagePaths(rootDir) {
  const packages = await findWorkspacePackages(rootDir);
  return packages.map(packageInfo => packageInfo.packagePath.replace(`${rootDir}/`, ''));
}

async function setVersion(rootDir, version) {
  await setWorkspaceVersion(rootDir, version);
  await assertWorkspaceVersions(rootDir, version);
}

async function readWorkspaceVersion(rootDir) {
  const rootPackageJson = await readPackageJson(`${rootDir}/package.json`);
  await assertWorkspaceVersions(rootDir, rootPackageJson.version);
  return rootPackageJson.version;
}

function ensureCleanWorktree() {
  const status = run('git', ['status', '--porcelain'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit']
  });

  if (status.trim()) {
    throw new Error('Working tree must be clean before running pnpm bump.');
  }
}

function currentBranch() {
  const branch = run('git', ['branch', '--show-current'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit']
  });

  if (!branch) {
    throw new Error('Cannot publish from a detached HEAD.');
  }

  return branch;
}

function currentHeadSha() {
  return run('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit']
  });
}

function listPublishRuns() {
  const output = run('gh', [
    'run',
    'list',
    '--workflow',
    WORKFLOW_NAME,
    '--json',
    'databaseId,headSha,status',
    '--limit',
    '20'
  ], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit']
  });

  return JSON.parse(output);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForPublishRun(headSha) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const runInfo = listPublishRuns().find(runItem => runItem.headSha === headSha);
    if (runInfo) {
      return String(runInfo.databaseId);
    }

    await sleep(2_000);
  }

  throw new Error(`Could not find a ${WORKFLOW_NAME} workflow run for ${headSha}.`);
}

async function main() {
  const rootDir = process.cwd();

  try {
    if (process.argv[2] === 'set-version') {
      const version = process.argv[3];
      if (!version) {
        throw new Error('Usage: node scripts/bump.mjs set-version <version>');
      }
      await setVersion(rootDir, version);
      return;
    }

    const { bump, dryRun } = parseArgs(process.argv.slice(2));
    if (dryRun) {
      process.stdout.write(`${JSON.stringify(await releasePlan(rootDir, bump), null, 2)}\n`);
      return;
    }

    ensureCleanWorktree();
    const branch = currentBranch();
    const currentVersion = await readWorkspaceVersion(rootDir);
    const version = nextVersion(currentVersion, bump);
    const tag = `v${version}`;

    const packagePaths = await workspacePackagePaths(rootDir);
    run('node', ['scripts/bump.mjs', 'set-version', version]);
    run('pnpm', ['install', '--lockfile-only']);
    run('pnpm', ['run', 'typecheck']);
    run('pnpm', ['run', 'lint']);
    run('pnpm', ['test']);
    run('pnpm', ['run', 'build']);
    run('node', ['scripts/pack-workspace.mjs']);

    run('git', [
      'add',
      'package.json',
      'pnpm-lock.yaml',
      ...packagePaths
    ]);
    run('git', ['commit', '-m', `chore(release): ${tag}`]);
    run('git', ['tag', '-a', tag, '-m', tag]);

    const headSha = currentHeadSha();
    run('git', ['push', 'origin', branch, '--follow-tags']);

    const runId = await waitForPublishRun(headSha);
    run('gh', ['run', 'watch', runId, '--exit-status']);

    process.stdout.write(`${tag} published to npm and released on GitHub.\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.stderr.write(`${USAGE}\n`);
    process.exitCode = 1;
  }
}

await main();
