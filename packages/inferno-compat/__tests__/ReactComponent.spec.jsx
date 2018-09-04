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

describe('ReactComponent', function() {
  let container;

  function renderIntoDocument(input) {
    return React.render(createComponentVNode(VNodeFlags.ComponentClass, Wrapper, { children: input }), container);
  }

  beforeEach(() => {
    mocks = {
      getMockFunction: function() {
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

  it('should throw on invalid render targets', function() {
    var container = document.createElement('div');
    // jQuery objects are basically arrays; people often pass them in by mistake
    expect(function() {
      ReactDOM.render(<div />, [container]);
    }).toThrow();

    expect(function() {
      ReactDOM.render(<div />, null);
    }).toThrow();
  });

  it('should support new-style refs', function() {
    var innerObj = {};
    var outerObj = {};

    var Wrapper = React.createClass({
      getObject: function() {
        return this.props.object;
      },
      render: function() {
        return <div>{this.props.children}</div>;
      }
    });

    var mounted = false;
    var Component = React.createClass({
      render: function() {
        var inner = <Wrapper object={innerObj} ref={c => (this.innerRef = c)} />;
        var outer = (
          <Wrapper object={outerObj} ref={c => (this.outerRef = c)}>
            {inner}
          </Wrapper>
        );
        return outer;
      },
      componentDidMount: function() {
        expect(this.innerRef.getObject()).toEqual(innerObj);
        expect(this.outerRef.getObject()).toEqual(outerObj);
        mounted = true;
      }
    });

    var instance = <Component />;
    renderIntoDocument(instance);
    expect(mounted).toBe(true);
  });

  // it('should call refs at the correct time', function() {
  //   var log = [];

  //   var Inner = React.createClass({
  //     render: function() {
  //       log.push(`inner ${this.props.id} render`);
  //       return <div />;
  //     },
  //     componentDidMount: function() {
  //       log.push(`inner ${this.props.id} componentDidMount`);
  //     },
  //     componentDidUpdate: function() {
  //       log.push(`inner ${this.props.id} componentDidUpdate`);
  //     },
  //     componentWillUnmount: function() {
  //       log.push(`inner ${this.props.id} componentWillUnmount`);
  //     },
  //   });

  //   var Outer = React.createClass({
  //     render: function() {
  //       return (
  //         <div>
  //           <Inner id={1} ref={(c) => {
  //             log.push(`ref 1 got ${c ? `instance ${c.props.id}` : 'null'}`);
  //           }}/>
  //           <Inner id={2} ref={(c) => {
  //             log.push(`ref 2 got ${c ? `instance ${c.props.id}` : 'null'}`);
  //           }}/>
  //         </div>
  //       );
  //     },
  //     componentDidMount: function() {
  //       log.push('outer componentDidMount');
  //     },
  //     componentDidUpdate: function() {
  //       log.push('outer componentDidUpdate');
  //     },
  //     componentWillUnmount: function() {
  //       log.push('outer componentWillUnmount');
  //     },
  //   });

  //   // mount, update, unmount
  //   var el = document.createElement('div');
  //   log.push('start mount');
  //   ReactDOM.render(<Outer />, el);
  //   log.push('start update');
  //   ReactDOM.render(<Outer />, el);
  //   log.push('start unmount');
  //   ReactDOM.unmountComponentAtNode(el);
  //   console.log(log)

  //   /* eslint-disable indent */
  //   expect(log).toEqual([
  //     'start mount',
  //       'inner 1 render',
  //       'inner 2 render',
  //       'inner 1 componentDidMount',
  //       'ref 1 got instance 1',
  //       'inner 2 componentDidMount',
  //       'ref 2 got instance 2',
  //       'outer componentDidMount',
  //     'start update',
  //       // Previous (equivalent) refs get cleared
  //       'ref 1 got null',
  //       'inner 1 render',
  //       'ref 2 got null',
  //       'inner 2 render',
  //       'inner 1 componentDidUpdate',
  //       'ref 1 got instance 1',
  //       'inner 2 componentDidUpdate',
  //       'ref 2 got instance 2',
  //       'outer componentDidUpdate',
  //     'start unmount',
  //       'outer componentWillUnmount',
  //       'ref 1 got null',
  //       'inner 1 componentWillUnmount',
  //       'ref 2 got null',
  //       'inner 2 componentWillUnmount',
  //   ]);
  //   /* eslint-enable indent */
  // });

  it('fires the callback after a component is rendered', function() {
    var callback = mocks.getMockFunction();
    var container = document.createElement('div');
    ReactDOM.render(<div />, container, callback);
    expect(callback.calls.count()).toBe(1);
    ReactDOM.render(<div className="foo" />, container, callback);
    expect(callback.calls.count()).toBe(2);
    ReactDOM.render(<span />, container, callback);
    expect(callback.calls.count()).toBe(3);
  });

  // // it('warns when calling getDOMNode', function() {
  // //   spyOn(console, 'error');

  // //   var Potato = React.createClass({
  // //     render: function() {
  // //       return <div />;
  // //     },
  // //   });
  // //   var container = document.createElement('div');
  // //   var instance = ReactDOM.render(<Potato />, container);

  // //   instance.getDOMNode();

  // //   expect(console.error.calls.count()).toBe(1);
  // //   expect(console.error.calls[0].args[0]).toContain(
  // //     'Potato.getDOMNode(...) is deprecated. Please use ' +
  // //     'ReactDOM.findDOMNode(instance) instead.'
  // //   );
  // // });

  it('throws usefully when rendering badly-typed elements', function() {
    //spyOn(console, 'error');

    var X = undefined;
    expect(() => renderIntoDocument(<X />)).toThrow();

    var Z = {};
    expect(() => renderIntoDocument(<Z />)).toThrow();

    // One warning for each element creation
    //expect(console.error.calls.count()).toBe(3);
  });

  // other
  it('should pass context to children when not owner', function() {
    var Parent = React.createClass({
      render: function() {
        return (
          <Child>
            <Grandchild />
          </Child>
        );
      }
    });

    var Child = React.createClass({
      childContextTypes: {
        foo: React.PropTypes.string
      },

      getChildContext: function() {
        return {
          foo: 'bar'
        };
      },

      render: function() {
        return React.Children.only(this.props.children);
      }
    });

    var Grandchild = React.createClass({
      contextTypes: {
        foo: React.PropTypes.string
      },

      render: function() {
        return <div>{this.context.foo}</div>;
      }
    });

    var component = renderIntoDocument(<Parent />);
    expect(ReactDOM.findDOMNode(component).innerHTML).toBe('bar');
  });
});
