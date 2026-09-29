// Move hooks (componentWillMove / onComponentWillMove, used by inferno-animation):
//   anim-owner/*  the jfb operations while one component with a move hook is mounted elsewhere,
//                 so the reconciler has to look for move hooks in every keyed list
//   anim/*        keyed lists whose items all have a move hook (the hooks do nothing, so only
//                 the reconciler's move bookkeeping is measured)
import { Component, render } from 'inferno';
import { Main as KeyedMain } from '../../apps/jfb-keyed/app.jsx';
import { jfbCases } from './jfb.jsx';
import { defineCase, newContainer } from './common.js';

class MoveOwner extends Component {
  componentWillMove() {}

  render() {
    return <div className="move-owner" />;
  }
}

function mountMoveOwner() {
  render(<MoveOwner />, newContainer());
}

class ClassItem extends Component {
  componentWillMove() {}

  render() {
    return (
      <li className="item" $HasTextChildren>
        {this.props.label}
      </li>
    );
  }
}

function noopMove() {}

function FunctionItem({ label }) {
  return (
    <li className="item" $HasTextChildren>
      {label}
    </li>
  );
}

const N = 100;
const IDS = Array.from({ length: N }, (_, i) => i);
const LABELS = IDS.map((i) => `item ${i}`).concat(['new item']);

const CHANGED_LABELS = LABELS.slice();
CHANGED_LABELS[50] = 'item 50 changed';

const SWAPPED = IDS.slice();
SWAPPED[1] = IDS[98];
SWAPPED[98] = IDS[1];

// [order, labels] pairs; every op switches to the other state, so each iteration does the same work.
const STATES = {
  'rerender-same': [
    [IDS, LABELS],
    [IDS, LABELS],
  ],
  'update-one-text': [
    [IDS, LABELS],
    [IDS, CHANGED_LABELS],
  ],
  swap: [
    [IDS, LABELS],
    [SWAPPED, LABELS],
  ],
  reverse: [
    [IDS, LABELS],
    [IDS.slice().reverse(), LABELS],
  ],
  'insert-remove': [
    [IDS, LABELS],
    [[N].concat(IDS), LABELS],
  ],
};

function classList([order, labels]) {
  return (
    <ul $HasKeyedChildren>
      {order.map((id) => (
        <ClassItem key={id} label={labels[id]} />
      ))}
    </ul>
  );
}

function functionList([order, labels]) {
  return (
    <ul $HasKeyedChildren>
      {order.map((id) => (
        <FunctionItem key={id} label={labels[id]} onComponentWillMove={noopMove} />
      ))}
    </ul>
  );
}

function listCase(list, states) {
  let container = null;
  let flip = false;
  return defineCase({
    iterations: 400,
    warmup: 50,
    setup: () => {
      container = newContainer();
      render(list(states[0]), container);
    },
    op: () => {
      flip = !flip;
      render(list(states[flip ? 1 : 0]), container);
    },
    root: () => container,
  });
}

const listCases = {};
for (const name of Object.keys(STATES)) {
  listCases[`anim/class-list-${N}/${name}`] = listCase(classList, STATES[name]);
  listCases[`anim/function-list-${N}/${name}`] = listCase(functionList, STATES[name]);
}

export const cases = {
  ...jfbCases('anim-owner/keyed', KeyedMain, mountMoveOwner),
  ...listCases,
};
