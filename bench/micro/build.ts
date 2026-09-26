import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { type Plugin, rollup } from 'rollup';
import { appSources, type AppBuildOptions } from '../apps/build.ts';
import { APPS_DIR } from '../apps/registry.ts';
import { toolVersions, variantPlugins } from '../lib/bundle.ts';
import { BENCH_DIR, cachePath } from '../lib/paths.ts';
import { hashEntries, listFiles, readJson } from '../lib/util.ts';
import type { BuiltVariant } from '../variants/build.ts';

export const MICRO_DIR = join(BENCH_DIR, 'micro');
const MICRO_BUILD_REVISION = 2;

export type MicroRuntime = 'node' | 'd8';

export interface MicroBundle {
  variant: BuiltVariant;
  runtime: MicroRuntime;
  file: string;
  hash: string;
}

function microSources(): Map<string, Buffer> {
  const files = new Map<string, Buffer>();
  for (const dir of ['cases', 'd8']) {
    for (const rel of listFiles(join(MICRO_DIR, dir))) {
      files.set(`micro/${dir}/${rel}`, readFileSync(join(MICRO_DIR, dir, rel)));
    }
  }
  files.set('micro/dom-shim.js', readFileSync(join(MICRO_DIR, 'dom-shim.js')));
  return files;
}

function streamStub(): Plugin {
  const stub = join(MICRO_DIR, 'd8/stream-stub.js');
  return {
    name: 'd8-stream-stub',
    resolveId: (id) => (id === 'stream' ? stub : null),
  };
}

/**
 * Bundles micro/cases against a variant: one ESM file for Node (builtins
 * external, DOM installed by the worker) or one classic script for d8 (DOM shim
 * and driver included, Node's stream stubbed).
 */
export async function buildMicroBundle(
  variant: BuiltVariant,
  options: AppBuildOptions,
  runtime: MicroRuntime = 'node',
): Promise<MicroBundle> {
  const hash = hashEntries([
    ...microSources(),
    ...appSources(),
    ['@variant', variant.manifest.hash + '\0' + variant.spec.id],
    ['@options', JSON.stringify(options)],
    ['@tools', JSON.stringify(toolVersions())],
    ['@revision', String(MICRO_BUILD_REVISION)],
    ['@runtime', runtime],
  ]);
  const flavour = `${runtime}-${options.transform}-${options.minify ? 'min' : 'nomin'}`;
  const dir = cachePath('micro', variant.spec.id, flavour, hash.slice(0, 16));
  const fileName = runtime === 'd8' ? 'micro-d8.js' : 'micro.mjs';
  const file = join(dir, fileName);
  if (existsSync(file)) {
    return { variant, runtime, file, hash };
  }
  const plugins = variantPlugins(variant, { ...options, include: [APPS_DIR, MICRO_DIR] });
  const bundle = await rollup({
    input: join(MICRO_DIR, runtime === 'd8' ? 'd8/entry.js' : 'cases/index.js'),
    external: runtime === 'd8' ? [] : ['stream'],
    plugins: runtime === 'd8' ? [streamStub(), ...plugins] : plugins,
    onwarn: () => {},
  });
  const staging = `${dir}.tmp-${process.pid}`;
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });
  try {
    await bundle.write({ file: join(staging, fileName), format: runtime === 'd8' ? 'iife' : 'es', sourcemap: 'hidden' });
  } finally {
    await bundle.close();
  }
  writeFileSync(join(staging, 'manifest.json'), JSON.stringify({ variant: variant.spec.id, hash, options, runtime }, null, 2));
  if (existsSync(dir)) {
    rmSync(staging, { recursive: true, force: true });
  } else {
    mkdirSync(dirname(dir), { recursive: true });
    renameSync(staging, dir);
  }
  return { variant, runtime, file, hash: readJson(join(dir, 'manifest.json')).hash };
}
