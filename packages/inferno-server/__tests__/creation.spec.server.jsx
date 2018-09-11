import { renderToStaticMarkup, renderToString } from 'inferno-server';
import { Component, render, createFragment } from 'inferno';
import { createElement } from 'inferno-create-element';
import { ChildFlags } from 'inferno-vnode-flags';
import { hydrate } from 'inferno-hydrate';

function WrappedInput(props) {
  return <input type="text" value={props.value} />;
}

describe('SSR Creation (JSX)', () => {
  const testEntries = [
    {
      description: 'should render a null component',
      template: () => <div>{null}</div>,
      result: '<div></div>'
    },
    {
      description: 'should render a component with null children',
      template: () => (
        <div>
          {null}
          <span>emptyValue: {null}</span>
        </div>
      ),
      result: '<div><span>emptyValue: </span></div>'
    },
    {
      description: 'should render a component with valueless attribute',
      template: () => <script src="foo" async />,
      result: '<script src="foo" async></script>'
    },
    {
      description: 'should render a stateless component with text',
      template: () => (
        <div>
          Hello world, {'1'}2{'3'}
        </div>
      ),
      result: '<div>Hello world, 123</div>'
    },
    {
      description: 'should render text with escaped symbols',
      template: () => <div>"Hello world"</div>,
      result: '<div>&quot;Hello world&quot;</div>'
    },
    {
      description: 'should render a stateless component with comments',
      template: () => <div>Hello world, {/* comment*/}</div>,
      result: '<div>Hello world, </div>'
    },
    {
      description: 'should render mixed invalid/valid children',
      template: () => <div>{[null, '123', null, '456']}</div>,
      result: '<div>123456</div>'
    },
    {
      description: 'should ignore children as props',
      template: () => <p children="foo">foo</p>,
      result: '<p>foo</p>'
    },
    {
      description: 'should render input with value',
      template: () => <input value="bar" />,
      result: '<input value="bar">'
    },
    {
      description: 'should render input with value when defaultValue is present',
      template: () => <input value="bar" defaultValue="foo" />,
      result: '<input value="bar">'
    },
    {
      description: 'should render input when value is not present with defaultValue',
      template: () => <input defaultValue="foo" />,
      result: '<input value="foo">'
    },
    {
      description: 'should render input when defaultValue is number',
      template: () => <input defaultValue={123} />,
      result: '<input value="123">'
    },
    {
      description: 'should render input of type text with value when input is wrapped',
      template: () => <WrappedInput value="foo" />,
      result: '<input type="text" value="foo">'
    },
    {
      description: 'should render select element with selected property',
      template: () => (
        <select value="dog">
          <option value="cat">A cat</option>
          <option value="dog">A dog</option>
        </select>
      ),
      result: '<select value="dog"><option value="cat">A cat</option><option value="dog" selected>A dog</option></select>'
    },
    {
      description: 'should render a text placeholder',
      template: () => (
        <div>
          <div>{''}</div>
          <p>Test</p>
        </div>
      ),
      result: '<div><div> </div><p>Test</p></div>'
    },
    {
      description: 'Should render background color',
      template: () => <div style={{ 'background-color': 'red', 'border-bottom-color': 'green' }} />,
      result: '<div style="background-color:red;border-bottom-color:green;"></div>'
    },
    {
      description: 'Should not render null styles',
      template: () => <div style={{ 'background-color': null, 'border-bottom-color': null }} />,
      result: '<div style=""></div>'
    },
    {
      description: 'Should style attribute if null',
      template: () => <div style={null} />,
      result: '<div></div>'
    },
    {
      description: 'should render div with text child (XSS script attack) #2',
      template: () => createElement('div', null, 'Hello world <img src="x" onerror="alert(\'&XSS&\')">'),
      result: '<div>Hello world &lt;img src=&quot;x&quot; onerror=&quot;alert(&#039;&amp;XSS&amp;&#039;)&quot;&gt;</div>'
    },
    {
      description: 'Should render style opacity #1',
      template: () => <div style={{ opacity: 0.8 }} />,
      result: '<div style="opacity:0.8;"></div>'
    },
    {
      description: 'Should render style opacity #2',
      template: () => <div style="opacity:0.8;" />,
      result: '<div style="opacity:0.8;"></div>'
    },
    {
      description: 'Should render div className as number',
      template: () => <div className={123} />,
      result: '<div class="123"></div>'
    },
    {
      description: 'Should render input defaultValue as number',
      template: () => <input defaultValue={123} />,
      result: '<input value="123">'
    },
    {
      description: 'BR should not be closed',
      template: () => (
        <div>
          <br />
        </div>
      ),
      result: '<div><br></div>'
    }
  ];

  testEntries.forEach(test => {
    it(test.description, () => {
      const container = document.createElement('div');
      const vDom = test.template('foo');
      const output = renderToStaticMarkup(vDom);

      document.body.appendChild(container);
      container.innerHTML = output;
      expect(output).toBe(test.result);
      document.body.removeChild(container);
    });
  });

  describe('Component hook', () => {
    it('Should allow changing state in CWM', () => {
      class Another extends Component {
        constructor(props, context) {
          super(props, context);

          this.state = {
            foo: 'bar'
          };
        }

        componentWillMount() {
          this.setState({
            foo: 'bar2'
          });
        }

        render() {
          return <div>{this.state.foo}</div>;
        }
      }

      class Tester extends Component {
        constructor(props, context) {
          super(props, context);

          this.state = {
            foo: 'bar'
          };
        }

        componentWillMount() {
          this.setState({
            foo: 'bar2'
          });
        }

        render() {
          return (
            <div>
              {this.state.foo}
              <Another />
            </div>
          );
        }
      }

      const container = document.createElement('div');
      const vDom = <Tester />;

      const output = renderToStaticMarkup(vDom);

      document.body.appendChild(container);
      container.innerHTML = output;
      expect(output).toBe('<div>bar2<div>bar2</div></div>');
      document.body.removeChild(container);
    });
  });

  describe('Component string output', () => {
    it('Should render single text node', () => {
      class Foobar extends Component {
        render() {
          return 'foo';
        }
      }

      const output = renderToString(
        <div>
          <Foobar />
        </div>
      );

      expect(output).toBe('<div>foo</div>');
    });

    it('Should render single text node using state', () => {
      class Foobar extends Component {
        render() {
          return this.state.text;
        }

        componentWillMount() {
          this.setState({
            text: 'foo'
          });
        }
      }

      const output = renderToString(
        <div>
          <Foobar />
        </div>
      );

      expect(output).toBe('<div>foo</div>');
    });

    it('Should render single (number)text node using state', () => {
      class Foobar extends Component {
        render() {
          return this.state.text;
        }

        componentWillMount() {
          this.setState({
            text: 33
          });
        }
      }

      const output = renderToString(
        <div>
          <Foobar />
        </div>
      );

      expect(output).toBe('<div>33</div>');
    });

    it('Should render comment when component returns invalid node', () => {
      function Foobar() {
        return null;
      }

      const output = renderToString(
        <div>
          <Foobar />
        </div>
      );

      expect(output).toBe('<div><!--!--></div>');
    });

    it('Should render single text node Class Component', () => {
      class Foobar extends Component {
        render() {
          return null;
        }
      }

      const output = renderToString(
        <div>
          <Foobar />
        </div>
      );

      expect(output).toBe('<div><!--!--></div>');
    });

    it('Should render single text node Functional Component', () => {
      function Foobar() {
        return 'foo';
      }

      const output = renderToString(
        <div>
          <Foobar />
        </div>
      );

      expect(output).toBe('<div>foo</div>');
    });

    it('Should render single (number)text node Functional Component', () => {
      function Foobar() {
        return 2;
      }

      const output = renderToString(
        <div>
          <Foobar />
        </div>
      );

      expect(output).toBe('<div>2</div>');
    });

    it('Should render checked attribute for input when there is no checked in props', () => {
      class Foobar extends Component {
        render() {
          return <input count={1} type="checkbox" defaultChecked={true} />;
        }
      }

      const output = renderToString(
        <div>
          <Foobar />
        </div>
      );

      expect(output).toBe('<div><input count="1" type="checkbox" checked="true"></div>');
    });

    it('Should throw error if invalid object is sent to renderToString', () => {
      expect(() => renderToString({ failure: 'guaranteed' })).toThrow();
      expect(() => renderToString(2)).toThrow();
    });

    it('Should re-use Css property names from cache when its used multiple times', () => {
      expect(
        renderToString(
          <div style={{ 'background-color': 'red' }}>
            <div style={{ 'background-color': 'red' }} />
          </div>
        )
      ).toEqual('<div style="background-color:red;"><div style="background-color:red;"></div></div>');
    });

    it('text nodes should match 1:1 after hydration', () => {
      class LinkComponent extends Component {
        render() {
          return (
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/infernojs/create-inferno-app">
              create-inferno-app
            </a>
          );
        }
      }
      const container = document.createElement('div');
      const version = '4.0.0-21';
      const renderedString = renderToString(
        <div className="built">
          Website built with Inferno {version} using <LinkComponent />
        </div>
      );
      expect(renderedString).toEqual(
        '<div class="built">Website built with Inferno 4.0.0-21 using <a target="_blank" rel="noopener noreferrer" href="https://github.com/infernojs/create-inferno-app">create-inferno-app</a></div>'
      );

      container.innerHTML = renderedString;

      const AnchorNode = container.querySelector('a');
      const wrapperDiv = container.firstChild;

      function WrapperComponent() {
        return (
          <div className="built">
            Website built with Inferno {version} using <LinkComponent />
          </div>
        );
      }

      hydrate(<WrapperComponent />, container);
      expect(container.firstChild).toBe(wrapperDiv);
      expect(wrapperDiv.childNodes.length).toBe(4);
      expect(wrapperDiv.childNodes[0].nodeValue).toBe('Website built with Inferno ');
      expect(wrapperDiv.childNodes[1].nodeValue).toBe('4.0.0-21');
      expect(wrapperDiv.childNodes[2].nodeValue).toBe(' using ');
      expect(wrapperDiv.childNodes[3]).toBe(AnchorNode);
    });

    it('Should be possible to render Fragment #1', () => {
      const vNode = (
        <div>
          {createFragment(
            [<div>Lets go!</div>, null, createFragment([<div>World</div>, 'Of', <em>Fragments</em>], ChildFlags.UnknownChildren), 'text node'],
            ChildFlags.UnknownChildren
          )}
        </div>
      );
      const renderedString = renderToString(vNode);

      expect(renderedString).toBe('<div><div>Lets go!</div><div>World</div>Of<em>Fragments</em>text node</div>');

      const container = document.createElement('div');

      container.innerHTML = renderedString;

      const emTag = container.querySelector('em');

      hydrate(vNode, container);

      expect(container.innerHTML).toBe('<div><div>Lets go!</div><div>World</div>Of<em>Fragments</em>text node</div>');
      expect(container.querySelector('em')).toBe(emTag);
    });

    it('Should be possible to render Fragment #2', () => {
      class Fragmented extends Component {
        render() {
          return createFragment([<div id="m">More</div>, 'Fragments'], ChildFlags.UnknownChildren);
        }
      }

      const vNode = (
        <div>
          {createFragment(
            [
              <div>Lets go!</div>,
              <Fragmented />,
              null,
              createFragment([<div>World</div>, 'Of', <em>Fragments</em>], ChildFlags.UnknownChildren),
              'text node',
              createFragment([null, 'Go', <em>Code</em>], ChildFlags.UnknownChildren)
            ],
            ChildFlags.UnknownChildren
          )}
        </div>
      );
      const renderedString = renderToString(vNode);

      expect(renderedString).toBe('<div><div>Lets go!</div><div id="m">More</div>Fragments<div>World</div>Of<em>Fragments</em>text nodeGo<em>Code</em></div>');

      const container = document.createElement('div');

      container.innerHTML = renderedString;

      const moreDiv = container.querySelector('#m');
      const emTag = container.querySelector('em');

      hydrate(vNode, container);

      expect(container.innerHTML).toBe(
        '<div><div>Lets go!</div><div id="m">More</div>Fragments<div>World</div>Of<em>Fragments</em>text nodeGo<em>Code</em></div>'
      );
      expect(container.querySelector('em')).toBe(emTag);
      expect(container.querySelector('#m')).toBe(moreDiv);
    });

    it('Should be possible to use getDerivedStateFromProps', () => {
      class Test extends Component {
        constructor(props) {
          super(props);

          this.state = {
            value: 0
          };
        }

        static getDerivedStateFromProps(props, state) {
          return {
            value: state.value + 1
          };
        }

        render() {
          return <div>{this.state.value}</div>;
        }
      }

      expect(renderToString(<Test />)).toBe('<div>1</div>');
    });
  });
});
