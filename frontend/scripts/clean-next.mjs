import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const targets = [
  path.join(root, ".next"),
  path.join(root, "tsconfig.tsbuildinfo"),
];

for (const target of targets) {
  fs.rmSync(target, { recursive: true, force: true });
}

console.log("Cleaned Next.js cache artifacts.");
