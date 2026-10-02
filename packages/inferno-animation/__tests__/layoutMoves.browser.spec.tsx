import { render } from 'inferno';
import { AnimatedAllComponent, AnimatedMoveComponent } from 'inferno-animation';
import { browserHelpers, frame, until } from './helpers/browser';

// Geometry and transition progress require an actual layout engine.
const browserDescribe = global.usingJSDOM ? xdescribe : describe;

browserDescribe('layout moves in a browser', () => {
  let container: HTMLDivElement;
  let styles: HTMLStyleElement;
  const { card, seekMoves, settle } = browserHelpers(() => container);

  function View({ id }) {
    return <li data-id={id}>{id}</li>;
  }
  class MoveCard extends AnimatedMoveComponent<{ id: string }, unknown> {
    public render() {
      return <View id={this.props.id} />;
    }
  }
  class AllCard extends AnimatedAllComponent<{ id: string }, unknown> {
    public render() {
      return <View id={this.props.id} />;
    }
  }
  function list(order: string[], Item = MoveCard, animation = 'LayoutTest') {
    return (
      <ul>
        {order.map((id) => (
          <Item key={id} id={id} animation={animation} />
        ))}
      </ul>
    );
  }
  function positions(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const node of Array.from(container.querySelectorAll('li'))) {
      result[node.dataset.id!] = node.getBoundingClientRect().top;
    }
    return result;
  }
  function expectPositions(before: Record<string, number>) {
    for (const id of Object.keys(before)) {
      expect(card(id).getBoundingClientRect().top).toBeCloseTo(before[id], 0);
    }
  }

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'layout-move-test';
    // Keep the fixture independent of runner UI and preceding test containers.
    container.style.cssText = 'position: fixed; left: 20px; top: 20px;';
    document.body.appendChild(container);
    styles = document.createElement('style');
    styles.textContent = `
      .layout-move-test ul { padding: 0; margin: 0; list-style: none; }
      .layout-move-test li { box-sizing: border-box; height: 36px; width: 240px; margin: 0 0 6px; padding: 0; }
      .layout-move-test .LayoutTest-move-active, .layout-move-test .FadeTest-move-active { transition: transform .12s linear; }
      .layout-move-test .LayoutTest-enter, .layout-move-test .LayoutTest-leave-end { opacity: 0; height: 0; margin-bottom: 0; }
      .layout-move-test .LayoutTest-enter-active, .layout-move-test .LayoutTest-leave-active { transition: height .12s linear, margin-bottom .12s linear, opacity .12s linear; }
      .layout-move-test .FadeTest-leave-active { transition: opacity .12s linear; }
      .layout-move-test .FadeTest-leave-end { opacity: 0; }
    `;
    document.head.appendChild(styles);
  });

  afterEach(async () => {
    try {
      render(null, container);
      await settle();
    } finally {
      // Also when the animations can't settle, so the next specs start clean
      container.remove();
      styles.remove();
    }
  });

  it('starts at the original positions, progresses and settles after reorder plus insertion', async () => {
    render(list(['A', 'B', 'C', 'D']), container);
    const before = positions();
    render(list(['D', 'X', 'A', 'B', 'C']), container);
    await Promise.resolve();
    expectPositions(before);
    await seekMoves(0.5);
    const middle = card('A').getBoundingClientRect().top;
    expect(middle).toBeGreaterThan(before.A);
    expect(middle).toBeLessThan(before.A + 84);
    await settle();
    expect(card('A').getBoundingClientRect().top).toBeCloseTo(before.A + 84, 0);
    expect(card('D').getBoundingClientRect().top).toBeCloseTo(before.A, 0);
    expect(card('A').style.transform).toBe('');
    expect(card('A').classList.contains('LayoutTest-move-active')).toBe(false);
  });

  it('animates retained items on prepend and deletion without any reorder', async () => {
    render(list(['A', 'B', 'C']), container);
    let before = positions();
    render(list(['X', 'A', 'B', 'C']), container);
    await Promise.resolve();
    expectPositions(before);
    await settle();
    expect(card('A').getBoundingClientRect().top).toBeCloseTo(before.A + 42, 0);
    before = positions();
    delete before.B;
    render(list(['X', 'A', 'C']), container);
    await Promise.resolve();
    expectPositions(before);
    await settle();
    expect(card('C').getBoundingClientRect().top).toBeCloseTo(before.C - 42, 0);
  });

  it('coordinates move transforms with enter and leave height transitions', async () => {
    render(list(['A', 'B', 'C', 'D'], AllCard), container);
    await settle();
    const before = positions();
    render(list(['D', 'X', 'A', 'B', 'C'], AllCard), container);
    await Promise.resolve();
    expectPositions(before);
    await settle();
    expect(card('A').getBoundingClientRect().top).toBeCloseTo(before.A + 84, 0);
    const leaving = positions();
    delete leaving.X;
    render(list(['D', 'A', 'B', 'C'], AllCard), container);
    await Promise.resolve();
    expectPositions(leaving);
    await settle();
    expect(container.textContent).toBe('DABC');
    expect(card('A').getBoundingClientRect().top).toBeCloseTo(before.A + 42, 0);
  });

  it('animates the remaining gap after a fade-only leave completes', async () => {
    render(list(['A', 'B', 'C'], AllCard, 'FadeTest'), container);
    await settle();
    const before = positions();
    render(list(['A', 'C'], AllCard, 'FadeTest'), container);
    const removed = card('B');
    await until(() => removed.getAnimations().length > 0);
    for (const animation of removed.getAnimations()) animation.finish();
    await until(() => !removed.isConnected);
    // The removal batch installs its inverse before another frame can paint.
    expect(card('C').getBoundingClientRect().top).toBeCloseTo(before.C, 0);
    await seekMoves(0.5);
    expect(card('C').getBoundingClientRect().top).toBeCloseTo(before.C - 21, 0);
    await settle();
    expect(container.textContent).toBe('AC');
    expect(card('C').getBoundingClientRect().top).toBeCloseTo(before.C - 42, 0);
  });

  it('retargets an active transition without snapping or stale cleanup', async () => {
    render(list(['A', 'B', 'C', 'D']), container);
    const origin = positions().A;
    render(list(['D', 'A', 'B', 'C']), container);
    await seekMoves(0.4);
    const interrupted = positions();
    render(list(['C', 'D', 'A', 'B']), container);
    await Promise.resolve();
    expectPositions(interrupted);
    await settle();
    expect(card('A').getBoundingClientRect().top).toBeCloseTo(origin + 84, 0);
    expect(card('C').getBoundingClientRect().top).toBeCloseTo(origin, 0);
    expect(card('A').style.transform).toBe('');
    expect(card('A').className).toBe('');
  });

  it('installs inverse positions at the microtask checkpoint for updates made inside a frame', async () => {
    render(list(['A', 'B', 'C']), container);
    const before = positions();
    await frame();
    render(list(['C', 'A', 'B']), container);
    await Promise.resolve();
    expectPositions(before);
    await settle();
    expect(card('C').getBoundingClientRect().top).toBeCloseTo(before.A, 0);
  });

  it('cleans up zero-duration enter and leave animations after activation', async () => {
    render(list(['A', 'B'], AllCard, 'NoTransitions'), container);
    await settle();
    expect(card('A').style.height).toBe('');
    expect(card('A').className).toBe('');
    render(list(['A'], AllCard, 'NoTransitions'), container);
    await settle();
    expect(container.textContent).toBe('A');
    expect(card('A').style.transform).toBe('');
  });
  it('preserves an active enter while its neighbours move, then includes it on the next reorder', async () => {
    styles.textContent += `
      .layout-move-test .Entering-enter { opacity: 0; }
      .layout-move-test .Entering-enter-active { transition: opacity 10s linear; }
      .layout-move-test .Entering-enter-end { opacity: 1; }
      .layout-move-test .Entering-move-active { transition: transform .12s linear; }
    `;
    const mixed = (order: string[]) => (
      <ul>
        {order.map((id) =>
          id === 'X' ? (
            <AllCard key={id} id={id} animation="Entering" />
          ) : (
            <MoveCard key={id} id={id} animation="Entering" />
          ),
        )}
      </ul>
    );
    render(mixed(['A', 'B']), container);
    render(mixed(['A', 'X', 'B']), container);
    await until(() =>
      card('X')
        .getAnimations()
        .some(
          (a) =>
            'transitionProperty' in a && a.transitionProperty === 'opacity',
        ),
    );
    const node = card('X');
    const enter = node
      .getAnimations()
      .find(
        (a) => 'transitionProperty' in a && a.transitionProperty === 'opacity',
      )!;
    enter.pause();
    await enter.ready;
    enter.currentTime = 5000;
    const a = card('A').getBoundingClientRect().top;
    render(mixed(['B', 'A', 'X']), container);
    await Promise.resolve();
    expect(node.getAnimations()).toContain(enter);
    expect(enter.playState).toBe('paused');
    expect(node.style.transform).toBe('');
    expect(node.classList.contains('Entering-move-active')).toBe(false);
    expect(card('A').getBoundingClientRect().top).toBeCloseTo(a, 0);
    await settle();
    const before = positions();
    render(mixed(['X', 'A', 'B']), container);
    await Promise.resolve();
    expectPositions(before);
    expect(node.classList.contains('Entering-move-active')).toBe(true);
    await settle();
  });

  it('moves the followers of an item that grows directly when the keys are kept', async () => {
    styles.textContent += '.layout-move-test li.tall { height: 78px; }';
    class GrowCard extends AnimatedMoveComponent<
      { id: string; tall: boolean },
      unknown
    > {
      public render() {
        return (
          <li
            data-id={this.props.id}
            className={this.props.tall ? 'tall' : undefined}
          >
            {this.props.id}
          </li>
        );
      }
    }
    const grow = (tall: string | null) => (
      <ul>
        {['A', 'B', 'C'].map((id) => (
          <GrowCard
            key={id}
            id={id}
            tall={id === tall}
            animation="LayoutTest"
          />
        ))}
      </ul>
    );
    render(grow(null), container);
    const before = positions();
    render(grow('B'), container);
    await Promise.resolve();
    await frame();
    expect(card('C').getBoundingClientRect().top).toBeCloseTo(before.C + 42, 0);
    expect(card('C').style.transform).toBe('');
    expect(card('C').classList.contains('LayoutTest-move-active')).toBe(false);
  });
});
