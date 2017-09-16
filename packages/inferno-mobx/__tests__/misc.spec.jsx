import { render } from "inferno";
import mobx from "mobx";
import { observer } from "inferno-mobx";
import createClass from "inferno-create-class";

describe("Mobx Misc", () => {
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

  it("custom shouldComponentUpdate is not respected for observable changes (#50)", done => {
    let called = 0;
    const x = mobx.observable(3);
    const C = observer(
      createClass({
        render: () => <div>value:{x.get()}</div>,
        shouldComponentUpdate: () => called++
      })
    );
    render(<C />, container);
    expect(container.querySelector("div").textContent).toBe("value:3");
    expect(called).toBe(0);
    x.set(42);
    expect(container.querySelector("div").textContent).toBe("value:42");
    expect(called).toBe(0);
    done();
  });

  it("custom shouldComponentUpdate is not respected for observable changes (#50) - 2", done => {
    // TODO: shouldComponentUpdate is meaningless with observable props...., just show warning in component definition?
    let called = 0;
    const y = mobx.observable(5);
    const C = observer(
      createClass({
        render() {
          return <div>value:{this.props.y}</div>;
        },
        shouldComponentUpdate(nextProps) {
          called++;
          return nextProps.y !== 42;
        }
      })
    );
    const B = observer(
      createClass({
        render: () => (
          <span>
            <C y={y.get()} />
          </span>
        )
      })
    );
    render(<B />, container);
    expect(container.querySelector("div").textContent).toBe("value:5");
    expect(called).toBe(0);

    y.set(6);
    expect(container.querySelector("div").textContent).toBe("value:6");
    expect(called).toBe(1);

    y.set(42);
    // expect(container.querySelector('div').textContent).toBe('value:6'); // not updated! TODO: fix
    expect(called).toBe(2);

    y.set(7);
    expect(container.querySelector("div").textContent).toBe("value:7");
    expect(called).toBe(3);

    done();
  });

  it("issue mobx 405", done => {
    function ExampleState() {
      mobx.extendObservable(this, {
        name: "test",
        get greetings() {
          return "Hello my name is " + this.name;
        }
      });
    }

    const ExampleView = observer(
      createClass({
        render() {
          return (
            <div>
              <input
                type="text"
                onChange={e => (this.props.exampleState.name = e.target.value)}
                value={this.props.exampleState.name}
              />
              <span>{this.props.exampleState.greetings}</span>
            </div>
          );
        }
      })
    );

    const exampleState = new ExampleState();
    render(<ExampleView exampleState={exampleState} />, container);
    expect(container.querySelector("span").textContent).toBe(
      "Hello my name is test"
    );

    done();
  });

  // TODO: At the moment inferno cannot handle this scenario it will just fail,
  // TODO: It happens because child component calls "up" for update before its instance is constructed
  // TODO: It would be "nice to have" this fixed, but we anyway throw error if setState is called during construction, so probably its not an issue
  // it('#85 Should handle state changing in constructors', function(done) {
  //   debugger;
  //   const a = mobx.observable(2);
  //   const Child = observer(createClass({
  //     displayName: 'Child',
  //     getInitialState() {
  //       debugger;
  //       a.set(3); // one shouldn't do this!
  //       return {};
  //     },
  //     render: () => <div>child:{ a.get() } - </div>
  //   }));
  //   const ParentWrapper = observer(function Parent() {
  //     return <span><Child />parent:{ a.get() }</span>
  //   });
  //   render(<ParentWrapper />, container);
  //
  //   expect(container.getElementsByTagName('span')[0].textContent).toBe('child:3 - parent:3');
  //   a.set(5);
  //   expect(container.getElementsByTagName('span')[0].textContent).toBe('child:5 - parent:5');
  //   a.set(7);
  //   expect(container.getElementsByTagName('span')[0].textContent).toBe('child:7 - parent:7');
  //   done();
  // });
});
