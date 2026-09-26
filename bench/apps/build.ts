import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { rollup } from 'rollup';
import { type Transform, toolVersions, variantPlugins } from '../lib/bundle.ts';
import { cachePath } from '../lib/paths.ts';
import { hashEntries, listFiles, readJson, sha256 } from '../lib/util.ts';
import type { BuiltVariant } from '../variants/build.ts';
import { APPS_DIR, type AppDef, renderHtml } from './registry.ts';

export type { Transform };

export interface AppBuildOptions {
  transform: Transform;
  minify: boolean;
}

export interface AppManifest {
  app: string;
  variant: string;
  variantHash: string;
  options: AppBuildOptions;
  hash: string;
  files: Record<string, { bytes: number; sha256: string }>;
  warnings?: string[];
  builtAt: string;
}

export interface BuiltApp {
  app: AppDef;
  variant: BuiltVariant;
  dir: string;
  manifest: AppManifest;
}

/** Bump whenever the app build procedure changes output. */
const APP_BUILD_REVISION = 3;

/** All app sources; any change rebuilds every app (they share modules). */
export function appSources(): Map<string, Buffer> {
  const files = new Map<string, Buffer>();
  for (const rel of listFiles(APPS_DIR)) {
    if (/\.(jsx?|css|html)$/.test(rel)) {
      files.set(rel, readFileSync(join(APPS_DIR, rel)));
    }
  }
  return files;
}

export async function buildApp(app: AppDef, variant: BuiltVariant, options: AppBuildOptions): Promise<BuiltApp> {
  const hash = hashEntries([
    ...appSources(),
    ['@app', JSON.stringify(app) + '\0' + renderHtml(app)],
    ['@variant', variant.manifest.hash + '\0' + variant.spec.id],
    ['@options', JSON.stringify(options)],
    ['@tools', JSON.stringify(toolVersions())],
    ['@revision', String(APP_BUILD_REVISION)],
  ]);
  const flavour = `${options.transform}-${options.minify ? 'min' : 'nomin'}`;
  const dir = cachePath('apps', variant.spec.id, app.name, flavour, hash.slice(0, 16));
  if (existsSync(join(dir, 'manifest.json'))) {
    return { app, variant, dir, manifest: readJson(join(dir, 'manifest.json')) };
  }

  const warnings: string[] = [];
  const bundle = await rollup({
    input: join(APPS_DIR, app.entry),
    plugins: variantPlugins(variant, { ...options, include: [APPS_DIR] }),
    onwarn: (w) => warnings.push(w.message),
  });
  const staging = `${dir}.tmp-${process.pid}`;
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });
  try {
    await bundle.write({ file: join(staging, 'main.js'), format: 'iife', sourcemap: 'hidden' });
  } finally {
    await bundle.close();
  }
  writeFileSync(join(staging, 'index.html'), renderHtml(app));
  for (const asset of app.assets ?? []) {
    copyFileSync(join(APPS_DIR, asset), join(staging, basename(asset)));
  }
  const files: AppManifest['files'] = {};
  for (const rel of listFiles(staging)) {
    const buf = readFileSync(join(staging, rel));
    files[rel] = { bytes: buf.length, sha256: sha256(buf) };
  }
  const manifest: AppManifest = {
    app: app.name,
    variant: variant.spec.id,
    variantHash: variant.manifest.hash,
    options,
    hash,
    files,
    warnings: warnings.length ? warnings : undefined,
    builtAt: new Date().toISOString(),
  };
  writeFileSync(join(staging, 'manifest.json'), JSON.stringify(manifest, null, 2));
  if (existsSync(dir)) {
    rmSync(staging, { recursive: true, force: true });
  } else {
    mkdirSync(dirname(dir), { recursive: true });
    renameSync(staging, dir);
  }
  return { app, variant, dir, manifest: readJson(join(dir, 'manifest.json')) };
}
