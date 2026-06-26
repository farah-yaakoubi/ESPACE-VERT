#!/usr/bin/env node
import { rm } from 'fs/promises';
import { join } from 'path';

const root = process.cwd();
const targets = ['.next', 'node_modules/.cache', '.turbo', '.vercel', 'dist'];

async function removeTarget(rel) {
  const p = join(root, rel);
  try {
    await rm(p, { recursive: true, force: true });
    console.log(`Removed ${rel}`);
  } catch (err) {
    // intentionally ignore errors for non-existent paths
  }
}

async function main() {
  for (const t of targets) {
    await removeTarget(t);
  }
  console.log('Clean complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
