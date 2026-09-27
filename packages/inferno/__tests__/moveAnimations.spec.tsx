import 'inferno-animation';
import { Component, Fragment, render } from 'inferno';
import { hydrate } from 'inferno-hydrate';

describe('keyed layout animation preparation', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    render(null, container);
    container.remove();
  });

  function Card({ id }) {
    return <li data-id={id}>{id}</li>;
  }

  function list(order, hook, animated = order) {
    return (
      <ul>
        {order.map((id) => (
          <Card
            key={id}
            id={id}
            onComponentWillMove={animated.includes(id) ? hook : undefined}
          />
        ))}
      </ul>
    );
  }

  it('keeps mixed animated and plain moves in reconciliation order', () => {
    const hook = () => {};
    render(list(['0', '1', '2', '3', '4'], hook, ['3']), container);
    render(list(['0', '1', '4', '3', '2'], hook, ['3']), container);
    expect(container.textContent).toBe('01432');
  });

  for (const order of [
    ['D', 'X', 'A', 'B', 'C'],
    ['X', 'A', 'B', 'C', 'D'],
    ['A', 'C', 'D'],
    ['D', 'A', 'C'],
  ]) {
    it(
      'prepares retained owners before changing ABCD to ' + order.join(''),
      () => {
        const calls: string[] = [];
        const hook = (_vNode, parent, dom, props) => {
          calls.push(props.id);
          expect(parent.textContent).toBe('ABCD');
          expect(dom.textContent).toBe(props.id);
        };
        render(list(['A', 'B', 'C', 'D'], hook), container);
        render(list(order, hook), container);
        expect(calls).toEqual(
          ['A', 'B', 'C', 'D'].filter((id) => order.includes(id)),
        );
        expect(container.textContent).toBe(order.join(''));
      },
    );
  }

  it('prepares before container styles and retained item props change', () => {
    const observations: string[] = [];
    const hook = (_vNode, parent, dom, props) => {
      observations.push(
        parent.style.height + ':' + dom.textContent + ':' + props.id,
      );
    };
    render(
      <ul style={{ height: '100px' }}>
        <Card key="a" id="old" onComponentWillMove={hook} />
      </ul>,
      container,
    );
    // Use arrays to retain the keyed children contract even with one child.
    render(
      <ul style={{ height: '100px' }}>
        {[<Card key="a" id="old" onComponentWillMove={hook} />]}
      </ul>,
      container,
    );
    observations.length = 0;
    render(
      <ul style={{ height: '200px' }}>
        {[<Card key="a" id="new" onComponentWillMove={hook} />]}
      </ul>,
      container,
    );
    expect(observations).toEqual(['100px:old:old']);
  });

  it('resolves hooks across class and function wrappers and prefers the outer owner', () => {
    const calls: string[] = [];
    const hook = (_vNode, _parent, _dom, props) =>
      calls.push('function:' + props.id);
    class Animated extends Component<any> {
      public componentWillMove(_vNode, _parent, dom) {
        expect(dom.tagName).toBe('LI');
        calls.push('class:' + this.props.id);
      }
      public render() {
        return <Card id={this.props.id} onComponentWillMove={hook} />;
      }
    }
    class ClassWrapper extends Component<any> {
      public render() {
        return <Card id={this.props.id} onComponentWillMove={hook} />;
      }
    }
    function FunctionWrapper({ id }) {
      return <Animated id={id} />;
    }
    for (const Item of [Animated, ClassWrapper, FunctionWrapper]) {
      render(null, container);
      calls.length = 0;
      const template = (order) => (
        <ul>
          {order.map((id) => (
            <Item key={id} id={id} />
          ))}
        </ul>
      );
      render(template(['A', 'B', 'C']), container);
      render(template(['C', 'B', 'A']), container);
      const prefix = Item === ClassWrapper ? 'function:' : 'class:';
      expect(calls).toEqual(['A', 'B', 'C'].map((id) => prefix + id));
      expect(container.textContent).toBe('CBA');
    }
  });

  it('moves whole fragments and resolves an outer hook past text placeholders', () => {
    const calls: string[] = [];
    class Pair extends Component<any> {
      public componentWillMove(_vNode, _parent, dom) {
        expect(dom.tagName).toBe('LI');
        calls.push(this.props.id);
      }
      public render() {
        return (
          <Fragment>
            {null}
            <li>{this.props.id}1</li>
            <li>{this.props.id}2</li>
          </Fragment>
        );
      }
    }
    const template = (order) => (
      <ul>
        {order.map((id) => (
          <Pair key={id} id={id} />
        ))}
        <li>edge</li>
      </ul>
    );
    render(template(['A', 'B', 'C']), container);
    render(template(['C', 'A', 'B']), container);
    expect(calls).toEqual(['A', 'B', 'C']);
    expect(container.textContent).toBe('C1C2A1A2B1B2edge');
  });

  it('does not prepare replaced owners, new owners, or an entirely removed list', () => {
    const hook = jasmine.createSpy('move');
    function Other({ id }) {
      return <li>{id}</li>;
    }
    render(list(['A', 'B'], hook), container);
    render(
      <ul>
        {[
          <Other key="A" id="A" onComponentWillMove={hook} />,
          <Card key="C" id="C" onComponentWillMove={hook} />,
        ]}
      </ul>,
      container,
    );
    render(null, container);
    expect(hook).not.toHaveBeenCalled();
  });

  it('prepares current survivors when a deferred removal completes', async () => {
    let finish: (() => void) | undefined;
    const observations: string[] = [];
    const hook = (_vNode, parent, _dom, props) =>
      observations.push(props.id + ':' + parent.textContent);
    const leave = (_dom, _props, callback) => {
      finish = callback;
    };
    const template = (order) => (
      <ul>
        {order.map((id) => (
          <Card
            key={id}
            id={id}
            onComponentWillMove={hook}
            onComponentWillDisappear={id === 'B' ? leave : undefined}
          />
        ))}
      </ul>
    );
    render(template(['A', 'B', 'C']), container);
    render(template(['A', 'C']), container);
    render(template(['C', 'D', 'A']), container);
    observations.length = 0;
    const before = container.textContent;
    finish!();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    expect(observations).toEqual(
      ['C', 'D', 'A'].map((id) => id + ':' + before),
    );
    expect(container.textContent).toBe('CDA');
    render(null, container);
    observations.length = 0;
    finish!();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    expect(observations).toEqual([]);
  });

  it('prepares lists updated through setState', () => {
    const observations: string[] = [];
    let app: App | null = null;
    class App extends Component<unknown, { order: string[] }> {
      public state = { order: ['A', 'B', 'C'] };
      public render() {
        return list(this.state.order, (_vNode, parent) =>
          observations.push(parent.textContent),
        );
      }
    }
    render(
      <App
        ref={(instance) => {
          app = instance;
        }}
      />,
      container,
    );
    app!.setState({ order: ['X', 'A', 'B', 'C'] });
    expect(observations).toEqual(['ABC', 'ABC', 'ABC']);
    expect(container.textContent).toBe('XABC');
  });

  it('discovers hooks enabled by a nested state update before the next list change', () => {
    const observations: string[] = [];
    const instances = new Map<string, Wrapper>();
    const hook = (_vNode, parent, _dom, props) =>
      observations.push(props.id + ':' + parent.textContent);
    class Wrapper extends Component<{ id: string }, { animated: boolean }> {
      public state = { animated: false };
      public render() {
        return (
          <Card
            id={this.props.id}
            onComponentWillMove={this.state.animated ? hook : undefined}
          />
        );
      }
    }
    const template = (order) => (
      <ul>
        {order.map((id) => (
          <Wrapper
            key={id}
            id={id}
            ref={(instance) => {
              if (instance) instances.set(id, instance);
            }}
          />
        ))}
      </ul>
    );
    render(template(['A', 'B']), container);
    instances.get('A')!.setState({ animated: true });
    instances.get('B')!.setState({ animated: true });
    render(template(['X', 'A', 'B']), container);
    expect(observations).toEqual(['A:AB', 'B:AB']);
    expect(container.textContent).toBe('XAB');
  });

  it('prepares the first update of a hydrated list', () => {
    const seen: string[] = [];
    const hook = (_vNode, parent) => seen.push(parent.textContent);
    container.innerHTML =
      '<ul><li data-id="A">A</li><li data-id="B">B</li></ul>';
    hydrate(list(['A', 'B'], hook), container);
    expect(seen).toEqual([]);
    render(list(['X', 'A', 'B'], hook), container);
    expect(seen).toEqual(['AB', 'AB']);
  });

  it('lets an outer fragment owner suppress hooks on its root children', async () => {
    const inner = jasmine.createSpy('inner');
    const outer = jasmine.createSpy('outer');
    let finish: (() => void) | undefined;
    const leave = (_dom, _props, callback) => {
      finish = callback;
    };
    class Pair extends Component<any> {
      public componentWillMove() {
        outer();
      }
      public render() {
        return (
          <Fragment>
            {[1, 2].map((id) => (
              <Card
                key={id}
                id={this.props.id + id}
                onComponentWillMove={inner}
              />
            ))}
          </Fragment>
        );
      }
    }
    const template = (order) => (
      <ul>
        {order.map((id) =>
          id === 'X' ? (
            <Card key={id} id={id} onComponentWillDisappear={leave} />
          ) : (
            <Pair key={id} id={id} />
          ),
        )}
      </ul>
    );
    render(template(['A', 'B', 'X']), container);
    render(template(['B', 'A']), container);
    expect(outer).toHaveBeenCalledTimes(2);
    expect(inner).not.toHaveBeenCalled();
    finish!();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    expect(outer).toHaveBeenCalledTimes(4);
    expect(inner).not.toHaveBeenCalled();
    expect(container.textContent).toBe('B1B2A1A2');
  });

  it('resolves SVG elements and keeps independent lists isolated', () => {
    const seen: string[] = [];
    const hook = (_vNode, parent, dom) => {
      expect(dom.namespaceURI).toBe('http://www.w3.org/2000/svg');
      seen.push(parent.textContent);
    };
    function Text({ id }) {
      return <text>{id}</text>;
    }
    const template = (order) => (
      <div>
        {['a', 'b'].map((prefix) => (
          <svg key={prefix}>
            {order.map((id) => (
              <Text key={id} id={prefix + id} onComponentWillMove={hook} />
            ))}
          </svg>
        ))}
      </div>
    );
    render(template([1, 2]), container);
    render(template([2, 1]), container);
    expect(seen).toEqual(['a1a2', 'a1a2', 'b1b2', 'b1b2']);
    expect(container.textContent).toBe('a2a1b2b1');
  });

  it('recovers after a preparation hook throws without queued DOM moves', () => {
    let fail = true;
    const hook = () => {
      if (fail) throw new Error('preparation failed');
    };
    render(list(['A', 'B', 'C'], hook), container);
    expect(() => render(list(['C', 'A', 'B'], hook), container)).toThrow();
    expect(container.textContent).toBe('ABC');
    fail = false;
    render(list(['B', 'C', 'A'], hook), container);
    expect(container.textContent).toBe('BCA');
  });

  it('keeps large mixed lists ordered through deterministic shuffles and membership changes', () => {
    let seed = 7;
    const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
    const order = Array.from({ length: 64 }, (_value, id) => String(id));
    const hook = () => {};
    for (let round = 0; round < 64; round++) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = random() % (i + 1);
        [order[i], order[j]] = [order[j], order[i]];
      }
      order.splice(random() % order.length, 1);
      order.splice(random() % order.length, 0, String(64 + round));
      render(
        list(
          order,
          hook,
          order.filter((id) => Number(id) % 3 === 0),
        ),
        container,
      );
      expect(
        Array.from(container.querySelectorAll('li')).map(
          (node) => node.dataset.id,
        ),
      ).toEqual(order);
    }
  });

  it('preserves order for every five-item permutation and animation mask', () => {
    function permutations(items: number[]): number[][] {
      return items.length === 0
        ? [[]]
        : items.flatMap((id, i) =>
            permutations(items.filter((_item, j) => j !== i)).map((tail) => [
              id,
              ...tail,
            ]),
          );
    }
    const start = [0, 1, 2, 3, 4];
    const hook = () => {};
    for (const order of permutations(start)) {
      for (let mask = 0; mask < 32; mask++) {
        const animated = start.filter((id) => mask & (1 << id));
        render(list(start, hook, animated), container);
        render(list(order, hook, animated), container);
        if (container.textContent !== order.join('')) {
          throw new Error(
            'order ' + order + ', mask ' + mask + ': ' + container.textContent,
          );
        }
      }
    }
  });
  describe('hook tracking', () => {
    function calls(hook) {
      const seen: string[] = [];
      return {
        seen,
        hook: (_vNode, _parent, _dom, props) => {
          seen.push(props.id);
          hook?.();
        },
      };
    }

    it('follows function hooks that come and go with a new hooks object', () => {
      const { seen, hook } = calls(null);
      render(list(['A', 'B', 'C'], hook, []), container);
      render(list(['A', 'B', 'C'], hook), container);
      render(list(['C', 'B', 'A'], hook), container);
      expect(seen).toEqual(['A', 'B', 'C']);

      // The update that drops the hooks still prepares with the hooks the items had
      seen.length = 0;
      render(list(['C', 'B', 'A'], hook, []), container);
      expect(seen).toEqual(['C', 'B', 'A']);
      seen.length = 0;
      render(list(['A', 'B', 'C'], hook, []), container);
      expect(seen).toEqual([]);

      render(list(['A', 'B', 'C'], hook), container);
      render(list(['B', 'A', 'C'], hook), container);
      expect(seen).toEqual(['A', 'B', 'C']);
      expect(container.textContent).toBe('BAC');
    });

    it('keeps the hook of a hooks object shared by every render', () => {
      const seen: string[] = [];
      const hooks = {
        onComponentWillMove(_vNode, _parent, dom) {
          seen.push(dom.textContent);
        },
      };
      function Shared({ id }) {
        return <li>{id}</li>;
      }
      Shared.defaultHooks = hooks;
      const shared = (order) => (
        <ul>
          {order.map((id) => (
            <Shared key={id} id={id} />
          ))}
        </ul>
      );
      render(shared(['A', 'B', 'C']), container);
      render(shared(['A', 'B', 'C']), container);
      render(shared(['A', 'B', 'C']), container);
      seen.length = 0;
      render(shared(['C', 'A', 'B']), container);
      expect(seen).toEqual(['A', 'B', 'C']);
      expect(container.textContent).toBe('CAB');
    });

    it('tracks lists again after the last hook unmounted', () => {
      const seen: string[] = [];
      class Item extends Component<{ id: string }> {
        componentWillMove(_vNode, _parent, dom) {
          seen.push(dom.textContent);
        }

        render() {
          return <li>{this.props.id}</li>;
        }
      }
      const items = (order) => (
        <ul>
          {order.map((id) => (
            <Item key={id} id={id} />
          ))}
        </ul>
      );
      render(items(['A', 'B']), container);
      render(<ul>{[]}</ul>, container);
      render(
        list(['X', 'Y'], () => {}, []),
        container,
      );
      render(
        list(['Y', 'X'], () => {}, []),
        container,
      );
      expect(seen).toEqual([]);

      render(items(['A', 'B']), container);
      render(items(['B', 'A']), container);
      expect(seen).toEqual(['A', 'B']);
      expect(container.textContent).toBe('BA');
    });
  });
});
