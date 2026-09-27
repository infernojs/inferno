import { Component, render } from 'inferno';
import { AnimatedMoveComponent, componentWillMove } from 'inferno-animation';

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
});
