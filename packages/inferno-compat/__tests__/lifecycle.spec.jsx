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
          console.log('Did mount sub', this.refs['S2a'] ? 'stringRef' : null);
        }

        componentWillUpdate() {
          console.log('Will update sub', this.refs['S2a'] ? 'stringRef' : null);
        }

        componentDidUpdate() {
          console.log('Did update sub', this.refs['S2a'] ? 'stringRef' : null);
        }

        render() {
          return createElement(
            'div',
            {
              ref: () => {
                console.log('S1', this.refs['S2a'] ? 'stringRef' : null);
              }
            },
            [
              createElement('div', { ref: 'S2a' }),
              createElement('div', {
                ref: () => {
                  console.log('S2b', this.refs['S2a'] ? 'stringRef' : null);
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
          console.log('Did mount', this.refs['3a'] ? 'stringRef' : null);
        }

        componentWillUpdate() {
          console.log('Will update', this.refs['3a'] ? 'stringRef' : null);
        }

        componentDidUpdate() {
          console.log('Did update', this.refs['3a'] ? 'stringRef' : null);
        }

        render() {
          return createElement(
            'div',
            {
              ref: () => {
                console.log('1', this.refs['3a'] ? 'stringRef' : null);
              }
            },
            [
              createElement(
                'div',
                {
                  ref: () => {
                    console.log('2a', this.refs['3a'] ? 'stringRef' : null);
                  }
                },
                [
                  createElement(Hello2, {}, null),
                  createElement('div', { ref: '3a' }, [
                    createElement('div', {
                      ref: () => {
                        console.log('4a', this.refs['3a'] ? 'stringRef' : null);
                      }
                    }),
                    createElement('div', {
                      ref: () => {
                        console.log('4b', this.refs['3a'] ? 'stringRef' : null);
                      }
                    })
                  ]),
                  createElement('div', {
                    ref: () => {
                      console.log('3b', this.refs['3a'] ? 'stringRef' : null);
                    }
                  })
                ]
              ),
              createElement(
                'div',
                {
                  ref: () => {
                    console.log('2b', this.refs['3a'] ? 'stringRef' : null);
                  }
                },
                null
              )
            ]
          );
        }
      }

      render(createElement(Hello, { name: 'Inferno' }, null), container);

      console.log('UPDATE');

      render(createElement(Hello, { name: 'Better Lifecycle' }, null), container);

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
      expect(array[++i].args).toEqual(['S2b', 'stringRef']);
      expect(array[++i].args).toEqual(['S1', 'stringRef']);
      expect(array[++i].args).toEqual(['Did mount sub', 'stringRef']);
      expect(array[++i].args).toEqual(['4a', null]);
      expect(array[++i].args).toEqual(['4b', null]);
      expect(array[++i].args).toEqual(['3b', 'stringRef']);
      expect(array[++i].args).toEqual(['2a', 'stringRef']);
      expect(array[++i].args).toEqual(['2b', 'stringRef']);
      expect(array[++i].args).toEqual(['1', 'stringRef']);
      expect(array[++i].args).toEqual(['Did mount', 'stringRef']);

      // update
      expect(array[++i].args).toEqual(['UPDATE']);
      expect(array[++i].args).toEqual(['Will update', 'stringRef']);
      expect(array[++i].args).toEqual(['Will update sub', 'stringRef']);
      expect(array[++i].args).toEqual(['S2b', 'stringRef']);
      expect(array[++i].args).toEqual(['S2b', 'stringRef']);
      expect(array[++i].args).toEqual(['S1', 'stringRef']);
      expect(array[++i].args).toEqual(['S1', 'stringRef']);
      expect(array[++i].args).toEqual(['4a', 'stringRef']);
      expect(array[++i].args).toEqual(['4a', 'stringRef']);
      expect(array[++i].args).toEqual(['4b', 'stringRef']);
      expect(array[++i].args).toEqual(['4b', 'stringRef']);
      expect(array[++i].args).toEqual(['3b', 'stringRef']);
      expect(array[++i].args).toEqual(['3b', 'stringRef']);
      expect(array[++i].args).toEqual(['2a', 'stringRef']);
      expect(array[++i].args).toEqual(['2a', 'stringRef']);
      expect(array[++i].args).toEqual(['2b', 'stringRef']);
      expect(array[++i].args).toEqual(['2b', 'stringRef']);
      expect(array[++i].args).toEqual(['1', 'stringRef']);
      expect(array[++i].args).toEqual(['1', 'stringRef']);
      expect(array[++i].args).toEqual(['Did update sub', 'stringRef']);
      expect(array[++i].args).toEqual(['Did update', 'stringRef']);

      // unmount
      expect(array[++i].args).toEqual(['REMOVAL']);
      expect(array[++i].args).toEqual(['1', 'stringRef']);
      expect(array[++i].args).toEqual(['2a', 'stringRef']);
      expect(array[++i].args).toEqual(['S1', 'stringRef']);
      expect(array[++i].args).toEqual(['S2b', null]);
      expect(array[++i].args).toEqual(['4a', null]);
      expect(array[++i].args).toEqual(['4b', null]);
      expect(array[++i].args).toEqual(['3b', null]);
      expect(array[++i].args).toEqual(['2b', null]);
    });
  });
});
