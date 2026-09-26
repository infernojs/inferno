import { Component, createTextVNode, createVNode, render } from 'inferno';
import { renderToString } from 'inferno-server';
import { createContainerWithHTML, validateNodeTree } from 'inferno-utils';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { hydrate } from 'inferno-hydrate';

function Comp1() {
  return <span>Worked!</span>;
}

function Comp2() {
  return <em>Worked 2!</em>;
}

class Comp3 extends Component {
  render() {
    return (
      <em>
        {['Works', ' ']}
        <span>again</span>!
      </em>
    );
  }
}

function Comp4({ children }) {
  return <section>{children}</section>;
}

class Comp5 extends Component {
  render() {
    return null;
  }
}

class A extends Component {
  render() {
    return <span>A</span>;
  }
}

class B extends Component {
  render() {
    return <span>B</span>;
  }
}

describe('SSR Hydration - (JSX)', () => {
  [
    {
      description: 'Should hydrate and re-render a div with a span child',
      node: (
        <div>
          <span>Hello world</span>
        </div>
      ),
      expect1: '<div><span>Hello world</span></div>',
      expect2: '<div><span>Hello world</span></div>',
    },
    {
      description:
        'Should hydrate and re-render a paragraph with text and a nested sup link',
      node: (
        <div>
          <p>
            Hello world
            <sup>
              <a>Foo</a>
            </sup>
          </p>
        </div>
      ),
      expect1: '<div><p>Hello world<sup><a>Foo</a></sup></p></div>',
      expect2: '<div><p>Hello world<sup><a>Foo</a></sup></p></div>',
    },
    {
      description:
        'Should hydrate and re-render a div with a span expression child',
      node: <div>{<span>Hello world</span>}</div>,
      expect1: '<div><span>Hello world</span></div>',
      expect2: '<div><span>Hello world</span></div>',
    },
    {
      description:
        'Should hydrate and re-render a span expression nested in a span',
      node: (
        <div>
          <span>{<span>Hello world</span>}</span>
        </div>
      ),
      expect1: '<div><span><span>Hello world</span></span></div>',
      expect2: '<div><span><span>Hello world</span></span></div>',
    },
    {
      description: 'Should hydrate and re-render a div with a text child',
      node: <div>Hello world</div>,
      expect1: '<div>Hello world</div>',
      expect2: '<div>Hello world</div>',
    },
    {
      description:
        'Should hydrate and re-render an svg with computed className and viewBox',
      node: (
        <div>
          <svg className={(() => 'foo')()} viewBox="0 0 64 64" />
        </div>
      ),
      expect1: '<div><svg class="foo" viewBox="0 0 64 64"></svg></div>',
      expect2: '<div><svg class="foo" viewBox="0 0 64 64"></svg></div>',
    },
    {
      description:
        'Should hydrate and re-render a component rendering element children in a section',
      node: (
        <Comp4>
          <h1>Hello world</h1>
          <p>
            <em>Foo</em>
          </p>
          <p>Woot</p>
          <p>
            <em>Bar</em>
          </p>
        </Comp4>
      ),
      expect1:
        '<section><h1>Hello world</h1><p><em>Foo</em></p><p>Woot</p><p><em>Bar</em></p></section>',
      expect2:
        '<section><h1>Hello world</h1><p><em>Foo</em></p><p>Woot</p><p><em>Bar</em></p></section>',
    },
    {
      description:
        'Should hydrate and re-render text followed by a string expression',
      node: <div>Hello world, {'Foo!'}</div>,
      expect1: '<div>Hello world, Foo!</div>',
      expect2: '<div>Hello world, Foo!</div>',
    },
    {
      description:
        'Should hydrate and re-render text followed by a string array',
      node: <div>Hello world, {['Foo!', 'Bar!']}</div>,
      expect1: '<div>Hello world, Foo!Bar!</div>',
      expect2: '<div>Hello world, Foo!Bar!</div>',
    },
    {
      description: 'Should hydrate and re-render text followed by null',
      node: (
        <div>
          Hello world!
          {null}
        </div>
      ),
      expect1: '<div>Hello world!</div>',
      expect2: '<div>Hello world!</div>',
    },
    {
      description:
        'Should hydrate and re-render text mixed with string expressions',
      node: (
        <div>
          Hello world, {'1'}2{'3'}
        </div>
      ),
      expect1: '<div>Hello world, 123</div>',
      expect2: '<div>Hello world, 123</div>',
    },
    {
      description: 'Should hydrate and re-render nested divs with ids',
      node: (
        <div id="1">
          <div id="2">
            <div id="3" />
          </div>
        </div>
      ),
      expect1: '<div id="1"><div id="2"><div id="3"></div></div></div>',
      expect2: '<div id="1"><div id="2"><div id="3"></div></div></div>',
    },
    {
      description:
        'Should hydrate and re-render a div with a functional component child',
      node: (
        <div>
          <Comp1 />
        </div>
      ),
      expect1: '<div><span>Worked!</span></div>',
      expect2: '<div><span>Worked!</span></div>',
    },
    {
      description:
        'Should hydrate and re-render a div with className and a functional component child',
      node: (
        <div className="test">
          <Comp1 />
        </div>
      ),
      expect1: '<div class="test"><span>Worked!</span></div>',
      expect2: '<div class="test"><span>Worked!</span></div>',
    },
    {
      description:
        'Should hydrate and re-render a div with three functional component children',
      node: (
        <div>
          <Comp1 />
          <Comp1 />
          <Comp1 />
        </div>
      ),
      expect1:
        '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
      expect2:
        '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
    },
    {
      description:
        'Should hydrate and re-render a class component rendering a text array and elements',
      node: (
        <div>
          <Comp3 />
        </div>
      ),
      expect1: '<div><em>Works <span>again</span>!</em></div>',
      expect2: '<div><em>Works <span>again</span>!</em></div>',
    },
  ].forEach(({ description, node, expect1, expect2 }) => {
    it(description, () => {
      const html = renderToString(node);
      const container = createContainerWithHTML(html);

      expect(container.innerHTML).toBe(expect1);
      hydrate(node, container);
      expect(validateNodeTree(node)).toBe(true);
      expect(container.innerHTML).toBe(expect2);
      render(node, container);
      expect(container.innerHTML).toBe(expect2);
    });
  });

  [
    {
      description:
        'Should hydrate and patch div text to different text and back',
      node: <div>Hello world</div>,
      expect1: '<div>Hello world</div>',
      node2: <div>Hello world 2</div>,
      expect2: '<div>Hello world 2</div>',
      node3: <div>Hello world</div>,
      expect3: '<div>Hello world</div>',
    },
    {
      description:
        'Should hydrate and patch text with a prepended string expression and back',
      node: <div>Hello world, {'Foo!'}</div>,
      expect1: '<div>Hello world, Foo!</div>',
      node2: (
        <div>
          {'Start'} Hello world, {'Foo!'}
        </div>
      ),
      expect2: '<div>Start Hello world, Foo!</div>',
      node3: <div>Hello world, {'Foo!'}</div>,
      expect3: '<div>Hello world, Foo!</div>',
    },
    {
      description:
        'Should hydrate and patch reordered string expressions in text and back',
      node: (
        <div>
          Hello world, {'1'}2{'3'}
        </div>
      ),
      expect1: '<div>Hello world, 123</div>',
      node2: (
        <div>
          Hello world, {'3'}2{'1'}
        </div>
      ),
      expect2: '<div>Hello world, 321</div>',
      node3: (
        <div>
          Hello world, {'1'}2{'3'}
        </div>
      ),
      expect3: '<div>Hello world, 123</div>',
    },
    {
      description: 'Should hydrate and patch ids of nested divs and back',
      node: (
        <div id="1">
          <div id="2">
            <div id="3" />
          </div>
        </div>
      ),
      expect1: '<div id="1"><div id="2"><div id="3"></div></div></div>',
      node2: (
        <div id="3">
          <div id="2">
            <div id="1" />
          </div>
        </div>
      ),
      expect2: '<div id="3"><div id="2"><div id="1"></div></div></div>',
      node3: (
        <div id="1">
          <div id="2">
            <div id="3" />
          </div>
        </div>
      ),
      expect3: '<div id="1"><div id="2"><div id="3"></div></div></div>',
    },
    {
      description: 'Should hydrate and patch a component child away and back',
      node: (
        <div>
          <Comp1 />
        </div>
      ),
      expect1: '<div><span>Worked!</span></div>',
      node2: <div />,
      expect2: '<div></div>',
      node3: (
        <div>
          <Comp1 />
        </div>
      ),
      expect3: '<div><span>Worked!</span></div>',
    },
    {
      description:
        'Should hydrate and patch a component child to another component and back',
      node: (
        <div className="test">
          <Comp1 />
        </div>
      ),
      expect1: '<div class="test"><span>Worked!</span></div>',
      node2: (
        <div className="test">
          <Comp2 />
        </div>
      ),
      expect2: '<div class="test"><em>Worked 2!</em></div>',
      node3: (
        <div className="test">
          <Comp1 />
        </div>
      ),
      expect3: '<div class="test"><span>Worked!</span></div>',
    },
    {
      description:
        'Should hydrate and patch three component children to another component type and back',
      node: (
        <div>
          <Comp1 />
          <Comp1 />
          <Comp1 />
        </div>
      ),
      expect1:
        '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
      node2: (
        <div>
          <Comp2 />
          <Comp2 />
          <Comp2 />
        </div>
      ),
      expect2:
        '<div><em>Worked 2!</em><em>Worked 2!</em><em>Worked 2!</em></div>',
      node3: (
        <div>
          <Comp1 />
          <Comp1 />
          <Comp1 />
        </div>
      ),
      expect3:
        '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
    },
    {
      description:
        'Should hydrate and patch a class component with a component inserted before it and back',
      node: (
        <div>
          <Comp3 />
        </div>
      ),
      expect1: '<div><em>Works <span>again</span>!</em></div>',
      node2: (
        <div>
          <Comp1 />
          <Comp3 />
        </div>
      ),
      expect2:
        '<div><span>Worked!</span><em>Works <span>again</span>!</em></div>',
      node3: (
        <div>
          <Comp3 />
        </div>
      ),
      expect3: '<div><em>Works <span>again</span>!</em></div>',
    },
    {
      description:
        'Should hydrate a component returning null and patch in siblings and back',
      node: (
        <div>
          <Comp5 />
        </div>
      ),
      expect1: '<div><!--!--></div>',
      node2: (
        <div>
          <Comp5 />
          <Comp3 />
          <Comp5 />
        </div>
      ),
      expect2: '<div><em>Works <span>again</span>!</em></div>',
      node3: (
        <div>
          <Comp5 />
        </div>
      ),
      expect3: '<div></div>',
    },
  ].forEach(
    ({ description, node, expect1, node2, node3, expect2, expect3 }) => {
      it(description, () => {
        const html = renderToString(node);
        const container = createContainerWithHTML(html);

        expect(container.innerHTML).toBe(expect1);
        hydrate(node, container);
        expect(validateNodeTree(node)).toBe(true);
        render(node2, container);
        expect(validateNodeTree(node2)).toBe(true);
        expect(container.innerHTML).toBe(expect2);
        render(node3, container);
        expect(validateNodeTree(node3)).toBe(true);
        expect(container.innerHTML).toBe(expect3);
      });
    },
  );

  it('should rebuild and patch from existing DOM content', () => {
    const container = document.createElement('div');
    const vNode = createVNode(
      VNodeFlags.HtmlElement,
      'div',
      'example',
      createTextVNode('Hello world!'),
      ChildFlags.HasVNodeChildren,
    );

    container.innerHTML = '<h1><div>Existing DOM content</div></h1>';
    hydrate(vNode, container);
    expect(container.innerHTML).toBe('<div class="example">Hello world!</div>');
  });

  it('should rebuild and patch from existing DOM content (whitespace) ', () => {
    const container = document.createElement('div');
    const vNode = createVNode(
      VNodeFlags.HtmlElement,
      'div',
      'example',
      createTextVNode('Hello world!'),
      ChildFlags.HasVNodeChildren,
    );

    container.appendChild(document.createTextNode(''));
    container.appendChild(document.createElement('h1'));
    container.appendChild(document.createTextNode(''));
    hydrate(vNode, container);
    expect(container.innerHTML).toBe('<div class="example">Hello world!</div>');
  });

  it('should rebuild and patch from existing DOM content with a mismatching h1 and an extra div', () => {
    const container = document.createElement('div');
    const vNode = createVNode(
      VNodeFlags.HtmlElement,
      'div',
      'example',
      [
        createVNode(
          VNodeFlags.HtmlElement,
          'div',
          null,
          createTextVNode('Item 1'),
          ChildFlags.HasVNodeChildren,
        ),
        createVNode(
          VNodeFlags.HtmlElement,
          'div',
          null,
          createTextVNode('Item 2'),
          ChildFlags.HasVNodeChildren,
        ),
      ],
      ChildFlags.HasNonKeyedChildren,
    );

    container.innerHTML =
      '<h1><div>Existing DOM content</div><div>Existing DOM content</div><div>Existing DOM content</div></h1><div>Existing DOM content</div>';
    hydrate(vNode, container);
    expect(container.innerHTML).toBe(
      '<div class="example"><div>Item 1</div><div>Item 2</div></div>',
    );
  });

  it('should rebuild and patch from existing DOM content with a div that has an extra child', () => {
    const container = document.createElement('div');
    const vNode = createVNode(
      VNodeFlags.HtmlElement,
      'div',
      'example',
      [
        createVNode(
          VNodeFlags.HtmlElement,
          'div',
          null,
          createTextVNode('Item 1'),
          ChildFlags.HasVNodeChildren,
        ),
        createVNode(
          VNodeFlags.HtmlElement,
          'div',
          null,
          createTextVNode('Item 2'),
          ChildFlags.HasVNodeChildren,
        ),
      ],
      ChildFlags.HasNonKeyedChildren,
    );

    container.innerHTML =
      '<div><div>Existing DOM content</div><div>Existing DOM content</div><div>Existing DOM content</div></div>';
    hydrate(vNode, container);
    expect(container.innerHTML).toBe(
      '<div class="example"><div>Item 1</div><div>Item 2</div></div>',
    );
  });

  it('Should work with setState', () => {
    class Comp3 extends Component {
      public readonly state = {
        i: 0,
      };

      constructor(props, context) {
        super(props, context);

        this.clicker = this.clicker.bind(this);
      }

      componentWillMount() {
        this.setState({
          i: this.state.i + 1,
        });
      }

      clicker() {
        this.setState({
          i: this.state.i + 1,
        });
      }

      render() {
        return (
          <div>
            {this.state.i}
            <span onClick={this.clicker}>1</span>
          </div>
        );
      }
    }

    const container = document.createElement('div');

    document.body.appendChild(container);
    container.innerHTML = '<div>1<span>1</span></div>';
    hydrate(<Comp3 />, container);
    expect(container.innerHTML).toBe('<div>1<span>1</span></div>');

    container.querySelector('span')!.click();

    expect(container.innerHTML).toBe('<div>2<span>1</span></div>');

    container.querySelector('span')!.click();

    expect(container.innerHTML).toBe('<div>3<span>1</span></div>');

    document.body.removeChild(container);
  });

  describe('Hydration SSR - CSR mismatches', () => {
    [
      {
        description: 'Should hydrate SSR span child as CSR em child',
        SSR: (
          <div>
            <span>Hello world</span>
          </div>
        ),
        SSR_expected: '<div><span>Hello world</span></div>',
        CSR: (
          <div>
            <em>Hello world</em>
          </div>
        ),
        CSR_expected: '<div><em>Hello world</em></div>',
      },
      {
        description:
          'Should hydrate SSR paragraph with sup link as CSR paragraph with span and em',
        SSR: (
          <div>
            <p>
              Hello world
              <sup>
                <a>Foo</a>
              </sup>
            </p>
          </div>
        ),
        SSR_expected: '<div><p>Hello world<sup><a>Foo</a></sup></p></div>',
        CSR: (
          <div>
            <p>
              Hello bar
              <span>
                <em>Foo</em>
              </span>
            </p>
          </div>
        ),
        CSR_expected: '<div><p>Hello bar<span><em>Foo</em></span></p></div>',
      },
      {
        description:
          'Should hydrate SSR div with span expression as CSR em with span expression',
        SSR: <div>{<span>Hello world</span>}</div>,
        SSR_expected: '<div><span>Hello world</span></div>',
        CSR: <em>{<span>Hello 11</span>}</em>,
        CSR_expected: '<em><span>Hello 11</span></em>',
      },
      {
        description:
          'Should hydrate SSR span in span as CSR em with span expression',
        SSR: (
          <div>
            <span>{<span>Hello world</span>}</span>
          </div>
        ),
        SSR_expected: '<div><span><span>Hello world</span></span></div>',
        CSR: <em>{<span>Hello 11</span>}</em>,
        CSR_expected: '<em><span>Hello 11</span></em>',
      },
      {
        description:
          'Should hydrate SSR div text as CSR paragraph with nested elements',
        SSR: <div>Hello world</div>,
        SSR_expected: '<div>Hello world</div>',
        CSR: (
          <div>
            <p>
              Hello bar
              <span>
                <em>Foo</em>
              </span>
            </p>
          </div>
        ),
        CSR_expected: '<div><p>Hello bar<span><em>Foo</em></span></p></div>',
      },
      {
        description:
          'Should hydrate SSR svg as CSR svg with different className and viewBox',
        SSR: (
          <div>
            <svg className={(() => 'foo')()} viewBox="0 0 64 64" />
          </div>
        ),
        SSR_expected: '<div><svg class="foo" viewBox="0 0 64 64"></svg></div>',
        CSR: (
          <div>
            <svg className={(() => 'bar1')()} viewBox="0 0 64 11" />
          </div>
        ),
        CSR_expected: '<div><svg class="bar1" viewBox="0 0 64 11"></svg></div>',
      },
      {
        description:
          'Should hydrate SSR section children as different CSR section children',
        SSR: (
          <Comp4>
            <h1>Hello world</h1>
            <p>
              <em>Foo</em>
            </p>
            <p>Woot</p>
            <p>
              <em>Bar</em>
            </p>
          </Comp4>
        ),
        SSR_expected:
          '<section><h1>Hello world</h1><p><em>Foo</em></p><p>Woot</p><p><em>Bar</em></p></section>',
        CSR: (
          <Comp4>
            <h1>Hello world again!</h1>
            <p>
              <em>{[1, 2, 3]}</em>
            </p>
            <p>{null}</p>
            <p>
              <em>Foo</em>
            </p>
          </Comp4>
        ),
        CSR_expected:
          '<section><h1>Hello world again!</h1><p><em>123</em></p><p></p><p><em>Foo</em></p></section>',
      },
      {
        description:
          'Should hydrate SSR text with string expression as CSR section component',
        SSR: <div>Hello world, {'Foo!'}</div>,
        SSR_expected: '<div>Hello world, Foo!</div>',
        CSR: (
          <Comp4>
            <h1>Hello world again!</h1>
            <p>
              <em>{[1, 2, 3]}</em>
            </p>
            <p>{null}</p>
            <p>
              <em>Foo</em>
            </p>
          </Comp4>
        ),
        CSR_expected:
          '<section><h1>Hello world again!</h1><p><em>123</em></p><p></p><p><em>Foo</em></p></section>',
      },
      {
        description:
          'Should hydrate SSR text with string expression as CSR text with another string',
        SSR: <div>Hello world, {'Foo!'}</div>,
        SSR_expected: '<div>Hello world, Foo!</div>',
        CSR: <div>Hello world, {'BarBar!'}</div>,
        CSR_expected: '<div>Hello world, BarBar!</div>',
      },
      {
        description:
          'Should hydrate SSR text with string array as identical CSR text',
        SSR: <div>Hello world, {['Foo!', 'Bar!']}</div>,
        SSR_expected: '<div>Hello world, Foo!Bar!</div>',
        CSR: <div>Hello world, {['Foo!', 'Bar!']}</div>,
        CSR_expected: '<div>Hello world, Foo!Bar!</div>',
      },
      {
        description:
          'Should hydrate SSR text with null child as CSR text with false child',
        SSR: (
          <div>
            Hello world!
            {null}
          </div>
        ),
        SSR_expected: '<div>Hello world!</div>',
        CSR: (
          <div>
            Hello world!
            {false}
          </div>
        ),
        CSR_expected: '<div>Hello world!</div>',
      },
      {
        description:
          'Should hydrate SSR text with string expressions as CSR text with nested number arrays',
        SSR: (
          <div>
            Hello world, {'1'}2{'3'}
          </div>
        ),
        SSR_expected: '<div>Hello world, 123</div>',
        CSR: (
          <div>
            Hello world, {'1'}2{[3, 4, 5, [6, 7]]}
          </div>
        ),
        CSR_expected: '<div>Hello world, 1234567</div>',
      },
      {
        description:
          'Should hydrate SSR nested divs with ids as CSR div with invalid children and an i element',
        SSR: (
          <div id="1">
            <div id="2">
              <div id="3" />
            </div>
          </div>
        ),
        SSR_expected: '<div id="1"><div id="2"><div id="3"></div></div></div>',
        CSR: (
          <div id="1">
            {[null, false, true, undefined]}
            <i id="2">
              <em>1</em>
              <span id="3" />
            </i>
          </div>
        ),
        CSR_expected:
          '<div id="1"><i id="2"><em>1</em><span id="3"></span></i></div>',
      },
      {
        description:
          'Should hydrate SSR component child as CSR div with invalid children and an i element',
        SSR: (
          <div>
            <Comp1 />
          </div>
        ),
        SSR_expected: '<div><span>Worked!</span></div>',
        CSR: (
          <div id="1">
            {[null, false, true, undefined]}
            <i id="2">
              <em>1</em>
              <span id="3" />
            </i>
          </div>
        ),
        CSR_expected:
          '<div id="1"><i id="2"><em>1</em><span id="3"></span></i></div>',
      },
      {
        description:
          'Should hydrate SSR div with className and component as CSR div with three components',
        SSR: (
          <div className="test">
            <Comp1 />
          </div>
        ),
        SSR_expected: '<div class="test"><span>Worked!</span></div>',
        CSR: (
          <div>
            <Comp1 />
            <Comp1 />
            <Comp1 />
          </div>
        ),
        CSR_expected:
          '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
      },
      {
        description:
          'Should hydrate SSR three components as CSR div with className and one component',
        SSR: (
          <div>
            <Comp1 />
            <Comp1 />
            <Comp1 />
          </div>
        ),
        SSR_expected:
          '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
        CSR: (
          <div className="test">
            <Comp1 />
          </div>
        ),
        CSR_expected: '<div class="test"><span>Worked!</span></div>',
      },
      {
        description:
          'Should hydrate SSR div text as CSR class component A, then patch back and forth to B',
        SSR: <div>foobar</div>,
        SSR_expected: '<div>foobar</div>',
        CSR: <A />,
        CSR_expected: '<span>A</span>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR span child as CSR em child, then patch back and forth to B',
        SSR: (
          <div>
            <span>Hello world</span>
          </div>
        ),
        SSR_expected: '<div><span>Hello world</span></div>',
        CSR: (
          <div>
            <em>Hello world</em>
          </div>
        ),
        CSR_expected: '<div><em>Hello world</em></div>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR paragraph with sup link as CSR paragraph with span and em, then patch back and forth to B',
        SSR: (
          <div>
            <p>
              Hello world
              <sup>
                <a>Foo</a>
              </sup>
            </p>
          </div>
        ),
        SSR_expected: '<div><p>Hello world<sup><a>Foo</a></sup></p></div>',
        CSR: (
          <div>
            <p>
              Hello bar
              <span>
                <em>Foo</em>
              </span>
            </p>
          </div>
        ),
        CSR_expected: '<div><p>Hello bar<span><em>Foo</em></span></p></div>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR div with span expression as CSR em with span expression, then patch back and forth to B',
        SSR: <div>{<span>Hello world</span>}</div>,
        SSR_expected: '<div><span>Hello world</span></div>',
        CSR: <em>{<span>Hello 11</span>}</em>,
        CSR_expected: '<em><span>Hello 11</span></em>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR span in span as CSR em with span expression, then patch back and forth to B',
        SSR: (
          <div>
            <span>{<span>Hello world</span>}</span>
          </div>
        ),
        SSR_expected: '<div><span><span>Hello world</span></span></div>',
        CSR: <em>{<span>Hello 11</span>}</em>,
        CSR_expected: '<em><span>Hello 11</span></em>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR div text as CSR paragraph with nested elements, then patch back and forth to B',
        SSR: <div>Hello world</div>,
        SSR_expected: '<div>Hello world</div>',
        CSR: (
          <div>
            <p>
              Hello bar
              <span>
                <em>Foo</em>
              </span>
            </p>
          </div>
        ),
        CSR_expected: '<div><p>Hello bar<span><em>Foo</em></span></p></div>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR svg as CSR svg with different className and viewBox, then patch back and forth to B',
        SSR: (
          <div>
            <svg className={(() => 'foo')()} viewBox="0 0 64 64" />
          </div>
        ),
        SSR_expected: '<div><svg class="foo" viewBox="0 0 64 64"></svg></div>',
        CSR: (
          <div>
            <svg className={(() => 'bar1')()} viewBox="0 0 64 11" />
          </div>
        ),
        CSR_expected: '<div><svg class="bar1" viewBox="0 0 64 11"></svg></div>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR section children as different CSR section children, then patch back and forth to B',
        SSR: (
          <Comp4>
            <h1>Hello world</h1>
            <p>
              <em>Foo</em>
            </p>
            <p>Woot</p>
            <p>
              <em>Bar</em>
            </p>
          </Comp4>
        ),
        SSR_expected:
          '<section><h1>Hello world</h1><p><em>Foo</em></p><p>Woot</p><p><em>Bar</em></p></section>',
        CSR: (
          <Comp4>
            <h1>Hello world again!</h1>
            <p>
              <em>{[1, 2, 3]}</em>
            </p>
            <p>{null}</p>
            <p>
              <em>Foo</em>
            </p>
          </Comp4>
        ),
        CSR_expected:
          '<section><h1>Hello world again!</h1><p><em>123</em></p><p></p><p><em>Foo</em></p></section>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR text with string expression as CSR section component, then patch back and forth to B',
        SSR: <div>Hello world, {'Foo!'}</div>,
        SSR_expected: '<div>Hello world, Foo!</div>',
        CSR: (
          <Comp4>
            <h1>Hello world again!</h1>
            <p>
              <em>{[1, 2, 3]}</em>
            </p>
            <p>{null}</p>
            <p>
              <em>Foo</em>
            </p>
          </Comp4>
        ),
        CSR_expected:
          '<section><h1>Hello world again!</h1><p><em>123</em></p><p></p><p><em>Foo</em></p></section>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR text with string expression as CSR text with another string, then patch back and forth to B',
        SSR: <div>Hello world, {'Foo!'}</div>,
        SSR_expected: '<div>Hello world, Foo!</div>',
        CSR: <div>Hello world, {'BarBar!'}</div>,
        CSR_expected: '<div>Hello world, BarBar!</div>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR text with string array as identical CSR text, then patch back and forth to B',
        SSR: <div>Hello world, {['Foo!', 'Bar!']}</div>,
        SSR_expected: '<div>Hello world, Foo!Bar!</div>',
        CSR: <div>Hello world, {['Foo!', 'Bar!']}</div>,
        CSR_expected: '<div>Hello world, Foo!Bar!</div>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR text with null child as CSR text with false child, then patch back and forth to B',
        SSR: (
          <div>
            Hello world!
            {null}
          </div>
        ),
        SSR_expected: '<div>Hello world!</div>',
        CSR: (
          <div>
            Hello world!
            {false}
          </div>
        ),
        CSR_expected: '<div>Hello world!</div>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR text with string expressions as CSR text with nested number arrays, then patch back and forth to B',
        SSR: (
          <div>
            Hello world, {'1'}2{'3'}
          </div>
        ),
        SSR_expected: '<div>Hello world, 123</div>',
        CSR: (
          <div>
            Hello world, {'1'}2{[3, 4, 5, [6, 7]]}
          </div>
        ),
        CSR_expected: '<div>Hello world, 1234567</div>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR nested divs with ids as CSR div with invalid children and an i element, then patch back and forth to B',
        SSR: (
          <div id="1">
            <div id="2">
              <div id="3" />
            </div>
          </div>
        ),
        SSR_expected: '<div id="1"><div id="2"><div id="3"></div></div></div>',
        CSR: (
          <div id="1">
            {[null, false, true, undefined]}
            <i id="2">
              <em>1</em>
              <span id="3" />
            </i>
          </div>
        ),
        CSR_expected:
          '<div id="1"><i id="2"><em>1</em><span id="3"></span></i></div>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR component child as CSR div with invalid children and an i element, then patch back and forth to B',
        SSR: (
          <div>
            <Comp1 />
          </div>
        ),
        SSR_expected: '<div><span>Worked!</span></div>',
        CSR: (
          <div id="1">
            {[null, false, true, undefined]}
            <i id="2">
              <em>1</em>
              <span id="3" />
            </i>
          </div>
        ),
        CSR_expected:
          '<div id="1"><i id="2"><em>1</em><span id="3"></span></i></div>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR div with className and component as CSR div with three components, then patch back and forth to B',
        SSR: (
          <div className="test">
            <Comp1 />
          </div>
        ),
        SSR_expected: '<div class="test"><span>Worked!</span></div>',
        CSR: (
          <div>
            <Comp1 />
            <Comp1 />
            <Comp1 />
          </div>
        ),
        CSR_expected:
          '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
        CSR2: <B />,
        CSR2_expected: '<span>B</span>',
      },
      {
        description:
          'Should hydrate SSR three components as CSR div with className and one component, then patch back and forth to a div with B',
        SSR: (
          <div>
            <Comp1 />
            <Comp1 />
            <Comp1 />
          </div>
        ),
        SSR_expected:
          '<div><span>Worked!</span><span>Worked!</span><span>Worked!</span></div>',
        CSR: (
          <div className="test">
            <Comp1 />
          </div>
        ),
        CSR_expected: '<div class="test"><span>Worked!</span></div>',
        CSR2: (
          <div>
            <B />
          </div>
        ),
        CSR2_expected: '<div><span>B</span></div>',
      },
    ].forEach(
      ({
        description,
        SSR,
        CSR,
        CSR2,
        SSR_expected,
        CSR_expected,
        CSR2_expected,
      }) => {
        it(description, () => {
          const ssrString = renderToString(SSR);
          const SsrContainer = createContainerWithHTML(ssrString);

          expect(SsrContainer.innerHTML).toBe(SSR_expected);
          hydrate(CSR, SsrContainer);

          if (CSR2) {
            // Do some repeating here to verify vNodes are correctly set
            render(CSR2, SsrContainer); // patch 2
            expect(SsrContainer.innerHTML).toBe(CSR2_expected);
            render(CSR2, SsrContainer); // patch 2
            expect(SsrContainer.innerHTML).toBe(CSR2_expected);
            render(CSR, SsrContainer); // patch 1
            expect(SsrContainer.innerHTML).toBe(CSR_expected);
            render(CSR2, SsrContainer); // patch 2
            expect(SsrContainer.innerHTML).toBe(CSR2_expected);
          } else {
            expect(SsrContainer.innerHTML).toBe(CSR_expected);
            render(CSR, SsrContainer); // patch 1
            expect(SsrContainer.innerHTML).toBe(CSR_expected);
          }
        });
      },
    );
  });
});
