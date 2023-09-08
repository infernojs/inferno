import { Component, createElement, render } from 'inferno-compat';

describe('Inferno-compat LifeCycle', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  describe('Order of Es6 Lifecycle with string refs and refs', () => {
    it('Should go as per React', () => {
      // We spy console log to verify order of callbacks
      // React implementation: https://jsfiddle.net/art58y3L/
      spyOn(console, 'log');

      class Hello2 extends Component {
        componentWillMount() {
          console.log('Will mount sub');
        }

        componentDidMount() {
          console.log('Did mount sub');
        }

        componentWillUpdate() {
          console.log('Will update sub');
        }

        componentDidUpdate() {
          console.log('Did update sub');
        }

        render() {
          return createElement(
            'div',
            {
              key: 'S1',
              id: 'S1',
              ref: (el) => {
                console.log('S1' + (el ? el.id : null));
              },
            },
            [
              createElement('div', { key: 'ee' }),
              createElement('div', {
                key: 'S2b',
                id: 'S2b',
                ref: (el) => {
                  console.log('S2b' + (el ? el.id : null));
                },
              }),
            ],
          );
        }
      }

      class Hello extends Component {
        componentWillMount() {
          console.log('Will mount');
        }

        componentDidMount() {
          console.log('Did mount');
        }

        componentWillUpdate() {
          console.log('Will update');
        }

        componentDidUpdate() {
          console.log('Did update');
        }

        render() {
          return createElement(
            'div',
            {
              key: '1',
              id: '1',
              ref: (el) => {
                console.log('1' + (el ? el.id : null));
              },
            },
            [
              createElement(
                'div',
                {
                  key: '2a',
                  id: '2a',
                  ref: (el) => {
                    console.log('2a' + (el ? el.id : null));
                  },
                },
                [
                  createElement(Hello2, { key: 'Hello2' }),
                  createElement('div', { key: 'empt' }, [
                    createElement('div', {
                      key: '4a',
                      id: '4a',
                      ref: (el) => {
                        console.log('4a' + (el ? el.id : null));
                      },
                    }),
                    createElement('div', {
                      key: '4b',
                      id: '4b',
                      ref: (el) => {
                        console.log('4b' + (el ? el.id : null));
                      },
                    }),
                  ]),
                  createElement('div', {
                    key: '3b',
                    id: '3b',
                    ref: (el) => {
                      console.log('3b' + (el ? el.id : null));
                    },
                  }),
                ],
              ),
              createElement(
                'div',
                {
                  key: '2b',
                  id: '2b',
                  ref: (el) => {
                    console.log('2b' + (el ? el.id : null));
                  },
                },
                null,
              ),
            ],
          );
        }
      }

      render(createElement(Hello, { name: 'Inferno' }), container);

      console.log('UPDATE');

      render(createElement(Hello, { name: 'Better Lifecycle' }), container);

      console.log('REMOVAL');

      render(<div />, container);

      expect(console.log).toHaveBeenCalledTimes(42);

      /*
      React oder is:, Inferno will differenciate in string refs because they are handled same way as callback refs
      Will mount
      Will mount sub
      S2bS2b
      S1S1
      Didountsub
      4a4a
      4b4b
      3b3b
      2a2a
      2b2b
      11
      Didmount
      UPDATE
      Willupdate
      Willupdatesub
      S2bnull
      S1null
      4anull
      4bnull
      3bnull
      2anull
      2bnull
      1null
      S2bS2b
      S1S1
      Didupdatesub
      4a4a
      4b4b
      3b3b
      2a2a
      2b2b
      11
      Didupdate
      REMOVAL
      1null
      2anull
      S1null
      S2bnull
      4anull
      4bnull
      3bnull
      2bnull
       */

      // // mount
      let i = -1;

      const calls = console.log.calls;

      expect(calls.argsFor(++i)).toEqual(['Will mount']);
      expect(calls.argsFor(++i)).toEqual(['Will mount sub']);
      expect(calls.argsFor(++i)).toEqual(['S2bS2b']);
      expect(calls.argsFor(++i)).toEqual(['S1S1']);
      expect(calls.argsFor(++i)).toEqual(['Did mount sub']);
      expect(calls.argsFor(++i)).toEqual(['4a4a']);
      expect(calls.argsFor(++i)).toEqual(['4b4b']);
      expect(calls.argsFor(++i)).toEqual(['3b3b']);
      expect(calls.argsFor(++i)).toEqual(['2a2a']);
      expect(calls.argsFor(++i)).toEqual(['2b2b']);
      expect(calls.argsFor(++i)).toEqual(['11']);
      expect(calls.argsFor(++i)).toEqual(['Did mount']);

      // update
      // expect(calls.argsFor(++i)).toEqual(['UPDATE']);
      // expect(calls.argsFor(++i)).toEqual(['Will update']);
      // expect(calls.argsFor(++i)).toEqual(['Will update sub']);
      // expect(calls.argsFor(++i)).toEqual(['S2bnull']);
      // expect(calls.argsFor(++i)).toEqual(['S1null']);
      // expect(calls.argsFor(++i)).toEqual(['4anull']);
      // expect(calls.argsFor(++i)).toEqual(['4bnull']);
      // expect(calls.argsFor(++i)).toEqual(['3bnull']);
      // expect(calls.argsFor(++i)).toEqual(['2anull']);
      // expect(calls.argsFor(++i)).toEqual(['2bnull']);
      // expect(calls.argsFor(++i)).toEqual(['1null']);
      // expect(calls.argsFor(++i)).toEqual(['S2bS2b']);
      // expect(calls.argsFor(++i)).toEqual(['S1S1']);
      // expect(calls.argsFor(++i)).toEqual(['Did update sub']);
      // expect(calls.argsFor(++i)).toEqual(['4a4a']);
      // expect(calls.argsFor(++i)).toEqual(['4b4b']);
      // expect(calls.argsFor(++i)).toEqual(['3b3b']);
      // expect(calls.argsFor(++i)).toEqual(['2a2a']);
      // expect(calls.argsFor(++i)).toEqual(['2b2b']);
      // expect(calls.argsFor(++i)).toEqual(['11']);

      // unmount
      // expect(calls.argsFor(++i)).toEqual(['REMOVAL']);
      // expect(calls.argsFor(++i)).toEqual(['1null']);
      // expect(calls.argsFor(++i)).toEqual(['2anull']);
      // expect(calls.argsFor(++i)).toEqual(['S1null']);
      // expect(calls.argsFor(++i)).toEqual(['S2bnull']);
      // expect(calls.argsFor(++i)).toEqual(['4anull']);
      // expect(calls.argsFor(++i)).toEqual(['4bnull']);
      // expect(calls.argsFor(++i)).toEqual(['3bnull']);
      // expect(calls.argsFor(++i)).toEqual(['2bnull']);
    });
  });
});
