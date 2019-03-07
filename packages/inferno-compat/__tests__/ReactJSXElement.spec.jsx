/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

import React, { createVNode, createComponentVNode } from 'inferno-compat';
import { triggerEvent } from 'inferno-utils';
import sinon from 'sinon';

var ReactDOM = React;

describe('ReactJSXElement', function() {
  class Component extends React.Component {
    render() {
      return <div />;
    }
  }

  it('returns a complete element according to spec', function() {
    var element = <Component />;
    expect(element.type).toBe(Component);
    expect(element.key).toBe(null);
    expect(element.ref).toBe(null);
    var expectation = {};
    Object.freeze(expectation);
    expect(element.props).toEqual(expectation);
  });

  it('allows a lower-case to be passed as the string type', function() {
    var element = <div />;
    expect(element.type).toBe('div');
    expect(element.key).toBe(null);
    expect(element.ref).toBe(null);
    var expectation = {};
    Object.freeze(expectation);
    expect(element.props).toEqual(expectation);
  });

  it('allows a string to be passed as the type', function() {
    var TagName = 'div';
    var element = <TagName />;
    expect(element.type).toBe('div');
    expect(element.key).toBe(null);
    expect(element.ref).toBe(null);
    var expectation = {};
    Object.freeze(expectation);
    expect(element.props).toEqual(expectation);
  });

  // it('returns an immutable element', function() {
  //   var element = <Component />;
  //   expect(() => element.type = 'div').toThrow();
  // });

  it('does not reuse the object that is spread into props', function() {
    var config = { foo: 1 };
    var element = <Component {...config} />;
    expect(element.props.foo).toBe(1);
    config.foo = 2;
    expect(element.props.foo).toBe(1);
  });

  // it('extracts key and ref from the rest of the props', function() {
  //   var element = <Component key="12" ref="34" foo="56" />;
  //   expect(element.type).toBe(Component);
  //   expect(element.key).toBe('12');
  //   expect(element.ref).toBe('34');
  //   var expectation = {foo:'56'};
  //   Object.freeze(expectation);
  //   expect(element.props).toEqual(expectation);
  // });

  // it('coerces the key to a string', function() {
  //   var element = <Component key={12} foo="56" />;
  //   expect(element.type).toBe(Component);
  //   expect(element.key).toBe('12');
  //   expect(element.ref).toBe(null);
  //   var expectation = {foo:'56'};
  //   Object.freeze(expectation);
  //   expect(element.props).toEqual(expectation);
  // });

  // it('merges JSX children onto the children prop', function() {
  //   spyOn(console, 'error');
  //   var a = 1;
  //   var element = <Component children="text">{a}</Component>;
  //   expect(element.props.children).toBe(a);
  //   expect(console.error.calls.count()).toBe(0);
  // });

  it('does not override children if no JSX children are provided', function() {
    spyOn(console, 'error');
    var element = <Component children="text" />;
    expect(element.props.children).toBe('text');
    expect(console.error.calls.count()).toBe(0);
  });

  // it('overrides children if null is provided as a JSX child', function() {
  //   spyOn(console, 'error');
  //   var element = <Component children="text">{null}</Component>;
  //   expect(element.props.children).toBe(null);
  //   expect(console.error.calls.count()).toBe(0);
  // });

  // it('merges JSX children onto the children prop in an array', function() {
  //   spyOn(console, 'error');
  //   var a = 1;
  //   var b = 2;
  //   var c = 3;
  //   var element = <Component>{a}{b}{c}</Component>;
  //   expect(element.props.children).toEqual([1, 2, 3]);
  //   expect(console.error.calls.count()).toBe(0);
  // });

  it('allows static methods to be called using the type property', function() {
    spyOn(console, 'error');

    class StaticMethodComponent {
      static someStaticMethod() {
        return 'someReturnValue';
      }
      render() {
        return <div />;
      }
    }

    var element = <StaticMethodComponent />;
    expect(element.type.someStaticMethod()).toBe('someReturnValue');
    expect(console.error.calls.count()).toBe(0);
  });

  it('identifies valid elements', function() {
    expect(React.isValidElement(<div />)).toEqual(true);
    expect(React.isValidElement(<Component />)).toEqual(true);

    expect(React.isValidElement(null)).toEqual(false);
    expect(React.isValidElement(true)).toEqual(false);
    expect(React.isValidElement({})).toEqual(false);
    expect(React.isValidElement('string')).toEqual(false);
    expect(React.isValidElement(Component)).toEqual(false);
    expect(React.isValidElement({ type: 'div', props: {} })).toEqual(false);
  });

  // it('is indistinguishable from a plain object', function() {
  //   var element = <div className="foo" />;
  //   var object = {};
  //   expect(element.constructor).toBe(object.constructor);
  // });

  it('should use default prop value when removing a prop', function() {
    Component.defaultProps = { fruit: 'persimmon' };

    var container = document.createElement('div');
    var instance = ReactDOM.render(<Component fruit="mango" />, container);
    expect(instance.props.fruit).toBe('mango');

    ReactDOM.render(<Component />, container);
    expect(instance.props.fruit).toBe('persimmon');
  });

  // it('should normalize props with default values', function() {
  //   class NormalizingComponent extends React.Component {
  //     render() {
  //       return <span>{this.props.prop}</span>;
  //     }
  //   }
  //   NormalizingComponent.defaultProps = {prop: 'testKey'};
  //
  //   var instance = ReactTestUtils.renderIntoDocument(<NormalizingComponent />);
  //   expect(instance.props.prop).toBe('testKey');
  //
  //   var inst2 =
  //     ReactTestUtils.renderIntoDocument(<NormalizingComponent prop={null} />);
  //   expect(inst2.props.prop).toBe(null);
  // });

  it('Should map onDoubleClick to html native event', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const spy = sinon.spy();
    ReactDOM.render(React.createElement('a', { onDoubleClick: spy }, 'test'), container);

    expect(spy.callCount).toBe(0);
    const element = container.querySelector('a');
    triggerEvent('dblclick', element);
    expect(spy.callCount).toBe(1);

    document.body.removeChild(container);
  });

  it('Should map onDoubleClick to html native even (jsx)t', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const spy = sinon.spy();
    const node = <a onDoubleClick={spy} />;
    expect(node.props.onDblClick).toEqual(spy);
    ReactDOM.render(node, container);

    expect(spy.callCount).toBe(0);
    const element = container.querySelector('a');
    triggerEvent('dblclick', element);
    expect(spy.callCount).toBe(1);

    document.body.removeChild(container);
  });

  it('Should have input onChange event', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const spy = sinon.spy();
    ReactDOM.render(React.createElement('input', { onChange: spy }), container);

    expect(spy.callCount).toBe(0);
    const element = container.querySelector('input');
    element.value = 'test';
    triggerEvent('input', element);
    expect(spy.callCount).toBe(1);

    document.body.removeChild(container);
  });

  it('Should have input onChange event (JSX)', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const spy = sinon.spy();
    ReactDOM.render(<input onChange={spy} />, container);

    expect(spy.callCount).toBe(0);
    const element = container.querySelector('input');
    element.value = 'test';
    triggerEvent('input', element);
    expect(spy.callCount).toBe(1);

    document.body.removeChild(container);
  });

  it('Should map onDoubleClick to html native event #1', () => {
    const container = document.createElement('div');

    ReactDOM.render(React.createElement('label', { htmlFor: 'foobarID' }, 'test'), container);

    const element = container.querySelector('label');
    expect(element.getAttribute('for')).toBe('foobarID');
  });
});
