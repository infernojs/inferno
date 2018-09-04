/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

import React from 'inferno-compat';
import { createComponentVNode } from 'inferno';
import { Wrapper } from 'inferno-test-utils';
import { VNodeFlags } from 'inferno-vnode-flags';

var ReactDOM = React;

describe('Render Select with multiple values', function() {
  let container;

  function renderIntoDocument(input) {
    return React.render(createComponentVNode(VNodeFlags.ComponentClass, Wrapper, { children: input }), container);
  }

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    React.render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  class Component extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = { selectedValue: [1, 3, 4] };
    }

    render() {
      return (
        <div>
          <select value={this.state.selectedValue} id="selectNode" multiple>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
          {this.state.selectedValue}
        </div>
      );
    }
  }

  it('should mark correct option as selected', function() {
    var instance = renderIntoDocument(<Component />);
    var root = ReactDOM.findDOMNode(instance);
    expect(root.childNodes[0].options[0].selected).toBe(true);
    expect(root.childNodes[0].options[1].selected).toBe(false);
    expect(root.childNodes[0].options[2].selected).toBe(true);
    expect(root.childNodes[0].options[3].selected).toBe(true);
  });
});

describe('Render Select with single value', function() {
  let container;
  function renderIntoDocument(input) {
    return React.render(createComponentVNode(VNodeFlags.ComponentClass, Wrapper, { children: input }), container);
  }

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    React.render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  class Component extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = { selectedValue: 2 };
    }

    render() {
      return (
        <div>
          <select value={this.state.selectedValue} id="selectNode">
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
          {this.state.selectedValue}
        </div>
      );
    }
  }

  it('should mark correct option as selected', function() {
    var instance = renderIntoDocument(<Component />);
    var root = ReactDOM.findDOMNode(instance);

    expect(root.childNodes[0].options[0].selected).toBe(false);
    expect(root.childNodes[0].options[1].selected).toBe(true);
    expect(root.childNodes[0].options[2].selected).toBe(false);
    expect(root.childNodes[0].options[3].selected).toBe(false);
  });
});
