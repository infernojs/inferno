import { createRef, Component, render, rerender } from 'inferno';

describe('createRef', () => {
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

  it('Should add DOM reference to "current" of ref', () => {
    let instanceTesting = null;

    class Testing extends Component {
      render() {
        instanceTesting = this;
        return 1;
      }
    }

    function Functional() {
      return 'foobar';
    }

    class Foobar extends Component {
      constructor(props) {
        super(props);

        this.element = createRef();
        this.es6 = createRef();
        this.functional = createRef();
      }

      componentWillMount() {
        expect(this.element.current).toBe(null);
        expect(this.es6.current).toBe(null);
        expect(this.functional.current).toBe(null);
      }

      componentDidMount() {
        expect(this.element.current).toBe(container.querySelector('#span'));
        expect(this.es6.current).toBe(instanceTesting);
        expect(this.functional.current).toBe(null);
      }

      render() {
        return (
          <div>
            <span id="span" ref={this.element}>
              Ok
            </span>
            <Testing ref={this.es6} />
            <Functional ref={this.functional} />
          </div>
        );
      }
    }

    render(<Foobar />, container);
    rerender();
  });

  it('Should update callback ref for Components too', () => {
    let instance = null;

    let instanceTesting = null;

    class Testing extends Component {
      render() {
        instanceTesting = this;
        return 1;
      }
    }

    let oldCounter = 0;
    let oldValue = null;
    let newCounter = 0;
    let newValue = null;

    class Foobar extends Component {
      constructor(props) {
        super(props);

        instance = this;

        this.es6Old = function(arg) {
          oldCounter++;
          oldValue = arg;
        };
        this.es6new = function(arg) {
          newCounter++;
          newValue = arg;
        };
      }

      render(props) {
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
    let instance = null;
    let oldCounter = 0;
    let oldValue = null;
    let newCounter = 0;
    let newValue = null;

    class Foobar extends Component {
      constructor(props) {
        super(props);

        instance = this;

        this.es6Old = function(arg) {
          oldCounter++;
          oldValue = arg;
        };
        this.es6new = function(arg) {
          newCounter++;
          newValue = arg;
        };
      }

      render(props) {
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
    let instance = null;

    let instanceTesting = null;

    class Testing extends Component {
      render() {
        instanceTesting = this;
        return 1;
      }
    }

    function Functional() {
      return 'foobar';
    }

    class Foobar extends Component {
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

      componentWillMount() {
        expect(this.elementNew.current).toBe(null);
        expect(this.elementOld.current).toBe(null);
        expect(this.es6Old.current).toBe(null);
        expect(this.es6new.current).toBe(null);
        expect(this.functionalOLD.current).toBe(null);
        expect(this.functionalNEW.current).toBe(null);
      }

      componentDidMount() {
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

      render(props, { swap }) {
        return (
          <div>
            <span id="span" ref={swap ? this.elementOld : this.elementNew}>
              Ok
            </span>
            <Testing ref={swap ? this.es6Old : this.es6new} />
            <Functional ref={swap ? this.functionalOLD : this.functionalNEW} />
          </div>
        );
      }
    }

    render(<Foobar />, container);
    rerender();

    // Verify ref updated
    expect(instance.elementNew.current).toBe(container.querySelector('#span'));
    expect(instance.elementOld.current).toBe(null);
    expect(instance.es6Old.current).toBe(null);
    expect(instance.es6new.current).toBe(instanceTesting);
    expect(instance.functionalOLD.current).toBe(null);
    expect(instance.functionalNEW.current).toBe(null);

    render(null, container);

    expect(instance.elementNew.current).toBe(null);
    expect(instance.elementOld.current).toBe(null);
    expect(instance.es6Old.current).toBe(null);
    expect(instance.es6new.current).toBe(null);
    expect(instance.functionalOLD.current).toBe(null);
    expect(instance.functionalNEW.current).toBe(null);
  });

  it('Should change ref to the selected element in a list', () => {
    const TOTAL_CHILDREN = 5;
    let setSelected;
    class Parent extends Component {
      constructor() {
        super();
        setSelected = this._setSelected = this._setSelected.bind(this);

        this.selectedRef = createRef();
        this.state = {
          selected: 1
        };
      }

      componentDidMount() {
        expect(this.selectedRef.current).toBe(container.querySelector('#child' + this.state.selected));
      }

      componentDidUpdate() {
        expect(this.selectedRef.current).toBe(container.querySelector('#child' + this.state.selected));
      }

      render() {
        const children = [];
        for(let i = 0; i < TOTAL_CHILDREN; i++) {
          const selected = this.state.selected === i ? this.selectedRef : null;
          children.push(<div key={i} id={'child' + i} ref={selected} />);
        }

        return (
          <div id="parent">
            {children}
          </div>
        );
      }

      _setSelected(selected) {
        this.setState({
          selected
        });
      }
    }

    render(<Parent/>, container);

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
