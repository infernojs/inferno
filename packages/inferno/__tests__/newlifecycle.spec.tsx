import { Component, render, rerender } from 'inferno';

describe('Lifecycle methods', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('should call nested new lifecycle methods in the right order', () => {
    let updateOuterState;
    let updateInnerState;
    let forceUpdateOuter;
    let forceUpdateInner;

    let log: string[];
    const logger = function (msg) {
      return function () {
        // return true for shouldComponentUpdate
        log.push(msg);
        return true;
      };
    };

    interface OuterState {
      value: number;
    }

    interface OuterProps {
      value?: number;
      x: number;
    }

    class Outer extends Component<OuterProps, OuterState> {
      public state: OuterState;

      public static getDerivedStateFromProps() {
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

      public render() {
        log.push('outer render');
        return (
          <div>
            <Inner x={this.props.x} outerValue={this.state.value} />
          </div>
        );
      }
    }

    Outer.prototype.componentDidMount = logger('outer componentDidMount');
    Outer.prototype.shouldComponentUpdate = logger('outer shouldComponentUpdate');
    Outer.prototype.getSnapshotBeforeUpdate = logger('outer getSnapshotBeforeUpdate');
    Outer.prototype.componentDidUpdate = logger('outer componentDidUpdate');
    Outer.prototype.componentWillUnmount = logger('outer componentWillUnmount');

    interface InnerProps {
      x: number;
      outerValue: number;
    }

    interface InnerState {
      value: number;
    }

    class Inner extends Component<InnerProps, InnerState> {
      public state: InnerState;

      public static getDerivedStateFromProps() {
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

      public render() {
        log.push('inner render');
        return (
          <span>
            {this.props.x} {this.props.outerValue} {this.state.value}
          </span>
        );
      }
    }

    Inner.prototype.componentDidMount = logger('inner componentDidMount');
    Inner.prototype.shouldComponentUpdate = logger('inner shouldComponentUpdate');
    Inner.prototype.getSnapshotBeforeUpdate = logger('inner getSnapshotBeforeUpdate');
    Inner.prototype.componentDidUpdate = logger('inner componentDidUpdate');
    Inner.prototype.componentWillUnmount = logger('inner componentWillUnmount');

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
      interface FooState {
        bar: string;
        foo: string;
      }

      class Foo extends Component<{ foo: string }, FooState> {
        // @ts-expect-error automatic init detection not working with getDerivedStateFromProps
        public state: FooState;

        public static getDerivedStateFromProps(nextProps) {
          return {
            bar: 'bar',
            foo: nextProps.foo
          };
        }

        public render() {
          return <div className={`${this.state.foo} ${this.state.bar}`} />;
        }
      }

      render(<Foo foo="foo" />, container);
      expect(container.firstChild.className).toEqual('foo bar');
    });

    it('should update initial state with value returned from getDerivedStateFromProps', () => {
      interface FooState {
        bar: string;
        foo: string;
      }
      class Foo extends Component<unknown, FooState> {
        public state: FooState;

        constructor(props, context) {
          super(props, context);
          this.state = {
            bar: 'bar',
            foo: 'foo'
          };
        }

        public static getDerivedStateFromProps(_nextProps, prevState) {
          return {
            foo: `not-${prevState.foo}`
          };
        }

        public render() {
          return <div className={`${this.state.foo} ${this.state.bar}`} />;
        }
      }

      render(<Foo />, container);
      expect(container.firstChild.className).toEqual('not-foo bar');
    });

    it("should update the instance's state with the value returned from getDerivedStateFromProps when props change", () => {
      interface FooState {
        value: string;
      }

      interface FooProps {
        update: boolean;
      }

      class Foo extends Component<FooProps, FooState> {
        public state: FooState;
        constructor(props, context) {
          super(props, context);
          this.state = {
            value: 'initial'
          };
        }

        public static getDerivedStateFromProps(nextProps) {
          if (nextProps.update) {
            return {
              value: 'updated'
            };
          }

          return null;
        }

        public componentDidMount() {}

        public componentDidUpdate() {}

        public render() {
          return <div className={this.state.value} />;
        }
      }

      const derivedSpy = spyOn(Foo, 'getDerivedStateFromProps').and.callThrough();
      const didMountSpy = spyOn(Foo.prototype, 'componentDidMount');
      const didUpdateSpy = spyOn(Foo.prototype, 'componentDidUpdate');

      render(<Foo update={false} />, container);
      expect(container.firstChild.className).toEqual('initial');
      expect(derivedSpy.calls.count()).toBe(1);
      expect(didMountSpy.calls.count()).toBe(1); // verify mount occurred
      expect(didUpdateSpy.calls.count()).toBe(0);

      render(<Foo update={true} />, container);
      expect(container.firstChild.className).toEqual('updated');
      expect(derivedSpy.calls.count()).toBe(2);
      expect(didMountSpy.calls.count()).toBe(1);
      expect(didUpdateSpy.calls.count()).toBe(1); // verify update occurred
    });

    it("should update the instance's state with the value returned from getDerivedStateFromProps when state changes", () => {
      interface FooState {
        value: string;
      }

      class Foo extends Component<unknown, FooState> {
        public state: FooState;

        constructor(props, context) {
          super(props, context);
          this.state = {
            value: 'initial'
          };
        }

        public static getDerivedStateFromProps(_nextProps, prevState) {
          // Don't change state for call that happens after the constructor
          if (prevState.value === 'initial') {
            return null;
          }

          return {
            value: prevState.value + ' derived'
          };
        }

        public componentDidMount() {
          this.setState({ value: 'updated' });
        }

        public render() {
          return <div className={this.state.value} />;
        }
      }

      const derivedSpy = spyOn(Foo, 'getDerivedStateFromProps').and.callThrough();

      render(<Foo />, container);
      expect(container.firstChild.className).toEqual('initial');
      expect(derivedSpy.calls.count()).toBe(1);

      rerender(); // call rerender to handle cDM setState call
      expect(container.firstChild.className).toEqual('updated derived');
      expect(derivedSpy.calls.count()).toBe(2);
    });

    it('should NOT modify state if null is returned', () => {
      interface FooState {
        bar: string;
        foo: string;
      }

      class Foo extends Component<unknown, FooState> {
        public state: FooState;
        constructor(props, context) {
          super(props, context);
          this.state = {
            bar: 'bar',
            foo: 'foo'
          };
        }

        public static getDerivedStateFromProps() {
          return null;
        }

        public render() {
          return <div className={`${this.state.foo} ${this.state.bar}`} />;
        }
      }

      const derivedSpy = spyOn(Foo, 'getDerivedStateFromProps');

      render(<Foo />, container);
      expect(container.firstChild.className).toEqual('foo bar');
      expect(derivedSpy.calls.count()).toBe(1);
    });

    // NOTE: Difference from React
    // React v16.3.2 warns if undefined if returned from getDerivedStateFromProps
    it('should NOT modify state if undefined is returned', () => {
      interface FooState {
        bar: string;
        foo: string;
      }

      class Foo extends Component<unknown, FooState> {
        public state: FooState;
        constructor(props, context) {
          super(props, context);
          this.state = {
            bar: 'bar',
            foo: 'foo'
          };
        }

        public static getDerivedStateFromProps() {}

        public render() {
          return <div className={`${this.state.foo} ${this.state.bar}`} />;
        }
      }

      const derivedSpy = spyOn(Foo, 'getDerivedStateFromProps');

      render(<Foo />, container);
      expect(container.firstChild.className).toEqual('foo bar');
      expect(derivedSpy.calls.count()).toBe(1);
    });

    it('should NOT invoke deprecated lifecycles (cWM/cWRP) if new static gDSFP is present', () => {
      class Foo extends Component {
        public static getDerivedStateFromProps() {}

        public componentWillMount() {}

        public componentWillReceiveProps() {}

        public render() {
          return <div />;
        }
      }

      const derivedSpy = spyOn(Foo, 'getDerivedStateFromProps');
      const willMountSpy = spyOn(Foo.prototype, 'componentWillMount');
      const propsSpy = spyOn(Foo.prototype, 'componentWillReceiveProps');

      render(<Foo />, container);
      expect(derivedSpy.calls.count()).toBe(1);
      expect(willMountSpy.calls.count()).toBe(0);
      expect(propsSpy.calls.count()).toBe(0);
    });

    it('is not called if neither state nor props have changed', () => {
      let logs: string[] = [];
      let childRef;

      interface ParentState {
        parentRenders: number;
      }

      class Parent extends Component<unknown, ParentState> {
        public state: ParentState;
        constructor(props) {
          super(props);
          this.state = { parentRenders: 0 };
        }

        public static getDerivedStateFromProps(_props, prevState) {
          logs.push('parent getDerivedStateFromProps');
          return prevState.parentRenders + 1;
        }

        public render() {
          logs.push('parent render');
          return <Child parentRenders={this.state.parentRenders} ref={(child) => (childRef = child)} />;
        }
      }

      interface ChildProps {
        parentRenders: number;
      }

      class Child extends Component<ChildProps> {
        public render() {
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

      interface FooState {
        value: number;
      }

      class Foo extends Component<{ foo: string }, FooState> {
        public state: FooState;
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

        public static getDerivedStateFromProps(props, state) {
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

        public render() {
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
        public static getDerivedStateFromProps() {
          return { key: 'value' };
        }

        constructor() {
          super(...arguments);
          this.state = stateConstant;
        }

        public componentDidMount() {
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
      let log: string[] = [];

      interface MyComponentProps {
        value: string;
      }
      interface MyComponentState {
        value: number;
      }

      class MyComponent extends Component<MyComponentProps, MyComponentState> {
        constructor(props) {
          super(props);
          this.state = {
            value: 0
          };
        }

        public static getDerivedStateFromProps(_nextProps, prevState) {
          return {
            value: prevState.value + 1
          };
        }

        public getSnapshotBeforeUpdate(prevProps, prevState) {
          log.push(`getSnapshotBeforeUpdate() prevProps:${prevProps.value} prevState:${prevState.value}`);
          return 'abc';
        }

        public componentDidUpdate(prevProps, prevState, snapshot) {
          log.push(`componentDidUpdate() prevProps:${prevProps.value} prevState:${prevState.value} snapshot:${snapshot}`);
        }

        public render() {
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
      let log: string[] = [];

      interface MyComponentProps {
        value: string;
      }
      interface MyComponentState {
        value: number;
      }

      class MyComponent extends Component<MyComponentProps, MyComponentState> {
        protected divRef: HTMLDivElement | null;

        public getSnapshotBeforeUpdate(prevProps) {
          log.push('getSnapshotBeforeUpdate');
          expect(this.divRef!.textContent).toEqual(`value:${prevProps.value}`);
          return 'foobar';
        }

        public componentDidUpdate(_prevProps, _prevState, snapshot) {
          log.push('componentDidUpdate');
          expect(this.divRef!.textContent).toEqual(`value:${this.props.value}`);
          expect(snapshot).toEqual('foobar');
        }

        public render() {
          log.push('render');
          return <div ref={(ref) => (this.divRef = ref)}>{`value:${this.props.value}`}</div>;
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

      interface FooState {
        value: number;
      }

      interface FooProps {
        foo: string;
      }

      class Foo extends Component<FooProps, FooState> {
        public state: FooState;
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

        public static getDerivedStateFromProps(_props, state) {
          // NOTE: Don't do this in real production code!
          // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
          return {
            value: state.value + 1
          };
        }

        public getSnapshotBeforeUpdate(prevProps, prevState) {
          // These object references might be updated later so copy
          // object so we can assert their values at this snapshot in time
          prevPropsArg = { ...prevProps };
          prevStateArg = { ...prevState };

          curProps = { ...this.props };
          curState = { ...this.state };
        }

        public render() {
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
        public componentWillUpdate() {}

        public render() {
          return <div />;
        }
      }

      const willUpdateSpy = spyOn(ReceivePropsComponent.prototype, 'componentWillUpdate');
      render(<ReceivePropsComponent />, container);
      expect(willUpdateSpy.calls.count()).toBe(0);
    });

    it('should be called when rerender with new props from parent', () => {
      let doRender;

      interface OuterProps {}
      interface OuterState {
        i: number;
      }

      class Outer extends Component<OuterProps, OuterState> {
        public state: OuterState;

        constructor(p, c) {
          super(p, c);
          this.state = { i: 0 };
        }

        public componentDidMount() {
          doRender = () => this.setState({ i: this.state.i + 1 });
        }

        public render(props, { i }) {
          return <Inner i={i} {...props} />;
        }
      }

      class Inner extends Component {
        public componentWillUpdate(nextProps, nextState) {
          expect(nextProps).toEqual({ i: 1 });
          expect(nextState).toBe(null);
        }

        public render() {
          return <div />;
        }
      }

      const willUpdateSpy = spyOn(Inner.prototype, 'componentWillUpdate').and.callThrough();

      // Initial render
      render(<Outer />, container);
      expect(willUpdateSpy.calls.count()).toBe(0);

      // Rerender inner with new props
      doRender();
      rerender();
      expect(willUpdateSpy.calls.count()).toBe(1);
    });

    it('should be called on new state', () => {
      let doRender;

      interface ReceivePropsComponentState {
        i: number;
      }

      class ReceivePropsComponent extends Component<unknown, ReceivePropsComponentState> {
        public state: ReceivePropsComponentState;

        constructor(props) {
          super(props);

          this.state = {
            i: 0
          };
        }

        public componentWillUpdate() {}

        public componentDidMount() {
          doRender = () => this.setState({ i: this.state.i + 1 });
        }

        public render() {
          return <div />;
        }
      }

      const willUpdateSpy = spyOn(ReceivePropsComponent.prototype, 'componentWillUpdate');
      render(<ReceivePropsComponent />, container);
      expect(willUpdateSpy.calls.count()).toBe(0);

      doRender();
      rerender();
      expect(willUpdateSpy.calls.count()).toBe(1);
    });

    it('should be called after children are mounted', () => {
      const log: string[] = [];

      class Inner extends Component {
        public componentDidMount() {
          log.push('Inner mounted');

          // Verify that the component is actually mounted when this
          // callback is invoked.
          expect(container.querySelector('#inner')).toEqual(this.$LI.dom);
        }

        public render() {
          return <div id="inner" />;
        }
      }

      class Outer extends Component<{ renderInner?: boolean }> {
        public componentDidUpdate() {
          log.push('Outer updated');
        }

        public render(props) {
          return props.renderInner ? <Inner /> : <div />;
        }
      }

      render(<Outer renderInner={false} />, container);
      render(<Outer renderInner={true} />, container);

      expect(log).toEqual(['Inner mounted', 'Outer updated']);
    });
  });

  describe('#componentWillReceiveProps', () => {
    it('should NOT be called on initial render', () => {
      class ReceivePropsComponent extends Component {
        public componentWillReceiveProps() {}

        public render() {
          return <div />;
        }
      }

      const willRecSpy = spyOn(ReceivePropsComponent.prototype, 'componentWillReceiveProps');
      render(<ReceivePropsComponent />, container);
      expect(willRecSpy.calls.count()).toBe(0);
    });

    it('should be called when rerender with new props from parent', () => {
      let doRender;

      interface OuterState {
        i: number;
      }

      class Outer extends Component<unknown, OuterState> {
        public state: OuterState;

        constructor(p, c) {
          super(p, c);
          this.state = { i: 0 };
        }

        public componentDidMount() {
          doRender = () => this.setState({ i: this.state.i + 1 });
        }

        public render(props, { i }) {
          return <Inner i={i} {...props} />;
        }
      }

      interface InnerProps {
        i: number;
      }

      class Inner extends Component<InnerProps> {
        public componentWillMount() {
          expect(this.props.i).toEqual(0);
        }

        public componentWillReceiveProps(nextProps) {
          expect(nextProps.i).toEqual(1);
        }

        public render() {
          return <div />;
        }
      }

      const cwrpSpy = spyOn(Inner.prototype, 'componentWillReceiveProps').and.callThrough();

      // Initial render
      render(<Outer />, container);
      expect(cwrpSpy.calls.count()).toBe(0);

      // Rerender inner with new props
      doRender();
      rerender();
      expect(cwrpSpy.calls.count()).toBe(1);
    });

    it('should be called in right execution order', () => {
      let doRender;

      interface OuterState {
        i: number;
      }

      class Outer extends Component<unknown, OuterState> {
        public state: OuterState;
        constructor(p, c) {
          super(p, c);
          this.state = { i: 0 };
        }

        public componentDidMount() {
          doRender = () => this.setState({ i: this.state.i + 1 });
        }

        public render(props, { i }) {
          return <Inner i={i} {...props} />;
        }
      }

      class Inner extends Component {
        public componentDidUpdate() {
          expect(cwrpSpy.calls.count()).toBe(1);
          expect(cwuSpy.calls.count()).toBe(1);
        }

        public componentWillReceiveProps() {
          expect(cwuSpy.calls.count()).toBe(0);
          expect(cduSpy.calls.count()).toBe(0);
        }

        public componentWillUpdate() {
          expect(cwrpSpy.calls.count()).toBe(1);
          expect(cduSpy.calls.count()).toBe(0);
        }

        public render() {
          return <div />;
        }
      }

      const orderOfCalls: string[] = [];
      const cwrpSpy = spyOn(Inner.prototype, 'componentWillReceiveProps').and.callFake(function () {
        orderOfCalls.push('componentWillReceiveProps');
      });
      const cduSpy = spyOn(Inner.prototype, 'componentDidUpdate').and.callFake(function () {
        orderOfCalls.push('componentDidUpdate');
      });
      const cwuSpy = spyOn(Inner.prototype, 'componentWillUpdate').and.callFake(function () {
        orderOfCalls.push('componentWillUpdate');
      });
      const originalDidMount = Outer.prototype.componentDidMount;
      const cdmSpy = spyOn(Outer.prototype, 'componentDidMount').and.callFake(function () {
        orderOfCalls.push('componentDidMount');
        originalDidMount.call(this);
      });

      render(<Outer />, container);
      doRender();
      rerender();

      expect(orderOfCalls).toEqual(['componentDidMount', 'componentWillReceiveProps', 'componentWillUpdate', 'componentDidUpdate']);

      expect(cdmSpy.calls.count()).toBe(1);
    });
  });

  describe('#componentDidUpdate', () => {
    it('should be passed previous props and state', () => {
      let updateState;

      let prevPropsArg;
      let prevStateArg;
      let curProps;
      let curState;

      interface FooProps {
        foo: string;
      }

      interface FooState {
        value: number;
      }

      class Foo extends Component<FooProps, FooState> {
        public state: FooState;
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

        public static getDerivedStateFromProps(_props, state) {
          // NOTE: Don't do this in real production code!
          // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
          return {
            value: state.value + 1
          };
        }

        public componentDidUpdate(prevProps, prevState) {
          // These object references might be updated later so copy
          // object so we can assert their values at this snapshot in time
          prevPropsArg = { ...prevProps };
          prevStateArg = { ...prevState };

          curProps = { ...this.props };
          curState = { ...this.state };
        }

        public render() {
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
      let changeProps;
      let cduPrevState;
      let cduCurrentState;

      interface PropsProviderState {
        value: number;
      }

      class PropsProvider extends Component<unknown, PropsProviderState> {
        public state: PropsProviderState;

        constructor() {
          super();
          this.state = { value: 0 };
          changeProps = this.changeReceiverProps.bind(this);
        }

        public changeReceiverProps() {
          const value = (this.state.value + 1) % 2;
          this.setState({
            value
          });
        }

        public render() {
          return <PropsReceiver value={this.state.value} />;
        }
      }

      interface PropsReceiverProps {
        value: number;
      }

      class PropsReceiver extends Component<PropsReceiverProps> {
        public componentDidUpdate(_prevProps, prevState) {
          cduPrevState = prevState;
          cduCurrentState = this.state;
        }

        public render({ value }) {
          return <div>{value}</div>;
        }
      }

      render(<PropsProvider />, container);

      changeProps();
      rerender();

      expect(cduPrevState).toEqual(cduCurrentState);
    });

    it('prevState argument should be a different object if state does change', () => {
      let updateState;
      let cduPrevState;
      let cduCurrentState;

      interface FooState {
        value: number;
      }

      class Foo extends Component<unknown, FooState> {
        public state: FooState;
        constructor() {
          super();
          this.state = { value: 0 };
          updateState = this.updateState.bind(this);
        }

        public updateState() {
          const value = (this.state.value + 1) % 2;
          this.setState({
            value
          });
        }

        public componentDidUpdate(_prevProps, prevState) {
          cduPrevState = prevState;
          cduCurrentState = this.state;
        }

        public render() {
          return <div>{this.state.value}</div>;
        }
      }

      render(<Foo />, container);

      updateState();
      rerender();

      expect(cduPrevState).not.toEqual(cduCurrentState);
    });

    it("prevProps argument should be the same object if props don't change", () => {
      let updateState;
      let cduPrevProps;
      let cduCurrentProps;

      interface FooState {
        value: number;
      }

      class Foo extends Component<unknown, FooState> {
        public state: FooState;
        constructor() {
          super();
          this.state = { value: 0 };
          updateState = this.updateState.bind(this);
        }

        public updateState() {
          const value = (this.state.value + 1) % 2;
          this.setState({
            value
          });
        }

        public componentDidUpdate(prevProps) {
          cduPrevProps = prevProps;
          cduCurrentProps = this.props;
        }

        public render() {
          return <div>{this.state.value}</div>;
        }
      }

      render(<Foo />, container);

      updateState();
      rerender();

      expect(cduPrevProps).toEqual(cduCurrentProps);
    });

    it('prevProps argument should be a different object if props do change', () => {
      let changeProps;
      let cduPrevProps;
      let cduCurrentProps;

      interface PropsProviderState {
        value: number;
      }

      class PropsProvider extends Component<unknown, PropsProviderState> {
        public state: PropsProviderState;

        constructor() {
          super();
          this.state = { value: 0 };
          changeProps = this.changeReceiverProps.bind(this);
        }

        public changeReceiverProps() {
          const value = (this.state.value + 1) % 2;
          this.setState({
            value
          });
        }

        public render() {
          return <PropsReceiver value={this.state.value} />;
        }
      }

      interface PropsReceiverProps {
        value: number;
      }

      class PropsReceiver extends Component<PropsReceiverProps> {
        public componentDidUpdate(prevProps) {
          cduPrevProps = prevProps;
          cduCurrentProps = this.props;
        }

        public render({ value }) {
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
        setState = (s) => this.setState(s);
      }

      public render(props, { show }) {
        return <div>{show && <Inner {...props} />}</div>;
      }
    }

    class LifecycleTestComponent extends Component {
      constructor(p, c) {
        super(p, c);
        this._constructor();
      }

      public _constructor() {}

      public componentWillMount() {}

      public componentDidMount() {}

      public componentWillUnmount() {}

      public render() {
        return <div />;
      }
    }

    class Inner extends LifecycleTestComponent {
      public render() {
        return (
          <div>
            <InnerMost />
          </div>
        );
      }
    }

    class InnerMost extends LifecycleTestComponent {
      public render() {
        return <div />;
      }
    }

    describe('inner components', () => {
      let constructorSpy: jasmine.Spy;
      let willMountSpy: jasmine.Spy;
      let didMountSpy: jasmine.Spy;
      let willUnmountSpy: jasmine.Spy;

      const reset = () => {
        constructorSpy.calls.reset();
        willMountSpy.calls.reset();
        didMountSpy.calls.reset();
        willUnmountSpy.calls.reset();
      };

      beforeEach(function () {
        constructorSpy = spyOn(Inner.prototype, '_constructor');
        willMountSpy = spyOn(Inner.prototype, 'componentWillMount');
        didMountSpy = spyOn(Inner.prototype, 'componentDidMount');
        willUnmountSpy = spyOn(Inner.prototype, 'componentWillUnmount');
      });

      it('should be invoked for components on initial render', () => {
        reset();
        render(<Outer />, container);
        expect(constructorSpy.calls.count()).toBe(1);
        expect(didMountSpy.calls.count()).toBe(1);
        expect(willMountSpy.calls.count()).toBe(1);
      });

      it('should be invoked for components on unmount', () => {
        reset();
        render(<Outer />, container);
        setState({ show: false });
        rerender();

        expect(willUnmountSpy.calls.count()).toBe(1);
      });

      it('should be invoked for components on re-render', () => {
        reset();
        render(<Outer />, container);
        setState({ show: true });
        rerender();

        expect(constructorSpy.calls.count()).toBe(1);
        expect(didMountSpy.calls.count()).toBe(1);
        expect(willMountSpy.calls.count()).toBe(1);
      });
    });

    describe('innermost components', () => {
      let constructorSpy: jasmine.Spy;
      let willMountSpy: jasmine.Spy;
      let didMountSpy: jasmine.Spy;
      let willUnmountSpy: jasmine.Spy;

      const reset = () => {
        constructorSpy.calls.reset();
        willMountSpy.calls.reset();
        didMountSpy.calls.reset();
        willUnmountSpy.calls.reset();
      };

      beforeEach(function () {
        constructorSpy = spyOn(InnerMost.prototype, '_constructor');
        willMountSpy = spyOn(InnerMost.prototype, 'componentWillMount');
        didMountSpy = spyOn(InnerMost.prototype, 'componentDidMount');
        willUnmountSpy = spyOn(InnerMost.prototype, 'componentWillUnmount');
      });

      it('should be invoked for components on initial render', () => {
        reset();
        render(<Outer />, container);
        expect(constructorSpy.calls.count()).toBe(1);
        expect(willMountSpy.calls.count()).toBe(1);
        expect(didMountSpy.calls.count()).toBe(1);
      });

      it('should be invoked for components on unmount', () => {
        reset();
        render(<Outer />, container);
        setState({ show: false });
        rerender();

        expect(willUnmountSpy.calls.count()).toBe(1);
      });

      it('should be invoked for components on re-render', () => {
        reset();
        render(<Outer />, container);
        setState({ show: true });
        rerender();

        expect(constructorSpy.calls.count()).toBe(1);
        expect(willMountSpy.calls.count()).toBe(1);
        expect(didMountSpy.calls.count()).toBe(1);
      });
    });

    describe('when shouldComponentUpdate() returns false', () => {
      let outerSetState;

      class Outer1 extends Component {
        constructor() {
          super();
          this.state = { show: true };
          outerSetState = (s) => this.setState(s);
        }

        public render(props, { show }) {
          return (
            <div>
              {show && (
                <div>
                  <Inner1 {...props} />
                </div>
              )}
            </div>
          );
        }
      }

      class Inner1 extends Component {
        public shouldComponentUpdate() {
          return false;
        }

        public componentWillMount() {}

        public componentDidMount() {}

        public componentWillUnmount() {}

        public render() {
          return <div />;
        }
      }

      let willMountSpy: jasmine.Spy;
      let didMountSpy: jasmine.Spy;
      let willUnmountSpy: jasmine.Spy;

      beforeEach(function () {
        willMountSpy = spyOn(Inner1.prototype, 'componentWillMount');
        didMountSpy = spyOn(Inner1.prototype, 'componentDidMount');
        willUnmountSpy = spyOn(Inner1.prototype, 'componentWillUnmount');
      });

      it('should be invoke normally on initial mount', () => {
        render(<Outer1 />, container);
        expect(willMountSpy.calls.count()).toBe(1);
        expect(didMountSpy.calls.count()).toBe(1);
      });

      it('should be invoked normally on unmount', () => {
        render(<Outer1 />, container);
        outerSetState({ show: false });
        rerender();

        expect(willUnmountSpy.calls.count()).toBe(1);
      });

      it('should still invoke mount for shouldComponentUpdate():false', () => {
        render(<Outer1 />, container);
        outerSetState({ show: true });
        rerender();

        expect(willMountSpy.calls.count()).toBe(1);
        expect(didMountSpy.calls.count()).toBe(1);
      });

      it('should still invoke unmount for shouldComponentUpdate():false', () => {
        render(<Outer1 />, container);
        outerSetState({ show: false });
        rerender();

        expect(willUnmountSpy.calls.count()).toBe(1);
      });
    });
  });

  describe('#shouldComponentUpdate', () => {
    let setState;
    let renderSpy: jasmine.Spy;
    let shouldUpdateSpy: jasmine.Spy;

    class Should extends Component {
      constructor() {
        super();
        this.state = { show: true };
        setState = (s) => this.setState(s);
      }

      public render(_props, { show }) {
        return show ? <div /> : null;
      }
    }

    class ShouldNot extends Should {
      public shouldComponentUpdate() {
        return false;
      }
    }

    beforeEach(function () {
      renderSpy = spyOn(Should.prototype, 'render');
      shouldUpdateSpy = spyOn(ShouldNot.prototype, 'shouldComponentUpdate');
    });

    it('should rerender component on change by default', () => {
      render(<Should />, container);
      setState({ show: false });
      rerender();

      expect(renderSpy.calls.count()).toBe(2);
    });

    it('should not rerender component if shouldComponentUpdate returns false', () => {
      render(<ShouldNot />, container);
      setState({ show: false });
      rerender();

      expect(shouldUpdateSpy.calls.count()).toBe(1);
      expect(renderSpy.calls.count()).toBe(1);
    });

    it('should be passed next props and state', () => {
      let updateState;
      let curProps;
      let curState;
      let nextPropsArg;
      let nextStateArg;

      interface FooState {
        value: number;
      }

      class Foo extends Component<{ foo: string }, FooState> {
        public state: FooState;
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

        public static getDerivedStateFromProps(_props, state) {
          // NOTE: Don't do this in real production code!
          // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
          return {
            value: state.value + 1
          };
        }

        public shouldComponentUpdate(nextProps, nextState) {
          nextPropsArg = { ...nextProps };
          nextStateArg = { ...nextState };

          curProps = { ...this.props };
          curState = { ...this.state };

          return true;
        }

        public render() {
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
    it('should NOT mutate state, only create new versions', (done) => {
      const stateConstant = {};
      let didMount = false;
      let componentState;

      class Stateful extends Component {
        constructor() {
          super(...arguments);
          this.state = stateConstant;
        }

        public componentDidMount() {
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
      }, 10);
    });
  });

  describe('Lifecycle DOM Timing', () => {
    it('should render in a single microtask', () => {
      class Counter extends Component {
        constructor() {
          super();
          this.state = { count: 0 };
        }

        public render(_props, { count }) {
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
          setState = (s) => {
            this.setState(s);
          };
        }

        public componentWillMount() {
          expect(document.getElementById('OuterDiv')).toBeNull();
        }

        public componentDidMount() {
          expect(document.getElementById('OuterDiv')).not.toBeNull();
        }

        public componentWillUnmount() {
          expect(document.getElementById('OuterDiv')).not.toBeNull();
        }

        public render(props, { show }) {
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
        public componentWillMount() {
          expect(document.getElementById('InnerDiv')).toBeNull();
        }

        public componentDidMount() {
          expect(document.getElementById('InnerDiv')).not.toBeNull();
        }

        public componentWillUnmount() {
          expect(document.getElementById('InnerDiv')).not.toBeNull();
        }

        public render() {
          return <div id="InnerDiv" />;
        }
      }

      const proto = Inner.prototype;
      const orderOfCalls: string[] = [];

      const willMountSpy = spyOn(proto, 'componentWillMount').and.callFake(function () {
        orderOfCalls.push('willMount');
      });
      const didMountSpy = spyOn(proto, 'componentDidMount').and.callFake(function () {
        orderOfCalls.push('didMount');
      });
      const unmountSpy = spyOn(proto, 'componentWillUnmount').and.callFake(function () {
        orderOfCalls.push('willUnmount');
      });

      const reset = () => {
        willMountSpy.calls.reset();
        didMountSpy.calls.reset();
        unmountSpy.calls.reset();
      };

      render(<Outer />, container);
      expect(willMountSpy.calls.count()).toBe(1);
      expect(didMountSpy.calls.count()).toBe(1);

      expect(orderOfCalls).toEqual(['willMount', 'didMount']);

      reset();
      setState({ show: false });

      expect(document.getElementById('InnerDiv')).toBeNull();

      expect(unmountSpy.calls.count()).toBe(1);

      reset();
      setState({ show: true });

      expect(document.getElementById('InnerDiv')).not.toBeNull();

      expect(willMountSpy.calls.count()).toBe(1);
      expect(didMountSpy.calls.count()).toBe(1);

      expect(orderOfCalls).toEqual(['willMount', 'didMount', 'willUnmount', 'willMount', 'didMount']);
    });
  });
});
