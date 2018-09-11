import { Component, createPortal, render as _render } from 'inferno';
import { triggerEvent } from 'inferno-utils';
import { VNodeFlags } from 'inferno-vnode-flags';

describe('Portal spec', () => {
  let container;

  function render(input, container, cb) {
    _render(input, container, cb);

    const rootInput = container.$V;

    if (rootInput && rootInput.flags & VNodeFlags.Component) {
      return rootInput.children;
    }

    return rootInput;
  }

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  let svgEls, htmlEls, mathEls;
  let expectSVG = { ref: el => svgEls.push(el) };
  let expectHTML = { ref: el => htmlEls.push(el) };
  let expectMath = { ref: el => mathEls.push(el) };

  let usePortal = function(tree) {
    return createPortal(tree, document.createElement('div'));
  };

  let assertNamespacesMatch = function(tree) {
    svgEls = [];
    htmlEls = [];
    mathEls = [];

    render(tree, container);
    svgEls.forEach(el => {
      expect(el.namespaceURI).toBe('http://www.w3.org/2000/svg');
    });
    htmlEls.forEach(el => {
      expect(el.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
    });
    // mathEls.forEach(el => {
    //   expect(el.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML');
    // });

    render(null, container);
    expect(container.innerHTML).toBe('');
  };

  it('should mount/unmount one portal', () => {
    let portalContainer = document.createElement('div');

    render(<div>{createPortal(<div>portal</div>, portalContainer)}</div>, container);
    expect(portalContainer.innerHTML).toBe('<div>portal</div>');
    expect(container.innerHTML).toBe('<div></div>');

    render(null, container);
    expect(portalContainer.innerHTML).toBe('');
    expect(container.innerHTML).toBe('');
  });

  it('Should mount/render/patch one portal', () => {
    let portalContainer = document.createElement('div');

    render(<div>{createPortal(<div>portal</div>, portalContainer)}</div>, container);
    expect(portalContainer.innerHTML).toBe('<div>portal</div>');
    expect(container.innerHTML).toBe('<div></div>');

    // Patch
    render(<div>{createPortal(<div>portal2</div>, portalContainer)}</div>, container);
    expect(portalContainer.innerHTML).toBe('<div>portal2</div>');
    expect(container.innerHTML).toBe('<div></div>');

    // Patch Remove contents
    render(<div>{createPortal(null, portalContainer)}</div>, container);
    expect(portalContainer.innerHTML).toBe('');
    expect(container.innerHTML).toBe('<div></div>');

    // Patch Add contents
    render(<div>{createPortal(<span>Fobba</span>, portalContainer)}</div>, container);
    expect(portalContainer.innerHTML).toBe('<span>Fobba</span>');
    expect(container.innerHTML).toBe('<div></div>');

    // Remove parent
    render(null, container);
    expect(portalContainer.innerHTML).toBe('');
    expect(container.innerHTML).toBe('');
  });

  it('Should move portal based on container', () => {
    let portalContainer = document.createElement('div');
    let portalContainer2 = document.createElement('div');

    render(<div>{createPortal(<div>portal</div>, portalContainer)}</div>, container);
    expect(portalContainer.innerHTML).toBe('<div>portal</div>');
    expect(portalContainer2.innerHTML).toBe('');
    expect(container.innerHTML).toBe('<div></div>');

    // Patch - change container
    render(<div>{createPortal(<div>portal2</div>, portalContainer2)}</div>, container);
    expect(portalContainer.innerHTML).toBe('');
    expect(portalContainer2.innerHTML).toBe('<div>portal2</div>');
    expect(container.innerHTML).toBe('<div></div>');

    // Patch Remove contents of old portal - both should be removed
    render(<div>{createPortal(null, portalContainer)}</div>, container);
    expect(portalContainer.innerHTML).toBe('');
    expect(portalContainer2.innerHTML).toBe('');
    expect(container.innerHTML).toBe('<div></div>');

    // Patch Add contents
    render(<div>{createPortal(<span>Fobba</span>, portalContainer2)}</div>, container);
    expect(portalContainer.innerHTML).toBe('');
    expect(portalContainer2.innerHTML).toBe('<span>Fobba</span>');
    expect(container.innerHTML).toBe('<div></div>');

    // Remove parent
    render(null, container);
    expect(portalContainer.innerHTML).toBe('');
    expect(container.innerHTML).toBe('');
  });

  it('should render many portals', () => {
    let portalContainer1 = document.createElement('div');
    let portalContainer2 = document.createElement('div');

    let ops = [];

    class Child extends Component {
      componentDidMount() {
        ops.push(`${this.props.name} componentDidMount`);
      }

      componentDidUpdate() {
        ops.push(`${this.props.name} componentDidUpdate`);
      }

      componentWillUnmount() {
        ops.push(`${this.props.name} componentWillUnmount`);
      }

      render() {
        return <div>{this.props.name}</div>;
      }
    }

    class Parent extends Component {
      componentDidMount() {
        ops.push(`Parent:${this.props.step} componentDidMount`);
      }

      componentDidUpdate() {
        ops.push(`Parent:${this.props.step} componentDidUpdate`);
      }

      componentWillUnmount() {
        ops.push(`Parent:${this.props.step} componentWillUnmount`);
      }

      render() {
        const { step } = this.props;

        const portalOne = createPortal(<Child key="b" name={`portal1[0]:${step}`} />, portalContainer1);

        const portalTwo = createPortal(
          <div>
            <Child key="d" name={`portal2[0]:${step}`} />
            <Child key="e" name={`portal2[1]:${step}`} />
          </div>,
          portalContainer2
        );

        return (
          <div>
            <Child key="a" name={`normal[0]:${step}`} />
            {portalOne}
            <Child key="c" name={`normal[1]:${step}`} />
            {portalTwo}
          </div>
        );
      }
    }

    render(<Parent step="a" />, container);

    expect(portalContainer1.innerHTML).toBe('<div>portal1[0]:a</div>');
    expect(portalContainer2.innerHTML).toBe('<div><div>portal2[0]:a</div><div>portal2[1]:a</div></div>');
    expect(container.innerHTML).toBe('<div><div>normal[0]:a</div><div>normal[1]:a</div></div>');
    expect(ops).toEqual([
      'normal[0]:a componentDidMount',
      'portal1[0]:a componentDidMount',
      'normal[1]:a componentDidMount',
      'portal2[0]:a componentDidMount',
      'portal2[1]:a componentDidMount',
      'Parent:a componentDidMount'
    ]);

    ops.length = 0;

    render(<Parent step="b" />, container);
    expect(portalContainer1.innerHTML).toBe('<div>portal1[0]:b</div>');
    expect(portalContainer2.innerHTML).toBe('<div><div>portal2[0]:b</div><div>portal2[1]:b</div></div>');
    expect(container.innerHTML).toBe('<div><div>normal[0]:b</div><div>normal[1]:b</div></div>');
    expect(ops).toEqual([
      'normal[0]:b componentDidUpdate',
      'portal1[0]:b componentDidUpdate',
      'normal[1]:b componentDidUpdate',
      'portal2[0]:b componentDidUpdate',
      'portal2[1]:b componentDidUpdate',
      'Parent:b componentDidUpdate'
    ]);

    ops.length = 0;
    render(null, container);
    expect(portalContainer1.innerHTML).toBe('');
    expect(portalContainer2.innerHTML).toBe('');
    expect(container.innerHTML).toBe('');
    expect(ops).toEqual([
      'Parent:b componentWillUnmount',
      'normal[0]:b componentWillUnmount',
      'portal1[0]:b componentWillUnmount',
      'normal[1]:b componentWillUnmount',
      'portal2[0]:b componentWillUnmount',
      'portal2[1]:b componentWillUnmount'
    ]);
  });

  it('should render nested portals', () => {
    let portalContainer1 = document.createElement('div');
    let portalContainer2 = document.createElement('div');
    let portalContainer3 = document.createElement('div');

    render(
      <div>
        <div key="a">normal[0]</div>
        {createPortal(
          <div>
            <div key="b">portal1[0]</div>
            {createPortal(<div key="c">portal2[0]</div>, portalContainer2)}
            {createPortal(<div key="d">portal3[0]</div>, portalContainer3)}
            <div key="e">portal1[1]</div>
          </div>,
          portalContainer1
        )}
        <div key="f">normal[1]</div>
      </div>,
      container
    );
    expect(portalContainer1.innerHTML).toBe('<div><div>portal1[0]</div><div>portal1[1]</div></div>');
    expect(portalContainer2.innerHTML).toBe('<div>portal2[0]</div>');
    expect(portalContainer3.innerHTML).toBe('<div>portal3[0]</div>');
    expect(container.innerHTML).toBe('<div><div>normal[0]</div><div>normal[1]</div></div>');

    render(null, container);
    expect(portalContainer1.innerHTML).toBe('');
    expect(portalContainer2.innerHTML).toBe('');
    expect(portalContainer3.innerHTML).toBe('');
    expect(container.innerHTML).toBe('');
  });

  it('should reconcile portal children', () => {
    let portalContainer = document.createElement('div');

    render(<div>{createPortal(<div>portal:1</div>, portalContainer)}</div>, container);
    expect(portalContainer.innerHTML).toBe('<div>portal:1</div>');
    expect(container.innerHTML).toBe('<div></div>');

    render(<div>{createPortal(<div>portal:2</div>, portalContainer)}</div>, container);
    expect(portalContainer.innerHTML).toBe('<div>portal:2</div>');
    expect(container.innerHTML).toBe('<div></div>');

    render(<div>{createPortal(<p>portal:3</p>, portalContainer)}</div>, container);
    expect(portalContainer.innerHTML).toBe('<p>portal:3</p>');
    expect(container.innerHTML).toBe('<div></div>');

    render(<div>{createPortal(<span>{['Hi', 'Bye']}</span>, portalContainer)}</div>, container);
    expect(portalContainer.textContent).toBe('HiBye');
    expect(container.innerHTML).toBe('<div></div>');

    render(<div>{createPortal(<span>{['Bye', 'Hi']}</span>, portalContainer)}</div>, container);
    expect(portalContainer.textContent).toBe('ByeHi');
    expect(container.innerHTML).toBe('<div></div>');

    render(<div>{createPortal(null, portalContainer)}</div>, container);
    expect(portalContainer.innerHTML).toBe('');
    expect(container.innerHTML).toBe('<div></div>');
  });

  it('should keep track of namespace across portals (simple)', () => {
    assertNamespacesMatch(
      <svg {...expectSVG}>
        <image {...expectSVG} />
        {usePortal(<div {...expectHTML} />)}
        <image {...expectSVG} />
      </svg>
    );
    assertNamespacesMatch(
      <math {...expectMath}>
        <mi {...expectMath} />
        {usePortal(<div {...expectHTML} />)}
        <mi {...expectMath} />
      </math>
    );
    assertNamespacesMatch(
      <div {...expectHTML}>
        <p {...expectHTML} />
        {usePortal(
          <svg {...expectSVG}>
            <image {...expectSVG} />
          </svg>
        )}
        <p {...expectHTML} />
      </div>
    );
  });

  it('should keep track of namespace across portals (medium)', () => {
    assertNamespacesMatch(
      <svg {...expectSVG}>
        <image {...expectSVG} />
        {usePortal(<div {...expectHTML} />)}
        <image {...expectSVG} />
        {usePortal(<div {...expectHTML} />)}
        <image {...expectSVG} />
      </svg>
    );
    assertNamespacesMatch(
      <div {...expectHTML}>
        <math {...expectMath}>
          <mi {...expectMath} />
          {usePortal(
            <svg {...expectSVG}>
              <image {...expectSVG} />
            </svg>
          )}
        </math>
        <p {...expectHTML} />
      </div>
    );
    assertNamespacesMatch(
      <math {...expectMath}>
        <mi {...expectMath} />
        {usePortal(
          <svg {...expectSVG}>
            <image {...expectSVG} />
            <foreignObject {...expectSVG}>
              <p {...expectHTML} />
              <math {...expectMath}>
                <mi {...expectMath} />
              </math>
              <p {...expectHTML} />
            </foreignObject>
            <image {...expectSVG} />
          </svg>
        )}
        <mi {...expectMath} />
      </math>
    );
    assertNamespacesMatch(
      <div {...expectHTML}>
        {usePortal(
          <svg {...expectSVG}>
            {usePortal(<div {...expectHTML} />)}
            <image {...expectSVG} />
          </svg>
        )}
        <p {...expectHTML} />
      </div>
    );
    assertNamespacesMatch(
      <svg {...expectSVG}>
        <svg {...expectSVG}>
          {usePortal(<div {...expectHTML} />)}
          <image {...expectSVG} />
        </svg>
        <image {...expectSVG} />
      </svg>
    );
  });

  it('should keep track of namespace across portals (complex)', () => {
    assertNamespacesMatch(
      <div {...expectHTML}>
        {usePortal(
          <svg {...expectSVG}>
            <image {...expectSVG} />
          </svg>
        )}
        <p {...expectHTML} />
        <svg {...expectSVG}>
          <image {...expectSVG} />
        </svg>
        <svg {...expectSVG}>
          <svg {...expectSVG}>
            <image {...expectSVG} />
          </svg>
          <image {...expectSVG} />
        </svg>
        <p {...expectHTML} />
      </div>
    );
    assertNamespacesMatch(
      <div {...expectHTML}>
        <svg {...expectSVG}>
          <svg {...expectSVG}>
            <image {...expectSVG} />
            {usePortal(
              <svg {...expectSVG}>
                <image {...expectSVG} />
                <svg {...expectSVG}>
                  <image {...expectSVG} />
                </svg>
                <image {...expectSVG} />
              </svg>
            )}
            <image {...expectSVG} />
            <foreignObject {...expectSVG}>
              <p {...expectHTML} />
              {usePortal(<p {...expectHTML} />)}
              <p {...expectHTML} />
            </foreignObject>
          </svg>
          <image {...expectSVG} />
        </svg>
        <p {...expectHTML} />
      </div>
    );
    assertNamespacesMatch(
      <div {...expectHTML}>
        <svg {...expectSVG}>
          <foreignObject {...expectSVG}>
            <p {...expectHTML} />
            {usePortal(
              <svg {...expectSVG}>
                <image {...expectSVG} />
                <svg {...expectSVG}>
                  <image {...expectSVG} />
                  <foreignObject {...expectSVG}>
                    <p {...expectHTML} />
                  </foreignObject>
                  {usePortal(<p {...expectHTML} />)}
                </svg>
                <image {...expectSVG} />
              </svg>
            )}
            <p {...expectHTML} />
          </foreignObject>
          <image {...expectSVG} />
        </svg>
        <p {...expectHTML} />
      </div>
    );
  });

  it('should unwind namespaces on uncaught errors', () => {
    function BrokenRender() {
      throw new Error('Hello');
    }

    expect(() => {
      assertNamespacesMatch(
        <svg {...expectSVG}>
          <BrokenRender />
        </svg>
      );
    }).toThrow(); // Hello

    assertNamespacesMatch(<div {...expectHTML} />);
  });

  it('should pass portal context when rendering subtree elsewhere', () => {
    let portalContainer = document.createElement('div');

    class Comp extends Component {
      render() {
        return <div>{this.context.foo}</div>;
      }
    }

    class Parent extends Component {
      getChildContext() {
        return {
          foo: 'bar'
        };
      }

      render() {
        return createPortal(<Comp />, portalContainer);
      }
    }

    render(<Parent />, container);
    expect(container.innerHTML).toBe('');
    expect(portalContainer.innerHTML).toBe('<div>bar</div>');
  });

  it('should update portal context if it changes due to setState', () => {
    let portalContainer = document.createElement('div');

    class Comp extends Component {
      render() {
        return <div>{this.context.foo + '-' + this.context.getFoo()}</div>;
      }
    }

    class Parent extends Component {
      state = {
        bar: 'initial'
      };

      getChildContext() {
        return {
          foo: this.state.bar,
          getFoo: () => this.state.bar
        };
      }

      render() {
        return createPortal(<Comp />, portalContainer);
      }
    }

    let instance = render(<Parent />, container);
    expect(portalContainer.innerHTML).toBe('<div>initial-initial</div>');
    expect(container.innerHTML).toBe('');

    instance.setState({ bar: 'changed' });

    expect(portalContainer.innerHTML).toBe('<div>changed-changed</div>');
    expect(container.innerHTML).toBe('');

    render(null, container);

    expect(portalContainer.innerHTML).toBe('');
    expect(container.innerHTML).toBe('');
  });

  it('should update portal context if it changes due to re-render', () => {
    let portalContainer = document.createElement('div');

    class Comp extends Component {
      render() {
        return <div>{this.context.foo + '-' + this.context.getFoo()}</div>;
      }
    }

    class Parent extends Component {
      getChildContext() {
        return {
          foo: this.props.bar,
          getFoo: () => this.props.bar
        };
      }

      render() {
        return createPortal(<Comp />, portalContainer);
      }
    }

    render(<Parent bar="initial" />, container);
    expect(portalContainer.innerHTML).toBe('<div>initial-initial</div>');
    expect(container.innerHTML).toBe('');

    render(<Parent bar="changed" />, container);
    expect(portalContainer.innerHTML).toBe('<div>changed-changed</div>');
    expect(container.innerHTML).toBe('');

    render(null, container);
    expect(portalContainer.innerHTML).toBe('');
    expect(container.innerHTML).toBe('');
  });

  it('should update portal context if it changes due to re-render - functional comps', () => {
    let portalContainer = document.createElement('div');

    function Comp(props, { foo, getFoo }) {
      return <div>{foo + '-' + getFoo()}</div>;
    }

    class Parent extends Component {
      getChildContext() {
        return {
          foo: this.props.bar,
          getFoo: () => this.props.bar
        };
      }

      render() {
        return createPortal(<Comp />, portalContainer);
      }
    }

    render(<Parent bar="initial" />, container);
    expect(portalContainer.innerHTML).toBe('<div>initial-initial</div>');
    expect(container.innerHTML).toBe('');

    render(<Parent bar="changed" />, container);
    expect(portalContainer.innerHTML).toBe('<div>changed-changed</div>');
    expect(container.innerHTML).toBe('');

    render(null, container);
    expect(portalContainer.innerHTML).toBe('');
    expect(container.innerHTML).toBe('');
  });

  it('should update portal context if it changes due to re-render - functional comps #2', () => {
    let portalContainer = document.createElement('div');

    function Comp({ foo }) {
      return <div>{foo}</div>;
    }

    function Parent({ bar }) {
      return createPortal(<Comp foo={bar} />, portalContainer);
    }

    render(<Parent bar="initial" />, container);
    expect(portalContainer.innerHTML).toBe('<div>initial</div>');
    expect(container.innerHTML).toBe('');

    render(<Parent bar="changed" />, container);
    expect(portalContainer.innerHTML).toBe('<div>changed</div>');
    expect(container.innerHTML).toBe('');

    render(null, container);
    expect(portalContainer.innerHTML).toBe('');
    expect(container.innerHTML).toBe('');
  });

  describe('Changing portal to other type of vNode', () => {
    it('Should remove portal from its container when its replaced by div', () => {
      let portalContainer = document.createElement('div');

      function Comp({ foo }) {
        return <div>{foo}</div>;
      }

      function Parent({ bar, port }) {
        let innerContent;

        if (port) {
          innerContent = createPortal(<Comp foo={bar} />, portalContainer);
        } else {
          innerContent = <div>{bar}</div>;
        }

        return <div>{innerContent}</div>;
      }

      render(<Parent port={false} bar="initial" />, container);
      expect(portalContainer.innerHTML).toBe('');
      expect(container.innerHTML).toBe('<div><div>initial</div></div>');

      render(<Parent port={true} bar="changed" />, container);
      expect(portalContainer.innerHTML).toBe('<div>changed</div>');
      expect(container.innerHTML).toBe('<div></div>');

      render(<Parent port={false} bar="triple" />, container);
      expect(portalContainer.innerHTML).toBe('');
      expect(container.innerHTML).toBe('<div><div>triple</div></div>');

      render(null, container);
      expect(portalContainer.innerHTML).toBe('');
      expect(container.innerHTML).toBe('');
    });

    it('Should remove portal from its container when its replaced by class component', () => {
      let portalContainer = document.createElement('div');

      class Comp extends Component {
        render({ children }) {
          return <div>{children}</div>;
        }
      }

      function Parent({ bar, port }) {
        let innerContent;

        if (port) {
          innerContent = createPortal(<Comp children={bar} />, portalContainer);
        } else {
          innerContent = (
            <Comp>
              <span>{bar}</span>
            </Comp>
          );
        }

        return <div>{innerContent}</div>;
      }

      render(<Parent port={false} bar="initial" />, container);
      expect(portalContainer.innerHTML).toBe('');
      expect(container.innerHTML).toBe('<div><div><span>initial</span></div></div>');

      render(<Parent port={true} bar="changed" />, container);
      expect(portalContainer.innerHTML).toBe('<div>changed</div>');
      expect(container.innerHTML).toBe('<div></div>');

      render(<Parent port={false} bar="triple" />, container);
      expect(portalContainer.innerHTML).toBe('');
      expect(container.innerHTML).toBe('<div><div><span>triple</span></div></div>');

      render(null, container);
      expect(portalContainer.innerHTML).toBe('');
      expect(container.innerHTML).toBe('');
    });

    it('Should remove portal from its container when its replaced by functional component', () => {
      let portalContainer = document.createElement('div');

      function Comp({ children }) {
        return <div>{children}</div>;
      }

      function Parent({ bar, port }) {
        let innerContent;

        if (port) {
          innerContent = createPortal(<Comp children={bar} />, portalContainer);
        } else {
          innerContent = (
            <Comp>
              <span>{bar}</span>
            </Comp>
          );
        }

        return <div>{innerContent}</div>;
      }

      render(<Parent port={false} bar="initial" />, container);
      expect(portalContainer.innerHTML).toBe('');
      expect(container.innerHTML).toBe('<div><div><span>initial</span></div></div>');

      render(<Parent port={true} bar="changed" />, container);
      expect(portalContainer.innerHTML).toBe('<div>changed</div>');
      expect(container.innerHTML).toBe('<div></div>');

      render(<Parent port={false} bar="triple" />, container);
      expect(portalContainer.innerHTML).toBe('');
      expect(container.innerHTML).toBe('<div><div><span>triple</span></div></div>');

      render(null, container);
      expect(portalContainer.innerHTML).toBe('');
      expect(container.innerHTML).toBe('');
    });

    it('Should remove portal from its container when its replaced by invalid node', () => {
      let portalContainer = document.createElement('div');

      function Comp({ children }) {
        return <div>{children}</div>;
      }

      function Parent({ bar, port }) {
        let innerContent;

        if (port) {
          innerContent = createPortal(<Comp children={bar} />, portalContainer);
        } else {
          innerContent = false;
        }

        return <div>{innerContent}</div>;
      }

      render(<Parent port={false} bar="initial" />, container);
      expect(portalContainer.innerHTML).toBe('');
      expect(container.innerHTML).toBe('<div></div>');

      render(<Parent port={true} bar="changed" />, container);
      expect(portalContainer.innerHTML).toBe('<div>changed</div>');
      expect(container.innerHTML).toBe('<div></div>');

      render(<Parent port={false} bar="triple" />, container);
      expect(portalContainer.innerHTML).toBe('');
      expect(container.innerHTML).toBe('<div></div>');

      render(null, container);
      expect(portalContainer.innerHTML).toBe('');
      expect(container.innerHTML).toBe('');
    });

    describe('Multiple portals', () => {
      it('#1', () => {
        let portalContainer = document.createElement('div');

        let mountCount = 0;
        let unMountCount = 0;

        class Comp extends Component {
          componentWillMount() {
            mountCount++;
          }

          componentWillUnmount() {
            unMountCount++;
          }

          render({ children }) {
            return <div>{children}</div>;
          }
        }

        function Parent({ port }) {
          let innerContent;

          if (port) {
            innerContent = [
              createPortal(<Comp key={1} children={1} />, portalContainer),
              createPortal(<Comp key={2} children={2} />, portalContainer),
              createPortal(<Comp key={3} children={3} />, portalContainer)
            ];
          } else {
            innerContent = false;
          }

          return <div>{innerContent}</div>;
        }

        render(<Parent port={false} bar="initial" />, container);
        expect(portalContainer.innerHTML).toBe('');
        expect(container.innerHTML).toBe('<div></div>');
        expect(mountCount).toBe(0);
        expect(unMountCount).toBe(0);

        render(<Parent port={true} bar="changed" />, container);
        expect(portalContainer.innerHTML).toBe('<div>1</div><div>2</div><div>3</div>');
        expect(container.innerHTML).toBe('<div></div>');
        expect(mountCount).toBe(3);
        expect(unMountCount).toBe(0);

        render(<Parent port={false} bar="triple" />, container);
        expect(portalContainer.innerHTML).toBe('');
        expect(container.innerHTML).toBe('<div></div>');
        expect(mountCount).toBe(3);
        expect(unMountCount).toBe(3);

        render(null, container);
        expect(portalContainer.innerHTML).toBe('');
        expect(container.innerHTML).toBe('');
        expect(mountCount).toBe(3);
        expect(unMountCount).toBe(3);
      });

      it('#2', () => {
        let portalContainer = document.createElement('div');

        let mountCount = 0;
        let unMountCount = 0;

        class Comp extends Component {
          componentWillMount() {
            mountCount++;
          }

          componentWillUnmount() {
            unMountCount++;
          }

          render({ children }) {
            return <div>{children}</div>;
          }
        }

        function Parent({ port, nothing }) {
          let innerContent;

          if (!nothing) {
            if (port) {
              innerContent = [
                createPortal(<Comp key={1} children={1} />, portalContainer),
                createPortal(<Comp key={2} children={2} />, portalContainer),
                createPortal(<Comp key={3} children={3} />, portalContainer)
              ];
            } else {
              innerContent = [
                createPortal(<Comp key={1} children={1} />, portalContainer),
                createPortal(<Comp key={3} children={3} />, portalContainer),
                createPortal(<Comp key={5} children={5} />, portalContainer)
              ];
            }
          }

          return <div>{innerContent}</div>;
        }

        render(<Parent nothing={true} port={false} bar="initial" />, container);
        expect(portalContainer.innerHTML).toBe('');
        expect(container.innerHTML).toBe('<div></div>');
        expect(mountCount).toBe(0);
        expect(unMountCount).toBe(0);

        render(<Parent port={true} bar="changed" />, container);
        expect(portalContainer.innerHTML).toBe('<div>1</div><div>2</div><div>3</div>');
        expect(container.innerHTML).toBe('<div></div>');
        expect(mountCount).toBe(3);
        expect(unMountCount).toBe(0);

        render(<Parent port={false} bar="triple" />, container);
        expect(portalContainer.innerHTML).toBe('<div>1</div><div>3</div><div>5</div>');
        expect(container.innerHTML).toBe('<div></div>');
        expect(mountCount).toBe(4); // 5 is new
        expect(unMountCount).toBe(1); // 2 is dead

        render(null, container);
        expect(portalContainer.innerHTML).toBe('');
        expect(container.innerHTML).toBe('');
        expect(mountCount).toBe(4);
        expect(unMountCount).toBe(4);
      });

      it('Should be possible to move nodes around portals #1', () => {
        let portalContainer = document.createElement('div');

        let mountCount = 0;
        let unMountCount = 0;

        class Comp extends Component {
          componentWillMount() {
            mountCount++;
          }

          componentWillUnmount() {
            unMountCount++;
          }

          render({ children }) {
            return <div>{children}</div>;
          }
        }

        function Parent({ port, nothing }) {
          let innerContent;

          if (port) {
            innerContent = [
              <span key="a">a</span>,
              createPortal(<Comp key={1} children={1} />, portalContainer),
              <span key="b">b</span>,
              createPortal(<Comp key={2} children={2} />, portalContainer),
              <span key="c">c</span>,
              createPortal(<Comp key={3} children={3} />, portalContainer)
            ];
          } else {
            innerContent = [
              createPortal(<Comp key={1} children={1} />, portalContainer),
              <span key="c">c</span>,
              createPortal(<Comp key={3} children={3} />, portalContainer),
              createPortal(<Comp key={5} children={5} />, portalContainer),
              <span key="a">a</span>,
              <span key="b">b</span>
            ];
          }

          return <div>{innerContent}</div>;
        }

        render(<Parent port={true} bar="changed" />, container);
        expect(container.innerHTML).toBe('<div><span>a</span><span>b</span><span>c</span></div>');
        expect(portalContainer.innerHTML).toBe('<div>1</div><div>2</div><div>3</div>');
        expect(mountCount).toBe(3);
        expect(unMountCount).toBe(0);

        render(<Parent port={false} bar="initial" />, container);
        expect(portalContainer.innerHTML).toBe('<div>1</div><div>3</div><div>5</div>');
        expect(container.innerHTML).toBe('<div><span>c</span><span>a</span><span>b</span></div>');
        expect(mountCount).toBe(4);
        expect(unMountCount).toBe(1);

        render(null, container);
        expect(portalContainer.innerHTML).toBe('');
        expect(container.innerHTML).toBe('');
        expect(mountCount).toBe(4);
        expect(unMountCount).toBe(4);
      });

      it('Should be possible to move nodes around portals #2', () => {
        let portalContainer = document.createElement('div');

        let mountCount = 0;
        let unMountCount = 0;

        class Comp extends Component {
          componentWillMount() {
            mountCount++;
          }

          componentWillUnmount() {
            unMountCount++;
          }

          render({ children }) {
            return <div>{children}</div>;
          }
        }

        function Parent({ port, nothing }) {
          let innerContent;

          if (port) {
            innerContent = [
              <span key="a">a</span>,
              createPortal(<Comp key={1} children={1} />, portalContainer),
              <span key="b">b</span>,
              createPortal(<Comp key={2} children={2} />, portalContainer),
              <span key="c">c</span>,
              createPortal(<Comp key={3} children={3} />, portalContainer)
            ];
          } else {
            innerContent = [
              createPortal(<Comp key={1} children={1} />, portalContainer),
              <span key="c">c</span>,
              createPortal(<Comp key={3} children={3} />, portalContainer),
              createPortal(<Comp key={5} children={5} />, portalContainer),
              <span key="a">a</span>,
              <span key="b">b</span>
            ];
          }

          return <div>{innerContent}</div>;
        }

        render(<Parent port={false} />, container);
        expect(portalContainer.innerHTML).toBe('<div>1</div><div>3</div><div>5</div>');
        expect(container.innerHTML).toBe('<div><span>c</span><span>a</span><span>b</span></div>');

        render(<Parent port={true} />, container);
        expect(container.innerHTML).toBe('<div><span>a</span><span>b</span><span>c</span></div>');
        expect(portalContainer.innerHTML).toBe('<div>1</div><div>3</div><div>2</div>'); // <= Portal order is based on creation

        render(null, container);
        expect(portalContainer.innerHTML).toBe('');
        expect(container.innerHTML).toBe('');
        expect(mountCount).toBe(4);
        expect(unMountCount).toBe(4);
      });

      it('Should be possible to move nodes around portals when portal is root node of component #1', () => {
        let portalContainer = document.createElement('div');

        let mountCount = 0;
        let unMountCount = 0;

        class WrapPortal extends Component {
          render({ children }) {
            return createPortal(<Comp>{children}</Comp>, portalContainer);
          }
        }

        class Comp extends Component {
          componentWillMount() {
            mountCount++;
          }

          componentWillUnmount() {
            unMountCount++;
          }

          render({ children }) {
            return <div>{children}</div>;
          }
        }

        function Parent({ port }) {
          let innerContent;

          if (port) {
            innerContent = [
              <span key="a">a</span>,
              <WrapPortal key={1}>1</WrapPortal>,
              <span key="b">b</span>,
              createPortal(<Comp key={2} children={2} />, portalContainer),
              <span key="c">c</span>,
              <WrapPortal key={3}>3</WrapPortal>
            ];
          } else {
            innerContent = [
              createPortal(<Comp key={1} children={1} />, portalContainer),
              <span key="c">c</span>,
              createPortal(<Comp key={3} children={3} />, portalContainer),
              createPortal(<Comp key={5} children={5} />, portalContainer),
              <span key="a">a</span>,
              <span key="b">b</span>
            ];
          }

          return <div>{innerContent}</div>;
        }

        render(<Parent port={false} />, container);
        expect(portalContainer.innerHTML).toBe('<div>1</div><div>3</div><div>5</div>');
        expect(container.innerHTML).toBe('<div><span>c</span><span>a</span><span>b</span></div>');

        render(<Parent port={true} />, container);
        expect(container.innerHTML).toBe('<div><span>a</span><span>b</span><span>c</span></div>');
        expect(portalContainer.innerHTML).toBe('<div>1</div><div>3</div><div>2</div>'); // <= Portal order is based on creation

        render(<Parent port={false} />, container);
        expect(portalContainer.innerHTML).toBe('<div>1</div><div>3</div><div>5</div>');
        expect(container.innerHTML).toBe('<div><span>c</span><span>a</span><span>b</span></div>');

        render(null, container);
        expect(portalContainer.innerHTML).toBe('');
        expect(container.innerHTML).toBe('');
        expect(mountCount).toBe(9);
        expect(unMountCount).toBe(9);
      });

      it('Should be possible to move nodes around portals when portal is root node of component #2', () => {
        let portalContainer = document.createElement('div');

        let mountCount = 0;
        let unMountCount = 0;

        class WrapPortal extends Component {
          render({ children }) {
            return createPortal(<Comp>{children}</Comp>, portalContainer);
          }
        }

        class Comp extends Component {
          componentWillMount() {
            mountCount++;
          }

          componentWillUnmount() {
            unMountCount++;
          }

          render({ children }) {
            return <div>{children}</div>;
          }
        }

        function Parent({ port }) {
          let innerContent;

          if (port) {
            innerContent = [
              <span key="A">A</span>,
              <WrapPortal key={1}>1</WrapPortal>,
              <WrapPortal key={2}>2</WrapPortal>,
              createPortal(<Comp key={3} children={3} />, portalContainer),
              <WrapPortal key={4}>
                <WrapPortal>
                  <WrapPortal>inner</WrapPortal>
                </WrapPortal>
              </WrapPortal>,
              <span key="B">B</span>,
              <WrapPortal key={5}>5</WrapPortal>
            ];
          } else {
            innerContent = [
              createPortal(<Comp key={1} children={1} />, portalContainer),
              <span key="C">C</span>,
              <WrapPortal key={4}>
                <span>XX</span>
              </WrapPortal>, // <== Change nested portal into component span and move it
              createPortal(<Comp key={3} children={3} />, portalContainer),
              <WrapPortal key={5}>5</WrapPortal>,
              <span key="A">A</span>,
              <span key="B">B</span>
            ];
          }

          return <div>{innerContent}</div>;
        }

        render(<Parent port={true} />, container);
        // 3 5 1 inner 2
        expect(portalContainer.innerHTML).toBe('<div>1</div><div>2</div><div>3</div><div>inner</div><div></div><div></div><div>5</div>');
        expect(container.innerHTML).toBe('<div><span>A</span><span>B</span></div>');
        expect(mountCount).toBe(7);
        expect(unMountCount).toBe(0);

        render(<Parent port={false} />, container);
        expect(portalContainer.innerHTML).toBe('<div>3</div><div><span>XX</span></div><div>5</div><div>1</div>');
        expect(container.innerHTML).toBe('<div><span>C</span><span>A</span><span>B</span></div>');

        render(<Parent port={true} />, container);
        // 3 5 1 inner 2
        expect(portalContainer.innerHTML).toBe('<div>3</div><div></div><div>5</div><div>1</div><div>inner</div><div></div><div>2</div>');
        expect(container.innerHTML).toBe('<div><span>A</span><span>B</span></div>');

        render(<Parent port={false} />, container);
        expect(portalContainer.innerHTML).toBe('<div>3</div><div><span>XX</span></div><div>5</div><div>1</div>');
        expect(container.innerHTML).toBe('<div><span>C</span><span>A</span><span>B</span></div>');

        render(null, container);
        expect(portalContainer.innerHTML).toBe('');
        expect(container.innerHTML).toBe('');
      });

      it('Should be possible to patch portal non keyed', () => {
        let portalContainer = document.createElement('div');

        let mountCount = 0;
        let unMountCount = 0;

        class WrapPortal extends Component {
          render({ children }) {
            return createPortal(<Comp>{children}</Comp>, portalContainer);
          }
        }

        class Comp extends Component {
          componentWillMount() {
            mountCount++;
          }

          componentWillUnmount() {
            unMountCount++;
          }

          render({ children }) {
            return <div>{children}</div>;
          }
        }

        function Parent({ port }) {
          let innerContent;

          if (port) {
            innerContent = [
              <span>A</span>,
              <WrapPortal>1</WrapPortal>,
              <WrapPortal>2</WrapPortal>,
              createPortal(<Comp children={3} />, portalContainer),
              <WrapPortal>
                <WrapPortal>
                  <WrapPortal>inner</WrapPortal>
                </WrapPortal>
              </WrapPortal>,
              <span>B</span>,
              <WrapPortal>5</WrapPortal>
            ];
          } else {
            innerContent = [
              createPortal(<Comp children={1} />, portalContainer),
              <span>C</span>,
              <WrapPortal>
                <span>XX</span>
              </WrapPortal>, // <== Change nested portal into component span and move it
              createPortal(<Comp children={3} />, portalContainer),
              <WrapPortal>5</WrapPortal>,
              <span>A</span>,
              <span>B</span>
            ];
          }

          return <div>{innerContent}</div>;
        }

        render(<Parent port={true} />, container);
        // 3 5 1 inner 2
        expect(portalContainer.innerHTML).toBe('<div>1</div><div>2</div><div>3</div><div>inner</div><div></div><div></div><div>5</div>');
        expect(container.innerHTML).toBe('<div><span>A</span><span>B</span></div>');

        render(<Parent port={false} />, container);
        expect(portalContainer.innerHTML).toBe('<div><span>XX</span></div><div>3</div><div>5</div><div>1</div>');
        expect(container.innerHTML).toBe('<div><span>C</span><span>A</span><span>B</span></div>');

        render(<Parent port={true} />, container);
        // 3 5 1 inner 2
        expect(portalContainer.innerHTML).toBe('<div>2</div><div>3</div><div></div><div>1</div><div>inner</div><div></div><div>5</div>');
        expect(container.innerHTML).toBe('<div><span>A</span><span>B</span></div>');

        render(null, container);
        expect(portalContainer.innerHTML).toBe('');
        expect(container.innerHTML).toBe('');
      });
    });
  });
});
