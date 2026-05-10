import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { resolve } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';

const releaseType = process.argv[2];
const packagePath = resolve('packages/api/package.json');

if (!['patch', 'minor', 'major'].includes(releaseType)) {
  console.error('Usage: pnpm publish:api patch|minor|major');
  process.exit(1);
}

function run(command, args, capture = false) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `${command} ${args.join(' ')} failed`);
  }

  return result.stdout?.trim() ?? '';
}

function nextVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Invalid package version: ${version}`);
  }

  const [major, minor, patch] = match.slice(1).map(Number);
  if (releaseType === 'major') {
    return `${major + 1}.0.0`;
  }
  if (releaseType === 'minor') {
    return `${major}.${minor + 1}.0`;
  }
  return `${major}.${minor}.${patch + 1}`;
}

if (run('git', ['status', '--porcelain'], true)) {
  throw new Error('Working tree must be clean before publishing.');
}

const branch = run('git', ['branch', '--show-current'], true);
if (!branch) {
  throw new Error('Cannot publish from a detached HEAD.');
}

const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const currentVersion = packageJson.version;
const plannedVersion = nextVersion(currentVersion);
const tag = `v${plannedVersion}`;

if (tag.slice(1) !== plannedVersion) {
  throw new Error(`Tag ${tag} does not match package version ${plannedVersion}.`);
}

if (run('git', ['tag', '--list', tag], true)) {
  throw new Error(`Local tag ${tag} already exists.`);
}

const remoteTag = spawnSync('git', ['ls-remote', '--exit-code', '--tags', 'origin', `refs/tags/${tag}`], {
  stdio: 'ignore',
});
if (remoteTag.status === 0) {
  throw new Error(`Remote tag ${tag} already exists.`);
}

console.log(`@youvico/api ${releaseType} release: ${currentVersion} -> ${plannedVersion}`);
console.log(`Tag to push: ${tag}`);

const readline = createInterface({ input, output });
const answer = await readline.question('Publish this version through GitHub Actions? Type yes to continue: ');
readline.close();

if (answer.trim() !== 'yes') {
  console.log('Publish cancelled.');
  process.exit(1);
}

packageJson.version = plannedVersion;
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

const actualVersion = JSON.parse(readFileSync(packagePath, 'utf8')).version;
if (actualVersion !== tag.slice(1)) {
  throw new Error(`Tag ${tag} does not match package version ${actualVersion}.`);
}

run('git', ['add', packagePath]);
run('git', ['commit', '-m', `Release @youvico/api ${tag}`]);
run('git', ['tag', '-a', tag, '-m', `Release @youvico/api ${tag}`]);
run('git', ['push', 'origin', branch, tag]);

console.log(`Pushed ${tag}. GitHub Actions will publish @youvico/api ${actualVersion} to npm.`);
