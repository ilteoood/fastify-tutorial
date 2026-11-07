#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const FORK_DIR = 'vendor/tutorialkit';
const PACKAGES = ['types', 'theme', 'runtime', 'react', 'astro'];

if (!existsSync(FORK_DIR)) {
  console.error(`The fork is missing. Run "pnpm run setup" first, then "pnpm install".`);

  process.exit(1);
}

const built = PACKAGES.every((name) => existsSync(`${FORK_DIR}/packages/${name}/dist`));

if (built) {
  process.exit(0);
}

console.log('Building the tutorialkit packages from the fork');

const result = spawnSync('pnpm', ['--filter', '@tutorialkit/*', 'build'], { stdio: 'inherit' });

process.exit(result.status ?? 1);
