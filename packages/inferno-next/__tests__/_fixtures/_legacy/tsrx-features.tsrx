import { useState, useEffect } from 'inferno-next';

// ---------------------------------------------------------------------------
// SPREAD attributes — `<div {...obj}>` routes each key through the right
// setter at runtime, with diff cleanup of keys that vanished.
// ---------------------------------------------------------------------------

export component SpreadOnElement(props) {
  <div {...props.attrs} id='target'>{text 'spread'}</div>
}

// Spread combined with explicit attrs — explicit wins on key collision because
// it's emitted later in the binding order.
export component SpreadWithExplicit(props) {
  <div {...props.attrs} class='explicit-wins'>{text 'mix'}</div>
}

// Component-level spread — merged into the props object.
component SpreadChild(props) {
  <span id='child' class={props.cls}>{text props.label + (props.tag || '')}</span>
}

export component SpreadOnComponent(props) {
  <SpreadChild {...props.child}/>
}

// ---------------------------------------------------------------------------
// Boolean / shorthand / numeric / namespaced attrs
// ---------------------------------------------------------------------------

// `<input disabled/>` — no `=` → present in HTML, runtime sees the attribute.
export component BooleanAttr() {
  <input id='bool' disabled type='text'/>
}

// `<input maxLength={n}/>` — dynamic numeric attribute → setAttribute path.
export component DynamicNumericAttr(props) {
  <input id='num' maxLength={props.n} type='text'/>
}

// `<div {value}/>` — TSRX shorthand for `value={value}`. The local binds to the
// attribute via the identifier name (parsed as `Attribute { shorthand: true }`).
export component ShorthandAttr(props) {
  const id = props.id;
  <div {id}>{text 'shorthand'}</div>
}

// SVG with `xlink:href` — namespaced attribute. TSRX parses the colon-prefixed
// form as a JSXNamespacedName; the compiler emits it as a regular setAttribute
// with the full qualified name (browser handles the xlink namespace).
export component NamespacedAttr(props) {
  <svg viewBox='0 0 50 50'>
    <use id='use-el' xlink:href={props.href}/>
  </svg>
}

// ---------------------------------------------------------------------------
// For-of header variants — `index`, `key`, and both together.
// ---------------------------------------------------------------------------

export component ForOfIndexOnly(props) {
  <ul>
    for (const item of props.items; index i) {
      <li class={'i-' + i}>{text i + ':' + item}</li>
    }
  </ul>
}

export component ForOfIndexAndKey(props) {
  <ul>
    for (const item of props.items; index i; key item.id) {
      <li class={'k-' + item.id}>{text i + ':' + item.label}</li>
    }
  </ul>
}

// ---------------------------------------------------------------------------
// Ternary with FRAGMENT branches — the only ternary-JSX form TSRX accepts.
// Our compiler lowers it to ifBlock so each branch mounts real DOM.
// ---------------------------------------------------------------------------

export component TernaryFragmentChild(props) {
  <div>{props.cond ? <><span class='yes'>{text 'yes'}</span></> : <><span class='no'>{text 'no'}</span></>}</div>
}

// ---------------------------------------------------------------------------
// {html ...} only-child — confirms the innerHTML binding actually applies.
// ---------------------------------------------------------------------------

export component HtmlOnlyChild(props) {
  <div id='html-host'>{html props.markup}</div>
}

// ---------------------------------------------------------------------------
// Fragment body inside a for-of with `key` in the header — each iteration
// produces MULTIPLE root nodes that must move together when items reorder.
// Matches React's `<Fragment key={x.id}><li/><li/></Fragment>` pattern.
// ---------------------------------------------------------------------------

export component KeyedFragmentItems(props) {
  <ul>
    for (const x of props.items; key x.id) {
      <>
        <li class={'a-' + x.id}>{text x.label + '-a'}</li>
        <li class={'b-' + x.id}>{text x.label + '-b'}</li>
      </>
    }
  </ul>
}

// ---------------------------------------------------------------------------
// Lazy destructuring `&{}` / `&[]` — TSRX-specific syntax that other
// endpoints can use for reactivity gains. Our model re-runs whole bodies on
// every render, so the lazy flag has no semantic effect — we accept the
// syntax and emit plain destructuring (esrap drops the marker).
// ---------------------------------------------------------------------------

export component LazyObjectDestructure(props) {
  const &{ first, last } = props.user;
  <div id='lazy-obj'>{text first + ' ' + last}</div>
}

export component LazyArrayDestructure(props) {
  const &[head, ...tail] = props.items;
  <div id='lazy-arr'>{text 'head=' + head + ' rest=' + tail.length}</div>
}

// Lazy destructuring as a COMPONENT PARAMETER — the body sees fields
// destructured directly from the props object.
export component LazyParamDestructure(&{ greeting, name }) {
  <div id='lazy-param'>{text greeting + ', ' + name}</div>
}

// Lazy destructuring inside a FOR-OF HEAD — keyFn picks up the same
// destructure pattern so `key id` resolves the destructured field.
export component LazyForOfHead(props) {
  <ul>
    for (const &{ id, label } of props.items; key id) {
      <li class={'item-' + id}>{text label}</li>
    }
  </ul>
}

// ---------------------------------------------------------------------------
// Shorthand props on a COMPONENT — `<Foo {value}/>` is equivalent to
// `<Foo value={value}/>`. The compiler's prop-object builder treats it like
// any other Attribute (the parser tags `shorthand: true` for the prop name
// matches the value identifier, but our codegen path is uniform).
// ---------------------------------------------------------------------------

component ShorthandChild(props) {
  <span id='child'>{text props.label + ':' + props.count}</span>
}

export component ShorthandComponentProp() {
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
export component PureForOf(props) {
  <ul>
    for (const row of props.items; key row.id) {
      <li class={'r-' + row.id}>{text row.label}</li>
    }
  </ul>
}

// IMPURE: body reads `selected` from parent scope → must re-render survivors
// when parent state changes (otherwise the row's class won't reflect new
// selected state).
export component ImpureForOf(props) {
  <ul>
    for (const row of props.items; key row.id) {
      <li class={props.selected === row.id ? 'sel' : ''}>{text row.label}</li>
    }
  </ul>
}
