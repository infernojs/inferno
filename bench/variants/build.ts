import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { REPO_DIR, REPO_NODE_MODULES, cachePath } from '../lib/paths.ts';
import { hashEntries, listFiles, readJson, run, sha256 } from '../lib/util.ts';
import { applyCanaries } from './inject.ts';
import { ANALYSIS_PLUGINS, analyzeModules } from './modules.ts';
import type { BaseSpec, VariantSpec } from './spec.ts';

/** Packages built for every variant, in dependency order. */
export const PACKAGES = ['inferno-shared', 'inferno-vnode-flags', 'inferno', 'inferno-hydrate', 'inferno-server'];

/** Packages fetched for npm variants; the others are bundled into these. */
const NPM_PACKAGES = ['inferno', 'inferno-hydrate', 'inferno-server'];

/** Bump whenever the build procedure changes in a way that affects output. */
const BUILD_REVISION = 3;

/** Repository build infrastructure reused verbatim (apart from sourcemap flags). */
const INFRA_FILES = [
  'scripts/rollup/build.js',
  'scripts/rollup/plugins/index.js',
  'scripts/rollup/plugins/alias.js',
  'scripts/babel/assumptions.json',
  'scripts/babel/targets.json',
  'tsconfig.json',
];

const TOOLCHAIN = [
  'typescript',
  'rollup',
  '@babel/core',
  '@rollup/plugin-babel',
  '@rollup/plugin-terser',
  '@rollup/plugin-replace',
  '@babel/plugin-transform-class-properties',
];

export type EntryKind = 'prod-esm' | 'dev-esm' | 'cjs' | 'min-cjs' | 'min-umd';

const ENTRY_CANDIDATES: Record<EntryKind, (pkg: string) => string[]> = {
  'prod-esm': () => ['dist/index.mjs', 'dist/index.esm.js'],
  'dev-esm': () => ['dist/index.dev.mjs', 'dist/index.dev.esm.js'],
  cjs: () => ['dist/index.cjs', 'dist/index.cjs.js'],
  'min-cjs': () => ['dist/index.min.cjs', 'dist/index.cjs.min.js'],
  'min-umd': (pkg) => [`dist/${pkg}.min.js`],
};

export interface FileInfo {
  bytes: number;
  sha256: string;
}

export interface VariantManifest {
  id: string;
  raw: string;
  hash: string;
  buildRevision: number;
  source:
    | { kind: 'local'; head: string; dirty: string[] }
    | { kind: 'src'; ref: string; commit: string }
    | { kind: 'npm'; version: string; integrity: Record<string, string> };
  toolchain?: Record<string, string>;
  canaries: VariantSpec['canaries'];
  injections?: { fn: string; kind: string; sites: number }[];
  packages: Record<string, { version: string; files: Record<string, FileInfo> }>;
  builtAt: string;
  buildLog?: string;
}

export interface BuiltVariant {
  spec: VariantSpec;
  dir: string;
  manifest: VariantManifest;
}

export function packageDir(variant: BuiltVariant, pkg: string): string {
  return join(variant.dir, 'packages', pkg);
}

export function entryFile(variant: BuiltVariant, pkg: string, kind: EntryKind): string | undefined {
  for (const rel of ENTRY_CANDIDATES[kind](pkg)) {
    const full = join(packageDir(variant, pkg), rel);
    if (existsSync(full)) {
      return full;
    }
  }
  return undefined;
}

/** Module aliases an app bundler needs to consume this variant. */
export function aliasEntries(variant: BuiltVariant, kind: EntryKind = 'prod-esm'): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pkg of Object.keys(variant.manifest.packages)) {
    const file = entryFile(variant, pkg, kind);
    if (file) {
      out[pkg] = file;
    }
  }
  return out;
}

function describeFiles(dir: string): Record<string, FileInfo> {
  const files: Record<string, FileInfo> = {};
  for (const rel of listFiles(dir)) {
    const buf = readFileSync(join(dir, rel));
    files[rel] = { bytes: buf.length, sha256: sha256(buf) };
  }
  return files;
}

function toolchainVersions(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of TOOLCHAIN) {
    const pkgJson = join(REPO_NODE_MODULES, name, 'package.json');
    out[name] = existsSync(pkgJson) ? readJson(pkgJson).version : 'missing';
  }
  return out;
}

async function git(args: string[]): Promise<string> {
  return (await run('git', ['-C', REPO_DIR, ...args])).stdout.trim();
}

/** Collects package.json + src/** of every built package for a source variant. */
async function collectSources(base: BaseSpec): Promise<{ files: Map<string, Buffer>; source: VariantManifest['source'] }> {
  const files = new Map<string, Buffer>();
  const paths = PACKAGES.flatMap((pkg) => [`packages/${pkg}/package.json`, `packages/${pkg}/src`]);
  if (base.kind === 'local') {
    for (const pkg of PACKAGES) {
      const pkgDir = join(REPO_DIR, 'packages', pkg);
      files.set(`packages/${pkg}/package.json`, readFileSync(join(pkgDir, 'package.json')));
      for (const rel of listFiles(join(pkgDir, 'src'))) {
        files.set(`packages/${pkg}/src/${rel}`, readFileSync(join(pkgDir, 'src', rel)));
      }
    }
    const head = await git(['rev-parse', 'HEAD']);
    const status = await git(['status', '--porcelain', '--', ...paths]);
    const dirty = status ? status.split('\n').map((l) => l.slice(3)) : [];
    return { files, source: { kind: 'local', head, dirty } };
  }
  if (base.kind === 'src') {
    const commit = await git(['rev-parse', '--verify', `${base.ref}^{commit}`]);
    const tmp = mkdtempSync(join(cachePath('tmp'), 'src-'));
    try {
      await run('sh', ['-c', `git -C "${REPO_DIR}" archive --format=tar ${commit} -- ${paths.join(' ')} | tar -x -C "${tmp}"`]);
      for (const rel of listFiles(tmp)) {
        files.set(rel, readFileSync(join(tmp, rel)));
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
    return { files, source: { kind: 'src', ref: base.ref, commit } };
  }
  throw new Error('collectSources only handles source variants');
}

/**
 * The official build runs the repository's infra untouched so dist output is
 * byte-identical to `pnpm run build`. Babel's `sourceMaps: true` changes blank
 * lines, so module attribution uses a separate analysis copy of the plugins.
 */
function analysisPlugins(content: Buffer): Buffer {
  return Buffer.from(content.toString('utf8').replace('sourceMaps: false', 'sourceMaps: true'));
}

function workTsconfig(): string {
  const root = readJson(join(REPO_DIR, 'tsconfig.json'));
  const paths: Record<string, string[]> = {};
  for (const pkg of PACKAGES) {
    paths[pkg] = [`./packages/${pkg}/src/index.ts`];
  }
  return JSON.stringify(
    {
      compilerOptions: { ...root.compilerOptions, paths, types: ['node'] },
      include: PACKAGES.map((pkg) => `packages/${pkg}/src`),
    },
    null,
    2,
  );
}

async function buildSourceVariant(spec: VariantSpec, log: (s: string) => void): Promise<BuiltVariant> {
  const { files, source } = await collectSources(spec.base);
  const infra = new Map<string, Buffer>();
  for (const rel of INFRA_FILES) {
    infra.set(rel, readFileSync(join(REPO_DIR, rel)));
  }
  const toolchain = toolchainVersions();
  const hash = hashEntries([
    ...files,
    ...infra,
    ['@toolchain', JSON.stringify(toolchain)],
    ['@revision', String(BUILD_REVISION)],
  ]);
  const dir = cachePath('variants', spec.baseId, hash.slice(0, 16));
  if (existsSync(join(dir, 'manifest.json'))) {
    return { spec, dir, manifest: readJson(join(dir, 'manifest.json')) };
  }

  log(`building ${spec.baseId} (${hash.slice(0, 12)})`);
  const work = mkdtempSync(join(cachePath('tmp'), `work-${spec.baseId}-`));
  try {
    for (const [rel, buf] of files) {
      mkdirSync(dirname(join(work, rel)), { recursive: true });
      writeFileSync(join(work, rel), buf);
    }
    for (const [rel, buf] of infra) {
      mkdirSync(dirname(join(work, rel)), { recursive: true });
      writeFileSync(join(work, rel), buf);
    }
    writeFileSync(join(work, ANALYSIS_PLUGINS), analysisPlugins(infra.get('scripts/rollup/plugins/index.js')!));
    writeFileSync(join(work, 'tsconfig.json'), workTsconfig());
    writeFileSync(join(work, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    symlinkSync(REPO_NODE_MODULES, join(work, 'node_modules'), 'dir');
    for (const pkg of PACKAGES) {
      // Package-local deps (e.g. csstype types for inferno).
      const pkgModules = join(REPO_DIR, 'packages', pkg, 'node_modules');
      if (existsSync(pkgModules)) {
        symlinkSync(pkgModules, join(work, 'packages', pkg, 'node_modules'), 'dir');
      }
    }

    const tsc = await run(process.execPath, [join(REPO_NODE_MODULES, 'typescript/bin/tsc'), '-p', 'tsconfig.json'], {
      cwd: work,
      allowFail: true,
    });
    let buildLog = '';
    if (tsc.code !== 0) {
      buildLog += `tsc exited with ${tsc.code}:\n${tsc.stdout}${tsc.stderr}\n`;
    }
    for (const pkg of PACKAGES) {
      const compiled = join(work, 'build/packages', pkg, 'src');
      if (!existsSync(join(compiled, 'index.js'))) {
        throw new Error(`tsc produced no output for ${pkg}\n${buildLog}`);
      }
      cpSync(compiled, join(work, 'packages', pkg, 'tmpDist'), { recursive: true });
    }
    const results = await Promise.all(
      PACKAGES.map((pkg) =>
        run(process.execPath, [join(work, 'scripts/rollup/build.js')], {
          cwd: join(work, 'packages', pkg),
          env: { ...process.env, NODE_ENV: 'production' },
        }),
      ),
    );
    buildLog += results.map((r) => r.stdout + r.stderr).join('');

    const staging = `${dir}.tmp-${process.pid}`;
    rmSync(staging, { recursive: true, force: true });
    mkdirSync(staging, { recursive: true });
    const modules = await analyzeModules(work, 'inferno');
    writeFileSync(join(staging, 'modules.json'), JSON.stringify(modules, null, 2));
    const packages: VariantManifest['packages'] = {};
    for (const pkg of PACKAGES) {
      const out = join(staging, 'packages', pkg);
      mkdirSync(out, { recursive: true });
      cpSync(join(work, 'packages', pkg, 'dist'), join(out, 'dist'), { recursive: true });
      cpSync(join(work, 'packages', pkg, 'package.json'), join(out, 'package.json'));
      packages[pkg] = { version: readJson(join(out, 'package.json')).version, files: describeFiles(join(out, 'dist')) };
    }
    const manifest: VariantManifest = {
      id: spec.baseId,
      raw: spec.raw,
      hash,
      buildRevision: BUILD_REVISION,
      source,
      toolchain,
      canaries: [],
      packages,
      builtAt: new Date().toISOString(),
      buildLog: buildLog || undefined,
    };
    writeFileSync(join(staging, 'manifest.json'), JSON.stringify(manifest, null, 2));
    if (existsSync(dir)) {
      rmSync(staging, { recursive: true, force: true });
    } else {
      mkdirSync(dirname(dir), { recursive: true });
      renameSync(staging, dir);
    }
    return { spec, dir, manifest: readJson(join(dir, 'manifest.json')) };
  } finally {
    if (!process.env.INFERNO_BENCH_KEEP_WORK) {
      rmSync(work, { recursive: true, force: true });
    }
  }
}

async function fetchNpmVariant(spec: VariantSpec, version: string, log: (s: string) => void): Promise<BuiltVariant> {
  const dir = cachePath('variants', spec.baseId, 'npm');
  if (existsSync(join(dir, 'manifest.json'))) {
    return { spec, dir, manifest: readJson(join(dir, 'manifest.json')) };
  }
  log(`fetching ${NPM_PACKAGES.map((p) => `${p}@${version}`).join(', ')}`);
  const staging = `${dir}.tmp-${process.pid}`;
  const tmp = mkdtempSync(join(cachePath('tmp'), 'npm-'));
  try {
    rmSync(staging, { recursive: true, force: true });
    const packages: VariantManifest['packages'] = {};
    const integrity: Record<string, string> = {};
    for (const pkg of NPM_PACKAGES) {
      const packed = await run('npm', ['pack', `${pkg}@${version}`, '--json', '--pack-destination', tmp]);
      const parsed = JSON.parse(packed.stdout);
      // npm < 11 prints an array, npm >= 11 an object keyed by package name.
      const info = Array.isArray(parsed) ? parsed[0] : Object.values<any>(parsed)[0];
      integrity[pkg] = info.integrity;
      const out = join(staging, 'packages', pkg);
      mkdirSync(out, { recursive: true });
      await run('tar', ['-xzf', join(tmp, info.filename), '-C', out, '--strip-components=1']);
      packages[pkg] = { version: readJson(join(out, 'package.json')).version, files: describeFiles(join(out, 'dist')) };
    }
    const manifest: VariantManifest = {
      id: spec.baseId,
      raw: spec.raw,
      hash: hashEntries(Object.entries(integrity)),
      buildRevision: BUILD_REVISION,
      source: { kind: 'npm', version, integrity },
      canaries: [],
      packages,
      builtAt: new Date().toISOString(),
    };
    writeFileSync(join(staging, 'manifest.json'), JSON.stringify(manifest, null, 2));
    mkdirSync(dirname(dir), { recursive: true });
    if (!existsSync(dir)) {
      renameSync(staging, dir);
    }
    return { spec, dir, manifest: readJson(join(dir, 'manifest.json')) };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
    rmSync(staging, { recursive: true, force: true });
  }
}

/** Builds (or reuses from cache) the variant described by `spec`. */
export async function ensureVariant(spec: VariantSpec, log: (s: string) => void = console.error): Promise<BuiltVariant> {
  mkdirSync(cachePath('tmp'), { recursive: true });
  const base =
    spec.base.kind === 'npm' ? await fetchNpmVariant(spec, spec.base.version, log) : await buildSourceVariant(spec, log);
  if (spec.canaries.length === 0) {
    return { ...base, spec };
  }
  return { ...applyCanaries(base, spec), spec };
}
