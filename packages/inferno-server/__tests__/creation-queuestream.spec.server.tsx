import { Component } from 'inferno';
import { streamQueueAsString } from 'inferno-server';

import concatStream from 'concat-stream';
import { createElement } from 'inferno-create-element';

class StatefulComponent extends Component<{ value: string }> {
  render() {
    return createElement('span', null, `stateless ${this.props.value}!`);
  }
}

function WrappedInput(props) {
  return <input type="text" value={props.value} />;
}

class StatefulPromiseComponent extends Component<{
  index: number;
  value?: unknown;
}> {
  async getInitialProps() {
    return await new Promise((resolve) => {
      // Waits incremenetally for each subindex
      setTimeout(() => {
        resolve({
          value: 'I waited long enough!',
        });
      }, 5 * this.props.index);
    });
  }

  render() {
    return createElement(
      'span',
      null,
      `Stateless Item ${this.props.index}: ${this.props.value}`,
    );
  }
}

class StatefulHierchicalPromiseComponent extends Component<{
  index: number;
  value?: unknown;
}> {
  async getInitialProps() {
    return await new Promise((resolve) => {
      // Waits incremenetally for each subindex
      setTimeout(() => {
        resolve({
          value: `I waited long enough for ${this.props.index}!`,
        });
      }, 0);
    });
  }

  render() {
    if (this.props.index > 4) {
      return createElement(
        'span',
        null,
        `Final Stateless Item ${this.props.index}: ${this.props.value}`,
      );
    } else {
      return createElement(
        'div',
        { className: 'child' },
        `Stateless Item ${this.props.index}: ${this.props.value}`,
        createElement(StatefulHierchicalPromiseComponent, {
          index: this.props.index + 1,
        }),
      );
    }
  }
}

const FunctionalComponent = ({ value }) =>
  createElement('span', null, `stateless ${value}!`);

describe('SSR Creation Queue Streams - (non-JSX)', () => {
  const testEntries = [
    {
      description: 'should render div with span child',
      template: () => createElement('div', null, createElement('span', null)),
      result: '<div><span></span></div>',
    },
    {
      description: 'should render div with span child and styling',
      template: () =>
        createElement(
          'div',
          null,
          createElement('span', { style: 'border-left: 10px;' }),
        ),
      result: '<div><span style="border-left: 10px;"></span></div>',
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
          createElement('span', { style: { 'border-left': '10px' } }),
        ),
      result: '<div><span style="border-left:10px;"></span></div>',
    },
    {
      description: 'should render div with span child and styling #3',
      template: () =>
        createElement(
          'div',
          null,
          createElement('span', { style: { 'font-family': 'Arial' } }),
        ),
      result: '<div><span style="font-family:Arial;"></span></div>',
    },
    {
      description: 'should render div with span child (with className)',
      template: () =>
        createElement(
          'div',
          { className: 'foo' },
          createElement('span', { className: 'bar' }),
        ),
      result: '<div class="foo"><span class="bar"></span></div>',
    },
    {
      description: 'should render div with text child #1',
      template: () => createElement('div', null, 'Hello world'),
      result: '<div>Hello world</div>',
    },
    {
      description: 'should render div with text child (XSS script attack)',
      template: () =>
        createElement(
          'div',
          null,
          'Hello world <img src="x" onerror="alert(\'XSS\')">',
        ),
      result:
        '<div>Hello world &lt;img src=&quot;x&quot; onerror=&quot;alert(&#039;XSS&#039;)&quot;&gt;</div>',
    },
    {
      description: 'should render div with text children',
      template: () => createElement('div', null, 'Hello', ' world'),
      result: '<div>Hello world</div>',
    },
    {
      description: 'should render a void element correct',
      template: () => createElement('input', null),
      result: '<input>',
    },
    {
      description: 'should render div with node children',
      template: () =>
        createElement(
          'div',
          null,
          createElement('span', null, 'Hello'),
          createElement('span', null, ' world!'),
        ),
      result: '<div><span>Hello</span><span> world!</span></div>',
    },
    {
      description: 'should render div with node children #2',
      template: () =>
        createElement(
          'div',
          null,
          createElement('span', { id: '123' }, 'Hello'),
          createElement('span', { className: 'foo' }, ' world!'),
        ),
      result:
        '<div><span id="123">Hello</span><span class="foo"> world!</span></div>',
    },
    {
      description: 'should render div with falsy children',
      template: () => createElement('div', null, 0),
      result: '<div>0</div>',
    },
    {
      description: 'should render div with dangerouslySetInnerHTML',
      template: () =>
        createElement('div', {
          dangerouslySetInnerHTML: { __html: '<span>test</span>' },
        }),
      result: '<div><span>test</span></div>',
    },
    {
      description: 'should render a stateless component',
      template: (value) =>
        createElement(
          'div',
          null,
          createElement(FunctionalComponent, { value }),
        ),
      result: '<div><span>stateless foo!</span></div>',
    },
    {
      description: 'should render a div with styles',
      template: () =>
        createElement('div', { style: { display: 'block', width: '50px' } }),
      result: '<div style="display:block;width:50px;"></div>',
    },
    {
      description: 'should ignore null className',
      template: () => createElement('div', { className: null }),
      result: '<div></div>',
    },
    {
      description: 'should ignore undefined className',
      template: () => createElement('div', { className: undefined }),
      result: '<div></div>',
    },
    {
      description: 'should render a stateful component',
      template: (value) =>
        createElement('div', null, createElement(StatefulComponent, { value })),
      result: '<div><span>stateless foo!</span></div>',
    },
    // Following tests check for not only concatenated output, but chunked streams
    {
      description: 'should render a stateless component',
      template: (value) =>
        createElement(
          'div',
          null,
          createElement(FunctionalComponent, { value }),
        ),
      result: [
        ['<div>', '<span>', 'stateless foo!', '</span>', '</div>'],
        '<div><span>stateless foo!</span></div>',
      ],
    },
    {
      description: 'should render a stateful component with promise',
      template: () =>
        createElement(
          'div',
          null,
          createElement(StatefulPromiseComponent, { index: 1 }),
        ),
      result: [
        [
          '<div>',
          '<span>Stateless Item 1: I waited long enough!</span>',
          '</div>',
        ],
        '<div><span>Stateless Item 1: I waited long enough!</span></div>',
      ],
    },
    {
      description:
        'should render a stateful component with promise as hierarchy',
      template: () =>
        createElement(StatefulHierchicalPromiseComponent, { index: 1 }),
      result: [
        [
          '<div class="child">Stateless Item 1: I waited long enough for 1!',
          '<div class="child">Stateless Item 2: I waited long enough for 2!',
          '<div class="child">Stateless Item 3: I waited long enough for 3!',
          '<div class="child">Stateless Item 4: I waited long enough for 4!',
          '<span>Final Stateless Item 5: I waited long enough for 5!</span>',
          '</div>',
          '</div>',
          '</div>',
          '</div>',
        ],
        '<div class="child">Stateless Item 1: I waited long enough for 1!<div class="child">Stateless Item 2: I waited long enough for 2!<div class="child">Stateless Item 3: I waited long enough for 3!<div class="child">Stateless Item 4: I waited long enough for 4!<span>Final Stateless Item 5: I waited long enough for 5!</span></div></div></div></div>',
      ],
    },
    {
      description: 'should render a stack of stateful component with promise',
      template: () =>
        createElement(
          'div',
          null,
          createElement(StatefulPromiseComponent, { index: 1 }),
          createElement(StatefulPromiseComponent, { index: 2 }),
          createElement(StatefulPromiseComponent, { index: 3 }),
        ),
      result: [
        [
          '<div>',
          '<span>Stateless Item 1: I waited long enough!</span>',
          '<span>Stateless Item 2: I waited long enough!</span>',
          '<span>Stateless Item 3: I waited long enough!</span>',
          '</div>',
        ],
        '<div><span>Stateless Item 1: I waited long enough!</span><span>Stateless Item 2: I waited long enough!</span><span>Stateless Item 3: I waited long enough!</span></div>',
      ],
    },
    {
      description: 'should render opacity style',
      template: () => createElement('div', { style: { opacity: 0.8 } }),
      result: '<div style="opacity:0.8;"></div>',
    },
    {
      description: 'Should render div className as number',
      template: () => createElement('div', { className: 123 }),
      result: '<div class="123"></div>',
    },
    {
      description: 'Should render input defaultValue as number',
      template: () => createElement('input', { defaultValue: 123 }),
      result: '<input value="123">',
    },
    // JSX
    {
      description: 'should render a null component',
      template: () => <div>{null}</div>,
      result: '<div></div>',
    },
    {
      description: 'should render a component with null children',
      template: () => (
        <div>
          {null}
          <span>emptyValue: {null}</span>
        </div>
      ),
      result: '<div><span>emptyValue: </span></div>',
    },
    {
      description: 'should render a component with valueless attribute',
      template: () => <script src="foo" async />,
      result: '<script src="foo" async></script>',
    },
    {
      description: 'should render a stateless component with text',
      template: () => (
        <div>
          Hello world, {'1'}2{'3'}
        </div>
      ),
      result: '<div>Hello world, 123</div>',
    },
    {
      description: 'should render text with escaped symbols',
      template: () => <div>"Hello world"</div>,
      result: '<div>&quot;Hello world&quot;</div>',
    },
    {
      description: 'should render a stateless component with comments',
      template: () => <div>Hello world, {/* comment */}</div>,
      result: '<div>Hello world, </div>',
    },
    {
      description: 'should render mixed invalid/valid children',
      template: () => <div>{[null, '123', null, '456']}</div>,
      result: '<div>123456</div>',
    },
    {
      description: 'should ignore children as props',
      // @ts-expect-error
      template: () => <p children="foo">foo</p>,
      result: '<p>foo</p>',
    },
    {
      description: 'should render input with value',
      template: () => <input value="bar" />,
      result: '<input value="bar">',
    },
    {
      description:
        'should render input with value when defaultValue is present',
      template: () => <input value="bar" defaultValue="foo" />,
      result: '<input value="bar">',
    },
    {
      description:
        'should render input when value is not present with defaultValue',
      template: () => <input defaultValue="foo" />,
      result: '<input value="foo">',
    },
    {
      description: 'should render input when defaultValue is number',
      template: () => <input defaultValue={123} />,
      result: '<input value="123">',
    },
    {
      description:
        'should render input of type text with value when input is wrapped',
      template: () => <WrappedInput value="foo" />,
      result: '<input type="text" value="foo">',
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
      result: '<div><div> </div><p>Test</p></div>',
    },
    {
      description: 'Should render background color',
      template: () => (
        <div
          style={{ 'background-color': 'red', 'border-bottom-color': 'green' }}
        />
      ),
      result:
        '<div style="background-color:red;border-bottom-color:green;"></div>',
    },
    {
      description: 'Should not render null styles',
      template: () => (
        <div
          style={{
            'background-color': null as any,
            'border-bottom-color': null as any,
          }}
        />
      ),
      result: '<div></div>',
    },
    {
      description: 'Should style attribute if null',
      template: () => <div style={null} />,
      result: '<div></div>',
    },
    {
      description: 'should render div with text child (XSS script attack) #2',
      template: () =>
        createElement(
          'div',
          null,
          'Hello world <img src="x" onerror="alert(\'&XSS&\')">',
        ),
      result:
        '<div>Hello world &lt;img src=&quot;x&quot; onerror=&quot;alert(&#039;&amp;XSS&amp;&#039;)&quot;&gt;</div>',
    },
    {
      description: 'Should render style opacity #1',
      template: () => <div style={{ opacity: 0.8 }} />,
      result: '<div style="opacity:0.8;"></div>',
    },
    {
      description: 'Should not render empty style attribute #1',
      template: () => <div style={{}} />,
      result: '<div></div>',
    },
    {
      description: 'Should not render empty style attribute #2',
      template: () => <div style={null} />,
      result: '<div></div>',
    },
    {
      description: 'Should not render empty style attribute #3',
      template: () => <div style={false as any} />,
      result: '<div></div>',
    },
    {
      description: 'Should not render empty style attribute #4',
      template: () => <div style={0 as any} />,
      result: '<div></div>',
    },
    {
      description: 'Should not render empty style attribute #5',
      template: () => <div style={true as any} />,
      result: '<div></div>',
    },
    {
      description: 'Should render style opacity #2',
      template: () => <div style="opacity:0.8;" />,
      result: '<div style="opacity:0.8;"></div>',
    },
    {
      description: 'Should render div className as number',
      template: () => <div className={123 as any} />,
      result: '<div class="123"></div>',
    },
    {
      description: 'Should render input defaultValue as number',
      template: () => <input defaultValue={123} />,
      result: '<input value="123">',
    },
    {
      description: 'BR should not be closed',
      template: () => (
        <div>
          <br />
        </div>
      ),
      result: '<div><br></div>',
    },
    {
      description: 'You should be able to render an array',
      template: () => [<p>1</p>, <p>2</p>, <p>3</p>],
      result: '<p>1</p><p>2</p><p>3</p>',
    },
    {
      description: 'You should be able to render an empty array',
      template: () => [],
      result: '<!--!-->',
    },
    {
      description: 'You should be able to render a fragment',
      template: () => (
        <>
          <p>1</p>
          <p>2</p>
          <p>3</p>
        </> /* reset syntax highlighting */
      ),
      result: '<p>1</p><p>2</p><p>3</p>',
    },
    {
      description: 'You should be able to render an empty fragment',
      template: () => <></> /* reset syntax highlighting */,
      result: '<!--!-->',
    },
    {
      description: 'You should be able to render fragment with single child',
      template: () => (
        // @ts-ignore
        <>
          <p>1</p>
        </>
      ) /* reset syntax highlighting */,
      result: '<p>1</p>',
    },
  ];

  for (const test of testEntries) {
    it(test.description, async () => {
      const vDom = test.template('foo');

      return streamPromise(vDom).then((value: string | string[]) => {
        if (typeof test.result === 'object') {
          expect(value[0]).toEqual(test.result[0]);
          expect(value[1]).toBe(test.result[1]);
        } else {
          expect(value[1]).toBe(test.result);
        }
      });
    });
  }

  describe('Component hook', () => {
    it('Should allow changing state in CWM', async () => {
      class Another extends Component {
        constructor(props, context) {
          super(props, context);

          this.state = {
            foo: 'bar',
          };
        }

        componentWillMount() {
          this.setState({
            foo: 'bar2',
          });
        }

        render() {
          return <div>{this.state?.foo}</div>;
        }
      }

      class Tester extends Component {
        constructor(props, context) {
          super(props, context);

          this.state = {
            foo: 'bar',
          };
        }

        componentWillMount() {
          this.setState({
            foo: 'bar2',
          });
        }

        render() {
          return (
            <div>
              {this.state?.foo}
              <Another />
            </div>
          );
        }
      }

      const vDom = <Tester />;
      await streamPromise(vDom).then(function (output) {
        expect(output[1]).toBe('<div>bar2<div>bar2</div></div>');
      });
    });
  });

  describe('misc', () => {
    it('Should render single text node using state', async () => {
      class Foobar extends Component {
        render() {
          return this.state!.text;
        }

        componentWillMount() {
          this.setState({
            text: 'foo',
          });
        }
      }

      return await streamPromise(
        <div>
          <Foobar />
        </div>,
      ).then(function (output) {
        expect(output[1]).toEqual('<div>foo</div>');
      });
    });

    it('Should render single (number) text node using state', async () => {
      class Foobar extends Component {
        render() {
          return this.state!.text;
        }

        componentWillMount() {
          this.setState({
            text: 331,
          });
        }
      }

      return await streamPromise(
        <div>
          <Foobar />
        </div>,
      ).then(function (output) {
        expect(output[1]).toEqual('<div>331</div>');
      });
    });

    it('Should render single text node Functional Component', async () => {
      function Foobar() {
        return 'foo';
      }

      return await streamPromise(
        <div>
          <Foobar />
        </div>,
      ).then(function (output) {
        expect(output[1]).toEqual('<div>foo</div>');
      });
    });

    it('Should render single (number) text node Functional Component', async () => {
      function Foobar() {
        return 0;
      }

      return await streamPromise(
        <div>
          <Foobar />
        </div>,
      ).then(function (output) {
        expect(output[1]).toEqual('<div>0</div>');
      });
    });

    it('Should render checked attribute for input when there is no checked in props', async () => {
      class Foobar extends Component {
        render() {
          // @ts-expect-error
          // eslint-disable-next-line inferno/no-unknown-property
          return <input count={1} type="checkbox" defaultChecked={true} />;
        }
      }

      return await streamPromise(
        <div>
          <Foobar />
        </div>,
      ).then(function (output) {
        expect(output[1]).toEqual(
          '<div><input count="1" type="checkbox" checked="true"></div>',
        );
      });
    });

    it('Should render comment when component returns invalid node', async () => {
      function Foobar() {
        return null;
      }

      return await streamPromise(
        <div>
          <Foobar />
        </div>,
      ).then(function (output) {
        expect(output[1]).toEqual('<div><!--!--></div>');
      });
    });

    it('Should render single text node Class Component', async () => {
      class Foobar extends Component {
        render() {
          return null;
        }
      }

      return await streamPromise(
        <div>
          <Foobar />
        </div>,
      ).then(function (output) {
        expect(output[1]).toEqual('<div><!--!--></div>');
      });
    });

    it('Should be possible to use getDerivedStateFromProps', async () => {
      class Test extends Component {
        constructor(props) {
          super(props);

          this.state = {
            value: 0,
          };
        }

        static getDerivedStateFromProps(_props, state) {
          return {
            value: state.value + 1,
          };
        }

        render() {
          return <div>{this.state!.value}</div>;
        }
      }

      return await streamPromise(<Test />).then(function (output) {
        expect(output[1]).toEqual('<div>1</div>');
      });
    });
  });
});

async function streamPromise(dom) {
  return await new Promise(function (res: (value: string[]) => void, rej) {
    const chunks: string[] = [];
    streamQueueAsString(dom)
      .on('error', rej)
      .on('data', (chunk) => {
        chunks.push(chunk.toString());
      })
      .pipe(
        concatStream(function (buffer) {
          res([chunks, buffer.toString('utf-8')]);
        }),
      );
  });
}
