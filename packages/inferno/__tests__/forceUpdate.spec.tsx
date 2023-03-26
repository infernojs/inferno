import { Component, render, rerender } from 'inferno';

describe('forceUpdate', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    rerender(); // Flush pending stuff, if any
    render(null, container);
    document.body.removeChild(container);
    container.innerHTML = '';
  });

  // https://jsfiddle.net/pnwLh7au/
  it('Should have new state in render when changed state during setState + forceUpdate inside lifecycle methods and render only once', () => {
    let updated = 0;

    class Parent extends Component {
      public render() {
        return (
          <div>
            <Child />
          </div>
        );
      }
    }

    class Child extends Component {
      public state = {
        foo: 'bar'
      };

      public componentDidMount() {
        this.setState({
          foo: 'bar2'
        });
        this.forceUpdate();
      }

      public componentDidUpdate() {
        updated++;
      }

      public render() {
        return <div>{this.state.foo}</div>;
      }
    }

    render(<Parent />, container);
    expect(container.firstChild.firstChild.innerHTML).toBe('bar');

    rerender();

    expect(container.firstChild.firstChild.innerHTML).toBe('bar2');
    expect(updated).toBe(1);
  });

  it('Should ignore shouldComponentUpdate when forceUpdate called like React does', () => {
    let updated = 0;

    class Parent extends Component {
      public render() {
        return (
          <div>
            <Child />
          </div>
        );
      }
    }

    class Child extends Component {
      public state = {
        foo: 'bar'
      };

      public shouldComponentUpdate(_prevProps, prevState) {
        if (prevState.foo !== this.state.foo) {
          return true;
        }
        return false;
      }

      public componentDidMount() {
        this.forceUpdate();
      }

      public render() {
        updated++;
        return <div>{this.state.foo}</div>;
      }
    }

    render(<Parent />, container);
    expect(container.firstChild.firstChild.innerHTML).toBe('bar');
    expect(updated).toBe(1);

    rerender();

    expect(container.firstChild.firstChild.innerHTML).toBe('bar');
    expect(updated).toBe(2);
  });

  // As per React https://jsfiddle.net/pnwLh7au/
  // React has a different flow when setState is called outside lifecycle methods or event handlers (https://jsfiddle.net/egd1kuz6/),
  // but inferno has another flow for setState and Inferno.
  // Inferno collapses several `setState` even if they are called outside event listeners or lifecycle methods. So forceUpdate follows it
  it('Should use the updated state when forceUpdate called like React does even if shouldComponentUpdate ignores it', () => {
    let updated = 0;

    class Parent extends Component {
      public render() {
        return (
          <div>
            <Child />
          </div>
        );
      }
    }

    class Child extends Component {
      public state = {
        foo: 'bar'
      };

      public shouldComponentUpdate() {
        return false;
      }

      public componentDidMount() {
        this.setState({ foo: 'bar2' });
        this.forceUpdate();
      }

      public render() {
        updated++;
        return <div>{this.state.foo}</div>;
      }
    }

    render(<Parent />, container);
    expect(container.firstChild.firstChild.innerHTML).toBe('bar');
    expect(updated).toBe(1);

    rerender();

    expect(container.firstChild.firstChild.innerHTML).toBe('bar2');
    expect(updated).toBe(2);
  });

  // As per React https://jsfiddle.net/pnwLh7au/
  it('Should use the updated state when forceUpdate called before setState like React does even if shouldComponentUpdate ignores it', () => {
    let updated = 0;

    class Parent extends Component {
      public render() {
        return (
          <div>
            <Child />
          </div>
        );
      }
    }

    class Child extends Component {
      public state = {
        foo: 'bar'
      };

      public shouldComponentUpdate() {
        return false;
      }

      public componentDidMount() {
        this.forceUpdate();
        this.setState({ foo: 'bar2' });
      }

      public render() {
        updated++;
        return <div>{this.state.foo}</div>;
      }
    }

    render(<Parent />, container);
    expect(container.firstChild.firstChild.innerHTML).toBe('bar');
    expect(updated).toBe(1);

    rerender();

    expect(container.firstChild.firstChild.innerHTML).toBe('bar2');
    expect(updated).toBe(2);
  });
});
