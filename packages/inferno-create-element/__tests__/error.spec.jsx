import { Component, render, rerender } from 'inferno';
import { innerHTML } from 'inferno-utils';

describe('Error recovery', () => {
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

  it('Should be possible to render again if user land code crashes in CWM', () => {
    class Crasher extends Component {
      constructor(props, context) {
        super(props, context);

        this.state = {
          value: 1
        };
      }

      componentWillMount() {
        if (this.props.crash) {
          throw Error('test');
        }

        this.setState({
          value: 2
        });
      }

      render() {
        return <div>{this.state.value}</div>;
      }
    }

    try {
      render(<Crasher crash={true} />, container);
    } catch (ex) {
      expect(ex.message).toBe('test');
    }

    render(<Crasher crash={false} />, container);
    expect(container.firstChild.innerHTML).toBe('2');
  });

  it('Should be possible to render again if user land code crashes in ComponentWillUnmount', () => {
    class Crasher extends Component {
      constructor(props, context) {
        super(props, context);

        this.state = {
          value: 1
        };
      }

      componentWillUnmount() {
        if (this.props.crash) {
          throw Error('test');
        }
      }

      render() {
        return <div>{this.state.value}</div>;
      }
    }

    render(<Crasher crash={true} />, container);

    expect(container.firstChild.innerHTML).toBe('1');

    try {
      render(null, container);
    } catch (ex) {
      expect(ex.message).toBe('test');
    }

    // No change as it crashed
    expect(container.firstChild.innerHTML).toBe('1');

    // Try update
    render(<Crasher crash={false} />, container);

    expect(container.firstChild.innerHTML).toBe('1');

    // Should not crash now
    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  /*
   * THROW ERROR IN
   *
   * last  node - render - willMount, didMount, willUpdate, didUpdate, constructor, cwrp
   * mid   node - render - willMount, didMount, willUpdate, didUpdate, constructor, cwrp
   * first node - render - willMount, didMount, willUpdate, didUpdate, constructor, cwrp
   *
   * force keyed? force non keyed?
   */

  describe('Error recovery from user land errors', () => {
    ['last', 'mid', 'first'].forEach(location => {
      ['render', 'constructor', 'DidMount', 'WillMount', 'WillReceiveProps', 'shouldUpdate', 'WillUpdate', 'DidUpdate', 'getChildContext'].forEach(
        crashLocation => {
          it('Should recover from subtree crash in ' + location + ' of children when crash happens in components ' + crashLocation, () => {
            class Crasher extends Component {
              constructor(props, context) {
                super(props, context);

                this.state = {
                  value: ''
                };

                if (props.crash && crashLocation === 'constructor') {
                  throw Error('test');
                }
              }

              componentWillMount() {
                this.setState({
                  value: 'mounted'
                });

                if (this.props.crash && crashLocation === 'WillMount') {
                  throw Error('test');
                }
              }

              componentWillReceiveProps(props) {
                if (props.crash && crashLocation === 'WillReceiveProps') {
                  throw Error('test');
                }
              }

              componentDidMount() {
                if (this.props.crash && crashLocation === 'DidMount') {
                  throw Error('test');
                }
              }

              shouldComponentUpdate(props) {
                if (props.crash && crashLocation === 'shouldUpdate') {
                  throw Error('test');
                }
              }

              componentWillUpdate() {
                if (this.props.crash && crashLocation === 'WillUpdate') {
                  throw Error('test');
                }
              }

              componentDidUpdate() {
                if (this.props.crash && crashLocation === 'DidUpdate') {
                  throw Error('test');
                }
              }

              // Unmount hook is still an issue
              // componentWillUnmount() {
              //     if (this.props.crash && crashLocation === 'WillUnmount') {
              //         throw Error('test');
              //     }
              // }

              getChildContext() {
                if (this.props.crash && crashLocation === 'getChildContext') {
                  throw Error('test');
                }

                return {};
              }

              render() {
                if (this.props.crash && crashLocation === 'render') {
                  throw Error('test');
                }

                return <div>{this.state.value}</div>;
              }
            }

            function TreeOfCrashers({ suffle, crash }) {
              let arr = [];

              if (location === 'first') {
                arr.push(<Crasher crash={crash} />);
              }

              if (suffle) {
                arr.push(<span>1</span>);
                if (location === 'mid') {
                  arr.push(<Crasher crash={crash} />);
                }
                arr.push(<Crasher crash={false} />);
              } else {
                if (location === 'mid') {
                  arr.push(<Crasher crash={crash} />);
                }
                arr.push(<Crasher crash={false} />);
              }

              if (location === 'last') {
                arr.push(<Crasher crash={crash} />);
              }

              return <div>{arr}</div>;
            }

            render(<TreeOfCrashers crash={false} />, container);

            try {
              render(<TreeOfCrashers suffle={true} crash={true} />, container);
            } catch (ex) {
              // do nothing
            }

            render(<TreeOfCrashers crash={false} />, container);

            expect(container.firstChild.innerHTML).toBe('<div>mounted</div><div>mounted</div>');
          });
        }
      );
    });

    ['last', 'mid', 'first'].forEach(location => {
      ['render', 'constructor', 'DidMount', 'WillMount', 'WillReceiveProps', 'shouldUpdate', 'WillUpdate', 'DidUpdate', 'getChildContext'].forEach(
        crashLocation => {
          it('Should recover from subtree crash in NON-KEYED ' + location + ' of children when crash happens in components ' + crashLocation, () => {
            class Crasher extends Component {
              constructor(props, context) {
                super(props, context);

                this.state = {
                  value: ''
                };

                if (props.crash && crashLocation === 'constructor') {
                  throw Error('test');
                }
              }

              componentWillMount() {
                this.setState({
                  value: 'mounted'
                });

                if (this.props.crash && crashLocation === 'WillMount') {
                  throw Error('test');
                }
              }

              componentWillReceiveProps(props) {
                if (props.crash && crashLocation === 'WillReceiveProps') {
                  throw Error('test');
                }
              }

              componentDidMount() {
                if (this.props.crash && crashLocation === 'DidMount') {
                  throw Error('test');
                }
              }

              shouldComponentUpdate(props) {
                if (props.crash && crashLocation === 'shouldUpdate') {
                  throw Error('test');
                }
              }

              componentWillUpdate() {
                if (this.props.crash && crashLocation === 'WillUpdate') {
                  throw Error('test');
                }
              }

              componentDidUpdate() {
                if (this.props.crash && crashLocation === 'DidUpdate') {
                  throw Error('test');
                }
              }

              // Unmount hook is still an issue
              // componentWillUnmount() {
              //     if (this.props.crash && crashLocation === 'WillUnmount') {
              //         throw Error('test');
              //     }
              // }

              getChildContext() {
                if (this.props.crash && crashLocation === 'getChildContext') {
                  throw Error('test');
                }

                return {};
              }

              render() {
                if (this.props.crash && crashLocation === 'render') {
                  throw Error('test');
                }

                return <div>{this.state.value}</div>;
              }
            }

            function TreeOfCrashers({ suffle, crash }) {
              let arr = [];

              if (location === 'first') {
                arr.push(<Crasher crash={crash} />);
              }

              if (suffle) {
                arr.push(<span>1</span>);
                if (location === 'mid') {
                  arr.push(<Crasher crash={crash} />);
                }
                arr.push(<Crasher crash={false} />);
              } else {
                if (location === 'mid') {
                  arr.push(<Crasher crash={crash} />);
                }
                arr.push(<Crasher crash={false} />);
              }

              if (location === 'last') {
                arr.push(<Crasher crash={crash} />);
              }

              return <div $HasNonKeyedChildren>{arr}</div>;
            }

            render(<TreeOfCrashers crash={false} />, container);

            try {
              render(<TreeOfCrashers suffle={true} crash={true} />, container);
            } catch (ex) {
              // do nothing
            }

            render(<TreeOfCrashers crash={false} />, container);

            expect(container.firstChild.innerHTML).toBe('<div>mounted</div><div>mounted</div>');
          });
        }
      );
    });

    ['last', 'mid', 'first'].forEach(location => {
      ['render', 'constructor', 'DidMount', 'WillMount', 'WillReceiveProps', 'shouldUpdate', 'WillUpdate', 'DidUpdate', 'getChildContext'].forEach(
        crashLocation => {
          it('Should recover from subtree crash in NON-KEYED ' + location + ' of children when crash happens in components ' + crashLocation, () => {
            class Crasher extends Component {
              constructor(props, context) {
                super(props, context);

                this.state = {
                  value: ''
                };

                if (props.crash && crashLocation === 'constructor') {
                  throw Error('test');
                }
              }

              componentWillMount() {
                this.setState({
                  value: 'mounted'
                });

                if (this.props.crash && crashLocation === 'WillMount') {
                  throw Error('test');
                }
              }

              componentWillReceiveProps(props) {
                if (props.crash && crashLocation === 'WillReceiveProps') {
                  throw Error('test');
                }
              }

              componentDidMount() {
                if (this.props.crash && crashLocation === 'DidMount') {
                  throw Error('test');
                }
              }

              shouldComponentUpdate(props) {
                if (props.crash && crashLocation === 'shouldUpdate') {
                  throw Error('test');
                }
              }

              componentWillUpdate() {
                if (this.props.crash && crashLocation === 'WillUpdate') {
                  throw Error('test');
                }
              }

              componentDidUpdate() {
                if (this.props.crash && crashLocation === 'DidUpdate') {
                  throw Error('test');
                }
              }

              // Unmount hook is still an issue
              // componentWillUnmount() {
              //     if (this.props.crash && crashLocation === 'WillUnmount') {
              //         throw Error('test');
              //     }
              // }

              getChildContext() {
                if (this.props.crash && crashLocation === 'getChildContext') {
                  throw Error('test');
                }

                return {};
              }

              render() {
                if (this.props.crash && crashLocation === 'render') {
                  throw Error('test');
                }

                return <div>{this.state.value}</div>;
              }
            }

            function TreeOfCrashers({ suffle, crash }) {
              let arr = [];

              if (location === 'first') {
                arr.push(<Crasher key="first" crash={crash} />);
              }

              if (suffle) {
                arr.push(<span key="span">1</span>);
                if (location === 'mid') {
                  arr.push(<Crasher key="mid" crash={crash} />);
                }
                arr.push(<Crasher key="false-suffle" crash={false} />);
              } else {
                if (location === 'mid') {
                  arr.push(<Crasher key="mid" crash={crash} />);
                }
                arr.push(<Crasher key="true-suffle" crash={false} />);
              }

              if (location === 'last') {
                arr.push(<Crasher key="last" crash={crash} />);
              }

              return <div $HasKeyedChildren>{arr}</div>;
            }

            render(<TreeOfCrashers crash={false} />, container);

            try {
              render(<TreeOfCrashers suffle={true} crash={true} />, container);
            } catch (ex) {
              // do nothing
            }

            render(<TreeOfCrashers crash={false} />, container);

            expect(container.firstChild.innerHTML).toBe('<div>mounted</div><div>mounted</div>');
          });
        }
      );
    });

    describe('Error in child component', () => {
      it('Should not block future updates', done => {
        let parentInstance = null;
        let childCrasherInstance = null;

        class BadComponent extends Component {
          constructor(props) {
            super(props);
          }

          componentWillMount() {
            throw 'Oops!';
          }

          render() {
            return 1;
          }
        }

        class ChildCrasher extends Component {
          constructor(props) {
            super(props);

            this.state = {
              fail: false
            };

            childCrasherInstance = this; // For the sake of test
          }

          render() {
            if (!this.state.fail) {
              return null;
            }

            return <BadComponent />;
          }
        }

        class Parent extends Component {
          constructor(props) {
            super(props);

            parentInstance = this; // For the sake of test
          }

          render() {
            return (
              <div>
                <ChildCrasher />
              </div>
            );
          }
        }

        render(<Parent />, container);

        expect(container.innerHTML).toBe('<div></div>');

        expect(() => {
          childCrasherInstance.setState({
            fail: true
          });
          rerender();
        }).toThrow('Oops!');

        // Recover from it
        childCrasherInstance.setState({
          fail: false
        });

        setTimeout(function() {
          expect(container.innerHTML).toBe('<div></div>');
          done();
        }, 10);
      });

      it('Should not block future updates - variation 2', () => {
        let parentInstance = null;
        let childCrasherInstance = null;

        class BadComponent extends Component {
          constructor(props) {
            super(props);

            throw 'Oops!';
          }

          render() {
            return <div>Ok</div>;
          }
        }

        class ChildCrasher extends Component {
          constructor(props) {
            super(props);

            childCrasherInstance = this; // For the sake of test
          }

          render() {
            if (!this.props.fail) {
              return null;
            }

            return (
              <div>
                <span>1</span>
                <BadComponent />
              </div>
            );
          }
        }

        class Parent extends Component {
          constructor(props) {
            super(props);

            this.state = {
              nodes: false
            };

            parentInstance = this; // For the sake of test
          }

          render() {
            return (
              <div>
                <span>1</span>
                {this.nodes ? <div>2</div> : null}
                <ChildCrasher fail={this.props.fail} />
              </div>
            );
          }
        }

        expect(() => render(<Parent fail={true} />, container)).toThrow('Oops!');

        expect(() => render(<Parent fail={true} />, container)).toThrow('Oops!');

        parentInstance.setState({
          nodes: true
        });
        rerender();

        expect(container.innerHTML).toEqual('');

        render(<Parent fail={false} />, container);

        expect(() => render(<Parent fail={true} />, container)).toThrow('Oops!');

        expect(() => {
          parentInstance.setState({
            nodes: false
          });
          rerender();
        }).toThrow('Oops!');

        expect(() => {
          parentInstance.setState({
            nodes: true
          });
          rerender();
        }).toThrow('Oops!');
      });
    });
  });
});
