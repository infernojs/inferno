import { useState, useEffect } from 'inferno-next';

// ---------------------------------------------------------------------------
// SPREAD attributes — `<div {...obj}>` routes each key through the right
// setter at runtime, with diff cleanup of keys that vanished.
// ---------------------------------------------------------------------------

export function SpreadOnElement(props) @{
  <div {...props.attrs} id='target'>{'spread'}</div>
}

// Spread combined with explicit attrs — explicit wins on key collision because
// it's emitted later in the binding order.
export function SpreadWithExplicit(props) @{
  <div {...props.attrs} class='explicit-wins'>{'mix'}</div>
}

// Component-level spread — merged into the props object.
function SpreadChild(props) @{
  <span id='child' class={props.cls}>{(props.label + (props.tag || '')) as string}</span>
}

export function SpreadOnComponent(props) @{
  <SpreadChild {...props.child}/>
}

// ---------------------------------------------------------------------------
// Boolean / shorthand / numeric / namespaced attrs
// ---------------------------------------------------------------------------

// `<input disabled/>` — no `=` → present in HTML, runtime sees the attribute.
export function BooleanAttr() @{
  <input id='bool' disabled type='text'/>
}

// `<input maxLength={n}/>` — dynamic numeric attribute → setAttribute path.
export function DynamicNumericAttr(props) @{
  <input id='num' maxLength={props.n} type='text'/>
}

// `<div {value}/>` — TSRX shorthand for `value={value}`. The local binds to the
// attribute via the identifier name (parsed as `Attribute { shorthand: true }`).
export function ShorthandAttr(props) @{
  const id = props.id;
  <div {id}>{'shorthand'}</div>
}

// SVG with `xlink:href` — namespaced attribute. TSRX parses the colon-prefixed
// form as a JSXNamespacedName; the compiler emits it as a regular setAttribute
// with the full qualified name (browser handles the xlink namespace).
export function NamespacedAttr(props) @{
  <svg viewBox='0 0 50 50'>
    <use id='use-el' xlink:href={props.href}/>
  </svg>
}

// ---------------------------------------------------------------------------
// For-of header variants — `index`, `key`, and both together.
// ---------------------------------------------------------------------------

export function ForOfIndexOnly(props) @{
  <ul>
    @for (const item of props.items; index i) {
      <li class={'i-' + i}>{(i + ':' + item) as string}</li>
    }
  </ul>
}

export function ForOfIndexAndKey(props) @{
  <ul>
    @for (const item of props.items; index i; key item.id) {
      <li class={'k-' + item.id}>{(i + ':' + item.label) as string}</li>
    }
  </ul>
}

// ---------------------------------------------------------------------------
// Ternary with FRAGMENT branches — the only ternary-JSX form TSRX accepts.
// Our compiler lowers it to ifBlock so each branch mounts real DOM.
// ---------------------------------------------------------------------------

export function TernaryFragmentChild(props) @{
  <div>{props.cond ? <><span class='yes'>{'yes'}</span></> : <><span class='no'>{'no'}</span></>}</div>
}

// ---------------------------------------------------------------------------
// `innerHTML={…}` attribute — replaces the old `{html expr}` child-position
// intrinsic. When this is the only "child" path on a host, the compiler emits
// the innerHTML-assignment fast path.
// ---------------------------------------------------------------------------

export function HtmlOnlyChild(props) @{
  <div id='html-host' innerHTML={props.markup} />
}

// ---------------------------------------------------------------------------
// Fragment body inside a for-of with `key` in the header — each iteration
// produces MULTIPLE root nodes that must move together when items reorder.
// Matches React's `<Fragment key={x.id}><li/><li/></Fragment>` pattern.
// ---------------------------------------------------------------------------

export function KeyedFragmentItems(props) @{
  <ul>
    @for (const x of props.items; key x.id) {
      <>
        <li class={'a-' + x.id}>{(x.label + '-a') as string}</li>
        <li class={'b-' + x.id}>{(x.label + '-b') as string}</li>
      </>
    }
  </ul>
}

// ---------------------------------------------------------------------------
// Lazy destructuring `&{}` / `&[]` — TSRX-specific syntax preserved across
// the migration. Our model re-runs whole bodies on every render, so the
// lazy flag has no semantic effect — we accept the syntax (parser tracks it
// via metadata) and let @tsrx/core's applyLazyTransforms lower it.
// ---------------------------------------------------------------------------

export function LazyObjectDestructure(props) @{
  const &{ first, last } = props.user;
  <div id='lazy-obj'>{(first + ' ' + last) as string}</div>
}

export function LazyArrayDestructure(props) @{
  const &[head, ...tail] = props.items;
  <div id='lazy-arr'>{('head=' + head + ' rest=' + tail.length) as string}</div>
}

// Lazy destructuring as a COMPONENT PARAMETER — the body sees fields
// destructured directly from the props object.
export function LazyParamDestructure(&{ greeting, name }) @{
  <div id='lazy-param'>{(greeting + ', ' + name) as string}</div>
}

// Lazy destructuring inside a FOR-OF HEAD — keyFn picks up the same
// destructure pattern so `key id` resolves the destructured field.
export function LazyForOfHead(props) @{
  <ul>
    @for (const &{ id, label } of props.items; key id) {
      <li class={'item-' + id}>{label as string}</li>
    }
  </ul>
}

// ---------------------------------------------------------------------------
// Shorthand props on a COMPONENT — `<Foo {value}/>` is equivalent to
// `<Foo value={value}/>`. The compiler's prop-object builder treats it like
// any other Attribute (the parser tags `shorthand: true` for the prop name
// matches the value identifier, but our codegen path is uniform).
// ---------------------------------------------------------------------------

function ShorthandChild(props) @{
  <span id='child'>{(props.label + ':' + props.count) as string}</span>
}

export function ShorthandComponentProp() @{
  const label = 'count';
  const count = 7;
  <ShorthandChild {label} {count}/>
}

// ---------------------------------------------------------------------------
// Auto-memo: for-of bodies that don't close over parent locals OR call hooks
// OR mount components are statically detected as PURE — survivors with
// unchanged item refs skip the body re-render entirely. The fixture exposes
// a `renderCount` side effect via a non-component callback so the test can
// prove skipping happened.
// ---------------------------------------------------------------------------

// PURE: body uses only `row` (the item) — no parent closures, no hooks, no
// component calls. Should be marked pure → survivors skip renderBlock.
export function PureForOf(props) @{
  <ul>
    @for (const row of props.items; key row.id) {
      <li class={'r-' + row.id}>{row.label as string}</li>
    }
  </ul>
}

// IMPURE: body reads `selected` from parent scope → must re-render survivors
// when parent state changes (otherwise the row's class won't reflect new
// selected state).
export function ImpureForOf(props) @{
  <ul>
    @for (const row of props.items; key row.id) {
      <li class={props.selected === row.id ? 'sel' : ''}>{row.label as string}</li>
    }
  </ul>
}
