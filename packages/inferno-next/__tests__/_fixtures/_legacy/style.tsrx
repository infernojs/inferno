import { useState } from 'inferno-next';

// ---------------------------------------------------------------------------
// `style` prop — string form (cssText) inlined into the template.
// ---------------------------------------------------------------------------
export component StaticStringStyle() {
  <div style='color: red; padding: 4px'>{text 'hi'}</div>
}

// Static object literal — serialized to a CSS string at compile time and
// inlined into the template HTML (zero runtime work).
export component StaticObjectStyle() {
  <div id='box' style={{ 'background-color': 'red', 'text-align': 'center' }}>{text 'hi'}</div>
}

// Dynamic object style — goes through setStyle binding with per-property diff.
export component DynamicObjectStyle(props) {
  <div id='dyn' style={props.s}>{text 'x'}</div>
}

// Dynamic string style — goes through setStyle cssText path.
export component DynamicStringStyle(props) {
  <div id='ds' style={props.s}>{text 'y'}</div>
}

// `!important` priority — caller writes value as "red !important", runtime
// splits it and calls setProperty(name, value, 'important').
export component ImportantStyle(props) {
  <div id='imp' style={props.s}>{text 'z'}</div>
}

// CSS custom property (`--var`) — must go through setProperty (you can't
// assign these via the camelCase shorthand).
export component CustomPropStyle(props) {
  <div id='cp' style={props.s}>{text 'v'}</div>
}

// Style inside a for-of loop — verifies per-row independent style updates.
export component PerRowStyle(props) {
  <ul>
    for (const item of props.items; key item.id) {
      <li class={'r-' + item.id} style={item.s}>{text item.label}</li>
    }
  </ul>
}

// ---------------------------------------------------------------------------
// `<style>` block + `{style 'cls'}` — scoped CSS injection at module level,
// hash class prefixed onto elements that opt-in via `{style ...}`.
// ---------------------------------------------------------------------------

export component ScopedSingle() {
  <div className={style 'row'}>{text 'r'}</div>
  <style>
    .row { color: rgb(10, 20, 30); }
  </style>
}

// Multiple instances share the same module-level <style> tag (idempotent).
export component ScopedReuse(props) {
  <span className={style 'tag'}>{text props.label}</span>
  <style>
    .tag { font-style: italic; }
  </style>
}

// A separate component with DIFFERENT CSS — must get its own hash so styles
// from `ScopedSingle` don't leak into it (and vice versa).
export component ScopedOther() {
  <div className={style 'row'}>{text 'other'}</div>
  <style>
    .row { color: rgb(0, 200, 0); }
  </style>
}

// `{style 'foo bar'}` with multiple class names — both get scoped via the
// hash class so selectors `.foo` and `.bar` both match this element.
export component ScopedMultiClass() {
  <div className={style 'a b'}>{text 'c'}</div>
  <style>
    .a { letter-spacing: 2px; }
    .b { text-decoration: underline; }
  </style>
}

// Scoped style on nested elements — descendant selectors should hit only the
// elements that themselves have the hash class.
export component ScopedNested() {
  <div className={style 'outer'}>
    <span className={style 'inner'}>{text 'in'}</span>
    <span>{text 'unscoped'}</span>
  </div>
  <style>
    .outer .inner { font-weight: bold; }
  </style>
}

// Unscoped sibling (no <style> block) — has a class named "row" but should
// NOT pick up styles from `ScopedSingle.row`, because the hash class is the
// gate.
export component UnscopedLookalike() {
  <div class='row'>{text 'plain'}</div>
}

// Dynamic class name through `{style (expr)}` — runtime concatenates hash + expr.
// TSRX requires parens around any non-literal `style` argument.
export component ScopedDynamic(props) {
  <div className={style (props.cls)}>{text 'd'}</div>
  <style>
    .alpha { color: rgb(11, 22, 33); }
    .beta  { color: rgb(44, 55, 66); }
  </style>
}

// Scoped class flips between values via state.
export component ScopedToggle() {
  const [on, setOn] = useState(false);
  <div>
    <button id='t' onClick={() => setOn(!on)}>{text 'toggle'}</button>
    <span id='lbl' className={style (on ? 'on' : 'off')}>{text 'L'}</span>
  </div>
  <style>
    .on  { color: rgb(7, 7, 7); }
    .off { color: rgb(8, 8, 8); }
  </style>
}

// Mixing `<style>` and dynamic inline `style={...}` on the same element.
export component ScopedPlusInlineStyle(props) {
  <div id='mix' className={style 'base'} style={props.s}>{text 'm'}</div>
  <style>
    .base { padding: 5px; }
  </style>
}

// `<style>` placed before any JSX — the style block can appear anywhere in
// the component body, not just after.
export component StyleAtTop() {
  <style>
    .top { color: rgb(1, 2, 3); }
  </style>
  <div className={style 'top'}>{text 'T'}</div>
}
