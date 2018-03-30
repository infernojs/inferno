import { Component, render } from 'inferno';
import { innerHTML } from 'inferno-utils';

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
    class Com extends Component<{value: number}> {
      public componentWillUpdate(nextProps, nextState) {
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

  it('Current state in componentWillUpdate should not equal nextState if setState is called from componentWillReceiveProps', done => {
    let doSomething;
    class Child extends Component<{active: boolean}> {
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

      public componentWillUpdate(nextProps, nextState) {
        expect(this.state.active).toBe(false);
        expect(nextState.active).toBe(true);
      }

      public render() {
        return <div>{this.state.active ? 'true' : 'false'}</div>;
      }
    }

    class Parent extends Component {
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
    doSomething();

    setTimeout(function() {
      done();
    }, 45);
  });

  it('shouldComponentUpdate Should have nextProp in params and old variants in instance', () => {
    let callCount = 0;
    class Com extends Component<{value: number}> {
      public shouldComponentUpdate(nextProps, nextState) {
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
    class Parent extends Component<{foo: boolean}> {
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

    class Com extends Component<{value: number}> {
      public componentDidUpdate(nextProps, nextState) {
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
    render(<Com ref={inst => {c = inst}} value={1} />, container);

    c.componentDidUpdate = undefined;

    // eslint-disable-next-line no-return-assign
    render(<Com ref={inst => (c = inst)} value={2} />, container);
  });
});
