import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtempSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { findWorkspacePackages, nextVersion, setWorkspaceVersion } from './release-utils.mjs';

test('nextVersion increments semantic versions', () => {
  assert.equal(nextVersion('1.1.0', 'patch'), '1.1.1');
  assert.equal(nextVersion('1.1.0', 'minor'), '1.2.0');
  assert.equal(nextVersion('1.1.0', 'major'), '2.0.0');
});

test('nextVersion rejects unsupported release types', () => {
  assert.throws(() => nextVersion('1.1.0', 'beta'), /Unsupported release type/);
});

test('findWorkspacePackages returns packages in packages directory', async () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'youvico-release-'));
  await writePackage(rootDir, { name: '@youvico', version: '1.1.0', private: true });
  await writePackage(join(rootDir, 'packages/api'), { name: '@youvico/api', version: '1.1.0' });
  await writePackage(join(rootDir, 'packages/socket'), { name: '@youvico/socket', version: '1.1.0' });

  const packages = await findWorkspacePackages(rootDir);

  assert.deepEqual(
    packages.map(packageInfo => packageInfo.name),
    ['@youvico/api', '@youvico/socket']
  );
});

test('setWorkspaceVersion updates root and package versions together', async () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'youvico-release-'));
  await writePackage(rootDir, { name: '@youvico', version: '1.1.0', private: true });
  await writePackage(join(rootDir, 'packages/api'), { name: '@youvico/api', version: '1.1.0' });
  await writePackage(join(rootDir, 'packages/socket'), { name: '@youvico/socket', version: '1.1.0', private: true });

  await setWorkspaceVersion(rootDir, '1.2.0');

  assert.equal((await readPackage(rootDir)).version, '1.2.0');
  assert.equal((await readPackage(join(rootDir, 'packages/api'))).version, '1.2.0');
  assert.equal((await readPackage(join(rootDir, 'packages/socket'))).version, '1.2.0');
});

async function writePackage(directory, packageJson) {
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);
}

async function readPackage(directory) {
  return JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
}
