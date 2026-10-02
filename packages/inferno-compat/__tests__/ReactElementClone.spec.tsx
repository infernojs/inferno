/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

import React from 'inferno-compat';
import { createComponentVNode, type InfernoNode, type VNode } from 'inferno';
import { Wrapper } from 'inferno-test-utils';
import { VNodeFlags } from 'inferno-vnode-flags';

const ReactDOM = React;

describe('ReactElementClone', function () {
  let container: HTMLDivElement;

  function renderIntoDocument(input: InfernoNode) {
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
    React.render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('should clone a DOM component with new props', function () {
    interface ParentProps {
      child: VNode;
    }

    class Grandparent extends React.Component {
      render() {
        return <Parent child={<div className="child" />} />;
      }
    }
    class Parent extends React.Component<ParentProps> {
      render() {
        return (
          <div className="parent">
            {React.cloneElement(this.props.child, { className: 'xyz' })}
          </div>
        );
      }
    }
    const component = renderIntoDocument(<Grandparent />);
    expect(
      // eslint-disable-next-line inferno/no-find-dom-node
      (ReactDOM.findDOMNode(component!)!.childNodes[0] as HTMLDivElement)
        .className,
    ).toBe('xyz');
  });

  it('should clone a composite component with new props', function () {
    interface ChildProps {
      className: string;
    }

    interface ParentProps {
      child: VNode;
    }

    class Child extends React.Component<ChildProps> {
      render() {
        return <div className={this.props.className} />;
      }
    }
    class Grandparent extends React.Component {
      render() {
        return <Parent child={<Child className="child" />} />;
      }
    }
    class Parent extends React.Component<ParentProps> {
      render() {
        return (
          <div className="parent">
            {React.cloneElement(this.props.child, { className: 'xyz' })}
          </div>
        );
      }
    }
    const component = renderIntoDocument(<Grandparent />);
    expect(
      // eslint-disable-next-line inferno/no-find-dom-node
      (ReactDOM.findDOMNode(component!)!.childNodes[0] as HTMLDivElement)
        .className,
    ).toBe('xyz');
  });

  it('should transfer the key property', function () {
    class Component extends React.Component {
      render() {
        return null;
      }
    }
    const clone = React.cloneElement(<Component />, { key: 'xyz' });
    expect(clone.key).toBe('xyz');
  });

  it('should transfer children', function () {
    class Component extends React.Component {
      render() {
        expect(this.props.children).toBe('xyz');
        return <div />;
      }
    }

    renderIntoDocument(React.cloneElement(<Component />, { children: 'xyz' }));
  });

  it('should shallow clone children', function () {
    class Component extends React.Component {
      render() {
        expect(this.props.children).toBe('xyz');
        return <div />;
      }
    }

    renderIntoDocument(React.cloneElement(<Component>xyz</Component>, {}));
  });

  it('should accept children as rest arguments', function () {
    class Component extends React.Component {
      render() {
        return null;
      }
    }

    const clone = React.cloneElement(
      <Component>xyz</Component>,
      { children: <Component /> },
      <div />,
      <span />,
    );

    expect(clone.props.children).toEqual([<div />, <span />]);
  });

  it('should overwrite props', function () {
    interface ComponentProps {
      myprop: string;
    }

    class Component extends React.Component<ComponentProps> {
      render() {
        expect(this.props.myprop).toBe('xyz');
        return <div />;
      }
    }

    renderIntoDocument(
      React.cloneElement(<Component myprop="abc" />, { myprop: 'xyz' }),
    );
  });
});
