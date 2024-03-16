import { Component, render } from 'inferno';
import { createElement } from 'inferno-create-element';
import { streamAsStaticMarkup } from 'inferno-server';
import concatStream from 'concat-stream';

describe('SSR Root Creation Streams - (non-JSX)', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    document.body.removeChild(container);
  });

  it('should throw with invalid children', async () => {
    const test = (value) => createElement('a', null, true);

    return await streamPromise(test('foo')).catch((err) => {
      expect(err.toString()).toBe('Error: invalid component');
    });
  });

  it('should use getChildContext', async () => {
    class TestComponent extends Component {
      getChildContext() {
        return { hello: 'world' };
      }

      render() {
        return createElement('a', null, this.context.hello);
      }
    }

    await streamPromise(createElement(TestComponent, null)).then(
      function (output) {
        expect(output).toBe('<a>world</a>');
      },
    );
  });

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
          return createElement('div', null, this.state.foo);
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
          return createElement('div', null, [
            this.state.foo,
            createElement(Another),
          ]);
        }
      }

      const vDom = createElement(Tester);
      await streamPromise(vDom).then(function (output) {
        expect(output).toBe('<div>bar2<div>bar2</div></div>');
      });
    });
  });
});

async function streamPromise(dom) {
  return await new Promise(function (res, rej) {
    streamAsStaticMarkup(dom)
      .on('error', rej)
      .pipe(
        concatStream(function (buffer) {
          res(buffer.toString('utf-8'));
        }),
      );
  });
}
