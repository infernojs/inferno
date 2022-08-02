import { render } from 'inferno';
import { createClass } from 'inferno-create-class';
import { createElement } from 'inferno-create-element';
import { innerHTML } from 'inferno-utils';

describe('Components createClass (non-JSX)', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    document.body.removeChild(container);
  });

  const BasicComponent = createClass({
    render() {
      return createElement('div', null, 'Hello world!');
    }
  });

  it('should render a basic component', () => {
    render(createElement(BasicComponent), container);
    expect(container.innerHTML).toBe('<div>Hello world!</div>');
  });
  it('should render a basic component with lifecycle', () => {
    let componentWillUpdate = false;
    const LifecycleComponent1 = createClass({
      componentWillUpdate() {
        componentWillUpdate = true;
      },
      render() {
        return createElement('div', null, 'Hello world!');
      }
    });

    render(createElement(LifecycleComponent1, {}), container);
    render(createElement(LifecycleComponent1, {}), container);
    expect(componentWillUpdate).toBe(true);
  });

  it('should have context available in getInitialState', (done) => {
    let context;
    let context2;
    const BoundComponent = createClass({
      getInitialState() {
        expect(this.context);
      },
      foo() {
        context2 = this;
      },
      render() {
        return createElement('div', null, 'Hello world!');
      }
    });

    render(createElement(BoundComponent), container);
    setTimeout(() => {
      expect(context === context2).toBe(true);
      done();
    }, 10);
  });

  it('should have propTypes on created class', () => {
    const propTypes = {
      value() {}
    };
    const Component = createClass({
      propTypes,
      render() {
        return createElement('div', null, 'Hello world!');
      }
    });

    expect(Component.propTypes).toBe(propTypes);
  });
  it('should not have propTypes on created class when not specified', () => {
    const Component = createClass({
      render() {
        return createElement('div', null, 'Hello world!');
      }
    });

    expect(Component.propTypes).toBeUndefined();
  });
  it('should have mixins on created class', () => {
    const mixins = [
      {
        func1: () => true
      }
    ];
    const Component = createClass({
      mixins,
      render() {
        return createElement('div', null, 'Hello world!');
      }
    });
    render(createElement(Component, {}), container);
    expect(Component.mixins.func1).toBeDefined();
  });
  it('should have nested mixins on created class', () => {
    const mixins = [
      {
        mixins: [
          {
            mixins: [
              {
                nestedMixin: () => true
              }
            ]
          }
        ]
      }
    ];
    const Component = createClass({
      mixins,
      render() {
        return createElement('div', null, 'Hello world!');
      }
    });
    render(createElement(Component, {}), container);
    expect(Component.mixins.nestedMixin).toBeDefined();
  });

  it('Should be possible to extend prototype by creating instance of class, Github #1380', () => {
    function TestMe() {}

    TestMe.prototype = {
      render() {
        return <div>It works!</div>;
      }
    };

    const TestMeComponent = createClass(new TestMe());

    render(<TestMeComponent />, container);

    expect(container.innerHTML).toBe('<div>It works!</div>');
  });
});
