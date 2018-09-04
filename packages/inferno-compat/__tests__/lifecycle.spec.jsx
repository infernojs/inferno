import sinon from 'sinon';
import { innerHTML } from 'inferno-utils';
import { Component, render, createElement } from 'inferno-compat';

describe('Inferno-compat LifeCycle', () => {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  describe('Order of Es6 Lifecycle with string refs and refs', () => {
    it('Should go as per React', () => {
      // We spy console log to verify order of callbacks
      // React implementation: https://jsfiddle.net/art58y3L/
      const consoleSpy = sinon.spy(console, 'log');

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
              ref: () => {
                console.log('S1');
              }
            },
            [
              createElement('div', {}),
              createElement('div', {
                ref: () => {
                  console.log('S2b');
                }
              })
            ]
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
              ref: () => {
                console.log('1');
              }
            },
            [
              createElement(
                'div',
                {
                  ref: () => {
                    console.log('2a');
                  }
                },
                [
                  createElement(Hello2, {}),
                  createElement('div', null, [
                    createElement('div', {
                      ref: () => {
                        console.log('4a');
                      }
                    }),
                    createElement('div', {
                      ref: () => {
                        console.log('4b');
                      }
                    })
                  ]),
                  createElement('div', {
                    ref: () => {
                      console.log('3b');
                    }
                  })
                ]
              ),
              createElement(
                'div',
                {
                  ref: () => {
                    console.log('2b');
                  }
                },
                null
              )
            ]
          );
        }
      }

      render(createElement(Hello, { name: 'Inferno' }), container);

      console.log('UPDATE');

      render(createElement(Hello, { name: 'Better Lifecycle' }), container);

      console.log('REMOVAL');

      render(<div />, container);

      const array = consoleSpy.getCalls();
      expect(array.length).toEqual(42);

      /*
      React oder is:, Inferno will differenciate in string refs because they are handled same way as callback refs
      Will mount
      Will mount sub
      S2b stringRef
      S1 stringRef
      Did mount sub stringRef
      4a null
      4b null
      3b stringRef
      2a stringRef
      2b stringRef
      1 stringRef
      Did mount stringRef
      UPDATE
      Will update stringRef
      Will update sub stringRef
      S2b stringRef
      S1 stringRef
      4a stringRef
      4b stringRef
      3b stringRef
      2a stringRef
      2b stringRef
      1 stringRef
      S2b stringRef
      S1 stringRef
      Did update sub stringRef
      4a stringRef
      4b stringRef
      3b stringRef
      2a stringRef
      2b stringRef
      1 stringRef
      Did update stringRef
      REMOVAL
      1 stringRef
      2a stringRef
      S1 stringRef
      S2b null
      4a null
      4b null
      3b null
      2b null
       */
      
      // // mount
      let i = -1;
      expect(array[++i].args).toEqual(['Will mount']);
      expect(array[++i].args).toEqual(['Will mount sub']);
      expect(array[++i].args).toEqual(['S2b']);
      expect(array[++i].args).toEqual(['S1']);
      expect(array[++i].args).toEqual(['Did mount sub']);
      expect(array[++i].args).toEqual(['4a']);
      expect(array[++i].args).toEqual(['4b']);
      expect(array[++i].args).toEqual(['3b']);
      expect(array[++i].args).toEqual(['2a']);
      expect(array[++i].args).toEqual(['2b']);
      expect(array[++i].args).toEqual(['1']);
      expect(array[++i].args).toEqual(['Did mount']);

      // update
      expect(array[++i].args).toEqual(['UPDATE']);
      expect(array[++i].args).toEqual(['Will update']);
      expect(array[++i].args).toEqual(['Will update sub']);
      expect(array[++i].args).toEqual(['S2b']);
      expect(array[++i].args).toEqual(['S2b']);
      expect(array[++i].args).toEqual(['S1']);
      expect(array[++i].args).toEqual(['S1']);
      expect(array[++i].args).toEqual(['4a']);
      expect(array[++i].args).toEqual(['4a']);
      expect(array[++i].args).toEqual(['4b']);
      expect(array[++i].args).toEqual(['4b']);
      expect(array[++i].args).toEqual(['3b']);
      expect(array[++i].args).toEqual(['3b']);
      expect(array[++i].args).toEqual(['2a']);
      expect(array[++i].args).toEqual(['2a']);
      expect(array[++i].args).toEqual(['2b']);
      expect(array[++i].args).toEqual(['2b']);
      expect(array[++i].args).toEqual(['1']);
      expect(array[++i].args).toEqual(['1']);
      expect(array[++i].args).toEqual(['Did update sub']);
      expect(array[++i].args).toEqual(['Did update']);

      // unmount
      expect(array[++i].args).toEqual(['REMOVAL']);
      expect(array[++i].args).toEqual(['1']);
      expect(array[++i].args).toEqual(['2a']);
      expect(array[++i].args).toEqual(['S1']);
      expect(array[++i].args).toEqual(['S2b']);
      expect(array[++i].args).toEqual(['4a']);
      expect(array[++i].args).toEqual(['4b']);
      expect(array[++i].args).toEqual(['3b']);
      expect(array[++i].args).toEqual(['2b']);
    });
  });
});
