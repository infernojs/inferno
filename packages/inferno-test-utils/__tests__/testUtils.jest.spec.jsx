import { createElement } from 'inferno-create-element';
import * as TestUtils from 'inferno-test-utils';

const FunctionalComponent = function(props) {
  return createElement('div', props);
};

describe('renderToSnapshot', () => {
  it('should return a snapshot from a valid vNode', () => {
    const snapshot = TestUtils.renderToSnapshot(
      <FunctionalComponent foo="bar" />
    );

    if (usingJest) {
      expect(snapshot).toMatchSnapshot();
    } else {
      expect(snapshot.props.foo).toBeDefined();
      expect(snapshot.props.foo).toBe('bar');
    }
  });

  it('should return a snapshot with className prop', () => {
    const TestComponent = () => <div className="test">Test</div>;

    const snapshot = TestUtils.renderToSnapshot(<TestComponent />);

    if (usingJest) {
      expect(snapshot).toMatchSnapshot();
    } else {
      expect(snapshot.props.className).toBe('test');
    }
  });

  it('should return a snapshot with className prop, multiple children', () => {
    const TestComponent = (props) => <div className="test">{props.children}<span>1</span></div>;

    const snapshot = TestUtils.renderToSnapshot(<TestComponent>
      {[
        <span>a</span>,
        <span>b</span>
      ]}
    </TestComponent>);

    if (usingJest) {
      expect(snapshot).toMatchSnapshot();
    } else {
      expect(snapshot.props.className).toBe('test');
    }
  });
});
