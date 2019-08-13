import { Component, render, rerender } from 'inferno';
import { innerHTML } from 'inferno-utils';
import sinon from 'sinon';

describe('Component lifecycle', () => {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('componentWillUpdate Should have nextProp in params and old variants in instance', () => {
    let callCount = 0;
    class Com extends Component<{ value: number }> {
      public componentWillUpdate(nextProps) {
        callCount++;
        expect(this.props.value).toBe(1);
        expect(nextProps.value).toBe(2);
      }

      public render() {
        return <div>{this.props.value}</div>;
      }
    }

    render(<Com value={1} />, container);

    expect(innerHTML(container.innerHTML)).toBe(innerHTML('<div>1</div>'));

    render(<Com value={2} />, container);

    expect(callCount).toBe(1);
    expect(innerHTML(container.innerHTML)).toBe(innerHTML('<div>2</div>'));
  });

  it('Current state in componentWillUpdate should not equal nextState if setState is called from componentWillReceiveProps', () => {
    let doSomething;
    class Child extends Component<{ active: boolean }, { active: boolean }> {
      public state = {
        active: false
      };

      constructor() {
        super();
      }

      public componentWillReceiveProps(nextProps) {
        if (!this.props.active && nextProps.active) {
          this.setState({
            active: true
          });
        }
      }

      public componentWillUpdate(_nextProps, nextState) {
        expect(this.state.active).toBe(false);
        expect(nextState.active).toBe(true);
      }

      public render() {
        return <div>{this.state.active ? 'true' : 'false'}</div>;
      }
    }

    class Parent extends Component<{}, { active: boolean }> {
      public state = {
        active: false
      };

      constructor() {
        super();
        doSomething = this._setActive = this._setActive.bind(this);
      }

      public _setActive() {
        this.setState({
          active: true
        });
      }

      public render() {
        return (
          <div>
            <Child active={this.state.active} />
          </div>
        );
      }
    }

    render(<Parent />, container);

    expect(container.innerHTML).toBe('<div><div>false</div></div>');

    doSomething();

    rerender();

    expect(container.innerHTML).toBe('<div><div>true</div></div>');
  });

  it('shouldComponentUpdate Should have nextProp in params and old variants in instance', () => {
    let callCount = 0;
    class Com extends Component<{ value: number }> {
      public shouldComponentUpdate(nextProps) {
        callCount++;
        expect(this.props.value).toBe(1);
        expect(nextProps.value).toBe(2);

        return true;
      }

      public render() {
        return <div>{this.props.value}</div>;
      }
    }

    render(<Com value={1} />, container);

    expect(innerHTML(container.innerHTML)).toBe(innerHTML('<div>1</div>'));

    render(<Com value={2} />, container);

    expect(callCount).toBe(1);
    expect(innerHTML(container.innerHTML)).toBe(innerHTML('<div>2</div>'));
  });

  it('Should call componentWillUnmount before node is removed from DOM tree', () => {
    class Parent extends Component<{ foo: boolean }> {
      public render() {
        if (this.props.foo) {
          return (
            <div>
              <p>just to make it go removeAll</p>
              <Child />
            </div>
          );
        }

        return (
          <div>
            <p>just to make it go removeAll</p>
          </div>
        );
      }
    }

    class Child extends Component {
      private element: Element;

      public componentWillUnmount() {
        // verify its not removed from DOM tree yet.
        expect(this.element.parentElement != null ? this.element.parentElement.parentElement : null).toBe(container);
      }

      public render() {
        // eslint-disable-next-line
        return (
          <div className="foobar" ref={el => (this.element = el!)}>
            1
          </div>
        );
      }
    }

    render(<Parent foo={true} />, container);
    expect(container.querySelectorAll('.foobar').length).toBe(1);
    render(<Parent foo={false} />, container);
    // Verify the specific div is removed now
    expect(container.querySelectorAll('.foobar').length).toBe(0);
  });

  it('Should not fail if componentDidUpdate is undefined #922', () => {
    // @ts-ignore
    let callCount = 0;
    let c;

    class Com extends Component<{ value: number }> {
      public componentDidUpdate(nextProps) {
        callCount++;
        expect(this.props.value).toBe(1);
        expect(nextProps.value).toBe(2);

        return true;
      }

      public render() {
        return <div>{this.props.value}</div>;
      }
    }

    // eslint-disable-next-line no-return-assign
    render(
      <Com
        ref={inst => {
          c = inst;
        }}
        value={1}
      />,
      container
    );

    c.componentDidUpdate = undefined;

    // eslint-disable-next-line no-return-assign
    render(<Com ref={inst => (c = inst)} value={2} />, container);
  });
});

describe('legacy life cycle', () => {
  let consoleErrorStub;
  let container;

  beforeEach(() => {
    consoleErrorStub = sinon.stub(console, 'error');
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    consoleErrorStub.restore();
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('should warn when mix legacy life cycle with new ones', () => {
    /* tslint:disable:member-access no-empty */

    // build the component and element to be rendered
    class Foo extends Component {
      // just added to force the warnings
      static getDerivedStateFromProps() {}

      componentWillMount() {}

      componentWillReceiveProps() {}

      componentWillUpdate() {}

      render() {
        return <div>Foo</div>;
      }
    }

    const element = <Foo />;

    // render the element
    render(element, container);

    // retrieve the arguments of all calls for console.error
    // so multiple calls to console.error should not broke this test
    const callArgs = consoleErrorStub.getCalls().map(c => c.args.length && c.args[0]);

    // should have at least one warnings containing:
    // componentWillMount, componentWillReceiveProps, componentWillUpdate

    expect(callArgs.length).toBeGreaterThan(0);

    for (let i = 0; i < callArgs.length; i++) {
      expect(callArgs[i]).toMatch(/(componentWillMount)|(componentWillReceiveProps)|(componentWillUpdate)/);
    }

    /* tslint:enable:member-access no-empty */
  });

  it('should allow suppress legacy life cycles when mixed with new APIs', () => {
    /* tslint:disable:member-access no-empty */
    // build the component and element to be rendered
    class Foo extends Component {
      // just added to force the warnings
      static getDerivedStateFromProps() {}

      componentWillMount() {}

      componentWillReceiveProps() {}

      componentWillUpdate() {}

      render() {
        return <div>Foo</div>;
      }
    }
    // suppress the warnings
    // @ts-ignore
    Foo.prototype.componentWillMount.__suppressDeprecationWarning = true;
    // @ts-ignore
    Foo.prototype.componentWillReceiveProps.__suppressDeprecationWarning = true;
    // @ts-ignore
    Foo.prototype.componentWillUpdate.__suppressDeprecationWarning = true;

    const element = <Foo />;
    // render the element
    render(element, container);

    const callArgs = consoleErrorStub.getCalls().map(c => c.args.length && c.args[0]);

    for (let i = 0; i < callArgs.length; i++) {
      expect(callArgs[i]).not.toMatch(/(componentWillMount)|(componentWillReceiveProps)|(componentWillUpdate)/);
    }
    /* tslint:enable:member-access no-empty */
  });
});
