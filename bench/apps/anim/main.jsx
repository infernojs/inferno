// Move animations (inferno-animation AnimatedMoveComponent) on a keyed list of 100 items. Cases:
//   shuffle        every item moves (two fixed permutations, alternating), all items animate
//   rerender       the same order and labels rendered again: no item moves
//   update-text    one label changes, no item moves
//   grow           one item grows taller: the keys stay, its followers shift without animating
//   plain-shuffle  the shuffle with items that have no move hook (control)
//   leave-update   AnimatedAllComponent items: every 5th leaves while all others get new labels, so
//                  each leave is measured between writes of the same patch
//   fade-update    the same with AnimatedComponent items: enter/leave only, no move hooks
//   fade-enter     AnimatedComponent items: 20 new items enter between the 80 others
// prepare(case) mounts the list in its start state and resolves once earlier move animations
// have ended, so every measured op starts from settled styles.
import { render } from 'inferno';
import { AnimatedAllComponent, AnimatedComponent, AnimatedMoveComponent } from 'inferno-animation';
import { createOpButton, fnv1a, installHarness } from '../shared/harness.js';
import { createRandom } from '../shared/prng.js';

const N = 100;
const IDS = Array.from({ length: N }, (_, i) => i);

function permutation(seed) {
  const random = createRandom(seed);
  const out = IDS.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

const ORDER_A = permutation(1);
const ORDER_B = permutation(2);
const LABELS = IDS.map((i) => `item ${i}`);
const LABELS_CHANGED = LABELS.slice();
LABELS_CHANGED[50] = 'item 50 changed';
const LABELS_STARRED = LABELS.map((label) => `${label} *`);
const ORDER_A_THINNED = ORDER_A.filter((_, i) => i % 5 !== 0);

class AnimatedItem extends AnimatedMoveComponent {
  render() {
    return (
      <li className={this.props.tall ? 'item tall' : 'item'} $HasTextChildren>
        {this.props.label}
      </li>
    );
  }
}

class AnimatedAllItem extends AnimatedAllComponent {
  render() {
    return (
      <li className="item" $HasTextChildren>
        {this.props.label}
      </li>
    );
  }
}

class FadeItem extends AnimatedComponent {
  render() {
    return (
      <li className="item" $HasTextChildren>
        {this.props.label}
      </li>
    );
  }
}

function PlainItem({ label }) {
  return (
    <li className="item" $HasTextChildren>
      {label}
    </li>
  );
}

function List({ order, labels, animated, tall }) {
  return (
    <ul className="list" $HasKeyedChildren>
      {order.map((id) =>
        animated === 'all' ? (
          <AnimatedAllItem key={id} label={labels[id]} animation="Item" />
        ) : animated === 'fade' ? (
          <FadeItem key={id} label={labels[id]} animation="Item" />
        ) : animated ? (
          <AnimatedItem key={id} label={labels[id]} tall={id === tall} animation="Item" />
        ) : (
          <PlainItem key={id} label={labels[id]} />
        ),
      )}
    </ul>
  );
}

// [animated, [order, labels, tall item] of the start state, [order, labels, tall item] after the op]
const CASES = {
  shuffle: [true, [ORDER_A, LABELS], [ORDER_B, LABELS]],
  rerender: [true, [ORDER_A, LABELS], [ORDER_A, LABELS]],
  'update-text': [true, [ORDER_A, LABELS], [ORDER_A, LABELS_CHANGED]],
  grow: [true, [ORDER_A, LABELS], [ORDER_A, LABELS, 50]],
  'plain-shuffle': [false, [ORDER_A, LABELS], [ORDER_B, LABELS]],
  'leave-update': ['all', [ORDER_A, LABELS], [ORDER_A_THINNED, LABELS_STARRED]],
  'fade-update': ['fade', [ORDER_A, LABELS], [ORDER_A_THINNED, LABELS_STARRED]],
  'fade-enter': ['fade', [ORDER_A_THINNED, LABELS], [ORDER_A, LABELS]],
};

const container = document.getElementById('app');
let current = null;
let flip = false;

function show(state) {
  render(<List order={state[0]} labels={state[1]} tall={state[2]} animated={current[0]} />, container);
}

const op = createOpButton(() => {
  flip = !flip;
  show(flip ? current[2] : current[1]);
});

const settle = () => new Promise((resolve) => setTimeout(() => requestAnimationFrame(() => resolve(null)), 400));

installHarness({
  root: () => container,
  cases: Object.keys(CASES),
  prepare(name) {
    current = CASES[name];
    if (!current) {
      throw new Error(`Unknown anim case ${name}`);
    }
    flip = false;
    render(null, container);
    show(current[1]);
    return settle();
  },
  op,
  // Inline animation styles differ in flight; compare the rendered order and text only.
  extra: { checksum: () => fnv1a(container.textContent) },
});
