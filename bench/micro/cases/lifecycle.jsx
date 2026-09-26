// Mount/unmount, pure vNode creation/normalization and component update paths.
import { Component, createVNode, render } from 'inferno';
import { defineCase, newContainer } from './common.js';

const N = 1000;
const ITEMS = Array.from({ length: N }, (_, i) => ({ id: i, label: `row ${i}` }));

function noop() {}

function plainRows() {
  const out = [];
  for (let i = 0; i < N; i++) {
    out.push(<li $HasTextChildren>{ITEMS[i].label}</li>);
  }
  return <ul $HasNonKeyedChildren>{out}</ul>;
}

/** Rows carrying the props unmount has to inspect (Object.keys path) and delegated events. */
function propRows() {
  const out = [];
  for (let i = 0; i < N; i++) {
    const item = ITEMS[i];
    out.push(
      <li key={item.id} className="row" id={`r${item.id}`} title={item.label} style={{ color: 'red' }} data-id={item.id} onClick={noop} $HasTextChildren>
        {item.label}
      </li>,
    );
  }
  return <ul $HasKeyedChildren>{out}</ul>;
}

function FnRow({ item }) {
  return (
    <li className="fn" $HasTextChildren>
      {item.label}
    </li>
  );
}

class ClassRow extends Component {
  render() {
    return (
      <li className="cls" $HasTextChildren>
        {this.props.item.label}
      </li>
    );
  }
}

function componentRows() {
  const out = [];
  for (let i = 0; i < N; i++) {
    const item = ITEMS[i];
    out.push(i % 2 === 0 ? <FnRow key={item.id} item={item} /> : <ClassRow key={item.id} item={item} />);
  }
  return <ul $HasKeyedChildren>{out}</ul>;
}

const trees = { plain: plainRows, props: propRows, components: componentRows };

function mountCase(tree) {
  let container = null;
  return defineCase({
    iterations: 100,
    warmup: 20,
    setup: () => (container = newContainer()),
    prepare: () => render(null, container),
    op: () => render(tree(), container),
    root: () => container,
  });
}

function unmountCase(tree) {
  let container = null;
  return defineCase({
    iterations: 100,
    warmup: 20,
    setup: () => (container = newContainer()),
    prepare: () => render(tree(), container),
    op: () => render(null, container),
    root: () => container,
  });
}

function patchSameCase(tree) {
  let container = null;
  return defineCase({
    iterations: 150,
    warmup: 30,
    setup: () => (container = newContainer()),
    prepare: () => render(tree(), container),
    op: () => render(tree(), container),
    root: () => container,
  });
}

let sink = null;

/** Deliberately irregular children: holes, nested arrays, strings and numbers. */
function unknownChildren(i) {
  return [null, `text ${i}`, [<b>{i}</b>, null, [<i>x</i>]], i, false, <span>{i}</span>];
}

class Leaf extends Component {
  constructor(props) {
    super(props);
    this.state = { v: 0 };
    props.register(this);
  }

  render() {
    return <span $HasTextChildren>{this.state.v}</span>;
  }
}

export const cases = {};
for (const [name, tree] of Object.entries(trees)) {
  cases[`mount/${name}-1k`] = mountCase(tree);
  cases[`unmount/${name}-1k`] = unmountCase(tree);
  cases[`patch-same/${name}-1k`] = patchSameCase(tree);
}

cases['vnode/create-rows-1k'] = defineCase({
  iterations: 400,
  warmup: 100,
  op: () => (sink = propRows()),
  root: () => null,
});

cases['vnode/normalize-unknown-1k'] = defineCase({
  iterations: 200,
  warmup: 50,
  op: () => {
    const out = [];
    for (let i = 0; i < N; i++) {
      out.push(createVNode(1, 'div', null, unknownChildren(i), 0, null, null, null));
    }
    sink = out;
  },
  root: () => null,
});

cases['vnode/spread-props-1k'] = defineCase({
  iterations: 300,
  warmup: 60,
  op: () => {
    const out = [];
    for (let i = 0; i < N; i++) {
      const props = { id: `r${i}`, title: ITEMS[i].label, className: 'row' };
      out.push(<li {...props}>{ITEMS[i].label}</li>);
    }
    sink = out;
  },
  root: () => null,
});

{
  let container = null;
  const leaves = [];
  cases['state/setState-leaf-of-100'] = defineCase({
    iterations: 500,
    warmup: 100,
    setup() {
      container = newContainer();
      const register = (c) => leaves.push(c);
      const kids = [];
      for (let i = 0; i < 100; i++) {
        kids.push(<Leaf key={i} register={register} />);
      }
      render(<div $HasKeyedChildren>{kids}</div>, container);
    },
    op: (i) => leaves[i % 100].setState({ v: i }),
    root: () => container,
  });
}

{
  let container = null;
  let root = null;
  class Root extends Component {
    constructor(props) {
      super(props);
      root = this;
    }

    render() {
      return componentRows();
    }
  }
  cases['state/forceUpdate-root-1k-components'] = defineCase({
    iterations: 150,
    warmup: 30,
    setup() {
      container = newContainer();
      render(<Root />, container);
    },
    op: () => root.forceUpdate(),
    root: () => container,
  });
}

export function drainSink() {
  const s = sink;
  sink = null;
  return s;
}
