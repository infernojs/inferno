import { useState } from 'inferno-next';

// ---------------------------------------------------------------------------
// `style` prop — string form (cssText) inlined into the template.
// ---------------------------------------------------------------------------
export function StaticStringStyle() @{
  <div style='color: red; padding: 4px'>{'hi'}</div>
}

// Static object literal — serialized to a CSS string at compile time and
// inlined into the template HTML (zero runtime work).
export function StaticObjectStyle() @{
  <div id='box' style={{ 'background-color': 'red', 'text-align': 'center' }}>{'hi'}</div>
}

// Dynamic object style — goes through setStyle binding with per-property diff.
export function DynamicObjectStyle(props) @{
  <div id='dyn' style={props.s}>{'x'}</div>
}

// Dynamic string style — goes through setStyle cssText path.
export function DynamicStringStyle(props) @{
  <div id='ds' style={props.s}>{'y'}</div>
}

// `!important` priority — caller writes value as "red !important", runtime
// splits it and calls setProperty(name, value, 'important').
export function ImportantStyle(props) @{
  <div id='imp' style={props.s}>{'z'}</div>
}

// CSS custom property (`--var`) — must go through setProperty (you can't
// assign these via the camelCase shorthand).
export function CustomPropStyle(props) @{
  <div id='cp' style={props.s}>{'v'}</div>
}

// Style inside a for-of loop — verifies per-row independent style updates.
export function PerRowStyle(props) @{
  <ul>
    @for (const item of props.items; key item.id) {
      <li class={'r-' + item.id} style={item.s}>{item.label as string}</li>
    }
  </ul>
}

// ---------------------------------------------------------------------------
// `<style>` block — scoped CSS via the new @tsrx/core pipeline. The
// `{style 'cls'}` child-position intrinsic is gone; plain `class='foo'`
// on elements gets auto-hashed by the scoping pipeline whenever there's a
// `<style>` block in the same component matching `.foo`.
// ---------------------------------------------------------------------------

export function ScopedSingle() @{
  <>
    <div class='row'>{'r'}</div>
    <style>
      .row { color: rgb(10, 20, 30); }
    </style>
  </>
}

// Multiple instances share the same module-level <style> tag (idempotent).
export function ScopedReuse(props) @{
  <>
    <span class='tag'>{props.label as string}</span>
    <style>
      .tag { font-style: italic; }
    </style>
  </>
}

// A separate component with DIFFERENT CSS — must get its own hash so styles
// from `ScopedSingle` don't leak into it (and vice versa).
export function ScopedOther() @{
  <>
    <div class='row'>{'other'}</div>
    <style>
      .row { color: rgb(0, 200, 0); }
    </style>
  </>
}

// Multiple class names in one `class` attr — both get scoped via the hash so
// `.a` and `.b` selectors both match.
export function ScopedMultiClass() @{
  <>
    <div class='a b'>{'c'}</div>
    <style>
      .a { letter-spacing: 2px; }
      .b { text-decoration: underline; }
    </style>
  </>
}

// Scoped style on nested elements — descendant selectors should hit only the
// elements that themselves have the hash class.
export function ScopedNested() @{
  <>
    <div class='outer'>
      <span class='inner'>{'in'}</span>
      <span>{'unscoped'}</span>
    </div>
    <style>
      .outer .inner { font-weight: bold; }
    </style>
  </>
}

// Unscoped sibling (no <style> block) — has a class named "row" but should
// NOT pick up styles from `ScopedSingle.row`, because the hash class is the
// gate.
export function UnscopedLookalike() @{
  <div class='row'>{'plain'}</div>
}

// Dynamic class name through an expression — the scoping pipeline injects
// the hash automatically; the dynamic part appends as a normal token.
export function ScopedDynamic(props) @{
  <>
    <div class={props.cls}>{'d'}</div>
    <style>
      .alpha { color: rgb(11, 22, 33); }
      .beta  { color: rgb(44, 55, 66); }
    </style>
  </>
}

// Scoped class flips between values via state.
export function ScopedToggle() @{
  const [on, setOn] = useState(false);
  <>
    <div>
      <button id='t' onClick={() => setOn(!on)}>{'toggle'}</button>
      <span id='lbl' class={on ? 'on' : 'off'}>{'L'}</span>
    </div>
    <style>
      .on  { color: rgb(7, 7, 7); }
      .off { color: rgb(8, 8, 8); }
    </style>
  </>
}

// Mixing `<style>` and dynamic inline `style={...}` on the same element.
export function ScopedPlusInlineStyle(props) @{
  <>
    <div id='mix' class='base' style={props.s}>{'m'}</div>
    <style>
      .base { padding: 5px; }
    </style>
  </>
}

// `<style>` placed before any JSX — the style block can appear anywhere in
// the component body, not just after.
export function StyleAtTop() @{
  <>
    <style>
      .top { color: rgb(1, 2, 3); }
    </style>
    <div class='top'>{'T'}</div>
  </>
}
