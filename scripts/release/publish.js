// Publishes every package in packages/* under the given npm dist-tag.
// Prerelease versions may only go to "next" and stable versions only to "latest",
// so an alpha can never become the default install.
// Usage: node scripts/release/publish.js <next|latest> [extra pnpm publish flags]
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const [tag, ...extraArgs] = process.argv.slice(2);
const version = JSON.parse(readFileSync(join(ROOT, 'packages/inferno/package.json'), 'utf8')).version;
const isPrerelease = version.includes('-');

if (tag !== 'next' && tag !== 'latest') {
  console.error(`Unknown dist-tag "${tag}". Use "next" or "latest".`);
  process.exit(1);
}
if (tag === 'latest' && isPrerelease) {
  console.error(`${version} is a prerelease. Publish it with: npm run alpha`);
  process.exit(1);
}
if (tag === 'next' && !isPrerelease) {
  console.error(`${version} is not a prerelease. Publish it with: npm run release`);
  process.exit(1);
}

console.log(`Publishing ${version} under the "${tag}" tag`);
execFileSync('pnpm', ['publish', '-r', '--filter', './packages/*', '--tag', tag, '--access', 'public', ...extraArgs], {
  cwd: ROOT,
  stdio: 'inherit'
});
