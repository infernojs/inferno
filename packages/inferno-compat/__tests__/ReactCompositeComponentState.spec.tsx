/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

import React from 'inferno-compat';

const ReactDOM = React;

describe('ReactCompositeComponent-state', function () {
  it('should batch unmounts', function () {
    class Inner extends React.Component {
      render() {
        return <div />;
      }

      componentWillUnmount() {
        // This should get silently ignored (maybe with a warning), but it
        // shouldn't break React.
        outer.setState({ showInner: false });
      }
    }

    interface OuterState {
      showInner: boolean;
    }

    class Outer extends React.Component<object, OuterState> {
      state: OuterState;

      constructor(props: object) {
        super(props);

        this.state = { showInner: true };
      }

      render() {
        return <div>{this.state.showInner && <Inner />}</div>;
      }
    }

    const container = document.createElement('div');
    const outer = ReactDOM.render<Outer>(<Outer />, container)!;
    expect(() => {
      ReactDOM.unmountComponentAtNode(container);
    }).not.toThrow();
  });
});
