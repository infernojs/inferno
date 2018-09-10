import { Component } from 'inferno';
import { renderToSnapshot } from "inferno-test-utils";

describe('Snapshots', () => {
  class Foobar extends Component {
    render({children}) {
      return (
        <div className="Testing">
          {children}
        </div>
      );
    }
  }

  function Testing({children}) {
    return <span>{children}Extra</span>
  }

  describe('JSX', () => {
    if (window.usingJest) {
      it('Should render attributes and className', () => {
        expect(renderToSnapshot(<Foobar/>)).toMatchSnapshot();
      });

      it('Should render component children', () => {
        expect(renderToSnapshot(<Foobar><div className="ok">ABC</div></Foobar>)).toMatchSnapshot();
      });

      it('Should render html element', () => {
        expect(renderToSnapshot(<a onClick={() => {}} aria-colspan="3" className="foo">Bar</a>)).toMatchSnapshot();
      });

      it('Should render multiple elements', () => {
        expect(renderToSnapshot(<Testing><a>T</a><span className="foo">est</span>12</Testing>)).toMatchSnapshot();
      });

      it('Should render deeper component', () => {
        class ComP extends Component {
          render() {
            return <div>Okay{this.props.children}<span className="yea"/></div>
          }
        }

        expect(renderToSnapshot(
          <div className="okay" aria-rowindex={1} onClick={() => console.log}>
            <ComP>
              <div>
                <ul>
                  <li>Okay</li>
                </ul>
              </div>
            </ComP>
          </div>
        )).toMatchSnapshot();
      });
    }
  });
});
