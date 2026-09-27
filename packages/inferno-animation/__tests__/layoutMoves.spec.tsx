import { Component, Fragment, render } from 'inferno';
import {
  AnimatedMoveComponent,
  AnimatedComponent,
  type AnimationClass,
  hasPendingAnimations,
} from 'inferno-animation';

describe('coordinated layout moves', () => {
  let container: HTMLDivElement;
  let frames: Map<number, FrameRequestCallback>;
  let frameId: number;
  let originalCancelRAF: typeof cancelAnimationFrame;
  let originalRAF: typeof requestAnimationFrame;
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
    const callbacks = Array.from(frames.values());
    frames.clear();
    for (const callback of callbacks) callback(0);
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

  beforeEach((done) => {
    function start() {
      if (hasPendingAnimations()) {
        setTimeout(start, 5);
        return;
      }
      container = document.createElement('div');
      document.body.appendChild(container);
      frames = new Map();
      frameId = 0;
      reads = 0;
      originalRAF = window.requestAnimationFrame;
      originalCancelRAF = window.cancelAnimationFrame;
      window.requestAnimationFrame = (callback) => {
        frames.set(++frameId, callback);
        return frameId;
      };
      window.cancelAnimationFrame = (id) => {
        frames.delete(id);
      };
      render(list(['A', 'B', 'C', 'D']), container);
      measureRows();
      done();
    }
    start();
  });

  afterEach(async () => {
    await Promise.resolve();
    while (frames.size) frame();
    for (const node of Array.from(container.querySelectorAll('li'))) {
      node.dispatchEvent(new Event('transitionend'));
    }
    render(null, container);
    await Promise.resolve();
    while (frames.size) frame();
    window.requestAnimationFrame = originalRAF;
    window.cancelAnimationFrame = originalCancelRAF;
    container.remove();
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
    expect(node.style.transition).toBe('opacity 0.1s');
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
    while (frames.size) frame();
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
    while (frames.size) frame();
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
    expect(reads).toBe(8);
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
  it('queries browser animations a constant number of times per parent', async () => {
    let queries = 0;
    const getAnimations = () => {
      queries++;
      return [];
    };
    const parent = container.firstElementChild!;
    parent.getAnimations = getAnimations;
    for (const node of Array.from(parent.children))
      node.getAnimations = getAnimations;
    render(list(['D', 'A', 'B', 'C']), container);
    await Promise.resolve();
    frame();
    expect(queries).toBeLessThanOrEqual(3);
    expect(card('A').classList.contains('Card-move-active')).toBe(true);
  });
});
