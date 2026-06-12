/**
 * Vitest globalSetup hook — runs ONCE in pure Node (NOT in jsdom) before any
 * test file is loaded. We use it to compile every `.tsrx` differential
 * fixture through `@tsrx/react` + esbuild (TSX → React-runtime JS) and write
 * the result under `__tests__/differential/.react-cache/`.
 *
 * Why here, not in `_rig.ts` at test time:
 *   - jsdom's TextEncoder doesn't produce real Uint8Array instances per
 *     `instanceof Uint8Array`, which esbuild's binary protocol asserts. So
 *     calling esbuild from within a test (under jsdom) crashes with
 *     "JavaScript environment is broken." Running it here, in Node, sidesteps
 *     that entirely.
 *   - One compile per fixture per test session instead of per-test; the
 *     differential test files import the precompiled JS via plain
 *     dynamic-import.
 */
import { compile as compileToReact } from '@tsrx/react';
import { transformSync as esbuildTransformSync } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURE_DIR = join(__dirname, '../_fixtures');
const CACHE_DIR = join(__dirname, '.react-cache');

function hashString(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function compileOne(srcPath: string): void {
  const source = readFileSync(srcPath, 'utf8');
  let compiled;
  try {
    compiled = compileToReact(source, srcPath);
  } catch {
    // Some fixtures use inferno-next features that @tsrx/react rejects
    // (multi-ref, @switch, Dynamic shapes). Skip silently — a differential
    // test that imports the missing precompile will surface the gap.
    return;
  }
  if (compiled.errors && compiled.errors.length > 0) return;
  let transformed;
  try {
    transformed = esbuildTransformSync(compiled.code, {
      loader: 'tsx',
      jsx: 'automatic',
      jsxImportSource: 'react',
      target: 'esnext',
      format: 'esm',
      sourcefile: srcPath,
    });
  } catch {
    return;
  }
  // @tsrx/react preserves the user's authored `from 'inferno-next'` imports
  // verbatim (it expects the user to author against the platform they're
  // targeting). For our differential fixtures — which ARE authored against
  // inferno-next — we rewrite the imports to React-side equivalents so the
  // React runtime supplies the hooks/components. The names of React's hooks
  // match inferno-next's (useState, useEffect, useReducer, useMemo,
  // useCallback, useRef, useId, useImperativeHandle, useDeferredValue,
  // useTransition, startTransition, createContext, memo, use, Fragment,
  // Suspense), so a flat import rewrite is enough.
  //
  // EXCEPT createPortal: in React it lives on `react-dom`, not `react`, so a
  // naive rewrite leaves it `undefined`. ALSO, @tsrx/react lowers
  // `createPortal(() => <jsx/>, target)` so the children stay a thunk —
  // React 19 expects a ReactNode and would warn / no-op. Below we (a) strip
  // createPortal out of the rewritten react import, (b) import the real one
  // from react-dom under an internal alias, (c) shim a `createPortal` const
  // that unwraps the thunk if present and forwards to the real impl.
  let rewritten = transformed.code.replace(
    /from\s+["']inferno-next["']/g,
    'from "react"'
  );
  if (/\bcreatePortal\b/.test(rewritten)) {
    rewritten = rewritten.replace(
      /(import\s*\{[^}]*?)\bcreatePortal\b\s*,?\s*([^}]*\}\s*from\s+"react";?)/,
      (_m, head, tail) => `${head}${tail}`.replace(/,\s*\}/, ' }').replace(/\{\s*,/, '{ ')
    );
    rewritten = `import { createPortal as __rd_createPortal } from "react-dom";
const createPortal = (children, target) => __rd_createPortal(typeof children === "function" ? children() : children, target);
${rewritten}`;
  }
  const slug = basename(srcPath).replace(/\.tsrx$/, '');
  const outFile = join(CACHE_DIR, `${slug}-${hashString(srcPath)}.js`);
  writeFileSync(outFile, rewritten);
}

export async function setup(): Promise<void> {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  if (!existsSync(FIXTURE_DIR)) return;
  // Walk both the top-level fixture dir AND any subdirs (we currently only
  // ship a flat layout but allow nesting for forward compatibility).
  const walk = (dir: string): string[] => {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const s = statSync(full);
      if (s.isDirectory()) out.push(...walk(full));
      else if (full.endsWith('.tsrx')) out.push(full);
    }
    return out;
  };
  for (const file of walk(FIXTURE_DIR)) compileOne(file);
}

export async function teardown(): Promise<void> {
  // Keep the cache between runs — `setup` overwrites on each invocation.
}
