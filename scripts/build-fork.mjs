#!/usr/bin/env node
import { readdirSync, rmSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const FORK_DIR = 'vendor/tutorialkit';
const PACKAGES = ['types', 'theme', 'runtime', 'react', 'astro'];

if (!existsSync(FORK_DIR)) {
  console.error('The fork is missing. Run "pnpm run setup" first, then "pnpm install".');

  process.exit(1);
}

const built = PACKAGES.every((name) => existsSync(`${FORK_DIR}/packages/${name}/dist`));

if (built) {
  process.exit(0);
}

for (const name of PACKAGES) {
  const dir = `${FORK_DIR}/packages/${name}`;

  for (const file of readdirSync(dir).filter((entry) => entry.endsWith('.tsbuildinfo'))) {
    rmSync(`${dir}/${file}`);
  }
}

console.log('Building the tutorialkit packages from the fork');

const result = spawnSync('pnpm', ['--filter', '@tutorialkit/*', 'build'], { stdio: 'inherit' });

process.exit(result.status ?? 1);
