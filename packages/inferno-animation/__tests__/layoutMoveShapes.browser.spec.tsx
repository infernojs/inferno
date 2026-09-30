import { Fragment, render } from 'inferno';
import {
  AnimatedAllComponent,
  AnimatedMoveComponent,
  hasPendingAnimations,
} from 'inferno-animation';
import {
  browserHelpers,
  frame,
  position,
  type Position,
  until,
} from './helpers/browser';

// Geometry and transition progress require an actual layout engine.
const browserDescribe = global.usingJSDOM ? xdescribe : describe;

browserDescribe('layout move shapes in a browser', () => {
  let container: HTMLDivElement;
  let styles: HTMLStyleElement;
  const { card, elements, positions, seekMoves, settle } = browserHelpers(
    () => container,
  );

  class MoveCard extends AnimatedMoveComponent<{ id: string }, unknown> {
    public render() {
      return <li data-id={this.props.id}>{this.props.id}</li>;
    }
  }
  class AllCard extends AnimatedAllComponent<{ id: string }, unknown> {
    public render() {
      return <li data-id={this.props.id}>{this.props.id}</li>;
    }
  }
  function expectAt(id: string, where: Position) {
    const now = position(card(id));
    expect(now.x).toBeCloseTo(where.x, 0);
    expect(now.y).toBeCloseTo(where.y, 0);
  }
  function expectPositions(before: Record<string, Position>) {
    for (const id of Object.keys(before)) expectAt(id, before[id]);
  }
  function expectClean() {
    for (const node of elements()) {
      expect((node.getAttribute('style') || '') + '|' + node.className).toBe(
        '|',
      );
    }
  }
  function list(order: string[], Item: any = MoveCard, className?: string) {
    return (
      <ul className={className}>
        {order.map((id) => (
          <Item key={id} id={id} animation="ShapeTest" />
        ))}
      </ul>
    );
  }

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'layout-shape-test';
    // Keep the fixture independent of runner UI and preceding test containers.
    container.style.cssText = 'position: fixed; left: 20px; top: 20px;';
    document.body.appendChild(container);
    styles = document.createElement('style');
    styles.textContent = `
      .layout-shape-test ul, .layout-shape-test p { padding: 0; margin: 0; list-style: none; }
      .layout-shape-test li { box-sizing: border-box; height: 36px; width: 240px; margin: 0 0 6px; padding: 0; }
      .layout-shape-test ul.row { display: flex; }
      .layout-shape-test ul.grid { display: flex; flex-wrap: wrap; width: 300px; }
      .layout-shape-test ul.row li, .layout-shape-test ul.grid li { width: 100px; height: 40px; margin: 0; }
      .layout-shape-test .ShapeTest-move-active { transition: transform .2s linear; }
      .layout-shape-test .ShapeTest-enter, .layout-shape-test .ShapeTest-leave-end { opacity: 0; height: 0; margin-bottom: 0; }
      .layout-shape-test .ShapeTest-enter-active, .layout-shape-test .ShapeTest-leave-active { transition: height .2s linear, margin-bottom .2s linear, opacity .2s linear; }
    `;
    document.head.appendChild(styles);
  });

  afterEach(async () => {
    render(null, container);
    await settle();
    container.remove();
    styles.remove();
  });

  it('slides items horizontally in a row', async () => {
    render(list(['A', 'B', 'C', 'D'], MoveCard, 'row'), container);
    const before = positions();
    render(list(['D', 'A', 'B', 'C'], MoveCard, 'row'), container);
    await Promise.resolve();
    expectPositions(before);
    await seekMoves(0.5);
    expect(position(card('A')).x).toBeCloseTo(before.A.x + 50, 0);
    expect(position(card('D')).x).toBeCloseTo(before.D.x - 150, 0);
    expect(position(card('A')).y).toBeCloseTo(before.A.y, 0);
    await settle();
    expect(position(card('D')).x).toBeCloseTo(before.A.x, 0);
    expectClean();
  });

  it('slides items diagonally when they wrap to another row of a grid', async () => {
    const start = ['A', 'B', 'C', 'D', 'E', 'F'];
    render(list(start, MoveCard, 'grid'), container);
    const before = positions();
    render(list(['F', 'A', 'B', 'C', 'D', 'E'], MoveCard, 'grid'), container);
    await Promise.resolve();
    expectPositions(before);
    await seekMoves(0.5);
    // C moves from the end of the first row to the start of the second one
    expect(position(card('C')).x).toBeCloseTo(before.C.x - 100, 0);
    expect(position(card('C')).y).toBeCloseTo(before.C.y + 20, 0);
    await settle();
    expectAt('C', before.D);
    expectAt('F', before.A);
    expectClean();
  });

  it('moves every root of a fragment owner from its own box', async () => {
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
    render(list(['A', 'B', 'C'], Pair), container);
    const before = positions();
    render(list(['C', 'A', 'B'], Pair), container);
    await Promise.resolve();
    expectPositions(before);
    await settle();
    expectAt('C', before.A);
    expectAt('C2', before.A2);
    expectAt('B2', before.C2);
    expectClean();
  });

  it('keeps items continuous through repeated retargets and cleans up', async () => {
    render(list(['A', 'B', 'C', 'D']), container);
    for (const order of [
      ['D', 'A', 'B', 'C'],
      ['C', 'D', 'A', 'B'],
      ['B', 'C', 'D', 'A'],
      ['A', 'B', 'C', 'D'],
      ['D', 'C', 'B', 'A'],
    ]) {
      const visible = positions();
      render(list(order), container);
      await Promise.resolve();
      expectPositions(visible);
      await seekMoves(0.3);
    }
    await settle();
    expect(container.textContent).toBe('DCBA');
    expectClean();
  });

  it('cleans up moves of inline elements, which transforms do not move', async () => {
    const inline = (order: string[]) => (
      <p>
        {order.map((id) => (
          <InlineCard key={id} id={id} animation="ShapeTest" />
        ))}
      </p>
    );
    class InlineCard extends AnimatedMoveComponent<{ id: string }, unknown> {
      public render() {
        return <span data-id={this.props.id}>{this.props.id}</span>;
      }
    }
    render(inline(['A', 'B', 'C']), container);
    render(inline(['C', 'A', 'B']), container);
    await Promise.resolve();
    await until(() => !hasPendingAnimations(), 60);
    await until(() => !container.querySelector('[class*="-active"]'), 60);
    expect(container.textContent).toBe('CAB');
    expectClean();
  });

  it('leaves nothing behind when an item mounts and unmounts in one task', async () => {
    render(list(['A', 'B'], AllCard), container);
    await settle();
    render(list(['A', 'X', 'B'], AllCard), container);
    render(list(['A', 'B'], AllCard), container);
    await until(() => !hasPendingAnimations() && !card('X'), 120);
    expect(container.textContent).toBe('AB');
    expectClean();
  });

  it('keeps the order when a key comes back while its old element leaves', async () => {
    render(list(['A', 'B', 'C'], AllCard), container);
    await settle();
    render(list(['A', 'C'], AllCard), container);
    await frame();
    await frame();
    const leaving = card('B');
    render(list(['A', 'B', 'C'], AllCard), container);
    expect(card('B')).toBe(leaving);
    await settle();
    await until(() => !leaving.isConnected);
    expect(container.textContent).toBe('ABC');
    expectClean();
  });

  // Random insertions, removals and moves at random intervals, several in one task at times.
  // Right after every update, each item that is neither entering nor leaving is where it was.
  for (const seed of [1, 2, 3]) {
    it(
      'keeps retained items in place and ends clean through random updates, seed ' +
        seed,
      async () => {
        let state = seed * 7919;
        const random = () =>
          (state = (state * 48271) % 2147483647) / 2147483647;
        const busy = (node: Element) => /-enter|-leave/.test(node.className);
        let order = ['a', 'b', 'c', 'd', 'e', 'f'];
        let next = 0;
        const jumps: string[] = [];
        render(list(order, AllCard), container);
        await settle();
        // Visible positions before the first update of the current task
        let before: Record<string, Position> | null = null;
        for (let step = 0; step < 25; step++) {
          const operation = random();
          order = order.slice();
          if (operation < 0.3 || order.length < 3) {
            order.splice(
              Math.floor(random() * (order.length + 1)),
              0,
              'n' + next++,
            );
          } else if (operation < 0.5) {
            order.splice(Math.floor(random() * order.length), 1);
          } else {
            const [moved] = order.splice(
              Math.floor(random() * order.length),
              1,
            );
            order.splice(Math.floor(random() * (order.length + 1)), 0, moved);
          }
          if (before === null) {
            before = {};
            for (const node of elements()) {
              if (!busy(node)) before[node.dataset.id!] = position(node);
            }
          }
          render(list(order, AllCard), container);
          const wait = Math.floor(random() * 14);
          // Some updates share a task with the next one
          if (wait > 10) continue;
          await Promise.resolve();
          for (const node of elements()) {
            const id = node.dataset.id!;
            if (busy(node) || !(id in before) || !order.includes(id)) continue;
            const now = position(node);
            if (Math.abs(now.y - before[id].y) > 1)
              jumps.push(
                `step ${step}, ${order.join(' ')}: ${id} ${before[id].y} -> ${now.y}`,
              );
          }
          before = null;
          for (let i = 0; i < wait; i++) await frame();
        }
        expect(jumps).toEqual([]);
        await settle();
        await until(() => elements().length === order.length);
        expect(elements().map((node) => node.dataset.id)).toEqual(order);
        expectClean();
      },
      30000,
    );
  }
});
