import { Fragment, render } from 'inferno';
import {
  AnimatedAllComponent,
  AnimatedMoveComponent,
  componentWillMove,
  hasPendingAnimations,
} from 'inferno-animation';
import {
  endTransitions,
  fakeBoxes,
  fakeFrames,
  type Frames,
  idle,
} from './helpers/frames';

// Every retained item that changes place starts from its previous box. The geometry is computed
// from the element index, so the same checks run in jsdom and in browsers.
describe('move shapes with index geometry', () => {
  type Layout = 'column' | 'row' | 'grid';
  interface Point {
    x: number;
    y: number;
  }
  const ROW = 42;
  const COLUMN = 100;
  const COLUMNS = 3;

  let container: HTMLDivElement;
  let frames: Frames;
  let layout: Layout;

  function place(index: number): Point {
    switch (layout) {
      case 'row':
        return { x: index * COLUMN, y: 0 };
      case 'grid':
        return {
          x: (index % COLUMNS) * COLUMN,
          y: Math.floor(index / COLUMNS) * ROW,
        };
      default:
        return { x: 0, y: index * ROW };
    }
  }
  function translation(node: HTMLElement): Point {
    const match = /translate\(\s*([\d.-]+)px,\s*([\d.-]+)px\)/.exec(
      node.style.transform,
    );
    return match
      ? { x: Number(match[1]), y: Number(match[2]) }
      : { x: 0, y: 0 };
  }
  function items(): HTMLElement[] {
    return Array.from(container.querySelectorAll('li'));
  }
  function item(id: string): HTMLElement {
    return container.querySelector('[data-id="' + id + '"]') as HTMLElement;
  }
  function placeOf(node: HTMLElement): Point {
    return place(Array.from(node.parentNode!.children).indexOf(node));
  }
  function frame() {
    frames.frame();
  }
  function finishTransitions() {
    endTransitions(items());
  }
  function translate(from: Point, to: Point): string {
    return `translate(${from.x - to.x}px,${from.y - to.y}px)`;
  }
  // Without whitespace, and with the translation that browsers serialize as translate(0px)
  function normalize(css: string): string {
    return css
      .replace(/\s/g, '')
      .replace(/translate\(([^,)]+)\)/g, 'translate($1,0px)');
  }
  // The inline style and classes of every item by id
  function states(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const node of items()) {
      result[node.dataset.id!] = normalize(
        (node.getAttribute('style') || '') + '|' + node.className,
      );
    }
    return result;
  }
  function transforms(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const node of items()) {
      result[node.dataset.id!] = normalize(node.style.transform);
    }
    return result;
  }

  class Card extends AnimatedMoveComponent<{ id: string }, unknown> {
    public render() {
      return <li data-id={this.props.id}>{this.props.id}</li>;
    }
  }
  function Row({ id }: { id: string; animation?: string }) {
    return <li data-id={id}>{id}</li>;
  }
  class ComposedCard extends AnimatedMoveComponent<{ id: string }, unknown> {
    public render() {
      return <Row id={this.props.id} />;
    }
  }
  class Pair extends AnimatedMoveComponent<{ id: string }, unknown> {
    public render() {
      return (
        <Fragment>
          <li data-id={this.props.id}>{this.props.id}</li>
          <li data-id={this.props.id + '2'}>{this.props.id + '2'}</li>
        </Fragment>
      );
    }
  }
  const owners: Record<string, (id: string) => any> = {
    'a class owner': (id) => <Card key={id} id={id} animation="Card" />,
    'a function owner': (id) => (
      <Row
        key={id}
        id={id}
        animation="Card"
        onComponentWillMove={componentWillMove}
      />
    ),
    'a class owner rendering a function component': (id) => (
      <ComposedCard key={id} id={id} animation="Card" />
    ),
    'an owner rendering a fragment': (id) => (
      <Pair key={id} id={id} animation="Card" />
    ),
  };
  let owner: (id: string) => any;
  function view(order: string[]) {
    return <ul>{order.map((id) => owner(id))}</ul>;
  }

  // Renders order and checks the start transform of every item: each retained item that changed
  // place starts from its previous box. Excluded items (entering or leaving) do not move.
  async function update(
    order: string[],
    excluded: HTMLElement[] = [],
  ): Promise<HTMLElement[]> {
    const before = new Map<HTMLElement, Point>();
    for (const node of items()) before.set(node, placeOf(node));
    render(view(order), container);
    await Promise.resolve();
    const moved: HTMLElement[] = [];
    const expected: Record<string, string> = {};
    for (const node of items()) {
      const from = excluded.includes(node) ? undefined : before.get(node);
      const to = placeOf(node);
      if (from !== undefined && (from.x !== to.x || from.y !== to.y)) {
        moved.push(node);
        expected[node.dataset.id!] = translate(from, to);
      } else {
        expected[node.dataset.id!] = '';
      }
    }
    expect(transforms()).toEqual(expected);
    return moved;
  }

  beforeEach(async () => {
    await idle();
    container = document.createElement('div');
    document.body.appendChild(container);
    frames = fakeFrames();
    layout = 'column';
    owner = owners['a class owner'];
    fakeBoxes((element) => {
      if (element.tagName !== 'LI' || !container.contains(element)) {
        return undefined;
      }
      const at = placeOf(element as HTMLElement);
      const offset = translation(element as HTMLElement);
      return [at.x + offset.x, at.y + offset.y, 90, 36];
    });
  });

  afterEach(async () => {
    await Promise.resolve();
    frames.drain();
    finishTransitions();
    render(null, container);
    await Promise.resolve();
    frames.drain();
    finishTransitions();
    frames.restore();
    container.remove();
  });

  const START = ['A', 'B', 'C', 'D', 'E'];
  const shapes: Array<[string, string[]]> = [
    ['keeps the order', ['A', 'B', 'C', 'D', 'E']],
    ['swaps two neighbours', ['A', 'C', 'B', 'D', 'E']],
    ['swaps the ends', ['E', 'B', 'C', 'D', 'A']],
    ['moves the first item to the end', ['B', 'C', 'D', 'E', 'A']],
    ['moves the last item to the front', ['E', 'A', 'B', 'C', 'D']],
    ['moves an item into the middle', ['B', 'C', 'A', 'D', 'E']],
    ['reverses the list', ['E', 'D', 'C', 'B', 'A']],
    ['shuffles every item', ['C', 'E', 'A', 'D', 'B']],
    ['prepends an item', ['X', 'A', 'B', 'C', 'D', 'E']],
    ['inserts an item in the middle', ['A', 'B', 'X', 'C', 'D', 'E']],
    ['appends an item', ['A', 'B', 'C', 'D', 'E', 'X']],
    ['removes the first item', ['B', 'C', 'D', 'E']],
    ['removes an item from the middle', ['A', 'B', 'D', 'E']],
    ['removes the last item', ['A', 'B', 'C', 'D']],
    ['replaces an item in place', ['A', 'B', 'X', 'D', 'E']],
    ['removes, inserts and reorders at once', ['X', 'D', 'A', 'C']],
    ['replaces every item', ['V', 'W', 'X']],
  ];

  function checkShape(order: string[]) {
    return async () => {
      render(view(START), container);
      const moved = await update(order);
      expect(items().map((node) => node.dataset.id![0])).toEqual(
        order.flatMap((id) =>
          owner === owners['an owner rendering a fragment'] ? [id, id] : [id],
        ),
      );
      // Activation: the moved items transition to their own boxes, the others stay untouched
      frame();
      const active: Record<string, string> = {};
      for (const node of items()) {
        active[node.dataset.id!] = moved.includes(node)
          ? 'transform:translate(0px,0px);|Card-move-active'
          : '|';
      }
      expect(states()).toEqual(active);
      // Cleanup
      finishTransitions();
      const clean: Record<string, string> = {};
      for (const node of items()) clean[node.dataset.id!] = '|';
      expect(states()).toEqual(clean);
      expect(hasPendingAnimations()).toBe(false);
    };
  }

  for (const mode of ['column', 'row', 'grid'] as Layout[]) {
    describe('in a ' + mode + ' layout', () => {
      beforeEach(() => {
        layout = mode;
      });
      for (const [name, order] of shapes) {
        it(name, checkShape(order));
      }
    });
  }

  for (const name of Object.keys(owners).slice(1)) {
    describe('with ' + name, () => {
      beforeEach(() => {
        owner = owners[name];
      });
      for (const index of [1, 6, 8, 12, 15]) {
        it(shapes[index][0], checkShape(shapes[index][1]));
      }
    });
  }

  it('animates nothing when a task returns to the original order', async () => {
    render(view(START), container);
    render(view(['E', 'A', 'B', 'C', 'D']), container);
    render(view(START), container);
    await Promise.resolve();
    frame();
    expect(states()).toEqual({ A: '|', B: '|', C: '|', D: '|', E: '|' });
    expect(hasPendingAnimations()).toBe(false);
  });

  it('starts from the first positions of a task after three commits', async () => {
    render(view(START), container);
    const first = new Map(items().map((node) => [node, placeOf(node)]));
    render(view(['E', 'A', 'B', 'C', 'D']), container);
    render(view(['D', 'E', 'A', 'B', 'C']), container);
    render(view(['C', 'D', 'E', 'A', 'B']), container);
    await Promise.resolve();
    const expected: Record<string, string> = {};
    for (const node of items()) {
      expected[node.dataset.id!] = translate(first.get(node)!, placeOf(node));
    }
    expect(transforms()).toEqual(expected);
  });

  describe('with enter and leave animations', () => {
    class Both extends AnimatedAllComponent<{ id: string }, unknown> {
      public render() {
        return <li data-id={this.props.id}>{this.props.id}</li>;
      }
    }
    function finish(ids: string[]) {
      for (const id of ids) item(id).dispatchEvent(new Event('transitionend'));
    }

    beforeEach(async () => {
      owner = (id) => <Both key={id} id={id} animation="Card" />;
      render(view(START), container);
      await Promise.resolve();
      frames.drain();
      finishTransitions();
    });

    it('moves the neighbours of an item that is still entering, but not the item', async () => {
      await update(['A', 'X', 'B', 'C', 'D', 'E']);
      frames.drain();
      finish(START);
      const x = item('X');
      expect(x.className).toBe('Card-enter-active Card-enter-end');
      const moved = await update(['C', 'A', 'X', 'B', 'D', 'E'], [x]);
      expect(moved.map((node) => node.dataset.id)).toEqual(['C', 'A', 'B']);
      expect(x.className).toBe('Card-enter-active Card-enter-end');
    });

    it('does not move a leaving item while its neighbours move', async () => {
      const b = item('B');
      // B stays in the document until its leave completes; the others reorder around it
      const moved = await update(['E', 'A', 'C', 'D'], [b]);
      expect(moved.map((node) => node.dataset.id)).toEqual([
        'E',
        'A',
        'C',
        'D',
      ]);
      expect(b.className).toBe('Card-leave Card-leave-active');
      frame();
      finish(['E', 'A', 'C', 'D']);
      expect(b.className).toBe('Card-leave-active Card-leave-end');
      // Completing the leave removes B in the next frame, and the items after it close the gap
      finish(['B']);
      expect(b.isConnected).toBe(true);
      frame();
      await Promise.resolve();
      expect(b.isConnected).toBe(false);
      expect(transforms()).toEqual({
        E: '',
        A: '',
        C: `translate(0px,${ROW}px)`,
        D: `translate(0px,${ROW}px)`,
      });
    });
  });

  it('does not inspect the keyframes of running animations while committing', async () => {
    render(view(START), container);
    const getKeyframes = jasmine.createSpy('getKeyframes').and.returnValue([]);
    item('B').getAnimations = () =>
      [
        { playState: 'running', effect: { target: item('B'), getKeyframes } },
      ] as any;
    render(view(['E', 'A', 'B', 'C', 'D']), container);
    expect(getKeyframes).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(getKeyframes).toHaveBeenCalled();
  });

  it('moves an element whose script animation sets its transform with translate', async () => {
    render(view(START), container);
    item('B').getAnimations = () =>
      [
        {
          playState: 'running',
          effect: {
            target: item('B'),
            getKeyframes: () => [{ transform: 'scale(1.1)' }],
          },
        },
      ] as any;
    render(view(['E', 'A', 'B', 'C', 'D']), container);
    await Promise.resolve();
    expect(item('B').style.getPropertyValue('translate')).toBe(`0px -${ROW}px`);
    expect(item('B').style.transform).toBe('');
  });

  it('asks only elements without a CSS animation for their script animations', async () => {
    render(view(START), container);
    const asked = jasmine.createSpy('getAnimations').and.returnValue([]);
    for (const id of START) item(id).getAnimations = asked;
    const computed = window.getComputedStyle;
    spyOn(window, 'getComputedStyle').and.callFake(
      (node: Element, pseudo?: string | null) => {
        const style = computed.call(window, node, pseudo);
        return node === item('C')
          ? new Proxy(style, {
              get: (target, key) =>
                key === 'animationName'
                  ? 'pulse'
                  : typeof target[key] === 'function'
                    ? target[key].bind(target)
                    : target[key],
            })
          : style;
      },
    );
    render(view(['E', 'A', 'B', 'C', 'D']), container);
    await Promise.resolve();
    expect(asked.calls.all().map((call) => call.object)).not.toContain(
      item('C'),
    );
    expect(item('C').style.getPropertyValue('translate')).toBe(`0px -${ROW}px`);
  });

  it('reads the positions that leaving items have moved to before writing any of them', async () => {
    class Both extends AnimatedAllComponent<{ id: string }, unknown> {
      public render() {
        return <li data-id={this.props.id}>{this.props.id}</li>;
      }
    }
    owner = (id) => <Both key={id} id={id} animation="Card" />;
    render(view(START), container);
    await Promise.resolve();
    frames.drain();
    finishTransitions();
    await update(['E', 'A', 'B', 'C', 'D']);
    frame();
    // A and C leave while they move
    const leavers = [item('A'), item('C')];
    const log: string[] = [];
    const computed = window.getComputedStyle;
    spyOn(window, 'getComputedStyle').and.callFake((node: Element) => {
      if (leavers.includes(node as HTMLElement)) log.push('read');
      return computed(node);
    });
    const remove = DOMTokenList.prototype.remove;
    spyOn(DOMTokenList.prototype, 'remove').and.callFake(function (
      this: DOMTokenList,
      ...names: string[]
    ) {
      if (leavers.some((node) => node.classList === this)) log.push('write');
      remove.apply(this, names);
    });
    render(view(['E', 'B', 'D']), container);
    await Promise.resolve();
    expect(leavers.map((node) => node.className)).toEqual([
      'Card-leave Card-leave-active',
      'Card-leave Card-leave-active',
    ]);
    expect(log.join(' ')).toBe('read read write write');
  });

  it('removes completed leaves at once when their list stops being keyed', async () => {
    const completions: Array<() => void> = [];
    class Leaving extends Card {
      public componentWillDisappear(_dom, done: () => void) {
        completions.push(done);
      }
    }
    owner = (id) => <Leaving key={id} id={id} animation="Card" />;
    render(view(['A', 'B', 'C']), container);
    render(view(['A', 'C']), container);
    await Promise.resolve();
    frames.drain();
    finishTransitions();
    const b = item('B');
    // The completion waits for the next frame to remove B together with other leaves
    completions[0]();
    expect(b.isConnected).toBe(true);
    expect(hasPendingAnimations()).toBe(true);
    render(
      <ul>
        <li>A</li>
        <li>C</li>
      </ul>,
      container,
    );
    expect(b.isConnected).toBe(false);
    expect(hasPendingAnimations()).toBe(false);
    // The replaced A and C leave as well; without move hooks their removal is immediate
    for (const complete of completions.slice(1)) complete();
    expect(container.textContent).toBe('AC');
  });
});
