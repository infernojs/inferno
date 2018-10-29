import { Component, Fragment, createFragment } from 'inferno';
import { renderToSnapshot } from 'inferno-test-utils';
import { ChildFlags } from 'inferno-vnode-flags';

describe('Snapshots', () => {
  class Foobar extends Component {
    render({ children }) {
      return <div className="Testing">{children}</div>;
    }
  }

  function Testing({ children }) {
    return (
      <span>
        {children}
        Extra
      </span>
    );
  }

  describe('JSX', () => {
    if (window.usingJest) {
      it('Should render attributes and className', () => {
        expect(renderToSnapshot(<Foobar />)).toMatchSnapshot();
      });

      it('Should render component children', () => {
        expect(
          renderToSnapshot(
            <Foobar>
              <div className="ok">ABC</div>
            </Foobar>
          )
        ).toMatchSnapshot();
      });

      it('Should render html element', () => {
        expect(
          renderToSnapshot(
            <a onClick={() => {}} aria-colspan="3" className="foo">
              Bar
            </a>
          )
        ).toMatchSnapshot();
      });

      it('Should render multiple elements', () => {
        expect(
          renderToSnapshot(
            <Testing>
              <a>T</a>
              <span className="foo">est</span>
              12
            </Testing>
          )
        ).toMatchSnapshot();
      });

      it('Should render deeper component', () => {
        class ComP extends Component {
          render() {
            return (
              <div>
                Okay
                {this.props.children}
                <span className="yea" />
              </div>
            );
          }
        }

        expect(
          renderToSnapshot(
            <div className="okay" aria-rowindex={1} onClick={() => console.log}>
              <ComP>
                <div>
                  <ul>
                    <li>Okay</li>
                  </ul>
                </div>
              </ComP>
            </div>
          )
        ).toMatchSnapshot();
      });

      it('Should render fragment', () => {
        const fragmentA = createFragment([<div id="a1">A1</div>, <div>A2</div>], ChildFlags.HasNonKeyedChildren, 'A');

        const fragmentB = createFragment([<div id="b1">B1</div>], ChildFlags.HasNonKeyedChildren, 'B');

        const fragmentC = createFragment([<div id="c1">C1</div>, <div>C2</div>, <div>C3</div>], ChildFlags.HasNonKeyedChildren, 'C');

        expect(
          renderToSnapshot(
            <div>
              {fragmentA}
              {fragmentB}
              {fragmentC}
            </div>
          )
        ).toMatchSnapshot();
      });

      it('Should render fragment root', () => {
        expect(
          renderToSnapshot(
            <Fragment>
              <div>First</div>
              <div>Second</div>
            </Fragment>
          )
        ).toMatchSnapshot();
      });

      it('Should render fragment from component root', () => {
        class Comp extends Component {
          render() {
            return <>{this.props.children}</>;
          }
        }

        expect(
          renderToSnapshot(
            <Comp>
              <div>1</div>
            </Comp>
          )
        ).toMatchSnapshot();
      });

      it('Should not fail when returning children array from component root, which contains text node. Github #1404', () => {
        const Label = ({ label, htmlFor, children, optional = false, ...props }) => {
          if (optional && !label) {
            return children;
          }
          return (
            <>
              <label {...props} htmlFor={htmlFor}>
                {label}
              </label>
              {children}
            </>
          );
        };
        expect(renderToSnapshot(<Label>{[<span>o</span>, <span>k</span>, 'asd', 1, null, false, true, void 0]}</Label>)).toMatchSnapshot();
      });

      it('Should not fail when returning children array from component root, Github #1404', () => {
        const Label = ({ label, htmlFor, children, optional = false, ...props }) => {
          if (optional && !label) {
            return children;
          }

          return (
            <>
              <label {...props} htmlFor={htmlFor}>
                {label}
              </label>
              {children}
            </>
          );
        };

        expect(renderToSnapshot(<Label>{[<span>o</span>, <span>k</span>]}</Label>)).toMatchSnapshot();
      });

      it('Should flush setStates before building snapshot', () => {
        class App extends Component {
          constructor(props) {
            super(props);

            this.state = {
              foo: ''
            };
          }

          componentDidMount() {
            this.setState({
              foo: '##BAR##'
            });
          }

          render() {
            return (
              <div className="App">
                <header className="App-header">
                  <img src="logo" className="App-logo" alt="logo" />
                  <p>
                    Edit <code>src/App.js</code> and save to reload.
                  </p>
                  <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
                    {this.state.foo}
                  </a>
                </header>
              </div>
            );
          }
        }

        expect(renderToSnapshot(<App />)).toMatchSnapshot();
      });
    }
  });
});
