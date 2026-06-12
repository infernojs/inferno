/**
 * @tsrx/inferno-next compiler — compiles TSRX source into JS that targets
 * the inferno-next runtime.
 *
 * Architecture (mirrors PLAN-TEMPLATE-RUNTIME.md §6 and §7):
 *   1. Parse TSRX via @tsrx/core's parseModule.
 *   2. For each top-level node:
 *        - Component → compile to a function that takes (scope, props, extra).
 *        - Other (imports, regular consts/functions) → emit as-is via esrap.
 *   3. Within a Component body:
 *        - Statements (declarations, hook calls, etc.) are kept and run on
 *          every invocation. Hook calls get a fresh module-scope Symbol
 *          passed as their last argument (conditional-hook-safe, §6.5).
 *        - JSX statements are extracted into a hoisted HTML template + a
 *          plan of dynamic bindings (text holes, attribute holes, event
 *          handlers) and a forBlock call for any for-of inside element
 *          children.
 *
 * Scope of the spike: handles the constructs used by the js-framework-benchmark
 * fixture (Main.tsrx). Sufficient for: components with attributes (static +
 * dynamic), event handlers, only-child text holes, for-of with keyed
 * reconciliation. Out of scope: TSRX `<style>`, scoped CSS, lazy destructure,
 * ifBlock, dynamic components, portals.
 */

import { parseModule, prepareStylesheetForRender, renderStylesheets, annotateWithHash } from '@tsrx/core';
import { print as esrapPrint } from 'esrap';
import esrapTsx from 'esrap/languages/tsx';

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
]);

const HOOK_NAMES = new Set([
  'useState', 'useReducer', 'useEffect', 'useLayoutEffect', 'useInsertionEffect',
  'useMemo', 'useCallback', 'useRef', 'useId', 'useEffectEvent', 'useImperativeHandle',
  'useDeferredValue', 'useTransition',
]);

// Namespace inheritance — mirrors HTML5 foreign-content rules. The element
// itself and its children may have *different* namespaces: <foreignObject>
// inside SVG is still an SVG element, but its children switch back to HTML.
function nsForSelf(tag, parentNs) {
  if (tag === 'svg') return 'svg';
  if (tag === 'math') return 'mathml';
  return parentNs;            // includes <foreignObject> — itself is SVG-ns
}

function nsForChildren(tag, parentNs) {
  if (tag === 'foreignObject') return 'html';
  if (tag === 'svg') return 'svg';
  if (tag === 'math') return 'mathml';
  return parentNs;
}

function nsFlag(ns) {
  return ns === 'svg' ? 1 : ns === 'mathml' ? 2 : 0;
}

function elementTagName(node) {
  if (!node || node.type !== 'Element') return null;
  return node.id?.name || node.openingElement?.name?.name || null;
}

function isNonHtmlRootTag(node) {
  const t = elementTagName(node);
  return t === 'svg' || t === 'math';
}

function nsForRootTag(node, parentNs) {
  const t = elementTagName(node);
  if (t === 'svg') return 'svg';
  if (t === 'math') return 'mathml';
  return parentNs;
}

// All keys + values are string/number/bool literals → safe to serialize at
// compile time into a `style="…"` HTML attribute (no runtime cost). Keys that
// are computed or properties with non-literal values disqualify the whole
// object — fall back to a setStyle binding.
function objectExprIsStaticLiteral(obj) {
  for (const p of obj.properties || []) {
    if (p.type !== 'Property' && p.type !== 'ObjectProperty') return false;
    if (p.computed) return false;
    const k = p.key;
    if (k.type !== 'Identifier' && !(k.type === 'Literal' && typeof k.value === 'string')) return false;
    const v = p.value;
    if (v.type !== 'Literal') return false;
    if (v.value != null && typeof v.value !== 'string' && typeof v.value !== 'number' && typeof v.value !== 'boolean') return false;
  }
  return true;
}

function staticObjectToCssString(obj) {
  const parts = [];
  for (const p of obj.properties || []) {
    const name = p.key.type === 'Identifier' ? p.key.name : p.key.value;
    const value = p.value.value;
    if (value == null || value === false || value === '') continue;
    parts.push(`${name}: ${value === true ? '' : value}`);
  }
  return parts.join('; ');
}

// ===========================================================================
// Purity analysis — for-of body memoisation
// ===========================================================================

/**
 * Collect names bound by a destructuring pattern into `out`. Handles
 * Identifier / ObjectPattern / ArrayPattern / RestElement / AssignmentPattern.
 */
function collectBindings(pattern, out) {
  if (!pattern) return;
  if (pattern.type === 'Identifier') { out.add(pattern.name); return; }
  if (pattern.type === 'ObjectPattern') {
    for (const p of pattern.properties || []) {
      if (p.type === 'RestElement') collectBindings(p.argument, out);
      else collectBindings(p.value || p.key, out);
    }
    return;
  }
  if (pattern.type === 'ArrayPattern') {
    for (const e of pattern.elements || []) collectBindings(e, out);
    return;
  }
  if (pattern.type === 'RestElement') { collectBindings(pattern.argument, out); return; }
  if (pattern.type === 'AssignmentPattern') { collectBindings(pattern.left, out); return; }
}

/**
 * Names directly declared at the outer component body — params + top-level
 * `const`/`let`/`var` + `function` declarations. We DON'T recurse into nested
 * blocks (those are scoped lower). Used as the "did the for-of body reference
 * anything from parent scope?" oracle for memoisation.
 */
function collectComponentLocals(componentNode) {
  const locals = new Set();
  for (const p of componentNode.params || []) collectBindings(p, locals);
  // New shape: body is a JSXCodeBlock with `.body` as the statement list.
  // Legacy/synthetic shape: body IS the statement list directly.
  const stmts = componentNode.body && componentNode.body.type === 'JSXCodeBlock'
    ? (componentNode.body.body || [])
    : (componentNode.body || []);
  for (const stmt of stmts) {
    if (stmt.type === 'VariableDeclaration') {
      for (const d of stmt.declarations || []) collectBindings(d.id, locals);
    } else if (stmt.type === 'FunctionDeclaration') {
      if (stmt.id) locals.add(stmt.id.name);
    }
  }
  return locals;
}

/**
 * Compute the set of component-local names that are guaranteed STABLE across
 * renders. Used by the auto-callback pass below to decide which `const X =
 * (...) => ...` declarations can be lowered to `useCallback`, and by the
 * for-of dep-snapshot logic to know whether a captured closure is worth
 * memoising on.
 *
 * Stability sources:
 *   - useState / useReducer setters (second destructured slot)
 *   - useRef returns (the ref object itself, not .current)
 *   - useCallback / useEffectEvent returns
 *   - Arrows previously declared in this body whose free vars are themselves
 *     all stable — transitive (auto-callback adds them back into the set)
 *
 * Walked in source order so a later `const` can reference an earlier one's
 * stability. Anything we can't prove stable is left out and re-renders
 * normally.
 */
function computeStableLocals(statements, componentLocals) {
  const stable = new Set();
  for (const stmt of statements) {
    if (stmt.type !== 'VariableDeclaration') continue;
    for (const decl of stmt.declarations || []) {
      const init = decl.init;
      if (!init) continue;
      if (init.type === 'CallExpression' && init.callee && init.callee.type === 'Identifier') {
        const callName = init.callee.name;
        // [_, setX] = useState(...)  — second slot is the stable setter.
        // Same shape for useReducer's dispatch.
        if ((callName === 'useState' || callName === 'useReducer')
            && decl.id.type === 'ArrayPattern'
            && decl.id.elements
            && decl.id.elements.length >= 2
            && decl.id.elements[1]
            && decl.id.elements[1].type === 'Identifier') {
          stable.add(decl.id.elements[1].name);
          continue;
        }
        // x = useRef(...) / useCallback(...) / useEffectEvent(...) — the
        // return value is stable for the lifetime of the component.
        if ((callName === 'useRef' || callName === 'useCallback' || callName === 'useEffectEvent')
            && decl.id.type === 'Identifier') {
          stable.add(decl.id.name);
          continue;
        }
      }
      if (init.type === 'ArrowFunctionExpression' && decl.id.type === 'Identifier') {
        if (isArrowStableOver(init, stable, componentLocals)) {
          stable.add(decl.id.name);
        }
      }
    }
  }
  return stable;
}

/**
 * An arrow is "stable" when every free variable it references is either:
 *   - already known stable in this component (state setter / ref / ...)
 *   - not a component local at all (module-level — imports, top-level fns,
 *     literals — assumed stable by the React-convention rule that mutable
 *     state belongs in hooks, not in module scope)
 */
function isArrowStableOver(arrow, stable, componentLocals) {
  const paramScope = new Set();
  for (const p of arrow.params || []) collectBindings(p, paramScope);
  const free = collectFreeIdentifiers(arrow.body, paramScope);
  for (const name of free) {
    if (!componentLocals.has(name)) continue;   // module-level
    if (stable.has(name)) continue;
    return false;
  }
  return true;
}

/**
 * Rewrite a VariableDeclaration so that any declarator initialised with an
 * arrow whose name is in `stable` becomes `useCallback(arrow, [deps])`.
 * `deps` is the subset of the arrow's free vars that are component locals
 * (module-level identifiers don't need to be listed — useCallback only cares
 * about reactive deps).
 *
 * Idempotent: a const we already rewrote into `useCallback(...)` won't be
 * re-wrapped (its init is now a CallExpression, not an ArrowFunctionExpression).
 */
function rewriteAutoCallback(stmt, stable, componentLocals, ctx) {
  if (stmt.type !== 'VariableDeclaration' || stmt.kind !== 'const') return stmt;
  let modified = false;
  const newDecls = stmt.declarations.map(decl => {
    if (!decl.init || decl.init.type !== 'ArrowFunctionExpression') return decl;
    if (decl.id.type !== 'Identifier') return decl;
    if (!stable.has(decl.id.name)) return decl;

    const arrow = decl.init;
    const paramScope = new Set();
    for (const p of arrow.params || []) collectBindings(p, paramScope);
    const free = collectFreeIdentifiers(arrow.body, paramScope);
    const deps = [];
    const seen = new Set();
    for (const name of free) {
      if (!componentLocals.has(name)) continue;
      if (seen.has(name)) continue;
      seen.add(name);
      deps.push(name);
    }
    modified = true;
    ctx.runtimeNeeded.add('useCallback');
    return {
      ...decl,
      init: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'useCallback' },
        arguments: [
          arrow,
          {
            type: 'ArrayExpression',
            elements: deps.map(n => ({ type: 'Identifier', name: n })),
          },
        ],
      },
    };
  });
  return modified ? { ...stmt, declarations: newDecls } : stmt;
}

/**
 * Walk an AST subtree collecting Identifier references that are NOT bound
 * locally (inside the subtree). Tracks block/function scopes so inner `const`
 * declarations correctly shadow outer references.
 */
function collectFreeIdentifiers(root, initiallyBound) {
  const free = new Set();
  walk(root, new Set(initiallyBound));
  return free;

  function walk(n, scope) {
    if (!n) return;
    if (Array.isArray(n)) { for (const x of n) walk(x, scope); return; }
    if (typeof n !== 'object') return;

    const t = n.type;
    if (!t) return;

    if (t === 'Identifier') {
      if (!scope.has(n.name)) free.add(n.name);
      return;
    }

    // Member access — `obj.prop`: prop is a static name, not a binding ref.
    if (t === 'MemberExpression' && !n.computed) {
      walk(n.object, scope);
      return;
    }
    // Object literal property keys are static names (when not computed).
    if (t === 'Property' && !n.computed) {
      walk(n.value, scope);
      return;
    }

    // Function-like scopes — params introduce new bindings.
    if (t === 'FunctionExpression' || t === 'FunctionDeclaration' || t === 'ArrowFunctionExpression') {
      const newScope = new Set(scope);
      for (const p of n.params || []) collectBindings(p, newScope);
      // `function name(){}` introduces its own name into the body scope too.
      if (n.id) collectBindings(n.id, newScope);
      walk(n.body, newScope);
      return;
    }

    // Block scope — hoist `var`/`function` + pre-collect `let`/`const` so
    // forward references work the same way they do at runtime.
    if (t === 'BlockStatement') {
      const newScope = new Set(scope);
      for (const stmt of n.body || []) {
        if (stmt.type === 'VariableDeclaration') {
          for (const d of stmt.declarations || []) collectBindings(d.id, newScope);
        } else if (stmt.type === 'FunctionDeclaration' && stmt.id) {
          newScope.add(stmt.id.name);
        }
      }
      walk(n.body, newScope);
      return;
    }

    // VariableDeclarator's `id` is a binding, only walk the init.
    if (t === 'VariableDeclarator') { walk(n.init, scope); return; }

    // CatchClause introduces its param.
    if (t === 'CatchClause') {
      const newScope = new Set(scope);
      if (n.param) collectBindings(n.param, newScope);
      walk(n.body, newScope);
      return;
    }

    // for / for-in / for-of — left declarator introduces bindings.
    if (t === 'ForStatement' || t === 'ForInStatement' || t === 'ForOfStatement') {
      const newScope = new Set(scope);
      if (n.left && n.left.type === 'VariableDeclaration') {
        for (const d of n.left.declarations || []) collectBindings(d.id, newScope);
      } else if (n.left) {
        collectBindings(n.left, newScope);
      }
      walk(n.init, newScope);
      walk(n.test, newScope);
      walk(n.update, newScope);
      walk(n.right, newScope);
      walk(n.body, newScope);
      return;
    }

    // Default: walk all child fields.
    for (const key in n) {
      if (key === 'type' || key === 'loc' || key === 'start' || key === 'end' || key === 'range' || key === 'metadata') continue;
      walk(n[key], scope);
    }
  }
}

/**
 * Walk a for-of body looking for anything whose render is opaque to us —
 * component calls (`<Foo/>`, `<ctx.X/>`) or control-flow that wraps them
 * (`if`/`for`/`try`). Such constructs can read dynamic state (context,
 * setters, descendant hooks) during their own render, so skipping the
 * parent re-render would skip them too. Conservative match: any of those at
 * any depth → not memo-safe.
 */
function containsComponentCallOrControlFlow(stmts) {
  let found = false;
  function walk(n) {
    if (found || !n) return;
    if (Array.isArray(n)) { for (const x of n) walk(x); return; }
    if (typeof n !== 'object') return;
    const t = n.type;
    if (!t) return;
    // Component calls — old `Element` or new `JSXElement` with capitalised tag.
    if ((t === 'Element' || t === 'JSXElement') && isComponentTag(n)) { found = true; return; }
    // Control flow in the body — old statement-position forms.
    if (t === 'IfStatement' || t === 'ForOfStatement' || t === 'TryStatement' || t === 'SwitchStatement') { found = true; return; }
    // Control flow in the body — new JSX-expression forms.
    if (t === 'JSXIfExpression' || t === 'JSXForExpression' || t === 'JSXTryExpression' || t === 'JSXSwitchExpression') { found = true; return; }
    // Portal at child position — old TSRXExpression wrapper, new JSXExpressionContainer.
    if (t === 'TSRXExpression' && n.expression && isCreatePortalCall(n.expression)) { found = true; return; }
    if (t === 'JSXExpressionContainer' && n.expression && isCreatePortalCall(n.expression)) { found = true; return; }
    for (const key in n) {
      if (key === 'type' || key === 'loc' || key === 'start' || key === 'end' || key === 'range' || key === 'metadata') continue;
      walk(n[key]);
    }
  }
  for (const s of stmts) walk(s);
  return found;
}

/**
 * `() => fn(a, b, …)` — a zero-param arrow whose body is a single
 * function call. Returns `{ callee, args }` if so, else null. Used to compile
 * event handlers to the runtime's `{ fn, args }` bundle form so the
 * dispatcher gets a stable callee + identity-diffable args, sidestepping a
 * per-render closure allocation on keyed-list survivors.
 *
 * Conservative: we ONLY match arrows with NO params (so the user definitely
 * isn't reading the event arg), and the body must be a single CallExpression
 * (no statements, no side effects beyond the call). Members/index expressions
 * as the callee are fine — JS will resolve `this` correctly when the bundle
 * is invoked because the dispatcher uses `slot.fn.apply(null, ...)` only for
 * the variadic case; small-arity calls invoke the fn directly.
 */
function detectStableEventBundle(node) {
  if (!node || node.type !== 'ArrowFunctionExpression') return null;
  if (node.params.length !== 0) return null;
  // The body may be a BlockStatement with a single `return call()` or just
  // the expression directly (concise-arrow form).
  let body = node.body;
  if (body && body.type === 'BlockStatement') {
    if (body.body.length !== 1) return null;
    const stmt = body.body[0];
    if (stmt.type === 'ExpressionStatement') body = stmt.expression;
    else if (stmt.type === 'ReturnStatement' && stmt.argument) body = stmt.argument;
    else return null;
  }
  if (!body || body.type !== 'CallExpression') return null;
  // Bail if any arg is a spread — bundle args are positional only.
  if (body.arguments.some((a) => a.type === 'SpreadElement')) return null;
  return { callee: body.callee, args: body.arguments };
}

function isJsxLike(node) {
  if (!node) return false;
  const t = node.type;
  return t === 'Element' || t === 'Tsrx' || t === 'Tsx' || t === 'Text'
    || t === 'JSXElement' || t === 'JSXFragment' || t === 'JSXText';
}

/** A ternary at child position where at least one branch is JSX. */
function isConditionalJsx(node) {
  return node
    && node.type === 'ConditionalExpression'
    && (isJsxLike(node.consequent) || isJsxLike(node.alternate));
}

/** Wrap an expression as a BlockStatement body, so makeIfCall can consume it. */
function wrapAsBlockStmt(node) {
  if (!node) return null;
  // null / Literal(null) / Literal(false) → no branch
  if (node.type === 'Literal' && (node.value === null || node.value === false)) return null;
  return { type: 'BlockStatement', body: [node] };
}

/** `xs.map(x => <li/>)` — detect so we can throw a useful "use for-of" error. */
function isJsxReturningMapCall(node) {
  if (!node || node.type !== 'CallExpression') return false;
  const callee = node.callee;
  if (!callee || callee.type !== 'MemberExpression') return false;
  if (callee.property?.name !== 'map') return false;
  const arg = node.arguments?.[0];
  if (!arg || arg.type !== 'ArrowFunctionExpression') return false;
  const body = arg.body;
  if (isJsxLike(body)) return true;
  if (body && body.type === 'BlockStatement') {
    for (const stmt of body.body) {
      if (stmt.type === 'ReturnStatement' && isJsxLike(stmt.argument)) return true;
    }
  }
  return false;
}

// Recognise the dynamic form `{style (expr)}` — TSRX parses that as a
// `CallExpression(style, [expr])` because parenthesised expressions don't take
// the special Style path. We bridge here so both forms behave the same.
function isStyleCall(node) {
  return node
    && node.type === 'CallExpression'
    && node.callee
    && node.callee.type === 'Identifier'
    && node.callee.name === 'style'
    && node.arguments.length === 1;
}

// Resolve a `{ type: 'Style', value }` AST node — TSRX's `{style 'cls'}`
// expression — into a plain expression that yields a class string. The
// component's scoped css hash is prepended (so `{style 'row'}` in a component
// with hash "tsrx-abc" produces "tsrx-abc row"). Literal values inline; dynamic
// values become a runtime string concat. If the component has no <style> block
// the hash is dropped and the inner value is used as-is.
function resolveStyleExpr(node, cssHash) {
  if (!node) return node;
  let inner;
  if (node.type === 'Style') inner = node.value;
  else if (isStyleCall(node) && cssHash) inner = node.arguments[0];
  else return node;
  if (!cssHash) {
    return inner.type === 'Literal' && typeof inner.value === 'string'
      ? { type: 'Literal', value: inner.value, raw: JSON.stringify(inner.value) }
      : inner;
  }
  if (inner.type === 'Literal' && typeof inner.value === 'string') {
    const combined = inner.value ? `${cssHash} ${inner.value}` : cssHash;
    return { type: 'Literal', value: combined, raw: JSON.stringify(combined) };
  }
  // Dynamic: emit `(<hash> + ' ' + (expr))` so absent/null produces "<hash> ".
  return {
    type: 'BinaryExpression',
    operator: '+',
    left: { type: 'Literal', value: cssHash + ' ', raw: JSON.stringify(cssHash + ' ') },
    right: inner,
  };
}

/**
 * The new TSRX (`@tsrx/core@0.1.25`) shape for a component is a plain
 * `FunctionDeclaration` whose `body` is a `JSXCodeBlock` (opened by `@{`),
 * not the old dedicated `Component` AST node. We detect them at the three
 * places they can appear: top-level, under `export`, under `export default`.
 * `compileComponent` / `compileFunctionBody` read `body.body` (setup
 * statements) and `body.render` (single JSX root) off the JSXCodeBlock.
 */
function isComponentFunction(node) {
  return node
    && (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression')
    && node.body
    && node.body.type === 'JSXCodeBlock';
}

/**
 * Compile a .tsrx source string into JS targeting `inferno-next`.
 * @param {string} source
 * @param {string} filename
 * @param {{ hmr?: boolean }} [options] — `hmr: true` wraps each exported
 *   component in `hmr(Component)` and emits an `import.meta.hot.accept(...)`
 *   block that delegates updates to the runtime HMR wrapper. Dev tooling
 *   (e.g. the Vite plugin) should pass `hmr: true` when running in serve
 *   mode and leave it off for production builds.
 * @returns {{ code: string, map: any }}
 */
export function compile(source, filename, options) {
  const ast = parseModule(source, filename);
  const hmrEnabled = !!(options && options.hmr);

  const ctx = {
    filename,
    runtimeNeeded: new Set(),
    hoistedTemplates: [], // { name, html }
    hoistedHelpers: [],   // raw JS strings (sub-components, hook Symbols, key fns)
    delegatedEvents: new Set(),  // event names seen in JSX — auto-emits delegateEvents(...)
    cssInjections: [],    // { hash, css } — one entry per component with a <style> block
    currentComponentLocals: null,  // Set<string> while compiling a component body; null otherwise
    nextHookSymId: 0,
    nextTemplateId: 0,
    nextHelperId: 0,
  };
  // List of exported components needing HMR wrapping. Each entry: { name,
  // exportKind: 'default' | 'named' }. We emit the `Comp = hmr(Comp)` lines
  // and the `import.meta.hot.accept` block after walking the body, so the
  // wrapping sits AFTER each component's `const Comp = …;` declaration.
  const hmrComponents = [];

  let body = '';
  const compileOpts = { hmrWrap: hmrEnabled };
  for (const node of ast.body) {
    if (isComponentFunction(node)) {
      // `function Foo() @{ ... }` (new TSRX shape) — non-exported helper. HMR
      // doesn't wrap these (they're not user-visible across module boundaries).
      body += compileComponent(node, ctx) + '\n\n';
    } else if (node.type === 'ExportDefaultDeclaration' && isComponentFunction(node.declaration)) {
      // `export default function Foo() @{...}` → emit as named const + `export default Foo;`.
      const c = node.declaration;
      const compiled = compileComponent({ ...c, default: true }, ctx, compileOpts);
      body += compiled + '\n\n';
      if (hmrEnabled) hmrComponents.push({ name: c.id.name, exportKind: 'default' });
    } else if (node.type === 'ExportNamedDeclaration' && isComponentFunction(node.declaration)) {
      // `export function Foo() @{...}` → emit as `export const Foo = ...;`.
      const c = node.declaration;
      const compiled = compileComponent({ ...c, export: true }, ctx, compileOpts);
      body += compiled + '\n\n';
      if (hmrEnabled) hmrComponents.push({ name: c.id.name, exportKind: 'named' });
    } else if (node.type === 'ImportDeclaration' && node.source.value === 'inferno-next') {
      // Preserve ALL user-imported names from inferno-next (Portal, createContext,
      // use, custom helpers, etc.) — merged into the single prelude import.
      for (const sp of node.specifiers || []) {
        const name = sp.imported?.name || sp.local?.name;
        if (name) ctx.runtimeNeeded.add(name);
      }
    } else {
      body += printNode(node) + '\n';
    }
  }

  // Auto-emit delegateEvents([...]) once at module scope for every event seen.
  if (ctx.delegatedEvents.size > 0) {
    ctx.runtimeNeeded.add('delegateEvents');
  }

  // Build prelude. NOTE: `runtimeImport` is built BELOW (after the HMR block
  // possibly registers more runtime needs); we postpone that so the final
  // import list includes `hmr` / `HMR` when needed.
  const delegateCall = ctx.delegatedEvents.size > 0
    ? `delegateEvents(${JSON.stringify([...ctx.delegatedEvents].sort())});\n\n`
    : '';
  const styleInjections = ctx.cssInjections
    .map(i => `injectStyle(${JSON.stringify(i.hash)}, ${JSON.stringify(i.css)});`)
    .join('\n');
  const styleBlock = styleInjections ? styleInjections + '\n\n' : '';
  const templates = ctx.hoistedTemplates
    .map(t => {
      const args = [JSON.stringify(t.html)];
      if (t.ns || t.frag) args.push(String(t.ns | 0));
      if (t.frag) args.push(String(t.frag | 0));
      return `const ${t.name} = template(${args.join(', ')});`;
    })
    .join('\n');
  const templatesBlock = templates ? templates + '\n\n' : '';
  const helpers = ctx.hoistedHelpers.join('\n');
  const helpersBlock = helpers ? helpers + '\n\n' : '';

  // HMR plumbing — sits AFTER the component bodies so the wrappers can
  // reference the `Comp` const that was just declared. Each exported
  // component gets rewrapped (`Comp = hmr(Comp);`), default exports get
  // re-exported afterwards (we already emitted the `export default Comp;`
  // line earlier — re-exporting again would conflict, so the rewrap mutates
  // the binding in place). Mirrors `tsrx-ripple`'s emit shape.
  let hmrBlock = '';
  if (hmrComponents.length > 0) {
    // `hmr` is already registered as a needed runtime symbol by the
    // inline-wrap pass on each exported component. We still need `HMR` (the
    // Symbol key used to reach the wrapper's meta on `.update(...)`).
    ctx.runtimeNeeded.add('hmr');
    ctx.runtimeNeeded.add('HMR');
    const updates = hmrComponents
      .map(c => {
        const accessor = c.exportKind === 'default' ? 'module.default' : `module.${c.name}`;
        return `    ${c.name}[HMR].update(${accessor});`;
      })
      .join('\n');
    hmrBlock =
      'if (import.meta.hot) {\n' +
      '  import.meta.hot.accept((module) => {\n' +
      updates + '\n' +
      '  });\n' +
      '}\n';
  }

  // `runtimeImport` is built ABOVE this point, BEFORE `ctx.runtimeNeeded` may
  // get `hmr` and `HMR` added — so rebuild it after HMR wiring so the prelude
  // import includes them. Same for `delegateCall` (which already ran above):
  // we re-emit the prelude bits with the now-complete `runtimeNeeded` set.
  const finalRuntimeImport = ctx.runtimeNeeded.size > 0
    ? `import { ${[...ctx.runtimeNeeded].sort().join(', ')} } from 'inferno-next';\n\n`
    : '';

  return {
    code: finalRuntimeImport + delegateCall + styleBlock + templatesBlock + helpersBlock + body + hmrBlock,
    map: null,
  };
}

// ===========================================================================
// Component compilation
// ===========================================================================

/**
 * Walk a new-TSRX component (its `JSXCodeBlock` body) for `JSXStyleElement`
 * nodes. For each one found:
 *   - Pull the pre-parsed `StyleSheet` AST out of its children.
 *   - Run `prepareStylesheetForRender` (rewrites `.foo` → `.foo.<hash>` —
 *     mutates the sheet in place).
 *   - Collect into a list rendered via `renderStylesheets` to a CSS string.
 *   - Register `{hash, css}` on `ctx.cssInjections` so a module-level
 *     `injectStyle(hash, css)` is emitted in the prelude.
 *   - Run `annotateWithHash` over `body.render` to stamp the hash class on
 *     every native JSX element AND remove the JSXStyleElement nodes from
 *     the rendered tree (they don't contribute DOM in the new model).
 *
 * Returns the hash, or `null` when no `<style>` blocks are present.
 *
 * The first `JSXStyleElement` we see contributes the canonical hash for the
 * whole component — multiple `<style>` blocks share it; that matches Ripple's
 * `annotate_component_with_hash`.
 */
function applyCssScoping(componentNode, ctx) {
  if (!componentNode.body || componentNode.body.type !== 'JSXCodeBlock') return null;
  let cssHash = null;
  const styleSheets = [];
  function collect(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { for (const i of node) collect(i); return; }
    if (node.type === 'JSXStyleElement') {
      const sheet = (node.children || []).find(c => c && c.type === 'StyleSheet');
      if (sheet) {
        styleSheets.push(sheet);
        if (!cssHash) cssHash = node.metadata?.styleScopeHash || sheet.hash || null;
      }
      return;
    }
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'start' || key === 'end' || key === 'parent') continue;
      const v = node[key];
      if (v && typeof v === 'object') collect(v);
    }
  }
  collect(componentNode.body);
  if (!cssHash || styleSheets.length === 0) return null;
  for (const sheet of styleSheets) prepareStylesheetForRender(sheet);
  const css = renderStylesheets(styleSheets);
  ctx.cssInjections.push({ hash: cssHash, css });
  ctx.runtimeNeeded.add('injectStyle');
  // Mutate the render tree: add hash class to every native element AND
  // strip JSXStyleElement nodes (annotateWithHash returns null for them when
  // preserve_style_elements=false, so we filter nulls out of children).
  if (componentNode.body.render) {
    componentNode.body.render = annotateWithHash(componentNode.body.render, cssHash, 'class', false);
  }
  return cssHash;
}

function compileComponent(node, ctx, options) {
  const name = node.id.name;
  const isExported = !!(node.export || node.default || node.exported);
  const isDefault = !!node.default;
  const hmrWrap = !!(options && options.hmrWrap);

  // Scoped `<style>` block. New TSRX surfaces each style block as a
  // `JSXStyleElement` child of the rendered tree (parser pre-computes the
  // content hash + parses CSS into a StyleSheet AST). Collect them, run the
  // @tsrx/core scoping pipeline (rewrites `.foo` → `.foo.<hash>` AND stamps
  // the hash class onto every element under this component), emit a single
  // module-level `injectStyle(hash, css)`, and surface `cssHash` so
  // resolveStyleExpr can also prefix any legacy `{style 'cls'}` usages still
  // present in fixtures.
  let cssHash = applyCssScoping(node, ctx);
  // Backwards-compat: internal callers (legacy synthetic Component shapes)
  // may still attach `.css` directly on the node.
  if (!cssHash && node.css) {
    prepareStylesheetForRender(node.css);
    const css = renderStylesheets([node.css]);
    cssHash = node.css.hash;
    ctx.cssInjections.push({ hash: cssHash, css });
    ctx.runtimeNeeded.add('injectStyle');
  }

  // Snapshot the component's outer locals so nested for-of bodies can do
  // purity analysis (and auto-memo when the body doesn't reference any of
  // them). Stash on ctx for the duration of this compile so nested makeForCall
  // can reach it; restore on exit so sibling components don't see this one's
  // locals.
  const prevLocals = ctx.currentComponentLocals;
  ctx.currentComponentLocals = collectComponentLocals(node);
  let fn;
  try {
    // autoCallback: only top-level component bodies opt in. Item bodies and
    // other inner compileFunctionBody calls leave their arrows untouched
    // (they rarely declare arrow consts; if they do, the stability oracle
    // would need to be redefined relative to the inner scope).
    fn = compileFunctionBody(node, ctx, name, 'html', cssHash, { autoCallback: true });
  } finally {
    ctx.currentComponentLocals = prevLocals;
  }

  // HMR-wrap exported components inline so the binding stays a `const` (no
  // reassignment dance needed). The wrapper preserves the user-facing
  // function-name identity by NAMING the inner FunctionExpression — `hmr`
  // returns a wrapper that delegates to whatever fn is currently committed,
  // and `module.Foo[HMR].update(...)` swaps it on each accept.
  const valueExpr = (hmrWrap && isExported) ? `hmr(${fn})` : fn;
  if (isDefault) {
    return `const ${name} = ${valueExpr};\nexport default ${name};`;
  }
  if (isExported) {
    return `export const ${name} = ${valueExpr};`;
  }
  return `const ${name} = ${valueExpr};`;
}

/**
 * Generate just the `function (...) { ... }` text for a component-shaped node.
 * Used both for top-level components and for inlined for-of item bodies.
 *
 * `parentNs` is the namespace this body's JSX is rendered into. For top-level
 * components it's 'html'; for an if/for/try body whose host element is in
 * SVG/MathML context it inherits that ns.
 *
 * `cssHash` is the enclosing component's scoped-style hash (or null) — used to
 * resolve `{style 'cls'}` expressions to "<hash> cls" strings.
 */
function compileFunctionBody(node, ctx, name, parentNs = 'html', cssHash = null, options = null) {
  const params = node.params.map(p => printNode(p)).join(', ');
  const paramsClause = params ? `, ${params}` : '';

  // Body splitting. Two shapes to handle:
  //   (new TSRX)  node.body is a `JSXCodeBlock { body: Statement[], render: Node|null }`.
  //               Setup statements and the render JSX are already split for us.
  //               Early-return guards are normal JS `if (cond) return;` — the
  //               function's render is its single final expression, reached
  //               only if no return fired, so no early-exit desugaring needed.
  //   (legacy)    node.body is `Statement[]` with JSX nodes interleaved as
  //               statements. Used by internal callers that construct synthetic
  //               Component shapes (rewriteTsrxBlocks for old `<tsrx>` blocks,
  //               makeForCall/makeIfCall/makeTryCall for inlined sub-bodies).
  //               Keep the old split + rewriteEarlyExits path for these.
  let statements;
  let jsxNodes;
  if (node.body && node.body.type === 'JSXCodeBlock') {
    statements = node.body.body || [];
    jsxNodes = node.body.render ? [node.body.render] : [];
  } else {
    const bodyRewritten = rewriteEarlyExits(node.body);
    statements = [];
    jsxNodes = [];
    for (const child of bodyRewritten) {
      if (isJsxNode(child)) {
        if (child.type === 'Element' && elementTagName(child) === 'style') continue;
        jsxNodes.push(child);
      } else statements.push(child);
    }
  }

  // Plan + emit JSX. Records any inline-sub-component code that needs to live
  // INSIDE this function body (so for-of item bodies can capture parent state).
  const inlinedSubs = [];

  // Auto-callback: lower `const X = (...) => ...` to `useCallback(X, [deps])`
  // for arrows whose free vars are all stable. Only runs at the component-body
  // level (caller opts in via options.autoCallback). For-of item bodies and
  // other inner compileFunctionBody calls skip this — they rarely declare
  // arrow consts, and the stability oracle is defined relative to the
  // component's scope, not the item body's.
  let workingStatements = statements;
  if (options && options.autoCallback && ctx.currentComponentLocals) {
    const stableSet = computeStableLocals(statements, ctx.currentComponentLocals);
    workingStatements = statements.map(s => rewriteAutoCallback(s, stableSet, ctx.currentComponentLocals, ctx));
  }

  // Rewrite hook calls and `<tsrx>` blocks in statements before printing them.
  // A `<tsrx>` block at expression position (e.g. `const f = <tsrx>...</tsrx>`)
  // is hoisted as a render function in inlinedSubs and replaced with an
  // identifier reference. Suitable for top-level render-prop patterns where
  // the block doesn't capture local arrow params.
  const rewrittenStatements = workingStatements
    .map(s => rewriteHookCalls(s, ctx, name))
    .map(s => rewriteTsrxBlocks(s, ctx, name, inlinedSubs));
  const statementCode = rewrittenStatements.map(s => '  ' + printNode(s).replace(/\n/g, '\n  ')).join('\n');

  const plan = planJsx(jsxNodes, ctx, name, inlinedSubs, parentNs, cssHash);

  const lines = [];
  // Closure-dep snapshot prologue (raw JS string). Used by impure for-of item
  // bodies that close over parent locals but have no hooks / no component
  // calls / no control flow — they can short-circuit when every captured
  // value (deps + item ref) matches the previous render.
  if (options && options.prologue) lines.push(options.prologue);
  if (statementCode) lines.push(statementCode);
  if (inlinedSubs.length > 0) lines.push(inlinedSubs.map(s => '  ' + s.replace(/\n/g, '\n  ')).join('\n'));
  if (plan.bindingsName) {
    lines.push(`  let _b = __s.${plan.bindingsName};`);
    lines.push(`  if (_b === undefined) {`);
    lines.push(plan.mount);
    lines.push(`  } else {`);
    lines.push(plan.update);
    lines.push(`  }`);
  }
  if (plan.after) lines.push(plan.after);

  return `function ${name}(__s${paramsClause}, __extra) {\n  const __block = __s.block;\n${lines.join('\n')}\n}`;
}

// ===========================================================================
// Hook-call rewriting
// ===========================================================================

function rewriteHookCalls(node, ctx, componentName) {
  return mapAst(node, (n) => {
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && HOOK_NAMES.has(n.callee.name)) {
      ctx.runtimeNeeded.add(n.callee.name);
      const symVar = allocHookSymbol(ctx, `${componentName}.${n.callee.name}#${ctx.nextHookSymId}`);
      return {
        ...n,
        arguments: [...n.arguments, { type: 'Identifier', name: symVar }],
      };
    }
    return null;
  });
}

/**
 * Hoist sub-template render functions at expression position. Three shapes:
 *   (legacy)  `<tsrx>...</tsrx>` / `<tsx>...</tsx>` JSX block — replaced.
 *   (new)     `() => @{ <jsx/> }` — arrow whose body is a JSXCodeBlock. The
 *             new TSRX way to write what `<tsrx>` used to express. The arrow
 *             takes whatever params the user wrote (typically `()`); we hoist
 *             a function declaration whose signature mirrors the standard
 *             component signature `(__s, …userParams, __extra)` so it slots
 *             into createPortal / Dynamic / render-prop callers uniformly.
 *
 * In both cases the helper is added to `inlinedSubs` (visible in the
 * surrounding component-body scope) so it captures the parent component's
 * locals via closure. It cannot capture params of nested arrows — see
 * compiler README.
 */
function rewriteTsrxBlocks(node, ctx, componentName, inlinedSubs) {
  return mapAst(node, (n) => {
    if (n.type === 'Tsrx' || n.type === 'Tsx') {
      const helperName = `__tsrx$${ctx.nextHelperId++}`;
      const fakeBody = {
        type: 'Component',
        id: { type: 'Identifier', name: helperName },
        params: [],
        body: n.children || [],
      };
      const fn = compileFunctionBody(fakeBody, ctx, helperName);
      inlinedSubs.push(fn + ';');
      return { type: 'Identifier', name: helperName };
    }
    if (n.type === 'ArrowFunctionExpression' && n.body && n.body.type === 'JSXCodeBlock') {
      // `() => @{ … }` — new sub-template form. Hoist as a regular component
      // body so its body.body (setup) + body.render (JSX) feed back through
      // the standard compileFunctionBody path.
      const helperName = `__tsrx$${ctx.nextHelperId++}`;
      const fakeBody = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: helperName },
        params: n.params || [],
        body: n.body,
      };
      const fn = compileFunctionBody(fakeBody, ctx, helperName);
      inlinedSubs.push(fn + ';');
      return { type: 'Identifier', name: helperName };
    }
    return null;
  });
}

function allocHookSymbol(ctx, debugName) {
  const id = ctx.nextHookSymId++;
  const name = `_h$${id}`;
  // Use Symbol.for(stableKey) so re-imports under HMR produce the SAME Symbol
  // identity, which keeps the existing hooks Map keys valid across body
  // swaps. The stable key embeds the source filename so symbols don't
  // collide across modules. `debugName` includes the component name + hook
  // name + call-site index — stable provided the user doesn't reorder hooks
  // between renders (which would violate React's rules anyway).
  const stableKey = `inferno-next:${ctx.filename || '<anon>'}:${debugName}`;
  ctx.hoistedHelpers.push(`const ${name} = Symbol.for(${JSON.stringify(stableKey)});`);
  return name;
}

// ===========================================================================
// JSX planning
// ===========================================================================

/**
 * Normalize a list of JSX child nodes:
 *   - Whitespace-only JSXText → dropped
 *   - JSXText with content → text Literal node
 *   - JSXExpressionContainer → Text hole
 *   - JSXElement → Element (matches our compiler's expected shape)
 *   - Tsx (`<>...</>`) and Tsrx (`<tsrx>...</tsrx>`) → flattened (children inlined)
 *   - Anything else (Element / ForOf / If / etc.) → passed through
 */
function normalizeChildren(nodes) {
  const out = [];
  if (!nodes) return out;
  for (const n of nodes) {
    if (!n) continue;
    if (n.type === 'JSXText') {
      if (/^\s*$/.test(n.value)) continue;
      out.push({ type: 'Text', expression: { type: 'Literal', value: n.value, raw: JSON.stringify(n.value) } });
    } else if (n.type === 'JSXExpressionContainer') {
      // Unwrap `{expr as string}` / `{expr as TSStringKeyword}` so downstream
      // emission sees a plain expression. The `as string` is purely a
      // compile-time hint; the runtime coercion (String(_v)) happens in the
      // emitted code regardless.
      const expression = stripStringishCast(n.expression);
      // Route to the RICH dispatcher (`TSRXExpression` branch in emitElementHtml)
      // when the expression is one that needs special handling — createPortal
      // calls, JSX-bearing ternaries, sub-template arrows (`() => @{…}`).
      // Otherwise route to the simpler `Text` branch (text-binding fast-path
      // for string-typed expressions; runtime String() coercion for others).
      out.push({
        type: needsRichDispatch(expression) ? 'TSRXExpression' : 'Text',
        expression,
      });
    } else if (n.type === 'JSXElement') {
      // Skip JSXStyleElement nested as a child — its CSS gets registered via
      // the @tsrx/core scoping pipeline elsewhere; it contributes no DOM.
      // (Detected separately via JSXStyleElement type but the parser may also
      // surface a regular JSXElement with tag 'style' in some edge cases.)
      out.push({
        type: 'Element',
        id: n.openingElement.name,
        attributes: n.openingElement.attributes || [],
        openingElement: n.openingElement,
        children: n.children || [],
        selfClosing: n.openingElement.selfClosing,
      });
    } else if (n.type === 'Tsx' || n.type === 'Tsrx' || n.type === 'JSXFragment') {
      out.push(...normalizeChildren(n.children || []));
    } else if (n.type === 'JSXStyleElement') {
      // Drop — its CSS gets pulled out of the render tree elsewhere.
      // No DOM contribution at this child position.
      continue;
    } else if (n.type === 'JSXIfExpression') {
      // `@if (cond) { ... } @else { ... }` — lower to the old IfStatement
      // shape so the existing makeIfCall path picks it up. `consequent` and
      // `alternate` are already BlockStatements per the new AST.
      out.push({
        type: 'IfStatement',
        test: n.test,
        consequent: n.consequent,
        alternate: n.alternate || null,
      });
    } else if (n.type === 'JSXForExpression') {
      // `@for (const x of items; index i; key x.id) { ... }` — lower to
      // ForOfStatement plus the `key` and `index` fields the new AST gives
      // us on the directive node. makeForCall reads these off the synthetic
      // ForOfStatement to plan keyed reconciliation.
      out.push({
        type: 'ForOfStatement',
        left: n.left,
        right: n.right,
        body: n.body,
        await: !!n.await,
        key: n.key || null,
        index: n.index || null,
        empty: n.empty || null,
      });
    } else if (n.type === 'JSXTryExpression') {
      // `@try { } @catch (err) { } @pending { }` — lower to TryStatement
      // with the optional `pending` field tagged on (consumed by makeTryCall
      // as the Suspense fallback branch).
      out.push({
        type: 'TryStatement',
        block: n.block,
        handler: n.handler || null,
        finalizer: n.finalizer || null,
        pending: n.pending || null,
      });
    } else if (n.type === 'JSXSwitchExpression') {
      // `@switch (d) { @case 1: { ... } @default: { ... } }` — lower to a
      // synthetic SwitchStatement for makeSwitchCall to consume.
      out.push({
        type: 'SwitchStatement',
        discriminant: n.discriminant,
        cases: n.cases || [],
      });
    } else {
      out.push(n);
    }
  }
  return out;
}

/**
 * Decide whether a JSX-child expression needs the rich dispatcher
 * (`TSRXExpression` branch in emitElementHtml) rather than the simple text
 * branch. Rich dispatch handles createPortal at child position, ternaries
 * whose branches are JSX, and sub-template arrows `() => @{…}` that the
 * standalone esrap printer can't handle.
 */
function needsRichDispatch(expr) {
  if (!expr || typeof expr !== 'object') return false;
  if (isCreatePortalCall(expr)) return true;
  if (isConditionalJsx(expr)) return true;
  if (isJsxReturningMapCall(expr)) return true;
  // A bare arrow whose body is a JSXCodeBlock — appears as a render-prop pass
  // (e.g. `{(state) => @{ … }}`). esrap will explode on the JSXCodeBlock; route
  // through rich dispatch where rewriteTsrxBlocks normalizes it.
  if (expr.type === 'ArrowFunctionExpression' && expr.body && expr.body.type === 'JSXCodeBlock') return true;
  return false;
}

/**
 * Walk through `as string` / `as TSStringKeyword` casts so the inner
 * expression is the one we emit. Other TS-only wrappers (TSNonNullExpression,
 * TSTypeAssertion with TSStringKeyword) are stripped the same way — they're
 * compile-time hints with no runtime semantics in our emit.
 */
function stripStringishCast(node) {
  if (!node) return node;
  if (node.type === 'TSAsExpression' || node.type === 'TSTypeAssertion') {
    return stripStringishCast(node.expression);
  }
  if (node.type === 'TSNonNullExpression') {
    return stripStringishCast(node.expression);
  }
  return node;
}

// `isStringishExpression` (text-typed predicate for the text-only-child fast
// path) will land in Phase 3 step 2 alongside the binding-emit refactor —
// stripStringishCast above is enough for correct behaviour; the predicate
// is needed only for the further optimization of skipping runtime `String(_v)`
// coercion when the expression is known-string at compile time.

function planJsx(jsxNodesRaw, ctx, componentName, inlinedSubs, parentNs = 'html', cssHash = null) {
  const jsxNodes = normalizeChildren(jsxNodesRaw);
  if (jsxNodes.length === 0) return { mount: '', update: '', after: '' };

  // Emit ONE template containing all top-level JSX (wrapping multiple roots in
  // a synthetic <inferno-frag>).
  // We walk the tree, building HTML and a list of bindings.
  const elementBindings = [];   // ordered list of bindings (per dynamic site)
  const forCalls = [];          // forBlock calls — emitted after the mount/append
  const ifCalls = [];           // ifBlock calls
  const compCalls = [];         // component-as-tag calls (<Provider>, <Foo/>, <ctx.X/>)
  // {createPortal(...)} calls collected by emitElementHtml for THIS plan.
  // Save/restore the previous list across the plan so that nested planJsx
  // calls (triggered by compiling portal bodies via printExprWithTsrx) don't
  // wipe the outer plan's collected portals. Without this, two sibling
  // createPortal calls at the same level lose the first one because the
  // recursive plan for its body resets the array before the second push.
  const _prevPortalCalls = ctx._portalCalls;
  ctx._portalCalls = [];
  // `switchCalls` follows the same save/restore pattern as portals: keep it
  // on `ctx` so we don't thread an extra param through every emit signature.
  const _prevSwitchCalls = ctx._switchCalls;
  ctx._switchCalls = [];
  const tryCalls = [];          // tryBlock calls

  // Track HTML index across top-level nodes — component-call nodes don't
  // contribute HTML, so their indices DON'T advance the frag position. Each
  // HTML-contributing top-level node lives at _root.childNodes[htmlIdx].
  // `single` mode = exactly one non-component Element root, no <inferno-frag>
  // wrapping. Anything else (multi-root, single Text, single comp call) goes
  // through the wrapper path; HTML-contributing nodes are at `_root.childNodes[i]`.
  const single = jsxNodes.length === 1 && jsxNodes[0].type === 'Element' && !isComponentTag(jsxNodes[0]);
  const partsHtml = [];
  let htmlIdx = 0;
  for (const node of jsxNodes) {
    const nodeIsComp = node.type === 'Element' && isComponentTag(node);
    // Single non-comp Element: path=[] (lives at _root directly).
    // Otherwise (wrapped in <inferno-frag>): path=[htmlIdx] when HTML-contributing.
    // Component-call: path=[] (no DOM contributed, host is the wrapper).
    const nodePath = (!single && !nodeIsComp) ? [htmlIdx] : [];
    partsHtml.push(emitNodeHtml(node, nodePath, elementBindings, forCalls, ifCalls, compCalls, tryCalls, ctx, componentName, inlinedSubs, parentNs, cssHash));
    if (!nodeIsComp) htmlIdx++;
  }
  const html = partsHtml.join('');
  // Was every emitted JSX node a component-call (or any non-HTML node that
  // contributes no HTML)? Then there's no template to clone — control-flow /
  // component-slot calls render directly into __block.parentNode using
  // __block.endMarker as the anchor.
  const noTemplate = html === '';

  const bindingsName = `b$${ctx.nextHelperId++}`;
  const mountLines = [];
  // Initialize `_b` as a LOCAL only — commit to `__s.${bindingsName}` at the
  // VERY END of the mount path. If anything thrown mid-mount (e.g. a `use()`
  // call suspending or a child render throwing), the scope's binding bag
  // stays `undefined` and the next attempt re-enters the mount branch from
  // scratch instead of mistakenly hitting the update branch with a half-
  // populated bag (which would crash setText / setAttribute on undefined
  // slot references).
  mountLines.push(`    _b = {};`);

  let elementVars;
  let ensureVar;
  if (!noTemplate) {
    ctx.runtimeNeeded.add('template');
    ctx.runtimeNeeded.add('clone');
    // Template namespace strategy:
    //   - HTML single-root: parse the element directly, no flag.
    //   - HTML multi-root: wrap in <inferno-frag> so template() returns the wrap.
    //   - SVG/MathML single-root: pass ns flag; runtime wraps with <svg>/<math>
    //     so the HTML5 parser places children in foreign content, then returns
    //     the inner root.
    //   - SVG/MathML multi-root: pass ns + frag=1; runtime wraps and returns
    //     the wrap itself (caller drains its children — no <inferno-frag>).
    const isHtmlNs = parentNs === 'html' && (single
      ? !isNonHtmlRootTag(jsxNodes[0])     // <svg>/<math> as the root means non-HTML ns
      : true);
    const tplNs = isHtmlNs ? 'html' : (single ? nsForRootTag(jsxNodes[0], parentNs) : parentNs);
    const flag = nsFlag(tplNs);
    const fragArg = (!single && flag !== 0) ? 1 : 0;
    const tplHtml = (single || flag !== 0) ? html : `<inferno-frag>${html}</inferno-frag>`;
    const tpl = allocTemplate(ctx, tplHtml, flag, fragArg);
    mountLines.push(`    const _root = clone(${tpl});`);
    elementVars = new Map();
    let varCounter = 0;
    ensureVar = (path) => {
      // Top-level position in a multi-root template — the synthetic frag we
      // cloned gets drained on mount, so empty-path callers (top-level
      // control-flow / component slots) need to point at the live parent.
      if (path.length === 0 && !single) {
        return '__block.parentNode';
      }
      const key = path.join(',');
      if (elementVars.has(key)) return elementVars.get(key);
      const v = `_el${varCounter++}`;
      elementVars.set(key, v);
      mountLines.push(`    const ${v} = ${walkExpr('_root', path)};`);
      return v;
    };
  } else {
    // No template — host is __block.parentNode. Stash it once.
    mountLines.push(`    _b._compHost = __block.parentNode;`);
    ensureVar = () => `_b._compHost`;
  }

  // Emit per-binding mount code.
  for (const b of elementBindings) {
    const elVar = ensureVar(b.path);
    if (b.kind === 'text' || b.kind === 'textOnlyChild') ctx.runtimeNeeded.add('setText');
    if (b.kind === 'attr') ctx.runtimeNeeded.add('setAttribute');
    if (b.kind === 'class') {
      if (b.ns && b.ns !== 'html') ctx.runtimeNeeded.add('setAttribute');
      else ctx.runtimeNeeded.add('setClassName');
    }
    if (b.kind === 'style') ctx.runtimeNeeded.add('setStyle');
    if (b.kind === 'spread') ctx.runtimeNeeded.add('setSpread');
    mountLines.push(emitBindingMount(b, elVar));
  }
  for (const fc of forCalls) {
    const elVar = ensureVar(fc.hostPath);
    fc.elVar = elVar;
    mountLines.push(`    _b._for$${fc.id} = ${elVar};`);
    if (fc.anchorPath) {
      const anchorVar = ensureVar(fc.anchorPath);
      fc.anchorVar = anchorVar;
      mountLines.push(`    _b._forAnchor$${fc.id} = ${anchorVar};`);
    }
  }
  for (const ic of ifCalls) {
    const elVar = ensureVar(ic.hostPath);
    ic.elVar = elVar;
    mountLines.push(`    _b._ifHost$${ic.id} = ${elVar};`);
    if (ic.anchorPath) {
      const anchorVar = ensureVar(ic.anchorPath);
      ic.anchorVar = anchorVar;
      mountLines.push(`    _b._ifAnchor$${ic.id} = ${anchorVar};`);
    }
  }
  for (const cc of compCalls) {
    const elVar = ensureVar(cc.hostPath);
    cc.elVar = elVar;
    mountLines.push(`    _b._compHost$${cc.id} = ${elVar};`);
    if (cc.anchorPath) {
      const anchorVar = ensureVar(cc.anchorPath);
      cc.anchorVar = anchorVar;
      mountLines.push(`    _b._compAnchor$${cc.id} = ${anchorVar};`);
    }
  }
  // tryBlock targets.
  for (const tc of tryCalls) {
    const elVar = ensureVar(tc.hostPath);
    tc.elVar = elVar;
    mountLines.push(`    _b._tryHost$${tc.id} = ${elVar};`);
    if (tc.anchorPath) {
      const anchorVar = ensureVar(tc.anchorPath);
      tc.anchorVar = anchorVar;
      mountLines.push(`    _b._tryAnchor$${tc.id} = ${anchorVar};`);
    }
  }
  // switchBlock targets.
  for (const sc of ctx._switchCalls) {
    const elVar = ensureVar(sc.hostPath);
    sc.elVar = elVar;
    mountLines.push(`    _b._switchHost$${sc.id} = ${elVar};`);
    if (sc.anchorPath) {
      const anchorVar = ensureVar(sc.anchorPath);
      sc.anchorVar = anchorVar;
      mountLines.push(`    _b._switchAnchor$${sc.id} = ${anchorVar};`);
    }
  }
  // Portal host targets — element containing the createPortal JSX position.
  // Stashed so the runtime can stamp $$portalParent on the portal's mounted
  // children pointing here, giving React-shape bubble-out semantics.
  for (const pc of ctx._portalCalls) {
    const elVar = ensureVar(pc.hostPath || []);
    pc.elVar = elVar;
    mountLines.push(`    _b._portalHost$${pc.id} = ${elVar};`);
  }

  if (!noTemplate) {
    if (single) {
      mountLines.push(`    __block.parentNode.insertBefore(_root, __block.endMarker);`);
    } else {
      mountLines.push(`    while (_root.firstChild) __block.parentNode.insertBefore(_root.firstChild, __block.endMarker);`);
    }
  }
  // Commit the binding bag to the scope LAST — see the matching comment at
  // the `_b = {}` initialization above. Reaching here means every binding
  // and the DOM range have been successfully constructed, so future
  // renders can safely take the update branch keyed on `__s.${bindingsName}`.
  mountLines.push(`    __s.${bindingsName} = _b;`);

  // Update.
  const updateLines = [];
  for (const b of elementBindings) {
    updateLines.push(emitBindingUpdate(b));
  }

  // After (forBlock + ifBlock calls run on every render — they reconcile).
  const afterLines = [];
  for (const fc of forCalls) {
    ctx.runtimeNeeded.add('forBlock');
    // flags: bit 0 = pure (auto-memo), bit 1 = singleRoot (skip per-item markers),
    //        bit 2 = depEligible (runtime compares deps array, upgrades to pure
    //        for survivors when deps unchanged this render).
    const flags = (fc.pure ? 1 : 0) | (fc.singleRoot ? 2 : 0) | (fc.depEligible ? 4 : 0);
    // Arg layout: forBlock(__s, slot, host, items, keyFn, body, extra, flags?, deps?, emptyBody?, anchor?).
    // `emptyHelper` ('null' literal when no `@empty` branch) lands as the
    // trailing arg. We backfill `flags` and `deps` placeholders (`0` and
    // `undefined`) when only the empty branch is present so the runtime sees
    // it at the right position. When the @for has a source-order anchor
    // (because it sits before static siblings in mixed children), we backfill
    // all earlier trailing positions and append the anchor expression last so
    // forBlock's optional `anchor` param lines up positionally.
    const hasAnchor = !!fc.anchorVar;
    const hasEmpty = fc.emptyHelper && fc.emptyHelper !== 'null';
    const flagsPart = (flags || hasEmpty || hasAnchor) ? ', ' + (flags || 0) : '';
    const depsPart = fc.depEligible
      ? `, [${fc.depNames.join(', ')}]`
      : ((hasEmpty || hasAnchor) ? ', undefined' : '');
    const emptyPart = hasEmpty ? `, ${fc.emptyHelper}` : (hasAnchor ? ', null' : '');
    const anchorPart = hasAnchor ? `, __s.${bindingsName}._forAnchor$${fc.id}` : '';
    afterLines.push(`  forBlock(__s, ${JSON.stringify('_for$' + fc.id)}, __s.${bindingsName}._for$${fc.id}, ${fc.itemsExpr}, ${fc.keyHelper}, ${fc.bodyHelper}, ${fc.extraExpr}${flagsPart}${depsPart}${emptyPart}${anchorPart});`);
  }
  for (const ic of ifCalls) {
    ctx.runtimeNeeded.add('ifBlock');
    const elseArg = ic.elseHelper || 'null';
    // Anchor selection mirrors componentSlot: when the if-block sits in a
    // mixed-children template with source-order siblings, we emitted a
    // `<!>` placeholder at the if's index and stored its el var on
    // `ic.anchorVar` — pass that so ifBlock's start/end markers land
    // BEFORE the anchor, preserving sibling order. Otherwise omit the arg
    // (runtime treats undefined as null → appendChild, same as before).
    const anchorArg = ic.anchorVar ? `, __s.${bindingsName}._ifAnchor$${ic.id}` : '';
    afterLines.push(`  ifBlock(__s, ${JSON.stringify('_if$' + ic.id)}, __s.${bindingsName}._ifHost$${ic.id}, (${ic.condExpr}), ${ic.thenHelper}, ${elseArg}${anchorArg});`);
  }
  for (const cc of compCalls) {
    ctx.runtimeNeeded.add('componentSlot');
    // Anchor selection:
    //   - In mixed children with source-order siblings, we emitted a `<!>`
    //     placeholder at the component's index and stored its el var on
    //     `cc.anchorVar` — pass that so componentSlot inserts BEFORE it.
    //   - When the host is the block's own parentNode (multi-root /
    //     noTemplate cases), pass __block.endMarker so the slot's markers
    //     stay inside the block's range (for-of reorder / tryBlock unmount
    //     move the slot DOM along with the block).
    //   - When the host is a nested element with no in-template anchor,
    //     the slot can safely append (insertBefore ignores foreign anchors).
    let anchorArg;
    if (cc.anchorVar) {
      anchorArg = `, __s.${bindingsName}._compAnchor$${cc.id}`;
    } else {
      const isInsideHost = cc.elVar.startsWith('_el');
      anchorArg = isInsideHost ? '' : ', __block.endMarker';
    }
    afterLines.push(`  componentSlot(__s, ${JSON.stringify('_comp$' + cc.id)}, __s.${bindingsName}._compHost$${cc.id}, ${cc.compExpr}, ${cc.propsExpr}${anchorArg});`);
  }
  for (const pc of ctx._portalCalls) {
    ctx.runtimeNeeded.add('portal');
    afterLines.push(`  portal(__s, ${JSON.stringify('_portal$' + pc.id)}, ${pc.targetExpr}, ${pc.bodyExpr}, ${pc.propsExpr}, __s.${bindingsName}._portalHost$${pc.id});`);
  }
  // Restore the outer plan's portal-call list — pairs with the save above.
  ctx._portalCalls = _prevPortalCalls;
  for (const tc of tryCalls) {
    ctx.runtimeNeeded.add('tryBlock');
    // Anchor selection mirrors componentSlot:
    //   - In mixed children with source-order siblings, we emitted a `<!>`
    //     placeholder at the @try's index and stored its el var on
    //     `tc.anchorVar` — pass that so tryBlock inserts BEFORE it.
    //   - Otherwise omit (runtime treats undefined === appendChild).
    const tryAnchorArg = tc.anchorVar
      ? `, __s.${bindingsName}._tryAnchor$${tc.id}`
      : '';
    afterLines.push(`  tryBlock(__s, ${JSON.stringify('_try$' + tc.id)}, __s.${bindingsName}._tryHost$${tc.id}, ${tc.tryHelper}, ${tc.catchHelper}, ${tc.pendingHelper}${tryAnchorArg});`);
  }
  for (const sc of ctx._switchCalls) {
    ctx.runtimeNeeded.add('switchBlock');
    // Anchor selection mirrors componentSlot:
    //   - When the @switch had source-order siblings (mixed-children loop
    //     emitted a `<!>` placeholder at its index), pass the stashed
    //     anchor node so switchBlock inserts BEFORE it.
    //   - Otherwise omit the arg; the runtime defaults to appendChild.
    const anchorArg = sc.anchorVar
      ? `, __s.${bindingsName}._switchAnchor$${sc.id}`
      : '';
    afterLines.push(`  switchBlock(__s, ${JSON.stringify('_switch$' + sc.id)}, __s.${bindingsName}._switchHost$${sc.id}, (${sc.discExpr}), ${sc.casesArrayExpr}, ${sc.defaultHelper}${anchorArg});`);
  }
  // Restore the outer plan's switch-call list — pairs with the save above.
  ctx._switchCalls = _prevSwitchCalls;

  return {
    bindingsName,
    mount: mountLines.join('\n'),
    update: updateLines.join('\n'),
    after: afterLines.join('\n'),
  };
}

// All `expr` strings get wrapped in `(…)` so ternaries / comma exprs / etc.
// don't break operator precedence in the comparisons or assignments.
function emitBindingMount(b, elVar) {
  const E = `(${b.expr})`;
  switch (b.kind) {
    case 'textOnlyChild': {
      return `    {
      const _v = ${E};
      const _t = document.createTextNode(_v == null || _v === false ? '' : String(_v));
      ${elVar}.appendChild(_t);
      _b._txt$${b.id} = _t;
      _b._prev$${b.id} = _v;
    }`;
    }
    case 'htmlOnlyChild': {
      return `    {
      const _v = ${E};
      ${elVar}.innerHTML = (_v == null ? '' : String(_v));
      _b._el$${b.id} = ${elVar};
      _b._prev$${b.id} = _v;
    }`;
    }
    case 'text': {
      return `    {
      const _v = ${E};
      const _t = document.createTextNode(_v == null || _v === false ? '' : String(_v));
      const _m = ${elVar}.childNodes[${b.childIndex}];
      ${elVar}.insertBefore(_t, _m);
      ${elVar}.removeChild(_m);
      _b._txt$${b.id} = _t;
      _b._prev$${b.id} = _v;
    }`;
    }
    case 'attr': {
      return `    {
      const _v = ${E};
      setAttribute(${elVar}, ${JSON.stringify(b.name)}, _v);
      _b._el$${b.id} = ${elVar};
      _b._prev$${b.id} = _v;
    }`;
    }
    case 'class': {
      // On SVG/MathML hosts the `className` property is read-only — fall back
      // to setAttribute. Compile-time choice, zero runtime branching.
      const setter = b.ns && b.ns !== 'html'
        ? `setAttribute(${elVar}, "class", _v)`
        : `setClassName(${elVar}, _v)`;
      return `    {
      const _v = ${E};
      ${setter};
      _b._el$${b.id} = ${elVar};
      _b._prev$${b.id} = _v;
    }`;
    }
    case 'style': {
      return `    {
      const _v = ${E};
      setStyle(${elVar}, _v, undefined);
      _b._el$${b.id} = ${elVar};
      _b._sty$${b.id} = _v;
    }`;
    }
    case 'spread': {
      return `    {
      const _v = ${E};
      setSpread(${elVar}, _v, undefined);
      _b._el$${b.id} = ${elVar};
      _b._sp$${b.id} = _v;
    }`;
    }
    case 'event': {
      return `    _b._el$${b.id} = ${elVar};
    ${elVar}.$$${b.eventName} = (${b.expr});`;
    }
    case 'event-bundle': {
      // Build a `{ fn, args }` bundle and stash fn + each arg in slots so the
      // update path can identity-diff and skip the reassignment on no-op.
      const argSlots = b.argExprs.map((_e, i) => `_b._a$${b.id}$${i}`);
      const argInit = b.argExprs.map((e, i) => `_b._a$${b.id}$${i} = (${e});`).join(' ');
      return `    {
      _b._el$${b.id} = ${elVar};
      _b._fn$${b.id} = (${b.fnExpr});
      ${argInit}
      ${elVar}.$$${b.eventName} = { fn: _b._fn$${b.id}, args: [${argSlots.join(', ')}] };
    }`;
    }
    case 'ref': {
      // Callback ref → call with the element; object ref → set .current.
      // Register a scope cleanup so unmount clears the ref to null (React parity).
      return `    {
      const _r = (${b.expr});
      if (typeof _r === 'function') _r(${elVar});
      else if (_r != null) _r.current = ${elVar};
      _b._ref$${b.id} = _r;
      _b._el$${b.id} = ${elVar};
      __s.cleanups.push(() => {
        const _x = _b._ref$${b.id};
        if (typeof _x === 'function') _x(null);
        else if (_x != null) _x.current = null;
      });
    }`;
    }
  }
  return '';
}

function emitBindingUpdate(b) {
  const E = `(${b.expr})`;
  switch (b.kind) {
    case 'textOnlyChild':
    case 'text': {
      return `    { const _v = ${E}; if (_b._prev$${b.id} !== _v) { setText(_b._txt$${b.id}, _v); _b._prev$${b.id} = _v; } }`;
    }
    case 'htmlOnlyChild': {
      return `    { const _v = ${E}; if (_b._prev$${b.id} !== _v) { _b._el$${b.id}.innerHTML = (_v == null ? '' : String(_v)); _b._prev$${b.id} = _v; } }`;
    }
    case 'attr': {
      return `    { const _v = ${E}; if (_b._prev$${b.id} !== _v) { setAttribute(_b._el$${b.id}, ${JSON.stringify(b.name)}, _v); _b._prev$${b.id} = _v; } }`;
    }
    case 'class': {
      const setter = b.ns && b.ns !== 'html'
        ? `setAttribute(_b._el$${b.id}, "class", _v)`
        : `setClassName(_b._el$${b.id}, _v)`;
      return `    { const _v = ${E}; if (_b._prev$${b.id} !== _v) { ${setter}; _b._prev$${b.id} = _v; } }`;
    }
    case 'style': {
      // Object styles need per-prop diffing — call setStyle even when the
      // reference is unchanged it'd just no-op via the internal diff. We DO
      // skip identity matches to avoid the call overhead.
      return `    { const _v = ${E}; if (_b._sty$${b.id} !== _v) { setStyle(_b._el$${b.id}, _v, _b._sty$${b.id}); _b._sty$${b.id} = _v; } }`;
    }
    case 'spread': {
      // setSpread does its own per-key diffing internally and handles cleanup
      // of keys that vanished — always call it, but skip if the reference is
      // identical (the user opted-in to a stable object).
      return `    { const _v = ${E}; if (_b._sp$${b.id} !== _v) { setSpread(_b._el$${b.id}, _v, _b._sp$${b.id}); _b._sp$${b.id} = _v; } }`;
    }
    case 'event': {
      return `    _b._el$${b.id}.$$${b.eventName} = (${b.expr});`;
    }
    case 'event-bundle': {
      // Diff fn + each arg against the per-slot cache. Only rebuild + assign
      // the bundle when something actually changed — keyed-list survivors with
      // unchanged item refs skip everything.
      const fnVar = `_fn`, argVars = b.argExprs.map((_e, i) => `_a${i}`);
      const reads = `const ${fnVar} = (${b.fnExpr}); ` + b.argExprs.map((e, i) => `const ${argVars[i]} = (${e});`).join(' ');
      const cmps = [`_b._fn$${b.id} !== ${fnVar}`]
        .concat(b.argExprs.map((_e, i) => `_b._a$${b.id}$${i} !== ${argVars[i]}`))
        .join(' || ');
      const writes = [`_b._fn$${b.id} = ${fnVar};`]
        .concat(b.argExprs.map((_e, i) => `_b._a$${b.id}$${i} = ${argVars[i]};`))
        .concat([`_b._el$${b.id}.$$${b.eventName} = { fn: ${fnVar}, args: [${argVars.join(', ')}] };`])
        .join(' ');
      return `    { ${reads} if (${cmps}) { ${writes} } }`;
    }
    case 'ref': {
      // Ref expression identity may change across renders — re-attach if so.
      return `    {
      const _r = (${b.expr});
      if (_r !== _b._ref$${b.id}) {
        const _old = _b._ref$${b.id};
        if (_old != null && typeof _old !== 'function') _old.current = null;
        if (typeof _r === 'function') _r(_b._el$${b.id});
        else if (_r != null) _r.current = _b._el$${b.id};
        _b._ref$${b.id} = _r;
      }
    }`;
    }
  }
  return '';
}

// ===========================================================================
// HTML emission
// ===========================================================================

function emitNodeHtml(node, path, bindings, forCalls, ifCalls, compCalls, tryCalls, ctx, componentName, inlinedSubs, parentNs = 'html', cssHash = null) {
  if (node.type === 'Text') {
    bindings.push({ id: bindings.length, kind: 'text', expr: printExpr(resolveStyleExpr(node.expression, cssHash)), path: path.slice(0, -1), childIndex: path[path.length - 1] });
    return '<!>';
  }
  if (node.type === 'Element') return emitElementHtml(node, path, bindings, forCalls, ifCalls, compCalls, tryCalls, ctx, componentName, inlinedSubs, parentNs, cssHash);
  if (node.type === 'Literal' && typeof node.value === 'string') return escapeHtml(node.value);
  // Top-level control-flow — register as a call hosted on the body's parent.
  if (node.type === 'IfStatement') {
    const ic = makeIfCall(node, ctx, componentName, inlinedSubs, parentNs, cssHash);
    ic.hostPath = [];
    ifCalls.push(ic);
    return '';
  }
  if (node.type === 'ForOfStatement') {
    const fc = makeForCall(node, ctx, componentName, inlinedSubs, parentNs, cssHash);
    fc.hostPath = [];
    forCalls.push(fc);
    return '';
  }
  if (node.type === 'TryStatement') {
    const tc = makeTryCall(node, ctx, componentName, inlinedSubs, parentNs, cssHash);
    tc.hostPath = [];
    tryCalls.push(tc);
    return '';
  }
  if (node.type === 'SwitchStatement') {
    const sc = makeSwitchCall(node, ctx, componentName, inlinedSubs, parentNs, cssHash);
    sc.hostPath = [];
    ctx._switchCalls.push(sc);
    return '';
  }
  return '';
}

function emitElementHtml(node, path, bindings, forCalls, ifCalls, compCalls, tryCalls, ctx, componentName, inlinedSubs, parentNs = 'html', cssHash = null) {
  // If the tag is a component (uppercase ident or MemberExpression), don't emit
  // HTML — register a componentSlot call instead. Components don't change
  // template namespace context; their bodies are compiled separately.
  if (isComponentTag(node)) {
    const cc = makeCompCall(node, ctx, componentName, inlinedSubs, bindings, forCalls, ifCalls, compCalls, parentNs, cssHash);
    cc.hostPath = path;
    compCalls.push(cc);
    return '';  // no HTML
  }

  const tag = node.id?.name || node.openingElement?.name?.name;
  if (!tag) throw new Error('Element without tag');

  // The host element's own namespace (e.g. `<svg>` is in SVG ns even if its
  // parent context is HTML); its descendants' inherited ns may differ
  // (`<foreignObject>` is SVG-ns but its children are HTML).
  const hostNs = nsForSelf(tag, parentNs);
  const childNs = nsForChildren(tag, parentNs);

  // Collect attributes.
  const attrs = node.attributes || node.openingElement?.attributes || [];
  // React convention: later attributes win on collision. If ANY spread is
  // present, attributes that come AFTER the first spread can't be inlined
  // into the template HTML (the spread would clobber them at runtime) —
  // emit them as bindings in source order instead.
  const firstSpreadIdx = attrs.findIndex((a) => a.type === 'SpreadAttribute' || a.type === 'JSXSpreadAttribute');
  let attrHtml = '';
  for (let attrI = 0; attrI < attrs.length; attrI++) {
    const attr = attrs[attrI];
    // `<div {...props}/>` — runtime spread. Emits one setSpread binding that
    // routes each key (class / style / on… / attr / ref) and diffs against
    // the prior spread object to clear removed keys.
    if (attr.type === 'SpreadAttribute' || attr.type === 'JSXSpreadAttribute') {
      const expr = printExprWithTsrx(attr.argument, ctx, componentName, inlinedSubs);
      bindings.push({ id: bindings.length, kind: 'spread', expr, path, ns: hostNs });
      continue;
    }
    if (attr.type !== 'Attribute' && attr.type !== 'JSXAttribute') continue;
    // Namespaced attribute names (`xlink:href`) — parser gives us a
    // JSXNamespacedName { namespace, name } pair. Concatenate so the runtime
    // sets the literal `xlink:href` attribute (the browser knows the ns).
    let rawAttrName;
    if (attr.name && (attr.name.type === 'JSXNamespacedName' || attr.name.type === 'NamespacedName')) {
      rawAttrName = `${attr.name.namespace.name}:${attr.name.name.name}`;
    } else {
      rawAttrName = attr.name.name || attr.name;
    }
    if (rawAttrName === 'key') continue;  // consumed by for-of, not emitted
    // `className` is React-shape JSX; emit `class` in HTML so the browser
    // actually applies it (and dynamic bindings also know which kind to pick).
    const attrName = rawAttrName === 'className' ? 'class' : rawAttrName;

    const val = attr.value;
    // If this attr comes AFTER a spread, we MUST emit as a binding (later wins).
    const isAfterSpread = firstSpreadIdx !== -1 && attrI > firstSpreadIdx;

    // Attribute-level `ref={expr}` (new TSRX) — replaces the removed
    // `{ref expr}` child intrinsic. Routes to the existing `kind: 'ref'`
    // binding emit, which handles both object refs ({ current } pattern) and
    // callback refs ((el) => …). Repeated `ref={…}` on the same element each
    // attach independently — the binding system handles them as separate
    // slot ids, so this loop iteration emits one per encounter.
    if (attrName === 'ref' && val) {
      const refInner = val.type === 'JSXExpressionContainer' ? val.expression : val;
      bindings.push({
        id: bindings.length, kind: 'ref',
        expr: printExpr(refInner),
        path,
      });
      continue;
    }
    // Attribute-level `innerHTML={expr}` (new TSRX) — replaces the removed
    // `{html expr}` child intrinsic. When the element has no other children
    // (and no spread that could clobber it), take the existing htmlOnlyChild
    // fast path. Otherwise fall back to a regular `attr` binding via the
    // property assignment path.
    if (attrName === 'innerHTML' && val) {
      const inner2 = val.type === 'JSXExpressionContainer' ? val.expression : val;
      const noChildren = (node.children || []).length === 0
        || normalizeChildren(node.children || []).length === 0;
      if (noChildren && !isAfterSpread) {
        bindings.push({
          id: bindings.length, kind: 'htmlOnlyChild',
          expr: printExpr(inner2),
          path,
        });
        continue;
      }
      // Element has other children too — emit as plain attr (setAttribute will
      // route through the property fallback at runtime).
      bindings.push({
        id: bindings.length, kind: 'attr', name: 'innerHTML',
        expr: printExprWithTsrx(inner2, ctx, componentName, inlinedSubs),
        path, ns: hostNs,
      });
      continue;
    }

    if (val == null) {
      if (isAfterSpread) {
        // Boolean attr after spread → emit as `true` binding.
        bindings.push({ id: bindings.length, kind: 'attr', name: attrName, expr: 'true', path, ns: hostNs });
      } else {
        attrHtml += ` ${attrName}`;
      }
      continue;
    }
    let inner = val.type === 'JSXExpressionContainer' ? val.expression : val;
    // `{style 'cls'}` in attribute position — resolve to a class string
    // (literal or runtime concat) before any further handling.
    inner = resolveStyleExpr(inner, cssHash);

    // `style={...}` — static literal object/string serialises into the HTML
    // template (unless we're after a spread, which would clobber it); dynamic
    // values become a setStyle binding.
    if (attrName === 'style') {
      if (!isAfterSpread && inner.type === 'Literal' && typeof inner.value === 'string') {
        attrHtml += ` style="${escapeAttr(inner.value)}"`;
        continue;
      }
      if (!isAfterSpread && inner.type === 'ObjectExpression' && objectExprIsStaticLiteral(inner)) {
        const css = staticObjectToCssString(inner);
        if (css) attrHtml += ` style="${escapeAttr(css)}"`;
        continue;
      }
      const expr = printExprWithTsrx(inner, ctx, componentName, inlinedSubs);
      bindings.push({ id: bindings.length, kind: 'style', expr, path, ns: hostNs });
      continue;
    }

    // Static literal value? Inline into HTML — UNLESS we're after a spread,
    // in which case we MUST emit as a binding so source order is preserved.
    if (inner.type === 'Literal' && !isAfterSpread) {
      if (typeof inner.value === 'string') {
        attrHtml += ` ${attrName}="${escapeAttr(inner.value)}"`;
      } else if (typeof inner.value === 'number') {
        attrHtml += ` ${attrName}="${inner.value}"`;
      } else if (inner.value === true) {
        attrHtml += ` ${attrName}`;
      }
      continue;
    }

    // Dynamic value — record a binding. (Also reached for literal values that
    // come after a spread, since those need to win over the spread at runtime.)
    const expr = printExprWithTsrx(inner, ctx, componentName, inlinedSubs);
    if (attrName.length > 2 && attrName.startsWith('on') && /^[A-Z]/.test(attrName[2])) {
      const eventName = attrName.slice(2).toLowerCase();
      ctx.delegatedEvents.add(eventName);
      // Hot-path optimisation: `() => fn(arg, …)` arrows with zero params get
      // compiled to a `{ fn, args }` bundle so the runtime can identity-diff
      // fn + each arg and skip the property reassignment when nothing
      // changed. Huge win for keyed-list survivors whose item refs are
      // unchanged (e.g. js-framework-benchmark swap rows).
      const bundleInfo = detectStableEventBundle(inner);
      if (bundleInfo) {
        bindings.push({
          id: bindings.length, kind: 'event-bundle', path, eventName, ns: hostNs,
          fnExpr: printExprWithTsrx(bundleInfo.callee, ctx, componentName, inlinedSubs),
          argExprs: bundleInfo.args.map((a) => printExprWithTsrx(a, ctx, componentName, inlinedSubs)),
        });
      } else {
        bindings.push({ id: bindings.length, kind: 'event', expr, path, eventName, ns: hostNs });
      }
    } else if (attrName === 'class' || attrName === 'className') {
      bindings.push({ id: bindings.length, kind: 'class', expr, path, ns: hostNs });
    } else {
      bindings.push({ id: bindings.length, kind: 'attr', name: attrName, expr, path, ns: hostNs });
    }
  }

  const isVoid = VOID_ELEMENTS.has(tag) && (node.children || []).length === 0;
  if (isVoid) {
    return `<${tag}${attrHtml}/>`;
  }

  let html = `<${tag}${attrHtml}>`;

  const children = normalizeChildren(node.children || []);
  // Special case: a single Text child (only-child text fast path).
  if (children.length === 1 && children[0].type === 'Text') {
    const txtChild = children[0];
    bindings.push({
      id: bindings.length, kind: 'textOnlyChild',
      expr: printExpr(resolveStyleExpr(txtChild.expression, cssHash)),
      path,
    });
    // The element stays empty in the template — runtime appends a Text node.
  } else if (children.length === 1 && children[0].type === 'Html') {
    // `{html expr}` as the only child — set the element's innerHTML directly.
    // Empty template; runtime injects the HTML on mount and diff-replaces on update.
    bindings.push({
      id: bindings.length, kind: 'htmlOnlyChild',
      expr: printExpr(children[0].expression),
      path,
    });
  } else {
    // Mixed children — walk them in order.
    let childIdx = 0;
    for (const child of children) {
      if (child.type === 'Text') {
        bindings.push({
          id: bindings.length, kind: 'text',
          expr: printExpr(resolveStyleExpr(child.expression, cssHash)),
          path, childIndex: childIdx,
        });
        html += '<!>';  // placeholder we'll replace at mount
        childIdx++;
      } else if (child.type === 'Element') {
        if (isComponentTag(child)) {
          const cc = makeCompCall(child, ctx, componentName, inlinedSubs, bindings, forCalls, ifCalls, compCalls, childNs, cssHash);
          cc.hostPath = path;
          // Emit a `<!>` anchor at the component's source-order position so
          // componentSlot inserts BEFORE this anchor — preserving sibling
          // order when a Component appears before static-element/text
          // siblings. Without this, the slot's start/end markers get
          // appended to the parent host AFTER the static template content.
          cc.anchorPath = [...path, childIdx];
          compCalls.push(cc);
          html += '<!>';
          childIdx++;
        } else {
          html += emitElementHtml(child, [...path, childIdx], bindings, forCalls, ifCalls, compCalls, tryCalls, ctx, componentName, inlinedSubs, childNs, cssHash);
          childIdx++;
        }
      } else if (child.type === 'ForOfStatement') {
        const forCall = makeForCall(child, ctx, componentName, inlinedSubs, childNs, cssHash);
        forCall.hostPath = path;
        // Emit a `<!>` anchor at the @for's source-order position so forBlock
        // inserts its start/end markers BEFORE this anchor — preserving sibling
        // order when an @for appears before static-element/text siblings.
        // Without this, the slot's markers get appended to the parent host
        // AFTER the static template content (same bug pattern as componentSlot).
        forCall.anchorPath = [...path, childIdx];
        forCalls.push(forCall);
        html += '<!>';
        childIdx++;
      } else if (child.type === 'IfStatement') {
        const ifCall = makeIfCall(child, ctx, componentName, inlinedSubs, childNs, cssHash);
        ifCall.hostPath = path;
        // Emit a `<!>` anchor at the if-block's source-order position so
        // ifBlock inserts its start/end markers BEFORE this anchor —
        // preserving sibling order when the @if appears before static
        // element/text siblings. Without this, the slot's markers get
        // appended to the parent host AFTER the static template content
        // and the branch content renders in reverse order.
        ifCall.anchorPath = [...path, childIdx];
        ifCalls.push(ifCall);
        html += '<!>';
        childIdx++;
      } else if (child.type === 'TryStatement') {
        const tc = makeTryCall(child, ctx, componentName, inlinedSubs, childNs, cssHash);
        tc.hostPath = path;
        // Emit a `<!>` anchor at the tryBlock's source-order position so
        // tryBlock inserts BEFORE this anchor — preserving sibling order
        // when an @try appears before static-element/text siblings. Without
        // this, the slot's start/end markers get appended to the parent
        // host AFTER the static template content. Mirrors componentSlot.
        tc.anchorPath = [...path, childIdx];
        tryCalls.push(tc);
        html += '<!>';
        childIdx++;
      } else if (child.type === 'SwitchStatement') {
        const sc = makeSwitchCall(child, ctx, componentName, inlinedSubs, childNs, cssHash);
        sc.hostPath = path;
        // Emit a `<!>` anchor at the switch's source-order position so
        // switchBlock inserts BEFORE this anchor — preserving sibling
        // order when an @switch appears before static-element/text
        // siblings. Without this, the slot's start/end markers get
        // appended to the parent host AFTER the static template content.
        sc.anchorPath = [...path, childIdx];
        ctx._switchCalls.push(sc);
        html += '<!>';
        childIdx++;
      } else if (child.type === 'Style') {
        // `{style 'cls'}` at child position — resolve to a class-name string
        // and emit as a text hole. Useful for passing scoped class names down
        // through render-prop boundaries.
        bindings.push({
          id: bindings.length, kind: 'text',
          expr: printExpr(resolveStyleExpr(child, cssHash)),
          path, childIndex: childIdx,
        });
        html += '<!>';
        childIdx++;
      } else if (child.type === 'Html') {
        // `{html expr}` mixed with sibling children isn't supported — wrap the
        // expression in a dedicated parent (e.g. `<span>{html ...}</span>`)
        // and the only-child fast path will set innerHTML on the wrapper.
        throw new Error(
          '{html expr} must be the ONLY child of its parent element. ' +
          'Wrap it in a dedicated element like <span>{html expr}</span>.'
        );
      } else if (child.type === 'TSRXExpression') {
        // {expr} at JSX child position. Recognised forms:
        //   - `{ref refExpr}` → ref-attach binding on the host element
        //   - `{createPortal(BODY, TARGET, PROPS?)}` → portal() call
        //   - `{cond ? <JSX/> : <JSX/>}` → lowered to ifBlock (so the branches
        //      mount real DOM, not stringified text)
        //   - `{items.map(x => <JSX/>)}` → compile error, point to for-of
        //   - anything else → emit as a text hole (runtime stringifies)
        const expr = child.expression;
        if (expr && expr.type === 'RefExpression') {
          bindings.push({
            id: bindings.length, kind: 'ref',
            expr: printExpr(expr.argument),
            path,
          });
        } else if (isCreatePortalCall(expr)) {
          const pc = makePortalCall(expr, ctx, componentName, inlinedSubs);
          // Stash the JSX-tree host (the element containing this createPortal
          // call) so the runtime can stamp $$portalParent on portal children
          // pointing back at it. That makes events bubble OUT of the portal
          // up through this element — matching React's per-fiber portal walk.
          pc.hostPath = path;
          (ctx._portalCalls ??= []).push(pc);
        } else if (isConditionalJsx(expr)) {
          // Lower `{cond ? A : B}` (where A or B is JSX) to an IfStatement so
          // each branch renders real DOM via the existing ifBlock machinery.
          const asIf = {
            type: 'IfStatement',
            test: expr.test,
            consequent: wrapAsBlockStmt(expr.consequent),
            alternate: wrapAsBlockStmt(expr.alternate),
          };
          const ic = makeIfCall(asIf, ctx, componentName, inlinedSubs, childNs, cssHash);
          ic.hostPath = path;
          ifCalls.push(ic);
        } else if (isJsxReturningMapCall(expr)) {
          throw new Error(
            "`.map()` returning JSX at child position isn't supported in TSRX. " +
            'Use a for-of loop instead — it gives you keyed reconciliation:\n\n' +
            '  for (const item of items; key item.id) {\n' +
            '    <li>{text item.name}</li>\n' +
            '  }'
          );
        } else {
          bindings.push({
            id: bindings.length, kind: 'text',
            expr: printExprWithTsrx(resolveStyleExpr(expr, cssHash), ctx, componentName, inlinedSubs),
            path, childIndex: childIdx,
          });
          html += '<!>';
          childIdx++;
        }
      }
    }
  }

  html += `</${tag}>`;
  return html;
}

function isCreatePortalCall(node) {
  return node
    && node.type === 'CallExpression'
    && node.callee
    && node.callee.type === 'Identifier'
    && node.callee.name === 'createPortal';
}

function makePortalCall(callNode, ctx, componentName, inlinedSubs) {
  const [bodyArg, targetArg, propsArg] = callNode.arguments;
  // The body is typically a <tsrx>...</tsrx> block — compile to a render fn.
  // rewriteTsrxBlocks turns Tsrx/Tsx into an Identifier referencing a hoisted fn.
  const bodyExpr = printExprWithTsrx(bodyArg, ctx, componentName, inlinedSubs);
  const targetExpr = printExpr(targetArg);
  const propsExpr = propsArg ? printExpr(propsArg) : 'undefined';
  return {
    id: ctx.nextHelperId++,
    bodyExpr,
    targetExpr,
    propsExpr,
  };
}

// ===========================================================================
// for-of inside element children → forBlock call
// ===========================================================================

// ===========================================================================
// if-statement inside element children → ifBlock call
// ===========================================================================

function makeIfCall(node, ctx, componentName, inlinedSubs, parentNs = 'html', cssHash = null) {
  // node.test, node.consequent (BlockStatement | Element), node.alternate (BlockStatement | IfStatement | null)
  const condExpr = printExpr(node.test);

  const thenStmts = node.consequent.type === 'BlockStatement' ? node.consequent.body : [node.consequent];
  const thenHelperName = `__then$${ctx.nextHelperId++}`;
  const thenFake = {
    type: 'Component',
    id: { type: 'Identifier', name: thenHelperName },
    params: [],
    body: thenStmts,
  };
  const thenFn = compileFunctionBody(thenFake, ctx, thenHelperName, parentNs, cssHash);
  inlinedSubs.push(thenFn + ';');

  let elseHelperName = null;
  if (node.alternate) {
    const elseStmts = node.alternate.type === 'BlockStatement' ? node.alternate.body : [node.alternate];
    elseHelperName = `__else$${ctx.nextHelperId++}`;
    const elseFake = {
      type: 'Component',
      id: { type: 'Identifier', name: elseHelperName },
      params: [],
      body: elseStmts,
    };
    const elseFn = compileFunctionBody(elseFake, ctx, elseHelperName, parentNs, cssHash);
    inlinedSubs.push(elseFn + ';');
  }

  return {
    id: ctx.nextHelperId++,
    condExpr,
    thenHelper: thenHelperName,
    elseHelper: elseHelperName,
    hostPath: null,
  };
}

// ===========================================================================
// Component-as-tag — `<Foo>...</Foo>`, `<ctx.Provider>...</ctx.Provider>`
// ===========================================================================

function isComponentTag(node) {
  const name = node.openingElement?.name || node.id;
  if (!name) return false;
  if (name.type === 'MemberExpression' || name.type === 'JSXMemberExpression') return true;
  if (name.type === 'Identifier' || name.type === 'JSXIdentifier') {
    return typeof name.name === 'string' && /^[A-Z]/.test(name.name);
  }
  return false;
}

function tagExpr(node) {
  const name = node.openingElement?.name || node.id;
  if (name.type === 'MemberExpression' || name.type === 'JSXMemberExpression') {
    return printExpr(name);
  }
  return name.name;
}

function makeCompCall(node, ctx, componentName, inlinedSubs, bindings, forCalls, ifCalls, compCalls, parentNs = 'html', cssHash = null) {
  const id = ctx.nextHelperId++;
  const compExpr = tagExpr(node);

  // Build the props object literal from JSX attributes. `<Foo {...rest}/>`
  // becomes a spread element in the object literal — works because component
  // bodies receive the merged object as `props` and only care about field
  // values, not identity.
  const attrs = node.attributes || node.openingElement?.attributes || [];
  const propParts = [];
  for (const attr of attrs) {
    if (attr.type === 'SpreadAttribute' || attr.type === 'JSXSpreadAttribute') {
      propParts.push(`...(${printExprWithTsrx(attr.argument, ctx, componentName, inlinedSubs)})`);
      continue;
    }
    if (attr.type !== 'Attribute' && attr.type !== 'JSXAttribute') continue;
    const attrName = attr.name.name || attr.name;
    const val = attr.value;
    if (val == null) { propParts.push(`${JSON.stringify(attrName)}: true`); continue; }
    let inner = val.type === 'JSXExpressionContainer' ? val.expression : val;
    inner = resolveStyleExpr(inner, cssHash);
    if (inner.type === 'Literal') {
      propParts.push(`${JSON.stringify(attrName)}: ${JSON.stringify(inner.value)}`);
    } else {
      propParts.push(`${JSON.stringify(attrName)}: (${printExprWithTsrx(inner, ctx, componentName, inlinedSubs)})`);
    }
  }

  // Compile children as a render function: (scope) => { renders JSX into scope }.
  // The function is inlined inside the parent component body so its closures
  // capture the parent's locals (props, state, etc.).
  const children = node.children || [];
  if (children.length > 0) {
    const childrenHelperName = `__children$${ctx.nextHelperId++}`;
    const fakeBody = {
      type: 'Component',
      id: { type: 'Identifier', name: childrenHelperName },
      params: [],
      body: children,
    };
    const childrenFn = compileFunctionBody(fakeBody, ctx, childrenHelperName, parentNs, cssHash);
    inlinedSubs.push(childrenFn + ';');
    propParts.push(`"children": ${childrenHelperName}`);
  }

  const propsExpr = `{ ${propParts.join(', ')} }`;

  return { id, compExpr, propsExpr, hostPath: null };
}

// ===========================================================================
// try/catch → tryBlock call
// ===========================================================================

function makeTryCall(node, ctx, componentName, inlinedSubs, parentNs = 'html', cssHash = null) {
  // node.block = try BlockStatement, node.handler = CatchClause (param, resetParam, body),
  // node.pending = optional BlockStatement (TSRX `pending { ... }`)
  const tryStmts = node.block.body;
  const tryHelperName = `__try$${ctx.nextHelperId++}`;
  const tryFake = {
    type: 'Component',
    id: { type: 'Identifier', name: tryHelperName },
    params: [],
    body: tryStmts,
  };
  const tryFn = compileFunctionBody(tryFake, ctx, tryHelperName, parentNs, cssHash);
  inlinedSubs.push(tryFn + ';');

  // Optional `pending { ... }` arm — compiled like any sub-body.
  let pendingHelperName = 'null';
  if (node.pending && node.pending.body && node.pending.body.length > 0) {
    const pendingHelper = `__pending$${ctx.nextHelperId++}`;
    const pendingFake = {
      type: 'Component',
      id: { type: 'Identifier', name: pendingHelper },
      params: [],
      body: node.pending.body,
    };
    const pendingFn = compileFunctionBody(pendingFake, ctx, pendingHelper, parentNs, cssHash);
    inlinedSubs.push(pendingFn + ';');
    pendingHelperName = pendingHelper;
  }

  let catchHelperName = 'null';
  if (node.handler) {
    const handler = node.handler;
    const errName = handler.param?.name || '_err';
    const resetName = handler.resetParam?.name || '_reset';
    const catchStmts = handler.body.body;
    const tmpName = `__catch$${ctx.nextHelperId++}`;
    // The catch body sees `err` and `reset` as bindings unpacked from the
    // tryBlock-supplied props object. We synthesize a small destructuring
    // VariableDeclaration at the top of the body so the user's identifiers
    // resolve. The body is otherwise compiled like any component body.
    const destructure = {
      type: 'VariableDeclaration',
      kind: 'const',
      declarations: [{
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [
            { type: 'Property', key: { type: 'Identifier', name: 'err' }, value: { type: 'Identifier', name: errName }, kind: 'init', shorthand: errName === 'err', computed: false, method: false },
            { type: 'Property', key: { type: 'Identifier', name: 'reset' }, value: { type: 'Identifier', name: resetName }, kind: 'init', shorthand: resetName === 'reset', computed: false, method: false },
          ],
        },
        init: { type: 'Identifier', name: '__props' },
      }],
    };
    const catchFake = {
      type: 'Component',
      id: { type: 'Identifier', name: tmpName },
      params: [{ type: 'Identifier', name: '__props' }],
      body: [destructure, ...catchStmts],
    };
    const catchFn = compileFunctionBody(catchFake, ctx, tmpName, parentNs, cssHash);
    inlinedSubs.push(catchFn + ';');
    catchHelperName = tmpName;
  }
  return {
    id: ctx.nextHelperId++,
    tryHelper: tryHelperName,
    catchHelper: catchHelperName,
    pendingHelper: pendingHelperName,
    hostPath: null,
  };
}

/**
 * `@switch (d) { @case 1: { … } @case 2: { … } @default: { … } }` →
 * `switchBlock(scope, slotKey, host, d, [[1, __case$0], [2, __case$1]], __default$2)`.
 *
 * Each case's `consequent` (Statement[]) is hoisted as its own component body
 * via `compileFunctionBody`, exactly like @if branches. Fall-through is NOT
 * modeled — each case is treated as its own self-contained body. If a user
 * writes a case with no explicit terminator, the case's body still runs to
 * completion (it's just a function call) and only that case's body renders.
 */
function makeSwitchCall(node, ctx, componentName, inlinedSubs, parentNs = 'html', cssHash = null) {
  const discExpr = printExpr(node.discriminant);
  const caseRecords = [];
  let defaultHelper = 'null';
  for (const c of node.cases || []) {
    const stmts = c.consequent || [];
    const isDefault = c.test == null;
    const helperName = `__${isDefault ? 'default' : 'case'}$${ctx.nextHelperId++}`;
    const fake = {
      type: 'Component',
      id: { type: 'Identifier', name: helperName },
      params: [],
      body: stmts,
    };
    const fn = compileFunctionBody(fake, ctx, helperName, parentNs, cssHash);
    inlinedSubs.push(fn + ';');
    if (isDefault) {
      defaultHelper = helperName;
    } else {
      caseRecords.push({ testExpr: printExpr(c.test), helper: helperName });
    }
  }
  const casesArrayExpr = '['
    + caseRecords.map(r => `[(${r.testExpr}), ${r.helper}]`).join(', ')
    + ']';
  return {
    id: ctx.nextHelperId++,
    discExpr,
    casesArrayExpr,
    defaultHelper,
    hostPath: null,
  };
}

function makeForCall(node, ctx, componentName, inlinedSubs, parentNs = 'html', cssHash = null) {
  // node.left = const x  OR  const &{x,y} / const [a,b]  (destructured)
  // node.right = expr, node.body = BlockStatement,
  // node.key = optional `key …` expression, node.index = optional `index <id>`.
  // `@for (...) { ... } @empty { ... }` — hoist the empty branch as its own
  // helper. Passed to the runtime as the trailing `emptyBody` arg. When
  // items.length === 0 the runtime mounts the empty branch in place of the
  // (empty) item list; transitioning items → 0 unmounts the chain and mounts
  // the empty body, and 0 → items does the reverse.
  let emptyHelperName = 'null';
  if (node.empty) {
    const stmts = node.empty.type === 'BlockStatement' ? node.empty.body : [node.empty];
    emptyHelperName = `__empty$${ctx.nextHelperId++}`;
    const fake = {
      type: 'Component',
      id: { type: 'Identifier', name: emptyHelperName },
      params: [],
      body: stmts,
    };
    const fn = compileFunctionBody(fake, ctx, emptyHelperName, parentNs, cssHash);
    inlinedSubs.push(fn + ';');
  }
  const leftDeclId = node.left.declarations[0].id;
  const isDestructured = leftDeclId.type !== 'Identifier';
  // `itemName` is the identifier used in the body signature + keyFn. For a
  // plain `const x of …`, that's `x`. For a destructured `const &{id} of …`,
  // we synthesize a fresh name and emit the destructuring inside the body so
  // the keyFn still gets the whole item and the body still sees the fields.
  const itemName = isDestructured ? '_item' : leftDeclId.name;
  const itemsExpr = printExpr(node.right);
  const subStmts = node.body.body;

  // Key resolution priority (matches @tsrx/core's build_hoisted_for_of_with_hooks):
  //   1. `key={…}` attribute on the first Element child (legacy / explicit).
  //   2. `for (const x of y; key x.id) { ... }` — TSRX for-of header.
  //   3. `for (const x, i of y) { ... }` — second loop param treated as the key.
  //   4. Fallback: `x.id ?? x` (object identity).
  // Builds `(item) => keyExpr` — when the for-of head is destructured we use
  // the same destructure pattern as the arg so the user's `key id` (where
  // `id` is a destructured field) actually resolves.
  function mkKeyFn(keyExpr) {
    const param = isDestructured
      ? leftDeclId
      : { type: 'Identifier', name: itemName };
    return printExpr({
      type: 'ArrowFunctionExpression',
      params: [param],
      body: keyExpr,
      expression: true,
    });
  }

  let keyFn = null;
  // New TSRX surfaces `key` on the JSXForExpression itself (read via `node.key`
  // below). Legacy / `<li key={…}>` attribute syntax is also accepted: scan the
  // body for the first Element and pull its `key=` attr if any. Accept both
  // the old `Element` IR and the raw new `JSXElement` shape that's reached
  // here when the body wasn't routed through normalizeChildren.
  const firstEl = subStmts.find(n => n.type === 'Element' || n.type === 'JSXElement');
  if (firstEl) {
    const keyAttr = (firstEl.attributes || firstEl.openingElement?.attributes || [])
      .find(a => (a.name?.name || a.name) === 'key');
    if (keyAttr) {
      const inner = keyAttr.value.type === 'JSXExpressionContainer' ? keyAttr.value.expression : keyAttr.value;
      keyFn = mkKeyFn(inner);
    }
  }
  if (!keyFn && node.key) {
    keyFn = mkKeyFn(node.key);
  }
  if (!keyFn && node.index) {
    // Index identifier — caller iterates with index, key by index.
    keyFn = `(${itemName}, ${node.index.name}) => ${node.index.name}`;
  }
  if (!keyFn) keyFn = `(${itemName}) => ${itemName}.id != null ? ${itemName}.id : ${itemName}`;

  // Key fn is hoisted (it doesn't typically capture parent state).
  const keyHelper = `_key$${ctx.nextHelperId++}`;
  ctx.hoistedHelpers.push(`const ${keyHelper} = ${keyFn};`);

  // When the for-of header declared `index <name>`, expose it as a `const`
  // at the top of the body — the runtime stamps `block.itemIndex` per item
  // on every mount + re-render so the user identifier always reflects the
  // current position.
  const indexInjection = node.index ? [{
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [{
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: node.index.name },
      init: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: '__block' },
        property: { type: 'Identifier', name: 'itemIndex' },
        computed: false,
      },
    }],
  }] : [];

  // Destructured header `const &{x,y} of …` — synthesize a destructure stmt
  // at the top of the body so the user fields bind from the synthetic item.
  const destructureInjection = isDestructured ? [{
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [{
      type: 'VariableDeclarator',
      id: leftDeclId,   // ObjectPattern / ArrayPattern (lazy flag dropped by printer)
      init: { type: 'Identifier', name: itemName },
    }],
  }] : [];

  // ─── Body analysis: PURE vs DEP-PURE vs normal.
  //
  // - PURE: body closes over nothing parent-reactive, no hooks, no comps,
  //   no control flow. Reconciler skips renderBlock when item ref + index
  //   unchanged. Identified by `pure = true`.
  // - DEP-PURE: body DOES close over parent locals but is otherwise as
  //   clean as PURE. The compiler emits an explicit deps array at the
  //   forBlock call site so the reconciler can do ONE deps-equality check
  //   per parent render and, if unchanged, treat the body as PURE for the
  //   survivor short-circuit. Saves the body call entirely for
  //   item-ref-and-index-stable survivors — no per-row snapshot work.
  // - NORMAL: anything else → body runs every render.
  let pure = false;
  const depNames = [];
  let depEligible = false;
  if (ctx.currentComponentLocals) {
    const bodyScope = new Set([itemName]);
    if (node.index) bodyScope.add(node.index.name);
    const bodyAst = { type: 'BlockStatement', body: subStmts };
    const free = collectFreeIdentifiers(bodyAst, bodyScope);
    let hasParentClosure = false;
    let hasHook = false;
    const seenDeps = new Set();
    for (const name of free) {
      if (HOOK_NAMES.has(name) || name === 'use') { hasHook = true; }
      if (ctx.currentComponentLocals.has(name)) {
        hasParentClosure = true;
        if (!seenDeps.has(name)) { seenDeps.add(name); depNames.push(name); }
      }
    }
    const hasNestedComp = containsComponentCallOrControlFlow(subStmts);
    pure = !hasParentClosure && !hasHook && !hasNestedComp;
    depEligible = !pure && hasParentClosure && !hasHook && !hasNestedComp;
    depNames.sort();
  }

  const itemHelperName = `__item$${ctx.nextHelperId++}`;
  const fakeComponent = {
    type: 'Component',
    id: { type: 'Identifier', name: itemHelperName },
    params: [{ type: 'Identifier', name: itemName }],
    body: [...indexInjection, ...destructureInjection, ...subStmts],
  };
  const itemFnSource = compileFunctionBody(fakeComponent, ctx, itemHelperName, parentNs, cssHash);
  inlinedSubs.push(itemFnSource + ';');

  // Single-root detection: when the body emits exactly one Element root and
  // no other JSX siblings (no Fragment, no Component, no top-level if/for/try),
  // the runtime can skip per-item Comment markers and use the row element
  // itself as the block boundary. For a 1000-row keyed list this removes 2000
  // Comment nodes from the parent — meaningful paint-time savings when the
  // parent is laid out per child (e.g. <tbody> in js-framework-benchmark).
  let singleRoot = false;
  {
    const jsxChildren = subStmts.filter(s => isJsxNode(s));
    if (jsxChildren.length === 1) {
      const c = jsxChildren[0];
      // Old IR uses `Element`; new TSRX AST uses `JSXElement`. Both qualify
      // for the singleRoot fast path so long as the tag is lowercase (so the
      // row itself is the block-boundary host, no Comment markers needed).
      if ((c.type === 'Element' || c.type === 'JSXElement') && !isComponentTag(c)) singleRoot = true;
    }
  }

  return {
    id: ctx.nextHelperId++,
    itemsExpr,
    keyHelper,
    bodyHelper: itemHelperName,
    extraExpr: 'undefined',
    pure,
    singleRoot,
    // DEP-PURE candidates emit `[dep0, dep1, ...]` as the deps arg in the
    // forBlock call. Reconciler compares to its cached deps; if unchanged
    // this render, treats the body as PURE for the survivor short-circuit.
    depEligible,
    depNames,
    // `@empty` branch helper name (or literal 'null' when none).
    emptyHelper: emptyHelperName,
    hostPath: null,
  };
}

// ===========================================================================
// Helpers
// ===========================================================================

/**
 * Detect short-circuit guards: `if (cond) return;` (at component-body level)
 * AND `if (cond) continue;` (inside a for-of body). Both have identical
 * compile-time semantics: "skip everything after this point" — for a component
 * body that means render nothing more; for a for-of item that means render
 * nothing more for THIS item but the next item still iterates.
 *
 * Accepts both no-braces (`if (x) continue;`) and single-statement-block
 * (`if (x) { continue; }`). Rejects forms with an alternate or a value-return.
 */
function isEarlyExitIf(stmt) {
  if (!stmt || stmt.type !== 'IfStatement' || stmt.alternate) return false;
  const c = stmt.consequent;
  if (isEarlyExitStatement(c)) return true;
  if (c.type === 'BlockStatement' && c.body.length === 1 && isEarlyExitStatement(c.body[0])) return true;
  return false;
}

function isEarlyExitStatement(s) {
  if (!s) return false;
  if (s.type === 'ReturnStatement' && s.argument == null) return true;
  if (s.type === 'ContinueStatement' && s.label == null) return true;
  return false;
}

/**
 * Rewrite early-exit guards into nested negated-condition if-blocks:
 *   stmt1; if (X) continue; stmt2; if (Y) return; stmt3;
 *   ⇒
 *   stmt1; if (!X) { stmt2; if (!Y) { stmt3; } }
 *
 * Each synthetic `if (!cond) { ... }` becomes an ifBlock at compile time.
 * Symbol-keyed hooks make it safe to declare hooks after an early exit.
 */
function rewriteEarlyExits(body) {
  const out = [];
  for (let i = 0; i < body.length; i++) {
    const stmt = body[i];
    if (isEarlyExitIf(stmt)) {
      const rest = rewriteEarlyExits(body.slice(i + 1));
      if (rest.length > 0) {
        out.push({
          type: 'IfStatement',
          test: { type: 'UnaryExpression', operator: '!', argument: stmt.test, prefix: true },
          consequent: { type: 'BlockStatement', body: rest },
          alternate: null,
        });
      }
      return out;
    }
    out.push(stmt);
  }
  return out;
}

function isJsxNode(node) {
  if (!node) return false;
  if (node.type === 'Element' || node.type === 'Text') return true;
  if (node.type === 'Tsx' || node.type === 'Tsrx') return true;
  if (node.type === 'JSXElement' || node.type === 'JSXFragment') return true;
  // New TSRX directive nodes — always JSX-position. normalizeChildren will
  // lower them to IfStatement / ForOfStatement / TryStatement / SwitchStatement
  // when planJsx runs over them.
  if (node.type === 'JSXIfExpression'
    || node.type === 'JSXForExpression'
    || node.type === 'JSXTryExpression'
    || node.type === 'JSXSwitchExpression'
    || node.type === 'JSXExpressionContainer'
    || node.type === 'JSXText'
    || node.type === 'JSXStyleElement') return true;
  if (node.type === 'IfStatement') {
    return bodyContainsJsx(node.consequent) || (!!node.alternate && bodyContainsJsx(node.alternate));
  }
  if (node.type === 'ForOfStatement') {
    return bodyContainsJsx(node.body);
  }
  if (node.type === 'TryStatement') {
    return bodyContainsJsx(node.block)
      || (!!node.handler && bodyContainsJsx(node.handler.body));
  }
  return false;
}

function bodyContainsJsx(node) {
  if (!node) return false;
  if (node.type === 'BlockStatement') return node.body.some(isJsxNode);
  return isJsxNode(node);
}

function walkExpr(rootVar, path) {
  if (path.length === 0) return rootVar;
  let expr = rootVar;
  for (let i = 0; i < path.length; i++) {
    const idx = path[i];
    expr = `${expr}.firstChild`;
    for (let n = 0; n < idx; n++) expr = `${expr}.nextSibling`;
  }
  return expr;
}

function allocTemplate(ctx, html, ns = 0, frag = 0) {
  const id = ctx.nextTemplateId++;
  const name = `_t$${id}`;
  ctx.hoistedTemplates.push({ name, html, ns, frag });
  return name;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function printNode(node) {
  const { code } = esrapPrint(node, esrapTsx());
  return code;
}

function printExpr(node) {
  // Wrap in an ExpressionStatement to get a printable form, then strip trailing `;`.
  const wrapped = { type: 'ExpressionStatement', expression: node };
  return printNode(wrapped).trim().replace(/;$/, '');
}

/**
 * Like printExpr, but first walks the AST and replaces any `<tsrx>...</tsrx>`
 * or `<tsx>...</tsx>` blocks with identifier references to hoisted render fns.
 * Used at attribute-value and prop-value sites where Tsrx is at expression position.
 */
function printExprWithTsrx(node, ctx, componentName, inlinedSubs) {
  const rewritten = rewriteTsrxBlocks(node, ctx, componentName, inlinedSubs);
  return printExpr(rewritten);
}

function mapAst(node, mutate) {
  if (node == null || typeof node !== 'object') return node;
  if (Array.isArray(node)) return node.map(c => mapAst(c, mutate));
  const replaced = mutate(node);
  if (replaced != null) return replaced;
  const out = {};
  for (const k in node) {
    if (k === 'loc' || k === 'start' || k === 'end' || k === 'metadata') { out[k] = node[k]; continue; }
    out[k] = mapAst(node[k], mutate);
  }
  return out;
}
