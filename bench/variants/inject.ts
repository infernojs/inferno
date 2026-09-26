import { cpSync, existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { readJson, sha256 } from '../lib/util.ts';
import type { BuiltVariant, VariantManifest } from './build.ts';
import { entryFile, packageDir } from './build.ts';
import type { Canary, VariantSpec } from './spec.ts';
import { canaryId } from './spec.ts';

/** Every canary bumps this global so measurements can divide by the call count. */
export const CANARY_COUNTER = '__infernoCanaryCalls';

function snippet(c: Canary): string {
  const count = `globalThis.${CANARY_COUNTER}=(globalThis.${CANARY_COUNTER}|0)+1;`;
  switch (c.kind) {
    case 'spin':
      return `${count}{var e$c=performance.now()+${c.micros / 1000};while(performance.now()<e$c);}`;
    case 'alloc':
      return `${count}globalThis.__infernoCanarySink=new Array(${c.elements}).fill(0);`;
    case 'domop':
      return `${count}(document.body||document.documentElement).setAttribute('data-inferno-canary',''+globalThis.${CANARY_COUNTER});`;
  }
}

/**
 * Inserts `code` as the first statement of the function declaration named `fn`.
 * Throws unless exactly one declaration exists, so a renamed function can't
 * silently turn a canary into a no-op.
 */
export function injectIntoFunction(source: string, fn: string, code: string): string {
  const re = new RegExp(`function\\s+${fn.replace(/\$/g, '\\$')}\\s*\\(`, 'g');
  const matches = [...source.matchAll(re)];
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one declaration of function ${fn}, found ${matches.length}`);
  }
  let i = matches[0].index! + matches[0][0].length;
  let depth = 1;
  while (depth > 0 && i < source.length) {
    const ch = source[i++];
    if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
    }
  }
  const brace = source.indexOf('{', i);
  if (brace === -1 || source.slice(i, brace).trim() !== '') {
    throw new Error(`Could not locate the body of function ${fn}`);
  }
  return source.slice(0, brace + 1) + code + source.slice(brace + 1);
}

export function applyCanaries(base: BuiltVariant, spec: VariantSpec): BuiltVariant {
  // Keyed by canaries only (not the @tag) so A/A copies share one build.
  const dir = `${base.dir}+${spec.canaries.map(canaryId).join('+')}`;
  if (existsSync(join(dir, 'manifest.json'))) {
    return { spec, dir, manifest: readJson(join(dir, 'manifest.json')) };
  }
  const staging = `${dir}.tmp-${process.pid}`;
  rmSync(staging, { recursive: true, force: true });
  cpSync(base.dir, staging, { recursive: true });
  const stagedVariant: BuiltVariant = { ...base, dir: staging };
  const target = entryFile(stagedVariant, 'inferno', 'prod-esm');
  if (!target) {
    throw new Error(`Variant ${base.spec.id} has no prod ESM bundle to inject into`);
  }
  let code = readFileSync(target, 'utf8');
  const injections: NonNullable<VariantManifest['injections']> = [];
  for (const c of spec.canaries) {
    code = injectIntoFunction(code, c.fn, snippet(c));
    injections.push({ fn: c.fn, kind: c.kind, sites: 1 });
  }
  writeFileSync(target, code);
  // The unminified map no longer lines up with the injected bundle.
  rmSync(`${target}.map`, { force: true });

  const manifest: VariantManifest = structuredClone(base.manifest);
  manifest.id = spec.id;
  manifest.raw = spec.raw;
  manifest.canaries = spec.canaries;
  manifest.injections = injections;
  const rel = relative(join(packageDir(stagedVariant, 'inferno'), 'dist'), target);
  const buf = readFileSync(target);
  manifest.packages.inferno.files[rel] = { bytes: buf.length, sha256: sha256(buf) };
  delete manifest.packages.inferno.files[`${rel}.map`];
  writeFileSync(join(staging, 'manifest.json'), JSON.stringify(manifest, null, 2));
  if (existsSync(dir)) {
    rmSync(staging, { recursive: true, force: true });
  } else {
    renameSync(staging, dir);
  }
  return { spec, dir, manifest: readJson(join(dir, 'manifest.json')) };
}
