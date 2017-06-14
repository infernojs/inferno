import { render } from "inferno";
import { innerHTML } from "inferno-utils";
import Component from "inferno-component";

describe("Component lifecycle", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = "";
    document.body.removeChild(container);
  });

  it("componentWillUpdate Should have nextProp in params and old variants in instance", () => {
    let callCount = 0;
    class Com extends Component {
      componentWillUpdate(nextProps, nextState) {
        callCount++;
        expect(this.props.value).toBe(1);
        expect(nextProps.value).toBe(2);
      }

      render() {
        return <div>{this.props.value}</div>;
      }
    }

    render(<Com value={1} />, container);

    expect(innerHTML(container.innerHTML)).toBe(innerHTML("<div>1</div>"));

    render(<Com value={2} />, container);

    expect(callCount).toBe(1);
    expect(innerHTML(container.innerHTML)).toBe(innerHTML("<div>2</div>"));
  });

  it("Current state in componentWillUpdate should not equal nextState if setState is called from componentWillReceiveProps", done => {
    let doSomething;
    class Child extends Component {
      constructor() {
        super();
        this.state = {
          active: false
        };
      }

      componentWillReceiveProps(nextProps) {
        if (!this.props.active && nextProps.active) {
          this.setState({
            active: true
          });
        }
      }

      componentWillUpdate(nextProps, nextState) {
        expect(this.state.active).toBe(false);
        expect(nextState.active).toBe(true);
      }

      render() {
        return <div>{this.state.active ? "true" : "false"}</div>;
      }
    }

    class Parent extends Component {
      constructor() {
        super();
        this.state = {
          active: false
        };
        doSomething = this._setActive = this._setActive.bind(this);
      }

      _setActive() {
        this.setState({
          active: true
        });
      }

      render() {
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

  it("shouldComponentUpdate Should have nextProp in params and old variants in instance", () => {
    let callCount = 0;
    class Com extends Component {
      shouldComponentUpdate(nextProps, nextState) {
        callCount++;
        expect(this.props.value).toBe(1);
        expect(nextProps.value).toBe(2);

        return true;
      }

      render() {
        return <div>{this.props.value}</div>;
      }
    }

    render(<Com value={1} />, container);

    expect(innerHTML(container.innerHTML)).toBe(innerHTML("<div>1</div>"));

    render(<Com value={2} />, container);

    expect(callCount).toBe(1);
    expect(innerHTML(container.innerHTML)).toBe(innerHTML("<div>2</div>"));
  });

  it("Should call componentWillUnmount before node is removed from DOM tree", () => {
    class Parent extends Component {
      render() {
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
      componentWillUnmount() {
        // verify its not removed from DOM tree yet.
        expect(this.element.parentElement.parentElement).toBe(container);
      }

      render() {
        // eslint-disable-next-line
        return <div className="foobar" ref={el => (this.element = el)}>1</div>;
      }
    }

    render(<Parent foo={true} />, container);
    expect(container.querySelectorAll(".foobar").length).toBe(1);
    render(<Parent foo={false} />, container);
    // Verify the specific div is removed now
    expect(container.querySelectorAll(".foobar").length).toBe(0);
  });

  it("Should not fail if componentDidUpdate is undefined #922", () => {
    let callCount = 0;
    let c = null;

    class Com extends Component {
      componentDidUpdate(nextProps, nextState) {
        callCount++;
        expect(this.props.value).toBe(1);
        expect(nextProps.value).toBe(2);

        return true;
      }

      render() {
        return <div>{this.props.value}</div>;
      }
    }

    // eslint-disable-next-line no-return-assign
    render(<Com ref={inst => (c = inst)} value={1} />, container);

    c.componentDidUpdate = undefined;

    // eslint-disable-next-line no-return-assign
    render(<Com ref={inst => (c = inst)} value={2} />, container);
  });
});
