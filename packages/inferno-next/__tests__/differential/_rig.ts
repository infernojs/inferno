/**
 * Differential testing rig — runs the SAME `.tsrx` fixture through BOTH
 * inferno-next AND @tsrx/react, mounts each into a hidden container, drives
 * an identical event sequence on both, and asserts the resulting DOM is
 * byte-equivalent after each step. This is the gold-standard parity proof
 * for the "you can swap them around" claim: any divergence surfaces here
 * automatically rather than depending on me having written the right
 * conformance test.
 *
 * Mechanics:
 *   - The inferno-next side just imports the .tsrx file directly — the
 *     existing Vitest plugin compiles it via packages/inferno-next/compiler.
 *   - The React side reads the same .tsrx source, runs it through
 *     @tsrx/react's `compile()` to get React-shaped TSX, writes that TSX to
 *     a temp .tsx file, and dynamic-imports it so Vitest's built-in JSX
 *     transform applies. React + ReactDOM are pulled in via the standard
 *     bare imports the compiled TSX emits.
 *   - Both are mounted into separate <div> containers under document.body.
 *   - A scenario is a list of `step(name, async (i, r) => { … })` callbacks
 *     that run on BOTH containers (interleaved), and after each step the
 *     rig diff-asserts `i.container.innerHTML === r.container.innerHTML`
 *     after a brief normalisation pass.
 */
import { expect } from 'vitest';
import { createRoot as infernoCreateRoot, flushSync as infernoFlushSync } from '../../src/index.js';
import { existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as React from 'react';
import { createRoot as reactCreateRoot, type Root as ReactRoot } from 'react-dom/client';
import { flushSync as reactFlushSync } from 'react-dom';
import { act as reactAct } from 'react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// React 18+ requires this global to enable `act()`. Without it, every
// `act(...)` call logs a warning AND silently no-ops the scheduler drain,
// which means our React-side mount can finish in an undefined state where
// effects haven't fired yet. Set it once at module load.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Vitest's globalSetup hook (_setup.ts) precompiles every fixture into this
// directory before any test runs. We just dynamic-import from here.
const REACT_FIXTURE_CACHE_DIR = join(__dirname, '.react-cache');

/** Cache compiled React fixtures so re-running tests doesn't re-compile each time. */
const reactImportCache = new Map<string, Promise<any>>();

/**
 * Read a `.tsrx` fixture source, compile to React TSX via `@tsrx/react`,
 * write the result to a temp `.tsx` file under the OS temp dir, and return
 * the result of dynamic-importing it. Vitest's transformer JSX-transforms
 * the .tsx on import, so the returned module is ready-to-use with the React
 * runtime.
 *
 * Why a temp file instead of evaluating inline: Vitest's import pipeline
 * gives us free JSX → JS lowering + module resolution + ESM semantics for
 * imported react/react-dom. Doing it inline (Function constructor + esbuild)
 * would require us to set up jsx-runtime + bare-specifier resolution by
 * hand. Tradeoff: one disk write per fixture.
 */
function loadReactFixture(srcPath: string): Promise<any> {
  const cached = reactImportCache.get(srcPath);
  if (cached) return cached;
  const slug = basename(srcPath).replace(/\.tsrx$/, '');
  const outFile = join(REACT_FIXTURE_CACHE_DIR, `${slug}-${hashString(srcPath)}.js`);
  if (!existsSync(outFile)) {
    return Promise.reject(new Error(
      `Precompiled React fixture not found for ${srcPath}.\n` +
      `Expected at ${outFile}. Either globalSetup didn't run, or the fixture ` +
      `couldn't be compiled via @tsrx/react — check setup logs.`
    ));
  }
  const promise = import(/* @vite-ignore */ outFile);
  reactImportCache.set(srcPath, promise);
  return promise;
}

function hashString(s: string): string {
  // Cheap deterministic id — collisions across the test suite are
  // astronomically unlikely; we're cache-keying by the fixture's source
  // path, which is itself unique.
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

/**
 * Normalise an `innerHTML` snapshot for comparison. We strip:
 *   - inferno-next's `<!--…-->` slot markers (start/end Comment nodes used as
 *     range boundaries; React doesn't emit equivalents).
 *   - React's data-reactroot attribute residue (legacy, defensive).
 *   - Leading/trailing whitespace at the container boundary.
 *   - Whitespace-only text nodes between elements (inferno-next preserves
 *     authored whitespace from templates; React's JSX strips it). This is a
 *     compile-emission divergence, NOT a renderer-behaviour divergence, so
 *     we collapse to put both runtimes on equal footing.
 */
function normaliseHtml(html: string): string {
  return sortAttributes(html
    .replace(/<!--[\s\S]*?-->/g, '')                            // drop all comment markers
    .replace(/ data-reactroot="?"?/g, '')                       // legacy React attr
    .replace(/\s+(?=<)/g, '')                                   // whitespace before tags
    .replace(/(?<=>)\s+/g, '')                                  // whitespace after tags
    .trim());
}

/**
 * Sort attribute names within each opening tag alphabetically. inferno-next
 * emits attributes in template-clone order (basically authoring order, with
 * dynamic attribute updates appended at the end), while React's JSX runtime
 * preserves source order strictly. Both are equally valid per the HTML spec
 * (attribute order on an element has no semantic meaning), but the literal
 * string compare in the rig would flag the difference. Canonicalise to put
 * both runtimes on equal footing.
 */
function sortAttributes(html: string): string {
  return html.replace(/<([a-zA-Z][\w-]*)\s+([^>]*?)(\/?)>/g, (_, tag, attrs, selfClose) => {
    // Split the attribute string on whitespace BETWEEN attributes — but not
    // inside quoted values. Naive parse: match name="value" | name='value'
    // | name=unquoted | name (boolean).
    const matches = attrs.match(/(?:[a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*))?/g) || [];
    if (matches.length === 0) return `<${tag}${selfClose ? '/' : ''}>`;
    matches.sort();
    return `<${tag} ${matches.join(' ')}${selfClose ? '/' : ''}>`;
  });
}

export interface DiffMount {
  container: HTMLElement;
  /** Drive a synthetic click on the FIRST element matching the selector. */
  click(selector: string): Promise<void>;
  /** Find one element (throws if missing). */
  find(selector: string): Element;
  /** Find all matching elements. */
  findAll(selector: string): Element[];
}

export interface DiffPair {
  inferno: DiffMount;
  react: DiffMount;
  /**
   * Drive a step on BOTH runtimes (interleaved — inferno first, then
   * React). After both complete, normalises and asserts equal innerHTML.
   * If the snapshots diverge, the assertion message includes both for
   * easy diffing.
   */
  step(name: string, fn: (i: DiffMount, r: DiffMount) => void | Promise<void>): Promise<void>;
  /** Tear down both. */
  unmount(): void;
}

/**
 * Mount `srcPath`'s components under both runtimes. `infernoEntry` is the
 * export name to mount on the inferno-next side (and the same name will be
 * used for React, since @tsrx/react produces identically-named exports).
 *
 * `initialProps` is passed to both renderers as the props of the mounted
 * root component.
 */
export async function mountDifferential(
  srcPath: string,
  infernoEntry: string,
  initialProps?: any,
): Promise<DiffPair> {
  // Inferno-next side — import via Vitest's normal pipeline (the
  // infernoNext() plugin handles compilation).
  const infernoMod = await import(/* @vite-ignore */ srcPath);
  const InfernoComp = infernoMod[infernoEntry];
  if (!InfernoComp) throw new Error(`inferno-next export "${infernoEntry}" not found in ${srcPath}`);

  // React side — compile, write, dynamic-import.
  const reactMod = await loadReactFixture(srcPath);
  const ReactComp = reactMod[infernoEntry];
  if (!ReactComp) throw new Error(`@tsrx/react export "${infernoEntry}" not found in ${srcPath}`);

  // Two hidden containers, side-by-side under body.
  const iContainer = document.createElement('div');
  iContainer.setAttribute('data-rt', 'inferno');
  const rContainer = document.createElement('div');
  rContainer.setAttribute('data-rt', 'react');
  document.body.appendChild(iContainer);
  document.body.appendChild(rContainer);

  // Inferno mount.
  const iRoot = infernoCreateRoot(iContainer);
  iRoot.render(InfernoComp, initialProps);
  infernoFlushSync(() => {});

  // React mount.
  const rRoot: ReactRoot = reactCreateRoot(rContainer);
  await reactAct(async () => {
    rRoot.render(React.createElement(ReactComp, initialProps));
  });

  function mkMount(container: HTMLElement, isReact: boolean): DiffMount {
    return {
      container,
      async click(selector) {
        // jsdom's container.querySelector('#x') sometimes fails to resolve
        // single-char IDs on freshly-React-rendered subtrees (the scope at
        // which selectors are resolved doesn't include just-mounted nodes
        // in some envs). Fall back to a tree walk via getElementsByTagName
        // when the direct querySelector returns null. This is jsdom-quirk
        // workaround code, not a renderer concern.
        let el: Element | null = container.querySelector(selector);
        if (!el && selector.startsWith('#')) {
          const id = selector.slice(1);
          const all = container.getElementsByTagName('*');
          for (let i = 0; i < all.length; i++) {
            if (all[i].id === id) { el = all[i]; break; }
          }
        }
        if (!el) {
          throw new Error(`no element matching ${selector} (${isReact ? 'react' : 'inferno'})`);
        }
        if (isReact) {
          await reactAct(async () => {
            if (typeof (el as HTMLElement).click === 'function') (el as HTMLElement).click();
            else el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          });
        } else {
          infernoFlushSync(() => {
            if (typeof (el as HTMLElement).click === 'function') (el as HTMLElement).click();
            else el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          });
        }
      },
      find(selector) {
        const el = container.querySelector(selector);
        if (!el) throw new Error(`no element matching ${selector} (${isReact ? 'react' : 'inferno'})`);
        return el;
      },
      findAll(selector) { return Array.from(container.querySelectorAll(selector)); },
    };
  }

  const inferno = mkMount(iContainer, false);
  const react = mkMount(rContainer, true);

  async function step(name: string, fn: (i: DiffMount, r: DiffMount) => void | Promise<void>): Promise<void> {
    await fn(inferno, react);
    // Drain React commits + effects, give microtasks a chance.
    await reactAct(async () => {});
    const i = normaliseHtml(iContainer.innerHTML);
    const r = normaliseHtml(rContainer.innerHTML);
    if (i !== r) {
      throw new Error(
        `Differential DOM divergence at step "${name}":\n` +
        `  inferno-next: ${i}\n` +
        `  @tsrx/react:  ${r}`
      );
    }
    // Verbose-pass on equality — using expect so the runner counts an
    // assertion (helps with vitest's "asserted nothing" warnings).
    expect(i).toBe(r);
  }

  function unmount(): void {
    iRoot.unmount();
    reactFlushSync(() => { rRoot.unmount(); });
    iContainer.remove();
    rContainer.remove();
  }

  return { inferno, react, step, unmount };
}
