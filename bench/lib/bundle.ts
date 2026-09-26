import alias from '@rollup/plugin-alias';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replaceModule from '@rollup/plugin-replace';
import terserModule from '@rollup/plugin-terser';
import { transform as swcTransform } from '@swc/core';
import { createRequire } from 'node:module';
import type { Plugin } from 'rollup';
import { aliasEntries, type BuiltVariant } from '../variants/build.ts';
import { readJson } from './util.ts';
import { JFB_TERSER } from './terser.ts';

const require = createRequire(import.meta.url);

// Both ship CJS type declarations whose default export TS can't see as callable under nodenext.
const replace = replaceModule as unknown as (options: object) => Plugin;
const terser = terserModule as unknown as (options: object) => Plugin;

export type Transform = 'babel' | 'swc';

export interface BundleOptions {
  transform: Transform;
  minify: boolean;
  /** Directories whose .js/.jsx files get the Inferno JSX transform. */
  include: string[];
}

export function toolVersions(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of ['rollup', 'terser', '@babel/core', 'babel-plugin-inferno', '@swc/core', 'swc-plugin-inferno']) {
    try {
      out[name] = readJson(require.resolve(`${name}/package.json`)).version;
    } catch {
      out[name] = 'missing';
    }
  }
  return out;
}

function swcInferno(include: string[]): Plugin {
  const wasm = require.resolve('swc-plugin-inferno');
  return {
    name: 'swc-inferno',
    async transform(code, id) {
      if (!include.some((dir) => id.startsWith(dir)) || !/\.jsx?$/.test(id)) {
        return null;
      }
      const out = await swcTransform(code, {
        filename: id,
        sourceMaps: true,
        swcrc: false,
        configFile: false,
        jsc: {
          parser: { syntax: 'ecmascript', jsx: true },
          target: 'es2022',
          experimental: { plugins: [[wasm, { pure: true }]] },
        },
      });
      return { code: out.code, map: out.map };
    },
  };
}

function babelInferno(include: string[]): Plugin {
  return babel({
    babelrc: false,
    configFile: false,
    babelHelpers: 'bundled',
    extensions: ['.js', '.jsx'],
    include: include.map((dir) => `${dir}/**`),
    plugins: [[require.resolve('babel-plugin-inferno'), { imports: true, defineAllArguments: true }]],
  });
}

/** Rollup plugins that compile Inferno JSX against a specific variant's prod ESM bundles. */
export function variantPlugins(variant: BuiltVariant, options: BundleOptions): Plugin[] {
  const aliases = aliasEntries(variant, 'prod-esm');
  const plugins: Plugin[] = [
    alias({
      entries: Object.entries(aliases).map(([find, replacement]) => ({ find: new RegExp(`^${find}$`), replacement })),
    }),
    nodeResolve({ extensions: ['.js', '.jsx', '.mjs'], browser: true }),
    replace({ preventAssignment: true, values: { 'process.env.NODE_ENV': JSON.stringify('production') } }),
    options.transform === 'babel' ? babelInferno(options.include) : swcInferno(options.include),
  ];
  if (options.minify) {
    plugins.push(terser(JFB_TERSER));
  }
  return plugins;
}
