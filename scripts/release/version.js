// Bumps every package in packages/* to the same version, then builds, rebuilds docs,
// tests and commits + tags the result. Publish afterwards with `npm run alpha` or `npm run release`.
// Usage: npm run version [-- <version>]
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { createInterface } from 'readline/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;

function run(cmd, args) {
  execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' });
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (git(['status', '--porcelain'])) {
  fail('Working tree is not clean. Commit or stash your changes before bumping the version.');
}

const current = JSON.parse(readFileSync(join(ROOT, 'packages/inferno/package.json'), 'utf8')).version;
let version = process.argv[2];

if (!version) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  version = await rl.question(`Current version is ${current}. New version (e.g. 9.1.1 or 9.1.1-alpha.0): `);
  rl.close();
}
version = version.trim().replace(/^v/, '');

if (!SEMVER.test(version)) {
  fail(`"${version}" is not a valid version.`);
}
if (version === current) {
  fail(`Packages are already at ${version}.`);
}
if (git(['tag', '--list', `v${version}`])) {
  fail(`Tag v${version} already exists.`);
}

run('pnpm', ['-r', '--filter', './packages/*', 'version', version]);
run('pnpm', ['run', 'build']);
run('pnpm', ['run', 'docs-build']);
run('pnpm', ['run', 'test']);

run('git', ['add', '--', 'packages/*/package.json', 'pnpm-lock.yaml', 'docs']);
run('git', ['commit', '-m', `v${version}`]);
run('git', ['tag', '-a', `v${version}`, '-m', `v${version}`]);

console.log(`\nCommitted and tagged v${version}. Publish with: npm run ${version.includes('-') ? 'alpha' : 'release'}`);
console.log('Push with: git push --follow-tags');
