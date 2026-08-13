import { rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const targets = [".next", "tsconfig.tsbuildinfo"];

for (const target of targets) {
  const fullPath = path.resolve(root, target);
  if (!fullPath.startsWith(root + path.sep)) {
    throw new Error(`Refusing to remove path outside project: ${fullPath}`);
  }

  await rm(fullPath, { recursive: true, force: true });
  console.log(`Removed ${target}`);
}
