import { render } from "inferno";
import Component from "inferno-component";
import { innerHTML } from "inferno-utils";

describe("Error recovery", () => {
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

  it("Should be possible to render again if user land code crashes in CWM", () => {
    class Crasher extends Component {
      constructor(props, context) {
        super(props, context);

        this.state = {
          value: 1
        };
      }

      componentWillMount() {
        if (this.props.crash) {
          throw Error("test");
        }

        this.setState({
          value: 2
        });
      }

      render() {
        return <div>{this.state.value}</div>;
      }
    }

    try {
      render(<Crasher crash={true} />, container);
    } catch (ex) {
      expect(ex.message).toBe("test");
    }

    render(<Crasher crash={false} />, container);
    expect(container.firstChild.innerHTML).toBe("2");
  });

  it("Should be possible to render again if user land code crashes in ComponentWillUnmount", () => {
    class Crasher extends Component {
      constructor(props, context) {
        super(props, context);

        this.state = {
          value: 1
        };
      }

      componentWillUnmount() {
        if (this.props.crash) {
          throw Error("test");
        }
      }

      render() {
        return <div>{this.state.value}</div>;
      }
    }

    render(<Crasher crash={true} />, container);

    expect(container.firstChild.innerHTML).toBe("1");

    try {
      render(null, container);
    } catch (ex) {
      expect(ex.message).toBe("test");
    }

    // No change as it crashed
    expect(container.firstChild.innerHTML).toBe("1");

    // Try update
    render(<Crasher crash={false} />, container);

    expect(container.firstChild.innerHTML).toBe("1");

    // Should not crash now
    render(null, container);

    expect(container.innerHTML).toBe("");
  });

  // it('Should be able to recover from subtree crash', () => {
  // 	class Crasher extends Component {
  // 		constructor(props, context) {
  // 			super(props, context);
  //
  // 			this.state = {
  // 				value: 1
  // 			};
  // 		}
  //
  //
  // 		componentWillMount() {
  // 			if (this.props.crash) {
  // 				throw Error('test');
  // 			}
  //
  // 			this.setState({
  // 				value: 2
  // 			});
  // 		}
  //
  // 		render() {
  // 			return (
  // 				<div>{this.state.value}</div>
  // 			);
  // 		}
  // 	}
  //
  // 	function TreeOfCrashers({suffle, crash}) {
  // 		let arr = [];
  // 		if (suffle) {
  // 			arr.push(<div>1</div>);
  // 			arr.push(<Crasher crash={false} />);
  // 		} else {
  // 			arr.push(<Crasher crash={false} />);
  // 		}
  //
  //
  // 		arr.push(<Crasher crash={crash} />);
  //
  // 		return (
  // 			<div>
  // 				{arr}
  // 			</div>
  // 		);
  // 	}
  //
  // 	render(<TreeOfCrashers crash={false}/>, container);
  //
  //
  // 	try {
  // 		render(<TreeOfCrashers suffle={true} crash={true}/>, container);
  // 	} catch (ex) {
  // 		expect(ex.message).toEqual('test');
  // 	}
  //
  // 	render(<TreeOfCrashers crash={false}/>, container);
  // 	expect(container.firstChild.innerHTML).toEqual('2');
  // });
});
