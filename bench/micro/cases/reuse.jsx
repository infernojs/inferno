// vNodes referenced outside of render (hoisted, memoized, passed as children):
// the paths the bench branch stopped cloning, measured against 9.1.0.
import { render } from 'inferno';
import { defineCase, newContainer } from './common.js';

const N = 1000;
const ITEMS = Array.from({ length: N }, (_, i) => ({ id: i, label: `row ${i}` }));

// A hoisted constant, placed in every row.
const ICON = <span className="icon" />;

function hoistedRows() {
  const out = [];
  for (let i = 0; i < N; i++) {
    out.push(
      <li key={i} $HasNonKeyedChildren>
        {[ICON, <b $HasTextChildren>{ITEMS[i].label}</b>]}
      </li>,
    );
  }
  return <ul $HasKeyedChildren>{out}</ul>;
}

function Wrapper({ children }) {
  return <div className="wrap">{children}</div>;
}

// Children created once and passed to a component on every render.
const CONTENT = ITEMS.map((item) => <p $HasTextChildren>{item.label}</p>);

function wrappedRows() {
  const out = [];
  for (let i = 0; i < N; i++) {
    out.push(<Wrapper key={i}>{CONTENT[i]}</Wrapper>);
  }
  return <div $HasKeyedChildren>{out}</div>;
}

// The same root vNode rendered again.
const ROOT = (
  <ul $HasKeyedChildren>
    {ITEMS.map((item) => (
      <li key={item.id} $HasTextChildren>
        {item.label}
      </li>
    ))}
  </ul>
);

// Unkeyed children without a flag: normalization gives every child an index key.
function unkeyedRows() {
  const out = [];
  for (let i = 0; i < N; i++) {
    out.push(<li $HasTextChildren>{ITEMS[i].label}</li>);
  }
  return <ul>{out}</ul>;
}

function rerenderCase(tree) {
  let container = null;
  return defineCase({
    iterations: 150,
    warmup: 30,
    setup: () => {
      container = newContainer();
      render(tree(), container);
    },
    op: () => render(tree(), container),
    root: () => container,
  });
}

export const cases = {
  'reuse/hoisted-in-rows-1k': rerenderCase(hoistedRows),
  'reuse/props-children-1k': rerenderCase(wrappedRows),
  'reuse/same-root-1k': rerenderCase(() => ROOT),
  'reuse/normalize-unkeyed-1k': rerenderCase(unkeyedRows),
};
