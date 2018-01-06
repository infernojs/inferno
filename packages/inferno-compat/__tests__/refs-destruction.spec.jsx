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
var TestComponent;

describe('refs-destruction', function() {
  beforeEach(function() {
    TestComponent = React.createClass({
      render: function() {
        return (
          <div>
            {this.props.destroy ? null : (
              <div ref="theInnerDiv">Lets try to destroy this.</div>
            )}
          </div>
        );
      }
    });
  });

  it('should remove refs when destroying the parent', function() {
    var container = document.createElement('div');
    var testInstance = ReactDOM.render(<TestComponent />, container);
    expect(testInstance.refs.theInnerDiv.tagName === 'DIV').toBe(true);
    expect(Object.keys(testInstance.refs || {}).length).toEqual(1);
    ReactDOM.unmountComponentAtNode(container);
    expect(testInstance.refs.theInnerDiv).toBeNull();
  });

  it('should remove refs when destroying the child', function() {
    var container = document.createElement('div');
    var testInstance = ReactDOM.render(<TestComponent />, container);
    expect(testInstance.refs.theInnerDiv.tagName === 'DIV').toBe(true);
    expect(Object.keys(testInstance.refs || {}).length).toEqual(1);
    ReactDOM.render(<TestComponent destroy={true} />, container);
    expect(testInstance.refs.theInnerDiv).toBeNull();
  });
});
