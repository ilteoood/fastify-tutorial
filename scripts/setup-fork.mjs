#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const FORK_URL = 'https://github.com/ilteoood/tutorialkit.git';
const FORK_REF = 'v2.0.0';
const FORK_DIR = 'vendor/tutorialkit';

function git(args, cwd) {
  const result = spawnSync('git', args, { cwd, stdio: 'inherit' });

  if (result.error) {
    console.error(`Cannot run git: ${result.error.message}`);

    process.exit(1);
  }

  return result.status === 0;
}

if (!existsSync(FORK_DIR)) {
  console.log(`Cloning ${FORK_URL} (${FORK_REF}) into ${FORK_DIR}`);

  if (!git(['clone', '--depth', '1', '--branch', FORK_REF, FORK_URL, FORK_DIR])) {
    process.exit(1);
  }
} else {
  console.log(`Updating ${FORK_DIR} to ${FORK_REF}`);

  if (!git(['fetch', '--depth', '1', 'origin', FORK_REF], FORK_DIR)) {
    process.exit(1);
  }

  if (!git(['checkout', '--force', 'FETCH_HEAD'], FORK_DIR)) {
    process.exit(1);
  }
}

console.log('The fork is in place. Run "pnpm install" next.');
