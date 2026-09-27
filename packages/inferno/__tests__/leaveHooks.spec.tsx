import { Component, render } from 'inferno';

// Leave hooks of children that are removed synchronously (replaced by text or by innerHTML) must
// not run, and no leave hook may be picked up by an unrelated removal in the same render.
// Core only: inferno-animation is not imported here.
describe('leave hooks of synchronously replaced children', () => {
  let container: HTMLDivElement;
  let calls: string[];
  let pending: Array<() => void>;

  interface LeavingProps {
    id: string;
    defer?: boolean;
  }

  class Leaving extends Component<LeavingProps> {
    public componentWillDisappear(_dom, done) {
      calls.push(this.props.id);
      if (this.props.defer) {
        pending.push(done);
      } else {
        done();
      }
    }

    public render() {
      return <span>{this.props.id}</span>;
    }
  }

  beforeEach(() => {
    calls = [];
    pending = [];
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    render(null, container);
    for (const done of pending) done();
    container.remove();
  });

  it('does not run them when a single child is replaced by text', () => {
    render(
      <div>
        <p>
          <Leaving id="a" />
        </p>
        <ul>{[<Leaving key="b" id="b" defer />]}</ul>
      </div>,
      container,
    );
    render(
      <div>
        <p>text</p>
        <ul>{[]}</ul>
      </div>,
      container,
    );

    expect(calls).toEqual(['b']);
    expect(container.innerHTML).toBe(
      '<div><p>text</p><ul><span>b</span></ul></div>',
    );
    pending.pop()!();
    expect(container.innerHTML).toBe('<div><p>text</p><ul></ul></div>');
  });

  it('does not run them when many children are replaced by text', () => {
    render(
      <div>
        <p>{[<Leaving key="a" id="a" />, <Leaving key="c" id="c" />]}</p>
        <ul>{[<Leaving key="b" id="b" defer />]}</ul>
      </div>,
      container,
    );
    render(
      <div>
        <p>text</p>
        <ul>{[]}</ul>
      </div>,
      container,
    );

    expect(calls).toEqual(['b']);
    pending.pop()!();
    expect(container.innerHTML).toBe('<div><p>text</p><ul></ul></div>');
  });

  it('does not run them when innerHTML replaces the children', () => {
    render(
      <div>
        <p>
          <Leaving id="a" />
        </p>
        <ul>{[<Leaving key="b" id="b" defer />]}</ul>
      </div>,
      container,
    );
    render(
      <div>
        <p dangerouslySetInnerHTML={{ __html: '<i>x</i>' }} />
        <ul>{[]}</ul>
      </div>,
      container,
    );

    expect(calls).toEqual(['b']);
    pending.pop()!();
    expect(container.innerHTML).toBe('<div><p><i>x</i></p><ul></ul></div>');
  });

  it('keeps an element replaced by another element until its leave hooks finish', () => {
    render(
      <div>
        <section>
          <Leaving id="a" defer />
        </section>
        <ul>{[<Leaving key="b" id="b" defer />]}</ul>
      </div>,
      container,
    );
    render(
      <div>
        <article />
        <ul>{[]}</ul>
      </div>,
      container,
    );

    // Each removal waits for its own hook only
    expect(calls).toEqual(['a', 'b']);
    expect(container.innerHTML).toBe(
      '<div><article></article><section><span>a</span></section><ul><span>b</span></ul></div>',
    );
    pending[1]();
    expect(container.innerHTML).toBe(
      '<div><article></article><section><span>a</span></section><ul></ul></div>',
    );
    pending[0]();
    expect(container.innerHTML).toBe('<div><article></article><ul></ul></div>');
    pending = [];
  });

  it('replaces text children while leave hooks are pending in the same render', () => {
    render(
      <div>
        <p>
          <Leaving id="a" />
        </p>
        <p>text</p>
      </div>,
      container,
    );
    render(
      <div>
        <p>text</p>
        <p>
          <i>x</i>
        </p>
      </div>,
      container,
    );

    expect(calls).toEqual([]);
    expect(container.innerHTML).toBe('<div><p>text</p><p><i>x</i></p></div>');
  });
});
