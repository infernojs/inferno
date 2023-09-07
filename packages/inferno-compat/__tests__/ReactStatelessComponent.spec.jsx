/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails react-core
 */

import React from 'inferno-compat';
import { createComponentVNode } from 'inferno';
import { Wrapper } from 'inferno-test-utils';
import { VNodeFlags } from 'inferno-vnode-flags';

var ReactDOM = React;

function StatelessComponent(props) {
  return <div>{props.name}</div>;
}

describe('ReactStatelessComponent', function () {
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

  it('should render stateless component', function () {
    var el = document.createElement('div');
    ReactDOM.render(<StatelessComponent name="A" />, el);

    expect(el.textContent).toBe('A');
  });

  it('should update stateless component', function () {
    class Parent extends React.Component {
      render() {
        return <StatelessComponent {...this.props} />;
      }
    }

    var el = document.createElement('div');
    ReactDOM.render(<Parent name="A" />, el);
    expect(el.textContent).toBe('A');

    ReactDOM.render(<Parent name="B" />, el);
    expect(el.textContent).toBe('B');
  });

  it('should unmount stateless component', function () {
    var container = document.createElement('div');

    ReactDOM.render(<StatelessComponent name="A" />, container);
    expect(container.textContent).toBe('A');

    ReactDOM.unmountComponentAtNode(container);
    expect(container.textContent).toBe('');
  });

  it('should pass context thru stateless component', function () {
    class Child extends React.Component {
      static contextTypes = {
        test: React.PropTypes.string.isRequired
      }

      render() {
        return <div>{this.context.test}</div>;
      }
    }

    function Parent() {
      return <Child />;
    }

    class GrandParent extends React.Component {
      static childContextTypes = {
        test: React.PropTypes.string.isRequired
      }

      getChildContext() {
        return { test: this.props.test };
      }

      render() {
        return <Parent />;
      }
    }

    var el = document.createElement('div');
    ReactDOM.render(<GrandParent test="test" />, el);

    expect(el.textContent).toBe('test');

    ReactDOM.render(<GrandParent test="mest" />, el);

    expect(el.textContent).toBe('mest');
  });

  it('should warn when stateless component returns array', function () {
    spyOn(console, 'error');
    function NotAComponent() {
      return [<div />, <div />];
    }
    expect(function () {
      React.render(
        <div>
          <NotAComponent />
        </div>
      );
    }).toThrow();
  });

  it('should receive context', function () {
    class Parent extends React.Component {
      static childContextTypes = {
        lang: React.PropTypes.string
      }
      getChildContext() {
        return { lang: 'en' };
      }
      render() {
        return <Child />;
      }
    }

    function Child(props, context) {
      return <div>{context.lang}</div>;
    }
    Child.contextTypes = { lang: React.PropTypes.string };

    var el = document.createElement('div');
    ReactDOM.render(<Parent />, el);
    expect(el.textContent).toBe('en');
  });

  it('should work with arrow functions', function () {
    var Child = function () {
      return <div />;
    };
    // Will create a new bound function without a prototype, much like a native
    // arrow function.
    Child = Child.bind(this);

    expect(() => renderIntoDocument(<Child />)).not.toThrow();
  });

  it('should allow simple functions to return null', function () {
    var Child = function () {
      return null;
    };
    expect(() => renderIntoDocument(<Child />)).not.toThrow();
  });

  it('should allow simple functions to return false', function () {
    function Child() {
      return false;
    }
    expect(() => renderIntoDocument(<Child />)).not.toThrow();
  });
});
