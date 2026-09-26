import { decodedMappings, TraceMap } from '@jridgewell/trace-mapping';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { rollup } from 'rollup';
import { minify } from 'terser';
import { JFB_TERSER } from '../lib/terser.ts';
import { readJson } from '../lib/util.ts';

export const ANALYSIS_PLUGINS = 'scripts/rollup/plugins/index.analysis.js';

export interface ModuleSize {
  module: string;
  /** Bytes of the module in the unminified prod ESM bundle (after tree-shaking). */
  rendered: number;
  /** Bytes attributed to the module in the jfb-terser-minified bundle. */
  minified: number;
}

export interface ModuleReport {
  pkg: string;
  totalRendered: number;
  totalMinified: number;
  modules: ModuleSize[];
}

/** "…/packages/inferno/tmpDist/DOM/mounting.js" -> "inferno/DOM/mounting" */
function moduleName(work: string, path: string): string {
  let rel = relative(join(work, 'packages'), path).split(sep).join('/');
  rel = rel.replace('/tmpDist/', '/').replace(/\.js$/, '');
  return rel;
}

/**
 * Rebuilds the prod ESM bundle of `pkg` with the repository's rollup plugins
 * (Babel sourcemaps on) and attributes rendered and minified bytes to modules.
 */
export async function analyzeModules(work: string, pkg: string): Promise<ModuleReport> {
  const pkgDir = join(work, 'packages', pkg);
  const pkgJSON = readJson(join(pkgDir, 'package.json'));
  const { createPlugins } = await import(pathToFileURL(join(work, ANALYSIS_PLUGINS)).href);
  const rollupConfig = pkgJSON.rollup ?? {};
  const deps = { ...pkgJSON.devDependencies, ...pkgJSON.peerDependencies, ...pkgJSON.dependencies };
  const external = [
    ...new Set(Object.keys(deps).filter((n) => !(rollupConfig.bundledDependencies ?? []).includes(n))),
    'stream',
  ];
  const options = {
    name: 'index',
    replace: true,
    version: pkgJSON.version,
    env: 'production',
    format: 'es',
    esnext: true,
    minify: false,
    ext: '.mjs',
  };
  const bundle = await rollup({
    input: join(pkgDir, 'tmpDist/index.js'),
    external,
    plugins: createPlugins(pkgJSON.version, options),
    onwarn: () => {},
  });
  const { output } = await bundle.generate({ format: 'es', sourcemap: true, indent: true, file: join(pkgDir, 'dist/index.mjs') });
  await bundle.close();
  const chunk = output[0];

  const sizes = new Map<string, ModuleSize>();
  const entry = (name: string) => {
    let s = sizes.get(name);
    if (!s) {
      s = { module: name, rendered: 0, minified: 0 };
      sizes.set(name, s);
    }
    return s;
  };
  for (const [id, m] of Object.entries(chunk.modules)) {
    if (m.renderedLength > 0) {
      entry(moduleName(work, id)).rendered += m.renderedLength;
    }
  }

  const min = await minify(chunk.code, {
    ...JFB_TERSER,
    sourceMap: { content: chunk.map as any, asObject: true },
  });
  const map = new TraceMap(min.map as any);
  const sources = map.sources.map((s) => (s ? moduleName(work, join(pkgDir, 'dist', s)) : '<unmapped>'));
  const decoded = decodedMappings(map);
  const lines = (min.code ?? '').split('\n');
  lines.forEach((line, li) => {
    let col = 0;
    let owner = '<unmapped>';
    for (const seg of decoded[li] ?? []) {
      entry(owner).minified += seg[0] - col;
      col = seg[0];
      owner = seg.length > 1 ? sources[seg[1]!] : '<unmapped>';
    }
    entry(owner).minified += line.length - col + (li < lines.length - 1 ? 1 : 0);
  });

  const modules = [...sizes.values()].filter((m) => m.rendered > 0 || m.minified > 0).sort((a, b) => b.minified - a.minified);
  return {
    pkg,
    totalRendered: chunk.code.length,
    totalMinified: (min.code ?? '').length,
    modules,
  };
}
