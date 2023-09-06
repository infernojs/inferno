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

const ReactDOM = React;

describe('ReactClass-spec', function () {
  let container;

  function renderIntoDocument(input) {
    return React.render(
      createComponentVNode(VNodeFlags.ComponentClass, Wrapper, {
        children: input,
      }),
      container,
    );
  }

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  // it('should warn on invalid prop types', function() {
  //   var warn = console.error;
  //   console.error = mocks.getMockFunction();
  //   try {

  //     React.createClass({
  //       displayName: 'Component',
  //       propTypes: {
  //         prop: null,
  //       },
  //       render: function() {
  //         return <span>{this.props.prop}</span>;
  //       },
  //     });
  //     expect(console.error.calls.count()).toBe(1);
  //     expect(console.error.calls[0][0]).toBe(
  //       'Warning: Component: prop type `prop` is invalid; ' +
  //       'it must be a function, usually from React.PropTypes.'
  //     );
  //   } finally {
  //     console.error = warn;
  //   }
  // });

  // it('should warn on invalid context types', function() {
  //   var warn = console.error;
  //   console.error = mocks.getMockFunction();
  //   try {
  //     React.createClass({
  //       displayName: 'Component',
  //       contextTypes: {
  //         prop: null,
  //       },
  //       render: function() {
  //         return <span>{this.props.prop}</span>;
  //       },
  //     });
  //     expect(console.error.calls.count()).toBe(1);
  //     expect(console.error.calls[0][0]).toBe(
  //       'Warning: Component: context type `prop` is invalid; ' +
  //       'it must be a function, usually from React.PropTypes.'
  //     );
  //   } finally {
  //     console.error = warn;
  //   }
  // });

  // it('should throw on invalid child context types', function() {
  //   var warn = console.error;
  //   console.error = mocks.getMockFunction();
  //   try {
  //     React.createClass({
  //       displayName: 'Component',
  //       childContextTypes: {
  //         prop: null,
  //       },
  //       render: function() {
  //         return <span>{this.props.prop}</span>;
  //       },
  //     });
  //     expect(console.error.calls.count()).toBe(1);
  //     expect(console.error.calls[0][0]).toBe(
  //       'Warning: Component: child context type `prop` is invalid; ' +
  //       'it must be a function, usually from React.PropTypes.'
  //     );
  //   } finally {
  //     console.error = warn;
  //   }
  // });

  // it('should warn when mispelling shouldComponentUpdate', function() {
  //   React.createClass({
  //     componentShouldUpdate: function() {
  //       return false;
  //     },
  //     render: function() {
  //       return <div />;
  //     },
  //   });
  //   expect(console.error.calls.count()).toBe(1);
  //   expect(console.error.argsForCall[0][0]).toBe(
  //     'Warning: A component has a method called componentShouldUpdate(). Did you ' +
  //     'mean shouldComponentUpdate()? The name is phrased as a question ' +
  //     'because the function is expected to return a value.'
  //   );

  //   React.createClass({
  //     displayName: 'NamedComponent',
  //     componentShouldUpdate: function() {
  //       return false;
  //     },
  //     render: function() {
  //       return <div />;
  //     },
  //   });
  //   expect(console.error.calls.count()).toBe(2);
  //   expect(console.error.argsForCall[1][0]).toBe(
  //     'Warning: NamedComponent has a method called componentShouldUpdate(). Did you ' +
  //     'mean shouldComponentUpdate()? The name is phrased as a question ' +
  //     'because the function is expected to return a value.'
  //   );
  // });

  // it('should warn when mispelling componentWillReceiveProps', function() {
  //   React.createClass({
  //     componentWillRecieveProps: function() {
  //       return false;
  //     },
  //     render: function() {
  //       return <div />;
  //     },
  //   });
  //   expect(console.error.calls.count()).toBe(1);
  //   expect(console.error.argsForCall[0][0]).toBe(
  //     'Warning: A component has a method called componentWillRecieveProps(). Did you ' +
  //     'mean componentWillReceiveProps()?'
  //   );
  // });

  // it('should throw if a reserved property is in statics', function() {
  //   expect(function() {
  //     React.createClass({
  //       statics: {
  //         getDefaultProps: function() {
  //           return {
  //             foo: 0,
  //           };
  //         },
  //       },

  //       render: function() {
  //         return <span />;
  //       },
  //     });
  //   }).toThrow(
  //     'Invariant Violation: ReactClass: You are attempting to ' +
  //     'define a reserved property, `getDefaultProps`, that shouldn\'t be on ' +
  //     'the "statics" key. Define it as an instance property instead; it ' +
  //     'will still be accessible on the constructor.'
  //   );
  // });

  // // TODO: Consider actually moving these to statics or drop this unit test.

  // xit('should warn when using deprecated non-static spec keys', function() {
  //   React.createClass({
  //     mixins: [{}],
  //     propTypes: {
  //       foo: React.PropTypes.string,
  //     },
  //     contextTypes: {
  //       foo: React.PropTypes.string,
  //     },
  //     childContextTypes: {
  //       foo: React.PropTypes.string,
  //     },
  //     render: function() {
  //       return <div />;
  //     },
  //   });
  //   expect(console.error.calls.count()).toBe(4);
  //   expect(console.error.argsForCall[0][0]).toBe(
  //     'createClass(...): `mixins` is now a static property and should ' +
  //     'be defined inside "statics".'
  //   );
  //   expect(console.error.argsForCall[1][0]).toBe(
  //     'createClass(...): `propTypes` is now a static property and should ' +
  //     'be defined inside "statics".'
  //   );
  //   expect(console.error.argsForCall[2][0]).toBe(
  //     'createClass(...): `contextTypes` is now a static property and ' +
  //     'should be defined inside "statics".'
  //   );
  //   expect(console.error.argsForCall[3][0]).toBe(
  //     'createClass(...): `childContextTypes` is now a static property and ' +
  //     'should be defined inside "statics".'
  //   );
  // });

  it('should work with object getInitialState() return values', function () {
    class Comp extends React.Component {
      getInitialState() {
        return {
          occupation: 'clown',
        };
      }

      render() {
        return <span />;
      }
    }

    let instance = <Comp />;
    instance = renderIntoDocument(instance);
    expect(instance.$LI.children.state.occupation).toEqual('clown');
  });

  it('renders based on context getInitialState', function () {
    class Foo extends React.Component {
      static contextTypes = {
        className: React.PropTypes.string,
      };

      getInitialState() {
        return { className: this.context.className };
      }

      render() {
        return <span className={this.state.className} />;
      }
    }

    class Outer extends React.Component{
      static childContextTypes = {
        className: React.PropTypes.string,
      }
      getChildContext() {
        return { className: 'foo' };
      }
      render() {
        return <Foo />;
      }
    }

    const container = document.createElement('div');
    ReactDOM.render(<Outer />, container);
    expect(container.firstChild.className).toBe('foo');
  });

  // it('should throw with non-object getInitialState() return values', function() {
  //   [['an array'], 'a string', 1234].forEach(function(state) {
  //     var Component = React.createClass({
  //       getInitialState: function() {
  //         return state;
  //       },
  //       render: function() {
  //         return <span />;
  //       },
  //     });
  //     var instance = <Component />;
  //     expect(function() {
  //       instance = ReactTestUtils.renderIntoDocument(instance);
  //     }).toThrow(
  //       'Invariant Violation: Component.getInitialState(): ' +
  //       'must return an object or null'
  //     );
  //   });
  // });

  it('should work with a null getInitialState() return value', function () {
    class Component extends React.Component{
      getInitialState() {
        return null;
      }
      render() {
        return <span />;
      }
    }
    expect(() => renderIntoDocument(<Component />)).not.toThrow();
  });

  // it('should throw when using legacy factories', function() {
  //   var Component = React.createClass({
  //     render() {
  //       return <div />;
  //     },
  //   });

  //   expect(() => Component()).toThrow();
  //   expect(console.error.calls.count()).toBe(1);
  //   expect(console.error.argsForCall[0][0]).toBe(
  //     'Warning: Something is calling a React component directly. Use a ' +
  //     'factory or JSX instead. See: https://fb.me/react-legacyfactory'
  //   );
  // });

  // it('warns when calling getDOMNode', function() {
  //   var MyComponent = React.createClass({
  //     render: function() {
  //       return <div />;
  //     },
  //   });

  //   var container = document.createElement('div');
  //   var instance = ReactDOM.render(<MyComponent />, container);

  //   instance.getDOMNode();

  //   expect(console.error.calls.count()).toBe(1);
  //   expect(console.error.calls[0].calls.argsFor(0)[0]).toContain(
  //     'MyComponent.getDOMNode(...) is deprecated. Please use ' +
  //     'ReactDOM.findDOMNode(instance) instead.'
  //   );
  // });
});
