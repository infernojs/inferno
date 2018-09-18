import { render, Component, options } from "inferno";


describe('top level context', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);

    options.componentComparator = null;
  });

  it('Should be possible to use custom component comparator to avoid replacing whole subtree', () => {
    class ComponentA extends Component<any, any> {
      constructor(props) {
        super(props);

        this.state = {
          abc: 123
        }
      }

      public render() {
        return <div>{this.state.abc}</div>
      }
    }

    class ComponentB extends Component<any, any> {
      constructor(props) {
        super(props);

        this.state = {
          abc: 333
        }
      }

      public render() {
        return <div>{this.state.abc} new</div>
      }
    }

    options.componentComparator = function () {
      // Simulate ComponentA being changed
      ComponentA.prototype.render = ComponentB.prototype.render;
      ComponentA.constructor = ComponentB.constructor;

      return false;
    };

    render(<ComponentA/>, container);

    expect(container.innerHTML).toBe('<div>123</div>');

    const oldNode = container.firstChild;

    render(<ComponentB/>, container);

    expect(container.innerHTML).toBe('<div>123 new</div>');

    expect(container.firstChild).toBe(oldNode)
  });

  it('Should be possible to use custom component comparator to avoid replacing whole subtree', () => {
    class ComponentA extends Component<any, any> {
      constructor(props) {
        super(props);

        this.state = {
          abc: 123
        }
      }

      public render() {
        return <div>{this.state.abc}</div>
      }
    }

    class ComponentB extends Component<any, any> {
      constructor(props) {
        super(props);

        this.state = {
          abc: 333
        }
      }

      public render() {
        return <div>{this.state.abc} new</div>
      }
    }

    options.componentComparator = function () {
      // Simulate ComponentA being changed
      ComponentA.prototype.render = ComponentB.prototype.render;
      ComponentA.constructor = ComponentB.constructor;

      return false;
    };

    render(<ComponentA/>, container);

    expect(container.innerHTML).toBe('<div>123</div>');

    const oldNode = container.firstChild;

    render(<ComponentB/>, container);

    expect(container.innerHTML).toBe('<div>123 new</div>');

    expect(container.firstChild).toBe(oldNode)
  });

  it('Should override keys, flags, reCreate', () => {
    class ComponentA extends Component<any, any> {
      constructor(props) {
        super(props);

        this.state = {
          abc: 123
        }
      }

      public render() {
        return <div>{this.state.abc}</div>
      }
    }

    class ComponentB extends Component<any, any> {
      constructor(props) {
        super(props);

        this.state = {
          abc: 333
        }
      }

      public render() {
        return <div>{this.state.abc} new</div>
      }
    }

    options.componentComparator = function () {
      // Simulate ComponentA being changed
      ComponentA.prototype.render = ComponentB.prototype.render;
      ComponentA.constructor = ComponentB.constructor;

      return false;
    };

    render(<ComponentA key={'a'} $ReCreate/>, container);

    expect(container.innerHTML).toBe('<div>123</div>');

    const oldNode = container.firstChild;

    render(<ComponentB key={'b'} $ReCreate/>, container);

    expect(container.innerHTML).toBe('<div>123 new</div>');

    expect(container.firstChild).toBe(oldNode)
  });

  it('Should do normal replace if comparator returns true', () => {
    class ComponentA extends Component<any, any> {
      constructor(props) {
        super(props);

        this.state = {
          abc: 123
        }
      }

      public render() {
        return <div>{this.state.abc}</div>
      }
    }

    class ComponentB extends Component<any, any> {
      constructor(props) {
        super(props);

        this.state = {
          abc: 333
        }
      }

      public render() {
        return <div>{this.state.abc} new</div>
      }
    }

    options.componentComparator = function () {
      // Simulate ComponentA being changed
      ComponentA.prototype.render = ComponentB.prototype.render;
      ComponentA.constructor = ComponentB.constructor;

      return true;
    };

    render(<ComponentA key={'a'} $ReCreate/>, container);

    expect(container.innerHTML).toBe('<div>123</div>');

    const oldNode = container.firstChild;

    render(<ComponentB key={'b'} $ReCreate/>, container);

    expect(container.innerHTML).toBe('<div>333 new</div>');

    expect(container.firstChild).not.toBe(oldNode)
  })
});
