import { render } from "inferno";
import Component from "inferno-component";
import sinon from "sinon";
import { innerHTML } from "inferno-utils";
import createElement from "inferno-create-element";

describe("Stateful Component updates", () => {
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

  it("Should forget old updates", done => {
    let updatesAfromOutside;

    class A extends Component {
      componentWillUnmount() {}

      constructor(props) {
        super(props);

        this.state = {
          stuff: true
        };

        updatesAfromOutside = this.updateMe.bind(this);
      }

      updateMe() {
        this.setState({
          stuff: false
        });
      }

      render() {
        return <div>A Component A</div>;
      }
    }

    class B extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return <div>B Component B</div>;
      }
    }

    // Render A
    const sinonSpy = sinon.spy(A.prototype, "componentWillUnmount");
    render(<A />, container);
    expect(container.innerHTML).toBe(innerHTML("<div>A Component A</div>"));
    // Render B
    render(<B />, container);
    expect(container.innerHTML).toBe(innerHTML("<div>B Component B</div>"));
    sinon.assert.calledOnce(sinonSpy); // componentUnMount should have been called
    sinonSpy.restore();

    // delayed update triggers for A
    updatesAfromOutside();
    expect(container.innerHTML).toBe(innerHTML("<div>B Component B</div>"));

    done();
  });

  it("Should give better error message when calling setState from constructor ??", () => {
    // Following test simulates situation that setState is called when mounting process has not finished, fe. in constructor

    class Parent extends Component {
      constructor(props) {
        super(props);

        this.state = {
          show: false
        };

        this.domagic = this.domagic.bind(this);

        // Call setState
        expect(() =>
          this.setState({
            show: true
          })
        ).toThrow();
      }

      domagic() {
        this.setState({
          show: !this.state.show
        });
      }

      render() {
        return (
          <div>
            <button onclick={this.domagic} />
            <Child show={this.state.show} />
          </div>
        );
      }
    }

    class Child extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return (
          <div>
            {this.props.show
              ? <span className="hr red">
                  <span className="hr-text">Late</span>
                </span>
              : null}
            <p>More content</p>
          </div>
        );
      }
    }

    render(<Parent />, container);
  });

  it("Should update boolean properties when children change same time", () => {
    let updateCaller = null;

    class A extends Component {
      constructor(props) {
        super(props);

        this.state = {
          values: [{ checked: false }, { checked: false }, { checked: false }]
        };

        this.updateCaller = this.updateCaller.bind(this);
        updateCaller = this.updateCaller;
      }

      updateCaller() {
        this.setStateSync({
          values: [{ checked: false }, { checked: false }]
        });
      }

      render() {
        return (
          <div>
            {this.state.values.map(function(value) {
              return <input type="checkbox" checked={value.checked} />;
            })}
          </div>
        );
      }
    }

    render(<A />, container);
    expect(container.innerHTML).toBe(
      innerHTML(
        '<div><input type="checkbox"><input type="checkbox"><input type="checkbox"></div>'
      )
    );
    const firstChild = container.firstChild;
    expect(firstChild.childNodes[0].checked).toBe(false);
    expect(firstChild.childNodes[1].checked).toBe(false);
    expect(firstChild.childNodes[2].checked).toBe(false);

    const checkbox = container.querySelector("input");
    checkbox.checked = true; // SIMULATE user selecting checkbox
    expect(firstChild.childNodes[0].checked).toBe(true);

    updateCaller(); // New render
    expect(container.innerHTML).toBe(
      innerHTML('<div><input type="checkbox"><input type="checkbox"></div>')
    );
    expect(firstChild.childNodes[0].checked).toBe(false);
    expect(firstChild.childNodes[1].checked).toBe(false);
  });

  it("Should Not get stuck in UNMOUNTED state", () => {
    let updateCaller = null;

    // This parent is used for setting up Test scenario, not much related
    class Parent extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return (
          <div>
            <A />
          </div>
        );
      }
    }

    // A component holds all the stuff together
    class A extends Component {
      constructor(props) {
        super(props);

        this.state = {
          obj: {
            test: true
          }
        };

        this.updateCaller = this.updateCaller.bind(this);
        updateCaller = this.updateCaller;
      }

      updateCaller() {
        this.setStateSync({
          obj: {
            test: !this.state.obj.test
          }
        });
      }

      render() {
        return (
          <div>
            <B data={this.state.obj} />
          </div>
        );
      }
    }
    // B has direct child C, B Is simple wrapper component
    class B extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return <C data={this.props.data} />;
      }
    }

    let stuckChild = null;

    // C is real component which does the job
    // C is the one that gets unmounted...
    class C extends Component {
      constructor(props) {
        super(props);

        this.state = {
          b: false
        };

        this.imstuck = this.imstuck.bind(this);
        stuckChild = this.imstuck;
      }

      imstuck() {
        this.setStateSync({
          b: !this.state.b
        });
      }

      render() {
        return (
          <div>
            {this.props.data.test + ""}
            {this.state.b + ""}
          </div>
        );
      }
    }

    render(<Parent />, container);

    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>truefalse</div></div></div>")
    );

    updateCaller();
    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>falsefalse</div></div></div>")
    );
    updateCaller();
    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>truefalse</div></div></div>")
    );
    updateCaller();
    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>falsefalse</div></div></div>")
    );
    stuckChild();
    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>falsetrue</div></div></div>")
    );
    stuckChild();
    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>falsefalse</div></div></div>")
    );
    stuckChild();
    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>falsetrue</div></div></div>")
    );
  });

  it("Should Not get stuck in UNMOUNTED state - variation2", () => {
    let updateCaller = null;

    // This parent is used for setting up Test scenario, not much related
    class Parent extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return (
          <div>
            <A />
          </div>
        );
      }
    }

    // A component holds all the stuff together
    class A extends Component {
      constructor(props) {
        super(props);

        this.state = {
          obj: {
            test: true
          }
        };

        this.updateCaller = this.updateCaller.bind(this);
        updateCaller = this.updateCaller;
      }

      updateCaller() {
        this.setStateSync({
          obj: {
            test: !this.state.obj.test
          }
        });
      }

      render() {
        return (
          <div>
            <B data={this.state.obj} />
          </div>
        );
      }
    }
    // B has direct child C, B Is simple wrapper component
    class B extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return <C data={this.props.data} />;
      }
    }

    let stuckChild = null;

    // C is real component which does the job
    // C is the one that gets unmounted...
    class C extends Component {
      constructor(props) {
        super(props);

        this.state = {
          b: false
        };

        this.imstuck = this.imstuck.bind(this);
        stuckChild = this.imstuck;
      }

      imstuck() {
        this.setStateSync({
          b: !this.state.b
        });
      }

      render() {
        return (
          <div>
            {this.props.data.test + ""}
            {this.state.b + ""}
          </div>
        );
      }
    }

    render(<Parent />, container);

    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>truefalse</div></div></div>")
    );

    stuckChild();
    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>truetrue</div></div></div>")
    );
    stuckChild();
    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>truefalse</div></div></div>")
    );
    stuckChild();
    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>truetrue</div></div></div>")
    );

    updateCaller();
    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>falsetrue</div></div></div>")
    );
    updateCaller();
    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>truetrue</div></div></div>")
    );
    updateCaller();
    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>falsetrue</div></div></div>")
    );

    stuckChild();
    expect(container.innerHTML).toBe(
      innerHTML("<div><div><div>falsefalse</div></div></div>")
    );
  });

  it("Should keep order of nodes", () => {
    let setItems = null;

    class InnerComponentToGetUnmounted extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return (
          <div className="common-root">
            {(() => {
              if (this.props.i % 2 === 0) {
                return <div>DIV{this.props.value}</div>;
              } else {
                return <span>SPAN{this.props.value}</span>;
              }
            })()}
          </div>
        );
      }
    }

    const DropdownItem = ({ children }) => <li>{children}</li>;

    class Looper extends Component {
      constructor(props) {
        super(props);

        this.state = {
          items: []
        };

        this.setItems = this.setItems.bind(this);

        setItems = this.setItems;
      }

      setItems(collection) {
        this.setStateSync({
          items: collection
        });
      }

      render() {
        return (
          <div>
            <ul>
              {this.state.items.map(function(item, i) {
                return (
                  <DropdownItem key={item.value}>
                    <InnerComponentToGetUnmounted
                      key={0}
                      i={i}
                      value={item.value}
                    />
                    <span key={1}>{item.text}</span>
                  </DropdownItem>
                );
              })}
            </ul>
          </div>
        );
      }
    }

    render(<Looper />, container);
    expect(container.innerHTML).toBe(innerHTML("<div><ul></ul></div>"));
    setItems([
      { value: "val1", text: "key1" },
      { value: "val2", text: "key2" },
      { value: "val3", text: "key3" },
      { value: "val4", text: "key4" }
    ]);

    expect(container.innerHTML).toBe(
      innerHTML(
        '<div><ul><li><div class="common-root"><div>DIVval1</div></div><span>key1</span></li><li><div class="common-root"><span>SPANval2</span></div><span>key2</span></li><li><div class="common-root"><div>DIVval3</div></div><span>key3</span></li><li><div class="common-root"><span>SPANval4</span></div><span>key4</span></li></ul></div>'
      )
    );

    setItems([
      { value: "val2", text: "key2" },
      { value: "val3", text: "key3" }
    ]);
    expect(container.innerHTML).toBe(
      innerHTML(
        '<div><ul><li><div class="common-root"><div>DIVval2</div></div><span>key2</span></li><li><div class="common-root"><span>SPANval3</span></div><span>key3</span></li></ul></div>'
      )
    );

    setItems([
      { value: "val1", text: "key1" },
      { value: "val2", text: "key2" },
      { value: "val3", text: "key3" },
      { value: "val4", text: "key4" }
    ]);
    expect(container.innerHTML).toBe(
      innerHTML(
        '<div><ul><li><div class="common-root"><div>DIVval1</div></div><span>key1</span></li><li><div class="common-root"><span>SPANval2</span></div><span>key2</span></li><li><div class="common-root"><div>DIVval3</div></div><span>key3</span></li><li><div class="common-root"><span>SPANval4</span></div><span>key4</span></li></ul></div>'
      )
    );
  });

  it("Should not crash when patching array to array with hooks", () => {
    let updater = null;
    const stuff = [<div>{["Test"]}</div>, <span>1</span>];
    const orig = [[<span ref={function() {}}>{"1"}</span>]];
    class Stuff extends Component {
      constructor(props) {
        super(props);

        this.state = {
          stuff
        };

        updater = _stuff => {
          this.setStateSync({ stuff: _stuff });
        };
      }

      render() {
        return (
          <div>
            <div>
              {this.state.stuff}
            </div>
          </div>
        );
      }
    }

    render(<Stuff />, container);
    updater(orig);
    expect(container.innerHTML).toBe(
      innerHTML("<div><div><span>1</span></div></div>")
    );
  });

  it("Should allow camelCase properties when using JSX plugin", () => {
    const fakeObj = {
      func() {}
    };
    const submitSpy = sinon.spy(fakeObj, "func");

    class Tester extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return (
          <form>
            <input
              id="inputId"
              onFocus={e => {
                expect(e).toBeTruthy();
              }}
              type="text"
            />
          </form>
        );
      }
    }

    render(<Tester />, container);
    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML('<form><input id="inputId" type="text"></form>')
    );
    const input = container.querySelector("#inputId");
    expect(sinon.assert.notCalled(submitSpy));
    input.focus();
  });

  it("Should not append when replacing ES6 component with functional component", () => {
    const A = function() {
      return (
        <div>
          <div className="topheader">
            <h1>A</h1>
          </div>
        </div>
      );
    };

    function B() {
      return (
        <div className="simplegrid">
          <div className="topheader">
            <h1>B</h1>
          </div>
          <div className="viewcontent fullscreen">
            <C />
          </div>
        </div>
      );
    }

    class C extends Component {
      componentWillUnmount() {}

      render() {
        return (
          <div className="report-container">
            C
          </div>
        );
      }
    }

    const expectedA = '<div><div class="topheader"><h1>A</h1></div></div>';
    const expectedB =
      '<div class="simplegrid"><div class="topheader"><h1>B</h1></div><div class="viewcontent fullscreen"><div class="report-container">C</div></div></div>';
    render(<A />, container);
    expect(container.innerHTML).toEqual(expectedA);

    render(<B />, container);
    expect(container.innerHTML).toEqual(expectedB);

    // SO FAR SO GOOD

    // NOW START SWAPPING

    render(<A />, container);
    expect(container.innerHTML).toEqual(expectedA);

    render(<B />, container);
    expect(container.innerHTML).toEqual(expectedB);

    render(<A />, container);
    expect(container.innerHTML).toEqual(expectedA);

    render(<B />, container);
    expect(container.innerHTML).toEqual(expectedB);

    render(<A />, container);
    expect(container.innerHTML).toEqual(expectedA);

    render(<B />, container);
    expect(container.innerHTML).toEqual(expectedB);

    render(<A />, container);
    expect(container.innerHTML).toEqual(expectedA);

    render(<B />, container);
    expect(container.innerHTML).toEqual(expectedB);
  });

  it("Should not fail removing child of component node Github #1111", () => {
    const InfoLi = function InfoLi(props) {
      return (
        <li>
          {createElement("input", {
            checked: props.check,
            type: props.type,
            label: props.label,
            onClick: props.onClick
          })}{" "}
          {props.label}: check, then uncheck
          <div>{props.children}</div>
        </li>
      );
    };

    class ConfigsList extends Component {
      constructor(props) {
        super(props);
        this.state = {
          checks: props.orderedConfigs.map(mod => Boolean(mod.value))
        };
      }

      handleCheck(index, ifChecked) {
        this.setState({
          checks: this.state.checks.map(
            (ch, i) => (i === index ? ifChecked : ch)
          )
        });
      }

      render(props) {
        return (
          <ol>
            {props.orderedConfigs.map((conf, index) => {
              const child =
                this.state.checks[index] &&
                createElement("div", null, "hi there");
              return (
                <InfoLi
                  label={conf}
                  type="checkbox"
                  checked={this.state.checks[index]}
                  onClick={event => {
                    this.handleCheck(index, event.target.checked);
                  }}
                >
                  {child}
                </InfoLi>
              );
            })}
          </ol>
        );
      }
    }

    render(<ConfigsList orderedConfigs={["use proxy?"]} />, container);

    const input = container.querySelector("input");

    input.click();

    input.click();
  });
});
