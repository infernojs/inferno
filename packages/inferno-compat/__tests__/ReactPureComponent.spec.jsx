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

const ReactDOM = React;

describe('ReactPureComponent', function () {
  it('should render', function () {
    let renders = 0;
    class Component extends React.PureComponent {
      constructor() {
        super();
        this.state = { type: 'mushrooms' };
      }

      render() {
        renders++;
        return <div>{this.props.text[0]}</div>;
      }
    }

    const container = document.createElement('div');
    let text;
    let component;

    text = ['porcini'];
    component = ReactDOM.render(<Component text={text} />, container);
    expect(container.textContent).toBe('porcini');
    expect(renders).toBe(1);

    text = ['morel'];
    component = ReactDOM.render(<Component text={text} />, container);
    expect(container.textContent).toBe('morel');
    expect(renders).toBe(2);

    text[0] = 'portobello';
    component = ReactDOM.render(<Component text={text} />, container);
    expect(container.textContent).toBe('morel');
    expect(renders).toBe(2);

    // Setting state without changing it doesn't cause a rerender.
    component.setState({ type: 'mushrooms' });
    expect(container.textContent).toBe('morel');
    expect(renders).toBe(2);

    // But changing state does.
    component.setState({ type: 'portobello mushrooms' });
    expect(container.textContent).toBe('portobello');
    expect(renders).toBe(3);
  });

  it('should render when props or state mismatch in prop count', function () {
    let renders = 0;
    class Component extends React.PureComponent {
      constructor() {
        super();
        this.state = { type: 'mushrooms' };
      }

      shouldComponentUpdate(nextProps, state) {
        return super.shouldComponentUpdate(nextProps, state);
      }

      render() {
        renders++;
        return <div>{this.props.text[0]}</div>;
      }
    }

    const container = document.createElement('div');
    let text;
    let component;

    text = ['porcini'];
    component = ReactDOM.render(
      <Component foo={'bar'} text={text} />,
      container,
    );
    expect(container.textContent).toBe('porcini');
    expect(renders).toBe(1);

    component = ReactDOM.render(<Component text={text} />, container);
    expect(container.textContent).toBe('porcini');
    expect(renders).toBe(2);
  });

  it('can override shouldComponentUpdate', function () {
    let renders = 0;
    class Component extends React.PureComponent {
      render() {
        renders++;
        return <div />;
      }

      shouldComponentUpdate() {
        return true;
      }
    }
    const container = document.createElement('div');
    ReactDOM.render(<Component />, container);
    ReactDOM.render(<Component />, container);
    expect(renders).toBe(2);
  });

  it('extends React.Component', function () {
    let renders = 0;
    class Component extends React.PureComponent {
      render() {
        expect(this instanceof React.Component).toBe(true);
        expect(this instanceof React.PureComponent).toBe(true);
        renders++;
        return <div />;
      }
    }
    ReactDOM.render(<Component />, document.createElement('div'));
    expect(renders).toBe(1);
  });
});
