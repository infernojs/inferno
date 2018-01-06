import { Component } from 'inferno';
import { streamAsString } from 'inferno-server';
import concatStream from 'concat-stream-es6';
import { createElement } from 'inferno-create-element';

class StatefulComponent extends Component {
  render() {
    return createElement('span', null, `stateless ${this.props.value}!`);
  }
}

function WrappedInput(props) {
  return <input type="text" value={props.value} />;
}

const FunctionalComponent = ({ value }) =>
  createElement('span', null, `stateless ${value}!`);

describe('SSR Creation Streams - (non-JSX)', () => {
  const testEntries = [
    {
      description: 'should render div with span child',
      template: () => createElement('div', null, createElement('span', null)),
      result: '<div><span></span></div>'
    },
    {
      description: 'should render div with span child and styling',
      template: () =>
        createElement(
          'div',
          null,
          createElement('span', { style: 'border-left: 10px;' })
        ),
      result: '<div><span style="border-left: 10px;"></span></div>'
    },
    // TODO: Fix this
    // {
    //   description: "should render select element with selected property",
    //   template: () =>
    //     createElement('select', {
    //       value: 'dog'
    //     }, [
    //       createElement('option', {value: 'cat'}, 'A cat'),
    //       createElement('option', {value: 'dog'}, 'A dog')
    //     ]),
    //   result: '<select value="dog"><option value="cat">A cat</option><option value="dog" selected>A dog</option></select>'
    // },
    {
      description: 'should render div with span child and styling #2',
      template: () =>
        createElement(
          'div',
          null,
          createElement('span', { style: { borderLeft: 10 } })
        ),
      result: '<div><span style="border-left:10px;"></span></div>'
    },
    {
      description: 'should render div with span child and styling #3',
      template: () =>
        createElement(
          'div',
          null,
          createElement('span', { style: { fontFamily: 'Arial' } })
        ),
      result: '<div><span style="font-family:Arial;"></span></div>'
    },
    {
      description: 'should render div with span child (with className)',
      template: () =>
        createElement(
          'div',
          { className: 'foo' },
          createElement('span', { className: 'bar' })
        ),
      result: '<div class="foo"><span class="bar"></span></div>'
    },
    {
      description: 'should render div with text child #2',
      template: () => createElement('div', null, 'Hello world'),
      result: '<div>Hello world</div>'
    },
    {
      description: 'should render div with text child (XSS script attack)',
      template: () =>
        createElement(
          'div',
          null,
          'Hello world <img src="x" onerror="alert(\'XSS\')">'
        ),
      result:
        '<div>Hello world &lt;img src=&quot;x&quot; onerror=&quot;alert(&#039;XSS&#039;)&quot;&gt;</div>'
    },
    {
      description: 'should render div with text children',
      template: () => createElement('div', null, 'Hello', ' world'),
      result: '<div>Hello<!----> world</div>'
    },
    {
      description: 'should render a void element correct',
      template: () => createElement('input', null),
      result: '<input>'
    },
    {
      description: 'should render div with node children',
      template: () =>
        createElement(
          'div',
          null,
          createElement('span', null, 'Hello'),
          createElement('span', null, ' world!')
        ),
      result: '<div><span>Hello</span><span> world!</span></div>'
    },
    {
      description: 'should render div with node children #2',
      template: () =>
        createElement(
          'div',
          null,
          createElement('span', { id: '123' }, 'Hello'),
          createElement('span', { className: 'foo' }, ' world!')
        ),
      result:
        '<div><span id="123">Hello</span><span class="foo"> world!</span></div>'
    },
    {
      description: 'should render div with falsy children',
      template: () => createElement('div', null, 0),
      result: '<div>0</div>'
    },
    {
      description: 'should render div with dangerouslySetInnerHTML',
      template: () =>
        createElement('div', {
          dangerouslySetInnerHTML: { __html: '<span>test</span>' }
        }),
      result: '<div><span>test</span></div>'
    },
    {
      description: 'should render a stateful component',
      template: value =>
        createElement('div', null, createElement(StatefulComponent, { value })),
      result: '<div><span>stateless foo!</span></div>'
    },
    {
      description: 'should render a stateless component',
      template: value =>
        createElement(
          'div',
          null,
          createElement(FunctionalComponent, { value })
        ),
      result: '<div><span>stateless foo!</span></div>'
    },
    {
      description: 'should render a stateless component with object props',
      template: value => createElement('a', { [value]: true }),
      result: '<a foo></a>'
    },
    {
      description: 'should render with array text children',
      template: value => createElement('a', null, ['a', 'b']),
      result: '<a>a<!---->b</a>'
    },
    {
      description:
        'should render with array children containing an array of text children',
      template: value => createElement('a', null, [['a', 'b']]),
      result: '<a>a<!---->b</a>'
    },
    {
      description: 'should render with array null children',
      template: value => createElement('a', null, ['a', null]),
      result: '<a>a</a>'
    },
    {
      description: 'should ignore null className',
      template: () => createElement('div', { className: null }),
      result: '<div></div>'
    },
    {
      description: 'should ignore undefined className',
      template: () => createElement('div', { className: undefined }),
      result: '<div></div>'
    },
    {
      description: 'should render opacity style',
      template: () => createElement('div', { style: { opacity: 0.8 } }),
      result: '<div style="opacity:0.8;"></div>'
    },
    {
      description: 'Should render div className as number',
      template: () => createElement('div', { className: 123 }),
      result: '<div class="123"></div>'
    },
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
      result: '<div>Hello world, <!---->1<!---->2<!---->3</div>'
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
      result: '<div>123<!---->456</div>'
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
      description:
        'should render input with value when defaultValue is present',
      template: () => <input value="bar" defaultValue="foo" />,
      result: '<input value="bar">'
    },
    {
      description:
        'should render input when value is not present with defaultValue',
      template: () => <input defaultValue="foo" />,
      result: '<input value="foo">'
    },
    {
      description: 'should render input when defaultValue is number',
      template: () => <input defaultValue={123} />,
      result: '<input value="123">'
    },
    {
      description:
        'should render input of type text with value when input is wrapped',
      template: () => <WrappedInput value="foo" />,
      result: '<input type="text" value="foo">'
    },
    // {
    //   description: 'should render select element with selected property',
    //   template: () => (
    //     <select value="dog">
    //       <option value="cat">A cat</option>
    //       <option value="dog">A dog</option>
    //     </select>
    //   ),
    //   result:
    //     '<select value="dog"><option value="cat">A cat</option><option value="dog" selected>A dog</option></select>'
    // },
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
      description: 'Should render backgroundColor',
      template: () => (
        <div style={{ backgroundColor: 'red', borderBottomColor: 'green' }} />
      ),
      result:
        '<div style="background-color:red;border-bottom-color:green;"></div>'
    },
    {
      description: 'Should not render null styles',
      template: () => (
        <div style={{ backgroundColor: null, borderBottomColor: null }} />
      ),
      result:
        '<div style=""></div>'
    },
    {
      description: 'Should style attribute if null',
      template: () => (
        <div style={null} />
      ),
      result:
        '<div></div>'
    },
    {
      description: 'should render div with text child (XSS script attack) #2',
      template: () =>
        createElement(
          'div',
          null,
          'Hello world <img src="x" onerror="alert(\'&XSS&\')">'
        ),
      result:
        '<div>Hello world &lt;img src=&quot;x&quot; onerror=&quot;alert(&#039;&amp;XSS&amp;&#039;)&quot;&gt;</div>'
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
      return streamPromise(vDom).then(function(output) {
        document.body.appendChild(container);
        container.innerHTML = output;
        expect(output).toBe(test.result);
        document.body.removeChild(container);
      });
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

      const vDom = <Tester />;
      return streamPromise(vDom).then(function(output) {
        const container = document.createElement('div');
        document.body.appendChild(container);
        container.innerHTML = output;
        expect(output).toBe('<div>bar2<div>bar2</div></div>');
        document.body.removeChild(container);
      });
    });
  });

  describe('misc', () => {
    it('Should render single text node using state', done => {
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

      return streamPromise(
        <div>
          <Foobar />
        </div>
      ).then(function(output) {
        expect(output).toEqual('<div>foo</div>');
        done();
      });
    });

    it('Should render single (number) text node using state', done => {
      class Foobar extends Component {
        render() {
          return this.state.text;
        }

        componentWillMount() {
          this.setState({
            text: 331
          });
        }
      }

      return streamPromise(
        <div>
          <Foobar />
        </div>
      ).then(function(output) {
        expect(output).toEqual('<div>331</div>');
        done();
      });
    });

    it('Should render single text node Functional Component', done => {
      function Foobar() {
        return 'foo';
      }

      return streamPromise(
        <div>
          <Foobar />
        </div>
      ).then(function(output) {
        expect(output).toEqual('<div>foo</div>');
        done();
      });
    });

    it('Should render single (number) text node Functional Component', done => {
      function Foobar() {
        return 0;
      }

      return streamPromise(
        <div>
          <Foobar />
        </div>
      ).then(function(output) {
        expect(output).toEqual('<div>0</div>');
        done();
      });
    });

    // it('Should render checked attribute for input when there is no checked in props', (done) => {
    //   class Foobar extends Component {
    //     render() {
    //       return <input count={1} type="checkbox" defaultChecked={true}/>;
    //     }
    //   }
    //
    //   return streamPromise(<div><Foobar /></div>).then(function(output) {
    //     expect(output).toEqual('<div><input count="1" type="checkbox" checked="true"></div>');
    //     done();
    //   });
    // });

    it('Should render comment when component returns invalid node', done => {
      function Foobar() {
        return null;
      }

      return streamPromise(
        <div>
          <Foobar />
        </div>
      ).then(function(output) {
        expect(output).toEqual('<div><!--!--></div>');
        done();
      });
    });

    it('Should render single text node Class Component', done => {
      class Foobar extends Component {
        render() {
          return null;
        }
      }

      return streamPromise(
        <div>
          <Foobar />
        </div>
      ).then(function(output) {
        expect(output).toEqual('<div><!--!--></div>');
        done();
      });
    });
  });
});

function streamPromise(dom) {
  return new Promise(function(res, rej) {
    streamAsString(dom)
      .on('error', rej)
      .pipe(
        concatStream(function(buffer) {
          res(buffer.toString('utf-8'));
        })
      );
  });
}
