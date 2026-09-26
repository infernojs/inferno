// Event dispatch: a click on one list item through Inferno's delegation
// (synthetic onClick), linkEvent, and native (lowercase onclick) listeners,
// plus a deep target so the delegated parentNode walk is visible.
import { linkEvent, render } from 'inferno';
import { byId, click, defineCase, newContainer } from './common.js';

const N = 500;
let handled = 0;

function handler() {
  handled++;
}

function linked(data) {
  handled += data & 1;
}

const lists = {
  synthetic: () => {
    const out = [];
    for (let i = 0; i < N; i++) {
      out.push(
        <li id={`i${i}`} onClick={handler} $HasTextChildren>
          {i}
        </li>,
      );
    }
    return <ul $HasNonKeyedChildren>{out}</ul>;
  },
  'synthetic-linkEvent': () => {
    const out = [];
    for (let i = 0; i < N; i++) {
      out.push(
        <li id={`i${i}`} onClick={linkEvent(i, linked)} $HasTextChildren>
          {i}
        </li>,
      );
    }
    return <ul $HasNonKeyedChildren>{out}</ul>;
  },
  native: () => {
    const out = [];
    for (let i = 0; i < N; i++) {
      out.push(
        <li id={`i${i}`} onclick={handler} $HasTextChildren>
          {i}
        </li>,
      );
    }
    return <ul $HasNonKeyedChildren>{out}</ul>;
  },
};

function deepTree(depth) {
  let node = (
    <span id="deep-target" $HasTextChildren>
      x
    </span>
  );
  for (let i = 0; i < depth; i++) {
    node = <div className={`d${i}`}>{node}</div>;
  }
  return <div onClick={handler}>{node}</div>;
}

export const cases = {};
for (const [name, tree] of Object.entries(lists)) {
  let container = null;
  let target = null;
  cases[`events/dispatch/${name}`] = defineCase({
    iterations: 2000,
    warmup: 200,
    setup() {
      container = newContainer();
      render(tree(), container);
      target = byId(container, `i${N >> 1}`);
    },
    op: () => click(target),
    root: () => container,
  });
}

{
  let container = null;
  let target = null;
  cases['events/dispatch/synthetic-depth-30'] = defineCase({
    iterations: 2000,
    warmup: 200,
    setup() {
      container = newContainer();
      render(deepTree(30), container);
      target = byId(container, 'deep-target');
    },
    op: () => click(target),
    root: () => container,
  });
}

export const handledCount = () => handled;
