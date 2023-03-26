import { Component, render, rerender } from 'inferno';

describe('Async set state issue', () => {
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

  it('Should always call all set change callbacks', () => {
    interface HoCProps {
      run: number;
    }

    class HoC extends Component<HoCProps> {
      constructor(props) {
        super(props);

        this.update = this.update.bind(this);
      }

      public update() {
        this.setState({});
      }

      public render(props) {
        return (
          <div>
            <Test update={this.update} run={props.run} name="first" />
            <Test update={this.update} run={props.run} name="second" />
          </div>
        );
      }
    }

    let _fromCWRPCBRequested = 0;
    let _failureCreatorCBRequested = 0;
    let _callMePlsCBRequested = 0;
    let _justBecauseCBRequested = 0;
    let _fromCWRPCalled = 0;
    let _failureCreatorCalled = 0;
    let _callMePlsCalled = 0;
    let _justBecauseCalled = 0;

    interface TestProps {
      update: () => void;
      run: number;
      name: string;
    }

    interface TestState {
      async: boolean;
      counter: number;
      failure: boolean;
      success: number;
    }

    class Test extends Component<TestProps, TestState> {
      public state: TestState;

      constructor(props) {
        super(props);

        this.state = {
          async: false,
          counter: 0,
          failure: false,
          success: 0
        };
      }

      public _forceASYNC() {
        // hack just for testing, this forces parent is updating so we can test async setState flow
        if (this.state.counter === 1) {
          this.props.update();
        }
      }

      public _justBecause() {
        _justBecauseCalled++;
        this._forceASYNC();

        this.setState({
          success: 2
        });
      }

      public _callMePls() {
        _callMePlsCalled++;
        this._forceASYNC();

        _justBecauseCBRequested++;
        this.setState(
          {
            success: 1
          },
          this._justBecause
        );
      }

      public _failureCreator() {
        _failureCreatorCalled++;
        this._forceASYNC();

        _callMePlsCBRequested++;
        this.setState(
          {
            failure: true
          },
          this._callMePls
        );
      }

      public _fromCWRP() {
        _fromCWRPCalled++;
        this._forceASYNC();

        _failureCreatorCBRequested++;
        // This setState triggers async flow
        this.setState(
          {
            async: true
          },
          this._failureCreator
        );
      }

      public componentWillReceiveProps(_nextProps, _nextContext) {
        _fromCWRPCBRequested++;

        this.setState(
          {
            counter: this.state.counter + 1
          },
          this._fromCWRP
        );
      }

      public render() {
        return <div>{`${this.props.name} ${this.state.success} ${this.state.counter} ${this.state.async} ${this.state.failure}`}</div>;
      }
    }

    render(<HoC run={1} />, container);
    rerender();
    render(<HoC run={2} />, container);
    rerender();

    // Set state should be called as many times as it was requested
    expect(_fromCWRPCBRequested).toBe(_fromCWRPCalled);
    expect(_callMePlsCBRequested).toBe(_callMePlsCalled);
    expect(_failureCreatorCBRequested).toBe(_failureCreatorCalled);
    expect(_justBecauseCBRequested).toBe(_justBecauseCalled);

    // This assertion is just to document it used to be 4 iterations
    expect(_fromCWRPCBRequested).toBe(4);
    expect(_callMePlsCBRequested).toBe(4);
    expect(_failureCreatorCBRequested).toBe(4);
    expect(_justBecauseCBRequested).toBe(4);

    expect(container.innerHTML).toBe('<div><div>first 2 2 true true</div><div>second 2 2 true true</div></div>');
  });

  it('Should always call all set change callbacks in order of setState requests', () => {
    interface HoCProps {
      run: number;
    }

    class HoC extends Component<HoCProps> {
      constructor(props) {
        super(props);

        this.update = this.update.bind(this);
      }

      public update() {
        this.setState({});
      }

      public render(props) {
        return (
          <div>
            <TestBefore update={this.update} run={props.run} />
            <TestAfter update={this.update} run={props.run} />
          </div>
        );
      }
    }

    const orderOfCalls: string[] = [];
    let testBeforeBeforeSpy: jasmine.Spy;
    let testBeforeAfterSpy: jasmine.Spy;
    let testAfterBeforeSpy: jasmine.Spy;
    let testAfterAfterSpy: jasmine.Spy;

    interface TestBeforeProps {
      update: () => void;
      run: number;
    }
    interface TestBeforeState {
      async: number;
      counter: number;
    }

    class TestBefore extends Component<TestBeforeProps, TestBeforeState> {
      public state: TestBeforeState;
      constructor(props) {
        super(props);

        this.state = {
          async: 0,
          counter: 0
        };

        testBeforeBeforeSpy = spyOn(this, '_before').and.callFake(function () {
          orderOfCalls.push('testBeforeBefore');
        });
        testBeforeAfterSpy = spyOn(this, '_after').and.callFake(function () {
          orderOfCalls.push('testBeforeAfter');
        });
      }

      public _forceASYNC() {
        // hack just for testing, this forces parent is updating so we can test async setState flow
        if (this.state.counter === 1) {
          this.props.update();
        }
      }

      public _before() {}

      public _after() {}

      public _fromCWRP() {
        this._forceASYNC();

        this.setState(
          {
            async: 1
          },
          this._before
        );

        this.setState(
          {
            async: 2
          },
          this._after
        );
      }

      public componentWillReceiveProps(_nextProps, _nextContext) {
        this.setState(
          {
            counter: this.state.counter + 1
          },
          this._fromCWRP
        );
      }

      public render() {
        return <div>{`${this.state.async}`}</div>;
      }
    }

    interface TestAfterProps {
      update: () => void;
      run: number;
    }

    interface TestAfterState {
      async: number;
      counter: number;
    }

    class TestAfter extends Component<TestAfterProps, TestAfterState> {
      public state: TestAfterState;
      constructor(props) {
        super(props);

        this.state = {
          async: 0,
          counter: 0
        };

        testAfterBeforeSpy = spyOn(this, '_before').and.callFake(function () {
          orderOfCalls.push('testAfterBefore');
        });
        testAfterAfterSpy = spyOn(this, '_after').and.callFake(function () {
          orderOfCalls.push('testAfterAfter');
        });
      }

      public _forceASYNC() {
        // hack just for testing, this forces parent is updating so we can test async setState flow
        if (this.state.counter === 1) {
          this.props.update();
        }
      }

      public _before() {}

      public _after() {}

      public _fromCWRP() {
        this._forceASYNC();

        this.setState(
          {
            async: 1
          },
          this._before
        );

        this.setState(
          {
            async: 2
          },
          this._after
        );
      }

      public componentWillReceiveProps(_nextProps, _nextContext) {
        this.setState(
          {
            counter: this.state.counter + 1
          },
          this._fromCWRP
        );
      }

      public render() {
        return <div>{`${this.state.async}`}</div>;
      }
    }

    render(<HoC run={1} />, container);
    rerender();

    render(<HoC run={2} />, container);
    rerender();

    // Set state should be called as many times as it was requested
    expect(testBeforeBeforeSpy!).toHaveBeenCalledTimes(2);
    expect(testBeforeAfterSpy!).toHaveBeenCalledTimes(2);
    expect(testAfterBeforeSpy!).toHaveBeenCalledTimes(2);
    expect(testAfterAfterSpy!).toHaveBeenCalledTimes(2);

    expect(orderOfCalls).toEqual([
      'testBeforeBefore',
      'testBeforeAfter',
      'testBeforeBefore',
      'testBeforeAfter',
      'testAfterBefore',
      'testAfterAfter',
      'testAfterBefore',
      'testAfterAfter'
    ]);

    expect(container.innerHTML).toBe('<div><div>2</div><div>2</div></div>');
  });

  it('Should not call applystate for components which were unmounted during the micro task startup', function () {
    interface HoCProps {
      run: number;
    }

    class HoC extends Component<HoCProps> {
      constructor(props) {
        super(props);

        this.update = this.update.bind(this);
      }

      public update() {
        this.setState({});
      }

      public render(props) {
        return (
          <div>
            <TestBefore update={this.update} run={props.run} />
            <TestAfter update={this.update} run={props.run} />
          </div>
        );
      }
    }

    let testBeforeBeforeSpy: jasmine.Spy;
    let testBeforeAfterSpy: jasmine.Spy;
    let testAfterBeforeSpy: jasmine.Spy;
    let testAfterAfterSpy: jasmine.Spy;

    interface TestBeforeProps {
      update: () => void;
      run: number;
    }
    interface TestBeforeState {
      async: number;
      counter: number;
    }

    class TestBefore extends Component<TestBeforeProps, TestBeforeState> {
      public state: TestBeforeState;

      constructor(props) {
        super(props);

        this.state = {
          async: 0,
          counter: 0
        };

        testBeforeBeforeSpy = spyOn(this, '_before');
        testBeforeAfterSpy = spyOn(this, '_after');
      }

      public _forceASYNC() {
        // hack just for testing, this forces parent is updating so we can test async setState flow
        if (this.state.counter === 1) {
          this.props.update();
        }
      }

      public _before() {}

      public _after() {}

      public _fromCWRP() {
        this._forceASYNC();

        this.setState(
          {
            async: 1
          },
          this._before
        );

        this.setState(
          {
            async: 2
          },
          this._after
        );
      }

      public componentWillReceiveProps(_nextProps, _nextContext) {
        this.setState(
          {
            counter: this.state.counter + 1
          },
          this._fromCWRP
        );
      }

      public render() {
        return <div>{`${this.state.async}`}</div>;
      }
    }

    interface TestAfterProps {
      update: () => void;
      run: number;
    }

    interface TestAfterState {
      async: number;
      counter: number;
    }

    class TestAfter extends Component<TestAfterProps, TestAfterState> {
      public state: TestAfterState;

      constructor(props) {
        super(props);

        this.state = {
          async: 0,
          counter: 0
        };

        testAfterBeforeSpy = spyOn(this, '_before');
        testAfterAfterSpy = spyOn(this, '_after');
      }

      public _forceASYNC() {
        // hack just for testing, this forces parent is updating so we can test async setState flow
        if (this.state.counter === 1) {
          this.props.update();
        }
      }

      public _before() {}

      public _after() {}

      public _fromCWRP() {
        this._forceASYNC();

        this.setState(
          {
            async: 1
          },
          this._before
        );

        this.setState(
          {
            async: 2
          },
          this._after
        );
      }

      public componentWillReceiveProps(_nextProps, _nextContext) {
        this.setState(
          {
            counter: this.state.counter + 1
          },
          this._fromCWRP
        );
      }

      public render() {
        return <div>{`${this.state.async}`}</div>;
      }
    }

    render(<HoC run={1} />, container);
    rerender();
    render(<HoC run={2} />, container);
    rerender();
    render(null, container);
    rerender();

    // Set state should be called as many times as it was requested
    expect(testBeforeBeforeSpy!.calls.count()).toBe(2);
    expect(testBeforeAfterSpy!.calls.count()).toBe(2);
    expect(testAfterBeforeSpy!.calls.count()).toBe(2);
    expect(testAfterAfterSpy!.calls.count()).toBe(2);
  });
});
