/**
 * Volar (IDE language-service) mappings for inferno-next .tsrx files.
 *
 * Editors load this entry point to get a TYPED virtual TSX file the
 * TypeScript language service can analyse — hover, autocomplete, go-to-def,
 * diagnostics — without ever running our template-clone codegen. The TSX
 * output is intentionally NOT the same shape as the runtime emit produced
 * by `compile()`: it's a parallel pipeline that runs `@tsrx/core`'s shared
 * `createJsxTransform` (the same machinery that powers tsrx-react / tsrx-
 * preact's Volar paths) in `typeOnly: true` mode.
 *
 * Caller contract:
 *   - Input: the original .tsrx source string + filename.
 *   - Output: a `VolarMappingsResult` (see @tsrx/core/types) containing
 *     `code` (generated TSX), `mappings` (per-token offsets the language
 *     server uses to translate position queries from .tsrx → virtual TSX
 *     and back), `cssMappings`, `errors`, and the source AST.
 *
 * Why a separate file: `compile.js` is the runtime-codegen path and ships
 * to every consumer (Vite plugin, build pipeline). The Volar path pulls in
 * extra @tsrx/core surface (`createJsxTransform`, `createVolarMappingsResult`,
 * `dedupeMappings`) that build-time consumers don't need; isolating it
 * keeps the runtime build small.
 */

import {
  createJsxTransform,
  createVolarMappingsResult,
  dedupeMappings,
  parseModule,
} from '@tsrx/core';

/**
 * Platform descriptor for `createJsxTransform`. Mirrors `tsrx-react`'s React
 * descriptor with the small set of differences for inferno-next:
 *
 *   - `imports.errorBoundary` / `imports.dynamic` point at inferno-next
 *     itself (we don't ship separate sub-packages for these — the runtime
 *     exports them directly).
 *   - `jsx.classAttrName: 'class'` because inferno-next keeps authored
 *     `class` instead of rewriting to React's `className`.
 *   - `jsx.multiRefStrategy: 'array'` — the inferno-next runtime accepts a
 *     plain array of refs natively (see the multi-ref attribute path in
 *     `src/runtime.ts`'s ref binding), so no `mergeRefs` helper is needed.
 *   - `validation.requireUseServerForAwait: false` — no server-component
 *     concept in inferno-next (no top-level await validation gates).
 *
 * `imports.suspense` and `imports.fragment` aren't real components in
 * inferno-next (we lower `@try`/`@pending` to `tryBlock` and fragments to
 * concrete templates), but the descriptor still needs a value because the
 * shared transform emits TSX-level `<Fragment>` / `<Suspense>` wrappers
 * when running in TSX mode. We point them at `inferno-next` so editors at
 * least don't fail to resolve the imports; users won't actually see those
 * names in source. (Volar TSX is virtual — its imports never run.)
 */
const INFERNO_NEXT_PLATFORM = {
  name: 'inferno-next',
  imports: {
    fragment: 'inferno-next',
    suspense: 'inferno-next',
    dynamic: 'inferno-next',
    errorBoundary: 'inferno-next',
    forOfIterableHelper: '@tsrx/core/runtime/iterable',
  },
  jsx: {
    rewriteClassAttr: false,
    classAttrName: 'class',
    multiRefStrategy: 'array',
  },
  validation: {
    requireUseServerForAwait: false,
  },
};

const infernoNextTransform = createJsxTransform(INFERNO_NEXT_PLATFORM);

/**
 * Compile a .tsrx source string to a Volar `VolarMappingsResult`.
 *
 * Parse → JSX transform (typeOnly) → wrap as Volar payload. We always run
 * with `collect: true` so the parser records errors instead of throwing
 * mid-pipeline; that way a syntactically-broken file still produces a
 * partial virtual TSX the language server can show diagnostics against.
 *
 * @param {string} source
 * @param {string} [filename]
 * @param {{ loose?: boolean }} [options]
 * @returns {import('@tsrx/core/types').VolarMappingsResult}
 */
export function compileToVolarMappings(source, filename, options) {
  /** @type {import('@tsrx/core/types').CompileError[]} */
  const errors = [];
  /** @type {import('@tsrx/core/types').AST.CommentWithLocation[]} */
  const comments = [];
  const ast = parseModule(source, filename, {
    ...options,
    collect: true,
    loose: !!options?.loose,
    errors,
    comments,
  });
  const transformed = infernoNextTransform(ast, source, filename, {
    collect: true,
    loose: !!options?.loose,
    typeOnly: true,
    errors,
    comments,
  });
  const result = createVolarMappingsResult({
    ast: transformed.ast,
    ast_from_source: ast,
    source,
    generated_code: transformed.code,
    source_map: transformed.map,
    errors,
  });
  return {
    ...result,
    mappings: dedupeMappings(result.mappings),
  };
}
