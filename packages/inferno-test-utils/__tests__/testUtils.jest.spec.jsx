import { render } from "inferno";
import Component from "inferno-component";
import createClass from "inferno-create-class";
import createElement from "inferno-create-element";
import TestUtils from "inferno-test-utils";

const FunctionalComponent = function(props) {
  return createElement("div", props);
};

describe("renderToSnapshot", () => {
  it("should return a snapshot from a valid vNode", () => {
    const snapshot = TestUtils.renderToSnapshot(
      <FunctionalComponent foo="bar" />
    );
    expect(snapshot.props).toHaveProperty("foo");
    expect(snapshot.props.foo).toBe("bar");
    expect(snapshot).toMatchSnapshot();
  });
});
