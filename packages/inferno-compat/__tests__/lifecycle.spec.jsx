import { render } from "inferno";
import sinon from "sinon";
import { innerHTML } from "inferno-utils";
import { Component, createElement } from "inferno-compat";

describe("Inferno-compat LifeCycle", () => {
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

  describe("Order of Es6 Lifecycle with string refs and refs", () => {
    it("Should go as per React (minus doubles)", () => {
      // We spy console log to verify order of callbacks
      // React implementation: https://jsfiddle.net/zg7ay23g/
      const consoleSpy = sinon.spy(console, "log");

      class Hello2 extends Component {
        componentWillMount() {
          console.log("Will mount sub");
        }

        componentDidMount() {
          console.log("Did mount sub", this.refs["S2a"] ? "stringRef" : null);
        }

        componentWillUpdate() {
          console.log("Will update sub", this.refs["S2a"] ? "stringRef" : null);
        }

        componentDidUpdate() {
          console.log("Did update sub", this.refs["S2a"] ? "stringRef" : null);
        }

        render() {
          return createElement(
            "div",
            {
              ref: () => {
                console.log("S1", this.refs["S2a"] ? "stringRef" : null);
              }
            },
            [
              createElement("div", { ref: "S2a" }),
              createElement("div", {
                ref: () => {
                  console.log("S2b", this.refs["S2a"] ? "stringRef" : null);
                }
              })
            ]
          );
        }
      }

      class Hello extends Component {
        componentWillMount() {
          console.log("Will mount");
        }

        componentDidMount() {
          console.log("Did mount", this.refs["3a"] ? "stringRef" : null);
        }

        componentWillUpdate() {
          console.log("Will update", this.refs["3a"] ? "stringRef" : null);
        }

        componentDidUpdate() {
          console.log("Did update", this.refs["3a"] ? "stringRef" : null);
        }

        render() {
          return createElement(
            "div",
            {
              ref: () => {
                console.log("1", this.refs["3a"] ? "stringRef" : null);
              }
            },
            [
              createElement(
                "div",
                {
                  ref: () => {
                    console.log("2a", this.refs["3a"] ? "stringRef" : null);
                  }
                },
                [
                  createElement(Hello2, {}, null),
                  createElement("div", { ref: "3a" }, [
                    createElement("div", {
                      ref: () => {
                        console.log("4a", this.refs["3a"] ? "stringRef" : null);
                      }
                    }),
                    createElement("div", {
                      ref: () => {
                        console.log("4b", this.refs["3a"] ? "stringRef" : null);
                      }
                    })
                  ]),
                  createElement("div", {
                    ref: () => {
                      console.log("3b", this.refs["3a"] ? "stringRef" : null);
                    }
                  })
                ]
              ),
              createElement(
                "div",
                {
                  ref: () => {
                    console.log("2b", this.refs["3a"] ? "stringRef" : null);
                  }
                },
                null
              )
            ]
          );
        }
      }

      render(createElement(Hello, { name: "Inferno" }, null), container);

      console.log("UPDATE");

      render(
        createElement(Hello, { name: "Better Lifecycle" }, null),
        container
      );

      console.log("REMOVAL");

      render(<div />, container);

      const array = consoleSpy.getCalls();
      expect(array.length).toEqual(34);

      // mount
      expect(array[0].args).toEqual(["Will mount"]);
      expect(array[1].args).toEqual(["Will mount sub"]);
      expect(array[2].args).toEqual(["S2b", "stringRef"]);
      expect(array[3].args).toEqual(["S1", "stringRef"]);
      expect(array[4].args).toEqual(["Did mount sub", "stringRef"]);
      expect(array[5].args).toEqual(["4a", null]);
      expect(array[6].args).toEqual(["4b", null]);
      expect(array[7].args).toEqual(["3b", "stringRef"]);
      expect(array[8].args).toEqual(["2a", "stringRef"]);
      expect(array[9].args).toEqual(["2b", "stringRef"]);
      expect(array[10].args).toEqual(["1", "stringRef"]);
      expect(array[11].args).toEqual(["Did mount", "stringRef"]);

      // update
      expect(array[12].args).toEqual(["UPDATE"]);
      expect(array[13].args).toEqual(["Will update", "stringRef"]);
      expect(array[14].args).toEqual(["Will update sub", "stringRef"]);
      expect(array[15].args).toEqual(["Did update sub", "stringRef"]);
      expect(array[16].args).toEqual(["Did update", "stringRef"]);
      expect(array[17].args).toEqual(["S2b", "stringRef"]);
      expect(array[18].args).toEqual(["S1", "stringRef"]);
      expect(array[19].args).toEqual(["4a", "stringRef"]);
      expect(array[20].args).toEqual(["4b", "stringRef"]);
      expect(array[21].args).toEqual(["3b", "stringRef"]);
      expect(array[22].args).toEqual(["2a", "stringRef"]);
      expect(array[23].args).toEqual(["2b", "stringRef"]);
      expect(array[24].args).toEqual(["1", "stringRef"]);

      // unmount
      expect(array[25].args).toEqual(["REMOVAL"]);
      expect(array[26].args).toEqual(["1", "stringRef"]);
      expect(array[27].args).toEqual(["2a", "stringRef"]);
      expect(array[28].args).toEqual(["S1", "stringRef"]);
      expect(array[29].args).toEqual(["S2b", null]);
      expect(array[30].args).toEqual(["4a", null]);
      expect(array[31].args).toEqual(["4b", null]);
      expect(array[32].args).toEqual(["3b", null]);
      expect(array[33].args).toEqual(["2b", null]);
    });
  });
});
