import { Component, createRef, InfernoNode, RefObject, render, rerender } from 'inferno';

describe('createRef', () => {
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

  it('Should add DOM reference to "current" of ref', () => {
    let instanceTesting: Testing | null = null;

    class Testing extends Component {
      public render() {
        instanceTesting = this;
        return 1;
      }
    }

    function Functional() {
      return 'foobar';
    }

    class Foobar extends Component {
      private readonly element: RefObject<HTMLSpanElement>;
      private readonly es6: RefObject<Testing>;
      private readonly functional: RefObject<unknown>;

      constructor(props) {
        super(props);

        this.element = createRef();
        this.es6 = createRef();
        this.functional = createRef();
      }

      public componentWillMount() {
        expect(this.element.current).toBe(null);
        expect(this.es6.current).toBe(null);
        expect(this.functional.current).toBe(null);
      }

      public componentDidMount() {
        expect(this.element.current).toBe(container.querySelector('#span'));
        expect(this.es6.current).toBe(instanceTesting);
        expect(this.functional.current).toBe(null);
      }

      public render() {
        return (
          <div>
            <span id="span" ref={this.element}>
              Ok
            </span>
            <Testing ref={this.es6} />
            {/* @ts-expect-error ref is not valid for functional component */}
            <Functional ref={this.functional} />
          </div>
        );
      }
    }

    render(<Foobar />, container);
    rerender();
  });

  it('Should update callback ref for Components too', () => {
    let instanceTesting: Testing | null = null;

    class Testing extends Component {
      public render() {
        instanceTesting = this;
        return 1;
      }
    }

    let oldCounter = 0;
    let oldValue = null;
    let newCounter = 0;
    let newValue = null;

    interface FoobarProps {
      swap?: boolean;
    }

    class Foobar extends Component<FoobarProps> {
      private readonly es6Old: (arg) => void;
      private readonly es6new: (arg) => void;

      constructor(props) {
        super(props);

        this.es6Old = function (arg) {
          oldCounter++;
          oldValue = arg;
        };
        this.es6new = function (arg) {
          newCounter++;
          newValue = arg;
        };
      }

      public render(props) {
        return (
          <div>
            <Testing ref={props.swap ? this.es6Old : this.es6new} />
          </div>
        );
      }
    }

    render(<Foobar swap={true} />, container);

    expect(oldCounter).toBe(1);
    expect(oldValue).toBe(instanceTesting);
    expect(newCounter).toBe(0);
    expect(newValue).toBe(null);

    render(<Foobar swap={false} />, container);

    expect(oldCounter).toBe(2);
    expect(oldValue).toBe(null);
    expect(newCounter).toBe(1);
    expect(newValue).toBe(instanceTesting);
  });

  it('Should update callback ref for element vNodes too', () => {
    let oldCounter = 0;
    let oldValue = null;
    let newCounter = 0;
    let newValue = null;

    interface FoobarProps {
      swap?: boolean;
    }

    class Foobar extends Component<FoobarProps> {
      private readonly es6Old: (arg) => void;
      private readonly es6new: (arg) => void;

      constructor(props) {
        super(props);

        this.es6Old = function (arg) {
          oldCounter++;
          oldValue = arg;
        };
        this.es6new = function (arg) {
          newCounter++;
          newValue = arg;
        };
      }

      public render(props) {
        return (
          <div>
            <div id={'divi'} ref={props.swap ? this.es6Old : this.es6new} />
          </div>
        );
      }
    }

    render(<Foobar swap={true} />, container);

    const instanceTesting = container.querySelector('#divi');

    expect(oldCounter).toBe(1);
    expect(oldValue).toBe(instanceTesting);
    expect(newCounter).toBe(0);
    expect(newValue).toBe(null);

    render(<Foobar swap={false} />, container);

    expect(oldCounter).toBe(2);
    expect(oldValue).toBe(null);
    expect(newCounter).toBe(1);
    expect(newValue).toBe(instanceTesting);
  });

  it('Should update refs and unmount them', () => {
    let instance: Foobar | null = null;

    let instanceTesting: Testing | null = null;

    class Testing extends Component {
      public render() {
        instanceTesting = this;
        return 1;
      }
    }

    function Functional() {
      return 'foobar';
    }

    class Foobar extends Component {
      public readonly elementOld: RefObject<HTMLSpanElement>;
      public readonly elementNew: RefObject<HTMLSpanElement>;
      public readonly es6Old: RefObject<Testing>;
      public readonly es6new: RefObject<Testing>;
      public readonly functionalOLD: RefObject<unknown>;
      public readonly functionalNEW: RefObject<unknown>;

      constructor(props) {
        super(props);

        instance = this;

        this.elementNew = createRef();
        this.elementOld = createRef();
        this.es6Old = createRef();
        this.es6new = createRef();
        this.functionalOLD = createRef();
        this.functionalNEW = createRef();

        this.state = {
          swap: true
        };
      }

      public componentWillMount() {
        expect(this.elementNew.current).toBe(null);
        expect(this.elementOld.current).toBe(null);
        expect(this.es6Old.current).toBe(null);
        expect(this.es6new.current).toBe(null);
        expect(this.functionalOLD.current).toBe(null);
        expect(this.functionalNEW.current).toBe(null);
      }

      public componentDidMount() {
        expect(this.elementNew.current).toBe(null);
        expect(this.elementOld.current).toBe(container.querySelector('#span'));
        expect(this.es6Old.current).toBe(instanceTesting);
        expect(this.es6new.current).toBe(null);
        expect(this.functionalOLD.current).toBe(null);
        expect(this.functionalNEW.current).toBe(null);

        this.setState({
          swap: false
        });
      }

      public render(_props, { swap }) {
        return (
          <div>
            <span id="span" ref={swap ? this.elementOld : this.elementNew}>
              Ok
            </span>
            <Testing ref={swap ? this.es6Old : this.es6new} />
            {/* @ts-expect-error Functional component ref */}
            <Functional ref={swap ? this.functionalOLD : this.functionalNEW} />
          </div>
        );
      }
    }

    render(<Foobar />, container);
    rerender();

    // Verify ref updated
    expect(instance!.elementNew.current).toBe(container.querySelector('#span'));
    expect(instance!.elementOld.current).toBe(null);
    expect(instance!.es6Old.current).toBe(null);
    expect(instance!.es6new.current).toBe(instanceTesting);
    expect(instance!.functionalOLD.current).toBe(null);
    expect(instance!.functionalNEW.current).toBe(null);

    render(null, container);

    expect(instance!.elementNew.current).toBe(null);
    expect(instance!.elementOld.current).toBe(null);
    expect(instance!.es6Old.current).toBe(null);
    expect(instance!.es6new.current).toBe(null);
    expect(instance!.functionalOLD.current).toBe(null);
    expect(instance!.functionalNEW.current).toBe(null);
  });

  it('Should change ref to the selected element in a list', () => {
    const TOTAL_CHILDREN = 5;
    let setSelected;

    interface ParentState {
      selected: number;
    }

    class Parent extends Component<unknown, ParentState> {
      public state: ParentState;
      private readonly selectedRef: RefObject<HTMLDivElement>;

      constructor() {
        super();
        setSelected = this._setSelected = this._setSelected.bind(this);

        this.selectedRef = createRef();
        this.state = {
          selected: 1
        };
      }

      public componentDidMount() {
        expect(this.selectedRef.current).toBe(container.querySelector('#child' + this.state.selected));
      }

      public componentDidUpdate() {
        expect(this.selectedRef.current).toBe(container.querySelector('#child' + this.state.selected));
      }

      public render() {
        const children: InfernoNode[] = [];
        for (let i = 0; i < TOTAL_CHILDREN; i++) {
          const selected = this.state.selected === i ? this.selectedRef : null;
          children.push(<div key={i} id={'child' + i} ref={selected} />);
        }

        return <div id="parent">{children}</div>;
      }

      public _setSelected(selected) {
        this.setState({
          selected
        });
      }
    }

    render(<Parent />, container);

    setSelected(2);

    rerender();

    setSelected(3);

    rerender();

    setSelected(2);

    rerender();

    setSelected(1);

    rerender();
  });
});
