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
var mocks;

describe('ReactComponent', function () {
  let container;

  function renderIntoDocument(input) {
    return React.render(createComponentVNode(VNodeFlags.ComponentClass, Wrapper, { children: input }), container);
  }

  beforeEach(() => {
    mocks = {
      getMockFunction: function () {
        return jasmine.createSpy();
      }
    };
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    React.render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('should throw on invalid render targets', function () {
    var container = document.createElement('div');
    // jQuery objects are basically arrays; people often pass them in by mistake
    expect(function () {
      ReactDOM.render(<div />, [container]);
    }).toThrow();

    expect(function () {
      ReactDOM.render(<div />, null);
    }).toThrow();
  });

  it('should support new-style refs', function () {
    var innerObj = {};
    var outerObj = {};

    class Wrapper extends React.Component {
      getObject() {
        return this.props.object;
      }
      render() {
        return <div>{this.props.children}</div>;
      }
    }

    var mounted = false;
    class Component extends React.Component {
      render() {
        var inner = <Wrapper object={innerObj} ref={(c) => (this.innerRef = c)} />;
        var outer = (
          <Wrapper object={outerObj} ref={(c) => (this.outerRef = c)}>
            {inner}
          </Wrapper>
        );
        return outer;
      }
      componentDidMount() {
        expect(this.innerRef.getObject()).toEqual(innerObj);
        expect(this.outerRef.getObject()).toEqual(outerObj);
        mounted = true;
      }
    }

    var instance = <Component />;
    renderIntoDocument(instance);
    expect(mounted).toBe(true);
  });

  it('fires the callback after a component is rendered', function () {
    var callback = mocks.getMockFunction();
    var container = document.createElement('div');
    ReactDOM.render(<div />, container, callback);
    expect(callback.calls.count()).toBe(1);
    ReactDOM.render(<div className="foo" />, container, callback);
    expect(callback.calls.count()).toBe(2);
    ReactDOM.render(<span />, container, callback);
    expect(callback.calls.count()).toBe(3);
  });

  it('throws usefully when rendering badly-typed elements', function () {
    //spyOn(console, 'error');

    var X = undefined;
    expect(() => renderIntoDocument(<X />)).toThrow();

    var Z = {};
    expect(() => renderIntoDocument(<Z />)).toThrow();

    // One warning for each element creation
    //expect(console.error.calls.count()).toBe(3);
  });

  // other
  it('should pass context to children when not owner', function () {
    class Parent extends React.Component{
      render() {
        return (
          <Child>
            <Grandchild />
          </Child>
        );
      }
    }

    class Child extends React.Component {
      static childContextTypes = {
        foo: React.PropTypes.string
      };

      getChildContext() {
        return {
          foo: 'bar'
        };
      }

      render() {
        return React.Children.only(this.props.children);
      }
    }

    class Grandchild extends React.Component {
      contextTypes = {
        foo: React.PropTypes.string
      };
      render() {
        return <div>{this.context.foo}</div>;
      }
    }

    var component = renderIntoDocument(<Parent />);
    expect(ReactDOM.findDOMNode(component).innerHTML).toBe('bar');
  });
});
