import { Fragment, render } from 'inferno';
import { AnimatedAllComponent, AnimatedMoveComponent } from 'inferno-animation';
import {
  browserHelpers,
  frame,
  position,
  until,
  zeros,
} from './helpers/browser';

// Geometry and transition progress require an actual layout engine.
const browserDescribe = global.usingJSDOM ? xdescribe : describe;

// Reproductions of the layout glitches in docs/animation-glitch. Every move should start where
// the item was on screen, and every leave should start where the item is.
browserDescribe('animation glitches in a browser', () => {
  let container: HTMLDivElement;
  let styles: HTMLStyleElement;
  // The root that the helpers look for elements in: the container, or a shadow root inside it
  let root: ParentNode;
  const { card, offsets, positions, seekMoves, settle, transitions } =
    browserHelpers(() => root);

  class MoveCard extends AnimatedMoveComponent<
    { id: string; className?: string },
    unknown
  > {
    public render() {
      return (
        <li data-id={this.props.id} className={this.props.className}>
          {this.props.id}
        </li>
      );
    }
  }
  class AllCard extends AnimatedAllComponent<{ id: string }, unknown> {
    public render() {
      return <li data-id={this.props.id}>{this.props.id}</li>;
    }
  }
  function list(
    order: string[],
    Item: any = MoveCard,
    props: (id: string) => object = () => ({}),
  ) {
    return (
      <ul>
        {order.map((id) => (
          <Item key={id} id={id} animation="GlitchTest" {...props(id)} />
        ))}
      </ul>
    );
  }

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'animation-glitch-test';
    // Keep the fixture independent of runner UI and preceding test containers.
    container.style.cssText = 'position: fixed; left: 20px; top: 20px;';
    document.body.appendChild(container);
    root = container;
    styles = document.createElement('style');
    styles.textContent = `
      .animation-glitch-test ul { padding: 0; margin: 0; list-style: none; }
      .animation-glitch-test li { box-sizing: border-box; height: 36px; width: 240px; margin: 0 0 6px; padding: 0; }
      .animation-glitch-test .GlitchTest-move-active { transition: transform 1s linear; }
      .animation-glitch-test .GlitchTest-enter, .animation-glitch-test .GlitchTest-leave-end { opacity: 0; height: 0; margin-bottom: 0; }
      .animation-glitch-test .GlitchTest-enter-active, .animation-glitch-test .GlitchTest-leave-active { transition: height 1s linear, margin-bottom 1s linear, opacity 1s linear; }
    `;
    document.head.appendChild(styles);
  });

  afterEach(async () => {
    render(null, root as Element);
    await settle();
    container.remove();
    styles.remove();
  });

  describe('moves in a transformed coordinate space', () => {
    // Section 5: offsets measured in viewport pixels are applied in the item's own coordinates
    it('start where the items were inside a scaled ancestor', async () => {
      container.style.transform = 'scale(0.5)';
      container.style.transformOrigin = '0 0';
      render(list(['A', 'B', 'C', 'D']), container);
      const before = positions();
      render(list(['D', 'A', 'B', 'C']), container);
      await Promise.resolve();
      expect(offsets(before)).toEqual(zeros(before));
    });

    it('start where the items were when the items have a scale property', async () => {
      styles.textContent += '.animation-glitch-test li { scale: 0.5; }';
      render(list(['A', 'B', 'C', 'D']), container);
      const before = positions();
      render(list(['D', 'A', 'B', 'C']), container);
      await Promise.resolve();
      expect(offsets(before)).toEqual(zeros(before));
    });

    it('start where the items were when the items have a rotate property', async () => {
      styles.textContent += '.animation-glitch-test li { rotate: 30deg; }';
      render(list(['A', 'B', 'C', 'D']), container);
      const before = positions();
      render(list(['D', 'A', 'B', 'C']), container);
      await Promise.resolve();
      expect(offsets(before)).toEqual(zeros(before));
    });

    it('start where the items were in an SVG whose viewBox scales them', async () => {
      class Bar extends AnimatedMoveComponent<
        { id: string; index: number },
        unknown
      > {
        public render() {
          return (
            <rect
              data-id={this.props.id}
              x={0}
              y={this.props.index * 10}
              width={50}
              height={8}
            />
          );
        }
      }
      const svg = (order: string[]) => (
        <svg width="200" height="200" viewBox="0 0 100 100">
          {order.map((id, index) => (
            <Bar key={id} id={id} index={index} animation="GlitchTest" />
          ))}
        </svg>
      );
      render(svg(['A', 'B', 'C']), container);
      const before = positions();
      render(svg(['C', 'A', 'B']), container);
      await Promise.resolve();
      expect(offsets(before)).toEqual(zeros(before));
    });
  });

  // Section 6: a hidden element has an empty box at the viewport origin, which is taken as its source
  it('does not move an item that becomes visible in a reordering update', async () => {
    styles.textContent += '.animation-glitch-test li.hidden { display: none; }';
    render(
      list(['A', 'B', 'C', 'D'], MoveCard, (id) => ({
        className: id === 'C' ? 'hidden' : undefined,
      })),
      container,
    );
    render(list(['D', 'A', 'B', 'C']), container);
    await Promise.resolve();
    const start = position(card('C'));
    expect(card('C').style.transform).toBe('');
    await settle();
    expect(start).toEqual(position(card('C')));
  });

  // Section 7: a keyframe animation overrides the inline transform of the move
  it('moves an item that runs a transform keyframe animation', async () => {
    styles.textContent += `
      @keyframes glitch-test-pulse { from { transform: scale(1); } to { transform: scale(0.99); } }
      .animation-glitch-test li.pulse { animation: glitch-test-pulse 1s infinite alternate; }
    `;
    const pulse = (id: string) => ({
      className: id === 'B' ? 'pulse' : undefined,
    });
    render(list(['A', 'B', 'C', 'D'], MoveCard, pulse), container);
    const before = positions();
    render(list(['D', 'A', 'B', 'C'], MoveCard, pulse), container);
    await Promise.resolve();
    // The pulse moves the top edge of B by less than half a pixel
    expect(position(card('B')).y).toBeCloseTo(before.B.y, 0);
  });

  // Section 8: the leave finishes the running move, which moves the item to its layout position
  it('starts the leave of a moving item where the item is', async () => {
    render(list(['A', 'B', 'C', 'D'], AllCard), container);
    await settle();
    render(list(['D', 'A', 'B', 'C'], AllCard), container);
    await seekMoves(0.5);
    const moving = position(card('A'));
    render(list(['D', 'B', 'C'], AllCard), container);
    await Promise.resolve();
    expect(offsets({ A: moving })).toEqual({ A: 0 });
  });

  // Section 9: the leave counts the transitioncancel events of the enter it interrupts as its own
  // transitions ending
  it('keeps an item that was removed while it entered for its whole leave', async () => {
    render(list(['A', 'B'], AllCard), container);
    await settle();
    render(list(['A', 'X', 'B'], AllCard), container);
    await until(() => transitions('height').length > 0);
    for (let i = 0; i < 5; i++) await frame();
    const x = card('X');
    render(list(['A', 'B'], AllCard), container);
    // The leave lasts a second
    for (let i = 0; i < 10; i++) await frame();
    expect(x.isConnected).toBe(true);
  });

  // Section 10: a card's offset contains its group's movement, and the group's transform adds it again
  it('starts cards of nested lists that reorder together where they were', async () => {
    class Group extends AnimatedMoveComponent<
      { id: string; items: string[] },
      unknown
    > {
      public render() {
        return (
          <li data-id={this.props.id} style={{ height: 'auto' }}>
            <ul>
              {this.props.items.map((id) => (
                <MoveCard key={id} id={id} animation="GlitchTest" />
              ))}
            </ul>
          </li>
        );
      }
    }
    const board = (groups: Array<[string, string[]]>) => (
      <ul>
        {groups.map(([id, items]) => (
          <Group key={id} id={id} items={items} animation="GlitchTest" />
        ))}
      </ul>
    );
    render(
      board([
        ['G1', ['a', 'b']],
        ['G2', ['c', 'd']],
      ]),
      container,
    );
    const before = positions();
    render(
      board([
        ['G2', ['d', 'c']],
        ['G1', ['b', 'a']],
      ]),
      container,
    );
    await Promise.resolve();
    expect(offsets(before)).toEqual(zeros(before));
  });

  describe('in a shadow tree', () => {
    const items = (order: string[]) => (
      <Fragment>
        {order.map((id) => (
          <MoveCard key={id} id={id} animation="GlitchTest" />
        ))}
      </Fragment>
    );

    beforeEach(() => {
      const host = document.createElement('div');
      container.appendChild(host);
      root = host.attachShadow({ mode: 'open' });
      const sheet = document.createElement('style');
      sheet.textContent = `
        li { display: block; box-sizing: border-box; height: 36px; width: 240px; margin: 0 0 6px; }
        .GlitchTest-move-active { transition: transform 1s linear; }
      `;
      root.appendChild(sheet);
    });

    // The parent of the items is the shadow root, which has no computed style
    it('moves the items of a list whose parent is the shadow root', async () => {
      render(items(['A', 'B', 'C', 'D']), root as Element);
      const before = positions();
      render(items(['D', 'A', 'B', 'C']), root as Element);
      await Promise.resolve();
      expect(card('A').style.transform).not.toBe('');
      expect(offsets(before)).toEqual(zeros(before));
    });

    it('starts where the items were when the host is scaled', async () => {
      ((root as ShadowRoot).host as HTMLElement).style.cssText =
        'transform: scale(0.5); transform-origin: 0 0';
      render(items(['A', 'B', 'C', 'D']), root as Element);
      const before = positions();
      render(items(['D', 'A', 'B', 'C']), root as Element);
      await Promise.resolve();
      expect(offsets(before)).toEqual(zeros(before));
    });
  });

  // A finished animation that fills forwards sets the transform as a running one does
  it('moves an item whose finished keyframe animation still sets its transform', async () => {
    styles.textContent += `
      @keyframes glitch-test-pop { from { transform: scale(0.9); } to { transform: scale(0.99); } }
      .animation-glitch-test li.pop { animation: glitch-test-pop 50ms forwards; }
    `;
    const pop = (id: string) => ({ className: id === 'B' ? 'pop' : undefined });
    render(list(['A', 'B', 'C', 'D'], MoveCard, pop), container);
    await until(() =>
      card('B')
        .getAnimations()
        .some((animation) => animation.playState === 'finished'),
    );
    const before = positions();
    render(list(['D', 'A', 'B', 'C'], MoveCard, pop), container);
    await Promise.resolve();
    expect(offsets(before)).toEqual(zeros(before));
  });

  describe('leaves of moving items', () => {
    beforeEach(async () => {
      styles.textContent += `
        .animation-glitch-test .SlideTest-move-active { transition: transform 1s linear; }
        .animation-glitch-test .SlideTest-leave-active { transition: transform 1s linear, opacity 1s linear; }
        .animation-glitch-test .SlideTest-leave-end { transform: translateX(100px); opacity: 0; }
      `;
    });

    // The position that the move has reached is held by a style that the leave does not animate
    it('run their own transform transition from where the items are', async () => {
      const slide = () => ({ animation: 'SlideTest' });
      render(list(['A', 'B', 'C', 'D'], AllCard, slide), container);
      await settle();
      render(list(['D', 'A', 'B', 'C'], AllCard, slide), container);
      await seekMoves(0.5);
      const a = card('A');
      const moving = position(a);
      render(list(['D', 'B', 'C'], AllCard, slide), container);
      await until(
        () =>
          a.classList.contains('SlideTest-leave-end') &&
          a
            .getAnimations()
            .some(
              (animation) =>
                'transitionProperty' in animation &&
                animation.transitionProperty === 'transform',
            ),
      );
      for (const animation of a.getAnimations()) {
        animation.pause();
        animation.currentTime = 500;
      }
      expect(position(a).x).toBeCloseTo(moving.x + 50, 0);
      expect(position(a).y).toBeCloseTo(moving.y, 0);
    });

    // D is the first element, so that the leaves of the others do not move it
    it('start where the items are when their list is removed', async () => {
      render(list(['A', 'B', 'C', 'D'], AllCard), container);
      await settle();
      render(list(['D', 'A', 'B', 'C'], AllCard), container);
      await seekMoves(0.5);
      const moving = positions();
      render(null, container);
      await Promise.resolve();
      expect(offsets(moving)).toEqual(zeros(moving));
      for (let i = 0; i < 3; i++) await frame();
      expect(offsets({ D: moving.D })).toEqual({ D: 0 });
    });

    it('start where the items are when every item is replaced', async () => {
      render(list(['A', 'B', 'C', 'D'], AllCard), container);
      await settle();
      render(list(['D', 'A', 'B', 'C'], AllCard), container);
      await seekMoves(0.5);
      const moving = positions();
      render(list(['W', 'X', 'Y', 'Z'], AllCard), container);
      await Promise.resolve();
      expect(offsets(moving)).toEqual(zeros(moving));
      for (let i = 0; i < 3; i++) await frame();
      expect(offsets({ D: moving.D })).toEqual({ D: 0 });
    });
  });

  describe('nested lists that reorder with their groups', () => {
    class Group extends AnimatedMoveComponent<
      { id: string; items: string[] },
      unknown
    > {
      public render() {
        return (
          <li data-id={this.props.id} style={{ height: 'auto' }}>
            <ul>
              {this.props.items.map((id) => (
                <MoveCard key={id} id={id} animation="GlitchTest" />
              ))}
            </ul>
          </li>
        );
      }
    }
    const board = (groups: Array<[string, string[]]>) => (
      <ul>
        {groups.map(([id, items]) => (
          <Group key={id} id={id} items={items} animation="GlitchTest" />
        ))}
      </ul>
    );

    // c moves up a row in a group that moves down a row
    it('keep a card in place that ends where it was', async () => {
      render(
        board([
          ['G1', ['a', 'b', 'c']],
          ['G2', ['d']],
        ]),
        container,
      );
      const before = positions();
      render(
        board([
          ['G2', ['d']],
          ['G1', ['a', 'c', 'b']],
        ]),
        container,
      );
      await Promise.resolve();
      expect(position(card('c')).y).toBeCloseTo(before.c.y, 0);
      expect(offsets(before)).toEqual(zeros(before));
    });

    // The cards are measured while their list is patched, after G1 has been removed
    it('start where the cards were when a group before them is removed', async () => {
      render(
        board([
          ['G1', ['a', 'b']],
          ['G2', ['c', 'd']],
          ['G3', ['e', 'f']],
        ]),
        container,
      );
      const before = positions();
      delete before.G1;
      delete before.a;
      delete before.b;
      render(
        board([
          ['G3', ['f', 'e']],
          ['G2', ['d', 'c']],
        ]),
        container,
      );
      await Promise.resolve();
      expect(offsets(before)).toEqual(zeros(before));
    });
  });
});
