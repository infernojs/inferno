/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

import React from 'inferno-compat';

var ReactDOM = React;

describe('ReactCompositeComponent-state', function () {
  it('should batch unmounts', function () {
    var outer;
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

    class Outer extends React.Component {
      constructor(props) {
        super(props);

        this.state = { showInner: true };
      }

      render() {
        return <div>{this.state.showInner && <Inner />}</div>;
      }
    }

    var container = document.createElement('div');
    outer = ReactDOM.render(<Outer />, container);
    expect(() => {
      ReactDOM.unmountComponentAtNode(container);
    }).not.toThrow();
  });
});
