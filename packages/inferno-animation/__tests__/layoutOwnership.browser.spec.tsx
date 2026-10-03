import { render } from 'inferno';
import { AnimatedMoveComponent } from 'inferno-animation';
import { browserHelpers, frame } from './helpers/browser';

const browserDescribe = global.usingJSDOM ? xdescribe : describe;

browserDescribe('move ownership in a real CSS engine', () => {
  let container: HTMLDivElement;
  let sheet: HTMLStyleElement;
  const { card } = browserHelpers(() => container);
  class Card extends AnimatedMoveComponent<{ id: string }, unknown> {
    public render() {
      return <div data-id={this.props.id}>{this.props.id}</div>;
    }
  }
  const list = (order: string[]) => (
    <main>
      {order.map((id) => (
        <Card key={id} id={id} animation="Ownership" />
      ))}
    </main>
  );
  async function transition(node: HTMLElement, property: string) {
    for (let i = 0; i < 60; i++) {
      const animation = node
        .getAnimations()
        .find(
          (a) => 'transitionProperty' in a && a.transitionProperty === property,
        );
      if (animation) {
        await animation.ready;
        animation.pause();
        await animation.ready;
        return animation;
      }
      await frame();
    }
    throw new Error('Missing CSS transition: ' + property);
  }
  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'ownership-test';
    container.style.cssText = 'position:fixed;top:0;left:0';
    document.body.appendChild(container);
    sheet = document.createElement('style');
    sheet.textContent =
      '.ownership-test [data-id] {height:40px;width:100px} .ownership-test .Ownership-move-active {transition:transform 1s linear}';
    document.head.appendChild(sheet);
    render(list(['A', 'B', 'C']), container);
  });
  afterEach(async () => {
    render(null, container);
    await Promise.resolve();
    container.remove();
    sheet.remove();
  });

  const properties = ['opacity', 'width', 'height', 'transform'];
  for (let i = 0, len = properties.length; i < len; ++i) {
    const property = properties[i];
    it(
      'preserves an author ' +
        property +
        ' transition through unchanged and reordered patches',
      async () => {
        const node = card('A');
        const before = {
          opacity: '1',
          width: '100px',
          height: '40px',
          transform: 'translateX(0px)',
        };
        const after = {
          opacity: '0',
          width: '200px',
          height: '80px',
          transform: 'translateX(40px)',
        };
        node.style.setProperty('transition', property + ' 10s linear');
        node.style.setProperty(property, before[property]);
        node.getBoundingClientRect();
        node.style.setProperty(property, after[property]);
        const author = await transition(node, property);
        author.currentTime = 5000;
        const cancelled = jasmine.createSpy();
        node.addEventListener('transitioncancel', cancelled);
        render(list(['A', 'B', 'C']), container);
        await Promise.resolve();
        render(list(['C', 'B', 'A']), container);
        await Promise.resolve();
        await frame();
        expect(node.getAnimations()).toContain(author);
        expect(author.playState).toBe('paused');
        expect(author.currentTime).toBe(5000);
        expect(node.classList.contains('Ownership-move-active')).toBe(false);
        expect(cancelled).not.toHaveBeenCalled();
      },
    );
  }

  it('preserves individual transition declarations and priorities on unchanged and moved siblings', async () => {
    const node = card('A');
    const declarations = [
      ['transition-property', 'opacity, transform', 'important'],
      ['transition-duration', '0.5s, 1s', ''],
      ['transition-delay', '0s, 0.1s', 'important'],
      ['transition-timing-function', 'linear, ease-in', ''],
    ];
    if ('transitionBehavior' in node.style)
      declarations.push([
        'transition-behavior',
        'normal, allow-discrete',
        'important',
      ]);
    for (let i = 0, len = declarations.length; i < len; ++i) {
      const [property, value, priority] = declarations[i];
      node.style.setProperty(property, value, priority);
    }
    const original = declarations.map(([property]) => [
      property,
      node.style.getPropertyValue(property),
      node.style.getPropertyPriority(property),
    ]);
    function unchanged() {
      for (let i = 0, len = original.length; i < len; ++i) {
        const [property, value, priority] = original[i];
        expect(node.style.getPropertyValue(property)).toBe(value);
        expect(node.style.getPropertyPriority(property)).toBe(priority);
      }
    }
    render(list(['A', 'B', 'C']), container);
    await Promise.resolve();
    unchanged();
    render(list(['C', 'B', 'A']), container);
    await Promise.resolve();
    unchanged();
    await frame();
    const move = await transition(node, 'transform');
    move.finish();
    await move.finished;
    // Cleanup must preserve each longhand, regardless of shorthand serialization.
    for (let i = 0; i < 3; i++) node.dispatchEvent(new Event('transitionend'));
    unchanged();
    expect(node.style.transform).toBe('');
  });

  it('does not write styles when geometry is unchanged', async () => {
    const changes: MutationRecord[] = [];
    const observer = new MutationObserver((records) =>
      changes.push(...records),
    );
    observer.observe(container, {
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
    render(list(['A', 'B', 'C']), container);
    await Promise.resolve();
    await Promise.resolve();
    changes.push(...observer.takeRecords());
    observer.disconnect();
    expect(changes.length).toBe(0);
  });
  it('preserves an author transition on a plain sibling', async () => {
    const mixed = (order: string[]) => (
      <main>
        {order.map((id) =>
          id === 'A' ? (
            <div key={id} data-id={id}>
              {id}
            </div>
          ) : (
            <Card key={id} id={id} animation="Ownership" />
          ),
        )}
      </main>
    );
    render(mixed(['A', 'B', 'C']), container);
    const node = card('A');
    node.style.cssText = 'opacity:1;transition:opacity 10s linear';
    node.getBoundingClientRect();
    node.style.opacity = '0';
    const author = await transition(node, 'opacity');
    author.currentTime = 5000;
    render(mixed(['C', 'B', 'A']), container);
    await Promise.resolve();
    expect(node.getAnimations()).toContain(author);
    expect(author.playState).toBe('paused');
    expect(node.style.transform).toBe('');
  });

  it('leaves application style updates made during a move intact on cleanup', async () => {
    const node = card('A');
    render(list(['C', 'B', 'A']), container);
    await Promise.resolve();
    await frame();
    const move = await transition(node, 'transform');
    move.finish();
    node.style.setProperty('transform', 'scale(0.7)', 'important');
    node.style.setProperty('transition-duration', '3s', 'important');
    node.dispatchEvent(new Event('transitionend'));
    expect(node.style.transform).toBe('scale(0.7)');
    expect(node.style.getPropertyPriority('transform')).toBe('important');
    expect(node.style.transitionDuration).toBe('3s');
    expect(node.style.getPropertyPriority('transition-duration')).toBe(
      'important',
    );
  });
});
