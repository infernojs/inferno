/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

import React from 'inferno-compat';
import { createComponentVNode, type InfernoNode } from 'inferno';
import { Wrapper } from 'inferno-test-utils';
import { VNodeFlags } from 'inferno-vnode-flags';

const ReactDOM = React;

describe('ReactComponentLifeCycle', function () {
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

  it('should not reuse an instance when it has been unmounted', function () {
    const container = document.createElement('div');
    class StatefulComponent extends React.Component<object, object> {
      state: object;

      constructor(props: object) {
        super(props);
        this.state = {};
      }

      render() {
        return <div />;
      }
    }
    const element = <StatefulComponent />;

    const firstInstance = ReactDOM.render(element, container);
    ReactDOM.unmountComponentAtNode(container);
    const secondInstance = ReactDOM.render(element, container);
    expect(firstInstance).not.toBe(secondInstance);
  });

  /**
   * If a state update triggers rerendering that in turn fires an onDOMReady,
   * that second onDOMReady should not fail.
   */
  it('it should fire onDOMReady when already in onDOMReady', function (done) {
    const _testJournal: string[] = [];

    class Child extends React.Component {
      componentDidMount() {
        _testJournal.push('Child:onDOMReady');
      }

      render() {
        return <div />;
      }
    }

    interface SwitcherParentState {
      showHasOnDOMReadyComponent: boolean;
    }

    class SwitcherParent extends React.Component<object, SwitcherParentState> {
      state: SwitcherParentState;

      constructor(props: object) {
        super(props);
        _testJournal.push('SwitcherParent:ctr');
        this.state = { showHasOnDOMReadyComponent: false };
      }

      componentDidMount() {
        _testJournal.push('SwitcherParent:onDOMReady');
        this.switchIt();
      }

      switchIt() {
        this.setState({ showHasOnDOMReadyComponent: true });
      }

      render() {
        return (
          <div>
            {this.state.showHasOnDOMReadyComponent ? <Child /> : <div> </div>}
          </div>
        );
      }
    }

    const instance = <SwitcherParent />;
    renderIntoDocument(instance);
    setTimeout(() => {
      expect(_testJournal).toEqual([
        'SwitcherParent:ctr',
        'SwitcherParent:onDOMReady',
        'Child:onDOMReady',
      ]);
      done();
    }, 20);
  });

  it('should allow update state inside of componentWillMount', function () {
    interface StatefulComponentState {
      stateField: string;
    }

    class StatefulComponent extends React.Component<
      object,
      StatefulComponentState
    > {
      componentWillMount() {
        this.setState({ stateField: 'something' });
      }

      render() {
        return <div />;
      }
    }

    const instance = <StatefulComponent />;
    expect(function () {
      renderIntoDocument(instance);
    }).not.toThrow();
  });

  it('should not throw when updating an auxiliary component', function () {
    interface TooltipProps {
      tooltip: InfernoNode;
    }

    class Tooltip extends React.Component<TooltipProps> {
      container: HTMLDivElement;

      render() {
        return <div>{this.props.children}</div>;
      }

      componentDidMount() {
        this.container = document.createElement('div');
        this.updateTooltip();
      }

      componentDidUpdate() {
        this.updateTooltip();
      }

      updateTooltip() {
        // Even though this.props.tooltip has an owner, updating it shouldn't
        // throw here because it's mounted as a root component
        ReactDOM.render(this.props.tooltip, this.container);
      }
    }

    interface ComponentProps {
      text: string;
      tooltipText: string;
    }

    class Component extends React.Component<ComponentProps> {
      render() {
        return (
          <Tooltip tooltip={<div>{this.props.tooltipText}</div>}>
            {this.props.text}
          </Tooltip>
        );
      }
    }

    const container = document.createElement('div');
    ReactDOM.render(<Component text="uno" tooltipText="one" />, container);

    // Since `instance` is a root component, we can set its props. This also
    // makes Tooltip rerender the tooltip component, which shouldn't throw.
    ReactDOM.render(<Component text="dos" tooltipText="two" />, container);
  });

  it('should allow state updates in componentDidMount', function (done) {
    /**
     * calls setState in an componentDidMount.
     */
    interface SetStateInComponentDidMountProps {
      valueToUseInitially: string;
      valueToUseInOnDOMReady: string;
    }

    interface SetStateInComponentDidMountState {
      stateField: string;
    }

    class SetStateInComponentDidMount extends React.Component<
      SetStateInComponentDidMountProps,
      SetStateInComponentDidMountState
    > {
      state: SetStateInComponentDidMountState;

      constructor(props: SetStateInComponentDidMountProps) {
        super(props);

        this.state = {
          stateField: this.props.valueToUseInitially,
        };
      }

      componentDidMount() {
        this.setState({ stateField: this.props.valueToUseInOnDOMReady });
      }

      render() {
        return <div />;
      }
    }

    let instance = (
      <SetStateInComponentDidMount
        valueToUseInitially="hello"
        valueToUseInOnDOMReady="goodbye"
      />
    );
    instance = renderIntoDocument(instance);

    setTimeout(() => {
      expect(instance.$LI.children.state.stateField).toBe('goodbye');
      done();
    }, 25);
  });

  it('should call nested lifecycle methods in the right order', function () {
    let log: string[];

    interface OuterProps {
      x: number;
    }

    class Outer extends React.Component<OuterProps> {
      render() {
        return (
          <div>
            <Inner x={this.props.x} />
          </div>
        );
      }

      componentWillMount() {
        log.push('outer componentWillMount');
      }

      componentDidMount() {
        log.push('outer componentDidMount');
      }

      componentWillReceiveProps() {
        log.push('outer componentWillReceiveProps');
      }

      shouldComponentUpdate() {
        log.push('outer shouldComponentUpdate');

        return true;
      }

      componentWillUpdate() {
        log.push('outer componentWillUpdate');
      }

      componentDidUpdate() {
        log.push('outer componentDidUpdate');
      }

      componentWillUnmount() {
        log.push('outer componentWillUnmount');
      }
    }

    interface InnerProps {
      x: number;
    }

    class Inner extends React.Component<InnerProps> {
      render() {
        return <span>{this.props.x}</span>;
      }

      componentWillMount() {
        log.push('inner componentWillMount');
      }

      componentDidMount() {
        log.push('inner componentDidMount');
      }

      componentWillReceiveProps() {
        log.push('inner componentWillReceiveProps');
      }

      shouldComponentUpdate() {
        log.push('inner shouldComponentUpdate');

        return true;
      }

      componentWillUpdate() {
        log.push('inner componentWillUpdate');
      }

      componentDidUpdate() {
        log.push('inner componentDidUpdate');
      }

      componentWillUnmount() {
        log.push('inner componentWillUnmount');
      }
    }

    const container = document.createElement('div');
    log = [];
    ReactDOM.render(<Outer x={17} />, container);
    expect(log).toEqual([
      'outer componentWillMount',
      'inner componentWillMount',
      'inner componentDidMount',
      'outer componentDidMount',
    ]);

    log = [];
    ReactDOM.render(<Outer x={42} />, container);
    expect(log).toEqual([
      'outer componentWillReceiveProps',
      'outer shouldComponentUpdate',
      'outer componentWillUpdate',
      'inner componentWillReceiveProps',
      'inner shouldComponentUpdate',
      'inner componentWillUpdate',
      'inner componentDidUpdate',
      'outer componentDidUpdate',
    ]);

    log = [];
    ReactDOM.unmountComponentAtNode(container);
    expect(log).toEqual([
      'outer componentWillUnmount',
      'inner componentWillUnmount',
    ]);
  });
});
