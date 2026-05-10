import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  assertWorkspaceVersions,
  findWorkspacePackages,
  nextVersion,
  readPackageJson,
  setWorkspaceVersion
} from './release-utils.mjs';

const releaseType = process.argv[2];
const rootDir = process.cwd();
const rootPackagePath = 'package.json';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    ...options
  });

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `${command} ${args.join(' ')} failed`);
  }

  return result.stdout?.trim() ?? '';
}

if (!releaseType) {
  console.error('Usage: pnpm bump patch|minor|major');
  process.exit(1);
}

if (run('git', ['status', '--porcelain'], { capture: true })) {
  throw new Error('Working tree must be clean before publishing.');
}

const branch = run('git', ['branch', '--show-current'], { capture: true });
if (!branch) {
  throw new Error('Cannot publish from a detached HEAD.');
}

const rootPackageJson = await readPackageJson(rootPackagePath);
const currentVersion = rootPackageJson.version;
await assertWorkspaceVersions(rootDir, currentVersion);

const plannedVersion = nextVersion(currentVersion, releaseType);
const tag = `v${plannedVersion}`;
const packages = await findWorkspacePackages(rootDir);

if (run('git', ['tag', '--list', tag], { capture: true })) {
  throw new Error(`Local tag ${tag} already exists.`);
}

const remoteTag = spawnSync('git', ['ls-remote', '--exit-code', '--tags', 'origin', `refs/tags/${tag}`], {
  stdio: 'ignore'
});
if (remoteTag.status === 0) {
  throw new Error(`Remote tag ${tag} already exists.`);
}

console.log(`YouViCo JS ${releaseType} release: ${currentVersion} -> ${plannedVersion}`);
console.log(`Tag to push: ${tag}`);
console.log(`Packages to version: ${packages.map(packageInfo => packageInfo.name).join(', ')}`);

const readline = createInterface({ input, output });
const answer = await readline.question('Publish this version through GitHub Actions? Type yes to continue: ');
readline.close();

if (answer.trim() !== 'yes') {
  console.log('Publish cancelled.');
  process.exit(1);
}

const updatedPackagePaths = await setWorkspaceVersion(rootDir, plannedVersion);
await assertWorkspaceVersions(rootDir, plannedVersion);

run('git', ['add', ...updatedPackagePaths]);
run('git', ['commit', '-m', `Release ${tag}`]);
run('git', ['tag', '-a', tag, '-m', `Release ${tag}`]);
run('git', ['push', 'origin', branch, tag]);

console.log(`Pushed ${tag}. GitHub Actions will publish workspace packages at ${plannedVersion} to npm.`);
