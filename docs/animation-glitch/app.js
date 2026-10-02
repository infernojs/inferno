import { Component, Fragment, render } from 'inferno';
import {
  AnimatedAllComponent,
  AnimatedMoveComponent,
  componentWillMove,
  hasPendingAnimations,
} from 'inferno-animation';

// inferno-animation class names: Card-move, Card-move-active, Card-move-end (see app.css)
const ANIMATION = 'Card';

function $(id) {
  return document.getElementById(id);
}

function domOrder(list) {
  return Array.from(list.querySelectorAll('li'))
    .map((li) => li.getAttribute('data-id'))
    .join(' ');
}

function setStatus(id, text, ok) {
  const el = $(id);
  el.textContent = text;
  el.className = 'status ' + (ok ? 'ok' : 'bad');
}

function shuffle(items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function Card({ id, animated }) {
  return (
    <li className={animated ? 'card animated' : 'card'} data-id={id}>
      {id}
    </li>
  );
}

class AnimatedCard extends AnimatedMoveComponent {
  render() {
    return <Card id={this.props.id} animated />;
  }
}

// Compare a composed component with one that renders its element directly.
class AnimatedLi extends AnimatedMoveComponent {
  render() {
    return (
      <li className="card animated" data-id={this.props.id}>
        {this.props.id}
      </li>
    );
  }
}

/*
 * 1. Wrong order when animated and plain items move together
 */
const ORDER_START = ['0', '1', '2', '3', '4'];

function OrderList({ order, animated, hook }) {
  return (
    <ul className="cards">
      {order.map((id) =>
        animated.indexOf(id) !== -1 ? (
          hook ? (
            <Card key={id} id={id} animated onComponentWillMove={hook} />
          ) : (
            <AnimatedLi key={id} id={id} animation={ANIMATION} />
          )
        ) : (
          <Card key={id} id={id} />
        ),
      )}
    </ul>
  );
}

function orderReset() {
  render(null, $('order-list'));
  render(<OrderList order={ORDER_START} animated={['3']} />, $('order-list'));
  setStatus('order-status', 'DOM: ' + domOrder($('order-list')), true);
}

function orderRun() {
  const expected = ['0', '1', '4', '3', '2'];
  render(<OrderList order={expected} animated={['3']} />, $('order-list'));
  const got = domOrder($('order-list'));
  setStatus('order-status', 'expected: ' + expected.join(' ') + '\nDOM:      ' + got, got === expected.join(' '));
}

function orderRandom() {
  // A hidden list and a move hook that does nothing: only the resulting DOM order matters here.
  const container = document.createElement('div');
  const noop = () => {};
  let wrong = 0;
  let example = '';
  for (let i = 0; i < 500; i++) {
    const order = shuffle(ORDER_START);
    const animated = ORDER_START.filter(() => Math.random() < 0.5);
    render(<OrderList order={ORDER_START} animated={animated} hook={noop} />, container);
    render(<OrderList order={order} animated={animated} hook={noop} />, container);
    const got = domOrder(container);
    if (got !== order.join(' ')) {
      wrong++;
      example = example || 'e.g. animated [' + animated.join(' ') + '] expected ' + order.join(' ') + ', DOM ' + got;
    }
    render(null, container);
  }
  setStatus('order-status', wrong + ' of 500 random orders ended in the wrong order' + (example ? '\n' + example : ''), wrong === 0);
}

/*
 * 2. Animations measure the list after the update has already changed it
 */
let measureSeen = null;

class RecordingCard extends AnimatedLi {
  componentWillMove(parentVNode, parent, dom) {
    // The first move hook of an update measures every sibling as the "before" state of the animation.
    if (measureSeen === null) {
      measureSeen = domOrder(parent);
    }
    super.componentWillMove(parentVNode, parent, dom);
  }
}

function MeasureList({ order }) {
  return (
    <ul className="cards">
      {order.map((id) => (
        <RecordingCard key={id} id={id} animation={ANIMATION} />
      ))}
    </ul>
  );
}

function measureReset() {
  render(null, $('measure-list'));
  render(<MeasureList order={['A', 'B', 'C', 'D']} />, $('measure-list'));
  setStatus('measure-status', 'DOM: ' + domOrder($('measure-list')), true);
}

function measureRun(order = ['D', 'X', 'A', 'B', 'C']) {
  const before = domOrder($('measure-list'));
  measureSeen = null;
  render(<MeasureList order={order} />, $('measure-list'));
  setStatus(
    'measure-status',
    'list before the update: ' + before + '\nmove hooks measured:    ' + measureSeen,
    measureSeen === before,
  );
}

/*
 * 3. A move hook in a nested component crashes the render
 */
const CRASH_START = ['A', 'B', 'C'];

class ClassWrapper extends Component {
  render() {
    return <Card id={this.props.id} animated animation={ANIMATION} onComponentWillMove={componentWillMove} />;
  }
}

function FunctionWrapper({ id }) {
  return <AnimatedLi id={id} animation={ANIMATION} />;
}

function crashList(Item, order) {
  return (
    <ul className="cards">
      {order.map((id) => (
        <Item key={id} id={id} />
      ))}
    </ul>
  );
}

function crashReset(name, Item) {
  render(null, $(name + '-list'));
  render(crashList(Item, CRASH_START), $(name + '-list'));
  setStatus(name + '-status', 'DOM: ' + domOrder($(name + '-list')), true);
}

function crashRun(name, Item) {
  const expected = CRASH_START.slice().reverse();
  let error = null;
  try {
    render(crashList(Item, expected), $(name + '-list'));
  } catch (e) {
    error = e;
  }
  const got = domOrder($(name + '-list'));
  setStatus(
    name + '-status',
    (error ? String(error) + '\n' : '') + 'expected: ' + expected.join(' ') + '\nDOM:      ' + got,
    error === null && got === expected.join(' '),
  );
}

/*
 * 4. The move animation is skipped when the animated component renders another component
 */
const SKIP_START = ['A', 'B', 'C', 'D', 'E'];
const hookCalls = { direct: 0, composed: 0 };

class DirectCard extends AnimatedLi {
  componentWillMove(parentVNode, parent, dom) {
    hookCalls.direct++;
    super.componentWillMove(parentVNode, parent, dom);
  }
}

class ComposedCard extends AnimatedCard {
  componentWillMove(parentVNode, parent, dom) {
    hookCalls.composed++;
    super.componentWillMove(parentVNode, parent, dom);
  }
}

let skipOrder = SKIP_START;

function skipRender() {
  render(
    <ul className="cards">
      {skipOrder.map((id) => (
        <DirectCard key={id} id={id} animation={ANIMATION} />
      ))}
    </ul>,
    $('skip-direct-list'),
  );
  render(
    <ul className="cards">
      {skipOrder.map((id) => (
        <ComposedCard key={id} id={id} animation={ANIMATION} />
      ))}
    </ul>,
    $('skip-composed-list'),
  );
}

function skipRun() {
  let next = shuffle(SKIP_START);
  while (next.join('') === skipOrder.join('')) {
    next = shuffle(SKIP_START);
  }
  skipOrder = next;
  hookCalls.direct = 0;
  hookCalls.composed = 0;
  skipRender();
  setStatus(
    'skip-status',
    'move hook calls: left ' + hookCalls.direct + ', right ' + hookCalls.composed,
    hookCalls.direct === hookCalls.composed,
  );
}

/*
 * Edge cases 5-15. Their cards use the "Glitch" animation (see app.css): 1.5 s moves, enters and
 * leaves. The status lines measure the first frame of an animation, so they are meaningful only
 * when the buttons are used after the previous animation has finished.
 */
const GLITCH = 'Glitch';
const START = ['A', 'B', 'C', 'D', 'E'];
const TOP_E = ['E', 'A', 'B', 'C', 'D'];

class MoveCard extends AnimatedMoveComponent {
  render() {
    const { id, className } = this.props;
    return (
      <li className={'card animated' + (className ? ' ' + className : '')} data-id={id}>
        {id}
      </li>
    );
  }
}

class AllCard extends AnimatedAllComponent {
  render() {
    const { id, className, style } = this.props;
    return (
      <li className={'card animated' + (className ? ' ' + className : '')} data-id={id} style={style}>
        {id}
      </li>
    );
  }
}

function cards(order, Item, props) {
  return (
    <ul className="cards">
      {order.map((id) => (
        <Item key={id} id={id} animation={GLITCH} {...(props ? props(id) : null)} />
      ))}
    </ul>
  );
}

// The viewport box of every [data-id] element in root
function boxes(root) {
  const result = {};
  for (const el of root.querySelectorAll('[data-id]')) {
    const rect = el.getBoundingClientRect();
    result[el.getAttribute('data-id')] = { x: rect.left, y: rect.top };
  }
  return result;
}

// The element of ids that is farthest from its box in before, and the distance
function largestJump(root, before, ids) {
  let worst = { id: '-', distance: 0 };
  for (const id of ids || Object.keys(before)) {
    const el = root.querySelector('[data-id="' + id + '"]');
    if (!el || !before[id]) continue;
    const rect = el.getBoundingClientRect();
    const distance = Math.hypot(rect.left - before[id].x, rect.top - before[id].y);
    if (distance > worst.distance) worst = { id, distance };
  }
  return worst;
}

function describeJump(jump) {
  return jump.distance < 1
    ? 'every card starts where it was'
    : jump.id + ' starts ' + Math.round(jump.distance) + ' px away from where it was';
}

// Resolves after the move engine's microtask, which installs the start positions before paint
function afterFlush() {
  return Promise.resolve();
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Waits until every enter, leave and move of the page has finished
async function idle(timeout = 10000) {
  const start = performance.now();
  while (hasPendingAnimations() || document.querySelector('[class*="-active"]')) {
    if (performance.now() - start > timeout) return false;
    await nextFrame();
  }
  return true;
}

/*
 * 5. Moves in a transformed coordinate space
 */
function SvgBar({ id, index }) {
  const y = index * 20;
  return (
    <g data-id={id}>
      <rect className="svg-card" x="0" y={y} width="110" height="16" rx="2" />
      <text x="6" y={y + 12}>
        {id}
      </text>
    </g>
  );
}

class SvgCard extends AnimatedMoveComponent {
  render() {
    return <SvgBar id={this.props.id} index={this.props.index} />;
  }
}

function svgList(order) {
  return (
    <svg className="svg-list" width="240" height="210" viewBox="0 0 120 105">
      {order.map((id, index) => (
        <SvgCard key={id} id={id} index={index} animation={GLITCH} />
      ))}
    </svg>
  );
}

// The cards are children of a shadow root, where the styles of the page do not apply
const SHADOW_STYLES = `
  .card { display: block; box-sizing: border-box; width: 240px; height: 36px; line-height: 36px; margin-bottom: 6px;
    padding: 0 12px; border-radius: 4px; background: #f39c3c; color: #fff; font: bold 16px/36px sans-serif; }
  .Glitch-move-active { transition: transform 1.5s ease; }
`;
let shadow = null;

function shadowRoot() {
  if (shadow === null) {
    shadow = $('space-shadow-host').attachShadow({ mode: 'open' });
    const sheet = document.createElement('style');
    sheet.textContent = SHADOW_STYLES;
    shadow.appendChild(sheet);
  }
  return shadow;
}

function shadowList(order) {
  return (
    <Fragment>
      {order.map((id) => (
        <MoveCard key={id} id={id} animation={GLITCH} />
      ))}
    </Fragment>
  );
}

// Name, view and the root that the view is rendered into
const spaceLists = [
  ['space-scaled', (order) => cards(order, MoveCard), () => $('space-scaled-list')],
  ['space-property', (order) => cards(order, MoveCard, () => ({ className: 'shrunk' })), () => $('space-property-list')],
  ['space-svg', svgList, () => $('space-svg-list')],
  ['space-shadow', shadowList, shadowRoot],
];

function spaceReset() {
  for (const [name, view, root] of spaceLists) {
    render(null, root());
    render(view(START), root());
    setStatus(name + '-status', '', true);
  }
}

async function spaceRun() {
  const before = spaceLists.map(([, , root]) => boxes(root()));
  const order = shuffle(START);
  for (const [, view, root] of spaceLists) render(view(order), root());
  await afterFlush();
  spaceLists.forEach(([name, , root], i) => {
    const jump = largestJump(root(), before[i]);
    setStatus(name + '-status', describeJump(jump), jump.distance < 1);
  });
}

/*
 * 6. An item that becomes visible in the same update as a reorder
 */
function hiddenList(order, hidden) {
  return cards(order, MoveCard, (id) => (id === hidden ? { className: 'hidden' } : null));
}

function hiddenReset() {
  render(null, $('hidden-list'));
  render(hiddenList(START, 'C'), $('hidden-list'));
  setStatus('hidden-status', 'C is hidden', true);
}

async function hiddenRun() {
  const list = $('hidden-list');
  render(hiddenList(TOP_E, null), list);
  await afterFlush();
  const c = list.querySelector('[data-id="C"]');
  const rect = c.getBoundingClientRect();
  const top = list.getBoundingClientRect().top;
  const flies = c.style.transform !== '';
  setStatus(
    'hidden-status',
    flies
      ? 'C starts at (' + Math.round(rect.left) + ', ' + Math.round(rect.top) + '), ' +
          Math.round(top - rect.top) + ' px above the list, with transform ' + c.style.transform
      : 'C appears in its place without a move',
    !flies,
  );
}

/*
 * 7. An item running a CSS keyframe animation on transform
 */
// B pulses without end; the animation of D has finished and fills forwards
function pulseList(order) {
  return cards(order, MoveCard, (id) => (id === 'B' ? { className: 'pulse' } : id === 'D' ? { className: 'pop' } : null));
}

function pulseReset() {
  render(null, $('pulse-list'));
  render(pulseList(START), $('pulse-list'));
  setStatus('pulse-status', '', true);
}

async function pulseRun() {
  const list = $('pulse-list');
  const before = boxes(list);
  render(pulseList(TOP_E), list);
  await afterFlush();
  // The pulse scales B by up to 4 %, which moves its corner by a few pixels
  const jump = largestJump(list, before, ['A', 'B', 'C', 'D']);
  setStatus('pulse-status', describeJump(jump), jump.distance < 8);
}

/*
 * 8. Removing an item while it moves. The leaves of this list slide to the right.
 */
const SLIDE = 'Slide';

function slideCards(order) {
  return cards(order, AllCard, () => ({ animation: SLIDE }));
}

function removeMovingReset() {
  render(null, $('remove-moving-list'));
  render(slideCards(START), $('remove-moving-list'));
  setStatus('remove-moving-status', '', true);
}

function slides(el) {
  return el.getAnimations().some((animation) => animation.transitionProperty === 'transform');
}

// Whether the list shows the cards A to E and none of them is animated
function removeMovingReady() {
  const list = $('remove-moving-list');
  const ready = domOrder(list) === START.join(' ') && list.querySelector('[class*="-active"]') === null;
  if (!ready) setStatus('remove-moving-status', 'press Reset and wait for the cards to appear first', false);
  return ready;
}

async function removeMovingRun() {
  const list = $('remove-moving-list');
  if (!removeMovingReady()) return;
  render(slideCards(TOP_E), list);
  await wait(600);
  const e = list.querySelector('[data-id="E"]');
  const before = e.getBoundingClientRect().top;
  render(slideCards(START.filter((id) => id !== 'E')), list);
  await afterFlush();
  const after = e.getBoundingClientRect().top;
  const jump = Math.abs(after - before);
  for (let i = 0; i < 3; i++) await nextFrame();
  const sliding = slides(e);
  setStatus(
    'remove-moving-status',
    (jump < 1
      ? 'E starts leaving where it was'
      : 'E jumped ' + Math.round(jump) + ' px (from ' + Math.round(before) + ' to ' + Math.round(after) +
        ') when it started leaving') + (sliding ? ', and slides out' : ', but does not slide out'),
    jump < 1 && sliding,
  );
}

// Moves E to the top and changes the whole list after 0.6 s: every card leaves while it moves.
// These leaves fade and collapse without a transition of the transform, which ends the moves.
async function removeMovingList(next, label) {
  const list = $('remove-moving-list');
  if (!removeMovingReady()) return;
  render(cards(TOP_E, AllCard), list);
  await wait(600);
  const before = boxes(list);
  render(next, list);
  await afterFlush();
  const first = largestJump(list, before, START);
  // The leaves start in the next frame. The cards shrink from then on, so they move a little.
  for (let i = 0; i < 3; i++) await nextFrame();
  const later = largestJump(list, before, START);
  const jump = first.distance > later.distance ? first : later;
  setStatus(
    'remove-moving-status',
    label + ': ' + (jump.distance < 12 ? 'every card starts leaving where it was' : jump.id + ' jumped ' +
      Math.round(jump.distance) + ' px when it started leaving'),
    jump.distance < 12,
  );
}

/*
 * 9. Removing an item while it enters
 */
function removeEnteringReset() {
  render(null, $('remove-entering-list'));
  render(cards(['A', 'B', 'C'], AllCard), $('remove-entering-list'));
  setStatus('remove-entering-status', '', true);
}

async function removeEnteringRun() {
  const list = $('remove-entering-list');
  render(cards(['A', 'X', 'B', 'C'], AllCard), list);
  await wait(600);
  const x = list.querySelector('[data-id="X"]');
  const height = x.getBoundingClientRect().height;
  const removedAt = performance.now();
  render(cards(['A', 'B', 'C'], AllCard), list);
  while (x.isConnected && performance.now() - removedAt < 5000) await nextFrame();
  const took = Math.round(performance.now() - removedAt);
  setStatus(
    'remove-entering-status',
    'X was ' + Math.round(height) + ' px tall when removed, and left the document after ' + took +
      ' ms (the leave transition lasts 1500 ms)',
    took > 1000,
  );
}

// X is removed in the frame that prepared its enter, before the enter has started
async function removeEnteringEarly() {
  const list = $('remove-entering-list');
  render(cards(['A', 'X', 'B', 'C'], AllCard), list);
  const x = list.querySelector('[data-id="X"]');
  await nextFrame();
  const removedAt = performance.now();
  render(cards(['A', 'B', 'C'], AllCard), list);
  const gone = !x.isConnected;
  let opacity = 0;
  while (x.isConnected && performance.now() - removedAt < 5000) {
    opacity = Math.max(opacity, Number(getComputedStyle(x).opacity));
    await nextFrame();
  }
  setStatus(
    'remove-entering-status',
    gone
      ? 'X was removed at once: nothing of it was visible'
      : 'X stayed for ' + Math.round(performance.now() - removedAt) + ' ms, and was visible at opacity ' + opacity.toFixed(2),
    gone,
  );
}

/*
 * 10. Nested lists reordered in one update
 */
class Group extends AnimatedMoveComponent {
  render() {
    const { id, items } = this.props;
    return (
      <li className="group" data-id={id}>
        <div className="group-title">{id}</div>
        <ul className="cards">
          {items.map((item) => (
            <MoveCard key={item} id={item} animation={GLITCH} />
          ))}
        </ul>
      </li>
    );
  }
}

const NESTED_START = [
  ['G1', ['a', 'b', 'c']],
  ['G2', ['d', 'e', 'f']],
  ['G3', ['g', 'h', 'i']],
];

function nestedView(groups, className = 'groups') {
  return (
    <ul className={className}>
      {groups.map(([id, items]) => (
        <Group key={id} id={id} items={items} animation={GLITCH} />
      ))}
    </ul>
  );
}

let nestedGroups = NESTED_START;

function nestedReset() {
  nestedGroups = NESTED_START;
  render(null, $('nested-list'));
  render(nestedView(nestedGroups), $('nested-list'));
  setStatus('nested-status', '', true);
}

// Reverses the groups and their cards, without the first group when it is removed
async function nestedRun(removeFirst) {
  const list = $('nested-list');
  if (removeFirst) nestedReset();
  const before = boxes(list);
  nestedGroups = nestedGroups
    .slice(removeFirst ? 1 : 0)
    .reverse()
    .map(([id, items]) => [id, items.slice().reverse()]);
  render(nestedView(nestedGroups), list);
  await afterFlush();
  const groups = largestJump(list, before, nestedGroups.map(([id]) => id));
  const items = largestJump(list, before, [].concat(...nestedGroups.map(([, ids]) => ids)));
  setStatus(
    'nested-status',
    (removeFirst ? 'G1 removed, the rest reversed' : 'reversed') + '\ngroups: ' + describeJump(groups) +
      '\ncards:  ' + describeJump(items),
    groups.distance < 1 && items.distance < 1,
  );
}

// Groups without a box of their own, so that a group of two cards is two rows high: c moves two
// rows up in a group that moves two rows down
const STILL_START = [
  ['G1', ['a', 'b', 'c']],
  ['G2', ['d', 'e']],
];
const STILL_END = [
  ['G2', ['d', 'e']],
  ['G1', ['c', 'a', 'b']],
];

function stillReset() {
  render(null, $('nested-still-list'));
  render(nestedView(STILL_START, 'groups tight'), $('nested-still-list'));
  setStatus('nested-still-status', '', true);
}

async function stillRun() {
  const list = $('nested-still-list');
  stillReset();
  const before = boxes(list);
  render(nestedView(STILL_END, 'groups tight'), list);
  await afterFlush();
  const c = largestJump(list, before, ['c']);
  const others = largestJump(list, before, ['a', 'b', 'd', 'e']);
  setStatus(
    'nested-still-status',
    'c:      ' + (c.distance < 1 ? 'stays where it was' : 'starts ' + Math.round(c.distance) + ' px away from where it was') +
      '\nothers: ' + describeJump(others),
    c.distance < 1 && others.distance < 1,
  );
}

/*
 * 11. A displaced item that starts an author transition in the same update
 */
function highlightList(order, highlighted) {
  return cards(order, MoveCard, (id) => ({
    className: 'highlightable' + (id === highlighted ? ' highlight' : ''),
  }));
}

function highlightReset() {
  render(null, $('highlight-list'));
  render(highlightList(START, null), $('highlight-list'));
  setStatus('highlight-status', '', true);
}

async function highlightRun() {
  const list = $('highlight-list');
  const before = boxes(list);
  render(highlightList(TOP_E, 'B'), list);
  await afterFlush();
  const jump = largestJump(list, before);
  setStatus('highlight-status', describeJump(jump), jump.distance < 1);
}

/*
 * 12. Inline width and height of an entering element
 */
let boxCount = 0;
let boxIds = [];

function boxView() {
  return cards(boxIds, AllCard, () => ({
    className: 'sized',
    style: { width: '160px', height: '56px' },
  }));
}

function boxReset() {
  boxIds = [];
  render(null, $('inline-size-list'));
  setStatus('inline-size-status', '', true);
}

async function boxRun() {
  const id = 'box ' + ++boxCount;
  boxIds = boxIds.concat(id);
  const list = $('inline-size-list');
  render(boxView(), list);
  setStatus('inline-size-status', 'entering...', true);
  const el = list.querySelector('[data-id="' + id + '"]');
  const start = performance.now();
  await nextFrame();
  while (/Glitch-enter/.test(el.className) && performance.now() - start < 5000) await nextFrame();
  const rect = el.getBoundingClientRect();
  const kept = el.style.width === '160px' && el.style.height === '56px';
  setStatus(
    'inline-size-status',
    'after the enter: style="' + (el.getAttribute('style') || '') + '", box ' + Math.round(rect.width) + ' x ' +
      Math.round(rect.height) + ' px (rendered with width: 160px; height: 56px)',
    kept,
  );
}

async function boxRemove() {
  if (boxIds.length === 0) {
    setStatus('inline-size-status', 'add a box first', false);
    return;
  }
  const list = $('inline-size-list');
  const id = boxIds[boxIds.length - 1];
  const el = list.querySelector('[data-id="' + id + '"]');
  boxIds = boxIds.slice(0, -1);
  render(boxView(), list);
  for (let i = 0; i < 3; i++) await nextFrame();
  const rect = el.getBoundingClientRect();
  const kept = el.style.width === '160px' && el.style.height === '56px';
  setStatus(
    'inline-size-status',
    'while leaving: style="' + (el.getAttribute('style') || '') + '", box ' + Math.round(rect.width) + ' x ' +
      Math.round(rect.height) + ' px (rendered with width: 160px; height: 56px)',
    kept,
  );
}

/*
 * 13. A global animation source that is used much later
 */
class Logo extends AnimatedAllComponent {
  render() {
    return (
      <div className="logo" data-id="logo">
        logo
      </div>
    );
  }
}

const logo = <Logo globalAnimationKey="glitch-logo" animation={GLITCH} />;
let logoRemovedAt = 0;

function logoReset() {
  render(null, $('global-right'));
  render(null, $('global-left'));
  render(logo, $('global-left'));
  setStatus('global-status', '', true);
}

// Reports whether the logo that just entered on the right starts from another box
async function logoCheck(expectFlight, label) {
  await nextFrame();
  const el = $('global-right').querySelector('[data-id="logo"]');
  const flies = el !== null && el.style.transform !== '';
  setStatus(
    'global-status',
    label + (flies ? 'the logo starts from another box (' + el.style.transform + ')' : 'the logo enters in place'),
    flies === expectFlight,
  );
}

function logoOnLeft() {
  const shown = $('global-left').querySelector('[data-id="logo"]');
  return shown !== null && shown.style.visibility !== 'hidden';
}

function logoMove() {
  if (!logoOnLeft()) {
    setStatus('global-status', 'press Reset first', false);
    return;
  }
  // Both changes in one task: the intended global animation
  render(null, $('global-left'));
  render(logo, $('global-right'));
  logoCheck(true, 'moved in one update: ');
}

function logoRemove() {
  if (!logoOnLeft()) {
    setStatus('global-status', 'press Reset first', false);
    return;
  }
  render(null, $('global-left'));
  logoRemovedAt = performance.now();
  setStatus('global-status', 'removed; wait a moment, then show it on the right', true);
}

function logoShowRight() {
  if (logoOnLeft() || $('global-right').firstChild) {
    setStatus('global-status', 'press Reset, then Remove first', false);
    return;
  }
  const after = Math.round(performance.now() - logoRemovedAt);
  render(logo, $('global-right'));
  logoCheck(false, 'shown ' + after + ' ms after the removal: ');
}

/*
 * 14. The inline transform of an element that enters from a global source
 */
class Tile extends AnimatedAllComponent {
  render() {
    return (
      <div className="tile" data-id="tile" style={this.props.style}>
        tile
      </div>
    );
  }
}

const TILT = 'rotate(-12deg)';

function tiltReset() {
  render(null, $('tilt-right'));
  render(null, $('tilt-left'));
  render(<Tile globalAnimationKey="glitch-tile" animation={GLITCH} />, $('tilt-left'));
  setStatus('tilt-status', '', true);
}

async function tiltRun() {
  if ($('tilt-right').firstChild) {
    setStatus('tilt-status', 'press Reset first', false);
    return;
  }
  render(null, $('tilt-left'));
  render(<Tile globalAnimationKey="glitch-tile" animation={GLITCH} style={{ transform: TILT }} />, $('tilt-right'));
  const el = $('tilt-right').querySelector('[data-id="tile"]');
  setStatus('tilt-status', 'moving...', true);
  const start = performance.now();
  await nextFrame();
  while (/Glitch-enter/.test(el.className) && performance.now() - start < 5000) await nextFrame();
  setStatus(
    'tilt-status',
    'after the enter: style="' + (el.getAttribute('style') || '') + '" (rendered with transform: ' + TILT + ')',
    el.style.transform === TILT,
  );
}

/*
 * 15. Random updates
 */
let stressOrder = START.slice();
let stressNext = 0;
let stressTimer = 0;
let stressUpdates = 0;

function stressStep() {
  const operation = Math.random();
  stressOrder = stressOrder.slice();
  if (operation < 0.3 || stressOrder.length < 3) {
    stressOrder.splice(Math.floor(Math.random() * (stressOrder.length + 1)), 0, 'n' + stressNext++);
  } else if (operation < 0.55 && stressOrder.length > 3) {
    stressOrder.splice(Math.floor(Math.random() * stressOrder.length), 1);
  } else {
    const [moved] = stressOrder.splice(Math.floor(Math.random() * stressOrder.length), 1);
    stressOrder.splice(Math.floor(Math.random() * (stressOrder.length + 1)), 0, moved);
  }
  stressUpdates++;
  render(cards(stressOrder, AllCard), $('stress-list'));
}

function stressTick() {
  stressStep();
  // Sometimes a second update in the same task
  if (Math.random() < 0.2) stressStep();
  setStatus('stress-status', stressUpdates + ' updates', true);
}

function stressReset() {
  clearInterval(stressTimer);
  stressTimer = 0;
  stressOrder = START.slice();
  stressUpdates = 0;
  render(null, $('stress-list'));
  render(cards(stressOrder, AllCard), $('stress-list'));
  setStatus('stress-status', '', true);
}

function stressStart() {
  if (!stressTimer) stressTimer = setInterval(stressTick, Number($('stress-interval').value));
}

async function stressStop() {
  clearInterval(stressTimer);
  stressTimer = 0;
  setStatus('stress-status', 'waiting for the animations to finish...', true);
  const settled = await idle();
  const items = Array.from($('stress-list').querySelectorAll('li'));
  const order = items.map((li) => li.getAttribute('data-id')).join(' ');
  const dirty = items
    .filter((li) => (li.getAttribute('style') || '') !== '' || li.className !== 'card animated')
    .map((li) => li.getAttribute('data-id') + ' [style="' + (li.getAttribute('style') || '') + '" class="' + li.className + '"]');
  const ok = settled && order === stressOrder.join(' ') && dirty.length === 0;
  setStatus(
    'stress-status',
    stressUpdates + ' updates, ' + (settled ? 'settled' : 'did not settle in 10 s') + '\nexpected: ' + stressOrder.join(' ') +
      '\nDOM:      ' + order + (dirty.length ? '\nleftover styles or classes: ' + dirty.join(', ') : ''),
    ok,
  );
}

document.addEventListener('DOMContentLoaded', function () {
  orderReset();
  $('order-run').addEventListener('click', orderRun);
  $('order-random').addEventListener('click', orderRandom);
  $('order-reset').addEventListener('click', orderReset);

  measureReset();
  $('measure-run').addEventListener('click', () => measureRun());
  $('measure-insert').addEventListener('click', () => {
    measureReset();
    measureRun(['X', 'A', 'B', 'C', 'D']);
  });
  $('measure-remove').addEventListener('click', () => {
    measureReset();
    measureRun(['A', 'C', 'D']);
  });
  $('measure-reset').addEventListener('click', measureReset);

  crashReset('crash-class', ClassWrapper);
  crashReset('crash-function', FunctionWrapper);
  $('crash-class-run').addEventListener('click', () => crashRun('crash-class', ClassWrapper));
  $('crash-class-reset').addEventListener('click', () => crashReset('crash-class', ClassWrapper));
  $('crash-function-run').addEventListener('click', () => crashRun('crash-function', FunctionWrapper));
  $('crash-function-reset').addEventListener('click', () => crashReset('crash-function', FunctionWrapper));

  skipRender();
  $('skip-run').addEventListener('click', skipRun);

  spaceReset();
  $('space-run').addEventListener('click', spaceRun);
  $('space-reset').addEventListener('click', spaceReset);

  hiddenReset();
  $('hidden-run').addEventListener('click', hiddenRun);
  $('hidden-reset').addEventListener('click', hiddenReset);

  pulseReset();
  $('pulse-run').addEventListener('click', pulseRun);
  $('pulse-reset').addEventListener('click', pulseReset);

  removeMovingReset();
  $('remove-moving-run').addEventListener('click', removeMovingRun);
  $('remove-moving-all').addEventListener('click', () => removeMovingList(null, 'list removed'));
  $('remove-moving-replace').addEventListener('click', () =>
    removeMovingList(cards(['V', 'W', 'X', 'Y', 'Z'], AllCard), 'every card replaced'),
  );
  $('remove-moving-reset').addEventListener('click', removeMovingReset);

  removeEnteringReset();
  $('remove-entering-run').addEventListener('click', removeEnteringRun);
  $('remove-entering-early').addEventListener('click', removeEnteringEarly);
  $('remove-entering-reset').addEventListener('click', removeEnteringReset);

  nestedReset();
  $('nested-run').addEventListener('click', () => nestedRun(false));
  $('nested-remove').addEventListener('click', () => nestedRun(true));
  $('nested-reset').addEventListener('click', nestedReset);

  stillReset();
  $('nested-still-run').addEventListener('click', stillRun);
  $('nested-still-reset').addEventListener('click', stillReset);

  highlightReset();
  $('highlight-run').addEventListener('click', highlightRun);
  $('highlight-reset').addEventListener('click', highlightReset);

  boxReset();
  $('inline-size-run').addEventListener('click', boxRun);
  $('inline-size-remove').addEventListener('click', boxRemove);
  $('inline-size-reset').addEventListener('click', boxReset);

  logoReset();
  $('global-move').addEventListener('click', logoMove);
  $('global-remove').addEventListener('click', logoRemove);
  $('global-show').addEventListener('click', logoShowRight);
  $('global-reset').addEventListener('click', logoReset);

  tiltReset();
  $('tilt-run').addEventListener('click', tiltRun);
  $('tilt-reset').addEventListener('click', tiltReset);

  stressReset();
  $('stress-start').addEventListener('click', stressStart);
  $('stress-stop').addEventListener('click', stressStop);
  $('stress-reset').addEventListener('click', stressReset);
});
