import { render } from 'inferno';
import { AnimatedAllComponent } from 'inferno-animation';
import {
  type Rectangle,
  endTransitions,
  fakeBoxes,
  fakeFrames,
  type Frames,
  idle,
} from './helpers/frames';

// Reproductions of the enter and global animation glitches in docs/animation-glitch. The boxes
// are fixed per element id and the frames run on demand.
describe('animation glitches', () => {
  let container: HTMLDivElement;
  let frames: Frames;
  const boxes: Record<string, Rectangle> = {
    box: [0, 0, 50, 60],
    one: [10, 20, 50, 40],
    two: [210, 120, 100, 80],
  };

  class Box extends AnimatedAllComponent<
    { id: string; style?: string; globalAnimationKey?: string },
    unknown
  > {
    public render() {
      return <div data-id={this.props.id} style={this.props.style} />;
    }
  }
  function page(
    id: string | null,
    style?: string,
    globalAnimationKey: string | undefined = 'glitch',
  ) {
    return (
      <section>
        {id === null ? null : (
          <Box
            key={id}
            id={id}
            style={style}
            globalAnimationKey={globalAnimationKey}
            animation="Glitch"
          />
        )}
      </section>
    );
  }
  // The time that global animation sources expire by
  let now: number;
  function fakeTime() {
    now = performance.now();
    spyOn(performance, 'now').and.callFake(() => now);
  }
  function element(id: string): HTMLElement {
    return container.querySelector('[data-id="' + id + '"]') as HTMLElement;
  }
  function frame() {
    frames.frame();
  }
  function finish() {
    endTransitions(container.querySelectorAll('div'));
  }
  // Runs every animation of the update to its end
  async function settle() {
    await Promise.resolve();
    frames.drain();
    finish();
  }

  beforeEach(async () => {
    await idle();
    container = document.createElement('div');
    document.body.appendChild(container);
    frames = fakeFrames();
    fakeBoxes((element) =>
      container.contains(element)
        ? boxes[(element as HTMLElement).dataset?.id ?? '']
        : undefined,
    );
  });

  afterEach(async () => {
    render(null, container);
    await settle();
    await settle();
    frames.restore();
    container.remove();
  });

  // Section 12: the enter writes its own width and height and removes them when it ends
  it('keeps the inline width and height of an entering element', async () => {
    render(page('box', 'width: 50px; height: 60px'), container);
    const box = element('box');
    await settle();
    expect(box.className).toBe('');
    expect([box.style.width, box.style.height]).toEqual(['50px', '60px']);
  });

  // The leave writes its own width and height and removes them when it activates
  it('keeps the inline width and height of a leaving element', async () => {
    render(page('box', 'width: 50px; height: 60px', undefined), container);
    const box = element('box');
    await settle();
    render(page(null), container);
    frame();
    frame();
    expect(box.className).toBe('Glitch-leave-active Glitch-leave-end');
    expect([box.style.width, box.style.height]).toEqual(['50px', '60px']);
  });

  // The element has the start state of its enter, of which nothing has been visible
  it('removes an element at once that leaves before its enter has started', () => {
    render(page('box', undefined, undefined), container);
    const box = element('box');
    frame();
    expect(box.className).toBe('Glitch-enter Glitch-enter-active');
    render(page(null), container);
    expect(box.isConnected).toBe(false);
    // The frame that would have started the enter
    frame();
    expect(box.className).toBe('Glitch-enter Glitch-enter-active');
  });

  describe('leaves that interrupt an enter', () => {
    // The enter's computed transition lists and reached values, which jsdom does not compute
    function stubComputed(
      match: (node: Element) => boolean,
      values: Record<string, string>,
    ) {
      const computed = window.getComputedStyle;
      spyOn(window, 'getComputedStyle').and.callFake(
        (node: Element, pseudo?: string | null) => {
          const style = computed.call(window, node, pseudo);
          if (!match(node)) return style;
          return new Proxy(style, {
            get: (target, key) =>
              key === 'getPropertyValue'
                ? (name: string) =>
                    name in values
                      ? values[name]
                      : target.getPropertyValue(name)
                : typeof target[key] === 'function'
                  ? target[key].bind(target)
                  : target[key],
          });
        },
      );
    }
    function boxes(ids: string[]) {
      return (
        <section>
          {ids.map((id) => (
            <Box key={id} id={id} animation="Glitch" />
          ))}
        </section>
      );
    }
    const ids = (count: number) =>
      Array.from({ length: count }, (_, i) => 'b' + i);

    it('holds the values of the properties its transition lists name, until the leave activates', async () => {
      render(page('box', undefined, undefined), container);
      const box = element('box');
      frame();
      frame();
      const asked = jasmine.createSpy('getAnimations').and.returnValue([]);
      box.getAnimations = asked;
      stubComputed((node) => node === box, {
        'transition-property': 'opacity, margin',
        'transition-duration': '1s',
        'transition-delay': '0s',
        opacity: '0.4',
        'margin-top': '3px',
        'margin-bottom': '3px',
        'margin-left': '0px',
        'margin-right': '0px',
      });
      render(page(null), container);
      frame();
      expect(box.style.opacity).toBe('0.4');
      expect(box.style.marginTop).toBe('3px');
      expect(asked).not.toHaveBeenCalled();
      frame();
      expect(box.style.opacity).toBe('');
      expect(box.style.marginTop).toBe('');
    });

    for (const [count, exact] of [
      [16, true],
      [17, false],
    ] as const) {
      it(`${exact ? 'asks' : 'does not ask'} ${count} elements that transition all for their animations`, async () => {
        render(boxes(ids(count)), container);
        frame();
        frame();
        const asked = jasmine.createSpy('getAnimations').and.returnValue([]);
        for (const id of ids(count)) element(id).getAnimations = asked;
        stubComputed(
          (node) =>
            ids(count).includes((node as HTMLElement).dataset?.id ?? ''),
          {
            'transition-property': 'all',
            'transition-duration': '1s',
            'transition-delay': '0s',
            opacity: '0.5',
          },
        );
        const removed = ids(count).map(element);
        render(boxes([]), container);
        frame();
        expect(asked.calls.count()).toBe(exact ? count : 0);
        for (const box of removed)
          expect(box.style.opacity).toBe(exact ? '' : '0.5');
      });
    }
  });

  // Section 13: the expiry of global animation sources never started, and then counted frames
  describe('global animation sources', () => {
    beforeEach(async () => {
      fakeTime();
      render(page('one'), container);
      await settle();
      render(page(null), container);
      await settle();
      expect(element('one')).toBeNull();
    });

    it('are used by an element that enters within a second, however many frames passed', () => {
      for (let i = 0; i < 30; i++) frame();
      now += 900;
      render(page('two'), container);
      frame();
      expect(element('two').style.transform).toContain('translate(');
    });

    it('are not used by an element that enters after a second', () => {
      now += 1100;
      render(page('two'), container);
      frame();
      expect(element('two').style.transform).toBe('');
    });
  });

  // The global enter sets its own transform and transform origin and clears them when it activates
  it('keeps the inline transform of an element that entered from a global source', async () => {
    render(page('one'), container);
    await settle();
    render(
      page('two', 'transform: rotate(10deg); transform-origin: 10px 20px'),
      container,
    );
    const two = element('two');
    // As the engine serializes them, e.g. Firefox as "10px 20px 0px"
    const rendered = [two.style.transform, two.style.transformOrigin];
    frame();
    // The element starts from the box of the one that left
    expect(two.style.transform).toContain('translate(');
    await settle();
    expect(two.className).toBe('');
    expect([two.style.transform, two.style.transformOrigin]).toEqual(rendered);
    expect(rendered[0]).toBe('rotate(10deg)');
  });
});
