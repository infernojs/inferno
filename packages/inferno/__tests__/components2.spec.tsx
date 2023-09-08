import { Component, render } from 'inferno';
/* These must be in their own files for test to reproduce */
import { ParentFirstCommon } from './data/common-render/parentfirstcommon';
import { ParentSecondCommon } from './data/common-render/parentsecondcommon';

describe('Components (JSX) #2', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    document.body.removeChild(container);
  });

  describe('tracking DOM state', () => {
    class ComponentA extends Component {
      public render() {
        return (
          <div>
            <span>Something</span>
          </div>
        );
      }
    }

    class ComponentB extends Component {
      public render() {
        return (
          <div>
            <span>Something</span>
          </div>
        );
      }
    }

    interface ComponentBWithStateChangeState {
      text: string;
    }

    class ComponentBWithStateChange extends Component<
      unknown,
      ComponentBWithStateChangeState
    > {
      public state: ComponentBWithStateChangeState;

      constructor(props) {
        super(props);

        this.state = {
          text: '',
        };
      }

      public componentWillMount() {
        this.setState({
          text: 'newText',
        });

        this.setState({
          text: 'newText2',
        });
      }

      public render() {
        return (
          <div>
            <span>{this.state.text}</span>
          </div>
        );
      }
    }

    function ComA() {
      return (
        <div>
          <span>Something</span>
        </div>
      );
    }

    function ComB() {
      return (
        <div>
          <span>Something</span>
        </div>
      );
    }

    it('patching component A to component B, given they have the same children, should replace DOM tree ( for lifecycle ) with identical one', () => {
      render(<ComponentA />, container);
      expect(container.innerHTML).toBe('<div><span>Something</span></div>');
      const trackElemDiv = container.firstChild;
      const trackElemSpan = container.firstChild.firstChild;

      render(<ComponentB />, container);
      // These are same but not equal
      expect(container.innerHTML).toBe('<div><span>Something</span></div>');
      expect(container.firstChild === trackElemDiv).toBe(false);
      expect(container.firstChild.firstChild === trackElemSpan).toBe(false);
    });

    it('patching component A to component B, given they have the same children, should not change the DOM tree when stateless components', () => {
      render(<ComA />, container);
      expect(container.innerHTML).toBe('<div><span>Something</span></div>');
      const trackElemDiv = container.firstChild;
      const trackElemSpan = container.firstChild.firstChild;

      render(<ComB />, container);
      expect(container.innerHTML).toBe('<div><span>Something</span></div>');

      expect(container.firstChild === trackElemDiv).toBe(false);
      expect(container.firstChild.firstChild === trackElemSpan).toBe(false);
    });

    it('Should not crash when ComB does setState while changing', () => {
      render(<ComponentA />, container);
      expect(container.innerHTML).toBe('<div><span>Something</span></div>');
      const trackElemDiv = container.firstChild;
      const trackElemSpan = container.firstChild.firstChild;

      render(<ComponentBWithStateChange />, container);
      // These are same but not equal
      expect(container.innerHTML).toBe('<div><span>newText2</span></div>');
      expect(container.firstChild === trackElemDiv).toBe(false);
      expect(container.firstChild.firstChild === trackElemSpan).toBe(false);
    });
  });

  describe('Inheritance with common render', () => {
    interface ChildProps {
      name: string;
    }

    interface ChildState {
      data: string;
    }

    class Child extends Component<ChildProps, ChildState> {
      public state: ChildState;

      constructor(props) {
        super(props);

        this.state = { data: '' };

        this._update = this._update.bind(this);
      }

      public _update() {
        this.setState({
          data: 'bar',
        });
      }

      public componentWillMount() {
        this.setState({
          data: 'foo',
        });
      }

      public render() {
        return (
          <div onclick={this._update}>
            {this.props.name}
            {this.state.data}
          </div>
        );
      }
    }

    class ParentBase extends Component {
      protected foo: string;

      public render() {
        return (
          <div>
            <Child name={this.foo} />
          </div>
        );
      }
    }

    class ParentFirst extends ParentBase {
      constructor(props) {
        super(props);

        this.foo = 'First';
      }
    }

    class ParentSecond extends ParentBase {
      constructor(props) {
        super(props);

        this.foo = 'Second';
      }
    }

    // For some reason this one breaks but if components are imported separately, it works
    it('Should not reuse children if parent changes #1', () => {
      render(<ParentFirst />, container);
      expect(container.innerHTML).toBe('<div><div>Firstfoo</div></div>');
      container.firstChild.firstChild.click();

      expect(container.innerHTML).toBe('<div><div>Firstbar</div></div>');
      render(<ParentSecond />, container);

      expect(container.innerHTML).toBe('<div><div>Secondfoo</div></div>');
    });
  });

  describe('Inheritance with duplicate render', () => {
    interface ChildProps {
      name: string;
    }

    interface ChildState {
      data: string;
    }

    class Child extends Component<ChildProps, ChildState> {
      public state: ChildState;

      constructor(props) {
        super(props);

        this.state = {
          data: '',
        };

        this._update = this._update.bind(this);
      }

      public _update() {
        this.setState({
          data: 'bar',
        });
      }

      public componentWillMount() {
        this.setState({
          data: 'foo',
        });
      }

      public render() {
        return (
          <div onclick={this._update}>
            {this.props.name}
            {this.state.data}
          </div>
        );
      }
    }

    class ParentFirst extends Component {
      protected foo: string;

      constructor(props) {
        super(props);

        this.foo = 'First';
      }

      public render() {
        return (
          <div>
            <Child name={this.foo} />
          </div>
        );
      }
    }

    class ParentSecond extends Component {
      protected foo: string;

      constructor(props) {
        super(props);

        this.foo = 'Second';
      }

      public render() {
        return (
          <div>
            <Child name={this.foo} />
          </div>
        );
      }
    }

    // For some reason this one breaks but if components are imported separately, it works
    it('Should not reuse children if parent changes #2', () => {
      render(<ParentFirst />, container);
      expect(container.innerHTML).toBe('<div><div>Firstfoo</div></div>');
      container.firstChild.firstChild.click();
      expect(container.innerHTML).toBe('<div><div>Firstbar</div></div>');
      render(<ParentSecond />, container);
      expect(container.innerHTML).toBe('<div><div>Secondfoo</div></div>');
    });
  });

  describe('Inheritance with 1 component per file Common BASE', () => {
    it('Should not reuse children if parent changes #3', () => {
      render(<ParentFirstCommon />, container);
      expect(container.innerHTML).toBe('<div><div>Firstfoo</div></div>');
      container.firstChild.firstChild.click();
      expect(container.innerHTML).toBe('<div><div>Firstbar</div></div>');
      render(<ParentSecondCommon />, container);
      expect(container.innerHTML).toBe('<div><div>Secondfoo</div></div>');
    });
  });

  describe('should handle defaultProps and keys being pass into components', () => {
    interface CompProps {
      foo: string;
    }
    class Comp extends Component<CompProps> {
      public render() {
        return this.props.foo;
      }

      public static defaultProps = {
        foo: 'bar',
      };
    }

    it('should render the component with a key', () => {
      let val: string | number = '1';

      render(<Comp key={val} />, container);
      expect(container.innerHTML).toBe('bar');
      val = 2;
      render(<Comp key={val} />, container);
      expect(container.innerHTML).toBe('bar');
    });
  });

  describe('Force update', () => {
    it('Should not call shouldComponentUpdate', () => {
      let test = false;
      let called = false;
      let doForce;

      class FooBar extends Component {
        constructor(props) {
          super(props);

          doForce = this.doForceUpdate.bind(this);
        }

        public shouldComponentUpdate() {
          test = true;

          return false;
        }

        public doForceUpdate() {
          called = true;
          this.forceUpdate();
        }

        public render() {
          return <div>1</div>;
        }
      }

      render(<FooBar />, container);

      expect(container.innerHTML).toEqual('<div>1</div>');
      expect(test).toEqual(false);
      expect(called).toEqual(false);

      doForce();

      expect(test).toEqual(false);
      expect(called).toEqual(true);
      expect(container.innerHTML).toEqual('<div>1</div>');
    });
  });
});
