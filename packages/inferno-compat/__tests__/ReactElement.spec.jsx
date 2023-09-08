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

describe('ReactElement', function () {
  class ComponentClass extends React.Component {
    render() {
      return React.createElement('div');
    }
  }
  let originalSymbol;

  beforeEach(function () {
    // Delete the native Symbol if we have one to ensure we test the
    // unpolyfilled environment.
    originalSymbol = global.Symbol;
    global.Symbol = undefined;
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  let container;

  function renderIntoDocument(input) {
    return React.render(
      createComponentVNode(VNodeFlags.ComponentClass, Wrapper, {
        children: input,
      }),
      container,
    );
  }

  afterEach(() => {
    React.render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
    global.Symbol = originalSymbol;
  });

  // it('uses the fallback value when in an environment without Symbol', function() {
  //   expect(<div />.$$typeof).toBe(0xeac7);
  // });

  it('returns a complete element according to spec', function () {
    const element = React.createFactory(ComponentClass)();
    expect(element.type).toBe(ComponentClass);
    expect(element.key).toBe(null);
    expect(element.ref).toBe(null);
    const expectation = {};
    Object.freeze(expectation);
    expect(element.props).toEqual(expectation);
  });

  it('allows a string to be passed as the type', function () {
    const element = React.createFactory('div')();
    expect(element.type).toBe('div');
    expect(element.key).toBe(null);
    expect(element.ref).toBe(null);
    const expectation = {};
    Object.freeze(expectation);
    expect(element.props).toEqual(expectation);
  });

  // it('returns an immutable element', function() {
  //   var element = React.createFactory(ComponentClass)();
  //   expect(() => element.type = 'div').toThrow();
  // });

  it('does not reuse the original config object', function () {
    const config = { foo: 1 };
    const element = React.createFactory(ComponentClass)(config);
    expect(element.props.foo).toBe(1);
    config.foo = 2;
    expect(element.props.foo).toBe(1);
  });

  it('coerces the key to a string', function () {
    const element = React.createFactory(ComponentClass)({
      key: 12,
      foo: '56',
    });
    expect(element.type).toBe(ComponentClass);
    expect(element.key).toBe(12);
    expect(element.ref).toBe(null);
    const expectation = { foo: '56' };
    Object.freeze(expectation);
    expect(element.props).toEqual(expectation);
  });

  it('merges an additional argument onto the children prop', function () {
    spyOn(console, 'error');
    const a = 1;
    const element = React.createFactory(ComponentClass)(
      {
        children: 'text',
      },
      a,
    );
    expect(element.props.children).toBe(a);
    expect(console.error.calls.count()).toBe(0);
  });

  it('does not override children if no rest args are provided', function () {
    spyOn(console, 'error');
    const element = React.createFactory(ComponentClass)({
      children: 'text',
    });
    expect(element.props.children).toBe('text');
    expect(console.error.calls.count()).toBe(0);
  });

  it('overrides children if null is provided as an argument', function () {
    spyOn(console, 'error');
    const element = React.createFactory(ComponentClass)(
      {
        children: 'text',
      },
      null,
    );
    expect(element.props.children).toBe(null);
    expect(console.error.calls.count()).toBe(0);
  });

  it('merges rest arguments onto the children prop in an array', function () {
    spyOn(console, 'error');
    const a = 1;
    const b = 2;
    const c = 3;
    const element = React.createFactory(ComponentClass)(null, a, b, c);
    expect(element.props.children).toEqual([1, 2, 3]);
    expect(console.error.calls.count()).toBe(0);
  });

  it('allows static methods to be called using the type property', function () {
    spyOn(console, 'error');

    class StaticMethodComponentClass extends React.Component {
      constructor(props) {
        super(props);

        this.state = { valueToReturn: 'hi' };
      }

      static someStaticMethod() {
        return 'someReturnValue';
      }

      render() {
        return React.createElement('div');
      }
    }

    const element = React.createElement(StaticMethodComponentClass);
    expect(element.type.someStaticMethod()).toBe('someReturnValue');
    expect(console.error.calls.count()).toBe(0);
  });

  it('identifies valid elements', function () {
    class Component extends React.Component {
      render() {
        return React.createElement('div');
      }
    }

    expect(React.isValidElement(React.createElement('div'))).toEqual(true);
    expect(React.isValidElement(React.createElement(Component))).toEqual(true);

    expect(React.isValidElement(null)).toEqual(false);
    expect(React.isValidElement(true)).toEqual(false);
    expect(React.isValidElement({})).toEqual(false);
    expect(React.isValidElement('string')).toEqual(false);
    expect(React.isValidElement(Component)).toEqual(false);
    expect(React.isValidElement({ type: 'div', props: {} })).toEqual(false);

    // var jsonElement = JSON.stringify(React.createElement('div'));
    // expect(React.isValidElement(JSON.parse(jsonElement))).toBe(true);
  });

  it('allows the use of PropTypes validators in statics', function () {
    // TODO: This test was added to cover a special case where we proxied
    // methods. However, we don't do that any more so this test can probably
    // be removed. Leaving it in classic as a safety precausion.
    class Component extends React.Component {
      render() {
        return null;
      }

      static get specialType() {
        return React.PropTypes.shape({ monkey: React.PropTypes.any });
      }
    }

    expect(typeof Component.specialType).toBe('function');
    expect(typeof Component.specialType.isRequired).toBe('function');
  });

  it('does not warn for NaN props', function () {
    spyOn(console, 'error');
    class Test extends React.Component {
      render() {
        return <div />;
      }
    }
    const test = renderIntoDocument(<Test value={+undefined} />);
    expect(test.$LI.children.props.value).toBeNaN();
    expect(console.error.calls.count()).toBe(0);
  });

  it('identifies elements, but not JSON, if Symbols are supported', function () {
    // Rudimentary polyfill
    // Once all jest engines support Symbols natively we can swap this to test
    // WITH native Symbols by default.
    const REACT_ELEMENT_TYPE = function () {}; // fake Symbol
    const OTHER_SYMBOL = function () {}; // another fake Symbol
    global.Symbol = function (name) {
      return OTHER_SYMBOL;
    };
    global.Symbol.for = function (key) {
      if (key === 'react.element') {
        return REACT_ELEMENT_TYPE;
      }
      return OTHER_SYMBOL;
    };

    class Component extends React.Component {
      render() {
        return React.createElement('div');
      }
    }

    expect(React.isValidElement(React.createElement('div'))).toEqual(true);
    expect(React.isValidElement(React.createElement(Component))).toEqual(true);

    expect(React.isValidElement(null)).toEqual(false);
    expect(React.isValidElement(true)).toEqual(false);
    expect(React.isValidElement({})).toEqual(false);
    expect(React.isValidElement('string')).toEqual(false);
    expect(React.isValidElement(Component)).toEqual(false);
    expect(React.isValidElement({ type: 'div', props: {} })).toEqual(false);
  });
});
