import Component from "inferno-component";
import { innerHTML } from "inferno-utils";
import { render } from "inferno";

/* These must be in their own files for test to reproduce */
import { ParentFirstCommon } from "./data/common-render/parentfirstcommon";
import { ParentSecondCommon } from "./data/common-render/parentsecondcommon";

describe("Components (JSX) #2", () => {
  let container;
  let Inner;
  let attachedListener = null;
  let renderedName = null;

  beforeEach(function() {
    attachedListener = null;
    renderedName = null;

    container = document.createElement("div");
    container.style.display = "none";
    document.body.appendChild(container);

    Inner = class extends Component {
      render() {
        attachedListener = this.props.onClick;
        renderedName = this.props.name;
        return <div className={this.props.name} />;
      }
    };
  });

  afterEach(function() {
    render(null, container);
    document.body.removeChild(container);
  });

  describe("tracking DOM state", () => {
    class ComponentA extends Component {
      render() {
        return <div><span>Something</span></div>;
      }
    }

    class ComponentB extends Component {
      render() {
        return <div><span>Something</span></div>;
      }
    }

    class ComponentBWithStateChange extends Component {
      componentWillMount() {
        this.setStateSync({
          text: "newText"
        });

        this.setStateSync({
          text: "newText2"
        });
      }

      render() {
        return <div><span>{this.state.text}</span></div>;
      }
    }

    function ComA() {
      return <div><span>Something</span></div>;
    }

    function ComB() {
      return <div><span>Something</span></div>;
    }

    it("patching component A to component B, given they have the same children, should replace DOM tree ( for lifecycle ) with identical one", () => {
      render(<ComponentA />, container);
      expect(container.innerHTML).toBe(
        innerHTML("<div><span>Something</span></div>")
      );
      const trackElemDiv = container.firstChild;
      const trackElemSpan = container.firstChild.firstChild;

      render(<ComponentB />, container);
      // These are same but not equal
      expect(container.innerHTML).toBe(
        innerHTML("<div><span>Something</span></div>")
      );
      expect(container.firstChild === trackElemDiv).toBe(false);
      expect(container.firstChild.firstChild === trackElemSpan).toBe(false);
    });

    it("patching component A to component B, given they have the same children, should not change the DOM tree when stateless components", () => {
      render(<ComA />, container);
      expect(container.innerHTML).toBe(
        innerHTML("<div><span>Something</span></div>")
      );
      const trackElemDiv = container.firstChild;
      const trackElemSpan = container.firstChild.firstChild;

      render(<ComB />, container);
      expect(container.innerHTML).toBe(
        innerHTML("<div><span>Something</span></div>")
      );

      expect(container.firstChild === trackElemDiv).toBe(false);
      expect(container.firstChild.firstChild === trackElemSpan).toBe(false);
    });

    it("Should not crash when ComB does setState while changing", () => {
      render(<ComponentA />, container);
      expect(container.innerHTML).toBe(
        innerHTML("<div><span>Something</span></div>")
      );
      const trackElemDiv = container.firstChild;
      const trackElemSpan = container.firstChild.firstChild;

      render(<ComponentBWithStateChange />, container);
      // These are same but not equal
      expect(container.innerHTML).toBe(
        innerHTML("<div><span>newText2</span></div>")
      );
      expect(container.firstChild === trackElemDiv).toBe(false);
      expect(container.firstChild.firstChild === trackElemSpan).toBe(false);
    });
  });

  describe("Inheritance with common render", () => {
    class Child extends Component {
      constructor(props) {
        super(props);

        this.state = { data: "" };

        this._update = this._update.bind(this);
      }

      _update() {
        this.setStateSync({
          data: "bar"
        });
      }

      componentWillMount() {
        this.setStateSync({
          data: "foo"
        });
      }

      render() {
        return (
          <div onclick={this._update}>
            {this.props.name}
            {this.state.data}
          </div>
        );
      }
    }

    class ParentBase extends Component {
      render() {
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

        this.foo = "First";
      }
    }

    class ParentSecond extends ParentBase {
      constructor(props) {
        super(props);

        this.foo = "Second";
      }
    }

    // For some reason this one breaks but if components are imported separately, it works
    it("Should not reuse children if parent changes #1", done => {
      render(<ParentFirst />, container);
      expect(container.innerHTML).toBe(
        innerHTML("<div><div>Firstfoo</div></div>")
      );
      container.firstChild.firstChild.click();
      setTimeout(() => {
        expect(container.innerHTML).toBe(
          innerHTML("<div><div>Firstbar</div></div>")
        );
        render(<ParentSecond />, container);
        expect(container.innerHTML).toBe(
          innerHTML("<div><div>Secondfoo</div></div>")
        );
        done();
      }, 10);
    });
  });

  describe("Inheritance with duplicate render", () => {
    class Child extends Component {
      constructor(props) {
        super(props);

        this._update = this._update.bind(this);
      }

      _update() {
        this.setStateSync({
          data: "bar"
        });
      }

      componentWillMount() {
        this.setStateSync({
          data: "foo"
        });
      }

      render() {
        return (
          <div onclick={this._update}>
            {this.props.name}
            {this.state.data}
          </div>
        );
      }
    }

    class ParentFirst extends Component {
      constructor(props) {
        super(props);

        this.foo = "First";
      }

      render() {
        return (
          <div>
            <Child name={this.foo} />
          </div>
        );
      }
    }

    class ParentSecond extends Component {
      constructor(props) {
        super(props);

        this.foo = "Second";
      }

      render() {
        return (
          <div>
            <Child name={this.foo} />
          </div>
        );
      }
    }

    // For some reason this one breaks but if components are imported separately, it works
    it("Should not reuse children if parent changes #2", done => {
      render(<ParentFirst />, container);
      expect(container.innerHTML).toBe(
        innerHTML("<div><div>Firstfoo</div></div>")
      );
      container.firstChild.firstChild.click();
      setTimeout(() => {
        expect(container.innerHTML).toBe(
          innerHTML("<div><div>Firstbar</div></div>")
        );
        render(<ParentSecond />, container);
        expect(container.innerHTML).toBe(
          innerHTML("<div><div>Secondfoo</div></div>")
        );
        done();
      }, 10);
    });
  });

  describe("Inheritance with 1 component per file Common BASE", () => {
    it("Should not reuse children if parent changes #3", done => {
      render(<ParentFirstCommon />, container);
      expect(container.innerHTML).toBe(
        innerHTML("<div><div>Firstfoo</div></div>")
      );
      container.firstChild.firstChild.click();
      setTimeout(() => {
        expect(container.innerHTML).toBe(
          innerHTML("<div><div>Firstbar</div></div>")
        );
        render(<ParentSecondCommon />, container);
        expect(container.innerHTML).toBe(
          innerHTML("<div><div>Secondfoo</div></div>")
        );
        done();
      }, 10);
    });
  });

  // Ref: https://github.com/infernojs/inferno/issues/513
  describe("String components (React compat)", () => {
    it("Should render a string div", () => {
      const Div = "div";
      render(<Div>Hello World</Div>, container);
      expect(container.innerHTML).toBe(innerHTML("<div>Hello World</div>"));
    });
  });

  describe("should handle defaultProps and keys being pass into components", () => {
    class Comp extends Component {
      render() {
        return this.props.foo;
      }

      static defaultProps = {
        foo: "bar"
      };
    }

    it("should render the component with a key", () => {
      let val = "1";

      render(<Comp key={val} />, container);
      expect(container.innerHTML).toBe(innerHTML("bar"));
      val = 2;
      render(<Comp key={val} />, container);
      expect(container.innerHTML).toBe(innerHTML("bar"));
    });
  });

  describe("Force update", () => {
    it("Should not call shouldComponentUpdate", () => {
      let test = false;
      let called = false;
      let doForce;

      class FooBar extends Component {
        constructor(props) {
          super(props);

          doForce = this.doForceUpdate.bind(this);
        }

        shouldComponentUpdate() {
          test = true;
        }

        doForceUpdate() {
          called = true;
          this.forceUpdate();
        }

        render() {
          return <div>1</div>;
        }
      }

      render(<FooBar />, container);

      expect(container.innerHTML).toEqual("<div>1</div>");
      expect(test).toEqual(false);
      expect(called).toEqual(false);

      doForce();

      expect(test).toEqual(false);
      expect(called).toEqual(true);
      expect(container.innerHTML).toEqual("<div>1</div>");
    });
  });
});
