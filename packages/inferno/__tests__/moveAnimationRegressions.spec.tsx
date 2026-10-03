import {
  Component,
  Fragment,
  createFragment,
  createPortal,
  render,
} from 'inferno';
import 'inferno-animation';
import { ChildFlags } from 'inferno-vnode-flags';

describe('move animation registry regressions', () => {
  let container: HTMLDivElement;
  const frame = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    render(null, container);
    container.remove();
  });

  it('discovers class hooks assigned after mounting without another owner', () => {
    const calls: string[] = [];
    class Card extends Component<{ id: string }> {
      public componentDidMount() {
        this.componentWillMove = () => calls.push(this.props.id);
      }
      public render() {
        return <div>{this.props.id}</div>;
      }
    }
    const list = (order: string[]) => (
      <main>
        {order.map((id) => (
          <Card key={id} id={id} />
        ))}
      </main>
    );
    render(list(['A', 'B']), container);
    render(list(['B', 'A']), container);
    expect(calls).toEqual(['A', 'B']);
  });

  it('uses element targets for appear and disappear after leading fragment text', () => {
    const targets: Element[] = [];
    class Card extends Component {
      public componentDidAppear(dom) {
        targets.push(dom);
      }
      public componentWillDisappear(dom, done) {
        targets.push(dom);
        done();
      }
      public render() {
        return (
          <Fragment>
            text
            <Fragment>
              <span>card</span>
            </Fragment>
          </Fragment>
        );
      }
    }
    render(<Card />, container);
    const span = container.querySelector('span');
    render(null, container);
    expect(targets).toEqual([span, span]);
    expect(container.textContent).toBe('');
  });

  it('skips animation callbacks when a component has no element root', () => {
    const hook = jasmine.createSpy();
    class Card extends Component {
      public componentDidAppear = hook;
      public componentWillDisappear = hook;
      public render() {
        return <Fragment>text{null}</Fragment>;
      }
    }
    render(<Card />, container);
    render(null, container);
    expect(hook).not.toHaveBeenCalled();
    expect(container.textContent).toBe('');
  });

  it('reparents keyed fragment registrations after a Portal container change', async () => {
    const oldParent = document.createElement('div');
    const newParent = document.createElement('div');
    document.body.append(oldParent, newParent);
    const calls: string[] = [];
    let finish!: () => void;
    const seenParents: Element[] = [];
    function Card({ id }) {
      return <span>{id}</span>;
    }
    const list = (parent, order: string[]) =>
      createPortal(
        <Fragment>
          {order.map((id) => (
            <Card
              key={id}
              id={id}
              onComponentWillMove={(_v, p, _d, props) => {
                seenParents.push(p);
                calls.push(props.id);
              }}
              onComponentWillDisappear={(_d, _p, done) => {
                finish = () => done();
              }}
            />
          ))}
        </Fragment>,
        parent,
      );
    // The transfer itself is prepared in the old parent.
    render(list(oldParent, ['A', 'B']), container);
    calls.length = 0;
    render(list(newParent, ['A', 'B']), container);
    render(list(newParent, ['B']), container);
    calls.length = 0;
    seenParents.length = 0;
    finish();
    await frame();
    expect(seenParents).toEqual([newParent]);
    expect(calls).toEqual(['B']);
    expect(newParent.textContent).toBe('B');
    render(null, container);
    finish();
    await frame();
    oldParent.remove();
    newParent.remove();
  });

  it('does not prepare other lists during a synchronous leave callback', () => {
    const calls: string[] = [];
    let inLeave = false;
    function Card({ id }) {
      return <span>{id}</span>;
    }
    const group = (ids: string[]) => (
      <Fragment>
        {ids.map((id) => (
          <Card
            key={id}
            id={id}
            onComponentWillMove={(_v, _p, _d, props) => {
              expect(inLeave).toBe(false);
              calls.push(props.id);
            }}
            onComponentWillDisappear={(_d, _p, done) => {
              inLeave = true;
              done();
              inLeave = false;
            }}
          />
        ))}
      </Fragment>
    );
    const list = (first: string[]) => (
      <main>
        {createFragment(
          [group(first), group(['C', 'D'])],
          ChildFlags.HasNonKeyedChildren,
        )}
      </main>
    );
    render(list(['A', 'B']), container);
    calls.length = 0;
    render(list(['B']), container);
    expect(calls.filter((id) => id === 'C' || id === 'D')).toEqual(['C', 'D']);
  });
  it('snapshots owners inside retained wrappers before a render replaces them', () => {
    const calls: string[] = [];
    function Card({ id }) {
      return <span>{id}</span>;
    }
    function Wrapper({ replace }) {
      return replace ? (
        <aside>replacement</aside>
      ) : (
        <Fragment>
          <Card
            id="old"
            onComponentWillMove={(_v, _p, _d, props) => calls.push(props.id)}
          />
        </Fragment>
      );
    }
    const list = (replace: boolean) => (
      <main>{[<Wrapper key="wrapper" replace={replace} />]}</main>
    );
    render(list(false), container);
    render(list(true), container);
    expect(calls).toEqual(['old']);
    expect(container.textContent).toBe('replacement');
  });

  const sizes = [3, 40];
  for (let j = 0, len = sizes.length; j < len; ++j) {
    const size = sizes[j];
    it(
      'recovers nested registrations after a later complex-keyed sibling throws (' +
        size +
        ' items)',
      async () => {
        const calls: string[] = [];
        const finishes: Array<() => void> = [];
        let fail = false;
        function Card({ id, version }) {
          return <span>{id + version}</span>;
        }
        const move = (_v, _p, _d, props) =>
          calls.push(props.id + props.version);
        function Pair({ version, ids }) {
          return (
            <Fragment>
              {ids.map((id) => (
                <Card
                  key={id}
                  id={id}
                  version={version}
                  onComponentWillMove={move}
                  onComponentWillDisappear={(_d, _p, done) =>
                    finishes.push(() => done())
                  }
                />
              ))}
            </Fragment>
          );
        }
        function Later({ id }) {
          if (fail && id === 1) throw new Error('later sibling');
          return <i>{id}</i>;
        }
        const list = (order: number[], version: number, ids = ['a', 'b']) => (
          <main>
            {order.map((id) =>
              id === 0 ? (
                <Pair key={id} ids={ids} version={version} />
              ) : (
                <Later key={id} id={id} />
              ),
            )}
          </main>
        );
        const original = Array.from({ length: size }, (_v, i) => i);
        const reordered = [size - 1, ...original.slice(0, -1)];
        const mounted = list(original, 0);
        render(mounted, container);
        const first = container.querySelector('span');
        const failed = list(reordered, 1, ['b', 'a']);
        fail = true;
        expect(() => render(failed, container)).toThrow(
          new Error('later sibling'),
        );
        // The successfully patched middle child becomes the recovery tree, too.
        expect(mounted.children[0]).toBe(failed.children[1]);
        fail = false;
        calls.length = 0;
        render(list(original, 2, ['b']), container);
        expect(calls).toEqual(['b1', 'a1']);
        calls.length = 0;
        const queued = finishes.splice(0);
        for (let i = 0, len = queued.length; i < len; ++i) {
          const finish = queued[i];
          finish();
        }
        await frame();
        expect(calls).toEqual(['b2']);
        expect(first!.isConnected).toBe(false);
        render(null, container);
        const queued2 = finishes.splice(0);
        for (let i = 0, len = queued2.length; i < len; ++i) {
          const finish = queued2[i];
          finish();
        }
        await frame();
        expect(container.textContent).toBe('');
      },
    );
  }
});
