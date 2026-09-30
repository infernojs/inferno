import { Component, Fragment, render } from 'inferno';
import {
  AnimatedMoveComponent,
  AnimatedComponent,
  type AnimationClass,
  hasPendingAnimations,
} from 'inferno-animation';
import { fakeFrames, type Frames, idle } from './helpers/frames';

describe('coordinated layout moves', () => {
  let container: HTMLDivElement;
  let frames: Frames;
  let reads: number;

  class Card extends AnimatedMoveComponent<{ id: string }, unknown> {
    public render() {
      return <li data-id={this.props.id}>{this.props.id}</li>;
    }
  }

  function list(order: string[], animation: string | AnimationClass = 'Card') {
    return (
      <ul>
        {order.map((id) => (
          <Card key={id} id={id} animation={animation} />
        ))}
      </ul>
    );
  }

  function frame() {
    frames.frame();
  }

  function card(id: string): HTMLElement {
    return container.querySelector('[data-id="' + id + '"]')!;
  }

  function measureRows() {
    for (const node of Array.from(container.querySelectorAll('li'))) {
      node.getBoundingClientRect = () => {
        reads++;
        const offset = /translate\([^,]+,\s*([\d.-]+)px\)/.exec(
          node.style.transform,
        );
        const y =
          Array.from(node.parentNode!.children).indexOf(node) * 42 +
          (offset ? Number(offset[1]) : 0);
        return {
          x: 0,
          y,
          top: y,
          bottom: y + 36,
          left: 0,
          right: 240,
          width: 240,
          height: 36,
          toJSON() {},
        };
      };
    }
  }

  beforeEach(async () => {
    await idle();
    container = document.createElement('div');
    document.body.appendChild(container);
    frames = fakeFrames();
    reads = 0;
    render(list(['A', 'B', 'C', 'D']), container);
    measureRows();
  });

  afterEach(async () => {
    await Promise.resolve();
    frames.drain();
    for (const node of Array.from(container.querySelectorAll('li'))) {
      node.dispatchEvent(new Event('transitionend'));
    }
    render(null, container);
    await Promise.resolve();
    frames.drain();
    frames.restore();
    container.remove();
  });

  it('registers no listener or timer of its own for each moving item', async () => {
    const listeners = spyOn(
      EventTarget.prototype,
      'addEventListener',
    ).and.callThrough();
    const timers = spyOn(window, 'setTimeout').and.callThrough();
    render(list(['D', 'C', 'B', 'A']), container);
    await Promise.resolve();
    frame();
    expect(card('A').classList.contains('Card-move-active')).toBe(true);
    expect(
      listeners.calls.all().filter((call) => call.object instanceof Element)
        .length,
    ).toBe(0);
    expect(timers.calls.count()).toBeLessThanOrEqual(1);
  });

  it('measures each sibling once before and once after a reorder with insertion', async () => {
    render(list(['D', 'X', 'A', 'B', 'C']), container);
    await Promise.resolve();
    expect(reads).toBe(8);
    expect(card('A').style.transform.replace(/\s/g, '')).toContain(
      'translate(0px,-84px)',
    );
    expect(card('B').style.transform.replace(/\s/g, '')).toContain(
      'translate(0px,-84px)',
    );
    expect(card('C').style.transform.replace(/\s/g, '')).toContain(
      'translate(0px,-84px)',
    );
    expect(card('D').style.transform.replace(/\s/g, '')).toContain(
      'translate(0px,126px)',
    );
    expect(card('X').style.transform).toBe('');
  });

  it('animates insertions and removals without reordering retained keys', async () => {
    render(list(['X', 'A', 'B', 'C', 'D']), container);
    await Promise.resolve();
    expect(card('A').style.transform.replace(/\s/g, '')).toContain(
      'translate(0px,-42px)',
    );
    frame();
    for (const node of Array.from(container.querySelectorAll('li')))
      node.dispatchEvent(new Event('transitionend'));
    render(list(['X', 'A', 'C', 'D']), container);
    await Promise.resolve();
    expect(card('A').style.transform).toBe('');
    expect(card('C').style.transform.replace(/\s/g, '')).toContain(
      'translate(0px,42px)',
    );
    expect(card('D').style.transform.replace(/\s/g, '')).toContain(
      'translate(0px,42px)',
    );
  });

  it('preserves original positions across consecutive commits before activation', async () => {
    render(list(['D', 'X', 'A', 'B', 'C']), container);
    render(list(['C', 'D', 'A', 'B']), container);
    await Promise.resolve();
    expect(card('A').style.transform.replace(/\s/g, '')).toContain(
      'translate(0px,-84px)',
    );
    expect(card('C').style.transform.replace(/\s/g, '')).toContain(
      'translate(0px,84px)',
    );
  });

  it('supersedes activation from an earlier render between animation frames', async () => {
    render(list(['D', 'A', 'B', 'C']), container);
    render(list(['C', 'D', 'A', 'B']), container);
    await Promise.resolve();
    expect(card('A').style.transform.replace(/\s/g, '')).toContain(
      'translate(0px,-84px)',
    );
    expect(card('C').style.transform.replace(/\s/g, '')).toContain(
      'translate(0px,84px)',
    );
    frame();
    expect(window.getComputedStyle(card('A')).transform).toMatch(
      /^(translate\(0px(?:, ?0px)?\)|matrix\(1, 0, 0, 1, 0, 0\))$/,
    );
  });

  it('preserves author transforms, dimensions, transitions and unrelated classes on cleanup', async () => {
    const node = card('A');
    node.style.setProperty('transform', 'scale(0.8)', 'important');
    node.style.width = '120px';
    node.style.height = '36px';
    node.style.setProperty('transition', 'opacity 0.1s', 'important');
    // Engines serialize the shorthand differently, e.g. Firefox 119 as "opacity 0.1s ease 0s"
    const transition = node.style.transition;
    node.className = 'custom';
    render(list(['D', 'A', 'B', 'C']), container);
    await Promise.resolve();
    expect(node.style.transform).toContain('translate(');
    frame();
    node.dispatchEvent(new Event('transitionend'));
    expect(node.style.transform).toBe('scale(0.8)');
    expect(node.style.getPropertyPriority('transform')).toBe('important');
    expect(node.style.width).toBe('120px');
    expect(node.style.height).toBe('36px');
    expect(node.style.transition).toBe(transition);
    expect(node.style.getPropertyPriority('transition')).toBe('important');
    expect(node.className).toBe('custom');
  });

  it('removes only classes added by the move helper when active classes overlap', async () => {
    const animation = { start: '', active: 'custom moving', end: '' };
    render(list(['A', 'B', 'C', 'D'], animation), container);
    await Promise.resolve();
    const node = card('A');
    node.className = 'custom';
    render(list(['D', 'A', 'B', 'C'], animation), container);
    await Promise.resolve();
    expect(node.classList.contains('moving')).toBe(true);
    frame();
    node.dispatchEvent(new Event('transitionend'));
    expect(node.className).toBe('custom');
  });

  it('does not animate unchanged geometry or keep pending work after unmount', async () => {
    render(list(['A', 'B', 'C', 'D']), container);
    await Promise.resolve();
    frame();
    expect(card('A').style.transform).toBe('');
    expect(card('A').className).toBe('');
    render(list(['D', 'A', 'B', 'C']), container);
    await Promise.resolve();
    const old = card('A');
    render(null, container);
    await Promise.resolve();
    frames.drain();
    expect(old.style.transform).toBe('');
    expect(hasPendingAnimations()).toBe(false);
  });

  it('ignores fragment text nodes in sibling measurements', async () => {
    render(null, container);
    await Promise.resolve();
    const template = (order) => (
      <ul>
        <Fragment>
          {''}
          {order.map((id) => (
            <Card key={id} id={id} />
          ))}
          {'tail'}
        </Fragment>
      </ul>
    );
    render(template(['A', 'B']), container);
    await Promise.resolve();
    measureRows();
    render(template(['B', 'A']), container);
    await Promise.resolve();
    expect(card('A').style.transform.replace(/\s/g, '')).toContain(
      'translate(0px,-42px)',
    );
  });
  it('coalesces source and target reads across synchronous commits', async () => {
    render(list(['D', 'A', 'B', 'C']), container);
    render(list(['C', 'D', 'A', 'B']), container);
    expect(reads).toBe(4);
    await Promise.resolve();
    expect(reads).toBe(8);
  });

  it("uses the moving items' classes when a stationary prefix has another animation", async () => {
    const mixed = (order: string[]) => (
      <ul>
        {order.map((id) => (
          <Card key={id} id={id} animation={id === 'A' ? 'Header' : 'Item'} />
        ))}
      </ul>
    );
    render(null, container);
    render(mixed(['A', 'B', 'C']), container);
    measureRows();

    render(mixed(['A', 'C', 'B']), container);
    expect(reads).toBe(3);
    await Promise.resolve();
    expect(reads).toBe(6);
    expect(card('A').className).toBe('');
    expect(card('B').className).toBe('Item-move-active');
    expect(card('C').className).toBe('Item-move-active');

    frame();
    for (const id of ['B', 'C']) {
      card(id).dispatchEvent(new Event('transitionend'));
      expect(card(id).className).toBe('');
    }
  });

  it('preserves individual named and custom move classes across consecutive commits', async () => {
    const custom = { start: '', active: 'custom moving', end: '' };
    const mixed = (order: string[], itemAnimation = 'Item') => (
      <ul>
        {order.map((id) => (
          <Card
            key={id}
            id={id}
            animation={
              id === 'A' ? 'Header' : id === 'B' ? itemAnimation : custom
            }
          />
        ))}
      </ul>
    );
    render(null, container);
    render(mixed(['A', 'B', 'C']), container);
    measureRows();
    card('C').className = 'custom';

    render(mixed(['A', 'C', 'B'], 'Header'), container);
    render(mixed(['C', 'A', 'B'], 'Header'), container);
    expect(reads).toBe(3);
    await Promise.resolve();
    expect(reads).toBe(6);
    expect(card('A').className).toBe('Header-move-active');
    expect(card('B').className).toBe('Header-move-active');
    expect(card('C').className).toBe('custom moving');

    frame();
    for (const id of ['A', 'B', 'C']) {
      card(id).dispatchEvent(new Event('transitionend'));
      expect(card(id).className).toBe(id === 'C' ? 'custom' : '');
    }
  });

  it('keeps move classes on every root of a fragment owner after a stationary prefix', async () => {
    class Group extends AnimatedMoveComponent<{ ids: string[] }, unknown> {
      public render() {
        return (
          <Fragment>
            {this.props.ids.map((id) => (
              <li key={id} data-id={id}>
                {id}
              </li>
            ))}
          </Fragment>
        );
      }
    }
    const groups = (order: string[]) => (
      <ul>
        {[
          <Card key="A" id="A" animation="Header" />,
          ...order.map((id) => (
            <Group key={id} ids={[id, id + '2']} animation={id} />
          )),
        ]}
      </ul>
    );
    render(null, container);
    render(groups(['B', 'C']), container);
    measureRows();

    render(groups(['C', 'B']), container);
    await Promise.resolve();
    expect(reads).toBe(10);
    expect(card('A').className).toBe('');
    for (const id of ['B', 'C']) {
      expect(card(id).className).toBe(id + '-move-active');
      expect(card(id + '2').className).toBe(id + '-move-active');
    }
  });

  it('does not prepare an unrelated enter animation during a move flush', async () => {
    const other = document.createElement('div');
    document.body.appendChild(other);
    class Enter extends AnimatedComponent<unknown, unknown> {
      public render() {
        return <aside />;
      }
    }
    render(<Enter />, other);
    expect((other.firstChild as HTMLElement).style.display).toBe('none');
    render(list(['D', 'A', 'B', 'C']), container);
    await Promise.resolve();
    expect((other.firstChild as HTMLElement).style.display).toBe('none');
    frame();
    expect((other.firstChild as HTMLElement).style.display).toBe('');
    // Avoid introducing a leave transition in this scheduling-only fixture.
    render(null, other);
    frames.drain();
    other.firstChild?.dispatchEvent(new Event('transitionend'));
    other.remove();
  });

  it('does not measure outer targets during a lifecycle-triggered nested render', async () => {
    const other = document.createElement('div');
    document.body.appendChild(other);
    let nestedReads = -1;
    class Host extends Component<{ order: string[] }> {
      public componentDidUpdate() {
        const before = reads;
        render(list(['C', 'B', 'A', 'D']), other);
        nestedReads = reads - before;
      }
      public render() {
        return list(this.props.order);
      }
    }
    render(<Host order={['A', 'B', 'C', 'D']} />, container);
    render(list(['A', 'B', 'C', 'D']), other);
    measureRows();
    reads = 0;
    render(<Host order={['D', 'A', 'B', 'C']} />, container);
    expect(nestedReads).toBe(0);
    expect(reads).toBe(4);
    await Promise.resolve();
    expect(reads).toBe(8);
    render(null, other);
    other.remove();
  });

  it('batches asynchronous removals with one source and target pass', async () => {
    const completions: Array<() => void> = [];
    class Deferred extends Card {
      public componentWillDisappear(_dom, done: () => void) {
        completions.push(done);
      }
    }
    const template = (order: string[]) => (
      <ul>
        {order.map((id) => (
          <Deferred key={id} id={id} />
        ))}
      </ul>
    );
    render(template(['A', 'B', 'C', 'D', 'E', 'F']), container);
    measureRows();
    render(template(['A', 'F']), container);
    await Promise.resolve();
    reads = 0;
    for (const complete of completions) {
      complete();
      complete();
    }
    expect(reads).toBe(0);
    expect(container.textContent).toBe('ABCDEF');
    frame();
    await Promise.resolve();
    expect(container.textContent).toBe('AF');
    expect(reads).toBe(8); // Six original siblings plus two survivors, independent of callback count.
    expect(card('F').style.transform).toContain('168px');
  });
  it('does not read computed styles for unchanged geometry', async () => {
    const computed = spyOn(window, 'getComputedStyle').and.callThrough();
    render(list(['A', 'B', 'C', 'D']), container);
    await Promise.resolve();
    expect(reads).toBe(0);
    expect(computed).not.toHaveBeenCalled();
  });

  it('removes completed leaves even when deferred preparation throws', async () => {
    let complete!: () => void;
    let fail = false;
    class Deferred extends Card {
      public componentWillMove(parent, dom, node) {
        if (fail) throw new Error('deferred preparation');
        super.componentWillMove(parent, dom, node);
      }
      public componentWillDisappear(_dom, done: () => void) {
        complete = done;
      }
    }
    const template = (order: string[]) => (
      <ul>
        {order.map((id) => (
          <Deferred key={id} id={id} />
        ))}
      </ul>
    );
    render(template(['A', 'B']), container);
    measureRows();
    render(template(['B']), container);
    await Promise.resolve();
    fail = true;
    complete();
    expect(() => frame()).toThrow(new Error('deferred preparation'));
    expect(container.textContent).toBe('B');
    fail = false;
    render(null, container);
    complete();
  });
  it('queries the animations of a parent a constant number of times, and of a moved element once', async () => {
    // A subtree query sorts every animation of the document; an element without animations
    // answers its own query at once
    let subtreeQueries = 0;
    const elementQueries = new Map<Element, number>();
    const parent = container.firstElementChild!;
    parent.getAnimations = () => {
      subtreeQueries++;
      return [];
    };
    for (const node of Array.from(parent.children))
      node.getAnimations = () => {
        elementQueries.set(node, (elementQueries.get(node) ?? 0) + 1);
        return [];
      };
    render(list(['D', 'A', 'B', 'C']), container);
    await Promise.resolve();
    frame();
    expect(subtreeQueries).toBeLessThanOrEqual(3);
    for (const count of elementQueries.values()) expect(count).toBe(1);
    expect(card('A').classList.contains('Card-move-active')).toBe(true);
  });

  it('answers for retargeted elements with one query of the parent, which finds their script animations', async () => {
    render(list(['D', 'A', 'B', 'C']), container);
    await Promise.resolve();
    frame();
    expect(card('B').classList.contains('Card-move-active')).toBe(true);
    // A retargeted element still has the move transition that the reset cancels, so its own
    // query would sort every animation of the document
    let subtreeQueries = 0;
    let elementQueries = 0;
    const parent = container.firstElementChild!;
    parent.getAnimations = () => {
      subtreeQueries++;
      return [
        {
          playState: 'running',
          effect: {
            target: card('B'),
            pseudoElement: null,
            getKeyframes: () => [{ transform: 'scale(1.1)' }],
          },
        },
        {
          playState: 'running',
          effect: {
            target: card('C'),
            pseudoElement: '::before',
            getKeyframes: () => [{ transform: 'scale(1.1)' }],
          },
        },
      ] as any;
    };
    for (const node of Array.from(parent.children))
      node.getAnimations = () => {
        elementQueries++;
        return [];
      };
    render(list(['C', 'D', 'A', 'B']), container);
    await Promise.resolve();
    // Before the patch and after it
    expect(subtreeQueries).toBe(2);
    expect(elementQueries).toBe(0);
    expect(card('B').style.getPropertyValue('translate')).not.toBe('');
    expect(card('B').style.transform).toBe('');
    // An animation of a pseudo-element leaves the element's transform alone
    expect(card('C').style.getPropertyValue('translate')).toBe('');
    expect(card('C').style.transform).not.toBe('');
  });

  it('measures leaving elements together after the commit', async () => {
    class Leaving extends AnimatedComponent<{ id: string }, unknown> {
      public render() {
        return <li data-id={this.props.id}>{this.props.id}</li>;
      }
    }
    const items = (ids: string[]) => (
      <ul>
        {ids.map((id) => (
          <Leaving key={id} id={id} />
        ))}
      </ul>
    );
    render(null, container);
    render(items(['A', 'B', 'C', 'D', 'E']), container);
    await Promise.resolve();
    frames.drain();
    for (const node of Array.from(container.querySelectorAll('li'))) {
      node.dispatchEvent(new Event('transitionend'));
    }
    measureRows();
    reads = 0;
    render(items(['B', 'D']), container);
    expect(reads).toBe(0);
    await Promise.resolve();
    frame();
    expect(reads).toBe(3);
    expect(card('A').style.height).toBe('36px');
  });

  describe('updates that keep the keys', () => {
    it('are left alone', async () => {
      render(list(['A', 'B', 'C', 'D'], 'Other'), container);
      expect(reads).toBe(0);
      await Promise.resolve();
      frame();
      expect(reads).toBe(0);
      for (const node of Array.from(container.querySelectorAll('li'))) {
        expect(node.style.transform).toBe('');
        expect(node.className).toBe('');
      }
      expect(hasPendingAnimations()).toBe(false);
    });

    it('keep a running move going', async () => {
      render(list(['D', 'A', 'B', 'C']), container);
      await Promise.resolve();
      frame();
      const node = card('A');
      const transform = node.style.transform;
      expect(node.classList.contains('Card-move-active')).toBe(true);
      reads = 0;
      render(list(['D', 'A', 'B', 'C']), container);
      await Promise.resolve();
      frame();
      expect(reads).toBe(0);
      expect(node.style.transform).toBe(transform);
      expect(node.classList.contains('Card-move-active')).toBe(true);
      node.dispatchEvent(new Event('transitionend'));
      expect(node.style.transform).toBe('');
      expect(node.classList.contains('Card-move-active')).toBe(false);
    });

    it('leave a later reorder in the same task its own source positions', async () => {
      render(list(['A', 'B', 'C', 'D'], 'Other'), container);
      expect(reads).toBe(0);
      render(list(['D', 'A', 'B', 'C']), container);
      expect(reads).toBe(4);
      await Promise.resolve();
      expect(reads).toBe(8);
      expect(card('A').style.transform.replace(/\s/g, '')).toContain(
        'translate(0px,-42px)',
      );
    });

    it('still call custom hooks, overrides of the built-in one included', async () => {
      const calls: string[] = [];
      class Custom extends AnimatedMoveComponent<{ id: string }, unknown> {
        public componentWillMove(parent, dom, node) {
          calls.push(this.props.id);
          super.componentWillMove(parent, dom, node);
        }

        public render() {
          return <li data-id={this.props.id}>{this.props.id}</li>;
        }
      }
      const custom = () => (
        <ul>
          {['A', 'B'].map((id) => (
            <Custom key={id} id={id} />
          ))}
        </ul>
      );
      render(null, container);
      render(custom(), container);
      render(custom(), container);
      await Promise.resolve();
      expect(calls).toEqual(['A', 'B']);
      expect(hasPendingAnimations()).toBe(false);
    });

    it('still prepare a pass when an item is replaced by another type', async () => {
      class Other extends AnimatedMoveComponent<{ id: string }, unknown> {
        public render() {
          return <li data-id={this.props.id}>{this.props.id}</li>;
        }
      }
      const mixed = (replaced: boolean) => (
        <ul>
          {['A', 'B', 'C', 'D'].map((id) =>
            id === 'B' && replaced ? (
              <Other key={id} id={id} />
            ) : (
              <Card key={id} id={id} />
            ),
          )}
        </ul>
      );
      render(mixed(true), container);
      // Sources of all four; targets of the three that stayed
      expect(reads).toBe(4);
      await Promise.resolve();
      expect(reads).toBe(7);
    });

    it('still prepare an owner that renders a keyed fragment', async () => {
      class Group extends AnimatedMoveComponent<{ ids: string[] }, unknown> {
        public render() {
          return (
            <Fragment>
              {this.props.ids.map((id) => (
                <li key={id} data-id={id}>
                  {id}
                </li>
              ))}
            </Fragment>
          );
        }
      }
      const groups = (first: string[]) => (
        <ul>
          {[
            <Group key="1" ids={first} animation="Card" />,
            <Group key="2" ids={['C', 'D']} animation="Card" />,
          ]}
        </ul>
      );
      render(null, container);
      render(groups(['A', 'B']), container);
      measureRows();
      render(groups(['B', 'A']), container);
      await Promise.resolve();
      expect(card('A').style.transform.replace(/\s/g, '')).toContain(
        'translate(0px,-42px)',
      );
      expect(card('B').style.transform.replace(/\s/g, '')).toContain(
        'translate(0px,42px)',
      );
    });
  });
});
