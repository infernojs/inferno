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

var clone = function (o) {
  return JSON.parse(JSON.stringify(o));
};

var GET_INIT_STATE_RETURN_VAL = {
  hasWillMountCompleted: false,
  hasRenderCompleted: false,
  hasDidMountCompleted: false,
  hasWillUnmountCompleted: false
};

var INIT_RENDER_STATE = {
  hasWillMountCompleted: true,
  hasRenderCompleted: false,
  hasDidMountCompleted: false,
  hasWillUnmountCompleted: false
};

var DID_MOUNT_STATE = {
  hasWillMountCompleted: true,
  hasRenderCompleted: true,
  hasDidMountCompleted: false,
  hasWillUnmountCompleted: false
};

var NEXT_RENDER_STATE = {
  hasWillMountCompleted: true,
  hasRenderCompleted: true,
  hasDidMountCompleted: true,
  hasWillUnmountCompleted: false
};

var WILL_UNMOUNT_STATE = {
  hasWillMountCompleted: true,
  hasDidMountCompleted: true,
  hasRenderCompleted: true,
  hasWillUnmountCompleted: false
};

var POST_WILL_UNMOUNT_STATE = {
  hasWillMountCompleted: true,
  hasDidMountCompleted: true,
  hasRenderCompleted: true,
  hasWillUnmountCompleted: true
};

/**
 * Every React component is in one of these life cycles.
 */
var ComponentLifeCycle = {
  /**
   * Mounted components have a DOM node representation and are capable of
   * receiving new props.
   */
  MOUNTED: 'MOUNTED',
  /**
   * Unmounted components are inactive and cannot receive new props.
   */
  UNMOUNTED: 'UNMOUNTED'
};

describe('ReactComponentLifeCycle', function () {
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

  it('should not reuse an instance when it has been unmounted', function () {
    var container = document.createElement('div');
    class StatefulComponent extends React.Component {
      constructor(props) {
        super(props);
        this.state = {};
      }

      render() {
        return <div />;
      }
    }
    var element = <StatefulComponent />;

    var firstInstance = ReactDOM.render(element, container);
    ReactDOM.unmountComponentAtNode(container);
    var secondInstance = ReactDOM.render(element, container);
    expect(firstInstance).not.toBe(secondInstance);
  });

  /**
   * If a state update triggers rerendering that in turn fires an onDOMReady,
   * that second onDOMReady should not fail.
   */
  it('it should fire onDOMReady when already in onDOMReady', function (done) {
    var _testJournal = [];

    class Child extends React.Component {
      componentDidMount() {
        _testJournal.push('Child:onDOMReady');
      }
      render() {
        return <div />;
      }
    }

    class SwitcherParent extends React.Component {
      constructor(props) {
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
        return <div>{this.state.showHasOnDOMReadyComponent ? <Child /> : <div> </div>}</div>;
      }
    }

    var instance = <SwitcherParent />;
    renderIntoDocument(instance);
    setTimeout(() => {
      expect(_testJournal).toEqual(['SwitcherParent:ctr', 'SwitcherParent:onDOMReady', 'Child:onDOMReady']);
      done();
    }, 20);
  });

  it('should allow update state inside of componentWillMount', function () {
    class StatefulComponent extends React.Component {
      componentWillMount() {
        this.setState({ stateField: 'something' });
      }

      render() {
        return <div />;
      }
    }

    var instance = <StatefulComponent />;
    expect(function () {
      renderIntoDocument(instance);
    }).not.toThrow();
  });

  it('should not throw when updating an auxiliary component', function () {
    class Tooltip extends React.Component {
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

    class Component extends React.Component {
      render() {
        return <Tooltip tooltip={<div>{this.props.tooltipText}</div>}>{this.props.text}</Tooltip>;
      }
    }

    var container = document.createElement('div');
    ReactDOM.render(<Component text="uno" tooltipText="one" />, container);

    // Since `instance` is a root component, we can set its props. This also
    // makes Tooltip rerender the tooltip component, which shouldn't throw.
    ReactDOM.render(<Component text="dos" tooltipText="two" />, container);
  });

  it('should allow state updates in componentDidMount', function (done) {
    /**
     * calls setState in an componentDidMount.
     */
    class SetStateInComponentDidMount extends React.Component {
      constructor(props) {
        super(props);

        this.state = {
          stateField: this.props.valueToUseInitially
        };
      }

      componentDidMount() {
        this.setState({ stateField: this.props.valueToUseInOnDOMReady });
      }
      render() {
        return <div />;
      }
    }

    var instance = <SetStateInComponentDidMount valueToUseInitially="hello" valueToUseInOnDOMReady="goodbye" />;
    instance = renderIntoDocument(instance);

    setTimeout(() => {
      expect(instance.$LI.children.state.stateField).toBe('goodbye');
      done();
    }, 25);
  });

  it('should call nested lifecycle methods in the right order', function () {
    var log;
    var logger = function (msg) {
      return function () {
        // return true for shouldComponentUpdate
        log.push(msg);
        return true;
      };
    };
    class Outer extends React.Component {
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

    class Inner extends React.Component {
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

    var container = document.createElement('div');
    log = [];
    ReactDOM.render(<Outer x={17} />, container);
    expect(log).toEqual(['outer componentWillMount', 'inner componentWillMount', 'inner componentDidMount', 'outer componentDidMount']);

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
      'outer componentDidUpdate'
    ]);

    log = [];
    ReactDOM.unmountComponentAtNode(container);
    expect(log).toEqual(['outer componentWillUnmount', 'inner componentWillUnmount']);
  });
});
