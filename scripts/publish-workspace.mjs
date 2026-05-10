import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { findPublishablePackages } from './release-utils.mjs';

const npmCache = process.env.npm_config_cache ?? mkdtempSync(join(tmpdir(), 'youvico-npm-cache-'));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: npmCache },
    stdio: 'inherit',
    ...options
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed in ${options.cwd ?? process.cwd()}`);
  }
}

const packages = await findPublishablePackages(process.cwd());

if (packages.length === 0) {
  throw new Error('No publishable packages found.');
}

for (const packageInfo of packages) {
  console.log(`Publishing ${packageInfo.name}@${packageInfo.packageJson.version}`);
  run('npm', ['publish', '--access', 'public', '--ignore-scripts'], { cwd: packageInfo.directory });
}
