// inferno-animation on keyed lists (100 items unless noted). Cases:
//   shuffle            every item moves (two fixed permutations, alternating), all items animate
//   rerender           the same order and labels rendered again: no item moves
//   update-text        one label changes, no item moves
//   grow               one item grows taller: the keys stay, its followers shift without animating
//   plain-shuffle      the shuffle with items that have no move hook (control)
//   leave-update       AnimatedAllComponent items: every 5th leaves while all others get new labels,
//                      so each leave is measured between writes of the same patch
//   fade-update        the same with AnimatedComponent items: enter/leave only, no move hooks
//   fade-enter         AnimatedComponent items: 20 new items enter between the 80 others
//   deep-shuffle-5     the shuffle with the list 5 wrapper elements deep
//   deep-shuffle-30    ... 30 wrapper elements deep (moves walk the ancestors)
//   scaled-shuffle     the shuffle inside a scale(0.5) ancestor
//   keyframed-shuffle  the shuffle while every item runs a transform keyframe animation
//   inline-anim-shuffle  the shuffle with a new animation={{…}} object per item and render
//   fn-shuffle         the shuffle with function components and onComponentWillMove
//   shuffle-1k         the shuffle with 1000 items
//   rerender-1k        the rerender with 1000 items
//   retarget           a second shuffle while the first one's 1 s moves run
//   leave-mid-move     AnimatedAllComponent: every 5th leaves while 1 s moves run
//   leave-mid-enter    AnimatedComponent: 20 items leave while their 1 s enter runs
//   leave-mid-enter-1k AnimatedComponent: 1000 items that are all entering (1 s) leave
//   move-mid-move-1k   one of 1000 items goes last while the 1 s moves of all of them run
//   move-mid-enter-1k  AnimatedAllComponent: 500 items reverse while 500 new ones enter, then
//                      reverse back while those 1 s moves and enters run
//   moved-mid-enter-1k the same with the usual 150 ms moves, 400 ms later: the moves have ended
//   nested-groups      5 animated groups of 20 animated items: groups and items all reverse
//   global-switch      20 tiles with a globalAnimationKey move from one page to another
// prepare(case) empties the container, mounts the start state and resolves once earlier
// animations have ended, so every measured op starts from settled styles. Cases with a prime
// state render it at the end of prepare, so the op lands while its animations run.
// startLoop()/stopLoop(): seeded random insert/remove/move edits of AnimatedAllComponent items,
// sometimes two in one task (loop workload anim:stress, frames mode).
import { render } from 'inferno';
import { AnimatedAllComponent, AnimatedComponent, AnimatedMoveComponent, componentWillMove } from 'inferno-animation';
import { createOpButton, fnv1a, installHarness } from '../shared/harness.js';
import { createRandom } from '../shared/prng.js';

function range(n) {
  return Array.from({ length: n }, (_, i) => i);
}

function permutation(ids, seed) {
  const random = createRandom(seed);
  const out = ids.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

const IDS = range(100);
const ORDER_A = permutation(IDS, 1);
const ORDER_B = permutation(IDS, 2);
const ORDER_C = permutation(IDS, 3);
const LABELS = IDS.map((i) => `item ${i}`);
const LABELS_CHANGED = LABELS.slice();
LABELS_CHANGED[50] = 'item 50 changed';
const LABELS_STARRED = LABELS.map((label) => `${label} *`);
const ORDER_A_THINNED = ORDER_A.filter((_, i) => i % 5 !== 0);
const ORDER_B_THINNED = ORDER_B.filter((_, i) => i % 5 !== 0);

const IDS_1K = range(1000);
const ORDER_A_1K = permutation(IDS_1K, 1);
const ORDER_B_1K = permutation(IDS_1K, 2);
const LABELS_1K = IDS_1K.map((i) => `item ${i}`);
// The first item goes last, so every item moves; then the item at index 900 goes last
const ORDER_1K_ROTATED = IDS_1K.slice(1).concat(0);
const ORDER_1K_TAIL = ORDER_1K_ROTATED.filter((id) => id !== 901).concat(901);
const IDS_500 = range(500);
const ORDER_1K_HEAD_REVERSED = IDS_500.slice().reverse().concat(IDS_1K.slice(500));

class AnimatedItem extends AnimatedMoveComponent {
  render() {
    const { tall, pulse } = this.props;
    return (
      <li className={tall ? 'item tall' : pulse ? 'item pulse' : 'item'} $HasTextChildren>
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

function FnItem({ label }) {
  return (
    <li className="item" $HasTextChildren>
      {label}
    </li>
  );
}

// animated: 'all' | 'fade' | 'fn' | 'inline' | true (AnimatedMoveComponent) | false (plain)
function item(animated, id, labels, tall, pulse) {
  switch (animated) {
    case 'all':
      return <AnimatedAllItem key={id} label={labels[id]} animation="Item" />;
    case 'fade':
      return <FadeItem key={id} label={labels[id]} animation="Item" />;
    case 'fn':
      return <FnItem key={id} label={labels[id]} onComponentWillMove={componentWillMove} />;
    case 'inline':
      return <AnimatedItem key={id} label={labels[id]} animation={{ start: 'Item-move', active: 'Item-move-active', end: 'Item-move-end' }} />;
    case false:
      return <PlainItem key={id} label={labels[id]} />;
    default:
      return <AnimatedItem key={id} label={labels[id]} tall={id === tall} pulse={pulse} animation="Item" />;
  }
}

function List({ order, labels, animated, tall, pulse }) {
  return (
    <ul className="list" $HasKeyedChildren>
      {order.map((id) => item(animated, id, labels, tall, pulse))}
    </ul>
  );
}

function wrap(depth, className, child) {
  let node = child;
  for (let i = 0; i < depth; i++) {
    node = <div className={i === depth - 1 ? className : 'wrap'}>{node}</div>;
  }
  return node;
}

class Group extends AnimatedMoveComponent {
  render() {
    const { id, order } = this.props;
    return (
      <li className="group">
        <ul className="list" $HasKeyedChildren>
          {order.map((i) => (
            <AnimatedItem key={i} label={`g${id} item ${i}`} animation="Item" />
          ))}
        </ul>
      </li>
    );
  }
}

const GROUPS = range(5);
const GROUPS_REVERSED = GROUPS.slice().reverse();
const GROUP_ITEMS = range(20);
const GROUP_ITEMS_REVERSED = GROUP_ITEMS.slice().reverse();

function Groups({ reversed }) {
  return (
    <ul className="groups" $HasKeyedChildren>
      {(reversed ? GROUPS_REVERSED : GROUPS).map((g) => (
        <Group key={g} id={g} order={reversed ? GROUP_ITEMS_REVERSED : GROUP_ITEMS} animation="Item" />
      ))}
    </ul>
  );
}

class Tile extends AnimatedComponent {
  render() {
    return (
      <div className="tile" $HasTextChildren>
        {this.props.label}
      </div>
    );
  }
}

const TILES = range(20);
const TILES_REVERSED = TILES.slice().reverse();

function Page({ name, order }) {
  return (
    <div className={`page page-${name}`} $HasKeyedChildren>
      {order.map((i) => (
        <Tile key={i} label={`tile ${i}`} globalAnimationKey={`tile-${i}`} animation="Item" />
      ))}
    </div>
  );
}

const list = (animated, pulse) => (s) => <List order={s[0]} labels={s[1]} tall={s[2]} animated={animated} pulse={pulse} />;
const shuffle = { start: [ORDER_A, LABELS], op: [ORDER_B, LABELS] };

// view(state) renders a state; start and op alternate on each op; prime is rendered at the end
// of prepare; settle is how long animations from earlier renders need (ms)
const CASES = {
  shuffle: { view: list(true), ...shuffle },
  rerender: { view: list(true), start: [ORDER_A, LABELS], op: [ORDER_A, LABELS] },
  'update-text': { view: list(true), start: [ORDER_A, LABELS], op: [ORDER_A, LABELS_CHANGED] },
  grow: { view: list(true), start: [ORDER_A, LABELS], op: [ORDER_A, LABELS, 50] },
  'plain-shuffle': { view: list(false), ...shuffle },
  'leave-update': { view: list('all'), start: [ORDER_A, LABELS], op: [ORDER_A_THINNED, LABELS_STARRED] },
  'fade-update': { view: list('fade'), start: [ORDER_A, LABELS], op: [ORDER_A_THINNED, LABELS_STARRED] },
  'fade-enter': { view: list('fade'), start: [ORDER_A_THINNED, LABELS], op: [ORDER_A, LABELS] },
  'deep-shuffle-5': { view: (s) => wrap(5, 'deep', list(true)(s)), ...shuffle },
  'deep-shuffle-30': { view: (s) => wrap(30, 'deep', list(true)(s)), ...shuffle },
  'scaled-shuffle': { view: (s) => wrap(1, 'scaled', list(true)(s)), ...shuffle },
  'keyframed-shuffle': { view: list(true, true), ...shuffle },
  'inline-anim-shuffle': { view: list('inline'), ...shuffle },
  'fn-shuffle': { view: list('fn'), ...shuffle },
  'shuffle-1k': { view: list(true), start: [ORDER_A_1K, LABELS_1K], op: [ORDER_B_1K, LABELS_1K] },
  'rerender-1k': { view: list(true), start: [ORDER_A_1K, LABELS_1K], op: [ORDER_A_1K, LABELS_1K] },
  retarget: { view: (s) => wrap(1, 'slow', list(true)(s)), start: [ORDER_A, LABELS], prime: [ORDER_B, LABELS], op: [ORDER_C, LABELS], settle: 1400 },
  'leave-mid-move': {
    view: (s) => wrap(1, 'slow', list('all')(s)),
    start: [ORDER_A, LABELS],
    prime: [ORDER_B, LABELS],
    op: [ORDER_B_THINNED, LABELS],
    settle: 1400,
  },
  'leave-mid-enter': {
    view: (s) => wrap(1, 'slow', list('fade')(s)),
    start: [ORDER_A_THINNED, LABELS],
    prime: [ORDER_A, LABELS],
    op: [ORDER_A_THINNED, LABELS],
    settle: 1400,
  },
  'leave-mid-enter-1k': {
    view: (s) => wrap(1, 'slow', list('fade')(s)),
    start: [[], LABELS_1K],
    prime: [IDS_1K, LABELS_1K],
    op: [[], LABELS_1K],
    settle: 1400,
  },
  'move-mid-move-1k': {
    view: (s) => wrap(1, 'slow', list(true)(s)),
    start: [IDS_1K, LABELS_1K],
    prime: [ORDER_1K_ROTATED, LABELS_1K],
    op: [ORDER_1K_TAIL, LABELS_1K],
    settle: 1400,
  },
  'move-mid-enter-1k': {
    view: (s) => wrap(1, 'slow', list('all')(s)),
    start: [IDS_500, LABELS_1K],
    prime: [ORDER_1K_HEAD_REVERSED, LABELS_1K],
    op: [IDS_1K, LABELS_1K],
    settle: 1400,
  },
  'moved-mid-enter-1k': {
    view: (s) => wrap(1, 'slow-enter', list('all')(s)),
    start: [IDS_500, LABELS_1K],
    prime: [ORDER_1K_HEAD_REVERSED, LABELS_1K],
    primeWait: 400,
    op: [IDS_1K, LABELS_1K],
    settle: 1400,
  },
  'nested-groups': { view: (s) => <Groups reversed={s} />, start: false, op: true },
  'global-switch': {
    view: (s) => (s ? <Page key="b" name="b" order={TILES_REVERSED} /> : <Page key="a" name="a" order={TILES} />),
    start: false,
    op: true,
  },
};

const container = document.getElementById('app');
let current = null;
let flip = false;

function show(state) {
  render(current.view(state), container);
}

const op = createOpButton(() => {
  flip = !flip;
  show(flip ? current.op : current.start);
});

const wait = (ms) => new Promise((resolve) => setTimeout(() => requestAnimationFrame(() => resolve(null)), ms));
const frames = (n) =>
  new Promise((resolve) => {
    const step = () => (--n <= 0 ? resolve(null) : requestAnimationFrame(step));
    requestAnimationFrame(step);
  });

// Stress loop: random edits of an AnimatedAllComponent list of 20 to 100 items
const ANY_LABELS = new Proxy({}, { get: (_, id) => `item ${String(id)}` });
let loopTimer = 0;

function startLoop() {
  const random = createRandom(7);
  let nextId = 0;
  let order = range(60).map(() => nextId++);
  current = { view: (o) => <List order={o} labels={ANY_LABELS} animated="all" /> };
  const edit = () => {
    order = order.slice();
    const kind = random();
    const count = 1 + Math.floor(random() * 3);
    for (let n = 0; n < count; n++) {
      if (kind < 0.33 && order.length > 20) {
        order.splice(Math.floor(random() * order.length), 1);
      } else if (kind < 0.66 && order.length < 100) {
        order.splice(Math.floor(random() * (order.length + 1)), 0, nextId++);
      } else {
        const [moved] = order.splice(Math.floor(random() * order.length), 1);
        order.splice(Math.floor(random() * (order.length + 1)), 0, moved);
      }
    }
    show(order);
  };
  show(order);
  loopTimer = setInterval(() => {
    edit();
    if (random() < 0.2) {
      edit();
    }
  }, 120);
}

function stopLoop() {
  clearInterval(loopTimer);
  loopTimer = 0;
}

function stayingText() {
  const items = container.querySelectorAll('li.item, .tile');
  let text = '';
  for (const el of items) {
    if (!el.closest('[class*="-leave"]')) {
      text += el.textContent + '|';
    }
  }
  return text;
}

installHarness({
  root: () => container,
  cases: Object.keys(CASES),
  async prepare(name) {
    current = CASES[name];
    if (!current) {
      throw new Error(`Unknown anim case ${name}`);
    }
    flip = false;
    render(null, container);
    await wait(current.settle ?? 400);
    show(current.start);
    await wait(current.settle ?? 400);
    if (current.prime) {
      show(current.prime);
      // The prime's enters activate and its moves start from the next frames
      await frames(2);
      if (current.primeWait) {
        await wait(current.primeWait);
      }
    }
    return null;
  },
  op,
  // Inline animation styles differ in flight, and elements still leave for a while: compare the
  // text of the items that stay, in order.
  extra: { checksum: () => fnv1a(stayingText()), startLoop, stopLoop },
});
