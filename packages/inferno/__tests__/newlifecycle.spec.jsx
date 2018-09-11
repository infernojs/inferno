import { render, Component, rerender } from 'inferno';
import sinon from 'sinon';

describe('Lifecycle methods', () => {
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

  it('should call nested new lifecycle methods in the right order', () => {
    let updateOuterState;
    let updateInnerState;
    let forceUpdateOuter;
    let forceUpdateInner;

    let log;
    const logger = function(msg) {
      return function() {
        // return true for shouldComponentUpdate
        log.push(msg);
        return true;
      };
    };

    class Outer extends Component {
      static getDerivedStateFromProps() {
        log.push('outer getDerivedStateFromProps');
        return null;
      }
      constructor() {
        super();
        log.push('outer constructor');

        this.state = { value: 0 };
        forceUpdateOuter = () => this.forceUpdate();
        updateOuterState = () =>
          this.setState({
            value: (this.state.value + 1) % 2
          });
      }
      render() {
        log.push('outer render');
        return (
          <div>
            <Inner x={this.props.x} outerValue={this.state.value} />
          </div>
        );
      }
    }
    Object.assign(Outer.prototype, {
      componentDidMount: logger('outer componentDidMount'),
      shouldComponentUpdate: logger('outer shouldComponentUpdate'),
      getSnapshotBeforeUpdate: logger('outer getSnapshotBeforeUpdate'),
      componentDidUpdate: logger('outer componentDidUpdate'),
      componentWillUnmount: logger('outer componentWillUnmount')
    });

    class Inner extends Component {
      static getDerivedStateFromProps() {
        log.push('inner getDerivedStateFromProps');
        return null;
      }
      constructor() {
        super();
        log.push('inner constructor');

        this.state = { value: 0 };
        forceUpdateInner = () => this.forceUpdate();
        updateInnerState = () =>
          this.setState({
            value: (this.state.value + 1) % 2
          });
      }
      render() {
        log.push('inner render');
        return (
          <span>
            {this.props.x} {this.props.outerValue} {this.state.value}
          </span>
        );
      }
    }
    Object.assign(Inner.prototype, {
      componentDidMount: logger('inner componentDidMount'),
      shouldComponentUpdate: logger('inner shouldComponentUpdate'),
      getSnapshotBeforeUpdate: logger('inner getSnapshotBeforeUpdate'),
      componentDidUpdate: logger('inner componentDidUpdate'),
      componentWillUnmount: logger('inner componentWillUnmount')
    });

    // Constructor & mounting
    log = [];
    render(<Outer x={1} />, container);
    expect(log).toEqual([
      'outer constructor',
      'outer getDerivedStateFromProps',
      'outer render',
      'inner constructor',
      'inner getDerivedStateFromProps',
      'inner render',
      'inner componentDidMount',
      'outer componentDidMount'
    ]);

    // Outer & Inner props update
    log = [];
    render(<Outer x={2} />, container);
    // Note: we differ from react here in that we apply changes to the dom
    // as we find them while diffing. React on the other hand separates this
    // into specific phases, meaning changes to the dom are only flushed
    // once the whole diff-phase is complete. This is why
    // "outer getSnapshotBeforeUpdate" is called just before the "inner" hooks.
    // For react this call would be right before "outer componentDidUpdate"
    expect(log).toEqual([
      'outer getDerivedStateFromProps',
      'outer shouldComponentUpdate',
      'outer render',
      'outer getSnapshotBeforeUpdate',
      'inner getDerivedStateFromProps',
      'inner shouldComponentUpdate',
      'inner render',
      'inner getSnapshotBeforeUpdate',
      'inner componentDidUpdate',
      'outer componentDidUpdate'
    ]);

    // Outer state update & Inner props update
    log = [];
    updateOuterState();
    rerender();
    expect(log).toEqual([
      'outer getDerivedStateFromProps',
      'outer shouldComponentUpdate',
      'outer render',
      'outer getSnapshotBeforeUpdate',
      'inner getDerivedStateFromProps',
      'inner shouldComponentUpdate',
      'inner render',
      'inner getSnapshotBeforeUpdate',
      'inner componentDidUpdate',
      'outer componentDidUpdate'
    ]);

    // Inner state update
    log = [];
    updateInnerState();
    rerender();
    expect(log).toEqual([
      'inner getDerivedStateFromProps',
      'inner shouldComponentUpdate',
      'inner render',
      'inner getSnapshotBeforeUpdate',
      'inner componentDidUpdate'
    ]);

    // Force update Outer
    log = [];
    forceUpdateOuter();
    rerender();
    expect(log).toEqual([
      'outer getDerivedStateFromProps',
      'outer render',
      'outer getSnapshotBeforeUpdate',
      'inner getDerivedStateFromProps',
      'inner shouldComponentUpdate',
      'inner render',
      'inner getSnapshotBeforeUpdate',
      'inner componentDidUpdate',
      'outer componentDidUpdate'
    ]);

    // Force update Inner
    log = [];
    forceUpdateInner();
    rerender();
    expect(log).toEqual(['inner getDerivedStateFromProps', 'inner render', 'inner getSnapshotBeforeUpdate', 'inner componentDidUpdate']);

    // Unmounting Outer & Inner
    log = [];
    render(<table />, container);
    expect(log).toEqual(['outer componentWillUnmount', 'inner componentWillUnmount']);
  });

  describe('static getDerivedStateFromProps', () => {
    it('should set initial state with value returned from getDerivedStateFromProps', () => {
      class Foo extends Component {
        static getDerivedStateFromProps(nextProps) {
          return {
            foo: nextProps.foo,
            bar: 'bar'
          };
        }
        render() {
          return <div className={`${this.state.foo} ${this.state.bar}`} />;
        }
      }

      render(<Foo foo="foo" />, container);
      expect(container.firstChild.className).toEqual('foo bar');
    });

    it('should update initial state with value returned from getDerivedStateFromProps', () => {
      class Foo extends Component {
        constructor(props, context) {
          super(props, context);
          this.state = {
            foo: 'foo',
            bar: 'bar'
          };
        }
        static getDerivedStateFromProps(nextProps, prevState) {
          return {
            foo: `not-${prevState.foo}`
          };
        }
        render() {
          return <div className={`${this.state.foo} ${this.state.bar}`} />;
        }
      }

      render(<Foo />, container);
      expect(container.firstChild.className).toEqual('not-foo bar');
    });

    it("should update the instance's state with the value returned from getDerivedStateFromProps when props change", () => {
      class Foo extends Component {
        constructor(props, context) {
          super(props, context);
          this.state = {
            value: 'initial'
          };
        }
        static getDerivedStateFromProps(nextProps) {
          if (nextProps.update) {
            return {
              value: 'updated'
            };
          }

          return null;
        }
        componentDidMount() {}
        componentDidUpdate() {}
        render() {
          return <div className={this.state.value} />;
        }
      }

      sinon.spy(Foo, 'getDerivedStateFromProps');
      sinon.spy(Foo.prototype, 'componentDidMount');
      sinon.spy(Foo.prototype, 'componentDidUpdate');

      render(<Foo update={false} />, container);
      expect(container.firstChild.className).toEqual('initial');
      expect(Foo.getDerivedStateFromProps.callCount).toBe(1);
      expect(Foo.prototype.componentDidMount.callCount).toBe(1); // verify mount occurred
      expect(Foo.prototype.componentDidUpdate.callCount).toBe(0);

      render(<Foo update={true} />, container);
      expect(container.firstChild.className).toEqual('updated');
      expect(Foo.getDerivedStateFromProps.callCount).toBe(2);
      expect(Foo.prototype.componentDidMount.callCount).toBe(1);
      expect(Foo.prototype.componentDidUpdate.callCount).toBe(1); // verify update occurred
    });

    it("should update the instance's state with the value returned from getDerivedStateFromProps when state changes", () => {
      class Foo extends Component {
        constructor(props, context) {
          super(props, context);
          this.state = {
            value: 'initial'
          };
        }
        static getDerivedStateFromProps(nextProps, prevState) {
          // Don't change state for call that happens after the constructor
          if (prevState.value === 'initial') {
            return null;
          }

          return {
            value: prevState.value + ' derived'
          };
        }
        componentDidMount() {
          this.setState({ value: 'updated' });
        }
        render() {
          return <div className={this.state.value} />;
        }
      }

      sinon.spy(Foo, 'getDerivedStateFromProps');

      render(<Foo />, container);
      expect(container.firstChild.className).toEqual('initial');
      expect(Foo.getDerivedStateFromProps.callCount).toBe(1);

      rerender(); // call rerender to handle cDM setState call
      expect(container.firstChild.className).toEqual('updated derived');
      expect(Foo.getDerivedStateFromProps.callCount).toBe(2);
    });

    it('should NOT modify state if null is returned', () => {
      class Foo extends Component {
        constructor(props, context) {
          super(props, context);
          this.state = {
            foo: 'foo',
            bar: 'bar'
          };
        }
        static getDerivedStateFromProps() {
          return null;
        }
        render() {
          return <div className={`${this.state.foo} ${this.state.bar}`} />;
        }
      }

      sinon.spy(Foo, 'getDerivedStateFromProps');

      render(<Foo />, container);
      expect(container.firstChild.className).toEqual('foo bar');
      expect(Foo.getDerivedStateFromProps.callCount).toBe(1);
    });

    // NOTE: Difference from React
    // React v16.3.2 warns if undefined if returned from getDerivedStateFromProps
    it('should NOT modify state if undefined is returned', () => {
      class Foo extends Component {
        constructor(props, context) {
          super(props, context);
          this.state = {
            foo: 'foo',
            bar: 'bar'
          };
        }
        static getDerivedStateFromProps() {}
        render() {
          return <div className={`${this.state.foo} ${this.state.bar}`} />;
        }
      }

      sinon.spy(Foo, 'getDerivedStateFromProps');

      render(<Foo />, container);
      expect(container.firstChild.className).toEqual('foo bar');
      expect(Foo.getDerivedStateFromProps.callCount).toBe(1);
    });

    it('should NOT invoke deprecated lifecycles (cWM/cWRP) if new static gDSFP is present', () => {
      class Foo extends Component {
        static getDerivedStateFromProps() {}
        componentWillMount() {}
        componentWillReceiveProps() {}
        render() {
          return <div />;
        }
      }

      sinon.spy(Foo, 'getDerivedStateFromProps');
      sinon.spy(Foo.prototype, 'componentWillMount');
      sinon.spy(Foo.prototype, 'componentWillReceiveProps');

      render(<Foo />, container);
      expect(Foo.getDerivedStateFromProps.callCount).toBe(1);
      expect(Foo.prototype.componentWillMount.callCount).toBe(0);
      expect(Foo.prototype.componentWillReceiveProps.callCount).toBe(0);
    });

    it('is not called if neither state nor props have changed', () => {
      let logs = [];
      let childRef;

      class Parent extends Component {
        constructor(props) {
          super(props);
          this.state = { parentRenders: 0 };
        }

        static getDerivedStateFromProps(props, prevState) {
          logs.push('parent getDerivedStateFromProps');
          return prevState.parentRenders + 1;
        }

        render() {
          logs.push('parent render');
          return <Child parentRenders={this.state.parentRenders} ref={child => (childRef = child)} />;
        }
      }

      class Child extends Component {
        render() {
          logs.push('child render');
          return this.props.parentRenders;
        }
      }

      render(<Parent />, container);
      expect(logs).toEqual(['parent getDerivedStateFromProps', 'parent render', 'child render']);

      logs = [];
      childRef.setState({});
      rerender();
      expect(logs).toEqual(['child render']);
    });

    it('should be passed next props and state', () => {
      let updateState;

      let propsArg;
      let stateArg;

      class Foo extends Component {
        constructor(props) {
          super(props);
          this.state = {
            value: 0
          };
          updateState = () =>
            this.setState({
              value: this.state.value + 1
            });
        }
        static getDerivedStateFromProps(props, state) {
          // These object references might be updated later so copy
          // object so we can assert their values at this snapshot in time
          propsArg = { ...props };
          stateArg = { ...state };

          // NOTE: Don't do this in real production code!
          // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
          return {
            value: state.value + 1
          };
        }
        render() {
          return <div>{this.state.value}</div>;
        }
      }

      // Initial render
      // state.value: initialized to 0 in constructor, 0 -> 1 in gDSFP

      render(<Foo foo="foo" />, container);
      expect(container.firstChild.textContent).toEqual('1');
      expect(propsArg).toEqual({
        foo: 'foo'
      });
      expect(stateArg).toEqual({
        value: 0
      });

      // New Props
      // state.value: 1 -> 2 in gDSFP
      render(<Foo foo="bar" />, container);
      expect(container.firstChild.textContent).toEqual('2');
      expect(propsArg).toEqual({
        foo: 'bar'
      });
      expect(stateArg).toEqual({
        value: 1
      });

      // New state
      // state.value: 2 -> 3 in updateState, 3
      updateState();
      rerender();
      expect(container.firstChild.textContent).toEqual('4');
      expect(propsArg).toEqual({
        foo: 'bar'
      });
      expect(stateArg).toEqual({
        value: 3
      });
    });

    it('should NOT mutate state, only create new versions', () => {
      const stateConstant = {};
      let componentState;

      class Stateful extends Component {
        static getDerivedStateFromProps() {
          return { key: 'value' };
        }

        constructor() {
          super(...arguments);
          this.state = stateConstant;
        }

        componentDidMount() {
          componentState = this.state;
        }
      }

      render(<Stateful />, container);

      expect(componentState).toEqual({ key: 'value' });
      expect(stateConstant).toEqual({});
    });
  });

  describe('#getSnapshotBeforeUpdate', () => {
    it('should pass the return value from getSnapshotBeforeUpdate to componentDidUpdate', () => {
      let log = [];

      class MyComponent extends Component {
        constructor(props) {
          super(props);
          this.state = {
            value: 0
          };
        }
        static getDerivedStateFromProps(nextProps, prevState) {
          return {
            value: prevState.value + 1
          };
        }
        getSnapshotBeforeUpdate(prevProps, prevState) {
          log.push(`getSnapshotBeforeUpdate() prevProps:${prevProps.value} prevState:${prevState.value}`);
          return 'abc';
        }
        componentDidUpdate(prevProps, prevState, snapshot) {
          log.push(`componentDidUpdate() prevProps:${prevProps.value} prevState:${prevState.value} snapshot:${snapshot}`);
        }
        render() {
          log.push('render');
          return null;
        }
      }

      render(<MyComponent value="foo" />, container);
      expect(log).toEqual(['render']);
      log = [];

      render(<MyComponent value="bar" />, container);
      expect(log).toEqual(['render', 'getSnapshotBeforeUpdate() prevProps:foo prevState:1', 'componentDidUpdate() prevProps:foo prevState:1 snapshot:abc']);
      log = [];

      render(<MyComponent value="baz" />, container);
      expect(log).toEqual(['render', 'getSnapshotBeforeUpdate() prevProps:bar prevState:2', 'componentDidUpdate() prevProps:bar prevState:2 snapshot:abc']);
      log = [];

      render(<div />, container);
      expect(log).toEqual([]);
    });

    it('should call getSnapshotBeforeUpdate before mutations are committed', () => {
      let log = [];

      class MyComponent extends Component {
        getSnapshotBeforeUpdate(prevProps) {
          log.push('getSnapshotBeforeUpdate');
          expect(this.divRef.textContent).toEqual(`value:${prevProps.value}`);
          return 'foobar';
        }
        componentDidUpdate(prevProps, prevState, snapshot) {
          log.push('componentDidUpdate');
          expect(this.divRef.textContent).toEqual(`value:${this.props.value}`);
          expect(snapshot).toEqual('foobar');
        }
        render() {
          log.push('render');
          return <div ref={ref => (this.divRef = ref)}>{`value:${this.props.value}`}</div>;
        }
      }

      render(<MyComponent value="foo" />, container);
      expect(log).toEqual(['render']);
      log = [];

      render(<MyComponent value="bar" />, container);
      expect(log).toEqual(['render', 'getSnapshotBeforeUpdate', 'componentDidUpdate']);
    });

    it('should be passed the previous props and state', () => {
      let updateState;
      let prevPropsArg;
      let prevStateArg;
      let curProps;
      let curState;

      class Foo extends Component {
        constructor(props) {
          super(props);
          this.state = {
            value: 0
          };
          updateState = () =>
            this.setState({
              value: this.state.value + 1
            });
        }
        static getDerivedStateFromProps(props, state) {
          // NOTE: Don't do this in real production code!
          // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
          return {
            value: state.value + 1
          };
        }
        getSnapshotBeforeUpdate(prevProps, prevState) {
          // These object references might be updated later so copy
          // object so we can assert their values at this snapshot in time
          prevPropsArg = { ...prevProps };
          prevStateArg = { ...prevState };

          curProps = { ...this.props };
          curState = { ...this.state };
        }
        render() {
          return <div>{this.state.value}</div>;
        }
      }

      // Expectation:
      // `prevState` in getSnapshotBeforeUpdate should be
      // the state before setState or getDerivedStateFromProps was called.
      // `this.state` in getSnapshotBeforeUpdate should be
      // the updated state after getDerivedStateFromProps was called.

      // Initial render
      // state.value: initialized to 0 in constructor, 0 -> 1 in gDSFP
      render(<Foo foo="foo" />, container);
      expect(container.firstChild.textContent).toEqual('1');
      expect(prevPropsArg).toBeUndefined();
      expect(prevStateArg).toBeUndefined();
      expect(curProps).toBeUndefined();
      expect(curState).toBeUndefined();

      // New props
      // state.value: 1 -> 2 in gDSFP
      render(<Foo foo="bar" />, container);
      expect(container.firstChild.textContent).toEqual('2');
      expect(prevPropsArg).toEqual({
        foo: 'foo'
      });
      expect(prevStateArg).toEqual({
        value: 1
      });
      expect(curProps).toEqual({
        foo: 'bar'
      });
      expect(curState).toEqual({
        value: 2
      });

      // New state
      // state.value: 2 -> 3 in updateState, 3
      updateState();
      rerender();
      expect(container.firstChild.textContent).toEqual('4');
      expect(prevPropsArg).toEqual({
        foo: 'bar'
      });
      expect(prevStateArg).toEqual({
        value: 2
      });
      expect(curProps).toEqual({
        foo: 'bar'
      });
      expect(curState).toEqual({
        value: 4
      });
    });
  });

  describe('#componentWillUpdate', () => {
    it('should NOT be called on initial render', () => {
      class ReceivePropsComponent extends Component {
        componentWillUpdate() {}
        render() {
          return <div />;
        }
      }
      sinon.spy(ReceivePropsComponent.prototype, 'componentWillUpdate');
      render(<ReceivePropsComponent />, container);
      expect(ReceivePropsComponent.prototype.componentWillUpdate.callCount).toBe(0);
    });

    it('should be called when rerender with new props from parent', () => {
      let doRender;
      class Outer extends Component {
        constructor(p, c) {
          super(p, c);
          this.state = { i: 0 };
        }
        componentDidMount() {
          doRender = () => this.setState({ i: this.state.i + 1 });
        }
        render(props, { i }) {
          return <Inner i={i} {...props} />;
        }
      }
      class Inner extends Component {
        componentWillUpdate(nextProps, nextState) {
          expect(nextProps).toEqual({ i: 1 });
          expect(nextState).toBe(null);
        }
        render() {
          return <div />;
        }
      }
      sinon.spy(Inner.prototype, 'componentWillUpdate');
      sinon.spy(Outer.prototype, 'componentDidMount');

      // Initial render
      render(<Outer />, container);
      expect(Inner.prototype.componentWillUpdate.callCount).toBe(0);

      // Rerender inner with new props
      doRender();
      rerender();
      expect(Inner.prototype.componentWillUpdate.callCount).toBe(1);
    });

    it('should be called on new state', () => {
      let doRender;
      class ReceivePropsComponent extends Component {
        constructor(props) {
          super(props);

          this.state = {
            i: 0
          };
        }

        componentWillUpdate() {}
        componentDidMount() {
          doRender = () => this.setState({ i: this.state.i + 1 });
        }
        render() {
          return <div />;
        }
      }
      sinon.spy(ReceivePropsComponent.prototype, 'componentWillUpdate');
      render(<ReceivePropsComponent />, container);
      expect(ReceivePropsComponent.prototype.componentWillUpdate.callCount).toBe(0);

      doRender();
      rerender();
      expect(ReceivePropsComponent.prototype.componentWillUpdate.callCount).toBe(1);
    });

    it('should be called after children are mounted', () => {
      let log = [];

      class Inner extends Component {
        componentDidMount() {
          log.push('Inner mounted');

          // Verify that the component is actually mounted when this
          // callback is invoked.
          expect(container.querySelector('#inner')).toEqual(this.$LI.dom);
        }

        render() {
          return <div id="inner" />;
        }
      }

      class Outer extends Component {
        componentDidUpdate() {
          log.push('Outer updated');
        }

        render(props) {
          return props.renderInner ? <Inner /> : <div />;
        }
      }

      const elem = render(<Outer renderInner={false} />, container);
      render(<Outer renderInner={true} />, container, elem);

      // expect(log).toEqual(['Inner mounted', 'Outer updated']);
    });
  });

  describe('#componentWillReceiveProps', () => {
    it('should NOT be called on initial render', () => {
      class ReceivePropsComponent extends Component {
        componentWillReceiveProps() {}
        render() {
          return <div />;
        }
      }
      sinon.spy(ReceivePropsComponent.prototype, 'componentWillReceiveProps');
      render(<ReceivePropsComponent />, container);
      expect(ReceivePropsComponent.prototype.componentWillReceiveProps.callCount).toBe(0);
    });

    it('should be called when rerender with new props from parent', () => {
      let doRender;
      class Outer extends Component {
        constructor(p, c) {
          super(p, c);
          this.state = { i: 0 };
        }
        componentDidMount() {
          doRender = () => this.setState({ i: this.state.i + 1 });
        }
        render(props, { i }) {
          return <Inner i={i} {...props} />;
        }
      }
      class Inner extends Component {
        componentWillMount() {
          expect(this.props.i).toEqual(0);
        }
        componentWillReceiveProps(nextProps) {
          expect(nextProps.i).toEqual(1);
        }
        render() {
          return <div />;
        }
      }
      sinon.spy(Inner.prototype, 'componentWillReceiveProps');
      sinon.spy(Outer.prototype, 'componentDidMount');

      // Initial render
      render(<Outer />, container);
      expect(Inner.prototype.componentWillReceiveProps.callCount).toBe(0);

      // Rerender inner with new props
      doRender();
      rerender();
      expect(Inner.prototype.componentWillReceiveProps.callCount).toBe(1);
    });

    it('should be called in right execution order', () => {
      let doRender;
      class Outer extends Component {
        constructor(p, c) {
          super(p, c);
          this.state = { i: 0 };
        }
        componentDidMount() {
          doRender = () => this.setState({ i: this.state.i + 1 });
        }
        render(props, { i }) {
          return <Inner i={i} {...props} />;
        }
      }

      class Inner extends Component {
        componentDidUpdate() {
          expect(cwrpSpy.callCount).toBe(1);
          expect(cwuSpy.callCount).toBe(1);
        }
        componentWillReceiveProps() {
          expect(cwuSpy.callCount).toBe(0);
          expect(cduSpy.callCount).toBe(0);
        }
        componentWillUpdate() {
          expect(cwrpSpy.callCount).toBe(1);
          expect(cduSpy.callCount).toBe(0);
        }
        render() {
          return <div />;
        }
      }

      const cwrpSpy = sinon.spy(Inner.prototype, 'componentWillReceiveProps');
      const cduSpy = sinon.spy(Inner.prototype, 'componentDidUpdate');
      const cwuSpy = sinon.spy(Inner.prototype, 'componentWillUpdate');
      const cdmSpy = sinon.spy(Outer.prototype, 'componentDidMount');

      render(<Outer />, container);
      doRender();
      rerender();

      cwrpSpy.calledBefore(cwuSpy);
      cwuSpy.calledBefore(cduSpy);

      expect(cdmSpy.callCount).toBe(1);
    });
  });

  describe('#componentDidUpdate', () => {
    it('should be passed previous props and state', () => {
      let updateState;

      let prevPropsArg;
      let prevStateArg;
      let curProps;
      let curState;

      class Foo extends Component {
        constructor(props) {
          super(props);
          this.state = {
            value: 0
          };
          updateState = () =>
            this.setState({
              value: this.state.value + 1
            });
        }
        static getDerivedStateFromProps(props, state) {
          // NOTE: Don't do this in real production code!
          // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
          return {
            value: state.value + 1
          };
        }
        componentDidUpdate(prevProps, prevState) {
          // These object references might be updated later so copy
          // object so we can assert their values at this snapshot in time
          prevPropsArg = { ...prevProps };
          prevStateArg = { ...prevState };

          curProps = { ...this.props };
          curState = { ...this.state };
        }
        render() {
          return <div>{this.state.value}</div>;
        }
      }

      // Expectation:
      // `prevState` in componentDidUpdate should be
      // the state before setState and getDerivedStateFromProps was called.
      // `this.state` in componentDidUpdate should be
      // the updated state after getDerivedStateFromProps was called.

      // Initial render
      // state.value: initialized to 0 in constructor, 0 -> 1 in gDSFP
      render(<Foo foo="foo" />, container);
      expect(container.firstChild.textContent).toEqual('1');
      expect(prevPropsArg).toBeUndefined();
      expect(prevStateArg).toBeUndefined();
      expect(curProps).toBeUndefined();
      expect(curState).toBeUndefined();

      // New props
      // state.value: 1 -> 2 in gDSFP
      render(<Foo foo="bar" />, container);
      expect(container.firstChild.textContent).toEqual('2');
      expect(prevPropsArg).toEqual({
        foo: 'foo'
      });
      expect(prevStateArg).toEqual({
        value: 1
      });
      expect(curProps).toEqual({
        foo: 'bar'
      });
      expect(curState).toEqual({
        value: 2
      });

      // New state
      // state.value: 2 -> 3 in updateState, 3
      updateState();
      rerender();
      expect(container.firstChild.textContent).toEqual('4');
      expect(prevPropsArg).toEqual({
        foo: 'bar'
      });
      expect(prevStateArg).toEqual({
        value: 2
      });
      expect(curProps).toEqual({
        foo: 'bar'
      });
      expect(curState).toEqual({
        value: 4
      });
    });

    it("prevState argument should be the same object if state doesn't change", () => {
      let changeProps, cduPrevState, cduCurrentState;

      class PropsProvider extends Component {
        constructor() {
          super();
          this.state = { value: 0 };
          changeProps = this.changeReceiverProps.bind(this);
        }
        changeReceiverProps() {
          let value = (this.state.value + 1) % 2;
          this.setState({
            value
          });
        }
        render() {
          return <PropsReceiver value={this.state.value} />;
        }
      }

      class PropsReceiver extends Component {
        componentDidUpdate(prevProps, prevState) {
          cduPrevState = prevState;
          cduCurrentState = this.state;
        }
        render({ value }) {
          return <div>{value}</div>;
        }
      }

      render(<PropsProvider />, container);

      changeProps();
      rerender();

      expect(cduPrevState).toEqual(cduCurrentState);
    });

    it('prevState argument should be a different object if state does change', () => {
      let updateState, cduPrevState, cduCurrentState;

      class Foo extends Component {
        constructor() {
          super();
          this.state = { value: 0 };
          updateState = this.updateState.bind(this);
        }
        updateState() {
          let value = (this.state.value + 1) % 2;
          this.setState({
            value
          });
        }
        componentDidUpdate(prevProps, prevState) {
          cduPrevState = prevState;
          cduCurrentState = this.state;
        }
        render() {
          return <div>{this.state.value}</div>;
        }
      }

      render(<Foo />, container);

      updateState();
      rerender();

      expect(cduPrevState).not.toEqual(cduCurrentState);
    });

    it("prevProps argument should be the same object if props don't change", () => {
      let updateState, cduPrevProps, cduCurrentProps;

      class Foo extends Component {
        constructor() {
          super();
          this.state = { value: 0 };
          updateState = this.updateState.bind(this);
        }
        updateState() {
          let value = (this.state.value + 1) % 2;
          this.setState({
            value
          });
        }
        componentDidUpdate(prevProps) {
          cduPrevProps = prevProps;
          cduCurrentProps = this.props;
        }
        render() {
          return <div>{this.state.value}</div>;
        }
      }

      render(<Foo />, container);

      updateState();
      rerender();

      expect(cduPrevProps).toEqual(cduCurrentProps);
    });

    it('prevProps argument should be a different object if props do change', () => {
      let changeProps, cduPrevProps, cduCurrentProps;

      class PropsProvider extends Component {
        constructor() {
          super();
          this.state = { value: 0 };
          changeProps = this.changeReceiverProps.bind(this);
        }
        changeReceiverProps() {
          let value = (this.state.value + 1) % 2;
          this.setState({
            value
          });
        }
        render() {
          return <PropsReceiver value={this.state.value} />;
        }
      }

      class PropsReceiver extends Component {
        componentDidUpdate(prevProps) {
          cduPrevProps = prevProps;
          cduCurrentProps = this.props;
        }
        render({ value }) {
          return <div>{value}</div>;
        }
      }

      render(<PropsProvider />, container);

      changeProps();
      rerender();

      expect(cduPrevProps).not.toEqual(cduCurrentProps);
    });
  });

  describe('#constructor and component(Did|Will)(Mount|Unmount)', () => {
    let setState;
    class Outer extends Component {
      constructor(p, c) {
        super(p, c);
        this.state = { show: true };
        setState = s => this.setState(s);
      }
      render(props, { show }) {
        return <div>{show && <Inner {...props} />}</div>;
      }
    }

    class LifecycleTestComponent extends Component {
      constructor(p, c) {
        super(p, c);
        this._constructor();
      }
      _constructor() {}
      componentWillMount() {}
      componentDidMount() {}
      componentWillUnmount() {}
      render() {
        return <div />;
      }
    }

    class Inner extends LifecycleTestComponent {
      render() {
        return (
          <div>
            <InnerMost />
          </div>
        );
      }
    }

    class InnerMost extends LifecycleTestComponent {
      render() {
        return <div />;
      }
    }

    let spies = ['_constructor', 'componentWillMount', 'componentDidMount', 'componentWillUnmount'];

    let verifyLifecycleMethods = TestComponent => {
      let proto = TestComponent.prototype;
      spies.forEach(s => sinon.spy(proto, s));
      let reset = () => spies.forEach(s => proto[s].resetHistory());

      it('should be invoked for components on initial render', () => {
        reset();
        render(<Outer />, container);
        expect(proto._constructor.callCount).toBe(1);
        expect(proto.componentDidMount.callCount).toBe(1);
        expect(proto.componentDidMount.callCount).toBe(1);
      });

      it('should be invoked for components on unmount', () => {
        reset();
        render(<Outer />, container);
        setState({ show: false });
        rerender();

        expect(proto.componentWillUnmount.callCount).toBe(1);
      });

      it('should be invoked for components on re-render', () => {
        reset();
        render(<Outer />, container);
        setState({ show: true });
        rerender();

        expect(proto._constructor.callCount).toBe(1);
        expect(proto.componentDidMount.callCount).toBe(1);
        expect(proto.componentDidMount.callCount).toBe(1);
      });
    };

    describe('inner components', () => {
      verifyLifecycleMethods(Inner);
    });

    describe('innermost components', () => {
      verifyLifecycleMethods(InnerMost);
    });

    describe('when shouldComponentUpdate() returns false', () => {
      let setState;

      class Outer extends Component {
        constructor() {
          super();
          this.state = { show: true };
          setState = s => this.setState(s);
        }
        render(props, { show }) {
          return (
            <div>
              {show && (
                <div>
                  <Inner {...props} />
                </div>
              )}
            </div>
          );
        }
      }

      class Inner extends Component {
        shouldComponentUpdate() {
          return false;
        }
        componentWillMount() {}
        componentDidMount() {}
        componentWillUnmount() {}
        render() {
          return <div />;
        }
      }

      let proto = Inner.prototype;
      let spies = ['componentWillMount', 'componentDidMount', 'componentWillUnmount'];
      spies.forEach(s => sinon.spy(proto, s));

      let reset = () => spies.forEach(s => proto[s].resetHistory());

      beforeEach(() => reset());

      it('should be invoke normally on initial mount', () => {
        render(<Outer />, container);
        expect(proto.componentWillMount.callCount).toBe(1);
        expect(proto.componentDidMount.callCount).toBe(1);
      });

      it('should be invoked normally on unmount', () => {
        render(<Outer />, container);
        setState({ show: false });
        rerender();

        expect(proto.componentWillUnmount.callCount).toBe(1);
      });

      it('should still invoke mount for shouldComponentUpdate():false', () => {
        render(<Outer />, container);
        setState({ show: true });
        rerender();

        expect(proto.componentWillMount.callCount).toBe(1);
        expect(proto.componentDidMount.callCount).toBe(1);
      });

      it('should still invoke unmount for shouldComponentUpdate():false', () => {
        render(<Outer />, container);
        setState({ show: false });
        rerender();

        expect(proto.componentWillUnmount.callCount).toBe(1);
      });
    });
  });

  describe('#shouldComponentUpdate', () => {
    let setState;

    class Should extends Component {
      constructor() {
        super();
        this.state = { show: true };
        setState = s => this.setState(s);
      }
      render(props, { show }) {
        return show ? <div /> : null;
      }
    }

    class ShouldNot extends Should {
      shouldComponentUpdate() {
        return false;
      }
    }

    sinon.spy(Should.prototype, 'render');
    sinon.spy(ShouldNot.prototype, 'shouldComponentUpdate');

    beforeEach(() => Should.prototype.render.resetHistory());

    it('should rerender component on change by default', () => {
      render(<Should />, container);
      setState({ show: false });
      rerender();

      expect(Should.prototype.render.callCount).toBe(2);
    });

    it('should not rerender component if shouldComponentUpdate returns false', () => {
      render(<ShouldNot />, container);
      setState({ show: false });
      rerender();

      expect(ShouldNot.prototype.shouldComponentUpdate.callCount).toBe(1);
      expect(ShouldNot.prototype.render.callCount).toBe(1);
    });

    it('should be passed next props and state', () => {
      let updateState;
      let curProps;
      let curState;
      let nextPropsArg;
      let nextStateArg;

      class Foo extends Component {
        constructor(props) {
          super(props);
          this.state = {
            value: 0
          };
          updateState = () =>
            this.setState({
              value: this.state.value + 1
            });
        }
        static getDerivedStateFromProps(props, state) {
          // NOTE: Don't do this in real production code!
          // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
          return {
            value: state.value + 1
          };
        }
        shouldComponentUpdate(nextProps, nextState) {
          nextPropsArg = { ...nextProps };
          nextStateArg = { ...nextState };

          curProps = { ...this.props };
          curState = { ...this.state };

          return true;
        }
        render() {
          return <div>{this.state.value}</div>;
        }
      }

      // Expectation:
      // `this.state` in shouldComponentUpdate should be
      // the state before setState or getDerivedStateFromProps was called
      // `nextState` in shouldComponentUpdate should be
      // the updated state after getDerivedStateFromProps was called

      // Initial render
      // state.value: initialized to 0 in constructor, 0 -> 1 in gDSFP
      render(<Foo foo="foo" />, container);
      expect(container.firstChild.textContent).toEqual('1');
      expect(curProps).toBeUndefined();
      expect(curState).toBeUndefined();
      expect(nextPropsArg).toBeUndefined();
      expect(nextStateArg).toBeUndefined();

      // New props
      // state.value: 1 -> 2 in gDSFP
      render(<Foo foo="bar" />, container);
      expect(container.firstChild.textContent).toEqual('2');
      expect(curProps).toEqual({
        foo: 'foo'
      });
      expect(curState).toEqual({
        value: 1
      });
      expect(nextPropsArg).toEqual({
        foo: 'bar'
      });
      expect(nextStateArg).toEqual({
        value: 2
      });

      // New state
      // state.value: 2 -> 3 in updateState, 3
      updateState();
      expect(container.firstChild.textContent).toEqual('4');
      expect(curProps).toEqual({
        foo: 'bar'
      });
      expect(curState).toEqual({
        value: 2
      });
      expect(nextPropsArg).toEqual({
        foo: 'bar'
      });
      expect(nextStateArg).toEqual({
        value: 4
      });
    });
  });

  describe('#setState', () => {
    it('should NOT mutate state, only create new versions', done => {
      const stateConstant = {};
      let didMount = false;
      let componentState;

      class Stateful extends Component {
        constructor() {
          super(...arguments);
          this.state = stateConstant;
        }

        componentDidMount() {
          didMount = true;
          this.setState({ key: 'value' }, () => {
            componentState = this.state;
          });
        }
      }

      render(<Stateful />, container);
      rerender();

      expect(didMount).toEqual(true);

      setTimeout(() => {
        expect(componentState).toEqual({ key: 'value' });
        expect(stateConstant).toEqual({});
        done();
      }, 2);
    });
  });

  describe('Lifecycle DOM Timing', () => {
    it('should render in a single microtask', () => {
      class Counter extends Component {
        constructor() {
          super();
          this.state = { count: 0 };
        }
        render(props, { count }) {
          if (count < 5) {
            this.setState({ count: count + 1 });
          }
          return count;
        }
      }
      render(<Counter />, container);

      rerender();
      expect(container.textContent).toEqual('5');
    });

    it('should be invoked when dom does (DidMount, WillUnmount) or does not (WillMount, DidUnmount) exist', () => {
      let setState;
      class Outer extends Component {
        constructor() {
          super();
          this.state = { show: true };
          setState = s => {
            this.setState(s);
            this.forceUpdate();
          };
        }
        componentWillMount() {
          expect(document.getElementById('OuterDiv')).toBeNull();
        }
        componentDidMount() {
          expect(document.getElementById('OuterDiv')).not.toBeNull();
        }
        componentWillUnmount() {
          expect(document.getElementById('OuterDiv')).not.toBeNull();
          setTimeout(() => {
            expect(document.getElementById('OuterDiv')).toBeNull();
          }, 0);
        }
        render(props, { show }) {
          return (
            <div id="OuterDiv">
              {show && (
                <div>
                  <Inner {...props} />
                </div>
              )}
            </div>
          );
        }
      }

      class Inner extends Component {
        componentWillMount() {
          expect(document.getElementById('InnerDiv')).toBeNull();
        }
        componentDidMount() {
          expect(document.getElementById('InnerDiv')).not.toBeNull();
        }
        componentWillUnmount() {
          expect(document.getElementById('InnerDiv')).not.toBeNull();
          setTimeout(() => {
            expect(document.getElementById('InnerDiv')).toBeNull();
          }, 0);
        }

        render() {
          return <div id="InnerDiv" />;
        }
      }

      let proto = Inner.prototype;
      let willMountSpy = sinon.spy(proto, 'componentWillMount');
      let didMountSpy = sinon.spy(proto, 'componentDidMount');
      let unmountSpy = sinon.spy(proto, 'componentWillUnmount');

      let reset = () => {
        willMountSpy.resetHistory();
        didMountSpy.resetHistory();
        unmountSpy.resetHistory();
      };

      render(<Outer />, container);
      expect(willMountSpy.callCount).toBe(1);
      willMountSpy.calledBefore(didMountSpy);
      expect(didMountSpy.callCount).toBe(1);

      reset();
      setState({ show: false });

      expect(proto.componentWillUnmount.callCount).toBe(1);

      reset();
      setState({ show: true });

      expect(willMountSpy.callCount).toBe(1);
      willMountSpy.calledBefore(didMountSpy);
      expect(didMountSpy.callCount).toBe(1);
    });
  });
});
