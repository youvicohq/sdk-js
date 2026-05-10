import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const releaseTypes = new Set(['patch', 'minor', 'major']);

export function nextVersion(version, releaseType) {
  if (!releaseTypes.has(releaseType)) {
    throw new Error(`Unsupported release type: ${releaseType}`);
  }

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

export async function readPackageJson(packagePath) {
  return JSON.parse(await readFile(packagePath, 'utf8'));
}

export async function writePackageJson(packagePath, packageJson) {
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

export async function findWorkspacePackages(rootDir = process.cwd()) {
  const packagesDir = resolve(rootDir, 'packages');
  const entries = await readdir(packagesDir, { withFileTypes: true });
  const packages = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const directory = join(packagesDir, entry.name);
    const packagePath = join(directory, 'package.json');
    try {
      const packageJson = await readPackageJson(packagePath);
      packages.push({
        directory,
        packagePath,
        packageJson,
        name: packageJson.name,
        private: packageJson.private === true
      });
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  return packages.sort((left, right) => left.name.localeCompare(right.name));
}

export async function findPublishablePackages(rootDir = process.cwd()) {
  const packages = await findWorkspacePackages(rootDir);
  return packages.filter(packageInfo => !packageInfo.private);
}

export async function setWorkspaceVersion(rootDir, version) {
  const rootPackagePath = resolve(rootDir, 'package.json');
  const rootPackageJson = await readPackageJson(rootPackagePath);
  rootPackageJson.version = version;
  await writePackageJson(rootPackagePath, rootPackageJson);

  const updatedPackagePaths = [rootPackagePath];
  for (const packageInfo of await findWorkspacePackages(rootDir)) {
    packageInfo.packageJson.version = version;
    await writePackageJson(packageInfo.packagePath, packageInfo.packageJson);
    updatedPackagePaths.push(packageInfo.packagePath);
  }

  return updatedPackagePaths;
}

export async function assertWorkspaceVersions(rootDir, version) {
  const mismatches = [];

  for (const packageInfo of await findWorkspacePackages(rootDir)) {
    if (packageInfo.packageJson.version !== version) {
      mismatches.push(`${packageInfo.name}: ${packageInfo.packageJson.version}`);
    }
  }

  if (mismatches.length > 0) {
    throw new Error(`Workspace package versions do not match ${version}: ${mismatches.join(', ')}`);
  }
}
