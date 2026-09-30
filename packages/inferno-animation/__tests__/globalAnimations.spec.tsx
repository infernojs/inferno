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

// An element that enters with the globalAnimationKey of one that left in the same update starts
// from the box of the leaving one. The boxes are fixed per element id.
describe('global animations between parents', () => {
  let container: HTMLDivElement;
  let frames: Frames;
  const boxes: Record<string, Rectangle> = {
    one: [10, 20, 50, 40],
    two: [210, 120, 100, 80],
    three: [0, 300, 25, 20],
    empty: [40, 40, 0, 0],
  };

  class Logo extends AnimatedAllComponent<
    { id: string; globalAnimationKey?: string },
    unknown
  > {
    public render() {
      return <div data-id={this.props.id} />;
    }
  }
  function page(id: string | null, key = 'logo') {
    return (
      <section>
        {id === null ? null : (
          <Logo key={id} id={id} globalAnimationKey={key} animation="Logo" />
        )}
      </section>
    );
  }
  function logo(id: string): HTMLElement {
    return container.querySelector('[data-id="' + id + '"]') as HTMLElement;
  }
  function frame() {
    frames.frame();
  }
  function finish() {
    endTransitions(container.querySelectorAll('div'));
  }
  // Without whitespace, and with the uniform scale that browsers serialize as scale(0.5)
  function compact(value: string): string {
    return value
      .replace(/\s/g, '')
      .replace(/scale\(([^,)]+)\)/g, 'scale($1,$1)');
  }
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

  it('starts an entering element at the box of the element that left with its key', async () => {
    render(page('one'), container);
    await settle();
    const one = logo('one');
    render(page('two'), container);
    // The leaving element is measured at once and hidden, the entering one waits for a frame
    expect(one.style.visibility).toBe('hidden');
    const two = logo('two');
    expect(two.style.display).toBe('none');
    frame();
    expect(two.style.display).toBe('');
    expect(two.style.transformOrigin.replace(/\s/g, '')).toMatch(
      /^0(px)?0(px)?(0px)?$/,
    );
    expect(compact(two.style.transform)).toBe(
      'translate(-200px,-100px)scale(0.5,0.5)',
    );
    expect(two.classList.contains('Logo-enter')).toBe(true);
    // Activation releases the transform, and the element transitions to its own box
    frame();
    expect(two.style.transform).toBe('');
    expect(two.style.transformOrigin).toBe('');
    expect(two.className).toBe('Logo-enter-active Logo-enter-end');
    finish();
    expect(two.className).toBe('');
    expect(one.isConnected).toBe(false);
  });

  it('uses a source only once', async () => {
    render(page('one'), container);
    await settle();
    render(page('two'), container);
    await settle();
    // A second parent enters with the same key while nothing left with it
    const other = document.createElement('div');
    container.appendChild(other);
    render(page('three'), other);
    frame();
    expect(logo('three').style.transform).toBe('');
    render(null, other);
    await settle();
  });

  it('does not move or scale an entering element without a box', async () => {
    render(page('one'), container);
    await settle();
    render(page('empty'), container);
    frame();
    expect(logo('empty').style.transform).toBe('');
    expect(logo('empty').classList.contains('Logo-enter')).toBe(true);
  });

  it('keeps sources apart by key', async () => {
    render(page('one', 'first'), container);
    await settle();
    render(page('two', 'second'), container);
    frame();
    expect(logo('two').style.transform).toBe('');
  });
});
